import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,readdir} from 'node:fs/promises';
import {loadExerciseArtifacts} from '../src/content/project-artifacts.js';
import {libraryEvidenceCounts,recommendedFirstProject} from '../src/content/first-project-policy.js';
const exercises=await Promise.all((await readdir('src/content/exercises')).filter(x=>x.endsWith('.json')).map(async name=>{const data=JSON.parse(await readFile('src/content/exercises/'+name));const {receipt}=await loadExerciseArtifacts(data);return {entry:{id:data.id,data},receipt};}));
const guides=[{id:'competition-titanic',data:{status:'published',slug:'titanic'}}];
const library={guides,exercises,solutions:[],practices:[]};
const fixture=exercises.find(x=>x.entry.id==='exercise-titanic-group-rules');
test('homepage offers the recorded fixture warmup while actual-data drafts do not affect counts or recommendation',()=>{
 const first=recommendedFirstProject(library);assert.equal(first.id,fixture.entry.id);assert.equal(first.actual,false);assert.match(first.label,/generated teaching fixture/);assert.match(first.limit,/Actual Titanic execution remains unverified/);assert.match(first.requirements,/Python/);
 const counts=libraryEvidenceCounts(library);assert.equal(counts.fixtures,5);assert.equal(counts.actual,0);
 const drafts=exercises.filter(x=>x.entry.data.status==='draft');assert.ok(drafts.length);assert.deepEqual(recommendedFirstProject({...library,exercises:[...drafts,...exercises.filter(x=>x.entry.data.status==='published')]}),first);
});
test('missing receipts, unpublished guides and blocked projects cannot supply a first-project action',()=>{
 assert.equal(recommendedFirstProject({...library,exercises:exercises.map(x=>({...x,receipt:null}))}),null);
 assert.equal(libraryEvidenceCounts({...library,exercises:exercises.map(x=>({...x,receipt:null}))}).fixtures,0);
 assert.equal(recommendedFirstProject({...library,guides:guides.map(x=>({...x,data:{...x.data,status:'draft'}}))}),null);
 assert.equal(recommendedFirstProject({...library,exercises:[{...fixture,entry:{...fixture.entry,data:{...fixture.entry.data,project:{...fixture.entry.data.project,readiness:'blocked'}}}}]}),null);
});
test('validated public actual-data presentation replaces warmup only with a matching actual-data receipt',()=>{
 // View-model mutation only; this object is not an execution or provenance claim.
 const candidate={entry:{id:'test-actual-candidate',data:{...fixture.entry.data,id:'test-actual-candidate',slug:'test-actual-candidate',data_scope:'competition-data',project:{...fixture.entry.data.project,readiness:'actual-data-verified'}}},receipt:{...fixture.receipt,data_scope:'competition-data',evidence_type:'actual-data',execution_status:'succeeded'}};
 const promoted={...library,exercises:[fixture,candidate]};assert.equal(recommendedFirstProject(promoted).id,candidate.entry.id);assert.equal(recommendedFirstProject(promoted).actual,true);assert.equal(libraryEvidenceCounts(promoted).actual,1);
 for(const rejected of [{...candidate,receipt:null},{...candidate,receipt:fixture.receipt},{...candidate,receipt:{...candidate.receipt,execution_status:'failed'}},{...candidate,entry:{...candidate.entry,data:{...candidate.entry.data,status:'draft'}}},{...candidate,entry:{...candidate.entry,data:{...candidate.entry.data,project:{...candidate.entry.data.project,readiness:'runnable'}}}}]){
  const input={...library,exercises:[rejected,fixture]};assert.equal(recommendedFirstProject(input).id,fixture.entry.id);assert.equal(libraryEvidenceCounts(input).actual,0);
 }
});
