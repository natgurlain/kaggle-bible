---
schema_version: 1
id: competition-lmsys-chatbot-arena
meta_kaggle_id: '66631'
slug: lmsys-chatbot-arena
status: published
title: LMSYS Chatbot Arena Human Preference Predictions
summary: An evidence map of how the top two teams fine-tuned open LLMs as three-way preference classifiers under a 9-hour T4 inference limit, with response-order symmetry, validation grouping and an announced mid-competition test-set replacement kept explicit.
learning_card:
  outcome: "Explain how two top LLM preference classifiers handled response order, external data and inference limits, and compare their log-loss claims only within the same split."
  prerequisites:
    - "Understand multiclass log loss, fine-tuning a pretrained transformer classifier and grouped cross-validation."
  actual_data_access:
    instructions: "For actual-data work, obtain authorized train.csv from the official data page. Sign-in and rule acceptance are required, and the data page lists CC BY-NC 4.0. Competition data is not bundled. No executed project is published here."
    url: https://www.kaggle.com/competitions/lmsys-chatbot-arena/data
learning_goals:
  - Treat the A/B response order as a symmetry to exploit in training, and test whether swapped-input averaging helps at inference.
  - Decide whether rows sharing a prompt must share a validation fold.
  - Separate teacher, training and inference compute when judging an LLM solution's cost.
reviewed_by: Claude Sonnet high-effort
reviewed_at: '2026-10-26'
kaggle_bible_completeness_level: 2
kaggle_bible_completeness_label: evidence-map
editorial_status: published
kaggle_slug: lmsys-chatbot-arena
competition_url: https://www.kaggle.com/competitions/lmsys-chatbot-arena
end_date: '2024-08-12'
coverage: reviewed
modalities:
  - text
tasks:
  - multiclass-classification
dataset_characteristics:
  - external-data
metrics:
  - id: log-loss
    name: Multiclass log loss
    direction: minimize
    aggregation: Log loss over predicted probabilities for winner_model_a, winner_model_b and winner_tie (eps=auto)
    source_id: source-lmsys-official
solution_ids:
  - solution-lmsys-1st
  - solution-lmsys-2nd
practice_ids: []
source_ids:
  - source-lmsys-official
  - source-lmsys-data
  - source-lmsys-rules
  - source-lmsys-leaderboard
  - source-lmsys-leak-followup
  - source-lmsys-1st
  - source-lmsys-1st-code
  - source-lmsys-2nd
  - source-lmsys-2nd-code
