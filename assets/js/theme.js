/* Runs after tokens.css and before page styles/content to avoid a theme flash. */
(() => {
  'use strict';
  const root = document.documentElement;
  const key = 'fag-theme';
  const system = matchMedia('(prefers-color-scheme: dark)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const valid = value => value === 'light' || value === 'dark';
  let preference = null;
  let timer;
  try { const saved = localStorage.getItem(key); if (valid(saved)) preference = saved; } catch { /* Private/storage-restricted browsing remains functional. */ }

  function syncControls() {
    const dark = root.dataset.theme === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.hidden = false;
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', `Modo escuro ${dark ? 'ativado' : 'desativado'}. Ativar modo ${dark ? 'claro' : 'escuro'}`);
      button.title = `Ativar modo ${dark ? 'claro' : 'escuro'}`;
      button.querySelector('[data-theme-label]').textContent = `Modo ${dark ? 'escuro' : 'claro'}`;
    });
  }
  function apply(animate = false) {
    const theme = preference || (system.matches ? 'dark' : 'light');
    if (animate && !reduced.matches && root.dataset.motionPaused !== 'true') {
      clearTimeout(timer);
      root.classList.add('theme-changing');
      timer = setTimeout(() => root.classList.remove('theme-changing'), 300);
    }
    root.dataset.theme = theme;
    root.dataset.themePreference = preference || 'system';
    // The light theme opts out of Chromium's automatic darkening. Dark is authored.
    document.querySelector('meta[name="color-scheme"]').content = theme === 'dark' ? 'dark' : 'only light';
    document.querySelector('meta[name="theme-color"]').content = getComputedStyle(root).getPropertyValue('--theme-color').trim();
    syncControls();
    dispatchEvent(new CustomEvent('fag:themechange', { detail: { theme, preference: preference || 'system' } }));
  }
  function setPreference(value) {
    if (value !== 'system' && !valid(value)) return;
    preference = valid(value) ? value : null;
    try { if (preference) localStorage.setItem(key, preference); else localStorage.removeItem(key); } catch { /* Keep the explicit choice in memory. */ }
    apply(true);
  }
  // A future account settings adapter can use this API without changing components.
  window.FAGTheme = Object.freeze({ setPreference, getPreference: () => preference || 'system' });
  system.addEventListener('change', () => { if (!preference) apply(true); });
  addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = valid(event.newValue) ? event.newValue : null;
    apply(true);
  });
  reduced.addEventListener('change', () => { if (reduced.matches) root.classList.remove('theme-changing'); });
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    syncControls();
    document.querySelectorAll('[data-theme-toggle]').forEach(button => button.addEventListener('click', () => {
      setPreference(root.dataset.theme === 'dark' ? 'light' : 'dark');
    }));
  }, { once: true });
})();
