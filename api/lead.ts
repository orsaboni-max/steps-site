declare const process: { env: { ARBOX_API_KEY?: string } };

/**
 * מקים ליד ב-Arbox מטופס האתר.
 *
 * המפתח של Arbox נשאר בשרת בלבד — הדפדפן אף פעם לא רואה אותו.
 * נקודת קצה ציבורית שכותבת ל-CRM היא יעד לספאם, ולכן יש כאן ולידציה
 * הדוקה ומלכודת-בוטים לפני שנוגעים ב-Arbox בכלל.
 */

const LOCATION_POLEG = 18259;
const SOURCE_WEBSITE = 19357; // "Website" — פעיל אצל סניף פולג
const IL_MOBILE = /^0(5[0-9])\d{7}$/;

/* מאיפה היא הגיעה. נמדד 17/08/26: Arbox שומר "אתר" בלבד, ולכן אף אחד לא
   ידע איזו מודעה הביאה ליד — תנועה מהמודעות לאתר הייתה כסף עיוור.
   Arbox v3 לא נותן שדה חופשי משלנו על הליד, אז זה נוסע בתוך `comment`:
   המזכירה רואה משפט קריא, ו-steps-brain יכול לפרסר את אותה שורה.
   ponytail: comment ולא שדה מותאם. אם/כשיהיה custom field — לעבור אליו. */
const REF_FIELDS = [
  "fbclid", "gclid", "utm_source", "utm_medium",
  "utm_campaign", "utm_content", "utm_term", "landing", "ref",
] as const;
const REF_MAX = 300;

/** משפט ייחוס בטוח מקלט של הדפדפן — נתון של המשתמש, לא סומכים עליו. */
export function referralNote(raw: unknown): string {
  if (!raw || typeof raw !== "object") return "";
  const src = raw as Record<string, unknown>;
  const parts: string[] = [];
  for (const key of REF_FIELDS) {
    const value = src[key];
    if (typeof value !== "string") continue;
    // שורות חדשות ותווי בקרה היו שוברים את השורה שאותה אנחנו מפרסרים בחזרה
    const clean = Array.from(value).filter((ch) => { const c = ch.charCodeAt(0); return c > 31 && c !== 127; }).join("").trim().slice(0, 120);
    if (clean) parts.push(`${key}=${clean}`);
  }
  if (!parts.length) return "";
  return ` | מקור-הגעה: ${parts.join("; ")}`.slice(0, REF_MAX);
}

/* חלון קצב פשוט. בלעדיו סקריפט אחד יכול לפתוח אלפי כרטיסי-ליד מזויפים
   ב-Arbox האמיתי — המזכירות מתקשרות לאוויר, ודוחות ה-₪/ליד נהרסים.
   ponytail: מפה בזיכרון = פר-מופע של הפונקציה, ומתאפס בקירור. עוצר הצפה
   נאיבית, לא תוקף שמסובב IP. אם זה יקרה — Vercel Firewall / KV. */
const HITS = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function tooMany(key: string): boolean {
  const now = Date.now();
  const seen = (HITS.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  seen.push(now);
  HITS.set(key, seen);
  if (HITS.size > 5000) HITS.clear(); // תקרת זיכרון
  return seen.length > MAX_PER_WINDOW;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const ip = String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim() || "unknown";
  if (tooMany(ip)) return res.status(429).json({ error: "too_many_requests" });

  const apiKey = process.env.ARBOX_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "server_not_configured" });

  let body: any = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "bad_json" }); }
  }
  body = body || {};

  // מלכודת בוטים: שדה מוסתר שרק סקריפט אוטומטי ימלא.
  // מחזירים "הצלחה" כדי לא ללמד את הבוט מה נכשל.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return res.status(200).json({ ok: true });
  }

  const name = String(body.name ?? "").trim().replace(/\s+/g, " ");
  const phone = String(body.phone ?? "").replace(/[\s-]/g, "");

  if (name.length < 2 || name.length > 40) return res.status(400).json({ error: "bad_name" });
  if (!IL_MOBILE.test(phone)) return res.status(400).json({ error: "bad_phone" });

  // Arbox דורש first_name; שם משפחה אופציונלי ולכן מפצלים על הרווח הראשון
  const parts = name.split(" ");
  const first_name = parts[0];
  const last_name = parts.length > 1 ? parts.slice(1).join(" ") : null;

  try {
    const r = await fetch("https://arboxserver.arboxapp.com/api/public/v3/leads", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        first_name,
        last_name,
        phone,
        location_id: LOCATION_POLEG,
        source_id: SOURCE_WEBSITE,
        gender: "female",
        comment:
          "הושאר בטופס באתר — ביקשה לקבל את מערכת השעות" + referralNote(body.ref),
      }),
    });

    if (!r.ok) {
      // לא מחזירים את שגיאת Arbox כלשונה לדפדפן
      const detail = await r.text();
      console.error("arbox lead failed", r.status, detail.slice(0, 400));
      return res.status(502).json({ error: "crm_unavailable" });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("arbox lead error", String(e));
    return res.status(502).json({ error: "crm_unavailable" });
  }
}
