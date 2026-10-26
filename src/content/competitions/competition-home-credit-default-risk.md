---
schema_version: 1
id: competition-home-credit-default-risk
meta_kaggle_id: '9120'
slug: home-credit-default-risk
status: published
title: Home Credit Default Risk
summary: A comparative guide to two officially ranked solutions for applicant-level credit-risk ranking, covering history aggregation, out-of-fold meta-features, rank-normalized ensembling, and the validation limits of each report.
learning_card:
  outcome: "Explain applicant-level aggregation boundaries and compare sourced AUC claims without treating incompatible validation protocols as interchangeable."
  prerequisites:
    - "Understand table joins, grouped entities, train-only feature construction and binary-ranking metrics."
  actual_data_access:
    instructions: "For actual-data work, obtain authorized application and related credit-history tables from the official data page. Sign-in and rule acceptance may be required. Competition data is not bundled. No executed project is published here."
    url: https://www.kaggle.com/competitions/home-credit-default-risk/data
learning_goals:
  - Build applicant-level aggregates without crossing the prediction boundary.
  - Compare validation protocols before interpreting reported AUC.
  - Test one feature family on frozen folds before adding ensemble complexity.
reviewed_by: Claude Sonnet high-effort
reviewed_at: '2026-10-26'
kaggle_bible_completeness_level: 3
kaggle_bible_completeness_label: full-guide
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
  - id: lb-split-01
    statement: Kaggle's final leaderboard states that the private leaderboard was calculated on approximately 80% of the test data, leaving about 20% for the public leaderboard.
    kind: source-reported
    evidence:
      - source_id: source-home-credit-leaderboard
        locator: Private tab header
        support_summary: The leaderboard page states the private leaderboard is calculated with approximately 80% of the test data.
      - source_id: source-home-credit-8th
        locator: Summary
        support_summary: The eighth-place author independently notes that only 20% of the data was used for the public leaderboard.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: This describes the historical scoring split.
    limitations: The exact row assignment of public and private subsets is not published.
  - id: metric-rank-01
    statement: Because AUC depends only on the ordering of predictions, converting each model's predictions to rank percentages leaves that model's AUC unchanged while putting differently scaled models on a common scale for ensembling.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-home-credit-8th#rank-norm-01
    reproduction_ids: []
    conditions: Applies to rank-only metrics such as ROC AUC; the eighth-place author describes rank percentage as a normalization for this reason.
    limitations: This is a property of the metric, not a measured gain; rank transforms discard calibration and would change probability-scored metrics.
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
    statement: The eighth-place team's write-up describes stratified 10-fold validation on one shared split seed, applicant- and time-grouped history aggregates, single-table out-of-fold meta-features, and rank-normalized stacking/blending of LightGBM models.
    kind: source-reported
    evidence:
      - source_id: source-home-credit-8th
        locator: Summary; My solo approach; After teaming up; Stacking/blending; topic-author comment replies
        support_summary: The write-up and the author's replies report stratified 10-fold CV, a shared split seed, grouping transaction-history tables by time and SK_ID_CURR, single-table OOF meta-features, and rank-percentage ensembling.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: These are participant-reported choices for this competition and team.
    limitations: Fold assignments, the seed value, and isolated feature contributions are not reported.
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
    statement: The twelfth-place write-up describes cross-table aggregates, model-derived history features, feature-subsampled LightGBM blending, and stacking of diverse model families.
    kind: source-reported
    evidence:
      - source_id: source-home-credit-12th
        locator: Feature Engineer; Model Ensemble
        support_summary: The authors describe grouped features, RNN/CNN and LightGBM history-model features aggregated by applicant, random-feature-subset LightGBM blending, and LightGBM/XGBoost/random-forest/linear-model stacking.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: This summarizes the team's reported final approach, not an independently reproduced implementation.
    limitations: The account does not isolate gains for individual feature or model components.
  - id: result-12th-01
    statement: The authors report final local-CV AUC of about 0.8047 for the average of their blending and stacking results, plus a "PB" of 0.803 whose split the write-up does not define.
    kind: source-reported
    evidence:
      - source_id: source-home-credit-12th
        locator: Opening paragraph; Model Ensemble
        support_summary: The authors state that their final averaged result had local CV about 0.8047 and "PB 0.803".
    supports_claim_refs: []
    reproduction_ids: []
    conditions: Both values are author-reported for the described final ensemble.
    limitations: Fold construction is not specified, neither number is reproduced, and "PB" is not assigned to a public or private split here.
  - id: rank-12th-01
    statement: Kaggle's final leaderboard row 12, with private AUC 0.80329, links the #12 solution write-up and displays four of its authors as members.
    kind: source-reported
    evidence:
      - source_id: source-home-credit-leaderboard
        locator: Final standings; rank 12 row, member avatars and solution link
        support_summary: The rank-12 row shows score 0.80329, avatars for Yifan Xie, cxlcc, Zhiqiang Zhong and YL plus two further members, and a solution link to the #12 write-up.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: This matches the write-up to the official final row as displayed on 2026-10-26.
    limitations: Two members appear only as a count; the match rests on the row's solution link and the four named avatars.
  - id: comparison-01
    statement: The two teams' private AUCs differ by 0.00047, which is smaller than the 0.0008 width of the eighth-place author's own reported CV-to-"PB" gap range, so the rank difference does not establish that one approach is better.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-home-credit-8th#final-result-01
      - solution-home-credit-12th#final-result-01
      - solution-home-credit-8th#cv-lb-gap-01
    reproduction_ids: []
    conditions: Compares official private scores with one team's reported gap range as a rough scale for evaluation noise.
    limitations: The gap range is author-reported and not a confidence interval; no shared split or resampling of the private set exists.
  - id: decisive-01
    statement: Applicant-level history aggregation, combined teammate feature sets, and out-of-fold model-derived history features are the most strongly supported contributors, because both teams report single-model CV rising at those stages before ensembling.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-home-credit-8th#progression-01
      - solution-home-credit-8th#oof-meta-01
      - solution-home-credit-12th#feature-progression-01
    reproduction_ids: []
    conditions: Both teams report stage-wise single-model local CV on their own (different) splits.
    limitations: Each stage bundles several changes and neither team ran a controlled ablation, so these are supported hypotheses rather than isolated effects.
  - id: ensemble-gain-01
    statement: Ensembling added about 0.0026 reported CV AUC over the twelfth-place team's best single model and roughly 0.004 over one eighth-place teammate's best single model, and the eighth-place author reports that it only helped after rank normalization.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-home-credit-8th#progression-01
      - solution-home-credit-8th#final-submissions-01
      - solution-home-credit-8th#rank-norm-01
      - solution-home-credit-12th#feature-progression-01
      - solution-home-credit-12th#cv-result-01
    reproduction_ids: []
    conditions: Computed from the authors' reported best single-model CV (0.800x for one eighth-place teammate; 0.8021 for the twelfth-place team) and final ensemble CV (0.8045; about 0.8047).
    limitations: The eighth-place single-model CV is truncated, the comparison mixes different splits, and no ensemble ablation by model family is reported.
  - id: present-01
    statement: The specific stacker model families (XGBoost, random forest, linear models), RNN/CNN sequence features, and the exact number of blended models are present in the reports but have no isolated evidence of contribution.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-home-credit-12th#approach-01
      - solution-home-credit-12th#ensemble-progression-01
      - solution-home-credit-12th#history-model-01
      - solution-home-credit-12th#feature-selection-01
    reproduction_ids: []
    conditions: Based on what the write-ups report and omit.
    limitations: Absence of an ablation does not mean these components were unhelpful.
  - id: cv-trust-01
    statement: For the eighth-place team's two final selections, local-CV order (stacking 0.8045 above blending about 0.8036) matched the reported private order (0.803 above 0.802), while public order was reversed (0.808 below 0.810).
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-home-credit-8th#final-submissions-01
      - solution-home-credit-8th#cv-lb-gap-01
    reproduction_ids: []
    conditions: Based on rounded values from one comment reply about two submissions.
    limitations: Two submissions with rounded scores are anecdotal; this is consistent with, not proof of, the author's "trust your local CV" conclusion.
  - id: leakage-01
    statement: The twelfth-place LightGBM history features are trained on labels propagated from applicants' targets, so reusing them requires applicant-level out-of-fold construction; the write-up does not document how that was done.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-home-credit-12th#history-model-01
      - solution-home-credit-8th#oof-meta-01
    reproduction_ids: []
    conditions: Applies whenever a feature model is trained on the competition target and its predictions are fed back as features.
    limitations: This flags a documentation gap, not evidence that the team leaked targets.
  - id: unsuccessful-gap-01
    statement: The twelfth-place write-up reports no failed attempts and gives no outcome for the applicant-plus-category grouping the team says it tried.
    kind: source-reported
    evidence:
      - source_id: source-home-credit-12th
        locator: Feature Engineer; Statistical Features, step 2
        support_summary: The write-up says the team also tried grouping by SK_ID_CURR plus a category from each table, without reporting a result.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: Describes the inspected write-up and its comment replies.
    limitations: Absence of reported failures does not show that all attempts succeeded.
  - id: transfer-01
    statement: The lessons transfer most directly to tasks with one prediction row per entity, one-to-many history tables keyed to that entity, and a rank-based metric; they transfer poorly when the metric scores calibrated probabilities, when deployment needs unseen-customer or time-forward validation, or when history rows can postdate the prediction.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - competition-home-credit-default-risk#data-structure-01
      - solution-home-credit-8th#validation-01
      - solution-home-credit-8th#rank-norm-01
      - solution-home-credit-12th#history-model-01
    reproduction_ids: []
    conditions: Both teams validated with folds over application rows and optimized AUC on a static historical snapshot.
    limitations: Neither team tested time-forward or group-held-out validation, so performance under those boundaries is unknown.
  - id: lesson-01
    statement: These reports make applicant-linked aggregates, out-of-fold meta-features, and rank-normalized ensembling reasonable hypotheses to test, but they do not establish an isolated or transferable performance gain.
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
      - solution-home-credit-8th#progression-01
      - solution-home-credit-12th#approach-01
    reproduction_ids: []
    conditions: Freeze applicant-level folds and AUC before feature selection; record fold results and ensure inputs are available at prediction time.
    limitations: This is a proposed experiment, not a result from either team; no runtime, compute budget, or expected AUC gain is known.
  - id: gaps-01
    statement: The reports do not provide a shared validation recipe, any hardware or runtime profile, code, or isolated feature ablations; the twelfth-place write-up also omits its fold design and out-of-fold handling for target-derived history features.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-home-credit-8th#validation-01
      - solution-home-credit-12th#cv-result-01
      - solution-home-credit-12th#history-model-01
    reproduction_ids: []
    conditions: These gaps describe the inspected sources, including the authors' comment replies, and current records.
    limitations: They do not imply the teams omitted details elsewhere or that their approaches were ineffective.
