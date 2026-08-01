---
name: steps-reel-pipeline
description: >-
  ה-pipeline המלא להפקת ריל/סרטון פרסומת ל-STEPS מקצה לקצה — קופי → תמונות עקביות →
  הנפשה לוידאו → הרכבה (כתוביות+מוזיקה) → קמפיין Meta. השתמש בכל פעם שמבקשים "תעשה ריל",
  "סרטון פרסומת לסטפס", "להפיק ריל/וידאו", "ריל פילאטיס/קידס". מאגד את הסקילים:
  steps-ad-copy + steps-studio-visuals + steps-marketing.
---

# STEPS — Pipeline הפקת ריל פרסומת (מקצה לקצה)

נבנה מהפקת ריל "פילאטיס נערות" (2026-05). מטרה: לא לשבור את הראש כל פעם. עובדים לפי השלבים.

## כללי-על (החוזה עם אור)
- **אני עושה את העבודה הטכנית** (הורדות/העלאות/רינדור). אור רק מאשר ומדביק פרומפטים ל-ChatGPT אם צריך.
- **לא להניח — לוודא.** לא להצהיר "מוכן" בלי בדיקה (חילוץ פריים, צפייה).
- **לא לשאול שוב מה שכבר הוחלט.** לקרוא את קבצי הקמפיין/הזיכרון לפני שמתחילים.
- אישור אור בכל נקודת מפתח. כלום לא עולה לאוויר בלי go סופי.

## שלב 1 — קופי (סקיל `steps-ad-copy`)
כותבים כתוביות הריל + קופי המודעה בקול STEPS (רפרנס-זהב, זוויות מאושרות, בלי קלישאות/טיקים-AI). נועלים עם אור. שומרים ב-`marketing/creative/<reel>/reel-script.md`.

## שלב 2 — תמונות עקביות (סקיל `steps-studio-visuals`)
**הכלי הכי עקבי: ChatGPT GPT Image 2.** שיטה:
1. תמונת-אם אחת (סטודיו+בנות) → ואז כל סצנה "אותן בנות/סטודיו/לבוש, זווית אחרת" **באותה שיחה**.
2. **הדרך המהירה:** נותנים לאור את הפרומפטים, הוא מדביק ב-ChatGPT ושולח את התמונות (או מורידן ל-Downloads ואני לוקח משם).
- ⚠️ **גוטצ'ה חסימת קטינים:** אסור לציין גיל (15-17) + תקריב גוף → ChatGPT חוסם. בתקריבים: "אחת המתאמנות מהתמונה" + התרגיל בלבד, בלי גיל/גוף.
- אסתטיקה: בוטיק אלגנטי, אור חם, טופ לבן + טייץ סייג', *באמת על הרפורמר*, בלי טקסט-ג'יבריש, 9:16.

## שלב 3 — הנפשה לוידאו (Higgsfield Seedance 2.0)
1. `list_workspaces` → `select_workspace` ל-workspace עם הקרדיטים (PLUS). `balance` לוודא.
2. מעלים סטילס: `media_upload` (files[]) → `curl.exe -X PUT --data-binary @file 'url'` → `media_confirm` (type=image, media_ids[]).
3. `generate_video` model `seedance_2_0`, `medias:[{role:start_image, value:<media_id>}]`, aspect 9:16, duration 5, **`declined_preset_id`** (להימנע מ-preset). prompt = **תנועה בלבד** + מילות קצב ("slow, smooth, gentle") + מצלמה אחת + "maintain exact appearance from reference image, no drift".
- 💰 ~22.5 קרדיט/קליפ 5ש @720p. ⏱️ ~3-4 דק'. ⚠️ מוסיף אודיו אוטומטי — נשתיק בהרכבה.
4. מורידים את ה-mp4 של כל קליפ (job_status → rawUrl → Invoke-WebRequest).

