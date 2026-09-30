import csv,importlib.util,json,tempfile,unittest
from pathlib import Path
SCRIPT=Path(__file__).resolve().parents[1]/'public/exercises/titanic-group-rules.py'
spec=importlib.util.spec_from_file_location('passenger_lab',SCRIPT);lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
class TitanicExerciseTests(unittest.TestCase):
    def test_stratified_folds_validate_once_and_preserve_classes(self):
        rows=lab.fixture();folds=lab.folds(rows)
        self.assertEqual(sorted(i for f in folds for i in f),list(range(len(rows))))
        self.assertTrue(all({rows[i]['Survived'] for i in f}=={0,1} for f in folds))
        self.assertEqual(folds,lab.folds(rows))
    def test_validation_labels_cannot_change_predictions(self):
        train=lab.fixture()[:100];held=lab.fixture()[100:]
        flipped=[dict(r,Survived=1-r['Survived']) for r in held]
        for method in lab.METHODS:self.assertEqual(lab.predict(train,held,method),lab.predict(train,flipped,method))
    def test_group_fallback_and_tie_are_training_only(self):
        train=[dict(Sex='male',Pclass='1',Survived=1),dict(Sex='male',Pclass='1',Survived=0)]
        self.assertEqual(lab.predict(train,[dict(Sex='female',Pclass='3')],'sex-class-majority'),[0])
    def test_csv_mode_matches_fixture_and_rejects_duplicate_ids(self):
        rows=lab.fixture()
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'passengers.csv'
            def write(values):
                with path.open('w',newline='') as handle:
                    writer=csv.DictWriter(handle,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(values)
            write(rows);self.assertEqual(lab.run(rows),lab.run(lab.load_csv(path)))
            write(rows+[rows[0]])
            with self.assertRaises(ValueError):lab.load_csv(path)
    def test_published_receipt_metrics_match_input(self):
        path=SCRIPT.with_name('titanic-group-rules-receipt.json');receipt=json.loads(path.read_text())
        rows=json.loads(path.with_name(path.stem+'-data.json').read_text())
        self.assertEqual(lab.run(rows)['aggregate'],receipt['aggregate'])
if __name__=='__main__':unittest.main()
