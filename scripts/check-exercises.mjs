import { readdir,readFile,access } from 'node:fs/promises';
import { parse } from 'yaml';
import { exerciseReceiptErrors, projectContractErrors } from '../src/content/exercise-policy.js';
import { loadExerciseArtifacts } from '../src/content/project-artifacts.js';
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
const folder='src/content/exercises'; const ids=new Set(); const slugs=new Set(); let count=0; let receiptCount=0; let actualCount=0;
for (const name of (await readdir(folder)).filter(x=>x.endsWith('.json'))) {
 const data=JSON.parse(await readFile(`${folder}/${name}`,'utf8'));
 if (ids.has(data.id) || slugs.has(data.slug) || name!==`${data.id}.json`) throw new Error(`${name}: exercise identity duplicated or filename mismatched`);
 ids.add(data.id);slugs.add(data.slug);
 if(data.status!=='published') {
  const {receipt,artifacts}=data.project && ['runnable','actual-data-verified'].includes(data.project.readiness) ? await loadExerciseArtifacts(data) : {receipt:null,artifacts:{}};
  const errors=projectContractErrors(data,receipt,artifacts);
  if(errors.length) throw new Error(`${name}: ${errors.join('; ')}`);
  continue;
 }
 for (const [field,suffix] of [['script_path','\\.py'],['receipt_path','-receipt\\.json'],['data_path','-data\\.json']]) if(data[field]!==undefined && !new RegExp(`^/exercises/[a-z0-9-]+${suffix}$`).test(data[field]??'')) throw new Error(`${name}: unsafe asset path`);
 const parent=competitions.get(data.competition_id);
 if(!parent || parent.data.kaggle_bible_completeness_level<2 || !isPubliclyPublishable(parent,context)) throw new Error(`${name}: parent guide is not publicly publishable`);
 const {receipt,artifacts}=await loadExerciseArtifacts(data);
 const errors=projectContractErrors(data,receipt,artifacts);
 if(receipt) errors.push(...exerciseReceiptErrors(data,receipt,artifacts.script_sha256,artifacts.data_sha256));
 else if(!data.project || data.project.readiness==='actual-data-verified') errors.push('execution receipt is missing');
 if(errors.length) throw new Error(`${name}: ${errors.join('; ')}`);
 if(process.env.CHECK_BUILT_CONTENT==='1') {
  await access(`dist/competitions/${parent.data.slug}/index.html`);
  if(data.project?.next_lesson?.url) await access(`dist${data.project.next_lesson.url.split('#')[0].replace(/\/$/,'')}/index.html`);
  const paths=[data.script_path,data.receipt_path,data.data_path,data.project?.package?.notebook_path,data.project?.package?.environment_path,data.project?.package?.helper_path,...(receipt?.diagnostics ?? []).map(row=>row.path)].filter(Boolean);
  if(!data.project || ['runnable','actual-data-verified'].includes(data.project.readiness)) for(const asset of paths) await access(`dist${asset}`);
 }
 count++; if(receipt) receiptCount++; if(data.project?.readiness==='actual-data-verified') actualCount++;
}
console.log(`Exercise checks passed: ${count} published projects, ${receiptCount} execution receipts, ${actualCount} actual-data verified.`);
