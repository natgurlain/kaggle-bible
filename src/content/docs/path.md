---
title: Beginner → advanced path
description: Suggested competitions and skill gates for progressing from first submissions to research-grade competition work.
---

The path is a sequence of decisions to learn, not a ranking of competitions. Move forward when you can explain your validation and reproduce your own baseline, even if the leaderboard position is modest.

## Beginner: learn the loop

Suggested starting points:

- **Titanic – Machine Learning from Disaster**: tabular classification, a simple submission, and the basic train/test workflow.
- **House Prices – Advanced Regression Techniques**: regression metrics, missing values, categorical features, and a reproducible notebook.
- **Digit Recognizer**: image tensors, a clear benchmark, and the difference between a model improvement and data preparation.

Gate: you can describe the target, metric, split, baseline, and one measured improvement without relying on the public leaderboard.

## Intermediate: learn validation and iteration

Suggested next steps:

- **Porto Seguro’s Safe Driver Prediction**: imbalanced classification, anonymized features, AUC, and feature selection.
- **Home Credit Default Risk**: relational-table joins, aggregation windows, entity leakage checks, and out-of-fold predictions.
- **M5 Forecasting — Accuracy**: time-aware validation, hierarchy, multi-horizon forecasts, and compute tradeoffs.

Gate: you can choose a split that matches how test data is generated, detect an implausible jump, and keep an experiment record that another person can rerun.

## Advanced: learn competition strategy

Suggested challenges:

- **IEEE-CIS Fraud Detection**: entity reconstruction, temporal behavior, sparse identifiers, leakage, and distribution shift.
- **Jigsaw Unintended Bias in Toxicity Classification**: composite metrics, subgroup diagnostics, auxiliary targets, and model diversity.
- **SIIM-ISIC Melanoma Classification**: small imbalanced vision data, leak-free folds, external data, and rank averaging.
- **Cassava Leaf Disease Classification**: domain-specific pretraining, augmentation, model diversity, and ensemble selection.

For advanced entries, select a competition with multiple public solution reports and enough compute notes to compare approaches. The catalog’s metric, category, and completeness filters help narrow the choice.

Gate: you can compare several independently sourced solutions, identify which gains depend on the competition’s data-generating process, and state what you would not transfer to a new problem.

## How to choose your next step

Use the smallest competition that exposes the next skill. Limited compute is a constraint to design around: prefer competitions where strong baselines are cheap, validation is fast, and public notebooks expose the full loop. Move to a larger competition when the bottleneck is a decision you already know how to measure.
