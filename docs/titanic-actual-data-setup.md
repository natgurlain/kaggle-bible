# Titanic actual-data package: blocked candidate

This is the software portion of [#67](https://github.com/natgurlain/kaggle-bible/issues/67). No authorized Titanic files have been supplied or executed. The new exercise record is **draft / blocked**, and there is no actual-data receipt in this repository. Generated software tests verify parsing, computation, privacy and notebook delegation; they cannot satisfy actual-data acceptance. The existing generated passenger exercise and its measured fixture receipt stay unchanged.

## Obtain private inputs yourself

Open the [official Titanic data page](https://www.kaggle.com/competitions/titanic/data), inspect the [current rules](https://www.kaggle.com/competitions/titanic/rules), and follow Kaggle's current access prompts. This package neither accepts terms nor downloads files. If the account, rules or download process is unavailable, stop and retain the access blocker. Public source readability does not grant redistribution permission.

Use an authorized, unmodified `train.csv`; optional official `test.csv` enables local submission generation. Keep both files outside every Git checkout and outside directories named `public` or `dist`. The loader retains only PassengerId, Sex, Pclass and training Survived in memory. It ignores names, tickets and other columns; no normalized passenger artifact is written. Missing Sex/Pclass values become an explicit missing group. Unexpected nonmissing values, malformed rows, duplicate/noncanonical IDs and invalid targets stop the run.

## Official file-description receipt

On 2026-10-02, a direct web open of the official data route returned a title with no readable body. Search retrieval exposed indexed text from the official [Titanic data page](https://www.kaggle.com/c/titanic/data), reported as crawled last week. `Dataset Description > Overview` identifies labeled `train.csv`, unlabeled `test.csv`, and `gender_submission.csv` as an example prediction file. `Metadata > License` says data is subject to competition rules, and the indexed data-explorer prompt requires signing in or registering and agreeing to the rules. This records official file roles and the indexed access prompt, not completed access, current rules inspection or permission to redistribute. The authorized-data and execution blockers remain.

## Download the pinned package

Keep these four files together in a local tools directory outside Git/public/dist:

- [New runner](../public/exercises/titanic-actual-data.py)
- [New notebook](../public/exercises/titanic-actual-data.ipynb)
- [Environment target](../public/exercises/titanic-actual-data-environment.txt)
- [Unchanged computation helper](../public/exercises/titanic-group-rules.py)

Use Python 3.12.14 and its standard library for the declared environment. The runner accepts Python >=3.11, but a run with another version/platform needs matching recorded conditions before any verified publication. A notebook frontend is optional; the runner needs no package installation. The helper's SHA-256 is enforced before import and is included in the package/receipt pins.

Create a private working location and set these environment variables to your own private paths before running or launching a notebook:

```sh
export TITANIC_TRAIN_CSV="/your/private/input/train.csv"
export TITANIC_OUTPUT_DIR="/your/private/results/new-run"
export TITANIC_DATA_KIND="competition-data"
# Optional, for local submission-format checks:
export TITANIC_TEST_CSV="/your/private/input/test.csv"
python3 titanic-actual-data.py --acknowledge-authorized-data
```

The output directory must be new; existing attempts are never overwritten. The authorization flag is your declaration of authorized access, not verification of input origin. Do not place credentials, usernames or private paths in publication notes. The notebook's sole code cell calls this same runner with these environment variables; it contains no separate fitting, split or metric calculation. Keep notebook outputs empty in the distributed package. Run script and notebook into separate private directories, then compare fold results, aggregates, manifest and diagnostic fingerprints exactly (tolerance zero); runtime/memory vary and are not expected to match.

`--train-csv`, `--test-csv`, `--output-dir` and `--data-kind` can also be supplied explicitly. `generated-test-data` is reserved for software checks and produces a clearly labeled generated-test receipt. It never establishes actual-data readiness. Do not relabel generated inputs as competition data.

## Read the comparison before choosing another change

The helper fixes seed 17 and five target-stratified folds. Every row validates once. Both configurations use identical folds: a sex-majority baseline versus one sex-and-class-majority change. Group decisions and unseen-group fallback are fitted from training labels only; ties predict zero. Neither validation targets nor test labels can influence rules.

Inspect each fold's accuracy and change-minus-baseline difference, then the unweighted fold mean. Accuracy is the fraction of correct binary predictions on that fold; it is neither the competition's hidden test score nor evidence of a winning solution. A negative or inconsistent difference remains a valid result. Keep the split fixed and avoid repeatedly selecting changes against the same validation labels.

The diagnostics record hashes of split membership and zero train/validation overlap, plus aggregated out-of-fold errors by sex/class. Slices below ten rows are suppressed. Random stratification can put relatives or ticket groups in both sides; passing the overlap check does not establish family-independent transfer. The package does not inspect family identifiers or prove chronological availability.

## Keep public review candidates separate from private submissions

The private output folder contains `safe-review/` with four candidate JSON files: a fingerprint-only input manifest, a run receipt and two diagnostic summaries. The manifest uses generic `train.csv`/`test.csv` names, file hashes and byte counts, never source paths or passenger rows. The receipt binds all package/helper hashes, seed, splits, configurations, measured metrics/runtime and traced Python memory. Diagnostics contain only summary, observations and limitations. All outputs remain private until inspected; the runner does not copy anything into the site.

With `test.csv`, the runner also writes **private `submission.csv` outside `safe-review/`**. It fits the declared sex-class rule on all training rows and checks exactly two columns, binary predictions, every test ID once in input order, and disjoint training/test IDs. This checks format and identity, not hidden-test performance. Never publish this file. There is no upload or submission call. To check an existing private submission while rerunning the same experiment, add `--validate-submission /your/private/submission.csv` and supply the matching test CSV.

Before publication, inspect authorization/provenance and every candidate artifact, validate all four package pins against current files, record the actual environment, and run the #64 readiness/content checks plus exact-head independent review. Hashes prove consistency; they cannot authenticate the dataset's origin. Only a real authorized successful run may support the transition from blocked through runnable to actual-data verified. No such transition or result is recorded here.

## Setup recovery

| Symptom | Recovery |
| --- | --- |
| Python version error or notebook cannot find the runner | Use the pinned Python and run from the directory containing all four package files; start the notebook with the private environment variables set |
| File-access error | Inspect the private paths and permissions locally; do not paste private paths or OS error text into a public report |
| Git/public/dist path rejected | Move the inputs/output location outside those trees, including through symlinks |
| Helper fingerprint changed | Restore the pinned helper and environment; do not disable the check or reuse a stale receipt |
| CSV shape, target, ID or category error | Confirm the authorized official file is intact and is train versus test as declared; retain the failed attempt privately instead of silently editing labels |
| Fewer than five rows per target class | Use the complete authorized training input; do not substitute or relabel generated rows |
| Input changed during execution | Freeze the private files and rerun into a new output folder |
| Existing output folder | Choose a new private attempt folder; keep previous and worse results |
| Submission header/ID/value mismatch | Compare locally against the declared test file; regenerate or correct format without uploading |

Next lesson: [validation checks](../src/content/practices/practice-validation-checks.md). Propose one family-aware split as a future experiment, freeze it before fitting, and compare the same rules without tuning against held-out labels. Its applicability and outcomes require separate evidence.
