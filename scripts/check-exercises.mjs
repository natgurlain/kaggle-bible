import { readdir,readFile,access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { parse } from 'yaml';
import { exerciseReceiptErrors } from '../src/content/exercise-policy.js';
import { isPubliclyPublishable } from '../src/content/publication-policy.js';
async function records(collection,extension) {
 const entries=[];
 for(const name of (await readdir(`src/content/${collection}`)).filter(x=>x.endsWith(extension))) {
  const raw=await readFile(`src/content/${collection}/${name}`,'utf8');
  const match=extension==='.md' ? raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)/) : null;
  const data=parse(match ? match[1] : raw); entries.push([data.id,{id:data.id,data,body:match?.[2] ?? ''}]);
 }
 return new Map(entries);
}
const [competitions,solutions,sources,practices]=await Promise.all([records('competitions','.md'),records('solutions','.yaml'),records('sources','.yaml'),records('practices','.md')]);
const context={solutions,sources,practices};
const folder='src/content/exercises'; const ids=new Set(); const slugs=new Set(); let count=0;
for (const name of (await readdir(folder)).filter(x=>x.endsWith('.json'))) {
 const data=JSON.parse(await readFile(`${folder}/${name}`,'utf8'));
 if (ids.has(data.id) || slugs.has(data.slug) || name!==`${data.id}.json`) throw new Error(`${name}: exercise identity duplicated or filename mismatched`);
 ids.add(data.id);slugs.add(data.slug);
 if(data.status!=='published') continue;
 for (const [field,suffix] of [['script_path','\\.py'],['receipt_path','-receipt\\.json'],['data_path','-data\\.json']]) if(!new RegExp(`^/exercises/[a-z0-9-]+${suffix}$`).test(data[field]??'')) throw new Error(`${name}: unsafe asset path`);
 const parent=competitions.get(data.competition_id);
 if(!parent || parent.data.kaggle_bible_completeness_level<2 || !isPubliclyPublishable(parent,context)) throw new Error(`${name}: parent guide is not publicly publishable`);
 const script=await readFile(`public${data.script_path}`); const input=await readFile(`public${data.data_path}`); const receipt=JSON.parse(await readFile(`public${data.receipt_path}`,'utf8'));
 const errors=exerciseReceiptErrors(data,receipt,createHash('sha256').update(script).digest('hex'),createHash('sha256').update(input).digest('hex'));
 if(errors.length) throw new Error(`${name}: ${errors.join('; ')}`);
 if(process.env.CHECK_BUILT_CONTENT==='1') {
  await access(`dist/competitions/${parent.data.slug}/index.html`);
  for(const asset of [data.script_path,data.receipt_path,data.data_path]) await access(`dist${asset}`);
 }
 count++;
}
console.log(`Exercise checks passed: ${count} published execution receipts checked.`);
