'use strict';
module.exports = function themeToggle(extraClass = '') {
  return `<button class="theme-toggle ${extraClass}" type="button" data-theme-toggle aria-label="Modo escuro desativado. Ativar modo escuro" aria-pressed="false" hidden>
    <span class="theme-toggle-icons" aria-hidden="true"><svg class="theme-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg><svg class="theme-moon" viewBox="0 0 24 24"><path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z"/></svg></span>
    <span data-theme-label>Modo claro</span>
  </button>`;
};
