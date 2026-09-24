from datetime import date
import json
import pathlib
import tempfile
import unittest

from scripts.build_competition_inventory import (
    EDITORIAL_FIELDS,
    build_row,
    read_existing_inventory,
    write_catalog_json,
    write_inventory,
)


class BuildCompetitionInventoryTests(unittest.TestCase):
    def test_public_catalog_preserves_evidence_review_receipt(self):
        row = build_row(
            {
                "Id": "9120",
                "Slug": "home-credit-default-risk",
                "Title": "Home Credit Default Risk",
                "EnabledDate": "",
                "DeadlineDate": "",
            },
            date(2026, 9, 23),
        )
        row.update(
            {
                "completeness_level": "2",
                "completeness_label": "evidence-map",
                "editorial_status": "published",
                "guide_slug": "home-credit-default-risk",
                "reviewed_by": "GPT-6 Luna Max",
                "reviewed_at": "2026-09-23",
            }
        )
        with tempfile.TemporaryDirectory() as directory:
            output = pathlib.Path(directory) / "catalog.json"
            write_catalog_json(output, [row])
            published = json.loads(output.read_text(encoding="utf-8"))[0]

        self.assertEqual(published["reviewed_by"], "GPT-6 Luna Max")
        self.assertEqual(published["reviewed_at"], "2026-09-23")

    def test_missing_source_title_falls_back_to_stable_slug(self):
        row = build_row(
            {
                "Id": "123",
                "Slug": "untitled-competition",
                "Title": "",
                "EnabledDate": "",
                "DeadlineDate": "",
            },
            date(2026, 9, 23),
        )

        self.assertEqual(row["title"], "untitled-competition")

    def test_overlay_refresh_uses_tracked_inventory_and_resets_sparse_rows(self):
        home_credit = build_row(
            {"Id": "9120", "Slug": "home-credit-default-risk", "Title": "Home Credit", "EnabledDate": "", "DeadlineDate": ""},
            date(2026, 9, 23),
        )
        m5 = build_row(
            {"Id": "18599", "Slug": "m5-forecasting-accuracy", "Title": "M5", "EnabledDate": "", "DeadlineDate": ""},
            date(2026, 9, 23),
        )
        home_credit.update({"completeness_level": "3", "editorial_status": "published", "guide_slug": "stale-guide"})
        overlay = {
            "9120": {
                "completeness_level": "2",
                "editorial_status": "published",
                "priority": "path",
                "work_order": "6",
                "learning_path_stage": "intermediate",
                "guide_slug": "home-credit-default-risk",
                "reviewed_by": "GPT-6 Luna Max",
                "reviewed_at": "2026-09-23",
                "notes": "Pilot evidence map",
            }
        }
        self.assertEqual(set(overlay["9120"]), set(EDITORIAL_FIELDS))

        with tempfile.TemporaryDirectory() as directory:
            inventory = pathlib.Path(directory) / "inventory.csv"
            write_inventory(inventory, [home_credit, m5])
            refreshed = read_existing_inventory(inventory, overlay)

        self.assertEqual(refreshed[0]["completeness_level"], "2")
        self.assertEqual(refreshed[0]["guide_slug"], "home-credit-default-risk")
        self.assertEqual(refreshed[1]["completeness_level"], "1")
        self.assertEqual(refreshed[1]["editorial_status"], "unstarted")


if __name__ == "__main__":
    unittest.main()
