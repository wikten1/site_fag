(() => {
  'use strict';
  const M = window.FAGDocuments;
  const form = document.querySelector('#doc-filters');
  if (!M || !form) return;
  const $ = selector => document.querySelector(selector);
  const fields = { q: $('#doc-query'), tipo: $('#doc-type'), ano: $('#doc-year'), status: $('#doc-status'), ordem: $('#doc-order') };
  let items = [], currentPage = 1, timer;
  const original = $('#doc-results').innerHTML;
  const filters = () => Object.fromEntries(Object.entries(fields).map(([key, input]) => [key, input.value]));
  function restore() {
    const params = new URLSearchParams(location.search);
    for (const [key, input] of Object.entries(fields)) {
      const value = params.get(key) || (key === 'ordem' ? 'recentes' : '');
      input.value = key === 'q' ? value.slice(0, 160) : [...input.options].some(option => option.value === value) ? value : input.options[0].value;
    }
    currentPage = Number(params.get('pagina')) || 1;
  }
  function writeURL(replace = false) {
    const url = new URL(location.href);
    for (const [key, value] of Object.entries(filters())) {
      if (value && !(key === 'ordem' && value === 'recentes')) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    if (currentPage > 1) url.searchParams.set('pagina', String(currentPage));
    else url.searchParams.delete('pagina');
    if (url.href !== location.href) history[replace ? 'replaceState' : 'pushState'](null, '', url);
  }
  function render() {
    const state = filters();
    const result = M.paginate(M.select(items, state), currentPage);
    currentPage = result.page;
    $('#doc-results').innerHTML = result.total ? M.table(result.items) : '';
    $('#doc-empty').hidden = result.total > 0;
    $('#doc-count').textContent = `${result.total} ${result.total === 1 ? 'documento encontrado' : 'documentos encontrados'}${state.q ? ` para “${state.q}”` : ''}`;
    const count = ['tipo', 'ano', 'status'].filter(key => state[key]).length;
    $('#doc-filter-label').textContent = `Filtros${count ? ` · ${count}` : ''}`;
    $('#doc-reset').hidden = !count && !state.q && state.ordem === 'recentes';
    $('#doc-pagination').hidden = result.pages < 2;
    $('#doc-page-number').textContent = `Página ${result.page} de ${result.pages}`;
    $('#doc-prev').disabled = result.page === 1;
    $('#doc-next').disabled = result.page === result.pages;
    document.querySelectorAll('[data-category]').forEach(link => {
      if (link.dataset.category === state.tipo) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }
  function refreshActive() {
    const active = items.filter(item => M.isActive(item));
    $('#em-andamento').hidden = !active.length;
    $('#doc-active-items').innerHTML = active.map(item => `<article class="doc-active-item">${M.badge(item)}<h3>${M.escape(M.singular[item.type] + ' ' + (item.number || '') + ': ' + item.title)}</h3><p>${M.escape(item.summary)}</p>${M.pdfLink(item)}</article>`).join('');
  }
  async function load() {
    $('#doc-loading').hidden = false;
    $('#doc-error').hidden = true;
    $('#doc-results').setAttribute('aria-busy', 'true');
    try {
      const response = await fetch('assets/data/documents.json', { cache: 'no-cache', signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      items = M.validate((await response.json()).items);
      for (const [field, entries] of [
        [fields.tipo, Object.entries(M.types).filter(([key]) => items.some(item => item.type === key))],
        [fields.ano, [...new Set(items.map(item => item.year))].sort((a, b) => b - a).map(year => [String(year), String(year)])],
        [fields.status, [...new Set(items.map(item => M.status(item)))].map(key => [key, M.statuses[key]])]
      ]) {
        field.replaceChildren(field.options[0], ...entries.map(([value, label]) => new Option(label, value)));
      }
      form.hidden = false;
      restore(); render(); writeURL(true); refreshActive();
    } catch {
      form.hidden = true;
      $('#doc-error').hidden = false;
      $('#doc-results').innerHTML = original;
      $('#doc-count').textContent = 'Documentos disponíveis para consulta';
      $('#doc-reset').hidden = true;
      $('#doc-empty').hidden = true;
      $('#doc-pagination').hidden = true;
    } finally {
      $('#doc-loading').hidden = true;
      $('#doc-results').removeAttribute('aria-busy');
    }
  }
  function update() { currentPage = 1; render(); writeURL(); }
  fields.q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(update, 180); });
  form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); update(); });
  for (const [key, field] of Object.entries(fields)) if (key !== 'q') field.addEventListener('change', () => { clearTimeout(timer); update(); });
  function clear() { clearTimeout(timer); form.reset(); update(); fields.q.focus(); }
  $('#doc-reset').addEventListener('click', clear);
  $('[data-clear-documents]').addEventListener('click', clear);
  $('#doc-retry').addEventListener('click', async () => { await load(); if (!form.hidden) fields.q.focus(); });
  $('.doc-mobile-filters').addEventListener('click', event => {
    const expanded = event.currentTarget.getAttribute('aria-expanded') !== 'true';
    event.currentTarget.setAttribute('aria-expanded', String(expanded));
    $('#doc-filter-fields').classList.toggle('is-open', expanded);
  });
  $('#doc-filter-fields').addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !matchMedia('(max-width: 600px)').matches) return;
    $('#doc-filter-fields').classList.remove('is-open');
    $('.doc-mobile-filters').setAttribute('aria-expanded', 'false');
    $('.doc-mobile-filters').focus();
  });
  for (const [id, direction] of [['#doc-prev', -1], ['#doc-next', 1]]) $(id).addEventListener('click', () => {
    clearTimeout(timer); currentPage += direction; render(); writeURL(); $('#documents-title').setAttribute('tabindex', '-1'); $('#documents-title').focus();
  });
  document.querySelectorAll('[data-category], [data-year]').forEach(link => link.addEventListener('click', event => {
    if (form.hidden || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); clearTimeout(timer); form.reset();
    if (link.dataset.category) fields.tipo.value = link.dataset.category;
    if (link.dataset.year) fields.ano.value = link.dataset.year;
    update(); $('#documentos').scrollIntoView(); $('#documentos').focus({ preventScroll: true });
  }));
  window.addEventListener('popstate', () => { clearTimeout(timer); if (!form.hidden) { restore(); render(); } });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && items.length) { refreshActive(); render(); } });
  load();

  const targets = document.querySelectorAll('[data-doc-reveal]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  const revealAll = () => { targets.forEach(target => target.classList.add('is-visible')); observer?.disconnect(); };
  if (reduced.matches || document.documentElement.dataset.motionPaused === 'true' || !('IntersectionObserver' in window)) revealAll();
  else {
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .05 });
    targets.forEach(target => observer.observe(target));
    $('main').classList.add('doc-reveal-ready');
  }
  reduced.addEventListener('change', () => { if (reduced.matches) revealAll(); });
  new MutationObserver(() => { if (document.documentElement.dataset.motionPaused === 'true') revealAll(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion-paused'] });
  $('main').addEventListener('focusin', revealAll);
  window.addEventListener('beforeprint', () => { revealAll(); if (items.length) $('#doc-results').innerHTML = M.table(M.select(items, filters())); });
  window.addEventListener('afterprint', () => { if (items.length) render(); });
})();
