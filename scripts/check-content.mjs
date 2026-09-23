import { access, readFile, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'yaml';
import {
	isPubliclyPublishable,
	validateLevel2Readiness,
	validateLevel3Readiness,
} from '../src/content/publication-policy.js';

const scriptPath = fileURLToPath(import.meta.url);
const defaultRoot = path.resolve(path.dirname(scriptPath), '..');
const definitions = [
	['competitions', 'src/content/competitions', '.md'],
	['solutions', 'src/content/solutions', '.yaml'],
	['sources', 'src/content/sources', '.yaml'],
	['practices', 'src/content/practices', '.md'],
	['reproductions', 'src/content/reproductions', '.yaml'],
];

async function walk(directory) {
	try {
		const children = await readdir(directory, { withFileTypes: true });
		const nested = await Promise.all(children.map(async (child) => {
			const target = path.join(directory, child.name);
			return child.isDirectory() ? walk(target) : [target];
		}));
		return nested.flat();
	} catch (error) {
		if (error.code === 'ENOENT') return [];
		throw error;
	}
}

function parseRecord(source, extension) {
	if (extension !== '.md') return { data: parse(source), body: '' };
	const frontmatter = source.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
	if (!frontmatter) throw new Error('missing YAML frontmatter');
	return { data: parse(frontmatter[1]), body: source.slice(frontmatter[0].length).trim() };
}

function referenceId(value) {
	if (typeof value === 'string' && value.trim()) return value.trim();
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		if (typeof value.id === 'string') return value.id;
		if (typeof value.slug === 'string') return value.slug;
	}
	return null;
}

function requireTopLevelSource(errors, entry, field, value) {
	const id = referenceId(value);
	if (id && !(entry.data.source_ids ?? []).some((source) => referenceId(source) === id)) {
		errors.push(`${entry.file} (${entry.data.id ?? 'unknown'}): ${field} source "${id}" is absent from source_ids`);
	}
}

function addReferenceError(errors, entry, field, targetCollection, value, collections) {
	const id = referenceId(value);
	if (!id) {
		errors.push(`${entry.file} (${entry.data?.id ?? 'unknown'}): ${field} must contain a ${targetCollection} ID`);
		return;
	}
	if (value && typeof value === 'object' && value.collection && value.collection !== targetCollection) {
		errors.push(`${entry.file} (${entry.data?.id}): ${field} points to ${value.collection}, expected ${targetCollection}`);
	}
	if (!collections[targetCollection].has(id)) {
		errors.push(`${entry.file} (${entry.data?.id ?? 'unknown'}): ${field} references missing ${targetCollection} "${id}"`);
	}
}

function addClaimReferenceError(errors, entry, field, value, allById) {
	if (typeof value !== 'string' || !value.trim()) {
		errors.push(`${entry.file} (${entry.data?.id ?? 'unknown'}): ${field} must identify a claim`);
		return;
	}
	const separator = value.indexOf('#');
	const targetRecordId = separator < 0 ? entry.data.id : value.slice(0, separator);
	const claimId = separator < 0 ? value : value.slice(separator + 1);
	const target = allById.get(targetRecordId);
	if (!target?.data?.claims?.some((claim) => claim.id === claimId)) {
		errors.push(`${entry.file} (${entry.data?.id ?? 'unknown'}): ${field} references missing claim "${value}"`);
	}
}

function reproducedClaimMatches(entry, claim, reproduction, allById) {
	const reproductionSolutionId = referenceId(reproduction.data.solution_id);
	const supportedClaims = entry.collection === 'solutions'
		? [{ ownerId: entry.data.id, claimId: claim.id }]
		: (claim.supports_claim_refs ?? []).map((reference) => {
			if (typeof reference !== 'string' || !reference.trim()) return null;
			const separator = reference.indexOf('#');
			return {
				ownerId: separator < 0 ? entry.data.id : reference.slice(0, separator),
				claimId: separator < 0 ? reference : reference.slice(separator + 1),
			};
		}).filter(Boolean);

	return supportedClaims.some(({ ownerId, claimId }) => {
		const owner = allById.get(ownerId);
		return owner?.collection === 'solutions'
			&& ownerId === reproductionSolutionId
			&& (reproduction.data.claim_ids ?? []).includes(claimId);
	});
}

