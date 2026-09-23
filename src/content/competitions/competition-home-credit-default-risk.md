---
schema_version: 1
id: competition-home-credit-default-risk
slug: home-credit-default-risk
status: draft
title: Home Credit Default Risk
summary: A relational tabular credit-risk competition with documented cross-table aggregation and validation trade-offs.
reviewed_by: null
reviewed_at: null
kaggle_bible_completeness_level: 1
kaggle_bible_completeness_label: catalog
editorial_status: in-progress
kaggle_slug: home-credit-default-risk
competition_url: https://www.kaggle.com/competitions/home-credit-default-risk
end_date: '2018-08-29'
coverage: partial
modalities:
  - tabular
tasks:
  - binary-classification
dataset_characteristics:
  - grouped-entities
metrics:
  - id: auc
    name: Area Under the ROC Curve
    direction: maximize
    aggregation: Kaggle leaderboard AUC
    source_id: source-home-credit-official
solution_ids:
  - solution-home-credit-8th
practice_ids:
  - practice-validation-checks
source_ids:
  - source-home-credit-official
  - source-home-credit-leaderboard
  - source-home-credit-8th
claims:
  - id: task-01
    statement: Home Credit Default Risk asks participants to predict applicants' repayment ability.
    kind: source-reported
    evidence:
      - source_id: source-home-credit-official
        locator: Overview description
        support_summary: The official competition page describes predicting how capable each applicant is of repaying a loan.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: This identifies the competition task as described by Kaggle.
    limitations: This statement does not describe data eligibility, rules, or a modeling result.
---

# Home Credit Default Risk

This draft record demonstrates the structured guide shape. The initial public page remains a catalog entry until the source comparison and editorial review are complete. [claim:task-01]

## Evidence-map outline

The reviewed source set includes a relational-feature and model-blending account. Validation and result details belong in the linked solution record. This draft is not a Level 2 guide yet.
