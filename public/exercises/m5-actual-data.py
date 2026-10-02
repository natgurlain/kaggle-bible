#!/usr/bin/env python3
"""Bounded private M5 bottom-series experiment. No network, downloads, or submissions."""
import argparse
import csv
import datetime
import hashlib
import io
import json
import math
import os
import platform
import statistics
import sys
import time
import tracemalloc
import types
from pathlib import Path

SLUG = 'm5-actual-data'
HELPER_SHA256 = 'eb6c90b7a6f629e172107f7e74f41d777cd50bb29508c9b585c0941a9353543f'
PROVENANCE = 'https://www.kaggle.com/competitions/m5-forecasting-accuracy/data'
ORIGINS = [1829, 1857, 1885]
HORIZON = 28
LAST_DAY = 1913
MAX_SERIES = 12
MAX_INPUT_BYTES = 256 * 1024 * 1024
METHODS = ['seasonal-naive', 'four-week-mean']
SPLIT = 'Frozen at most twelve bottom series; origins d_1829, d_1857 and d_1885; next 28 days validate; all forecasts/scales/weights use history through the origin.'
BASELINE = 'Repeat the last training week separately at each of the three fixed origins.'
CHANGE = 'Compare the fixed average of four prior weeks on identical series, origins and 28-day horizons.'
QUESTIONS = [
    'Do both methods differ consistently across all three frozen origins and selected bottom series?',
    'Which slice RMSSE or revenue-weighted diagnostics are undefined, and what hierarchy/availability assumptions remain?',
]
LIMITS = [
    'No full-hierarchy official WRMSSE, leaderboard submission or winning-system reproduction.',
    'Primary metric is unweighted bottom-slice MAE; optional RMSSE and revenue-weighted RMSSE are slice diagnostics only.',
    'Zero or insufficient active-history scales and missing/zero revenue retain explicit undefined diagnostics; no epsilon or silent exclusion.',
    'Weekly prices require an explicit start-of-week availability assumption; historical publication timestamps are unverified.',
    'Raw series identifiers, sales histories and forecast/error rows remain private.',
    'Memory measures traced Python allocations, not RSS; runtime covers this local bounded experiment only.',
    'Dataset origin and authorization require independent evidence review before publication.',
]

