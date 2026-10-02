import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { compactCatalog, expandCatalog, paginateCatalog } from '../src/content/discovery-index.js';
import { getCatalogCardPresentation, usesArchiveView } from '../src/content/catalog-policy.js';
test('compact archive preserves every identity and publication decision while reducing payload', async () => {
 const source = await readFile(new URL('../public/data/competition-catalog.json',import.meta.url),'utf8');
 const rows = JSON.parse(source); const compact = compactCatalog(rows,'2026-09-22'); const restored = expandCatalog(compact);
 assert.equal(restored.length,12296);
 assert.deepEqual(restored.map(row=>row.id),rows.map(row=>row.id));
 assert.deepEqual(restored.map(getCatalogCardPresentation),rows.map(getCatalogCardPresentation));
 assert.ok(Buffer.byteLength(JSON.stringify(compact)) < Buffer.byteLength(source) * .6);
 assert.throws(()=>expandCatalog({...compact,schema_version:2}));
});
test('pagination reaches the final record without gaps, clamps page, and handles empty results', () => {
 const rows = Array.from({length:12296},(_,id)=>({id})); const all=[];
 for(let page=1;page<=123;page++) all.push(...paginateCatalog(rows,page).visible);
 assert.deepEqual(all,rows);
 assert.equal(paginateCatalog(rows,99999).page,123);
 assert.equal(paginateCatalog(rows,-1).page,1);
 assert.equal(paginateCatalog(rows,'nonsense').page,1);
 assert.deepEqual(paginateCatalog([],100),{page:1,pages:1,start:0,visible:[]});
});
test('filter links preserve guide scope unless the archive view is explicit',()=>{
 assert.equal(usesArchiveView(''),false);
 for(const search of ['?level=1','?level=2','?level=3','?q=Home+Credit','?category=Featured','?state=active']) assert.equal(usesArchiveView(search),false,search);
 for(const search of ['?view=all','?view=all&level=3','?q=Titanic&view=all']) assert.equal(usesArchiveView(search),true,search);
});
