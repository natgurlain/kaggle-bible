/** Compact positional payload; canonical full records remain available separately. */
export const discoveryColumns = ['id','slug','title','subtitle','competition_url','category','record_state','metric_abbreviation','metric_name','completeness_level','completeness_label','editorial_status','guide_slug','reviewed_by','reviewed_at','deadline_at'];
export function compactCatalog(rows, snapshotDate) {
 return {schema_version:1,snapshot_date:snapshotDate,columns:discoveryColumns,rows:rows.map(row=>discoveryColumns.map(key=>row[key] ?? ''))};
}
export function expandCatalog(payload) {
 if (payload.schema_version !== 1 || !Array.isArray(payload.rows) || payload.columns.join('|') !== discoveryColumns.join('|')) throw new Error('Unsupported discovery index');
 return payload.rows.map(row=>Object.fromEntries(payload.columns.map((key,index)=>[key,row[index]])));
}
export function paginateCatalog(rows, requestedPage, size = 100) {
 const pages = Math.max(1, Math.ceil(rows.length / size));
 const page = Math.min(pages, Math.max(1, Math.floor(Number(requestedPage)) || 1));
 const start = (page - 1) * size;
 return {page,pages,start,visible:rows.slice(start,start+size)};
}
