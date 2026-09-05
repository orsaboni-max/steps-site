import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => fs.readFileSync(root + file, 'utf8');
const home = read('index.html');
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
