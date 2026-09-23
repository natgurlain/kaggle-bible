const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value) {
	if (typeof value !== 'string' || !datePattern.test(value)) return false;
	const date = new Date(`${value}T00:00:00Z`);
	return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function referenceId(value) {
	if (typeof value === 'string' && value.trim()) return value.trim();
	if (value && typeof value === 'object' && !Array.isArray(value)) return value.id ?? value.slug ?? null;
	return null;
}

function sectionsFromMarkdown(body = '') {
	const sections = new Map();
	let current = null;
	for (const line of body.split(/\r?\n/)) {
		const heading = line.match(/^#{1,6}\s+(.+?)\s*#*\s*$/);
		if (heading) {
			current = heading[1].toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
			if (!sections.has(current)) sections.set(current, []);
		} else if (current) {
			sections.get(current).push(line);
		}
	}
	return new Map([...sections].map(([heading, lines]) => [heading, lines.join('\n').trim()]));
}

function meaningfulSection(sections, title, minLength = 20) {
	const key = title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
	return (sections.get(key) ?? '').replace(/[`*_>#\s-]/g, '').length >= minLength;
}

function meaningfulAnySection(sections, titles, minLength = 20) {
	return titles.some((title) => meaningfulSection(sections, title, minLength));
}

function independentAuthorGroups(sources) {
	const selected = [];
	for (const source of sources) {
		const authors = new Set((source.data.authors ?? [])
			.filter((author) => typeof author === 'string')
			.map((author) => author.trim().toLowerCase())
			.filter(Boolean));
		if (!authors.size || selected.some((prior) => [...authors].some((author) => prior.has(author)))) continue;
		selected.push(authors);
	}
	return selected.length;
}

/**
 * Machine-checkable Level 2 requirements drawn from docs/coverage-levels.md.
 * Source IDs and solution IDs resolve to maps of content entries.
 */
export function validateLevel2Readiness(record, { sources, solutions }) {
	const errors = [];
	const { data, body = '' } = record;
	const sections = sectionsFromMarkdown(body);
	const sourceEntries = (data.source_ids ?? []).map(referenceId).map((id) => sources.get(id)).filter(Boolean);
	const solutionEntries = (data.solution_ids ?? []).map(referenceId).map((id) => solutions.get(id)).filter(Boolean);

	if (data.coverage !== 'reviewed') errors.push('Level 2 requires coverage: reviewed');
	if (!['in-review', 'published'].includes(data.editorial_status)) {
		errors.push('Level 2 requires editorial_status: in-review or published');
	}
	if (typeof data.reviewed_by !== 'string' || !data.reviewed_by.trim()) errors.push('Level 2 requires a named reviewer');
	if (!isRealDate(data.reviewed_at)) errors.push('Level 2 requires a valid source review date');
	if (!sourceEntries.some(({ data: source }) => source.kind === 'official-competition')) {
		errors.push('Level 2 requires a reviewed official competition source');
	}
	if (sourceEntries.some(({ data: source }) => !source.content_reviewed || source.access_status === 'unchecked')) {
		errors.push('Level 2 requires every linked source to be reviewed');
	}
	const primarySources = sourceEntries.filter(({ data: source }) => ['author-writeup', 'paper'].includes(source.kind));
	if (independentAuthorGroups(primarySources) < 2
		&& !meaningfulSection(sections, 'Source coverage note', 40)
		&& !meaningfulSection(sections, 'Source limitations', 40)) {
		errors.push('Level 2 needs two independent primary solution sources or a substantial Source coverage note explaining the gap');
	}
	if (!solutionEntries.length) errors.push('Level 2 requires at least one structured solution record');
	for (const solution of solutionEntries) {
		const solutionData = solution.data;
		if (data.status === 'published' && solutionData.status !== 'published') {
			errors.push(`published guide depends on non-published solution ${solutionData.id}`);
		} else if (data.status !== 'draft' && solutionData.status === 'draft') {
			errors.push(`solution ${solutionData.id} is still a draft`);
		}
		if (!solutionData.source_ids?.length) errors.push(`solution ${solutionData.id} needs source attribution`);
		if (!solutionData.validation?.strategy && !solutionData.validation?.details?.trim()) {
			errors.push(`solution ${solutionData.id} needs validation details or an explicit unknown`);
		}
		if (!solutionData.techniques?.length) errors.push(`solution ${solutionData.id} needs documented techniques`);
		const rank = solutionData.rank;
		if (!rank?.basis
			|| (rank.basis === 'unknown' && rank.value !== null)
			|| (rank.basis !== 'unknown' && (rank.value === null || !rank.source_id))) {
			errors.push(`solution ${solutionData.id} needs rank or score provenance`);
		}
	}
	if (!data.claims?.length) errors.push('Level 2 requires evidence-backed claims');
	const requiredSummaries = [
		[['Approaches', 'Top-solution comparison', 'Decisive techniques and evidence'], 'approach summary', 20],
		[['Gaps', 'Source limitations', 'Sources, gaps, and corrections'], 'known-gaps summary', 20],
		[['Bounded lesson', 'Suggested first experiment'], 'bounded lesson or suggested experiment', 20],
		[['Unresolved questions', 'Sources, gaps, and corrections'], 'unresolved-questions summary', 1],
	];
	for (const [titles, label, minLength] of requiredSummaries) {
		if (!meaningfulAnySection(sections, titles, minLength)) errors.push(`Level 2 requires a non-empty ${label}`);
	}
	return errors;
}

export function validateLevel3Readiness(record, { solutions, practices, sources }) {
	const errors = [];
	const { data, body = '' } = record;
	const solutionEntries = (data.solution_ids ?? []).map(referenceId).map((id) => solutions.get(id)).filter(Boolean);
	const practiceEntries = (data.practice_ids ?? []).map(referenceId).map((id) => practices?.get(id)).filter(Boolean);
	if (solutionEntries.length < 2) errors.push('Level 3 requires at least two comparable solution records');
	if (!practiceEntries.some((practice) => isPubliclyPublishable(practice, { solutions, sources }))) {
		errors.push('Level 3 requires at least one linked, publicly publishable practice');
	}
	for (const solution of solutionEntries) {
		if (!solution.data.reviewed_by || !isRealDate(solution.data.reviewed_at)
			|| !['in-review', 'published'].includes(solution.data.status)) {
			errors.push(`solution ${solution.data.id} must be reviewed before a Level 3 guide can be approved`);
		}
		if (!(solution.data.transfer_limits ?? []).length) errors.push(`solution ${solution.data.id} needs transfer limits for comparison`);
	}
	const sections = sectionsFromMarkdown(body);
	const requiredSections = [
		[['Top-solution comparison'], 'Top-solution comparison'],
		[['Validation and results', 'Validation strategy'], 'Validation and results'],
		[['Compute and reproduction'], 'Compute and reproduction'],
		[['Transfer limits', 'Transferable lessons and limits'], 'Transfer limits'],
		[['Next experiment', 'Suggested first experiment'], 'Suggested first experiment'],
		[['Techniques', 'Decisive techniques and evidence'], 'technique analysis'],
	];
	for (const [titles, label] of requiredSections) {
		if (!meaningfulAnySection(sections, titles, 20)) errors.push(`Level 3 requires a non-empty ${label} section`);
	}
	return errors;
}

/**
 * The single status gate for editorial content rendered into public routes,
 * catalog links, or search indexes. Level 2+ guides also need their complete
 * source and solution context, so callers must pass both maps.
 */
export function isPubliclyPublishable(record, context) {
	const data = record?.data ?? record;
	if (!data || data.status !== 'published') return false;
	if (typeof data.reviewed_by !== 'string' || !data.reviewed_by.trim()) return false;
	if (!isRealDate(data.reviewed_at)) return false;
	if ('editorial_status' in data && data.editorial_status !== 'published') return false;
	if ('coverage' in data && data.coverage !== 'reviewed') return false;
	if (data.kaggle_bible_completeness_level >= 2) {
		if (!context?.sources || !context?.solutions) return false;
		const normalizedRecord = record?.data ? record : { data, body: record?.body ?? '' };
		if (validateLevel2Readiness(normalizedRecord, context).length) return false;
		if (data.kaggle_bible_completeness_level >= 3
			&& validateLevel3Readiness(normalizedRecord, context).length) return false;
	}
	return true;
}

export function filterPublicContent(records, context) {
	return records.filter((record) => isPubliclyPublishable(record, context));
}

/** Public guide routes are reserved for reviewed Level 2 evidence maps and Level 3 guides. */
export function filterPublicGuides(records, context) {
	return records.filter((record) => {
		const data = record?.data ?? record;
		return data?.kaggle_bible_completeness_level >= 2 && isPubliclyPublishable(record, context);
	});
}
