---
schema_version: 1
id: practice-leakage-boundaries
slug: leakage-fit-boundaries
status: published
title: Fit data-dependent steps inside the validation boundary
summary: An audit for preprocessing, target-derived features, and external data that can carry held-out information into a validation score.
reviewed_by: Claude Sonnet high-effort
reviewed_at: '2026-10-26'
topic: leakage
evidence_scope: recurring
modalities:
  - tabular
  - text
  - image
tasks:
  - binary-classification
  - multiclass-classification
  - regression
dataset_characteristics:
  - grouped-entities
  - external-data
techniques:
  - target-encoding
  - out-of-fold
evidence_claim_refs:
  - "solution-house-thinkrunner#validation-01"
  - "solution-house-massquantity#validation-01"
  - "solution-digits-land#validation-01"
  - "solution-titanic-wehrley#validation-01"
  - "solution-titanic-agconti#validation-01"
  - "solution-nlp-krause#validation-01"
  - "competition-home-credit-default-risk#experiment-01"
  - "competition-home-credit-default-risk#rules-data-01"
  - "competition-m5-forecasting-accuracy#rules-data-01"
source_ids:
  - source-house-thinkrunner
  - source-house-massquantity
  - source-digits-land
  - source-titanic-wehrley
  - source-titanic-agconti
  - source-nlp-krause
  - source-home-credit-8th
  - source-home-credit-12th
  - source-home-credit-rules
  - source-m5-rules
claims:
  - id: recommendation-01
    statement: Fit every step that learns from data, and especially every step that reads the target, on the training part of each fold only; produce model-derived features for training rows out of fold.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - "solution-house-thinkrunner#validation-01"
      - "solution-house-massquantity#validation-01"
      - "solution-digits-land#validation-01"
      - "solution-titanic-wehrley#validation-01"
      - "solution-titanic-agconti#validation-01"
      - "solution-nlp-krause#validation-01"
      - "competition-home-credit-default-risk#experiment-01"
    reproduction_ids: []
    conditions: The reader wants a validation score that estimates performance on rows whose targets were not available while fitting. The fitting order is inspectable in code.
    limitations: The inspected sources show code order only. No record measures how much any ordering inflated a score, and unsupervised transforms fitted on all rows may matter much less than target-derived ones on a given dataset.
  - id: recommendation-02
    statement: Treat external data as a leakage boundary too, recording its provenance, permission and when its values would have been available before it enters a feature, and keep it out of the pipeline if the competition terms cannot be satisfied.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - "competition-home-credit-default-risk#rules-data-01"
      - "competition-m5-forecasting-accuracy#rules-data-01"
    reproduction_ids: []
    conditions: The competition's rules define what external data is allowed and under which sharing obligations.
    limitations: Two historical rule sets are summarized; they are not legal advice and differ from each other, so later competitions must be checked individually. The availability-time check is editorial reasoning; neither rule set addresses it, and no cited solution reports leakage through external data.
---

# Fit data-dependent steps inside the validation boundary

## Decision

Decide which steps in the pipeline learn from data, then make each of them part of the fold rather than a preparation done once on all rows. Target encodings, feature selection, scalers, dimensionality reduction, vocabularies and model-derived features are all fitted steps. Any step that sees held-out targets can make validation look better than the prediction setting allows. [claim:recommendation-01]

## Use when

A local score drives feature or model choices, and the pipeline contains steps fitted on data: category statistics, selected feature lists, learned projections, or predictions from another model used as an input. It also applies when a notebook's prose says one thing about fitting and its code may do another.

## Avoid or adapt when

Fixed, row-local transformations such as dividing pixels by a constant or taking a logarithm do not learn from other rows and need no fold isolation. If a pipeline deliberately fits an unsupervised step on unlabeled test inputs, check that the competition's rules allow it and document it as a choice; it is never a reason to fit target-dependent steps on validation rows. Grouped or temporal data also needs the split boundary from the companion practice record `practice-validation-checks`; fold-local fitting cannot repair a split that mixes related rows.

