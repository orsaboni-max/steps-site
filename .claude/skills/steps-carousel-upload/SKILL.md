---
name: steps-carousel-upload
description: >-
  העלאת מודעת קרוסלה (כמה קלפים) ל-Meta עבור STEPS — דרך Graph API ישיר
  (child_attachments). השתמש כשמעלים קרוסלה לקמפיין, או כשבונים מודעה מרובת-תמונות.
  Triggers: קרוסלה, carousel, child_attachments, להעלות קלפים, מודעה מרובת תמונות.
---

# STEPS — העלאת קרוסלה ל-Meta (Graph API)

> ⚠️ **סטטוס:** ההעלאה החד-תמונתית מוכחת בפרויקט. **קרוסלה עם child_attachments — לאמת בהעלאה הראשונה** (לפי תיעוד Meta). לא להתחזות "מוכח" עד שראינו preview רשמי + events.
> **שום העלאה-לאוויר בלי "go" של אור.** קודם PAUSED + preview, ואז הפעלה רק באישור.

## עוגנים
- טוקן: `C:\Users\USER\meta-token-temp.txt` (StepsAds, לא פג). Graph `v21.0`.
- חשבון מודעות: `act_9773300439396945` (ILS). דף: `815909245241691` (STEPS Fitness Center). פיקסל: `1016773848190436`.
- **כלים (עודכן 9/6/26):** ניהול קמפיין/adset/מודעה/creative = **Meta Ads MCP** (read+write, אומת). **יצירת קרוסלה עם `child_attachments` + העלאת תמונה (`/adimages`) = Graph API ישיר בלבד** (אין כלי MCP לאלה). **לא דפדפן** (קופא). ההערה הישנה "כתיבה חסומה ב-MCP" — בוטלה.

## פורמט קלפים
- קרוסלה = **1:1 (1080×1080)**. 2–10 קלפים (מומלץ 3–5). קלף אחד = מסר/תרגיל אחד.
- מותגים מראש (לוגו + כיתוב) דרך `steps-image-gen` → `brand_cards.py`.

## הצעדים (Graph API)
**1. כל קלף → image_hash:**
```
POST /v21.0/act_9773300439396945/adimages
  bytes=<base64> (או filename multipart)  → תשובה: images.<name>.hash
```
חזרו לכל קלף → אוסף hashes לפי הסדר הרצוי בקרוסלה.

**2. Creative אחד עם child_attachments:**
```
POST /v21.0/act_9773300439396945/adcreatives
  name="KIDS carousel"
  object_story_spec={
    page_id: "815909245241691",
    link_data: {
      message: "<primary text — מ-steps-ad-copy>",
      link: "<URL או deep-link>",
      child_attachments: [
        {image_hash:"<hash1>", name:"<כותרת קלף1>", description:"<תיאור>", link:"<link>"},
        ... (קלף לכל תרגיל)
      ],
      multi_share_optimized: true,     // Meta ממיין קלפים לפי ביצועים
      multi_share_end_card: true       // כרטיס סיום עם הלוגו
    }
  }
```
**לקמפיין לידים (Instant Form):** ב-link_data הוסף `call_to_action:{type:"SIGN_UP", value:{lead_gen_form_id:"<FORM_ID>"}}` בכל child_attachment (או ברמת link_data, לאמת מול התיעוד).

**3. Ad:**
```
POST /v21.0/act_9773300439396945/ads
  name=... adset_id=<ADSET> creative={creative_id:"<מ-שלב 2>"} status="PAUSED"
```

## ✅ אימות לפני go — חובה לכל מיקום (הלקח מהפדיחה: פעם שעברה העליתי בלי preview → נחתך → תיקנתי אחרי. לא שוב!)
- **תצוגה מקדימה רשמית לכל מיקום בנפרד** — לא רק פיד:
  - `GET /v21.0/<creative_id>/previews?ad_format=MOBILE_FEED_STANDARD` (פיד פייסבוק)
  - `...?ad_format=INSTAGRAM_STANDARD` (פיד אינסטגרם)
  - `...?ad_format=INSTAGRAM_STORY` (סטורי)
  - (לקריאייטיב קיים = `/{creative_id}/previews`, לא `/generatepreviews` עם creative_id — האחרון דורש object `creative`.)
- **לפתוח לאור בדפדפן** (ה-iframe src מכיל token → לא להדביק בצ'אט; לנווט את הדפדפן של אור ל-URL) + screenshot לאימות עצמי.
- בכל מיקום לבדוק: לא חתוך · לוגו+כיתוב גבוה (לא על ראש) · CTA/טופס מחובר · safe-zone.
- 🔴🔴 **חוק מנדטורי — בדיקת התאמת-סטורי + תיקון אוטומטי (לא לדלג, לא לשאול את אור):**
  1. **תמיד בדוק אם ה-adset רץ על סטורי/ריל:** `GET /<adset_id>?fields=targeting{publisher_platforms,facebook_positions,instagram_positions}`. אם `(auto/all)` או מכיל `story`/`reels` → **המודעה מופיעה בסטורי.**
  2. **תמיד משוך preview של סטורי** (`ad_format=INSTAGRAM_STORY` + `FACEBOOK_STORY_MOBILE`) ובדוק: מסך-מלא או **פסים שחורים**? (1:1/4:5 בסטורי = ממורכז עם פסים = לא מקצועי.)
  3. **אם לא מתאים לסטורי → לתקן לבד (בלי לשאול), ואז להציג לאישור-תקציב בלבד:**
     - **מודעת תמונה-בודדת:** `asset_feed_spec` עם `asset_customization_rules` — נכס **9:16** למיקומי story/reels, 1:1/4:5 לפיד. לייצר את ה-9:16 דרך `steps-studio-visuals`/`steps-image-gen` (תמונה אנכית מלאה, safe-zone: לוגו+CTA ב-60% המרכזיים, לא מוסתר ע"י UI הסטורי).
     - **קרוסלה:** Meta **לא** מאפשרת 9:16 פר-מיקום בקרוסלה (אותם קלפים בכל מקום → תמיד ממורכז בסטורי). הפתרון: או (א) **מודעת story ייעודית נפרדת** (single 9:16) באותו adset, או (ב) **להגביל placements** של הקרוסלה לפיד/feeds בלבד (להסיר story/reels) כך שלא תופיע מעוותת.
  4. **אסור להכריז "מוכן" אם המודעה רצה על סטורי ולא נבדק/תוקן הפורמט.** שינוי-לאוויר על מודעה חיה = go של אור (אבל הבנייה/הנכס — לבד).
- **לבדוק אישור מודעה לפני ACTIVE:** `GET /<ad_id>?fields=effective_status,ad_review_feedback` — לוודא לא DISAPPROVED ולא תקוע IN_PROCESS (הפתעת דחייה).
- רק אחרי preview תקין בכל מיקום + אישור + **go של אור** → `status=ACTIVE`.

## לקח-בנייה (4/6)
נבנו 4 קלפי KIDS 1:1 ב-`marketing/creative/kids-strength/` (treadmill/pullup/boxjump/squat-branded). מוכנים ל-image_hash. סדר קרוסלה מומלץ: קפיצה → סקוואט → הליכון → מתח.
