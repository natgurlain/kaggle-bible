#!/usr/bin/env python3
"""Private-input House Prices project. No downloads, network, uploads, or raw public artifacts."""
import argparse
import collections
import csv
import hashlib
import types
import json
import io
import os
import platform
import statistics
import math
import sys
import time
import tracemalloc
from pathlib import Path

SLUG = 'house-actual-data'
HELPER_SHA256 = 'b50f952c3d40e842ef9ba1f96836c0b2f74743701f07df99ec7d6e30171c6ef7'
PROVENANCE = 'https://www.kaggle.com/competitions/house-prices-advanced-regression-techniques/data'
BASELINE = 'Fit the global training natural-log price mean inside each fixed random fold.'
CHANGE = 'Compare neighborhood means with five fixed pseudo-examples on exactly the same folds; retain worse outcomes.'
QUESTIONS = [
    'Does the neighborhood change help consistently across the same five unchanged random folds?',
    'How do log residuals and original-dollar errors differ across fixed price bins and seen/unseen neighborhoods?',
]
LIMITS = [
    'This is an original learner experiment, not historical reproduction or a leaderboard score.',
    'Five random folds do not establish temporal or spatial transfer.',
    'Aggregate is unweighted mean fold natural-log RMSE, not pooled OOF RMSE; official scoring-formula inspection is unresolved.',
    'Public diagnostic bins below ten rows are suppressed; row residuals and submission identifiers remain private.',
    'Memory measures traced Python allocations, not process RSS; runtime covers this local run only.',
    'Origin and authorization are operator declarations requiring review before publication.',
]


