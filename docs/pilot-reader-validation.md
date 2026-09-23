# Local acceptance checklist

This checklist replaces the reader-session study. Acceptance is self-contained: it uses the checked-in content, project scripts, a local build, and the GPT-6 Luna Max Codex subagent review. No recruited participant, human sign-off, hosted preview, paid service, or third-party test service is required. Do not fabricate user-study outcomes or describe these checks as proof of user comprehension.

## Repeatable checks

Run from the exact ticket or epic commit being accepted. Record the commit SHA and complete outputs in the PR or epic issue.

```sh
pnpm test:content
python3 -m unittest scripts/test_build_competition_inventory.py
pnpm check-content
ASTRO_TELEMETRY_DISABLED=1 pnpm check
ASTRO_TELEMETRY_DISABLED=1 pnpm build
CHECK_BUILT_CONTENT=1 pnpm check-content
```

All commands must pass. The built-content check verifies that only published records/routes are emitted, catalog guide links resolve to the matching competition identity, references are valid, and drafts remain private. If a check finds an issue, fix it and rerun the complete sequence on the new head.

## Local browser acceptance

Serve the built site locally with `pnpm preview`; do not use a hosted preview. Check the catalog and each published pilot route at 1280 × 900 and 390 × 844 CSS pixels at 100% zoom.

- Search and filters return the expected pilot entries, preserve filter state across reload, and do not reveal unpublished content.
- Each published catalog card opens the guide whose competition ID and slug match the card. Direct guide URLs load after refresh.
- Follow at least one material claim reference to its evidence card, then open the cited source. Confirm the recorded locator is precise enough to find the cited passage; report inaccessible sources as limitations, not as a successful trace.
- Follow each practice evidence link to the matching claim and guide.
- Use keyboard-only navigation through search, filters, guide links, claim references, and source links. Focus stays visible and ordered; no keyboard trap occurs.
- At both widths, controls and content remain usable without page-level horizontal overflow, clipping, or overlap.
- Confirm no unpublished guide or practice has a public detail route.

Record outcomes as pass/fail with page, viewport, and the exact local commit. Fix release-blocking failures and repeat the affected checks. The GPT-6 Luna Max subagent reviews the exact final PR head; any later commit requires a fresh review.

## Acceptance receipt

| Commit SHA | Automated checks | Local routes and viewports | Keyboard and evidence trace | GPT-6 Luna Max exact-head verdict |
| --- | --- | --- | --- | --- |
| Fill only after running the checks; no simulated results. | Pending | Pending | Pending | Pending |
