import csv,importlib.util,json,math,tempfile,unittest
from pathlib import Path
SCRIPT=Path(__file__).resolve().parents[1]/'public/exercises/house-neighborhood.py'
spec=importlib.util.spec_from_file_location('house_lab',SCRIPT);lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
class HouseExerciseTests(unittest.TestCase):
    def test_each_row_validates_once(self):
        rows=lab.fixture();folds=lab.folds(rows);self.assertEqual(sorted(i for f in folds for i in f),list(range(len(rows))))
    def test_validation_targets_cannot_change_predictions(self):
        train=lab.fixture()[:100];held=lab.fixture()[100:];changed=[dict(r,SalePrice=1e9) for r in held]
        for method in lab.METHODS:self.assertEqual(lab.predict(train,held,method),lab.predict(train,changed,method))
    def test_unseen_neighborhood_falls_back_to_training_mean(self):
        train=[dict(Neighborhood='known',SalePrice=math.exp(4)),dict(Neighborhood='known',SalePrice=math.exp(6))]
        self.assertEqual(lab.predict(train,[dict(Neighborhood='unseen')],'shrunk-neighborhood-log-mean'),[5.0])
        self.assertEqual(lab.run([dict(Id=str(i),Neighborhood='same',SalePrice=100.0) for i in range(20)])['aggregate'],dict.fromkeys(lab.METHODS,0.0))
    def test_csv_matches_fixture_and_rejects_nonpositive_prices(self):
        rows=lab.fixture()
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'homes.csv'
            def write(values):
                with path.open('w',newline='') as f:
                    w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(values)
            write(rows);self.assertEqual(lab.run(rows),lab.run(lab.load_csv(path)))
            for price in [0,-1,'nan','inf']:
                write([dict(r,SalePrice=price) for r in rows])
                with self.assertRaises(ValueError):lab.load_csv(path)
    def test_receipt_metrics_match_published_input(self):
        path=SCRIPT.with_name('house-neighborhood-receipt.json');receipt=json.loads(path.read_text());rows=json.loads(path.with_name(path.stem+'-data.json').read_text());self.assertEqual(lab.run(rows)['aggregate'],receipt['aggregate'])
if __name__=='__main__':unittest.main()
