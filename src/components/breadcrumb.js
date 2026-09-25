'use strict';
const { escape: esc } = require('../../assets/js/shared/news-model');
module.exports = function breadcrumb({ items, className = 'editorial-breadcrumb', label = 'Navegação contextual', currentOnItem = false, chevrons = false }, prefix = '') {
  const separator = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 4 4 4-4 4"/></svg>';
  return `<nav class="${esc(className)}" aria-label="${esc(label)}"><ol>${items.map((item, index) => {
    const current = index === items.length - 1;
    const text = esc(item.label);
    const content = current ? (currentOnItem ? text : `<span aria-current="page">${text}</span>`) : `<a href="${esc(prefix + item.href)}">${text}</a>`;
    return `<li${current && currentOnItem ? ' aria-current="page"' : ''}>${chevrons && index ? separator : ''}${content}</li>`;
  }).join('')}</ol></nav>`;
};
