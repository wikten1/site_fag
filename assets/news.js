(() => {
  'use strict';

  const section = document.querySelector('.news');
  if (!section) return;
  const grid = section.querySelector('[data-news-grid]');
  const status = section.querySelector('[data-news-status]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const fullDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' });
  const animations = new Set();
  let observer;

  const fallbacks = {
    science: fallbackImage('ciencia-tecnologia'),
    community: fallbackImage('desenvolvimento-social'),
    education: fallbackImage('educacao-profissional')
  };

  function fallbackImage(name) {
    return {
      src: `assets/images/noticias/${name}-800.webp`,
      sources: [400, 800, 1200].map(width => ({ src: `assets/images/noticias/${name}-${width}.webp`, width })),
      width: 1672, height: 941, kind: 'illustration', alt: '',
      caption: 'Ilustração institucional', credit: ''
    };
  }

  function safeURL(value) {
    if (typeof value !== 'string' || !value.trim() || value.startsWith('#')) return '';
    try {
      const url = new URL(value, document.baseURI);
      // Local file previews are supported; remote executable/data URLs are not.
      if (['https:', 'http:'].includes(url.protocol) ||
          (location.protocol === 'file:' && url.protocol === 'file:')) return url.href;
    } catch { /* Invalid records are omitted without breaking the section. */ }
    return '';
  }

  function parseDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const date = new Date(`${value}T12:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
  }

  function selectNews(items, today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date())) {
    const ids = new Set();
    const urls = new Set();
    const valid = (Array.isArray(items) ? items : []).filter(item =>
      item && item.type === 'news' && item.status === 'published' &&
      typeof item.id === 'string' && item.id.trim() &&
      typeof item.title === 'string' && item.title.trim() &&
      typeof item.category === 'string' && item.category.trim() &&
      parseDate(item.publishedAt) && item.publishedAt <= today && safeURL(item.url)
    ).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id));
    const unique = valid.filter(item => {
      const url = safeURL(item.url);
      if (ids.has(item.id) || urls.has(url)) return false;
      ids.add(item.id);
      urls.add(url);
      return true;
    });
    const featured = unique.find(item => item.featured === true);
    return featured ? [featured, ...unique.filter(item => item !== featured).slice(0, 3)] : unique.slice(0, 4);
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function arrow() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', 'M4 12h16m-6-6 6 6-6 6');
    svg.append(path);
    return svg;
  }

  function addImage(link, item, prominent, asymmetric) {
    const figure = element('figure', 'news-figure');
    const frame = element('div', 'news-image-frame');
    const img = element('img');
    const caption = element('figcaption', 'news-caption');
    const fallback = fallbacks[item.fallback] || fallbacks.education;
    const candidate = item.image;
    const hasImage = candidate && safeURL(candidate.src) && Number(candidate.width) > 0 &&
      Number(candidate.height) > 0 && (candidate.kind === 'illustration' ||
      (typeof candidate.alt === 'string' && candidate.alt.trim()));
    img.loading = 'lazy';
    img.decoding = 'async';
    img.sizes = asymmetric
      ? prominent ? '(max-width: 767px) calc(100vw - 40px), (max-width: 1024px) calc(100vw - 48px), (max-width: 1304px) 55vw, 714px'
        : '(max-width: 767px) calc(100vw - 40px), (max-width: 1024px) calc((100vw - 72px) / 2), 150px'
      : '(max-width: 767px) calc(100vw - 40px), (max-width: 1024px) 50vw, 620px';

    function setImage(image) {
      img.alt = image.alt || '';
      img.width = Number(image.width);
      img.height = Number(image.height);
      const sources = (Array.isArray(image.sources) ? image.sources : []).filter(source =>
        safeURL(source.src) && Number.isInteger(source.width) && source.width > 0
      );
      img.srcset = sources.map(source => `${safeURL(source.src).replaceAll(',', '%2C')} ${source.width}w`).join(', ');
      img.src = safeURL(image.src);
      const label = image.kind === 'illustration' ? 'Ilustração institucional' : image.caption;
      caption.textContent = [label, image.credit].filter(Boolean).join(' · ');
      caption.hidden = !caption.textContent;
    }
    let usingFallback = !hasImage;
    img.addEventListener('error', () => {
      if (!usingFallback) {
        usingFallback = true;
        setImage(fallback);
      } else {
        img.hidden = true;
        caption.textContent = 'Imagem indisponível';
        caption.hidden = false;
      }
    });
    setImage(hasImage ? candidate : fallback);
    frame.append(img);
    figure.append(frame, caption);
    link.append(figure);
  }

  function card(item, index, asymmetric) {
    const featured = item.featured === true && index === 0;
    const article = element('article', `news-card${featured ? ' news-card--featured' : ''}`);
    const link = element('a', 'news-card-link');
    link.href = safeURL(item.url);
    const titleId = `news-story-${index}`;
    link.setAttribute('aria-labelledby', titleId);
    addImage(link, item, featured, asymmetric);
    const body = element('div', 'news-body');
    if (featured) body.append(element('span', 'news-feature-label', 'Em destaque'));
    const meta = element('p', 'news-meta');
    const date = parseDate(item.publishedAt);
    const time = element('time', '', `${String(date.getUTCDate()).padStart(2, '0')} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`);
    time.dateTime = item.publishedAt;
    time.setAttribute('aria-label', fullDate.format(date));
    const dot = element('span', '', '·');
    dot.setAttribute('aria-hidden', 'true');
    meta.append(time, dot, element('span', 'news-category', item.category));
    const title = element('h3', 'news-card-title', item.title);
    title.id = titleId;
    body.append(meta, title);
    if (typeof item.excerpt === 'string' && item.excerpt.trim()) body.append(element('p', 'news-excerpt', item.excerpt));
    const read = element('span', 'news-read');
    read.setAttribute('aria-hidden', 'true');
    read.append(element('span', '', 'Ler notícia'), arrow());
    body.append(read);
    link.append(body);
    article.append(link);
    return article;
  }

  function motionAllowed() {
    return !reducedMotion.matches && document.documentElement.dataset.motionPaused !== 'true';
  }

  function stopAnimations() {
    animations.forEach(animation => animation.cancel());
    animations.clear();
  }

  function revealCards() {
    if (!('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (!motionAllowed() || !entry.target.animate || entry.target.contains(document.activeElement)) return;
        const animation = entry.target.animate([
          { opacity: 0, transform: 'translateY(20px)', filter: 'blur(2px)' },
          { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' }
        ], { duration: 620, delay: Number(entry.target.dataset.order) * 90, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      });
    }, { threshold: 0.08 });
    [...grid.children].forEach((node, index) => {
      node.dataset.order = index;
      observer.observe(node);
    });
  }

  function render(items) {
    if (observer) observer.disconnect();
    stopAnimations();
    const selected = selectNews(items);
    // One/two/three items use one/two/three balanced columns. With four, use 7 + 5.
    const asymmetric = selected.length === 4 && selected[0].featured === true;
    grid.classList.toggle('has-featured', asymmetric);
    grid.dataset.count = String(selected.length);
    grid.replaceChildren(...selected.map((item, index) => card(item, index, asymmetric)));
    grid.hidden = selected.length === 0;
    status.textContent = selected.length ? '' : 'Novas notícias serão publicadas em breve. Acompanhe as próximas atualizações da FAG.';
    status.hidden = selected.length !== 0;
    revealCards();
  }

  // Public adapter: a CMS can refresh records without rebuilding cards or layouts.
  window.FAGNews = Object.freeze({ selectNews, render });
  grid.addEventListener('focusin', stopAnimations);
  reducedMotion.addEventListener('change', () => { if (!motionAllowed()) stopAnimations(); });
  new MutationObserver(() => { if (!motionAllowed()) stopAnimations(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion-paused'] });

  async function init() {
    if (!section.dataset.source) {
      render(window.FAG_NEWS_DATA?.items || []);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    section.setAttribute('aria-busy', 'true');
    status.hidden = false;
    status.textContent = 'Carregando notícias…';
    try {
      const response = await fetch(section.dataset.source, { signal: controller.signal, credentials: 'same-origin' });
      if (!response.ok) throw new Error('News feed unavailable');
      const data = await response.json();
      if (!data || !Array.isArray(data.items)) throw new Error('Invalid news feed');
      render(data.items);
    } catch {
      // A failed feed must not quietly show stale editorial records as current.
      grid.replaceChildren();
      grid.hidden = true;
      status.hidden = false;
      status.textContent = 'Não foi possível carregar as notícias agora. Acesse o arquivo completo pelo link abaixo.';
    } finally {
      clearTimeout(timeout);
      section.removeAttribute('aria-busy');
    }
  }
  init();
})();
