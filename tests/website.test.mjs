import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => fs.readFileSync(root + file, 'utf8');
const home = read('index.html');
import { visibleFaq, schemaFaq } from './faq-extract.mjs';
const flush = () => new Promise(resolve => setImmediate(resolve));

class Target {
  constructor() { this.listeners = new Map(); this.style = {}; this.value = ''; this.disabled = false; this.classList = { toggle() {} }; }
  addEventListener(type, fn, options) {
    const list = this.listeners.get(type) || [];
    list.push({ fn, once: options?.once }); this.listeners.set(type, list);
  }
  dispatchEvent(event) {
    for (const handler of [...(this.listeners.get(event.type) || [])]) {
      if (handler.once) this.listeners.set(event.type, this.listeners.get(event.type).filter(h => h !== handler));
      handler.fn.call(this, event);
    }
  }
  focus() { this.focused = true; }
}

function formHarness(fetchResult) {
  const document = new Target(), events = [], requests = [];
  const elements = Object.fromEntries(['leadForm', 'leadName', 'leadPhone', 'leadHp', 'leadErr'].map(id => [id, new Target()]));
  const button = new Target();
  elements.leadForm.querySelector = () => button;
  const context = { document, $: id => elements[id.slice(1)], STEPS_REFERRAL: {},
    location: { href: 'https://stepsnetanya.co.il/' },
    gtag: (...args) => events.push(['ga', ...args]), fbq: (...args) => events.push(['meta', ...args]),
    CustomEvent: class { constructor(type) { this.type = type; } },
    fetch: (...args) => { requests.push(args); return fetchResult(); }
  };
  const formStart = home.indexOf('/* ── טופס לידים');
  vm.runInNewContext(home.slice(formStart, home.indexOf('/* ── עוגיות', formStart)), context);
  const trackingStart = home.indexOf('/* ── מדידת המרות');
  const tracking = home.slice(trackingStart, home.indexOf('</script>', trackingStart)).trim().replace(/\}\)\(\);$/, '');
  vm.runInNewContext(tracking, context);
  return { elements, button, document, events, requests,
    submit(name = 'בודקת מקומית', phone = '0521234567') {
      elements.leadName.value = name; elements.leadPhone.value = phone;
      elements.leadForm.dispatchEvent({ type: 'submit', preventDefault() {} });
    }
  };
}
const successfulResponse = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
const leads = h => h.events.filter(e => e[0] === 'meta' && e[1] === 'track' && e[2] === 'Lead');

test('invalid fields never request CRM or emit successful lead events', async () => {
  const h = formHarness(successfulResponse);
  h.submit('', '0521234567'); h.submit('שם', '123'); h.submit('א'.repeat(41));
  await flush();
  assert.equal(h.requests.length, 0); assert.equal(h.events.length, 0);
});

test('navigation clicks remain interest events, not saved leads', () => {
  const h = formHarness(successfulResponse);
  h.document.dispatchEvent({ type: 'click', target: { closest: () => ({
    getAttribute: () => 'trial-cta arbox-open', textContent: 'אימון היכרות', href: 'https://example.invalid/'
  }) } });
  assert.ok(h.events.some(e => e[2] === 'cta_trial_click'));
  assert.equal(leads(h).length, 0);
  assert.equal(h.requests.length, 0);
});

test('a saved lead emits exactly once, after server success, with no name or phone', async () => {
  let resolve;
  const h = formHarness(() => new Promise(r => { resolve = r; }));
  h.submit(); h.submit();
  assert.equal(h.requests.length, 1); assert.equal(leads(h).length, 0);
  resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
  await flush();
  assert.equal(leads(h).length, 1);
  assert.equal(h.events.filter(e => e[0] === 'ga' && e[2] === 'lead_form_submit').length, 1);
  assert.equal(h.elements.leadForm.style.display, 'none');
  assert.doesNotMatch(JSON.stringify(h.events), /בודקת|0521234567/);
  h.submit(); h.document.dispatchEvent({ type: 'steps:lead-saved' });
  assert.equal(h.requests.length, 1); assert.equal(leads(h).length, 1);
});

for (const [name, response] of [
  ['server rejection', () => Promise.resolve({ ok: false, status: 502 })],
  ['network failure', () => Promise.reject(new Error('offline'))],
  ['unexpected success body', () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })]
]) test(name + ' keeps the form retryable without a lead event', async () => {
  const h = formHarness(response); h.submit(); await flush();
  assert.equal(leads(h).length, 0); assert.equal(h.button.disabled, false);
  assert.match(h.elements.leadErr.textContent, /נסי שוב/);
});

