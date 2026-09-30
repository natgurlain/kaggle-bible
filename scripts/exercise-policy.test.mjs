import assert from 'node:assert/strict';
import test from 'node:test';
import { exerciseReceiptErrors } from '../src/content/exercise-policy.js';
const metadata={slug:'example',data_scope:'generated-teaching-fixture'};
const receipt={schema_version:1,exercise:'example',data_scope:metadata.data_scope,data_sha256:'a'.repeat(64),script_sha256:'b'.repeat(64),executed_at:'2026-09-30',python:'3.12.14',platform:'local CPU',dependencies:'stdlib',seed:17,split_definition:'Frozen 5-fold split',metric:'accuracy',direction:'maximize',fold_results:[{fold:1}],aggregate:{baseline:.5,change:.6},wall_seconds:1,peak_python_memory_bytes:1024,limitations:['Teaching data, no competition score.']};
test('an executed teaching exercise retains scope and rejects stale code or missing receipts',()=>{
 assert.deepEqual(exerciseReceiptErrors(metadata,receipt,receipt.script_sha256),[]);
 for(const [field,value] of [['script_sha256','c'.repeat(64)],['data_scope','competition-data'],['data_sha256',null],['seed',null],['split_definition',''],['executed_at','2026-02-31'],['aggregate',{baseline:Infinity}],['wall_seconds',-1],['fold_results',[]]]) {
  assert.ok(exerciseReceiptErrors(metadata,{...receipt,[field]:value},receipt.script_sha256).length,field);
 }
});
