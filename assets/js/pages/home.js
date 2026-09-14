(() => {
      const hero = document.querySelector('.hero');
      const toggle = document.querySelector('.motion-toggle');
      const label = toggle.querySelector('.motion-label');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const compactLayout = window.matchMedia('(max-width: 560px)');
      const utilityMotion = document.getElementById('utility-motion');
      const paused = () => document.documentElement.dataset.motionPaused === "true";

      function syncMotion() {
        const userPaused = paused();
        if (userPaused || reducedMotion.matches) {
          document.querySelectorAll('.nav-enter, .eyebrow, .title-line, .description, .hero-actions, .location, .card-entrance, .orbital-system, .corner').forEach(element => element.classList.add('entrance-complete'));
        }
        hero.dataset.paused = String(userPaused || reducedMotion.matches || compactLayout.matches);
        toggle.hidden = reducedMotion.matches || compactLayout.matches;
        label.textContent = userPaused ? 'Retomar animações' : 'Pausar animações';
        utilityMotion.checked = userPaused || reducedMotion.matches;
        utilityMotion.disabled = reducedMotion.matches;
        utilityMotion.closest('label').hidden = false;
        document.getElementById('motion-preference-note').hidden = !reducedMotion.matches;
      }
      new MutationObserver(syncMotion).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion-paused'] });
      toggle.addEventListener('click', () => {
        utilityMotion.checked = !paused();
        utilityMotion.dispatchEvent(new Event('change'));
      });
      reducedMotion.addEventListener('change', syncMotion);
      compactLayout.addEventListener('change', syncMotion);
      syncMotion();

      let inView = true;
      function syncVisibility() { hero.dataset.offscreen = String(document.hidden || !inView); }
      document.addEventListener('visibilitychange', syncVisibility);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncVisibility(); }).observe(hero);
      }

      document.querySelector('.primary-cta').addEventListener('click', () => {
        // Keep native anchor navigation and URL behavior; add reliable focus transfer.
        document.getElementById('sobre-a-fag').focus({ preventScroll: true });
      });
    })();
