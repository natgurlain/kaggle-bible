# Content model and validation contract

This is the version-1 authoring contract. Astro schemas are implemented in `src/content.config.ts`, `src/content/schemas.ts`, and `src/content/taxonomy.ts`; `pnpm check-content` enforces cross-record evidence and publication rules. Templates remain draft examples. Field names below match the templates.

## Entities and relations

| Entity | File | Owns | References |
| --- | --- | --- | --- |
| Competition | `src/content/competitions/competition-<slug>.md` | Problem/data/metric metadata and cross-solution synthesis | Solutions, practices, sources |
| Solution | `src/content/solutions/solution-<id>.yaml` | One team's documented system, scores, validation, resources, and claims | One competition, sources, reproductions |
| Practice | `src/content/practices/practice-<slug>.md` | A conditional recommendation and procedure | Exact solution/competition claims, sources |
| Source | `src/content/sources/source-<id>.yaml` | URL, authorship, revision, access history, license notes | No required parent |
| Reproduction | `src/content/reproductions/reproduction-<id>.yaml` | Scope, pinned inputs/code, environment, execution, artifacts, comparison | Solution and claim IDs |

Embed claims in the competition, solution, or practice that owns them. A claim reference is `<owner-id>#<claim-id>`; claim IDs are unique within their owner. Practice-to-competition backlinks are generated through evidence claims. Competition solution lists must agree with each solution's `competition_id`.

There is no standalone claims collection: the shared claim schema is embedded in its owning record so evidence does not acquire a second source of truth. The Astro content entry ID is derived from the filename; use the same stable prefixed value in the record's `id` field. Cross-collection references in frontmatter point to those entry IDs. `pnpm check-content` enforces filename/record-ID agreement, collection references, and embedded claim references.

Use globally unique lowercase kebab-case IDs with prefixes (`competition-`, `solution-`, `practice-`, `source-`, `reproduction-`). Slugs determine public competition/practice URLs; IDs remain stable if titles change. Store schema version `1` in every record. Dates are quoted ISO `YYYY-MM-DD`; unknown scalar values are YAML `null`, never zero or an invented estimate. Empty arrays mean no recorded entries, not evidence that nothing happened. Claim `conditions` and `limitations` are explicit prose strings; use an empty string only when there is genuinely nothing to record.

Common published content fields: `schema_version`, `id`, `status`, `title`, `summary`, `reviewed_by`, `reviewed_at`. `status` is `draft | in-review | published`; publishing requires a named reviewer and review date. Sources and reproductions use their own status fields described below.

The common editorial `status` applies to competition, solution, and practice records. A source instead records access with `access_status` and whether its content was reviewed with `content_reviewed`; neither field means the source or claims are editorially published. A claim's `kind` labels its evidence basis. A reproduction's `status` tracks execution (`planned | running | completed | failed | blocked`), not page review.

## Competition

Required fields: common content fields, `slug`, `kaggle_slug`, `competition_url`, `end_date` (nullable until verified), `coverage`, `modalities`, `tasks`, `dataset_characteristics`, `metrics`, `solution_ids`, `practice_ids`, `source_ids`, `claims`, `kaggle_bible_completeness_level`, `kaggle_bible_completeness_label`, `editorial_status`.

`coverage` is `partial | reviewed`. A published partial guide is permitted after launch and displays its gaps prominently; initial MVP selection requires two reviewed solutions per guide. Catalog discovery candidates remain in the research queue, outside public content collections.

`kaggle_bible_completeness_level` is `1 | 2 | 3` and follows [the completeness contract](coverage-levels.md): Catalog, Evidence map, or Full guide. `kaggle_bible_completeness_label` is the corresponding machine-readable ID: `catalog | evidence-map | full-guide`. The schema has no default completeness value: authors must set the earned level explicitly. `editorial_status` is `unstarted | queued | in-progress | blocked | in-review | published`. Completeness is cumulative evidence depth, not a quality score or rank. Inventory rows use the same concept in CSV columns named `completeness_level` and `completeness_label`.

