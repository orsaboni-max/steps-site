# -*- coding: utf-8 -*-
"""חלוקת הערוצים בדוח הייחוס: אתר (תוסף) / וואטסאפ (site מ-27/09) / טופס (Website)."""
import os, sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".claude"))
import attribution as A  # noqa: E402


def ch(platform, date):
    return A.self_booking_channel({"platform": platform, "date": date})


def test_plugin_is_website_on_any_date():
    assert ch("plugin", "2026-09-08") == "אתר (סימון תוסף)"
    assert ch("plugin", "2026-10-01") == "אתר (סימון תוסף)"


def test_site_is_whatsapp_only_from_cutoff():
    assert ch("site", "2026-09-27") == "וואטסאפ (הבוט)"
    assert ch("site", "2026-09-26") == "אתר או וואטסאפ (לפני 27/09)"


def test_desk_and_other():
    assert ch("system", "2026-09-27") == "המזכירות קבעה"
    assert ch("api", "2026-09-27") == "אחר (api)"


def test_form_lead_is_website_source_not_self_booking_source():
    assert A.is_form_lead({"lead_source": "Website"})
    assert not A.is_form_lead({"lead_source": "אתר "})
    assert not A.is_form_lead({"lead_source": None})
