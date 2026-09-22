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

The primary write-ups below were inspected during research. Lesson descriptions summarize author-reported content, not reproduced findings. Home Credit and M5 have passed the initial source-eligibility check described in the dated audit below; they are not yet publication-ready. No code or competition datasets were executed or downloaded.

| Candidate | Reason to investigate | Primary leads | Remaining gate |
| --- | --- | --- | --- |
| [Home Credit Default Risk](https://www.kaggle.com/competitions/home-credit-default-risk) — tabular | Relational-table aggregation, out-of-fold model diversity, and rank-based blending | [8th Solution Overview](https://www.kaggle.com/competitions/home-credit-default-risk/writeups/8th-solution-overview), [#12 solution](https://www.kaggle.com/competitions/home-credit-default-risk/writeups/12-solution) | Resolve rules-page access and retain source-level limits on rank, validation, and compute in the guide |
| [IEEE-CIS Fraud Detection](https://www.kaggle.com/competitions/ieee-fraud-detection) — tabular | Entity reconstruction and temporal feature construction; useful case for discussing what can transfer safely | [Author write-up](https://www.kaggle.com/competitions/ieee-fraud-detection/writeups/m5-10th-solution-and-code), [repository](https://github.com/jxzly/Kaggle-IEEE-CIS-Fraud-Detection-2019) | Verify final placement and temporal/data-availability assumptions; add a second solution |
| [M5 Forecasting – Accuracy](https://www.kaggle.com/competitions/m5-forecasting-accuracy) — forecasting | Hierarchical forecasting, validation, and lower-compute alternatives | [2nd place solution](https://www.kaggle.com/competitions/m5-forecasting-accuracy/writeups/matthias-2nd-place-solution), [4th place solution](https://www.kaggle.com/competitions/m5-forecasting-accuracy/writeups/monsaraida-4th-place-solution) | Resolve rules-page access and preserve the limits on rank, validation, and hardware claims |
| [Jigsaw Unintended Bias in Toxicity Classification](https://www.kaggle.com/competitions/jigsaw-unintended-bias-in-toxicity-classification) — text | Composite-metric reasoning, auxiliary targets, and model diversity | [Team write-up](https://www.kaggle.com/competitions/jigsaw-unintended-bias-in-toxicity-classification/writeups/ods-ai-toxiciology-1st-place-solution), [team repository](https://github.com/iezepov/combat-wombat-bias-in-toxicity) | Inspect official metric details and second solution; distinguish components from isolated gains |
| [SIIM-ISIC Melanoma Classification](https://www.kaggle.com/competitions/siim-isic-melanoma-classification) — image | Imbalance, validation stability, external data, and rank averaging | [Author write-up](https://www.kaggle.com/competitions/siim-isic-melanoma-classification/writeups/all-data-are-ext-1st-place-solution), [repository](https://github.com/haqishen/SIIM-ISIC-Melanoma-Classification-1st-Place-Solution) | Audit fold construction and external-data provenance; identify second solution |
| [Cassava Leaf Disease Classification](https://www.kaggle.com/competitions/cassava-leaf-disease-classification) — image | Pretraining, model diversity, and CV-based ensemble selection | [Team write-up](https://www.kaggle.com/competitions/cassava-leaf-disease-classification/writeups/golddiggaz-1st-place-solution), [separate participant repository](https://github.com/IMOKURI/Cassava-Leaf-Disease-Classification) | The separate repository is not established as the write-up team's code; verify attribution and comparative value |

Recommend **Home Credit and M5** for the editorial pilot: together they exercise relational features, tabular models, hierarchy, validation, and metric interpretation. The dated audit below confirms two independently authored primary write-ups for each. This ordering is not a scored assessment; replace either candidate only if deeper guide research fails its evidence requirements.

## Pilot qualification audit: Home Credit and M5

**Audit date: 2026-09-22.** I inspected the official Kaggle overview, metric/task and final-leaderboard information, plus the primary write-ups linked below. Authorship is taken from the write-up bylines and author lists. Rankings and scores are labeled by evidence source; no performance was reproduced. The Kaggle overview and final leaderboard are official competition sources. The author write-ups are primary participant reports.

All four write-up pages and the cited overview/leaderboard pages returned readable public content in this audit. The two rules routes did not expose their page text in the available view; that access limitation is recorded separately below.

| Competition | Official task, metric, and state | Result context |
| --- | --- | --- |
| [Home Credit Default Risk](https://www.kaggle.com/competitions/home-credit-default-risk/overview/description) | Predict an applicant's repayment ability; Kaggle lists Area Under the ROC Curve (AUC). The competition closed 2018-08-29. | Kaggle's [leaderboard](https://www.kaggle.com/competitions/home-credit-default-risk/leaderboard) says the competition is complete and reflects final standings; it says the private leaderboard used approximately 80% of test data. |
| [M5 Forecasting – Accuracy](https://www.kaggle.com/competitions/m5-forecasting-accuracy/overview) | Forecast daily Walmart product sales for the next 28 days; Kaggle specifies Weighted Root Mean Squared Scaled Error (WRMSSE). The competition closed 2020-06-30. | Kaggle's [leaderboard](https://www.kaggle.com/competitions/m5-forecasting-accuracy/leaderboard) says the competition is complete and reflects final standings; it says the private leaderboard used approximately 50% of test data. |

The official [Home Credit rules route](https://www.kaggle.com/competitions/home-credit-default-risk/rules) and [M5 rules route](https://www.kaggle.com/competitions/m5-forecasting-accuracy/rules) were located, but their page bodies were not exposed by the available text view. Kaggle's Home Credit [data page](https://www.kaggle.com/competitions/home-credit-default-risk/data) and M5 [data page](https://www.kaggle.com/competitions/m5-forecasting-accuracy/data) label data use as subject to competition rules. I therefore make no specific rule, license, or external-data compliance claim here. Before publication, a reviewer must inspect and cite the full applicable rules and document any solution-specific compliance uncertainty; inability to do so blocks the affected claim, not the source-qualified pilot as a whole.

### Home Credit Default Risk — two independent primary write-ups

1. [8th Solution Overview](https://www.kaggle.com/competitions/home-credit-default-risk/writeups/8th-solution-overview), by Xuan Cao and six listed co-authors; Kaggle page dated 2018-08-30 and labeled "8th place." In `Summary`, `My solo approach`, and `Stacking/blending`, the author describes relational aggregation across credit-card, POS-cash, installment-payment, and bureau tables; diverse teammate models; stratified 10-fold validation; and rank-percentile blending for AUC. The write-up reports author-side CV values around 0.800 for the described models and a best public score of 0.809; these are not private-score claims. The official final leaderboard contains the same named team (七上八下) at rank 8 with private score 0.80376, so this team's final placement is independently matched by team name. The write-up says the public leaderboard covered only 20% of test data and cautions about LB reliability; the official page says the final private leaderboard used approximately 80%.
2. [#12 solution](https://www.kaggle.com/competitions/home-credit-default-risk/writeups/12-solution), by zr, ouyangxuan, cxlcc, Yifan Xie, Zhiqiang Zhong, and YL; Kaggle page dated 2018-08-30 and labeled "12th place." Under `Feature Engineer` and `Model Ensemble`, it reports a final blended/stacked local CV of 0.8047 and public score of 0.803. The authors describe relational table aggregates, model-derived history features, and diverse LightGBM/XGBoost/random-forest/linear-model stacking. These numbers are author-reported CV and public-LB results, not private results. Although Kaggle's final leaderboard is available, the captured official entry did not let me reliably match these author identities to a row; treat 12th as the write-up's displayed placement, not an independently verified final private rank.

The two write-ups have disjoint displayed author lists and materially different team descriptions, so they qualify as independent primary sources for this pilot. Neither supplies a dependable end-to-end hardware/runtime profile in the inspected text. Memory, accelerator, runtime, and cost are **unknown**, not inferred from repositories or typical LightGBM practice.

### M5 Forecasting – Accuracy — two independent primary write-ups

1. [2nd place solution](https://www.kaggle.com/competitions/m5-forecasting-accuracy/writeups/matthias-2nd-place-solution), by Matthias (`matthiasanderer`); Kaggle page dated 2020-07-08 and labeled "2nd place." In sections `3. The bottom level lgb model`, `5. Aligning with an independent top-level prediction`, and `6. What did not work`, the author describes bottom-level LightGBM predictions trained by store, a separate N-BEATS stream for the top five hierarchy levels, and alignment/ensembling across the hierarchy. The write-up reports exploratory decisions and a failed MinT/OLS/WLS reconciliation attempt, including renting a 128-GB AWS instance overnight. That machine is evidence only about the failed reconciliation attempt—not a hardware requirement or runtime for the final reported approach. The write-up does not provide a complete validation split recipe or an end-to-end resource profile for the final pipeline. Its placement remains the Kaggle write-up label; I did not reliably match the author's team to the extracted final leaderboard rows.
2. [4th place solution](https://www.kaggle.com/competitions/m5-forecasting-accuracy/writeups/monsaraida-4th-place-solution), by monsaraida; Kaggle page labels it "4th place." In the `Solution` bullets and following strategy commentary, the author describes a single LightGBM model with Tweedie objective, separate store/week model partitions across the 28-day horizon, and five dated holdout windows: d_1578–d_1605, d_1830–d_1857, d_1858–d_1885, d_1886–d_1913, and d_1914–d_1941. The author explicitly says they avoided post-processing, recursive features, and large compute, and did not optimize specifically for WRMSSE; those are author choices and commentary, not general recommendations. No hardware, runtime, or numeric validation result is reported in the inspected write-up. Treat fourth place as the Kaggle write-up label; the final rank was not independently tied to an official leaderboard row in this audit.

The M5 write-ups have different named authors and describe distinct systems, so they qualify as independent primary sources. The first is a more elaborate hierarchical two-stream approach; the second is a reported single-model, partitioned approach. Numeric hardware/runtime data for the completed systems is **unknown**. Do not translate the second author's qualitative "not too much" compute description into a quantified budget.

### Qualification decision and remaining work

Both candidates meet the initial eligibility gate: they are closed competitions with official task/metric and final-leaderboard sources, and each has two readable, independently authored primary solution write-ups. Proceed to the structured Level 2 drafts. Keep author reports distinct from reproduced findings; do not claim that every displayed write-up placement is an independently verified private-leaderboard rank. The inaccessible full rules text, missing compute measurements, and unconfirmed M5/#12 leaderboard identity are explicit guide-level limitations with the dispositions above. No replacement is needed at this stage. No source code, dataset, model, or metric implementation was run.

The remaining four candidates broaden modality and validation coverage. This historical cohort is intentionally a starting point for source-rich lessons, not a survey of current winning architectures. Before expanding, select at least one more recent closed competition with good primary sources and an independently documented modest-compute solution. Add audio, retrieval, segmentation, and other missing tasks in later batches when evidence quality permits.

Research limits: this is a source-qualification audit, not a full content audit or reproduction. "Sources inspected" is not "ready to publish." Do not attach a repository to a write-up without establishing common authorship, and resolve the applicable rules text before publishing rule-dependent claims.