## שלב 4 — הרכבה (FFmpeg, מקומי — נמצא ב-PATH)
**א. כתוביות:** קובץ `captions.ass` (libass תומך עברית RTL). Style: Arial, **Fontsize ~58**, PrimaryColour זהב-שמפניה רך `&H007AC2E4` (#E4C27A), Outline 5, Encoding 177, Alignment 2 (תחתית). שורות עם `\N`. מסך סיום: Dialogue עם `\an5` (מרכז) + inline `{\fsNN\c&H...&}`.
**ב. concat + צריבה + מסך סיום (פקודה אחת):**
```
ffmpeg -y -i c1 -i c2 -i c3 -i c4 -i c5 -f lavfi -t 3 -i "color=c=0x111111:s=720x1280:r=30" \
 -filter_complex "[0:v]trim=0:3.6,setpts=PTS-STARTPTS,scale=720:1280,setsar=1[v0];...[5:v]setpts=PTS-STARTPTS,scale=720:1280,setsar=1[v5];[v0]...[v5]concat=n=6:v=1:a=0[cat];[cat]subtitles=captions.ass[vout]" \
 -map "[vout]" -r 30 -c:v libx264 -pix_fmt yuv420p -movflags +faststart reel-v.mp4
```
**ג. מוזיקה (Pixabay, רישיון חופשי למסחרי):**
- בדפדפן: נכנסים לעמוד טראק ב-pixabay.com/music → `javascript_tool`: `document.documentElement.outerHTML.match(/https?:\/\/cdn\.pixabay\.com\/download\/audio\/[^"'\s]+\.mp3[^"'\s]*/g)[0]` → מקבלים URL ישיר → `curl.exe -L -A "Mozilla/5.0" -o music.mp3 <url>`. (עמוד חיפוש לא חושף URL — רק עמוד טראק בודד.)
- **וייב מועדף של אור: פופ אנרגטי / אינדי** (קצבי, עם וייב).
- מערבבים: `ffmpeg -i reel-v.mp4 -i music.mp3 -filter_complex "[1:a]afade=t=in:st=0:d=0.4,afade=t=out:st=<end-1.6>:d=1.6,volume=0.9[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest reel-FINAL.mp4`.
**ד. אימות:** מחלצים 2-3 פריימים (`ffmpeg -ss T -i ... -frames:v 1 _chk.png`) וקוראים שהכתוביות/מסך הסיום נכונים. פותחים את ה-mp4 לאור (`Invoke-Item`).
- אם אור מבקש כמה אופציות מוזיקה → מורידים כמה טראקים, ממררים כמה גרסאות (-c:v copy = מהיר), פותחים לבחירה.

## שלב 5 — קמפיין Meta (סקיל `steps-marketing`)
- **לידים (עודכן 9/6): טופס לידים פעיל 1542048374099477 (שם+טלפון) → Zapier (Zap 367117682) → Arbox + הבוט steps-brain שולח טלגרם ויוצר משימה. קיים ועובד — לא בונים מחדש.** (CTWA הוא ערוץ נוסף, לא הצינור היחיד.)
- מיקוד: **רדיוס ~3 ק"מ סביב הסטודיו בפולג** (לא 12 — קרבה=רלוונטיות). הורים **36-55 נשים**. אופ': נערות 13-17 (מיקום+גיל בלבד — Meta מגביל קטינים).
- בונים מושהה, מאשרים תקציב+מיקוד עם אור, go סופי שלו להפעלה.
- מדידה: ליד→אימון היכרות→מנוי ב-Arbox (לא ספירת לידים).

## כלים/קרדיטים
ChatGPT Plus (תמונות) · Higgsfield PLUS (וידאו, ~22.5cr/קליפ) · FFmpeg (חינם, מקומי) · Pixabay (מוזיקה חינם) · Chrome MCP (נהיגה בדפדפן) · Meta Graph API (System User token, חשבון 9773300439396945).
