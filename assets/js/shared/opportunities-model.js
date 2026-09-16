/* Shared by the static build and browser. Dates use the institution's calendar. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FAGOpportunities = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const statuses = {
    open: ['●', 'Inscrições abertas'], urgent: ['◷', 'Últimos dias'],
    ongoing: ['◌', 'Em andamento'], result: ['✓', 'Resultado disponível'],
    closed: ['—', 'Inscrições encerradas'], finished: ['✓', 'Finalizado'], upcoming: ['○', 'Em breve']
  };
  const types = { course: 'Cursos', program: 'Programas', project: 'Projetos', selection: 'Processos seletivos', other: 'Outros' };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  function safeURL(value) {
    if (typeof value !== 'string' || /[\s<>"\\]/.test(value) || /(?:^|\/)\.\.(?:\/|$)/.test(value)) return false;
    if (value.startsWith('https://')) {
      try { const url = new URL(value); return Boolean(url.hostname) && !url.username && !url.password; } catch { return false; }
    }
    return /^(?:(?:noticias\/)?[a-z0-9][a-z0-9-]*\.html(?:#[a-z0-9-]+)?|assets\/documents\/[a-z0-9][a-z0-9._/-]*\.pdf)$/.test(value);
  }
  const isArchive = state => state === 'closed' || state === 'finished';
  const dateText = value => new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + 'T12:00:00Z'));
  const time = value => `<time datetime="${esc(value)}">${esc(dateText(value))}</time>`;
  const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
  const documentIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8M8 16h5"/></svg>';
  function state(item, day = today()) {
    if (['closed', 'finished', 'result', 'ongoing'].includes(item.status)) return item.status;
    if (item.endDate && item.endDate < day) return 'closed';
    if (item.startDate && item.startDate > day) return 'upcoming';
    if (item.status === 'upcoming') return 'upcoming';
    if (!item.application?.url && !item.application?.instructions?.trim()) return 'ongoing';
    if (!item.startDate || !item.endDate) return 'ongoing';
    return daysLeft(item, day) <= 3 ? 'urgent' : 'open';
  }
  function daysLeft(item, day) { return Math.round((Date.parse(item.endDate) - Date.parse(day)) / 86400000); }
  function validate(data) {
    if (!Array.isArray(data.items)) throw new Error('Opportunities must contain an items array');
    const ids = new Set();
    for (const item of data.items) {
      if (!/^[a-z0-9-]+$/.test(item.slug) || ids.has(item.slug)) throw new Error('Invalid or duplicate opportunity slug');
      ids.add(item.slug);
      if (!item.title?.trim() || !types[item.type] || !statuses[item.status] || item.status === 'urgent') throw new Error('Invalid opportunity: ' + item.slug);
      for (const key of ['startDate', 'endDate']) if (item[key] && !validDate(item[key])) throw new Error('Invalid date: ' + item.slug);
      if (item.startDate && item.endDate && item.startDate > item.endDate) throw new Error('Reversed dates: ' + item.slug);
      if (item.status === 'open' && (!item.startDate || !item.endDate || (!item.application?.url && !item.application?.instructions?.trim()))) throw new Error('Open opportunity requires dates and an application channel: ' + item.slug);
      if (item.status === 'result' && !item.result?.url) throw new Error('Result requires a document: ' + item.slug);
      if (item.vacancies != null && (!Number.isInteger(item.vacancies) || item.vacancies < 1)) throw new Error('Invalid vacancies');
      if (item.year != null && (!Number.isInteger(item.year) || item.year < 1900 || item.year > 9999)) throw new Error('Invalid year');
      if (isArchive(item.status) && !item.year && !item.endDate) throw new Error('Archive requires a year or end date');
      const links = [item.application, item.notice, item.result, ...(item.documents || [])].filter(link => link?.url);
      for (const link of links) if (!safeURL(link.url)) throw new Error('Invalid opportunity URL: ' + item.slug);
      for (const doc of [...(item.documents || []), ...(item.notice ? [item.notice] : []), ...(item.result ? [item.result] : [])]) {
        if (!doc.label?.trim() || !safeURL(doc.url)) throw new Error('Invalid document: ' + item.slug);
      }
      for (const step of item.schedule || []) {
        if (!step.title?.trim() || !validDate(step.date) || !['completed', 'current', 'future'].includes(step.state)) throw new Error('Invalid schedule: ' + item.slug);
      }
    }
    if (data.featuredId && !ids.has(data.featuredId)) throw new Error('Unknown featured opportunity');
    return data;
  }
  function link(doc, label, className = 'op-document') {
    const external = /^https:\/\//i.test(doc.url);
    return `<a class="${className}" href="${esc(doc.url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${className === 'op-document' ? documentIcon : ''}<span>${esc(label || doc.label)}${doc.format || doc.size ? `<small>${esc([doc.format, doc.size].filter(Boolean).join(' · '))}</small>` : ''}${external ? '<small>Link externo · abre em nova guia ↗</small>' : ''}</span>${className !== 'op-document' ? arrow : ''}</a>`;
  }
  function badge(status) { return `<span class="op-badge op-badge--${status}"><span aria-hidden="true">${statuses[status][0]}</span>${statuses[status][1]}</span>`; }
  function card(item, day, featured = false) {
    const status = state(item, day), archive = isArchive(status), open = ['open', 'urgent'].includes(status);
    const docs = [item.notice, ...(item.documents || []), item.result].filter(Boolean);
    const fields = [['Público', item.audience], ['Inscrições', item.startDate && item.endDate ? `${time(item.startDate)} <span aria-hidden="true">→</span><span class="op-sr"> até </span> ${time(item.endDate)}` : ''], ['Modalidade', item.modality], ['Local', item.location], ['Vagas', item.vacancies]];
    let action = '';
    if (open && item.application?.url) action = link(item.application, /^https:/.test(item.application.url) ? 'Acessar inscrição' : 'Fazer inscrição', 'op-button');
    else if (open && item.application?.instructions) action = `<a class="op-button" href="#instrucoes-${esc(item.slug)}">Como se inscrever ${arrow}</a>`;
    else if (item.result) action = link(item.result, 'Consultar resultado', 'op-button');
    else if (item.notice) action = link(item.notice, 'Consultar edital', archive ? 'op-text-link' : 'op-button');
    const left = daysLeft(item, day);
    const urgent = status === 'urgent' ? `<span class="op-deadline-note">${left === 0 ? 'Encerra hoje' : left === 1 ? 'Encerra amanhã' : `Encerra em ${left} dias`}</span>` : '';
    const details = item.requirements || item.observations || item.schedule?.length;
    return `<article class="op-card${featured ? ' op-card--featured' : ''}${archive ? ' op-card--archived' : ''}" id="processo-${esc(item.slug)}" aria-labelledby="titulo-${esc(item.slug)}" data-page-search>
      <div class="op-card-body"><div class="op-card-top">${badge(status)}<span class="op-meta">${esc(types[item.type])}${item.noticeNumber ? ` · ${esc(item.noticeNumber)}` : ''}</span></div>
      <h3 id="titulo-${esc(item.slug)}">${esc(item.title)}</h3>${item.description ? `<p class="op-description">${esc(item.description)}</p>` : ''}
      ${item.endDate ? `<p class="op-deadline"><span>${open || status === 'upcoming' ? 'Inscrições até' : 'Prazo de inscrição'}</span>${time(item.endDate)}${urgent}</p>` : ''}
      <dl class="op-facts">${fields.filter(([, value]) => value).map(([label, value]) => `<div><dt>${label}</dt><dd>${label === 'Inscrições' ? value : esc(value)}</dd></div>`).join('')}</dl>
      ${open && item.application?.instructions ? `<div class="op-instructions" id="instrucoes-${esc(item.slug)}" tabindex="-1"><h4>Orientações para inscrição</h4><p>${esc(item.application.instructions)}</p></div>` : ''}
      ${details ? `<details class="op-details"><summary>Ver detalhes e etapas <span aria-hidden="true">+</span></summary><div>${item.requirements ? `<h4>Requisitos</h4><p>${esc(item.requirements)}</p>` : ''}${item.observations ? `<h4>Orientações</h4><p>${esc(item.observations)}</p>` : ''}${item.schedule?.length ? `<h4>Cronograma</h4><ol class="op-timeline">${item.schedule.map((step, index) => `<li class="op-step--${esc(step.state)}"><span class="op-step-index">${String(index + 1).padStart(2, '0')}</span><div><strong>${esc(step.title)}</strong>${time(step.date)}<small>${{ completed: '✓ Concluída', current: '● Etapa atual', future: '○ Próxima etapa' }[step.state]}</small></div></li>`).join('')}</ol>` : ''}</div></details>` : ''}</div>
      ${action ? `<div class="op-card-action">${featured ? '<span class="op-meta">Seu próximo passo</span>' : ''}${action}</div>` : ''}
      ${docs.length ? `<div class="op-documents"><span class="op-meta">Documentos</span><div>${docs.map(doc => link(doc)).join('')}</div></div>` : ''}
    </article>`;
  }
  function filter(items, query = '', status = '', type = '', year = '', day = today()) {
    const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
    return items.filter(item => (!type || item.type === type) && (!year || String(item.year || (item.endDate || item.startDate || '').slice(0, 4)) === year) && (!status || (status === 'open' ? ['open', 'urgent'].includes(state(item, day)) : status === 'closed' ? isArchive(state(item, day)) : state(item, day) === status)) && terms.every(term => normalize([item.title, item.description, item.audience, item.noticeNumber, types[item.type]].join(' ')).includes(term)));
  }
  function counts(items, day) {
    const states = items.map(item => state(item, day));
    return { active: states.filter(s => !isArchive(s)).length, open: states.filter(s => ['open', 'urgent'].includes(s)).length, urgent: states.filter(s => s === 'urgent').length, result: states.filter(s => s === 'result').length, archive: states.filter(isArchive).length };
  }
  function render(data, day = today(), filtered = data.items) {
    const active = filtered.filter(item => !isArchive(state(item, day))).sort((a, b) => Number(b.slug === data.featuredId) - Number(a.slug === data.featuredId));
    const archived = filtered.filter(item => isArchive(state(item, day)));
    const years = [...new Set(archived.map(item => String(item.year || item.endDate.slice(0, 4))))].sort().reverse();
    const history = years.map((year, index) => {
      const cards = archived.filter(item => String(item.year || item.endDate.slice(0, 4)) === year).map(item => card(item, day)).join('');
      return archived.length > 6 ? `<details class="op-year"${year === day.slice(0, 4) || index === 0 ? ' open' : ''}><summary>${year}<span aria-hidden="true">+</span></summary><div class="op-history-grid">${cards}</div></details>` : `<div class="op-year"><h3 class="op-year-label">${year}</h3><div class="op-history-grid">${cards}</div></div>`;
    }).join('');
    return { active: active.map((item, index) => card(item, day, index === 0)).join(''), history, counts: counts(data.items, day) };
  }
  return { statuses, types, esc, today, validDate, safeURL, state, isArchive, validate, card, filter, counts, render };
});
