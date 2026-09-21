'use strict';
const fs = require('node:fs');
// The first paint/browser chrome uses the same light token as the interface.
const tokens = fs.readFileSync(require.resolve('../assets/css/tokens.css'), 'utf8');
const themeColor = tokens.match(/--background:\s*(#[\da-f]{6})\s*;/i)?.[1];
if (!themeColor) throw new Error('tokens.css must declare the default --background color.');
const value = process.env.FAG_SITE_URL || 'https://fag.tangua.rj.gov.br';
const url = new URL(value);
if (!['https:', 'http:'].includes(url.protocol) || url.search || url.hash || url.username || url.password) {
  throw new Error('FAG_SITE_URL must be a public HTTP(S) URL without credentials, query or fragment.');
}
module.exports = Object.freeze({
  url: url.href.replace(/\/$/, ''),
  name: 'FAG',
  locale: 'pt_BR',
  themeColor,
  logo: 'assets/images/brand/logo.webp',
  socialImage: 'assets/images/institutional/hero-1200.webp'
});
