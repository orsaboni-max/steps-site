// בדיקות למסלול החינמי של לוח השיעורים: קודם הבקורת של STEPS, ורק בלי תשובה תקינה הקריאה בתשלום של Arbox.
// הרצה:  node --test api/schedule-backend.test.mjs
// כל הבדיקות עם fetch מזויף. אין קריאה אמיתית לשום מקום.
import test, { mock } from "node:test";
import assert from "node:assert/strict";
import handler, { BACKEND_TIMEOUT_MS } from "./schedule.ts";

const DEFAULT_URL = "https://steps-backend-production.up.railway.app";
const DATE = "2026-11-17";

const doorRow = (over = {}) => ({
  schedule_id: 7, date: DATE, session_name: "GYM", start_time: "08:00:00", end_time: "09:00:00",
  coach: "מאמנת", location_name: "סניף פולג", ...over,
});
const arboxRow = () => ({
  schedule_id: 9, session_name: "PILATES", start_time: "10:00", end_time: "11:00",
  staff_member: { name: "ארבוקס" }, location_name: "פולג", registration_link: "http://x.arboxapp.com/group",
});

// fetch מזויף שמנתב לפי כתובת: backend ו-arbox נספרים בנפרד.
function setup({ backend, arbox }) {
  const calls = { backend: [], arbox: [] };
  const realFetch = globalThis.fetch;
  const realKey = process.env.ARBOX_API_KEY;
  const realUrl = process.env.SCHEDULE_BACKEND_URL;
  process.env.ARBOX_API_KEY = "test";
  delete process.env.SCHEDULE_BACKEND_URL;
  globalThis.fetch = async (url, init) => {
    if (String(url).startsWith(DEFAULT_URL) || String(url).includes("/api/site/schedule")) {
      calls.backend.push({ url: String(url), init });
      return backend(url, init);
    }
    calls.arbox.push({ url: String(url), init });
    return arbox(url, init);
  };
  const restore = () => {
    globalThis.fetch = realFetch;
    if (realKey === undefined) delete process.env.ARBOX_API_KEY; else process.env.ARBOX_API_KEY = realKey;
    if (realUrl === undefined) delete process.env.SCHEDULE_BACKEND_URL; else process.env.SCHEDULE_BACKEND_URL = realUrl;
  };
  return { calls, restore };
}

async function run(query, fakes) {
  const env = setup(fakes);
  const out = { headers: {} };
  const res = {
    setHeader(k, v) { out.headers[k] = v; },
    status(c) { out.status = c; return this; },
    json(b) { out.body = b; return this; },
  };
  try {
    await handler({ query }, res);
  } finally {
    env.restore();
  }
  out.calls = env.calls;
  return out;
}

const ok = (body) => async () => ({ ok: true, status: 200, json: async () => body });
const arboxOk = ok({ data: [arboxRow()] });
const boom = () => { throw new Error("arbox must not be called"); };

test("הבקורת ענתה תקין: משרתים ממנה, אפס קריאות בתשלום, והכותרת אומרת מי ענה", async () => {
  const out = await run({ date: DATE }, { backend: ok([doorRow()]), arbox: boom });
  assert.equal(out.status, 200);
  assert.equal(out.headers["X-Schedule-Source"], "backend");
  assert.equal(out.calls.arbox.length, 0);
  assert.equal(out.calls.backend.length, 1);
  assert.equal(out.calls.backend[0].url, `${DEFAULT_URL}/api/site/schedule?date=${DATE}`);
  assert.deepEqual(Object.keys(out.body[0]).sort(),
    ["coach", "end_time", "location_name", "registration_link", "schedule_id", "session_name", "start_time"]);
  assert.equal(out.body[0].coach, "מאמנת");
  assert.match(out.headers["Cache-Control"], /s-maxage=/);         // אותה מדיניות שמירה כמו במסלול של Arbox
});

test("כתובת הבקורת נקראת מהסביבה, ובלעדיה ברירת המחדל בקוד", async () => {
  const env = setup({ backend: ok([doorRow()]), arbox: boom });
  process.env.SCHEDULE_BACKEND_URL = "https://staging.example.test/";
  const res = { setHeader() {}, status() { return this; }, json() { return this; } };
  await handler({ query: { date: DATE } }, res);
  env.restore();
  assert.equal(env.calls.backend[0].url, `https://staging.example.test/api/site/schedule?date=${DATE}`);
});

