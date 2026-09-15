(() => {
  'use strict';
  const controls = document.querySelector('.catalog-controls');
  if (!controls) return;
  const items = [...document.querySelectorAll('[data-catalog-item]')];
  const filters = [...controls.querySelectorAll('[data-filter]')];
  const search = document.querySelector('#course-search');
  const result = controls.querySelector('.catalog-results');
  const empty = document.querySelector('.catalog-empty');
  const clear = controls.querySelector('[data-clear]');
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
  const courses = items.map(item => ({ item, name: normalize(item.dataset.name), categories: item.dataset.categories.split(' ') }));
  let active = 'todos';
  let announcement;
  const update = (immediate = false) => {
    const query = normalize(search.value);
    let count = 0;
    courses.forEach(({ item, name, categories }) => {
      const matches = (active === 'todos' || categories.includes(active)) && name.includes(query);
      item.hidden = !matches;
      if (matches) count++;
    });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === active)));
    document.querySelectorAll('[data-filter-count]').forEach(label => {
      const category = label.dataset.filterCount;
      label.textContent = courses.filter(course => (category === 'todos' || course.categories.includes(category)) && course.name.includes(query)).length;
    });
    clear.disabled = active === 'todos' && !search.value;
    empty.hidden = count !== 0;
    empty.querySelector('[data-empty-message]').textContent = !query && active === 'ead'
      ? 'Ainda não há cursos identificados como EAD neste catálogo. Consulte a FAG para informações sobre a oferta nessa modalidade.'
      : 'Não encontramos cursos correspondentes aos filtros selecionados.';
    const announce = () => { result.textContent = `${count} ${count === 1 ? 'curso encontrado' : 'cursos encontrados'}`; };
    clearTimeout(announcement);
    if (immediate) announce();
    else announcement = setTimeout(announce, 180);
  };
  const reset = () => { active = 'todos'; search.value = ''; update(true); };
  filters.forEach(button => button.addEventListener('click', () => { active = button.dataset.filter; update(true); }));
  search.addEventListener('input', () => update());
  document.querySelectorAll('[data-clear]').forEach(button => button.addEventListener('click', () => { reset(); search.focus({ preventScroll: true }); }));
  // Keep links from Home and bookmarked course fragments useful after filtering.
  const openFragment = () => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const course = courses.find(({ item }) => item.querySelector('.course-card').id === id);
    if (!course) return;
    reset();
    course.item.querySelector('details').open = true;
    const article = course.item.querySelector('article');
    article.focus({ preventScroll: true });
    article.scrollIntoView({ block: 'start', behavior: 'instant' });
  };
  window.addEventListener('hashchange', openFragment);
  update(true);
  controls.hidden = false;
  openFragment();
})();
