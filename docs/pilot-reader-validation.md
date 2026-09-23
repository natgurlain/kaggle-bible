# Pilot reader-validation protocol

Status: protocol prepared; reader sessions and results are not yet recorded.

## Goal

Check whether a reader can discover a relevant pilot guide, trace a material claim to its source, and identify a feasible next experiment or clearly state what remains unknown.

## Participants

Run five sessions with real people from the intended Kaggle-learning audience, including at least one beginner and one person with limited compute. Obtain affirmative consent to participate and separate affirmative consent before including anonymous outcomes in this public repository. Do not run a session without participation consent; if someone declines public reporting, do not publish their outcome and recruit a replacement for the five-session public result. Keep consent records outside the repository. Do not substitute agent simulations or team members role-playing for recruited readers.

## Session setup

- Use the same locally built preview and commit for every session. On the final epic head, run `pnpm build` once and serve it with `pnpm preview`; do not use a hosted preview. Record the commit SHA and test browser family/version once; do not record per-participant device details.
- Run the mobile layout check at exactly 390 × 844 CSS pixels at 100% browser zoom.
- Start each session on the competition catalog with filters cleared.
- Read the task below verbatim. Before timing, allow one verbatim reread if requested; after the participant says they are ready, say “Start now” and start the timer immediately. Do not coach or point to a page.
- Stop the timer when all three outcomes are reached or exactly at 180 seconds, whichever comes first. Do not pause or restart it. If the participant asks for clarification after timing starts, give one verbatim reread without explanation, keep the timer running, and record only that a clarification occurred. If an external interruption invalidates a session, mark it invalid and recruit a replacement rather than counting it as a pass or fail.
- After the timed discovery task, run a keyboard-only walkthrough of both the catalog and the guide. In the catalog, tab through search and every filter, enter a query, change a filter with the keyboard, and activate the selected guide link. In the guide, navigate to a material claim, follow its claim reference to the evidence card, and activate a source link. Review both pages at the fixed mobile viewport above.
- Record whether each cited source opens and whether its locator lets the participant find the supporting passage. Use only the categories `opens and locator works`, `opens but locator fails`, `login required`, `unavailable`, or `other generic issue`; do not include free-text participant remarks. Do not treat a source link alone as proof of traceability.

## Task prompt

> Choose the competition guide that best fits a question you would genuinely want to investigate. Find one material claim in that guide and follow it to the source passage that supports it. Then name one next experiment you could reasonably try with your available time and compute. If the guide or source does not establish enough to choose an experiment, say what is unknown.

A session passes only if the participant, without facilitator hints, meets all three outcomes in the rubric below within 180 seconds. A clarification reread is allowed as described above; the timer continues.

## Scoring rubric

- **Relevant guide:** Before the task, the participant privately chooses a question they genuinely want to investigate and gives the facilitator only a topic code. Use `HC` for applicant loan-repayment risk/classification, `M5` for retail sales forecasting/product hierarchy, or `no match`. The selected guide passes only if its topic matches that code; do not record the participant's question.
- **Material claim and trace:** A claim is material if it could affect the task/metric, validation, feature or model choice, resource requirement, or proposed next experiment. Pass only when the participant follows its claim reference to the same claim's evidence card, opens the cited source, and identifies the passage indicated by the recorded locator. Record the claim ID, source ID, and locator section—not quoted text.
- **Feasible experiment or explicit uncertainty:** Pass with either (a) one bounded action and observable outcome that the participant self-assesses as within their available resources and that is consistent with the guide's stated limits, or (b) a specific missing evidence/condition that would change the choice. Record only a code such as a guide recommendation ID or an uncertainty category (`data access`, `validation`, `compute/time`, `source evidence`, `other`); do not record their free-text answer or personal resource details.
- **Overall:** all three outcomes above are required, without facilitator hints, by 180 seconds. Any missing outcome or timeout is a fail.

## Session record