function validateCompletedReproduction(errors, entry) {
	const { data } = entry;
	const artifacts = data.artifacts;
	if (!Array.isArray(artifacts) || !artifacts.length || artifacts.some((artifact) => typeof artifact !== 'string' || !artifact.trim())) {
		errors.push(`${entry.file} (${data.id}): completed reproduction requires non-empty artifact references`);
	}
	const requiredValues = [
		['code.revision', data.code?.revision],
		['data.version_or_fingerprint', data.data?.version_or_fingerprint],
		['data.split_definition', data.data?.split_definition],
		['environment.dependency_lock_or_image', data.environment?.dependency_lock_or_image],
		['environment.operating_system', data.environment?.operating_system],
		['environment.hardware', data.environment?.hardware],
		['command', data.command],
		['expected.metric_id', data.expected?.metric_id],
		['expected.split', data.expected?.split],
		['expected.tolerance_rationale', data.expected?.tolerance_rationale],
		['executed_by', data.executed_by],
		['executed_at', data.executed_at],
	];
	for (const [field, value] of requiredValues) {
		if (typeof value !== 'string' || !value.trim()) {
			errors.push(`${entry.file} (${data.id}): completed reproduction requires ${field}`);
		}
	}
	const codeUrl = data.code?.url;
	const hasCodeUrl = typeof codeUrl === 'string' && /^https?:\/\//i.test(codeUrl.trim());
	const snapshotRef = data.code?.snapshot_ref;
	if (!hasCodeUrl && (typeof snapshotRef !== 'string' || !snapshotRef.trim() || !artifacts.includes(snapshotRef))) {
		errors.push(`${entry.file} (${data.id}): completed reproduction requires an HTTP(S) code.url or a code.snapshot_ref included in artifacts`);
	}
	for (const field of ['expected.value', 'expected.tolerance', 'observed.value']) {
		const [section, key] = field.split('.');
		const value = data[section]?.[key];
		if (typeof value !== 'number' || !Number.isFinite(value)) {
			errors.push(`${entry.file} (${data.id}): completed reproduction requires numeric ${field}`);
		}
	}
}

function validateClaims(errors, entry, collections, allById) {
	const claims = entry.data.claims ?? [];
	for (const [index, claim] of claims.entries()) {
		const field = `claims[${index}]`;
		const evidence = claim.evidence ?? [];
		if (claim.kind === 'source-reported' && evidence.length === 0) {
			errors.push(`${entry.file} (${entry.data.id}): ${field} is source-reported but has no evidence`);
		}
		if (claim.kind === 'reproduced' && !(claim.reproduction_ids ?? []).length) {
			errors.push(`${entry.file} (${entry.data.id}): ${field} is marked reproduced but has no reproduction record`);
		}
		if (claim.kind === 'editorial-inference' && evidence.length === 0 && !(claim.supports_claim_refs ?? []).length) {
			errors.push(`${entry.file} (${entry.data.id}): ${field} is an editorial inference without evidence or a supporting claim`);
		}
		for (const [evidenceIndex, item] of evidence.entries()) {
			addReferenceError(errors, entry, `${field}.evidence[${evidenceIndex}].source_id`, 'sources', item.source_id, collections);
			const sourceId = referenceId(item.source_id);
			requireTopLevelSource(errors, entry, `${field}.evidence[${evidenceIndex}]`, item.source_id);
			const source = collections.sources.get(sourceId);
			if (entry.data.status !== 'draft' && claim.kind === 'source-reported'
				&& source && (!source.data.content_reviewed || source.data.access_status === 'unchecked' || source.data.kind === 'discovery-index')) {
				errors.push(`${entry.file} (${entry.data.id}): ${field} relies on source "${sourceId}" that is not a reviewed primary source`);
			}
		}
		for (const id of claim.reproduction_ids ?? []) {
			addReferenceError(errors, entry, `${field}.reproduction_ids`, 'reproductions', id, collections);
			const reproduction = collections.reproductions.get(referenceId(id));
			if (claim.kind === 'reproduced' && reproduction) {
				if (reproduction.data.status !== 'completed') {
					errors.push(`${entry.file} (${entry.data.id}): ${field} needs a completed reproduction`);
				}
				if (!reproducedClaimMatches(entry, claim, reproduction, allById)) {
					errors.push(`${entry.file} (${entry.data.id}): ${field} reproduction "${referenceId(id)}" must match the supporting solution and claim IDs`);
				}
			}
		}
		for (const claimRef of claim.supports_claim_refs ?? []) {
			addClaimReferenceError(errors, entry, `${field}.supports_claim_refs`, claimRef, allById);
		}
	}
}

