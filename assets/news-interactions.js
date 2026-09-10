/* Progressive enhancement only; articles and pagination work without JavaScript. */
(() => {
  function imageError(img) {
    const caption = img.closest('figure')?.querySelector('figcaption');
    if (img.dataset.fallback && !img.dataset.fallbackUsed) {
      img.dataset.fallbackUsed = 'true';
      img.removeAttribute('srcset');
      img.alt = '';
      img.src = img.dataset.fallback;
      if (caption) { caption.hidden = false; caption.textContent = 'Ilustração institucional'; }
    } else {
      img.hidden = true;
      if (caption) { caption.hidden = false; caption.textContent = 'Imagem indisponível'; }
    }
  }
  document.addEventListener('error', event => { if (event.target.matches?.('img[data-fallback]')) imageError(event.target); }, true);
  document.querySelectorAll('img[data-fallback]').forEach(img => { if (img.complete && !img.naturalWidth) imageError(img); });
  const menu = document.querySelector('.editorial-menu');
  if (menu) {
    menu.addEventListener('keydown', event => {
      if (event.key === 'Escape') { menu.open = false; menu.querySelector('summary').focus(); }
    });
    menu.addEventListener('focusout', () => {
      setTimeout(() => { if (!menu.contains(document.activeElement)) menu.open = false; }, 0);
    });
  }
})();
