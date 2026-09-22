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

## Website

The public site uses Astro + Starlight and deploys as a static build on Vercel. With Node 22.12+ and pnpm 9:

Live site: [kaggle-bible.vercel.app](https://kaggle-bible.vercel.app/)

```bash
pnpm install
pnpm check
pnpm build
```

To deploy, import the GitHub repository into Vercel and keep `main` as the production branch. The checked-in Vercel configuration builds with `pnpm build` and serves `dist/`; pushes to branches create previews and pushes to `main` update production.

Status: the Astro/Starlight website shell and searchable catalog are scaffolded for Vercel. The normalized competition inventory and the static catalog asset are generated from a dated Meta Kaggle snapshot; content coverage is the next implementation step.

The inventory starts every competition at Level 1 (Catalog). Guides move to Level 2 (Evidence map) and Level 3 (Full guide) only when they meet the requirements in [coverage levels](docs/coverage-levels.md). Broad coverage will grow through an explicit research queue, with incomplete entries clearly labeled.
