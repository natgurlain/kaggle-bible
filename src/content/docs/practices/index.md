---
title: Best practices
description: Evidence-linked guidance for making reliable Kaggle experiments.
---

Each practice should answer three questions: what decision does it improve, what evidence supports it, and when can it fail?

## Core topics

- **Validation**: match folds, time order, groups, and test construction to the competition’s data-generating process.
- **Leakage prevention**: audit features, preprocessing, target-derived aggregates, duplicate rows, and public information before trusting a score.
- **Feature engineering**: start from domain and data availability; record feature cost and test-time assumptions.
- **Modeling**: establish a cheap baseline, then compare model families under the same split and budget.
- **Ensembling**: combine genuinely different errors and validate blend weights out of fold.
- **Experiment tracking**: preserve code, data version, configuration, score, runtime, and the reason for each change.
- **Compute efficiency**: spend compute on uncertainty-reducing experiments, caching, early stopping, and small representative runs.
- **Submissions**: validate the submission schema, monitor distribution shifts, and treat public leaderboard movement as noisy evidence.

Advice belongs here only after it is connected to one or more competition evidence cards. A technique can be useful in one data-generating process and harmful in another.

## Practice page template

Every detailed practice page should include:

1. The decision or failure mode it addresses.
2. A minimal recipe that a beginner can run.
3. Evidence links to competition guides.
4. Conditions where the advice applies.
5. Conditions where it can mislead.
6. A diagnostic or experiment that tests it.
