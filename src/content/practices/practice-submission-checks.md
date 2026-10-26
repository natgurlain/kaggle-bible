---
schema_version: 1
id: practice-submission-checks
slug: submission-checks
status: draft
title: Validate the file and choose finals from local evidence
summary: A pre-submission checklist and a final-selection rule for competitions with daily limits and a public leaderboard that covers a different window from final scoring.
reviewed_by: null
reviewed_at: null
topic: submissions
evidence_scope: recurring
modalities:
  - tabular
tasks:
  - binary-classification
  - regression
  - forecasting
dataset_characteristics:
  - temporal
techniques: []
evidence_claim_refs:
  - "competition-home-credit-default-risk#rules-submission-01"
  - "competition-m5-forecasting-accuracy#rules-participation-01"
  - "competition-m5-forecasting-accuracy#horizon-01"
  - "competition-m5-forecasting-accuracy#data-structure-01"
  - "solution-home-credit-8th#validation-01"
  - "competition-home-credit-default-risk#result-12th-01"
  - "competition-house-prices-advanced-regression-techniques#task-01"
  - "solution-house-thinkrunner#validation-01"
  - "competition-titanic#task-01"
source_ids:
  - source-home-credit-rules
  - source-home-credit-8th
  - source-home-credit-12th
  - source-m5-official
  - source-m5-data
  - source-m5-rules
  - source-house-official
  - source-house-thinkrunner
  - source-titanic-official
claims:
  - id: recommendation-01
    statement: Before every upload, check the prediction file against the official format, identifiers, row count, value range and the inverse of any target transform, and record which model artifact produced it.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - "competition-house-prices-advanced-regression-techniques#task-01"
      - "solution-house-thinkrunner#validation-01"
      - "competition-titanic#task-01"
      - "competition-m5-forecasting-accuracy#horizon-01"
      - "competition-m5-forecasting-accuracy#data-structure-01"
    reproduction_ids: []
    conditions: The competition publishes a submission format or sample file and an evaluation definition.
    limitations: The cited official descriptions establish formats and metrics for these historical competitions only; no submission error from a participant is recorded in these sources.
  - id: recommendation-02
    statement: Plan submissions around the competition's daily and final-selection limits, and choose final submissions primarily from local validation, using the public leaderboard as a check on a window that may differ from final scoring.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - "competition-home-credit-default-risk#rules-submission-01"
      - "competition-m5-forecasting-accuracy#rules-participation-01"
      - "competition-m5-forecasting-accuracy#horizon-01"
      - "solution-home-credit-8th#validation-01"
      - "competition-home-credit-default-risk#result-12th-01"
    reproduction_ids: []
    conditions: The competition separates a public leaderboard from final private scoring and limits daily or final submissions.
    limitations: One team's report of a small CV-to-public gap and another team's local and public scores do not show how well public scores predict private ones in general.
---

# Validate the file and choose finals from local evidence

## Decision

Decide two things before the deadline: whether each file is a correct submission of the intended model, and which submissions to select for final judging. File checks prevent avoidable scoring errors; selection rules prevent spending scarce slots chasing a public window. [claim:recommendation-01] [claim:recommendation-02]

## Use when

Any competition with a fixed submission format, a daily submission limit, a cap on final selections, or a public leaderboard computed on a different subset or period from the final score.

## Avoid or adapt when

If a competition runs your inference code on hidden data, it may add runtime and environment constraints that this checklist does not cover; none of the cited competitions is described that way here, so check that competition's own rules. If the public leaderboard is known to cover the same distribution as final scoring, it is more informative, but it is still a small sample to select against repeatedly.

## Procedure

1. Read the evaluation page and sample submission: identifier column, prediction column, expected row count, value type and allowed range.
2. Generate the file from a saved model artifact and record its receipt, as in the companion practice record `practice-experiment-receipts`.
3. Check the file: header names, unique identifiers matching the sample exactly, no missing or extra rows, no missing or infinite values, values in range.
4. Undo any target transform with its exact inverse; for log-scored targets, confirm predictions are positive.
5. Compute the local official metric for the same model on validation and record it beside the public score.
6. Budget daily slots for decisions that need them, and choose finals by the local evidence agreed beforehand.

## Diagnostics and success criteria

A good submission round produces a file that passes all format checks and a public score roughly consistent with local validation for that model. A large unexplained gap between local and public results is a reason to recheck the split, file and transform, not to tune toward the public score. The final selection should be explainable from recorded local results.

## Competition evidence and disagreements

Formats and metrics differ across tasks. Titanic scores binary survival labels by accuracy; House Prices scores RMSE between logarithms, so predicted prices must be positive. [Titanic task](/competitions/titanic/#evidence-task-01) [House task](/competitions/house-prices-advanced-regression-techniques/#evidence-task-01) thinkrunner trains on `log1p` prices while evaluation uses logs, so the inverse transform must match the transform actually used. [House target](/competitions/house-prices-advanced-regression-techniques/#evidence-solution-house-thinkrunner-validation-01)

M5 shows why the public window is only a check. Kaggle separates a public validation horizon, d_1914–d_1941, from a private evaluation horizon, d_1942–d_1969, with separate sales files for the two periods. [M5 horizons](/competitions/m5-forecasting-accuracy/#evidence-horizon-01) [M5 files](/competitions/m5-forecasting-accuracy/#evidence-data-structure-01)

Limits differ too: Home Credit allowed five daily submissions and two final selections; M5 allowed five daily submissions and one final selection. [Home Credit limits](/competitions/home-credit-default-risk/#evidence-rules-submission-01) [M5 limits](/competitions/m5-forecasting-accuracy/#evidence-rules-participation-01)

On consistency between local and public scores, the Home Credit eighth-place team reports a small CV-to-public gap, and the twelfth-place authors report local-CV AUC 0.8047 with public 0.803. [8th gap](/competitions/home-credit-default-risk/#evidence-solution-home-credit-8th-validation-01) [12th scores](/competitions/home-credit-default-risk/#evidence-result-12th-01) These are author reports on one competition, not evidence about private-score behavior; in these records, only the eighth-place team's final private AUC is matched to the official leaderboard.

## Cost and alternatives

Automated file checks are editorially expected to be cheap relative to training, but the sources measure no submission tooling cost. The alternative of relying on the platform's upload validation catches format errors but not a wrong transform or wrong model artifact.

## Next experiment

For the House Prices task, write a submission checker that compares a candidate file with the sample submission's identifiers and row count, rejects non-positive or non-finite prices, and recomputes local log-price RMSE for the same model on its validation folds. Run it on a deliberately broken file, such as one with a `log1p` prediction left untransformed, to confirm it fails. This is a proposed tooling check, not a scored result. See the [House Prices evidence map](/competitions/house-prices-advanced-regression-techniques/).

## Sources and review notes

Evidence is official competition descriptions and rules plus participant reports linked above. No primary Kaggle platform documentation on submission validation is cited. Draft awaiting independent review.
