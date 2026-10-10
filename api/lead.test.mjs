// בדיקה לחיטוי הייחוס. הרצה:  node --test api/
// זו נקודת-אמון: מחרוזת מהדפדפן נכנסת לכרטיס אמיתי ב-Arbox שהמזכירות קוראות.
import test from "node:test";
import assert from "node:assert/strict";
import { referralNote } from "./lead.ts";

test("קמפיין אמיתי מגיע כמשפט קריא", () => {
  const note = referralNote({ fbclid: "IwAR123", utm_campaign: "poleg-august" });
  assert.match(note, /מקור-הגעה:/);
  assert.match(note, /fbclid=IwAR123/);
  assert.match(note, /utm_campaign=poleg-august/);
});

test("בלי ייחוס — אין תוספת בכלל, ההערה נשארת כמו שהייתה", () => {
  for (const empty of [undefined, null, {}, "לא אובייקט", 7, { utm_source: "   " }]) {
    assert.equal(referralNote(empty), "");
  }
});

test("שדה שלא ברשימה הלבנה לא עובר", () => {
  const note = referralNote({ evil: "drop table", utm_source: "facebook" });
  assert.match(note, /utm_source=facebook/);
  assert.doesNotMatch(note, /evil/);
});

test("שורה חדשה לא יכולה לשבור את השורה שאנחנו מפרסרים בחזרה", () => {
  const dirty = ["fb", String.fromCharCode(10), "מקור-הגעה: מזויף", String.fromCharCode(13), String.fromCharCode(0)].join("");
  const note = referralNote({ utm_source: dirty });
  assert.ok(!note.includes(String.fromCharCode(10)) && !note.includes(String.fromCharCode(13)), "אין תווי שורה בפלט");
  const ctrl = Array.from(note).some((ch) => { const c = ch.charCodeAt(0); return c < 32 || c === 127; });
  assert.ok(!ctrl, "אין תווי בקרה בפלט");
});

test("ערך ענק נחתך ולא מנפח את הכרטיס ב-Arbox", () => {
  const note = referralNote({ utm_campaign: "x".repeat(5000), fbclid: "y".repeat(5000) });
  assert.ok(note.length <= 300, `אורך ${note.length} חרג מהתקרה`);
});

test("סוג לא-מחרוזת מדולג בשקט, ולא הופך ל-[object Object]", () => {
  const note = referralNote({ utm_source: { a: 1 }, utm_medium: "cpc" });
  assert.doesNotMatch(note, /object/);
  assert.match(note, /utm_medium=cpc/);
});

import { attributionSource, attributionCampaign } from "./lead.ts";

test("מקור הליד לפי utm_source — רק ערכים מוכרים, רגיש-לרווח ואותיות", () => {
  assert.equal(attributionSource({ utm_source: "fb" }), 19383);
  assert.equal(attributionSource({ utm_source: " Facebook " }), 19383);
  assert.equal(attributionSource({ utm_source: "IG" }), 126889);
  assert.equal(attributionSource({ utm_source: "instagram" }), 126889);
  assert.equal(attributionSource({ utm_source: "google" }), 6552);
});

test("מקור לא מוכר או חסר נשאר Website — לא מנחשים", () => {
  for (const r of [undefined, null, {}, { utm_source: "tiktok" }, { utm_source: "" }, { utm_source: { a: 1 } }, "fb"]) {
    assert.equal(attributionSource(r), 19357);
  }
});

test("שדה הקמפיין באותו פורמט כמו הבוט", () => {
  assert.equal(attributionCampaign({ utm_campaign: "test", utm_content: "test-ad" }), "קמפיין: test | מודעה: test-ad");
  assert.equal(attributionCampaign({ utm_campaign: "x" }), "קמפיין: x");
  assert.equal(attributionCampaign({ utm_content: "ad", ad_id: "5" }), "מודעה: ad");
  assert.equal(attributionCampaign({ ad_id: "123" }), "מודעה: #123");
  assert.equal(attributionCampaign({}), "");
});

test("קמפיין: מפריד | יוצא, רווחים מתכווצים, תקרה 120", () => {
  assert.equal(attributionCampaign({ utm_campaign: "a | b\n  c", utm_content: "d" }), "קמפיין: a b c | מודעה: d");
  assert.ok(attributionCampaign({ utm_campaign: "x".repeat(500), utm_content: "y".repeat(500) }).length <= 120);
});
