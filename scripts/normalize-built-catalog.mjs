import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function normalizeCatalogTitles(rows) {
	if (!Array.isArray(rows)) throw new Error('Competition catalog must be a JSON array');
	return rows.map((row) => {
		if (!row || typeof row !== 'object' || Array.isArray(row)) return row;
		if (typeof row.title === 'string' && row.title.trim()) return row;
		return { ...row, title: typeof row.slug === 'string' ? row.slug.trim() : '' };
	});
}

export async function normalizeBuiltCatalog(root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')) {
	const catalogPath = path.join(root, 'dist', 'data', 'competition-catalog.json');
	const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
	const normalized = normalizeCatalogTitles(catalog);
	await writeFile(catalogPath, `${JSON.stringify(normalized)}\n`);
	return normalized;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	await normalizeBuiltCatalog();
}
