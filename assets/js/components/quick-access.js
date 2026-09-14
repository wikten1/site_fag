(() => {
      const section = document.getElementById('acesso-rapido');
      const items = [...section.querySelectorAll('.quick-item')];
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
      const motionStopped = () => reducedMotion.matches || document.documentElement.dataset.motionPaused === 'true';
      if (!('IntersectionObserver' in window) || motionStopped()) return;

      const observer = new IntersectionObserver(entries => {
        // Stagger only the cards entering together, including on small screens.
        entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
          entry.target.style.setProperty('--quick-delay', `${Math.min(index, 4) * 80}ms`);
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: .08 });
      const revealAll = () => {
        section.classList.remove('reveal-ready');
        observer.disconnect();
        pauseObserver.disconnect();
        reducedMotion.removeEventListener('change', syncMotion);
      };
      const syncMotion = () => { if (motionStopped()) revealAll(); };
      const pauseObserver = new MutationObserver(syncMotion);
      pauseObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion-paused'] });
      reducedMotion.addEventListener('change', syncMotion);
      section.addEventListener('focusin', revealAll, { once: true });
      section.classList.add('reveal-ready');
      items.forEach(item => observer.observe(item));
    })();
