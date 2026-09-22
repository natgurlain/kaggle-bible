# Editorial and contribution workflow

## Discover and select

Maintain a small queue in `docs/research.md` initially. Record competition URL, candidate solution URLs, modality/task, distinctive lesson, source-access gaps, and next action. At scale, move the queue into structured records without exposing unreviewed summaries as guides.

Use official competition material for the task, metric, rules, and standings; author write-ups and pinned repositories for solution details; and primary papers/documentation for technique explanations. Aggregator lists help discovery but do not establish ranks, gains, or reproducibility.

Prioritize candidates with two independently authored detailed solutions, a useful validation or modeling lesson, and readable primary evidence. Record historical data access separately from source readability. Do not download competition datasets merely to write a guide.

## Extract, synthesize, and review

1. **Register sources.** Use the source template. Record author, access date, revision when available, exact relevant location, and whether the content was inspected. A blocked page stays a research lead until someone can inspect it.
2. **Extract atomic claims.** Preserve the author's split, model configuration, conditions, resource scope, and limitations. Separate official rank verification from author attribution. Make missing information explicit.
3. **Write solution records.** Capture scores and training/inference resources separately. Link each numerical result or proposed decisive technique to its supporting claim. Distinguish a component's presence from an isolated improvement.
4. **Write competition synthesis.** Compare compatible evidence, explain disagreements, and identify transferable hypotheses. Mark synthesis as editorial inference and link the exact supporting claims. Avoid attributing an ensemble score to its simplest component.
5. **Connect practices.** Add or amend conditional guidance with backlinks to specific competition evidence. Single-case observations do not become universal rules.
6. **Review.** A named human editor checks sources, factual claims, missing information, applicability, and the rendered result. A contributor may author and self-review a draft, but publication should receive another person's review; one-maintainer projects can recruit a guest reviewer for release batches.
7. **Publish.** Move `draft` to `in-review` to `published` after content checks and review. Keep source/reproduction records distinct from page workflow status. Record reviewer and date. Templates and drafts never enter public search.

AI can propose extractions and prose with citations, but cannot silently upgrade an author report into a reproduction or substitute a confident summary for inaccessible evidence. Every generated draft follows the same publication gate.

## Reproduction, when useful

Prioritize small, instructive claims whose verification changes a recommendation. Use the reproduction template before starting: specify scope, expected metric and tolerance, data/split identity, pinned code, environment, hardware, and commands. Record actual outcomes and retain failed attempts. Never claim that running a notebook reproduces a leaderboard placement.

Reproduction is not required for every entry. Mark code as available when it is only available; mark a run partial if only part of the system was tested. Link artifacts stored outside the content repository when they are large. Dataset files, credentials, and model weights do not belong in editorial templates.

## Contributions and corrections

Use one PR for one guide, one practice, or one focused correction. Copy templates as described in [template instructions](../templates/README.md), register primary sources first, then attach claims. Include what changed, evidence inspected, gaps, and relevant validation in the PR description.

A correction should identify the record/claim ID, the disputed text, the primary source, and a proposed correction. Preserve a short correction note for changes that affect recommendations or results. Flag disputed claims immediately; after review, update dependent practices and related summaries rather than only fixing one page.

Summarize sources in original wording, attribute authors, and link to originals. Record source/code license information if available; a public repository is not automatically permission to copy code. Select licenses for original project prose and future application code before public release. Do not copy whole write-ups or relicense third-party material.

## Review checklist

- Can each substantive result be traced to a precise inspected source or reproduction artifact?
- Are ranks and local/public/private scores labeled accurately?
- Are metric direction, baseline, split, and configuration preserved?
- Is the claimed gain isolated, combined, or unknown?
- Are unknown resources and undocumented unsuccessful attempts explicit?
- Is any proposed low-cost adaptation visibly distinguished from a measured run?
- Do practices state applicability, failure modes, and limitations?
- Are disagreements retained and resolved only when the evidence warrants it?
- Are source authors credited, review dates set, and publication dependencies complete?

## Maintenance cadence

Run external link checks weekly once automation exists; triage repeated failures monthly. Review primary-source accessibility and high-use guides quarterly. Reassess runnable instructions after dependency changes or reader failure reports. Automated link checks update access status, not factual review dates.

If a source disappears, retain its bibliographic record and label the access problem. Prefer an author-provided replacement or a legitimately accessible archived revision; do not rewrite the claim as verified without evidence. If support becomes insufficient, flag or withdraw the claim and update dependent practices.

Track source gaps, unresolved corrections, review age, and practical reader task completion. Keep the queue small enough that the maintainer can finish reviews; pause coverage expansion if corrections accumulate.
