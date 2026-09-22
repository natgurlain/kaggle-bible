# Kaggle Bible

A proposed practical, searchable knowledge base for learning from Kaggle competitions and choosing better experiments.

The core unit is an actionable lesson with traceable evidence: what worked, under which conditions, how it was validated, what it cost, and what remains unknown.

## Project design

- [Product proposal and roadmap](docs/proposal.md)
- [Content model and validation contract](docs/content-model.md)
- [Editorial and contribution workflow](docs/editorial-workflow.md)
- [Research notes and initial competition shortlist](docs/research.md)
- [Competition inventory](docs/competition-inventory.md)
- [Completeness levels](docs/coverage-levels.md)
- [Beginner-to-advanced learning path](docs/learning-path.md)
- [Website architecture and hosting decision](docs/website-architecture.md)
- [Reusable content templates](templates/README.md)

Status: inventory, editorial planning, and website architecture. The normalized competition inventory is generated from a dated Meta Kaggle snapshot; the Astro/Starlight application scaffold is the next implementation step.

The inventory starts every competition at Level 1 (Catalog). Guides move to Level 2 (Evidence map) and Level 3 (Full guide) only when they meet the requirements in [coverage levels](docs/coverage-levels.md). Broad coverage will grow through an explicit research queue, with incomplete entries clearly labeled.