## Procedure

1. List each pipeline step and mark whether it is fixed, fitted without the target, or fitted with the target.
2. Put fitted steps inside a per-fold pipeline so each fold refits them on its training rows only.
3. For model-derived features, generate training-row values from models that did not see those rows, and test-row values from models fitted on training data.
4. Write down which rows each step may see at inference, including whether test inputs are used for unsupervised fitting.
5. Apply the same boundary to external data: list each dataset's source, licence or permission, the competition rule that allows it, and when its values would have been known relative to the prediction, so it cannot import information the model would not have had. [claim:recommendation-02]

## Diagnostics and success criteria

Read the code order, not only the description: the fit call for each learned step should sit after the split and inside the fold loop. Compare the fold-isolated score with the earlier score on identical folds; a drop suggests the earlier estimate was optimistic, but no fixed size proves or disproves leakage. A feature whose importance is implausibly high, or whose value would not exist at prediction time, needs an availability check before further tuning.

## Competition evidence and disagreements

Several inspected notebooks fit steps before the split. In House Prices, thinkrunner fits target encoding, preprocessing and feature selection before five-fold `cross_validate`, although the README describes fold-only fitting; massquantity fits its feature pipeline and PCA before model scoring, even though its stacking stage uses fold-trained base models; fold-trained base models do not make the earlier preprocessing fold-isolated. [thinkrunner order](/competitions/house-prices-advanced-regression-techniques/#evidence-solution-house-thinkrunner-validation-01) [massquantity order](/competitions/house-prices-advanced-regression-techniques/#evidence-solution-house-massquantity-validation-01)

Elsewhere, preparation also precedes the split: a Digit Recognizer notebook fits a MinMaxScaler before its validation split, and in both Titanic tutorials data cleaning or munging comes before rows are held out. [Digits scaler](/competitions/digit-recognizer/#evidence-solution-digits-land-validation-01) [Titanic holdout](/competitions/titanic/#evidence-solution-titanic-wehrley-validation-01) [Titanic SVM split](/competitions/titanic/#evidence-solution-titanic-agconti-validation-01) A Disaster Tweets tutorial is the counterexample: it splits first and fits TF-IDF on training rows inside the search pipeline. [Tweets order](/competitions/nlp-getting-started/#evidence-solution-nlp-krause-validation-01)

These are code-order observations, not measured leakage effects; none of the records reports how much a score changed. The Home Credit evidence map proposes out-of-fold generation for model-derived features as an editorial experiment, not as a reported team result. [Home Credit experiment](/competitions/home-credit-default-risk/#evidence-experiment-01) For external data, Home Credit and M5 imposed different permission conditions; neither rule set addresses availability timing, which this practice adds as an editorial leakage check. [Home Credit rules](/competitions/home-credit-default-risk/#evidence-rules-data-01) [M5 rules](/competitions/m5-forecasting-accuracy/#evidence-rules-data-01)

## Cost and alternatives

Refitting steps per fold multiplies their fitting cost by the fold count; the sources contain no measurements of that cost. A cheaper first check is to audit fit-call order and refit only target-dependent steps per fold, then decide whether unsupervised steps also need it.

## Next experiment

On data you are authorized to use, take the House Prices task and compare a neighborhood target encoding fitted on all training rows with the same encoding fitted inside each of five identical folds. Keep the model, smoothing and log-price RMSE fixed and report each fold. If the fold-isolated score is materially worse, treat earlier selections that used the global encoding as suspect. This is a proposed test, not a measured result. See the [House Prices evidence map](/competitions/house-prices-advanced-regression-techniques/).

## Sources and review notes

Evidence comes from inspected author notebooks and historical competition rules linked above. No primary technical documentation is cited and no leakage magnitude has been measured or reproduced. Evidence scope is recurring because fitting or preparation before the split appears in inspected notebooks from House Prices, Digit Recognizer and Titanic.
