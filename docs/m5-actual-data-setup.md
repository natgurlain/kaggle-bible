# Bounded M5 private-input package (blocked candidate)

No actual M5 data has been supplied or executed. Generated-fixture table tests establish the self-contained software package acceptance for [#72](https://github.com/natgurlain/kaggle-bible/issues/72), without establishing actual-data execution or actual-data verified readiness. Authorized private inputs are required only if a reader chooses an optional actual-data run; they are not a software acceptance prerequisite. The existing two-series teaching fixture stays unchanged. This package evaluates historical windows inside a declared 1913-day input, not the official d_1914-and-later holdout, full-hierarchy official WRMSSE, or a winning system.

## Source and access receipt

The original [M5 Competitors' Guide](https://storage.googleapis.com/kaggle-forum-message-attachments/772349/15032/M5-Competitors-Guide-Final-10-March-2020.pdf) was directly readable on 2026-10-02. Printed page 6 (`Point forecasts`) defines RMSSE scaling after the first nonzero demand and weights from the training sample's last 28 days of dollar sales. Printed pages 8–9 (`Weighting`) describe equal weighting across twelve hierarchy levels. This is historical official primary evidence, not an executed scoring benchmark or current access permission. The direct Kaggle [evaluation route](https://www.kaggle.com/competitions/m5-forecasting-accuracy/overview/evaluation) returned a title with no readable body in that inspection. Official scoring-code parity was not inspected or executed.

For an optional actual-data run, the reader must inspect current [data access](https://www.kaggle.com/competitions/m5-forecasting-accuracy/data) and [rules](https://www.kaggle.com/competitions/m5-forecasting-accuracy/rules), use authorized private files and confirm provenance. No automatic downloads, terms acceptance, network calls or Kaggle submission occur. Authorized access remains a prerequisite for that optional run; a successful safe execution receipt is required before any actual-data verified claim.

## Official file-description receipt

On 2026-10-02, a direct web open of the official data route returned a title with no readable body. Search retrieval exposed indexed text from the official [M5 data page](https://www.kaggle.com/c/m5-forecasting-accuracy/data), reported as crawled last week. `Files` identifies `sales_train_validation.csv` as historical daily product/store sales for d_1 through d_1913, `sales_train_evaluation.csv` as sales through d_1941, plus `calendar.csv`, `sell_prices.csv` and `sample_submission.csv`. `Metadata > License` says data is subject to competition rules. Supply the validation file for this pinned package's exact 1913-day contract; the later evaluation file is a different input version and is not accepted by this runner. The indexed description does not establish current access permission, historical price publication times, official scoring-code parity or an executed run.

## Pinned package and frozen scope

Copy `m5-actual-data.py`, `m5-actual-data.ipynb`, `m5-actual-data-environment.txt` and unchanged `m5-rolling-origin.py` together into a private folder outside Git, `public` and `dist`. Use Python 3.12.14, standard library only. Metadata pins all four files, and the wrapper verifies/compiles the helper's exact bytes. The notebook delegates to the same runner with no saved results. Do not invoke the helper's legacy main: it exports normalized source data and evaluates different fixture origins.

Before interpreting any holdout, freeze a private `scope.json` with exactly `series` and `price_availability`. The series array contains one to twelve unique `item_id`/`store_id` pairs from authorized inputs; preserve its order, which defines aliases S01–S12. Do not change selection after viewing results. Example placeholders are not actual M5 identifiers:

```json
{
  "series": [{"item_id": "YOUR_AUTHORIZED_ITEM_ID", "store_id": "YOUR_AUTHORIZED_STORE_ID"}],
  "price_availability": "unverified"
}
```

Supply all four private inputs:

- Sales table: unique item/store rows and exactly daily columns d_1 through d_1913. Every selected series must exist and have finite nonnegative sales; no missing days, silent row removal, extra forecast days or automatic origin shifting. Other item/store rows are not evaluated.
- Calendar: unique canonical day IDs, ISO dates and week IDs; every required day is covered, dates align contiguously, and each week has at most seven contiguous days. Event/SNAP features are ignored.
- Prices: selected item/store/week keys in relevant past weeks must be unique with finite positive prices. Preparation retains only those selected/past keys; it does not certify unselected price records. Only keys joined to past days may enter optional revenue weights. Missing prices for positive past demand leave weighting undefined.
- Scope JSON: frozen selection and declared price mode. Its bytes are fingerprinted alongside every source input; the raw map is private.

Each source file is capped at 256 MiB and scope at 1 MiB. These are implementation input caps, not measured learner memory requirements or assurances that a supplied dataset fits. Inputs are captured and parsed from those same bytes; detected changes after evaluation reject. Safe manifests retain captured digests/byte counts even if a file changes immediately after the last check. Snapshot memory and full CSV parsing are included in the run's resource scope; no actual budget has been measured.

Set paths in a private environment, replacing every example:

```sh
export M5_SALES_CSV=/private/learner-data/m5/sales_train_validation.csv
export M5_CALENDAR_CSV=/private/learner-data/m5/calendar.csv
export M5_PRICES_CSV=/private/learner-data/m5/sell_prices.csv
export M5_SCOPE_JSON=/private/learner-data/m5/scope.json
export M5_OUTPUT_DIR=/private/learner-runs/m5-attempt-1
export M5_DATA_KIND=competition-data
python3 m5-actual-data.py --acknowledge-authorized-data
```

CLI alternatives are `--sales-csv`, `--calendar-csv`, `--prices-csv`, `--scope-json`, `--output-dir`, and `--data-kind`. Use a new output directory for every attempt and retain failures/worse changes. Generated software tables must declare `generated-test-data`, never actual-data evidence. The `competition-data` declaration alone proves neither origin nor authorization. Launch the notebook from the same private package folder/environment into a separate attempt; require exact agreement of metrics/fingerprints, allowing resource measurements to differ.

## Comparison, time boundaries and scoring limits

Every selected series uses origins **1829, 1857 and 1885**, with the next 28 days as targets. The three historical target windows are 1830–1857, 1858–1885 and 1886–1913. At a later origin, earlier observed target days may correctly become history. This is a rolling forecast experiment, not an isolated final competition holdout.

Reuse only the unchanged helper's `forecast` function: seasonal-naive repeats the last observed week; the change averages the same weekday over four prior weeks. There is no tuning, new model, price feature or future-event feature. Forecasts, scale denominators and weight windows depend only on days through each origin. Mutating later targets may change errors, but must not change that origin's forecast/scale/weights. Calendar day/week identifiers align horizons and past price joins; future prices never enter past-weight windows.

The receipt's primary metric is **unweighted bottom-slice MAE**, averaged over all selected series and 28 targets per origin, then equally over three origins. Per-alias diagnostics retain MAE, MSE and optional RMSSE. RMSSE divides forecast MSE by mean squared adjacent differences in training history starting at its first nonzero demand. All-zero history, only one active observation or a zero denominator stays explicitly undefined; do not use an epsilon, invent zero RMSSE or drop the series from the primary MAE.

Prices are weekly observations whose historical publication/revision timestamps are not established here. Default `unverified` mode computes no weighted value. Only the explicit `assumed-known-at-week-start` mode permits optional revenue weights; it is a simulation assumption requiring source/availability review, not proof of historical availability. Under it, selected-series revenue is past units times the corresponding weekly price over the origin's last 28 days. Weekly rows already used for past days are treated as known under that assumption, even when the calendar week crosses the origin. A future-only week is excluded. Zero-unit days contribute no revenue without imputing a price. Missing prices for positive demand, nonfinite/zero total revenue or any undefined selected-series RMSSE leaves the weighted diagnostic undefined; no silent exclusion or renormalization of the valid subset.

A defined weighted diagnostic normalizes revenue **only across the selected bottom series**. It is not official/full-hierarchy WRMSSE. Store/state/category aggregates cannot be reconstructed truthfully from twelve selected products. Full 42,840-series/twelve-level evaluation, hierarchy aggregation, official weights/code parity and historical-system reproduction remain separate unexecuted work. Retain unfavorable method outcomes and every undefined condition.

## Private artifacts and review candidates

`private-forecasts.csv` contains actual item/store identifiers, alias, origin/day, method, targets, forecasts and signed residuals; it stays private. Every selected series/origin/method has exactly 28 distinct target rows. `private-series-map.json` stays private. No full competition submission is generated.

`safe-review/` contains exactly four JSON candidates: fingerprint-only manifest, execution receipt and two aggregate diagnostics. They use fixed aliases and aggregate scores/counts/undefined reasons, with no original item/store IDs, source rows, daily histories, private filenames/paths or raw scope. Inspect candidates locally before proposing publication; authorization, privacy, availability assumptions and exact-head evidence review remain required. Traced Python allocations are not process RSS; wall time describes only this local bounded run. Neither generated tests nor a successful operator-declared receipt establishes learner comprehension or historical reproduction.

## Recovery

| Failure or undefined condition | Recovery |
| --- | --- |
| Missing authorized input/scope or access proof | Keep the optional actual-data run blocked until private paths and frozen selection/provenance are available. |
| Scope exceeds twelve, duplicate/unknown series or wrong daily range | Preserve source files; revise the predeclared scope/input version in a separate attempt before interpreting results. |
| Input byte cap exceeded | Stop without truncation; review a separately declared private preparation/scope strategy. |
| Nonfinite/negative sales, duplicate calendar/price keys or date gaps | Inspect originals privately and document corrections; do not silently remove or fill records. |
| Zero/short/constant active history | Keep primary MAE and the explicit undefined RMSSE; no epsilon or exclusion. |
| Price timing unverified, missing positive-sales price or zero revenue | Keep explicit undefined weighted diagnostic; review source/availability evidence without future imputation. |
| Git/web-root path, helper hash mismatch, changed input or existing output | Move to private roots, restore pinned files, freeze inputs and use a fresh attempt folder. |
| Numeric scoring overflow | Retain failure, inspect units privately and review scope; do not clip to claim success. |

Next lesson: propose a separately reviewed hierarchy/scoring-parity experiment with complete coverage and measured resources. That experiment is not implemented or executed by this candidate.
