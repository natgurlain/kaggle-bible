import { getCollection, type CollectionEntry } from 'astro:content';
import { filterPublicGuides, filterPublicContent } from './publication-policy.js';
import { exerciseReceiptErrors, projectContractErrors } from './exercise-policy.js';
import { loadExerciseArtifacts } from './project-artifacts.js';

export async function learningLibrary() {
 const [competitions,solutions,sources,practices,exercises] = await Promise.all([getCollection('competitions'),getCollection('solutions'),getCollection('sources'),getCollection('practices'),getCollection('exercises')]);
 const context={solutions:new Map(solutions.map(x=>[x.id,x])),sources:new Map(sources.map(x=>[x.id,x])),practices:new Map(practices.map(x=>[x.id,x]))};
 const guides:CollectionEntry<'competitions'>[]=filterPublicGuides(competitions,context);
 const guideIds=new Set(guides.map(x=>x.id));
 const publishedExercises=await Promise.all(exercises.filter(x=>x.data.status==='published').map(async entry=>{
  if(!guideIds.has(entry.data.competition_id.id)) throw new Error(`${entry.id}: exercise parent is not publicly publishable`);
  const {receipt,artifacts}=await loadExerciseArtifacts(entry.data);
  const errors=projectContractErrors(entry.data,receipt,artifacts);
  if(receipt) errors.push(...exerciseReceiptErrors(entry.data,receipt,artifacts.script_sha256,artifacts.data_sha256));
  else if(!entry.data.project || entry.data.project.readiness==='actual-data-verified') errors.push('execution receipt is missing');
  if(errors.length) throw new Error(`${entry.id}: ${errors.join('; ')}`);
  return {entry,receipt};
 }));
 return {guides,solutions:solutions.filter(x=>guides.some(g=>g.data.solution_ids.some(ref=>ref.id===x.id))),practices:filterPublicContent(practices,context) as CollectionEntry<'practices'>[],exercises:publishedExercises};
}
