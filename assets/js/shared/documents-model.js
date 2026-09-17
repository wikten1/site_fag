(function (root, factory) {
  const model = factory();
  if (typeof module === 'object' && module.exports) module.exports = model;
  else root.FAGDocuments = model;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const types = { edital: 'Editais', portaria: 'Portarias', publicacao: 'Publicações' };
  const singular = { edital: 'Edital', portaria: 'Portaria', publicacao: 'Publicação' };
  const statuses = { publicado: 'Publicado', encerrado: 'Encerrado', arquivado: 'Arquivado', vigente: 'Vigente', andamento: 'Em andamento' };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${{
    arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    check: '<path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="9"/>',
    history: '<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8M3 3v5h5m4-1v5l3 2"/>',
    layers: '<path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5"/>'
  }[name] || ''}</svg>`;
  function validate(items) {
    if (!Array.isArray(items)) throw new Error('Invalid document collection');
    const ids = new Set();
    for (const item of items) {
      if (!item || ids.has(item.id) || !/^[a-z0-9-]+$/.test(item.id) || !types[item.type] || !statuses[item.status] || !item.title || !Number.isInteger(item.year) || item.year < 1900 || !/^[a-z0-9-]+\.pdf$/.test(item.file)) throw new Error('Invalid document: ' + item?.id);
      if (item.date && (!/^\d{4}-\d{2}-\d{2}$/.test(item.date) || !Number.isFinite(Date.parse(item.date)) || new Date(item.date).toISOString().slice(0, 10) !== item.date)) throw new Error('Invalid date: ' + item.id);
      if (['vigente', 'andamento'].includes(item.status) && (!item.validFrom || !item.validUntil || !item.statusSource || !Number.isFinite(Date.parse(item.validFrom)) || !Number.isFinite(Date.parse(item.validUntil)) || item.validFrom > item.validUntil)) throw new Error('Active status needs a confirmed period: ' + item.id);
      ids.add(item.id);
    }
    return items;
  }
  function isActive(item, today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })) {
    return ['vigente', 'andamento'].includes(item.status) && item.validFrom <= today && item.validUntil >= today;
  }
  function status(item, today) {
    return ['vigente', 'andamento'].includes(item.status) && !isActive(item, today) ? 'publicado' : item.status;
  }
  function badge(item, today) {
    const state = status(item, today);
    return `<span class="doc-badge doc-badge--${state}">${icon(['encerrado', 'arquivado'].includes(state) ? 'history' : 'check')}${statuses[state]}</span>`;
  }
  const dateLabel = date => date ? date.split('-').reverse().join('/') : 'Não informada';
  function pdfLink(item) {
    return `<a class="doc-pdf" href="assets/documents/${escape(item.file)}" target="_blank" rel="noopener" aria-label="Abrir ${escape(singular[item.type] + ' ' + (item.number || '') + ': ' + item.title)} (PDF, nova aba)">Abrir PDF ${icon('arrow')}</a>`;
  }
  function row(item, today) {
    const reference = item.type === 'publicacao' ? 'Referente ao Edital' : singular[item.type];
    return `<tr><td data-label="Tipo"><span class="doc-type">${singular[item.type]}</span></td><th scope="row"><span class="doc-number">${escape(item.number ? reference + ' nº ' + item.number : singular[item.type])}</span><span class="doc-title">${escape(item.title)}</span><span class="doc-summary">${escape(item.summary)}</span></th><td data-label="Data" class="doc-date">${item.date ? `<time datetime="${item.date}">${dateLabel(item.date)}</time>` : 'Não informada'}</td><td data-label="Ano" class="doc-year">${item.year}</td><td data-label="Status">${badge(item, today)}</td><td>${pdfLink(item)}</td></tr>`;
  }
  function table(items, today) {
    return `<table class="doc-table"><caption class="doc-sr">Documentos institucionais da FAG. Links de PDF abrem em nova aba.</caption><thead><tr><th scope="col">Tipo</th><th scope="col">Documento</th><th scope="col">Data de publicação</th><th scope="col">Ano</th><th scope="col">Status</th><th scope="col"><span class="doc-sr">Arquivo</span></th></tr></thead><tbody>${items.map(item => row(item, today)).join('')}</tbody></table>`;
  }
  function select(items, filters = {}, today) {
    const words = normalize(filters.q).trim().split(/\s+/).filter(Boolean);
    return items.filter(item => (!filters.tipo || item.type === filters.tipo) && (!filters.ano || String(item.year) === filters.ano) && (!filters.status || status(item, today) === filters.status) && words.every(word => normalize([item.title, item.number, item.year, item.summary, singular[item.type]].join(' ')).includes(word))).sort((a, b) => {
      if (filters.ordem === 'titulo') return a.title.localeCompare(b.title, 'pt-BR');
      const difference = a.year - b.year || (a.date || '').localeCompare(b.date || '');
      return filters.ordem === 'antigos' ? difference : -difference;
    });
  }
  function paginate(items, requested = 1, size = 8) {
    const pages = Math.max(1, Math.ceil(items.length / size));
    const page = Math.min(pages, Math.max(1, Math.trunc(Number(requested)) || 1));
    return { items: items.slice((page - 1) * size, page * size), page, pages, total: items.length };
  }
  return { types, singular, statuses, escape, normalize, icon, validate, isActive, status, badge, pdfLink, table, select, paginate };
});
