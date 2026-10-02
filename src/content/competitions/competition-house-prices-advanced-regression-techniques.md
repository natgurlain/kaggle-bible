---
{
  "schema_version": 1,
  "id": "competition-house-prices-advanced-regression-techniques",
  "status": "published",
  "title": "House Prices: train-only target statistics",
  "summary": "Compare two original feature and ensemble workflows, audit preprocessing outside folds, then run a controlled log-price baseline.",
  "reviewed_by": "GPT-6 Luna Max",
  "reviewed_at": "2026-09-30",
  "learning_goals": [
    "Distinguish log-price RMSE from log1p error.",
    "Fit target-derived category statistics inside training folds.",
    "Require a common split before interpreting an ensemble gain."
  ],
  "meta_kaggle_id": "5407",
  "kaggle_bible_completeness_level": 2,
  "kaggle_bible_completeness_label": "evidence-map",
  "editorial_status": "published",
  "slug": "house-prices-advanced-regression-techniques",
  "kaggle_slug": "house-prices-advanced-regression-techniques",
  "competition_url": "https://www.kaggle.com/competitions/house-prices-advanced-regression-techniques",
  "end_date": null,
  "coverage": "reviewed",
  "modalities": [
    "tabular"
  ],
  "tasks": [
    "regression"
  ],
  "dataset_characteristics": [
    "grouped-entities",
    "small-labeled-set"
  ],
  "metrics": [
    {
      "id": "log-rmse",
      "name": "RMSE of log prices",
      "direction": "minimize",
      "aggregation": "Root mean square of log(predicted price) minus log(actual price)",
      "source_id": "source-house-official"
    }
  ],
  "solution_ids": [
    "solution-house-thinkrunner",
    "solution-house-massquantity"
  ],
  "practice_ids": [
    "practice-validation-checks"
  ],
  "source_ids": [
    "source-house-official",
    "source-house-thinkrunner",
    "source-house-massquantity"
  ],
  "claims": [
    {
      "id": "task-01",
      "statement": "House Prices predicts residential sale prices and scores the root mean squared difference between logarithms of predicted and observed prices.",
      "kind": "source-reported",
      "evidence": [
        {
          "source_id": "source-house-official",
          "locator": "Official evaluation",
          "support_summary": "The evaluation describes log-price RMSE."
        }
      ],
      "supports_claim_refs": [],
      "reproduction_ids": [],
      "conditions": "Official Getting Started task; price predictions must be positive to take logarithms.",
      "limitations": "The metric alone does not verify any author implementation or fitting protocol."
    },
    {
      "id": "experiment-01",
      "statement": "Compare a global training log-price mean with a neighborhood log-price mean shrunk toward that global mean, on five identical random folds.",
      "kind": "editorial-inference",
      "evidence": [],
      "supports_claim_refs": [
        "solution-house-thinkrunner#validation-01",
        "solution-house-massquantity#validation-01"
      ],
      "reproduction_ids": [],
      "conditions": "Fit all category target statistics inside each fold and use a fixed smoothing weight.",
      "limitations": "This simple original lab does not reproduce stacking/PCA authors or establish spatial/time transfer."
    }
  ],
  "learning_card": {
    "outcome": "Compare global and neighborhood means of log prices on frozen folds and explain log-scale RMSE, fallback groups and target-scale limits.",
    "prerequisites": [
      "Read numerical and categorical columns, averages and a regression error metric."
    ],
    "actual_data_access": {
      "instructions": "For actual-data work, obtain authorized train.csv from the official data page. Sign-in and rule acceptance may be required. Competition data is not bundled.",
      "url": "https://www.kaggle.com/competitions/house-prices-advanced-regression-techniques/data"
    }
  }
}
---

# House Prices: train-only target statistics

Build a trustworthy log-price baseline before combining many models. The official evaluation is RMSE between logarithms of prices. [claim:task-01] This Level 2 evidence map compares two independently authored implementations and their validation limits.

## Suggested first experiment

[Run the neighborhood-price exercise](/exercises/#exercise-house-neighborhood). Compare the global training log-price mean with one change: a neighborhood mean shrunk toward the global mean using a fixed weight of five training examples. Keep the same five folds and fit those means inside each training split. [claim:experiment-01] The downloadable default uses generated teaching homes, not Ames data. Inspect per-fold errors and unseen-category fallback before changing a model.

## Problem, data, and evaluation

Predict a positive sale price and measure log-price RMSE. [claim:task-01] thinkrunner uses a log1p target, which is related to but differs from the official logarithm. [View evidence](#evidence-solution-house-thinkrunner-validation-01) massquantity uses the natural logarithm of SalePrice. [View evidence](#evidence-solution-house-massquantity-validation-01) The exercise uses natural logarithms, reads Id, Neighborhood and SalePrice from an authorized CSV, and generates its own small fixture. It does not download or redistribute competition data. Review current official access and participation rules before obtaining it.

## Approaches

thinkrunner's implementation uses engineered features, target encoding and several stacked regression families. [View evidence](#evidence-solution-house-thinkrunner-approach-01) massquantity explores engineered features, PCA, weighted averaging and stacking. [View evidence](#evidence-solution-house-massquantity-approach-01) Neither is a verified final winning entry here. Do not attribute their reported score changes to one component without an unchanged split, preprocessing scope and tuning budget.

## Validation and leakage checks

The thinkrunner README says encoders and scalers fit each fold, but its inspected notebook constructs target encoding and selected processed features before model cross-validation. [View evidence](#evidence-solution-house-thinkrunner-validation-01) massquantity likewise performs pipeline/PCA fitting before model CV; its stacking class does produce fold-trained base predictions. [View evidence](#evidence-solution-house-massquantity-validation-01) That distinction matters: OOF model predictions cannot remove information already introduced by target-based preprocessing. Start by moving fitted transforms into the resampling procedure, then remeasure on a declared split.

## Source limitations

Both original implementations were inspected as text and not executed. Rolling leaderboard ranks and public scores are not imported as verified results. Exact hardware, final-pipeline time and memory, dependency compatibility, isolated PCA/stacking gains and reproduction status remain unknown. The generated lab proves only a small local workflow, with no competition score. Full current rules were not inspected; read them on Kaggle before entering.

## Unresolved questions

How does each author pipeline perform after fold-isolating preprocessing and target encoding? Do neighborhood-held-out or chronological splits change the model ordering? A useful contribution supplies a precise source locator, authorized data scope, full split description and actual run receipt.
