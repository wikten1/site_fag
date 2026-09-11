/* Home header behavior adapted to static editorial pages. */
(() => {
  const root = document.documentElement;
  const navbar = document.getElementById('navbar');
  const utility = document.querySelector('.utility-bar');
  if (!navbar || !utility) return;
  const button = navbar.querySelector('.mobile-menu-btn');
  const menu = document.getElementById('nav-links');
  const panels = [...utility.querySelectorAll('details')];
  const mobile = matchMedia('(max-width: 820px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = document.getElementById('utility-motion');
  const storageKey = 'fag-hero-motion-paused';
  let userPaused = false;
  try { userPaused = sessionStorage.getItem(storageKey) === 'true'; } catch { /* Storage is optional. */ }
  function syncMotion() {
    root.dataset.motionPaused = String(userPaused);
    motion.checked = userPaused || reduced.matches;
    motion.disabled = reduced.matches;
    motion.closest('label').hidden = false;
    document.getElementById('motion-preference-note').hidden = !reduced.matches;
    if (userPaused || reduced.matches) navbar.classList.add('entrance-complete');
  }
  syncMotion();
  motion.addEventListener('change', () => {
    userPaused = motion.checked;
    try { sessionStorage.setItem(storageKey,String(userPaused)); } catch { /* Optional persistence. */ }
    syncMotion();
  });
  reduced.addEventListener('change',syncMotion);
  navbar.classList.add('nav-enhanced');
  function setMenu(open, returnFocus=false) {
    const expanded = open && mobile.matches;
    navbar.classList.toggle('menu-open',expanded);
    button.setAttribute('aria-expanded',String(expanded));
    button.setAttribute('aria-label',expanded?'Fechar menu':'Abrir menu');
    menu.inert = mobile.matches && !expanded;
    if (returnFocus) button.focus({preventScroll:true});
  }
  function syncSize() {
    root.style.setProperty('--utility-height',utility.getBoundingClientRect().height+'px');
    // Use layout measurements, unaffected by the entrance animation transform.
    root.style.setProperty('--header-offset',(parseFloat(getComputedStyle(navbar).top)+navbar.offsetHeight+16)+'px');
    root.style.setProperty('--header-space',(utility.offsetHeight+navbar.offsetHeight+32)+'px');
  }
  function syncScroll() { navbar.classList.toggle('is-scrolled',scrollY>24); syncSize(); }
  setMenu(false);
  syncScroll();
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(syncSize);
    observer.observe(utility); observer.observe(navbar);
  }
  let frame;
  addEventListener('scroll',()=>{if(frame)return;frame=requestAnimationFrame(()=>{frame=null;syncScroll();});},{passive:true});
  addEventListener('resize',syncSize);
  navbar.addEventListener('transitionend',syncSize);
  button.addEventListener('click',()=>{
    panels.forEach(p=>{p.open=false;});
    setMenu(button.getAttribute('aria-expanded')!=='true');
  });
  mobile.addEventListener('change',()=>{
    const inMenu=menu.contains(document.activeElement), onButton=document.activeElement===button;
    setMenu(false);
    if(mobile.matches && inMenu)button.focus();
    else if(!mobile.matches && onButton)navbar.querySelector('.brand-lockup').focus();
    syncSize();
  });
  panels.forEach(panel=>{
    panel.addEventListener('toggle',()=>{
      if(!panel.open)return;
      panels.forEach(other=>{if(other!==panel)other.open=false;});
      setMenu(false);
      if(panel.id==='page-search')document.getElementById('page-search-input').focus({preventScroll:true});
    });
    const close=panel.querySelector('[data-utility-close]');
    close.hidden=false;
    close.addEventListener('click',()=>{panel.open=false;panel.querySelector('summary').focus({preventScroll:true});});
  });
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    const opened=panels.find(p=>p.open);
    if(opened){event.preventDefault();opened.open=false;opened.querySelector('summary').focus({preventScroll:true});}
    else if(navbar.classList.contains('menu-open')){event.preventDefault();setMenu(false,true);}
  });
  document.addEventListener('pointerdown',event=>{
    panels.forEach(panel=>{
      if(!panel.open||panel.contains(event.target))return;
      const focused=panel.contains(document.activeElement);panel.open=false;
      if(focused)panel.querySelector('summary').focus({preventScroll:true});
    });
    if(!navbar.contains(event.target)&&navbar.classList.contains('menu-open'))setMenu(false,menu.contains(document.activeElement));
  });
  document.addEventListener('focusin',event=>{
    panels.forEach(panel=>{if(panel.open&&!panel.contains(event.target))panel.open=false;});
    if(!navbar.contains(event.target)&&navbar.classList.contains('menu-open'))setMenu(false);
  });
  const form=utility.querySelector('.utility-search');
  const input=document.getElementById('page-search-input');
  const results=utility.querySelector('.search-results');
  const status=utility.querySelector('.search-status');
  const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
  form.hidden=false;
  form.addEventListener('submit',event=>{
    event.preventDefault();results.replaceChildren();
    const query=input.value.trim();
    if(!query){status.textContent='Digite um termo para buscar.';input.focus();return;}
    const terms=normalize(query).split(/\s+/);
    const entries=[...document.querySelectorAll('main .news-card, main .story-body, main .editorial-opening, main [data-page-search]')].map((content,index)=>{
      const target=content.matches('.story-body')?document.querySelector('.story-heading h1'):content.querySelector('h1,h2,h3');
      if(target&&!target.id)target.id='header-search-'+index;
      return {content,target};
    });
    const matches=entries.filter(e=>e.target&&terms.every(term=>normalize(e.content.textContent+' '+e.target.textContent).includes(term)));
    status.textContent=matches.length?matches.length+(matches.length===1?' resultado encontrado.':' resultados encontrados.'):'Nenhum resultado encontrado. Tente outro termo.';
    matches.forEach(({target})=>{
      const li=document.createElement('li'),link=document.createElement('a');
      link.className='search-result';link.href='#'+target.id;link.textContent=target.textContent.trim();
      target.tabIndex=-1;
      link.addEventListener('click',event=>{
        if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
        document.getElementById('page-search').open=false;target.focus({preventScroll:true});
      });
      li.append(link);results.append(li);
    });
  });
  document.querySelector('.skip-link').addEventListener('click',()=>document.getElementById('conteudo').focus({preventScroll:true}));
})();
