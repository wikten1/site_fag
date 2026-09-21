'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('all production colors come from tokens; SVG interface colors are semantic', () => {
  for (const entry of fs.readdirSync(path.join(root, 'assets/css'), { recursive: true })) {
    if (!entry.endsWith('.css') || entry === 'tokens.css') continue;
    const css = read('assets/css/' + entry).replace(/url\([^)]*\)/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    assert.doesNotMatch(css, /#[\da-f]{3,8}\b|rgba?\(\s*\d/i, entry);
    assert.doesNotMatch(css, /prefers-color-scheme/, entry);
  }
  const svg = read('src/pages/politica-de-privacidade.html');
  assert.doesNotMatch(svg, /(?:fill|stroke|stop-color)="#[\da-f]+"/i);
  const head = require('../src/components/head')({ title: 'Theme', route: 'index.html', description: 'Theme' });
  assert.ok(head.indexOf('tokens.css') < head.indexOf('theme.js'));
  assert.ok(head.indexOf('theme.js') < head.indexOf('base.css'));
  assert.match(head, /name="color-scheme" content="only light"/);
  assert.equal(require('../config/site').themeColor, read('assets/css/tokens.css').match(/--background:\s*(#[\da-f]{6})/i)[1]);
});

function controller({ dark = false, saved = null, blocked = false } = {}) {
  const events = {}, mediaEvents = {}, storage = new Map(saved ? [['fag-theme', saved]] : []);
  const root = { dataset: {}, classList: { add() {}, remove() {} } };
  const meta = { 'theme-color': {}, 'color-scheme': {} };
  const system = { matches: dark, addEventListener: (type, fn) => { mediaEvents.system = fn; } };
  const context = {
    document: { documentElement: root, querySelectorAll: () => [], querySelector: s => meta[s.includes('theme-color') ? 'theme-color' : 'color-scheme'], addEventListener: (name, fn) => { events[name] = fn; } },
    matchMedia: query => query.includes('color-scheme') ? system : { matches: false, addEventListener() {} },
    localStorage: { getItem(k) { if (blocked) throw Error('blocked'); return storage.get(k); }, setItem(k, v) { if (blocked) throw Error('blocked'); storage.set(k, v); }, removeItem(k) { storage.delete(k); } },
    addEventListener: (name, fn) => { events[name] = fn; }, dispatchEvent() {},
    CustomEvent: class { constructor(type, value) { this.type = type; this.detail = value; } },
    getComputedStyle: () => ({ getPropertyValue: () => root.dataset.theme === 'dark' ? '#011406' : '#f5f8f1' }),
    setTimeout: () => 1, clearTimeout() {}
  };
  context.window = context;
  vm.runInNewContext(read('assets/js/theme.js'), context);
  return { root, storage, meta, api: context.FAGTheme, system, mediaEvents, events };
}

test('first visit uses the OS, manual preference wins, reset follows the OS again', () => {
  const c = controller({ dark: true });
  assert.equal(c.root.dataset.theme, 'dark');
  assert.equal(c.storage.size, 0);
  c.api.setPreference('light');
  assert.equal(c.storage.get('fag-theme'), 'light');
  c.mediaEvents.system();
  assert.equal(c.root.dataset.theme, 'light');
  assert.equal(c.meta['color-scheme'].content, 'only light');
  assert.equal(c.meta['theme-color'].content, '#f5f8f1');
  c.api.setPreference('system');
  assert.equal(c.storage.size, 0);
  assert.equal(c.root.dataset.theme, 'dark');
  c.api.setPreference('invalid');
  assert.equal(c.api.getPreference(), 'system');
});

test('saved, invalid, blocked and cross-tab preferences remain deterministic', () => {
  assert.equal(controller({ saved: 'light', dark: true }).root.dataset.theme, 'light');
  assert.equal(controller({ saved: 'invalid', dark: true }).root.dataset.theme, 'dark');
  const c = controller({ blocked: true });
  c.api.setPreference('dark');
  assert.equal(c.root.dataset.theme, 'dark');
  c.events.storage({ key: 'fag-theme', newValue: 'light' });
  assert.equal(c.root.dataset.theme, 'light');
  c.system.matches = true;
  c.events.storage({ key: null, newValue: null });
  assert.equal(c.root.dataset.theme, 'dark');
});
