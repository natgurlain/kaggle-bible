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
 const successful={...receipt,exercise:actual.slug,data_scope:actual.data_scope,execution_status:'succeeded',evidence_type:'actual-data',provenance_url:actual.project.access.provenance_url,authorization:'Test-only authorized-input statement',input_manifest:{kind:'fingerprint-only',files:[{name:'train.csv',sha256:'d'.repeat(64),bytes:500}]},code_fingerprints:Object.fromEntries(['script','notebook','environment'].map(field=>[`${field}_sha256`,actual.project.package[`${field}_sha256`]])),configuration:{baseline:actual.project.baseline,controlled_change:actual.project.controlled_change},diagnostics:actual.project.diagnostics.map((question,i)=>({question,path:`/exercises/test-diagnostic-${i}.json`,sha256:'e'.repeat(64)}))};
 for(const field of ['script','notebook','environment']) successful.code_fingerprints[`${field}_sha256`]=actual.project.package[`${field}_sha256`];
 const artifacts={...execution.artifacts,fingerprint_only_input:true,input_manifest_matches_receipt:true,diagnostics:Object.fromEntries(successful.diagnostics.map(row=>[row.path,row.sha256]))};
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

function actualContractTestValues() {
 const actual=structuredClone(fixture);actual.data_scope='competition-data';actual.project.readiness='actual-data-verified';actual.project.readiness_history=['runnable','actual-data-verified'];
 const successful={...structuredClone(receipt),exercise:actual.slug,data_scope:actual.data_scope,execution_status:'succeeded',evidence_type:'actual-data',provenance_url:actual.project.access.provenance_url,authorization:'Test-only authorized-input statement',input_manifest:{kind:'fingerprint-only',files:[{name:'train.csv',sha256:'d'.repeat(64),bytes:500}]},code_fingerprints:Object.fromEntries(['script','notebook','environment'].map(field=>[`${field}_sha256`,actual.project.package[`${field}_sha256`]])),configuration:{baseline:actual.project.baseline,controlled_change:actual.project.controlled_change},diagnostics:actual.project.diagnostics.map((question,i)=>({question,path:`/exercises/test-diagnostic-${i}.json`,sha256:'e'.repeat(64)}))};
 const artifacts={...execution.artifacts,fingerprint_only_input:true,input_manifest_matches_receipt:true,diagnostics:Object.fromEntries(successful.diagnostics.map(row=>[row.path,row.sha256]))};
 return {actual,successful,artifacts};
}
test('actual-data receipts reject raw-data extras in every publishable object while legacy fixtures remain valid',()=>{
 const {actual,successful,artifacts}=actualContractTestValues();assert.deepEqual(projectContractErrors(actual,successful,artifacts),[]);
 const mutate=[r=>r.input_rows=[{PassengerId:1}],r=>r.diagnostics[0].raw_rows=[{PassengerId:1}],r=>r.input_manifest.raw_rows=[{PassengerId:1}],r=>r.input_manifest.files[0].raw_rows=[{PassengerId:1}],r=>r.configuration.input_rows=[{PassengerId:1}],r=>r.code_fingerprints.raw_rows=[{PassengerId:1}],r=>r.fold_results[0].raw_rows=[{PassengerId:1}],r=>r.fold_results[0].metrics.raw_rows=[{PassengerId:1}],r=>r.aggregate.raw_rows=[{PassengerId:1}],r=>r.limitations.push({raw_rows:[{PassengerId:1}]}),r=>r.hardware_scope={raw_rows:[{PassengerId:1}]}];
 for(const update of mutate){const candidate=structuredClone(successful);update(candidate);assert.ok(projectContractErrors(actual,candidate,artifacts).length,String(update));}
 const runnable=structuredClone(actual);runnable.project.readiness='runnable';runnable.project.readiness_history=['runnable'];
 assert.ok(projectContractErrors(runnable,{...successful,input_rows:[{PassengerId:1}]},artifacts).length,'runnable actual-data receipt is also checked');
 assert.deepEqual(projectContractErrors(fixture,execution.receipt,execution.artifacts),[]);
});
test('optional imported helper must be declared as a complete pair and match file and receipt fingerprints',async()=>{
 const {actual,successful,artifacts}=actualContractTestValues();actual.project.package.helper_path='/exercises/titanic-group-rules.py';actual.project.package.helper_sha256=execution.artifacts.script_sha256;
 successful.code_fingerprints.helper_sha256=actual.project.package.helper_sha256;artifacts.helper_sha256=actual.project.package.helper_sha256;
 assert.deepEqual(projectContractErrors(actual,successful,artifacts),[]);
 const runnable=structuredClone(fixture);runnable.project.package.helper_path=actual.project.package.helper_path;runnable.project.package.helper_sha256=actual.project.package.helper_sha256;
 const loaded=await loadExerciseArtifacts(runnable);assert.equal(loaded.artifacts.helper_sha256,actual.project.package.helper_sha256);assert.deepEqual(projectContractErrors(runnable,loaded.receipt,loaded.artifacts),[]);
 const noPath=structuredClone(actual);delete noPath.project.package.helper_path;assert.ok(projectContractErrors(noPath,successful,artifacts).some(error=>error.includes('helper')));
 const noHash=structuredClone(actual);delete noHash.project.package.helper_sha256;assert.ok(projectContractErrors(noHash,successful,artifacts).some(error=>error.includes('helper')));
 assert.ok(projectContractErrors(actual,successful,{...artifacts,helper_sha256:'f'.repeat(64)}).some(error=>error.includes('helper')));
 const missingReceipt=structuredClone(successful);delete missingReceipt.code_fingerprints.helper_sha256;assert.ok(projectContractErrors(actual,missingReceipt,artifacts).length);
 const staleReceipt=structuredClone(successful);staleReceipt.code_fingerprints.helper_sha256='f'.repeat(64);assert.ok(projectContractErrors(actual,staleReceipt,artifacts).some(error=>error.includes('helper')));
 const undeclared=actualContractTestValues();undeclared.successful.code_fingerprints.helper_sha256=artifacts.helper_sha256;assert.ok(projectContractErrors(undeclared.actual,undeclared.successful,undeclared.artifacts).length);
 const noFile=structuredClone(fixture);noFile.project.package.helper_path='/exercises/nonexistent-helper.py';noFile.project.package.helper_sha256='f'.repeat(64);
 await assert.rejects(()=>loadExerciseArtifacts(noFile),/ENOENT/);
});

