# Voluntary learner pilot protocol and report template

Preparation for [#69](https://github.com/natgurlain/kaggle-bible/issues/69), within [Epic #63](https://github.com/natgurlain/kaggle-bible/issues/63). This is a protocol, not participant findings. No learners have been contacted or observed under this protocol. Local software acceptance remains separate: see [pilot-reader-validation.md](pilot-reader-validation.md).

## Readiness and frozen session packet

Prepare for 5–10 voluntary learners who want to try one beginner project. Do not recruit, contact people, send invitations, or collect observations as part of this preparation ticket. Recruitment and actual observations belong to a separately authorized learner-pilot activity. A small convenience sample can reveal setup friction and assessed explanations; it cannot establish population success or causal learning gains.

Before real sessions, integrate [#64's project-readiness contract](https://github.com/natgurlain/kaggle-bible/issues/64), complete exact-head GPT-6 Luna Max review, and reconcile this protocol with its final field names. For an actual-data Titanic session, [#67](https://github.com/natgurlain/kaggle-bible/issues/67) must supply an actual-data verified package and safe baseline/change receipts. Missing authorized data or actual-data evidence blocks that session type; a fixture session is labeled a fixture session and cannot satisfy the actual-data gate. Begin with Titanic; inspect the pilot checkpoint before extending sessions to House Prices or Disaster Tweets.

Freeze a packet before examining answers: protocol revision, site/build commit SHA, exercise slug, readiness/evidence scope, notebook and shared-script hashes, input provenance/fingerprints kept locally, environment instructions, fixed split/seed/configurations, expected safe artifacts, the questions and rubric below, session budget, help policy, and aggregate reporting plan. Pin artifact hashes as well as commit identity. Never change rubric thresholds after seeing answers; amendments create a new packet/version and results are reported separately.

Use a 45–60 minute session budget; disclose it in advance and record early stops. The participant may work at their own pace. Log assistance as none, navigation/setup hint, conceptual explanation, or facilitator execution; keep assisted completion distinct from independent completion. Do not make a participant accept competition terms or expose credentials. They obtain and use data under their own authorization. The facilitator observes safe summaries rather than restricted rows or account screens.

## Consent and data handling before observation

The consenting facilitator and named maintainer own the records. Before starting, fill their roles and a participant-accessible withdrawal/deletion channel in the consent sheet. No session may begin while ownership or the deletion channel is unspecified.

Explain in plain language: the purpose is to find setup obstacles and assess explanations of this project; participation is optional; any question may be skipped; stopping has no penalty. Record participant consent to observation and coded notes, and separately whether anonymous aggregate findings may be published. Refusing publication does not prevent participation; exclude those observations from published aggregates and state the publication denominator. Explain that the protocol does not measure learning gain without an additional predeclared comparable before/after measure.

Record only a random participant code, consent options/date, packet version, coarse prior-experience category (optional), task states, coarse elapsed minutes, assistance, sanitized failure category, safe artifact fingerprints/configuration/metric checks, and facilitator rubric categories with brief paraphrased reasons. No names, emails, Kaggle usernames, credentials, full URLs/query strings, raw restricted data, screenshots, audio/video, or verbatim responses. Do not copy row-level predictions or personal row content into notes. A participant keeps their own run artifacts; a facilitator retains only the safe checklist/fingerprints necessary to assess execution.

Keep coded notes and consent records in a maintainer-controlled local folder outside every Git checkout and cloud-synced folder, restricted to the consenting facilitator and maintainer (directory permission 0700, files 0600 where supported). Do not put notes in GitHub issues, PRs, analytics, or public exercise receipts. Keep any existing participant communication outside the study notes; do not create an identity-to-code map. Give the participant their code so they can request withdrawal/deletion through the disclosed channel.

Log a deletion request by code and remove that code's notes, consent record and contributions to unpublished aggregates promptly, recording only an anonymous count of withdrawals. Set the report-completion date and delete all raw coded records within 30 days of it, including working copies/backups under the owners' control. If the report is cancelled, cancellation is the completion date for deletion. Retain only anonymous aggregates, suppress small revealing cells, and avoid individual combinations that could identify someone. Tell participants that already published anonymous aggregates cannot reliably be removed by code. Identifiable or verbatim publication would require separate explicit consent and is outside this protocol.

## Session sequence and setup-failure log

1. Explain consent and record options before any observation. Assign a code and record the frozen packet. Declines contribute only to an anonymous invitation/decline count if legitimately known; do not record their identity or reasons.
2. Start the task clock when the consenting learner receives the project URL and task: find prerequisites, obtain authorized inputs if required, run the baseline and one controlled change on the fixed validation, inspect diagnostics, and explain the result. Record whether setup was already completed. Setup completion is not execution completion.
3. Observe navigation/setup. Record failures as environment/version, dependency/install, authorized-data/account/terms access, input format/path, download/navigation, execution exception, resource/time limit, diagnostic interpretation, or other sanitized category. Record stage, attempted action, reproducible safe symptom, help, resolution/unresolved status, and next action; redact paths containing identities and all secrets. Treat access blockers separately from code defects.
4. Observe baseline and changed configuration artifacts. Check packet fingerprints, evidence scope, environment, split/seed, baseline/change configuration, metric and diagnostic outputs. Record present/absent/unverifiable for each item; do not infer execution from download, an event, or a completion checkbox. Notebook/script agreement is assessed only when both artifacts exist. Never upload a Kaggle submission.
5. Ask the frozen questions without leading answers. Record only rubric category and a short paraphrase of evidence. Mark assistance. A participant's statement that they understand is recorded separately from the assessed explanation.
6. End at task completion, time budget, participant stop, or blocker. Record reason, final artifact checks, missing tasks/questions and assistance. Invite an optional self-report of completion/confidence and log it separately. Explain code-based withdrawal and deletion again.

## Frozen comprehension questions and rubric

Ask all three questions after execution or a stop; inability to run need not prevent explanation. Do not teach the answer before the first response. An optional corrected answer after help is separately marked assisted and does not replace the first assessment.

| Dimension and question | Demonstrated | Partial | Not demonstrated | Not assessable |
| --- | --- | --- | --- | --- |
| Split: Which rows train each rule/model, which evaluate it, and why keep the split unchanged for the comparison? | Explains disjoint training/validation roles, train-only fitting and fixed split for fair baseline/change comparison. | Identifies some roles but omits either train-only fitting or the reason to fix the split. | Confuses training with validation or endorses fitting on held-out labels. | No response, declined, inaccessible question, or insufficient intelligible evidence. |
| Leakage: Give one concrete way this project could leak information and how you would prevent it. | Names a concrete mechanism (for Titanic, group majority/fallback learned using held-out labels), its invalid evaluation effect, and training-only prevention. | Names a plausible mechanism or prevention but cannot connect both to evaluation. | Gives an unrelated example or treats held-out labels as valid fitting input. | Missing/declined response or insufficient evidence to assess. |
| Limits: What does this score establish, and what does it not establish? | Identifies the local metric/split and its data scope, then rejects leaderboard/winning-system/general-transfer inference; for fixtures explicitly rejects actual-Titanic proof. | Identifies the local result but leaves a major scope or generalization limit unexplained. | Claims fixture/local score proves actual-data, leaderboard rank, historical reproduction or universal improvement. | Missing/declined response or insufficient evidence to assess. |

A response is assessed against the executed packet, including its scope-specific limitations (for Titanic, random folds do not isolate families). No numeric score cutoff, confidence rating or correct click substitutes for an explanation. Report the three dimensions separately, retaining contradictions; do not collapse them into an unqualified “learned” label. No learning-gain claim is permitted without a predeclared comparable before/after measure, which is outside this preparation ticket.

## Outcomes, denominators and missing observations

Maintain a funnel with explicit counts: consented; started (received task and attempted first step); setup attempted/completed; baseline attempted/artifact-verified; controlled change attempted/artifact-verified under the fixed comparison; diagnostics attempted/inspected; ended, withdrew, stopped at budget, or blocked. End states may overlap task states but each learner has one final end reason. Report completion as artifact-verified baseline + change + diagnostic inspection, with both started and consented denominators, and separate counts for independent/assisted work and fixture/actual-data scopes. Comprehension is a separate outcome, never inferred from completion.

For each comprehension dimension report asked, attempted (a substantive answer), missing/declined, not assessable, and assessable counts. Demonstrated + partial + not demonstrated equals assessable; all four rubric categories equal asked. Show category counts over both attempted and assessable denominators (use “not applicable” for zero), explain attempted-but-unassessable answers, and show consented-but-unasked counts/reasons. Do not silently exclude setup failures, missing answers or withdrawals to inflate rates. Withdrawn observations are removed; retain only their anonymous count, and explain the resulting denominator. Published aggregates include only publication-consenting records and disclose that count. Prefer counts to percentages for 5–10 learners.

Page-local learning events remain uncollected browser activity under [learning-events.md](learning-events.md). Do not subscribe, export, persist or treat them as durable analytics in this pilot. Manual task/artifact observations are the only study collection. Report voluntary self-report separately with its respondent count; do not equate self-report, page load, download activation or repeated clicks with execution or comprehension.

## Empty session and aggregate report templates

Session record (outside Git only): participant code; consent options/date; owners/deletion channel; packet version; optional prior experience; start/end reason and coarse duration; setup attempts/failures; help category; baseline/change artifact checklist and scope; diagnostic inspection; each question's first category/reason, missing cause and optional assisted category; optional self-report; withdrawal/deletion due date. Leave unobserved fields missing; never prefill success.

Aggregate report: packet/build SHA and artifact hashes; collection dates; protocol deviations; invitation count if known/unknown; consent/start/end counts; publication-consenting denominator; independent/assisted task funnel by evidence scope; failure counts by stage; each rubric's asked/attempted/assessable/missing/category counts; self-report respondent count and result separately; withdrawals; limitations; concrete next fixes; report-completion/deletion dates and deletion owner. Do not include identifying or verbatim examples. Report “no participant observations” until a real authorized pilot runs.

## Facilitator fixture rehearsal receipt — 2026-10-02

This is a facilitator protocol rehearsal with zero participants, not recruited-reader validation, actual-data verification, or learning evidence. It uses the existing Titanic fixture without changing any published receipt or measurement. The facilitator inspected task instructions, ran the fixture baseline/change, checked receipt identity/configuration and completed a blank rubric/report walkthrough; rubric participant fields remain empty. The checked script lacks detailed row/slice diagnostics, so the rehearsal checks available fold outputs only and does not certify #67's future error-analysis package.

The reproducible command is `python3.12 public/exercises/titanic-group-rules.py --fixture --output /private/tmp/kaggle-bible-69-rehearsal/titanic-rehearsal.json`. The source build commit, hashes, environment and observed outputs are recorded in the rehearsal receipt supplied with this ticket. The fresh facilitator receipt and generated fixture snapshot live outside Git in that temporary rehearsal folder. A temporary folder is not a durable participant-evidence store; rerun and pin a new packet after #64/#67 land. No account, network data acquisition, provider call, submission or outreach occurred. Actual observations and privacy ownership/consent readiness remain external prerequisites.

| Rehearsal input/output | Recorded identity or observation |
| --- | --- |
| Site/exercise source commit (before docs-only protocol changes) | `d21e6c66a164bf521122c73fae734d0c93d34220` |
| Script SHA-256 | `f6c9251a09490dd775edab867fa326b09633fee5afc1846d2b590d46d78cf0dd` |
| Fresh fixture snapshot SHA-256 | `a3c3c843ef11dc68135934d05df20aaa8ec38a2271c03aeb1f42daeab02470fb` |
| Fresh rehearsal receipt SHA-256 | `64f5cdc8dde28e7eb0352da39994e84e211d39d0b62c221d86da89a3c75d8a9a` |
| Execution environment | Python 3.12.13, Darwin arm64, standard library, local CPU |
| Fixed comparison | Five target-stratified folds, seed 17; sex-majority versus sex-class-majority |
| Observed unweighted mean fold accuracy | Baseline `0.6667224367224367`; change `0.7445259545259545` |
| Identity/configuration checks | Script/data fingerprints match; five fold outputs each contain both configurations |
| Participant observations and comprehension assessments | Zero participants; no answers or rubric assessments |

These measured fixture scores are facilitator execution evidence only. The rehearsal's Python version differs from the existing published receipt's 3.12.14; it is recorded explicitly rather than updating that receipt or claiming environment equivalence.

Built Titanic guide SHA-256: `908a39298e6243c1bca4c2af7a8aefd8acad328c6e5a84bf969496f8397bb838` (`dist/competitions/titanic/index.html`), from the source commit above with docs-only protocol additions. Built script SHA-256 matches the script identity above. No browser participant session was performed.