---

# Home Credit Default Risk

This guide compares two officially ranked top-12 solutions for participants deciding which relational-feature, validation, or ensembling experiment to run first. It is not a reproduced solution, and no historical leaderboard score is claimed to transfer. [claim:task-01]

## At a glance

**Decision summary.** Start with applicant-level aggregates of one history table on frozen stratified folds. Both teams report their largest single-model gains from history aggregation, combined feature sets, and out-of-fold model-derived features, not from the choice of stacker. [claim:decisive-01] Ensembling added a few thousandths of CV AUC, and the eighth-place team reports that it only helped after converting predictions to rank percentages. [claim:ensemble-gain-01] The two teams finished 0.00047 AUC apart on the private leaderboard, so their ranks do not show that either approach is better. [claim:comparison-01]

**Coverage:** Level 3 / Full guide. Kaggle's final leaderboard matches both write-ups to official private rows: rank 8 at 0.80376 and rank 12 at 0.80329. [claim:final-result-8th] [claim:rank-12th-01] All CV, public, and component results below are author-reported. Neither pipeline has been reproduced, and no hardware or runtime is known.

**Evidence labels used here.** *Source-reported* means stated by Kaggle or the authors. *Editorial inference* means this guide's reasoning over those reports. *Reproduced* would mean Kaggle Bible ran it; nothing here is reproduced.

