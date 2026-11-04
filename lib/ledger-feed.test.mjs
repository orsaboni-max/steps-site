import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/attribution-ledger.ts';
import { ledger } from './attribution.ts';
import { buildFeed } from './ledger-feed.ts';

const TOKEN = 'ledger-feed-test-' + 'x'.repeat(48);
const A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', C = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const reply = () => ({ headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } });
const rows = [
  { inquiry_id: A, created_at: '2026-11-02T08:00:00Z', location_id: 18259, person_key: 'secret-hmac', state: 'linked', arbox_user_id: 123, submitted_page: '/pilates.html', consent: 'granted', source: 'google', landing: '/' },
  { inquiry_id: B, created_at: '2026-11-02T09:00:00Z', location_id: 18259, channel: 'whatsapp', state: 'outbound_intent', arbox_user_id: 999, submitted_page: '/gym-women.html', consent: 'not_granted', source: 'unknown' },
  { inquiry_id: C, created_at: '2026-10-20T09:00:00Z', location_id: 18259, state: 'linked', arbox_user_id: 5, submitted_page: '/' },
  { inquiry_id: 'not-a-uuid', created_at: '2026-11-02T09:00:00Z', location_id: 18259 },
  { inquiry_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', created_at: '2026-11-02T09:00:00Z', location_id: 20593 },
];

test('feed holds the minimum, never the person key, and drops other branches and pre-activation rows', () => {
  const feed = buildFeed(rows, '2026-10-01', new Date('2026-11-03T00:00:00Z'));
  assert.equal(feed.from, '2026-11-01');
  assert.deepEqual(feed.inquiries.map(i => i.inquiry_id), [A, B]);
  assert.equal(JSON.stringify(feed).includes('secret-hmac'), false);
  assert.equal(feed.inquiries[0].source, 'google');
  assert.equal(feed.inquiries[0].arbox_user_id, 123);
  // A WhatsApp record never carries a site-asserted identity; unconsented source is hidden.
  assert.equal(feed.inquiries[1].arbox_user_id, null);
  assert.equal(feed.inquiries[1].source, null);
  assert.equal(feed.inquiries[1].channel, 'whatsapp');
});

test('handler: token required, GET only, and no network call of any kind', async () => {
  const saved = { token: process.env.WEBSITE_ATTRIBUTION_TOKEN, blob: process.env.BLOB_READ_WRITE_TOKEN };
  const original = ledger.all, fetcher = globalThis.fetch;
  let network = 0;
  globalThis.fetch = async () => { network++; throw Error('network is forbidden here'); };
  process.env.WEBSITE_ATTRIBUTION_TOKEN = TOKEN; process.env.BLOB_READ_WRITE_TOKEN = TOKEN;
  ledger.all = async () => structuredClone(rows);
  try {
    let r = reply(); await handler({ method: 'GET', headers: {}, query: {} }, r); assert.equal(r.statusCode, 401);
    r = reply(); await handler({ method: 'GET', headers: { authorization: 'Bearer wrong' + 'y'.repeat(40) }, query: {} }, r); assert.equal(r.statusCode, 401);
    r = reply(); await handler({ method: 'POST', headers: { authorization: 'Bearer ' + TOKEN }, query: {} }, r); assert.equal(r.statusCode, 405);
    r = reply(); await handler({ method: 'GET', headers: { authorization: 'Bearer ' + TOKEN }, query: { from: '2026-11-01' } }, r);
    assert.equal(r.statusCode, 200);
    assert.equal(r.body.inquiries.length, 2);
    assert.equal(r.headers['Cache-Control'], 'private, no-store');
    ledger.all = async () => { throw Error('blob down'); };
    r = reply(); await handler({ method: 'GET', headers: { authorization: 'Bearer ' + TOKEN }, query: {} }, r); assert.equal(r.statusCode, 503);
    assert.equal(network, 0);
  } finally {
    ledger.all = original; globalThis.fetch = fetcher;
    for (const [k, v] of [['WEBSITE_ATTRIBUTION_TOKEN', saved.token], ['BLOB_READ_WRITE_TOKEN', saved.blob]]) v === undefined ? delete process.env[k] : (process.env[k] = v);
  }
});
