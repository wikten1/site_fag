/* Static content remains readable without JavaScript or animation support. */
(() => {
  const main = document.querySelector('.programs-page main');
  if (!main) return;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const targets = [...main.querySelectorAll('[data-program-reveal]')];
  const stopped = () => reduced.matches || root.dataset.motionPaused === 'true';
  let observer;
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
        entry.target.style.setProperty('--program-delay', `${(index++ % 4) * 70}ms`);
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: .06 });
    targets.forEach(target => observer.observe(target));
    main.classList.add('programs-reveal-ready');
  }
  reduced.addEventListener('change', () => { if (stopped()) revealAll(); });
  new MutationObserver(() => { if (stopped()) revealAll(); }).observe(root, { attributes: true, attributeFilter: ['data-motion-paused'] });
  main.addEventListener('focusin', revealAll);
  window.addEventListener('beforeprint', revealAll);
  main.querySelector('a[href="#iniciativas"]').addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    document.getElementById('iniciativas').focus({ preventScroll: true });
  });
})();
