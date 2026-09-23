---
schema_version: 1
id: practice-validation-checks
slug: validation-checks
status: draft
title: Check validation against the prediction boundary
summary: A draft checklist for ensuring folds respect the groups and time information available at prediction.
reviewed_by: null
reviewed_at: null
topic: validation
evidence_scope: single-case
modalities:
  - tabular
tasks:
  - binary-classification
dataset_characteristics:
  - grouped-entities
techniques:
  - stratified-cross-validation
evidence_claim_refs:
  - solution-home-credit-8th#validation-01
source_ids:
  - source-home-credit-8th
claims:
  - id: recommendation-01
    statement: Choose folds that preserve the prediction-time boundary, and report the split precisely enough for comparison.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-home-credit-8th#validation-01
    reproduction_ids: []
    conditions: The cited Home Credit team reports stratified 10-fold validation; the split should still match the intended deployment boundary.
    limitations: One historical participant report does not establish a universal best split or show that stratification prevents entity or temporal leakage.
---

# Check validation against the prediction boundary

## Decision

Choose validation folds that mimic what is unknown at prediction time. A leaderboard gap is a diagnostic, not a replacement for a split that matches the task. [claim:recommendation-01]

## Use when

The training examples have target imbalance and/or share entities or time structure that affects what information will be available at inference.

## Avoid or adapt when

Do not use random or stratified folds if the actual prediction boundary is grouped or temporal and those folds would leak shared information.

## Procedure

1. Write down the unit being predicted and the information available at that moment.
2. Identify entity and time boundaries; keep groups or future periods out of training when the deployment setup requires it.
3. Choose and record a split strategy, seeds, fold assignments, and metric.
4. Compare local validation and leaderboard results only when their data periods and metric settings are understood.

## Diagnostics and success criteria

Check that no prohibited entity or future information crosses a fold boundary. Report fold-level scores and the exact split. Investigate large validation/leaderboard differences without selecting folds to chase the public leaderboard.

## Competition evidence and disagreements

The Home Credit write-up reports stratified 10-fold CV, but does not fully specify folds or seeds in the inspected text. This single-case source report is not an endorsement of stratification for every grouped or temporal problem.

## Cost and alternatives

This checklist does not require a specific hardware setup. Runtime and compute savings are unknown until measured on the reader's data and pipeline.

## Next experiment

Compare one candidate split with a split that enforces the deployment's group or time boundary. Keep all other model choices fixed and inspect whether ranking, calibration, and fold variance change.

## Sources and review notes

Draft only. Editorial review and a second independent competition example are still needed before this can be published as a recurring practice.
