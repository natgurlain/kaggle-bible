#!/usr/bin/env python3
"""Original Kaggle Bible log-price lab. Python >=3.11, standard library only.
Generated teaching homes are not Ames competition data. No network or submission.
"""
import argparse, collections, csv, hashlib, json, math, platform, random, statistics, sys, time, tracemalloc
from pathlib import Path
SEED=17
SPLIT='Five shuffled random folds with seed 17; each row validates once; all log-price category means fit training rows only.'
METRIC='RMSE of natural log prices'
METHODS=['global-log-mean','shrunk-neighborhood-log-mean']
def fixture():
    rng=random.Random(SEED);locations=['north','south','east','west','central'];rows=[]
    for i in range(200):
        neighborhood=locations[i%5];price=math.exp(11.5+(.12*(i%5))+rng.gauss(0,.18))
        rows.append({'Id':str(i+1),'Neighborhood':neighborhood,'SalePrice':round(price,2)})
    return rows

def load_csv(path):
    with path.open(newline='') as handle:rows=list(csv.DictReader(handle))
    ids=set();clean=[]
    for r in rows:
        price=float(r['SalePrice'])
        if not math.isfinite(price) or price<=0:raise ValueError('SalePrice must be finite and positive')
        if not r['Id'] or r['Id'] in ids:raise ValueError('Id must be non-empty and unique')
        ids.add(r['Id']);clean.append({'Id':r['Id'],'Neighborhood':r['Neighborhood'],'SalePrice':price})
    if len(clean)<10:raise ValueError('At least ten rows required')
    return clean

def folds(rows):
    if len(rows)<10:raise ValueError('At least ten rows required')
    indices=list(range(len(rows)));random.Random(SEED).shuffle(indices)
    return [indices[i::5] for i in range(5)]

def predict(train,validation,method):
    global_mean=statistics.mean(math.log(r['SalePrice']) for r in train)
    if method=='global-log-mean':return [global_mean]*len(validation)
    if method!='shrunk-neighborhood-log-mean':raise ValueError('Unknown method')
    groups=collections.defaultdict(list)
    for row in train:groups[row['Neighborhood']].append(math.log(row['SalePrice']))
    # Five pseudo-examples from the training global mean; fixed before evaluation.
    means={key:(sum(values)+5*global_mean)/(len(values)+5) for key,values in groups.items()}
    return [means.get(row['Neighborhood'],global_mean) for row in validation]

def run(rows):
    results=[]
    for number,indices in enumerate(folds(rows),1):
        held=set(indices);train=[r for i,r in enumerate(rows) if i not in held];validation=[rows[i] for i in indices]
        metrics={method:math.sqrt(statistics.mean((p-math.log(r['SalePrice']))**2 for p,r in zip(predict(train,validation,method),validation))) for method in METHODS}
        results.append({'split':f'random fold {number}','train_size':len(train),'validation_size':len(validation),'metrics':metrics})
    return {'metric':METRIC,'direction':'minimize','fold_results':results,'aggregate':{method:statistics.mean(r['metrics'][method] for r in results) for method in METHODS}}

def main():
    if sys.version_info<(3,11):raise SystemExit('Use Python >=3.11; recorded environment is 3.12.14')
    parser=argparse.ArgumentParser(description=__doc__);mode=parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--fixture',action='store_true');mode.add_argument('--csv',type=Path);parser.add_argument('--output',type=Path,default=Path('house-receipt.json'));args=parser.parse_args()
    tracemalloc.start();start=time.perf_counter();rows=fixture() if args.fixture else load_csv(args.csv)
    data=json.dumps(rows,sort_keys=True,separators=(',',':')).encode();args.output.with_name(args.output.stem+'-data.json').write_bytes(data)
    result=run(rows)
    receipt={'schema_version':1,'exercise':'house-neighborhood','executed_at':time.strftime('%Y-%m-%d',time.gmtime()),'data_scope':'generated-teaching-fixture' if args.fixture else 'reader-provided-data','data_sha256':hashlib.sha256(data).hexdigest(),'script_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'seed':SEED,'split_definition':SPLIT,'python':platform.python_version(),'platform':platform.system()+' '+platform.machine(),'dependencies':'Python standard library only','hardware_scope':'local CPU; accelerator not used','wall_seconds':time.perf_counter()-start,'memory_scope':'traced-python-allocations','peak_memory_bytes':tracemalloc.get_traced_memory()[1],'limitations':['Generated homes are not Ames competition data; no submission or historical reproduction.','Random folds do not establish spatial or temporal transfer; the neighborhood smoothing weight was fixed before evaluation.','Aggregate is mean fold log-RMSE, rather than pooled test RMSE or a competition score.','Memory measures traced Python allocations, not process RSS.'],**result}
    args.output.write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt['aggregate'],indent=2));print('Receipt:',args.output)
if __name__=='__main__':main()
