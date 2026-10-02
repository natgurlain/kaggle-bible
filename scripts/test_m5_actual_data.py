"""Generated table tests only: no Walmart/M5 inputs, access or execution evidence."""
import csv
import datetime
import hashlib
import importlib.util
import json
import math
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

ROOT=Path(__file__).resolve().parents[1];SCRIPT=ROOT/'public/exercises/m5-actual-data.py'
spec=importlib.util.spec_from_file_location('m5_actual',SCRIPT);lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)

def write_csv(path, rows, fields=None):
    with path.open('w',newline='')as stream:
        writer=csv.DictWriter(stream,fieldnames=fields or list(rows[0]),extrasaction='ignore');writer.writeheader();writer.writerows(rows)

class M5ActualDataTests(unittest.TestCase):
    def setUp(self):
        self.folder=tempfile.TemporaryDirectory(prefix='m5-private-test-');self.addCleanup(self.folder.cleanup);self.base=Path(self.folder.name)
        self.sales=self.base/'private-sales.csv';self.calendar=self.base/'private-calendar.csv';self.prices=self.base/'private-prices.csv';self.scope=self.base/'private-scope.json'
        self.pairs=[('PRIVATE-ITEM-A','PRIVATE-STORE'),('PRIVATE-ITEM-B','PRIVATE-STORE')]
        self.series={self.pairs[0]:[float(day%7+day%3)for day in range(1,1914)],self.pairs[1]:[float(day%11)for day in range(1,1914)]}
        self.sales_rows=[dict(item_id=p[0],store_id=p[1],**{f'd_{day}':value for day,value in enumerate(values,1)})for p,values in self.series.items()];write_csv(self.sales,self.sales_rows)
        first=datetime.date(2010,1,1);self.calendar_rows=[{'d':f'd_{day}','date':str(first+datetime.timedelta(days=day-1)),'wm_yr_wk':str((day-1)//7+1)}for day in range(1,1914)];write_csv(self.calendar,self.calendar_rows)
        self.price_rows=[{'item_id':p[0],'store_id':p[1],'wm_yr_wk':str(week),'sell_price':str(2+i)}for i,p in enumerate(self.pairs)for week in range(1,275)];write_csv(self.prices,self.price_rows)
        self.set_scope('assumed-known-at-week-start')
    def set_scope(self,availability, pairs=None):self.scope.write_text(json.dumps({'series':[{'item_id':a,'store_id':b}for a,b in (pairs if pairs is not None else self.pairs)],'price_availability':availability}))
    def run_generated(self,name='run',**kwargs):return lab.run_project(self.sales,self.calendar,self.prices,self.scope,self.base/name,'generated-test-data',True,**kwargs)
    def loaded(self):
        pairs,availability=lab.load_scope(self.scope.read_bytes());return lab.load_sales(self.sales.read_bytes(),pairs),pairs,lab.load_calendar(self.calendar.read_bytes()),lab.load_prices(self.prices.read_bytes()),availability

    def test_blocked_metadata_and_four_package_pins(self):
        d=json.loads((ROOT/'src/content/exercises/exercise-m5-actual-data.json').read_text());p=d['project']['package'];self.assertEqual(d['status'],'draft');self.assertEqual(d['project']['readiness'],'blocked');self.assertNotIn('receipt_path',d);self.assertNotIn('data_path',d)
        for kind,path in [('script',d['script_path']),('notebook',p['notebook_path']),('environment',p['environment_path']),('helper',p['helper_path'])]:self.assertEqual(p[kind+'_sha256'],lab.sha(ROOT/'public'/path.lstrip('/')))
        self.assertEqual(d['project']['diagnostics'],lab.QUESTIONS)

    def test_helper_forecast_oracles_and_fixed_unchanged_methods(self):
        h=lab.load_helper();values=list(range(1,1914));origin=1829
        self.assertEqual(h.forecast(values,origin,'seasonal-naive',28),[values[origin-7+i%7]for i in range(28)])
        self.assertEqual(h.forecast(values,origin,'four-week-mean',28),[sum(values[origin-7+i%7-7*j]for j in range(4))/4 for i in range(28)])
        measured,_,rows=lab.evaluate(*self.loaded(),h)
        for result,origin in zip(measured['fold_results'],lab.ORIGINS):
            self.assertEqual(result['validation_size'],56);self.assertEqual(result['train_size'],origin*2)
            for method in lab.METHODS:
                errors=[abs(r['actual']-r['forecast'])for r in rows if r['origin']==origin and r['method']==method];self.assertAlmostEqual(result['metrics'][method],sum(errors)/len(errors))

    def test_frozen_series_map_and_complete_twenty_eight_day_coverage_all_origins(self):
        self.run_generated()
        with (self.base/'run/private-forecasts.csv').open()as stream:rows=list(csv.DictReader(stream))
        self.assertEqual(len(rows),2*3*28*2)
        for p in self.pairs:
            for origin in lab.ORIGINS:
                for method in lab.METHODS:self.assertEqual([int(r['day'])for r in rows if (r['item_id'],r['store_id'])==p and int(r['origin'])==origin and r['method']==method],list(range(origin+1,origin+29)))
        mapping=json.loads((self.base/'run/private-series-map.json').read_text());self.assertEqual(mapping['S01'],dict(item_id=self.pairs[0][0],store_id=self.pairs[0][1]));self.assertFalse((self.base/'run/safe-review/private-forecasts.csv').exists())

    def test_future_sales_change_forecasts_scales_weights_never_changes_training_state(self):
        series,pairs,calendar,prices,availability=self.loaded();h=lab.load_helper()
        for position,origin in enumerate(lab.ORIGINS):
            changed={pair:[value if index<origin else value+1000 for index,value in enumerate(values)]for pair,values in series.items()}
            for pair in pairs:
                self.assertEqual(lab.scale(series[pair][:origin]),lab.scale(changed[pair][:origin]))
                for method in lab.METHODS:self.assertEqual(h.forecast(series[pair],origin,method),h.forecast(changed[pair],origin,method))
            self.assertEqual(lab.revenue_weights(series,pairs,calendar,prices,origin,availability),lab.revenue_weights(changed,pairs,calendar,prices,origin,availability))
            before=lab.evaluate(series,pairs,calendar,prices,availability,h)[0]['fold_results'][position]['metrics'];after=lab.evaluate(changed,pairs,calendar,prices,availability,h)[0]['fold_results'][position]['metrics'];self.assertNotEqual(before,after)

    def test_future_prices_and_calendar_events_do_not_enter_past_weights_or_forecast(self):
        series,pairs,calendar,prices,availability=self.loaded()
        for origin in lab.ORIGINS:
            past_weeks={calendar[day][1]for day in range(1,origin+1)};changed={key:value if key[2]in past_weeks else value*100 for key,value in prices.items()}
            self.assertEqual(lab.revenue_weights(series,pairs,calendar,prices,origin,availability),lab.revenue_weights(series,pairs,calendar,changed,origin,availability))
        rows=[dict(r,event_name_1='PRIVATE-FUTURE-EVENT')for r in self.calendar_rows];write_csv(self.calendar,rows)
        self.assertEqual(lab.load_calendar(self.calendar.read_bytes()),calendar)

    def test_scale_first_nonzero_and_undefined_zero_constant_short_history(self):
        self.assertEqual(lab.scale([0,0,2,4,2]),(4,None));self.assertEqual(lab.scale([1,2,4]),(2.5,None))
        for values in [[0,0],[2,2,2],[0,0,5]]:self.assertIsNone(lab.scale(values)[0])
        series,pairs,calendar,prices,availability=self.loaded();series[pairs[0]]=[0.0]*1913;measured,diags,_=lab.evaluate(series,pairs,calendar,prices,availability,lab.load_helper());self.assertEqual(len(measured['fold_results']),3)
        self.assertTrue(any('RMSSE undefined (all-zero' in x for x in diags[0]['observations']));self.assertTrue(all('undefined' in x for x in diags[1]['observations']if 'weighted bottom-slice'in x))

    def test_revenue_weight_oracle_uses_only_last_twenty_eight_past_days(self):
        series,pairs,calendar,prices,availability=self.loaded();origin=1829;weights,reason=lab.revenue_weights(series,pairs,calendar,prices,origin,availability);self.assertIsNone(reason)
        revenues=[sum(series[pair][day-1]*prices[(*pair,calendar[day][1])]for day in range(origin-27,origin+1))for pair in pairs];self.assertEqual(weights,[r/sum(revenues)for r in revenues]);self.assertAlmostEqual(sum(weights),1)
        unverified=lab.revenue_weights(series,pairs,calendar,prices,origin,'unverified');self.assertIsNone(unverified[0]);self.assertIn('unverified',unverified[1])

    def test_missing_price_zero_revenue_and_undefined_scale_never_renormalize_subset(self):
        series,pairs,calendar,prices,availability=self.loaded();origin=1829;key=(*pairs[0],calendar[origin][1]);del prices[key]
        self.assertIsNone(lab.revenue_weights(series,pairs,calendar,prices,origin,availability)[0]);series={pair:[0.0]*1913 for pair in pairs};self.assertIsNone(lab.revenue_weights(series,pairs,calendar,prices,origin,availability)[0])
        measured,diags,_=lab.evaluate(series,pairs,calendar,prices,availability,lab.load_helper());self.assertEqual(measured['aggregate'],dict.fromkeys(lab.METHODS,0));self.assertTrue(any('undefined' in x for x in diags[0]['observations']));self.assertTrue(any('zero or nonfinite total past revenue'in x for x in diags[1]['observations']))

    def test_scale_and_total_revenue_overflow_remain_explicitly_undefined(self):
        self.assertEqual(lab.scale([1e308,0]),(None,'nonfinite training scale'))
        series,pairs,calendar,prices,availability=self.loaded();series={pair:[1e306]*1913 for pair in pairs};prices={key:4.0 for key in prices}
        weights,reason=lab.revenue_weights(series,pairs,calendar,prices,1829,availability);self.assertIsNone(weights);self.assertIn('nonfinite total past revenue',reason)

    def test_scoped_weighted_rmsse_matches_oracle_and_is_never_full_hierarchy(self):
        series,pairs,calendar,prices,availability=self.loaded();_,diags,_=lab.evaluate(series,pairs,calendar,prices,availability,lab.load_helper());origin=1829;weights,_=lab.revenue_weights(series,pairs,calendar,prices,origin,availability)
        for method in lab.METHODS:
            score=0
            for pair,weight in zip(pairs,weights):
                forecast=lab.load_helper().forecast(series[pair],origin,method);truth=series[pair][origin:origin+28];denominator,_=lab.scale(series[pair][:origin]);score+=weight*math.sqrt(sum((a-b)**2 for a,b in zip(truth,forecast))/28/denominator)
            statement=next(x for x in diags[1]['observations']if x.startswith(f'Origin d_{origin} {method}:'));self.assertIn(f'{score:.12g}',statement);self.assertIn('not full-hierarchy WRMSSE',statement)

    def test_scope_cap_duplicate_unknown_and_unselected_missing_series_fail(self):
        for pairs in [[],self.pairs*7,[self.pairs[0],self.pairs[0]]]:
            self.set_scope('unverified',pairs)
            with self.assertRaises(ValueError):self.run_generated()
        self.set_scope('unverified',[('missing','missing')])
        with self.assertRaisesRegex(ValueError,'must exist'):self.run_generated()
        self.scope.write_text(json.dumps({'series':[],'price_availability':'unverified','extra':'PRIVATE'}))
        with self.assertRaisesRegex(ValueError,'exactly'):self.run_generated()
        self.assertFalse((self.base/'run').exists())

    def test_sales_continuity_numeric_and_duplicate_pairs_rejected(self):
        for mutate in [lambda r:r.pop('d_17'),lambda r:r.update(d_1914=1),lambda r:r.update(d_17=-1),lambda r:r.update(d_17='nan')]:
            rows=[dict(r)for r in self.sales_rows];mutate(rows[0]);write_csv(self.sales,rows,list(rows[0]))
            with self.assertRaises(ValueError):self.run_generated()
        write_csv(self.sales,self.sales_rows+[self.sales_rows[0]])
        with self.assertRaisesRegex(ValueError,'must be unique'):self.run_generated()
        self.assertFalse((self.base/'run').exists())

    def test_calendar_alignment_duplicate_week_and_price_key_validation(self):
        for rows in [self.calendar_rows[:-1],self.calendar_rows+[self.calendar_rows[0]],[dict(r,date='2010-01-01')if i==5 else r for i,r in enumerate(self.calendar_rows)],[dict(r,wm_yr_wk='oneweek')for r in self.calendar_rows]]:
            write_csv(self.calendar,rows)
            with self.assertRaises(ValueError):self.run_generated()
        write_csv(self.calendar,self.calendar_rows);write_csv(self.prices,self.price_rows+[self.price_rows[0]])
        with self.assertRaisesRegex(ValueError,'unique'):self.run_generated()
        for value in [0,-1,'inf','nan']:
            rows=[dict(r)for r in self.price_rows];rows[0]['sell_price']=value;write_csv(self.prices,rows)
            with self.assertRaises(ValueError):self.run_generated()

    def test_bounded_price_preparation_retains_only_selected_pairs_and_past_weeks(self):
        rows=self.price_rows+[{'item_id':'UNSELECTED','store_id':'UNSELECTED','wm_yr_wk':'1','sell_price':'not-a-number'}]
        write_csv(self.prices,rows);selected=lab.load_prices(self.prices.read_bytes(),[self.pairs[0]],{'1'})
        self.assertEqual(selected,{(*self.pairs[0],'1'):2.0})
        receipt=self.run_generated();self.assertEqual(len(receipt['fold_results']),3)

    def test_snapshot_manifest_scope_fingerprints_and_public_privacy(self):
        receipt=self.run_generated();safe=self.base/'run/safe-review';text=''.join(p.read_text()for p in safe.iterdir());self.assertEqual(len(list(safe.iterdir())),4)
        for token in ['PRIVATE-ITEM','PRIVATE-STORE','private-sales','private-scope',str(self.base),'item_id','store_id','d_1"']:self.assertNotIn(token,text)
        expected=[{'name':name,'sha256':lab.sha(path),'bytes':path.stat().st_size}for name,path in zip(['sales.csv','calendar.csv','prices.csv','scope.json'],[self.sales,self.calendar,self.prices,self.scope])];self.assertEqual(receipt['input_manifest']['files'],expected);self.assertEqual(receipt['evidence_type'],'generated-test-data');self.assertEqual(set(receipt['code_fingerprints']),{'script_sha256','notebook_sha256','environment_sha256','helper_sha256'})
        for ref in receipt['diagnostics']:
            path=safe/Path(ref['path']).name;self.assertEqual(ref['sha256'],lab.sha(path));self.assertEqual(set(json.loads(path.read_text())),{'summary','observations','limitations'})

    def test_snapshot_mutation_rejects_during_evaluate_and_binds_scope_after_check(self):
        original=lab.evaluate
        def mutate(*args):
            result=original(*args);self.scope.write_bytes(self.scope.read_bytes()+b'\n');return result
        with mock.patch.object(lab,'evaluate',mutate):
            with self.assertRaisesRegex(ValueError,'Input changed'):self.run_generated()
        self.assertFalse((self.base/'run').exists());captured=self.scope.read_bytes();original_sha=lab.sha;mutated=False
        def aftercheck(path):
            nonlocal mutated
            digest=original_sha(path)
            if Path(path).resolve()==self.scope.resolve()and not mutated:self.scope.write_bytes(captured+b'\n');mutated=True
            return digest
        with mock.patch.object(lab,'sha',aftercheck):receipt=self.run_generated()
        self.assertTrue(mutated);self.assertEqual(receipt['input_manifest']['files'][3],{'name':'scope.json','sha256':hashlib.sha256(captured).hexdigest(),'bytes':len(captured)})

    def test_private_paths_authorization_helper_hash_cap_and_no_overwrite(self):
        with self.assertRaisesRegex(ValueError,'Confirm'):lab.run_project(self.sales,self.calendar,self.prices,self.scope,self.base/'run','generated-test-data',False)
        repo=self.base/'repo';repo.mkdir();(repo/'.git').mkdir();web=self.base/'public';web.mkdir();link=self.base/'link';link.symlink_to(web,target_is_directory=True)
        for p in [repo/'x',web/'x',link/'x']:
            with self.assertRaises(ValueError):lab.private_path(p)
        with self.assertRaisesRegex(ValueError,'byte cap'):lab.capture(self.sales,10)
        original=Path.read_bytes
        def tamper(path):return original(path)+b'\n'if path.name=='m5-rolling-origin.py'else original(path)
        with mock.patch.object(Path,'read_bytes',tamper):
            with self.assertRaisesRegex(ValueError,'helper fingerprint'):lab.load_helper()
        self.run_generated()
        with self.assertRaisesRegex(ValueError,'new output'):self.run_generated()

    def test_notebook_shared_runner_exact_metrics_and_private_map_without_saved_outputs(self):
        notebook=json.loads(SCRIPT.with_suffix('.ipynb').read_text());code=[c for c in notebook['cells']if c['cell_type']=='code'];self.assertEqual(len(code),1);self.assertEqual(code[0]['outputs'],[]);expected=self.run_generated('script');env={'M5_SALES_CSV':str(self.sales),'M5_CALENDAR_CSV':str(self.calendar),'M5_PRICES_CSV':str(self.prices),'M5_SCOPE_JSON':str(self.scope),'M5_OUTPUT_DIR':str(self.base/'notebook'),'M5_DATA_KIND':'generated-test-data'};old=Path.cwd()
        try:
            os.chdir(SCRIPT.parent)
            with mock.patch.dict(os.environ,env,clear=True),mock.patch.object(sys,'argv',[]):exec(''.join(code[0]['source']),{})
        finally:os.chdir(old)
        actual=json.loads((self.base/'notebook/safe-review/m5-actual-data-receipt.json').read_text())
        for key in ['aggregate','fold_results','input_manifest','code_fingerprints']:self.assertEqual(actual[key],expected[key])
        self.assertEqual((self.base/'script/private-forecasts.csv').read_bytes(),(self.base/'notebook/private-forecasts.csv').read_bytes())

if __name__=='__main__':unittest.main()
