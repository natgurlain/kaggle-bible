# Beginner-to-advanced learning path

The path turns the inventory into a sequence of decisions. A reader should finish each stage with a working habit and a reviewed competition lesson, then move forward when the completion gate is met. The suggested competitions are editorial starting points; they are not ranked as universally best, and the full guide can change their order when source coverage is reviewed.

## How to use the path

Choose one competition at a time. For each one:

1. Read the official problem statement and metric.
2. Build a simple, reproducible baseline before reading every solution.
3. Keep a validation and experiment log.
4. Read the matching Kaggle Bible guide when it reaches Level 2 or Level 3.
5. Write down one transferable lesson and one condition under which it might fail.

Advance on demonstrated capability, not on leaderboard rank. A public score is feedback, not proof that the local validation is correct.

## Stage 1 — Beginner: learn the loop

Goal: load data, inspect the target, build a baseline, use the official metric, submit a valid file, and record experiments.

| Sequence | Suggested competition | What to practice | Completion gate |
| --- | --- | --- | --- |
| 1 | [Titanic — Machine Learning from Disaster](https://www.kaggle.com/competitions/titanic) | Binary classification, missing values, categorical features, a first submission | One reproducible baseline, valid submission format, and a short explanation of the split and metric |
| 2 | [House Prices — Advanced Regression Techniques](https://www.kaggle.com/competitions/house-prices-advanced-regression-techniques) | Regression, feature types, transformations, cross-validation, error inspection | Compare a simple linear/tree baseline with one feature change and keep the experiment log |
| 3 | [Digit Recognizer](https://www.kaggle.com/competitions/digit-recognizer) | Image tensors, a simple neural model, data normalization, compute budgeting | Train a small model end to end and explain how the validation score relates to the submission |
| 4 | [Natural Language Processing with Disaster Tweets](https://www.kaggle.com/competitions/nlp-getting-started) | Text cleaning, tokenization, sparse features or a small pretrained model, class errors | Compare two text representations under the same split and inspect false positives/negatives |

Choose three of the four. The fourth is useful practice but should not become a gate if a reader’s interests or compute make it a poor fit.

## Stage 2 — Intermediate: make validation and features deliberate

Goal: recognize when random validation is misleading, create features without leakage, compare models fairly, and judge whether an ensemble is worth its cost.

| Sequence | Suggested competition | What to practice | Completion gate |
| --- | --- | --- | --- |
| 5 | [Porto Seguro’s Safe Driver Prediction](https://www.kaggle.com/competitions/porto-seguro-safe-driver-prediction) | Imbalanced classification, anonymized features, AUC, feature selection and calibration questions | State why the metric changes model selection and test at least one imbalance-aware decision |
| 6 | [Home Credit Default Risk](https://www.kaggle.com/competitions/home-credit-default-risk) | Relational-table joins, aggregation windows, entity leakage checks, out-of-fold predictions | Produce one leak-audited aggregate feature and compare it with a strong tabular baseline |
| 7 | [M5 Forecasting — Accuracy](https://www.kaggle.com/competitions/m5-forecasting-accuracy) | Time-aware validation, hierarchy, multi-horizon forecasts, reconciliation and compute tradeoffs | Use a time-respecting holdout and explain which information is available at forecast time |

Complete at least two, including M5 for anyone working on forecasting. A reader who cannot afford the full M5 pipeline can use a smaller hierarchy slice; label the result as a scoped exercise.

## Stage 3 — Advanced: reason about hidden evaluation and systems

Goal: handle complex validation, composite metrics, external data, model diversity, resource constraints, and the gap between a competition system and a transferable practice.

| Sequence | Suggested competition | What to practice | Completion gate |
| --- | --- | --- | --- |
| 8 | [IEEE-CIS Fraud Detection](https://www.kaggle.com/competitions/ieee-fraud-detection) | Entity reconstruction, temporal behavior, sparse identifiers, leakage and distribution shift | Document feature availability in time, compare a temporal-aware check, and keep external-data provenance |
| 9 | [Jigsaw Unintended Bias in Toxicity Classification](https://www.kaggle.com/competitions/jigsaw-unintended-bias-in-toxicity-classification) | Composite metrics, subgroup diagnostics, auxiliary targets, model diversity | Report the overall and subgroup metrics separately and explain which objective the model optimizes |
| 10 | [SIIM-ISIC Melanoma Classification](https://www.kaggle.com/competitions/siim-isic-melanoma-classification) | Small imbalanced vision data, leak-free folds, external data, rank averaging | Compare a single model with a diverse ensemble under a fixed fold design and account for compute |
| 11 | [Cassava Leaf Disease Classification](https://www.kaggle.com/competitions/cassava-leaf-disease-classification) | Domain-specific pretraining, augmentation, model diversity, ensemble selection | Explain why a model is diverse in error space and what evidence supports the ensemble choice |

Complete the advanced stage by producing one evidence-backed mini-guide or reproduction note. Winning scores are optional; a clear failed hypothesis is useful evidence when its conditions are recorded.

## Paths by constraint

| Constraint or interest | Start with | Adaptation |
| --- | --- | --- |
| CPU or very limited GPU | Titanic, House Prices, Disaster Tweets | Use small data slices and classical baselines; record what the proxy cannot establish |
| Tabular modeling | Titanic → House Prices → Home Credit → IEEE-CIS | Emphasize leakage, grouped entities, aggregation, and validation |
| Text | Disaster Tweets → Jigsaw | Learn metric design before scaling model size |
| Vision | Digit Recognizer → Cassava → SIIM-ISIC | Start with lightweight backbones and explicit augmentation/compute logs |
| Forecasting | House Prices for regression habits → M5 | Treat time and information availability as first-class constraints |

## Path maintenance

When a suggested competition is not yet Level 2, link to the official page and label it `guide pending`. Do not imply that a competition has a Kaggle Bible analysis just because it appears in the learning path. Replace candidates only after a source review shows that another competition teaches the same decision with clearer, more accessible evidence.
