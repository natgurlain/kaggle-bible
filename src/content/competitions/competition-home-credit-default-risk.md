---
schema_version: 1
id: competition-home-credit-default-risk
meta_kaggle_id: '9120'
slug: home-credit-default-risk
status: published
title: Home Credit Default Risk
summary: An evidence map of relational feature engineering and model diversity for applicant-level credit-risk ranking, with validation and leaderboard uncertainty kept explicit.
reviewed_by: GPT-6 Luna Max
reviewed_at: '2026-09-24'
kaggle_bible_completeness_level: 2
kaggle_bible_completeness_label: evidence-map
editorial_status: published
kaggle_slug: home-credit-default-risk
competition_url: https://www.kaggle.com/competitions/home-credit-default-risk
end_date: '2018-08-29'
coverage: reviewed
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
  - solution-home-credit-12th
practice_ids:
  - practice-validation-checks
  - practice-compute-planning
source_ids:
  - source-home-credit-official
  - source-home-credit-data
  - source-home-credit-rules
  - source-home-credit-leaderboard
  - source-home-credit-8th
  - source-home-credit-12th
claims:
  - id: task-01
    statement: Home Credit Default Risk asks participants to estimate applicants' ability to repay a loan.
    kind: source-reported
    evidence:
      - source_id: source-home-credit-official
        locator: Overview description
        support_summary: The official competition page describes predicting how capable each applicant is of repaying a loan.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: This identifies the historical competition task as stated by Kaggle and Home Credit Group.
    limitations: It does not describe every data-use rule or establish a modeling result.
  - id: metric-01
    statement: Submissions were evaluated by area under the ROC curve, with larger values preferred.
    kind: source-reported
    evidence:
      - source_id: source-home-credit-official
        locator: Evaluation
        support_summary: The official overview says submissions are evaluated on area under the ROC curve.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: This is the official leaderboard metric for Home Credit Default Risk.
    limitations: AUC does not make validation splits or competition leaderboard subsets interchangeable.
  - id: data-structure-01
    statement: The official Data tab describes one static application row per sampled loan and separate prior-credit, balance, previous-application, and installment-payment files.
    kind: source-reported
    evidence:
      - source_id: source-home-credit-data
        locator: Dataset Description; application_{train|test}.csv; bureau.csv; bureau_balance.csv; previous_application.csv; installments_payments.csv
        support_summary: The official Data tab describes the application table and separate files for prior external credit, monthly balances, previous Home Credit applications, and repayment history.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: This describes the historical competition files listed by Kaggle.
    limitations: The file inventory does not prescribe a modeling join, establish safe feature cutoffs, or independently validate a solution.
  - id: rules-data-01
    statement: Home Credit's specific rules limited accepted Competition Data to competition use and allowed external data only when participants had authority to use it and could share it with the sponsor and Kaggle as required.
    kind: source-reported
    evidence:
      - source_id: source-home-credit-rules
        locator: Competition-Specific Terms; Competition Data Access Use and Restriction; External Data
        support_summary: The specific terms restrict accepted Competition Data to the competition and condition external-data use on the participant's rights and required sharing with the sponsor and Kaggle.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: These are the historical Home Credit competition-specific terms.
    limitations: This summary is not legal advice and does not determine an individual participant's eligibility or rights for later data use.
  - id: rules-submission-01
    statement: The official rules allowed up to five submissions per day and selection of up to two final submissions for judging.
    kind: source-reported
    evidence:
      - source_id: source-home-credit-rules
        locator: Rules summary; Submission Limits
        support_summary: Kaggle's rules summary states the daily submission limit and maximum final submissions.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: These limits apply to the historical competition.
    limitations: This does not summarize every deadline, eligibility clause, or sponsor obligation in the linked rules.
  - id: approach-8th-01
    statement: The eighth-place team's write-up describes stratified 10-fold validation, applicant-linked history aggregation, and combining diverse team models.
    kind: source-reported
    evidence:
      - source_id: source-home-credit-8th
        locator: Summary; My solo approach; Stacking/blending
        support_summary: The write-up reports stratified 10-fold CV, grouping transaction-history tables by SK_ID_CURR, and combining diverse team models.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: These are participant-reported choices for this competition and team.
    limitations: Exact fold assignments, seeds, and isolated feature contributions are not reported here.
  - id: final-result-8th
    statement: Kaggle's final leaderboard lists team 七上八下 at rank 8 with private AUC 0.80376.
    kind: source-reported
    evidence:
      - source_id: source-home-credit-leaderboard
        locator: Final standings; team 七上八下
        support_summary: The completed leaderboard records the named team at rank 8 with private score 0.80376.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: The value is the team's final private leaderboard entry for the official metric.
    limitations: A leaderboard result does not reproduce the pipeline or identify component causality.
  - id: approach-12th-01
    statement: The twelfth-place write-up describes cross-table aggregates, model-derived history features, and a blend/stack of diverse model families.
    kind: source-reported
    evidence:
      - source_id: source-home-credit-12th
        locator: Feature Engineer; Model Ensemble
        support_summary: The authors describe grouped features, model-derived history predictions aggregated by applicant, and LightGBM/XGBoost/random-forest/linear-model ensembles.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: This summarizes the team's reported final approach, not an independently reproduced implementation.
    limitations: The account does not isolate gains for individual feature or model components.
  - id: result-12th-01
    statement: The authors report final local-CV AUC 0.8047 and public-leaderboard score 0.803 for their blend/stack.
    kind: source-reported
    evidence:
      - source_id: source-home-credit-12th
        locator: Model Ensemble
        support_summary: The authors state that their final averaged stacking/blending result had local CV about 0.8047 and public score 0.803.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: Both values are author-reported for the described final ensemble; one is local CV and the other public LB.
    limitations: Fold construction is not fully specified, neither number is reproduced, and the public score is not a private final score.
  - id: rank-12th-01
    statement: The Kaggle write-up displays a 12th-place label, which remains author-reported rather than independently verified.
    kind: source-reported
    evidence:
      - source_id: source-home-credit-12th
        locator: Write-up title and placement label
        support_summary: The participant write-up is titled and labeled as a 12th-place solution.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: This reports the label attached to the write-up.
    limitations: The source audit did not reliably match the authors to a final private-leaderboard row.
  - id: lesson-01
    statement: These reports make applicant-linked aggregates and model diversity reasonable hypotheses to test, but they do not establish an isolated or transferable performance gain.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-home-credit-8th#validation-01
      - solution-home-credit-12th#approach-01
      - solution-home-credit-12th#cv-result-01
    reproduction_ids: []
    conditions: Treat the reported techniques as candidates for controlled comparison on the same applicant-level folds and metric.
    limitations: The records contain team reports, incomplete split details, and no reproduction; the same techniques need not help another task.
  - id: experiment-01
    statement: A bounded first test is to compare an application-table baseline with one family of applicant-linked history aggregates on identical stratified folds, then add model-derived features only with out-of-fold predictions.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-home-credit-8th#validation-01
      - solution-home-credit-12th#approach-01
    reproduction_ids: []
    conditions: Freeze applicant-level folds and AUC before feature selection; record fold results and ensure inputs are available at prediction time.
    limitations: This is a proposed experiment, not a result from either team; no runtime, compute budget, or expected AUC gain is known.
  - id: gaps-01
    statement: The reports do not provide a shared validation recipe, complete resource profile, or isolated feature ablations, and the twelfth-place label was not matched to an official final row.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-home-credit-8th#validation-01
      - solution-home-credit-12th#rank-01
      - solution-home-credit-12th#cv-result-01
    reproduction_ids: []
    conditions: These gaps describe the inspected sources and current records.
    limitations: They do not imply the teams omitted details elsewhere or that their approaches were ineffective.
