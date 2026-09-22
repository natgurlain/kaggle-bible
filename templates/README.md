# Authoring templates

These are intentionally incomplete drafts, not publishable example guides. `REPLACE` values are placeholders; `null` means unknown. They use the proposed [content contract](../docs/content-model.md); automated validation and claim-marker rendering are not implemented yet.

Copy templates into these destinations when content authoring starts:

| Template | Destination |
| --- | --- |
| [Competition](competition.md) | `content/competitions/<slug>.md` |
| [Solution](solution.yaml) | `content/solutions/<id>.yaml` |
| [Practice](practice.md) | `content/practices/<slug>.md` |
| [Source](source.yaml) | `content/sources/<id>.yaml` |
| [Reproduction](reproduction.yaml) | `content/reproductions/<id>.yaml` |

Start with sources, then solutions, then competition synthesis and linked practices. Replace all IDs consistently. Repeat solution/source records as needed. Keep unknown fields null and explain consequential gaps in prose. Remove example array entries that are not supported; do not fill them with invented data. Reproduction records are optional until a run is planned.

Competition/practice files combine YAML frontmatter with Markdown; the other templates are YAML records. Body markers such as `[claim:lesson-01]` refer to local claims in frontmatter. These markers will become evidence links in the future site; for now they are explicit authoring references. Source locators belong in each claim's evidence, not only in the source registry.

Before publication, follow the [editorial workflow](../docs/editorial-workflow.md). These templates have no automatic publication effect.
