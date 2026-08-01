---
name: steps-reformer-pilates
description: >-
  אנציקלופדיית הידע של פילאטיס מכשירים (רפורמר) ל-STEPS — כל חלק ואביזר במכונה,
  רפרטואר התרגילים המלא לפי תנוחה (שכיבה/כריעה/עמידה/ישיבה/צד/קפיצות/טבעת), איך
  נראה שיעור קבוצתי אמיתי, ובחירת תרגילים ויזואלית-שונים לריל. השתמש בכל פעם
  שמייצרים תמונה/וידאו של רפורמר, כדי שהמכונה והתרגיל ייראו אמיתיים (לא ספסל-כושר,
  לא רצועות מרחפות). Triggers: פילאטיס מכשירים, רפורמר, reformer, תרגיל פילאטיס,
  קריאייטיב פילאטיס, מכונת פילאטיס, אביזר רפורמר, ריל פילאטיס נערות, jump board.
---

# steps-reformer-pilates — אנציקלופדיית רפורמר לקריאייטיב

**מה זה:** מאגר-הידע המלא להפקת תמונה/וידאו של רפורמר שנראים אמיתיים — כל חלק, כל אביזר, כל תרגיל, עם **תיאור-ויזואלי מוכן להדבקה בפרומפט**. זה הידע על ה**נושא** (מה זה רפורמר), בנפרד מה**מלאכת-הפרומפט** (איך לבקש מ-GPT/Seedance — בסקיל `steps-ai-prompting`). השתמש בשניהם יחד.

**מה זה לא:** לא מתכון פרומפט (זה ב-`steps-ai-prompting`), לא pipeline הרכבה (ב-`steps-reel-pipeline`). זה ה"מילון" של עולם הרפורמר.

> 🏗️ **התבנית:** זה הסקיל הראשון מסוג "ידע-אימון". כל סוג אימון עתידי (GYM כוח / בר / יוגה / נוער / מזרן) יקבל סקיל ידע משלו באותו מבנה: (0) cues נגד מכונה-מומצאת · (1) חלקים ואביזרים · (2) רפרטואר לפי תנוחה · (3) איך נראה שיעור אמיתי · (4) בחירת 4–5 תרגילים שונים לריל.

**3 חוקי-העל לפני כל פרומפט-רפורמר:**