function validateClaimMarkers(errors, entries) {
	for (const collectionName of ['competitions', 'practices']) {
		for (const entry of entries[collectionName]) {
			const claims = new Set((entry.data.claims ?? []).map((claim) => claim.id));
			for (const match of entry.body.matchAll(/\[claim:([^\]]+)\]/g)) {
				if (!claims.has(match[1])) {
					errors.push(`${entry.file} (${entry.data.id}): unresolved claim marker "${match[0]}"`);
				}
			}
		}
	}
}

function validateDirectReferences(errors, entries, collections, allById) {
	for (const entry of entries.competitions) {
		const { data } = entry;
		for (const id of data.solution_ids ?? []) {
			addReferenceError(errors, entry, 'solution_ids', 'solutions', id, collections);
			const solution = collections.solutions.get(referenceId(id));
			if (solution && referenceId(solution.data.competition_id) !== data.id) {
				errors.push(`${entry.file} (${data.id}): solution "${solution.data.id}" names a different competition`);
			}
		}
		for (const id of data.practice_ids ?? []) addReferenceError(errors, entry, 'practice_ids', 'practices', id, collections);
		for (const id of data.source_ids ?? []) addReferenceError(errors, entry, 'source_ids', 'sources', id, collections);
		for (const metric of data.metrics ?? []) {
			addReferenceError(errors, entry, `metrics.${metric.id}.source_id`, 'sources', metric.source_id, collections);
			requireTopLevelSource(errors, entry, `metrics.${metric.id}`, metric.source_id);
		}
		validateClaims(errors, entry, collections, allById);
	}
	for (const entry of entries.solutions) {
		const { data } = entry;
		addReferenceError(errors, entry, 'competition_id', 'competitions', data.competition_id, collections);
		const competition = collections.competitions.get(referenceId(data.competition_id));
		if (competition && !(competition.data.solution_ids ?? []).some((id) => referenceId(id) === data.id)) {
			errors.push(`${entry.file} (${data.id}): parent competition does not list this solution`);
		}
		for (const id of data.source_ids ?? []) addReferenceError(errors, entry, 'source_ids', 'sources', id, collections);
		if (data.rank?.source_id) {
			addReferenceError(errors, entry, 'rank.source_id', 'sources', data.rank.source_id, collections);
			requireTopLevelSource(errors, entry, 'rank', data.rank.source_id);
		}
		for (const id of data.validation?.source_ids ?? []) {
			addReferenceError(errors, entry, 'validation.source_ids', 'sources', id, collections);
			requireTopLevelSource(errors, entry, 'validation', id);
		}
		for (const id of data.reproducibility?.reproduction_ids ?? []) addReferenceError(errors, entry, 'reproducibility.reproduction_ids', 'reproductions', id, collections);
		for (const item of data.resources ?? []) {
			if (item.basis !== 'unknown' && (typeof item.claim_id !== 'string' || !item.claim_id.trim())) {
				errors.push(`${entry.file} (${data.id}): resources.${item.id}.claim_id is required when resource basis is known`);
			} else if (item.claim_id) {
				addClaimReferenceError(errors, entry, `resources.${item.id}.claim_id`, item.claim_id, allById);
			}
		}
		for (const item of data.scores ?? []) {
			addClaimReferenceError(errors, entry, `scores.${item.id ?? item.metric_id}.claim_id`, item.claim_id, allById);
			if (competition && !(competition.data.metrics ?? []).some((metric) => metric.id === item.metric_id)) {
				errors.push(`${entry.file} (${data.id}): score references unknown competition metric "${item.metric_id}"`);
			}
		}
		validateClaims(errors, entry, collections, allById);
	}
	for (const entry of entries.practices) {
		const { data } = entry;
		for (const id of data.source_ids ?? []) addReferenceError(errors, entry, 'source_ids', 'sources', id, collections);
		for (const claimRef of data.evidence_claim_refs ?? []) addClaimReferenceError(errors, entry, 'evidence_claim_refs', claimRef, allById);
		validateClaims(errors, entry, collections, allById);
	}
	for (const entry of entries.reproductions) {
		const { data } = entry;
		if (data.status === 'completed') validateCompletedReproduction(errors, entry);
		addReferenceError(errors, entry, 'solution_id', 'solutions', data.solution_id, collections);
		const solutionId = referenceId(data.solution_id);
		const solution = collections.solutions.get(solutionId);
		for (const claimId of data.claim_ids ?? []) {
			if (!solution?.data.claims?.some((claim) => claim.id === claimId)) {
				errors.push(`${entry.file} (${data.id}): claim_ids references missing claim "${solutionId}#${claimId}"`);
			}
		}
	}
}

