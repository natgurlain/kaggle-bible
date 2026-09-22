#!/usr/bin/env python3
"""Build a compact Kaggle competition inventory from Meta Kaggle's CSV export.

The source export contains long Markdown descriptions and embedded newlines.
This script retains only fields needed for discovery and editorial tracking so
the repository does not need to store the full Meta Kaggle table.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import pathlib
import sys
from typing import Iterator

CSV_FIELD_LIMIT = 1024 * 1024 * 1024
SOURCE_DATE_FORMAT = "%m/%d/%Y %H:%M:%S"
OUTPUT_DATE_FORMAT = "%Y-%m-%dT%H:%M:%SZ"

LEVEL_LABELS = {
    "1": "catalog",
    "2": "evidence-map",
    "3": "full-guide",
}

OUTPUT_FIELDS = [
    "id",
    "slug",
    "title",
    "subtitle",
    "competition_url",
    "category",
    "host_name",
    "enabled_at",
    "deadline_at",
    "record_state",
    "metric_abbreviation",
    "metric_name",
    "metric_direction",
    "has_leaderboard",
    "has_public_notebooks",
    "final_leaderboard_verified",
    "reward_type",
    "reward_quantity",
    "num_prizes",
    "max_team_size",
    "total_teams",
    "total_competitors",
    "total_submissions",
    "competition_type_id",
    "completeness_level",
    "completeness_label",
    "editorial_status",
    "priority",
    "work_order",
    "learning_path_stage",
    "guide_slug",
    "reviewed_by",
    "reviewed_at",
    "notes",
]

EDITORIAL_FIELDS = [
    "completeness_level",
    "editorial_status",
    "priority",
    "work_order",
    "learning_path_stage",
    "guide_slug",
    "reviewed_by",
    "reviewed_at",
    "notes",
]
EDITORIAL_STATUSES = {"unstarted", "queued", "in-progress", "blocked", "in-review", "published"}


def source_lines(path: pathlib.Path) -> Iterator[str]:
    """Yield decoded lines while removing rare NUL bytes in source exports."""

    with path.open("rb") as handle:
        for line in handle:
            yield line.replace(b"\x00", b"").decode("utf-8", errors="replace")


def parse_source_date(value: str) -> str:
    if not value:
        return ""
    try:
        parsed = dt.datetime.strptime(value, SOURCE_DATE_FORMAT)
    except ValueError as error:
        raise ValueError(f"Unsupported source date {value!r}") from error
    return parsed.strftime(OUTPUT_DATE_FORMAT)


def value_or_empty(row: dict[str, str], key: str) -> str:
    return (row.get(key) or "").strip()


def record_state(enabled_at: str, deadline_at: str, snapshot_date: dt.date) -> str:
    if deadline_at:
        deadline = dt.datetime.strptime(deadline_at, OUTPUT_DATE_FORMAT).date()
        if deadline < snapshot_date:
            return "closed"
        if enabled_at:
            enabled = dt.datetime.strptime(enabled_at, OUTPUT_DATE_FORMAT).date()
            return "active" if enabled <= snapshot_date else "upcoming"
        return "active"
    return "undated"


def build_row(row: dict[str, str], snapshot_date: dt.date) -> dict[str, str]:
    competition_id = value_or_empty(row, "Id")
    slug = value_or_empty(row, "Slug")
    if not competition_id or not slug:
        raise ValueError("Every competition record needs Id and Slug")

    enabled_at = parse_source_date(value_or_empty(row, "EnabledDate"))
    deadline_at = parse_source_date(value_or_empty(row, "DeadlineDate"))
    direction = "maximize" if value_or_empty(row, "EvaluationAlgorithmIsMax").lower() == "true" else "minimize"

    return {
        "id": competition_id,
        "slug": slug,
        "title": value_or_empty(row, "Title"),
        "subtitle": value_or_empty(row, "Subtitle"),
        "competition_url": f"https://www.kaggle.com/competitions/{slug}",
        "category": value_or_empty(row, "HostSegmentTitle"),
        "host_name": value_or_empty(row, "HostName"),
        "enabled_at": enabled_at,
        "deadline_at": deadline_at,
        "record_state": record_state(enabled_at, deadline_at, snapshot_date),
        "metric_abbreviation": value_or_empty(row, "EvaluationAlgorithmAbbreviation"),
        "metric_name": value_or_empty(row, "EvaluationAlgorithmName"),
        "metric_direction": direction,
        "has_leaderboard": value_or_empty(row, "HasLeaderboard"),
        "has_public_notebooks": value_or_empty(row, "HasKernels"),
        "final_leaderboard_verified": value_or_empty(row, "FinalLeaderboardHasBeenVerified"),
        "reward_type": value_or_empty(row, "RewardType"),
        "reward_quantity": value_or_empty(row, "RewardQuantity"),
        "num_prizes": value_or_empty(row, "NumPrizes"),
        "max_team_size": value_or_empty(row, "MaxTeamSize"),
        "total_teams": value_or_empty(row, "TotalTeams"),
        "total_competitors": value_or_empty(row, "TotalCompetitors"),
        "total_submissions": value_or_empty(row, "TotalSubmissions"),
        "competition_type_id": value_or_empty(row, "CompetitionTypeId"),
        "completeness_level": "1",
        "completeness_label": LEVEL_LABELS["1"],
        "editorial_status": "unstarted",
        "priority": "",
        "work_order": "",
        "learning_path_stage": "",
        "guide_slug": "",
        "reviewed_by": "",
        "reviewed_at": "",
        "notes": "",
    }


def read_editorial_overlay(path: pathlib.Path | None) -> dict[str, dict[str, str]]:
    if path is None:
        return {}
    if not path.is_file():
        raise ValueError(f"Editorial overlay does not exist: {path}")

    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        required = {"id", *EDITORIAL_FIELDS}
        missing = required.difference(reader.fieldnames or [])
        if missing:
            raise ValueError(f"Editorial overlay is missing columns: {sorted(missing)}")
        overlay: dict[str, dict[str, str]] = {}
        for row in reader:
            competition_id = (row.get("id") or "").strip()
            if not competition_id:
                raise ValueError("Every editorial overlay row needs an id")
            if competition_id in overlay:
                raise ValueError(f"Duplicate editorial overlay Id: {competition_id}")
            level = (row.get("completeness_level") or "").strip()
            status = (row.get("editorial_status") or "").strip()
            if level not in LEVEL_LABELS:
                raise ValueError(f"Invalid completeness level for {competition_id}: {level!r}")
            if status not in EDITORIAL_STATUSES:
                raise ValueError(f"Invalid editorial status for {competition_id}: {status!r}")
            work_order = (row.get("work_order") or "").strip()
            if work_order and not work_order.isdigit():
                raise ValueError(f"Invalid work order for {competition_id}: {work_order!r}")
            overlay[competition_id] = {
                field: (row.get(field) or "").strip() for field in EDITORIAL_FIELDS
            }
        return overlay


def read_rows(
    source: pathlib.Path,
    snapshot_date: dt.date,
    editorial_overlay: dict[str, dict[str, str]],
) -> list[dict[str, str]]:
    csv.field_size_limit(CSV_FIELD_LIMIT)
    rows: list[dict[str, str]] = []
    seen_ids: set[str] = set()
    seen_slugs: set[str] = set()
    reader = csv.DictReader(source_lines(source))
    required = {"Id", "Slug", "Title", "EnabledDate", "DeadlineDate"}
    missing = required.difference(reader.fieldnames or [])
    if missing:
        raise ValueError(f"Source is missing required columns: {sorted(missing)}")

    for source_row in reader:
        row = build_row(source_row, snapshot_date)
        if row["id"] in seen_ids:
            raise ValueError(f"Duplicate competition Id: {row['id']}")
        if row["slug"] in seen_slugs:
            raise ValueError(f"Duplicate competition Slug: {row['slug']}")
        if row["id"] in editorial_overlay:
            row.update(editorial_overlay[row["id"]])
            row["completeness_label"] = LEVEL_LABELS[row["completeness_level"]]
        seen_ids.add(row["id"])
        seen_slugs.add(row["slug"])
        rows.append(row)

    rows.sort(key=lambda item: (item["enabled_at"] or "9999", item["id"]))
    return rows


def write_inventory(output: pathlib.Path, rows: list[dict[str, str]]) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=OUTPUT_FIELDS, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=pathlib.Path, required=True, help="Meta Kaggle Competitions.csv")
    parser.add_argument("--output", type=pathlib.Path, required=True, help="Normalized inventory CSV")
    parser.add_argument("--snapshot-date", type=dt.date.fromisoformat, required=True)
    parser.add_argument("--editorial-overlay", type=pathlib.Path, help="Sparse editorial state CSV")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not args.source.is_file():
        print(f"Source does not exist: {args.source}", file=sys.stderr)
        return 2
    editorial_overlay = read_editorial_overlay(args.editorial_overlay)
    rows = read_rows(args.source, args.snapshot_date, editorial_overlay)
    inventory_ids = {row["id"] for row in rows}
    unknown_ids = sorted(set(editorial_overlay).difference(inventory_ids))
    if unknown_ids:
        raise ValueError(f"Editorial overlay refers to unknown competition IDs: {unknown_ids[:5]}")
    write_inventory(args.output, rows)
    print(f"Wrote {len(rows):,} competitions to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
