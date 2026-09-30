import test from 'node:test';
import assert from 'node:assert/strict';
import {learningEvent, completionTransition} from '../src/content/learning-events.js';
const known = {guides:['titanic'], exercises:['titanic-group-rules']};
test('events use only known content and reconstruct minimal payloads', () => {
 assert.deepEqual(learningEvent('guide_discovery','titanic',known),{version:1,name:'guide_discovery',guide:'titanic'});
 for(const id of ['unknown','titanic?email=private','https://example.org/titanic']) assert.equal(learningEvent('guide_discovery',id,known),null);
 assert.equal(learningEvent('guide_discovery','titanic-group-rules',known),null);
 assert.equal(learningEvent('arbitrary','titanic',known),null);
 assert.equal(learningEvent('exercise_start',{id:'titanic-group-rules',text:'secret'},known),null);
 assert.deepEqual(Object.keys(learningEvent('exercise_start','titanic-group-rules',known)),['version','name','exercise']);
});
test('download never completes, report is reversible and duplicate report is ignored', () => {
 assert.deepEqual(completionTransition(false,'download'),{completed:false,event:null});
 assert.deepEqual(completionTransition(false,'report'),{completed:true,event:'self_reported_completion'});
 assert.deepEqual(completionTransition(true,'report'),{completed:true,event:null});
 assert.deepEqual(completionTransition(true,'undo'),{completed:false,event:'completion_withdrawn'});
 assert.deepEqual(completionTransition(false,'undo'),{completed:false,event:null});
});
