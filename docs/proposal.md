# Kaggle Bible: product and delivery proposal

Prepared 2026-09-22. Recommendations are project design decisions unless linked to external evidence.

## Recommendation and assumptions

Build an English-language, public reference site with competition guides connected to reusable practices. Every guide should help someone choose an experiment, understand its validation requirements, and estimate whether it is feasible on their hardware. Put a short decision summary before the detailed analysis.

Assume one maintaining editor, occasional contributors, a small infrastructure budget, and Git-based review. Begin with closed competitions that have accessible primary sources. Reproduction is valuable but optional for inclusion: clearly attributed author reports can be useful without rerunning a costly solution. Unknown compute and unsuccessful experiments must remain unknown when not documented.

Repository inspection found no project files, application, dependencies, or local instruction files. This proposal introduces the documentation foundation; it does not commit the project to a hosting provider or implement the site.

## Users and the decisions they need to make

| User | Main questions | Useful outcome |
| --- | --- | --- |
| First-time participant | How do I understand the metric, build a baseline, and avoid misleading validation? | A short starting path, glossary links, and a validation checklist |
| Intermediate competitor | Which past problems resemble mine? What experiment should I prioritize? | Relevant competition comparisons with applicability and evidence |
| Experienced competitor | What differentiated top solutions? Were gains isolated? Where did validation disagree with the leaderboard? | Technical details, ablations, original sources, and uncertainty |
| Participant with limited compute | Which ideas can I test on CPU or one GPU? What can I omit? | Separate full-solution resource reports and explicitly labeled simplified experiments |
| Contributor | What evidence is needed, and how do I add or correct it? | Small templates, clear review gates, and traceable corrections |

The primary success measure is whether a reader can identify a relevant next experiment and explain how to validate it. Page counts and traffic are secondary.

## Navigation and discovery

Use four top-level destinations: **Start here**, **Competitions**, **Practices**, and **About / contribute**. Search is available everywhere. The homepage contains a short explanation, a problem-oriented search box, task/modality shortcuts, and a few reviewed guides. Avoid an empty dashboard or an overwhelming taxonomy on arrival.

- **Start here:** a compact route through problem framing, metric inspection, validation, baseline, experiment log, and submission checks. Link to canonical practices rather than duplicating their advice.
- **Competitions:** searchable catalog with a short summary, modality, task, metric, closure year, and coverage label. Each guide contains its solution comparison and links to detailed solution sections/pages.
- **Practices:** organized by the decision being made: validation, leakage, features, modeling, ensembles, experiment tracking, compute, and submissions. Technique names are tags and aliases, not a competing navigation tree.
- **About / contribute:** methodology, evidence labels, coverage gaps, corrections, and source attribution.

Proposed stable routes: `/competitions/<slug>/`, `/solutions/<id>/`, `/practices/<slug>/`, `/start/`, and `/about/`. Sources and claims get stable anchors on their owning pages. Solution pages can initially be simple generated detail views using the same structured records as comparison tables.

### Search behavior

Search titles, summaries, technique aliases, relevant body text, and metric names. Exclude navigation, templates, drafts, and repetitive source boilerplate from the index. Render evidence labels and context in search snippets so a reported improvement cannot appear as an unconditional recommendation.

Start with filters for content type, modality, task, metric, dataset characteristics, and compute. Put year, technique, validation family, coverage, and reproduction status under advanced filters. OR values within a facet and AND across facets. Persist query and selections in the URL; support clearing individual filters, visible counts, keyboard navigation, and a useful zero-results state that suggests relaxing a filter.

Compute filters match **individual documented solution configurations**, not assumptions about an entire competition. A competition qualifies if at least one reviewed solution matches; show the matching solution. Never combine one solution's GPU count with another solution's runtime to create a false match. An optional "include unknown resources" switch is off for strict resource queries. An editorial lightweight suggestion does not qualify as demonstrated feasibility.

Examples of acceptance queries:

| Query | Expected behavior |
| --- | --- |
| `categorical encoding` + tabular + binary classification | Relevant practices and competition examples; explain vocabulary aliases |
| forecasting + temporal data | Temporal validation material and matching competitions |
| vision + single GPU | Only documented matching configurations; disclose unknown runtime or memory |
| `OOF` | Finds out-of-fold guidance through an alias |
| NLP + CPU-only with no match | Honest empty state, with a way to include unknown compute or remove the restriction |