test("הבקורת ב-503 (כבויה או הדלת לא עונה): חוזרים בדיוק לקריאה של Arbox", async () => {
  const out = await run({ date: DATE }, { backend: async () => ({ ok: false, status: 503, json: async () => ({ error: "not_proven" }) }), arbox: arboxOk });
  assert.equal(out.status, 200);
  assert.equal(out.headers["X-Schedule-Source"], "arbox");
  assert.equal(out.calls.arbox.length, 1);
  assert.equal(out.body[0].schedule_id, 9);
  assert.equal(out.body[0].registration_link, "https://x.arboxapp.com/group");
  assert.match(out.calls.arbox[0].url, /arboxserver\.arboxapp\.com\/api\/public\/v3\/schedule\?from_date=2026-11-17&to_date=2026-11-17$/);
  assert.equal(out.calls.arbox[0].init.headers["api-key"], "test");
});

test("שגיאת רשת בבקורת: נופלים ל-Arbox", async () => {
  const out = await run({ date: DATE }, { backend: async () => { throw new TypeError("fetch failed"); }, arbox: arboxOk });
  assert.equal(out.status, 200);
  assert.equal(out.headers["X-Schedule-Source"], "arbox");
});

test("הבקורת לא עונה תוך 3 שניות: מבטלים וממשיכים ל-Arbox", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const hang = (url, init) => new Promise((_, reject) => {
      init.signal.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
    });
    const pending = run({ date: DATE }, { backend: hang, arbox: arboxOk });
    await new Promise((r) => setImmediate(r));
    mock.timers.tick(BACKEND_TIMEOUT_MS - 1);                       // עוד לא נגמר הזמן: עדיין לא נגענו ב-Arbox
    await new Promise((r) => setImmediate(r));
    mock.timers.tick(1);
    const out = await pending;
    assert.equal(BACKEND_TIMEOUT_MS, 3000);
    assert.equal(out.status, 200);
    assert.equal(out.headers["X-Schedule-Source"], "arbox");
    assert.equal(out.calls.arbox.length, 1);
  } finally {
    mock.timers.reset();
  }
});

for (const [name, body] of [
  ["לא מערך (אובייקט)", { data: [doorRow()] }],
  ["null", null],
  ["מחרוזת", "ok"],
  ["שורה בלי מזהה", [doorRow({ schedule_id: null })]],
  ["שורה בלי שם שיעור", [doorRow({ session_name: "" })]],
  ["שורה בלי שעה", [doorRow({ start_time: undefined })]],
  ["שורה לא אובייקט", [doorRow(), "garbage"]],
  ["סניף אחר", [doorRow({ location_name: "קריית השרון" })]],
  ["שורה בלי תאריך", [doorRow({ date: undefined })]],
  ["שורה של יום אחר", [doorRow({ date: "2026-11-18" })]],
  ["שעת סיום מסוג לא נכון", [doorRow({ end_time: 900 })]],
]) {
  test(`תשובה פגומה (${name}): נופלים ל-Arbox ולא מציגים אותה`, async () => {
    const out = await run({ date: DATE }, { backend: ok(body), arbox: arboxOk });
    assert.equal(out.headers["X-Schedule-Source"], "arbox");
    assert.equal(out.body[0].schedule_id, 9);
  });
}

test("JSON שבור מהבקורת: נופלים ל-Arbox", async () => {
  const out = await run({ date: DATE }, {
    backend: async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError("bad json"); } }),
    arbox: arboxOk,
  });
  assert.equal(out.headers["X-Schedule-Source"], "arbox");
});

const trustedEmpty = async () => ({
  ok: true, status: 200, headers: { get: (k) => (k.toLowerCase() === "x-schedule-trusted-empty" ? "1" : null) },
  json: async () => [],
});

test("יום ריק מהימן מהבקורת (שבת סגורה): ריק בלי קריאה בתשלום, ושמירה קצרה כמו כל יום ריק", async () => {
  const out = await run({ date: DATE }, { backend: trustedEmpty, arbox: boom });
  assert.equal(out.status, 200);
  assert.deepEqual(out.body, []);
  assert.equal(out.calls.arbox.length, 0);
  assert.equal(out.headers["X-Schedule-Source"], "backend");
  assert.equal(out.headers["Cache-Control"], "public, max-age=300");
});