Each metric has `id`, `name`, `direction` (`minimize | maximize`), `aggregation`, and `source_id`. Explain weighting and special evaluation behavior in prose. Multiple metrics are permitted; identify the official ranking metric in prose. Metric scores are only comparable within a compatible competition/evaluation setting.

## Solution

Required fields: common content fields, `competition_id`, `team`, `authors`, `source_ids`, `rank`, `scores`, `validation`, `techniques`, `resources`, `reproducibility`, `claims`, `unsuccessful_attempts`, `transfer_limits`.

- `rank`: nullable `value`, `basis` (`unknown | author-report | official-final-private`), and `source_id`. Do not promote an author's claimed rank to independently verified rank.
- `scores[]`: `metric_id`, numeric `value`, `split` (`local-cv | public-lb | private-lb`), `configuration`, nullable `fold_summary`, and `claim_id`. A score needs a source-backed or reproduction-backed claim. Never present a public score as final private performance.
- `validation`: nullable `strategy`, `details`, `source_ids`. Missing split details are unknown, even when training code exists.
- `resources[]`: separate configurations, each with `id`, `scope` (`training | inference | full-pipeline`), `hardware_class` (`cpu-only | single-gpu | multi-gpu | tpu | unknown`), nullable `accelerator_model`, `accelerator_count`, `vram_gb_per_device`, `ram_gb`, `wall_hours`, `accelerator_hours`, `basis` (`source-reported | reproduced | unknown`), and `claim_id`. Unknown basis permits a null claim. Known basis requires supporting evidence.
- `reproducibility`: `code_url`, `code_revision`, `status` (`not-assessed | code-available | attempted | partial | reproduced | blocked`), `reproduction_ids`, and `notes`. A repository link alone never implies successful reproduction.
- `unsuccessful_attempts[]`: `description`, `claim_id`, and `conditions`; do not infer failure from absence in the final model.

Resource classes describe recorded runs, not universal feasibility or dollar cost. Do not infer memory, total experiments, or runtime from accelerator count. If a source reports runtime without saying how many models it covers, retain that limitation. Keep editorial budget adaptations in labeled prose until measured.

## Claim and evidence

Every claim record contains:

- `id`, `statement`, `kind` (`source-reported | reproduced | editorial-inference`).
- `evidence[]`, each with `source_id`, precise `locator` (heading, comment, table, or pinned file/lines), and an original `support_summary`.
- `supports_claim_refs[]` for the prior claims an inference draws on.
- `reproduction_ids[]`, `conditions`, and `limitations`.

`source-reported` requires at least one direct inspected source. `reproduced` requires a completed reproduction record and artifacts supporting this exact statement, not just another claim about the solution. `editorial-inference` requires evidence or referenced claims plus an explanation of reasoning and limits. Reproducing a single model does not reproduce an ensemble, final rank, or all claims on a page.

Use body markers such as `[claim:gain-01]` immediately after substantive claims; the future renderer resolves them to evidence cards. These are proposed authoring markers, not currently implemented Markdown features. Cross-record evidence links live in frontmatter as canonical references. Keep source-based facts such as data counts in claims too; a bibliography alone is insufficient.

Numeric gains must state metric, split, baseline, changed configuration, and whether it was an isolated comparison. Report absolute versus relative changes correctly. Contradictory sources remain separate claims with a visible note until resolved. Do not average incompatible results or let a generic confidence score hide disagreements.

## Practice

Required fields: common content fields, `slug`, `topic`, `evidence_scope`, `modalities`, `tasks`, `dataset_characteristics`, `techniques`, `evidence_claim_refs`, `source_ids`, `claims`.

`evidence_scope` is `single-case | recurring | foundational`. `recurring` requires evidence from at least two independent competitions; reviewers still assess the strength and applicability. `foundational` can cite primary technical references, with competition examples illustrating the application. Repeated write-ups by the same team about the same experiment are not independent evidence.

Required body sections: decision, use when, avoid/adapt when, procedure, diagnostics, evidence and disagreements, cost, and next experiment. Link any measured performance claim to its underlying experiment; a general practice does not inherit all score gains of systems that used it.

## Source and reproduction records

