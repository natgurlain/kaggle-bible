#!/usr/bin/env python3
"""Original Kaggle Bible pixel-centroid lab. Python >=3.11, stdlib only.
Generated geometric class patterns are not handwriting/MNIST. No network or submission.
"""
import argparse, collections, csv, hashlib, itertools, json, math, platform, random, statistics, sys, time, tracemalloc
from pathlib import Path
SEED=17
SPLIT='Five label-stratified folds with seed 17; each sampled row validates once; centroids fit training rows only; CSV uses a declared prefix cap.'
METRIC='accuracy'
METHODS=['raw-centroids','image-l2-centroids']
def fixture():
    rng=random.Random(SEED);rows=[]
    for i in range(200):
        label=i%10;brightness=rng.uniform(.35,1.0);pixels=[]
        for pixel in range(784):
            y,x=divmod(pixel,28)
            foreground=(x in range(2+label*2,4+label*2)) or (y==3+label*2 and 2<=x<=24)
            pixels.append(round(min(255,max(0,(210 if foreground else 12)*brightness+rng.gauss(0,12)))))
        rows.append({'label':label,'pixels':pixels})
    return rows

def validate(rows):
    if not rows:raise ValueError('No images')
    for row in rows:
        if not isinstance(row['label'],int) or row['label'] not in range(10):raise ValueError('label must be an integer 0–9')
        if len(row['pixels'])!=784 or any(not isinstance(x,(int,float)) or not math.isfinite(x) or x<0 or x>255 for x in row['pixels']):raise ValueError('Each image needs exactly 784 finite pixels 0–255')
    return rows

def load_csv(path,max_rows=1000):
    if max_rows<50 or max_rows>1000:raise ValueError('max-rows must be between 50 and 1000')
    with path.open(newline='') as handle:
        reader=csv.DictReader(handle);expected=['label']+['pixel'+str(i) for i in range(784)]
        if reader.fieldnames!=expected:raise ValueError('Expected label,pixel0,...,pixel783 in that order')
        rows=[{'label':int(r['label']),'pixels':[float(r[key]) for key in expected[1:]]} for r in itertools.islice(reader,max_rows)]
    return validate(rows)

def folds(rows):
    validate(rows);rng=random.Random(SEED);groups=collections.defaultdict(list);result=[[] for _ in range(5)]
    for i,r in enumerate(rows):groups[r['label']].append(i)
    if set(groups)!=set(range(10)) or min(map(len,groups.values()))<5:raise ValueError('The sample needs at least five images of every label 0–9; increase its prefix cap up to 1000 or choose a documented sample')
    for label,indices in sorted(groups.items()):
        rng.shuffle(indices)
        for offset,index in enumerate(indices):result[offset%5].append(index)
    return result

def vector(pixels,method):
    if method=='raw-centroids':return pixels
    if method!='image-l2-centroids':raise ValueError('Unknown method')
    norm=math.sqrt(sum(x*x for x in pixels))
    return [x/norm for x in pixels] if norm else [0.0]*784

def fit(train,method):
    groups=collections.defaultdict(list)
    for row in train:groups[row['label']].append(vector(row['pixels'],method))
    return {label:[statistics.mean(values) for values in zip(*images)] for label,images in groups.items()}

def predict(centroids,validation,method):
    result=[]
    for row in validation:
        pixels=vector(row['pixels'],method)
        result.append(min(sorted(centroids),key=lambda label:sum((a-b)**2 for a,b in zip(pixels,centroids[label]))))
    return result

def run(rows):
    results=[]
    for number,indices in enumerate(folds(rows),1):
        held=set(indices);train=[r for i,r in enumerate(rows) if i not in held];validation=[rows[i] for i in indices]
        metrics={method:statistics.mean(p==r['label'] for p,r in zip(predict(fit(train,method),validation,method),validation)) for method in METHODS}
        results.append({'split':f'stratified fold {number}','train_size':len(train),'validation_size':len(validation),'metrics':metrics})
    return {'metric':METRIC,'direction':'maximize','fold_results':results,'aggregate':{method:statistics.mean(r['metrics'][method] for r in results) for method in METHODS}}

def main():
    if sys.version_info<(3,11):raise SystemExit('Use Python >=3.11; recorded environment is 3.12.14')
    parser=argparse.ArgumentParser(description=__doc__);mode=parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--fixture',action='store_true');mode.add_argument('--csv',type=Path);parser.add_argument('--max-rows',type=int,default=1000);parser.add_argument('--output',type=Path,default=Path('digit-receipt.json'));args=parser.parse_args()
    tracemalloc.start();start=time.perf_counter();rows=fixture() if args.fixture else load_csv(args.csv,args.max_rows)
    data=json.dumps(rows,sort_keys=True,separators=(',',':')).encode();args.output.with_name(args.output.stem+'-data.json').write_bytes(data);result=run(rows)
    receipt={'schema_version':1,'exercise':'digit-centroids','executed_at':time.strftime('%Y-%m-%d',time.gmtime()),'data_scope':'generated-teaching-fixture' if args.fixture else 'reader-provided-data','data_sha256':hashlib.sha256(data).hexdigest(),'script_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'seed':SEED,'split_definition':SPLIT,'python':platform.python_version(),'platform':platform.system()+' '+platform.machine(),'dependencies':'Python standard library only','hardware_scope':'local CPU; accelerator not used','sample_scope':'all 200 generated patterns' if args.fixture else f'first at most {args.max_rows} authorized CSV rows','row_count':len(rows),'class_counts':dict(collections.Counter(r['label'] for r in rows)),'wall_seconds':time.perf_counter()-start,'memory_scope':'traced-python-allocations','peak_memory_bytes':tracemalloc.get_traced_memory()[1],'limitations':['Generated geometric patterns are not handwritten digits, MNIST or competition data.','A bounded prefix sample may be biased; no full competition dataset was run.','Per-image normalization and training-only centroids do not establish writer-held-out or shifted-image performance.','Mean fold accuracy is not a competition score or historical CNN reproduction.','Memory measures traced Python allocations, not process RSS.'],**result}
    args.output.write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt['aggregate'],indent=2));print('Receipt:',args.output)
if __name__=='__main__':main()
