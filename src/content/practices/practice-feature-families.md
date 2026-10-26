---
schema_version: 1
id: practice-feature-families
slug: feature-family-ablation
status: published
title: Add one feature family at a time on frozen folds
summary: A way to turn feature ideas from winning write-ups into controlled tests, because the reports list feature families without isolating their gains.
reviewed_by: Claude Sonnet high-effort
reviewed_at: '2026-10-26'
topic: feature-engineering
evidence_scope: single-case
modalities:
  - tabular
tasks:
  - binary-classification
  - regression
dataset_characteristics:
  - grouped-entities
  - high-cardinality
techniques:
  - groupby-aggregation
  - target-encoding
  - pca
  - out-of-fold
evidence_claim_refs:
  - "competition-home-credit-default-risk#data-structure-01"
  - "competition-home-credit-default-risk#approach-8th-01"
  - "solution-home-credit-12th#approach-01"
  - "competition-home-credit-default-risk#lesson-01"
  - "competition-home-credit-default-risk#experiment-01"
  - "solution-house-massquantity#approach-01"
  - "solution-house-thinkrunner#approach-01"
  - "competition-house-prices-advanced-regression-techniques#experiment-01"
source_ids:
  - source-home-credit-data
  - source-home-credit-8th
  - source-home-credit-12th
  - source-house-massquantity
  - source-house-thinkrunner
claims:
  - id: recommendation-01
    statement: Treat a feature family reported in a strong solution as a hypothesis, and test it as a single change against a frozen baseline on identical folds and the official metric.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - "competition-home-credit-default-risk#approach-8th-01"
      - "solution-home-credit-12th#approach-01"
      - "competition-home-credit-default-risk#lesson-01"
      - "solution-house-massquantity#approach-01"
      - "solution-house-thinkrunner#approach-01"
    reproduction_ids: []
    conditions: A baseline, fold assignment and metric can be frozen before the feature family is added, and the family can be computed from information available at prediction time.
    limitations: None of the cited reports isolates the gain of a feature family; their presence in a final system does not show that they helped, or that they would help another dataset.
  - id: recommendation-02
    statement: Build entity-level aggregates and target statistics so they respect the prediction unit and the fold boundary, aggregating related tables to the unit that is scored.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - "competition-home-credit-default-risk#data-structure-01"
      - "competition-home-credit-default-risk#experiment-01"
      - "competition-house-prices-advanced-regression-techniques#experiment-01"
    reproduction_ids: []
    conditions: The data has a clear scored unit, such as one application row per loan, and related tables or categories that can be summarized for that unit.
    limitations: The Home Credit and House Prices experiments are editorial designs, not team results; no safe time cutoff for Home Credit history tables is established by the official file description.
---

# Add one feature family at a time on frozen folds

## Decision

Choose which transformations to try by treating each family reported in a write-up as one hypothesis. Add it to a frozen baseline on the same folds and metric, keep it only if the comparison supports it, and then try the next. [claim:recommendation-01]

## Use when

A competition offers several plausible feature families, such as aggregates over related tables, category target statistics, interaction terms, or learned projections, and the reader wants to know which of them is worth the extra code and compute. It is most useful when the reports that suggested the features never measured them separately.

## Avoid or adapt when

Families that only work together, such as a projection that depends on an earlier engineered feature set, may need to be tested as one bundle; say so rather than claiming a per-feature gain. When folds vary widely, one comparison may not separate a feature's effect from noise; repeat on more folds or origins before deciding. Leakage-prone families need the fold-local fitting described in the companion practice record `practice-leakage-boundaries`.

## Procedure

1. Freeze the baseline features, model, hyperparameters, folds, seeds and metric, and record the baseline result per fold.
2. Write each candidate family as a function of the scored unit. For related tables, aggregate to that unit before joining; for target statistics, fit inside each fold. [claim:recommendation-02]
3. Check that every input to the family would exist when the prediction is made.
4. Add exactly one family, rerun the identical folds, and record per-fold differences from the baseline.
5. Keep, drop or revise the family, then make the kept configuration the new baseline before testing the next one.

## Diagnostics and success criteria

Compare per-fold scores against the frozen baseline, not against a leaderboard. A family is promising when it improves most folds in the metric's preferred direction; a single summary hides whether one fold carries the gain. Check row counts after each join so aggregation does not duplicate or drop scored rows. There is no universal improvement threshold in these sources; define the decision rule before running.

## Competition evidence and disagreements

Home Credit's official data has one application row per loan plus separate prior-credit, balance, previous-application, and installment-payment files. [Home Credit files](/competitions/home-credit-default-risk/#evidence-data-structure-01) The eighth-place write-up reports grouping history tables by applicant, and the twelfth-place write-up reports cross-table aggregates plus model-derived history features. [8th approach](/competitions/home-credit-default-risk/#evidence-approach-8th-01) [12th approach](/competitions/home-credit-default-risk/#evidence-solution-home-credit-12th-approach-01) Neither isolates these features, so the evidence map treats them as hypotheses to test. [Home Credit lesson](/competitions/home-credit-default-risk/#evidence-lesson-01)

In House Prices, massquantity investigates feature engineering and PCA, and thinkrunner uses category target encoding before stacking; neither result is a controlled common-split benchmark here. [massquantity](/competitions/house-prices-advanced-regression-techniques/#evidence-solution-house-massquantity-approach-01) [thinkrunner](/competitions/house-prices-advanced-regression-techniques/#evidence-solution-house-thinkrunner-approach-01)

The two evidence maps propose matching editorial experiments: one applicant-linked aggregate family against an application-table baseline, and a shrunk neighborhood log-price mean against a global mean, each on fixed folds. [Home Credit experiment](/competitions/home-credit-default-risk/#evidence-experiment-01) [House experiment](/competitions/house-prices-advanced-regression-techniques/#evidence-experiment-01) These are designs, not results. The recurring evidence is that feature families appear in reports without isolated gains; it is not evidence that aggregates or encodings generally help.

## Cost and alternatives

Each family adds a full fold rerun, and aggregations over large history tables may dominate preparation time; the sources report no runtime or memory for these features. A smaller test can use fewer aggregate statistics from one related table first, but a negative result from that subset does not rule out the full family.

## Next experiment

On authorized Home Credit data, freeze an application-table baseline on stratified folds and AUC; using gradient boosting for that baseline is an editorial choice, not a reported team setting. Add one small aggregate family from one history table, such as counts, means and maxima (also an editorial choice), grouped by applicant, and record per-fold AUC changes. Keep the family only if the predefined rule is met, then test the next table. No expected gain is known. See the [Home Credit evidence map](/competitions/home-credit-default-risk/) and the companion practice record `practice-validation-checks`.

## Sources and review notes

All evidence is participant reports, author notebooks, the official data description and editorial experiment designs linked above. No feature gain has been reproduced. Evidence scope is single-case: the entity-aggregate guidance rests on Home Credit alone, and House Prices only repeats the general observation that feature families are reported without isolated gains, the same shape of evidence that keeps `practice-validation-checks` single-case.
