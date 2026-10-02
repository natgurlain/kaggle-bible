#!/usr/bin/env python3
"""Private-input Disaster Tweets project. No downloads, network, uploads, or raw public artifacts."""
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
import sys
import time
import tracemalloc
from pathlib import Path

SLUG = 'nlp-actual-data'
HELPER_SHA256 = '75ccbf247a955f3f06d08444c87fc79cf5eb3f46abae106204314bd5a278d599'
PROVENANCE = 'https://www.kaggle.com/competitions/nlp-getting-started/data'
BASELINE = 'Fit unigram Naive Bayes vocabulary and counts inside each fixed stratified training fold.'
CHANGE = 'Add adjacent word pairs with unchanged smoothing, threshold and folds; retain worse outcomes.'
QUESTIONS = [
    'Does adding adjacent word pairs help consistently across the same five fixed stratified folds?',
    'What do aggregate false positives/negatives and repeated-template overlap omit about transfer?',
]
LIMITS = [
    'This is an original learner experiment, not historical reproduction or a leaderboard score.',
    'Exact token-normalized duplicates are rejected without silently deleting rows; near-duplicate handling requires separate review.',
    'Five random stratified folds do not group templates, events, users or time; masked-number template overlap is a limited warning heuristic.',
    'Aggregate is mean fold positive-class F1, distinct from pooled OOF F1 and competition test F1.',
    'Raw texts, IDs and local error excerpts remain private; public diagnostics contain aggregate counts only.',
    'Memory measures traced Python allocations, not process RSS; runtime covers this local run only.',
    'Input origin and authorization are operator declarations requiring review before publication.',
]


