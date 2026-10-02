---
{
  "schema_version": 1,
  "id": "competition-digit-recognizer",
  "status": "published",
  "title": "Digit Recognizer: shape checks before model complexity",
  "summary": "Compare two original neural workflows and their split/budget limits, then run a bounded CPU pixel-centroid experiment.",
  "reviewed_by": "GPT-6 Luna Max",
  "reviewed_at": "2026-09-30",
  "learning_goals": [
    "Check pixel shape and labels before model training.",
    "Fit model statistics inside each training fold.",
    "Keep representation changes separate from split and compute changes."
  ],
  "meta_kaggle_id": "3004",
  "kaggle_bible_completeness_level": 2,
  "kaggle_bible_completeness_label": "evidence-map",
  "editorial_status": "published",
  "slug": "digit-recognizer",
  "kaggle_slug": "digit-recognizer",
  "competition_url": "https://www.kaggle.com/competitions/digit-recognizer",
  "end_date": null,
  "coverage": "reviewed",
  "modalities": [
    "image"
  ],
  "tasks": [
    "multiclass-classification"
  ],
  "dataset_characteristics": [
    "small-labeled-set"
  ],
  "metrics": [
    {
      "id": "accuracy",
      "name": "Accuracy",
      "direction": "maximize",
      "aggregation": "Fraction of correctly classified images",
      "source_id": "source-digits-official"
    }
  ],
  "solution_ids": [
    "solution-digits-juice",
    "solution-digits-land"
  ],
  "practice_ids": [
    "practice-validation-checks"
  ],
  "source_ids": [
    "source-digits-official",
    "source-digits-juice",
    "source-digits-land"
  ],
  "claims": [
    {
      "id": "task-01",
      "statement": "Digit Recognizer classifies28\u00d728 grayscale images into digits 0\u20139 and evaluates accuracy.",
      "kind": "source-reported",
      "evidence": [
        {
          "source_id": "source-digits-official",
          "locator": "Official Dataset Description; evaluation",
          "support_summary": "Kaggle describes784 integer pixel fields0\u2013255, a label and the fraction of correctly classified test images."
        }
      ],
      "supports_claim_refs": [],
      "reproduction_ids": [],
      "conditions": "Official Getting Started task.",
      "limitations": "The competition file format is not a claim that a generated teaching pattern is a real handwritten digit or that canonical MNIST train/test sizes apply."
    },
    {
      "id": "experiment-01",
      "statement": "Compare training-only nearest-class centroids on raw pixels with one per-image L2-normalization change using the same five stratified folds.",
      "kind": "editorial-inference",
      "evidence": [],
      "supports_claim_refs": [
        "solution-digits-juice#approach-01",
        "solution-digits-land#validation-01"
      ],
      "reproduction_ids": [],
      "conditions": "Original bounded CPU lab with fixed pixel shape, row cap and split; normalization uses only each image itself.",
      "limitations": "The generated geometric patterns and centroid model reproduce neither CNN author pipeline nor handwritten-digit recognition quality."
    }
  ],
  "learning_card": {
    "outcome": "Compare raw and normalized image centroids on unchanged folds and explain image-shape, writer-grouping and distribution-shift limits.",
    "prerequisites": [
      "Read flattened 28 by 28 pixel arrays, class labels and accuracy."
    ],
    "actual_data_access": {
      "instructions": "For actual-data work, obtain authorized train.csv from the official data page. Sign-in and rule acceptance may be required. Competition data is not bundled.",
      "url": "https://www.kaggle.com/competitions/digit-recognizer/data"
    }
  }
}
---

# Digit Recognizer: shape checks before model complexity

The official input is 28×28 grayscale pixels and the target is a digit 0–9, scored by accuracy. [claim:task-01] This Level 2 evidence map compares two independent primary workflows; a small original CPU exercise teaches the fitting and validation loop.

## Suggested first experiment