---

# Home Credit Default Risk

This Level 2 evidence map is for participants deciding whether relational aggregation, validation design, or ensembling is worth a controlled first experiment. It is not a reproduced solution or a claim that a historical leaderboard score transfers. [claim:task-01]

## At a glance

The competition asked for applicant repayment-risk ranking and scored predictions with AUC. [claim:task-01] [claim:metric-01] Both documented approaches turn linked histories into applicant-level features and combine model diversity, but their CV protocols and reported scores are not directly comparable. [claim:approach-8th-01] [claim:approach-12th-01]

**Coverage:** Level 2 / Evidence map. The official overview, data description, rules page, and two independent solution write-ups are registered. The eighth-place private rank is matched to Kaggle's final leaderboard; the twelfth-place label remains author-reported. Neither pipeline has been reproduced. This summarizes reported approaches; it is not an independently run model comparison.

## Problem, data, and evaluation

The official task is to predict each applicant's repayment ability. Kaggle evaluates with area under the ROC curve. [claim:task-01] [claim:metric-01] The official Data tab lists one static application row per sampled loan and separate prior-credit, balance, previous-application, and repayment-history files. [claim:data-structure-01]

## Rules and participation

The competition-specific rules restricted accepted competition data to competition use. External data was allowed only when participants had authority to use it and could share it with the sponsor and Kaggle as required. [claim:rules-data-01] The rules also allowed up to five submissions per day and up to two final submissions for judging. [claim:rules-submission-01] These are historical contest terms, not current legal advice; consult the linked rules for the complete text.

