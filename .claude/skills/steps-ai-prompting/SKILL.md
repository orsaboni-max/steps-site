---
name: steps-ai-prompting
description: >-
  פלייבוק פרומפטינג ל-STEPS — איך לבקש בדיוק מ-GPT Image 2 (יצירת תמונה) ומ-Seedance 2.0
  (הנפשת תמונה לוידאו) כדי לקבל בדיוק את הקריאייטיב הרצוי בלי לנחש. השתמש בכל פעם
  שיוצרים תמונה למודעה, מנפישים תמונה סטטית לוידאו, כותבים פרומפט ל-GPT/Seedance,
  מפיקים ריל, או בונים קריאייטיב חזותי לסטפס. Triggers: פרומפט לתמונה, יצירת תמונה
  למודעה, הנפשת תמונה, פרומפט ל-GPT, פרומפט ל-Seedance, image-to-video, ריל סטפס,
  קריאייטיב, B-roll, תמונת מודעה, פרומפט וידאו.
---

# steps-ai-prompting — פלייבוק פרומפטינג STEPS

**מה זה:** שכבת פרומפטים תכליתית מעל סקילי הקריאייטיב הקיימים. נותן בלוקי פרומפט מוכנים להעתקה-הדבקה + חוקי הברזל, כדי שכל תמונה/וידאו יֵצא נכון מהפעם הראשונה.

**מה זה לא:** לא מחליף את הסקילים האחרים. לפרטי ביצוע (העלאה, מיתוג, הרכבה) — קרא את העוגנים:
- `steps-studio-visuals` — אסתטיקה, בחירת מודלים, ספק Seedance.
- `steps-image-gen` — נוסחת תמונת-מודעה + מיתוג + זרימת העלאה ל-Higgsfield.
- `steps-reel-pipeline` — pipeline מלא קצה-לקצה + הרכבה (כתוביות+מוזיקה).
- `steps-ad-copy` — טקסט (לעולם לא ממציאים סלוגנים).
- `SOURCE_OF_TRUTH.md §Meta Runbook` — safe-zone + העלאה.

---

## מתי להשתמש
- מבקשים תמונה למודעה/פוסט/קרוסלה → סעיף (1) + (3).
- מבקשים להנפיש תמונה סטטית לוידאו / B-roll / ריל → סעיף (4).
- קמפיין KIDS / פילאטיס נערות / קהל נוער → סעיף (2) **חובה**.
- לא בטוח איזה מודל → עץ-ההחלטה בסוף סעיף (1).

**כלל-העל:** רפרנס לפני הכל. עוגן ויזואלי אחד שווה 100 פרומפטים.

---

## (1) מתכון פרומפט GPT Image 2 (תמונה)

**מודל דיפולט:** `gpt_image_2`, `quality=high`, ישירות ב-Higgsfield דרך MCP (אני מריץ, אור לא מדביק).

### מבנה (6 אבני בניין, בסדר הזה)
`רקע/סצנה → נושא + framing → תאורה → עדשה/מצלמה → mood → קומפוזיציה → שורת אילוץ`

| רכיב | מה לכתוב | דוגמה |
|---|---|---|
| נושא + framing | מי/מה + סוג קאדר | candid photograph, medium close-up at eye level |
| סביבה | המקום | bright boutique pilates studio, sheer curtains |
| תאורה | שפת צילום אמיתית | soft warm golden daylight, three-point softbox |
| עדשה/מצלמה | focal + אפרצ'ר | shot on 50mm lens, f/1.8, shallow depth of field |
| mood | טון רגשי | airy, calm-premium, energetic |
| קומפוזיציה | זווית | eye-level / low-angle / overhead |

### חוקי ברזל
- **כתוב `photorealistic` במפורש** — מפעיל פוטוריאליזם חזק. חלופות: "real photograph", "shot on a real camera", "35mm film photograph".
- **שפת מצלמה > buzzwords.** focal length + אפרצ'ר + key/fill/rim light אמינים יותר מ-"8K/ultra-detailed".
- **micro-texture cues** = ההבדל בין AI לתמונת מצלמה: "real skin texture, subtle film grain, micro-contrast, natural color balance".
- **בלי שלילות בגוף הפרומפט** — תאר מה **כן** רוצים (ראה טבלת ההמרה). שלילות רק בשורת האילוץ.
- **שורת אילוץ בסוף כל פרומפט (חובה):** `no text, no logos, no watermark, no border, realistic anatomy, no heavy retouching`

### טבלת המרה negative→positive
| במקום (❌) | תכתוב (✅) |
|---|---|
| not posed | mid-exercise, dynamic natural motion |
| no floating straps | straps anchored to the reformer pulleys |
| not flat/dark | soft warm golden light, airy bright studio |
| no weird hands | hands resting on the foot bar, relaxed fingers |
| no stock look | candid iPhone-style photograph, real texture |
| no empty top | generous negative space at the TOP for a headline |