[Run the pixel-centroid exercise](/exercises/#exercise-digit-centroids). Compare raw-pixel nearest-class centroids with one per-image L2-normalization change on the same five stratified folds. Keep shape, seed, row cap and accuracy fixed; calculate each class centroid from training rows only. [claim:experiment-01] The default generated geometric patterns are not handwriting or MNIST samples. Their score demonstrates the workflow, not real digit-recognition performance.

## Current learner role

**Outcome:** check the 28×28 / 784-pixel layout, fit nearest-class centroids inside training folds, and compare one per-image L2 change under the same validation. Prerequisites are flattened image arrays, labels 0–9, vector length, class means and accuracy, plus running the pinned Python script. A neural model is not required.

**Execution state:** the [published centroid project](#exercise-digit-centroids) is a runnable generated teaching fixture with a measured fixture receipt. Its 200 geometric patterns are not handwritten digits, MNIST samples or competition images. Actual-data execution and its resource needs remain unverified. Competition input access must be established separately on the [official data page](https://www.kaggle.com/competitions/digit-recognizer/data); no competition images are bundled.

**Next task:** an explicitly unassigned maintainer must establish authorized local input access and prepare the safe actual-data adapter described below. Keep the current fixture receipt, data artifact and code pins intact. Optional legacy CSV mode writes normalized rows into a local `*-data.json`; keep that file private rather than publishing it as a verification artifact.

## Bounded future actual-data experiment

This is a planned port, not an executed result. Its data-access owner is **maintainer — unassigned**; the next action is to record current rules/access authorization, authorized local input provenance and header/class checks before writing or running the port.

1. **Freeze input and validation.** Use at most the first 1000 authorized training rows in their recorded file order. Declare the exact prefix length and input file hash before fitting. Require `label,pixel0,...,pixel783` in order, 784 finite values in 0–255 and integer labels 0–9; require at least five examples of every digit. Keep five label-stratified folds with seed 17, and retain the private assignment plus a public split fingerprint. A prefix may be biased and does not establish writer-held-out or full-data performance. If class coverage fails, stop; changing the sample requires a newly declared scope and a fresh comparison.
2. **Baseline and one change.** Fit raw-pixel class centroids using training rows only. Compare per-image L2-normalized centroids on exactly those folds; the zero-length image remains the zero vector. Keep metric (accuracy), shape, row cap and seed fixed. No neural model, augmentation, tuning loop or leaderboard submission is required. A worse result is still an informative completed comparison.
3. **Diagnostics.** Record aggregate class counts, blank-image counts, each fold's accuracy difference, per-class accuracy and a ten-class confusion matrix for both methods. Publish only permitted aggregate summaries through the closed diagnostic JSON contract; do not publish images, pixel arrays, row identifiers or private assignments. Explain which class errors disagree and why this split cannot establish generalization across writers or image shifts.
4. **Measure resources and retain limits.** Pin script, notebook, environment and any imported helper; the notebook must execute the shared script. Measure full parse/validation/fit/predict/diagnostic wall time, per-method wall time and peak process RSS with a documented measurement boundary. Record CPU/platform, Python/dependency versions, thread count and exact sample/split/configuration in permitted receipt fields or diagnostic summaries. Runtime, process memory and learner completion time are currently unknown; the existing traced-allocation fixture receipt is not this budget. Preserve negative outcomes and sampling limits.
5. **Publication gate.** Build a successful actual-data receipt with fingerprint-only public inputs and diagnostic artifacts under the [project readiness contract](https://github.com/natgurlain/kaggle-bible/blob/main/docs/content-model.md#learning-project-readiness-incremental-version-1-extension). The old CSV runner's raw-row artifact and `reader-provided-data` label do not satisfy that contract. Until authorized execution and evidence review occur, this port stays planned and cannot replace the synthetic receipt or be called actual-data verified.

## Problem, data, and evaluation

The official training format contains a label plus 784 integer pixel columns, named pixel0 through pixel783, with values 0–255. Predictions are digit labels and the metric is accuracy. [claim:task-01] The lab accepts this pixel layout from an authorized CSV, with a declared bounded prefix sample rather than the full competition dataset. No competition images are distributed here. Obtain them on Kaggle after reviewing and accepting current rules yourself; no download or submission is automated.

## Approaches

juicebocks27 combines fixed pixel scaling/reshaping, a CNN and training-image augmentation. [View evidence](#evidence-solution-digits-juice-approach-01) John Land presents dense and convolutional models with unequal training budgets. [View evidence](#evidence-solution-digits-land-approach-01) Neither record establishes a shared-budget winning architecture. Treat them as study hypotheses and audit their split/preprocessing order before reuse.

## Validation and leakage checks

The first notebook uses a random 10% holdout with seed 2 and no explicit stratification; augmentation uses training images. [View evidence](#evidence-solution-digits-juice-validation-01) Land fits a scaler before using 20% validation_split, and process_time supplies CPU timing rather than wall timing. [View evidence](#evidence-solution-digits-land-validation-01) The exercise instead computes class means inside folds and uses per-image normalization without population fitting. Random class stratification still does not establish generalization across writers or shifts. A prefix sample can also be biased; report its row cap and class counts rather than claiming a full-data result.

## Source limitations

Author pipelines, foreign dependencies and competition images were not executed here. Source ranks, comparable gains, hardware, full-pipeline wall time/memory and historical reproduction remain unknown. Generated patterns are deliberately separate from MNIST and Kaggle data. Full current rules were not inspected; review them on Kaggle before obtaining data or entering.

## Unresolved questions

Does the same CNN/augmentation change help under an unchanged split and training budget? How do writer grouping or image shifts alter results? Submit a precise source locator and actual authorized-data receipt with shape, sample, split and resource scope for a correction or new experiment.
