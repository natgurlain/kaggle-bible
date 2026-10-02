import assert from 'node:assert/strict';
import test from 'node:test';
import { exerciseReceiptErrors } from '../src/content/exercise-policy.js';
const metadata={slug:'example',data_scope:'generated-teaching-fixture',python_version:'3.12.14',dependencies:'stdlib',seed:17,split_definition:'Frozen 5-fold split',platform:'Darwin arm64',expected_splits:['fold 1','fold 2','fold 3','fold 4','fold 5'],metric:'accuracy',direction:'maximize',memory_scope:'traced-python-allocations'};
const receipt={schema_version:1,exercise:'example',data_scope:metadata.data_scope,data_sha256:'a'.repeat(64),script_sha256:'b'.repeat(64),executed_at:'2026-09-30',python:metadata.python_version,platform:metadata.platform,dependencies:metadata.dependencies,seed:metadata.seed,split_definition:metadata.split_definition,metric:metadata.metric,direction:metadata.direction,memory_scope:metadata.memory_scope,fold_results:metadata.expected_splits.map(split=>({split,train_size:8,validation_size:2,metrics:{baseline:.5,change:.6}})),aggregate:{baseline:.5,change:.6},wall_seconds:1,peak_memory_bytes:1024,limitations:['Teaching data, no competition score.']};
test('an executed teaching exercise retains scope and rejects stale code or missing receipts',()=>{
 assert.deepEqual(exerciseReceiptErrors(metadata,receipt,receipt.script_sha256,receipt.data_sha256),[]);
 for(const [field,value] of [['platform','Linux x86_64'],['script_sha256','c'.repeat(64)],['data_scope','competition-data'],['data_sha256',null],['seed',18],['split_definition','Changed split'],['python','3.9.6'],['memory_scope','not-measured'],['executed_at','2026-02-31'],['aggregate',{baseline:Infinity}],['aggregate',{baseline:.7,change:.8}],['wall_seconds',-1],['fold_results',[]],['fold_results',[{fold:1}]],['fold_results',[{split:'test',train_size:8,validation_size:2,metrics:{baseline:.5}}]]]) {
  assert.ok(exerciseReceiptErrors(metadata,{...receipt,[field]:value},receipt.script_sha256,receipt.data_sha256).length,field);
 }
 assert.ok(exerciseReceiptErrors(metadata,receipt,receipt.script_sha256,'c'.repeat(64)).length,'input artifact mismatch');
});

test('run receipt must contain every unique declared split and no extras',()=>{
 for(const folds of [receipt.fold_results.slice(0,1),receipt.fold_results.slice(0,4),[...receipt.fold_results,receipt.fold_results[0]],receipt.fold_results.map((row,i)=>i===4 ? {...row,split:'fold 1'}:row),receipt.fold_results.map((row,i)=>i===4 ? {...row,split:'unexpected'}:row)]) assert.ok(exerciseReceiptErrors(metadata,{...receipt,fold_results:folds},receipt.script_sha256,receipt.data_sha256).length);
});

