from datetime import date
import json
import pathlib
import tempfile
import unittest

from scripts.build_competition_inventory import build_row, write_catalog_json


class BuildCompetitionInventoryTests(unittest.TestCase):
    def test_public_catalog_preserves_editorial_review_receipt(self):
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
                "reviewed_by": "Editorial reviewer",
                "reviewed_at": "2026-09-23",
            }
        )
        with tempfile.TemporaryDirectory() as directory:
            output = pathlib.Path(directory) / "catalog.json"
            write_catalog_json(output, [row])
            published = json.loads(output.read_text(encoding="utf-8"))[0]

        self.assertEqual(published["reviewed_by"], "Editorial reviewer")
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


if __name__ == "__main__":
    unittest.main()
