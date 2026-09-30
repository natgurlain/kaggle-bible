import { getCollection, type CollectionEntry } from 'astro:content';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { filterPublicGuides, filterPublicContent } from './publication-policy.js';
import { exerciseReceiptErrors } from './exercise-policy.js';

export async function learningLibrary() {
 const [competitions,solutions,sources,practices,exercises] = await Promise.all([getCollection('competitions'),getCollection('solutions'),getCollection('sources'),getCollection('practices'),getCollection('exercises')]);
 const context={solutions:new Map(solutions.map(x=>[x.id,x])),sources:new Map(sources.map(x=>[x.id,x])),practices:new Map(practices.map(x=>[x.id,x]))};
 const guides:CollectionEntry<'competitions'>[]=filterPublicGuides(competitions,context);
 const guideIds=new Set(guides.map(x=>x.id));
 const publishedExercises=await Promise.all(exercises.filter(x=>x.data.status==='published').map(async entry=>{
  if(!guideIds.has(entry.data.competition_id.id)) throw new Error(`${entry.id}: exercise parent is not publicly publishable`);
  const [script,raw,data]=await Promise.all([readFile(`public${entry.data.script_path}`),readFile(`public${entry.data.receipt_path}`,'utf8'),readFile(`public${entry.data.data_path}`)]);
  const receipt=JSON.parse(raw); const errors=exerciseReceiptErrors(entry.data,receipt,createHash('sha256').update(script).digest('hex'),createHash('sha256').update(data).digest('hex'));
  if(errors.length) throw new Error(`${entry.id}: ${errors.join('; ')}`);
  return {entry,receipt};
 }));
 return {guides,solutions:solutions.filter(x=>guides.some(g=>g.data.solution_ids.some(ref=>ref.id===x.id))),practices:filterPublicContent(practices,context) as CollectionEntry<'practices'>[],exercises:publishedExercises};
}