## Problem, data, and evaluation

The official task is to predict each applicant's repayment ability. Kaggle evaluates with area under the ROC curve, and higher is better. [claim:task-01] [claim:metric-01] The official Data tab lists one static application row per sampled loan and separate prior-credit, balance, previous-application, and repayment-history files. [claim:data-structure-01] The modeling problem is therefore turning many history rows into one feature row per application without crossing the prediction boundary.

AUC only measures how well predictions are ordered. Converting a model's predictions to rank percentages leaves its AUC unchanged and puts differently scaled models on a common scale before they are combined. [claim:metric-rank-01] The private leaderboard used about 80% of the test data and the public leaderboard about 20%. [claim:lb-split-01] Public scores were therefore a noisy guide during the competition.

## Rules and participation

The competition-specific rules restricted accepted competition data to competition use. External data was allowed only when participants had authority to use it and could share it with the sponsor and Kaggle as required. [claim:rules-data-01] The rules also allowed up to five submissions per day and up to two final submissions for judging. [claim:rules-submission-01] These are historical contest terms, not current legal advice; consult the linked rules for the complete text.

## Validation strategy

**Eighth place.** The team used stratified 10-fold CV. Every teammate's model was re-run on one shared split seed so that out-of-fold predictions could be stacked. The fold assignments and seed value are not published. [claim:approach-8th-01] The author calls local CV "surprisingly stable" and gives a "CV - PB" gap from -0.0005 to 0.0003, without defining "PB". [claim:comparison-01] For the team's two final selections, the CV order matched the reported private order, but the public order was reversed. [claim:cv-trust-01]

