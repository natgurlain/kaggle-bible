---
schema_version: 1
id: competition-m5-forecasting-accuracy
status: in-review
title: M5 Forecasting – Accuracy
summary: An evidence map comparing a hierarchical LightGBM/N-BEATS ensemble report with a single-model, multi-window validation report, without inventing comparable scores or compute costs.
reviewed_by: GPT-6 Luna Max
reviewed_at: '2026-09-23'
kaggle_bible_completeness_level: 2
kaggle_bible_completeness_label: evidence-map
editorial_status: in-review
slug: m5-forecasting-accuracy
kaggle_slug: m5-forecasting-accuracy
competition_url: https://www.kaggle.com/competitions/m5-forecasting-accuracy
end_date: '2020-06-30'
coverage: reviewed
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
    statement: M5 Forecasting – Accuracy asked participants to forecast daily unit sales for Walmart products over the next 28 days and scored forecasts with WRMSSE.
    kind: source-reported
    evidence:
      - source_id: source-m5-official
        locator: Overview; competition description and evaluation
        support_summary: Kaggle describes the 28-day retail sales forecast and names Weighted Root Mean Squared Scaled Error as the evaluation metric.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: This is the historical Kaggle Accuracy competition, not the companion Uncertainty task.
    limitations: It does not establish a solution's validation recipe or reproducibility.
  - id: closed-01
    statement: The official competition closed on 2020-06-30 and its leaderboard is complete.
    kind: source-reported
    evidence:
      - source_id: source-m5-leaderboard
        locator: Leaderboard completion status
        support_summary: The source audit records the completed Kaggle leaderboard.
      - source_id: source-m5-official
        locator: Overview; close date
        support_summary: The official overview lists 2020-06-30 as the close date.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: These refer to the official competition lifecycle.
    limitations: A completed historical leaderboard is not a future-time generalization test.
  - id: horizon-01
    statement: Kaggle's submission description distinguishes the public validation horizon d_1914–d_1941 from the private evaluation horizon d_1942–d_1969.
    kind: source-reported
    evidence:
      - source_id: source-m5-official
        locator: Submission File; validation and evaluation rows
        support_summary: The official page labels the two forecast windows and explains the validation labels correspond to the public leaderboard while evaluation labels correspond to the private leaderboard.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: These are the competition's historical 28-day scoring windows.
    limitations: They are not repeated future-time origins and do not alone validate operational forecasts.
  - id: approach-2nd-01
    statement: "Matthias describes separate hierarchy-level modeling streams: N-BEATS for the top five levels and multiple bottom-level LightGBM forecasts aligned and ensembled with them."
    kind: source-reported
    evidence:
      - source_id: source-m5-2nd
        locator: 2. The starting point; 3. The bottom level lgb model; 5. Aligning with an independent top-level prediction
        support_summary: The author describes top-level N-BEATS forecasts, fifteen bottom-level LightGBM variants, alignment, and a final ensemble.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: This is the participant's report of the M5 Accuracy solution.
    limitations: The write-up does not provide a complete validation recipe, resource profile, or isolated estimate for each stream.
  - id: rank-2nd-01
    statement: The Kaggle write-up displays a second-place label; this evidence map preserves it as author-reported.
    kind: source-reported
    evidence:
      - source_id: source-m5-2nd
        locator: Write-up title and placement label
        support_summary: The participant write-up is labeled second place.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: This records the label displayed on the write-up.
    limitations: The source audit did not independently match the author to the final leaderboard row.
  - id: approach-4th-01
    statement: monsaraida describes one LightGBM model with a Tweedie objective, partitioned by store and forecast week across the 28-day horizon.
    kind: source-reported
    evidence:
      - source_id: source-m5-4th
        locator: Solution; model split
        support_summary: The author lists a single LightGBM/Tweedie model and separate store/week partitions for four successive seven-day blocks.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: This describes the participant's reported Accuracy entry.
    limitations: No numeric validation score or isolated comparison is reported in the inspected source.
  - id: validation-4th-01
    statement: The fourth-place write-up lists five dated holdout windows and says it used no post-processing, recursive features, or large compute, without quantifying resources.
    kind: source-reported
    evidence:
      - source_id: source-m5-4th
        locator: Validation; strategy commentary
        support_summary: The author lists five holdout windows and qualitative design choices including no post-processing or recursive features.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: These are statements in the author's retrospective account.
    limitations: “Not too much” compute is qualitative; it is not a runtime, hardware, or cost measurement.
  - id: rank-4th-01
    statement: The Kaggle write-up displays a fourth-place label; this evidence map preserves it as author-reported.
    kind: source-reported
    evidence:
      - source_id: source-m5-4th
        locator: Write-up title and placement label
        support_summary: The participant write-up is labeled fourth place.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: This records the label displayed on the write-up.
    limitations: The source audit did not independently match the author to the final leaderboard row.
  - id: failed-reconciliation-01
    statement: Matthias reports an unsuccessful MinT/OLS/WLS reconciliation attempt involving an overnight run on a rented 128 GB AWS instance.
    kind: source-reported
    evidence:
      - source_id: source-m5-2nd
        locator: 6. What did not work
        support_summary: The author describes abandoning a reconciliation experiment after an overnight run on a rented 128 GB AWS instance.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: This is a report about one exploratory reconciliation attempt.
    limitations: Exact hours and final-pipeline compute are not reported; this does not establish a universal hardware requirement.
  - id: lesson-01
    statement: The two reports suggest contrasting ways to handle hierarchy and validation, but the evidence does not show which approach is better on a shared split or budget.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-m5-2nd#approach-01
      - solution-m5-4th#approach-01
      - solution-m5-4th#validation-01
    reproduction_ids: []
    conditions: Compare them only after defining an identical forecast origin, horizon, hierarchy aggregation, and WRMSSE implementation.
    limitations: The source set contains participant descriptions rather than a common rerun or comparable numeric validation results.
  - id: experiment-01
    statement: A bounded first experiment is to establish a simple weekly seasonal baseline on several rolling 28-day origins before testing one store/week LightGBM partition or a separate hierarchy-level forecast.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-m5-4th#validation-01
      - solution-m5-4th#approach-01
      - solution-m5-2nd#approach-01
    reproduction_ids: []
    conditions: Use the official WRMSSE definition and only features available at each origin; report each origin and hierarchy-aware metric calculation separately.
    limitations: This is a proposed study design, not an experiment performed by either team; no runtime, hardware, or expected score is known.
  - id: gaps-01
    statement: Neither inspected write-up supplies a shared numeric validation result, complete final-pipeline resource profile, or reproducible code-and-data receipt in these records.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-m5-2nd#approach-01
      - solution-m5-4th#validation-01
      - solution-m5-2nd#failed-reconciliation-01
    reproduction_ids: []
    conditions: These describe the source material and records reviewed for this evidence map.
    limitations: Missing details here do not imply the authors never published them elsewhere or that their systems were ineffective.