test('the honeypot response is not counted as a customer lead', async () => {
  const h = formHarness(successfulResponse); h.elements.leadHp.value = 'bot';
  h.submit(); await flush(); assert.equal(leads(h).length, 0);
});

test('children and teens are selectable separately, including teen reformer sessions', () => {
  const start = home.indexOf('function roomOf('), end = home.indexOf('function roomLabel', start);
  const context = {}; vm.runInNewContext(home.slice(start, end), context);
  for (const name of ['STEPS KIDS (12-15)', 'פילאטיס נערות', 'כושר לנוער', 'TEENS']) assert.equal(context.roomOf(name), 'KIDS');
  for (const [name, room] of [['פילאטיס מכשירים','REF'], ['פילאטיס מזרן','MOVE'], ['Barre נשים בלבד','MOVE'], ['Endurance','GYM'], ['אימון כוח חדש','GYM']]) assert.equal(context.roomOf(name), room);
});

test('the adult gym schedule excludes youth strength sessions', () => {
  const source = read('gym-women.html');
  const start = source.indexOf('function isGym('), end = source.indexOf('function mkEl', start);
  const context = {}; vm.runInNewContext(source.slice(start, end), context);
  for (const name of ['STEPS KIDS (12-15)', 'GYM KIDS', 'Teens Endurance', 'אימון כוח לנערות', 'כוח לנערים', 'אימון ילדים']) assert.equal(context.isGym(name), false, name);
  for (const name of ['GYM נשים בלבד', 'Endurance', 'BOOTCAMP', 'אימון כוח']) assert.equal(context.isGym(name), true, name);
});

