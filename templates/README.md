# Authoring templates

These are intentionally incomplete drafts, not publishable example guides. `REPLACE` values are placeholders; `null` means unknown. They use the [content contract](../docs/content-model.md). Astro validates record shapes and controlled values; cross-record, publication, and claim-marker checks are handled by the follow-up validation ticket.

Copy templates into these destinations when content authoring starts:

| Template | Destination |
| --- | --- |
| [Competition](competition.md) | `src/content/competitions/competition-<slug>.md` |
| [Solution](solution.yaml) | `src/content/solutions/solution-<id>.yaml` |
| [Practice](practice.md) | `src/content/practices/practice-<slug>.md` |
| [Source](source.yaml) | `src/content/sources/source-<id>.yaml` |
| [Reproduction](reproduction.yaml) | `src/content/reproductions/reproduction-<id>.yaml` |

Start with sources, then solutions, then competition synthesis and linked practices. Replace all IDs consistently. Repeat solution/source records as needed. Keep unknown fields null and explain consequential gaps in prose. Remove example array entries that are not supported; do not fill them with invented data. Reproduction records are optional until a run is planned.

Competition/practice files combine YAML frontmatter with Markdown; the other templates are YAML records. Keep the entry filename ID and the record's prefixed `id` field identical. Body markers such as `[claim:lesson-01]` refer to local claims in frontmatter. Source locators belong in each claim's evidence, not only in the source registry.

Before publication, follow the [editorial workflow](../docs/editorial-workflow.md). These templates have no automatic publication effect.

Competition-level progress is maintained in `data/competition-editorial.csv`. Add or update one sparse row there when a competition is queued, reviewed, blocked, or published; regenerate the inventory with the overlay so progress survives a new Meta Kaggle snapshot.
