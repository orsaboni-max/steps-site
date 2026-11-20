declare const process: { env: { ARBOX_API_KEY?: string; SCHEDULE_BACKEND_URL?: string } };

function israelToday(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
}

// כל החמצה כאן היא קריאה בתשלום מהמכסה שהאתר חולק עם בוט ההודעות, ודף הבית מושך 7 ימים
// בכל כניסה. לכן יום רחוק נשמר שעות: הוא כמעט לא משתנה. היום עצמו נשאר קצר, כי ביטול של היום
// הוא מה שהמבקרת עלולה לראות, וחלון stale-while-revalidate קצר בכוונה: בתנועה דלה הוא לא
// חוסך קריאות, אלא רק מגיש למבקרת הראשונה תשובה ישנה.
// יום ריק לא נשמר לאורך זמן: אולי המערכת של אותו יום עוד לא פורסמה.
export function cacheControlFor(date: string, classCount: number, today = israelToday()): string {
  const browser = "public, max-age=300";
  if (classCount === 0) return browser;
  const daysAway = (Date.parse(date) - Date.parse(today)) / 86_400_000;
  if (daysAway === 0) return `${browser}, s-maxage=1800, stale-while-revalidate=300`;
  if (daysAway === 1) return `${browser}, s-maxage=7200, stale-while-revalidate=600`;
  return `${browser}, s-maxage=21600, stale-while-revalidate=3600`;
}

// קודם שואלים את הבקורת של STEPS (קריאה חינמית מהסטודיו), ורק אם אין תשובה תקינה עוברים לקריאה בתשלום של Arbox.
// כל דבר שאינו 200 עם מערך לא ריק ותקין = "אין תשובה". מערך ריק נחשב תשובה רק עם הסימון המפורש
// X-Schedule-Trusted-Empty: 1 (הבקורת עצמה ראתה יום ריק בתוך שבוע עם שיעורים, למשל שבת סגורה); בלעדיו יום ריק לא
// ממציאים מהצד הזה וההכרעה נשארת אצל Arbox.
export const BACKEND_TIMEOUT_MS = 3000;
const DEFAULT_BACKEND = "https://steps-backend-production.up.railway.app";

function backendBase(): string {
  return (process.env.SCHEDULE_BACKEND_URL || DEFAULT_BACKEND).trim().replace(/\/+$/, "");
}

function validRow(r: any, date: string): boolean {
  return r !== null && typeof r === "object"
    && r.schedule_id !== null && r.schedule_id !== undefined && r.schedule_id !== ""
    && typeof r.date === "string" && r.date.slice(0, 10) === date
    && typeof r.session_name === "string" && r.session_name !== ""
    && typeof r.start_time === "string" && r.start_time !== ""
    && (r.end_time === null || r.end_time === undefined || typeof r.end_time === "string")
    && typeof r.location_name === "string" && r.location_name.includes("פולג");
}

export async function fromBackend(date: string): Promise<any[] | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), BACKEND_TIMEOUT_MS);
  try {
    const response = await fetch(`${backendBase()}/api/site/schedule?date=${date}`, {
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
    });
    if (response.status !== 200) return null;
    const body = await response.json();
    if (!Array.isArray(body)) return null;
    if (body.length === 0) return response.headers?.get?.("x-schedule-trusted-empty") === "1" ? [] : null;
    if (!body.every((r: any) => validRow(r, date))) return null;
    return body.map((s: any) => ({
      schedule_id: s.schedule_id,
      session_name: s.session_name,
      start_time: s.start_time,
      end_time: s.end_time ?? null,
      coach: typeof s.coach === "string" ? s.coach : "",
      location_name: s.location_name,
      registration_link: "",   // לא חלק מחוזה הבקורת; המפתח נשאר כדי שצורת התשובה לדפים לא תשתנה (אף דף לא קורא אותו)
    }));
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req: any, res: any) {
  // התאריך נכנס לתוך כתובת ה-API של Arbox, ולכן חייב ולידציה.
  // בלעדיה `?date=2026-08-02&to_date=2030-01-01` הזריק פרמטר משלו לקריאה
  // ומשך שנה שלמה של שיעורים בבקשה אחת — על המפתח והמכסה של הסטודיו.
  const raw_date = String(req.query.date ?? "");
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw_date)
    ? raw_date
    : israelToday();

  const fromFreeDoor = await fromBackend(date);
  if (fromFreeDoor !== null) {
    res.setHeader("Cache-Control", cacheControlFor(date, fromFreeDoor.length));
    res.setHeader("X-Schedule-Source", "backend");
    return res.status(200).json(fromFreeDoor);
  }

  const apiKey = process.env.ARBOX_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "No API key" });
  }
  const apiUrl = `https://arboxserver.arboxapp.com/api/public/v3/schedule?from_date=${date}&to_date=${date}`;

  try {
    const response = await fetch(apiUrl, {
      headers: { "api-key": apiKey },
    });
    // סירוב של Arbox (מכסה, תקלה) בלי הבדיקה הזו נראה כיום ריק, והיה נשמר ומציג "אין שיעורים".
    if (!response.ok) throw new Error(`arbox status ${response.status}`);
    const raw = await response.json();
    const items: any[] = raw?.data ?? (Array.isArray(raw) ? raw : []);

    const filtered = items
      .filter((s: any) => s.location_name?.includes("פולג"))
      .sort((a: any, b: any) => a.start_time.localeCompare(b.start_time))
      .map((s: any) => ({
        schedule_id: s.schedule_id,
        session_name: s.session_name,
        start_time: s.start_time,
        end_time: s.end_time,
        coach: s.staff_member?.name ?? "",
        location_name: s.location_name,
        // Arbox מחזיר http:// — משודרג ל-https כדי לא לשלוח מדף מאובטח לקישור לא מאובטח
        registration_link: (s.registration_link ?? "").replace(/^http:\/\//, "https://"),
      }));

    res.setHeader("Cache-Control", cacheControlFor(date, filtered.length));
    res.setHeader("X-Schedule-Source", "arbox");
    return res.status(200).json(filtered);
  } catch (e) {
    console.error("arbox schedule error", String(e));
    return res.status(502).json({ error: "schedule_unavailable" });
  }
}