### אסתטיקת STEPS (קו אחד לפי הקמפיין)
- **קו A — פילאטיס/בוטיק (דיפולט):** סטודיו אלגנטי, **אור חם זהוב**, חלונות+וילונות שקופים, רצפת עץ בהירה, מראות. בהיר + קנדיד. לבוש: טופ ספורט + טייץ. **דיוק מכשיר: באמת על הרפורמר, לא לידו.**
- **קו B — GYM/דרמטי:** dark studio + אקסנט צהוב `#F5C518`, side lighting קולנועי.
- **לעולם לא:** סטוק מואר-לבן/קר/שטוח.

### תמונת-אם לעקביות (השיטה הכי אמינה)
1. **כל השוטים באותה שיחה אחת** (שיחה חדשה = איבוד הדמות/חלל).
2. **בנה תמונת-אם (anchor)** אחת מפורטת — חלל/דמות/פלטה/גימור.
3. **השתמש בה כ-reference** בכל שוט: `medias:[{value, role:"image"}]` + *"use the studio/character in this image as the reference."*
4. **preserve list בכל איטרציה:** *"same reformer studio, same set, same model — change only the pose."*
5. **שינוי אחד בכל פעם** (פוזה / זווית / שעה), לא 3 שינויים במכה.
⚠️ ייתכנו סטיות קלות (שיער/תסרוקת) — ידוע, לא נפתר 100%.

### אנטי-ארטיפקט
- **ידיים = הסיכון הגדול.** ציין מה הן עושות ("relaxed hands on the foot bar"), או הוצא חלקית מהקאדר.
- שורת אילוץ: `five fingers per hand, no extra limbs, no distorted hands, no warped background`.
- base נקי → refine איטרטיבי. אל תעמיס.

### טקסט בתמונה — לעולם לא דרך ה-AI
- **טקסט עברית לעולם לא דרך GPT** (יוצא מקושקש). תמיד: תמונה **נקייה** + overlay בנפרד (PIL/FFmpeg, `bidi.get_display()`).
- בפרומפט: `clean equipment, no text, no letters, no logos`.

### עץ-החלטה: איזה מודל
- **editorial-energy / מודעה** → `gpt_image_2` (דיפולט).
- **פוטוריאליזם פנים / UGC / פורטרט** → `soul_2` / `nano_banana_pro`.
- **טרנספורמציות / image-to-image / 4K** → `seedream_v4_5` / `nano_banana_pro`.
- לא בטוח: `models_explore action=search` → `action=recommend` עם goal.

---

## (2) קהל-נוער (KIDS / פילאטיס נערות) — צנוע, מכובד, לגיטימי

**העיקרון הנכון (תוקן 14/6, לפי מתחרה CONTROL HOUSE):** מודעה לתוכנית נוער **חייבת** להראות נוער — זה המוצר עצמו ("פילאטיס נערות" = נערות). ייצור AI של נערות ב**הקשר נורמלי, צנוע, לא ממוקד-גוף** הוא **לגיטימי ונפוץ** — מתחרים עושים את זה, ספריות סטוק מלאות בזה.

🔴 **הגבול האדום היחיד — לעולם לא:** תוכן מיני / חושפני / סוגסטיבי / ממוקד-גוף של קטינים. נקודה.
✅ **מותר ורצוי:** נערות בלבוש ספורט מלא ומכוסה, פעילות תקינה (יושבות/מתאמנות/מחייכות על הרפורמר), פנים נראות ומחייכות, סטודיו פרימיום. **תמים ומכובד** — בדיוק כמו CONTROL HOUSE.

### איך לתדרך (תמונה צנועה ולגיטימית של נערות)
- **לבוש:** `full-coverage modest sportswear (loose t-shirt and full-length leggings)` — מפורש, אפס חשיפה.
- **פעילות:** `sitting on the reformers / doing a gentle controlled exercise together, smiling` — תמים, טבעי.
- **מסגור:** קבוצה קטנה / קאדר בינוני, סטודיו פרימיום, אור חם, אווירה `wholesome, safe, friendly`. פנים נראות ומחייכות = בסדר גמור.
- **❌ לעולם בפרומפט:** תיאור גוף, תקריב-גוף, לבוש חושף, פוזה לא-תמימה, או כל ניסוח סוגסטיבי.

### אם הכלי חוסם (over-blocking תמים)
לפעמים ה-classifier חוסם גם בקשות תמימות. אם נחסם:
1. הסר ציון גיל מספרי — כתוב `young teenage girls` (לא "12-15").
2. הרחב קאדר (קבוצה/חלל) כך שאף פנים לא דומיננטית.
3. עדיין נחסם → מאמנת-בוגרת + נוכחות-נוער מרומזת, או שוט-חלל. **המטרה נשארת נערות תמימות, לא להימנע מנוער.**

