"""Behavioral checks for original teaching lab; no competition data or network."""
import csv, hashlib, importlib.util, json, subprocess, sys, tempfile, unittest
from pathlib import Path
SCRIPT=Path(__file__).resolve().parents[1]/'public/exercises/m5-rolling-origin.py'
spec=importlib.util.spec_from_file_location('m5_lab',SCRIPT)
lab=importlib.util.module_from_spec(spec); spec.loader.exec_module(lab)
class M5ExerciseTests(unittest.TestCase):
    def test_forecasts_do_not_read_future(self):
        values=lab.fixture()['growing']; changed=values[:84]+[1e9]*84
        for method in ['seasonal-naive','four-week-mean']:
            self.assertEqual(lab.forecast(values,84,method),lab.forecast(changed,84,method))
    def test_constant_series_has_zero_error_and_fixed_windows(self):
        result=lab.run({'constant':[8.0]*168})
        self.assertEqual(result['aggregate'],{'seasonal-naive':0.0,'four-week-mean':0.0})
        self.assertEqual([r['validation_days'] for r in result['fold_results']],[[85,112],[113,140],[141,168]])
    def test_csv_fixture_equivalence_and_invalid_rows(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'rows.csv'; rows=[(name,i+1,value) for name,series in lab.fixture().items() for i,value in enumerate(series)]
            def write(values):
                with path.open('w',newline='') as out:
                    writer=csv.writer(out);writer.writerow(['series','day','sales']);writer.writerows(values)
            write(rows); self.assertEqual(lab.run(lab.load_csv(path)),lab.run(lab.fixture()))
            write(rows+[rows[0]])
            with self.assertRaises(ValueError):lab.load_csv(path)
            write([('bad',1,-1)])
            with self.assertRaises(ValueError):lab.load_csv(path)
            write([('bad',1,'nan')])
            with self.assertRaises(ValueError):lab.load_csv(path)
    def test_cli_receipt_binds_actual_script_and_input(self):
        with tempfile.TemporaryDirectory() as folder:
            output=Path(folder)/'receipt.json'
            subprocess.run([sys.executable,str(SCRIPT),'--fixture','--output',str(output)],check=True,capture_output=True)
            receipt=json.loads(output.read_text());data=output.with_name('receipt-data.json').read_bytes()
            self.assertEqual(receipt['data_sha256'],hashlib.sha256(data).hexdigest())
            self.assertEqual(receipt['script_sha256'],hashlib.sha256(SCRIPT.read_bytes()).hexdigest())
            self.assertEqual(receipt['aggregate'],lab.run(json.loads(data))['aggregate'])
            self.assertEqual(len(receipt['fold_results']),6)
            self.assertGreater(receipt['peak_memory_bytes'],0)
            self.assertGreaterEqual(receipt['wall_seconds'],0)
if __name__=='__main__':unittest.main()
