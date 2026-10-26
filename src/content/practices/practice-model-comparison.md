---
schema_version: 1
id: practice-model-comparison
slug: model-comparison
status: published
title: Compare models on one frozen split, metric and budget
summary: How to decide whether a more complex model is worth it when published comparisons mix splits, training budgets and objectives.
reviewed_by: Claude Sonnet high-effort
reviewed_at: '2026-10-26'
topic: modeling
evidence_scope: recurring
modalities:
  - tabular
  - text
  - image
tasks:
  - binary-classification
  - multiclass-classification
  - regression
  - forecasting
dataset_characteristics: []
techniques:
  - gradient-boosting
  - logistic-regression
  - linear-classifier
  - transformer
  - convolutional-network
  - dense-neural-network
evidence_claim_refs:
  - "solution-digits-land#approach-01"
  - "solution-nlp-gehad#approach-01"
  - "solution-nlp-krause#approach-01"
  - "solution-titanic-wehrley#approach-01"
  - "solution-titanic-wehrley#validation-01"
  - "solution-house-thinkrunner#validation-01"
  - "solution-m5-4th#approach-01"
  - "solution-m5-4th#metric-priority-01"
  - "solution-m5-4th#validation-01"
  - "competition-m5-forecasting-accuracy#lesson-01"
source_ids:
  - source-digits-land
  - source-nlp-gehad
  - source-nlp-krause
  - source-titanic-wehrley
  - source-house-thinkrunner
  - source-m5-4th
  - source-m5-2nd
claims:
  - id: recommendation-01
    statement: Start from a simple baseline and compare each more complex model on the same frozen split, with a comparable and recorded training and tuning budget, before attributing a difference to the model family.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - "solution-digits-land#approach-01"
      - "solution-nlp-gehad#approach-01"
      - "solution-nlp-krause#approach-01"
      - "solution-titanic-wehrley#approach-01"
      - "solution-m5-4th#validation-01"
      - "competition-m5-forecasting-accuracy#lesson-01"
    reproduction_ids: []
    conditions: The candidate models can be trained on identical rows and evaluated on identical held-out rows, and their epochs, search spaces or iteration counts can be recorded.
    limitations: The cited notebooks and write-ups present model families but do not report controlled, equal-budget comparisons; none establishes which family is better for its competition.
  - id: recommendation-02
    statement: Record the training objective, target transform and selection metric next to the official metric, and treat any mismatch as a deliberate choice to evaluate rather than a hidden assumption.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - "solution-titanic-wehrley#validation-01"
      - "solution-house-thinkrunner#validation-01"
      - "solution-m5-4th#approach-01"
      - "solution-m5-4th#metric-priority-01"
    reproduction_ids: []
    conditions: The official metric is known and can be computed locally on the validation split.
    limitations: The sources describe mismatches but do not measure their effect; a mismatched objective can still be a reasonable practical choice, as the M5 author argues.
---

# Compare models on one frozen split, metric and budget

## Decision

Decide how much model complexity to adopt by measuring it against a credible simple baseline under identical conditions. A model family's apparent advantage means little if it also received more epochs, a larger search, or a different split. [claim:recommendation-01]

## Use when

Choosing between a linear model, gradient boosting, a neural network or a pretrained transformer; deciding whether a more expensive model justifies its cost; or reading a notebook that presents several model families side by side.

## Avoid or adapt when

Equal budgets are not always meaningful: a pretrained transformer and a TF-IDF model differ in what "one epoch" or "one search" means. In that case record each model's budget explicitly and compare at a budget the reader could actually afford, rather than forcing a nominal match. If folds disagree strongly, as the M5 fourth-place author reports for dated holdouts whose scores varied significantly over time, a single comparison cannot settle the choice. [M5 holdouts](/competitions/m5-forecasting-accuracy/#evidence-solution-m5-4th-validation-01)

## Procedure

1. Freeze the split, seeds, preprocessing and official metric. Use the validation design from the companion practice record `practice-validation-checks`.
2. Fit a simple baseline first, such as a regularized linear model, a majority or group rule, or a seasonal forecast.
3. Write down the training objective, target transform and model-selection metric for each candidate, and compare them with the official metric. [claim:recommendation-02]
4. Give each candidate a recorded budget: epochs, iterations, search grid and early-stopping rule.
5. Evaluate every candidate on identical held-out rows and record per-fold results with the budget.
6. Adopt the more complex model only if its gain survives across folds and its cost fits the reader's limits.

## Diagnostics and success criteria

Each comparison row should name model, budget, objective and per-fold official-metric score. A gain that appears only under the selection metric, or only on one fold, is not yet a reason to switch. Check that tuning used training folds only and that the final comparison rows were not used to choose hyperparameters. No source supplies a general threshold for "worth it"; set one before comparing.

## Competition evidence and disagreements

In Digit Recognizer, John Land fits a dense network for 50 epochs and a convolutional network for 15 epochs in total, so a validation difference would not isolate architecture. [Digits budgets](/competitions/digit-recognizer/#evidence-solution-digits-land-approach-01) In Disaster Tweets, one notebook presents TF-IDF logistic regression and a three-epoch DistilBERT model with unknown comparable tuning budgets; another compares linear classifiers under TF-IDF. [Tweets transformer](/competitions/nlp-getting-started/#evidence-solution-nlp-gehad-approach-01) [Tweets linear](/competitions/nlp-getting-started/#evidence-solution-nlp-krause-approach-01) In Titanic, Wehrley compares four families with caret resampling but selects by ROC AUC while the competition scores accuracy. [Titanic comparison](/competitions/titanic/#evidence-solution-titanic-wehrley-approach-01) [Titanic metric](/competitions/titanic/#evidence-solution-titanic-wehrley-validation-01)

Objective choices also differ from the official metric. thinkrunner trains on `log1p` prices while evaluation uses log prices. [House target](/competitions/house-prices-advanced-regression-techniques/#evidence-solution-house-thinkrunner-validation-01) The M5 fourth-place author uses a LightGBM Tweedie objective and says they deliberately did not optimize WRMSSE. [M5 model](/competitions/m5-forecasting-accuracy/#evidence-solution-m5-4th-approach-01) [M5 metric choice](/competitions/m5-forecasting-accuracy/#evidence-solution-m5-4th-metric-priority-01) That disagreement is a design choice the author defends, not a demonstrated error. The M5 evidence map notes that the second- and fourth-place approaches cannot be ranked on a shared split. [M5 lesson](/competitions/m5-forecasting-accuracy/#evidence-lesson-01)

All of these are source-reported setups; none is a controlled comparison or a reproduced score.

## Cost and alternatives

Transformers and neural networks may cost more to train than linear or tree baselines, but these sources record no hardware or runtime for any compared model. A cheaper alternative is to tune the strongest baseline before introducing a new family; it does not show whether the larger model would have helped.

## Next experiment

On authorized Disaster Tweets data, freeze five stratified folds and positive-class F1. Fit TF-IDF logistic regression with a fixed small grid, then fine-tune one small pretrained transformer for a fixed number of epochs on the same folds. Record per-fold F1, wall time and hardware for both. Adopt the transformer only if its per-fold gain meets a rule set beforehand. This is a proposed experiment with no known expected result. See the [Disaster Tweets evidence map](/competitions/nlp-getting-started/).

## Sources and review notes

Evidence is drawn from pinned author notebooks and participant write-ups linked above. No model comparison has been rerun. Evidence scope is recurring because unequal or unrecorded budgets and objective-metric mismatches appear in Digit Recognizer, Disaster Tweets, Titanic, House Prices and M5 sources.
