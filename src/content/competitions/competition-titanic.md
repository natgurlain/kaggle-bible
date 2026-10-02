---
{
  "schema_version": 1,
  "status": "published",
  "reviewed_by": "GPT-6 Luna Max",
  "reviewed_at": "2026-09-30",
  "id": "competition-titanic",
  "meta_kaggle_id": "3136",
  "title": "Titanic: a first validation loop",
  "summary": "Compare two original author tutorials, distinguish holdout and resampling claims, then run one small train-only group-rule experiment.",
  "learning_goals": [
    "Build a baseline before choosing a model family.",
    "Distinguish accuracy, ROC AUC and model-selection evidence.",
    "Keep transformations and group decisions inside each training split."
  ],
  "kaggle_bible_completeness_level": 2,
  "kaggle_bible_completeness_label": "evidence-map",
  "editorial_status": "published",
  "slug": "titanic",
  "kaggle_slug": "titanic",
  "competition_url": "https://www.kaggle.com/competitions/titanic",
  "end_date": null,
  "coverage": "reviewed",
  "modalities": [
    "tabular"
  ],
  "tasks": [
    "binary-classification"
  ],
  "dataset_characteristics": [
    "small-labeled-set",
    "grouped-entities"
  ],
  "metrics": [
    {
      "id": "accuracy",
      "name": "Accuracy",
      "direction": "maximize",
      "aggregation": "Fraction of correct binary survival labels",
      "source_id": "source-titanic-official"
    }
  ],
  "solution_ids": [
    "solution-titanic-agconti",
    "solution-titanic-wehrley"
  ],
  "practice_ids": [
    "practice-validation-checks"
  ],
  "source_ids": [
    "source-titanic-official",
    "source-titanic-agconti",
    "source-titanic-wehrley"
  ],
  "claims": [
    {
      "id": "task-01",
      "statement": "Titanic asks for binary survival predictions and evaluates the proportion of correct predictions.",
      "kind": "source-reported",
      "evidence": [
        {
          "source_id": "source-titanic-official",
          "locator": "Evaluation; submission format",
          "support_summary": "The official task uses survival labels and accuracy."
        }
      ],
      "supports_claim_refs": [],
      "reproduction_ids": [],
      "conditions": "Official Getting Started task.",
      "limitations": "This does not certify a historical author score, rank or future competition availability."
    },
    {
      "id": "experiment-01",
      "statement": "Compare a sex-group majority baseline with a sex-and-passenger-class group rule on the same five stratified folds, fitting group decisions only on training rows.",
      "kind": "editorial-inference",
      "evidence": [],
      "supports_claim_refs": [
        "solution-titanic-agconti#validation-01",
        "solution-titanic-wehrley#validation-01"
      ],
      "reproduction_ids": [],
      "conditions": "This is an original bounded teaching design with fixed seed and splits, rather than either author implementation.",
      "limitations": "Generated teaching passengers cannot establish performance on Titanic, and random stratification does not protect family groups."
    }
  ],
  "learning_card": {
    "outcome": "Compare passenger group rules on fixed stratified folds and explain why family overlap can limit the accuracy estimate.",
    "prerequisites": [
      "Read a small table with a binary target and distinguish training from validation rows."
    ],
    "actual_data_access": {
      "instructions": "For actual-data work, obtain authorized train.csv from the official data page. Sign-in and rule acceptance may be required. Competition data is not bundled.",
      "url": "https://www.kaggle.com/competitions/titanic/data"
    }
  }
}
---

# Titanic: a first validation loop

Start with a repeatable split and a simple baseline. The official task predicts survival and measures accuracy. [claim:task-01] This is a Level 2 evidence map of two independent teaching approaches, with a separate original exercise.

## Suggested first experiment

[Run the passenger-rule exercise](/exercises/#exercise-titanic-group-rules). Compare a sex-group majority rule with one change: split groups by passenger class too. Use the same five stratified folds, seed and accuracy calculation; fit every group decision on training rows only. [claim:experiment-01] The default generated fixture needs no account, packages or competition data. Inspect each fold, retain a worse result, and explain any reversal before trying another change.

## Actual-data package status

The [new actual-data package and private setup instructions](https://github.com/natgurlain/kaggle-bible/blob/main/docs/titanic-actual-data-setup.md) are a blocked candidate tracked in [#67](https://github.com/natgurlain/kaggle-bible/issues/67). No authorized Titanic input has been run or verified. The notebook delegates to the new privacy-safe runner and pinned original computation helper; generated software tests are separate from actual-data evidence. Keep submissions private and inspect review candidates before any publication. The existing fixture exercise remains available with its original labels.

## Problem, data, and evaluation

The target is survival as a binary label, and the competition metric is accuracy. [claim:task-01] The exercise reads Sex, Pclass and Survived from an authorized reader CSV; it deliberately ignores age, names and ticket relationships. Its generated fixture is not a Titanic data sample. Obtain official data through Kaggle after reviewing current access terms; this site does not distribute it or submit predictions.

## Approaches

Conti's Python notebook demonstrates logistic regression, SVM kernels and random forest. [View evidence](#evidence-solution-titanic-agconti-approach-01) Wehrley's R tutorial compares logistic regression, boosted trees, random forest and SVM. [View evidence](#evidence-solution-titanic-wehrley-approach-01) These are readable original tutorials, rather than verified winning entries. Presence in either notebook supplies a method to investigate; it does not show which model is best on a shared split or budget.

## Validation and leakage checks

Conti's inspected SVM block is a shuffled 90/10 holdout, despite the README's K-fold description. [View evidence](#evidence-solution-titanic-agconti-validation-01) Wehrley uses an 80/20 stratified holdout and repeated resampling, choosing by ROC AUC rather than Kaggle accuracy. [View evidence](#evidence-solution-titanic-wehrley-validation-01) Avoid treating these protocols or metrics as equivalent. Audit preprocessing order before reusing either notebook: some munging occurs before splits. The exercise deliberately learns only from the current training fold. Random stratification still does not answer how well a model transfers to unseen passenger families.

## Source limitations

Neither tutorial was executed here. Exact leaderboard placement, comparable scores, historical dependency compatibility and full-pipeline hardware, time and memory remain unknown. No historical reproduction is claimed. The linked author's code license does not settle dataset redistribution rights. Full current rules were not inspected; read them on Kaggle before obtaining data or entering.

## Unresolved questions

Which preprocessing steps can be isolated inside resampling without changing the authors' intended methods? Does a family-grouped split alter the same model ordering? An evidence-backed correction should include an exact source locator and a receipt on a declared authorized dataset.