import { projectContractErrors, projectTransitionErrors } from '../src/content/exercise-policy.js';
import { loadExerciseArtifacts } from '../src/content/project-artifacts.js';
import { readFile } from 'node:fs/promises';
const fixture=JSON.parse(await readFile(new URL('../src/content/exercises/exercise-titanic-group-rules.json',import.meta.url)));
const execution=await loadExerciseArtifacts(fixture);
test('existing fixture stays runnable and its notebook delegates to the exact pinned script',()=>{
 assert.deepEqual(projectContractErrors(fixture,execution.receipt,execution.artifacts),[]);
 for(const field of ['script_sha256','notebook_sha256','environment_sha256','notebook_shared_script','environment_matches']) assert.ok(projectContractErrors(fixture,execution.receipt,{...execution.artifacts,[field]:null}).length,field);
 const upgraded=structuredClone(fixture); upgraded.project.readiness='actual-data-verified'; upgraded.project.readiness_history.push('actual-data-verified');
 assert.ok(projectContractErrors(upgraded,execution.receipt,execution.artifacts).some(error=>error.includes('fixture')));
});
test('readiness transitions require runnable before verified and explicit blocker recovery',()=>{
 assert.ok(projectTransitionErrors('planned','actual-data-verified').length);
 assert.ok(projectTransitionErrors('blocked','actual-data-verified').length);
 assert.deepEqual(projectTransitionErrors('blocked','runnable'),[]);
 const blocked=structuredClone(fixture); blocked.project.readiness='blocked';blocked.project.readiness_history=['runnable','blocked'];
 assert.ok(projectContractErrors(blocked,null).some(error=>error.includes('owner')));
 blocked.project.blocker={reason:'No authorized data',owner:'Maintainer (unassigned)',next_action:'Provide a permitted local input path'};
 assert.deepEqual(projectContractErrors(blocked,null),[]);
 const planned=structuredClone(blocked); planned.project.readiness='planned';planned.project.readiness_history=['planned'];
 assert.deepEqual(projectContractErrors(planned,null),[]);
});
test('actual-data verification needs durable matching manifests, provenance, package and diagnostics; worse metrics remain valid',()=>{
 // Contract-only test values are not published runs or actual-data execution evidence.
 const actual=structuredClone(fixture);actual.data_scope='competition-data';actual.project.readiness='actual-data-verified';actual.project.readiness_history=['runnable','actual-data-verified'];actual.project.access.redistribution='private-input';
 const successful={...receipt,exercise:actual.slug,data_scope:actual.data_scope,execution_status:'succeeded',evidence_type:'actual-data',provenance_url:actual.project.access.provenance_url,authorization:'Test-only authorized-input statement',input_manifest:{kind:'fingerprint-only',files:[{name:'train.csv',sha256:'d'.repeat(64),bytes:500}]},code_fingerprints:actual.project.package,configuration:{baseline:actual.project.baseline,controlled_change:actual.project.controlled_change},diagnostics:actual.project.diagnostics.map((question,i)=>({question,path:`/exercises/test-diagnostic-${i}.json`,sha256:'e'.repeat(64)}))};
 for(const field of ['script','notebook','environment']) successful.code_fingerprints[`${field}_sha256`]=actual.project.package[`${field}_sha256`];
 const artifacts={...execution.artifacts,fingerprint_only_input:true,diagnostics:Object.fromEntries(successful.diagnostics.map(row=>[row.path,row.sha256]))};
 assert.deepEqual(projectContractErrors(actual,successful,artifacts),[]);
 for(const field of ['execution_status','evidence_type','input_manifest','provenance_url','authorization','code_fingerprints','configuration','diagnostics']) assert.ok(projectContractErrors(actual,{...successful,[field]:null},artifacts).length,field);
 assert.ok(projectContractErrors(actual,successful,{...artifacts,fingerprint_only_input:false}).length);
 assert.ok(projectContractErrors(actual,successful,{...artifacts,diagnostics:{}}).length);
 const worse={...receipt,aggregate:{baseline:.6,change:.5},fold_results:receipt.fold_results.map(row=>({...row,metrics:{baseline:.6,change:.5}}))};
 assert.deepEqual(exerciseReceiptErrors(metadata,worse,worse.script_sha256,worse.data_sha256),[]);
});

test('a re-pinned notebook with independent computation or executable arguments cannot claim the shared package',async()=>{
 const {mkdtemp,mkdir,writeFile,rm}=await import('node:fs/promises');
 const {tmpdir}=await import('node:os');const {join}=await import('node:path');const {createHash}=await import('node:crypto');
 const base=await mkdtemp(join(tmpdir(),'readiness-package-test-'));
 try {
  await mkdir(join(base,'exercises'));
  const m=structuredClone(fixture);delete m.receipt_path;delete m.data_path;
  for(const path of [m.script_path,m.project.package.environment_path]) await writeFile(base+path,await readFile('public'+path));
  const notebook=JSON.parse(await readFile('public'+m.project.package.notebook_path));
  for(const source of [['print("a second implementation")\n'],['import runpy, sys\n','sys.argv = [__import__("os").getcwd()]\n','runpy.run_path("titanic-group-rules.py", run_name="__main__")\n']]) {
   notebook.cells.find(cell=>cell.cell_type==='code').source=source;
   const raw=JSON.stringify(notebook);await writeFile(base+m.project.package.notebook_path,raw);
   m.project.package.notebook_sha256=createHash('sha256').update(raw).digest('hex');
   const loaded=await loadExerciseArtifacts(m,base);
   assert.ok(projectContractErrors(m,null,loaded.artifacts).some(error=>error.includes('delegate')));
  }
 } finally {await rm(base,{recursive:true,force:true});}
});
