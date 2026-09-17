'use strict';
const fs = require('node:fs');
const path = require('node:path');
const M = require('../../assets/js/shared/documents-model');

function renderDocuments(data) {
  const items = M.validate(data.items);
  for (const item of items) {
    const bytes = fs.readFileSync(path.resolve(__dirname, '../../assets/documents', item.file));
    if (bytes.subarray(0, 5).toString() !== '%PDF-') throw new Error('Invalid PDF: ' + item.file);
  }
  const sorted = M.select(items);
  const categories = Object.entries(M.types).map(([key, title], index) => {
    const count = items.filter(item => item.type === key).length;
    const descriptions = { edital: 'Processos, seleções e chamadas públicas.', portaria: 'Portarias e atos administrativos da Fundação.', publicacao: 'Resultados, erratas e outras publicações.' };
    return `<a class="doc-category" href="transparencia.html?tipo=${key}#documentos" data-category="${key}" data-doc-reveal><div class="doc-category-top">${M.icon(['file', 'check', 'layers'][index])}<span>0${index + 1}</span></div><h3>${title}</h3><p>${descriptions[key]}</p><div class="doc-category-bottom"><span>${count} ${count === 1 ? 'documento' : 'documentos'}</span><span>Explorar ${M.icon('arrow')}</span></div></a>`;
  }).join('');
  const years = [...new Set(items.map(item => item.year))].sort((a, b) => b - a);
  return {
    documentCategories: categories,
    documentCount: String(items.length),
    documentTable: M.table(sorted.slice(0, 8)),
    documentFallback: sorted.length > 8 ? `<noscript>${M.table(sorted.slice(8))}</noscript>` : '',
    documentYears: years.map(year => `<option value="${year}">${year}</option>`).join(''),
    documentTypes: Object.entries(M.types).filter(([key]) => items.some(item => item.type === key)).map(([key, label]) => `<option value="${key}">${label}</option>`).join(''),
    documentStatuses: [...new Set(items.map(item => M.status(item)))].map(key => `<option value="${key}">${M.statuses[key]}</option>`).join(''),
    documentHistory: years.filter(year => year < Number(data.checkedAt.slice(0, 4))).map(year => `<a href="transparencia.html?ano=${year}#documentos" data-year="${year}"><span>${year}</span><small>${items.filter(item => item.year === year).length} documentos</small>${M.icon('arrow')}</a>`).join(''),
    documentChecked: data.checkedAt.split('-').reverse().join('/')
  };
}
module.exports = { renderDocuments };
