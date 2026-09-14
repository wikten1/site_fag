/* Progressive, one-time reveals; the unenhanced page always remains readable. */
(() => {
  const main = document.querySelector('.about-page main');
  if (!main) return;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const targets = [...main.querySelectorAll('[data-about-reveal]')];
  const motionStopped = () => reduced.matches || root.dataset.motionPaused === 'true';
  let observer;
  const revealAll = () => {
    targets.forEach(target => target.classList.add('is-visible'));
    observer?.disconnect();
  };

  if (!('IntersectionObserver' in window) || motionStopped()) {
    revealAll();
  } else {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: .08 });
    targets.forEach(target => observer.observe(target));
    main.classList.add('about-reveal-ready');
  }

  reduced.addEventListener('change', () => { if (motionStopped()) revealAll(); });
  new MutationObserver(() => { if (motionStopped()) revealAll(); })
    .observe(root, { attributes: true, attributeFilter: ['data-motion-paused'] });
  main.addEventListener('focusin', revealAll);
  window.addEventListener('beforeprint', revealAll);
  main.querySelector('.about-discover').addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById('quem-somos');
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
})();
