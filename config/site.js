'use strict';
const value = process.env.FAG_SITE_URL || 'https://fag.tangua.rj.gov.br';
const url = new URL(value);
if (!['https:', 'http:'].includes(url.protocol) || url.search || url.hash || url.username || url.password) {
  throw new Error('FAG_SITE_URL must be a public HTTP(S) URL without credentials, query or fragment.');
}
module.exports = Object.freeze({
  url: url.href.replace(/\/$/, ''),
  name: 'FAG',
  locale: 'pt_BR',
  themeColor: '#F5F8F1',
  logo: 'assets/images/brand/logo.webp',
  socialImage: 'assets/images/institutional/hero-1200.webp'
});
