const test = require('node:test');
const assert = require('node:assert/strict');
const regularUrl = require('../booking.js');

test('returning-client route preserves selected class, branch, category and attribution', () => {
  const url = new URL('https://BP4JSUDD1589999012.web.arboxapp.com/group/91479890?whitelabel=Arbox&lang=he&location=18259&referrer=PLUGIN&allLocations=false&utm_source=google&utm_campaign=test');
  url.searchParams.set('filters', JSON.stringify({trial:'trial',pageName:'group',boxCategories:[45670]}));
  const result = new URL(regularUrl(url.href));
  assert.equal(result.pathname, url.pathname);
  assert.deepEqual(JSON.parse(result.searchParams.get('filters')), {pageName:'group',boxCategories:[45670]});
  for (const key of ['whitelabel','lang','location','referrer','allLocations','utm_source','utm_campaign']) assert.equal(result.searchParams.get(key),url.searchParams.get(key));
  assert.equal(JSON.parse(url.searchParams.get('filters')).trial, 'trial');
});

test('unrelated domains and routes cannot become a booking route', () => {
  assert.equal(regularUrl('https://example.com/group?filters={}'), null);
  assert.equal(regularUrl('https://BP4JSUDD1589999012.web.arboxapp.com/shop'), null);
});

test('official direct trial route converts to regular route for the same class', () => {
  const result = new URL(regularUrl('https://BP4JSUDD1589999012.web.arboxapp.com/group/trial/91479890?location=18259&referrer=PLUGIN'));
  assert.equal(result.pathname, '/group/91479890');
  assert.equal(result.searchParams.get('referrer'), 'PLUGIN');
});
