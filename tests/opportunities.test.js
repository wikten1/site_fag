'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const M = require('../assets/js/shared/opportunities-model');
const { renderOpportunities } = require('../src/components/opportunities');
const day = '2032-04-10';
const open = { slug: 'demonstracao', title: 'Demonstração — qualificação', type: 'course', status: 'open', startDate: '2032-04-01', endDate: '2032-04-20', application: { instructions: 'Instrução de teste, sem validade institucional.' } };

test('registration status observes São Paulo calendar, inclusive deadline and explicit states', () => {
  assert.equal(M.state(open, day), 'open');
  assert.equal(M.state(open, '2032-04-17'), 'urgent');
  assert.equal(M.state(open, '2032-04-20'), 'urgent');
  assert.equal(M.state(open, '2032-04-21'), 'closed');
  assert.equal(M.state(open, '2032-03-31'), 'upcoming');
  assert.equal(M.state({ ...open, application: null }, day), 'ongoing');
  for (const status of ['finished', 'closed', 'ongoing', 'result']) assert.equal(M.state({ ...open, status }, day), status);
  assert.match(M.card({ ...open, endDate: day }, day), /Encerra hoje/);
  const expired = M.card(open, '2032-04-21');
  assert.doesNotMatch(expired, /Como se inscrever|Fazer inscrição|Acessar inscrição/);
  assert.match(expired, /Inscrições encerradas/);
});
test('publication rejects unusable channels, invalid dates, unsafe links and missing local documents', () => {
  assert.doesNotThrow(() => M.validate({ items: [open] }));
  for (const change of [{ application: null }, { startDate: null }, { endDate: '2032-02-30' }, { endDate: '2032-01-01' }, { application: { url: 'javascript:alert(1)' } }, { status: 'result' }]) {
    assert.throws(() => M.validate({ items: [{ ...open, ...change }] }));
  }
  for (const url of ['https://', 'https://?a', 'https://user:pass@host.test', '//host.test', 'assets/documents/../../.env', 'data:text/html,test', 'some-missing.pdf']) assert.equal(M.safeURL(url), false, url);
  assert.throws(() => renderOpportunities({ items: [{ ...open, notice: { label: 'Edital', url: 'assets/documents/missing.pdf' } }] }), /Missing/);
  assert.throws(() => M.validate({ items: [open, open] }), /duplicate/);
});
test('accent-insensitive combined filters, counts and archive grouping agree', () => {
  const items = [open, { ...open, slug: 'resultado', type: 'project', title: 'Demonstração — projeto', status: 'result', result: { label: 'Resultado', url: 'https://example.org/result' } }, { ...open, slug: 'anterior', year: 2031, status: 'finished' }];
  assert.equal(M.filter(items, 'qualificacao', 'open', 'course', '2032', day).length, 1);
  assert.equal(M.filter(items, '', 'closed', '', '2031', day).length, 1);
  assert.equal(M.filter(items, 'inexistente', '', '', '', day).length, 0);
  assert.deepEqual(M.counts(items, day), { active: 2, open: 1, urgent: 0, result: 1, archive: 1 });
  assert.match(M.render({ items }, day).history, /2031/);
  assert.equal(M.render({ items: [] }, day).active, '');
});
test('rendering escapes content and hides absent fields; datasets remain script-safe', () => {
  const item = { ...open, title: '<script>alert(1)</script>' };
  const rendered = M.card(item, day);
  assert.doesNotMatch(rendered, /<script>|<dt>Local|<dt>Vagas|<dt>Modalidade/);
  assert.match(rendered, /&lt;script&gt;/);
  assert.doesNotMatch(renderOpportunities({ items: [item] }).opportunitiesData, /<script>/);
});
test('external enrollment, notice-only and result actions remain distinct', () => {
  assert.match(M.card({ ...open, application: { url: 'https://example.org/apply' } }, day), /Acessar inscrição/);
  assert.match(M.card({ ...open, application: { url: 'https://example.org/apply' } }, day), /noopener noreferrer/);
  const noticeOnly = { ...open, status: 'ongoing', application: null, notice: { label: 'Edital', url: 'https://example.org/notice' } };
  assert.match(M.card(noticeOnly, day), /Consultar edital/);
  assert.doesNotMatch(M.card(noticeOnly, day), /Inscrições abertas|Fazer inscrição|Acessar inscrição/);
  assert.match(M.card({ ...noticeOnly, status: 'result', result: { label: 'Resultado final', url: 'https://example.org/result' } }, day), /Consultar resultado/);
});

test('HTTP serves local PDF documents and keeps other document-folder files private', async t => {
  const fs = require('node:fs');
  const path = require('node:path');
  const os = require('node:os');
  const { once } = require('node:events');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fag-documents-test-'));
  const assets = path.join(root, 'assets'), directory = path.join(assets, 'documents');
  fs.mkdirSync(directory, { recursive: true });
  const document = path.join(directory, 'sample.pdf'), privateFile = path.join(directory, 'private.txt');
  fs.writeFileSync(document, '%PDF-1.4\nTest fixture only');
  fs.writeFileSync(privateFile, 'Private fixture');
  const server = require('../server/contact-server').createApp({ root });
  t.after(async () => {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    fs.unlinkSync(document); fs.unlinkSync(privateFile);
    fs.rmdirSync(directory); fs.rmdirSync(assets); fs.rmdirSync(root);
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(base + '/assets/documents/sample.pdf');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'application/pdf');
  assert.match(await response.text(), /^%PDF/);
  assert.equal((await fetch(base + '/assets/documents/private.txt')).status, 404);
});
