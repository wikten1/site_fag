/* The document and anchor navigation remain available without JavaScript. */
(() => {
  const main = document.querySelector('.privacy-page main');
  if (!main) return;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 820px)');
  const toggle = main.querySelector('.privacy-index-toggle');
  const navigation = main.querySelector('#privacy-index-links');
  const links = [...navigation.querySelectorAll('a')];
  const sections = links.map(link => document.querySelector(link.hash));
  const targets = [...main.querySelectorAll('[data-privacy-reveal]')];
  const bar = document.querySelector('.privacy-progress span');
  let revealObserver;
  let queued = false;
  const stopped = () => reduced.matches || root.dataset.motionPaused === 'true';
  function revealAll() {
    targets.forEach(target => target.classList.add('is-visible'));
    revealObserver?.disconnect();
  }
  if ('IntersectionObserver' in window && !stopped()) {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -25px 0px' });
    targets.forEach(target => revealObserver.observe(target));
    main.classList.add('privacy-reveal-ready');
  }
  const setExpanded = expanded => {
    toggle.setAttribute('aria-expanded', String(expanded));
    navigation.hidden = !expanded;
  };
  function syncIndex() {
    // Keep the control's semantics on desktop; the full index is always visible.
    toggle.disabled = !mobile.matches;
    setExpanded(!mobile.matches);
  }
  syncIndex();
  mobile.addEventListener('change', syncIndex);
  toggle.addEventListener('click', () => setExpanded(toggle.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobile.matches) { setExpanded(false); toggle.focus(); }
  });
  links.forEach(link => link.addEventListener('click', () => {
    const section = document.querySelector(link.hash);
    section.classList.add('is-visible');
    if (mobile.matches) setExpanded(false);
    // Focus follows the anchor so keyboard users continue in the selected section.
    section.tabIndex = -1;
    section.focus({ preventScroll: true });
  }));
  function updateReading() {
    queued = false;
    const offset = (parseFloat(getComputedStyle(root).getPropertyValue('--header-offset')) || 140) + 50;
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= offset) current = section;
    }
    links.forEach(link => {
      if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    const article = main.querySelector('.privacy-document').getBoundingClientRect();
    const total = Math.max(1, article.height - innerHeight + offset);
    const progress = Math.min(1, Math.max(0, (offset - article.top) / total));
    bar.style.transform = `scaleX(${progress})`;
  }
  function scheduleReading() {
    if (!queued) { queued = true; requestAnimationFrame(updateReading); }
  }
  window.addEventListener('scroll', scheduleReading, { passive: true });
  window.addEventListener('resize', scheduleReading);
  main.querySelectorAll('details').forEach(details => details.addEventListener('toggle', scheduleReading));
  if ('ResizeObserver' in window) new ResizeObserver(scheduleReading).observe(main.querySelector('.privacy-document'));
  updateReading();
  reduced.addEventListener('change', () => { if (stopped()) revealAll(); });
  new MutationObserver(() => { if (stopped()) revealAll(); }).observe(root, { attributes: true, attributeFilter: ['data-motion-paused'] });
  main.addEventListener('focusin', event => event.target.closest('[data-privacy-reveal]')?.classList.add('is-visible'));
  const printClosed = [];
  window.addEventListener('beforeprint', () => {
    revealAll();
    main.querySelectorAll('details:not([open])').forEach(item => { printClosed.push(item); item.open = true; });
  });
  window.addEventListener('afterprint', () => { printClosed.splice(0).forEach(item => { item.open = false; }); });
})();