claims:
  - id: task-01
    statement: Participants predicted which of two anonymous LLM responses a Chatbot Arena user preferred, or a tie, for each prompt.
    kind: source-reported
    evidence:
      - source_id: source-lmsys-official
        locator: Overview; Description
        support_summary: The official page describes predicting user preference in head-to-head battles between chatbots and relates the task to reward or preference models.
      - source_id: source-lmsys-data
        locator: Dataset Description; train.csv winner_model_[a/b/tie]
        support_summary: Binary winner columns for model A, model B and tie form the ground-truth target.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: Historical competition task as stated by Kaggle and LMSYS.
    limitations: Arena judges are self-selected users; the task predicts their choices, not response quality in general.
  - id: metric-01
    statement: Submissions were scored by log loss on probabilities for the three classes, with lower values better.
    kind: source-reported
    evidence:
      - source_id: source-lmsys-official
        locator: Evaluation; Submission File
        support_summary: The evaluation section specifies log loss with eps=auto over winner_model_a, winner_model_b and winner_tie probabilities.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: Official ranking metric.
    limitations: Scores are comparable only on the same evaluation data; see the test-set replacement claim.
  - id: data-01
    statement: The data page lists about 55K training rows and roughly 25,000 test rows; train.csv contains prompt, both responses, both model identities and the three winner columns, while test.csv omits model identities.
    kind: source-reported
    evidence:
      - source_id: source-lmsys-data
        locator: Dataset Description; Files
        support_summary: The page gives the row counts and lists model_[a/b] as present in train.csv but not test.csv.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: Historical competition files as described by Kaggle; the host later announced that the private test set would be replaced.
    limitations: Row counts were not checked against the files, which were not downloaded; the replacement test-set size is not stated in the inspected host post.
  - id: code-requirements-01
    statement: This was a code competition with CPU or GPU notebooks limited to 9 hours of run time, internet disabled, and freely and publicly available external data and pre-trained models allowed.
    kind: source-reported
    evidence:
      - source_id: source-lmsys-official
        locator: Code Requirements
        support_summary: The official page lists the 9-hour notebook limits, disabled internet and the external-data and pre-trained-model allowance.
      - source_id: source-lmsys-rules
        locator: B.7.C External Data
        support_summary: External data must be publicly available and equally accessible to all participants at no cost.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: Historical submission constraints for this competition.
    limitations: Hardware attached to Kaggle GPU notebooks is not specified on the inspected pages; T4 use comes from the solution authors.
  - id: rules-01
    statement: The rules allowed teams of up to five, five submissions per day and two final selections; competition data was licensed for non-commercial use under CC BY-NC 4.0, and winners license their solution under CC BY 4.0.
    kind: source-reported
    evidence:
      - source_id: source-lmsys-rules
        locator: Team Limits; Submission Limits; Competition-Specific Terms; B.7.A Data Access and Use
        support_summary: The rules state these team and submission limits, the winner license type and the non-commercial data-use terms.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: Historical contest terms.
    limitations: This summary is not legal advice and does not determine any reader's current right to use the data.
  - id: leak-01
    statement: The competition host reported that labels for test battles had leaked through LMSYS's public leaderboard-analysis data, and said the hidden private test set would be replaced with unpublished data and submissions rerun.
    kind: source-reported
    evidence:
      - source_id: source-lmsys-leak-followup
        locator: What was the leak?; What are we doing to fix it?
        support_summary: The host post explains that public battle metadata could be matched to Kaggle data and announces replacing the private test set with unpublished data and rerunning submissions.
      - source_id: source-lmsys-leaderboard
        locator: Final standings header
        support_summary: The leaderboard says the competition is complete, reflects final standings and that the private leaderboard uses approximately 45% of the test data.
    supports_claim_refs: []
    reproduction_ids: []
    conditions: Host announcement during the competition; the final leaderboard is the official outcome.
    limitations: The inspected sources do not state the size or sampling of the replacement data, or how the 45% private share relates to it.
  - id: approach-01
    statement: Both top-two teams fine-tuned open pretrained LLMs as three-way classifiers and added external preference data, but the first-place solution distilled 70B-class teachers into one LoRA-tuned 9B student while the second-place team fully fine-tuned 8B to 27B models and used pseudo-labelled external conversations.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-lmsys-1st#approach-01
      - solution-lmsys-1st#distill-01
      - solution-lmsys-2nd#approach-01
      - solution-lmsys-2nd#pseudo-01
    reproduction_ids: []
    conditions: Comparison of the two inspected final recipes.
    limitations: Neither team isolates the gain from its main idea against the other team's approach on a shared split.
  - id: symmetry-01
    statement: Both teams train on response-swapped copies, using the fact that swapping responses A and B should swap the corresponding class probabilities; only the first-place solution also averages over swapped inputs at inference. The second-place authors report a 0.003 validation log-loss improvement for gemma2-9b from paired over random swapping.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-lmsys-1st#validation-01
      - solution-lmsys-1st#ensemble-quant-01
      - solution-lmsys-2nd#swap-01
      - solution-lmsys-2nd#resources-inference-01
    reproduction_ids: []
    conditions: The 0.003 figure is the second-place team's reported validation log loss, presumably on their 20% prompt-grouped holdout, compared against random swapping. The second-place final submission used no TTA; it only swapped the input order for the Llama3-8B model.
    limitations: The first-place team does not report an isolated swap or TTA gain; the paired-swap result is one model and one holdout.
  - id: validation-compare-01
    statement: The first-place code stratifies folds by label without grouping repeated prompts, whereas the second-place code groups folds by exact prompt text, so their CV log-loss values are not directly comparable.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-lmsys-1st#validation-01
      - solution-lmsys-2nd#validation-01
    reproduction_ids: []
    conditions: Based on the pinned fold-preparation code of each repository.
    limitations: How often prompts repeat in train.csv, and whether that changes CV, was not measured here.
  - id: score-context-01
    statement: The host announced that the private test set would be replaced and submissions rerun, and the final leaderboard is labelled complete. The authors' public leaderboard values (about 0.87 to 0.88) therefore probably come from different test data than the final private scores (0.96898 and 0.97425), so the gap cannot be read as overfitting; its cause is unknown.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - leak-01
      - solution-lmsys-1st#cv-lb-01
      - solution-lmsys-1st#final-result-01
      - solution-lmsys-2nd#results-01
      - solution-lmsys-2nd#final-result-01
    reproduction_ids: []
    conditions: The second-place write-up labels its values "old LB"; the first-place write-up does not say when its public score was measured, so pre-replacement timing is presumed for it.
    limitations: The inspected sources do not directly confirm that the replacement was completed as announced or describe the replacement data's composition.
  - id: compute-01
    statement: Both solutions submitted 8B to 9B-class models on two T4 GPUs, but training used A100 80GB machines, so inference fit is not a training budget. The first-place author states eight A100s for fine-tuning the 70B-class models, and the README lists the same machine for its pipeline time estimates. The second-place team used four for its final experiments.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-lmsys-1st#resources-training-01
      - solution-lmsys-1st#resources-inference-01
      - solution-lmsys-2nd#resources-training-01
      - solution-lmsys-2nd#resources-inference-01
    reproduction_ids: []
    conditions: Author-stated hardware only.
    limitations: Total GPU hours and cost are unknown for both teams. The first-place author does not report the number of runs. The second-place author says they tried 4 or 5 learning rates but gives no total run count.
  - id: lesson-01
    statement: A bounded, testable lesson is that a pairwise-preference classifier should be trained and evaluated with response-order symmetry built in; the evidence supports testing paired swaps, not claiming a fixed gain.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - symmetry-01
      - solution-lmsys-2nd#swap-01
    reproduction_ids: []
    conditions: Applies to tasks where swapping two candidate inputs has a known effect on the label.
    limitations: One team reports one isolated comparison on one model and holdout; tasks without a label-preserving swap do not inherit this lesson.
  - id: experiment-01
    statement: A bounded first experiment is to freeze prompt-grouped folds, fine-tune one small open classifier with random response swapping, then change only to paired original-plus-swapped samples per step, and compare per-fold log loss with and without swapped-input averaging at inference.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-lmsys-2nd#swap-01
      - solution-lmsys-2nd#validation-01
      - solution-lmsys-1st#ensemble-quant-01
    reproduction_ids: []
    conditions: Requires authorized competition data, a fixed seed and an unchanged training budget apart from the doubled step cost.
    limitations: This is a proposal, not a measured result; model size, runtime and expected gain are unknown.
  - id: gaps-01
    statement: Neither source isolates its headline technique (distillation for first place, pseudo-labelling for second), reports total training GPU hours, or describes the announced replacement test data, and both write-ups report validation on different fold schemes.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - solution-lmsys-1st#distill-01
      - solution-lmsys-1st#resources-training-01
      - solution-lmsys-2nd#pseudo-01
      - solution-lmsys-2nd#resources-training-01
      - validation-compare-01
      - leak-01
    reproduction_ids: []
    conditions: Gaps in the inspected sources at the access date.
    limitations: Details may exist in unread comments, configs or notebooks.
