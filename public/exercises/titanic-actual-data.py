#!/usr/bin/env python3
"""Private-input Titanic project. No downloads, network, uploads, or raw public artifacts."""
import argparse
import collections
import csv
import hashlib
import types
import json
import os
import platform
import statistics
import sys
import time
import tracemalloc
from pathlib import Path

SLUG = 'titanic-actual-data'
HELPER_SHA256 = 'f6c9251a09490dd775edab867fa326b09633fee5afc1846d2b590d46d78cf0dd'
PROVENANCE = 'https://www.kaggle.com/competitions/titanic/data'
BASELINE = 'Fit sex-majority using training rows only on the fixed five stratified folds.'
CHANGE = 'Compare sex-class-majority on exactly the same folds; retain worse outcomes.'
QUESTIONS = [
    'Do the two methods agree in direction across all five unchanged folds?',
    'Which sufficiently large sex/class slices have more errors, and what does the split omit?',
]
LIMITS = [
    'This is an original learner experiment, not a historical solution reproduction or leaderboard score.',
    'Five random stratified folds do not isolate passenger families or shared tickets.',
    'Aggregate accuracy is the unweighted mean of fold accuracies, not Kaggle test accuracy.',
    'Small diagnostic slices below ten rows are suppressed; no row predictions or identifiers are public.',
    'Memory measures traced Python allocations, not process RSS; runtime covers this local run only.',
    'Input origin and authorization are operator declarations requiring independent review before publication.',
]


