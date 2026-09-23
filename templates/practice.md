---
schema_version: 1
id: practice-REPLACE
slug: REPLACE
status: draft
title: "REPLACE: decision-oriented practice title"
summary: "REPLACE: what decision this helps and for whom"
reviewed_by: null
reviewed_at: null
topic: validation # Replace with a controlled topic.
evidence_scope: single-case
modalities: []
tasks: []
dataset_characteristics: []
techniques: []
evidence_claim_refs:
  - "solution-REPLACE#finding-01"
source_ids: []
claims:
  - id: recommendation-01
    statement: "REPLACE: conditional recommendation"
    kind: editorial-inference
    evidence: []
    supports_claim_refs:
      - "solution-REPLACE#finding-01"
    reproduction_ids: []
    conditions: "REPLACE: rationale connecting evidence to recommendation"
    limitations: "REPLACE: generalization and evidence limits"
---

# REPLACE: practice title

## Decision

Explain the choice the reader needs to make and the proposed recommendation. [claim:recommendation-01]

## Use when

State the observable data/task/validation conditions that motivate this approach. Link unfamiliar terms to definitions.

## Avoid or adapt when

Describe counterexamples, failure modes, and conditions under which another approach is more appropriate. Mark hypotheses as editorial rather than observed failures.

## Procedure

Give a short sequence the reader can carry out. Identify fold boundaries, required inputs, and outputs where relevant. If including code later, specify dependencies and whether it has been executed.

## Diagnostics and success criteria

Explain how to check that the procedure is correct and useful. Define the comparison baseline, evaluation split, metric, and what result would cause the reader to stop or change direction. Avoid arbitrary universal improvement thresholds.

## Competition evidence and disagreements

Reference exact `evidence_claim_refs` and link to their sources. State whether the evidence is an ablation, an author observation, a reproduced result, or a component of a larger system. Discuss contradictory or negative findings and their conditions.

## Cost and alternatives

Separate measured resources from estimates. Explain a smaller experiment as an editorial suggestion if it has not been measured, and what conclusions a proxy run would not justify.

## Next experiment

Provide one bounded hypothesis, procedure, and decision criterion. Link to relevant competition guides and related practices.

## Sources and review notes

List primary technical sources if used, evidence gaps, and reviewer/date. Do not describe single-case evidence as a general consensus.
