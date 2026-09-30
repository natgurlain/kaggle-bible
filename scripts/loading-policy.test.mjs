import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLatestTask } from '../src/content/loading-policy.js';
const deferred = () => { let resolve, reject; const promise = new Promise((a,b) => { resolve=a; reject=b; }); return {promise,resolve,reject}; };
function view() {
  const state = { content:'existing results', busy:false, error:false };
  const callbacks = { pending:()=>{state.busy=true;state.error=false;}, complete:value=>{state.content=value;}, failed:()=>{state.error=true;}, settled:()=>{state.busy=false;} };
  return {state,callbacks};
}
test('pending work preserves content, failure settles and retry succeeds', async () => {
  const updates=createLatestTask(), {state,callbacks}=view(), first=deferred();
  const run=updates.run(()=>first.promise,callbacks);
  assert.equal(state.content,'existing results'); assert.equal(state.busy,true);
  first.reject(new Error('offline')); await run;
  assert.deepEqual(state,{content:'existing results',busy:false,error:true});
  await updates.run(async ()=>'new results',callbacks);
  assert.deepEqual(state,{content:'new results',busy:false,error:false});
});
test('older success cannot replace newer results or clear the newer busy state', async () => {
  const updates=createLatestTask(), {state,callbacks}=view(), old=deferred(), latest=deferred();
  const a=updates.run(()=>old.promise,callbacks), b=updates.run(()=>latest.promise,callbacks);
  old.resolve('stale'); await a;
  assert.equal(state.content,'existing results'); assert.equal(state.busy,true);
  latest.resolve('latest'); await b;
  assert.equal(state.content,'latest'); assert.equal(state.busy,false);
});
test('invalidating a pending request during debounce suppresses its error and completion', async () => {
  const updates=createLatestTask(), {state,callbacks}=view(), old=deferred();
  const a=updates.run(()=>old.promise,callbacks); updates.invalidate();
  old.reject(new Error('stale failure')); await a;
  assert.equal(state.error,false); assert.equal(state.content,'existing results');
  await updates.run(async ()=>'latest query',callbacks);
  assert.equal(state.content,'latest query'); assert.equal(state.busy,false);
});
