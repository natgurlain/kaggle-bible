---
schema_version: 1
id: practice-oof-ensembling
slug: ensemble-from-oof
status: published
title: Ensemble only from aligned out-of-fold predictions
summary: A check for whether a blend or stack earns its extra cost, given that reported ensembles in these competitions never isolate the ensemble gain.
reviewed_by: Claude Sonnet high-effort
reviewed_at: '2026-10-26'
topic: ensembling
evidence_scope: recurring
modalities:
  - tabular
tasks:
  - binary-classification
  - regression
  - forecasting
dataset_characteristics:
  - hierarchical
techniques:
  - out-of-fold
  - stacking
  - blending
  - rank-averaging
  - hierarchical-reconciliation
evidence_claim_refs:
  - "solution-home-credit-12th#approach-01"
  - "solution-home-credit-12th#cv-result-01"
  - "competition-home-credit-default-risk#approach-8th-01"
  - "competition-home-credit-default-risk#lesson-01"
  - "solution-house-massquantity#approach-01"
  - "solution-house-massquantity#validation-01"
  - "solution-house-thinkrunner#approach-01"
  - "solution-m5-2nd#approach-01"
  - "solution-m5-2nd#failed-reconciliation-01"
source_ids:
  - source-home-credit-8th
  - source-home-credit-12th
  - source-house-massquantity
  - source-house-thinkrunner
  - source-m5-2nd
claims:
  - id: recommendation-01
    statement: Fit blend weights or a stacking model only on out-of-fold predictions that every component produced on the same fold assignment, and compare the ensemble with the best single component on those folds.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - "solution-home-credit-12th#approach-01"
      - "solution-home-credit-12th#cv-result-01"
      - "solution-house-massquantity#validation-01"
      - "solution-house-thinkrunner#approach-01"
      - "competition-home-credit-default-risk#lesson-01"
    reproduction_ids: []
    conditions: Each component can produce predictions for every training row from a model that did not see that row, using one shared fold assignment.
    limitations: No cited source reports the best single component on the same folds, so none isolates the gain from ensembling; the twelfth-place local-CV score describes the final system only.
  - id: recommendation-02
    statement: Add a component or a reconciliation step only after recording its extra training and inference cost and checking that its errors differ from those already in the ensemble.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - "competition-home-credit-default-risk#approach-8th-01"
      - "solution-m5-2nd#approach-01"
      - "solution-m5-2nd#failed-reconciliation-01"
    reproduction_ids: []
    conditions: The reader has a fixed compute or time budget and per-row out-of-fold predictions for each candidate component.
    limitations: The sources report diverse components and one unsuccessful reconciliation attempt, but no error-correlation measurements or component costs.
---

# Ensemble only from aligned out-of-fold predictions

## Decision

Decide whether combining models is worth its extra training and inference by measuring the combination on the same out-of-fold rows as its best component. As general machine-learning reasoning rather than Kaggle evidence, blend weights or a meta-model fitted on predictions that saw their own targets are expected to look better than they are; none of the cited sources measures this effect. [claim:recommendation-01]

## Use when

Several models already exist on one fold assignment, their validation errors look different, and the budget allows training and serving more than one. It also applies when reading a write-up that credits a final blend or stack.

## Avoid or adapt when

Skip the ensemble while the single-model pipeline is still changing; weights fitted today go stale when components change. If components were validated on different splits, rebuild them on one split before blending. For hierarchical forecasts, an alignment or reconciliation step is itself a model choice that needs its own validation and cost record.

## Procedure

1. Fix one fold assignment, and the metric, before training any component.
2. For each component, save out-of-fold predictions for every training row, plus test predictions, with the component's configuration and seed.
3. Check alignment: identical row identifiers, ordering and fold labels across all components.
4. Record each component's out-of-fold score and the pairwise correlation of its errors or predictions.
5. Fit blend weights or a meta-model on out-of-fold predictions, evaluating it with an outer split or a fold-wise scheme so the combiner is also tested on rows it did not fit. This step follows from general machine-learning reasoning about fitting on held-out predictions; it is an editorial design, not a measured Kaggle result.
6. Compare with the best single component on identical rows, and record the added cost. [claim:recommendation-02]

