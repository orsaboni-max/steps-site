---
paths:
  - "vercel.json"
  - ".vercelignore"
---
# כללי דיפלוי (Vercel)

- **להעלות רק מ-`C:\Users\USER\steps-site`**, אחרי מיזוג ל-`main`. `npx vercel --yes --prod` מתוך worktree יוצר פרויקט Vercel חדש (קרה 2/8/26 — `gracious-bohr-fa745b` הוסר).
- לפני העלאה: `grep -c FFD400 index.html` = 1. אם 0 — תיקייה לא נכונה, לא להעלות.
- **קבצים פנימיים שחייבים להישאר חסומים ב-`.vercelignore`:** `ads-board.html` (תקציב הפרסום קשיח ב-HTML), `ads.html`, `api/ads-performance.ts`, `nutrition-v3.html`, `scratch_reviews.txt`, `tests/`, `api/*.test.mjs`. אחרי כל העלאה לוודא שהם מחזירים 404.
- `.vercelignore` חוסם `*.md` אבל לא `.txt` — `llms.txt` חייב לעלות; טיוטות `.txt` נחסמות בשם.
- `vercel.json`: הפניית `www` → דומיין ראשי, `nutrition-v3.html` → `nutrition.html` (307), כותרות אבטחה (CSP frame-ancestors, nosniff, Referrer-Policy, Permissions-Policy), cache לתמונות. לא להסיר.
- אחרי העלאה: אימות חי על הדומיין (דפי לקוחות 200, `/api/schedule` מחזיר שיעורים, פנימיים 404) + שורה חדשה למעלה ב-`docs/DEPLOY-LOG.md`.
