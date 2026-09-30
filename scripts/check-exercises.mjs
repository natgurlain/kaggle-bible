import { readdir,readFile,access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { parse } from 'yaml';
import { exerciseReceiptErrors } from '../src/content/exercise-policy.js';
const folder='src/content/exercises'; const ids=new Set(); const slugs=new Set(); let count=0;
for (const name of (await readdir(folder)).filter(x=>x.endsWith('.json'))) {
 const data=JSON.parse(await readFile(`${folder}/${name}`,'utf8'));
 if (ids.has(data.id) || slugs.has(data.slug) || name!==`${data.id}.json`) throw new Error(`${name}: exercise identity duplicated or filename mismatched`);
 ids.add(data.id);slugs.add(data.slug);
 if(data.status!=='published') continue;
 for (const [field,suffix] of [['script_path','\\.py'],['receipt_path','-receipt\\.json']]) if(!new RegExp(`^/exercises/[a-z0-9-]+${suffix}$`).test(data[field]??'')) throw new Error(`${name}: unsafe asset path`);
 const parent=parse((await readFile(`src/content/competitions/${data.competition_id}.md`,'utf8')).split('---')[1]);
 if(parent.status!=='published' || parent.kaggle_bible_completeness_level<2 || !parent.reviewed_by || !parent.reviewed_at) throw new Error(`${name}: parent guide is not reviewed and published`);
 const script=await readFile(`public${data.script_path}`); const receipt=JSON.parse(await readFile(`public${data.receipt_path}`,'utf8'));
 const errors=exerciseReceiptErrors(data,receipt,createHash('sha256').update(script).digest('hex'));
 if(errors.length) throw new Error(`${name}: ${errors.join('; ')}`);
 if(process.env.CHECK_BUILT_CONTENT==='1') {
  await access(`dist/competitions/${parent.slug}/index.html`);
  for(const asset of [data.script_path,data.receipt_path]) await access(`dist${asset}`);
 }
 count++;
}
console.log(`Exercise checks passed: ${count} published execution receipts checked.`);
