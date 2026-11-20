// בדיקה לזמני השמירה של לוח השיעורים. הרצה:  node --test api/schedule.test.mjs
// המטרה: פחות קריאות בתשלום ל-Arbox, בלי להחזיק ביטול של היום זמן רב ובלי לשמור שגיאה כיום ריק.
import test from "node:test";
import assert from "node:assert/strict";
import handler, { cacheControlFor } from "./schedule.ts";

const TODAY = "2026-11-04";

test("היום נשמר 30 דקות, מחר שעתיים, יום רחוק 6 שעות", () => {
  assert.match(cacheControlFor("2026-11-04", 20, TODAY), /s-maxage=1800,/);
  assert.match(cacheControlFor("2026-11-05", 20, TODAY), /s-maxage=7200,/);
  assert.match(cacheControlFor("2026-11-06", 20, TODAY), /s-maxage=21600,/);
  assert.match(cacheControlFor("2026-11-17", 20, TODAY), /s-maxage=21600,/);
});

test("הדפדפן נשאר על 5 דקות בכל מצב", () => {
  for (const date of ["2026-11-04", "2026-11-05", "2026-11-17"]) {
    assert.match(cacheControlFor(date, 20, TODAY), /^public, max-age=300/);
  }
});

test("יום ריק לא נשמר לאורך זמן", () => {
  assert.equal(cacheControlFor("2026-11-17", 0, TODAY), "public, max-age=300");
});

test("חציית חודש נספרת נכון", () => {
  assert.match(cacheControlFor("2026-12-01", 20, "2026-11-30"), /s-maxage=7200,/);
});

function run(fetchResult) {
  const realFetch = globalThis.fetch;
  const realKey = process.env.ARBOX_API_KEY;
  process.env.ARBOX_API_KEY = "test";
  globalThis.fetch = async () => fetchResult;
  const out = { headers: {} };
  const res = {
    setHeader(k, v) { out.headers[k] = v; },
    status(c) { out.status = c; return this; },
    json(b) { out.body = b; return this; },
  };
  return handler({ query: { date: "2026-11-17" } }, res).finally(() => {
    globalThis.fetch = realFetch;
    process.env.ARBOX_API_KEY = realKey;
  }).then(() => out);
}

test("סירוב של Arbox הוא 502 בלי שמירה, לא יום ריק", async () => {
  const out = await run({ ok: false, status: 429, json: async () => ({ error: "quota" }) });
  assert.equal(out.status, 502);
  assert.equal(out.headers["Cache-Control"], undefined);
});

test("תשובה תקינה שומרת את השדות שהדפים צריכים, פולג בלבד", async () => {
  const row = (location_name) => ({
    schedule_id: 7, session_name: "GYM", start_time: "08:00", end_time: "09:00",
    staff_member: { name: "מאמנת" }, location_name,
    registration_link: "http://x.arboxapp.com/group",
  });
  const out = await run({ ok: true, status: 200, json: async () => ({ data: [row("פולג"), row("אחר")] }) });
  assert.equal(out.status, 200);
  assert.equal(out.body.length, 1);
  assert.equal(out.body[0].schedule_id, 7);
  assert.equal(out.body[0].coach, "מאמנת");
  assert.equal(out.body[0].registration_link, "https://x.arboxapp.com/group");
  assert.match(out.headers["Cache-Control"], /s-maxage=/);
});