---

# LMSYS Chatbot Arena Human Preference Predictions

This Level 2 evidence map covers a 2024 LLM-era Kaggle competition: predict which of two chatbot responses a human preferred. It compares the first- and second-place solutions from their own write-ups and pinned code. It is not a reproduction, and it does not claim either system fits a small budget. [claim:task-01]

## At a glance

Each row holds a prompt, two LLM responses and a three-way label: A wins, B wins, or tie. Kaggle scored log loss, where lower is better. [claim:task-01] [claim:metric-01] Both winning teams fine-tuned open LLMs as classifiers and added external preference data. They differ in how they spent compute: the winner distilled 70B-class teachers into a 9B student, while second place fully fine-tuned 8B–27B models and pseudo-labelled about 240k extra conversations. [claim:approach-01]

**Coverage:** Level 2 / Evidence map. Registered sources: the official overview, data page, rules, final leaderboard and the host's leak post; the first- and second-place write-ups; and each team's pinned training repository. Both ranks match official final-leaderboard rows, which link to the write-ups and list the authors as team members. Neither pipeline was run.

## Problem, data, and evaluation

The data page lists about 55K training rows and about 25,000 test rows. Model identities are in train.csv but not in test.csv. [claim:data-01] Submissions were notebooks limited to 9 hours, with internet off. Public external data and pre-trained models were allowed. [claim:code-requirements-01] The rules allowed teams of up to five, five submissions per day and two final selections. The data was licensed for non-commercial use (CC BY-NC 4.0). [claim:rules-01]

During the competition the host reported that test labels had leaked through LMSYS's public leaderboard-analysis data. The host announced that it would replace the hidden private test set with unpublished data and then rerun submissions. [claim:leak-01] The inspected sources do not directly confirm that this was completed, although the final leaderboard is labelled complete. Several team names on the final leaderboard, including both teams covered here, carry a "(no leak)" suffix. This guide records the close date as 12 August 2024, as shown in the Kaggle header and the inventory deadline. The official timeline gives 5 August 2024 as the final submission deadline. The reason for the later close date is not stated in the inspected sources.

## Approaches

