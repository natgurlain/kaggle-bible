/Users/bigcube/.zlogin:9: nice(5) failed: operation not permitted
# Website architecture and hosting decision

## Decision

Build the public site with **Astro + Starlight**, then add small custom Astro pages and client-side components for the competition catalog.

[Starlight](https://starlight.astro.build/) is Astro’s documentation theme. It provides the documentation behavior we need immediately: navigation, search, Markdown/MDX/Markdoc authoring, frontmatter validation, accessible typography, dark mode, SEO, and internationalization. Its pages live in `src/content/docs/`, while Astro remains available for custom routes and components. [Getting started with Starlight](https://starlight.astro.build/getting-started/)

This keeps the authoring experience pleasant for competition guides and practices without forcing the inventory into an unsuitable generic document shape. Starlight is currently documented as beta, so implementation should pin package versions, keep the content model independent of the theme, and run a production build in CI on every change.

## What belongs in Starlight and what is custom

| Site area | Implementation | Reason |
| --- | --- | --- |
| Start here, practices, methodology, contribution guide | Starlight Markdown/MDX | Mostly prose with stable navigation and reusable docs components |
| Level 2 and Level 3 competition guides | Starlight Markdown/MDX plus structured frontmatter/data | Long-form explanations need normal docs navigation; solution comparisons need typed records |
| All-competition catalog | Custom Astro route with generated catalog data | 12,296 records need facets, counts, sorting, and URL-persisted filters |
| Level 1 competition records | Catalog rows/cards linking to Kaggle and showing “guide pending” | A catalog record is not yet a researched guide; generating 12,296 full docs pages is unnecessary for the MVP |
| Evidence cards and solution comparison tables | Custom Astro components | They need provenance labels, claim links, score/split fields, and resource matching |
| Search | Starlight/Pagefind for prose plus catalog-filter logic | Full-text relevance and structured filtering are different operations |
| Learning path | Starlight page backed by editorial overlay fields | It is explanatory content with an ordered queue, not a second competition database |

Use stable routes:

```text
/
/start/
/competitions/
/competitions/<slug>/       # only when a reviewed guide exists
/practices/
/practices/<slug>/
/path/
/about/
/contribute/
```

The catalog should make a Level 1 row useful without pretending it has a guide: show title, category, state, metric, dates, completeness label, path/queue status, and the official Kaggle link. When a guide reaches Level 2 or 3, add an internal guide link. A future detail page for every catalog row is possible, but it should be justified by measured reader behavior and build/search performance.

## Data flow

Keep the source-of-truth content in Git:

```text
Meta Kaggle snapshot + editorial overlay
        ↓ build_competition_inventory.py
normalized catalog CSV + provenance manifest
        ↓ build-time loader
typed catalog data → /competitions/ filters and counts

Markdown/MDX guides + YAML sources/solutions
        ↓ Starlight content collection and validation
documentation pages + evidence components
        ↓ Astro build and Pagefind
static website
```

The website build must work from checked-in content and the normalized inventory. It must not require Kaggle credentials or fetch Kaggle pages at runtime. Source refreshes happen as an explicit data update PR; editorial progress stays in the sparse overlay. The catalog can be exported to JSON at build time, while the large source `Competitions.csv` remains outside the repository.

## Documentation software comparison

| Option | Fit | Decision |
| --- | --- | --- |
| Astro + Starlight | Native fit for the existing Astro/content-collection direction; strong docs defaults and custom Astro escape hatch | **Use for MVP** |
| Vercel Geistdocs / Fumadocs | Good Next.js documentation template with MDX, search, feedback, i18n, and optional AI chat; would move the project to Next.js and add app/server concerns | Reconsider if hosted AI chat, feedback workflows, or authenticated features become core |
| Docusaurus | Mature React documentation framework with a large plugin ecosystem | Viable fallback; custom catalog work is still required |
| GitBook or a hosted CMS | Fastest prose authoring and collaboration | Defer: structured claim provenance, generated catalog data, and Git review would become split across systems |
| MkDocs / Material | Excellent Python-oriented docs workflow | Less natural for the custom interactive catalog and Astro data pipeline |

The project should not start with an AI chat, accounts, comments, or a CMS. Those features would make hosting and editorial state more complex before the content model has been tested. The existing evidence labels and source links will also make a future cited assistant safer to add.

## Hosting recommendation

Use **Vercel Git integration as the primary deployment**:

- connect the GitHub repository;
- set the production branch to `main`;
- let branch pushes create preview deployments;
- run the static build for production after the content checks pass;
- attach a custom domain when the first public release is ready.

The current production deployment is [kaggle-bible.vercel.app](https://kaggle-bible.vercel.app/). Use this URL for previewing the published site while the project remains on Vercel’s default domain; update this reference if a custom domain becomes canonical.

Astro’s deployment guide says static Astro sites deploy to Vercel without an adapter; the Vercel Git flow creates previews for branches and production deployments from the production branch. [Astro on Vercel](https://docs.astro.build/en/guides/deploy/vercel/)

The application should remain static at first. Do not add `@astrojs/vercel`, server functions, a database, or runtime secrets until a real requirement appears. This makes Vercel replaceable and keeps the site deployable to other static hosts.

**Cloudflare Pages** is the alternative if we prioritize provider portability, Cloudflare’s edge network, or an existing Cloudflare account. Its official Astro guide supports GitHub-connected builds and static Astro output. [Astro on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)

GitHub Pages is a fallback for a strictly static site, but it is less convenient for preview environments and future server-backed additions. It is useful for a demo or an emergency mirror, not the primary workflow.

## Local acceptance gate

Before merging the epic to `main`, verify locally:

1. The catalog generator and overlay checks pass.
2. Starlight content schemas and cross-record references pass.
3. The static build succeeds from a clean checkout.
4. Search indexes prose and exposes evidence/completeness metadata.
5. Browser checks cover the homepage, catalog filters, a Level 1 row, a Level 2/3 guide, the learning path, mobile navigation, and keyboard search.
6. Hosted previews and deployment-provider checks are not acceptance requirements; deployment follows the repository's automatic flow after merge.

Run the production build and browser checks locally on the exact commit. Do not require a hosted preview or a separate deployment-provider check.
