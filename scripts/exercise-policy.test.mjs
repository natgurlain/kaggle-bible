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