## Approaches

The eighth-place team's account reports stratified 10-fold CV, time- and applicant-grouped aggregates from transaction histories, and a team approach combining diverse models. [claim:approach-8th-01] Kaggle's completed private leaderboard independently records its named team at rank 8 with AUC 0.80376. [claim:final-result-8th]

The twelfth-place write-up describes aggregates and model-derived history features, then blends and stacks LightGBM, XGBoost, random-forest, and linear-model predictions. The authors report local-CV AUC 0.8047 and public score 0.803; these values are tied to different splits and remain source-reported. [claim:approach-12th-01] [claim:result-12th-01] Its 12th-place label was not matched to an official final row in the source audit. [claim:rank-12th-01]

## Validation strategy

The eighth-place authors name stratified 10-fold CV but do not give fold assignments or seeds. [claim:approach-8th-01] The twelfth-place account reports a final local-CV result but does not provide a complete split recipe in the inspected sections. [claim:result-12th-01] Do not compare their local-CV values as if they came from shared folds. Preserve applicant boundaries and ensure any feature created from target-bearing history predictions is out-of-fold for the applicant being scored.

## Top-solution comparison

The route renders the two linked solution records with their rank basis, metric split, validation notes, techniques, resource unknowns, and source links. The rank evidence differs: #8 is official-final-private, while #12 is author-report. The #12 local-CV and public values are not the same split as #8's official private score. No numeric head-to-head claim is made.

## Decisive techniques and evidence

Applicant-linked aggregation and model diversity occur in both write-ups, but neither source isolates those components in a shared ablation. [claim:lesson-01] The evidence supports testing them as hypotheses, not attributing a leaderboard result to one feature family. Model-derived history features need leakage control: the out-of-fold requirement below is a recommendation, not a reported experiment result. [claim:experiment-01]

## Bounded lesson

Start with one applicant-level baseline and add one family of history aggregates at a time on frozen stratified folds. Keep an out-of-fold prediction for every training applicant before creating model-derived history features. Compare per-fold AUC and retain a feature family only if its result is stable enough to justify added complexity. This is an editorial experiment proposal, not an ablation measured by either team. [claim:experiment-01]

## Suggested first experiment

On data the reader is authorized to use, freeze applicant-level stratified folds and an application-table baseline. Add one group of time-aware history aggregates, recompute the same out-of-fold AUC, and record fold-level changes. Only then test one out-of-fold model-derived feature family. Stop if the fold pattern is unstable, features use information unavailable at prediction time, or added complexity does not change the decision. No compute budget or expected gain is established by these sources. [claim:experiment-01]

## Gaps

The inspected accounts do not define a shared split, provide complete resource measurements, or isolate feature and ensemble gains. The #12 placement has no verified final private leaderboard match in this record. The rules summary does not determine entrant-specific eligibility or provide legal advice. [claim:gaps-01] [claim:rank-12th-01] [claim:rules-data-01]

## Unsuccessful approaches

No unsuccessful attempts are documented in the reviewed Home Credit sources. That is an evidence gap, not evidence that all tried approaches worked.

## Compute and reproducibility

Both solution records mark pipeline resources unknown and reproduction as not assessed. [claim:gaps-01] The reported feature and ensemble designs therefore establish neither hardware requirements, training time, nor a reproducible AUC.

## Sources, gaps, and corrections

The official task and AUC are linked to Kaggle's overview, data structure to its Data tab, and participation terms to its Rules tab. The eighth-place approach is from its participant write-up, while its rank and private score are tied to the final leaderboard. The #12 approach, CV/public scores, and placement label remain author-reported. No unsupported conversion between public, private, and CV results is made. [claim:metric-01] [claim:data-structure-01] [claim:rules-data-01] [claim:rules-submission-01] [claim:final-result-8th] [claim:result-12th-01] [claim:rank-12th-01]

## Unresolved questions

- Can the #12 author/team be matched to an official final private leaderboard row?
- What fold assignments, seeds, and applicant-boundary rules produced the reported CV values?
- Which feature families and ensemble steps contributed measurable gains under one fixed split?
- What resources, code revisions, and source-eligibility details were used?
