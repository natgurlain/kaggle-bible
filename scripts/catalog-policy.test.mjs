import assert from 'node:assert/strict';
import test from 'node:test';
import {
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

test('catalog filters restore directly from a shared URL and round-trip without empty facets', () => {
	const filters = readCatalogFilters('?q=WRMSSE+validation&category=Featured&state=closed&level=2');
	assert.deepEqual(filters, {
		query: 'WRMSSE validation',
		category: 'Featured',
		state: 'closed',
		level: '2',
	});
	assert.equal(serializeCatalogFilters(filters), 'q=WRMSSE+validation&category=Featured&state=closed&level=2');
});

test('empty catalog filters serialize to no query string', () => {
	assert.equal(serializeCatalogFilters({ query: '  ', category: '', state: '', level: '' }), '');
});