function validatePublicationStates(errors, entries, collections, allById) {
	const policyContext = { sources: collections.sources, solutions: collections.solutions };
	const sourcesFor = (entry) => (entry.data.source_ids ?? [])
		.map(referenceId)
		.map((id) => collections.sources.get(id))
		.filter(Boolean);

	for (const collectionName of ['competitions', 'solutions', 'practices']) {
		for (const entry of entries[collectionName]) {
			const context = collectionName === 'competitions' ? policyContext : undefined;
			if (entry.data.status === 'published' && !isPubliclyPublishable(entry, context)) {
				errors.push(`${entry.file} (${entry.data.id}): published content needs a named reviewer, valid review date, and published editorial state`);
			}
			if (entry.data.status === 'published'
				&& sourcesFor(entry).some(({ data }) => !data.content_reviewed || data.access_status === 'unchecked')) {
				errors.push(`${entry.file} (${entry.data.id}): published content depends on an unreviewed or unchecked source`);
			}
		}
	}

	for (const entry of entries.competitions) {
		const { data } = entry;
		if (data.kaggle_bible_completeness_level >= 2 && data.status !== 'draft') {
			for (const message of validateLevel2Readiness(entry, policyContext)) {
				errors.push(`${entry.file} (${data.id}): ${message}`);
			}
		}
		if (data.kaggle_bible_completeness_level >= 3 && data.status !== 'draft') {
			for (const message of validateLevel3Readiness(entry, policyContext)) {
				errors.push(`${entry.file} (${data.id}): ${message}`);
			}
		}
		if (data.status === 'published') {
			for (const id of data.solution_ids ?? []) {
				const solution = collections.solutions.get(referenceId(id));
				if (solution && solution.data.status !== 'published') {
					errors.push(`${entry.file} (${data.id}): published guide depends on non-published solution "${solution.data.id}"`);
				}
			}
			for (const id of data.practice_ids ?? []) {
				const practice = collections.practices.get(referenceId(id));
				if (practice && practice.data.status !== 'published') {
					errors.push(`${entry.file} (${data.id}): published guide depends on non-published practice "${practice.data.id}"`);
				}
			}
		}
	}

	for (const entry of entries.solutions) {
		if (entry.data.status !== 'published') continue;
		const competition = collections.competitions.get(referenceId(entry.data.competition_id));
		if (!competition || competition.data.status === 'draft' || competition.data.kaggle_bible_completeness_level < 2) {
			errors.push(`${entry.file} (${entry.data.id}): published solution requires a Level 2+ competition in review or published`);
		} else {
			for (const message of validateLevel2Readiness(competition, policyContext)) {
				errors.push(`${entry.file} (${entry.data.id}): parent competition is not publication-ready: ${message}`);
			}
		}
	}

	for (const entry of entries.practices) {
		if (entry.data.status !== 'published') continue;
		for (const claimRef of entry.data.evidence_claim_refs ?? []) {
			const ownerId = claimRef.split('#', 1)[0];
			const owner = allById.get(ownerId);
			if (owner && owner.data.status !== 'published') {
				errors.push(`${entry.file} (${entry.data.id}): published practice depends on non-published evidence owner "${ownerId}"`);
			}
		}
	}
}