**Twelfth place.** The authors report local CV at every stage, but they do not give the fold count, stratification, seeds, or whether teammates shared a split. Their blending models used random k-fold seeds. Their final "PB 0.803" is not defined as public or private. [claim:result-12th-01]

**What this means.** Neither team used group-held-out or time-forward folds, and neither published its folds. Do not compare their CV values as if they came from shared folds. For model-derived features trained on the target, keep every training applicant's feature out-of-fold. The [validation checks practice](/practices/validation-checks/) gives the general procedure for matching folds to the prediction boundary.

## Top-solution comparison

| | Eighth place (七上八下) | Twelfth place |
| --- | --- | --- |
| Official private AUC / rank | 0.80376 / 8 | 0.80329 / 12 |
| Leaderboard entries | 476 | 189 |
| Validation | Stratified 10-fold, one shared seed | Unspecified folds; random k-fold seeds for blending models |
| Best reported single-model CV | 0.800x for one teammate's LightGBM model (public 0.808-0.809) | 0.8021 on all teammates' features |
| Final ensemble CV | Stacking 0.8045 (blending about 0.8036) | About 0.8047 (average of blending and stacking) |
| Feature core | Time- and applicant-grouped history aggregates, DPD buckets, zero-filled merge gaps | Grouped statistics, last-k loans, applicant-plus-category groups |
| Model-derived features | Single-table OOF meta-features | RNN/CNN sequence features; per-table LightGBM on target-labeled history rows |
| Ensemble | LightGBM and random-forest stackers over rank-normalized predictions | Feature-subsampled LightGBM blend; multi-family stack |
| Compute, code | Not reported | Not reported |

Values in this table are source-reported. Ranks, private scores, and entry counts come from Kaggle's final leaderboard; the rest comes from the write-ups and the authors' comment replies. [claim:final-result-8th] [claim:rank-12th-01] [claim:approach-8th-01] [claim:approach-12th-01] Entry counts measure submissions, not compute.

The two approaches share their main structure: aggregate history tables to the applicant, pool features from several teammates, add model-derived features, and stack. They differ mainly in how they produce diversity. The eighth-place team relies on different teammates' feature sets plus rank normalization. The twelfth-place team relies on random feature subsets plus several model families. The 0.00047 private-score gap is smaller than the eighth-place author's own reported CV-to-"PB" gap range. [claim:comparison-01]

## Decisive techniques and evidence

**Most strongly supported (decisive in both reports).** Applicant-level aggregation of history tables, pooling teammates' feature sets, and out-of-fold model-derived history features. Both teams report single-model CV rising at these stages. The eighth-place teammate went from 0.794x to 0.797x to 0.800x, and the twelfth-place team from about 0.798 to 0.801 to 0.8021. [claim:decisive-01] These are stage-wise reports with bundled changes, not ablations.

**Decisive for ensembling in one report.** Rank-percentage normalization before stacking or blending. The eighth-place author reports that ensembles were always worse than the best single model until predictions were rank-transformed. [claim:ensemble-gain-01] This follows from AUC depending only on ordering. [claim:metric-rank-01]

**Present but unproven.** The specific stacker families (XGBoost, random forest, linear models), RNN/CNN sequence features, and the number of blended models appear in the write-ups but have no isolated evidence of contribution. [claim:present-01] The twelfth-place author also says the team did little feature selection beyond dropping null-importance features. [claim:present-01]