test("סימון יום-ריק עם שורות או עם ערך אחר: לא מהימן, נופלים ל-Arbox", async () => {
  const withRows = async () => ({ ok: true, status: 200, headers: { get: () => "1" }, json: async () => [doorRow()] });
  const out1 = await run({ date: DATE }, { backend: withRows, arbox: arboxOk });
  assert.equal(out1.headers["X-Schedule-Source"], "backend");        // שורות תקינות משרתים; הסימון לא משנה
  const wrongFlag = async () => ({ ok: true, status: 200, headers: { get: () => "0" }, json: async () => [] });
  const out2 = await run({ date: DATE }, { backend: wrongFlag, arbox: arboxOk });
  assert.equal(out2.headers["X-Schedule-Source"], "arbox");
});

test("צורת התשובה לדפים זהה משני המקורות: אותם 7 מפתחות, registration_link ריק מהבקורת", async () => {
  const a = await run({ date: DATE }, { backend: ok([doorRow()]), arbox: boom });
  const b = await run({ date: DATE }, { backend: async () => ({ ok: false, status: 503, json: async () => ({}) }), arbox: arboxOk });
  assert.deepEqual(Object.keys(a.body[0]).sort(), Object.keys(b.body[0]).sort());
  assert.equal(a.body[0].registration_link, "");
});

test("מערך ריק מהבקורת = אין תשובה, ולכן Arbox מכריע (לא ממציאים יום ריק)", async () => {
  const out = await run({ date: DATE }, { backend: ok([]), arbox: arboxOk });
  assert.equal(out.headers["X-Schedule-Source"], "arbox");
  assert.equal(out.calls.arbox.length, 1);
  assert.equal(out.body.length, 1);
});

test("יום באמת ריק אצל Arbox נשאר ריק וקצר-שמירה, כמו היום", async () => {
  const out = await run({ date: DATE }, { backend: ok([]), arbox: ok({ data: [] }) });
  assert.equal(out.status, 200);
  assert.deepEqual(out.body, []);
  assert.equal(out.headers["Cache-Control"], "public, max-age=300");
});

test("גם הבקורת וגם Arbox נופלים: 502 בלי שמירה, לא יום ריק", async () => {
  const out = await run({ date: DATE }, {
    backend: async () => ({ ok: false, status: 503, json: async () => ({}) }),
    arbox: async () => ({ ok: false, status: 429, json: async () => ({}) }),
  });
  assert.equal(out.status, 502);
  assert.equal(out.headers["Cache-Control"], undefined);
});

test("ולידציית תאריך: פורמט לא תקין הופך להיום, ושום פרמטר מוזרק לא מגיע לבקורת או ל-Arbox", async () => {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
  for (const bad of ["2026-08-02&to_date=2030-01-01", "../x", "tomorrow", "2026-8-2", "", "20261117", "2026-11-17\n"]) {
    const out = await run({ date: bad }, { backend: async () => ({ ok: false, status: 503, json: async () => ({}) }), arbox: arboxOk });
    assert.equal(out.calls.backend[0].url, `${DEFAULT_URL}/api/site/schedule?date=${today}`, bad);
    assert.match(out.calls.arbox[0].url, new RegExp(`from_date=${today}&to_date=${today}$`), bad);
  }
});

test("בלי מפתח Arbox ובלי תשובה מהבקורת: 500 כמו קודם. עם תשובה מהבקורת המפתח לא נחוץ", async () => {
  const env = setup({ backend: async () => ({ ok: false, status: 503, json: async () => ({}) }), arbox: boom });
  delete process.env.ARBOX_API_KEY;
  const out = {};
  const res = { setHeader() {}, status(c) { out.status = c; return this; }, json(b) { out.body = b; return this; } };
  await handler({ query: { date: DATE } }, res);
  assert.equal(out.status, 500);
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => [doorRow()] });
  await handler({ query: { date: DATE } }, res);
  env.restore();
  assert.equal(out.status, 200);
});
