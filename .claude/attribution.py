# -*- coding: utf-8 -*-
"""דוח ייחוס: מאיפה הגיעו הקונות של STEPS.

מריצים כך (טווח מקסימלי 31 יום, מגבלה של Arbox):
    python .claude/attribution.py 2026-07-05 2026-08-02

המפתח נלקח מ-~/.arbox_key. הדוח קורא בלבד, לא כותב כלום.
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


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("שימוש: python .claude/attribution.py YYYY-MM-DD YYYY-MM-DD  (עד 31 יום)")
    main(sys.argv[1], sys.argv[2])
