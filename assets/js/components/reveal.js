/* Shared progressive entry motion. Page CSS owns the visual treatment. */
(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  window.FAGReveal = function reveal(container, {
    selector, readyClass, threshold = .08, rootMargin = '0px',
    delayProperty, batch = 4, step = 70, staggerSelector,
    focus = 'all'
  }) {
    if (!container) return () => {};
    const targets = [...container.querySelectorAll(selector)];
    let observer;
    const stopped = () => reduced.matches || root.dataset.motionPaused === 'true';
    const revealAll = () => {
      targets.forEach(target => target.classList.add('is-visible'));
      observer?.disconnect();
    };
    if (!('IntersectionObserver' in window) || stopped()) revealAll();
    else {
      observer = new IntersectionObserver(entries => {
        let index = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (delayProperty && (!staggerSelector || entry.target.matches(staggerSelector))) {
            entry.target.style.setProperty(delayProperty, `${(index++ % batch) * step}ms`);
          }
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }, { threshold, rootMargin });
      targets.forEach(target => observer.observe(target));
      container.classList.add(readyClass);
    }
    reduced.addEventListener('change', () => { if (stopped()) revealAll(); });
    new MutationObserver(() => { if (stopped()) revealAll(); })
      .observe(root, { attributes: true, attributeFilter: ['data-motion-paused'] });
    container.addEventListener('focusin', event => {
      if (focus === 'all') revealAll();
      else event.target.closest(selector)?.classList.add('is-visible');
    });
    addEventListener('beforeprint', revealAll);
    return revealAll;
  };
  document.querySelectorAll('[data-reveal-options]').forEach(container => {
    window.FAGReveal(container, JSON.parse(container.dataset.revealOptions));
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-anchor-focus]');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
  });
})();
