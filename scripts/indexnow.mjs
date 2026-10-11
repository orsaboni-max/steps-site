// IndexNow: מודיע ל-Bing (ולמנועים שמשתפים איתו) על כל כתובות ה-sitemap. הרצה אחרי כל העלאה.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const host = 'stepsnetanya.co.il';
const keyFile = readdirSync(root).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('IndexNow key file (<32 hex>.txt) not found at repo root');
const key = keyFile.replace('.txt', '');

const xml = readFileSync(join(root, 'sitemap.xml'), 'utf8');
const urlList = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList }),
});
console.log(`IndexNow: ${urlList.length} URLs submitted, HTTP ${res.status}`);
if (res.status !== 200 && res.status !== 202) console.log(await res.text());
