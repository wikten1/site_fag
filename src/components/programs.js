'use strict';
const { escape: esc } = require('../../assets/js/shared/news-model');
const { existsSync } = require('node:fs');
const path = require('node:path');
const { root } = require('../../scripts/lib/templates');
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';

function media(item, prefix, featured) {
  return `<figure class="program-media${item.imageFit === 'contain' ? ' program-media--identity' : ''}"><img src="${esc(prefix + item.image)}-1200.webp" srcset="${esc(prefix + item.image)}-640.webp 640w, ${esc(prefix + item.image)}-1200.webp 1200w" sizes="(max-width: 760px) calc(100vw - 40px), ${featured ? '720px' : '600px'}" width="${item.width}" height="${item.height}" alt="${esc(item.imageAlt)}" loading="lazy" decoding="async">${item.imageNote ? `<figcaption>${esc(item.imageNote)}</figcaption>` : ''}</figure>`;
}

function programCard(item, { prefix = '', featured = false } = {}) {
  const heading = featured ? 'h2' : 'h3';
  return `<article class="program-card${featured ? ' program-featured' : ''}${item.link ? ' has-link' : ''}" id="${esc(item.id)}" aria-labelledby="program-${esc(item.id)}" data-page-search>
    ${media(item, prefix, featured)}
    <div class="program-body">
      <p class="program-category"><span class="program-category-marker" aria-hidden="true"></span>${esc(item.category)}</p>
      <${heading} class="program-title" id="program-${esc(item.id)}">${esc(item.name)}</${heading}>
      <p class="program-description">${esc(item.description)}</p>
      ${item.objective ? `<dl class="program-purpose"><div><dt>Objetivo</dt><dd>${esc(item.objective)}</dd></div>${featured && item.audience ? `<div><dt>Para quem</dt><dd>${esc(item.audience)}</dd></div>` : ''}</dl>` : ''}
      ${item.link ? `<a class="program-link" href="${esc(prefix + item.link.href)}"><span>${esc(item.link.label)}</span>${arrow}</a>` : `<p class="program-type">${esc(item.type)}</p>`}
    </div>
  </article>`;
}

function renderPrograms({ items, featuredId }, prefix = '') {
  const ids = new Set();
  for (const item of items) {
    if (!/^[a-z0-9-]+$/.test(item.id) || ids.has(item.id)) throw new Error('Invalid or duplicate program ID: ' + item.id);
    ids.add(item.id);
    if (!item.name?.trim() || !item.description?.trim() || !item.category?.trim() || !item.type?.trim() || typeof item.imageAlt !== 'string' || !Number.isInteger(item.width) || item.width < 1 || !Number.isInteger(item.height) || item.height < 1) throw new Error('Invalid program content: ' + item.id);
    if (!/^assets\/images\/[a-z0-9/-]+$/.test(item.image) || ![640, 1200].every(size => existsSync(path.join(root, `${item.image}-${size}.webp`)))) throw new Error('Missing program image: ' + item.id);
    if (item.link && (!item.link.label?.trim() || !/^(?:noticias\/)?[a-z0-9-]+\.html$/.test(item.link.href) || !existsSync(path.join(root, item.link.href)))) throw new Error('Invalid program destination: ' + item.id);
  }
  if (featuredId && !ids.has(featuredId)) throw new Error('Unknown featured program: ' + featuredId);
  const featured = items.find(item => item.id === featuredId);
  const remaining = items.filter(item => item !== featured);
  return {
    programFeatured: featured ? `<section class="initiatives-feature" aria-labelledby="program-${esc(featured.id)}" data-program-reveal><p class="programs-eyebrow"><span class="programs-marker" aria-hidden="true"></span>Em destaque<span class="programs-rule" aria-hidden="true"></span></p>${programCard(featured, { prefix, featured: true })}</section>` : '',
    programGrid: remaining.length ? `<ul class="programs-grid" role="list" aria-label="Outros programas e projetos">${remaining.map(item => `<li data-program-reveal>${programCard(item, { prefix })}</li>`).join('\n')}</ul>` : '<p class="initiatives-empty">Novas iniciativas poderão integrar este espaço. Acompanhe as notícias da Fundação.</p>'
  };
}
module.exports = { programCard, renderPrograms };
