'use strict';
const site = require('../../config/site');
const { escape: esc } = require('../../assets/js/shared/news-model');
module.exports = function head({ title, description, route, prefix = '', styles = [], scripts = [], noindex = false, article = false, image = site.socialImage, extra = '' }) {
  const canonical = site.url + '/' + (route === 'index.html' ? '' : route);
  return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="${site.themeColor}">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${esc(canonical)}">
<meta property="og:locale" content="${site.locale}">
<meta property="og:site_name" content="${site.name}">
<meta property="og:type" content="${article ? 'article' : 'website'}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${esc(site.url + '/' + image)}">
<meta name="twitter:card" content="summary_large_image">`}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&amp;display=swap" rel="stylesheet">
${['assets/css/tokens.css', 'assets/css/base.css', ...styles].map(file => `<link rel="stylesheet" href="${esc(prefix + file)}">`).join('\n')}
${scripts.map(file => `<script src="${esc(prefix + file)}" defer></script>`).join('\n')}
${extra}`;
};
