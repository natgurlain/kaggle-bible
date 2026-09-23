import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { satteri } from '@astrojs/markdown-satteri';
import { checkContent, validateBuildOutput } from './check-content.mjs';
import {
	filterPublicContent,
	filterPublicGuides,
	isPubliclyPublishable,
	validateLevel2Readiness,
} from '../src/content/publication-policy.js';
import { normalizeCatalogTitles } from './normalize-built-catalog.mjs';
import claimReferenceLinks from '../src/markdown/claim-reference-links.js';

function level2Fixture() {
	const sources = new Map([
		['source-official', { data: { id: 'source-official', kind: 'official-competition', content_reviewed: true, access_status: 'accessible', authors: ['Kaggle'] } }],
		['source-author-a', { data: { id: 'source-author-a', kind: 'author-writeup', content_reviewed: true, access_status: 'accessible', authors: ['Author A'] } }],
		['source-author-b', { data: { id: 'source-author-b', kind: 'author-writeup', content_reviewed: true, access_status: 'accessible', authors: ['Author B'] } }],
	]);
	const solutions = new Map([
		['solution-example', {
			data: {
				id: 'solution-example',
				status: 'published',
				source_ids: ['source-author-a'],
				validation: { strategy: 'grouped-cross-validation', details: null },
				techniques: ['groupby-aggregation'],
				rank: { value: 4, basis: 'author-report', source_id: 'source-author-a' },
			},
		}],
	]);
	const record = {
		data: {
			id: 'competition-example',
			status: 'in-review',
			reviewed_by: 'Editorial reviewer',
			reviewed_at: '2026-09-23',
			coverage: 'reviewed',
			editorial_status: 'in-review',
			kaggle_bible_completeness_level: 2,
			source_ids: ['source-official', 'source-author-a', 'source-author-b'],
			solution_ids: ['solution-example'],
			claims: [{ id: 'task', kind: 'source-reported', evidence: [{ source_id: 'source-official' }] }],
		},
		body: [
			'## Approaches',
			'Document the main approaches supported by reviewed primary sources.',
			'## Gaps',
			'Explain what the sources do not establish and which details remain unknown.',
			'## Bounded lesson',
			'State one lesson with the conditions and limits under which it may transfer.',
			'## Unresolved questions',
			'Which validation details would change the comparison?',
		].join('\n\n'),
	};
	return { record, sources, solutions };
}

function validCatalogRow() {
	return {
		id: '123',
		slug: 'example-competition',
		title: 'Example Competition',
		subtitle: '',
		competition_url: 'https://www.kaggle.com/competitions/example-competition',
		category: 'Community',
		enabled_at: '',
		deadline_at: '',
		record_state: 'undated',
		metric_abbreviation: '',
		metric_name: '',
		metric_direction: '',
		completeness_level: '1',
		completeness_label: 'catalog',
		editorial_status: 'unstarted',
		priority: '',
		work_order: '',
		learning_path_stage: '',
		guide_slug: '',
	};
}

async function writeCatalog(dist, rows = [validCatalogRow()]) {
	await writeFile(path.join(dist, 'data/competition-catalog.json'), JSON.stringify(rows));
}

test('complete Level 2 evidence map passes readiness checks', () => {
	const fixture = level2Fixture();
	assert.deepEqual(validateLevel2Readiness(fixture.record, fixture), []);
	fixture.record.data.status = 'published';
	fixture.record.data.editorial_status = 'published';
	assert.equal(isPubliclyPublishable(fixture.record, fixture), true);
});

test('only reviewed Level 2+ content receives public guide routes', () => {
	const fixture = level2Fixture();
	fixture.record.data.status = 'published';
	fixture.record.data.editorial_status = 'published';
	const catalogOnly = {
		...fixture.record,
		data: {
			...fixture.record.data,
			id: 'competition-catalog-only',
			kaggle_bible_completeness_level: 1,
		},
	};
	assert.deepEqual(
		filterPublicGuides([catalogOnly, fixture.record], fixture).map((entry) => entry.data.id),
		['competition-example'],
	);
});

