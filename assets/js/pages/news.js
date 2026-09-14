(() => {
  'use strict';
  const section = document.querySelector('.news');
  if (!section) return;
  const grid = section.querySelector('[data-news-grid]');
  const status = section.querySelector('[data-news-status]');
  const E = window.FAGEditorial;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  let observer;
  const motionAllowed = () => !reduced.matches && document.documentElement.dataset.motionPaused !== 'true';
  function stop() { animations.forEach(a => a.cancel()); animations.clear(); }
  function render(items, { hydrate = false } = {}) {
    observer?.disconnect();
    stop();
    const selected = E.selectNews(items);
    const asymmetric = selected.length === 4 && selected[0].featured === true;
    grid.dataset.count = selected.length;
    grid.classList.toggle('has-featured', asymmetric);
    if (!hydrate) grid.innerHTML = selected.map((item,index) => E.card(item,{
      featured: index===0 && item.featured === true, namespace:'home',
      sizes: asymmetric ? index===0 ? '(max-width: 1024px) calc(100vw - 48px), 714px' : '(max-width: 767px) calc(100vw - 40px), (max-width: 1024px) 46vw, 150px' : undefined
    })).join('');
    grid.hidden = !selected.length;
    status.hidden = !!selected.length;
    status.textContent = selected.length?'':'Novas notícias serão publicadas em breve. Acompanhe as próximas atualizações da FAG.';
    if (!('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (!motionAllowed() || !entry.target.animate || entry.target.contains(document.activeElement)) return;
        const animation = entry.target.animate([
          {opacity:0,transform:'translateY(20px)',filter:'blur(2px)'},
          {opacity:1,transform:'translateY(0)',filter:'blur(0)'}
        ],{duration:620,delay:Number(entry.target.dataset.order)*90,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
        animations.add(animation);
        animation.onfinish=()=>animations.delete(animation);
      });
    },{threshold:.08});
    [...grid.children].forEach((card,index)=>{card.dataset.order=index;observer.observe(card);});
  }
  grid.addEventListener('focusin',stop);
  reduced.addEventListener('change',()=>{if(!motionAllowed())stop();});
  new MutationObserver(()=>{if(!motionAllowed())stop();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-motion-paused']});
  if (!E || !Array.isArray(window.FAG_NEWS_DATA?.items)) {
    status.hidden=false;
    status.textContent='Não foi possível carregar as notícias agora. Acesse o arquivo completo pelo link abaixo.';
    return;
  }
  window.FAGNews=Object.freeze({selectNews:E.selectNews,render});
  render(window.FAG_NEWS_DATA.items, { hydrate: grid.dataset.rendered === 'true' });
})();