test('runnable nonfixture publishing rejects row artifacts, mismatched manifests and raw diagnostics before verification',async()=>{
 // Generated fixture mutations in an isolated workspace; no real inputs or receipts are published.
 const {mkdtemp,mkdir,writeFile,rm,copyFile,symlink}=await import('node:fs/promises');
 const {join}=await import('node:path');const {tmpdir}=await import('node:os');
 const {fileURLToPath}=await import('node:url');const {createHash}=await import('node:crypto');const {spawnSync}=await import('node:child_process');
 const root=fileURLToPath(new URL('../',import.meta.url));const folder=await mkdtemp(join(tmpdir(),'runnable-privacy-test-'));
 const sha=value=>createHash('sha256').update(value).digest('hex');
 try {
  await mkdir(join(folder,'src/content/exercises'),{recursive:true});await mkdir(join(folder,'public/exercises'),{recursive:true});
  for(const collection of ['competitions','solutions','sources','practices']) await symlink(join(root,'src/content',collection),join(folder,'src/content',collection));
  const house=JSON.parse(await readFile(join(root,'src/content/exercises/exercise-house-neighborhood.json')));
  const recorded=JSON.parse(await readFile(join(root,'public',house.receipt_path)));
  const rows=await readFile(join(root,'public',house.data_path));
  house.data_scope='competition-data';house.project.access.redistribution='private-input';
  const manifest={kind:'fingerprint-only',files:[{name:'train.csv',sha256:'d'.repeat(64),bytes:500}]};
  const summary=JSON.stringify({summary:'Generated software-test diagnostic.',observations:['Not an actual-data execution.'],limitations:['Synthetic mutation only.']});
  const candidate={...recorded,data_scope:house.data_scope,execution_status:'succeeded',evidence_type:'actual-data',input_manifest:manifest,
   provenance_url:house.project.access.provenance_url,authorization:'Software-test statement, not actual authorization.',
   code_fingerprints:Object.fromEntries(['script','notebook','environment'].map(kind=>[`${kind}_sha256`,house.project.package[`${kind}_sha256`]])),
   configuration:{baseline:house.project.baseline,controlled_change:house.project.controlled_change},
   diagnostics:house.project.diagnostics.map((question,i)=>({question,path:`/exercises/privacy-test-diagnostic-${i}.json`,sha256:sha(summary)}))};
  for(const asset of [house.script_path,house.project.package.notebook_path,house.project.package.environment_path]) await copyFile(join(root,'public',asset),join(folder,'public',asset));
  for(const diagnostic of candidate.diagnostics) await writeFile(join(folder,'public',diagnostic.path),summary);
  await writeFile(join(folder,'src/content/exercises',house.id+'.json'),JSON.stringify(house));
  const writeInput=async input=>{await writeFile(join(folder,'public',house.data_path),input);candidate.data_sha256=sha(input);await writeFile(join(folder,'public',house.receipt_path),JSON.stringify(candidate));return loadExerciseArtifacts(house,join(folder,'public'));};
  const publishingCheck=()=>spawnSync(process.execPath,[join(root,'scripts/check-exercises.mjs')],{cwd:folder,env:{...process.env,CHECK_BUILT_CONTENT:'0'},encoding:'utf8'});
  const raw=await writeInput(rows);
  assert.equal(raw.artifacts.fingerprint_only_input,false);
  assert.deepEqual(exerciseReceiptErrors(house,raw.receipt,raw.artifacts.script_sha256,raw.artifacts.data_sha256),[],'matching raw-file hashes alone do not enforce privacy');
  assert.ok(projectContractErrors(house,raw.receipt,raw.artifacts).some(error=>error.includes('fingerprint-only')));
  assert.ok(projectContractErrors({...house,project:undefined},raw.receipt,raw.artifacts).some(error=>error.includes('fingerprint-only')),'an omitted optional project extension cannot bypass input privacy');
  const rejected=publishingCheck();assert.notEqual(rejected.status,0);assert.match(rejected.stderr,/fingerprint-only/);
  // Planned/blocked records skip execution loading, so they must not declare input/receipt assets.
  // Run the real publishing entry point for both drafts and published records.
  const metadataPath=join(folder,'src/content/exercises',house.id+'.json');
  for(const status of ['draft','published']) for(const readiness of ['planned','blocked']) {
   const pending=structuredClone(house);pending.status=status;pending.project.readiness=readiness;pending.project.readiness_history=[readiness];
   if(readiness==='blocked') pending.project.blocker={reason:'No authorized input',owner:'Maintainer (unassigned)',next_action:'Supply authorized private input'};
   delete pending.data_path;delete pending.receipt_path;
   assert.deepEqual(projectContractErrors(pending,null,{}),[]);
   await writeFile(metadataPath,JSON.stringify(pending));const validPending=publishingCheck();assert.equal(validPending.status,0,validPending.stderr);
   for(const field of ['data_path','receipt_path']) {
    const declared={...pending,[field]:house[field]};
    // Both existing artifacts contain generated row data here; never real competition data.
    await writeFile(join(folder,'public',house[field]),rows);
    assert.ok(projectContractErrors(declared,null,{}).some(error=>error.includes('must omit')));
    await writeFile(metadataPath,JSON.stringify(declared));const rejectedPending=publishingCheck();
    assert.notEqual(rejectedPending.status,0,`${status} ${readiness} ${field}`);assert.match(rejectedPending.stderr,/must omit public data and receipt artifact references/);
   }
  }
  const omittedDraft={...house,status:'draft',project:undefined};
  await writeFile(metadataPath,JSON.stringify(omittedDraft));const rejectedLegacyDraft=publishingCheck();
  assert.notEqual(rejectedLegacyDraft.status,0);assert.match(rejectedLegacyDraft.stderr,/scope must agree/,'omitting the optional project extension cannot silence draft privacy errors');
  await writeFile(metadataPath,JSON.stringify(house));
  // Loaded evidence controls scope checks even when metadata falsely calls the input a fixture.
  await writeInput(rows);
  for(const status of ['draft','published']) for(const readiness of ['planned','blocked','projectless']) {
   const spoof=structuredClone(house);spoof.status=status;spoof.data_scope='generated-teaching-fixture';
   if(readiness==='projectless') delete spoof.project;
   else {spoof.project.readiness=readiness;spoof.project.readiness_history=[readiness];if(readiness==='blocked') spoof.project.blocker={reason:'Input unavailable',owner:'Maintainer (unassigned)',next_action:'Provide authorized input'};}
   const loaded=await loadExerciseArtifacts(spoof,join(folder,'public'));
   assert.equal(loaded.receipt.evidence_type,'actual-data');assert.equal(loaded.artifacts.fingerprint_only_input,false);
   assert.ok(projectContractErrors(spoof,loaded.receipt,loaded.artifacts).some(error=>error.includes('scope must agree')));
   await writeFile(metadataPath,JSON.stringify(spoof));const spoofCheck=publishingCheck();assert.notEqual(spoofCheck.status,0,`${status} ${readiness} false fixture label`);assert.match(spoofCheck.stderr,/scope must agree/);
  }
  // A real legacy fixture receipt stays valid even when its optional project extension is absent.
  const legacy=JSON.parse(await readFile(join(root,'src/content/exercises/exercise-house-neighborhood.json')));delete legacy.project;legacy.status='draft';
  await writeFile(join(folder,'public',legacy.receipt_path),JSON.stringify(recorded));await writeFile(metadataPath,JSON.stringify(legacy));
  const legacyCheck=publishingCheck();assert.equal(legacyCheck.status,0,legacyCheck.stderr);
  await writeFile(metadataPath,JSON.stringify(house));
  // Canonical equality permits object-key reordering, but not a different manifest.
  const reordered={files:[{bytes:500,sha256:'d'.repeat(64),name:'train.csv'}],kind:'fingerprint-only'};
  const safe=await writeInput(JSON.stringify(reordered));assert.equal(safe.artifacts.input_manifest_matches_receipt,true);
  assert.deepEqual(projectContractErrors(house,safe.receipt,safe.artifacts),[]);const accepted=publishingCheck();assert.equal(accepted.status,0,accepted.stderr);assert.match(accepted.stdout,/0 actual-data verified/);
  const mismatch=await writeInput(JSON.stringify({...manifest,files:[{...manifest.files[0],name:'different.csv'}]}));
  assert.equal(mismatch.artifacts.input_manifest_matches_receipt,false);
  assert.ok(projectContractErrors(house,mismatch.receipt,{...mismatch.artifacts,fingerprint_only_input:true}).some(error=>error.includes('exactly match')));
  assert.notEqual(publishingCheck().status,0);
  const clean=await writeInput(JSON.stringify(manifest));
  for(const mutate of [r=>r.evidence_type='fixture',r=>r.data_scope='generated-teaching-fixture']) {const bad=structuredClone(clean.receipt);mutate(bad);assert.ok(projectContractErrors(house,bad,clean.artifacts).some(error=>error.includes('scope must agree')));}
  assert.ok(projectContractErrors({...house,data_scope:'generated-teaching-fixture'},clean.receipt,clean.artifacts).some(error=>error.includes('scope must agree')));
  assert.ok(projectContractErrors(house,null,clean.artifacts).some(error=>error.includes('matching actual-data receipt')));
  const noReceipt=await loadExerciseArtifacts({...house,receipt_path:undefined},join(folder,'public'));assert.ok(projectContractErrors(house,null,noReceipt.artifacts).some(error=>error.includes('exactly match')));
  const rawDiagnostic=JSON.stringify({...JSON.parse(summary),raw_rows:[{private_record:'generated-test-sentinel'}]});
  await writeFile(join(folder,'public',candidate.diagnostics[0].path),rawDiagnostic);candidate.diagnostics[0].sha256=sha(rawDiagnostic);await writeFile(join(folder,'public',house.receipt_path),JSON.stringify(candidate));
  const diagnostic=await loadExerciseArtifacts(house,join(folder,'public'));assert.equal(diagnostic.artifacts.diagnostics_valid,false);assert.ok(projectContractErrors(house,diagnostic.receipt,diagnostic.artifacts).some(error=>error.includes('diagnostic artifact')));assert.notEqual(publishingCheck().status,0);
  assert.deepEqual(projectContractErrors(fixture,execution.receipt,execution.artifacts),[]);
  assert.deepEqual(projectContractErrors({...fixture,project:undefined},execution.receipt,execution.artifacts),[],'legacy generated fixtures retain validity');
 } finally {await rm(folder,{recursive:true,force:true});}
});