test('marketing pages retain valid scripts, structured data and reachable local fragments', () => {
  const pages = [...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname.slice(1) || 'index.html');
  for (const page of pages) {
    const html = read(page);
    for (const [,attrs,body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/application\/ld\+json/.test(attrs)) JSON.parse(body);
      else if (!/\bsrc=/.test(attrs) && body.trim()) new vm.Script(body, { filename: page });
    }
    for (const [,href] of html.matchAll(/href="([^"#]*#[^"]+)"/g)) {
      const url = new URL(href.replaceAll('&amp;', '&'), 'https://stepsnetanya.co.il/'+page);
      if (url.hostname !== 'stepsnetanya.co.il' || url.hash === '#') continue;
      const target = url.pathname.slice(1) || 'index.html';
      assert.ok(read(target).includes('id="'+decodeURIComponent(url.hash.slice(1))+'"'), page+' has missing target '+href);
    }
  }
});

test('click tracking across service pages and guides does not use standard Meta Lead', () => {
  for (const file of ['gym-women.html', 'pilates.html', 'barre.html', 'nutrition.html', 'content.js', 'kids.html']) {
    const source = read(file);
    assert.doesNotMatch(source, /fbq\(['"]track['"],\s*['"]Lead['"]/i, file);
  }
});

function healthClubOf(html) {
  for (const [,attrs,body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!/application\/ld\+json/.test(attrs)) continue;
    const data = JSON.parse(body);
    for (const node of Array.isArray(data['@graph']) ? data['@graph'] : [data]) {
      if (node['@type'] === 'HealthClub') return node;
    }
  }
  return null;
}
const sitePages = () => [...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname.slice(1) || 'index.html');

test('every page shares one HealthClub identity block (@id, address, phone, hours, priceRange) with index.html', (t) => {
  const home = healthClubOf(read('index.html'));
  assert.ok(home && home['@id'], 'index.html must carry the canonical HealthClub @id');
  for (const page of sitePages()) {
    if (page === 'index.html') continue;
    const club = healthClubOf(read(page));
    if (page === 'accessibility.html' || page === 'privacy.html') continue; // legal pages carry no business schema
    assert.ok(club && club['@id'], page + ' must carry the HealthClub identity block');
    assert.equal(club['@id'], home['@id'], page + ' @id');
    assert.deepEqual(club.address, home.address, page + ' address');
    assert.equal(club.telephone, home.telephone, page + ' telephone');
    assert.deepEqual(club.openingHoursSpecification, home.openingHoursSpecification, page + ' hours');
    assert.equal(club.priceRange, home.priceRange, page + ' priceRange');
  }
});

test('barre.html H1 reads as one phrase once its own session lands it', (t) => {
  const source = read('barre.html');
  const h1 = source.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const text = h1[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
  assert.equal(text, 'אימון בר בנתניה');
});

test('every wa.me link across the site is attributable to the website', () => {
  for (const page of sitePages()) {
    const html = read(page);
    for (const [,text] of html.matchAll(/https:\/\/wa\.me\/972527927575\?text=([^"'&]+)/g)) {
      const decoded = decodeURIComponent(text.replace(/\+/g, '%20'));
      assert.match(decoded, /הגעתי מהאתר/, page + ': ' + decoded);
    }
  }
});

test('the published review count is the same number everywhere it appears', () => {
  const counts = new Set();
  for (const page of sitePages()) {
    for (const [,n] of read(page).matchAll(/(\d+)\s*ביקורות/g)) counts.add(n);
  }
  assert.ok(counts.size <= 1, 'inconsistent review counts across pages: ' + [...counts].join(', '));
});

// A new guide used to reach Google through two pages only: the cluster it belonged to
// linked it and nothing else did. One shared list, asserted here, is what keeps that from
// happening again the next time a cluster ships.
const footerGuides = html => {
  const block = html.match(/מדריכים<\/(?:div|p)>([\s\S]*?)<\/(?:ul|nav)>/);
  return block && [...block[1].matchAll(/href="([^"]+\.html)"/g)].map(m => m[1]);
};

test('every page that lists guides in its footer lists the same ones, and they all exist', () => {
  const pages = sitePages();
  const expected = footerGuides(read('index.html'));
  assert.ok(expected && expected.length, 'index.html must carry the canonical guide list');
  for (const guide of expected) {
    assert.ok(pages.includes(guide), 'footer links ' + guide + ', which is not in sitemap.xml');
  }
  for (const page of pages) {
    const links = footerGuides(read(page));
    if (!links) continue; // kids.html and the legal pages carry a short footer by design
    assert.deepEqual(links, expected, page + ' footer guide list has drifted from index.html');
  }
});

// AI crawlers do not run JavaScript. Every schedule on the site is fetched from
// /api/schedule on the client, so a page that ships an empty container answers
// "when are the classes?" with nothing at all — which is what pilates.html did
// until 18/09/26. Fixing only the page that was reported would have left the
// homepage and the two other schedule pages silently broken, so the guard lives
// here, on the shared condition, rather than in three separate assertions.
test('every page with a live schedule also ships one in the raw HTML', () => {
  for (const page of sitePages()) {
    const html = read(page);
    if (!html.includes('/api/schedule')) continue;
    const visible = html.replace(/<script[\s\S]*?<\/script>/gi, ' ');
    // Opening hours (footer, schema, contact block) alone reach ~10 matches, so a
    // count threshold barely above that would pass on a page carrying no schedule.
    // Anchor on the schedule itself: it has to name every weekday.
    for (const day of ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי']) {
      assert.ok(visible.includes(day),
        page + ' calls /api/schedule but its server-rendered HTML never names ' + day);
    }
    const times = visible.match(/\b([01]?\d|2[0-3]):[0-5]\d\b/g) || [];
    assert.ok(times.length >= 18,
      page + ' calls /api/schedule but its server-rendered HTML holds only ' +
      times.length + ' times — an AI crawler sees an empty schedule');
    assert.match(visible, /עודכן לאחרונה/,
      page + ' publishes a schedule with no visible freshness date');
  }
});

// A page that tells the reader one author and tells Google another is worse than
// naming no author at all. This shipped on 18/09: the visible byline was switched
// to a person while the Article schema still said Organization, because the
// replacement matched a JSON.stringify form rather than the raw file text — and
// nothing caught it until the live page was read back.
test('the visible byline and the schema author name the same person', () => {
  for (const page of sitePages()) {
    const html = read(page);
    const byline = html.match(/<p class="byline"[^>]*>([\s\S]*?)<\/p>/);
    if (!byline) continue;
    const shown = byline[1].replace(/<[^>]+>/g, '');
    const person = shown.match(/נכתב על ידי ([^·,]+)/);
    if (!person) continue;                       // a byline that names no author
    const name = person[1].trim();
    for (const block of html.matchAll(/<script[^>]*ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
      const parsed = JSON.parse(block[1]);
      const nodes = parsed['@graph'] || (Array.isArray(parsed) ? parsed : [parsed]);
      for (const node of nodes) {
        if (node['@type'] !== 'Article') continue;
        assert.equal(node.author?.['@type'], 'Person',
          page + ' shows a named author but its Article schema credits ' +
          node.author?.['@type']);
        assert.ok(name.startsWith(node.author.name),
          page + ' byline says "' + name + '" but schema says "' + node.author.name + '"');
      }
    }
  }
});

// lastmod is how Google decides when a page is worth re-crawling. On 19/09 every
// one of the 18 entries was stale — some by a month — while the pages themselves
// displayed a much newer "עודכן" date, so the work shipped that week had no signal
// telling Google to come back for it. The invariant is coherence: the sitemap may
// not claim a page is older than the page claims about itself.
const hebrewDate = html => {
  const iso = html.match(/<time datetime="(\d{4}-\d{2}-\d{2})"/);
  if (iso) return iso[1];
  const dmy = html.match(/עודכן[^<]*?(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!dmy) return null;
  const [, d, m, y] = dmy;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
};

test('sitemap lastmod is never older than the date the page shows the reader', () => {
  const xml = read('sitemap.xml');
  const entries = [...xml.matchAll(
    /<loc>https:\/\/stepsnetanya\.co\.il\/([^<]*)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)];
  assert.ok(entries.length >= 16, 'sitemap lost entries: ' + entries.length);
  for (const [, path, lastmod] of entries) {
    const file = path === '' ? 'index.html' : path;
    const shown = hebrewDate(read(file));
    if (!shown) continue;                       // page displays no date of its own
    assert.ok(lastmod >= shown,
      file + ' shows "' + shown + '" but sitemap lastmod says ' + lastmod +
      ' — Google is told the page is older than the page says it is');
  }
});

// The six cluster pages shipped pointing at their parent's share image, so a link
// to gym-menopause.html looked exactly like a link to gym-women.html in WhatsApp
// and on Facebook. Each page now carries its own card; the invariant that keeps it
// that way is uniqueness, not a list of filenames.
test('every page links a share image that exists, fits the budget, and is its own', () => {
  const seen = new Map();
  for (const page of sitePages()) {
    const html = read(page);
    const og = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (!og) continue;                          // legal pages ship no card
    const twitter = html.match(/<meta name="twitter:image" content="([^"]+)"/);
    assert.equal(twitter?.[1], og[1], page + ' names a different image to Twitter');

    const file = og[1].replace('https://stepsnetanya.co.il/', '');
    assert.ok(fs.existsSync(root + file), page + ' points at a missing image: ' + file);
    const kb = fs.statSync(root + file).size / 1024;
    assert.ok(kb <= 150, file + ' is ' + kb.toFixed(0) + 'KB, over the 150KB budget');

    assert.ok(!seen.has(file),
      page + ' shares its share image with ' + seen.get(file) + ' — both links preview the same card');
    seen.set(file, page);
  }
  assert.ok(seen.size >= 16, 'pages lost their share images: ' + seen.size);
});

// Headings use <br> to control where the line wraps. A browser renders that as a
// break, but a parser that reads the text without rendering it concatenates the
// two sides: "איך נראה שיעור בר<br>מהרגע שנכנסת" came out as "שיעור ברמהרגע".
// AI crawlers do not render, so the heading they read was a non-word. A single
// space before the <br> costs nothing on screen and keeps the text readable.
test('no heading glues two words together where it breaks the line', () => {
  let checked = 0;
  for (const page of sitePages()) {
    const html = read(page);
    for (const [, , inner] of html.matchAll(/<(h[1-3])\b[^>]*>([\s\S]*?)<\/\1>/g).map(m => [m[0], m[1], m[2]])) {
      if (!/<br\s*\/?>/i.test(inner)) continue;
      checked++;
      assert.ok(!/\S<br\s*\/?>/i.test(inner),
        page + ' has a heading with no space before its line break, so text extraction reads it as one word: ' +
        inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
    }
  }
  assert.ok(checked >= 30, 'headings lost their line breaks: ' + checked);
});

// Google's FAQPage rules require the answer in the markup to be the same content the
// reader sees on the page. The two copies drifted apart on 12 pages — in every case the
// JSON-LD said more than the visible answer, and three answers were never rendered at
// all. Same failure family as the author/schema mismatch of 2026-09-19: a second copy of
// the text that nothing compares against.
test('every FAQPage answer says exactly what the reader sees', () => {
  let checked = 0;
  for (const page of sitePages()) {
    const html = read(page);
    const schema = schemaFaq(html);
    if (!schema.length) continue;
    const visible = new Map(visibleFaq(html).map(p => [p.q, p.a]));
    for (const { q, a } of schema) {
      checked++;
      assert.ok(visible.has(q), page + ' declares a question to Google that is not on the page: ' + q);
      assert.equal(a, visible.get(q), page + ' — the answer Google is given differs from the visible one, for: ' + q);
    }
  }
  assert.ok(checked >= 130, 'pages lost their FAQ schema: ' + checked);
});

// RV2 מדד שכל עשרת המדריכים עונים בפרוזה בלבד: שניים מהם בלי טבלה בכלל, וכולם
// בלי וידאו ובלי משהו שאפשר ללחוץ עליו. מדריך הוא דף שנכתב כדי לענות על שאלה,
// וגוגל ומנועי ה-AI מצטטים דף שעונה ביותר מצורה אחת. הקבוצה נגזרת מפירורי הלחם
// (דף בעומק שלוש = מדריך בתוך אשכול) ולא מרשימת שמות, כדי שהאשכול הבא ייבדק גם הוא.
const clusterGuides = () => sitePages().filter(page => {
  const crumbs = read(page).match(/"@type":\s*"BreadcrumbList"[\s\S]*?<\/script>/);
  return crumbs && [...crumbs[0].matchAll(/"position":\s*(\d+)/g)].length === 3;
});

test('every cluster guide answers in more than prose — table, video and a day picker', () => {
  const guides = clusterGuides();
  assert.ok(guides.length >= 10, 'cluster guides disappeared from the sitemap: ' + guides.length);
  for (const page of guides) {
    const html = read(page);
    assert.ok(/<table class="cmp"/.test(html), page + ' carries no comparison table');

    const sources = [...html.matchAll(/<source src="([^"]+\.mp4)"/g)].map(m => m[1]);
    assert.ok(sources.length, page + ' carries no video');
    for (const src of sources) {
      assert.ok(fs.existsSync(root + src), page + ' points at a missing clip: ' + src);
    }
    const posters = [...html.matchAll(/<video[^>]*poster="([^"]+)"/g)].map(m => m[1]);
    assert.equal(posters.length, sources.length, page + ' has a video without a poster');
    for (const poster of posters) {
      assert.ok(fs.existsSync(root + poster), page + ' points at a missing poster: ' + poster);
    }
    // preload="none" משאיר את הקובץ על השרת עד שלוחצים; בלי זה כל מדריך נושא מגה-בייטים
    // שאף אחת לא ביקשה. controls במקום autoplay: לולאה שאי-אפשר לעצור היא כשל נגישות.
    for (const [tag] of html.matchAll(/<video[^>]*>/g)) {
      assert.ok(/preload="none"/.test(tag), page + ' ships a video that downloads before a click');
      assert.ok(/controls/.test(tag) && !/autoplay/.test(tag), page + ' ships a video that cannot be paused');
    }

    // בוחרת היום עובדת בלי JavaScript: רדיו מסומן ⇒ הפאנל שמתאים לו נראה. אם מספר
    // התוויות, הרדיו והפאנלים לא זהה — יום אחד לא ייפתח לעולם, וזה לא נראה ב-diff.
    const radios = [...html.matchAll(/<input type="radio" name="dpick" id="(d\d)"( checked)?>/g)];
    assert.ok(radios.length >= 4, page + ' carries no day picker');
    const labels = [...html.matchAll(/<label for="(d\d)">/g)].map(m => m[1]);
    const panels = (html.match(/<div class="dpick-p">/g) || []).length;
    assert.deepEqual(labels, radios.map(m => m[1]), page + ' day picker labels do not match its radios');
    assert.equal(panels, radios.length, page + ' day picker has ' + panels + ' panels for ' + radios.length + ' days');
    assert.equal(radios.filter(m => m[2]).length, 1, page + ' day picker does not open on exactly one day');
    // ה-CSS מכיר d1..d6 בלבד; יום שביעי היה נשאר מוסתר לתמיד.
    assert.ok(radios.length <= 6, page + ' day picker has more days than the stylesheet can show');
  }
});