def sha(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def load_helper():
    path = Path(__file__).with_name('nlp-word-pairs.py')
    environment = Path(__file__).with_name(f'{SLUG}-environment.txt').read_text()
    if f'Imported helper SHA-256: {HELPER_SHA256}\n' not in environment:
        raise ValueError('Environment must pin the imported helper fingerprint.')
    source = path.read_bytes()
    if hashlib.sha256(source).hexdigest() != HELPER_SHA256:
        raise ValueError('Shared helper fingerprint changed; restore the pinned package before running.')
    # Compile exactly the checked bytes; do not load or emit a bytecode cache.
    helper = types.ModuleType('nlp_pinned_rules')
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


def load_texts(path, labeled, helper, snapshot=None):
    captured = Path(path).read_bytes() if snapshot is None else snapshot
    with io.StringIO(captured.decode('utf-8-sig'), newline='') as stream:
        reader = csv.DictReader(stream)
        required = {'id', 'text'} | ({'target'} if labeled else set())
        if not reader.fieldnames or len(reader.fieldnames) != len(set(reader.fieldnames)) or not required.issubset(reader.fieldnames):
            raise ValueError('CSV needs unique id, text columns and target for training.')
        if not labeled and 'target' in reader.fieldnames:
            raise ValueError('Test CSV must not contain target labels.')
        rows, ids, texts = [], set(), set()
        for raw in reader:
            if None in raw or any(raw.get(key) is None for key in required):
                raise ValueError('CSV row field count does not match the header.')
            identity = (raw.get('id') or '').strip()
            if not identity.isascii() or not identity.isdecimal() or int(identity) < 0 or identity != str(int(identity)) or identity in ids:
                raise ValueError('id must be a unique non-negative integer in canonical decimal form.')
            normalized = ' '.join(helper.tokens(raw['text']))
            if not normalized or normalized in texts:
                raise ValueError('Non-empty unique token-normalized texts required; no silent deduplication. Review a separate duplicate-aware input policy.')
            ids.add(identity); texts.add(normalized)
            row = {'id': identity, 'text': raw['text']}
            if labeled:
                if raw['target'] not in ('0', '1'):
                    raise ValueError('target must be binary 0/1.')
                row['target'] = int(raw['target'])
            rows.append(row)
        if not rows:
            raise ValueError('CSV contains no text rows.')
    return rows


def template_key(text, helper):
    # Warning heuristic only: mask numeric tokens, preserve every row and split.
    return ' '.join('<number>' if token.isdecimal() else token for token in helper.tokens(text))


def confusion(truth, predicted):
    return {
        'TP': sum(t == p == 1 for t, p in zip(truth, predicted)),
        'FP': sum(t == 0 and p == 1 for t, p in zip(truth, predicted)),
        'FN': sum(t == 1 and p == 0 for t, p in zip(truth, predicted)),
        'TN': sum(t == p == 0 for t, p in zip(truth, predicted)),
    }


def evaluate(rows, helper):
    assignments = helper.folds(rows)
    if len(assignments) != 5 or sorted(index for fold in assignments for index in fold) != list(range(len(rows))):
        raise ValueError('Five folds must validate every row exactly once.')
    results, observations, errors = [], [], []
    all_predictions = {method: {} for method in helper.METHODS}
    for number, indices in enumerate(assignments, 1):
        held = set(indices); train_indices = [index for index in range(len(rows)) if index not in held]
        if held.intersection(train_indices):
            raise ValueError('Train/validation overlap detected.')
        train = [rows[index] for index in train_indices]; validation = [rows[index] for index in indices]
        truth = [row['target'] for row in validation]; metrics = {}
        template_keys = {template_key(row['text'], helper) for row in train}
        template_overlap = sum(template_key(row['text'], helper) in template_keys for row in validation)
        for method in helper.METHODS:
            model = helper.fit(train, method)
            predicted = helper.predict(model, validation, method)
            if len(predicted) != len(validation) or any(value not in (0, 1) for value in predicted):
                raise ValueError('Every held-out row needs one binary prediction per method.')
            metrics[method] = helper.f1(truth, predicted)
            all_predictions[method].update(zip(indices, predicted))
            for row, prediction in zip(validation, predicted):
                if row['target'] != prediction:
                    errors.append({'id': row['id'], 'fold': number, 'method': method, 'target': row['target'], 'prediction': prediction, 'error_type': 'false-positive' if prediction else 'false-negative', 'text': row['text']})
        results.append({'split': f'stratified fold {number}', 'train_size': len(train), 'validation_size': len(validation), 'metrics': metrics})
        split_hash = hashlib.sha256(json.dumps({'train': train_indices, 'validation': indices}, separators=(',', ':')).encode()).hexdigest()
        delta = metrics['unigrams-and-pairs'] - metrics['unigrams']
        observations.append(f'Fold {number}: change minus baseline F1 {delta:.12g}; membership SHA-256 {split_hash}; overlap zero; masked-number template overlap {template_overlap} of {len(validation)} held-out rows.')
    if any(set(predictions) != set(range(len(rows))) for predictions in all_predictions.values()):
        raise ValueError('Every evaluated row must receive one OOF prediction per method.')
    truth = [row['target'] for row in rows]; aggregate_observations = []
    for method in helper.METHODS:
        predicted = [all_predictions[method][index] for index in range(len(rows))]
        counts = confusion(truth, predicted)
        aggregate_observations.append(f'{method}: {len(rows)} OOF rows; TP {counts["TP"]}; FP {counts["FP"]}; FN {counts["FN"]}; TN {counts["TN"]}; pooled positive-class F1 {helper.f1(truth, predicted):.12g}.')
    diagnostics = [
        {'summary': 'Same five folds and train-only vocabulary/counts; both configurations retained.', 'observations': observations, 'limitations': LIMITS[:4]},
        {'summary': 'Aggregate OOF confusion; raw error inspection stays local. Template warnings do not establish duplicate-aware transfer.', 'observations': aggregate_observations, 'limitations': [LIMITS[1], LIMITS[2], LIMITS[3], LIMITS[4]]},
    ]
    aggregate = {method: statistics.mean(row['metrics'][method] for row in results) for method in helper.METHODS}
    return {'metric': helper.METRIC, 'direction': 'maximize', 'fold_results': results, 'aggregate': aggregate}, diagnostics, errors


def validate_submission(path, test_rows):
    with Path(path).open(newline='', encoding='utf-8') as stream:
        reader = csv.DictReader(stream)
        if reader.fieldnames != ['id', 'target']:
            raise ValueError('Submission header must be id,target exactly.')
        submitted = list(reader)
    if len(submitted) != len(test_rows) or [row.get('id') for row in submitted] != [row['id'] for row in test_rows]:
        raise ValueError('Submission must contain each test id once in input order.')
    if any(set(row) != {'id', 'target'} or row.get('target') not in ('0', '1') for row in submitted):
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
        input_snapshots = {path: path.read_bytes() for path in [train_path, test_path] if path}
        input_hashes = {path: hashlib.sha256(snapshot).hexdigest() for path, snapshot in input_snapshots.items()}
        rows = load_texts(train_path, True, helper, input_snapshots[train_path])
        test_rows = load_texts(test_path, False, helper, input_snapshots[test_path]) if test_path else None
        if test_rows and {row['id'] for row in rows}.intersection(row['id'] for row in test_rows):
            raise ValueError('Train and test id sets must not overlap.')
        if test_rows and {' '.join(helper.tokens(row['text'])) for row in rows}.intersection(' '.join(helper.tokens(row['text'])) for row in test_rows):
            raise ValueError('Train and test token-normalized texts must not overlap.')
        if submission_to_check:
            validate_submission(submission_to_check, test_rows)
        measured, diagnostics, errors = evaluate(rows, helper)
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
        error_path = output / 'local-errors.csv'
        with error_path.open('w', newline='', encoding='utf-8') as stream:
            writer = csv.DictWriter(stream, fieldnames=['id', 'fold', 'method', 'target', 'prediction', 'error_type', 'text']); writer.writeheader(); writer.writerows(errors)
        if test_rows:
            predictions = helper.predict(helper.fit(rows, 'unigrams-and-pairs'), test_rows, 'unigrams-and-pairs')
            submission = output / 'submission.csv'
            with submission.open('w', newline='', encoding='utf-8') as stream:
                writer = csv.writer(stream); writer.writerow(['id', 'target'])
                writer.writerows((row['id'], value) for row, value in zip(test_rows, predictions))
            validate_submission(submission, test_rows)
        fingerprints = {f'{kind}_sha256': sha(Path(__file__).with_name(name)) for kind, name in [
            ('script', f'{SLUG}.py'), ('notebook', f'{SLUG}.ipynb'), ('environment', f'{SLUG}-environment.txt'), ('helper', 'nlp-word-pairs.py'),
        ]}
        receipt = {
            'schema_version': 1, 'exercise': SLUG, 'executed_at': time.strftime('%Y-%m-%d', time.gmtime()),
            'execution_status': 'succeeded', 'evidence_type': 'actual-data' if data_kind == 'competition-data' else 'generated-test-data',
            'data_scope': 'competition-data' if data_kind == 'competition-data' else 'generated-teaching-fixture',
            'input_manifest': manifest, 'data_sha256': sha(manifest_path), 'script_sha256': fingerprints['script_sha256'],
            'code_fingerprints': fingerprints, 'provenance_url': PROVENANCE,
            'authorization': 'Operator affirms authorized access to private inputs; origin and permission require review before publication.' if data_kind == 'competition-data' else 'Generated software-test rows; no actual Disaster Tweets data or access evidence.',
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
    parser.add_argument('--train-csv', default=os.environ.get('NLP_TRAIN_CSV'))
    parser.add_argument('--test-csv', default=os.environ.get('NLP_TEST_CSV'))
    parser.add_argument('--output-dir', default=os.environ.get('NLP_OUTPUT_DIR'))
    parser.add_argument('--data-kind', choices=['competition-data', 'generated-test-data'], default=os.environ.get('NLP_DATA_KIND'))
    parser.add_argument('--acknowledge-authorized-data', action='store_true')
    parser.add_argument('--validate-submission')
    args = parser.parse_args()
    if not args.train_csv or not args.output_dir:
        parser.error('Set --train-csv/--output-dir or NLP_TRAIN_CSV/NLP_OUTPUT_DIR to private paths.')
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
