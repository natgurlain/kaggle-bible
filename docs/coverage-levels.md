# Competition completeness levels

Every competition in the inventory has exactly one editorial completeness level. The level measures how much useful, reviewed knowledge Kaggle Bible has published for that competition. It does not measure competition difficulty, prestige, leaderboard rank, source quality by itself, or how many people have entered.

The levels are cumulative. A competition must satisfy every requirement at its level and the lower levels. A missing or inaccessible fact remains `unknown`; it cannot be filled with an estimate merely to reach a higher level.

## Level 1 — Catalog

Purpose: make the competition discoverable and establish its identity.

Required:

- Stable Kaggle competition ID, slug, title, official URL, category, and source snapshot.
- Machine-imported or source-checked lifecycle dates and record state where available.
- Official metric name, direction, and basic competition metadata when present in the source snapshot.
- Completeness level set to `1` and editorial status recorded as `unstarted`, `queued`, or `in-progress`.

Not included: solution analysis, validated recommendations, reproduction, or a claim that the competition has been studied.

Level 1 is the default for every row imported from the official inventory snapshot. It means “we know this competition exists in the source inventory,” not “we have read its page.”

## Level 2 — Evidence map

Purpose: give a participant a trustworthy map of the competition’s documented approaches.

Required:

- An inspected official competition source covering the task, data, metric, rules, and final/closed state when applicable.
- At least two independently authored or institutionally distinct primary solution sources, unless the editor records why only one can be found.
- At least one structured solution record with source attribution, validation details or an explicit unknown, documented techniques, and rank/score provenance.
- A short evidence summary covering the main approaches, known gaps, and one bounded lesson. Numerical claims identify their split and configuration.
- Source review date, named reviewer, and unresolved questions.

Level 2 does not require that code runs, that a result is reproduced, or that the source authors agree. It is suitable for discovery and comparison, but recommendations must retain their conditions and evidence labels.

## Level 3 — Full guide

Purpose: help a participant choose and execute a next experiment based on a comparative, reviewed account.

Required:

- Everything in Level 2, with a complete guide using the competition template.
- At least two reviewed solution records that can be compared on validation, techniques, reported results, and resource scope. A guide can remain Level 2 when the second source is too thin for a fair comparison.
- Clear separation of source-reported results, reproduced results, and editorial inference.
- Metric and validation explanation, top-solution comparison, decisive versus merely present techniques, documented unsuccessful attempts where available, compute/reproducibility status, transfer limits, and a suggested first experiment.
- At least one linked practice page that has passed its publication review, plus an evidence-backed explanation of when the lesson does and does not transfer.
- GPT-6 Luna Max exact-head review, complete references, passing structural checks, and a current review date.

Reproduction is strongly preferred for a Level 3 guide when it can change the reader’s decision, but it is not a universal requirement. A Level 3 guide may say “not reproduced” or “blocked” when that is the documented state. A reproduction of one component does not upgrade the full solution or validate a leaderboard rank.

## Status and downgrade rules

`editorial_status` describes work state separately from `completeness_level`:

`unstarted → queued → in-progress → in-review → published`

Use `blocked` when a specific missing source or access problem prevents the next review step. If a source disappears or a material claim loses support, downgrade the affected competition until the evidence is repaired. Keep the previous review record in Git history and note the reason in the correction.

The inventory can contain Level 1 entries indefinitely. Level 2 and Level 3 should be earned by evidence, not assigned to make coverage statistics look better.

## Reader-facing labels

Use these labels in cards, filters, and page headers:

| Level | Label | Reader meaning |
| --- | --- | --- |
| 1 | Catalog | Identity and basic metadata are recorded; research has not been completed |
| 2 | Evidence map | Primary sources and documented approaches have been reviewed; gaps remain |
| 3 | Full guide | Comparative, reviewed guidance is available for planning a next experiment |

Do not call Level 3 “complete forever.” Historical sources, links, dependencies, and community corrections can change its maintenance status.
