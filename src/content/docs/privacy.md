---
title: Privacy and learning activity
description: What local learning events mean, what they contain, and what remains unmeasured.
---

Learning activity stays in the current page's memory. Kaggle Bible sends no learning events to an analytics endpoint and sets no learning cookies or learner identifier. Reloading or leaving the page resets the activity and voluntary run report. The theme preference is stored separately in your browser.

## What the events mean

| Event | Trigger | Interpretation |
| --- | --- | --- |
| Guide discovery | A published guide loads | One page load; not a unique person or proof the guide was read. |
| Exercise start | The experiment download link is activated | Intention to try; not proof a download finished or code executed. |
| Self-reported completion | You select “I ran this exercise” | A voluntary statement; not an independently verified execution or learning outcome. |
| Completion withdrawn | You select “Undo report” | Withdraws that page's report; repeat reporting remains an event, not another person. |

“Activity on this page” shows the event payloads and count. The list retains the latest 20 entries while the count includes all events on that page. No cross-page funnel, distinct-reader denominator, completion rate or comprehension result is available from this temporary activity. Published execution milestones come from reviewed, artifact-bound receipts and are independent of these clicks.

## What is included

Each event includes its version, event name and one known public guide or exercise slug. It excludes query strings, full URLs, typed text, timestamps, accounts, stable visitor IDs and device details. There is no remote analytics adapter enabled. Normal website requests are still handled by the hosting provider; local events do not claim to disable host request logs. Following an external Kaggle or GitHub link is governed by that service's privacy practices.

For a public execution record, [report a result on GitHub](/contribute/). You choose what to submit; keep private data and credentials out. A reviewed receipt can establish an execution with a stated environment and data scope. It does not establish reader comprehension, satisfaction or transfer to a new task.

## Future measurement

A deployment integration would require a separate explicit decision about consent, retention and an endpoint. It must preserve these event meanings, use documented denominators, and avoid collecting personal data through this contract. Local acceptance checks verify the controls and payloads. Reader understanding requires separate evidence; it cannot be inferred from views, clicks or self-reports.
