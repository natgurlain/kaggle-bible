# Disaster Tweets private-input package (blocked candidate)

No authorized competition input has been supplied or executed. This software package and its generated tests do not complete [#71](https://github.com/natgurlain/kaggle-bible/issues/71); the published word-pair fixture remains separate and unchanged. Keep the candidate draft and blocked until access, duplicate policy and successful safe execution evidence have been reviewed.

## Authorized private setup

The data owner must inspect the current official [data page](https://www.kaggle.com/competitions/nlp-getting-started/data) and [rules](https://www.kaggle.com/competitions/nlp-getting-started/rules), obtain authorized files and provide private paths. This package does not acquire files, accept terms, contact a service or upload a submission. A fingerprint proves consistency, not origin or permission.

Copy four pinned files together outside Git, `public` and `dist`: `nlp-actual-data.py`, `nlp-actual-data.ipynb`, `nlp-actual-data-environment.txt`, and unchanged `nlp-word-pairs.py`. Use Python 3.12.14 and its standard library. Metadata pins all four hashes; the runner verifies and compiles the helper's exact bytes without cached bytecode. Do not use the legacy helper's `--csv` main for public evidence: it writes normalized raw input. The notebook delegates to the same runner, with no saved text outputs.

Training CSV needs canonical unique non-negative-integer `id`, non-empty tokenizable `text`, and binary `target` 0/1. Optional test CSV needs unique `id` and `text`, excludes `target`, and has no training IDs or exact token-normalized texts. Extra input columns such as keyword/location are ignored. The original tokenizer keeps lowercase ASCII letters/digits; punctuation, non-ASCII tokens and context may be lost. Encoding is UTF-8 with optional BOM. Inputs and all outputs, including paths resolved through symlinks, must remain outside Git and web roots. Use a fresh attempt directory and retain previous failures or unfavorable results.

Replace these example paths with authorized private locations:

```sh
export NLP_TRAIN_CSV=/private/learner-data/tweets/train.csv
export NLP_TEST_CSV=/private/learner-data/tweets/test.csv
export NLP_OUTPUT_DIR=/private/learner-runs/nlp-attempt-1
export NLP_DATA_KIND=competition-data
python3 nlp-actual-data.py --acknowledge-authorized-data
```

Omit `NLP_TEST_CSV` if unavailable. CLI alternatives are `--train-csv`, `--test-csv`, `--output-dir`, `--data-kind`. Declaring `competition-data` does not authenticate provenance or authorize access. Generated software tests must declare `generated-test-data`, which cannot satisfy actual-data acceptance. Launch the notebook from the same private package folder and environment, with a different attempt directory. Compare fold/aggregate metrics and all fingerprints exactly; resource observations may differ between executions.

## Declare duplicate handling before scoring

The fixed primary comparison rejects exact **token-normalized duplicates** within either input and exact normalized train/test overlap. It does not silently drop, relabel or group rows. Blank/token-empty texts and fewer than five training examples of either class also reject the attempt. If authorized files contain duplicates, preserve the originals and the failure; a separate, reviewed selection/grouping policy must define its input identity and scope before any claimed score. Do not delete examples merely to make the runner pass.

Near-duplicate and template leakage remains unresolved. A declared warning heuristic masks numeric tokens and counts how many held-out rows share that template with training. It preserves all rows and the original stratified folds; it is neither a general semantic similarity detector nor a grouped split. Event, user and temporal overlap are not controlled. An optional duplicate-aware sensitivity analysis must be a separate experiment, retaining this primary comparison and its limitations.

## Same-fold text comparison and diagnostics

The shared helper fixes seed 17, five target-stratified folds, unigram Naive Bayes versus adjacent word pairs, add-one feature smoothing and an unchanged prediction rule (positive only when its log score is strictly larger; ties predict zero). Fit vocabulary, class counts, document priors and feature totals using each training fold only. Held-out features absent from its fitted vocabulary are ignored. Every training row validates once per method; neither held-out labels nor test data enter fitting.

The declared metric is positive-class F1: `2 TP / (2 TP + FP + FN)`, with zero when that denominator is zero. The receipt aggregate is unweighted mean fold F1, distinct from pooled OOF F1 and hidden competition test F1. Both configurations and worse fold results remain recorded. Public confusion counts help identify false positives and negatives; they do not explain individual text errors or prove real-world transfer.

Each input is read into one byte snapshot. Its hash, byte count and parsed rows derive from those same bytes. Detected changes after evaluation reject the attempt; manifests remain bound to the parsed snapshot if files change immediately after the final check.

- `local-errors.csv` stays private. It records each wrong method prediction with id, fold, target, prediction, error type and raw text. A row may appear once for each method if both are wrong. An empty file body is valid when no errors occur. Inspect a bounded few false positives/negatives locally, then report only aggregate interpretation and limitations; do not post excerpts, source text, IDs or location fields.
- Optional `submission.csv` stays private, with exactly `id,target`, every test ID once in input order and binary predictions. The runner validates it locally; `--validate-submission` plus the declared private test file can check another candidate. It never uploads.
- `safe-review/` contains four JSON candidates: fingerprint-only manifest, execution receipt and two aggregate diagnostics. They contain fold differences/membership hashes/template-overlap counts and aggregate OOF confusion/pooled F1, with no raw text, IDs, token examples, template strings or private filenames/paths. Pooled F1 is labeled diagnostic; it does not replace mean fold F1.

The candidates require independent privacy, source/access and exact-head review before publication or readiness promotion. Traced Python allocations are not process RSS, and elapsed time covers only this local run/output preparation. No actual learner compute budget, historical solution reproduction or comprehension result is established here.

## Recovery

| Failure | Recovery |
| --- | --- |
| Missing authorized data/access evidence | Keep acceptance blocked; the data owner supplies private paths and reviewed provenance. |
| Git/web-root path or existing output folder | Move to private folders and select a fresh attempt; preserve prior artifacts. |
| Helper fingerprint mismatch | Restore the exact pinned helper/environment; never bypass validation. |
| Duplicate/token-empty text | Keep originals and the failure. Define a separate reviewed input/grouping policy without silent deletion. |
| Header, ID, label or class-count error | Inspect the private original; document any necessary source correction rather than silently changing labels or dropping rows. |
| Input changes | Freeze the files and rerun into a new private folder. |
| Submission identity/shape/value mismatch | Validate against the declared test CSV locally; correct without uploading. |

Next experiment: freeze a duplicate-aware grouped split before fitting and compare these same methods as a separate sensitivity analysis. Its result requires separate authorized data and execution evidence.
