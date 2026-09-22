<div align="center">

<img src="https://www.kaggle.com/static/images/logos/kaggle-logo-transparent.svg" alt="Kaggle logo" width="176" />

# Kaggle Bible

### Turn competition history into your next good experiment.

Kaggle Bible is an evidence-backed field guide to the decisions hiding inside Kaggle competitions: validation, features, models, compute, failure modes, and what actually transfers.

[**Explore the live site →**](https://kaggle-bible.vercel.app/) · [Browse the catalog](https://kaggle-bible.vercel.app/competitions/) · [Start learning](https://kaggle-bible.vercel.app/start/)

<br />

![Live site](https://img.shields.io/badge/site-live-111827?style=for-the-badge&logo=vercel&logoColor=white)
![Built with Astro](https://img.shields.io/badge/built%20with-Astro-FF5D01?style=for-the-badge&logo=astro&logoColor=white)
![Evidence first](https://img.shields.io/badge/editorial-evidence--first-7C3AED?style=for-the-badge)

</div>

## The idea

Kaggle gives you a score. Kaggle Bible keeps the decision trail.

The useful unit is not a leaderboard trick; it is an actionable lesson with traceable evidence:

> What worked, under which conditions, how it was validated, what it cost, and what remains unknown.

The project is built for the moment after “I found a promising competition” and before “I spent three days tuning the wrong thing.”

## What you can do here

| Need | Start here |
| --- | --- |
| Find a competition by task, metric, dates, or status | [Competition catalog](https://kaggle-bible.vercel.app/competitions/) |
| Learn in a deliberate beginner-to-advanced sequence | [Learning path](https://kaggle-bible.vercel.app/path/) |
| Choose a validation design or next experiment | [Best practices](https://kaggle-bible.vercel.app/practices/) |
| Understand what an entry actually proves | [Completeness levels](docs/coverage-levels.md) |
| Add a guide, source, or reproduction note | [Editorial workflow](docs/editorial-workflow.md) |

## A catalog that earns its depth

Every competition starts as a discoverable catalog record. Research depth is earned, not implied.

| Level | Label | What it means |
| :---: | --- | --- |
| **1** | **Catalog** | Identity and basic metadata are recorded; research is still pending. |
| **2** | **Evidence map** | Primary sources and documented approaches have been reviewed; gaps remain visible. |
| **3** | **Full guide** | A reviewed comparison helps you plan a next experiment, with limits and reproducibility details. |

Source-reported results, reproduced results, and editorial interpretation stay visibly separate. If a detail is missing, it stays `unknown` instead of becoming a confident-sounding guess.

## The learning loop

```text
  choose a competition
          │
          ▼
  read the task, metric, and validation constraints
          │
          ▼
  build a cheap baseline and record the experiment
          │
          ▼
  use evidence to choose one change
          │
          ▼
  keep the result — including the failed hypotheses
```

Advance on demonstrated capability, not leaderboard rank. A public score is feedback; it is not proof that your local validation is correct.

## Project map

```text
data/       normalized competition inventory and editorial overlay
docs/       product decisions, research, workflow, and editorial contracts
src/        Astro + Starlight website and catalog route
templates/  reusable guide, source, solution, and reproduction templates
scripts/    inventory generation and validation helpers
public/     static catalog data and site assets
```

The public website is static by design: checked-in content and generated catalog data go into the build, without Kaggle credentials or runtime scraping.

## Run it locally

Requirements: Node `22.12+` and pnpm `9+`.

```bash
pnpm install
pnpm check
pnpm dev
```

For a production-style check:

```bash
pnpm build
pnpm preview
```

The site is built with [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/), then deployed as a static build on [Vercel](https://vercel.com/). Branch pushes can create previews; `main` is the production branch.

## Contributing

The project values useful evidence over impressive-sounding certainty. A strong contribution can be a full guide, a carefully scoped reproduction, a source review, a correction, or a clearly documented failed attempt.

Before writing, read:

1. [Content model and validation contract](docs/content-model.md)
2. [Editorial and contribution workflow](docs/editorial-workflow.md)
3. [Completeness levels](docs/coverage-levels.md)
4. [Reusable content templates](templates/README.md)

The longer rationale lives in the [project proposal](docs/proposal.md), and the current competition inventory is documented in [competition-inventory.md](docs/competition-inventory.md).

<div align="center">

**Better experiments start with better questions.**

[Read Kaggle Bible →](https://kaggle-bible.vercel.app/)

</div>