test('a published guide is withheld until every linked solution is published', () => {
	const fixture = level2Fixture();
	fixture.record.data.status = 'published';
	fixture.record.data.editorial_status = 'published';
	fixture.solutions.get('solution-example').data.status = 'in-review';
	assert.equal(isPubliclyPublishable(fixture.record, fixture), false);
	assert.deepEqual(filterPublicGuides([fixture.record], fixture), []);
});

test('claim markers become evidence links without rewriting code or existing links', () => {
	const paragraph = {
		type: 'paragraph',
		children: [
			{ type: 'text', value: 'Supported claim [claim:gain-01]. ' },
			{ type: 'inlineCode', value: '[claim:code-example]' },
			{ type: 'link', url: '/existing', children: [{ type: 'text', value: '[claim:nested-link]' }] },
			{ type: 'emphasis', children: [{ type: 'text', value: '[claim:lesson-02]' }] },
		],
	};
	const transformed = claimReferenceLinks.paragraph(paragraph);
	assert.equal(transformed.children[1].type, 'link');
	assert.equal(transformed.children[1].url, '#evidence-gain-01');
	assert.equal(transformed.children[1].data.hProperties['aria-label'], 'View evidence for gain-01');
	assert.equal(transformed.children[3].value, '[claim:code-example]');
	assert.equal(transformed.children[4].url, '/existing');
	assert.equal(transformed.children[5].children[0].url, '#evidence-lesson-02');
});

test('a claim marker inside an emphasized-only paragraph becomes an evidence link', () => {
	const paragraph = {
		type: 'paragraph',
		children: [{ type: 'strong', children: [{ type: 'text', value: '[claim:gain-01]' }] }],
	};
	const transformed = claimReferenceLinks.paragraph(paragraph);
	assert.equal(transformed.children[0].type, 'strong');
	assert.equal(transformed.children[0].children[0].type, 'link');
	assert.equal(transformed.children[0].children[0].url, '#evidence-gain-01');
});

test('the Markdown renderer links a claim marker when the whole phrase is bold', async () => {
	const renderer = await satteri({ mdastPlugins: [claimReferenceLinks] }).createRenderer({});
	const { code } = await renderer.render('**[claim:gain-01]**', { frontmatter: {} });
	assert.match(code, /<strong><a[^>]*href="#evidence-gain-01"/);
});

