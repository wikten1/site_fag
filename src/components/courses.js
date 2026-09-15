'use strict';
const courses = require('../../content/courses.json');
const { escape: esc, arrow } = require('../../assets/js/shared/news-model');
const sizes = {
  card: '(max-width: 519px) calc(100vw - 40px), (max-width: 699px) 480px, (max-width: 947px) calc((100vw - 68px) / 2), (max-width: 1199px) 440px, (max-width: 1303px) calc((100vw - 112px) / 3), 397px',
  detail: '(max-width: 519px) calc(100vw - 40px), (max-width: 699px) 480px, (max-width: 947px) calc((100vw - 88px) / 2), (max-width: 1199px) 430px, (max-width: 1303px) calc((100vw - 104px) / 2), 600px'
};
function image(course, variant, prefix) {
  const img = course.image;
  const srcset = img.srcset.split(', ').map(src => prefix + src).join(', ');
  return `<div class="course-media"><img src="${esc(prefix + img.src)}" srcset="${esc(srcset)}" sizes="${sizes[variant]}" alt="${esc(img.alt)}" width="${img.width}" height="${img.height}" loading="lazy" decoding="async"></div>`;
}
function meta(course, index) {
  return `<p class="course-meta"><span class="course-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><span>${esc(course.modality)} · ${esc(course.kind)}</span></p>`;
}
function card(course, index, prefix = '', catalog = false) {
  const id = esc(course.slug);
  const categories = [course.modality === 'Presencial' ? 'presencial' : '', course.kind === 'Curso técnico' ? 'tecnico' : ''].filter(Boolean).join(' ');
  const action = catalog
    ? `<details class="course-description"><summary class="course-link"><span>Ver curso<span class="catalog-sr-only">: ${esc(course.title)}</span></span>${arrow}</summary><div class="course-expanded"><p>${esc(course.description)}</p><a href="${prefix}contato.html">Consultar oferta e inscrições${arrow}</a></div></details>`
    : `<a class="course-link" href="${prefix}cursos.html#${id}" aria-labelledby="acao-${id} curso-${id}"><span id="acao-${id}">Ver curso</span>${arrow}</a>`;
  return `<li data-course-reveal${catalog ? ` data-catalog-item data-categories="${categories}" data-name="${esc(course.title)}"` : ''}><article class="course-card"${catalog ? ` id="${id}" tabindex="-1"` : ''} aria-labelledby="curso-${id}" style="--course-position: ${esc(course.position)}">
${image(course, 'card', prefix)}<div class="course-body">${meta(course, index)}
<h3 class="course-title" id="curso-${id}" tabindex="-1">${esc(course.title)}</h3>
<p class="course-summary">${esc(course.summary)}</p>
<div class="course-footer">${action}</div>
</div></article></li>`;
}
function detail(course, index, prefix = '') {
  const id = esc(course.slug);
  return `<article class="catalog-course" id="${id}" aria-labelledby="${id}-title" tabindex="-1" style="--course-position: ${esc(course.position)}">
${image(course, 'detail', prefix)}<div>${meta(course, index)}<h2 id="${id}-title">${esc(course.title)}</h2>
<p>${esc(course.summary)}</p><p>${esc(course.description)}</p>
<a class="catalog-back" href="#catalogo">Voltar à lista de cursos <span aria-hidden="true">↑</span></a></div></article>`;
}
module.exports = { courses, card, detail, index: (course) => `<li><a href="#${esc(course.slug)}">${esc(course.title)}</a></li>` };