Use anonymous IDs (R1–R5). Do not enter names, contact details, raw notes, quotes, recordings, IP addresses, personal device details, or participant screenshots. Record only the codes and objective outcomes defined here. Report beginner and limited-compute coverage as aggregate counts separate from session IDs; do not tie those cohorts to individual rows.

| ID | Guide slug / topic code | Intent match? | Material claim ID / category | Source ID / access category / locator confirmed? | Experiment ID or uncertainty category | Time (seconds) | Clarification? | Pass? |
| --- | --- | --- | --- | --- | --- | ---: | --- | --- |
| R1 | Not run | Not run | Not run | Not run | Not run | — | Not run | — |
| R2 | Not run | Not run | Not run | Not run | Not run | — | Not run | — |
| R3 | Not run | Not run | Not run | Not run | Not run | — | Not run | — |
| R4 | Not run | Not run | Not run | Not run | Not run | — | Not run | — |
| R5 | Not run | Not run | Not run | Not run | Not run | — | Not run | — |

| Local build commit SHA | Test browser family/version | Viewport |
| --- | --- | --- |
| Not run | Not run | 390 × 844 CSS px at 100% zoom |

Aggregate cohort coverage (not linked to IDs): beginner participants — not run; limited-compute participants — not run.

### Keyboard walkthrough results

Pass each surface only when every control or link in the scenario is reachable and operable by keyboard, focus remains visible and follows a logical order, activating the claim reference reaches the matching evidence card, source links open the expected source, and no keyboard trap occurs. Record failures and observations separately from the timed discovery pass.

| Session ID | Catalog search, filters, and guide link | Guide claim reference and source link | Non-identifying finding category |
| --- | --- | --- | --- |
| R1 | Not run | Not run | Not run |
| R2 | Not run | Not run | Not run |
| R3 | Not run | Not run | Not run |
| R4 | Not run | Not run | Not run |
| R5 | Not run | Not run | Not run |

### Mobile layout check

At exactly 390 × 844 CSS pixels and 100% zoom, pass the catalog if controls and result cards are fully visible, usable without horizontal page scrolling, and the guide link opens the expected page. Pass the guide if headings, claim references, evidence cards, source labels, and source links are readable and usable without clipping, overlap, or horizontal page scrolling.

| Page | Local build commit | Viewport | Pass? | Non-identifying finding category |
| --- | --- | --- | --- | --- |
| Catalog | Not run | 390 × 844 CSS px | Not run | Not run |
| Guide | Not run | 390 × 844 CSS px | Not run | Not run |

## Findings and decisions

For each observed issue, record the affected page/flow, impact, anonymous session ID and coarse observation (no verbatim quote or raw note), decision, linked fix PR or reason for not changing it, and retest result. Fix release-blocking issues and repeat the affected task before claiming the gate passed.

| Finding | Severity / release-blocking? | Evidence | Decision and follow-up | Retest |
| --- | --- | --- | --- | --- |
| None recorded; sessions not run. | — | — | Pending reader sessions. | — |

## Release gate

- [ ] Separate affirmative consent for public reporting is confirmed for every included outcome; consent records stay outside the repository and the public results contain no raw or identifying data.
- [ ] Five real reader sessions recorded on one identified local build commit.
- [ ] At least four of five pass the discovery task within three minutes, or the epic explicitly records that the gate failed and does not claim it passed.
- [ ] The same locally served `pnpm preview` build is used for every session; its commit SHA matches the recorded local build.
- [ ] Material source paths and guide/catalog links pass the defined rubric, keyboard scenarios pass, and both pages pass the 390 × 844 CSS-pixel mobile checks; release-blocking findings are resolved and retested.
- [ ] Final content checks and `pnpm build` pass on the final epic head.
- [ ] GPT-6 Luna at Max reasoning approves the exact epic-to-main head; any head change receives a fresh review.
- [ ] The epic merge is verified on `main`.

No result may be marked complete until it is observed in an actual session.