**Leakage caution.** The twelfth-place per-table LightGBM features are trained on labels propagated from applicant targets. The write-up does not say how they were kept out-of-fold, so do not copy them without applicant-level OOF construction. [claim:leakage-01]

## Unsuccessful approaches

- **Eighth place: ensembling before rank normalization.** The author reports that stacking and blending CV and LB were always worse than the best single model in the pool until each model's predictions were converted to rank percentages. The component predictions had low raw correlation, which rose above 0.9 after the transform. The size of the shortfall is not reported. [claim:ensemble-gain-01]
- **Twelfth place.** The write-up reports no failed attempts and gives no outcome for the applicant-plus-category grouping it says the team tried. This is an evidence gap, not evidence that everything they tried worked. [claim:unsuccessful-gap-01]

## Compute and reproduction

**Status: not reproduced.** Neither team publishes code, hardware, memory, or runtime, and neither solution record has a reproduction attempt. [claim:gaps-01] The only scope indicators are source-reported: about 2k+ combined features and dozens of LightGBM models in the twelfth-place blend, many teammates' model pipelines in both teams, and 476 versus 189 leaderboard entries. None of these is a resource measurement. Plan any port from your own measured baseline, not from these reports.

## Transferable lessons and limits

**When this transfers.** The lessons fit tasks with one prediction row per entity, one-to-many history tables keyed to that entity, and a rank-based metric such as AUC. There, applicant-level aggregates, OOF meta-features, and rank-normalized ensembling are reasonable first hypotheses. [claim:transfer-01] [claim:lesson-01]

**When it does not.** Rank normalization does not carry over when the metric scores calibrated probabilities, such as log loss. Stratified folds over application rows do not test generalization to unseen customers or future periods. Aggregates are unsafe when history rows can postdate the prediction. Target-derived history models need documented out-of-fold construction. [claim:transfer-01] [claim:leakage-01] The linked [validation checks practice](/practices/validation-checks/) covers choosing folds that recreate the prediction boundary.

## Suggested first experiment

On data you are authorized to use, freeze applicant-level stratified folds and an application-table baseline. Add one group of time-aware aggregates from a single history table and record per-fold AUC changes. Only then add one out-of-fold model-derived feature family. Rank-normalize predictions only when you start combining models. Stop if the fold pattern is unstable, features use information unavailable at prediction time, or the added complexity does not change your decision. These sources establish no compute budget or expected gain. [claim:experiment-01]

## Bounded lesson

Add one family of history aggregates at a time on frozen stratified folds, keep an out-of-fold prediction for every training applicant before creating model-derived features, and retain a feature family only if its per-fold result is stable enough to justify the added complexity. This is an editorial proposal, not an ablation measured by either team. [claim:experiment-01]

## Current learner role

**Outcome:** preserve customer-keyed validation while deciding whether one family of relational aggregates adds useful information to an application-only baseline. Prerequisites are many-to-one joins, customer keys, prediction-time availability, train-only preprocessing and AUC. The source-reported CV/public/private AUC values below are historical solution claims; none is a learner baseline or a result from this proposed experiment.

