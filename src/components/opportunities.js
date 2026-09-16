'use strict';
const M = require('../../assets/js/shared/opportunities-model');
const { existsSync } = require('node:fs');
const path = require('node:path');
const { root } = require('../../scripts/lib/templates');

function renderOpportunities(data) {
  M.validate(data);
  for (const item of data.items) {
    for (const link of [item.application, item.notice, item.result, ...(item.documents || [])]) {
      if (link?.url && !link.url.startsWith('https://') && !existsSync(path.join(root, link.url.split('#')[0]))) throw new Error('Missing opportunity destination: ' + link.url);
    }
  }
  const rendered = M.render(data), c = rendered.counts;
  const options = values => values.map(([key, label]) => `<option value="${M.esc(key)}">${M.esc(label)}</option>`).join('');
  const types = [...new Set(data.items.map(item => item.type))];
  const states = [...new Set(data.items.map(item => { const s = M.state(item); return s === 'urgent' ? 'open' : s === 'finished' ? 'closed' : s; }))];
  const years = [...new Set(data.items.map(item => String(item.year || (item.endDate || item.startDate || '').slice(0, 4))).filter(Boolean))].sort().reverse();
  return {
    opportunitiesData: JSON.stringify(data).replace(/</g, '\\u003c'),
    opportunitiesActive: rendered.active,
    opportunitiesHistory: rendered.history,
    opportunitiesEmpty: rendered.active ? 'hidden' : '',
    historyEmpty: rendered.history ? 'hidden' : '',
    opportunitiesCount: String(c.active).padStart(2, '0'),
    openCount: String(c.open).padStart(2, '0'), urgentCount: String(c.urgent).padStart(2, '0'),
    resultCount: String(c.result).padStart(2, '0'), historyCount: String(c.archive).padStart(2, '0'),
    opportunitiesFilters: data.items.length > 1 ? `<form class="op-filters" id="op-filters" role="search" aria-label="Buscar oportunidades" hidden><div class="op-search"><label for="op-query">Buscar oportunidades</label><div><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input id="op-query" name="q" type="search" placeholder="Buscar por curso, processo, programa ou edital" maxlength="160" autocomplete="off"></div></div>${`<div data-status-filter${states.length > 1 ? '' : ' hidden'}><label for="op-status">Status</label><select id="op-status" name="status"><option value="">Todos os status</option>${options(states.map(s => [s, M.statuses[s][1]]))}</select></div>`}${types.length > 1 ? `<div><label for="op-type">Tipo</label><select id="op-type" name="type"><option value="">Todos os tipos</option>${options(types.map(t => [t, M.types[t]]))}</select></div>` : ''}${years.length > 1 ? `<div><label for="op-year">Ano</label><select id="op-year" name="year"><option value="">Todos os anos</option>${options(years.map(y => [y, y]))}</select></div>` : ''}<div class="op-filter-bottom"><p id="op-count" role="status" aria-live="polite" aria-atomic="true">${data.items.length} oportunidades encontradas</p><button class="op-text-link" type="reset" id="op-reset" hidden>Limpar filtros <span aria-hidden="true">×</span></button></div></form>` : ''
  };
}
module.exports = { renderOpportunities };
