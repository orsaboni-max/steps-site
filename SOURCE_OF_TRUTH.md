# 🧭 SOURCE OF TRUTH — איזה קובץ הוא האמת על כל נושא
> עודכן: 2026-05-29 | **כל סוכן AI (Claude / Codex) קורא את הקובץ הזה ראשון.**
> מטרה: יש שני סוכנים שעבדו כאן. כדי שלא יהיה בלבול — לכל נושא יש **קובץ אחד מנצח**.

## 📍 מקור אמת יחיד לכל נושא

| נושא | ✅ הקובץ המנצח (האמת) | קבצים משלימים (לא לסתור) |
|------|----------------------|--------------------------|
| **מצב כללי של הפרויקט** | `PROJECT_STATE.md` | — |
| **מה חי עכשיו ב-Meta (קמפיינים, IDs)** | `marketing/STATUS.md` | PROJECT_STATE מצטט אותו |
| **משימות פתוחות** | `TASKS.md` | — |
| **החלטות נעולות (אסור לפתוח)** | `DECISION_LOG.md` | — |
| **בדיקות לפני "מוכן"** | `VALIDATION_GATES.md` | — |
| **מותג, טון, ויזואל, איסורים** | `marketing/brand/brand-dna.md` | brand-profile.json |
| **ידע Meta (ספים, נוסחאות, best practices)** | `marketing/meta-playbook.md` | ops/meta-official-performance-playbook.md (עקרונות + לינקים רשמיים) |
| **צינור לידים (SOP)** | `marketing/ops/lead-pipeline-sop.md` | lead-pipeline-build-spec.md |
| **מחקר מתחרים** | `marketing/research/competitor-research.md` | — |
| **אסטרטגיית שיווק (גיוס)** | `marketing/MARKETING-STRATEGY.md` | — |
| **קריאייטיב מנצח שלי** | `marketing/research/my-winners.md` (מ-Meta) | מתעדכן שבועי |
| **השראת קריאייטיב חו"ל** | `marketing/research/inspiration-abroad.md` | — |
| **דשבורד רעיונות קריאייטיב** | `marketing/creative/idea-dashboard.html` | מתעדכן שני 09:00 |
| **בייסליין ביצועים** | `marketing/reports/baseline-2026-05.md` | — |
| **ייחוס לקוחות (מקור→המרה)** | דוח Arbox `manage.arboxapp.com/reports-v5/converted-leads-report` + `marketing/reports/converted-leads-2026-05.md` | ⚠️ לא דרך `/membership` או `/leads` API — הוכחו לא אמינים |
| **נטישה / churn** | דוחות Arbox: `מנויים שהסתיימו` + `לקוחות לא פעילים` (UI) | ⚠️ לא דרך `/membership` API |
| **מסירת Claude→Codex** | `HANDOFF.md` | לקריאה בלבד, לא עבודה יומית |

## 🔌 שני חיבורי Arbox (שניהם לגיטימיים — לא כפילות!)
| חיבור | קובץ | למי |
|------|------|-----|
| **Python MCP** | `C:\Users\USER\mcp-servers\arbox_server.py` (גיבוי: `marketing/ops/arbox_server.py`) | Claude Code |
| **JS MCP** | `C:\Users\USER\mcp-servers\arbox_codex_mcp.js` | Codex |
שניהם קוראים מאותו Arbox API. שניהם מחזירים סיכומים בלי נתונים אישיים. **לא למחוק אף אחד.**

## 🧠 זיכרון אישי של אור (מחוץ ל-repo, משותף לכל הסוכנים)
`C:\Users\USER\.claude\projects\C--Users-USER-steps-site\memory\`
- קבצי `feedback_*.md` — לקחים שאסור לחזור עליהם (הכי חשוב: `feedback_no_overpromise_trust.md`)
- קבצי `project_*.md` — מצב כל תת-פרויקט

## ⚖️ כלל פתרון התנגשויות
אם שני קבצים סותרים זה את זה על אותו נושא — **הקובץ המנצח בטבלה למעלה גובר.** מעדכנים את המשלים שיתאים, לא הפוך.

## 🤝 שני סוכנים, repo אחד
Claude ו-Codex כותבים **לאותו GitHub** (`orsaboni-max/steps-site`). העבודה משותפת — לא תקועה אצל אחד. אור יכול לעבוד עם כל כלי, והשני יראה את אותם קבצים. **אין צורך לבחור כלי — רק לשמור על מקור אמת יחיד לכל נושא (הטבלה למעלה).**
