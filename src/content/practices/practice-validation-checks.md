---
schema_version: 1
id: practice-validation-checks
slug: validation-checks
status: in-review
title: Match validation to the prediction boundary
summary: A conditional checklist for choosing folds or forecast origins that reflect what will be unseen at prediction time.
reviewed_by: null
reviewed_at: null
topic: validation
evidence_scope: single-case
modalities:
  - tabular
tasks:
  - binary-classification
  - forecasting
dataset_characteristics:
  - grouped-entities
  - temporal
  - hierarchical
techniques:
  - stratified-cross-validation
evidence_claim_refs:
  - "competition-home-credit-default-risk#data-structure-01"
  - "solution-home-credit-8th#validation-01"
  - "solution-home-credit-12th#cv-result-01"
  - "competition-m5-forecasting-accuracy#horizon-01"
  - "solution-m5-2nd#approach-01"
  - "solution-m5-4th#validation-01"
source_ids:
  - source-home-credit-data
  - source-home-credit-8th
  - source-home-credit-12th
  - source-m5-official
  - source-m5-2nd
  - source-m5-4th
claims:
  - id: recommendation-01
    statement: Choose folds or forecast origins that recreate the information boundary the intended predictions will face, then report results at the fold or origin level.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - "competition-home-credit-default-risk#data-structure-01"
      - "solution-home-credit-8th#validation-01"
      - "solution-home-credit-12th#cv-result-01"
      - "competition-m5-forecasting-accuracy#horizon-01"
      - "solution-m5-2nd#approach-01"
      - "solution-m5-4th#validation-01"
    reproduction_ids: []
    conditions: The prediction unit, time cutoff, available inputs, and intended generalization target can be stated before selecting a split.
    limitations: These historical reports do not establish one universally best split. Home Credit fold details are incomplete, and the M5 reports do not supply a complete, stable validation recipe.
---

# Match validation to the prediction boundary

## Decision

Choose folds or forecast origins that mimic what will be unknown at prediction time. Treat a public leaderboard score as a diagnostic, not as a substitute for a valid split. [claim:recommendation-01]

## Use when

Rows share applicants, customers, stores, products, or time periods, or when the model will predict a future window. The target unit and the information available at inference should be explicit.

## Avoid or adapt when

Do not use random or stratified folds if the deployment question is about unseen groups or future periods and those folds would let related or later information cross the boundary. Stratification can preserve class proportions, but does not by itself prevent group or time leakage.

## Procedure

1. Write down the prediction unit, the prediction date or cutoff, and which features would actually be available then.
2. Identify shared entities and temporal order. Keep groups together when generalizing to unseen groups; use forward-looking origins when predicting future periods.
3. Freeze the split definition, seeds, metric, and a simple baseline before comparing model changes.
4. Record each fold or forecast-origin result separately. Change one design choice at a time and retain the split recipe with the result.
5. Compare a public leaderboard only after its window and metric are understood; do not tune a split to chase that score.

## Diagnostics and success criteria

Check that prohibited entity overlap and future information do not cross the split. Report fold/origin scores, dispersion, the metric implementation, and the split assignments. Stop and redesign if the split does not match the prediction boundary or if results vary enough across relevant periods that a single summary would conceal instability. There is no universal score-variance threshold in these sources.

## Competition evidence and disagreements

The Home Credit eighth-place team reports stratified 10-fold CV, but its exact folds and seeds are not given; the twelfth-place account reports a CV score without a complete split recipe. [Home Credit validation evidence](/competitions/home-credit-default-risk/#evidence-solution-home-credit-8th-validation-01) [Home Credit CV context](/competitions/home-credit-default-risk/#evidence-solution-home-credit-12th-cv-result-01)

M5 is a different prediction boundary: the official task evaluates a 28-day future horizon, while the fourth-place author lists dated holdouts, says scores varied over time, and says a proper validation could not be established. The second-place account also lacks a complete validation recipe. These reports motivate testing stability across origins; they do not validate a specific M5 split or show which model is better. [M5 horizon](/competitions/m5-forecasting-accuracy/#evidence-horizon-01) [M5 holdout report](/competitions/m5-forecasting-accuracy/#evidence-solution-m5-4th-validation-01)

## Cost and alternatives

More folds or forecast origins require more runs, but these sources provide no comparable runtime or compute measurements. A smaller smoke test can check that the split code works; it cannot establish full-data generalization or a full-pipeline resource budget. Report costs only when measured on the stated hardware and workload.

## Next experiment

On data you are authorized to use, evaluate one simple M5 baseline at several rolling 28-day origins. Keep the metric and feature availability fixed, record each origin separately, then decide whether the stability is adequate to test one more complex approach. Do not infer an expected score from the historical write-ups. See the [M5 evidence map](/competitions/m5-forecasting-accuracy/) and the companion practice record `practice-compute-planning`.

## Sources and review notes

Primary solution reports and the official horizon record are linked above. The claims do not establish a consensus split strategy. This content remains in review pending the exact-head GPT-6 Luna Max content review.
