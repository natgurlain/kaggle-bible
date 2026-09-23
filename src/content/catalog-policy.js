const completenessLabels = Object.freeze({
	'1': 'Catalog',
	'2': 'Evidence map',
	'3': 'Full guide',
});

function hasCatalogReviewReceipt(competition) {
	const reviewer = typeof competition?.reviewed_by === 'string' ? competition.reviewed_by.trim() : '';
	const reviewedAt = typeof competition?.reviewed_at === 'string' ? competition.reviewed_at : '';
	if (!reviewer || !/^\d{4}-\d{2}-\d{2}$/.test(reviewedAt)) return false;
	const date = new Date(reviewedAt + 'T00:00:00Z');
	return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === reviewedAt;
}

export function catalogGuideMatchesRecord(row, guide) {
	const catalogId = String(row?.id ?? '').trim();
	const guideId = String(guide?.meta_kaggle_id ?? '').trim();
	const catalogSlug = typeof row?.slug === 'string' ? row.slug.trim() : '';
	const guideKaggleSlug = typeof guide?.kaggle_slug === 'string' ? guide.kaggle_slug.trim() : '';
	const guideSlug = typeof row?.guide_slug === 'string' ? row.guide_slug.trim() : '';
	const recordSlug = typeof guide?.slug === 'string' ? guide.slug.trim() : '';
	return Boolean(catalogId && guideId && catalogSlug && guideKaggleSlug && guideSlug && recordSlug)
		&& catalogId === guideId
		&& catalogSlug === guideKaggleSlug
		&& guideSlug === recordSlug;
}

export function getCatalogCardPresentation(competition) {
	const level = String(competition?.completeness_level ?? '');
	const guideSlug = typeof competition?.guide_slug === 'string'
		? competition.guide_slug.trim()
		: '';

	if (competition?.editorial_status !== 'published' || !['2', '3'].includes(level) || !guideSlug || !hasCatalogReviewReceipt(competition)) {
		return {
			completenessLevel: '1',
			completenessLabel: completenessLabels['1'],
			guideHref: null,
		};
	}

	return {
		completenessLevel: level,
		completenessLabel: completenessLabels[level],
		guideHref: `/competitions/${encodeURIComponent(guideSlug)}/`,
	};
}

export function readCatalogFilters(search) {
	const params = new URLSearchParams(search);
	return {
		query: params.get('q') ?? '',
		category: params.get('category') ?? '',
		state: params.get('state') ?? '',
		level: params.get('level') ?? '',
	};
}

export function serializeCatalogFilters(filters) {
	const params = new URLSearchParams();
	if (filters.query?.trim()) params.set('q', filters.query.trim());
	if (filters.category) params.set('category', filters.category);
	if (filters.state) params.set('state', filters.state);
	if (filters.level) params.set('level', filters.level);
	return params.toString();
}