**First place (sayoulala, team BlackPearl).** The author first post-pretrained Llama3-70B, Qwen2-72B and Gemma2-9B on external preference data. Next, the two large models were fine-tuned per fold with QLoRA, and Gemma2-9B with LoRA. [View evidence](#evidence-solution-lmsys-1st-approach-01) The teachers' class probabilities were distilled into Gemma2-9B using cross-entropy plus KL-divergence and cosine terms. [View evidence](#evidence-solution-lmsys-1st-distill-01) For submission, the five fold adapters were averaged and the model was quantized to 8-bit. Inference averaged predictions over the original and swapped response order. [View evidence](#evidence-solution-lmsys-1st-ensemble-quant-01)

**Second place (sakaku, kapenon and tascj, team [Rist] pref).** The team fully fine-tuned Gemma2-9B, Gemma2-27B and an ArmoRM-Llama3-8B reward model, each with a custom classification head. [View evidence](#evidence-solution-lmsys-2nd-approach-01) The stage-1 ensemble then pseudo-labelled about 240k external conversations. The final models were trained on those labels and then fine-tuned on the labelled data. [View evidence](#evidence-solution-lmsys-2nd-pseudo-01) Each training example appeared both as given and with the responses swapped. [View evidence](#evidence-solution-lmsys-2nd-swap-01)

## Validation strategy

The first-place code stratifies five folds by label. It does not group rows that share a prompt. Swapped copies stay in their source row's fold. The second-place code groups folds by exact prompt text and reports a single 20% holdout. Their CV numbers therefore come from different protocols and should not be ranked against each other. [claim:validation-compare-01]

The second-place write-up labels its public scores "old LB". The first-place write-up does not say when its public score was measured, so pre-replacement timing is presumed. If the announced replacement happened, the final private scores come from different data. The jump from about 0.87 to about 0.97 therefore cannot be read as overfitting, and its cause is unknown. [claim:score-context-01]

## Top-solution comparison

The structured records below give each team's rank (verified against the final leaderboard), private log loss, author-reported CV and public scores with their splits, hardware and code status. Both teams used open LLM backbones, external labelled data and response-swapped training copies. Only the first-place solution averages over swapped inputs at inference. The second-place team reports no TTA and only swapped the input order for its Llama3-8B model. [claim:symmetry-01] They differ in student-teacher distillation versus full fine-tuning plus pseudo-labelling, and in fold grouping. [claim:approach-01] [claim:validation-compare-01]

## Decisive techniques and evidence

Only one comparison in these sources is close to isolated. The second-place authors report that training on each sample together with its swapped copy improved gemma2-9b validation log loss (presumably on the 20% holdout) by 0.003 compared with random swapping. [claim:symmetry-01] The other headline ingredients are parts of combined final systems, not measured ablations: distillation, adapter averaging, 8-bit quantization and swap-averaged inference for first place, and pseudo-labelling and the 2:1 ensemble for second place. [claim:gaps-01]

## Bounded lesson

In a pairwise-preference task, swapping the two candidates has a known effect on the label. That symmetry is something to build into training and inference and then test. The evidence supports running that test, not expecting a particular gain. [claim:lesson-01]

## Suggested first experiment

On data you are authorized to use, freeze prompt-grouped folds and a small open classifier. First train with random response swapping. Then change one thing: put each sample and its swapped copy in the same optimizer step. Compare per-fold log loss, then add inference that averages over both response orders. Keep the seed and data unchanged, and record the extra training time. Stop if the fold differences are smaller than the fold-to-fold noise. [claim:experiment-01]

## Unsuccessful approaches

The second-place author reports that early Gemma2-27B training gave poor results until batch size and gradient clipping were changed. [View evidence](#evidence-solution-lmsys-2nd-failure-01) The first-place write-up reports only the final recipe and says earlier experiments are omitted. No other unsuccessful attempts were documented in the reviewed sources.

## Compute and reproducibility

Both teams submitted 8B–9B-class models on two T4 GPUs. They trained on A100 80GB machines, though. The first-place author states eight GPUs for fine-tuning the 70B-class models, and the second-place team used four for its final experiments. [claim:compute-01] Neither source gives total GPU hours or cost. The second-place author mentions trying 4 or 5 learning rates, but no total run count is given. Both repositories are available at pinned commits, and neither was executed here.

## Source limitations

Kaggle pages were read as rendered text in a browser because a plain HTTP fetch did not return them. The size and sampling of the replacement private test data are not described in the inspected host post. Teacher-probability generation for the first-place distillation was not checked line by line, so it is unknown whether every distilled training row was out-of-fold for both teachers. Stage configs and the Kaggle inference notebooks were not read in full. [claim:gaps-01]

## Unresolved questions

- Was the announced private test replacement completed as described? How large was the replacement set, and how was it sampled relative to the original test data?
- Were first-place teacher probabilities for training rows always produced by teachers that did not train on those rows?
- How often do prompts repeat in train.csv, and does prompt-grouped CV change model rankings?
- What isolated log-loss change does distillation or pseudo-labelling give on a shared, prompt-grouped split?
- What were total training GPU hours for each final system?
