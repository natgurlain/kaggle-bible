# Pilot reader-validation protocol

Status: protocol prepared; reader sessions and results are not yet recorded.

## Goal

Check whether a reader can discover a relevant pilot guide, trace a material claim to its source, and identify a feasible next experiment or clearly state what remains unknown.

## Participants

Run five sessions with real people from the intended Kaggle-learning audience, including at least one beginner and one person with limited compute. Obtain affirmative consent to participate and separate affirmative consent before including anonymous outcomes in this public repository. Do not run a session without participation consent; if someone declines public reporting, do not publish their outcome and recruit a replacement for the five-session public result. Keep consent records outside the repository. Do not substitute agent simulations or team members role-playing for recruited readers.

## Session setup

- Use the same final preview deployment and commit for every session. Record the commit SHA and the test environment's browser family/version and viewport class once, not per-participant device details.
- Start each session on the competition catalog with filters cleared.
- Read the task below verbatim. Before timing, allow one verbatim reread if requested; after the participant says they are ready, say “Start now” and start the timer immediately. Do not coach or point to a page.
- Stop the timer when all three outcomes are reached or exactly at 180 seconds, whichever comes first. Do not pause or restart it. If the participant asks for clarification after timing starts, give one verbatim reread without explanation, keep the timer running, and record only that a clarification occurred. If an external interruption invalidates a session, mark it invalid and recruit a replacement rather than counting it as a pass or fail.
- After the timed discovery task, run a keyboard-only walkthrough of both the catalog and the guide. In the catalog, tab through search and every filter, enter a query, change a filter with the keyboard, and activate the selected guide link. In the guide, navigate to a material claim, follow its claim reference to the evidence card, and activate a source link. Separately check the catalog and guide at a narrow mobile viewport (at most 520 CSS pixels).
- Record whether each cited source opens and whether its locator lets the participant find the supporting passage. Do not treat a source link alone as proof of traceability.

## Task prompt

> Choose the competition guide that best fits a question you would genuinely want to investigate. Find one material claim in that guide and follow it to the source passage that supports it. Then name one next experiment you could reasonably try with your available time and compute. If the guide or source does not establish enough to choose an experiment, say what is unknown.

A session passes only if the participant, without facilitator hints, (1) reaches a relevant guide, (2) traces one material claim to its supporting source passage, and (3) identifies a feasible next experiment or explicitly names the uncertainty that prevents choosing one, all within three minutes.

## Session record

Use anonymous IDs (R1–R5). Do not enter names, contact details, raw notes, quotes, recordings, IP addresses, or personal device details. Record only objective task outcomes, elapsed seconds, whether a clarification occurred, and coarse issue categories. Report beginner and limited-compute coverage as aggregate counts separate from session IDs; do not tie those cohorts to individual rows.

| ID | Relevant guide found? | Claim and source passage traced? | Feasible experiment or explicit uncertainty? | Time (seconds) | Clarification? | Pass? | Source-access finding |
| --- | --- | --- | --- | ---: | --- | --- | --- |
| R1 | Not run | Not run | Not run | — | Not run | — | Not run |
| R2 | Not run | Not run | Not run | — | Not run | — | Not run |
| R3 | Not run | Not run | Not run | — | Not run | — | Not run |
| R4 | Not run | Not run | Not run | — | Not run | — | Not run |
| R5 | Not run | Not run | Not run | — | Not run | — | Not run |

Aggregate cohort coverage (not linked to IDs): beginner participants — not run; limited-compute participants — not run.

### Keyboard walkthrough results

Pass each surface only when every control or link in the scenario is reachable and operable by keyboard, focus remains visible and follows a logical order, activating the claim reference reaches the matching evidence card, source links open the expected source, and no keyboard trap occurs. Record failures and observations separately from the timed discovery pass.

| Session ID | Catalog search, filters, and guide link | Guide claim reference and source link | Observation or finding |
| --- | --- | --- | --- |
| R1 | Not run | Not run | Not run |
| R2 | Not run | Not run | Not run |
| R3 | Not run | Not run | Not run |
| R4 | Not run | Not run | Not run |
| R5 | Not run | Not run | Not run |

## Findings and decisions

For each observed issue, record the affected page/flow, impact, anonymous session ID and coarse observation (no verbatim quote or raw note), decision, linked fix PR or reason for not changing it, and retest result. Fix release-blocking issues and repeat the affected task before claiming the gate passed.

| Finding | Severity / release-blocking? | Evidence | Decision and follow-up | Retest |
| --- | --- | --- | --- | --- |
| None recorded; sessions not run. | — | — | Pending reader sessions. | — |

## Release gate

- [ ] Five real reader sessions recorded on one identified final preview commit.
- [ ] At least four of five pass the discovery task within three minutes, or the epic explicitly records that the gate failed and does not claim it passed.
- [ ] Material source paths, keyboard navigation, guide/catalog links, and narrow-screen layout reviewed; the defined catalog and guide keyboard scenarios pass, release-blocking findings are resolved, and fixes are retested.
- [ ] Final content checks and production build pass on the final epic head.
- [ ] GPT-6 Luna at Max reasoning approves the exact epic-to-main head; any head change receives a fresh review.
- [ ] After integration, production is verified against the merged main commit.

No result may be marked complete until it is observed in an actual session.