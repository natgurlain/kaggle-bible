---
schema_version: 1
id: practice-compute-planning
slug: compute-resource-planning
status: published
title: Plan compute from measured pilot runs
summary: A cautious way to scope resource use when competition reports leave final-pipeline hardware, runtime, and memory unknown.
reviewed_by: GPT-6 Luna Max
reviewed_at: '2026-09-24'
topic: compute-efficiency
evidence_scope: single-case
modalities:
  - tabular
tasks:
  - binary-classification
  - forecasting
dataset_characteristics:
  - grouped-entities
  - temporal
  - hierarchical
techniques: []
evidence_claim_refs:
  - "competition-home-credit-default-risk#gaps-01"
  - "competition-m5-forecasting-accuracy#gaps-01"
  - "competition-m5-forecasting-accuracy#horizon-01"
  - "solution-m5-2nd#failed-reconciliation-01"
  - "solution-m5-4th#validation-01"
source_ids:
  - source-home-credit-8th
  - source-home-credit-12th
  - source-m5-official
  - source-m5-2nd
  - source-m5-4th
claims:
  - id: recommendation-01
    statement: Measure a decision-relevant workload before scaling, and record hardware, data scope, pipeline stage, wall time, and peak memory separately.
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - "competition-home-credit-default-risk#gaps-01"
      - "competition-m5-forecasting-accuracy#gaps-01"
      - "competition-m5-forecasting-accuracy#horizon-01"
      - "solution-m5-2nd#failed-reconciliation-01"
      - "solution-m5-4th#validation-01"
    reproduction_ids: []
    conditions: The run uses data and external resources the reader is authorized to use, and its scope is chosen before measurement.
    limitations: The pilot reports do not establish final-system resource needs. One failed overnight reconciliation run, or a qualitative compute description, is not a hardware requirement or a cost estimate for another pipeline.
---

# Plan compute from measured pilot runs

## Decision

Treat resource planning as a measurement task. Start with the smallest run that can answer the next modeling decision, and keep unknown final-pipeline requirements explicitly unknown. Do not infer compute budgets from leaderboard rank or a partial-run anecdote. [claim:recommendation-01]

## Use when

Choosing whether an experiment fits a known time, memory, accelerator, or cloud budget; comparing a baseline with one additional feature family or model stream; or deciding what to measure before scaling a pipeline.

## Avoid or adapt when

A tiny sample omits the largest joins, hierarchy operations, or inference workload. Such a run can test that code executes, but it may hide peak memory and does not justify linear extrapolation to the full data. A failed experiment's hardware is not automatically required by the successful system.

## Procedure

1. Define the decision, data scope, metric, split or forecast origin, and stop condition before starting.
2. Record dataset size/version, feature and model configuration, software revision, hardware model/count, and which stages are included.
3. Run a simple, decision-relevant baseline. Measure data preparation, feature generation, fitting, and inference separately where practical.
4. Record observed wall time, peak host memory, accelerator memory and accelerator-hours only when actually measured. Preserve errors and failed attempts rather than folding them into a final-system estimate.
5. Add one workload factor at a time. Scale only when the measurements and the reader's real resource limit justify the next run.

## Diagnostics and success criteria

The run should produce the intended output under the recorded metric and split. The receipt should identify the workload, hardware, elapsed time, peak memory, and any missing measurements. A resource value without scope is not comparable. Stop or reduce the next experiment if the observed workload exceeds the available budget; do not invent a universal cutoff.

## Competition evidence and disagreements

All four pilot solution records leave final-pipeline resources unknown. Home Credit's evidence map records no complete resource profile. [Home Credit resource gap](/competitions/home-credit-default-risk/#evidence-gaps-01)

For M5, one author reports an unsuccessful MinT/OLS/WLS reconciliation attempt that ran overnight on a rented 128 GB AWS instance; the report does not give exact hours or final-system requirements. The fourth-place author describes compute qualitatively as “not too much,” without hardware or runtime. Neither statement is a reusable capacity estimate. [M5 resource gap](/competitions/m5-forecasting-accuracy/#evidence-gaps-01) [M5 failed experiment](/competitions/m5-forecasting-accuracy/#evidence-solution-m5-2nd-failed-reconciliation-01) [M5 qualitative report](/competitions/m5-forecasting-accuracy/#evidence-solution-m5-4th-validation-01)

## Cost and alternatives

The source set contains no comparable prices, final-pipeline runtimes, or peak-memory measurements. A smaller authorized-data run may be a useful code smoke test, but it cannot establish full-scale memory fit, score, or total cost. Prefer a narrower model or fewer validation origins only when that still answers the decision; document what the reduced run cannot show.

## Next experiment

For the M5 task, use an authorized data copy and one simple 28-day baseline origin. Measure preparation, fit, and inference on the actual intended hardware; log the metric, data scope, wall time, peak memory, and missing values. If it fits the reader's stated budget, add another origin or one model component and measure again. This is a proposed experiment, not a forecast of score or compute cost. See the [M5 evidence map](/competitions/m5-forecasting-accuracy/) and the companion practice record `practice-validation-checks`.

## Sources and review notes

The linked reports distinguish one failed experiment from final-system evidence and leave important resource fields unknown. This practice does not give hardware or cost recommendations; measure any proposed workflow on the actual intended hardware.