Do not rank competitions by raw score across different tasks or label techniques "best" by counting winners. Default catalog sorting is relevance when searching and recently reviewed when browsing, with year/title alternatives. Related pages use shared task, data characteristics, validation needs, and techniques, with a visible explanation such as "also has repeated entities."

## Competition guides and reusable practices

Each competition guide starts with the problem, why it is instructive, three supported lessons, and a "first experiment" suggestion explicitly marked as editorial if not reproduced. The detailed template covers data, metric, validation, solution comparison, isolated gains versus combined systems, failed attempts when documented, compute, reproducibility, and transfer limits.

Aim for two or three documented top solutions per guide, using final private standings where independently verifiable. Include a simpler or lower-cost approach when sources support one. If only one detailed solution is available, label coverage as partial rather than inventing a comparison. Keep author-reported rank separate from independently checked final rank. Historical techniques stay useful, but code age and changed dependencies must be visible.

The eight initial practice guides should answer these decisions:

| Topic | Decision and required content |
| --- | --- |
| Validation | Choose a split that represents the evaluation setting; discuss time, groups, duplicates, and fold stability |
| Leakage | Audit feature availability, preprocessing boundaries, target access, and external-data provenance |
| Feature engineering | Decide which transformations to test and how to fit them within folds |
| Modeling | Establish a credible baseline, then choose model complexity based on data and measured gains |
| Ensembling | Decide whether independent errors justify extra training/inference cost; check OOF alignment |
| Experiment tracking | Record hypothesis, data/split versions, configuration, seeds, results, and next decision |
| Compute efficiency | Prioritize experiments, distinguish proxy experiments from full runs, and measure resource use |
| Submissions | Validate IDs, row alignment, score direction, file format, inference constraints, and the selected final artifact |

These are proposed editorial scopes, not claims that each technique always improves results. Every practice needs "use when," "avoid or adapt when," a concrete procedure, diagnostics, and competition evidence. Distinguish gains that an author isolated from components merely present in a strong final system. Negative findings are conditional on the reported configuration, dataset, and budget.

Use the [content contract](content-model.md) to connect practices to exact claims. Two independent competitions are the normal threshold for describing a lesson as recurring; that is an editorial threshold, not statistical proof. Single-case guidance remains explicitly limited. Fundamental explanations can cite primary technical documentation or papers without pretending they are Kaggle ablations.

## Technical architecture

