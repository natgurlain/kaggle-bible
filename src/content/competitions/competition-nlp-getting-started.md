---
{
  "schema_version": 1,
  "id": "competition-nlp-getting-started",
  "status": "published",
  "title": "Disaster Tweets: fit text features after splitting",
  "summary": "Compare two primary text workflows, audit vocabulary fitting and F1, then run a small unigram-versus-word-pair experiment.",
  "reviewed_by": "GPT-6 Luna Max",
  "reviewed_at": "2026-09-30",
  "learning_goals": [
    "Fit vocabulary and text statistics only on training rows.",
    "Interpret positive-class F1 through false positives and negatives.",
    "Separate a representation change from budget and split changes."
  ],
  "meta_kaggle_id": "17777",
  "kaggle_bible_completeness_level": 2,
  "kaggle_bible_completeness_label": "evidence-map",
  "editorial_status": "published",
  "slug": "nlp-getting-started",
  "kaggle_slug": "nlp-getting-started",
  "competition_url": "https://www.kaggle.com/competitions/nlp-getting-started",
  "end_date": null,
  "coverage": "reviewed",
  "modalities": [
    "text"
  ],
  "tasks": [
    "binary-classification"
  ],
  "dataset_characteristics": [
    "sparse",
    "small-labeled-set"
  ],
  "metrics": [
    {
      "id": "f1",
      "name": "Positive-class F1",
      "direction": "maximize",
      "aggregation": "2TP / (2TP + FP + FN)",
      "source_id": "source-nlp-official"
    }
  ],
  "solution_ids": [
    "solution-nlp-krause",
    "solution-nlp-gehad"
  ],
  "practice_ids": [
    "practice-validation-checks"
  ],
  "source_ids": [
    "source-nlp-official",
    "source-nlp-krause",
    "source-nlp-gehad"
  ],
  "claims": [
    {
      "id": "task-01",
      "statement": "Disaster Tweets asks whether tweet text refers to a real disaster and evaluates positive-class F1.",
      "kind": "source-reported",
      "evidence": [
        {
          "source_id": "source-nlp-official",
          "locator": "Official evaluation and target description",
          "support_summary": "Binary target distinguishes real disasters; evaluation uses F1."
        }
      ],
      "supports_claim_refs": [],
      "reproduction_ids": [],
      "conditions": "Official Getting Started task.",
      "limitations": "F1 depends on false positives and false negatives; it is not accuracy or a semantic-understanding guarantee."
    },
    {
      "id": "experiment-01",
      "statement": "Compare a training-only unigram Naive Bayes model with one change: add adjacent word-pair counts, keeping folds and positive-class F1 fixed.",
      "kind": "editorial-inference",
      "evidence": [],
      "supports_claim_refs": [
        "solution-nlp-krause#validation-01",
        "solution-nlp-gehad#validation-01"
      ],
      "reproduction_ids": [],
      "conditions": "Original standard-library lab; vocabulary and class token counts fit only training rows.",
      "limitations": "The generated template fixture and Naive Bayes lab reproduce neither author TF-IDF/transformer pipeline nor competition performance."
    }
  ]
}
---

# Disaster Tweets: fit text features after splitting

The task is binary real-disaster classification and the official metric is positive-class F1. [claim:task-01] This Level 2 evidence map connects two independent primary workflows to a bounded original exercise.

## Suggested first experiment

[Run the word-pair exercise](/exercises/#exercise-nlp-word-pairs). Compare a training-only unigram Naive Bayes baseline with one change: add adjacent word pairs. Hold five stratified folds, seed and positive-class F1 constant. [claim:experiment-01] The default generated text is an openly inspectable teaching fixture; repeated templates make its score unsuitable as a realistic NLP benchmark. Examine errors and retain regressions before choosing the next change.

## Problem, data, and evaluation

Predict whether text refers to a real disaster. F1 combines positive-class precision and recall rather than overall accuracy. [claim:task-01] The exercise reads id,text,target from an authorized CSV; keyword and location are intentionally unused. It does not distribute competition tweets, obtain pretrained weights or submit predictions. Read current access and participation rules on Kaggle before obtaining official data.

## Approaches

krauseannelize compares TF-IDF logistic regression and LinearSVC, then searches vectorizer and classifier parameters together. [View evidence](#evidence-solution-nlp-krause-approach-01) gehad-abdulaziz presents a TF-IDF/logistic-regression workflow and DistilBERT fine-tuning. [View evidence](#evidence-solution-nlp-gehad-approach-01) These are independent tutorial implementations, not verified winning entries or a common-budget representation benchmark. Architecture presence alone does not establish an improvement.

## Validation and leakage checks

Both inspected classical pipelines split 80/20 with target stratification and seed 42, fit text features after splitting, and use five-fold F1 search. [View evidence](#evidence-solution-nlp-krause-validation-01) [View evidence](#evidence-solution-nlp-gehad-validation-01) A Pipeline protects fitted vocabulary inside CV; it does not itself protect duplicate tweets, shared entities or a repeatedly inspected holdout. The original lab rejects exact normalized duplicate texts rather than silently distributing them between folds. Near-duplicates and temporal/entity transfer remain unresolved. Reader competition CSVs may require a separately documented grouping/deduplication decision before the lab accepts them.

## Source limitations

Neither source implementation was executed here. Pretrained weights, hardware, full-pipeline time/memory, controlled representation gains and independent leaderboard matches remain unknown. No final rank, historical reproduction or real-tweet teaching score is claimed. Full current rules were not inspected; refer to Kaggle before entering. Linking an author repository does not imply permission to copy its code or redistribute its data.

## Unresolved questions

Does a duplicate-group or chronological split reverse a text-model comparison? Can the authors' representation variants be compared with the same tuning budget and an untouched final holdout? Supply the exact source locator, authorized data scope and execution receipt for a correction or new experiment.

### Actual-data package status

A separate [private-input package setup](https://github.com/natgurlain/kaggle-bible/blob/main/docs/nlp-actual-data-setup.md) is a draft blocked candidate for [#71](https://github.com/natgurlain/kaggle-bible/issues/71). It preserves the same-fold unigram versus adjacent-word-pair comparison and keeps raw text and local error inspection private. No authorized competition data has been supplied or run. Exact normalized duplicates reject without silent deletion; near-duplicate and grouped-template leakage remain limitations. Generated software checks do not satisfy actual-data acceptance.
