(() => {
  const section = document.querySelector('.courses');
  if (!section) return;
  const targets = [...section.querySelectorAll('[data-course-reveal]')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stopped = () => reduced.matches || document.documentElement.dataset.motionPaused === 'true';
  let observer;
  const revealAll = () => {
    // Focus and accessibility controls reveal content immediately, without a transition.
    section.classList.remove('reveal-ready');
    targets.forEach(target => target.classList.add('is-visible'));
    observer?.disconnect();
  };
  if ('IntersectionObserver' in window && !stopped()) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08 });
    targets.forEach(target => observer.observe(target));
    section.classList.add('reveal-ready');
  } else revealAll();
  section.addEventListener('focusin', revealAll);
  reduced.addEventListener('change', () => { if (stopped()) revealAll(); });
  new MutationObserver(() => { if (stopped()) revealAll(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion-paused'] });
})();
