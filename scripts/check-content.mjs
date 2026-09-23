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
			if (claim.kind === 'reproduced' && reproduction
				&& (reproduction.data.status !== 'completed' || !reproduction.data.artifacts?.length)) {
				errors.push(`${entry.file} (${entry.data.id}): ${field} needs a completed reproduction with artifacts`);
			}
		}
		for (const claimRef of claim.supports_claim_refs ?? []) {
			addClaimReferenceError(errors, entry, `${field}.supports_claim_refs`, claimRef, allById);
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
			if (item.claim_id) addClaimReferenceError(errors, entry, `resources.${item.id}.claim_id`, item.claim_id, allById);
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

async function validateBuildOutput(root, entries, collections, allEntries, errors) {
	const dist = path.join(root, 'dist');
	try {
		await access(dist, constants.R_OK);
	} catch {
		return;
	}

	const outputFiles = (await walk(dist)).filter((file) => /\.(?:html|js|mjs|json|xml|txt|css|svg)$/i.test(file));
	const output = (await Promise.all(outputFiles.map((file) => readFile(file, 'utf8')))).join('\n');
	const leakedIds = new Set([...output.matchAll(/\b(?:competition|solution|source|practice|reproduction)-[a-z0-9-]+\b/g)].map(([id]) => id));
	for (const entry of allEntries) {
		if (['draft', 'in-review'].includes(entry.data.status) && leakedIds.has(entry.data.id)) {
			errors.push(`${entry.file} (${entry.data.id}): non-published record ID appears in the built public output`);
		}
	}

	const catalogPath = path.join(dist, 'data', 'competition-catalog.json');
	const policyContext = { sources: collections.sources, solutions: collections.solutions };
	try {
		const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
		const competitions = new Map(entries.competitions.map((entry) => [entry.data.slug, entry]));
		for (const row of catalog) {
			if (!row.guide_slug) continue;
			const guide = competitions.get(row.guide_slug);
			if (!guide || !isPubliclyPublishable(guide, policyContext)) {
				errors.push(`dist/data/competition-catalog.json: guide_slug "${row.guide_slug}" does not point to a published, reviewed guide`);
			}
		}
	} catch (error) {
		if (error.code !== 'ENOENT') errors.push(`dist/data/competition-catalog.json: ${error.message}`);
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