Recommend **Astro static output, Markdown prose with YAML frontmatter, YAML solution/source records, and Pagefind search**. Keep content in Git and generate pages, comparison tables, backlinks, a small catalog JSON, and search indexes at build time. Astro documents structured collections with schema validation and static page generation. [Astro content collections](https://docs.astro.build/en/guides/content-collections/)

Pagefind indexes the built site and supports metadata filters; use it for full-text search and categorical facets. Use a small generated catalog for solution-level resource matching, then intersect matching competition IDs with search results. This joins resource constraints explicitly rather than relying on independent page-level tags. Prototype this integration before adding range controls. [Pagefind setup](https://pagefind.app/docs/), [filter configuration](https://pagefind.app/docs/filtering/)

Keep authoring to plain Markdown initially. Use centrally controlled layouts and structured fields for repeated elements. Avoid requiring contributors to write executable MDX. Use schema validation at build time plus a separate cross-record validator for references and conditional publication rules; schema shape checks alone cannot verify evidence or citation quality.

Proposed implementation layout (not created in this planning phase):

```text
content/
  competitions/<slug>.md
  solutions/<id>.yaml
  practices/<slug>.md
  sources/<id>.yaml
  reproductions/<id>.yaml
  taxonomy.yaml
src/
  content.config.ts
  layouts/
  pages/
scripts/
  validate-content.*
  check-links.*
docs/
templates/
```

Use stable IDs independent of titles, one canonical record per source, and references rather than copied metadata. Pin dependency versions and the runtime when implementation begins. Generate data exports from the same content records; do not maintain a second database. The public build should work from checked-in content without fetching Kaggle pages or requiring Kaggle credentials.

| Choice | Why it fits | Tradeoff / revisit condition |
| --- | --- | --- |
| Static content and search | Small operational footprint; reviewable content history | Rebuild required for changes; revisit if measured build times obstruct publishing |
| Custom Astro layouts | Competition comparisons and discovery can share one data model | More initial UI work than a generic docs theme |
| Git contributions | Diffs and review fit evidence maintenance | Add an editor/CMS if contributor onboarding becomes a demonstrated bottleneck |
| Categorical resource filters first | Hardware facts can be reported without pretending all sources give full costs | Add numeric range search only after enough complete comparable records exist |
| Host-independent output | Straightforward portability and no required application backend | Select hosting during implementation based on preview/build needs |

A documentation theme is a reasonable shortcut if implementation capacity is very limited; it still needs custom catalog and comparison views. An application framework with accounts and a database becomes justified if personal collections or collaborative editing are validated needs. Neither is required for the first release.

## MVP and delivery gates

Target six reviewed competition guides across tabular, forecasting, NLP, and vision; at least twelve documented solution records; eight practice guides; and the short starting path. The shortlist is provisional until source eligibility checks pass. Keep a separate discovery queue so the ambition of broad coverage does not turn into thousands of thin published pages.

The complete competition inventory is maintained separately from editorial guides. Every imported competition begins at Level 1 (Catalog), which records identity and basic source metadata without claiming that the page or solutions were reviewed. Level 2 (Evidence map) adds a human-checked official source and documented solution evidence. Level 3 (Full guide) adds comparative, reviewed guidance for a next experiment. See [the exact completeness definitions](coverage-levels.md) and the [inventory boundary](competition-inventory.md). This lets us work through competitions one by one while keeping the full backlog visible.

The reader-facing learning path is [beginner to advanced](learning-path.md). It recommends small, interpretable competitions before relational tabular, time-aware, composite-metric, and resource-intensive problems, and assigns completion gates based on skills rather than leaderboard position.

| Phase | Deliverable | Completion gate |
| --- | --- | --- |
| 0: editorial pilot | Two competition drafts, four solution records, validation and compute practice drafts | Every substantive claim traceable; compare the templates against real sources; record missing fields and editing time |
| 1: site foundation | Content schemas, page layouts, catalog, search, contribution checks | Pilot pages render; drafts excluded; references validated; query/facet URL behavior works |
| 2: first release | Six guides, twelve or more solutions, eight practices, start path | Every guide has at least two reviewed solutions or is replaced with a more documentable candidate; all practices include evidence and transfer limits |
| 3: useful coverage | Grow in batches of five guides driven by missing tasks and reader requests | Previous batch passes review; new entries add distinct learning value; maintenance queue remains manageable |

Release gates also include:

- No unsourced numerical performance claims, guessed resource values, or unsupported "reproduced" labels.
- Each competition has an official problem/metric source and accessible primary solution evidence; a disputed field can remain explicitly unresolved.
- Each practice links to at least one concrete competition claim; broad recurring advice cites two competitions or is narrowed/labeled as limited evidence.
- All eight practice topics have usable guidance, even where the evidence is a process example rather than an ablated score improvement.
- Internal links, schema rules, relation checks, and draft exclusion pass. External access failures are reviewed rather than mistaken for factual invalidity.
- Five representative readers, including a beginner and a limited-compute participant, attempt discovery tasks. At least four find a relevant lesson, its source, and a feasible or explicitly uncertain next experiment within three minutes.
- Mobile layout and keyboard access work for navigation, search, filters, and comparison content; evidence labels do not depend on color.
- A contributor can produce a valid draft using the templates, and a reviewer can trace one randomly selected numerical claim in under two minutes.

Start with the two candidates with the strongest accessible sources in [research notes](research.md), not necessarily the most famous competitions. Measure editorial hours in the pilot before promising a calendar deadline or throughput. With one maintainer, prioritize one complete guide at a time and keep the research queue short.

## Maintenance, prioritization, and deferred work

Review new-competition suggestions monthly and existing sources quarterly. Re-review technical recipes when dependency changes or reproduction failures are reported. Preserve the difference between historical claims and currently runnable instructions. Show factual review dates separately from automated link-check dates.

Expand coverage by task gaps, transferable lessons, source quality, and participant demand. Include accessible non-winning solutions where they expose cost/performance tradeoffs. Track how many entries are discovered, partial, and reviewed; avoid presenting "each competition" coverage until it exists.

Defer mass scraping, automatic publication of generated summaries, full-solution reruns, hosted notebooks, leaderboards across incomparable tasks, accounts, comments, personalization, vector databases, and a chatbot. A future cited-answer assistant should wait until the content and retrieval can reliably distinguish reports from recommendations. Revisit features against measured reader failures, not feature counts.
