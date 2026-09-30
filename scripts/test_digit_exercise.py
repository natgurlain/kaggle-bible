import csv
import importlib.util
import json
import math
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('digits', ROOT / 'public/exercises/digit-centroids.py')
lab = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(lab)

class DigitExerciseTests(unittest.TestCase):
    def test_stratified_folds_cover_each_image_once(self):
        rows = lab.fixture()
        folds = lab.folds(rows)
        self.assertEqual(sorted(i for fold in folds for i in fold), list(range(200)))
        for fold in folds:
            self.assertEqual({label: sum(rows[i]['label'] == label for i in fold) for label in range(10)}, dict.fromkeys(range(10), 4))
        with self.assertRaises(ValueError):
            lab.folds(rows[:49])

    def test_predictions_do_not_use_validation_labels(self):
        rows = lab.fixture()
        held = set(lab.folds(rows)[0])
        train = [row for i, row in enumerate(rows) if i not in held]
        validation = [rows[i] for i in held]
        altered = [{**row, 'label': (row['label'] + 1) % 10} for row in validation]
        for method in lab.METHODS:
            centroids = lab.fit(train, method)
            self.assertEqual(lab.predict(centroids, validation, method), lab.predict(centroids, altered, method))

    def test_blank_and_brightness_normalization(self):
        self.assertEqual(lab.vector([0]*784, 'image-l2-centroids'), [0.0]*784)
        a = lab.vector([1, 2] + [0]*782, 'image-l2-centroids')
        b = lab.vector([10, 20] + [0]*782, 'image-l2-centroids')
        for x, y in zip(a, b):
            self.assertAlmostEqual(x, y)
        self.assertTrue(all(math.isfinite(x) for x in a))

    def test_shape_range_and_label_rejected(self):
        for row in [{'label': 10, 'pixels': [0]*784}, {'label': 0, 'pixels': [0]*783}, {'label': 0, 'pixels': [float('nan')]*784}, {'label': 0, 'pixels': [256]*784}]:
            with self.assertRaises(ValueError):
                lab.validate([row])

    def test_csv_prefix_and_exact_column_contract(self):
        rows = lab.fixture()
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder)/'train.csv'
            header = ['label'] + ['pixel'+str(i) for i in range(784)]
            with path.open('w', newline='') as handle:
                writer = csv.writer(handle)
                writer.writerow(header)
                writer.writerows([row['label'], *row['pixels']] for row in rows)
            self.assertEqual(lab.load_csv(path), rows)
            self.assertEqual(len(lab.load_csv(path, 50)), 50)
            lab.folds(lab.load_csv(path, 50))
            for cap in [49, 1001]:
                with self.assertRaises(ValueError):
                    lab.load_csv(path, cap)
            path.write_text('pixel0,label\n1,0\n')
            with self.assertRaises(ValueError):
                lab.load_csv(path)

    def test_published_receipt_matches_exact_fixture(self):
        rows = json.loads((ROOT/'public/exercises/digit-centroids-receipt-data.json').read_text())
        receipt = json.loads((ROOT/'public/exercises/digit-centroids-receipt.json').read_text())
        self.assertEqual(rows, lab.fixture())
        results = lab.run(rows)
        self.assertEqual(results['fold_results'], receipt['fold_results'])
        self.assertEqual(results['aggregate'], receipt['aggregate'])
        self.assertEqual(receipt['row_count'], 200)
        self.assertEqual(receipt['class_counts'], dict.fromkeys(map(str, range(10)), 20))

if __name__ == '__main__':
    unittest.main()
