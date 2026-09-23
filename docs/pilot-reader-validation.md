# Pilot reader-validation protocol

Status: protocol prepared; reader sessions and results are not yet recorded.

## Goal

Check whether a reader can discover a relevant pilot guide, trace a material claim to its source, and identify a feasible next experiment or clearly state what remains unknown.

## Participants

Run five sessions with real people from the intended Kaggle-learning audience. Include at least one beginner and one person with limited compute. Record only an anonymous participant ID and the experience/compute context needed to interpret the result. Do not substitute agent simulations or team members role-playing for recruited readers.

## Session setup

- Use the same final preview deployment and commit for every session; record the commit SHA, browser, and viewport.
- Start each session on the competition catalog with filters cleared.
- Give every participant the task below verbatim. Do not coach or point them to a page; neutral clarification of the task wording is allowed and should be recorded.
- Time-box the discovery task at three minutes. Stop the timer only after all three outcomes are reached, or at the three-minute limit.
- After the timed discovery task, run a keyboard-only walkthrough of both the catalog and the guide. In the catalog, tab through search and every filter, enter a query, change a filter with the keyboard, and activate the selected guide link. In the guide, navigate to a material claim, follow its claim reference to the evidence card, and activate a source link. Separately check the catalog and guide at a narrow mobile viewport (at most 520 CSS pixels).
- Record whether each cited source opens and whether its locator lets the participant find the supporting passage. Do not treat a source link alone as proof of traceability.

## Task prompt

> Choose the competition guide that best fits a question you would genuinely want to investigate. Find one material claim in that guide and follow it to the source passage that supports it. Then name one next experiment you could reasonably try with your available time and compute. If the guide or source does not establish enough to choose an experiment, say what is unknown.

A session passes only if the participant, without facilitator hints, (1) reaches a relevant guide, (2) traces one material claim to its supporting source passage, and (3) identifies a feasible next experiment or explicitly names the uncertainty that prevents choosing one, all within three minutes.

## Session record

Use anonymous IDs (R1–R5). Do not enter names, contact details, or other personal data here.

| ID | Beginner / experience context | Compute context | Viewport and browser | Relevant guide found? | Claim and source passage traced? | Feasible experiment or explicit uncertainty? | Time (seconds) | Pass? | Mobile or source-access finding |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- | --- |
| R1 | Not run | Not run | Not run | Not run | Not run | Not run | — | — | — |
| R2 | Not run | Not run | Not run | Not run | Not run | Not run | — | — | — |
| R3 | Not run | Not run | Not run | Not run | Not run | Not run | — | — | — |
| R4 | Not run | Not run | Not run | Not run | Not run | Not run | — | — | — |
| R5 | Not run | Not run | Not run | Not run | Not run | Not run | — | — | — |

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

For each observed issue, record the affected page/flow, impact, evidence (participant ID and observation, without personal data), decision, linked fix PR or reason for not changing it, and retest result. Fix release-blocking issues and repeat the affected task before claiming the gate passed.

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