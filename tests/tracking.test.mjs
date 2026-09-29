import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = file => fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const source = read('tracking.js');
function harness(url, storage = new Map(), referrer = '') {
  const scripts = [];
  const window = { location: new URL(url), localStorage: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  } };
  const document = { referrer, currentScript: { hasAttribute: () => true }, createElement: () => ({}), head: { appendChild: s => scripts.push(s) } };
  vm.runInNewContext(source, { window, document, URL, URLSearchParams });
  return { window, scripts };
}

test('a tagged service arrival survives navigation to the untagged home form', () => {
  const storage = new Map();
  harness('https://stepsnetanya.co.il/pilates.html?utm_source=google&utm_medium=cpc&utm_campaign=intro&gclid=click-123', storage, 'https://www.google.com/');
  const { window } = harness('https://stepsnetanya.co.il/#contact', storage, 'https://stepsnetanya.co.il/pilates.html');
  assert.equal(window.STEPS_REFERRAL.utm_source, 'google');
  assert.equal(window.STEPS_REFERRAL.utm_campaign, 'intro');
  assert.equal(window.STEPS_REFERRAL.gclid, 'click-123');
  assert.equal(window.STEPS_REFERRAL.landing, '/pilates.html');
  assert.equal(window.STEPS_REFERRAL.ref, 'https://www.google.com/');
  assert.match(read('index.html'), /ref:STEPS_REFERRAL/);
});

test('a later tagged visit keeps the first source until its 90-day expiry', () => {
  const storage = new Map();
  harness('https://stepsnetanya.co.il/gym-women.html?utm_source=first', storage);
  const original = storage.get('steps_ref');
  harness('https://stepsnetanya.co.il/barre.html?utm_source=second', storage);
  assert.equal(storage.get('steps_ref'), original);
  const expired = JSON.parse(original);
  expired.t = Date.now() - 91 * 24 * 60 * 60 * 1000;
  storage.set('steps_ref', JSON.stringify(expired));
  const { window } = harness('https://stepsnetanya.co.il/barre.html?utm_source=new', storage);
  assert.equal(window.STEPS_REFERRAL.utm_source, 'new');
  assert.equal(window.STEPS_REFERRAL.landing, '/barre.html');
});

test('consented untagged search arrival keeps only the source host across site navigation', () => {
  const storage = new Map([['steps-consent', 'granted']]);
  harness('https://stepsnetanya.co.il/pilates.html', storage, 'https://www.google.com/search?q=private+query');
  const { window } = harness('https://stepsnetanya.co.il/#contact', storage, 'https://stepsnetanya.co.il/pilates.html');
  assert.equal(window.STEPS_REFERRAL.ref, 'https://www.google.com/');
  assert.equal(window.STEPS_REFERRAL.landing, '/pilates.html');
  assert.equal(window.STEPS_REFERRAL.utm_source, undefined);
  assert.equal(window.dataLayer[0][2].analytics_storage, 'denied');
});

test('a tagged campaign replaces referrer-only attribution without losing campaign first touch', () => {
  const storage = new Map([['steps-consent', 'granted']]);
  harness('https://stepsnetanya.co.il/pilates.html', storage, 'https://www.google.com/search?q=private');
  harness('https://stepsnetanya.co.il/barre.html?utm_source=google&utm_medium=cpc&gclid=123', storage);
  const tagged = storage.get('steps_ref');
  harness('https://stepsnetanya.co.il/?utm_source=another', storage);
  assert.equal(storage.get('steps_ref'), tagged);
  const { window } = harness('https://stepsnetanya.co.il/#contact', storage);
  assert.equal(window.STEPS_REFERRAL.utm_medium, 'cpc');
  assert.equal(window.STEPS_REFERRAL.gclid, '123');
});

test('new external-referrer storage needs consent and expires after seven days', () => {
  const storage = new Map();
  harness('https://stepsnetanya.co.il/pilates.html', storage, 'https://www.google.com/search?q=private');
  assert.equal(storage.size, 0);
  storage.set('steps-consent', 'granted');
  harness('https://stepsnetanya.co.il/pilates.html', storage, 'https://www.google.com/search?q=private');
  const expired = JSON.parse(storage.get('steps_ref'));
  expired.t = Date.now() - 8 * 24 * 60 * 60 * 1000;
  storage.set('steps_ref', JSON.stringify(expired));
  const { window } = harness('https://stepsnetanya.co.il/#contact', storage);
  assert.equal(Object.keys(window.STEPS_REFERRAL).length, 0);
});

