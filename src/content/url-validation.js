/** @param {string} value */
export function isHttpUrl(value) {
	if (typeof value !== 'string') return false;
	try {
		const protocol = new URL(value).protocol;
		return protocol === 'http:' || protocol === 'https:';
	} catch {
		return false;
	}
}
