import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
	catalogGuideMatchesRecord,
	getCatalogCardPresentation,
	readCatalogFilters,
	serializeCatalogFilters,
} from '../src/content/catalog-policy.js';

test('unreviewed guide metadata never upgrades a catalog card or exposes a guide link', () => {
	for (const editorialStatus of ['queued', 'in-progress', 'in-review']) {
		assert.deepEqual(
			getCatalogCardPresentation({
				completeness_level: '2',
				completeness_label: 'evidence-map',
				editorial_status: editorialStatus,
				guide_slug: 'home-credit-default-risk',
			}),
			{ completenessLevel: '1', completenessLabel: 'Catalog', guideHref: null },
		);
	}
});

test('Level 2 and Level 3 appear only for published entries with a guide route', () => {
	assert.deepEqual(
		getCatalogCardPresentation({
			completeness_level: '2',
			editorial_status: 'published',
			guide_slug: 'home-credit-default-risk',
			reviewed_by: 'GPT-6 Luna Max',
			reviewed_at: '2026-09-23',
			editorial_approval_type: 'human',
			editorial_approved_by: 'Independent editor',
			editorial_approved_at: '2026-09-23',
		}),
		{
			completenessLevel: '2',
			completenessLabel: 'Evidence map',
			guideHref: '/competitions/home-credit-default-risk/',
		},
	);
	assert.deepEqual(
		getCatalogCardPresentation({
			completeness_level: '3',
			editorial_status: 'published',
			guide_slug: 'm5-forecasting-accuracy',
			reviewed_by: 'GPT-6 Luna Max',
			reviewed_at: '2026-09-23',
			editorial_approval_type: 'human',
			editorial_approved_by: 'Independent editor',
			editorial_approved_at: '2026-09-23',
		}),
		{
			completenessLevel: '3',
			completenessLabel: 'Full guide',
			guideHref: '/competitions/m5-forecasting-accuracy/',
		},
	);
});

test('missing guide route keeps even a published Level 2 entry at Guide pending', () => {
	assert.deepEqual(
		getCatalogCardPresentation({
			completeness_level: '2',
			editorial_status: 'published',
			guide_slug: '',
	}),
	{ completenessLevel: '1', completenessLabel: 'Catalog', guideHref: null },
	);
});

test('model review metadata alone cannot publish an evidence guide in the catalog', () => {
	for (const receipt of [
		{},
		{ reviewed_by: 'GPT-6 Luna Max', reviewed_at: '2026-09-23' },
		{ editorial_approval_type: 'model', editorial_approved_by: 'GPT-6 Luna Max', editorial_approved_at: '2026-09-23' },
		{ editorial_approval_type: 'human', editorial_approved_by: ' ', editorial_approved_at: '2026-09-23' },
		{ editorial_approval_type: 'human', editorial_approved_by: 'Editor', editorial_approved_at: '2026-02-30' },
		{ editorial_approval_type: 'human', editorial_approved_by: 'Editor', editorial_approved_at: '2026-09-23T00:00:00Z' },
	]) {
		assert.deepEqual(
			getCatalogCardPresentation({
				completeness_level: '2',
				editorial_status: 'published',
				guide_slug: 'home-credit-default-risk',
				...receipt,
			}),
			{ completenessLevel: '1', completenessLabel: 'Catalog', guideHref: null },
		);
	}
});

test('catalog guide mapping must match the exact Meta Kaggle competition identity', () => {
	const homeCreditRow = { id: '9120', slug: 'home-credit-default-risk', guide_slug: 'home-credit-default-risk' };
	const homeCreditGuide = { meta_kaggle_id: '9120', kaggle_slug: 'home-credit-default-risk', slug: 'home-credit-default-risk' };
	const m5Row = { id: '18599', slug: 'm5-forecasting-accuracy', guide_slug: 'm5-forecasting-accuracy' };
	const m5Guide = { meta_kaggle_id: '18599', kaggle_slug: 'm5-forecasting-accuracy', slug: 'm5-forecasting-accuracy' };

	assert.equal(catalogGuideMatchesRecord(homeCreditRow, homeCreditGuide), true);
	assert.equal(catalogGuideMatchesRecord(m5Row, m5Guide), true);
	assert.equal(catalogGuideMatchesRecord({ ...homeCreditRow, guide_slug: m5Row.guide_slug }, m5Guide), false);
	assert.equal(catalogGuideMatchesRecord({ ...m5Row, id: homeCreditRow.id }, m5Guide), false);
	assert.equal(catalogGuideMatchesRecord({ ...homeCreditRow, slug: m5Row.slug }, homeCreditGuide), false);
});

test('catalog filters restore from and round-trip to shareable URLs', () => {
	const filters = readCatalogFilters('?q=WRMSSE+validation&category=Featured&state=closed&level=2');
	assert.deepEqual(filters, {
		query: 'WRMSSE validation',
		category: 'Featured',
		state: 'closed',
		level: '2',
	});
	assert.equal(serializeCatalogFilters(filters), 'q=WRMSSE+validation&category=Featured&state=closed&level=2');
	assert.equal(serializeCatalogFilters({ query: '  ', category: '', state: '', level: '' }), '');
});

test('the catalog page uses the shared publication and URL filter policies', async () => {
	const page = await readFile(new URL('../src/pages/competitions/index.astro', import.meta.url), 'utf8');
	assert.match(page, /getCatalogCardPresentation\(competition\)/);
	assert.match(page, /readCatalogFilters\(window\.location\.search\)/);
	assert.match(page, /serializeCatalogFilters\(/);
});
