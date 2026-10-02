"""Generated software checks only; no Ames competition data or access evidence."""
import csv
import hashlib
import importlib.util
import json
import math
import os
import runpy
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'public/exercises/house-actual-data.py'
spec = importlib.util.spec_from_file_location('house_actual_data', SCRIPT)
lab = importlib.util.module_from_spec(spec); spec.loader.exec_module(lab)

def generated_rows():
    return [{'Id': str(10000+i), 'Neighborhood': 'PRIVATE-CATEGORY-'+str(i%3), 'SalePrice': str(50000+10000*i), 'Owner': 'PRIVATE-OWNER-SENTINEL'} for i in range(60)]

def write_csv(path, rows, fields=None):
    with path.open('w', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=fields or list(rows[0])); writer.writeheader(); writer.writerows(rows)

class HouseActualDataTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory(prefix='house-private-test-');self.addCleanup(self.folder.cleanup)
        self.base = Path(self.folder.name); self.train = self.base/'private-source-name.csv';write_csv(self.train, generated_rows())

    def run_generated(self, name='run', **kwargs):
        return lab.run_project(self.train,self.base/name,'generated-test-data',True,**kwargs)

    def test_blocked_candidate_and_all_four_pins(self):
        metadata=json.loads((ROOT/'src/content/exercises/exercise-house-actual-data.json').read_text());package=metadata['project']['package']
        self.assertEqual(metadata['status'],'draft');self.assertEqual(metadata['project']['readiness'],'blocked');self.assertNotIn('receipt_path',metadata);self.assertNotIn('data_path',metadata)
        for kind,path in [('script',metadata['script_path']),('notebook',package['notebook_path']),('environment',package['environment_path']),('helper',package['helper_path'])]:self.assertEqual(package[kind+'_sha256'],lab.sha(ROOT/'public'/path.lstrip('/')))
        self.assertEqual(metadata['project']['diagnostics'],lab.QUESTIONS)

    def test_original_computation_same_folds_and_once_only_residuals(self):
        rows=lab.load_homes(self.train,True);helper=lab.load_helper();measured,diagnostics,residuals=lab.evaluate(rows,helper)
        self.assertEqual(measured,helper.run(rows));self.assertEqual(len(residuals),60);self.assertEqual({r['Id']for r in residuals},{r['Id']for r in rows})
        assignments=helper.folds(rows)
        for fold,indices in enumerate(assignments,1):self.assertEqual({r['Id']for r in residuals if r['fold']==fold},{rows[i]['Id']for i in indices})
        self.assertEqual(len(diagnostics[0]['observations']),5)

    def test_held_targets_cannot_change_predictions_fixed_smoothing_and_fallback(self):
        helper=lab.load_helper();train=[{'Neighborhood':'same','SalePrice':math.exp(4)},{'Neighborhood':'same','SalePrice':math.exp(6)}];held=[{'Neighborhood':'unseen','SalePrice':1},{'Neighborhood':'same','SalePrice':1}]
        for method in helper.METHODS:self.assertEqual(helper.predict(train,held,method),helper.predict(train,[dict(r,SalePrice=1e100)for r in held],method))
        self.assertEqual(helper.predict(train,held,'shrunk-neighborhood-log-mean'),[5,5])
        train=[{'Neighborhood':'a','SalePrice':math.exp(4)},{'Neighborhood':'b','SalePrice':math.exp(6)}]
        self.assertEqual(helper.predict(train,[{'Neighborhood':'a'}],'shrunk-neighborhood-log-mean'),[(4+5*5)/6])

    def test_residual_units_sign_and_private_output(self):
        rows=lab.load_homes(self.train,True);helper=lab.load_helper();_,_,residuals=lab.evaluate(rows,helper)
        for record in residuals:
            for method in helper.METHODS:
                self.assertEqual(record[method+'_log_residual'],record[method+'_log_prediction']-math.log(record['actual_price']))
                self.assertEqual(record[method+'_dollar_residual'],record[method+'_price_prediction']-record['actual_price'])
                self.assertEqual(record[method+'_price_prediction'],math.exp(record[method+'_log_prediction']))
        self.run_generated();private=self.base/'run/oof-residuals.csv';self.assertTrue(private.exists());self.assertFalse((self.base/'run/safe-review/oof-residuals.csv').exists())
        with private.open()as stream:output=list(csv.DictReader(stream))
        self.assertEqual(len(output),60);self.assertEqual(len({r['Id']for r in output}),60)

    def test_fixed_bins_suppression_and_missing_unseen_neighborhoods(self):
        rows=[{'Id':str(i+1),'Neighborhood':''if i%2 else 'unique-'+str(i),'SalePrice':100000.0}for i in range(20)]
        _,diagnostics,residuals=lab.evaluate(rows,lab.load_helper());observations=diagnostics[1]['observations']
        self.assertIn('price below 100000: small slice suppressed.',observations)
        self.assertTrue(any('price 100000 to below 200000: 20 OOF rows' in x for x in observations))
        self.assertTrue(any('neighborhood unseen: 10 OOF rows'in x for x in observations));self.assertEqual(sum(not r['neighborhood_seen']for r in residuals),10)
        self.assertFalse(any('unique-'in x for x in observations))

    def test_safe_manifest_snapshot_and_no_private_rows_names_or_paths(self):
        receipt=self.run_generated();safe=self.base/'run/safe-review';text=''.join(p.read_text()for p in safe.iterdir())
        for token in ['PRIVATE-CATEGORY','PRIVATE-OWNER',str(self.base),'private-source-name','SalePrice','actual_price','log_prediction','10000']:self.assertNotIn(token+'"' if token=='10000'else token,text)
        self.assertEqual(len(list(safe.iterdir())),4);self.assertEqual(receipt['evidence_type'],'generated-test-data')
        self.assertEqual(receipt['input_manifest']['files'],[{'name':'train.csv','sha256':lab.sha(self.train),'bytes':self.train.stat().st_size}])
        self.assertEqual(set(receipt['code_fingerprints']),{'script_sha256','notebook_sha256','environment_sha256','helper_sha256'})
        for item in receipt['diagnostics']:
            path=safe/Path(item['path']).name;self.assertEqual(item['sha256'],lab.sha(path));self.assertEqual(set(json.loads(path.read_text())),{'summary','observations','limitations'})

    def test_invalid_prices_ids_and_csv_shapes_rejected_before_output(self):
        for value in ['0','-1','nan','inf','not-a-price']:
            write_csv(self.train,[dict(r,SalePrice=value)for r in generated_rows()])
            with self.assertRaisesRegex(ValueError,'finite and positive'):self.run_generated()
        for identity in ['001','0','bad','', '10000']:
            rows=generated_rows();rows[-1]['Id']=identity;write_csv(self.train,rows)
            with self.assertRaisesRegex(ValueError,'unique positive'):self.run_generated()
        write_csv(self.train,generated_rows()[:9])
        with self.assertRaisesRegex(ValueError,'ten training'):self.run_generated()
        self.train.write_text('Id,Neighborhood,SalePrice,Id\n1,a,2,1\n')
        with self.assertRaisesRegex(ValueError,'unique Id'):self.run_generated()
        self.assertFalse((self.base/'run').exists())

    def test_exp_overflow_underflow_nonfinite_and_positive_predictions(self):
        for value in [1000,-1000,float('nan'),float('inf')]:
            with self.assertRaises(ValueError):lab.original_price(value)
        self.assertAlmostEqual(lab.original_price(math.log(123)),123)
        helper=lab.load_helper()
        with mock.patch.object(helper,'predict',return_value=[1000]*12):
            with self.assertRaises(ValueError):lab.evaluate(lab.load_homes(self.train,True),helper)

    def test_during_evaluation_mutation_rejects_and_after_check_manifest_binds_snapshot(self):
        original_evaluate=lab.evaluate
        def mutate(rows,helper):
            result=original_evaluate(rows,helper);self.train.write_bytes(self.train.read_bytes()+b'\n');return result
        with mock.patch.object(lab,'evaluate',mutate):
            with self.assertRaisesRegex(ValueError,'Input changed'):self.run_generated()
        self.assertFalse((self.base/'run').exists())
        captured=self.train.read_bytes();original_sha=lab.sha;mutated=False
        def mutate_after_digest(path):
            nonlocal mutated
            digest=original_sha(path)
            if Path(path).resolve()==self.train.resolve()and not mutated:self.train.write_bytes(captured+b'\n');mutated=True
            return digest
        with mock.patch.object(lab,'sha',mutate_after_digest):receipt=self.run_generated()
        self.assertTrue(mutated);self.assertEqual(receipt['input_manifest']['files'],[{'name':'train.csv','sha256':hashlib.sha256(captured).hexdigest(),'bytes':len(captured)}])

    def test_authorization_private_paths_and_no_overwrite(self):
        with self.assertRaisesRegex(ValueError,'Confirm'):lab.run_project(self.train,self.base/'run','generated-test-data',False)
        with self.assertRaisesRegex(ValueError,'Declare'):lab.run_project(self.train,self.base/'run',None,True)
        repo=self.base/'checkout';repo.mkdir();(repo/'.git').mkdir();web=self.base/'public';web.mkdir();link=self.base/'link';link.symlink_to(web,target_is_directory=True)
        for path in [repo/'x',web/'x',link/'x']:
            with self.assertRaises(ValueError):lab.private_path(path)
        self.run_generated();saved=(self.base/'run/safe-review/house-actual-data-receipt.json').read_bytes()
        with self.assertRaisesRegex(ValueError,'new output'):self.run_generated()
        self.assertEqual((self.base/'run/safe-review/house-actual-data-receipt.json').read_bytes(),saved)

    def test_submission_shape_identity_finite_positive_and_private_location(self):
        test=self.base/'test.csv';rows=[{'Id':str(20000+i),'Neighborhood':'unseen'}for i in range(12)];write_csv(test,rows);self.run_generated(test_csv=test)
        submission=self.base/'run/submission.csv';lab.validate_submission(submission,rows);self.assertFalse((self.base/'run/safe-review/submission.csv').exists())
        with submission.open()as stream:valid=list(csv.DictReader(stream))
        for bad in [valid[:-1],valid[::-1],valid+[valid[0]],*[ [dict(r,SalePrice=value)for r in valid]for value in ['0','-1','nan','inf'] ]]:
            write_csv(submission,bad)
            with self.assertRaises(ValueError):lab.validate_submission(submission,rows)
        write_csv(submission,valid,['SalePrice','Id'])
        with self.assertRaisesRegex(ValueError,'header'):lab.validate_submission(submission,rows)

    def test_test_labels_overlap_and_optional_submission_need_test(self):
        test=self.base/'test.csv';write_csv(test,generated_rows())
        with self.assertRaisesRegex(ValueError,'price labels'):self.run_generated(test_csv=test)
        write_csv(test,[{k:v for k,v in r.items()if k!='SalePrice'}for r in generated_rows()])
        with self.assertRaisesRegex(ValueError,'overlap'):self.run_generated(test_csv=test)
        with self.assertRaisesRegex(ValueError,'requires'):self.run_generated(existing_submission=self.base/'submission.csv')

    def test_notebook_is_shared_runner_and_matches_exact_metrics(self):
        notebook=json.loads(SCRIPT.with_suffix('.ipynb').read_text());code=[c for c in notebook['cells']if c['cell_type']=='code'];self.assertEqual(len(code),1);self.assertEqual(code[0]['outputs'],[])
        expected=self.run_generated('script');env={'HOUSE_TRAIN_CSV':str(self.train),'HOUSE_OUTPUT_DIR':str(self.base/'notebook'),'HOUSE_DATA_KIND':'generated-test-data'};old=Path.cwd()
        try:
            os.chdir(SCRIPT.parent)
            with mock.patch.dict(os.environ,env,clear=True),mock.patch.object(sys,'argv',[]):exec(''.join(code[0]['source']),{})
        finally:os.chdir(old)
        actual=json.loads((self.base/'notebook/safe-review/house-actual-data-receipt.json').read_text());self.assertEqual(actual['fold_results'],expected['fold_results']);self.assertEqual(actual['aggregate'],expected['aggregate']);self.assertEqual(actual['input_manifest'],expected['input_manifest']);self.assertEqual(actual['code_fingerprints'],expected['code_fingerprints'])
        self.assertEqual((self.base/'script/oof-residuals.csv').read_bytes(),(self.base/'notebook/oof-residuals.csv').read_bytes())

    def test_helper_tamper_rejected_before_compiling(self):
        original=Path.read_bytes
        def tamper(path):
            source=original(path)
            return source+b'\n'if path.name=='house-neighborhood.py'else source
        with mock.patch.object(Path,'read_bytes',tamper):
            with self.assertRaisesRegex(ValueError,'helper fingerprint'):lab.load_helper()

if __name__=='__main__':unittest.main()
