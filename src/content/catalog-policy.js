const completenessLabels = Object.freeze({
	'1': 'Catalog',
	'2': 'Evidence map',
	'3': 'Full guide',
});

export function getCatalogCardPresentation(competition) {
	const level = String(competition?.completeness_level ?? '');
	const guideSlug = typeof competition?.guide_slug === 'string'
		? competition.guide_slug.trim()
		: '';

	if (competition?.editorial_status !== 'published' || !['2', '3'].includes(level) || !guideSlug) {
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
