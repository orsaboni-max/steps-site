import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = file => fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const source = read('tracking.js');
function harness(url) {
  const scripts = [];
  const window = { location: new URL(url) };
  const document = { currentScript: { hasAttribute: () => true }, createElement: () => ({}), head: { appendChild: s => scripts.push(s) } };
  vm.runInNewContext(source, { window, document });
  return { window, scripts };
}

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
