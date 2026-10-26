# House Prices private-input package: actual-data verified (one recorded run)

This package for [#70](https://github.com/natgurlain/kaggle-bible/issues/70) is **published / actual-data verified** for one recorded run on authorized competition data (see [Recorded actual-data run](#recorded-actual-data-run-2026-10-26)). Generated-fixture checks establish the self-contained software package acceptance and are separate from that run. Authorized private inputs are required only if a reader chooses an optional actual-data run; they are not a software acceptance prerequisite. The separate published neighborhood fixture remains unchanged.

## Recorded actual-data run (2026-10-26)

The repository owner's Kaggle account accepted the competition rules and downloaded the official, unmodified `train.csv` and `test.csv` through the Kaggle API. The pinned four-file package then ran as a script with `python3.12 -I house-actual-data.py --acknowledge-authorized-data --data-kind competition-data`, using explicit private input and output paths. The environment was Python 3.12.13 with the standard library only, on Darwin arm64. The first attempt ran under an environment file that declared Python 3.12.14 in a format the readiness checker could not match. The receipt pins that file, so the run could not be verified. The environment file was corrected without changing the runner, notebook or helper, and the package was rerun into fresh folders. Later, the notebook's introductory text was corrected: it still said no actual input had been run. That changed the pinned notebook hash, so script and notebook were run a third time on the same unmodified inputs. Only that third run is published. Its metrics, manifest and diagnostics are identical to the earlier runs; only the notebook fingerprint, wall time and traced memory differ.

- Public artifacts, copied unchanged from the script run's `safe-review/` folder after a privacy inspection: [receipt](../public/exercises/house-actual-data-receipt.json), [fingerprint-only input manifest](../public/exercises/house-actual-data-data.json), and diagnostics [1](../public/exercises/house-actual-data-diagnostic-1.json) and [2](../public/exercises/house-actual-data-diagnostic-2.json). They contain aggregate metrics, file hashes and byte counts, fold-membership hashes and suppressed-minimum bins only. The private `oof-residuals.csv` and `submission.csv` were not published.
- Result: on the same five seed-17 random folds, the global log-price mean averaged 0.3991 natural-log RMSE and fixed neighborhood smoothing averaged 0.2687. Smoothing was lower on every fold. Fold differences ranged from -0.111 to -0.151. Diagnostics show both methods over-predict homes below 100000 and under-predict homes at or above 200000 in log terms; smoothing reduces both biases.
- Notebook parity: an nbconvert-executed copy of the distributed notebook ran into a separate private folder in the same environment. The distributed notebook was not modified. Fold results, aggregates, input manifest, code fingerprints and both diagnostic files matched the script run exactly (tolerance zero). Only wall time and traced memory differed, as expected.
- Limits: one run on one machine. These are validation-fold results on `train.csv`, not a Kaggle leaderboard score; no submission was uploaded. The official logarithm base and exact scoring implementation remain uninspected (see below). Random folds do not test spatial or temporal transfer. Fingerprints show consistency with the recorded files, not their origin. Access is the operator's recorded declaration. Other Python versions and platforms are untested.

## Access and scoring evidence

For an optional actual-data run, the reader must inspect the official [data page](https://www.kaggle.com/competitions/house-prices-advanced-regression-techniques/data), [rules](https://www.kaggle.com/competitions/house-prices-advanced-regression-techniques/rules) and [evaluation page](https://www.kaggle.com/competitions/house-prices-advanced-regression-techniques/overview/evaluation) before using authorized private paths. No automatic download, terms acceptance, network call or upload occurs.

On 2026-10-02, direct web opens of the evaluation and overview/description routes returned titles with no readable body. Search retrieval exposed indexed text from the official [overview/description page](https://www.kaggle.com/competitions/house-prices-advanced-regression-techniques/overview/description), reported as crawled last month. Its `Evaluation > Metric` section defines RMSE between logarithms of predicted and observed sale prices; `Submission File Format` specifies `Id,SalePrice`. This confirms the official log-price RMSE metric family from indexed primary-source text, not a fresh direct-body inspection. The retrieved wording does **not** specify the logarithm base. This package uses the unchanged helper's natural logarithm; exact official scoring implementation/base parity remains unverified. Mean fold RMSE also remains distinct from scoring one complete prediction set. Current access permission and rules acceptance are not established by this source receipt.

## Pinned package and private paths

Copy these four files together into a private working folder outside Git, `public` and `dist`: `house-actual-data.py`, `house-actual-data.ipynb`, `house-actual-data-environment.txt` and the unchanged `house-neighborhood.py`. Use Python 3.12.13 with the standard library. The exercise metadata records all four hashes; the runner enforces the helper hash before compiling those exact bytes. The notebook calls the same runner and has no saved outputs or separate computation. Never call the legacy helper's `--csv` entry point for a public receipt: it writes normalized input rows.

Training CSV needs unique canonical positive-integer `Id`, `Neighborhood` (empty is allowed), and finite positive `SalePrice`. Optional test CSV needs unique `Id` and `Neighborhood`, excludes `SalePrice`, and has no training IDs. Extra source columns are ignored. Raw inputs and every output stay outside Git/web roots; the runner also resolves symlinks. Use a new output folder for every attempt, retaining failed and worse attempts.

For a local terminal run, replace the example paths with authorized private locations:

```sh
export HOUSE_TRAIN_CSV=/private/learner-data/ames/train.csv
export HOUSE_TEST_CSV=/private/learner-data/ames/test.csv
export HOUSE_OUTPUT_DIR=/private/learner-runs/house-attempt-1
export HOUSE_DATA_KIND=competition-data
python3 house-actual-data.py --acknowledge-authorized-data
```

Omit `HOUSE_TEST_CSV` if no test input is available. CLI alternatives are `--train-csv`, `--test-csv`, `--output-dir`, and `--data-kind`. The explicit `competition-data` declaration affirms intended origin; it does not prove source access or authorization. Generated tests must use `generated-test-data`, which cannot yield an actual-data evidence claim. Start the notebook from the same private folder and environment. Compare its fold/aggregate metrics and fingerprints exactly to the terminal run in a different attempt folder; elapsed time and memory may differ.

## Frozen comparison and units

Both methods use the same five seed-17 shuffled random folds. Every row validates once. Each fold fits only its training global natural-log price mean; the change fits each training neighborhood mean with **five fixed pseudo-examples** from that global mean. An unseen category falls back to the global log mean. Empty neighborhoods form their own category; do not silently relabel or drop records. No model family, smoothing tuning or split change is part of this comparison.

The evaluation is RMSE of natural-log prices. The receipt aggregate is the unweighted mean of the five fold RMSE values, distinct from pooled out-of-fold RMSE. Private predictions in dollars are `exp(log_prediction)`, a geometric-scale estimate rather than an arithmetic mean price. Residual sign is prediction minus actual value; log residuals and dollar residuals have different units. Dollar MAE is an explanatory diagnostic, never substituted for the declared metric. Random folds do not establish spatial or temporal transfer, and worse changes remain in the receipt.

## Private artifacts and safe review candidates

Each input is read into one byte snapshot. Its parsed rows, digest and byte count come from that same snapshot. A later file change detected after evaluation rejects the attempt; manifests remain bound to the parsed snapshot even if the file changes immediately after that check. Freeze inputs for any rerun.

- `oof-residuals.csv` is private: one row per training `Id`, fold, actual price, seen/unseen flag, both predicted log/dollar values and signed log/dollar residuals. It is not a public diagnostic.
- Optional `submission.csv` is private: exactly `Id,SalePrice`, every test ID once in input order, finite positive predictions. The runner validates it locally. To validate a separate private candidate, supply `--test-csv` and `--validate-submission` with its private path; no upload occurs.
- `safe-review/` contains exactly four JSON candidates: fingerprint-only manifest, receipt and two aggregate diagnostics. No IDs, category names, row predictions or private filenames/paths belong there. Price bins are fixed before running: below 100000, 100000 to below 200000, at least 200000; seen/unseen bins describe training coverage. Each public bin below ten rows is suppressed. Actual-price bins are retrospective diagnostics, never fitting features.

Inspect every candidate before proposing publication. Confirm input origin/access, pin consistency, fold coverage and resource scope. Traced Python allocations are not process RSS; elapsed time covers this local computation/output preparation, not historical-system or tuning costs. A safe directory is a candidate for independent privacy/evidence review, not automatic publication or proof of comprehension. Keep source rows, OOF residuals, submission IDs and credentials private. Only a successful authorized run and reviewed evidence can establish actual-data verified readiness under the project contract. The 2026-10-26 run above did; any package change demotes it until a new run is recorded.

## Recovery

| Failure | Recovery |
| --- | --- |
| Missing authorized input or unreadable official formula | Keep the optional actual-data run blocked until authorized paths and inspected source locators are available. |
| Input/output inside Git or a web root | Move the package, inputs and attempts to private folders outside those roots. |
| Helper hash mismatch | Restore the exact pinned helper/environment; never bypass the check. |
| CSV header, row shape, duplicate ID or price error | Inspect the private original locally, preserve source integrity and document any correction; do not silently discard rows. |
| Too few training rows | Use the complete authorized input; generated rows cannot substitute for Ames execution. |
| Nonfinite/zero exponentiated prediction | Retain the failure and inspect inputs/units privately; do not clip a prediction to claim success. |
| Input changed or output folder already exists | Freeze input and choose a fresh attempt folder; retain earlier artifacts. |
| Submission identity/shape mismatch | Check against the declared private test file and regenerate locally without uploading. |

Next experiment: freeze one spatial validation assumption before fitting and compare these same methods in a separate authorized run. Neither this software package nor a generated test establishes the result of that experiment.
