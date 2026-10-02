"""Generated software tests only: none of these rows are actual Titanic inputs."""
import csv
import hashlib
import importlib.util
import json
import os
import runpy
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / 'public/exercises/titanic-actual-data.py'
spec = importlib.util.spec_from_file_location('titanic_actual_data', SCRIPT)
lab = importlib.util.module_from_spec(spec); spec.loader.exec_module(lab)


def generated_rows():
    return [{'PassengerId': str(10000 + i), 'Sex': 'female' if i % 2 else 'male', 'Pclass': str(1 + i % 3), 'Survived': str(i % 2), 'Name': 'PRIVATE-PERSON-SENTINEL', 'Ticket': 'PRIVATE-TICKET-SENTINEL'} for i in range(60)]


def write_csv(path, rows, fields=None):
    with path.open('w', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=fields or list(rows[0])); writer.writeheader(); writer.writerows(rows)


class TitanicActualDataTests(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.TemporaryDirectory(prefix='titanic-private-software-test-')
        self.addCleanup(self.folder.cleanup)
        self.base = Path(self.folder.name)
        self.train = self.base / 'private-source-name.csv'
        write_csv(self.train, generated_rows())

    def run_generated(self, name='run', **kwargs):
        return lab.run_project(self.train, self.base / name, 'generated-test-data', True, **kwargs)

    def test_draft_blocker_and_all_four_package_pins_match_the_shared_computation(self):
        metadata = json.loads((ROOT / 'src/content/exercises/exercise-titanic-actual-data.json').read_text())
        self.assertEqual(metadata['status'], 'draft')
        self.assertEqual(metadata['project']['readiness'], 'blocked')
        self.assertNotIn('receipt_path', metadata)
        self.assertNotIn('data_path', metadata)
        package = metadata['project']['package']
        for kind, path in [('script', metadata['script_path']), ('notebook', package['notebook_path']), ('environment', package['environment_path']), ('helper', package['helper_path'])]:
            self.assertEqual(package[kind + '_sha256'], lab.sha(ROOT / 'public' / path.lstrip('/')))
        self.assertEqual(package['helper_sha256'], lab.HELPER_SHA256)
        self.assertEqual(metadata['project']['baseline'], lab.BASELINE)
        self.assertEqual(metadata['project']['controlled_change'], lab.CHANGE)
        self.assertEqual(metadata['project']['diagnostics'], lab.QUESTIONS)

    def test_matches_original_computation_and_known_accuracy_on_fixed_folds(self):
        rows = lab.load_passengers(self.train, True); helper = lab.load_helper()
        result, diagnostics = lab.evaluate(rows, helper)
        self.assertEqual(result, helper.run(rows))
        self.assertEqual(result['aggregate'], {'sex-majority': 1.0, 'sex-class-majority': 1.0})
        self.assertEqual(len(result['fold_results']), 5)
        indices = helper.folds(rows)
        self.assertEqual(sorted(i for fold in indices for i in fold), list(range(60)))
        self.assertEqual(indices, helper.folds(rows))
        self.assertEqual(len(diagnostics[0]['observations']), 5)

    def test_train_only_fit_and_unseen_fallback_never_read_validation_targets(self):
        helper = lab.load_helper()
        train = [{'Sex': 'male', 'Pclass': '1', 'Survived': value} for value in [1, 1, 0]]
        held = [{'Sex': 'female', 'Pclass': 'missing', 'Survived': value} for value in [0, 1]]
        for method in helper.METHODS:
            predictions = helper.predict(train, held, method)
            self.assertEqual(predictions, [1, 1])
            self.assertEqual(predictions, helper.predict(train, [dict(row, Survived=1-row['Survived']) for row in held], method))
        original = helper.predict
        def audit(train_rows, held_rows, method):
            self.assertFalse({row['PassengerId'] for row in train_rows} & {row['PassengerId'] for row in held_rows})
            return original(train_rows, held_rows, method)
        with mock.patch.object(helper, 'predict', audit):
            lab.evaluate(lab.load_passengers(self.train, True), helper)

    def test_missing_groups_are_explicit_and_small_slices_are_suppressed(self):
        rows = generated_rows(); rows[0]['Sex'] = ''; rows[0]['Pclass'] = ''
        write_csv(self.train, rows)
        loaded = lab.load_passengers(self.train, True)
        self.assertEqual((loaded[0]['Sex'], loaded[0]['Pclass']), ('missing', 'missing'))
        _, diagnostics = lab.evaluate(loaded, lab.load_helper())
        self.assertIn('Sex=missing, Pclass=missing: small slice suppressed.', diagnostics[1]['observations'])

    def test_generated_receipt_cannot_claim_actual_data_and_contains_no_private_payload(self):
        receipt = self.run_generated()
        self.assertEqual(receipt['evidence_type'], 'generated-test-data')
        self.assertEqual(receipt['data_scope'], 'generated-teaching-fixture')
        safe = self.base / 'run/safe-review'
        self.assertEqual(sorted(path.name for path in safe.iterdir()), sorted([
            'titanic-actual-data-data.json', 'titanic-actual-data-receipt.json',
            'titanic-actual-data-diagnostic-1.json', 'titanic-actual-data-diagnostic-2.json']))
        for path in safe.iterdir():
            content = path.read_text()
            for private in [str(self.base), self.train.name, 'PRIVATE-PERSON-SENTINEL', 'PRIVATE-TICKET-SENTINEL', 'PassengerId', 'Survived']:
                self.assertNotIn(private, content)
        manifest = json.loads((safe / 'titanic-actual-data-data.json').read_text())
        self.assertEqual(set(manifest), {'kind', 'files'})
        self.assertEqual(manifest['files'], [{'name': 'train.csv', 'sha256': lab.sha(self.train), 'bytes': self.train.stat().st_size}])
        self.assertEqual(receipt['data_sha256'], lab.sha(safe / 'titanic-actual-data-data.json'))
        self.assertEqual(set(receipt['code_fingerprints']), {'script_sha256', 'notebook_sha256', 'environment_sha256', 'helper_sha256'})
        for item in receipt['diagnostics']:
            self.assertEqual(item['sha256'], lab.sha(safe / Path(item['path']).name))
        self.assertGreater(receipt['peak_memory_bytes'], 0)
        self.assertGreaterEqual(receipt['wall_seconds'], 0)

    def test_pinned_helper_change_is_rejected_before_import(self):
        with mock.patch.object(Path, 'read_bytes', return_value=b'untrusted helper bytes'):
            with self.assertRaisesRegex(ValueError, 'helper fingerprint changed'):
                lab.load_helper()

    def test_bad_inputs_or_missing_authorization_leave_no_output(self):
        for rows in [generated_rows() + [generated_rows()[0]], [dict(row, Survived='2') for row in generated_rows()], [dict(row, Sex='untrusted') for row in generated_rows()], generated_rows()[:6]]:
            write_csv(self.train, rows)
            with self.assertRaises(ValueError): self.run_generated()
            self.assertFalse((self.base / 'run').exists())
        with self.assertRaisesRegex(ValueError, 'authorized'):
            lab.run_project(self.train, self.base / 'run', 'generated-test-data', False)
        with self.assertRaisesRegex(ValueError, 'Declare'):
            lab.run_project(self.train, self.base / 'run', None, True)

    def test_private_path_guard_rejects_git_web_roots_and_symlinks(self):
        repository = self.base / 'checkout'; repository.mkdir(); (repository / '.git').mkdir()
        public = self.base / 'public'; public.mkdir()
        link = self.base / 'linked-output'; link.symlink_to(public, target_is_directory=True)
        for path in [repository / 'train.csv', public / 'output', link / 'output']:
            with self.assertRaises(ValueError): lab.private_path(path)

    def test_input_change_during_evaluation_rejects_candidate_receipt(self):
        original = lab.evaluate
        def mutate(rows, helper):
            result = original(rows, helper)
            self.train.write_text(self.train.read_text() + '\n')
            return result
        with mock.patch.object(lab, 'evaluate', mutate):
            with self.assertRaisesRegex(ValueError, 'Input changed'): self.run_generated()
        self.assertFalse((self.base / 'run').exists())

    def test_check_to_manifest_mutation_keeps_digest_and_size_of_parsed_snapshot(self):
        captured = self.train.read_bytes()
        original_sha = lab.sha
        mutated = False
        evaluated = False
        original_evaluate = lab.evaluate
        def mark_evaluated(rows, helper):
            nonlocal evaluated
            result = original_evaluate(rows, helper)
            evaluated = True
            return result
        def mutate_after_hash(path):
            nonlocal mutated
            digest = original_sha(path)
            if Path(path).resolve() == self.train.resolve() and evaluated and not mutated:
                # Simulate mutation immediately after the consistency check returns
                # its digest; the manifest must never re-read these different bytes.
                self.train.write_bytes(captured + b'\n')
                mutated = True
            return digest
        with mock.patch.object(lab, 'evaluate', mark_evaluated), mock.patch.object(lab, 'sha', mutate_after_hash):
            receipt = self.run_generated()
        self.assertTrue(mutated)
        self.assertNotEqual(original_sha(self.train), hashlib.sha256(captured).hexdigest())
        self.assertEqual(receipt['input_manifest']['files'], [
            {'name': 'train.csv', 'sha256': hashlib.sha256(captured).hexdigest(), 'bytes': len(captured)}
        ])
        self.assertEqual(receipt['aggregate'], {'sex-majority': 1.0, 'sex-class-majority': 1.0})

    def test_submission_shape_identity_binary_values_and_private_location(self):
        test = self.base / 'test-private.csv'
        rows = [{'PassengerId': str(20000+i), 'Sex': 'female' if i % 2 else 'male', 'Pclass': str(1+i % 3)} for i in range(12)]
        write_csv(test, rows)
        self.run_generated(test_csv=test)
        submission = self.base / 'run/submission.csv'
        lab.validate_submission(submission, rows)
        self.assertFalse((self.base / 'run/safe-review/submission.csv').exists())
        with submission.open(newline='') as stream: valid = list(csv.DictReader(stream))
        for invalid in [valid[:-1], valid[::-1], valid + [valid[0]], [dict(row, Survived='0.5') for row in valid]]:
            write_csv(submission, invalid)
            with self.assertRaises(ValueError): lab.validate_submission(submission, rows)
        write_csv(submission, valid, ['Survived', 'PassengerId'])
        with self.assertRaisesRegex(ValueError, 'header'): lab.validate_submission(submission, rows)

    def test_test_labels_and_overlapping_train_ids_are_rejected(self):
        test = self.base / 'test.csv'
        write_csv(test, generated_rows())
        with self.assertRaisesRegex(ValueError, 'must not contain survival labels'): self.run_generated(test_csv=test)
        write_csv(test, [{key:value for key,value in row.items() if key != 'Survived'} for row in generated_rows()])
        with self.assertRaisesRegex(ValueError, 'must not overlap'): self.run_generated(test_csv=test)

    def test_notebook_delegates_to_identical_runner_results_without_saved_outputs(self):
        notebook = json.loads(SCRIPT.with_suffix('.ipynb').read_text())
        code = [cell for cell in notebook['cells'] if cell['cell_type'] == 'code']
        self.assertEqual(len(code), 1); self.assertEqual(code[0]['outputs'], [])
        expected = self.run_generated('script-run')
        env = {'TITANIC_TRAIN_CSV': str(self.train), 'TITANIC_OUTPUT_DIR': str(self.base / 'notebook-run'), 'TITANIC_DATA_KIND':'generated-test-data'}
        old_directory = Path.cwd()
        try:
            os.chdir(SCRIPT.parent)
            with mock.patch.dict(os.environ, env, clear=True), mock.patch.object(sys, 'argv', []):
                exec(''.join(code[0]['source']), {})
        finally:
            os.chdir(old_directory)
        observed = json.loads((self.base / 'notebook-run/safe-review/titanic-actual-data-receipt.json').read_text())
        for key in ['aggregate', 'fold_results', 'input_manifest', 'code_fingerprints', 'diagnostics']:
            self.assertEqual(expected[key], observed[key])
        with self.assertRaisesRegex(ValueError, 'never overwritten'): self.run_generated('script-run')

if __name__ == '__main__':
    unittest.main()
