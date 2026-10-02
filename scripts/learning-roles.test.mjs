import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const digit=await readFile('src/content/competitions/competition-digit-recognizer.md','utf8');
const credit=await readFile('src/content/competitions/competition-home-credit-default-risk.md','utf8');
const exercise=JSON.parse(await readFile('src/content/exercises/exercise-digit-centroids.json'));
test('vision and customer-keyed lessons retain separate truthful states and bounded next experiments',()=>{
 assert.equal(exercise.project.readiness,'runnable');assert.equal(exercise.data_scope,'generated-teaching-fixture');
 for(const term of ['784','centroids','L2','writer']) assert.ok(digit.includes(term),term);
 for(const term of ['SK_ID_CURR','100,000','customer-keyed','cutoff','historical solution claims','none is a learner baseline']) assert.ok(credit.includes(term),term);
 for(const content of [digit,credit]) {assert.match(content,/maintainer.*unassigned/i);assert.match(content,/not an executed/);assert.match(content,/peak process RSS/);assert.match(content,/fingerprint/);assert.match(content,/worse result/);}
 assert.match(digit,/Optional legacy CSV mode writes normalized rows/);assert.match(credit,/No learner project, fixture execution or actual-data receipt/);
 assert.equal(exercise.project.next_lesson.url,'/competitions/digit-recognizer/#bounded-future-actual-data-experiment');
 assert.ok(exercise.project.troubleshooting.some(row=>row.recovery.includes('784 finite')));
});
test('existing vision validators reject malformed pixels, labels, headers and fold coverage and retain zero-vector behavior',()=>{
 const code=String.raw`
import importlib.util,csv,tempfile
from pathlib import Path
spec=importlib.util.spec_from_file_location('digit_lab','public/exercises/digit-centroids.py')
lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
rows=[{'label':label,'pixels':[0.0]*784} for label in range(10) for _ in range(5)]
assert len(lab.folds(rows))==5
assert sorted(i for fold in lab.folds(rows) for i in fold)==list(range(50))
assert lab.folds(rows)==lab.folds(rows)
assert lab.vector([0.0]*784,'image-l2-centroids')==[0.0]*784
for bad in [{'label':10,'pixels':[0]*784},{'label':1.5,'pixels':[0]*784},{'label':1,'pixels':[0]*783},{'label':1,'pixels':[float('nan')]*784},{'label':1,'pixels':[256]*784}]:
 try:lab.validate([bad]);raise AssertionError('malformed input accepted')
 except ValueError:pass
try:lab.folds(rows[:-1]);raise AssertionError('missing class coverage accepted')
except ValueError:pass
with tempfile.TemporaryDirectory() as folder:
 path=Path(folder)/'input.csv'
 with path.open('w',newline='') as handle:
  writer=csv.writer(handle);writer.writerow(['label']+['pixel'+str(i) for i in range(784)])
  for row in rows:writer.writerow([row['label']]+row['pixels'])
 assert len(lab.load_csv(path,50))==50
 for cap in [49,1001]:
  try:lab.load_csv(path,cap);raise AssertionError('invalid cap accepted')
  except ValueError:pass
 path.write_text('pixel0,label\n0,1\n')
 try:lab.load_csv(path,50);raise AssertionError('bad header accepted')
 except ValueError:pass
`;
 const run=spawnSync(process.env.PYTHON_BIN ?? 'python3',['-c',code],{encoding:'utf8'});
 assert.equal(run.status,0,run.stderr || run.stdout);
});
