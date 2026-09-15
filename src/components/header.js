'use strict';
const { template } = require('../../scripts/lib/templates');
module.exports = function header({ prefix = '', active = '', article = false, variant = 'full' } = {}) {
  if (variant === 'catalog') return template('components/header-catalog.html').replace(/(href|src)="(?!https?:|#)([^"]+)"/g, `$1="${prefix}$2"`);
  let markup = template('components/header.html');
  if (active !== 'home') {
    markup = markup.replace('class="nav-link is-active"', 'class="nav-link"').replace(' aria-current="location"', '')
      .replace(/href="#inicio"/g, 'href="index.html"')
      .replace(/href="#([^"]+)"/g, 'href="index.html#$1"')
      .replace('Pesquise sobre educação, pesquisa ou a atuação da FAG.', 'Pesquise nos títulos e conteúdos desta página.');
    if (active === 'news') markup = markup.replace('<a class="nav-link" href="noticias.html">', `<a class="nav-link is-active" aria-current="${article ? 'true' : 'page'}" href="noticias.html">`);
    if (active === 'programs') markup = markup.replace('<a class="nav-link" href="programas-e-projetos.html">', '<a class="nav-link is-active" aria-current="page" href="programas-e-projetos.html">');
    if (active === 'about') {
      markup = markup.replace('<a class="nav-link" href="sobre.html">', '<a class="nav-link is-active" aria-current="page" href="sobre.html">')
        .replace('href="sobre.html">Conhecer a FAG', 'href="contato.html">Fale com a FAG');
    }
  }
  return markup.replace(/(href|src)="(?!https?:|#)([^"]+)"/g, `$1="${prefix}$2"`);
};