def sha(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def load_helper():
    path = Path(__file__).with_name('titanic-group-rules.py')
    environment = Path(__file__).with_name(f'{SLUG}-environment.txt').read_text()
    if f'Imported helper SHA-256: {HELPER_SHA256}\n' not in environment:
        raise ValueError('Environment must pin the imported helper fingerprint.')
    source = path.read_bytes()
    if hashlib.sha256(source).hexdigest() != HELPER_SHA256:
        raise ValueError('Shared helper fingerprint changed; restore the pinned package before running.')
    # Compile exactly the checked bytes; do not load or emit a bytecode cache.
    helper = types.ModuleType('titanic_pinned_rules')
    helper.__file__ = str(path)
    exec(compile(source, str(path), 'exec'), helper.__dict__)
    return helper


def private_path(path):
    resolved = Path(path).expanduser().resolve()
    if any((parent / '.git').exists() for parent in [resolved, *resolved.parents]):
        raise ValueError('Inputs and outputs must be outside every Git checkout.')
    # A copied package may also be inside a static web root without a .git directory.
    if any(parent.name in ('public', 'dist') for parent in resolved.parents):
        raise ValueError('Inputs and outputs must be outside public/dist directories.')
    return resolved


def load_passengers(path, labeled):
    with Path(path).open(newline='', encoding='utf-8-sig') as stream:
        reader = csv.DictReader(stream)
        required = {'PassengerId', 'Sex', 'Pclass'} | ({'Survived'} if labeled else set())
        if not reader.fieldnames or len(reader.fieldnames) != len(set(reader.fieldnames)) or not required.issubset(reader.fieldnames):
            raise ValueError('CSV needs unique PassengerId, Sex, Pclass columns and Survived for training.')
        if not labeled and 'Survived' in reader.fieldnames:
            raise ValueError('Test CSV must not contain survival labels.')
        rows = []
        ids = set()
        for raw in reader:
            if None in raw or any(raw.get(key) is None for key in required):
                raise ValueError('CSV row field count does not match the header.')
            passenger_id = (raw.get('PassengerId') or '').strip()
            if not passenger_id.isascii() or not passenger_id.isdecimal() or int(passenger_id) <= 0 or passenger_id != str(int(passenger_id)) or passenger_id in ids:
                raise ValueError('PassengerId must be a unique positive integer in canonical decimal form.')
            ids.add(passenger_id)
            sex = (raw.get('Sex') or '').strip().lower()
            pclass = (raw.get('Pclass') or '').strip()
            if sex not in ('female', 'male', '') or pclass not in ('1', '2', '3', ''):
                raise ValueError('Sex must be female/male/empty; Pclass must be 1/2/3/empty.')
            row = {'PassengerId': passenger_id, 'Sex': sex or 'missing', 'Pclass': pclass or 'missing'}
            if labeled:
                if raw.get('Survived') not in ('0', '1'):
                    raise ValueError('Survived must be 0 or 1 for every training row.')
                row['Survived'] = int(raw['Survived'])
            rows.append(row)
    if not rows:
        raise ValueError('CSV contains no passenger rows.')
    return rows


def evaluate(rows, helper):
    assignments = helper.folds(rows)
    if len(assignments) != 5 or sorted(index for fold in assignments for index in fold) != list(range(len(rows))):
        raise ValueError('Five folds must validate every row exactly once.')
    predictions = {method: {} for method in helper.METHODS}
    results = []
    fold_observations = []
    for number, indices in enumerate(assignments, 1):
        held = set(indices)
        train_indices = [index for index in range(len(rows)) if index not in held]
        if held.intersection(train_indices):
            raise ValueError('Train/validation overlap detected.')
        train = [rows[index] for index in train_indices]
        validation = [rows[index] for index in indices]
        metrics = {}
        for method in helper.METHODS:
            predicted = helper.predict(train, validation, method)
            metrics[method] = statistics.mean(int(value == row['Survived']) for value, row in zip(predicted, validation))
            predictions[method].update(zip(indices, predicted))
        results.append({'split': f'stratified fold {number}', 'train_size': len(train), 'validation_size': len(validation), 'metrics': metrics})
        split_hash = hashlib.sha256(json.dumps({'train': train_indices, 'validation': indices}, separators=(',', ':')).encode()).hexdigest()
        delta = metrics['sex-class-majority'] - metrics['sex-majority']
        fold_observations.append(f'Fold {number}: change minus baseline accuracy {delta:.12g}; membership SHA-256 {split_hash}; overlap zero.')
    aggregate = {method: statistics.mean(row['metrics'][method] for row in results) for method in helper.METHODS}
    slices = collections.defaultdict(list)
    for index, row in enumerate(rows):
        slices[(row['Sex'], row['Pclass'])].append(index)
    slice_observations = []
    for (sex, pclass), indices in sorted(slices.items()):
        if len(indices) < 10:
            slice_observations.append(f'Sex={sex}, Pclass={pclass}: small slice suppressed.')
        else:
            errors = {method: sum(predictions[method][index] != rows[index]['Survived'] for index in indices) for method in helper.METHODS}
            slice_observations.append(f'Sex={sex}, Pclass={pclass}: {len(indices)} out-of-fold rows; baseline errors {errors["sex-majority"]}; change errors {errors["sex-class-majority"]}.')
    diagnostics = [
        {'summary': 'Same five folds, train-only rules and fallback, both measured configurations retained.', 'observations': fold_observations, 'limitations': LIMITS[:3]},
        {'summary': 'Aggregated out-of-fold error slices; no personal records or predictions exported.', 'observations': slice_observations, 'limitations': [LIMITS[1], LIMITS[3]]},
    ]
    return {'metric': helper.METRIC, 'direction': 'maximize', 'fold_results': results, 'aggregate': aggregate}, diagnostics


def validate_submission(path, test_rows):
    with Path(path).open(newline='', encoding='utf-8') as stream:
        reader = csv.DictReader(stream)
        if reader.fieldnames != ['PassengerId', 'Survived']:
            raise ValueError('Submission header must be PassengerId,Survived exactly.')
        submitted = list(reader)
    if len(submitted) != len(test_rows) or [row.get('PassengerId') for row in submitted] != [row['PassengerId'] for row in test_rows]:
        raise ValueError('Submission must contain each test PassengerId once in input order.')
    if any(set(row) != {'PassengerId', 'Survived'} or row.get('Survived') not in ('0', '1') for row in submitted):
        raise ValueError('Submission predictions must be binary and rows must contain exactly two fields.')


def write_json(path, value):
    Path(path).write_text(json.dumps(value, indent=2, sort_keys=True) + '\n', encoding='utf-8')


def run_project(train_csv, output_dir, data_kind, acknowledged, test_csv=None, existing_submission=None):
    if not acknowledged:
        raise ValueError('Confirm authorized private inputs with --acknowledge-authorized-data.')
    if data_kind not in ('competition-data', 'generated-test-data'):
        raise ValueError('Declare --data-kind competition-data or generated-test-data explicitly.')
    train_path, output = private_path(train_csv), private_path(output_dir)
    test_path = private_path(test_csv) if test_csv else None
    submission_to_check = private_path(existing_submission) if existing_submission else None
    if submission_to_check and not test_path:
        raise ValueError('Submission validation requires --test-csv.')
    if output.exists():
        raise ValueError('Use a new output directory; existing receipts are never overwritten.')
    helper = load_helper()
    tracemalloc.start()
    start = time.perf_counter()
    try:
        input_hashes = {path: sha(path) for path in [train_path, test_path] if path}
        rows = load_passengers(train_path, True)
        test_rows = load_passengers(test_path, False) if test_path else None
        if test_rows and {row['PassengerId'] for row in rows}.intersection(row['PassengerId'] for row in test_rows):
            raise ValueError('Train and test PassengerId sets must not overlap.')
        if submission_to_check:
            validate_submission(submission_to_check, test_rows)
        measured, diagnostics = evaluate(rows, helper)
        if any(sha(path) != digest for path, digest in input_hashes.items()):
            raise ValueError('Input changed during execution; rerun with frozen private files.')
        manifest = {'kind': 'fingerprint-only', 'files': [
            {'name': name, 'sha256': sha(path), 'bytes': path.stat().st_size}
            for name, path in [('train.csv', train_path), ('test.csv', test_path)] if path
        ]}
        output.mkdir(parents=True, mode=0o700)
        safe = output / 'safe-review'; safe.mkdir(mode=0o700)
        manifest_path = safe / f'{SLUG}-data.json'; write_json(manifest_path, manifest)
        diagnostic_refs = []
        for number, (question, diagnostic) in enumerate(zip(QUESTIONS, diagnostics), 1):
            path = safe / f'{SLUG}-diagnostic-{number}.json'; write_json(path, diagnostic)
            diagnostic_refs.append({'question': question, 'path': f'/exercises/{path.name}', 'sha256': sha(path)})
        if test_rows:
            predictions = helper.predict(rows, test_rows, 'sex-class-majority')
            submission = output / 'submission.csv'
            with submission.open('w', newline='', encoding='utf-8') as stream:
                writer = csv.writer(stream); writer.writerow(['PassengerId', 'Survived'])
                writer.writerows((row['PassengerId'], value) for row, value in zip(test_rows, predictions))
            validate_submission(submission, test_rows)
        fingerprints = {f'{kind}_sha256': sha(Path(__file__).with_name(name)) for kind, name in [
            ('script', f'{SLUG}.py'), ('notebook', f'{SLUG}.ipynb'), ('environment', f'{SLUG}-environment.txt'), ('helper', 'titanic-group-rules.py'),
        ]}
        receipt = {
            'schema_version': 1, 'exercise': SLUG, 'executed_at': time.strftime('%Y-%m-%d', time.gmtime()),
            'execution_status': 'succeeded', 'evidence_type': 'actual-data' if data_kind == 'competition-data' else 'generated-test-data',
            'data_scope': 'competition-data' if data_kind == 'competition-data' else 'generated-teaching-fixture',
            'input_manifest': manifest, 'data_sha256': sha(manifest_path), 'script_sha256': fingerprints['script_sha256'],
            'code_fingerprints': fingerprints, 'provenance_url': PROVENANCE,
            'authorization': 'Operator affirms authorized access to private inputs; origin and permission require review before publication.' if data_kind == 'competition-data' else 'Generated software-test rows; no actual Titanic data or access evidence.',
            'configuration': {'baseline': BASELINE, 'controlled_change': CHANGE}, 'diagnostics': diagnostic_refs,
            'seed': helper.SEED, 'split_definition': helper.SPLIT, 'python': platform.python_version(),
            'platform': platform.system() + ' ' + platform.machine(), 'dependencies': 'Python standard library only',
            'wall_seconds': time.perf_counter() - start, 'memory_scope': 'traced-python-allocations',
            'peak_memory_bytes': tracemalloc.get_traced_memory()[1], 'limitations': LIMITS, **measured,
        }
        write_json(safe / f'{SLUG}-receipt.json', receipt)
        return receipt
    finally:
        tracemalloc.stop()


def main():
    if sys.version_info < (3, 11):
        raise SystemExit('Use Python >=3.11; the declared environment is pinned in the package.')
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--train-csv', default=os.environ.get('TITANIC_TRAIN_CSV'))
    parser.add_argument('--test-csv', default=os.environ.get('TITANIC_TEST_CSV'))
    parser.add_argument('--output-dir', default=os.environ.get('TITANIC_OUTPUT_DIR'))
    parser.add_argument('--data-kind', choices=['competition-data', 'generated-test-data'], default=os.environ.get('TITANIC_DATA_KIND'))
    parser.add_argument('--acknowledge-authorized-data', action='store_true')
    parser.add_argument('--validate-submission')
    args = parser.parse_args()
    if not args.train_csv or not args.output_dir:
        parser.error('Set --train-csv/--output-dir or TITANIC_TRAIN_CSV/TITANIC_OUTPUT_DIR to private paths.')
    try:
        run_project(args.train_csv, args.output_dir, args.data_kind, args.acknowledge_authorized_data, args.test_csv, args.validate_submission)
    except (csv.Error, UnicodeError):
        raise SystemExit('CSV encoding or parsing failed; inspect the private original file locally.') from None
    except (ValueError, OSError) as error:
        # OS errors can contain private paths; never echo them into a review log.
        raise SystemExit(str(error) if isinstance(error, ValueError) else 'Private file access failed; check paths, permissions and the setup instructions.') from None
    print('Private run completed. Inspect safe-review candidates locally; publication/readiness require independent review.')
    if args.test_csv:
        print('Submission format validated locally. submission.csv contains private identifiers; do not publish or upload automatically.')

if __name__ == '__main__':
    main()
