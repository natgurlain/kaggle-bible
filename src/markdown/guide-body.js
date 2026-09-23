export function removeMatchingLeadingTitle(markdown, title) {
	const lines = markdown.split(/\r?\n/);
	const firstContentLine = lines.findIndex((line) => line.trim() !== '');
	if (firstContentLine < 0) return markdown;

	const heading = lines[firstContentLine].trim().match(/^#\s+(.*)$/);
	if (!heading) return markdown;
	const headingText = heading[1].replace(/\s+#+\s*$/, '').trim();
	if (headingText !== title.trim()) return markdown;

	lines.splice(firstContentLine, 1);
	return lines.join('\n');
}