function normalizeLeakText(value) {
	return String(value ?? '')
		.replace(/\[claim:[^\]]+\]/gi, ' ')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, ' $1 ')
		.replace(/<[^>]*>/g, ' ')
		.replace(/&(?:#x?[0-9a-f]+|[a-z]+);/gi, ' ')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.trim()
		.replace(/\s+/g, ' ');
}

function nonPublishedTextCandidates(entry, catalogText) {
	const candidates = [];
	const add = (label, value, allowCatalogCopy = false) => {
		const normalized = normalizeLeakText(value);
		if (!normalized) return;
		const wordCount = normalized.split(' ').length;
		if ((wordCount === 1 && normalized.length < 3) || (wordCount > 1 && normalized.length < 8)) return;
		if (allowCatalogCopy && entry.collection === 'competitions' && catalogText.has(normalized)) return;
		candidates.push({ label, text: normalized });
	};

	add('title', entry.data.title, true);
	add('summary', entry.data.summary, true);
	for (const claim of entry.data.claims ?? []) add(`claim ${claim.id}`, claim.statement);
	const body = (entry.body ?? '')
		.replace(/^\s{0,3}```[^\n]*$/gm, '')
		.replace(/^\s{0,3}#{1,6}\s+/gm, '')
		.replace(/^\s{0,3}>\s?/gm, '')
		.replace(/^\s*[-*+]\s+/gm, '')
		.replace(/\[claim:[^\]]+\]/gi, ' ');
	for (const [index, paragraph] of body.split(/\n\s*\n/).entries()) {
		add(`body paragraph ${index + 1}`, paragraph, true);
	}
	return [...new Map(candidates.map((candidate) => [candidate.text, candidate])).values()];
}

function textSegments(value) {
	return String(value ?? '')
		.split(/[\r\n.!?;:|]+/)
		.map(normalizeLeakText)
		.filter(Boolean);
}

function htmlTextSegments(html) {
	const visibleText = html
		.replace(/<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
		.replace(/<\/?(?:address|article|aside|blockquote|br|dd|div|dl|dt|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul)\b[^>]*>/gi, '\n')
		.replace(/<[^>]*>/g, ' ');
	const attributeText = [...html.matchAll(/<[^>]+>/g)].flatMap(([tag]) =>
		[...tag.matchAll(/\b(?:content|title|aria-label|alt|value)\s*=\s*(["'])(.*?)\1/gi)].map(([, , value]) => value));
	return [...textSegments(visibleText), ...attributeText.flatMap(textSegments)];
}

function jsonTextSegments(source) {
	let value;
	try {
		value = JSON.parse(source);
	} catch {
		return [];
	}
	const strings = [];
	const collect = (item) => {
		if (typeof item === 'string') strings.push(item);
		else if (Array.isArray(item)) item.forEach(collect);
		else if (item && typeof item === 'object') Object.values(item).forEach(collect);
	};
	collect(value);
	return strings.flatMap(textSegments);
}

function candidateAppears(candidate, normalizedOutput, segments) {
	const words = candidate.text.split(' ').length;
	if (words >= 6 && candidate.text.length >= 40) return normalizedOutput.includes(candidate.text);
	const phrase = ` ${candidate.text} `;
	return segments.some((segment) => ` ${segment} `.includes(phrase));
}

function validateCatalogRows(catalog, errors) {
	const requiredStrings = [
		'id', 'slug', 'title', 'subtitle', 'competition_url', 'category', 'enabled_at', 'deadline_at',
		'record_state', 'metric_abbreviation', 'metric_name', 'metric_direction', 'completeness_level',
		'completeness_label', 'editorial_status', 'priority', 'work_order', 'learning_path_stage', 'guide_slug',
	];
	const completenessLabels = { '1': 'catalog', '2': 'evidence-map', '3': 'full-guide' };
	const recordStates = new Set(['active', 'upcoming', 'closed', 'undated']);
	const editorialStatuses = new Set(['unstarted', 'queued', 'in-progress', 'blocked', 'in-review', 'published']);
	const learningStages = new Set(['', 'beginner', 'intermediate', 'advanced']);
	const validDate = (value) => {
		if (value === '') return true;
		if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) return false;
		const date = new Date(value);
		return !Number.isNaN(date.valueOf()) && date.toISOString().replace(/\.000Z$/, 'Z') === value;
	};

	for (const [index, row] of catalog.entries()) {
		const label = `dist/data/competition-catalog.json: row ${index + 1}`;
		if (!row || typeof row !== 'object' || Array.isArray(row)) {
			errors.push(`${label} must be an object`);
			continue;
		}
		for (const field of requiredStrings) {
			if (typeof row[field] !== 'string') errors.push(`${label} is missing required string "${field}"`);
		}
		for (const field of ['id', 'slug', 'title', 'competition_url']) {
			if (typeof row[field] === 'string' && !row[field].trim()) errors.push(`${label} requires a non-empty "${field}"`);
		}
		if (typeof row.competition_url === 'string' && row.competition_url.trim()) {
			try {
				const url = new URL(row.competition_url);
				if (url.protocol !== 'https:' || url.hostname !== 'www.kaggle.com' || !/^\/competitions\/[^/]+\/?$/.test(url.pathname)) {
					errors.push(`${label} has an invalid Kaggle competition URL`);
				}
			} catch {
				errors.push(`${label} has an invalid Kaggle competition URL`);
			}
		}
		if (typeof row.enabled_at === 'string' && !validDate(row.enabled_at)) errors.push(`${label} has an invalid "enabled_at" timestamp`);
		if (typeof row.deadline_at === 'string' && !validDate(row.deadline_at)) errors.push(`${label} has an invalid "deadline_at" timestamp`);
		if (typeof row.record_state === 'string' && !recordStates.has(row.record_state)) errors.push(`${label} has an invalid "record_state"`);
		if (typeof row.metric_direction === 'string' && !['', 'maximize', 'minimize'].includes(row.metric_direction)) errors.push(`${label} has an invalid "metric_direction"`);
		if (typeof row.completeness_level === 'string'
			&& completenessLabels[row.completeness_level] !== row.completeness_label) {
			errors.push(`${label} has an inconsistent completeness level and label`);
		}
		if (typeof row.editorial_status === 'string' && !editorialStatuses.has(row.editorial_status)) errors.push(`${label} has an invalid "editorial_status"`);
		if (typeof row.learning_path_stage === 'string' && !learningStages.has(row.learning_path_stage)) errors.push(`${label} has an invalid "learning_path_stage"`);
	}
}

async function validateBuildOutput(root, entries, collections, allEntries, errors) {
	const dist = path.join(root, 'dist');
	try {
		await access(dist, constants.R_OK);
	} catch {
		errors.push('dist: build output is missing; run pnpm build before CHECK_BUILT_CONTENT=1');
		return;
	}

	const catalogPath = path.join(dist, 'data', 'competition-catalog.json');
	let catalog;
	try {
		catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
		if (!Array.isArray(catalog)) throw new Error('expected a JSON array');
	} catch (error) {
		errors.push(`dist/data/competition-catalog.json: required catalog asset is missing or invalid (${error.message})`);
		return;
	}
	if (catalog.length === 0) errors.push('dist/data/competition-catalog.json: catalog must contain at least one competition row');
	validateCatalogRows(catalog, errors);

	const outputFiles = (await walk(dist)).filter((file) => /\.(?:html|js|mjs|json|xml|txt|css|svg)$/i.test(file));
	const outputContents = await Promise.all(outputFiles.map(async (file) => ({ file, content: await readFile(file, 'utf8') })));
	const output = outputContents.map(({ content }) => content).join('\n');
	const normalizedOutput = normalizeLeakText(output);
	const shortTextSegments = outputContents.flatMap(({ file, content }) => {
		if (/\.html$/i.test(file)) return htmlTextSegments(content);
		if (/\.json$/i.test(file)) return jsonTextSegments(content);
		return [];
	});
	const leakedIds = new Set([...output.matchAll(/\b(?:competition|solution|source|practice|reproduction)-[a-z0-9-]+\b/g)].map(([id]) => id));
	const catalogText = new Set(catalog.flatMap((row) => [row.title, row.subtitle]).map(normalizeLeakText).filter(Boolean));
	for (const entry of allEntries) {
		if (['draft', 'in-review'].includes(entry.data.status) && leakedIds.has(entry.data.id)) {
			errors.push(`${entry.file} (${entry.data.id}): non-published record ID appears in the built public output`);
		}
		if (!['draft', 'in-review'].includes(entry.data.status)) continue;
		for (const candidate of nonPublishedTextCandidates(entry, catalogText)) {
			if (candidateAppears(candidate, normalizedOutput, shortTextSegments)) {
				errors.push(`${entry.file} (${entry.data.id}): non-published ${candidate.label} appears in the built public output`);
			}
		}
	}

	const policyContext = { sources: collections.sources, solutions: collections.solutions };
	const competitions = new Map(entries.competitions.map((entry) => [entry.data.slug, entry]));
	for (const row of catalog) {
		if (!row.guide_slug) continue;
		const guide = competitions.get(row.guide_slug);
		if (!guide || !isPubliclyPublishable(guide, policyContext)) {
			errors.push(`dist/data/competition-catalog.json: guide_slug "${row.guide_slug}" does not point to a published, reviewed guide`);
		}
	}

	for (const entry of entries.competitions) {
		if (isPubliclyPublishable(entry, policyContext)) continue;
		for (const slug of [entry.data.slug, entry.data.kaggle_slug].filter(Boolean)) {
			const route = path.join(dist, 'competitions', slug, 'index.html');
			try {
				await access(route, constants.R_OK);
				errors.push(`${entry.file} (${entry.data.id}): non-published competition has a public guide route at ${path.relative(root, route)}`);
			} catch (error) {
				if (error.code !== 'ENOENT') throw error;
			}
		}
	}
}

export async function checkContent(root = defaultRoot, { report = true } = {}) {
	const errors = [];
	const entries = Object.fromEntries(definitions.map(([name]) => [name, []]));
	for (const [collection, directory, extension] of definitions) {
		const files = (await walk(path.join(root, directory))).filter((file) => file.endsWith(extension)).sort();
		for (const file of files) {
			const relativeFile = path.relative(root, file).split(path.sep).join('/');
			try {
				const source = await readFile(file, 'utf8');
				const parsed = parseRecord(source, extension);
				if (!parsed.data || typeof parsed.data !== 'object' || Array.isArray(parsed.data)) {
					throw new Error('frontmatter must be a YAML mapping');
				}
				entries[collection].push({ collection, file: relativeFile, ...parsed });
			} catch (error) {
				errors.push(`${relativeFile}: ${error.message}`);
			}
		}
	}

	const collections = Object.fromEntries(definitions.map(([name]) => [name, new Map()]));
	const allById = new Map();
	for (const collection of Object.keys(entries)) {
		for (const entry of entries[collection]) {
			const id = entry.data.id;
			if (typeof id !== 'string' || !id.trim()) {
				errors.push(`${entry.file}: missing record ID`);
				continue;
			}
			if (allById.has(id)) errors.push(`${entry.file} (${id}): duplicate record ID also used by ${allById.get(id).file}`);
			else allById.set(id, entry);
			collections[collection].set(id, entry);
			if (path.basename(entry.file, path.extname(entry.file)) !== id) {
				errors.push(`${entry.file} (${id}): filename must match the record ID`);
			}
		}
	}

	validateDirectReferences(errors, entries, collections, allById);
	validateClaimMarkers(errors, entries);
	validatePublicationStates(errors, entries, collections, allById);
	if (process.env.CHECK_BUILT_CONTENT === '1') {
		await validateBuildOutput(root, entries, collections, allById.values(), errors);
	}

	if (errors.length) {
		if (report) for (const error of errors) process.stderr.write(`- ${error}\n`);
		return { ok: false, errors };
	}
	if (report) {
		process.stdout.write(`Content checks passed: ${Object.values(entries).reduce((count, records) => count + records.length, 0)} editorial records checked.\n`);
	}
	return { ok: true, errors: [] };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
	const result = await checkContent();
	if (!result.ok) process.exitCode = 1;
}
