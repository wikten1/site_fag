'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { renderOnline, card } = require('../src/components/online');
const data = require('../content/online.json');

test('digital resources publish external destinations with accessible context and keep unavailable destinations inactive', () => {
  const library = card(data.items[0], 0);
  assert.match(library, /target="_blank" rel="noopener noreferrer"/);
  assert.match(library, /aria-label="Acessar Biblioteca Digital \(acesso externo, abre em nova aba\)"/);
  assert.match(library, /Acesso externo · Nova aba/);
  for (const status of ['unavailable', 'maintenance']) {
    const markup = card({ ...data.items[0], status }, 0);
    assert.ok(!markup.includes(data.items[0].url));
    assert.match(markup, /href="contato.html"/);
    assert.match(markup, status === 'maintenance' ? /Em manutenção/ : /Temporariamente indisponível/);
  }
  assert.match(card({ ...data.items[0], status: 'new' }, 0), /online-badge">Novo/);
});

test('resource publishing rejects empty, unsafe and legacy destinations; escapes imported content', () => {
  for (const url of ['', '#', 'javascript:alert(1)', 'https://fag.tangua.rj.gov.br/cursos/', 'https://user:secret@example.com']) {
    assert.throws(() => card({ ...data.items[0], url }, 0));
  }
  const html = card({ ...data.items[0], name: '<script>alert(1)</script>', description: 'A & B' }, 0);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /A &amp; B/);
  const local = card({ ...data.items[0], url: 'cursos.html' }, 0);
  assert.doesNotMatch(local, /target="_blank"|Acesso externo/);
  assert.throws(() => renderOnline({ items: [data.items[0], data.items[0]] }));
});

test('resource collections preserve every item for two, three, six and ten resources', () => {
  for (const count of [2, 3, 6, 10]) {
    const items = Array.from({ length: count }, (_, i) => ({ ...data.items[0], id: `resource-${i}` }));
    const { onlinePrimary, onlineComplementary } = renderOnline({ items });
    assert.equal((onlinePrimary.match(/<article /g) || []).length, count);
    assert.equal(onlineComplementary, '');
    for (const item of items) assert.ok(onlinePrimary.includes(`id="${item.id}"`));
  }
});
