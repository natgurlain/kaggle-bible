#!/usr/bin/env python3
"""Original Kaggle Bible passenger-rule lab. Python >=3.11, standard library only.
Generated teaching passengers are not Titanic data. No network or submission.
"""
import argparse, collections, csv, hashlib, json, math, platform, random, statistics, sys, time, tracemalloc
from pathlib import Path
SEED=17
SPLIT='Five target-stratified folds with seed 17; each row validates once; group rules fit training rows only.'
METRIC='accuracy'
METHODS=['sex-majority','sex-class-majority']
def fixture():
    rng=random.Random(SEED);rows=[]
    for i in range(180):
        sex=['female','male'][i%2];pclass=1+(i//2)%3
        probability=({1:.85,2:.70,3:.48} if sex=='female' else {1:.55,2:.25,3:.12})[pclass]
        rows.append({'PassengerId':str(i+1),'Sex':sex,'Pclass':str(pclass),'Survived':int(rng.random()<probability)})
    return rows

def load_csv(path):
    with path.open(newline='') as handle:rows=list(csv.DictReader(handle))
    if not rows:raise ValueError('No passenger rows')
    ids=set()
    for row in rows:
        if row['Survived'] not in ('0','1'):raise ValueError('Survived must be 0 or 1')
        row['Survived']=int(row['Survived'])
        if row['Sex'] not in ('female','male') or row['Pclass'] not in ('1','2','3'):raise ValueError('Expected Sex female/male and Pclass 1/2/3')
        if not row['PassengerId'] or row['PassengerId'] in ids:raise ValueError('PassengerId must be non-empty and unique')
        ids.add(row['PassengerId'])
    return [{k:r[k] for k in ['PassengerId','Sex','Pclass','Survived']} for r in rows]

def folds(rows):
    rng=random.Random(SEED);groups=collections.defaultdict(list);result=[[] for _ in range(5)]
    for i,r in enumerate(rows):groups[r['Survived']].append(i)
    if set(groups)!={0,1} or min(map(len,groups.values()))<5:raise ValueError('At least five rows of each target class are required')
    for label,indices in sorted(groups.items()):
        rng.shuffle(indices)
        for offset,index in enumerate(indices):result[offset%5].append(index)
    return result

def predict(train,validation,method):
    keys=['Sex'] if method=='sex-majority' else ['Sex','Pclass']
    def majority(values):return int(sum(values)>len(values)/2) # ties predict 0
    grouped=collections.defaultdict(list)
    for row in train:grouped[tuple(row[k] for k in keys)].append(row['Survived'])
    fallback=majority([row['Survived'] for row in train]);rules={k:majority(v) for k,v in grouped.items()}
    return [rules.get(tuple(row[k] for k in keys),fallback) for row in validation]

def run(rows):
    results=[]
    for number,indices in enumerate(folds(rows),1):
        held=set(indices);train=[r for i,r in enumerate(rows) if i not in held];validation=[rows[i] for i in indices]
        metrics={method:statistics.mean(int(p==r['Survived']) for p,r in zip(predict(train,validation,method),validation)) for method in METHODS}
        results.append({'split':f'stratified fold {number}','train_size':len(train),'validation_size':len(validation),'metrics':metrics})
    return {'metric':METRIC,'direction':'maximize','fold_results':results,'aggregate':{method:statistics.mean(r['metrics'][method] for r in results) for method in METHODS}}

def main():
    if sys.version_info<(3,11):raise SystemExit('Use Python >=3.11; recorded environment is 3.12.14')
    parser=argparse.ArgumentParser(description=__doc__);mode=parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--fixture',action='store_true');mode.add_argument('--csv',type=Path);parser.add_argument('--output',type=Path,default=Path('titanic-receipt.json'));args=parser.parse_args()
    tracemalloc.start();start=time.perf_counter();rows=fixture() if args.fixture else load_csv(args.csv)
    data=json.dumps(rows,sort_keys=True,separators=(',',':')).encode();args.output.with_name(args.output.stem+'-data.json').write_bytes(data)
    result=run(rows)
    receipt={'schema_version':1,'exercise':'titanic-group-rules','executed_at':time.strftime('%Y-%m-%d',time.gmtime()),'data_scope':'generated-teaching-fixture' if args.fixture else 'reader-provided-data','data_sha256':hashlib.sha256(data).hexdigest(),'script_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'seed':SEED,'split_definition':SPLIT,'python':platform.python_version(),'platform':platform.system()+' '+platform.machine(),'dependencies':'Python standard library only','hardware_scope':'local CPU; accelerator not used','wall_seconds':time.perf_counter()-start,'memory_scope':'traced-python-allocations','peak_memory_bytes':tracemalloc.get_traced_memory()[1],'limitations':['Generated fixture is not Titanic data; no leaderboard submission or historical reproduction.','Random stratification does not isolate passenger families.','Aggregate is an unweighted mean of folds, not Kaggle test accuracy.','Memory measures traced Python allocations, not process RSS.'],**result}
    args.output.write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt['aggregate'],indent=2));print('Receipt:',args.output)
if __name__=='__main__':main()
