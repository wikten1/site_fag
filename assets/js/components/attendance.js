(() => {
  const section = document.querySelector('.attendance');
  if (!section) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const motionStopped = () => motion.matches || root.dataset.motionPaused === 'true';
  if (!('IntersectionObserver' in window) || motionStopped()) return;

  // Progressive enhancement: content is visible without JavaScript.
  // Individual targets also reveal naturally in long, zoomed mobile layouts.
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .1 });

  const revealAll = () => {
    section.classList.remove('reveal-ready');
    observer.disconnect();
  };
  const syncMotion = () => { if (motionStopped()) revealAll(); };
  motion.addEventListener('change', syncMotion);
  new MutationObserver(syncMotion).observe(root, { attributes: true, attributeFilter: ['data-motion-paused'] });
  section.addEventListener('focusin', revealAll, { once: true });
  section.classList.add('reveal-ready');
  section.querySelectorAll('[data-attendance-reveal]').forEach(target => observer.observe(target));
})();
