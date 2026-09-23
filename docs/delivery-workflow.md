# Delivery roadmap and review flow

## Where to start

The site shell and the full competition catalog are in place. The next goal is to prove that Kaggle Bible can turn primary sources into useful, traceable guidance before expanding coverage.

### Epic 1 — Evidence-backed pilot

The first delivery slice uses Home Credit Default Risk and M5 Forecasting, subject to the source eligibility checks in [research.md](research.md). It should deliver:

- Two Level 2 evidence maps, with two independently sourced solution records per competition.
- Structured source and claim references, with source-reported results kept distinct from reproduction and editorial interpretation.
- Two practice pages connected to pilot evidence: validation and compute/resource planning. Unknown resource details stay unknown.
- A content pipeline that validates references and publication status, renders reviewed guides, and links them from the catalog.
- A reader and release review that checks source traceability, navigation, keyboard use, and narrow screens.

This pilot is a format and workflow gate. If either competition fails the documented source criteria, record why and select a replacement using the research rubric before drafting it. Do not raise an entry to Level 3 unless it meets the full-guide requirements in [coverage-levels.md](coverage-levels.md).

Track the work in [Epic #1: Publish the Home Credit + M5 evidence pilot](https://github.com/natgurlain/kaggle-bible/issues/1). Its checklist links the nine tickets in dependency order.

### After the pilot

Use the pilot review to settle schema and authoring friction, then build toward the proposal's initial release target: six reviewed competition guides, at least twelve solution records, eight practice guides, and the beginner-to-advanced path. Grow in source-qualified batches; keep the completeness levels honest and let reader requests and missing task coverage determine the order. See [proposal.md](proposal.md) for the acceptance gates and deferred work.

## Ticket delivery

Use one integration branch for the epic and one short-lived branch per ticket:

```text
main
└── epic/evidence-pilot
    ├── ticket/<issue>-source-audit
    ├── ticket/<issue>-content-model
    └── ticket/<issue>-guide-rendering
```

1. Create `epic/evidence-pilot` from the current `main` when implementation starts.
2. Create each `ticket/<issue>-<short-slug>` branch from the latest `epic/evidence-pilot`.
3. Keep a ticket branch within its issue's acceptance criteria. Open a pull request with the ticket branch as the head and `epic/evidence-pilot` as the base. Link the issue with `Refs #<issue>` and state the checks or local pages needed for review.
4. Run the checks required by the ticket. For visible site changes, build and serve the site locally with `pnpm build` and `pnpm preview`; inspect the affected page at a desktop viewport (1280px) and a narrow viewport (390px). Record the pages and viewport sizes reviewed in the PR. No hosted preview is required.
5. Request an independent review using **GPT-6 Luna** (`gpt-6-luna`) with reasoning effort **Max**. The reviewer examines the exact PR head against the ticket, checks regressions and evidence integrity, and returns `APPROVE` or `REQUEST_CHANGES` with actionable findings. Record the model, reasoning effort, and reviewed commit in the PR. Any new commit invalidates that review; rerun it on the new head.
6. Merge the ticket PR into `epic/evidence-pilot` only after GPT-6 Luna at Max reasoning explicitly returns `APPROVE` for the exact current head, required checks pass, and no blocking finding remains unresolved. Record a disposition for any non-blocking review notes. A `REQUEST_CHANGES`, missing verdict, stale review, or failed check is not merge approval. Update the epic checklist. Keep issue references as `Refs` on these PRs; close the child issues in the final PR to `main` so their status reflects the delivered default-branch state.

The Luna review is a Codex review step; it is not a GitHub account assignment. A maintainer checks the review result and performs the merge. Content publication also follows the named editorial review gate in [editorial-workflow.md](editorial-workflow.md).

## Epic integration

When every ticket is complete, open one pull request from `epic/evidence-pilot` to `main`.

- Summarize the complete outcome and list all child issues with `Closes #<issue>` references.
- Run the full content checks and production build on the final epic head. Serve that exact build locally with `pnpm preview`; review the catalog-to-guide and practice-to-evidence paths at 1280px and 390px.
- Have GPT-6 Luna (`gpt-6-luna`) at Max reasoning review the exact final diff, including integration effects across tickets. Record the reviewed SHA and verdict. Rerun the review if the epic branch changes afterward.
- Merge the epic PR only after GPT-6 Luna at Max reasoning explicitly returns `APPROVE` for the exact current head, required checks pass, and no blocking finding remains unresolved. Record a disposition for any non-blocking review notes. A `REQUEST_CHANGES`, missing verdict, stale review, or failed check is not merge approval. Afterward, verify that `main` contains the merge and close the epic.

Do not merge ticket branches directly to `main` or put unrelated tickets on the epic branch. If scope changes, update the epic and affected acceptance criteria before implementing the extra work.

## Review record

Each reviewed PR should make these items easy to find:

- Ticket and epic links, scope completed, and any scope deliberately left for later.
- Commands/checks and their results; for UI changes, the local preview pages and viewport sizes reviewed.
- GPT-6 Luna (`gpt-6-luna`) model, Max reasoning effort, reviewed commit SHA, explicit verdict, and disposition of every finding.
- Editorial reviewer and date for content intended for publication.
- Any known limitation, unknown evidence, or follow-up issue.
