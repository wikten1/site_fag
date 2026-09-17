'use strict';
const { escape: esc } = require('../../assets/js/shared/news-model');
const site = require('../../config/site');
const icons = {
  book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15M6 8h3m-3 4h3m6-4h3m-3 4h3"/>',
  learning: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4m-2-13 5 3-5 3V8Z"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  external: '<path d="M6 18 18 6M6 6h12v12"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.book}</svg>`;
const states = { available: '', new: 'Novo', unavailable: 'Temporariamente indisponível', maintenance: 'Em manutenção' };
function destination(item) {
  if (!Object.hasOwn(states, item.status)) throw new Error('Invalid resource status: ' + item.id);
  if (['unavailable', 'maintenance'].includes(item.status)) return null;
  if (!item.url || item.url.startsWith('#')) throw new Error('Missing resource destination: ' + item.id);
  const url = new URL(item.url, site.url + '/');
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid resource URL: ' + item.id);
  const external = url.origin !== new URL(site.url).origin;
  if (!external && (/^https?:/i.test(item.url) || !url.pathname.endsWith('.html'))) throw new Error('Use a local new-site route: ' + item.id);
  return { href: item.url, external };
}
function artwork(theme) {
  if (theme === 'library') return `<div class="online-card-art online-library-art" aria-hidden="true"><span class="online-art-label">LER / PESQUISAR / DESCOBRIR</span><div class="online-paper paper-back"></div><div class="online-paper paper-front"><span>CONHECIMENTO<br>ABERTO</span><i></i><i></i><i></i><b>USP <span>↗</span></b></div><span class="online-art-orbit"></span></div>`;
  if (theme === 'ead') return `<div class="online-card-art online-learning-art" aria-hidden="true"><span class="online-art-label">APRENDER / CONECTAR / EVOLUIR</span><div class="online-learning-path"><span>01</span><i></i><span class="online-play">${icon('learning')}</span><i></i><span>03</span></div><span class="online-learning-caption">Aprendizagem em conexão.</span></div>`;
  return '';
}
function card(item, index) {
  const target = destination(item);
  const state = states[item.status];
  const external = target?.external;
  const primary = item.tier === 'primary';
  const action = target
    ? `<a class="online-card-action" href="${esc(target.href)}"${external ? ` target="_blank" rel="noopener noreferrer" aria-label="${esc(item.cta)} (acesso externo, abre em nova aba)"` : ''}>${esc(item.cta)}${icon(external ? 'external' : 'arrow')}</a>`
    : `<div class="online-unavailable"><span>${esc(state)}</span><a href="contato.html" aria-label="Consultar atendimento sobre ${esc(item.name)}">Consultar atendimento ${icon('arrow')}</a></div>`;
  return `<article class="online-card ${primary ? 'online-card-primary' : 'online-card-compact'} online-card--${esc(item.theme || 'standard')}" id="${esc(item.id)}" data-status="${esc(item.status)}" data-online-reveal aria-labelledby="${esc(item.id)}-title">
    ${primary ? artwork(item.theme) : ''}
    <div class="online-card-body"><div class="online-card-top"><span class="online-resource-icon">${icon(item.icon)}</span><span class="online-label">${esc(item.category)}</span><span class="online-card-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span></div>
    <h3 id="${esc(item.id)}-title">${esc(item.name)}</h3><p class="online-provider">${esc(item.provider)}</p><p class="online-resource-description">${esc(item.description)}</p><p class="online-detail">${esc(item.detail)}</p>
    <div class="online-card-meta">${external ? `<span>${icon('external')} Acesso externo · Nova aba</span>` : ''}${item.status === 'new' ? '<span class="online-badge">Novo</span>' : ''}</div>${action}</div>
  </article>`;
}
function renderOnline(data) {
  const ids = data.items.map(item => item.id);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate online resource IDs');
  const primary = data.items.filter(item => item.tier === 'primary');
  const complementary = data.items.filter(item => item.tier === 'complementary');
  return {
    onlinePrimary: primary.map(card).join('\n'),
    onlineComplementary: complementary.length ? `<section class="online-complementary online-shell" aria-labelledby="complementary-title" data-page-search><div class="online-section-head" data-online-reveal><div><p class="online-label">Mais ferramentas para você</p><h2 id="complementary-title">Continue aprendendo.</h2></div><p>Outras oportunidades de formação<br>já compartilhadas pela FAG.</p></div><div class="online-complementary-grid">${complementary.map((item, index) => card(item, primary.length + index)).join('\n')}</div></section>` : ''
  };
}
module.exports = { renderOnline, card };