1. 🚫 **כלל אנטי-רצועות-מרחפות (הבאג מס' 1).** רצועות תמיד באחת מ-3 מצבים: **נאחזות ביד/רגל** · **תלויות רפויות מהגלגלות** · **מתוחות תחת מתח קפיץ**. **אף פעם לא צפות באוויר.** בכל תרגיל-רצועות כתוב מפורש: `hands/feet gripping the reformer straps, straps taut and under spring tension`. בתרגיל בלי רצועות: `no straps in frame, only the footbar / jump board`.
2. 🛏️ **כלל אנטי-מכונה-מומצאת.** ה-AI נוטה לצייר ספסל-כושר במקום רפורמר. 3 cues שמכריחים רפורמר אמיתי (ראה §0).
3. 📦 **כלל האביזרים.** Pulling Straps / T-Pull / Backstroke / Teaser / Swan = שכיבה **על ה-long box** (לא ישר על העגלה). Short Box = **יושבים על הארגז**. תמיד לציין את האביזר בפרומפט, אחרת ה-AI ישכיב את הדמות על העגלה.

⭐ = אנרגטי-ויזואלי (לשוט הוק) · 🪑 = רגוע/פסיבי (להימנע בסטטי) · 👥 = נראה מצוין כששורת נשים עושות אותו מסונכרן.

---

## §0 — 3 ה-Cues נגד "מכונה מומצאת" (חובה בכל פרומפט-רפורמר)

הטעות הכי שכיחה: מודל מצייר ספסל-כושר מרופד. שלושת ה-cues שמכריחים reformer אמיתי:

1. **המסגרת + העגלה המחליקה:** `a long low wooden/aluminum rectangular frame (~2.4m) with two parallel rails, and a padded sliding carriage on wheels inside the frame`. זה ההבדל הקריטי — מסגרת ארוכה עם עגלה מחליקה בתוכה, לא ספסל.
2. **שלושת המזהים:** `a curved padded foot-bar at one end, two vertical pulley risers with ropes and hand-loops at the same end, and color-coded coil springs underneath connecting the carriage to a spring bar`. בלי זה — מקבלים שולחן.
3. **שלילה מפורשת (negative cue):** `two black foam shoulder rests and a small adjustable headrest at the carriage end where the person lies; reformer pilates studio, NOT a gym weight bench or rowing machine`. לכתוב מה זה **לא** מונע את הבלבול הכי שכיח.

---

## §1 — טבלת חלקים ואביזרים מלאה

**חלקי הליבה (built-in — תמיד בקאדר של רפורמר):**

| חלק (אנ' / עב') | מראה לפרומפט | תפקיד | נע? |
|---|---|---|---|
| **Carriage** / עגלה מחליקה | padded vinyl platform (~60cm wide) on 4 wheels, sliding inside the frame | המשטח עליו שוכבים/יושבים/כורעים/עומדים | נע על המסילות |
| **Frame + Rails** / מסגרת + מסילות | long rectangular wooden/aluminum frame (~2.4m), two parallel rails | תשתית; מכוונת את תנועת העגלה | נייח |
| **Footbar** / מוט רגליים | curved padded metal bar at the front end, adjustable height | דוחפים בו ברגליים/ידיים; נקודת מנוף | נייח (מתכוונן) |
| **Shoulder Rests** / משענות כתפיים | pair of black foam rollers at the carriage head | חוסמות כתפיים בדחיפה; משטח לברכיים בכריעה | נע עם העגלה |
| **Headrest** / משענת ראש | small padded fold-up plate at the carriage end | תמיכת ראש/צוואר בשכיבה | נע (מתכוונן) |
| **Springs** / קפיצים | 4–6 color-coded coil springs underneath (אדום=כבד, צהוב/ירוק=קל — **משתנה בין מותגים**) | מקור ההתנגדות | נייח (נמתחים) |
| **Spring/Gear Bar** / מוט קפיצים | metal cross-bar at the carriage end where springs attach | עיגון הקפיצים; קובע עומס בסיס | נייח (מתכוונן) |
| **Ropes / Straps** / חבלים / רצועות | nylon ropes through pulleys to hands/feet, adjustable | מניעים את העגלה בכוח זרועות/רגליים | נע |
| **Pulleys + Risers** / גלגלות + עמודים | two vertical posts at the front with spinning pulleys on top | מנתבים את החבלים בזווית/גובה | נייח (גלגלת מסתובבת) |
| **Handles** / ידיות | hard plastic/metal handles at the rope ends | אחיזת כף-יד לפלג-גוף עליון | נע |
| **Foot Loops** / לולאות רגליים | soft padded loops at the rope ends | החדרת כף-רגל לתרגילי רגליים/בטן | נע |
| **Standing Platform** / פלטפורמת עמידה | flat padded board at the far front, outside the carriage | משטח יציב לעמידה/הנעה ברגל אחת | נייח |

**אביזרים נלווים (נשלפים — לציין מפורש כשבשימוש):**

| אביזר (אנ' / עב') | מראה לפרומפט | תפקיד |
|---|---|---|
| **Jump Board** / קרש קפיצה | large flat padded board where the footbar goes, vertical "wall" for the feet | קרדיו בשכיבה — קופצים בלי עומס מפרקים |
| **Long Box** / ארגז ארוך | padded rectangular box placed lengthwise **on** the carriage | מגביה לתרגילי גב/בטן/swan |
| **Short Box** / ארגז קצר | lower padded cube box placed crosswise on the carriage, person sits on it | ישיבה זקופה לליבה/עמ"ש |
| **Magic Circle** / טבעת קסם | flexible ring (~33cm) with two padded grip pads | התנגדות איזומטרית ירכיים/חזה/זרועות |
| **Sticky / Non-slip Pad** / משטח אחיזה | thin textured rubber mat on the carriage | מונע החלקה בעמידה/plank |
| **Pole / Dowel** / מקל | straight ~1m wooden/aluminum pole | יישור, טווח תנועה, איזון |
| **Neck Pillow** / כרית צוואר | small soft foam cushion on the headrest | ריפוד עורף בשכיבה |

---

## §2 — רפרטואר תרגילים מלא, לפי תנוחה

> בכל שורה: התיאור כתוב כך שאפשר להדביק ישר לפרומפט. ⭐ אנרגטי · 🪑 רגוע · 👥 מצוין לשורה קבוצתית.

### א. שכיבה על הגב (Supine)

| תרגיל | תיאור לפרומפט | אנרגיה |
|---|---|---|
| **Footwork** 🪑👥 | lying on her back on the carriage, head on the headrest, feet on the footbar, knees bending and straightening to push the carriage out and in, arms resting by her sides. No straps. | רגוע |
| ⭐ **The Hundred** 👥 | lying on back, head and shoulders curled up, legs straight at 45°, hands gripping the straps by her sides, pumping the arms in small beats — straps taut under spring tension, not floating. | דינמי |
| **Frog** 👥 | lying on back, feet in the straps, heels together knees open near the pelvis, straightening legs to 45° to slide the carriage out — straps taut throughout. | רגוע |
| **Leg Circles** 👥 | feet in straps, legs straight, drawing controlled circles in the air, pelvis stable on the carriage — straps taut along the whole circle. | רגוע |
| **Short Spine Massage** | feet in straps legs straight 45°, rolling the pelvis and spine up off the carriage overhead into a long arc, then articulating down vertebra by vertebra — straps taut. | רגוע (מורכב) |
| **Running** 🪑👥 | lying on back, balls of the feet on the footbar, alternately lifting and lowering the heels like running in place, carriage nearly still under tension. No straps. | רגוע |
| **Pelvic Lift / Curl** 👥 | lying on back, knees bent and heels on the footbar, rolling the spine off the carriage vertebra by vertebra into a bridge, holding, rolling down. No straps. | רגוע |
| **Arms in Straps — Supine** 👥 | lying on back, both hands gripping the straps with arms straight above the chest, lowering the straight arms toward the thighs and back — straps taut against the springs, pelvis stable. | רגוע |

### ב. שכיבה על הבטן (Prone — בדרך כלל על ה-long box)

| תרגיל | תיאור לפרומפט | אנרגיה |
|---|---|---|
| **Pulling Straps I** | lying prone face-down on the long box accessory, shoulders past the front edge, legs straight together behind, hands gripping the straps arms forward, then drawing the straight arms back alongside the body as the chest lifts into extension — straps taut. | בינוני |
| ⭐ **T-Pull / Pulling Straps II** 👥 | lying prone on the long box, arms out to the sides in a T at shoulder height palms down, lifting the chest and sweeping the straight arms back in the same plane — straps taut, "open wings". | דינמי |
| **Backstroke** | lying supine on the long box, head at the end, arms and legs lifted in a C, opening out and up like backstroke then gathering back to center, deep core hold — straps taut. | בינוני |
| ⭐ **Swan** | lying prone on the long box, hands on the footbar/frame, chest and head lifting into deep upper-back extension, long neck, chest open forward and up like a swan. | בינוני |
| **Breaststroke** | lying prone on the long box, arms start tucked, reach forward then sweep wide and back as the chest lifts — whole body "swimming" forward. | דינמי |
| **Teaser** | seated V-balance on the end of the long box, body and legs forming a V, straps taut in the hands, slow roll back and up holding the V. | דינמי (ליבה) |

### ג. כריעה (Kneeling — ברכיים על העגלה)

| תרגיל | תיאור לפרומפט | אנרגיה |
|---|---|---|
| **Down Stretch** 👥 | kneeling upright facing the footbar, feet against the shoulder rests, hands on the footbar, opening the chest and arching the back into extension as the carriage pushes out, "heart forward". | בינוני |
| ⭐ **Knee Stretch — Round** 👥 | kneeling on the carriage, hands on the footbar, back rounded in a C-curve, head down, driving the carriage back-and-forth with the knees — straps hang loose at the front pulleys. | דינמי |
| **Knee Stretch — Flat** 👥 | same as Round but the back is flat and parallel to the floor, hands on footbar, knees on carriage, pushing back and in. | דינמי |
| **Knee Stretch — Knees Off** | same but knees hover 2–3cm above the carriage throughout — intense core, carriage driving in and out, knees never touching. | דינמי (מתקדם) |
| ⭐ **Kneeling Side Kicks / Star** | kneeling sideways on the carriage, one hand on the footbar, pushing the carriage out with the top arm while extending the opposite leg and arm into one long line — dramatic star/arrow shape, full side-body tension. | דינמי מאוד |
| **Arms in Straps — Kneeling** 👥 | kneeling upright on the carriage, knees hip-width near the shoulder rests, hands gripping the straps raised to shoulder height, bending elbows to bring hands to the chest then straightening (or opening to the sides) — straps taut, core balancing. | בינוני |
| **Eve's Lunge** 👥 | kneeling on the carriage, hands and front foot on the footbar, back leg pressed to the shoulder rest, pushing the carriage out with the back leg for a deep hip-flexor stretch, long spine — extended diagonal line. | בינוני (מתיחה) |

### ד. עמידה (Standing — על העגלה / על הפלטפורמה)

| תרגיל | תיאור לפרומפט | אנרגיה |
|---|---|---|
| ⭐ **Standing Side Splits** 👥 | standing tall and controlled, one foot on the fixed platform the other on the moving carriage, legs opening sideways against the spring resistance, arms open in a T, gaze forward — wide dramatic symmetrical pose. | גבוהה |
| ⭐ **Standing Lunge** | deep lunge on the carriage, front knee over ankle, hands on the footbar, rising to full balance while opening the arms to a T or overhead — a challenging balance moment, visual tension. | גבוהה מאוד (איזון) |
| ⭐ **Skater** 👥 | one foot on a long box across the carriage and the other on the carriage, body leaning diagonally like an ice-skater, gliding the carriage out and in with control, arms swinging for balance. | גבוהה (זורמת) |
| **Elephant** 👥 | standing on the carriage, feet flat against the shoulder rests, hands on the footbar, back rounded and head down (inverted V), hips high, pushing the carriage back with the heels keeping the round. No straps. | בינוני |
| **Up Stretch** | standing on the carriage facing the footbar, feet forward from the shoulder rests weight in the heels, hands on the footbar, body in an inverted-∧ pike, pushing the carriage out to plank and back, long spine. | דינמי (מתקדם) |
| **Standing Footwork** 👥 | standing facing the footbar, feet on the bar, balancing and pressing the carriage with controlled knee bend-and-straighten — tall posture, quiet thorough leg work. | בינוני |
| **Sunburst / Standing Splits** 👥 | balancing in a wide stance, legs opening into rays against the springs, arms spreading out like sun rays — wide symmetrical pose, open breath. | גבוהה |

### ה. ישיבה (Seated — על העגלה / על ה-short box)

| תרגיל | תיאור לפרומפט | אנרגיה |
|---|---|---|
| **Stomach Massage** 👥 | sitting at the edge of the carriage, feet on the footbar (heels lifted), back rounded forward in a C-curve, hands holding the back edge of the carriage, pushing the carriage out with the legs and folding back in. | בינוני |
| **Seated Rowing / Arms** 👥 | sitting upright on the carriage, back to the springs, gripping the strap-handles and pulling the arms back in a row against resistance — shoulder blades drawing together, chest open, regal posture. | בינוני |
| **Chest Expansion** 👥 | sitting/kneeling upright, holding the straps, pulling both arms straight back behind the body and holding — chest wide open, gaze forward, proud posture, balance on the moving carriage adds tension. | בינוני |
| **Short Box — Round Back** 👥 | sitting on the short box on the carriage, feet under the safety strap, tucking the tailbone and rolling the spine back into a C-curve to parallel and back up, arms reaching forward. | רגוע |
| **Short Box — Flat Back** 👥 | sitting on the short box, hinging back with a perfectly straight elongated spine (no rounding), arms reaching forward or overhead. | בינוני |
| ⭐ **Short Box — Twist** 👥 | hinging back with a flat back, then rotating the torso to one side with a stable pelvis and sweeping back to front — rotation + core control. | בינוני |
| **Climb-A-Tree** | holding one straight lifted leg, "climbing" the hands up the leg ankle-to-hip and back while rolling the spine back — hamstring stretch + control. | בינוני |

### ו. שכיבה צידית (Side-Lying — לרוב על ה-long box)

| תרגיל | תיאור לפרומפט | אנרגיה |
|---|---|---|
| ⭐ **Seated Mermaid / Side Over** 👥 | sitting sideways on a long box (Z-sit, one leg folded front one back), lower hand on the footbar, upper arm curving overhead into a deep side-bend — long elegant body arc, beautiful oblique line. | גבוהה (אלגנטית) |
| **Side-Lying Leg Series / Sleeper** 👥 | lying on her side on the carriage, top foot on the footbar, pelvis stacked, pushing the carriage out and in with the top leg for lateral hip work — long clean profile line. | בינוני |
| ⭐ **Side Over (on the box)** 👥 | lying on her side over a long box, legs anchored, lowering and lifting the torso in a side-bend against body weight — strong obliques, deep controlled motion. | גבוהה |

### ז. קפיצות (Jump Board — קרדיו, שכיבה על הגב)

> הגדרה: שכיבה על הגב, כפות הרגליים על לוח אנכי בקצה. קרדיו עם אפס עומס. בד"כ 2 קפיצים אדומים (כבד). **No straps in frame, only the jump board.**

| תרגיל | תיאור לפרומפט | אנרגיה |
|---|---|---|
| ⭐⭐ **Double Leg Jumps** 👥 | lying on back, both feet together pushing explosively off the vertical jump board, carriage sliding out and back, body aligned, core engaged — like a horizontal trampoline. | הכי אנרגטי |
| ⭐ **Single Leg / Bicycle Jumps** | same position, one foot at a time pushing alternately in a cycling/running-in-air motion. | מהיר, קצבי |
| ⭐ **In & Out Jump Squats** | feet together on the board → jump to a wide squat stance → back to together. | קרדיו |
| ⭐ **Starfish / Jumping Jacks** | legs opening wide into a star while jumping off the board, body open. | אנרגטי |
| **Side-Lying Jumps** | lying on the side on the carriage, only the top leg on the board, lateral jumps — single-sided hip/glute focus. | ממוקד |

### ח. טבעת קסם (Magic Circle — התנגדות איזומטרית)

| תרגיל | תיאור לפרומפט | אנרגיה |
|---|---|---|
| **Inner Thigh Squeeze** | the ring between the inner thighs, isometric squeeze inward — can be supine on the reformer with heels on the bar. | רגוע (איזומטרי) |
| **Halo / Overhead Arms** 👥 | holding the ring overhead, elbows softly bent like a halo, pressing inward — opens chest and upper back. | בינוני |
| **Chest / Forearm Press** | the ring between the palms or forearms in front of the chest, pressing — engages shoulders, chest, upper back. | בינוני |

---

## §3 — איך נראה שיעור קבוצתי **אמיתי** (כדי שהקריאייטיב לא ייראה תפאורה)

המודל נוטה לצייר "סטודיו ראווה" ריק או כאוטי. כדי שייראה שיעור אמיתי:

**גודל ופריסה:**
- שיעור טיפוסי = עד ~9 מתאמנות (semi-private = 2–4; קבוצה גדולה עד ~20).
- המכשירים ב**שורות מקבילות** — `a row of identical reformers, women on parallel machines facing the same way`.
- **כולן באותו תרגיל באותו רגע** = החתימה של שיעור אמיתי (סנכרון), עם וריאציות קלות לפי רמה.

**תפקיד המאמנת (זה הלב של ה"אמיתי"):**
- המאמנת **לא מתאמנת איתן** — היא נעה במרחב, מדגימה בחזית ואז סורקת לתיקון יישור.
- בפרומפט: `a female coach standing and guiding, pointing, NOT lying on a machine, dressed differently from the participants`.
- מכוונת קפיצים אישית לכל אחת → `springs in different colors visible across the room` (מראה שכוונן אישית).

**אביזר אחד דומיננטי לסגמנט:** בשיעור אמיתי **כל החדר עובר יחד** לאותו אביזר (כולן jump board, או כולן magic circle, או כולן long box). **לא** כל אחת על משהו אחר — זה ייראה מבוים.

**צ'קליסט "נראה אמיתי" לפרומפט:**
1. שורות רפורמרים זהים, מתאמנות מסונכרנות באותו תרגיל.
2. מאמנת לבושה אחרת / עומדת / מצביעה — לא שוכבת על מכשיר.
3. אותו אביזר בכל החדר באותו רגע.
4. קפיצים בצבעים שונים גלויים.
5. תאורת סטודיו אמיתית, מבטים ממוקדים / מאמץ אמיתי — לא חיוכי-סטוק.

---

## §4 — לבחור 4–5 תרגילים **ויזואלית שונים** לריל (לא לחזור על אותה תנוחה)

הטעות: 5 שוטים שכולם "אישה שוכבת על הגב". ריל מנצח = **כל שוט בתנוחה אחרת** → מקצב ויזואלי + מראה "שיעור מלא ועשיר". בחר אחד מכל שורה:

| # | שוט | תנוחה | למה נבחר |
|---|---|---|---|
| 1 | ⭐ **Jump Board — Double Leg Jumps** | שכיבה-קפיצות | האנרגיה הכי גבוהה — הוק פותח, תנועה+זיעה |
| 2 | ⭐ **Knee Stretch — Round** | כריעה | קצבי, נראה מצוין מסונכרן בשורה |
| 3 | ⭐ **Standing Side Splits** *(או Standing Lunge)* | עמידה | "לא-צפוי" — רוב הקהל מכיר רפורמר בשכיבה בלבד |
| 4 | ⭐ **Seated Mermaid / Side Over** | קופסה / צד | אלגנטי-נשי, קשת גוף ארוכה — מושלם לקהל STEPS |
| 5 | **Arms in Straps — Kneeling** *(או Chest Expansion)* | רצועות-זקוף | פלג-גוף עליון, מאתגר שיווי-משקל, "מתח שקט" |

**כללי-זהב לבחירה:**
- אל תשים שני שוטים מאותה משפחת-תנוחה ברצף (לא Footwork + Hundred + Frog — כולם supine).
- שלב **לפחות שוט עמידה אחד** (1-3) — הכי בולט בפיד.
- **תרגילים מתקדמים** (Standing Lunge, Knees-Off, Star) — רק עם מתאמנת מנוסה, או סמן בקופי "ברמה מתקדמת".
- KIDS/נערות → לבוש מלא, פעילות תמימה, אווירה wholesome (ר' `steps-ai-prompting §2`). חל גם כאן.

**הכי דרמטיים לפרסום (אם צריך שוט-"וואו" יחיד):** Star/Kneeling Side Kicks · Standing Lunge (איזון) · Seated Mermaid · Standing Side Splits — כולם נקרפים יפה ל-9:16 ול-1:1.
