#!/usr/bin/env python3
"""Original Kaggle Bible rolling-origin teaching lab. Python >=3.11, stdlib only.
Generated teaching data is not M5 competition data. No network or submission.
"""
import argparse, csv, hashlib, json, math, platform, random, statistics, sys, time, tracemalloc
from pathlib import Path
SEED = 17
SPLIT = 'Three fixed rolling origins: days 1–84, 1–112 and 1–140 train; next 28 days validate for each series.'
METRIC = 'mean absolute error (unweighted; not M5 WRMSSE)'

def fixture():
    rng = random.Random(SEED)
    return {name: [round(max(0, 20 + i * trend + [0,3,4,2,1,8,6][i%7] + rng.gauss(0,2)), 3) for i in range(168)] for name,trend in [('growing',.08),('declining',-.06)]}

def forecast(values, origin, method, horizon=28):
    history = values[:origin]
    if len(history) < 28: raise ValueError('Each origin needs at least 28 historical days')
    if method == 'seasonal-naive': return [history[-7 + i%7] for i in range(horizon)]
    if method == 'four-week-mean': return [statistics.mean(history[-7 + i%7 - 7*j] for j in range(4)) for i in range(horizon)]
    raise ValueError('Unknown forecast method')

def load_csv(path):
    grouped = {}
    with path.open(newline='') as handle:
        for row in csv.DictReader(handle):
            name = row['series']; day = int(row['day']); sales = float(row['sales'])
            if not math.isfinite(sales) or sales < 0: raise ValueError('Sales must be finite and non-negative')
            grouped.setdefault(name, []).append((day,sales))
    result = {}
    for name, entries in grouped.items():
        entries.sort()
        if [day for day,_ in entries] != list(range(1,len(entries)+1)): raise ValueError('Each series needs unique contiguous days starting at 1')
        result[name] = [sales for _,sales in entries]
    if not result: raise ValueError('No series found')
    return result

def run(series):
    results = []
    for origin in [84,112,140]:
        for name,values in sorted(series.items()):
            if len(values) < origin+28: raise ValueError('Each series needs at least 168 daily rows')
            truth = values[origin:origin+28]
            row = {'split':f'{name} origin {origin}', 'series':name,'origin_day':origin,'train_days':[1,origin],'validation_days':[origin+1,origin+28],'train_size':origin,'validation_size':28,'metrics':{}}
            for method in ['seasonal-naive','four-week-mean']:
                predictions = forecast(values,origin,method)
                row['metrics'][method] = statistics.mean(abs(a-b) for a,b in zip(truth,predictions))
            results.append(row)
    return {'metric':METRIC,'direction':'minimize','fold_results':results,'aggregate':{method:statistics.mean(row['metrics'][method] for row in results) for method in ['seasonal-naive','four-week-mean']}}

def main():
    if sys.version_info < (3,11): raise SystemExit('Use Python >=3.11; recorded environment is Python 3.12.14.')
    parser=argparse.ArgumentParser(description=__doc__)
    mode=parser.add_mutually_exclusive_group(required=True);mode.add_argument('--fixture',action='store_true');mode.add_argument('--csv',type=Path)
    parser.add_argument('--output',type=Path,default=Path('m5-receipt.json'));args=parser.parse_args()
    tracemalloc.start();start=time.perf_counter();series=fixture() if args.fixture else load_csv(args.csv)
    data_bytes=json.dumps(series,sort_keys=True,separators=(',',':')).encode()
    data_file=args.output.with_name(args.output.stem+'-data.json');data_file.write_bytes(data_bytes)
    result=run(series)
    receipt={'schema_version':1,'exercise':'m5-rolling-origin','executed_at':time.strftime('%Y-%m-%d',time.gmtime()),'data_scope':'generated-teaching-fixture' if args.fixture else 'reader-provided-data','data_sha256':hashlib.sha256(data_bytes).hexdigest(),'script_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'seed':SEED,'split_definition':SPLIT,'python':platform.python_version(),'platform':platform.system()+' '+platform.machine(),'dependencies':'Python standard library only','hardware_scope':'local CPU; accelerator not used','wall_seconds':time.perf_counter()-start,'memory_scope':'traced-python-allocations','peak_memory_bytes':tracemalloc.get_traced_memory()[1],'limitations':['No historical solution reproduction or leaderboard submission.','Unweighted MAE on two teaching series omits M5 hierarchy, weights and scale normalization.','Memory measures traced Python allocations, not total process RSS.'],**result}
    args.output.write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt['aggregate'],indent=2));print('Receipt:',args.output)
if __name__=='__main__':main()
