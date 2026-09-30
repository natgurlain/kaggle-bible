#!/usr/bin/env python3
"""Original Kaggle Bible text-feature lab. Python >=3.11, standard library only.
Generated template texts are not competition tweets. No network or submission.
"""
import argparse, collections, csv, hashlib, json, math, platform, random, re, statistics, sys, time, tracemalloc
from pathlib import Path
SEED=17
SPLIT='Five target-stratified folds with seed 17; exact normalized duplicate texts rejected; vocabulary and class counts fit training rows only.'
METRIC='positive-class F1 (zero when denominator is zero)'
METHODS=['unigrams','unigrams-and-pairs']
def tokens(text):return re.findall(r'[a-z0-9]+',text.lower())
def features(text,method):
    words=tokens(text)
    return words + (['pair:'+a+'_'+b for a,b in zip(words,words[1:])] if method=='unigrams-and-pairs' else [])
def fixture():
    rng=random.Random(SEED);rows=[]
    events=['fire','flood','storm','earthquake'];safe=['movie','game','practice','concert']
    for i in range(180):
        target=i%2;event=events[(i//2)%4]
        text=(f'{event} reported emergency crews responding district {i}' if target else f'{event} scene in {safe[(i//2)%4]} no emergency district {i}')
        # Fixed fixture perturbation illustrates why one measured fold is not enough.
        if rng.random()<.10:target=1-target
        rows.append({'id':str(i+1),'text':text,'target':target})
    return rows

def validate(rows):
    ids=set();seen=set()
    for row in rows:
        if row['target'] not in (0,1):raise ValueError('target must be binary 0/1')
        normalized=' '.join(tokens(row['text']))
        if not normalized or normalized in seen:raise ValueError('Non-empty unique normalized texts required; declare a grouping/deduplication policy before using repeated tweets')
        if not row['id'] or row['id'] in ids:raise ValueError('id must be non-empty and unique')
        seen.add(normalized);ids.add(row['id'])
    return rows

def load_csv(path):
    with path.open(newline='') as handle:raw=list(csv.DictReader(handle))
    rows=[]
    for r in raw:
        if r['target'] not in ('0','1'):raise ValueError('target must be 0/1')
        rows.append({'id':r['id'],'text':r['text'],'target':int(r['target'])})
    return validate(rows)

def folds(rows):
    validate(rows);rng=random.Random(SEED);groups=collections.defaultdict(list);result=[[] for _ in range(5)]
    for i,r in enumerate(rows):groups[r['target']].append(i)
    if set(groups)!={0,1} or min(map(len,groups.values()))<5:raise ValueError('At least five examples of each class required')
    for label,indices in sorted(groups.items()):
        rng.shuffle(indices)
        for offset,index in enumerate(indices):result[offset%5].append(index)
    return result

def fit(train,method):
    counts=[collections.Counter(),collections.Counter()];documents=[0,0]
    for row in train:counts[row['target']].update(features(row['text'],method));documents[row['target']]+=1
    vocabulary=set(counts[0])|set(counts[1]);totals=[sum(c.values())+len(vocabulary) for c in counts]
    return counts,documents,vocabulary,totals

def predict(model,validation,method):
    counts,documents,vocabulary,totals=model;predictions=[]
    for row in validation:
        words=[word for word in features(row['text'],method) if word in vocabulary]
        scores=[math.log(documents[label]/sum(documents))+sum(math.log((counts[label][word]+1)/totals[label]) for word in words) for label in [0,1]]
        predictions.append(int(scores[1]>scores[0]))
    return predictions

def f1(truth,predictions):
    tp=sum(t==p==1 for t,p in zip(truth,predictions));fp=sum(t==0 and p==1 for t,p in zip(truth,predictions));fn=sum(t==1 and p==0 for t,p in zip(truth,predictions));denominator=2*tp+fp+fn
    return 2*tp/denominator if denominator else 0.0

def run(rows):
    results=[]
    for number,indices in enumerate(folds(rows),1):
        held=set(indices);train=[r for i,r in enumerate(rows) if i not in held];validation=[rows[i] for i in indices];truth=[r['target'] for r in validation]
        metrics={};diagnostics={}
        for method in METHODS:
            predictions=predict(fit(train,method),validation,method);metrics[method]=f1(truth,predictions)
            diagnostics[method]={'true_positives':sum(t==p==1 for t,p in zip(truth,predictions)),'false_positives':sum(t==0 and p==1 for t,p in zip(truth,predictions)),'false_negatives':sum(t==1 and p==0 for t,p in zip(truth,predictions)),'error_ids':[row['id'] for row,p in zip(validation,predictions) if row['target']!=p]}
        results.append({'split':f'stratified fold {number}','train_size':len(train),'validation_size':len(validation),'metrics':metrics,'diagnostics':diagnostics})
    return {'metric':METRIC,'direction':'maximize','fold_results':results,'aggregate':{method:statistics.mean(r['metrics'][method] for r in results) for method in METHODS}}

def main():
    if sys.version_info<(3,11):raise SystemExit('Use Python >=3.11; recorded environment is 3.12.14')
    parser=argparse.ArgumentParser(description=__doc__);mode=parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--fixture',action='store_true');mode.add_argument('--csv',type=Path);parser.add_argument('--output',type=Path,default=Path('nlp-receipt.json'));args=parser.parse_args()
    tracemalloc.start();start=time.perf_counter();rows=fixture() if args.fixture else load_csv(args.csv)
    data=json.dumps(rows,sort_keys=True,separators=(',',':')).encode();args.output.with_name(args.output.stem+'-data.json').write_bytes(data)
    result=run(rows)
    receipt={'schema_version':1,'exercise':'nlp-word-pairs','executed_at':time.strftime('%Y-%m-%d',time.gmtime()),'data_scope':'generated-teaching-fixture' if args.fixture else 'reader-provided-data','data_sha256':hashlib.sha256(data).hexdigest(),'script_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'seed':SEED,'split_definition':SPLIT,'python':platform.python_version(),'platform':platform.system()+' '+platform.machine(),'dependencies':'Python standard library only','hardware_scope':'local CPU; accelerator not used','wall_seconds':time.perf_counter()-start,'memory_scope':'traced-python-allocations','peak_memory_bytes':tracemalloc.get_traced_memory()[1],'limitations':['Generated template texts are not competition tweets; no leaderboard submission or historical reproduction.','Repeated templates make fixture scores unsuitable for real NLP quality; near-duplicate, entity and temporal transfer are not established.','Aggregate is mean fold positive-class F1, not pooled F1 or a competition score. Exact normalized duplicates are rejected; no silent row removal.','Memory measures traced Python allocations, not process RSS.'],**result}
    args.output.write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt['aggregate'],indent=2))
    for row in receipt['fold_results']:
        for method,diagnostic in row['diagnostics'].items():print(row['split'],method,'F1',round(row['metrics'][method],6),'TP',diagnostic['true_positives'],'FP',diagnostic['false_positives'],'FN',diagnostic['false_negatives'])
    print('Receipt:',args.output)
if __name__=='__main__':main()