## Diagnostics and success criteria

The combiner should beat the best single component on most folds, not only in the pooled score. As an editorial heuristic, a highly correlated component may add little while costing as much to run; treat that as a reason to test dropping it, not as a rule. Check that no preprocessing upstream of the components was fitted on all rows, as the companion practice record `practice-leakage-boundaries` describes. Set the keep/drop rule before fitting.

## Competition evidence and disagreements

Home Credit's twelfth-place authors describe an ensemble of LightGBM, XGBoost, random-forest and linear models and report a local-CV AUC of about 0.8047 for the final blend/stack; fold construction is unspecified and the score is not compared with a single component. [12th ensemble](/competitions/home-credit-default-risk/#evidence-solution-home-credit-12th-approach-01) [12th CV](/competitions/home-credit-default-risk/#evidence-solution-home-credit-12th-cv-result-01) The eighth-place write-up reports combining diverse team models. [8th approach](/competitions/home-credit-default-risk/#evidence-approach-8th-01)

In House Prices, massquantity builds shuffled five-fold out-of-fold stacking predictions, but earlier preprocessing and PCA were fitted before those folds; thinkrunner uses a stacking regressor over boosted and linear models. [massquantity stacking](/competitions/house-prices-advanced-regression-techniques/#evidence-solution-house-massquantity-validation-01) [massquantity variants](/competitions/house-prices-advanced-regression-techniques/#evidence-solution-house-massquantity-approach-01) [thinkrunner](/competitions/house-prices-advanced-regression-techniques/#evidence-solution-house-thinkrunner-approach-01)

In M5, the second-place author aligns a top-level N-BEATS stream with bottom-level LightGBM forecasts and ensembles them, and separately reports an unsuccessful MinT/OLS/WLS reconciliation attempt that involved renting a 128 GB AWS instance overnight. [M5 streams](/competitions/m5-forecasting-accuracy/#evidence-solution-m5-2nd-approach-01) [M5 failed attempt](/competitions/m5-forecasting-accuracy/#evidence-solution-m5-2nd-failed-reconciliation-01)

The recurring lesson is precise: in Home Credit, House Prices and M5, reported final systems combine several models, and in none of them do the inspected sources compare the combination with its best single component on the same split. Only the House Prices notebook shows out-of-fold stacking predictions explicitly, so the out-of-fold alignment procedure itself rests on that single case plus general reasoning. Every cited score belongs to the whole system. The evidence supports testing ensembles carefully, not the claim that ensembling caused any rank. [Home Credit lesson](/competitions/home-credit-default-risk/#evidence-lesson-01)

## Cost and alternatives

Each component multiplies training and inference cost; the sources give no component runtimes, and the only resource anecdote is the failed M5 reconciliation attempt, which is not a requirement for any final system. A cheaper alternative is an equal-weight average of two aligned components, which has no fitted weights to leak but still needs the same comparison.

## Next experiment

On authorized Home Credit data, train a gradient-boosting model and a regularized logistic regression on one frozen stratified fold assignment, saving out-of-fold predictions. Compare each alone, their equal-weight rank average, and a logistic-regression stack fitted fold-wise, using per-fold AUC. Keep the ensemble only if it beats the best single model by the rule set beforehand. No expected gain is known. See the [Home Credit evidence map](/competitions/home-credit-default-risk/).

## Sources and review notes

Evidence is participant write-ups and author notebooks linked above. No ensemble gain is isolated or reproduced, and no primary technical reference is cited. Evidence scope is recurring only for the lesson that reported ensembles in three competitions lack an isolated ensemble gain; the procedure's out-of-fold mechanics are editorial.
