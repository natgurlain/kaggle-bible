"""Generated text software tests only; no actual competition files or quality evidence."""
import csv
import hashlib
import importlib.util
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

ROOT=Path(__file__).resolve().parents[1];SCRIPT=ROOT/'public/exercises/nlp-actual-data.py'
spec=importlib.util.spec_from_file_location('nlp_actual',SCRIPT);lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)

def generated_rows():
    return [{'id':str(10000+i),'text':('fire emergency' if i%2 else 'movie rehearsal')+' district '+str(i)+' PRIVATE-TEXT-SENTINEL','target':str(i%2),'location':'PRIVATE-LOCATION-SENTINEL'}for i in range(60)]

def write_csv(path,rows,fields=None):
    with path.open('w',newline='')as stream:
        writer=csv.DictWriter(stream,fieldnames=fields or list(rows[0]));writer.writeheader();writer.writerows(rows)

class NLPActualDataTests(unittest.TestCase):
    def setUp(self):
        self.folder=tempfile.TemporaryDirectory(prefix='nlp-private-test-');self.addCleanup(self.folder.cleanup);self.base=Path(self.folder.name);self.train=self.base/'private-source-name.csv';write_csv(self.train,generated_rows())
    def run_generated(self,name='run',**kwargs):return lab.run_project(self.train,self.base/name,'generated-test-data',True,**kwargs)

    def test_blocked_metadata_and_all_four_pins(self):
        metadata=json.loads((ROOT/'src/content/exercises/exercise-nlp-actual-data.json').read_text());package=metadata['project']['package'];self.assertEqual(metadata['status'],'draft');self.assertEqual(metadata['project']['readiness'],'blocked');self.assertNotIn('receipt_path',metadata);self.assertNotIn('data_path',metadata)
        for kind,path in [('script',metadata['script_path']),('notebook',package['notebook_path']),('environment',package['environment_path']),('helper',package['helper_path'])]:self.assertEqual(package[kind+'_sha256'],lab.sha(ROOT/'public'/path.lstrip('/')))
        self.assertEqual(metadata['project']['diagnostics'],lab.QUESTIONS)

    def test_same_original_methods_folds_metrics_and_once_only_evaluation(self):
        helper=lab.load_helper();rows=lab.load_texts(self.train,True,helper);measured,diagnostics,errors=lab.evaluate(rows,helper);original=helper.run(rows)
        self.assertEqual(measured['aggregate'],original['aggregate'])
        self.assertEqual(measured['fold_results'],[{k:v for k,v in row.items()if k!='diagnostics'}for row in original['fold_results']])
        self.assertEqual(sorted(i for fold in helper.folds(rows)for i in fold),list(range(60)));self.assertEqual(len(diagnostics[0]['observations']),5)
        self.assertTrue(all(set(row)=={'split','train_size','validation_size','metrics'}for row in measured['fold_results']))

    def test_vocabulary_counts_and_predictions_never_use_held_targets_or_new_tokens(self):
        helper=lab.load_helper();train=[{'id':'1','text':'positive signal','target':1},{'id':'2','text':'negative signal','target':0}];held=[{'id':'3','text':'never-seen-token positive','target':0}]
        for method in helper.METHODS:
            model=helper.fit(train,method);self.assertNotIn('never',model[2]);self.assertNotIn('pair:never_seen',model[2]);pred=helper.predict(model,held,method);self.assertEqual(pred,helper.predict(model,[dict(r,target=1)for r in held],method));self.assertEqual(model,helper.fit(train,method))
        self.assertIn('pair:positive_signal',helper.fit(train,'unigrams-and-pairs')[2]);self.assertNotIn('pair:positive_signal',helper.fit(train,'unigrams')[2])

    def test_positive_class_f1_oracle_and_zero_denominator(self):
        helper=lab.load_helper();truth=[1,1,0,0];pred=[1,0,1,0];self.assertEqual(lab.confusion(truth,pred),{'TP':1,'FP':1,'FN':1,'TN':1});self.assertEqual(helper.f1(truth,pred),.5);self.assertEqual(helper.f1([0,0],[0,0]),0);self.assertEqual(helper.f1([1],[0]),0)

    def test_normalized_duplicate_blank_and_invalid_target_rejected_without_dropping(self):
        helper=lab.load_helper()
        for replacement in [generated_rows()[0]['text'].upper()+'!!!','!!!','']:
            rows=generated_rows();rows[-1]['text']=replacement;write_csv(self.train,rows)
            with self.assertRaisesRegex(ValueError,'unique token-normalized'):self.run_generated()
        for target in ['2','','true']:
            rows=generated_rows();rows[-1]['target']=target;write_csv(self.train,rows)
            with self.assertRaisesRegex(ValueError,'binary'):self.run_generated()
        self.assertFalse((self.base/'run').exists())

    def test_near_template_overlap_warns_but_never_groups_or_removes_primary_rows(self):
        helper=lab.load_helper();rows=lab.load_texts(self.train,True,helper);_,diagnostics,_=lab.evaluate(rows,helper)
        self.assertTrue(all('masked-number template overlap 12 of 12'in x for x in diagnostics[0]['observations']))
        self.assertEqual(len(rows),60);self.assertEqual(lab.template_key('Fire district 123',helper),lab.template_key('Fire district 999',helper))
        self.assertIn('do not group',lab.LIMITS[2]);self.assertFalse(any('PRIVATE' in x for x in diagnostics[0]['observations']))

    def test_confusion_matches_local_errors_without_public_ids_or_excerpts(self):
        rows=generated_rows()
        for i in range(0,60,7):rows[i]['target']=str(1-int(rows[i]['target']))
        write_csv(self.train,rows);receipt=self.run_generated();helper=lab.load_helper();loaded=lab.load_texts(self.train,True,helper);_,diagnostics,errors=lab.evaluate(loaded,helper)
        self.assertTrue(errors)
        with (self.base/'run/local-errors.csv').open()as stream:private=list(csv.DictReader(stream))
        self.assertEqual(len(private),len(errors));self.assertTrue(all(r['text']and r['id']for r in private));self.assertFalse((self.base/'run/safe-review/local-errors.csv').exists())
        for method in helper.METHODS:
            diagnostic=next(x for x in diagnostics[1]['observations']if x.startswith(method+':'));method_errors=[r for r in errors if r['method']==method];self.assertIn('FP '+str(sum(r['error_type']=='false-positive'for r in method_errors)),diagnostic);self.assertIn('FN '+str(sum(r['error_type']=='false-negative'for r in method_errors)),diagnostic)
        self.assertEqual(receipt['aggregate'],helper.run(loaded)['aggregate'])

    def test_safe_review_manifest_privacy_and_diagnostic_hashes(self):
        receipt=self.run_generated();safe=self.base/'run/safe-review';text=''.join(p.read_text()for p in safe.iterdir())
        for token in ['PRIVATE-TEXT','PRIVATE-LOCATION',str(self.base),'private-source-name','error_ids','district','"10000"']:self.assertNotIn(token,text)
        self.assertEqual(len(list(safe.iterdir())),4);self.assertEqual(receipt['evidence_type'],'generated-test-data');self.assertEqual(receipt['input_manifest']['files'],[{'name':'train.csv','sha256':lab.sha(self.train),'bytes':self.train.stat().st_size}]);self.assertEqual(set(receipt['code_fingerprints']),{'script_sha256','notebook_sha256','environment_sha256','helper_sha256'})
        for item in receipt['diagnostics']:
            path=safe/Path(item['path']).name;self.assertEqual(item['sha256'],lab.sha(path));self.assertEqual(set(json.loads(path.read_text())),{'summary','observations','limitations'})

    def test_bad_ids_header_shape_and_insufficient_classes_rejected(self):
        for identity in ['001','-1','bad','','10000']:
            rows=generated_rows();rows[-1]['id']=identity;write_csv(self.train,rows)
            with self.assertRaisesRegex(ValueError,'unique non-negative'):self.run_generated()
        rows=generated_rows()[:8];write_csv(self.train,rows)
        with self.assertRaisesRegex(ValueError,'five examples'):self.run_generated()
        self.train.write_text('id,text,target,id\n1,a,0,1\n')
        with self.assertRaisesRegex(ValueError,'unique id'):self.run_generated()
        self.train.write_text('id,text,target\n1,a,0,extra\n')
        with self.assertRaisesRegex(ValueError,'field count'):self.run_generated()
        self.assertFalse((self.base/'run').exists())

    def test_snapshot_hash_and_parse_agree_after_consistency_check_mutation(self):
        captured=self.train.read_bytes();original_sha=lab.sha;mutated=False
        def change(path):
            nonlocal mutated
            digest=original_sha(path)
            if Path(path).resolve()==self.train.resolve()and not mutated:self.train.write_bytes(captured+b'\n');mutated=True
            return digest
        with mock.patch.object(lab,'sha',change):receipt=self.run_generated()
        self.assertTrue(mutated);self.assertEqual(receipt['input_manifest']['files'],[{'name':'train.csv','sha256':hashlib.sha256(captured).hexdigest(),'bytes':len(captured)}])
        original_evaluate=lab.evaluate
        def mutate(rows,helper):
            result=original_evaluate(rows,helper);self.train.write_bytes(self.train.read_bytes()+b'\n');return result
        with mock.patch.object(lab,'evaluate',mutate):
            with self.assertRaisesRegex(ValueError,'Input changed'):self.run_generated('failed')
        self.assertFalse((self.base/'failed').exists())

    def test_private_paths_authorization_no_overwrite_and_helper_pin(self):
        with self.assertRaisesRegex(ValueError,'Confirm'):lab.run_project(self.train,self.base/'run','generated-test-data',False)
        with self.assertRaisesRegex(ValueError,'Declare'):lab.run_project(self.train,self.base/'run',None,True)
        repo=self.base/'checkout';repo.mkdir();(repo/'.git').mkdir();web=self.base/'public';web.mkdir();link=self.base/'link';link.symlink_to(web,target_is_directory=True)
        for path in [repo/'x',web/'x',link/'x']:
            with self.assertRaises(ValueError):lab.private_path(path)
        self.run_generated()
        with self.assertRaisesRegex(ValueError,'new output'):self.run_generated()
        original=Path.read_bytes
        def tamper(path):return original(path)+b'\n'if path.name=='nlp-word-pairs.py'else original(path)
        with mock.patch.object(Path,'read_bytes',tamper):
            with self.assertRaisesRegex(ValueError,'helper fingerprint'):lab.load_helper()

    def test_submission_identity_binary_values_shape_and_private_location(self):
        test=self.base/'test.csv';rows=[{'id':str(0 if i==0 else 20000+i),'text':'novel test '+str(i)}for i in range(12)];write_csv(test,rows);self.run_generated(test_csv=test);path=self.base/'run/submission.csv';lab.validate_submission(path,rows);self.assertFalse((self.base/'run/safe-review/submission.csv').exists())
        with path.open()as stream:valid=list(csv.DictReader(stream))
        for bad in [valid[:-1],valid[::-1],valid+[valid[0]],[dict(r,target='0.5')for r in valid]]:
            write_csv(path,bad)
            with self.assertRaises(ValueError):lab.validate_submission(path,rows)
        write_csv(path,valid,['target','id'])
        with self.assertRaisesRegex(ValueError,'header'):lab.validate_submission(path,rows)

    def test_test_labels_ids_and_normalized_text_overlap_rejected(self):
        test=self.base/'test.csv';write_csv(test,generated_rows())
        with self.assertRaisesRegex(ValueError,'target labels'):self.run_generated(test_csv=test)
        rows=[{k:v for k,v in r.items()if k!='target'}for r in generated_rows()];write_csv(test,rows)
        with self.assertRaisesRegex(ValueError,'id.*overlap'):self.run_generated(test_csv=test)
        for i,row in enumerate(rows):row['id']=str(20000+i)
        write_csv(test,rows)
        with self.assertRaisesRegex(ValueError,'texts must not overlap'):self.run_generated(test_csv=test)
        with self.assertRaisesRegex(ValueError,'requires'):self.run_generated(existing_submission=self.base/'sub.csv')

    def test_notebook_delegates_exact_results_to_runner_with_no_saved_output(self):
        notebook=json.loads(SCRIPT.with_suffix('.ipynb').read_text());code=[c for c in notebook['cells']if c['cell_type']=='code'];self.assertEqual(len(code),1);self.assertEqual(code[0]['outputs'],[]);expected=self.run_generated('script');env={'NLP_TRAIN_CSV':str(self.train),'NLP_OUTPUT_DIR':str(self.base/'notebook'),'NLP_DATA_KIND':'generated-test-data'};old=Path.cwd()
        try:
            os.chdir(SCRIPT.parent)
            with mock.patch.dict(os.environ,env,clear=True),mock.patch.object(sys,'argv',[]):exec(''.join(code[0]['source']),{})
        finally:os.chdir(old)
        actual=json.loads((self.base/'notebook/safe-review/nlp-actual-data-receipt.json').read_text())
        for key in ['fold_results','aggregate','input_manifest','code_fingerprints']:self.assertEqual(actual[key],expected[key])
        self.assertEqual((self.base/'script/local-errors.csv').read_bytes(),(self.base/'notebook/local-errors.csv').read_bytes())

if __name__=='__main__':unittest.main()