---

# M5 Forecasting – Accuracy

This Level 2 evidence map is for readers comparing documented approaches to hierarchical retail forecasting. Kaggle's Accuracy task asked for daily Walmart product sales forecasts over a 28-day horizon and used WRMSSE; the competition closed in 2020. [claim:task-01] [claim:closed-01]

## At a glance

The two linked reports describe different design choices: one aligns bottom-level LightGBM forecasts with a top-level N-BEATS stream; the other uses a single store/week-partitioned LightGBM model and several dated holdouts. [claim:approach-2nd-01] [claim:approach-4th-01] Neither record contains comparable numeric validation results or measured final-pipeline compute. [claim:gaps-01]

**Coverage:** Level 2 / Evidence map. The official competition overview and two independently authored solution write-ups are registered. Rank labels on both write-ups remain author-reported in these records; neither system has been reproduced.

## Problem, data, and evaluation

The task was to forecast daily unit sales of Walmart products for the next 28 days. The competition used Weighted Root Mean Squared Scaled Error (WRMSSE), which is minimized and weights error across the sales hierarchy. [claim:task-01] The official submission description distinguishes the public validation days d_1914–d_1941 from private evaluation days d_1942–d_1969. [claim:horizon-01] These fixed windows are not repeated rolling-origin validation.

## Approaches

