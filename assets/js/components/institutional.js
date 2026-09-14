(() => {
  const section = document.querySelector('.foundation');
  if (!section) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const targets = [...section.querySelectorAll('[data-foundation-reveal]')];
  let revealObserver;
  const revealAll = () => {
    targets.forEach(target => target.classList.add('is-visible'));
    revealObserver?.disconnect();
  };
  const motionStopped = () => reducedMotion.matches || document.documentElement.dataset.motionPaused === 'true';

  if (!('IntersectionObserver' in window) || motionStopped()) {
    revealAll();
  } else {
    // Observe each element so long mobile layouts reveal as the reader reaches them.
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .2 });
    section.classList.add('reveal-ready');
    targets.forEach(target => revealObserver.observe(target));
  }

  if ('IntersectionObserver' in window) {
    let inView = false;
    const syncAmbient = () => { section.dataset.inView = String(inView && !document.hidden); };
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncAmbient();
    }).observe(section);
    document.addEventListener('visibilitychange', syncAmbient);
  }

  // Honor both the operating system and the Home's existing pause control.
  reducedMotion.addEventListener('change', () => { if (motionStopped()) revealAll(); });
  new MutationObserver(() => { if (motionStopped()) revealAll(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion-paused'] });

  // Keyboard navigation must never land on an element still waiting for reveal.
  section.addEventListener('focusin', revealAll);
  section.querySelector('.foundation-cta').addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const href = event.currentTarget.getAttribute('href');
    if (!href.startsWith('#')) return;
    const destination = document.getElementById(href.slice(1));
    destination?.focus({ preventScroll: true });
  });
})();
