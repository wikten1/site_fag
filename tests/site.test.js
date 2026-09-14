'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { once } = require('node:events');
const { root } = require('../scripts/lib/templates');
const { createApp } = require('../server/contact-server');
const pages = [...require('../config/pages').map(page => page.route), '404.html', 'noticias.html', ...fs.readdirSync(path.join(root, 'noticias')).map(file => 'noticias/' + file)];
const documents = new Map(pages.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8').replace(/<!--[\s\S]*?-->/g, '')]));
const decode = value => value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
function localURL(value, from) {
  const url = new URL(decode(value), 'https://site.test/' + from);
  return url.origin === 'https://site.test' ? url : null;
}
test('all published pages have valid local resources, links, fragments and semantic metadata', () => {
  for (const [file, html] of documents) {
    assert.equal((html.match(/<h1\b/g) || []).length, 1, file + ': one H1');
    assert.equal((html.match(/<main\b/g) || []).length, 1, file + ': one main');
    assert.match(html, /<html lang="pt-BR">/);
    assert.match(html, /<meta name="description" content="[^"]+">/);
    assert.doesNotMatch(html, /\{\{\w+\}\}|references\//, file);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.length, new Set(ids).size, file + ': unique IDs');
    if (file === '404.html') assert.match(html, /name="robots" content="noindex"/);
    else {
      assert.equal((html.match(/rel="canonical"/g) || []).length, 1, file);
      assert.match(html, /property="og:url"/);
    }
    for (const img of html.matchAll(/<img\b[^>]*>/g)) {
      assert.match(img[0], /\balt="[^"]*"/, file);
      assert.match(img[0], /\bwidth="\d+"/, file);
      assert.match(img[0], /\bheight="\d+"/, file);
    }
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const url = localURL(match[1], file);
      if (!url) continue;
      const target = decodeURIComponent(url.pathname.slice(1)) || 'index.html';
      assert.ok(fs.existsSync(path.join(root, target)), `${file}: missing ${target}`);
      if (url.hash && target.endsWith('.html')) {
        assert.ok(documents.get(target)?.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${file}: missing fragment ${target}${url.hash}`);
      }
    }
    for (const match of html.matchAll(/\bsrcset="([^"]+)"/g)) {
      for (const candidate of match[1].split(',')) {
        const url = localURL(candidate.trim().split(/\s+/)[0], file);
        if (url) assert.ok(fs.existsSync(path.join(root, decodeURIComponent(url.pathname))), `${file}: ${candidate}`);
      }
    }
    for (const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) assert.doesNotThrow(() => JSON.parse(match[1]));
  }
});
test('home content is rendered without JavaScript and course data agrees across pages', () => {
  const home = documents.get('index.html');
  assert.equal((home.match(/data-news-id=/g) || []).length, 4);
  const courses = require('../content/courses.json');
  assert.equal(courses.length, 6);
  for (const course of courses) {
    assert.ok(home.includes(`id="curso-${course.slug}"`));
    assert.ok(documents.get('cursos.html').includes(`id="${course.slug}"`));
  }
});
test('sitemap includes only indexable public pages', () => {
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  assert.equal((sitemap.match(/<loc>/g) || []).length, pages.length - 1);
  assert.doesNotMatch(sitemap, /404\.html|docs\/|references\//);
  assert.match(fs.readFileSync(path.join(root, 'robots.txt'), 'utf8'), /Sitemap: https?:\/\//);
});
test('HTTP serves SEO files, revalidates assets and returns real HTML 404 responses', async t => {
  const server = createApp();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); return new Promise(resolve => server.close(resolve)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const [file, type] of [['sitemap.xml', 'application/xml'], ['robots.txt', 'text/plain']]) {
    const response = await fetch(base + '/' + file);
    assert.equal(response.status, 200);
    assert.ok(response.headers.get('content-type').startsWith(type));
  }
  const first = await fetch(base + '/assets/css/base.css');
  assert.equal(first.status, 200);
  const cached = await fetch(base + '/assets/css/base.css', { headers: { 'If-None-Match': first.headers.get('etag') } });
  assert.equal(cached.status, 304);
  assert.equal(await cached.text(), '');
  const missing = await fetch(base + '/noticias/nao-existe.html');
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /Página não encontrada/);
  for (const file of ['src/pages/index.html', 'config/site.js', 'references/images/Logo.png', 'docs/design_system.html']) {
    assert.equal((await fetch(base + '/' + file)).status, 404);
  }
});