def sha(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def load_helper():
    path = Path(__file__).with_name('house-neighborhood.py')
    environment = Path(__file__).with_name(f'{SLUG}-environment.txt').read_text()
    if f'Imported helper SHA-256: {HELPER_SHA256}\n' not in environment:
        raise ValueError('Environment must pin the imported helper fingerprint.')
    source = path.read_bytes()
    if hashlib.sha256(source).hexdigest() != HELPER_SHA256:
        raise ValueError('Shared helper fingerprint changed; restore the pinned package before running.')
    # Compile exactly the checked bytes; do not load or emit a bytecode cache.
    helper = types.ModuleType('house_pinned_rules')
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


def load_homes(path, labeled, snapshot=None):
    captured = Path(path).read_bytes() if snapshot is None else snapshot
    with io.StringIO(captured.decode('utf-8-sig'), newline='') as stream:
        reader = csv.DictReader(stream)
        required = {'Id', 'Neighborhood'} | ({'SalePrice'} if labeled else set())
        if not reader.fieldnames or len(reader.fieldnames) != len(set(reader.fieldnames)) or not required.issubset(reader.fieldnames):
            raise ValueError('CSV needs unique Id, Neighborhood columns and SalePrice for training.')
        if not labeled and 'SalePrice' in reader.fieldnames:
            raise ValueError('Test CSV must not contain price labels.')
        rows, ids = [], set()
        for raw in reader:
            if None in raw or any(raw.get(key) is None for key in required):
                raise ValueError('CSV row field count does not match the header.')
            identity = (raw.get('Id') or '').strip()
            if not identity.isascii() or not identity.isdecimal() or int(identity) <= 0 or identity != str(int(identity)) or identity in ids:
                raise ValueError('Id must be a unique positive integer in canonical decimal form.')
            ids.add(identity)
            row = {'Id': identity, 'Neighborhood': (raw['Neighborhood'] or '').strip()}
            if labeled:
                try:
                    price = float(raw['SalePrice'])
                except ValueError:
                    raise ValueError('SalePrice must be finite and positive.') from None
                if not math.isfinite(price) or price <= 0:
                    raise ValueError('SalePrice must be finite and positive.')
                row['SalePrice'] = price
            rows.append(row)
        if len(rows) < (10 if labeled else 1):
            raise ValueError('At least ten training rows or one test row required.')
    return rows


def original_price(log_prediction):
    if not math.isfinite(log_prediction):
        raise ValueError('Log predictions must be finite.')
    try:
        price = math.exp(log_prediction)
    except OverflowError:
        raise ValueError('Original-unit predictions must be finite and positive.') from None
    if not math.isfinite(price) or price <= 0:
        raise ValueError('Original-unit predictions must be finite and positive.')
    return price


def evaluate(rows, helper):
    assignments = helper.folds(rows)
    if len(assignments) != 5 or sorted(index for fold in assignments for index in fold) != list(range(len(rows))):
        raise ValueError('Five folds must validate every row exactly once.')
    results, fold_observations, residuals = [], [], []
    for number, indices in enumerate(assignments, 1):
        held = set(indices)
        train_indices = [index for index in range(len(rows)) if index not in held]
        if held.intersection(train_indices):
            raise ValueError('Train/validation overlap detected.')
        train = [rows[index] for index in train_indices]
        validation = [rows[index] for index in indices]
        seen = {row['Neighborhood'] for row in train}
        predictions = {method: helper.predict(train, validation, method) for method in helper.METHODS}
        if any(len(values) != len(validation) for values in predictions.values()):
            raise ValueError('Every held-out row needs one prediction per method.')
        metrics = {}
        for method, values in predictions.items():
            for value in values:
                original_price(value)
            metrics[method] = math.sqrt(statistics.mean((value - math.log(row['SalePrice'])) ** 2 for value, row in zip(values, validation)))
            if not math.isfinite(metrics[method]):
                raise ValueError('Fold metrics must be finite.')
        results.append({'split': f'random fold {number}', 'train_size': len(train), 'validation_size': len(validation), 'metrics': metrics})
        split_hash = hashlib.sha256(json.dumps({'train': train_indices, 'validation': indices}, separators=(',', ':')).encode()).hexdigest()
        delta = metrics['shrunk-neighborhood-log-mean'] - metrics['global-log-mean']
        fold_observations.append(f'Fold {number}: change minus baseline log-RMSE {delta:.12g}; membership SHA-256 {split_hash}; overlap zero.')
        for offset, index in enumerate(indices):
            row = rows[index]
            record = {'Id': row['Id'], 'fold': number, 'actual_price': row['SalePrice'], 'neighborhood_seen': row['Neighborhood'] in seen}
            for method, values in predictions.items():
                value = values[offset]
                record[method + '_log_prediction'] = value
                record[method + '_price_prediction'] = original_price(value)
                record[method + '_log_residual'] = value - math.log(row['SalePrice'])
                record[method + '_dollar_residual'] = original_price(value) - row['SalePrice']
            residuals.append(record)
    if len(residuals) != len(rows) or len({r['Id'] for r in residuals}) != len(rows):
        raise ValueError('Every evaluated Id must have exactly one OOF residual row.')
    slices = {name: [] for name in ['price below 100000', 'price 100000 to below 200000', 'price at least 200000', 'neighborhood seen', 'neighborhood unseen']}
    for record in residuals:
        price = record['actual_price']
        price_bin = 'price below 100000' if price < 100000 else ('price 100000 to below 200000' if price < 200000 else 'price at least 200000')
        slices[price_bin].append(record)
        slices['neighborhood seen' if record['neighborhood_seen'] else 'neighborhood unseen'].append(record)
    observations = []
    for name, records in slices.items():
        if len(records) < 10:
            observations.append(f'{name}: small slice suppressed.')
            continue
        for method in helper.METHODS:
            log_bias = statistics.mean(r[method + '_log_residual'] for r in records)
            dollars = statistics.mean(abs(r[method + '_dollar_residual']) for r in records)
            observations.append(f'{name}: {len(records)} OOF rows; {method} mean signed natural-log residual {log_bias:.6g}; original-dollar MAE {dollars:.6g}.')
    diagnostics = [
        {'summary': 'Same five folds; both train-only configurations and unfavorable changes retained.', 'observations': fold_observations, 'limitations': LIMITS[:3]},
        {'summary': 'Fixed price and seen/unseen bins; residual sign is prediction minus target. Dollar MAE is diagnostic, not the evaluation metric.', 'observations': observations, 'limitations': [LIMITS[1], LIMITS[3], 'Exponentiated log means are not arithmetic mean prices; actual-price bins are retrospective diagnostics, never fitting features.']},
    ]
    aggregate = {method: statistics.mean(row['metrics'][method] for row in results) for method in helper.METHODS}
    return {'metric': helper.METRIC, 'direction': 'minimize', 'fold_results': results, 'aggregate': aggregate}, diagnostics, residuals


def validate_submission(path, test_rows):
    with Path(path).open(newline='', encoding='utf-8') as stream:
        reader = csv.DictReader(stream)
        if reader.fieldnames != ['Id', 'SalePrice']:
            raise ValueError('Submission header must be Id,SalePrice exactly.')
        submitted = list(reader)
    if len(submitted) != len(test_rows) or [row.get('Id') for row in submitted] != [row['Id'] for row in test_rows]:
        raise ValueError('Submission must contain each test Id once in input order.')
    for row in submitted:
        if set(row) != {'Id', 'SalePrice'} or any(value is None for value in row.values()):
            raise ValueError('Submission rows must contain exactly two fields.')
        try:
            value = float(row['SalePrice'])
        except ValueError:
            raise ValueError('Submission prices must be finite and positive.') from None
        if not math.isfinite(value) or value <= 0:
            raise ValueError('Submission prices must be finite and positive.')


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
        input_snapshots = {path: path.read_bytes() for path in [train_path, test_path] if path}
        input_hashes = {path: hashlib.sha256(snapshot).hexdigest() for path, snapshot in input_snapshots.items()}
        rows = load_homes(train_path, True, input_snapshots[train_path])
        test_rows = load_homes(test_path, False, input_snapshots[test_path]) if test_path else None
        if test_rows and {row['Id'] for row in rows}.intersection(row['Id'] for row in test_rows):
            raise ValueError('Train and test Id sets must not overlap.')
        if submission_to_check:
            validate_submission(submission_to_check, test_rows)
        measured, diagnostics, residuals = evaluate(rows, helper)
        if any(sha(path) != digest for path, digest in input_hashes.items()):
            raise ValueError('Input changed during execution; rerun with frozen private files.')
        manifest = {'kind': 'fingerprint-only', 'files': [
            {'name': name, 'sha256': input_hashes[path], 'bytes': len(input_snapshots[path])}
            for name, path in [('train.csv', train_path), ('test.csv', test_path)] if path
        ]}
        output.mkdir(parents=True, mode=0o700)
        safe = output / 'safe-review'; safe.mkdir(mode=0o700)
        manifest_path = safe / f'{SLUG}-data.json'; write_json(manifest_path, manifest)
        diagnostic_refs = []
        for number, (question, diagnostic) in enumerate(zip(QUESTIONS, diagnostics), 1):
            path = safe / f'{SLUG}-diagnostic-{number}.json'; write_json(path, diagnostic)
            diagnostic_refs.append({'question': question, 'path': f'/exercises/{path.name}', 'sha256': sha(path)})
        residual_path = output / 'oof-residuals.csv'
        with residual_path.open('w', newline='', encoding='utf-8') as stream:
            writer = csv.DictWriter(stream, fieldnames=list(residuals[0])); writer.writeheader(); writer.writerows(residuals)
        if test_rows:
            predictions = [original_price(value) for value in helper.predict(rows, test_rows, 'shrunk-neighborhood-log-mean')]
            submission = output / 'submission.csv'
            with submission.open('w', newline='', encoding='utf-8') as stream:
                writer = csv.writer(stream); writer.writerow(['Id', 'SalePrice'])
                writer.writerows((row['Id'], format(value, '.17g')) for row, value in zip(test_rows, predictions))
            validate_submission(submission, test_rows)
        fingerprints = {f'{kind}_sha256': sha(Path(__file__).with_name(name)) for kind, name in [
            ('script', f'{SLUG}.py'), ('notebook', f'{SLUG}.ipynb'), ('environment', f'{SLUG}-environment.txt'), ('helper', 'house-neighborhood.py'),
        ]}
        receipt = {
            'schema_version': 1, 'exercise': SLUG, 'executed_at': time.strftime('%Y-%m-%d', time.gmtime()),
            'execution_status': 'succeeded', 'evidence_type': 'actual-data' if data_kind == 'competition-data' else 'generated-test-data',
            'data_scope': 'competition-data' if data_kind == 'competition-data' else 'generated-teaching-fixture',
            'input_manifest': manifest, 'data_sha256': sha(manifest_path), 'script_sha256': fingerprints['script_sha256'],
            'code_fingerprints': fingerprints, 'provenance_url': PROVENANCE,
            'authorization': 'Operator affirms authorized access to private inputs; origin and permission require review before publication.' if data_kind == 'competition-data' else 'Generated software-test rows; no actual House Prices data or access evidence.',
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
    parser.add_argument('--train-csv', default=os.environ.get('HOUSE_TRAIN_CSV'))
    parser.add_argument('--test-csv', default=os.environ.get('HOUSE_TEST_CSV'))
    parser.add_argument('--output-dir', default=os.environ.get('HOUSE_OUTPUT_DIR'))
    parser.add_argument('--data-kind', choices=['competition-data', 'generated-test-data'], default=os.environ.get('HOUSE_DATA_KIND'))
    parser.add_argument('--acknowledge-authorized-data', action='store_true')
    parser.add_argument('--validate-submission')
    args = parser.parse_args()
    if not args.train_csv or not args.output_dir:
        parser.error('Set --train-csv/--output-dir or HOUSE_TRAIN_CSV/HOUSE_OUTPUT_DIR to private paths.')
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
