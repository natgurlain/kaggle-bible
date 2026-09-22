# Research notes and initial selection queue

Research date: 2026-09-22. These notes support the design proposal; they are not published competition guides. Repository inspection found an empty Git worktree with no application or content to migrate.

## Tooling checked

| Primary source | Verified capability | Design implication |
| --- | --- | --- |
| [Astro content collections](https://docs.astro.build/en/guides/content-collections/) | Structured local content, collection schemas, and static page generation | Use build-time collections; keep source content portable |
| [Pagefind documentation](https://pagefind.app/docs/) and [filters](https://pagefind.app/docs/filtering/) | Indexes built HTML and supports filter metadata | Good starting point for text search and facets; solution-level resource joins need project logic |
| [Official Kaggle CLI](https://github.com/Kaggle/kaggle-cli) | Documents competition listing, notebook access, and browsing/reading discussions | Investigate read-only discovery helpers later, after checking the installed version and authentication requirements |
| [Meta Kaggle](https://www.kaggle.com/datasets/kaggle/meta-kaggle) | Search-index description identifies official public competition/community metadata | Candidate catalog discovery; dataset contents and schemas were not downloaded or audited in this task |

The Astro/Pagefind recommendation is a design judgment based on this project's static, editorial content. No dependencies were installed and no performance claims were benchmarked. The old `Kaggle/kaggle-api` repository URL redirected to `Kaggle/kaggle-cli` during research; implementation should inspect current documentation rather than assume older command coverage.

## Selection method

Eligibility comes before ranking: the competition must be closed, its official task/metric must be verifiable, and at least one substantive primary solution source must be readable. Before an MVP guide is commissioned, confirm a second independently authored solution and resolve enough provenance to compare them. A rank claimed in a repository remains an author report until checked against official final standings.

Then assign editorial priority using this proposed 100-point rubric:

- Source completeness and inspectability: 30.
- Distinct, transferable lesson: 25.
- Fills a missing task/modality/validation pattern: 20.
- Value for participants with limited compute: 15.
- Reader demand or relevance to current techniques: 10.

Scores are not assigned yet: the sources have received reconnaissance, not a full editorial audit. A low-compute lesson can mean a small useful experiment derived from a costly system; it must not imply that the full system fits a small budget. Prefer diversity over selecting only famous winners.

Keep one maintainer-owned queue. Each candidate moves through `discovered → sources-inspected → ready-to-draft → in-review → published`, or is deferred with a reason. Publication state in content files follows the separate `draft | in-review | published` contract. Review the queue monthly and replace candidates that cannot meet source requirements.

## Existing resources and the project's contribution

- [Kaggle solution write-up documentation](https://www.kaggle.com/solution-write-up-documentation) provides a useful reference for structured author reporting. Reuse the emphasis on approach, validation, and reproducibility while adding claim-level provenance and cross-competition recommendations.
- [Farid Rashidi's Kaggle Solutions](https://kaggle.farid.one/) and its [repository](https://github.com/faridrashidi/kaggle-solutions) provide a broad solution-discovery archive. Follow links to the original authors before extracting findings.
- [Eliot Andres' Kaggle Past Solutions](https://ndres.me/kaggle-past-solutions/) and its [repository](https://github.com/EliotAndres/kaggle-past-solutions) provide another competition/solution index. The site acknowledges missing competitions and solutions; treat coverage as incomplete.

The proposed contribution is a decision-oriented layer connecting documented solutions to conditional practices, validation requirements, resource reports, and evidence gaps. This is a product judgment, not a claim that every existing resource lacks these features.

## Provisional six-competition shortlist

The primary write-ups and repositories below were inspected during research by the Luna Max subagent. Lesson descriptions summarize author-reported content, not reproduced findings. These are historical candidates; dates, official final ranks, metric definitions, source ownership, and complete second-solution coverage still need the normal editorial audit before publication. No code or datasets were executed or downloaded.

| Candidate | Reason to investigate | Primary leads | Remaining gate |
| --- | --- | --- | --- |
| [Home Credit Default Risk](https://www.kaggle.com/competitions/home-credit-default-risk) — tabular | Relational-table aggregation, out-of-fold model diversity, and rank-based blending | [Author write-up](https://www.kaggle.com/competitions/home-credit-default-risk/writeups/8th-solution-overview), [repository](https://github.com/paveltr/home_credit_default_risk) | Find a second detailed solution; audit validation, ranks, and resources |
| [IEEE-CIS Fraud Detection](https://www.kaggle.com/competitions/ieee-fraud-detection) — tabular | Entity reconstruction and temporal feature construction; useful case for discussing what can transfer safely | [Author write-up](https://www.kaggle.com/competitions/ieee-fraud-detection/writeups/m5-10th-solution-and-code), [repository](https://github.com/jxzly/Kaggle-IEEE-CIS-Fraud-Detection-2019) | Verify final placement and temporal/data-availability assumptions; add a second solution |
| [M5 Forecasting – Accuracy](https://www.kaggle.com/competitions/m5-forecasting-accuracy) — forecasting | Hierarchical forecasting and alignment between bottom- and top-level predictions | [Author write-up](https://www.kaggle.com/competitions/m5-forecasting-accuracy/writeups/matthias-2nd-place-solution), [author repository](https://github.com/matthiasanderer/m5-accuracy-competition), [organizer methods collection](https://github.com/Mcompetitions/M5-methods) | Select and inspect a second team's method; audit evaluation and execution requirements |
| [Jigsaw Unintended Bias in Toxicity Classification](https://www.kaggle.com/competitions/jigsaw-unintended-bias-in-toxicity-classification) — text | Composite-metric reasoning, auxiliary targets, and model diversity | [Team write-up](https://www.kaggle.com/competitions/jigsaw-unintended-bias-in-toxicity-classification/writeups/ods-ai-toxiciology-1st-place-solution), [team repository](https://github.com/iezepov/combat-wombat-bias-in-toxicity) | Inspect official metric details and second solution; distinguish components from isolated gains |
| [SIIM-ISIC Melanoma Classification](https://www.kaggle.com/competitions/siim-isic-melanoma-classification) — image | Imbalance, validation stability, external data, and rank averaging | [Author write-up](https://www.kaggle.com/competitions/siim-isic-melanoma-classification/writeups/all-data-are-ext-1st-place-solution), [repository](https://github.com/haqishen/SIIM-ISIC-Melanoma-Classification-1st-Place-Solution) | Audit fold construction and external-data provenance; identify second solution |
| [Cassava Leaf Disease Classification](https://www.kaggle.com/competitions/cassava-leaf-disease-classification) — image | Pretraining, model diversity, and CV-based ensemble selection | [Team write-up](https://www.kaggle.com/competitions/cassava-leaf-disease-classification/writeups/golddiggaz-1st-place-solution), [separate participant repository](https://github.com/IMOKURI/Cassava-Leaf-Disease-Classification) | The separate repository is not established as the write-up team's code; verify attribution and comparative value |

Recommend **Home Credit and M5** for the editorial pilot: together they exercise relational features, tabular models, hierarchy, validation, and metric interpretation. M5's organizer collection provides additional leads for a multi-team comparison. This ordering is provisional, not a scored assessment; replace either candidate if source gates fail.

The remaining four candidates broaden modality and validation coverage. This historical cohort is intentionally a starting point for source-rich lessons, not a survey of current winning architectures. Before expanding, select at least one more recent closed competition with good primary sources and an independently documented modest-compute solution. Add audio, retrieval, segmentation, and other missing tasks in later batches when evidence quality permits.

Research limits: no final leaderboard ranks or performance values are asserted here; no full content audit or reproduction has been completed. "Sources inspected" is not "ready to publish." In particular, do not attach a convenient repository to a winning write-up without establishing common authorship.