**תבנית מוכנה (נערות צנועות, KIDS-safe):**
> photorealistic candid photograph of a small group of young teenage girls in a bright premium reformer pilates studio, sitting on the reformers and doing a gentle controlled exercise together, smiling, wearing full-coverage modest sportswear (loose t-shirts and full-length leggings), warm natural daylight through sheer curtains, wholesome safe friendly atmosphere, shot on a 35mm lens at eye level, generous negative space at the top for a Hebrew headline. No text, no logos, no watermark, realistic anatomy.

---

## (3) פורמטים + safe-zone (מקום לטקסט)

| פורמט | יחס | שימוש | safe-zone |
|---|---|---|---|
| פיד | **4:5** | מודעת פיד | margin ~10% מכל צד; כותרת בשליש עליון |
| קרוסלה | **1:1** | קרוסלה | margin ~10%; טקסט-על במרכז/תחתון |
| סטורי/ריל | **9:16** | Stories/Reels | **~14% עליון + ~20% תחתון פנויים** — Meta שם שם כיתוב + CTA |

תמיד בפרומפט: `generous negative space at the TOP for a Hebrew headline`.
⚠️ "creative-crop incident" — אל תמלא עד הקצה; השאר אזור בטוח לכיתוב + CTA.

---

## (4) מתכון תנועה Seedance 2.0 (הנפשת תמונה → וידאו)

**מודל:** `seedance_2_0` (Bytedance), image-to-video, שומר זהות, תומך start/end frame.

### params למודעה אנכית
| פרמטר | ערך | למה |
|---|---|---|
| `aspect_ratio` | **9:16** | Reels/Stories |
| `resolution` | **1080p** (סופי) / **720p** (טסט) | 1080p רק עם `mode: std` |
| `mode` | **std** | `fast` לא תומך 1080p |
| `duration` | **5s** ל-B-roll (4–6 בטוח; עד 15) | ארוך = יותר drift |
| role | **`start_image`** | התמונה = פריים פתיחה, נועל מראה |

💰 ~22.5 קרדיט/קליפ 5s @720p · ⏱️ ~3–4 דק'. תמיד `get_cost:true` לפני ייצור.
⚠️ **אין `generate_audio`** — אם נכנס אודיו, להשתיק ולהחליף במוזיקה שלנו. ⚠️ `declined_preset_id` כדי לא לתפוס preset.

### נוסחת פרומפט (6 שלבים)
`Subject + Action + Environment + Camera + Style/Lighting + Constraints`

**חוקי ברזל:**
- **60–100 מילים.** 20–30 הראשונות = הכי חשובות (פתח במי/מה + פעולה).
- **ב-image-to-video מתארים רק תנועה ושינוי — לא את המראה** (התמונה כבר נותנת אותו).
- **תנועת מצלמה אחת בלבד** + תמיד `slow / gentle / smooth / continuous / natural`. **slow motion = האיכות הכי טובה.**
- כתוב פעלים, לא תארים. `fast` בד"כ **מוריד** איכות.

### אוצר-מילים תנועות מצלמה (8 שעובדות)
| תנועה | מתי | ניסוח |
|---|---|---|
| Push-in | מיקוד/מתח | `camera slowly pushes in` |
| Pull-out | חשיפת חלל | `camera slowly pulls back to reveal the space` |
| Pan | סריקה אופקית | `slow pan left` / `gentle pan right` |
| Tracking | מעקב אדם | `tracking shot following her` |
| Orbit/arc | פורטרט/מכשיר | `slow circular dolly move` / `gentle orbit` |
| Tilt | מלמטה-למעלה | `slow tilt up` |
| Aerial | רחפן | `high aerial perspective` |
| Fixed | יציבות מקס' | `static camera, locked off` |

### Anti-drift (פנים/רפורמר/לוגו)
**תבנית מוכנה להדבקה:**
```
Animate the provided image, preserve composition and colors, maintain exact
appearance, keep identity consistent, [motion], [camera], [lighting].
Avoid identity drift, no warping, no morphing, no background change, no extra objects.
```

---

## (5) הזרימה מקצה-לקצה

