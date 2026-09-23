---
schema_version: 1
id: competition-m5-forecasting-accuracy
meta_kaggle_id: '18599'
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
    source_id: source-m5-official-guide
solution_ids:
  - solution-m5-2nd
  - solution-m5-4th
practice_ids:
  - practice-validation-checks
  - practice-compute-planning
source_ids:
  - source-m5-official
  - source-m5-official-guide
  - source-m5-data
  - source-m5-rules
  - source-m5-leaderboard
  - source-m5-2nd
  - source-m5-4th
claims:
  - id: task-01
    statement: M5 Forecasting – Accuracy asked participants to forecast daily unit sales for Walmart products over the next 28 days and scored forecasts with WRMSSE.
    kind: source-reported
    evidence:
      - source_id: source-m5-official
        locator: Overview; competition description
        support_summary: Kaggle describes the 28-day daily retail sales forecast.
      - source_id: source-m5-official-guide
        locator: Evaluation → Point forecasts, printed p. 6 (WRMSSE formula); Evaluation → Weighting, printed pp. 8–9 (hierarchy weighting example)
        support_summary: The official guide says participating methods are ranked using Weighted RMSSE (WRMSSE), explains weighting across the hierarchy, and states lower WRMSSE is better.
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
  - id: data-structure-01
    statement: Kaggle's Data tab lists daily product-store sales history, calendar and price files, and separate validation and evaluation sales files for the two 28-day periods.
    kind: source-reported
    evidence:
      - source_id: source-m5-data
        locator: Dataset Description; Files
        support_summary: The Data tab describes the two 28-day forecast periods and lists calendar.csv, sales_train_validation.csv, sales_train_evaluation.csv, sell_prices.csv, and sample_submission.csv.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: This describes the files and task framing on the historical Kaggle Data tab.
    limitations: The files were not downloaded or independently analyzed for this evidence map.
  - id: rules-data-01
    statement: The M5 rules limited Competition Data to non-commercial use and allowed external data only if it was free to all participants and posted to the official competition forum before the entry deadline.
    kind: source-reported
    evidence:
      - source_id: source-m5-rules
        locator: Competition Data; Data Access and Use; External Data
        support_summary: The rules state non-commercial use terms and require eligible external data to be available to all participants at no cost and posted to the official forum before the deadline.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: These are the historical M5 competition rules.
    limitations: This does not establish licensing or access terms for data redistributed outside the competition.
  - id: rules-participation-01
    statement: The rules capped teams at five members, allowed five daily submissions, and one final submission for judging.
    kind: source-reported
    evidence:
      - source_id: source-m5-rules
        locator: Rules summary; Team Limits; Submission Limits
        support_summary: The official rules summary states the team-size and submission limits.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: These limits apply to the historical competition.
    limitations: This does not summarize every eligibility condition or deadline in the linked rules.
  - id: rules-amlt-01
    statement: M5's specific rules permitted automated machine-learning tools subject to license and competition-rule obligations, including the stated winner-license requirements.
    kind: source-reported
    evidence:
      - source_id: source-m5-rules
        locator: Competition-Specific Rules; Winner License; Automated Machine Learning Tools
        support_summary: The specific terms allow AMLT use while retaining license and winner obligations for a qualifying submission.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: This summarizes the historical M5-specific terms.
    limitations: It is not legal advice or a conclusion about any particular tool's license.
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
  - id: metric-priority-01
    statement: The fourth-place author says they did not optimize for official WRMSSE, which they considered not always reasonable for practical use, and chose not to build a custom loss.
    kind: source-reported
    evidence:
      - source_id: source-m5-4th
        locator: Strategy commentary; Trust CV but Not care about official evaluation metrics (WRMSSE)
        support_summary: The author says they trusted CV rather than the organizer's WRMSSE metric, described that metric as not always reasonable in practice, and did not make a custom loss.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: This is the author's rationale for the described solution, not a general metric recommendation.
    limitations: The author-reported fourth-place label is not evidence that the system was tuned to optimize WRMSSE or that it transfers to other objectives.
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

**Coverage:** Level 2 / Evidence map. The official overview, data description, rules page, and two independently authored solution write-ups are registered. Rank labels on both write-ups remain author-reported in these records; neither system has been reproduced. Human editorial sign-off remains pending.

## Problem, data, and evaluation

The task was to forecast daily unit sales of Walmart products for the next 28 days. The competition used Weighted Root Mean Squared Scaled Error (WRMSSE), which is minimized and weights error across the sales hierarchy. [claim:task-01] The official Data tab lists daily item/store sales, calendar and price files, and separate validation/evaluation sales files; the overview distinguishes public validation days d_1914–d_1941 from private evaluation days d_1942–d_1969. [claim:data-structure-01] [claim:horizon-01] These fixed windows are not repeated rolling-origin validation.

## Rules and participation

The historical rules limited Competition Data to non-commercial use. External data had to be available to every participant at no cost and posted to the competition forum before the entry deadline. [claim:rules-data-01] Teams were capped at five, with five daily submissions and one final submission for judging; M5 also permitted AMLT subject to the stated license and winner obligations. [claim:rules-participation-01] [claim:rules-amlt-01] These are historical contest terms, not current legal advice; consult the linked rules for the complete text.

## Approaches

Matthias describes two modeling streams: N-BEATS for the top five hierarchy levels and multiple bottom-level LightGBM variants, followed by alignment and ensembling. [claim:approach-2nd-01] The inspected report does not give a full validation recipe, numeric score, or resource profile. Its second-place label is retained as author-reported. [claim:rank-2nd-01]

monsaraida describes a single LightGBM model with a Tweedie objective, partitioned by store and by four consecutive seven-day forecast blocks. [claim:approach-4th-01] The report lists five dated holdout windows and says it avoided post-processing and recursive features, but gives no numeric validation results or measured hardware/runtime. [claim:validation-4th-01] The author also says they did not optimize for official WRMSSE, preferring a practical solution and no metric-specific custom loss; the fourth-place label remains author-reported and does not show the approach was tuned for WRMSSE. [claim:metric-priority-01] [claim:rank-4th-01]

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

The task, data files, metric, horizons, and rules are linked to Kaggle's overview, Data, and Rules pages. The model descriptions, metric-prioritization decision, and holdout windows are from independent participant write-ups. Rank labels remain author-reported because no final-row match was established in the source audit. No score, hardware capacity, or reproduction claim is inferred from rankings. [claim:task-01] [claim:data-structure-01] [claim:rules-data-01] [claim:rules-participation-01] [claim:rules-amlt-01] [claim:horizon-01] [claim:approach-2nd-01] [claim:approach-4th-01] [claim:metric-priority-01] [claim:rank-2nd-01] [claim:rank-4th-01]

## Unresolved questions

- Can either write-up be matched to its final official leaderboard row and exact team identity?
- What validation origins, metric implementation, and selection rules supported the second-place team's stream alignment?
- What were the final-pipeline runtime, memory, and resource costs for either approach?
- Can the reported holdout windows be reproduced from pinned code and data, with all hierarchy levels scored identically?
