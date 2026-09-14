/* Shared editorial model and card component: Node build + browser home. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FAGEditorial = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  const date = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  const slug = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  const url = item => `noticias/${item.slug}.html`;
  const safeURL = value => typeof value === 'string' && /^(?:https?:\/\/|(?:\.\.\/)?assets\/|(?:\.\.\/)?noticias(?:\/|\.html)|(?:\.\.\/)?index\.html|(?:\.\.\/)?cursos\.html)/.test(value) ? value : '';
  const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
  function published(items, day = today()) {
    const ids = new Set(), slugs = new Set();
    return (Array.isArray(items) ? items : []).filter(i => i && i.type === 'news' && i.status === 'published' &&
      typeof i.id === 'string' && i.id.trim() && slug(i.slug) && typeof i.title === 'string' && i.title.trim() &&
      typeof i.category === 'string' && i.category.trim() && date(i.publishedAt) && i.publishedAt <= day
    ).sort((a,b) => b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id)).filter(i => {
      if (ids.has(i.id) || slugs.has(i.slug)) return false;
      ids.add(i.id); slugs.add(i.slug); return true;
    });
  }
  function selectNews(items, day) {
    const all = published(items, day), featured = all.find(i => i.featured === true);
    return featured ? [featured, ...all.filter(i => i !== featured).slice(0,3)] : all.slice(0,4);
  }
  function archive(items, page = 1, pageSize = 6, day) {
    const all = published(items, day), featured = all.find(i => i.featured === true);
    const rest = all.filter(i => i !== featured);
    const pages = Math.max(1, Math.ceil(rest.length / pageSize));
    const current = Math.min(pages, Math.max(1, Math.floor(Number(page)) || 1));
    return { featured: current === 1 ? featured : null, items: rest.slice((current-1)*pageSize, current*pageSize),
      total: all.length, remaining: rest.length, current, pages, pageSize };
  }
  function related(item, items) {
    const topics = new Set(item.topics || []);
    return published(items).filter(i => i.id !== item.id).map(i => ({item:i, score:(i.topics || []).filter(t => topics.has(t)).length}))
      .filter(i => i.score > 0).sort((a,b) => b.score-a.score || b.item.publishedAt.localeCompare(a.item.publishedAt))
      .slice(0,3).map(i => i.item);
  }
  function fallback(item) {
    const name = ({science:'ciencia-tecnologia', community:'desenvolvimento-social', education:'educacao-profissional'})[item.fallback] || 'educacao-profissional';
    return {src:`assets/images/noticias/${name}-800.webp`, width:1672, height:941, kind:'illustration', alt:'', caption:'Ilustração institucional',
      sources:[400,800,1200].map(width => ({src:`assets/images/noticias/${name}-${width}.webp`,width}))};
  }
  function imageHTML(item, {prefix='', sizes='(max-width: 767px) calc(100vw - 40px), (max-width: 1024px) 46vw, 397px', eager=false, image=item.image} = {}) {
    const replacement = fallback(item);
    const valid = image && safeURL(image.src) && image.width > 0 && image.height > 0 && (image.alt || image.kind === 'illustration');
    const chosen = valid ? image : replacement;
    const src = value => /^https?:/.test(value) ? value : prefix+value;
    const sources = (chosen.sources || []).filter(s => safeURL(s.src) && Number.isInteger(s.width) && s.width > 0)
      .map(s => `${escape(src(s.src).replaceAll(',', '%2C'))} ${s.width}w`).join(', ');
    const caption = chosen.kind === 'illustration' ? 'Ilustração institucional' : chosen.caption;
    return `<figure class="news-figure${chosen.kind === 'institutional' ? ' news-figure--document' : ''}">
      <div class="news-image-frame"><img src="${escape(src(chosen.src))}" srcset="${sources}" sizes="${escape(sizes)}" width="${Number(chosen.width)}" height="${Number(chosen.height)}" alt="${escape(chosen.alt || '')}" loading="${eager?'eager':'lazy'}" ${eager?'fetchpriority="high" ':''}decoding="async" data-fallback="${escape(src(replacement.src))}"></div>
      <figcaption class="news-caption"${caption || chosen.credit ? '' : ' hidden'}>${escape([caption,chosen.credit].filter(Boolean).join(' · '))}</figcaption></figure>`;
  }
  function meta(item) {
    const d = new Date(`${item.publishedAt}T12:00:00Z`);
    const month = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'][d.getUTCMonth()];
    const full = new Intl.DateTimeFormat('pt-BR',{dateStyle:'long',timeZone:'UTC'}).format(d);
    return `<p class="news-meta"><time datetime="${escape(item.publishedAt)}" aria-label="${escape(full)}">${String(d.getUTCDate()).padStart(2,'0')} ${month} ${d.getUTCFullYear()}</time><span aria-hidden="true">·</span><span class="news-category">${escape(item.category)}</span></p>`;
  }
  function card(item, {prefix='', featured=false, heading='h3', namespace='news', sizes, eager=false} = {}) {
    const titleId = `${namespace}-${item.id}`;
    return `<article class="news-card${featured?' news-card--featured':''}" data-news-id="${escape(item.id)}"><a class="news-card-link" href="${escape(prefix+url(item))}" aria-labelledby="${escape(titleId)}">
      ${imageHTML(item,{prefix,sizes,eager})}<div class="news-body">${featured?'<span class="news-feature-label">Em destaque</span>':''}${meta(item)}
      <${heading} class="news-card-title" id="${escape(titleId)}">${escape(item.title)}</${heading}>
      ${item.excerpt?`<p class="news-excerpt">${escape(item.excerpt)}</p>`:''}<span class="news-read" aria-hidden="true"><span>Ler notícia</span>${arrow}</span></div></a></article>`;
  }
  return {escape, today, date, slug, url, safeURL, arrow, published, selectNews, archive, related, fallback, imageHTML, meta, card};
});
