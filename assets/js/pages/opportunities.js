(() => {
  'use strict';
  const main = document.querySelector('.opportunities-page main');
  if (!main || !window.FAGOpportunities) return;
  const M = window.FAGOpportunities;
  const data = JSON.parse(document.getElementById('opportunities-data').textContent);
  const form = document.getElementById('op-filters');
  let day = M.today();

  function syncDetails() {
    main.querySelectorAll('details').forEach(details => {
      const sync = () => details.querySelector('summary').setAttribute('aria-expanded', String(details.open));
      sync();
      details.addEventListener('toggle', sync);
    });
  }
  function update() {
    // Static HTML may have been built before today's opening/closing dates.
    const statusSelect = document.getElementById('op-status');
    if (statusSelect) {
      const states = [...new Set(data.items.map(item => { const s = M.state(item, day); return s === 'urgent' ? 'open' : s === 'finished' ? 'closed' : s; }))];
      const available = [...statusSelect.options].slice(1).map(option => option.value);
      if (available.join(',') !== states.join(',')) {
        const selected = statusSelect.value;
        statusSelect.replaceChildren(new Option('Todos os status', ''));
        states.forEach(state => statusSelect.add(new Option(M.statuses[state][1], state)));
        statusSelect.value = states.includes(selected) ? selected : '';
      }
      statusSelect.closest('[data-status-filter]').hidden = states.length < 2;
    }
    const values = form ? new FormData(form) : new FormData();
    const query = String(values.get('q') || '').trim();
    const status = values.get('status') || '', type = values.get('type') || '', year = values.get('year') || '';
    const filtering = Boolean(query || status || type || year);
    const items = M.filter(data.items, query, status, type, year, day);
    const rendered = M.render(data, day, items);
    document.getElementById('op-active').innerHTML = rendered.active;
    document.getElementById('op-history-list').innerHTML = rendered.history;
    document.getElementById('op-active-empty').hidden = filtering || Boolean(rendered.active);
    document.getElementById('op-history-empty').hidden = filtering || Boolean(rendered.history);
    document.getElementById('op-no-results').hidden = !filtering || items.length > 0;
    document.getElementById('op-active-filter-empty').hidden = !filtering || !items.length || Boolean(rendered.active);
    document.getElementById('op-history-filter-empty').hidden = !filtering || !items.length || Boolean(rendered.history);
    document.getElementById('historico').hidden = filtering && !items.length;
    main.querySelectorAll('[data-op-count]').forEach(el => { el.textContent = String(rendered.counts[el.dataset.opCount]).padStart(2, '0'); });
    if (form) {
      document.getElementById('op-count').textContent = `${items.length} ${items.length === 1 ? 'oportunidade encontrada' : 'oportunidades encontradas'}`;
      document.getElementById('op-reset').hidden = !filtering;
    }
    main.classList.add('op-results-changed');
    syncDetails();
  }
  let debounce;
  if (form) {
    form.hidden = false;
    form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(debounce); update(); });
    form.addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(update, 140); });
    form.addEventListener('change', () => { clearTimeout(debounce); update(); });
    form.addEventListener('reset', () => {
      clearTimeout(debounce);
      setTimeout(() => { update(); document.getElementById('op-query').focus({ preventScroll: true }); }, 0);
    });
    main.querySelector('[data-clear-filters]').addEventListener('click', () => form.reset());
  }
  // Refresh stale static HTML on arrival and after a calendar day changes.
  update();
  const refreshDay = () => {
    const next = M.today();
    if (next !== day) { day = next; update(); }
  };
  setInterval(refreshDay, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshDay(); });
  main.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(anchor.hash.slice(1));
    if (target?.hasAttribute('tabindex')) target.focus({ preventScroll: true });
  });
})();
