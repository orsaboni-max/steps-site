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

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

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
        comment: "הושאר בטופס באתר — ביקשה לקבל את מערכת השעות",
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
