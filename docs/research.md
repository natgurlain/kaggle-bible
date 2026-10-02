# Research notes and initial selection queue

Historical research date: 2026-09-22. The 2026-10-02 queue and IEEE-CIS audit below supersede the original shortlist ordering; the older notes remain dated evidence, not current publication/readiness claims. These notes support the design proposal; they are not published competition guides. Repository inspection found an empty Git worktree with no application or content to migrate.

## Tooling checked

| Primary source | Verified capability | Design implication |
| --- | --- | --- |
| [Astro content collections](https://docs.astro.build/en/guides/content-collections/) | Structured local content, collection schemas, and static page generation | Use build-time collections; keep source content portable |
| [Pagefind documentation](https://pagefind.app/docs/) and [filters](https://pagefind.app/docs/filtering/) | Indexes built HTML and supports filter metadata | Good starting point for text search and facets; solution-level resource joins need project logic |
| [Official Kaggle CLI](https://github.com/Kaggle/kaggle-cli) | Documents competition listing, notebook access, and browsing/reading discussions | Investigate read-only discovery helpers later, after checking the installed version and authentication requirements |
| [Meta Kaggle](https://www.kaggle.com/datasets/kaggle/meta-kaggle) | Search-index description identifies official public competition/community metadata | Candidate catalog discovery; dataset contents and schemas were not downloaded or audited in this task |

The Astro/Pagefind recommendation is a design judgment based on this project's static, editorial content. No dependencies were installed and no performance claims were benchmarked. The old `Kaggle/kaggle-api` repository URL redirected to `Kaggle/kaggle-cli` during research; implementation should inspect current documentation rather than assume older command coverage.

## Selection method

Eligibility comes before ranking: historical competition studies must be closed, its official task/metric must be verifiable, and at least one substantive primary solution source must be readable. Before an MVP guide is commissioned, confirm a second independently authored solution and resolve enough provenance to compare them. A rank claimed in a repository remains an author report until checked against official final standings.

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

## Getting Started teaching exception (2026-09-30)

Titanic, House Prices, NLP Getting Started and Digit Recognizer are selected as ongoing educational tasks rather than historical final-leaderboard case studies. They still require a verifiable official task and metric and two independently authored primary approaches. Keep end_date null, final ranks unknown and author tutorials distinct from winning solutions. Register precise validation gaps; an executed original teaching fixture does not reproduce those authors or the competition. Current data access and participation rules must be checked by the participant before downloading or submitting.


## Current delivery queue and IEEE-CIS qualification (2026-10-02)

This is planning evidence for [#76](https://github.com/natgurlain/kaggle-bible/issues/76), not a new guide, execution receipt, or publication-status change. The six-guide library and existing teaching fixtures do not establish actual-data project completion. Integrate this planning work after the [project contract #64](https://github.com/natgurlain/kaggle-bible/issues/64); implementation and publication retain the exact-head GPT-6 Luna Max gate in the current delivery/editorial workflows.

### Ordered queue

Finish existing learner projects before expanding the archive. At most **three actual-data ports may be active at once**; research, qualification, and a queue entry do not consume or assign a port. The delivery coordinator must record an execution owner and available slot in the linked issue before starting a port, and release the slot when work finishes or becomes access-blocked. Owners below are explicitly unassigned because this document does not establish lasting ownership. Issue progress and durable receipts, rather than this dated planning snapshot, determine actual readiness.

| Order | Project / missing lesson | Planning readiness and blocker | Owner / next action |
| --- | --- | --- | --- |
| 1 | [Titanic #67](https://github.com/natgurlain/kaggle-bible/issues/67): first complete actual-data learning loop | Planned; needs #64 contract, authorized inputs, and a successful durable actual-data receipt | Unassigned; finish access/setup, fixed split, baseline/change, diagnostics and receipt before recommending verified execution |
| 2 | [House Prices #70](https://github.com/natgurlain/kaggle-bible/issues/70): regression and residual diagnosis | Queued behind flagship pattern; actual-data execution not established here | Unassigned; reuse the reviewed Titanic pattern, then compare under a fixed split and inspect residuals |
| 3 | [Disaster Tweets #71](https://github.com/natgurlain/kaggle-bible/issues/71): text representations and class errors | Queued behind flagship pattern; actual-data execution not established here | Unassigned; compare representations under the same split and retain false-positive/negative diagnostics |
| 4 | [Scoped M5 #72](https://github.com/natgurlain/kaggle-bible/issues/72): forecast-time information and bounded hierarchy | Waiting for House Prices; authorized inputs and bounded run not established | Unassigned; specify the slice, holdout and metric scope, then record actual runtime and limits |
| 5 | [Digit Recognizer / Home Credit #73](https://github.com/natgurlain/kaggle-bible/issues/73): preserve vision and relational lessons | Existing-guide/fixture maintenance; no new full-data port commissioned by this row | Unassigned; preserve distinct roles and expose resource/access gaps instead of claiming full execution |
| 6 | [IEEE-CIS #76](https://github.com/natgurlain/kaggle-bible/issues/76): entity reconstruction and temporal feature availability | **Blocked qualification** on readable official task/metric/rules/access and source attribution gaps below; no implementation slot | Unassigned; inspect official originals, resolve provenance and freeze a bounded experiment plan before requesting a port |
| 7 | Porto Seguro: possible imbalance/metric comparison | Deferred replacement lead; official evaluation/rules bodies also unreadable in this audit; no qualified replacement | Unassigned; only revisit if it can fill the required lesson with inspectable primary evidence |

No numerical rubric score or reader-demand claim is assigned. Priorities 1–5 finish existing product commitments; IEEE addresses a distinct entity/time lesson if qualified. Catalog size alone never raises a candidate's priority. Record actual voluntary reader demand separately when evidence exists.

### IEEE-CIS source-access receipt

Access date: **2026-10-02**. No dataset, model, or solution code was executed or downloaded. The original NVIDIA article body and original author repository README were inspected. Search excerpts were used only to discover leads. The NVIDIA page's separately marked AI-generated summary was excluded from evidence.

| Official original attempted | Access observation | Disposition |
| --- | --- | --- |
| [Task description](https://www.kaggle.com/competitions/ieee-fraud-detection/overview/description) | Page title returned, zero readable body lines | Official target/task unverified in this audit |
| [Evaluation](https://www.kaggle.com/competitions/ieee-fraud-detection/overview/evaluation) | Zero readable body lines; legacy `/c/` route also attempted | ROC-AUC is participant-reported below, not newly verified official metric evidence |
| [Data/access](https://www.kaggle.com/competitions/ieee-fraud-detection/data) | Zero readable body lines; legacy `/c/` route also attempted | Current download eligibility, agreement steps and data-use conditions unknown; no rules acceptance or access claim |
| [Rules](https://www.kaggle.com/competitions/ieee-fraud-detection/rules) | Zero readable body lines; search exposed text but direct original and legacy route did not | Full applicable rules, external-data permission and redistribution conditions unverified |
| [Final leaderboard](https://www.kaggle.com/competitions/ieee-fraud-detection/leaderboard) | Zero readable body lines | Final standings and author-to-team matches unverified |

These observations describe the available reader, not proof that Kaggle removed or globally blocked the pages. A future auditor must inspect readable originals and record exact sections, access date and relevant terms; titles, search snippets and participant accounts cannot close these gates.

### Two independent primary solution reports inspected

**Report A — Carol McDonald and Chris Deotte**, [NVIDIA Technical Blog, 2021-01-26](https://developer.nvidia.com/blog/leveraging-machine-learning-to-detect-fraud-tips-to-developing-a-winning-kaggle-solution/). Deotte is a named participant/coauthor. Inspected locators: `Evaluating the model` (time-before-validation advice), `Feature selection` (first-month/last-month screen), `New features from aggregation encoding` (UID from card/address and day-minus-D1), and `Final model training and predictions submission` (month-grouped GroupKFold and ensemble/postprocessing). The article reports first place; no official row was matched. Its validation prose does not by itself prove every fold trains only on the past: exact fold indices remain to inspect. Entity identity is a reconstructed hypothesis, not verified customer identity. Its `Conclusion` describes accelerated feature preparation, not a measured learner exercise or complete-system budget. End-to-end hardware, memory, runtime and cost remain unknown here. No score or speed claim is adopted.

**Report B — repository author `white-bird`**, [original README](https://github.com/white-bird/kaggle-ieee), pinned [README revision 116030bcd992bc0ffcfe74035f302be5a31a1f2c](https://github.com/white-bird/kaggle-ieee/blob/116030bcd992bc0ffcfe74035f302be5a31a1f2c/README.md). The pinned body was read through GitHub's public contents API after the pinned web view failed. Locators: numbered keys 1–4, `LB 9590-9600`, and `LB 9600-9630`. The author describes entity-like keys, two-stage modeling and combining train/test during grouping. Numerical improvements remain author reports, not isolated gains or reproduced results. Holdout indices, fold construction, resource profile and final rank are unknown. The linked Kaggle blend notebook was not inspected. Grouping across the full test set is competition-time context, not proof of feature availability for future transactions.

These are independently presented participant accounts: different displayed authors, repositories and system descriptions, with no displayed common authorship. This supports provisional independence; Report B's real-name/team attribution still needs confirmation. It does not establish official placement or code ownership for the whole team. The previously listed [jxzly repository](https://github.com/jxzly/Kaggle-IEEE-CIS-Fraud-Detection-2019) was also readable, but its short run instructions do not establish a second detailed write-up or a connection to a named team; its “10th” description remains unverified attribution. The [linked Kaggle write-up](https://www.kaggle.com/competitions/ieee-fraud-detection/writeups/m5-10th-solution-and-code) returned no readable body.

### Decision, replacement and bounded next experiment

**Decision: blocked, not rejected and not ready-to-draft.** Two substantive original reports provide useful research material, but the official-source eligibility gate is incomplete. Keep IEEE as future study and retain the gaps; do not publish a guide or commence an actual-data port merely because two reports are readable.

Apply the existing rubric conservatively: source inspectability is partial, entity/time reasoning would add a distinct lesson, modest-compute suitability is unknown, and measured reader demand is absent. No 100-point score is justified. Porto Seguro is a deferred replacement lead for validation/imbalance coverage, not a like-for-like entity/time replacement: its [official evaluation](https://www.kaggle.com/competitions/porto-seguro-safe-driver-prediction/overview/evaluation) and [rules](https://www.kaggle.com/competitions/porto-seguro-safe-driver-prediction/rules) also returned zero readable body lines. It has not passed official or two-source qualification in this audit. Replacing IEEE now would merely hide the same access gate.

After official qualification and #64 integration, propose one bounded training-data exercise: fix a chronological holdout and a deterministic bounded input selection; compare a baseline with one past-only entity aggregate under identical settings; log holdout entity overlap and feature availability at prediction time. Inspect actual source code before specifying the aggregate, never compute it using future rows or holdout labels, and document missing true customer IDs and label-delay information. Freeze row/time limits, seeds, split indices, environment and metric definition before running. Capture actual metrics, diagnostics and measured resource scope; deterioration is a valid result. This is an editorial experiment proposal, not a ready project, proven transfer claim, historical reproduction or authorization to acquire data.