**Execution state:** this is a guide-only relational lesson. No learner project, fixture execution or actual-data receipt is published for Home Credit. Runtime and process-memory needs are unknown, and historical solution hardware cannot establish them. Access is a separate blocker: an explicitly unassigned maintainer must establish permitted local use and reporting rights under the [official data page](https://www.kaggle.com/competitions/home-credit-default-risk/data) and current rules before running a port. Public source readability does not establish those rights.

**Next task:** document the application/customer key, the one history table's join cardinality and its prediction-time cutoff from an authorized data dictionary; then prepare the bounded comparison below. Do not expand to the full relational winning system, ensembles or target-derived history features.

## Bounded future actual-data experiment

This is an editorial plan, not an executed AUC or a reproduction. Owner: **maintainer — unassigned**. Next action: establish authorized local inputs and verify key/time semantics; missing access or unverified cutoff semantics keeps execution blocked.

1. **Bound the input.** Propose at most 10,000 application-training entity rows, ordered by verified `SK_ID_CURR` and fixed before fitting, plus only their permitted prior-credit records from one table (`bureau.csv`). Verify the authorized data dictionary and reject duplicate application keys, ambiguous joins or invalid targets. Require at least five customers of each binary target class. Keep complete eligible histories for these customers; if more than 100,000 history rows are needed, stop and declare a smaller customer scope before fitting rather than truncate histories silently. Do not bring in balance, installment or previous-application tables for this first comparison.
2. **Freeze customer-keyed validation.** Use five target-stratified folds with seed 17 at the verified application/customer entity boundary, with each entity in one validation fold only. Establish whether `SK_ID_CURR` identifies an application/loan or a distinct customer; do not infer person-held-out validation from a sampled-loan key. If multiple application keys can be linked to one verified customer, construct group-aware folds that keep them together and verify both target classes in every training and validation fold; stop if the declared scope cannot satisfy those constraints. If that mapping is unavailable, label the result application-keyed and leave cross-application customer generalization unknown. Assign all of that customer's related records to the same customer boundary; never split history rows independently. Keep private assignments and a public split fingerprint. Use only history available at application prediction time. Before filtering on `DAYS_CREDIT <= 0`, verify the dictionary confirms that column's relative-time meaning; unknown or missing timing semantics blocks this plan. A validation entity's own permitted past history is an input to its prediction, not a training example pooled with other customers.
3. **Baseline and one change.** After verifying their definitions, use fixed numeric application fields `DAYS_BIRTH`, `AMT_INCOME_TOTAL` and `AMT_CREDIT` with fold-fitted median imputation, scaling and logistic regression (`C=1`, `solver=lbfgs`, `max_iter=1000`, no class weighting). Add exactly one applicant-linked feature: the count of eligible prior-credit rows, with zero for a verified absence of eligible history. Keep those folds, preprocessing and model settings unchanged. Do not use history labels, target means, model-derived features, neural models or ensembles. Report per-fold and aggregate AUC, including a worse result; reaching a source author's score is not a completion requirement.
4. **Relational diagnostics.** Record uniqueness, join cardinality, missing-history coverage, cutoff exclusions and label counts as permitted aggregates. Check that a left join retains exactly one prediction row per application customer, held-out customers never become training rows, and preprocessing fits training folds only. Compare fold AUC differences and inspect instability before proposing a second feature family. Unknown join/time semantics or an AUC undefined because a fold lacks a class is a failure to recover, not a score to invent.
5. **Resource and receipt plan.** Pin the shared script/notebook/environment and any helper. Measure full wall time for input, joins, preprocessing, fitting, predictions and diagnostics, per-method time and peak process RSS with a documented boundary; record CPU, thread count and dependency versions. Input limits bound scope, not promised runtime or memory. Actual resources and completion time remain unknown. Publish only a successful safe receipt, input fingerprints and permitted aggregate diagnostic summaries; retain datasets, customer keys, labels and fold assignments privately. Keep historical source scores separate and preserve failures and limits.

## Gaps

The inspected accounts do not define a shared split, provide any hardware or runtime measurements or code, or isolate feature and ensemble gains in controlled ablations. The twelfth-place write-up omits its fold design and its out-of-fold handling for target-derived history features. Both writers use "PB" without defining it. The rules summary does not determine entrant-specific eligibility or provide legal advice. [claim:gaps-01] [claim:result-12th-01] [claim:rules-data-01]

## Sources, gaps, and corrections

The official task and AUC are linked to Kaggle's overview, the data structure to its Data tab, participation terms to its Rules tab, and ranks, private scores, entry counts, and the 80/20 split to its final leaderboard. Approaches, CV values, public scores, and the unsuccessful ensembling attempt come from the two participant write-ups and their authors' comment replies, re-inspected on 2026-10-26. No conversion between public, private, and CV results is made. [claim:metric-01] [claim:data-structure-01] [claim:rules-data-01] [claim:rules-submission-01] [claim:lb-split-01] [claim:final-result-8th] [claim:rank-12th-01] [claim:result-12th-01]

**Correction (2026-10-26).** The earlier evidence map treated the twelfth-place rank as author-reported only and its 0.803 as a public score. The final leaderboard's rank-12 row links the #12 write-up, so the rank is now official. The undefined "PB 0.803" is no longer assigned to a split. [claim:rank-12th-01] [claim:result-12th-01]

## Unresolved questions

- What fold assignments and seeds produced each team's reported CV values, and what does each write-up mean by "PB"?
- How did the twelfth-place team keep its target-derived history features out-of-fold?
- Which feature families and ensemble steps contribute measurable gains under one fixed split?
- What hardware, runtime, and code revisions were used?
