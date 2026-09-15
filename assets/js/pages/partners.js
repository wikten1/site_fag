/* Content is static HTML; JavaScript only enhances entry motion and anchor focus. */
(() => {
  const main = document.querySelector('.partners-page main');
  if (!main) return;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const targets = [...main.querySelectorAll('[data-partner-reveal]')];
  const stopped = () => reduced.matches || root.dataset.motionPaused === 'true';
  let observer;
  const revealAll = () => {
    targets.forEach(target => target.classList.add('is-visible'));
    observer?.disconnect();
  };
  if (!('IntersectionObserver' in window) || stopped()) revealAll();
  else {
    observer = new IntersectionObserver(entries => {
      // Restart a short stagger for each entering batch, even with many partners.
      let cardIndex = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (entry.target.classList.contains('partner-item')) entry.target.style.setProperty('--partner-delay', `${(cardIndex++ % 4) * 70}ms`);
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: .06 });
    targets.forEach(target => observer.observe(target));
    main.classList.add('partners-reveal-ready');
  }
  reduced.addEventListener('change', () => { if (stopped()) revealAll(); });
  new MutationObserver(() => { if (stopped()) revealAll(); })
    .observe(root, { attributes: true, attributeFilter: ['data-motion-paused'] });
  main.addEventListener('focusin', revealAll);
  window.addEventListener('beforeprint', revealAll);
  main.querySelector('.partners-discover').addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById('instituicoes');
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
})();
