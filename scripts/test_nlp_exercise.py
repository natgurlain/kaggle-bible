import csv,importlib.util,json,tempfile,unittest
from pathlib import Path
SCRIPT=Path(__file__).resolve().parents[1]/'public/exercises/nlp-word-pairs.py'
spec=importlib.util.spec_from_file_location('nlp_lab',SCRIPT);lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
class NLPExerciseTests(unittest.TestCase):
    def test_all_rows_validate_once(self):
        rows=lab.fixture();folds=lab.folds(rows);self.assertEqual(sorted(i for f in folds for i in f),list(range(len(rows))))
        self.assertTrue(all({rows[i]['target'] for i in f}=={0,1} for f in folds))
    def test_vocabulary_and_predictions_use_training_only(self):
        train=lab.fixture()[:100];held=lab.fixture()[100:];changed=[dict(r,target=1-r['target']) for r in held]
        for method in lab.METHODS:
            model=lab.fit(train,method);self.assertNotIn('heldoutonly',model[2]);self.assertEqual(lab.predict(model,held,method),lab.predict(model,changed,method))
            self.assertEqual(lab.predict(model,[dict(text='heldoutonly')],method),lab.predict(model,[dict(text='')],method))
    def test_f1_matches_analytical_cases(self):
        self.assertEqual(lab.f1([1,1,0,0],[1,0,1,0]),.5)
        self.assertEqual(lab.f1([0,0],[0,0]),0.0)
        self.assertEqual(lab.f1([1,0],[1,0]),1.0)
    def test_csv_equivalence_duplicate_and_empty_rejection(self):
        rows=lab.fixture()
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'texts.csv'
            def write(values):
                with path.open('w',newline='') as handle:
                    w=csv.DictWriter(handle,fieldnames=list(rows[0]));w.writeheader();w.writerows(values)
            write(rows);self.assertEqual(lab.run(rows),lab.run(lab.load_csv(path)))
            write(rows+[dict(rows[0],id='new-id',text=rows[0]['text'].upper())])
            with self.assertRaises(ValueError):lab.load_csv(path)
            write([dict(r,text='!!!') for r in rows])
            with self.assertRaises(ValueError):lab.load_csv(path)
    def test_word_pairs_and_recorded_result(self):
        self.assertEqual(lab.features('Not a fire','unigrams-and-pairs'),['not','a','fire','pair:not_a','pair:a_fire'])
        path=SCRIPT.with_name('nlp-word-pairs-receipt.json');r=json.loads(path.read_text());rows=json.loads(path.with_name(path.stem+'-data.json').read_text());self.assertEqual(lab.run(rows)['aggregate'],r['aggregate'])
if __name__=='__main__':unittest.main()
