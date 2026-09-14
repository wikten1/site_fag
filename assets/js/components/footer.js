(() => {
      const footer = document.querySelector('.fag-footer');
      if (!footer) return;
      footer.querySelector('[data-footer-year]').textContent = new Date().getFullYear();
      footer.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', event => {
          if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          document.getElementById(link.hash.slice(1))?.focus({ preventScroll: true });
        });
      });
    })();
