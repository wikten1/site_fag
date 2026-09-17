/* Progressive enhancement only: every resource and help answer exists in HTML. */
(() => {
  const main = document.querySelector('.online-page main');
  if (!main) return;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const targets = [...main.querySelectorAll('[data-online-reveal]')];
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
        entry.target.style.setProperty('--online-delay', `${(index++ % 3) * 80}ms`);
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: .04 });
    targets.forEach(target => observer.observe(target));
    main.classList.add('online-reveal-ready');
  }
  reduced.addEventListener('change', () => { if (stopped()) revealAll(); });
  new MutationObserver(() => { if (stopped()) revealAll(); }).observe(root, { attributes: true, attributeFilter: ['data-motion-paused'] });
  main.addEventListener('focusin', revealAll);
  window.addEventListener('beforeprint', revealAll);
})();
