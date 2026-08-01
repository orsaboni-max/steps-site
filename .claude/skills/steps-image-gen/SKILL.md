---
name: steps-image-gen
description: >-
  יצירת תמונות מודעה ל-STEPS (פיד/סטורי/קרוסלה) — הנוסחה המדויקת שעובדת, מקצה
  לקצה: רפרנס לתמונה מנצחת → Higgsfield (Nano Banana) → הורדה → ביקורת עצמית →
  לוגו+כיתוב → מוכן ל-Meta. השתמש בכל פעם שצריך תמונה/קלף למודעת STEPS.
  Triggers: תמונה למודעה, קריאייטיב STEPS, קרוסלה, קלף, תמונת קמפיין, ויזואל.
---

# STEPS — יצירת תמונות מודעה (נוסחה מוכחת, 4/6/26)

> נבנה אחרי סשן שלם של ניסוי-וטעייה. **אל תמציא מחדש — לך לפי הצעדים.** כל גוטצ'ה כאן עלתה לנו זמן.

## כלי: GPT מועדף · Higgsfield/Nano Banana חלופה (אישור אור 9/6/26)
- **המודל המועדף = GPT (ChatGPT / GPT Image 2)** — אור מייצר בו, וזו האיכות שניצחה. תואם `steps-studio-visuals`.
- **חלופה לייצור תוכנתי שלי:** `mcp__higgsfield__generate_image`, model `nano_banana_pro` (כשצריך לייצר לבד, לא דרך אור). לא `marketing_studio_image` (יצא חשוך/שטוח). ~852 קרדיטים, Plus.
- ⚠️ ההערה הישנה "GPT לא מחובר" — **בוטלה.** GPT הוא הדיפולט.

## 🔑 הצעד שהכי משנה: רפרנס לתמונה מנצחת
התמונות הראשונות יצאו **חשוכות מדי, רחבות מדי, והאנשים נראו מבוגרים**. מה שתיקן הכל:
1. קח תמונה קיימת שאור אהב (למשל `marketing/creative/kids-12-15-hero-1.png` — בהיר, נוער צעיר, ציוד, צהוב).
2. העלה אותה: `media_upload` (filename+content_type) → קבל presigned URL → **PUT עם `curl.exe`** (לא Invoke-WebRequest — קופא ב-NonInteractive) → `media_confirm`.
3. בקריאת `generate_image`: `medias:[{value: media_id, role:"image"}]` (Nano Banana מקבל רק role `"image"`, מתרגם אוטומטית מ-`reference`).
4. בפרומפט: "Same bright, energetic style and dark premium STEPS gym as the reference image…"

## פרומפט — מה שעובד
- **פורמט:** פיד = `4:5`. קרוסלה = `1:1`. סטורי/ריל = `9:16`.
- **דרישות STEPS:** dark studio, **warm golden-yellow (#F5C518) accent lines**, bright key light, photorealistic premium.
- **קטינים (KIDS):** "clearly YOUNG teenagers (ages 12-15), youthful kid faces, mix of boys and GIRLS". תמיד AI (לא מצלמים קטינים). אם יוצא מבוגר מדי → הוסף "clearly young / kid faces" וצמצם לקלוז'-אפ.
- **מקום לטקסט:** "generous negative space at the TOP for a Hebrew headline".
- **תמיד:** "No text, no logo, no watermark" (הלוגו נוסף אחר כך).
- `count:2` לאופציות. תרגיל אחד לכל קלף בקרוסלה.

## הורדה + ביקורת (חובה לפני שמציגים)
- `job_status` עם `sync:true` עד `completed` (תמונה ~10-20ש). השרת לפעמים מנתק — פשוט תקרא שוב.
- **הורד עם PowerShell `Invoke-WebRequest -Uri … -OutFile`** (curl יצא ריק). לתיקייה `marketing/creative/<קמפיין>/`.
- **`Read` כל תמונה ובדוק בעצמך**: גיל נכון? פנים לא מזוהות? צהוב? מקום לטקסט? אין עיוותים. רק אז מציגים.
- לאור: שלח **קישורי CloudFront** (`results.rawUrl`) לצפייה, או נתיב התיקייה. (אור לא רואה את פלט ה-Read.)

## מיתוג: לוגו + כיתוב (PIL)
- סקריפט: `marketing/creative/kids-strength/brand_cards.py` (תבנית לשכפול).
- **נתיבים מוחלטים ל-steps-site הראשי** (לא ל-worktree!): פונט `C:\Users\USER\steps-site\marketing\creative\fonts\Heebo.ttf`, לוגו `…\steps-logo-white-hq.png`. ב-worktree יש רק `steps-logo-white.png`.
- שיטה: scrim כהה למעלה (legibility) → paste לוגו (alpha, ~34% רוחב, top-center) → כיתוב מתחת בזהב #F5C518 עם stroke. עברית = `bidi.get_display()`.
- ברירת מחדל KIDS: לוגו + `"KIDS · 12–15"`.

## אחרי האישור → העלאה ל-Meta
- **העלאת התמונה = `/adimages` ב-Graph API ישיר** (אין כלי MCP להעלאת תמונה). אחר כך יצירת creative/מודעה — אפשר ב-Meta Ads MCP **או** Graph. **לא דפדפן.** טוקן `meta-token-temp.txt`. קרוסלה = child_attachments (Graph). ר' `SOURCE_OF_TRUTH.md` §Meta Runbook. **שום העלאה-לאוויר בלי go של אור.**

## לקחים נעולים (אל תחזור)
- ❌ מודל marketing_studio / בלי רפרנס → חשוך, מבוגר, "לא יפה". ✅ nano_banana_pro + רפרנס לתמונה מנצחת.
- ❌ curl / Invoke-WebRequest ל-PUT. ✅ curl.exe ל-PUT, Invoke-WebRequest ל-OutFile.
- ❌ נתיב פונט/לוגו יחסי ל-worktree. ✅ מוחלט ל-steps-site הראשי.
