'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createHash } = require('node:crypto');
const M = require('../assets/js/shared/documents-model');
const data = require('../content/documents.json');
const provenance = require('../content/documents-provenance.json');
const { createApp } = require('../server/contact-server');
const { once } = require('node:events');

test('HTTP exposes only the generated catalog, keeping source metadata private', async t => {
  const server = createApp();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); return new Promise(resolve => server.close(resolve)); });
  const base = 'http://127.0.0.1:' + server.address().port;
  const response = await fetch(base + '/assets/data/documents.json');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  const catalog = await response.json();
  assert.equal(catalog.items.length, data.items.length);
  assert.ok(catalog.items.every(item => !Object.hasOwn(item, 'source')));
  for (const file of ['content/documents.json', 'content/documents-provenance.json', 'assets/data/private.json']) {
    assert.equal((await fetch(base + '/' + file)).status, 404);
  }
});

test('all published documents match the imported official PDF bytes', () => {
  M.validate(data.items);
  assert.equal(data.items.length, provenance.records.length);
  for (const item of data.items) {
    const bytes = fs.readFileSync('assets/documents/' + item.file);
    assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
    assert.equal(createHash('sha256').update(bytes).digest('hex'), provenance.records.find(record => record.id === item.id).sha256);
  }
});
test('search ignores accents, combines terms and intersects filters', () => {
  const result = M.select(data.items, { q: 'tecnicos coordenadores', tipo: 'edital', ano: '2026' });
  assert.deepEqual(result.map(item => item.id), ['edital-01-2026']);
  assert.equal(M.select(data.items, { q: 'no-such-document' }).length, 0);
  assert.equal(M.select(data.items, { status: 'encerrado' }).length, 2);
});
test('pagination is bounded and never repeats or loses records', () => {
  const sorted = M.select(data.items);
  const all = [1, 2, 3].flatMap(page => M.paginate(sorted, page).items);
  assert.deepEqual(all, sorted);
  assert.equal(M.paginate(sorted, 999).page, 3);
  assert.equal(M.paginate(sorted, -1).page, 1);
  assert.equal(M.paginate([], 999).page, 1);
});
test('active status requires evidence and expires without inventing closure', () => {
  const item = { ...data.items[0], status: 'andamento', validFrom: '2030-01-01', validUntil: '2030-02-01', statusSource: 'Confirmed official schedule (test only)' };
  assert.equal(M.isActive(item, '2030-01-20'), true);
  assert.equal(M.isActive(item, '2030-02-02'), false);
  assert.equal(M.status(item, '2030-02-02'), 'publicado');
  assert.equal(M.isActive(data.items[0], '2026-08-12'), false);
  assert.throws(() => M.validate([{ ...item, validUntil: null }]));
});
test('rendering escapes text and only permits local PDF filenames', () => {
  assert.throws(() => M.validate([{ ...data.items[0], file: '../secret.pdf' }]));
  assert.throws(() => M.validate([{ ...data.items[0], date: '2026-02-30' }]));
  assert.throws(() => M.validate([data.items[0], data.items[0]]));
  const markup = M.table([{ ...data.items[0], title: '<script>alert(1)</script>' }]);
  assert.doesNotMatch(markup, /<script>/);
  assert.match(markup, /&lt;script&gt;/);
  assert.match(markup, /target="_blank" rel="noopener"/);
});