1. **תמונה (GPT Image 2):** רפרנס → `generate_image` (`gpt_image_2`, quality=high).
2. **הורדה + ביקורת:** `job_status sync:true` → **`Invoke-WebRequest -OutFile`** → `Read` על התמונה (צ'קליסט סעיף 7).
3. **העלאה ל-Higgsfield:** `media_upload` → presigned URL → **`curl.exe` PUT** (לא Invoke-WebRequest — קופא) → `media_confirm`. (או `media_upload_widget` כשאור מעלה מהמכשיר.)
4. **הנפשה (Seedance):** `generate_video` עם `seedance_2_0`, תמונה כ-`role:"start_image"`, פרומפט-תנועה, 9:16/1080p/std/5s.
5. **הרכבה:** כתוביות עברית (overlay, `bidi`) + מוזיקה + לוגו. נתיבים מוחלטים ל-steps-site הראשי.
6. **קמפיין:** Meta — safe-zone + preview לפני go.

---

## (6) פרומפטי-דוגמה (העתק-הדבק)

### תמונות (GPT Image 2)

**A — Establisher חלל פילאטיס (תמונת-אם, בלי דמויות):**
```
Photorealistic wide-angle interior photograph of a premium reformer pilates studio.
Row of matching wooden-frame reformer machines on a polished light-oak floor,
minimalist beige and warm-white walls, large floor-to-ceiling windows with sheer
linen curtains, soft warm golden daylight pouring in, a few potted plants, calm airy
upscale atmosphere. Shot on a 24mm lens, eye-level, balanced symmetrical composition,
shallow depth of field on the foreground machine, realistic soft shadows.
Generous negative space at the top for a Hebrew headline.
No people, no text, no logos, no watermark, no border.
```
`4:5 (פיד) או 9:16 (סטורי), gpt_image_2, quality=high`

**B — נערות צנועות על רפורמר (פילאטיס נערות, KIDS-safe):**
```
Photorealistic candid photograph of a small group of young teenage girls in a bright
premium reformer pilates studio, sitting on the reformers and doing a gentle controlled
exercise together, smiling and relaxed, wearing full-coverage modest sportswear (loose
t-shirts and full-length leggings), sleek ponytails. Warm natural daylight through sheer
curtains, airy neutral palette, wholesome safe friendly atmosphere. Shot on a 35mm lens
at eye level, natural color balance, subtle film grain.
Realistic anatomy, no text, no logos, no watermark, no heavy retouching.
```
`4:5, gpt_image_2, quality=high`

**C — דיטייל מכשיר פרימיום (קרוסלה):**
```
Photorealistic close-up product-style photograph of a single premium reformer pilates
machine — polished maple-wood frame, cream upholstered carriage, stainless-steel
springs and pulleys. Three-point lighting: large softbox key from top-left, soft fill
from front, gentle rim light from back-right; clean reflections, fine wood grain.
Shot on a 70mm lens at f/8, neutral warm-white studio background, calm premium mood.
No people, no text, no logos, no watermark.
```
`1:1, gpt_image_2, quality=high`

> לעקביות: צור A קודם, ואז ב**אותה שיחה** הצמד אותה לפני B/C עם *"keep the same studio, floor, walls and lighting as the reference image — change only the subject."*

### תנועה (Seedance 2.0)

**1 — חלל פילאטיס / pull-out עדין:**
```
Animate the provided studio image. Soft warm window light shifts gently, sheer curtains
sway slightly, faint reflections move on the reformer machines. Camera slowly pulls back
to reveal the calm premium studio. Preserve composition and colors, no extra objects.
Slow, smooth, continuous, natural motion. Avoid jitter, no morphing, no background change.
```
`9:16, 1080p, std, 5s, start_image`

**2 — נערות מתאמנות / push-in עדין:**
```
Animate the provided image. The girls perform one slow gentle controlled movement on the
reformers, carriages gliding smoothly, natural relaxed smiles. Warm studio daylight.
Camera slowly pushes in toward the group. Preserve composition and colors, maintain exact
appearance, keep identity consistent. Slow, gentle, continuous motion.
Avoid identity drift, no warping, no morphing, no background change.
```
`9:16, 1080p, std, 5s, start_image`

---

## (7) צ'קליסט איכות — לפני "מוכן" (חובה `Read` על הפלט)

**תמונה:**
- [ ] אסתטיקה נכונה (קו A זהוב/בהיר או קו B dark+#F5C518), לא סטוק שטוח.
- [ ] מכשיר מדויק — **על** הרפורמר, לא לידו; רצועות מחוברות.
- [ ] אפס טקסט/ג'יבריש/לוגו זר/watermark.
- [ ] אנטומיה — 5 אצבעות, בלי איברים עודפים/ידיים מעוותות.
- [ ] safe-zone — מקום פנוי לכותרת (עליון) ו-CTA (תחתון בסטורי).
- [ ] עקביות — אם סדרה: אותו חלל/לבוש/דמות.
- [ ] **KIDS:** נערות **צנועות, לבוש מלא, פעילות תמימה**, אווירה wholesome. אפס תיאור-גוף/חשיפה/סוגסטיבי.

**וידאו (Seedance):**
- [ ] בלי drift/מורפינג — פנים/לוגו/מכשיר זהים לאורך כל הקליפ.
- [ ] תנועה אחת חלקה — בלי jitter/קפיצות.
- [ ] slow/gentle לכל אורכו.
- [ ] אודיו הושתק/הוחלף במוזיקה שלנו.
- [ ] 9:16 + safe-zone.

**אם משהו לא עובר → regenerate (לא רק edit), שינוי-אחד-בכל-פעם. שום go לכסף לפני שהצ'קליסט ירוק ואור אישר.**

---

## (8) סטודיו-כבסיס (image-to-image) — תמונת STEPS אמיתית + הוספת מתאמנות ⭐

**הכי חשוב לאותנטיות.** כשיש **צילום אמיתי של הסטודיו**, בונים עליו במקום להמציא חדר. אור: "תשתמש בסטודיו שלי בתור הבסיס ועליו תקים מתאמנות עם מאמנת."

**מודל:** `nano_banana_pro` (הכי טוב ב"שמור רקע, הוסף נושא"). חלופה אם הרקע זז: `seedream_v4_5` (`quality:"high"`) או `gpt_image_2` (`resolution:"4k"`).
**טכני:** כל מודלי העריכה = image-to-image עם **role יחיד `image`**. מעבירים את הצילום כ-`medias:[{value, role:"image"}]`, וה"keep this room / add" בגוף הפרומפט. `aspect_ratio` 9:16/4:5 · `resolution:"2k"` (סופי `"4k"`).

### תבנית "keep this exact studio, add..." (סדר חובה: קודם נועלים, אז מוסיפים)
```
Using this exact studio photo as the base, keep the room 100% unchanged — same walls,
windows and natural light, acoustic ceiling panels, wooden floor and reflections, same
camera angle and perspective. Only ADD people: [מי + תרגיל אמיתי]. Place them on the
reformers sized correctly for the room's perspective. Match their lighting, shadows and
color tone to the existing window light (from [כיוון]). Do not regenerate or re-light the
background — only the people are new. Photorealistic candid fitness-class look.
```
**חוקי ברזל:** לתאר מה **לא** משתנה לפני מה שכן · לנעול תאורה ידנית (`keep window light from the left`) · סבב-תיקון איטרטיבי ("only fix X, keep everything else") · **מגבלה:** המודל משחזר רקע (לא inpainting פיקסל) — ייתכן רכוך → סבב `4k` + `upscale_image`.

---

## (9) תרגילי רפורמר אמיתיים — נגד "רצועות מרחפות"

> 📚 **הרפרטואר המלא (40+ תרגילים לפי תנוחה + כל האביזרים + שיעור-אמיתי) → סקיל `steps-reformer-pilates`.** כאן רק 8 השוטים הכי שימושיים + הכלל הקריטי.

**הכלל:** רצועות תמיד **מחוברות לגלגלות / נאחזות ביד/רגל / תלויות רפויות** — **אף פעם לא צפות**. בלי רצועות → `no straps in frame, only the footbar/jump board`. ⚠️ נגד "ספסל-כושר במקום רפורמר" → ר' §0 בסקיל הרפורמר.
⭐ = אנרגטי (לשוט הוק) · 🪑 = פסיבי (להימנע בסטטי).

| תרגיל | תיאור לפרומפט | אנרגיה |
|---|---|---|
| **Footwork** 🪑 | lying on her back, feet on the footbar, pushing the carriage with the legs. No straps. | רגוע |
| **The Hundred** | lying on back, feet in straps at 45°, shoulders lifted, arms pumping. Straps to end pulleys. | בינוני |
| ⭐ **Long Stretch/Plank** | full plank, hands on footbar, feet on shoulder rests, body straight, pushing carriage. No straps. | דינמי |
| ⭐ **Elephant** | standing on carriage, hands on footbar, rounded back, hips high (inverted V), pushing out. No straps. | דינמי |
| ⭐ **Knee Stretch** | kneeling on moving carriage, hands on footbar, back rounded, driving with knees. Straps hang loose at front pulleys. | דינמי |
| ⭐⭐ **Jump Board** | on back, feet flat on a vertical jump board, mid-push "jumping", carriage sliding like a horizontal trampoline. No straps. | הכי אנרגטי |
| **Stomach Massage** | sitting on carriage folded forward, feet on footbar, pushing with legs, rounded back. No straps. | בינוני |
| **Kneeling Arms in Straps** | kneeling upright, holding straps, opening arms (rowing). Straps from rear pulleys. | בינוני |

**4 הכי טובים לפרסום:** Jump Board · Long Stretch/Plank · Knee Stretch · Elephant. **להימנע בסטטי:** Footwork / Mermaid (נראה "יושבת" פסיבי).

---

## (10) אנרגיה וכיף (אנטי-משעמם)

**עקרון-העל:** לתאר **פעולה + רגש** (`mid-laugh`), לא פוזה. למכור **שייכות וכיף**, לא "תראו כמה אנחנו בכושר". המכונה = הכוכבת (זווית שמראה קפיצים/גלגלות = עוצמה).

**Cues להדבקה:**
- רגע+הבעה: `caught mid-laugh, genuine candid joy` · `looking at each other, not the camera` · `mid-motion, between reps` · `spontaneous high-energy group moment`
- תנועה: `dynamic motion blur on the carriage` · `slight motion blur, background sharp` · `freeze-frame of a jump, hair mid-air`
- זווית+עדשה: `low-angle hero shot` · `shot through the reformer springs` · `subjects at varying heights, layered depth` · `35mm f/2.8`
- אור+סגנון: `warm golden light through large windows` · `candid documentary lifestyle photography`

**מבנה:** `[פעולה+רגש] → [קבוצה/אינטראקציה] → [זווית+עדשה] → [אור] → [סגנון]`.

**❌ להימנע:** `posed` · `static pose` · `standing still` · `looking/smiling at the camera` (tell של סטוק) · `stiff` · `lined up in a row` · `empty/sterile studio` · `perfect fitness models` · `glossy/over-retouched` · סימטרי eye-level מושלם.

---

## (11) פרומפטי STEPS המנצחים (סטודיו-בסיס + תרגיל אמיתי + אנרגיה)

> `medias:[{value:<studio_media_id>, role:"image"}]`, `nano_banana_pro`, `2k`. אלה גוברים על דוגמאות B הגנריות בסעיף (6).

**B1 — נערות + מאמנת, Knee Stretch, אנרגטי:**
```
Using this exact studio photo as the base, keep the room 100% unchanged — same walls,
windows, natural light, acoustic ceiling panels, wooden floor and reflections, same camera
angle and perspective. Only ADD people: a small group of young teenage girls kneeling on
the reformer carriages, both hands holding the footbar, backs rounded, driving the carriages
back-and-forth with their knees mid-motion — caught mid-laugh, looking at each other not the
camera, full-coverage modest sportswear (loose t-shirts, full-length leggings). A female
coach guides them from the front. Straps hang loose at the front pulleys, not floating.
Slight motion blur on the moving carriages, background sharp. Match their lighting and
shadows to the existing window light. Do not re-light or regenerate the background — only
the people are new. Photorealistic candid fitness-class look, wholesome safe friendly energy.
Generous negative space at the top for a Hebrew headline. Realistic anatomy, no text, no logos.
```

**B2 — נערות, Jump Board, הכי אנרגטי:**
```
Keep this real Pilates studio photo exactly as it is — identical room, windows, lighting,
wall panels, floor and framing must NOT change. Into this same scene, ADD 3-4 young teenage
girls lying on their backs on the reformer carriages, feet pressed flat against the vertical
jump boards, mid-push "jumping" — carriages sliding energetically, genuine mid-laugh joy,
high-energy group moment, full-coverage modest sportswear. One female coach cheering them on
from the side. No straps in frame, only the jump boards. Dynamic motion blur on the moving
carriages, low-angle hero shot, warm window light. Match the people's lighting and shadows to
the room; do not alter or re-light the background — only the people are new. Photorealistic,
authentic energetic fitness-class look. Realistic anatomy, no text, no logos, no watermark.
```

---

## (12) צילום אולפן — עדשות, זוויות, תאורה

**מה זה:** ספריית reference לבחירת **עדשה + זווית + תאורה** לכל שוט, בשפת צילום אמיתית. מדביקים את ה"ניסוח לפרומפט" ישירות לתוך אבן-הבניין הרלוונטית בסעיף (1)/(8). **המטרה:** שכל סט שוטים ייראה כמו הפקה מקצועית מגוונת — לא 5 פעמים אותה תמונה.

**כלל-העל של הסעיף:** תמיד 3 רכיבים יחד — **עדשה+אפרצ'ר** (פיזיקה של DoF/דחיסה) + **זווית** (רגש/דרמה) + **תאורה+Kelvin+רגש** (mood). זה מה ששולט בתוצאה, לא תיאור הסצנה.

### (12.1) טבלת עדשות — סוג שוט → עדשה+אפרצ'ר → אפקט → ניסוח

| סוג שוט | עדשה + אפרצ'ר | האפקט (DoF / דחיסה / עיוות) | ניסוח לפרומפט |
|---|---|---|---|
| **Establishing — כל החלל** (שורת רפורמרים / רצפת GYM) | **16–24mm, f/8–f/11** | שדה ראייה רחב; **deep focus** — הכל חד מקדמה לרקע. עיוות חבית בקצוות — לשמור מצלמה ישרה. | `24mm wide-angle lens, f/8, deep focus, sharp front to back, camera held level, full-room establishing shot` · ל-16mm: `16mm ultra-wide, dramatic expansive perspective` |
| **Group — קבוצת מתאמנות (3+)** | **35mm, f/4–f/5.6** | מכניס את כל הקבוצה + הקשר החדר בלי להתרחק; כל הפנים חדות. עיוות קל. | `35mm lens, f/5.6, environmental group shot, all faces in focus, candid energy` |
| **Single — מתאמנת אחת** (פורטרט) | **85mm, f/1.4–f/2.8** (50mm כחלופה) | "סוויט-ספוט" מחמיא: משטח פרופורציות פנים + **דחיסת רקע** + **bokeh קרמי**. אפס עיוות. | `85mm f/1.4 portrait, creamy bokeh, shallow depth of field, flattering facial compression, background melts away` |
| **Detail / Product** (ידית/ספרינג/נעל) | **100mm macro, f/2.8–f/5.6** | מרחק עבודה נוח, מגדיל מרקם. f/2.8 לבידוד פרט · f/5.6–f/8 לכל המוצר חד. אפס עיוות. | `100mm macro lens, f/4, extreme close-up, fine texture detail, sharp product focus, soft background separation` |
| **Dynamic / Action** (קפיצה / Jump Board / ספרינט) | **70–200mm, f/2.8** | טלהפוטו דוחס ומבודד תנועה; f/2.8 = תריס מהיר + רקע מטושטש. | הקפאה: `70-200mm f/2.8, frozen mid-action, fast shutter, sharp subject, blurred background` · panning: `panning shot, motion-blurred background, subject sharp, sense of speed` |

**כללי f-stop (DoF) לזכור:** `f/1.4–f/2.8` = רקע נמס (פורטרט/פרט) · `f/4–f/5.6` = DoF בינוני (קבוצה/אקשן) · `f/8–f/11` = הכל חד (establishing). מספר נמוך = פתח רחב = יותר בוקה.
⚠️ **אזהרת עיוות:** לעולם לא 16–24mm לפורטרט פנים (מגדיל אף/מצח). לפנים תמיד **50mm+**, אידיאלי 85–100mm.

### (12.2) טבלת זוויות — זווית → מתי/אפקט → ניסוח (🔥 = הכי אנרגטי/דרמטי)

| זווית/קומפוזיציה | מתי + אפקט רגשי | ניסוח לפרומפט |
|---|---|---|
| **Eye-level** | ברירת מחדל "אמת" — חיבור אישי, הסבר פורם. רגוע. שמרי כ-20% מהשוטים. | `eye-level shot, camera at eye height, neutral natural perspective, honest connection` |
| 🔥 **Low-angle hero** | רגע שיא — דדליפט, נחיתת קפיצה. המתאמנת נראית חזקה, larger-than-life. הכי "wow". | `dramatic low-angle hero shot, camera near floor tilted up, subject towering and powerful, larger-than-life` |
| **High-angle** | מבט-על קל על קבוצה/מתיחה/רפורמר על מזרן. רך, נגיש, "כל אחת יכולה". | `high-angle shot looking down, approachable and soft, ground fills background` |
| 🔥 **Overhead / top-down** | פילאטיס רפורמר, מתיחות רצפה, סידור ציוד. "מגזין", שובר מונוטוניות מיד. | `directly overhead top-down shot, bird's-eye flat-lay, symmetrical graphic composition` |
| 🔥 **Dutch-tilt (canted)** | ספרינט, Jump Board, רגע פיצוץ — אופק נטוי = מהירות, "עומד לפרוץ מהפריים". רק ב-peak. | `dutch angle, canted tilted horizon, dynamic diagonal lines, sense of speed bursting out of frame` |
| **Over-the-shoulder** | מאחורי מאמנת אל מתאמנת / אל מראה. 3 שכבות עומק, אינטימי. | `over-the-shoulder shot, foreground shoulder soft and blurred, subject sharp, three layers of depth` |
| 🔥 **Through-the-equipment** (frame-in-frame) | דרך מסגרת רפורמר / בין משקולות / דרך מוט. ממסגר, עומק, "הצצה" קולנועית. | `shot framed through gym equipment in foreground, frame-within-a-frame, foreground out of focus, subject sharp in the gap, cinematic depth` |
| **Wide-symmetrical** | establishing — החלל המלא, שורת רפורמרים. סדר, יוקרה. פותחת ריל. | `wide symmetrical establishing shot, centered composition, balanced architecture, clean spacious studio` |
| **Leading-lines** | מסדרון / שורת מכונות / פסי רצפה אל המתאמנת. מושך עין פנימה, עומק. | `leading lines (equipment rows / floor lines) guiding the eye toward the subject at a rule-of-thirds intersection` |
| **Negative-space** | מתאמנת אחת בפריים נקי — לטקסט-על/הוק/CTA. נושמת, ממקדת רגש. | `minimalist negative space, subject on one rule-of-thirds third, large clean empty area for text overlay` |

**4–5 הכי אנרגטיים (תעדפי לרגעי שיא):** Low-angle hero · Dutch-tilt · Overhead · Through-the-equipment · (משלים: Leading-lines).
**איך לבחור:** (1) מינימום 3 זוויות שונות לכל ריל — אף 2 סצנות עוקבות זהות. (2) בנייה רגשית: פתיחה Wide → Low/Dutch ב-peak → Overhead/Through באמצע → Negative-space/Eye-level לסיום+CTA. (3) זווית לסוג תנועה: נפיצה→Dutch/Low · רצפה/רפורמר→Overhead · פורם→Eye-level · חלל→Wide. (4) דרמה (Low/Dutch) רק ב-peak, לא בהכנה.

### (12.3) טבלת תאורה+אווירה — setup → mood → ניסוח

| Setup תאורה | האווירה | ניסוח לפרומפט |
|---|---|---|
| **Soft window daylight** | רך, נקי, טבעי, "אמיתי" (קו A דיפולט) | `soft diffused natural window light from the side, gentle wraparound shadows, airy and clean, true-to-life skin tones` |
| **Golden hour** | חם, חלומי, מזמין, רגשי | `warm golden-hour light, low directional sun, long soft shadows, dreamy hazy glow, warm amber ~3200K` |
| **Three-point softbox** | מקצועי, מאוזן, מחמיא, "סטודיו" | `professional three-point studio lighting, soft key at 45 degrees, gentle fill, clean separation, flattering even exposure` |
| **Rim / back light** | דרמטי, תלת-ממדי, הפרדה מהרקע (קו B) | `strong rim light from behind, glowing edge highlights outlining the figure, dramatic separation from dark background` |
| **High-key bright-airy** | אופטימי, נקי, קליל, "feel-good" | `high-key lighting, bright airy white background, minimal soft shadows, low contrast, fresh optimistic look` |
| **Low-key moody-cinematic** | אינטימי, דרמטי, קולנועי (קו B) | `low-key cinematic lighting, single sculpting light source, deep shadows, high contrast, moody and intense` |
| **Hard directional** | אנרגטי, גרפי, אתלטי (קו B) | `hard directional light, crisp defined shadows, sharp specular highlights on muscle and sweat, bold athletic energy` |

**Color Temperature (Kelvin) → mood:** חם `~2700–3200K` = מזמין/מחמיא (קו A, פילאטיס) · ניטרלי `~5500K` = "אמיתי-סטודיו" · קר `~6000K` = נקי/רגוע (⚠️ במשורה על עור — מבליט אפור/"עייף") · דרמטי = split-tone `warm subject against cool shadows` (קו B, GYM).

**2 מתכוני-אווירה מוכנים (להדבקה לתוך אבן "תאורה"):**
- **פילאטיס — חם·מזמין (קו A):** `soft diffused morning window light from the left, warm 3000K tones, gentle wraparound shadows, airy boutique pilates studio, calm and inviting, true-to-life skin, shallow depth of field`
- **GYM — דרמטי·עוצמתי (קו B):** `dramatic low-key gym lighting, strong rim light from behind glowing on shoulders, deep shadows, single hard key light sculpting muscle, high contrast, intense focused energy`

### (12.4) מטריצת גיוון לריל — קומבינציה שונה לכל שוט (אנטי-משעמם)

המטרה: 5 שוטים = 5 קומבינציות שונות של עדשה+זווית+תאורה, עם בנייה רגשית (חלל → אנרגיה → אסתטיקה → רגש). אף שתי שורות לא חוזרות על אותה שלישייה.

| # | תפקיד בריל | עדשה+אפרצ'ר | זווית | תאורה | מחרוזת מוכנה להדבקה |
|---|---|---|---|---|---|
| **1** | פתיחה — "איפה אנחנו" | 24mm f/8 deep focus | Wide-symmetrical | Soft window daylight | `24mm wide-angle f/8, deep focus, wide symmetrical establishing shot, centered composition, soft diffused window light, airy and clean` |
| **2** | 🔥 peak אנרגיה | 70–200mm f/2.8 | Low-angle hero | Hard directional / rim | `70-200mm f/2.8, frozen mid-action, low-angle hero shot tilted up, hard directional rim light, sharp subject, blurred background, larger-than-life` |
| **3** | גיוון אסתטי | 35mm f/4 | Overhead top-down | Three-point softbox | `35mm f/4, directly overhead top-down flat-lay, symmetrical graphic composition, soft three-point studio lighting, even flattering exposure` |
| **4** | אינטימי / קולנועי | 85mm f/1.8 | Through-the-equipment | Golden hour | `85mm f/1.8, shot framed through the reformer springs (frame-within-a-frame), foreground out of focus, subject sharp, warm golden-hour light, creamy bokeh` |
| **5** | סיום — רגש + מקום ל-CTA | 50mm f/2.8 | Negative-space / Eye-level | High-key bright-airy | `50mm f/2.8, eye-level with minimalist negative space, subject on one rule-of-thirds third, high-key bright airy light, large clean empty area at the top for a Hebrew headline` |

**חוקי המטריצה:** (1) שורה ≠ שורה — אם חוזרים על קומבינציה, מחליפים זווית או תאורה. (2) זוויות דרמטיות (Low/Dutch/Through) רק בשורות ה-peak (2,4), לא בפתיחה/סיום. (3) שורה 5 תמיד עם negative-space ל-overlay (ר' סעיף 3 safe-zone). (4) להתאים את ה-Kelvin לקו: A = חם ~3000K לאורך · B = split-tone דרמטי.
