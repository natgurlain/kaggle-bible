---
schema_version: 1
id: practice-experiment-receipts
slug: experiment-receipts
status: draft
title: Keep a receipt with every validation score
summary: What to record with each experiment so a score can be compared, rerun and trusted, based on gaps that recur across inspected write-ups.
reviewed_by: null
reviewed_at: null
topic: experiment-tracking
evidence_scope: recurring
modalities:
  - tabular
  - image
tasks:
  - binary-classification
  - multiclass-classification
  - regression
  - forecasting
dataset_characteristics:
  - temporal
techniques: []
evidence_claim_refs:
  - "solution-home-credit-8th#validation-01"
  - "solution-home-credit-12th#cv-result-01"
  - "competition-home-credit-default-risk#gaps-01"
  - "solution-m5-4th#validation-01"
  - "competition-m5-forecasting-accuracy#gaps-01"
  - "solution-titanic-agconti#validation-01"
  - "solution-house-thinkrunner#validation-01"
  - "solution-digits-land#approach-01"
  - "solution-digits-land#validation-01"
source_ids:
  - source-home-credit-8th
  - source-home-credit-12th
  - source-m5-2nd
  - source-m5-4th
  - source-titanic-agconti
  - source-house-thinkrunner
  - source-digits-land
claims:
  - id: recommendation-01
    statement: Store each result with its hypothesis, data version, split definition and seeds, configuration, metric implementation, per-fold scores and the next decision, so the score can be compared and rerun.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - "solution-home-credit-8th#validation-01"
      - "solution-home-credit-12th#cv-result-01"
      - "competition-home-credit-default-risk#gaps-01"
      - "solution-m5-4th#validation-01"
      - "competition-m5-forecasting-accuracy#gaps-01"
    reproduction_ids: []
    conditions: The reader runs more than one experiment and will later compare results, select a final model, or share the work.
    limitations: The cited gaps describe what the inspected write-ups did not report; they do not show that the authors lacked such records privately or that their results were wrong.
  - id: recommendation-02
    statement: Generate the receipt from the code that ran, and check any prose description of the protocol against that code before relying on it.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - "solution-titanic-agconti#validation-01"
      - "solution-house-thinkrunner#validation-01"
      - "solution-digits-land#approach-01"
      - "solution-digits-land#validation-01"
    reproduction_ids: []
    conditions: The experiment is driven by code whose configuration and timings can be captured automatically.
    limitations: Two README-versus-code mismatches and one CPU-time measurement are code-inspection observations; their consequences for the authors' scores were not measured.
---

# Keep a receipt with every validation score

## Decision

Decide what must travel with a score before it can be used to compare, select or share an experiment. A number without its split, seeds, configuration and metric implementation cannot be compared with another number or rerun later. [claim:recommendation-01]

## Use when

Running a sequence of experiments toward a final selection; comparing results produced days apart or by different people; or reporting a result to someone who may try to reproduce it.

## Avoid or adapt when

A throwaway smoke test that only checks code runs needs less: record that it was a smoke test so its numbers are not later mistaken for evidence. Heavy tracking platforms are optional; a versioned text or JSON file per run carries the same information if it is written automatically.

## Procedure

1. Before running, write the hypothesis and the single change being tested, plus the decision rule.
2. Record the data version or file fingerprints, the split definition with fold assignments or origins, and every seed.
3. Record the configuration: features, model, hyperparameters, objective and code revision.
4. Record the metric implementation and per-fold or per-origin scores, not only the mean.
5. Record which resource was measured, such as wall time versus CPU time, and on what hardware.
6. Write the decision taken and the next experiment.
7. Generate fields from the running code where possible, and compare any README or notebook prose with the code. [claim:recommendation-02]

## Diagnostics and success criteria

Pick an old receipt and try to rerun it: the rerun should reproduce the recorded split and come close to the recorded per-fold scores under the same environment. A receipt fails if a reader cannot tell which rows were held out, which seed was used, or whether the reported score is local, public or private. Two receipts are comparable only when their splits and metric implementations match.

## Competition evidence and disagreements

Missing protocol detail recurs across the inspected reports. The Home Credit eighth-place team names stratified 10-fold CV without fold assignments or seeds; the twelfth-place authors report local-CV AUC 0.8047 without a complete split recipe. [8th validation](/competitions/home-credit-default-risk/#evidence-solution-home-credit-8th-validation-01) [12th CV](/competitions/home-credit-default-risk/#evidence-solution-home-credit-12th-cv-result-01) [Home Credit gaps](/competitions/home-credit-default-risk/#evidence-gaps-01) The M5 fourth-place author lists five dated holdouts but no aggregate scores, and neither M5 report supplies a shared numeric validation result or code-and-data receipt. [M5 holdouts](/competitions/m5-forecasting-accuracy/#evidence-solution-m5-4th-validation-01) [M5 gaps](/competitions/m5-forecasting-accuracy/#evidence-gaps-01)

Prose and code also diverge. Conti's Titanic README describes K-fold evaluation while the inspected SVM block uses a 90/10 holdout; thinkrunner's House Prices README claims fold-only fitting while its notebook fits target encoding before CV. [Titanic mismatch](/competitions/titanic/#evidence-solution-titanic-agconti-validation-01) [House mismatch](/competitions/house-prices-advanced-regression-techniques/#evidence-solution-house-thinkrunner-validation-01) In Digit Recognizer, John Land times training with `process_time`, which is CPU time rather than wall time, and the convolutional model's 15 epochs come from three consecutive fit calls that a summary could easily misreport. [Digits timing](/competitions/digit-recognizer/#evidence-solution-digits-land-validation-01) [Digits budgets](/competitions/digit-recognizer/#evidence-solution-digits-land-approach-01)

These are gaps in published material, not evidence of private record-keeping practice or of incorrect results.

## Cost and alternatives

Writing a receipt is editorially expected to be cheap once automated, but the sources contain no measurement of tracking overhead. A minimal alternative is to save the split assignment file, the configuration and the per-fold score table with each run; this still loses environment details needed to rerun months later.

## Next experiment

Take one existing experiment you have run and write its receipt from memory, then rerun it from the receipt alone. List every field you could not fill or that produced a different split. Add those fields to the automated receipt before the next comparison. This is a process check, not a modeling result. See the companion practice records `practice-validation-checks` and `practice-compute-planning`.

## Sources and review notes

Evidence is participant write-ups, pinned author notebooks and evidence-map gap claims linked above. No primary documentation on tracking tools is cited. Draft awaiting independent review.
