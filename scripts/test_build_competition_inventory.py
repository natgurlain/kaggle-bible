from datetime import date
import unittest

from scripts.build_competition_inventory import build_row


class BuildCompetitionInventoryTests(unittest.TestCase):
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
