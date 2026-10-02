import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile,readdir} from 'node:fs/promises';
import {parse} from 'yaml';
import {learningPathSteps} from '../src/content/learning-path-policy.js';
const guides=await Promise.all((await readdir('src/content/competitions')).filter(x=>x.endsWith('.md')).map(async name=>{const raw=await readFile('src/content/competitions/'+name,'utf8');const data=parse(raw.match(/^---\n([\s\S]*?)\n---/)[1]);return {id:data.id,data};}));
const exercises=await Promise.all((await readdir('src/content/exercises')).filter(x=>x.endsWith('.json')).map(async name=>{const data=JSON.parse(await readFile('src/content/exercises/'+name));return {entry:{id:data.id,data}};}));
test('current path orders the core lessons and keeps vision and forecasting separate without actual-data claims',()=>{
 const steps=learningPathSteps(guides,exercises);
 assert.deepEqual(steps.filter(x=>x.group==='core').map(x=>x.slug),['titanic','house-prices-advanced-regression-techniques','nlp-getting-started']);
 assert.deepEqual(steps.filter(x=>x.group!=='core').map(x=>x.group),['vision','forecast']);
 for(const step of steps){assert.equal(step.project.readiness,'runnable');assert.equal(step.project.scope,'generated teaching fixture');assert.equal(step.actual_data_verified,false);assert.ok(step.project.prerequisites.length);assert.ok(step.project.baseline);assert.ok(step.project.change);assert.ok(step.explain);assert.match(step.project.href,/^\/competitions\/[^/]+\/#exercise-/);assert.match(step.actual_status,/unavailable/);}
});
test('draft ordering and unpublished guides cannot offer project starts or verification',()=>{
 const drafts=exercises.filter(x=>x.entry.data.status==='draft');const published=exercises.filter(x=>x.entry.data.status==='published');assert.ok(drafts.length);
 assert.deepEqual(learningPathSteps(guides,[...drafts,...published]),learningPathSteps(guides,published));
 const hidden=learningPathSteps(guides.map(x=>({...x,data:{...x.data,status:'draft'}})),exercises);
 for(const step of hidden){assert.equal(step.project,null);assert.equal(step.guide_href,null);assert.equal(step.actual_data_verified,false);}
});
test('planned and blocked published records retain study and blocker information without runnable starts',()=>{
 const fixture=exercises.find(x=>x.entry.id==='exercise-titanic-group-rules');
 for(const readiness of ['planned','blocked']){
  const input={entry:{...fixture.entry,data:{...fixture.entry.data,data_scope:'competition-data',project:{...fixture.entry.data.project,readiness,blocker:{reason:'Authorized input missing',owner:'Unassigned maintainer',next_action:'Establish permitted access'}}}}};
  const step=learningPathSteps(guides,[input])[0];assert.equal(step.project,null);assert.equal(step.guide_href,'/competitions/titanic/');assert.equal(step.actual_data_verified,false);assert.match(step.actual_blocker,/Authorized input missing.*Unassigned maintainer.*Establish permitted access/);
 }
});
test('view selects verified public metadata over a fixture but never promotes a draft or runnable actual-data record',()=>{
 // This is a view-model mutation, not an execution receipt or provenance validation.
 const fixture=exercises.find(x=>x.entry.id==='exercise-titanic-group-rules');
 const candidate={entry:{id:'test-actual-candidate',data:{...fixture.entry.data,id:'test-actual-candidate',slug:'test-actual-candidate',data_scope:'competition-data',project:{...fixture.entry.data.project,readiness:'actual-data-verified'}}}};
 const step=learningPathSteps(guides,[fixture,candidate])[0];assert.equal(step.project.id,candidate.entry.id);assert.equal(step.actual_data_verified,true);assert.equal(step.project.scope,'competition data');
 for(const data of [{...candidate.entry.data,status:'draft'},{...candidate.entry.data,project:{...candidate.entry.data.project,readiness:'runnable'}}]){
  const blocked=learningPathSteps(guides,[fixture,{entry:{id:candidate.entry.id,data}}])[0];assert.equal(blocked.actual_data_verified,false);assert.equal(blocked.project.id,fixture.entry.id);
 }
});
