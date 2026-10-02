# Local learning event contract

The browser emits `kaggle-bible:learning-event` CustomEvents. No remote adapter, cookie, learner storage or backend is enabled. The pure constructor only accepts known published guide/exercise slugs and reconstructs an allowlisted payload.

Version 1 payloads:

- `{version:1,name:"guide_discovery",guide:"titanic"}` — published guide load.
- `{version:1,name:"exercise_start",exercise:"titanic-group-rules"}` — activation of experiment download; not a finished download/run.
- `{version:1,name:"self_reported_completion",exercise:"titanic-group-rules"}` — voluntary local report.
- `{version:1,name:"completion_withdrawn",exercise:"titanic-group-rules"}` — undo.

IDs come from the eligible content library, not the URL query. Payloads contain no timestamps, full URLs, text, identity or device information. The page-local activity inspector records locally generated events only; it does not trust externally injected CustomEvents as a receipt. Its list caps at 20, total count includes all page-local events. Report controls are reversible and reset on navigation/reload. Download activation never changes completion state. Duplicate report clicks are ignored until undo.

## Denominators and limitations

Events are not unique people. A guide discovery is a page load, exercise start is intent, and completion is self-report. Page state cannot support cross-page conversion or population-level rates; no aggregate data is collected. Published exercise counts use separately validated receipts. Local browser checks establish behavior only, not learning, satisfaction or transfer. GitHub issue reports are voluntary public submissions reviewed independently, not automatically counted as verified execution.

## Optional future deployment adapter

No adapter is implemented or configured. A separate authorized integration must document consent, retention, hosting request-log boundaries and endpoint ownership before sending anything. It should subscribe to this contract without adding URL/query/free-text fields. Define rate denominators explicitly and distinguish intent, self-report and artifact-verified runs. Do not present page-local acceptance as recruited reader evidence.

## Optional manual learner pilot

The [learner-pilot protocol](learner-pilot-protocol.md) uses consented manual observation; it does not add an event adapter or persist browser events. No event data is collected remotely or copied into study notes. Participant codes and minimal observations stay in a maintainer-controlled local folder outside Git, restricted to the consenting facilitator and maintainer, with raw records deleted within 30 days of report completion. Any published findings are anonymous aggregates with explicit denominators and separate publication consent.

In that pilot, artifact-verified baseline/change execution, rubric-assessed explanations, voluntary self-report, and page-local activity remain separate evidence classes. Missing/unassessable responses and setup/access failures remain visible. A fixture facilitator rehearsal is not a participant or a demonstration of learner comprehension. See the protocol for consent, withdrawal, deletion ownership and reporting rules.