test('untagged or preview visits never create attribution; corrupt or blocked storage is safe', () => {
  const storage = new Map();
  harness('https://stepsnetanya.co.il/pilates.html', storage);
  harness('https://steps-site-preview.vercel.app/pilates.html?utm_source=test', storage);
  assert.equal(storage.size, 0);
  storage.set('steps_ref', 'invalid-json');
  const recovered = harness('https://stepsnetanya.co.il/pilates.html?utm_source=new', storage);
  assert.equal(recovered.window.STEPS_REFERRAL.utm_source, 'new');
  const blocked = { get() { throw new Error('blocked'); }, set() { throw new Error('blocked'); } };
  const result = harness('https://stepsnetanya.co.il/pilates.html?utm_source=test', blocked);
  assert.equal(Object.keys(result.window.STEPS_REFERRAL).length, 0);
  assert.equal(result.scripts.length, 1);
});

test('service attribution uses only existing limited fields and does not change consent', () => {
  const { window } = harness('https://stepsnetanya.co.il/pilates.html?utm_source=' + 'a'.repeat(250) + '&phone=0521234567&name=test');
  assert.equal(window.STEPS_REFERRAL.utm_source.length, 200);
  assert.equal(window.STEPS_REFERRAL.phone, undefined);
  assert.equal(window.STEPS_REFERRAL.name, undefined);
  assert.equal(window.dataLayer[0][2].analytics_storage, 'denied');
});

test('opening the Pilates calendar remains interest, not checkout or purchase', () => {
  const html = read('pilates.html');
  assert.doesNotMatch(html, /trackEvent\('(?:begin_checkout|purchase)'/);
  assert.match(html, /trackEvent\('arbox_open'/);
  assert.match(html, /trackEvent\('cta_trial_click'/);
});

test('local, preview and lookalike hosts do not load or queue measurement', () => {
  for (const url of ['http://localhost:8766/', 'http://127.0.0.1:8766/',
    'https://steps-site-preview.vercel.app/', 'https://stepsnetanya.co.il.example.com/',
    'http://stepsnetanya.co.il/']) {
    const { window, scripts } = harness(url);
    window.gtag('event', 'lead_form_submit');
    window.fbq('track', 'Lead');
    window.oaiq('measure', 'lead_created');
    assert.equal(window.STEPS_TRACKING_ENABLED, false, url);
    assert.equal(scripts.length, 0, url);
    assert.equal(window.dataLayer, undefined, url);
  }
});

test('production retains denied consent before GA config and allows subsequent consent/events', () => {
  const { window, scripts } = harness('https://stepsnetanya.co.il/pilates.html');
  assert.equal(window.STEPS_TRACKING_ENABLED, true);
  assert.equal(scripts.length, 1);
  assert.match(scripts[0].src, /gtag\/js\?id=G-5T22VE9YHT$/);
  const calls = () => window.dataLayer.map(a => Array.from(a));
  assert.equal(calls()[0][0], 'consent');
  assert.equal(calls()[0][1], 'default');
  for (const key of ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization'])
    assert.equal(calls()[0][2][key], 'denied');
  assert.equal(calls()[2][0], 'config');
  window.gtag('consent', 'update', { analytics_storage: 'granted' });
  window.gtag('event', 'lead_form_submit', { form_id: 'leadForm' });
  assert.equal(calls()[3][1], 'update');
  assert.equal(calls()[4][1], 'lead_form_submit');
  assert.equal(window.fbq, undefined);
  assert.equal(window.oaiq, undefined);
});

test('all published measured pages apply the environment guard before pixel loaders', () => {
  for (const [, loc] of read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)) {
    const page = new URL(loc).pathname.slice(1) || 'index.html';
    const html = read(page);
    if (!html.includes('oaiq(')) continue;
    assert.ok(html.indexOf('src="tracking.js"') >= 0 && html.indexOf('src="tracking.js"') < html.indexOf('w.oaiq'), page);
    assert.equal((html.match(/src="tracking.js"/g) || []).length, 1, page);
    assert.doesNotMatch(html, /googletagmanager\.com\/gtag\/js|function gtag\(/, page);
  }
});

test('every self-booking link on the site carries the site-only Arbox marker', () => {
  // The WhatsApp bot sends referrer=SITE links too, so SITE cannot tell the two channels apart.
  // PLUGIN is used only here, and Arbox records it on the booking (platform=plugin).
  const pages = fs.readdirSync(new URL('../', import.meta.url)).filter(f => f.endsWith('.html'));
  let links = 0;
  for (const page of pages) {
    for (const [href] of read(page).matchAll(/https:\/\/[^"'\s]*arboxapp\.com\/[^"'\s]*/g)) {
      links++;
      assert.match(href, /referrer=PLUGIN/, `${page}: ${href.slice(0, 120)}`);
    }
  }
  assert.ok(links > 30);
});