def sha(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def load_helper():
    path = Path(__file__).with_name('m5-rolling-origin.py')
    environment = Path(__file__).with_name(f'{SLUG}-environment.txt').read_text()
    if f'Imported helper SHA-256: {HELPER_SHA256}\n' not in environment:
        raise ValueError('Environment must pin the imported helper fingerprint.')
    source = path.read_bytes()
    if hashlib.sha256(source).hexdigest() != HELPER_SHA256:
        raise ValueError('Shared helper fingerprint changed; restore the pinned package before running.')
    # Compile exactly the checked bytes; do not load or emit a bytecode cache.
    helper = types.ModuleType('m5_pinned_rules')
    helper.__file__ = str(path)
    exec(compile(source, str(path), 'exec'), helper.__dict__)
    return helper


def private_path(path):
    resolved = Path(path).expanduser().resolve()
    if any((parent / '.git').exists() for parent in [resolved, *resolved.parents]):
        raise ValueError('Inputs and outputs must be outside every Git checkout.')
    # A copied package may also be inside a static web root without a .git directory.
    if any(part.name in ('public', 'dist', '.git') for part in [resolved, *resolved.parents]):
        raise ValueError('Inputs and outputs must be outside public/dist/.git directories.')
    return resolved


def capture(path, limit=MAX_INPUT_BYTES):
    with path.open('rb') as stream:
        snapshot = stream.read(limit + 1)
    if len(snapshot) > limit:
        raise ValueError('Private input exceeds the declared byte cap; revise scope separately, never truncate silently.')
    return snapshot


def csv_rows(snapshot, required):
    stream = io.StringIO(snapshot.decode('utf-8-sig'), newline='')
    reader = csv.DictReader(stream)
    if not reader.fieldnames or len(reader.fieldnames) != len(set(reader.fieldnames)) or not set(required).issubset(reader.fieldnames):
        raise ValueError('CSV needs unique headers and the declared required columns.')
    for row in reader:
        if None in row or any(row.get(key) is None for key in required):
            raise ValueError('CSV row field count does not match required headers.')
        yield row


def load_scope(snapshot):
    try:
        scope = json.loads(snapshot)
    except (ValueError, UnicodeError):
        raise ValueError('Scope must be valid private JSON.') from None
    if not isinstance(scope, dict) or set(scope) != {'series', 'price_availability'}:
        raise ValueError('Scope must contain exactly series and price_availability.')
    if scope['price_availability'] not in ('unverified', 'assumed-known-at-week-start'):
        raise ValueError('Declare unverified or assumed-known-at-week-start price availability.')
    selected = scope['series']
    if not isinstance(selected, list) or not 1 <= len(selected) <= MAX_SERIES:
        raise ValueError('Freeze between one and twelve selected bottom series.')
    pairs = []
    for item in selected:
        if not isinstance(item, dict) or set(item) != {'item_id', 'store_id'} or any(not isinstance(value, str) or not value.strip() for value in item.values()):
            raise ValueError('Each scope series needs non-empty item_id and store_id only.')
        pairs.append((item['item_id'], item['store_id']))
    if len(set(pairs)) != len(pairs):
        raise ValueError('Scope series must be unique; order defines private-to-public aliases.')
    return pairs, scope['price_availability']


def finite_number(text, positive=False):
    try:
        value = float(text)
    except (ValueError, TypeError):
        raise ValueError('Numeric input must be finite and non-negative (prices strictly positive).') from None
    if not math.isfinite(value) or value < 0 or (positive and value == 0):
        raise ValueError('Numeric input must be finite and non-negative (prices strictly positive).')
    return value


def load_sales(snapshot, pairs):
    fields = ['item_id', 'store_id'] + [f'd_{day}' for day in range(1, LAST_DAY + 1)]
    allowed_fields = set(fields)
    selected, seen = {}, set()
    for row in csv_rows(snapshot, fields):
        pair = (row['item_id'], row['store_id'])
        if pair in seen:
            raise ValueError('Sales item/store pairs must be unique.')
        seen.add(pair)
        if any(key.startswith('d_') and key not in allowed_fields for key in row):
            raise ValueError('Frozen sales input must contain exactly d_1 through d_1913; no automatic origin shifting.')
        if pair in pairs:
            selected[pair] = [finite_number(row[f'd_{day}']) for day in range(1, LAST_DAY + 1)]
    if set(selected) != set(pairs):
        raise ValueError('Every frozen scope series must exist in the sales input.')
    return selected


def load_calendar(snapshot):
    days, dates = {}, set()
    for row in csv_rows(snapshot, ['d', 'date', 'wm_yr_wk']):
        day_text = row['d']
        if not day_text.startswith('d_') or not day_text[2:].isascii() or not day_text[2:].isdecimal() or int(day_text[2:]) < 1 or day_text != f'd_{int(day_text[2:])}':
            raise ValueError('Calendar day IDs must be canonical positive d_<day> values.')
        day = int(day_text[2:])
        try:
            date = datetime.date.fromisoformat(row['date'])
        except ValueError:
            raise ValueError('Calendar dates must be valid ISO dates.') from None
        if day in days or date in dates or not row['wm_yr_wk']:
            raise ValueError('Calendar day/date mappings must be unique with non-empty week IDs.')
        days[day] = (date, row['wm_yr_wk']); dates.add(date)
    if not set(range(1, LAST_DAY + 1)).issubset(days):
        raise ValueError('Calendar must cover every frozen training/target day through d_1913.')
    first = days[1][0]
    if any(days[day][0] != first + datetime.timedelta(days=day - 1) for day in days):
        raise ValueError('Calendar dates must align contiguously with day IDs.')
    # A week may not disappear and reappear, or cover more than seven days.
    weeks = {}
    for day in sorted(days):
        weeks.setdefault(days[day][1], []).append(day)
    if any(len(indices) > 7 or indices != list(range(indices[0], indices[-1] + 1)) for indices in weeks.values()):
        raise ValueError('Calendar week IDs must have contiguous at-most-seven-day coverage.')
    return days


def load_prices(snapshot, pairs=None, weeks=None):
    prices = {}
    selected = set(pairs) if pairs is not None else None
    for row in csv_rows(snapshot, ['item_id', 'store_id', 'wm_yr_wk', 'sell_price']):
        key = (row['item_id'], row['store_id'], row['wm_yr_wk'])
        if selected is not None and key[:2] not in selected:
            continue
        if weeks is not None and key[2] not in weeks:
            continue
        if any(not part for part in key) or key in prices:
            raise ValueError('Price item/store/week keys must be non-empty and unique.')
        prices[key] = finite_number(row['sell_price'], positive=True)
    return prices


def scale(history):
    first = next((index for index, value in enumerate(history) if value > 0), None)
    if first is None:
        return None, 'all-zero training history'
    active = history[first:]
    if len(active) < 2:
        return None, 'fewer than two active-history observations'
    try:
        denominator = statistics.mean((a - b) ** 2 for a, b in zip(active[1:], active[:-1]))
    except OverflowError:
        return None, 'nonfinite training scale'
    if not math.isfinite(denominator) or denominator <= 0:
        return None, 'zero or nonfinite training scale'
    return denominator, None


def revenue_weights(series, pairs, calendar, prices, origin, availability):
    if availability != 'assumed-known-at-week-start':
        return None, 'weekly price availability unverified; no weighted diagnostic computed'
    revenues = []
    for pair in pairs:
        revenue = 0.0
        for day in range(origin - 27, origin + 1):
            units = series[pair][day - 1]
            if units == 0:
                continue
            price = prices.get((*pair, calendar[day][1]))
            if price is None:
                return None, 'missing price for positive past sales; no weighted diagnostic computed'
            revenue += units * price
        if not math.isfinite(revenue):
            return None, 'nonfinite past revenue; no weighted diagnostic computed'
        revenues.append(revenue)
    try:
        total = math.fsum(revenues)
    except OverflowError:
        return None, 'nonfinite total past revenue; no weighted diagnostic computed'
    if not math.isfinite(total) or total <= 0:
        return None, 'zero or nonfinite total past revenue; no weighted diagnostic computed'
    return [revenue / total for revenue in revenues], None


def evaluate(series, pairs, calendar, prices, availability, helper):
    results, observations, scoring, private_rows = [], [], [], []
    for origin in ORIGINS:
        weights, weight_reason = revenue_weights(series, pairs, calendar, prices, origin, availability)
        scores = {method: [] for method in METHODS}; rmsse = {method: [] for method in METHODS}
        for slot, pair in enumerate(pairs, 1):
            values = series[pair]; history = values[:origin]; truth = values[origin:origin + HORIZON]
            if len(truth) != HORIZON:
                raise ValueError('Every frozen series/origin must cover exactly twenty-eight target days.')
            denominator, reason = scale(history)
            alias = f'S{slot:02d}'
            for method in METHODS:
                predicted = helper.forecast(values, origin, method, HORIZON)
                if len(predicted) != HORIZON or any(not math.isfinite(value) or value < 0 for value in predicted):
                    raise ValueError('Forecasts must cover twenty-eight finite non-negative values.')
                mae = statistics.mean(abs(actual - forecast) for actual, forecast in zip(truth, predicted))
                mse = statistics.mean((actual - forecast) ** 2 for actual, forecast in zip(truth, predicted))
                if not math.isfinite(mae) or not math.isfinite(mse):
                    raise ValueError('Slice diagnostics must be finite; retain the failed attempt.')
                scores[method].append(mae)
                scaled = math.sqrt(mse / denominator) if denominator is not None else None
                if scaled is not None and not math.isfinite(scaled):
                    raise ValueError('Scaled diagnostic overflow; retain the failed attempt.')
                rmsse[method].append(scaled)
                note = f'RMSSE {scaled:.12g}' if scaled is not None else f'RMSSE undefined ({reason})'
                observations.append(f'{alias} origin d_{origin} {method}: 28 target days; slice MAE {mae:.12g}; MSE {mse:.12g}; {note}; training zero days {sum(value == 0 for value in history)}.')
                for offset, (actual, forecast) in enumerate(zip(truth, predicted), 1):
                    private_rows.append({'item_id': pair[0], 'store_id': pair[1], 'alias': alias, 'origin': origin, 'day': origin + offset, 'method': method, 'actual': actual, 'forecast': forecast, 'residual': forecast - actual})
        results.append({'split': f'origin d_{origin}', 'train_size': origin * len(pairs), 'validation_size': HORIZON * len(pairs), 'metrics': {method: statistics.mean(scores[method]) for method in METHODS}})
        scoring.append(f'Origin d_{origin}: frozen scope {len(pairs)} bottom series; targets d_{origin + 1} through d_{origin + HORIZON}; availability mode {availability}.')
        for method in METHODS:
            if weights is None:
                scoring.append(f'Origin d_{origin} {method}: weighted bottom-slice RMSSE undefined ({weight_reason}).')
            elif any(value is None for value in rmsse[method]):
                scoring.append(f'Origin d_{origin} {method}: weighted bottom-slice RMSSE undefined (at least one selected scale undefined; no exclusion or renormalization).')
            else:
                try:
                    weighted = math.fsum(weight * value for weight, value in zip(weights, rmsse[method]))
                except OverflowError:
                    weighted = math.inf
                if not math.isfinite(weighted):
                    scoring.append(f'Origin d_{origin} {method}: weighted bottom-slice RMSSE undefined (numeric overflow; no clipping or exclusion).')
                else:
                    scoring.append(f'Origin d_{origin} {method}: revenue-normalized bottom-slice RMSSE {weighted:.12g}; not full-hierarchy WRMSSE; assumes weekly prices known at week start.')
    expected = len(pairs) * len(ORIGINS) * HORIZON * len(METHODS)
    if len(private_rows) != expected or len({(r['item_id'], r['store_id'], r['origin'], r['day'], r['method']) for r in private_rows}) != expected:
        raise ValueError('Frozen scope/target coverage must be complete with no duplicate predictions.')
    diagnostics = [
        {'summary': 'Every frozen bottom series and origin retained; public aliases never expose the private series map.', 'observations': observations, 'limitations': [LIMITS[0], LIMITS[1], LIMITS[4]]},
        {'summary': 'Training-only scales and past revenue diagnostics; undefined cases retained. All hierarchy levels and official scoring-code parity remain unexecuted.', 'observations': scoring, 'limitations': LIMITS[:4]},
    ]
    measured = {'metric': helper.METRIC, 'direction': 'minimize', 'fold_results': results, 'aggregate': {method: statistics.mean(row['metrics'][method] for row in results) for method in METHODS}}
    return measured, diagnostics, private_rows


def write_json(path, value):
    Path(path).write_text(json.dumps(value, indent=2, sort_keys=True) + '\n', encoding='utf-8')


def run_project(sales_csv, calendar_csv, prices_csv, scope_json, output_dir, data_kind, acknowledged):
    if not acknowledged:
        raise ValueError('Confirm authorized private inputs with --acknowledge-authorized-data.')
    if data_kind not in ('competition-data', 'generated-test-data'):
        raise ValueError('Declare competition-data or generated-test-data explicitly.')
    paths = [private_path(path) for path in [sales_csv, calendar_csv, prices_csv, scope_json]]
    output = private_path(output_dir)
    if output.exists():
        raise ValueError('Use a new output directory; prior attempts are never overwritten.')
    if len(set(paths)) != 4:
        raise ValueError('Sales, calendar, prices and scope must be four distinct private files.')
    helper = load_helper(); tracemalloc.start(); start = time.perf_counter()
    try:
        snapshots = [capture(path, 1024 * 1024 if number == 3 else MAX_INPUT_BYTES) for number, path in enumerate(paths)]
        digests = [hashlib.sha256(snapshot).hexdigest() for snapshot in snapshots]
        pairs, availability = load_scope(snapshots[3])
        series = load_sales(snapshots[0], pairs); calendar = load_calendar(snapshots[1])
        past_weeks = {calendar[day][1] for day in range(1, max(ORIGINS) + 1)}
        prices = load_prices(snapshots[2], pairs, past_weeks)
        measured, diagnostics, private_rows = evaluate(series, pairs, calendar, prices, availability, helper)
        if any(sha(path) != digest for path, digest in zip(paths, digests)):
            raise ValueError('Input changed during execution; freeze private files and retry.')
        manifest = {'kind': 'fingerprint-only', 'files': [{'name': name, 'sha256': digest, 'bytes': len(snapshot)} for name, digest, snapshot in zip(['sales.csv', 'calendar.csv', 'prices.csv', 'scope.json'], digests, snapshots)]}
        output.mkdir(parents=True, mode=0o700); safe = output / 'safe-review'; safe.mkdir(mode=0o700)
        manifest_path = safe / f'{SLUG}-data.json'; write_json(manifest_path, manifest)
        refs = []
        for number, (question, diagnostic) in enumerate(zip(QUESTIONS, diagnostics), 1):
            path = safe / f'{SLUG}-diagnostic-{number}.json'; write_json(path, diagnostic)
            refs.append({'question': question, 'path': f'/exercises/{path.name}', 'sha256': sha(path)})
        with (output / 'private-forecasts.csv').open('w', newline='', encoding='utf-8') as stream:
            writer = csv.DictWriter(stream, fieldnames=list(private_rows[0])); writer.writeheader(); writer.writerows(private_rows)
        write_json(output / 'private-series-map.json', {f'S{number:02d}': {'item_id': pair[0], 'store_id': pair[1]} for number, pair in enumerate(pairs, 1)})
        fingerprints = {f'{kind}_sha256': sha(Path(__file__).with_name(name)) for kind, name in [('script', f'{SLUG}.py'), ('notebook', f'{SLUG}.ipynb'), ('environment', f'{SLUG}-environment.txt'), ('helper', 'm5-rolling-origin.py')]}
        receipt = {
            'schema_version': 1, 'exercise': SLUG, 'executed_at': time.strftime('%Y-%m-%d', time.gmtime()),
            'execution_status': 'succeeded', 'evidence_type': 'actual-data' if data_kind == 'competition-data' else 'generated-test-data',
            'data_scope': 'competition-data' if data_kind == 'competition-data' else 'generated-teaching-fixture',
            'input_manifest': manifest, 'data_sha256': sha(manifest_path), 'script_sha256': fingerprints['script_sha256'], 'code_fingerprints': fingerprints,
            'provenance_url': PROVENANCE, 'authorization': 'Operator affirms authorized private input access; origin, scope and price availability require review before publication.' if data_kind == 'competition-data' else 'Generated software-test tables only; no actual M5 access or execution evidence.',
            'configuration': {'baseline': BASELINE, 'controlled_change': CHANGE}, 'diagnostics': refs,
            'seed': helper.SEED, 'split_definition': SPLIT, 'python': platform.python_version(), 'platform': platform.system() + ' ' + platform.machine(),
            'dependencies': 'Python standard library only', 'wall_seconds': time.perf_counter() - start, 'memory_scope': 'traced-python-allocations', 'peak_memory_bytes': tracemalloc.get_traced_memory()[1], 'limitations': LIMITS, **measured,
        }
        write_json(safe / f'{SLUG}-receipt.json', receipt); return receipt
    finally:
        tracemalloc.stop()


def main():
    if sys.version_info < (3, 11):
        raise SystemExit('Use Python >=3.11; the declared environment is Python 3.12.14.')
    parser = argparse.ArgumentParser(description=__doc__)
    for flag in ['sales-csv', 'calendar-csv', 'prices-csv', 'scope-json', 'output-dir']:
        parser.add_argument('--' + flag, default=os.environ.get('M5_' + flag.replace('-', '_').upper()))
    parser.add_argument('--data-kind', choices=['competition-data', 'generated-test-data'], default=os.environ.get('M5_DATA_KIND'))
    parser.add_argument('--acknowledge-authorized-data', action='store_true'); args = parser.parse_args()
    if any(not getattr(args, field) for field in ['sales_csv', 'calendar_csv', 'prices_csv', 'scope_json', 'output_dir']):
        parser.error('Supply every private input/scope/output path via flags or the documented M5 environment variables.')
    try:
        run_project(args.sales_csv, args.calendar_csv, args.prices_csv, args.scope_json, args.output_dir, args.data_kind, args.acknowledge_authorized_data)
    except ArithmeticError:
        raise SystemExit('Numeric scoring overflow; retain the private attempt and inspect units locally.') from None
    except (csv.Error, UnicodeError):
        raise SystemExit('Private CSV encoding/parsing failed; inspect originals locally.') from None
    except (ValueError, OSError) as error:
        raise SystemExit(str(error) if isinstance(error, ValueError) else 'Private file access failed; check local paths and permissions.') from None
    print('Private bounded run completed; inspect aggregate safe-review candidates before any publication. No full-hierarchy score or submission generated.')

if __name__ == '__main__':
    main()
