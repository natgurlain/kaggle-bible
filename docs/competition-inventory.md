# Competition inventory

The repository tracks the full public competition set represented by the official [Meta Kaggle](https://www.kaggle.com/datasets/kaggle/meta-kaggle) snapshot used to generate [data/competition-inventory.csv](../data/competition-inventory.csv). The snapshot is version `2322`, updated `2026-09-22`, and was generated from `Competitions.csv` on that date. The [manifest](../data/competition-inventory.manifest.json) records the row count and output checksum. The sparse editorial overlay is [data/competition-editorial.csv](../data/competition-editorial.csv); it marks the competitions queued for the learning path and preserves review progress across inventory refreshes.

“All competitions” means all distinct competition records present in that named official snapshot. Kaggle says Meta Kaggle is a filtered and transformed public activity dataset rather than a complete database dump. Therefore this is a reproducible historical inventory with a defined boundary, not a claim that it includes every private, deleted, or otherwise omitted platform record. The live [Kaggle competitions page](https://www.kaggle.com/competitions?group=all) remains the source for current discovery.

The generated CSV deliberately excludes long overview, rules, and dataset-description fields. Those fields can contain embedded Markdown, change independently, and make the repository unnecessarily large. The inventory keeps the stable reference, basic discovery metadata, lifecycle state, metric, public activity flags, and editorial tracking fields needed to work through competitions one by one.

## Current coverage state

Every imported row starts at **Level 1 — Catalog** with `editorial_status=unstarted`. That is intentional: importing a competition record does not mean we have read and verified its competition page or analyzed a solution. The requirements for earning Levels 2 and 3 are in [coverage levels](coverage-levels.md).

The inventory is a work queue, not a promise that every competition should eventually receive a full guide. We will process it in priority batches, preserve the complete catalog, and record why a candidate is deferred or blocked.

## Regeneration

Download the official `Competitions.csv` from the Meta Kaggle version recorded above, then run:

```bash
python3 scripts/build_competition_inventory.py \
  --source /path/to/Competitions.csv \
  --snapshot-date 2026-09-22 \
  --editorial-overlay data/competition-editorial.csv \
  --source-version 2322 \
  --source-updated-at 2026-09-22T07:59:00.503Z \
  --manifest data/competition-inventory.manifest.json \
  --output data/competition-inventory.csv \
  --catalog-json-output public/data/competition-catalog.json
```

The generator uses Python’s standard library, handles embedded newlines and NUL bytes in the source export, rejects duplicate IDs/slugs, sorts by enabled date and ID, and initializes every row to Level 1. The optional JSON output contains only the fields needed by the public catalog. The overlay is sparse: rows absent from it stay at Level 1 / `unstarted`; rows in it carry the explicit editorial state into the generated CSV and JSON. Unknown IDs, invalid levels, duplicate overlay rows, and invalid work orders fail the build.

## Fields

`id` and `slug` identify the Kaggle record. If the source snapshot has no title, the inventory and built catalog use the stable slug as its display title rather than leaving a blank card. `record_state` is derived from enabled/deadline dates at the snapshot date. `metric_direction` is derived from Kaggle’s evaluation metadata. Counts and reward fields are source metadata and may be blank or platform-specific. `completeness_level`, `completeness_label`, `editorial_status`, `priority`, `work_order`, `learning_path_stage`, `guide_slug`, reviewer fields, and `notes` are Kaggle Bible fields. `work_order` is an editorial sequence, not a ranking of competitions.

The CSV is intentionally useful for sorting and filtering, but it is not evidence for a solution claim. Competition pages, official rules, write-ups, code, and reproduced artifacts must be registered as sources before editorial claims are published.