Matthias describes two modeling streams: N-BEATS for the top five hierarchy levels and multiple bottom-level LightGBM variants, followed by alignment and ensembling. [claim:approach-2nd-01] The inspected report does not give a full validation recipe, numeric score, or resource profile. Its second-place label is retained as author-reported. [claim:rank-2nd-01]

monsaraida describes a single LightGBM model with a Tweedie objective, partitioned by store and by four consecutive seven-day forecast blocks. [claim:approach-4th-01] The report lists five dated holdout windows and says it avoided post-processing and recursive features, but gives no numeric validation results or measured hardware/runtime. [claim:validation-4th-01] The fourth-place label also remains author-reported. [claim:rank-4th-01]

## Validation strategy

The fourth-place report lists windows d_1578–d_1605, d_1830–d_1857, d_1858–d_1885, d_1886–d_1913, and d_1914–d_1941. It also says validation varied over time and that the author could not establish one proper setup. [claim:validation-4th-01] The second-place report describes validation context for selecting and aligning streams but does not provide a complete split recipe or numeric result in the inspected sections. [claim:approach-2nd-01]

These reports do not support a numeric head-to-head comparison. A later reproduction would need identical forecast origins, a fixed 28-day horizon, the same hierarchy roll-up, and the official WRMSSE calculation before scores could be compared. [claim:lesson-01]

## Top-solution comparison

The route renders both solution records, including author-reported rank basis, techniques, validation details, unknown resources, and source links. The reports differ in architecture and validation description, but there is no score table to compare: neither record has a supported numeric validation score. The rank labels do not establish a transferable model ranking. [claim:lesson-01]

## Decisive techniques and evidence

The second-place account describes hierarchy-level forecasts that are aligned and ensembled; the fourth-place account describes store/week partitions with one LightGBM model and no recursive features. [claim:approach-2nd-01] [claim:approach-4th-01] These are system descriptions, not isolated ablations. The fourth-place author's qualitative compute statement is not a measured resource bound. [claim:validation-4th-01]

## Bounded lesson

The safest takeaway is methodological: establish whether a candidate strategy is stable across multiple forecast origins before adding a more complex hierarchy stream. The historical reports motivate that test but do not show which design wins on the same folds or under the same compute budget. [claim:lesson-01]

## Suggested first experiment

On data the reader is authorized to use, create a simple weekly seasonal baseline and score it on several rolling 28-day origins with the official WRMSSE implementation. Then add one store/week-partitioned model or one separately forecast hierarchy level, keeping origins and aggregation fixed. Record every origin; do not infer compute requirements or expected gains from these write-ups. [claim:experiment-01]

## Gaps

The inspected sources do not provide comparable numeric validation scores, complete final-pipeline hardware/runtime, or a reproducible pinned code-and-data receipt. The write-up rank labels are not linked to official final rows in this source set. The “not too much compute” description is qualitative only. [claim:gaps-01] [claim:validation-4th-01]

## Unsuccessful approaches

Matthias reports an unsuccessful MinT/OLS/WLS reconciliation attempt on a rented 128 GB instance overnight. This was an exploratory attempt, not a profile of the final solution, and exact hours are not reported. [claim:failed-reconciliation-01]

## Compute and reproducibility

Both solution records leave final-pipeline resources unknown and mark reproduction as not assessed. The reported overnight reconciliation attempt is scoped only to that failed experiment; it does not establish final-system memory or runtime. [claim:gaps-01] [claim:failed-reconciliation-01]

## Sources, gaps, and corrections

The task, dates, horizons, and official metric are linked to Kaggle's competition overview. The model descriptions and holdout windows are from independent participant write-ups. Rank labels remain author-reported because no final-row match was established in the source audit. No score, hardware capacity, or reproduction claim is inferred from rankings. [claim:task-01] [claim:horizon-01] [claim:approach-2nd-01] [claim:approach-4th-01] [claim:rank-2nd-01] [claim:rank-4th-01]

## Unresolved questions

- Can either write-up be matched to its final official leaderboard row and exact team identity?
- What validation origins, metric implementation, and selection rules supported the second-place team's stream alignment?
- What were the final-pipeline runtime, memory, and resource costs for either approach?
- Can the reported holdout windows be reproduced from pinned code and data, with all hierarchy levels scored identically?
