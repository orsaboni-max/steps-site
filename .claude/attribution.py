# -*- coding: utf-8 -*-
"""דוח ייחוס: מאיפה הגיעו הקונות של STEPS.

מריצים כך (טווח מקסימלי 31 יום, מגבלה של Arbox):
    python .claude/attribution.py 2026-07-05 2026-08-02

המפתח נלקח מ-~/.arbox_key. הדוח קורא בלבד, לא כותב כלום.

שלושה ערוצים נפרדים:
  הרשמה עצמית באתר  = אימון היכרות עם platform=plugin (referrer=PLUGIN)
  וואטסאפ (הבוט)     = platform=site, נקי רק מ-27/09/26 והלאה
  טופס האתר          = ליד עם המקור "Website" (api/lead.ts)
"""
import sys, os, io, json, collections, urllib.request

BASE = "https://arboxserver.arboxapp.com/api/public"


def key():
    p = os.path.expanduser("~/.arbox_key")
    if not os.path.exists(p):
        sys.exit("חסר ~/.arbox_key")
    return io.open(p, encoding="utf-8").read().strip()


def get(path, params=""):
    req = urllib.request.Request(
        BASE + path + ("?" + params if params else ""),
        headers={"api-key": key(), "Accept": "application/json",
                 # Arbox חוסם את סוכן ברירת המחדל של python ומחזיר 403
                 "User-Agent": "Mozilla/5.0 (STEPS attribution report)"},
    )
    return json.loads(urllib.request.urlopen(req, timeout=40).read())


def get_all(path, params=""):
    """כל העמודים של דוח (Arbox מחזיר עד 500 שורות בעמוד)."""
    rows, page = [], 1
    while True:
        d = get(path, "&".join(x for x in (params, f"limit=500&page={page}") if x))
        rows += d.get("data") or []
        if not ((d.get("extra") or {}).get("pagination") or {}).get("next_page_url"):
            return rows
        page += 1


# מ-27/09/26 כל כפתורי ההרשמה באתר נושאים referrer=PLUGIN (commit d04a993),
# ו-SITE נשאר רק לקישורים שהבוט בוואטסאפ שולח. לפני כן גם עמודי הבר באתר
# השתמשו ב-SITE, ולכן "site" לפני התאריך הזה הוא אתר או וואטסאפ — לא ניתן להפריד.
PLUGIN_CUTOFF = "2026-09-27"


def self_booking_channel(r):
    platform = (r.get("platform") or "").strip().lower()
    if platform == "plugin":
        return "אתר (סימון תוסף)"
    if platform == "site":
        if str(r.get("date") or "") >= PLUGIN_CUTOFF:
            return "וואטסאפ (הבוט)"
        return "אתר או וואטסאפ (לפני 27/09)"
    if platform == "system":
        return "המזכירות קבעה"
    return f"אחר ({platform or 'ללא'})"


def is_form_lead(r):
    # טופס האתר (api/lead.ts) פותח ליד עם מקור 19357 = "Website".
    # הרשמה עצמית פותחת ליד עם המקור "אתר " — ערוץ אחר, לא נספר כאן.
    return (r.get("lead_source") or "").strip() == "Website"


def bar(n, top, width=26):
    return "█" * max(1, round(n / top * width)) if n else ""


def main(a, b):
    rows = get("/v3/reports/salesReport", f"fromDate={a}&toDate={b}&limit=500").get("data") or []
    if not rows:
        print("אין מכירות בטווח הזה.")
        return

    trials = [r for r in rows if "היכרות" in str(r.get("item_name") or "")]

    print(f"\n{'='*54}\n  מאיפה הגיעו הקונות · {a} עד {b}\n{'='*54}")
    print(f"  סה\"כ מכירות: {len(rows)}   |   אימוני היכרות: {len(trials)}\n")

    for title, data in (("כל המכירות", rows), ("אימוני היכרות בלבד", trials)):
        if not data:
            continue
        c = collections.Counter((r.get("lead_source") or "— ללא מקור —") for r in data)
        top = max(c.values())
        print(f"  {title}")
        for name, n in c.most_common():
            pct = 100 * n / len(data)
            print(f"    {name:<24} {n:>3}  {pct:4.0f}%  {bar(n, top)}")
        # כמה מזה מיוחס לאתר
        web = sum(v for k, v in c.items() if k and k.strip().lower() in ("website", "אתר"))
        blank = c.get("— ללא מקור —", 0)
        print(f"    {'':-<24}")
        print(f"    {'מיוחס לאתר':<24} {web:>3}  {100*web/len(data):4.0f}%")
        print(f"    {'ללא מקור כלל':<24} {blank:>3}  {100*blank/len(data):4.0f}%\n")

    if trials:
        print("  פירוט אימוני ההיכרות")
        for r in sorted(trials, key=lambda x: str(x.get("date"))):
            print(f"    {r.get('date')}  {str(r.get('full_name'))[:20]:<20} {r.get('lead_source') or '— ריק —'}")
    print()


def bookings_and_form(a, b):
    """הרשמות לאימון היכרות לפי ערוץ + לידים מטופס האתר. שלושה ערוצים נפרדים."""
    booked = get_all("/v3/reports/trialClassesReport", f"fromDate={a}&toDate={b}")
    print(f"{'='*54}\n  הרשמות לאימון היכרות · לפי ערוץ\n{'='*54}")
    print("  (לפי תאריך האימון; Arbox לא מחזיר את רגע ההרשמה)\n")
    if booked:
        c = collections.Counter(self_booking_channel(r) for r in booked)
        came = collections.Counter(self_booking_channel(r) for r in booked
                                   if str(r.get("check_in")).lower() == "yes")
        top = max(c.values())
        print(f"    {'ערוץ':<28} {'נרשמו':>5} {'הגיעו':>6}")
        for name, n in c.most_common():
            print(f"    {name:<28} {n:>5} {came.get(name, 0):>6}  {bar(n, top, 18)}")
        if a < PLUGIN_CUTOFF:
            print(f"    * לפני {PLUGIN_CUTOFF} עמודי הבר באתר השתמשו בסימון של הוואטסאפ —")
            print("      לכן הפרדה נקייה בין אתר לוואטסאפ רק מהתאריך הזה והלאה.")
        web = [r for r in booked if (r.get("platform") or "").strip().lower() == "plugin"]
        if web:
            print("\n  הרשמות עצמיות מהאתר (סימון תוסף)")
            for r in sorted(web, key=lambda x: str(x.get("date"))):
                came_txt = "הגיעה" if str(r.get("check_in")).lower() == "yes" else "—"
                print(f"    {r.get('date')}  {str(r.get('full_name'))[:20]:<20} {str(r.get('class_name'))[:22]:<22} {came_txt}")
    else:
        print("    אין הרשמות בטווח הזה.")

    leads = [r for r in get_all("/v3/reports/leadsInProcessReport")
             if is_form_lead(r) and a <= str(r.get("created_at") or "")[:10] <= b]
    print(f"\n  לידים מטופס האתר: {len(leads)}")
    print("  (רק לידים שעדיין בטיפול; מי שכבר קנתה יוצאת מהרשימה ומופיעה במכירות למעלה)")
    for r in sorted(leads, key=lambda x: str(x.get("created_at"))):
        print(f"    {str(r.get('created_at'))[:10]}  {str(r.get('full_name'))[:20]:<20} {(r.get('lead_status') or '').strip()}")
    print()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("שימוש: python .claude/attribution.py YYYY-MM-DD YYYY-MM-DD  (עד 31 יום)")
    main(sys.argv[1], sys.argv[2])
    bookings_and_form(sys.argv[1], sys.argv[2])
