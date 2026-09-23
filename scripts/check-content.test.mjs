import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkContent } from './check-content.mjs';
import {
	filterPublicContent,
	isPubliclyPublishable,
	validateLevel2Readiness,
} from '../src/content/publication-policy.js';

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

test('complete Level 2 evidence map passes readiness checks', () => {
	const fixture = level2Fixture();
	assert.deepEqual(validateLevel2Readiness(fixture.record, fixture), []);
	fixture.record.data.status = 'published';
	fixture.record.data.editorial_status = 'published';
	assert.equal(isPubliclyPublishable(fixture.record, fixture), true);
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
		].join('\n'));
		const result = await checkContent(root, { report: false });
		assert.equal(result.ok, false);
		assert.ok(result.errors.some((error) => error.includes('competition-orphan.md (competition-orphan): source_ids references missing sources "source-missing"')));
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

test('reproduced claims require a non-empty artifact and matching solution claim', async () => {
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
		assert.ok(result.errors.some((error) => error.includes('must match the supporting solution and claim IDs')));

		await writeFile(path.join(reproductions, 'reproduction-a.yaml'), [
			'id: reproduction-a',
			'solution_id: solution-a',
			'status: completed',
			'claim_ids:',
			'  - observed-result',
			'artifacts:',
			'  - artifacts/observed-result.json',
		].join('\n'));
		const matched = await checkContent(root, { report: false });
		assert.equal(matched.ok, true, matched.errors.join('\n'));
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
		await writeFile(path.join(dist, 'data/competition-catalog.json'), '[]');
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
		await writeFile(path.join(dist, 'data/competition-catalog.json'), '[]');
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

test('built-output validation fails when the build or catalog asset is missing', async () => {
	const root = await mkdtemp(path.join(os.tmpdir(), 'kaggle-bible-build-missing-'));
	const previous = process.env.CHECK_BUILT_CONTENT;
	try {
		process.env.CHECK_BUILT_CONTENT = '1';
		const noBuild = await checkContent(root, { report: false });
		assert.ok(noBuild.errors.some((error) => error.includes('build output is missing')));

		const dist = path.join(root, 'dist');
		await mkdir(dist, { recursive: true });
		await writeFile(path.join(dist, 'index.html'), '<main>built</main>');
		const noCatalog = await checkContent(root, { report: false });
		assert.ok(noCatalog.errors.some((error) => error.includes('required catalog asset is missing or invalid')));
	} finally {
		if (previous === undefined) delete process.env.CHECK_BUILT_CONTENT;
		else process.env.CHECK_BUILT_CONTENT = previous;
		await rm(root, { recursive: true, force: true });
	}
});
