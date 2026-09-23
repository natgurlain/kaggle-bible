---
schema_version: 1
id: competition-m5-forecasting-accuracy
status: draft
title: M5 Forecasting – Accuracy
summary: A hierarchical retail-demand forecasting competition with documented model and validation trade-offs.
reviewed_by: null
reviewed_at: null
kaggle_bible_completeness_level: 1
kaggle_bible_completeness_label: catalog
editorial_status: in-progress
slug: m5-forecasting-accuracy
kaggle_slug: m5-forecasting-accuracy
competition_url: https://www.kaggle.com/competitions/m5-forecasting-accuracy
end_date: '2020-06-30'
coverage: partial
modalities:
  - tabular
tasks:
  - forecasting
dataset_characteristics:
  - temporal
  - hierarchical
  - grouped-entities
metrics:
  - id: wrmsse
    name: Weighted Root Mean Squared Scaled Error
    direction: minimize
    aggregation: Kaggle's weighted error across the sales hierarchy
    source_id: source-m5-official
solution_ids:
  - solution-m5-2nd
  - solution-m5-4th
practice_ids: []
source_ids:
  - source-m5-official
  - source-m5-leaderboard
  - source-m5-2nd
  - source-m5-4th
claims:
  - id: task-01
    statement: M5 Forecasting – Accuracy asked participants to forecast daily Walmart product sales for the next 28 days and ranked submissions using WRMSSE.
    kind: source-reported
    evidence:
      - source_id: source-m5-official
        locator: Overview; competition description and evaluation
        support_summary: Kaggle describes the 28-day retail sales forecast and names Weighted Root Mean Squared Scaled Error as the evaluation metric.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: This records the official competition task and metric.
    limitations: This does not establish a solution's validation setup or generalize its reported results.
  - id: closed-01
    statement: The official leaderboard marks the M5 competition complete; the competition closed on 2020-06-30.
    kind: source-reported
    evidence:
      - source_id: source-m5-leaderboard
        locator: Leaderboard status and competition dates
        support_summary: Kaggle marks the leaderboard complete and the source audit records the official closing date.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: The date and status refer to the official Kaggle competition.
    limitations: The private leaderboard used only part of the test period and is not a full future-time evaluation.
---

# M5 Forecasting – Accuracy

This Level 1 record identifies the competition and records the official task and metric. Its linked solution records are source reports, not reproduced experiments; the evidence map remains in draft until editorial review.
