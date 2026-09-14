'use strict';
const { template } = require('../../scripts/lib/templates');
module.exports = function footer({ variant = 'institutional', prefix = '', home = false } = {}) {
  if (!['institutional', 'contact', 'editorial'].includes(variant)) throw new Error('Unknown footer variant.');
  let markup = template(`components/footer-${variant}.html`);
  if (variant === 'institutional' && !home) markup = markup.replace(/href="#([^"]+)"/g, 'href="index.html#$1"');
  return markup.replace(/(href|src)="(?!https?:|mailto:|tel:|#)([^"]+)"/g, `$1="${prefix}$2"`);
};
