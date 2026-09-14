'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
function template(name, values = {}) {
  return fs.readFileSync(path.join(root, 'src', name), 'utf8').replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!Object.hasOwn(values, key)) throw new Error(`Missing template value: ${name}: ${key}`);
    return values[key];
  });
}
module.exports = { root, template };
