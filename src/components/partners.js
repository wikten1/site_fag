'use strict';
const { escape: esc } = require('../../assets/js/shared/news-model');
const { existsSync } = require('node:fs');
const path = require('node:path');
const { root } = require('../../scripts/lib/templates');
const externalIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6m0-6L10 14M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5"/></svg>';

function renderPartners(items, prefix = '') {
  const ids = new Set();
  const cards = items.map(item => {
    if (!/^[a-z0-9-]+$/.test(item.id) || ids.has(item.id)) throw new Error('Partner ID invalid or duplicated: ' + item.id);
    ids.add(item.id);
    if (!item.name?.trim() || !/^[\w.-]+$/.test(item.logo) || !Number.isInteger(item.width) || item.width < 1 || !Number.isInteger(item.height) || item.height < 1) throw new Error('Invalid partner: ' + item.id);
    const logo = 'assets/images/partners/' + item.logo;
    if (!existsSync(path.join(root, logo))) throw new Error('Missing partner logo: ' + logo);
    if (item.url) {
      const url = new URL(item.url);
      if (url.protocol !== 'https:' || url.username || url.password || url.hostname === 'fag.tangua.rj.gov.br') throw new Error('Invalid partner institutional URL: ' + item.id);
    }
    const link = item.url ? `<a class="partner-link" href="${esc(item.url)}" aria-label="Visitar instituição: ${esc(item.name)} (site externo)"><span>Visitar instituição</span>${externalIcon}</a>` : '';
    return `<li class="partner-item" data-partner-reveal><article class="partner-card${item.url ? ' has-link' : ''}" aria-labelledby="partner-${esc(item.id)}" data-page-search>
      <div class="partner-logo${item.logoSurface === 'dark' ? ' partner-logo-dark' : ''}"><img src="${esc(prefix + logo)}" alt="" width="${item.width}" height="${item.height}" loading="lazy" decoding="async"></div>
      <div class="partner-info"><h3 id="partner-${esc(item.id)}">${esc(item.name)}</h3>${item.description ? `<p>${esc(item.description)}</p>` : ''}${link}</div>
    </article></li>`;
  }).join('\n');
  if (!items.length) return `<div class="partners-empty" data-partner-reveal><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="12" cy="12" r="5"/><circle cx="36" cy="12" r="5"/><circle cx="24" cy="36" r="5"/><path d="M17 12h14M14 17l8 14m12-14-8 14"/></svg><h3>Parcerias em atualização</h3><p>Estamos atualizando a apresentação das instituições parceiras da FAG. Volte em breve para conhecer nossa rede de colaboração.</p></div>`;
  return `<ul class="partners-grid" aria-label="Instituições parceiras" role="list">${cards}</ul>`;
}
module.exports = { renderPartners };
