const marker = /\[claim:([a-z0-9]+(?:-[a-z0-9]+)*)\]/g;
const markerText = /\[claim:[a-z0-9]+(?:-[a-z0-9]+)*\]/;

function linkifyText(value) {
	const nodes = [];
	let lastIndex = 0;
	for (const match of value.matchAll(marker)) {
		if (match.index > lastIndex) {
			nodes.push({ type: 'text', value: value.slice(lastIndex, match.index) });
		}
		nodes.push({
			type: 'link',
			url: `#evidence-${match[1]}`,
			data: { hProperties: { className: ['claim-reference'], 'aria-label': `View evidence for ${match[1]}` } },
			children: [{ type: 'text', value: 'View evidence' }],
		});
		lastIndex = match.index + match[0].length;
	}
	if (lastIndex === 0) return null;
	if (lastIndex < value.length) nodes.push({ type: 'text', value: value.slice(lastIndex) });
	return nodes;
}

function transformInline(node) {
	if (node.type === 'link' || node.type === 'linkReference' || node.type === 'inlineCode') return [node];
	if (node.type === 'text') return linkifyText(node.value) ?? [node];
	if (!Array.isArray(node.children)) return [node];
	return [{ ...node, children: node.children.flatMap(transformInline) }];
}

function containsClaimMarker(node) {
	if (node.type === 'link' || node.type === 'linkReference' || node.type === 'inlineCode') return false;
	if (node.type === 'text') return markerText.test(node.value);
	return Array.isArray(node.children) && node.children.some(containsClaimMarker);
}

export default {
	name: 'claim-reference-links',
	paragraph(node) {
		if (!node.children.some(containsClaimMarker)) return;
		return { ...node, children: node.children.flatMap(transformInline) };
	},
};