Sources contain `schema_version`, `id`, `title`, `url`, `kind` (`official-competition | author-writeup | code | paper | documentation | discovery-index`), `authors`, nullable `published_at`, `accessed_at`, `revision`, `locator_notes`, `access_status` (`accessible | login-required | unavailable | unchecked`), `content_reviewed`, `license`, and `notes`.

A search result or index is a discovery lead. It is not sufficient evidence for a detailed solution claim. `content_reviewed: true` means a person or agent inspected the relevant content; it does not itself mean an independent reproduction or human publication review occurred. Sources behind login can be reviewed by an authorized contributor, with the access limitation visible to readers.

Reproductions contain `schema_version`, `id`, `solution_id`, `claim_ids`, `status` (`planned | running | completed | failed | blocked`), `scope`, `code`, `data`, `environment`, `command`, `expected`, `observed`, `artifacts`, `executed_by`, `executed_at`, `limitations`. Completed runs require a pinned revision plus either a source URL or a durable local snapshot reference also listed in `artifacts`, data identification, environment details, executable command, metric/split, expected result and tolerance chosen before comparison, actual result, and durable run artifacts. An execution can complete without matching the expected result; only supported claims receive the reproduced label.

## Controlled vocabulary

Initial values and their labels, aliases, and definitions live in `src/content/taxonomy.ts`. Extend this registry in the same PR as any new controlled value:

| Field | Initial values |
| --- | --- |
| modalities | `tabular`, `text`, `image`, `audio`, `video`, `multimodal` |
| tasks | `binary-classification`, `multiclass-classification`, `multilabel-classification`, `regression`, `forecasting`, `ranking`, `segmentation`, `detection`, `retrieval`, `question-answering` |
| dataset_characteristics | `temporal`, `grouped-entities`, `hierarchical`, `imbalanced`, `high-cardinality`, `sparse`, `distribution-shift`, `small-labeled-set`, `external-data` |
| validation.strategy | `random-kfold`, `stratified-kfold`, `group-kfold`, `temporal-holdout`, `rolling-origin`, `custom`, null |
| topic | `validation`, `leakage`, `feature-engineering`, `modeling`, `ensembling`, `experiment-tracking`, `compute-efficiency`, `submissions` |
| technique | `out-of-fold`, `gradient-boosting`, `target-encoding`, `test-time-augmentation`, `groupby-aggregation`, `rank-averaging`, `stacking`, `blending`, `hierarchical-reconciliation`, `stratified-cross-validation` |

Forecasting is a task; temporal is a data characteristic. Allow arrays so a competition can be both tabular and text, or temporal and grouped. Metric IDs are scoped to their competition. Technique IDs use the registry above. Each taxonomy entry has an ID, display name, aliases, and definition. Define terms before using subjective tags such as "small"; avoid guessed dataset-size or difficulty categories.

## Validation commands and guarantees

- `pnpm test:content` exercises the publication policy, including a complete Level 2 fixture and draft/in-review exclusion.
- `pnpm check-content` rejects duplicate IDs, filename/ID mismatches, broken collection and claim references, unsupported claim-evidence shapes, unreviewed sources in published records, incomplete Level 2/3 review states, and publication dependencies on drafts.
- `pnpm check` runs Astro's schema and TypeScript checks for required fields, controlled values, dates, URLs, and resource bounds.
- `pnpm build` verifies the static site compiles. After the build, `CHECK_BUILT_CONTENT=1 pnpm check-content` checks that draft/in-review record IDs and guide routes are absent from public output, and that catalog guide links resolve only to publishable guides.

The pull-request workflow installs the exact checked-in pnpm version, uses Node 22.12.0 (the repository's declared minimum), installs with a frozen lockfile, and runs these checks without Kaggle credentials, network scraping, or paid services. Automated checks establish structural consistency, not whether a cited source actually proves a statement. Human review still covers rankings, metric interpretation, isolated-versus-combined gains, applicability, contradictions, and source attribution. Markdown claim-marker rendering and external link checks remain separate future work; a 403 or rate limit is not a reason to delete historical evidence or block every unrelated PR.
