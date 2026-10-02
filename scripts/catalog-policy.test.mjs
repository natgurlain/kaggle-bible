import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
	catalogGuideMatchesRecord,
	getCatalogCardPresentation,
	readCatalogFilters,
	serializeCatalogFilters,
    serializeCatalogState,
    usesArchiveView,
    filterCatalog,
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

test('published evidence guides require valid evidence-review metadata', () => {
	for (const receipt of [
		{},
		{ reviewed_by: 'GPT-6 Luna Max', reviewed_at: '' },
		{ reviewed_by: 'GPT-6 Luna Max', reviewed_at: '2026-02-30' },
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
	assert.match(page, /serializeCatalogState\(/);
});

const publishedTitanic = {
 id: '1', title: 'Titanic', slug: 'titanic', category: 'Getting Started', record_state: 'active',
 completeness_level: '2', editorial_status: 'published', guide_slug: 'titanic',
 reviewed_by: 'GPT-6 Luna Max', reviewed_at: '2026-10-01',
};
const rows = [publishedTitanic,
 {...publishedTitanic, id: '2', title: 'Titanic archive', editorial_status: 'queued'},
 {...publishedTitanic, id: '3', title: 'Titanic draft', editorial_status: 'in-review'},
 {...publishedTitanic, id: '4', title: 'House Prices', slug: 'house-prices', guide_slug: 'house-prices'},
];

test('typing, filtering and clearing never widen available-guide scope', () => {
 for (const query of ['T', 'Ti', 'Tit', 'Titanic', '']) {
  const filters = {query, category: '', state: '', level: ''};
  const url = serializeCatalogState(filters, false);
  assert.equal(usesArchiveView(url), false);
  const restored = readCatalogFilters(url);
  assert.deepEqual(filterCatalog(rows, restored, usesArchiveView(url)).map(row=>row.id), query ? ['1'] : ['1', '4']);
 }
 for (const search of ['?category=Getting+Started', '?state=active', '?level=2', '?page=2&q=Titanic']) {
  assert.equal(usesArchiveView(search), false);
 }
});

test('only an explicit archive action widens scope and retains filters', () => {
 const filters = {query:'Titanic', category:'Getting Started', state:'active', level:''};
 const url = serializeCatalogState(filters, true, 2);
 assert.equal(usesArchiveView(url), true);
 assert.equal(new URLSearchParams(url).get('page'), '2');
 assert.deepEqual(readCatalogFilters(url), filters);
 assert.deepEqual(filterCatalog(rows, readCatalogFilters(url), true).map(row=>row.id), ['1', '2', '3']);
 assert.equal(new URLSearchParams(serializeCatalogState(filters, false, 2)).has('page'), false);
 assert.deepEqual(filterCatalog(rows, {...filters, level:'2'}, true).map(row=>row.id), ['1']);
});

test('guide-empty results remain empty until archive is explicitly selected', () => {
 const archiveOnly = {...publishedTitanic, title:'Unpublished lesson', editorial_status:'draft'};
 const filters = {query:'Unpublished', category:'', state:'', level:''};
 assert.deepEqual(filterCatalog([archiveOnly], filters, false), []);
 assert.deepEqual(filterCatalog([archiveOnly], filters, true), [archiveOnly]);
});