test('guide evidence references must target claims rendered on that guide', async () => {
	const root = await mkdtemp(path.join(os.tmpdir(), 'kaggle-bible-guide-claim-target-'));
	try {
		const competitions = path.join(root, 'src/content/competitions');
		const solutions = path.join(root, 'src/content/solutions');
		const sources = path.join(root, 'src/content/sources');
		await mkdir(competitions, { recursive: true });
		await mkdir(solutions, { recursive: true });
		await mkdir(sources, { recursive: true });
		await writeFile(path.join(competitions, 'competition-sample.md'), [
			'---',
			'id: competition-sample',
			'status: draft',
			'slug: sample',
			'kaggle_bible_completeness_level: 2',
			'solution_ids:',
			'  - solution-linked',
			'claims:',
			'  - id: guide-claim',
			'    kind: editorial-inference',
			'    evidence: []',
			'    supports_claim_refs:',
			'      - competition-other#other-claim',
			'---',
			'',
			'# Sample guide',
		].join('\n'));
		await writeFile(path.join(competitions, 'competition-other.md'), [
			'---',
			'id: competition-other',
			'status: draft',
			'slug: other',
			'source_ids:',
			'  - source-claim',
			'claims:',
			'  - id: other-claim',
			'    kind: source-reported',
			'    evidence:',
			'      - source_id: source-claim',
			'        locator: Results section',
			'        support_summary: The source reports this result.',
			'    supports_claim_refs: []',
			'---',
			'',
			'# Other guide',
		].join('\n'));
		await writeFile(path.join(solutions, 'solution-linked.yaml'), [
			'id: solution-linked',
			'competition_id: competition-sample',
			'claims: []',
		].join('\n'));
		await writeFile(path.join(sources, 'source-claim.yaml'), 'id: source-claim\n');

		const result = await checkContent(root, { report: false });
		assert.ok(result.errors.some((error) => error.includes('target "competition-other#other-claim" is not rendered in the competition-sample guide')));
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test('built catalog guide links require an eligible Level 2+ record and an emitted route', async () => {
	const root = await mkdtemp(path.join(os.tmpdir(), 'kaggle-bible-built-guide-route-'));
	try {
		const dist = path.join(root, 'dist');
		await mkdir(path.join(dist, 'data'), { recursive: true });
		await writeFile(path.join(dist, 'index.html'), '<main>built</main>');

		const levelOne = level2Fixture();
		levelOne.record.data.slug = 'catalog-only';
		levelOne.record.data.kaggle_bible_completeness_level = 1;
		levelOne.record.data.status = 'published';
		levelOne.record.data.editorial_status = 'published';
		await mkdir(path.join(dist, 'competitions/catalog-only'), { recursive: true });
		await writeFile(path.join(dist, 'competitions/catalog-only/index.html'), '<main>not a guide</main>');
		await writeCatalog(dist, [{
			...validCatalogRow(),
			completeness_level: '1',
			completeness_label: 'catalog',
			guide_slug: 'catalog-only',
		}]);
		const levelOneEntries = {
			competitions: [levelOne.record],
			solutions: [...levelOne.solutions.values()],
			sources: [...levelOne.sources.values()],
			practices: [],
			reproductions: [],
		};
		const levelOneErrors = [];
		await validateBuildOutput(root, levelOneEntries, levelOne, Object.values(levelOneEntries).flat(), levelOneErrors);
		assert.ok(levelOneErrors.some((error) => error.includes('does not point to a published, reviewed Level 2+ guide')));
		assert.ok(levelOneErrors.some((error) => error.includes('non-public competition has a guide route')));

		const eligible = level2Fixture();
		eligible.record.data.slug = 'evidence-map';
		eligible.record.data.status = 'published';
		eligible.record.data.editorial_status = 'published';
		const eligibleEntries = {
			competitions: [eligible.record],
			solutions: [...eligible.solutions.values()],
			sources: [...eligible.sources.values()],
			practices: [],
			reproductions: [],
		};
		await writeCatalog(dist, [{
			...validCatalogRow(),
			completeness_level: '2',
			completeness_label: 'evidence-map',
			editorial_status: 'published',
			guide_slug: 'evidence-map',
		}]);
		const missingRouteErrors = [];
		await validateBuildOutput(root, eligibleEntries, eligible, Object.values(eligibleEntries).flat(), missingRouteErrors);
		assert.ok(missingRouteErrors.some((error) => error.includes('has no generated page at dist/competitions/evidence-map/index.html')));

		await mkdir(path.join(dist, 'competitions/evidence-map'), { recursive: true });
		await writeFile(path.join(dist, 'competitions/evidence-map/index.html'), '<main>published evidence map</main>');
		const emittedRouteErrors = [];
		await validateBuildOutput(root, eligibleEntries, eligible, Object.values(eligibleEntries).flat(), emittedRouteErrors);
		assert.equal(emittedRouteErrors.some((error) => error.includes('has no generated page')), false);
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test('incomplete Level 2 evidence map fails readiness and cannot be published', () => {
	const fixture = level2Fixture();
	fixture.record.data.coverage = 'partial';
	fixture.record.data.reviewed_by = null;
	fixture.record.data.reviewed_at = null;
	fixture.record.data.source_ids = [];
	fixture.record.data.solution_ids = [];
	fixture.record.data.claims = [];
	fixture.record.body = '';
	const errors = validateLevel2Readiness(fixture.record, fixture);
	assert.ok(errors.some((error) => error.includes('coverage: reviewed')));
	assert.ok(errors.some((error) => error.includes('structured solution')));
	assert.ok(errors.some((error) => error.includes('bounded lesson or suggested experiment')));
	fixture.record.data.status = 'published';
	fixture.record.data.editorial_status = 'published';
	assert.equal(isPubliclyPublishable(fixture.record, fixture), false);
});

test('draft and in-review entries stay out of public content selections', () => {
	const published = {
		status: 'published',
		reviewed_by: 'Editor',
		reviewed_at: '2026-09-23',
	};
	const draft = { ...published, id: 'draft', status: 'draft' };
	const inReview = { ...published, id: 'review', status: 'in-review' };
	const ready = { ...published, id: 'ready' };
	assert.deepEqual(filterPublicContent([draft, inReview, ready]).map((entry) => entry.id), ['ready']);
	assert.equal(isPubliclyPublishable({ ...ready, reviewed_at: null }), false);
});

test('broken references report the source record and field', async () => {
	const root = await mkdtemp(path.join(os.tmpdir(), 'kaggle-bible-content-'));
	try {
		const directory = path.join(root, 'src/content/competitions');
		await mkdir(directory, { recursive: true });
		await writeFile(path.join(directory, 'competition-orphan.md'), [
			'---',
			'id: competition-orphan',
			'status: draft',
			'source_ids:',
			'  - source-missing',
			'---',
			'',
			'# Draft',
			'',
			'Unresolved marker [claim:missing-claim].',
		].join('\n'));
		const result = await checkContent(root, { report: false });
		assert.equal(result.ok, false);
		assert.ok(result.errors.some((error) => error.includes('competition-orphan.md (competition-orphan): source_ids references missing sources "source-missing"')));
		assert.ok(result.errors.some((error) => error.includes('unresolved claim marker "[claim:missing-claim]"')));
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test('published records without a review receipt fail with their file and ID', async () => {
	const root = await mkdtemp(path.join(os.tmpdir(), 'kaggle-bible-review-'));
	try {
		const directory = path.join(root, 'src/content/competitions');
		await mkdir(directory, { recursive: true });
		await writeFile(path.join(directory, 'competition-unreviewed.md'), [
			'---',
			'id: competition-unreviewed',
			'status: published',
			'reviewed_by: null',
			'reviewed_at: null',
			'---',
			'',
			'# Not reviewed',
		].join('\n'));
		const result = await checkContent(root, { report: false });
		assert.equal(result.ok, false);
		assert.ok(result.errors.some((error) => error.includes('competition-unreviewed.md (competition-unreviewed): published content needs a named reviewer')));
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test('known resource records require a supporting claim', async () => {
	const root = await mkdtemp(path.join(os.tmpdir(), 'kaggle-bible-resource-'));
	try {
		const competitions = path.join(root, 'src/content/competitions');
		const solutions = path.join(root, 'src/content/solutions');
		await mkdir(competitions, { recursive: true });
		await mkdir(solutions, { recursive: true });
		await writeFile(path.join(competitions, 'competition-resource-test.md'), [
			'---',
			'id: competition-resource-test',
			'status: draft',
			'solution_ids:',
			'  - solution-resource-test',
			'---',
			'',
			'# Resource test',
		].join('\n'));
		await writeFile(path.join(solutions, 'solution-resource-test.yaml'), [
			'id: solution-resource-test',
			'status: draft',
			'competition_id: competition-resource-test',
			'resources:',
			'  - id: training-run',
			'    basis: source-reported',
			'    claim_id: null',
		].join('\n'));
		const result = await checkContent(root, { report: false });
		assert.equal(result.ok, false);
		assert.ok(result.errors.some((error) => error.includes('resources.training-run.claim_id is required when resource basis is known')));

		await writeFile(path.join(solutions, 'solution-resource-test.yaml'), [
			'id: solution-resource-test',
			'status: draft',
			'competition_id: competition-resource-test',
			'resources:',
			'  - id: training-run',
			'    basis: unknown',
			'    claim_id: null',
		].join('\n'));
		const unknownResource = await checkContent(root, { report: false });
		assert.equal(unknownResource.ok, true, unknownResource.errors.join('\n'));
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test('completed reproductions require a run receipt and matching solution claim', async () => {
	const root = await mkdtemp(path.join(os.tmpdir(), 'kaggle-bible-reproduction-'));
	try {
		const competitions = path.join(root, 'src/content/competitions');
		const solutions = path.join(root, 'src/content/solutions');
		const reproductions = path.join(root, 'src/content/reproductions');
		await mkdir(competitions, { recursive: true });
		await mkdir(solutions, { recursive: true });
		await mkdir(reproductions, { recursive: true });
		await writeFile(path.join(competitions, 'competition-reproduction-test.md'), [
			'---',
			'id: competition-reproduction-test',
			'status: draft',
			'solution_ids:',
			'  - solution-a',
			'  - solution-b',
			'---',
			'',
			'# Reproduction test',
		].join('\n'));
		await writeFile(path.join(solutions, 'solution-a.yaml'), [
			'id: solution-a',
			'status: draft',
			'competition_id: competition-reproduction-test',
			'claims:',
			'  - id: observed-result',
			'    kind: reproduced',
			'    evidence: []',
			'    supports_claim_refs: []',
			'    reproduction_ids:',
			'      - reproduction-a',
		].join('\n'));
		await writeFile(path.join(solutions, 'solution-b.yaml'), [
			'id: solution-b',
			'status: draft',
			'competition_id: competition-reproduction-test',
			'claims: []',
		].join('\n'));
		await writeFile(path.join(reproductions, 'reproduction-a.yaml'), [
			'id: reproduction-a',
			'solution_id: solution-b',
			'status: completed',
			'claim_ids: []',
			'artifacts:',
			'  - ""',
		].join('\n'));

		const result = await checkContent(root, { report: false });
		assert.equal(result.ok, false);
		assert.ok(result.errors.some((error) => error.includes('non-empty artifact references')));
		assert.ok(result.errors.some((error) => error.includes('completed reproduction requires code.revision')));
		assert.ok(result.errors.some((error) => error.includes('must match the supporting solution and claim IDs')));

		await writeFile(path.join(reproductions, 'reproduction-a.yaml'), [
			'id: reproduction-a',
			'solution_id: solution-a',
			'status: completed',
			'code:',
			'  url: null',
			'  revision: abc123',
			'  local_changes: null',
			'  snapshot_ref: artifacts/source-code-snapshot.tar.gz',
			'data:',
			'  source_url: null',
			'  version_or_fingerprint: sha256:dataset123',
			'  split_definition: fixed validation holdout',
			'  access_requirements: null',
			'environment:',
			'  dependency_lock_or_image: lockfile hash abc123',
			'  operating_system: Linux x86_64',
			'  hardware: CPU-only',
			'  seeds: [42]',
			'command: node reproduce.mjs',
			'expected:',
			'  metric_id: auc',
			'  split: local-cv',
			'  value: 0.8',
			'  tolerance: 0.001',
			'  tolerance_rationale: rounded source-reported value',
			'observed:',
			'  value: 0.801',
			'  fold_results: [0.801]',
			'  wall_hours: null',
			'  peak_memory_gb: null',
			'claim_ids:',
			'  - observed-result',
			'artifacts:',
			'  - artifacts/source-code-snapshot.tar.gz',
			'  - artifacts/observed-result.json',
			'executed_by: test runner',
			'executed_at: 2026-09-23',
			'limitations: []',
		].join('\n'));
		const matched = await checkContent(root, { report: false });
		assert.equal(matched.ok, true, matched.errors.join('\n'));

		const completeReceipt = await readFile(path.join(reproductions, 'reproduction-a.yaml'), 'utf8');
		await writeFile(path.join(reproductions, 'reproduction-a.yaml'), completeReceipt
			.replace('  snapshot_ref: artifacts/source-code-snapshot.tar.gz\n', '')
			.replace('  - artifacts/source-code-snapshot.tar.gz\n', ''));
		const untraceableCode = await checkContent(root, { report: false });
		assert.ok(untraceableCode.errors.some((error) => error.includes('requires an HTTP(S) code.url or a code.snapshot_ref included in artifacts')));
	} finally {
		await rm(root, { recursive: true, force: true });
	}
});

test('built public output rejects a draft record ID', async () => {
	const root = await mkdtemp(path.join(os.tmpdir(), 'kaggle-bible-build-'));
	const previous = process.env.CHECK_BUILT_CONTENT;
	try {
		const records = path.join(root, 'src/content/competitions');
		const dist = path.join(root, 'dist');
		await mkdir(records, { recursive: true });
		await mkdir(path.join(dist, 'data'), { recursive: true });
		await writeFile(path.join(records, 'competition-hidden.md'), [
			'---',
			'id: competition-hidden',
			'status: draft',
			'slug: hidden-guide',
			'kaggle_slug: hidden-guide',
			'---',
			'',
			'# Hidden draft',
		].join('\n'));
		await writeFile(path.join(dist, 'index.html'), '<p>competition-hidden</p>');
		await writeCatalog(dist);
		process.env.CHECK_BUILT_CONTENT = '1';
		const result = await checkContent(root, { report: false });
		assert.equal(result.ok, false);
		assert.ok(result.errors.some((error) => error.includes('non-published record ID appears in the built public output')));
	} finally {
		if (previous === undefined) delete process.env.CHECK_BUILT_CONTENT;
		else process.env.CHECK_BUILT_CONTENT = previous;
		await rm(root, { recursive: true, force: true });
	}
});

test('built public output rejects draft titles and body text without record IDs', async () => {
	const root = await mkdtemp(path.join(os.tmpdir(), 'kaggle-bible-build-text-'));
	const previous = process.env.CHECK_BUILT_CONTENT;
	try {
		const records = path.join(root, 'src/content/competitions');
		const dist = path.join(root, 'dist');
		await mkdir(records, { recursive: true });
		await mkdir(path.join(dist, 'data'), { recursive: true });
		await writeFile(path.join(records, 'competition-private-guide.md'), [
			'---',
			'id: competition-private-guide',
			'status: draft',
			'title: Unpublished Pilot Evidence Guide',
			'summary: A unique unpublished summary about applicant history and validation boundaries.',
			'slug: private-guide',
			'kaggle_slug: private-guide',
			'---',
			'',
			'# Private draft',
			'',
			'This distinctive paragraph describes a private validation procedure that must not appear in the public website output.',
		].join('\n'));
		await writeCatalog(dist);
		process.env.CHECK_BUILT_CONTENT = '1';

		await writeFile(path.join(dist, 'index.html'), '<h2>Unpublished Pilot Evidence Guide</h2>');
		const titleResult = await checkContent(root, { report: false });
		assert.ok(titleResult.errors.some((error) => error.includes('non-published title appears')));

		await writeFile(path.join(dist, 'index.html'), '<p>This distinctive paragraph describes a private validation procedure that must not appear in the public website output.</p>');
		const bodyResult = await checkContent(root, { report: false });
		assert.ok(bodyResult.errors.some((error) => error.includes('non-published body paragraph')));
	} finally {
		if (previous === undefined) delete process.env.CHECK_BUILT_CONTENT;
		else process.env.CHECK_BUILT_CONTENT = previous;
		await rm(root, { recursive: true, force: true });
	}
});

test('built public output rejects short draft titles, claims, and fenced code text', async () => {
	const root = await mkdtemp(path.join(os.tmpdir(), 'kaggle-bible-build-short-text-'));
	const previous = process.env.CHECK_BUILT_CONTENT;
	try {
		const records = path.join(root, 'src/content/competitions');
		const dist = path.join(root, 'dist');
		await mkdir(records, { recursive: true });
		await mkdir(path.join(dist, 'data'), { recursive: true });
		await writeFile(path.join(records, 'competition-hidden-short.md'), [
			'---',
			'id: competition-hidden-short',
			'status: draft',
			'title: CatBoost',
			'summary: Secret summary',
			'claims:',
			'  - id: private-claim',
			'    kind: editorial-inference',
			'    statement: LightGBM',
			'slug: hidden-short',
			'kaggle_slug: hidden-short',
			'---',
			'',
			'```text',
			'XGBoost',
			'```',
		].join('\n'));
		await writeFile(path.join(dist, 'index.html'), [
			'<meta name="description" content="Secret summary">',
			'<h1>CatBoost</h1>',
			'<p>LightGBM</p>',
			'<pre><code>XGBoost</code></pre>',
		].join('\n'));
		await writeCatalog(dist);
		process.env.CHECK_BUILT_CONTENT = '1';

		const result = await checkContent(root, { report: false });
		assert.ok(result.errors.some((error) => error.includes('non-published title appears')));
		assert.ok(result.errors.some((error) => error.includes('non-published summary appears')));
		assert.ok(result.errors.some((error) => error.includes('non-published claim private-claim appears')));
		assert.ok(result.errors.some((error) => error.includes('non-published body paragraph')));

		await writeFile(path.join(dist, 'index.html'), [
			'<meta name="description" content="Secret summary was included in this public snippet">',
			'<p>LightGBM was used to select the model.</p>',
			'<pre><code>Diagnostics: XGBoost was selected.</code></pre>',
		].join('\n'));
		const embeddedResult = await checkContent(root, { report: false });
		assert.ok(embeddedResult.errors.some((error) => error.includes('non-published summary appears')));
		assert.ok(embeddedResult.errors.some((error) => error.includes('non-published claim private-claim appears')));
		assert.ok(embeddedResult.errors.some((error) => error.includes('non-published body paragraph')));
	} finally {
		if (previous === undefined) delete process.env.CHECK_BUILT_CONTENT;
		else process.env.CHECK_BUILT_CONTENT = previous;
		await rm(root, { recursive: true, force: true });
	}
});

test('built catalog validation rejects rows missing the required schema', async () => {
	const root = await mkdtemp(path.join(os.tmpdir(), 'kaggle-bible-catalog-schema-'));
	const previous = process.env.CHECK_BUILT_CONTENT;
	try {
		const dist = path.join(root, 'dist');
		await mkdir(path.join(dist, 'data'), { recursive: true });
		await writeFile(path.join(dist, 'index.html'), '<main>built</main>');
		await writeFile(path.join(dist, 'data/competition-catalog.json'), '[{}]');
		process.env.CHECK_BUILT_CONTENT = '1';

		const result = await checkContent(root, { report: false });
		assert.ok(result.errors.some((error) => error.includes('row 1 is missing required string "id"')));
		assert.ok(result.errors.some((error) => error.includes('row 1 is missing required string "record_state"')));

		await writeCatalog(dist, [{ ...validCatalogRow(), title: '' }]);
		const blankTitle = await checkContent(root, { report: false });
		assert.ok(blankTitle.errors.some((error) => error.includes('row 1 requires a non-empty "title"')));
	} finally {
		if (previous === undefined) delete process.env.CHECK_BUILT_CONTENT;
		else process.env.CHECK_BUILT_CONTENT = previous;
		await rm(root, { recursive: true, force: true });
	}
});

test('built catalog fills missing source titles from stable competition slugs', () => {
	const rows = normalizeCatalogTitles([
		{ id: '1', slug: 'untitled-competition', title: '' },
		{ id: '2', slug: 'named-competition', title: 'Named Competition' },
	]);
	assert.equal(rows[0].title, 'untitled-competition');
	assert.equal(rows[1].title, 'Named Competition');
});

test('built-output validation fails when the build or catalog asset is missing', async () => {
	const root = await mkdtemp(path.join(os.tmpdir(), 'kaggle-bible-build-missing-'));
	const previous = process.env.CHECK_BUILT_CONTENT;
	try {
		process.env.CHECK_BUILT_CONTENT = '1';
		const noBuild = await checkContent(root, { report: false });
		assert.ok(noBuild.errors.some((error) => error.includes('build output is missing')));

		const dist = path.join(root, 'dist');
		await mkdir(path.join(dist, 'data'), { recursive: true });
		await writeFile(path.join(dist, 'index.html'), '<main>built</main>');
		const noCatalog = await checkContent(root, { report: false });
		assert.ok(noCatalog.errors.some((error) => error.includes('required catalog asset is missing or invalid')));

		await writeCatalog(dist, []);
		const emptyCatalog = await checkContent(root, { report: false });
		assert.ok(emptyCatalog.errors.some((error) => error.includes('catalog must contain at least one competition row')));
	} finally {
		if (previous === undefined) delete process.env.CHECK_BUILT_CONTENT;
		else process.env.CHECK_BUILT_CONTENT = previous;
		await rm(root, { recursive: true, force: true });
	}
});
