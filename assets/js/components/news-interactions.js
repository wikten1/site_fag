/* Progressive enhancement only; articles and pagination work without JavaScript. */
(() => {
  function imageError(img) {
    const caption = img.closest('figure')?.querySelector('figcaption');
    if (img.dataset.fallback && !img.dataset.fallbackUsed) {
      img.dataset.fallbackUsed = 'true';
      img.removeAttribute('srcset');
      img.alt = '';
      img.src = img.dataset.fallback;
      if (caption) { caption.hidden = false; caption.textContent = 'Ilustração institucional'; }
    } else {
      img.hidden = true;
      if (caption) { caption.hidden = false; caption.textContent = 'Imagem indisponível'; }
    }
  }
  document.addEventListener('error', event => { if (event.target.matches?.('img[data-fallback]')) imageError(event.target); }, true);
  document.querySelectorAll('img[data-fallback]').forEach(img => { if (img.complete && !img.naturalWidth) imageError(img); });

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const motionEnabled = () => !reduceMotion.matches && document.documentElement.dataset.motionPaused !== 'true';
  const observed = new WeakSet();
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (motionEnabled()) entry.target.classList.add('is-revealing');
      observer.unobserve(entry.target);
    });
  }, { threshold: .08 }) : null;
  function revealCards(scope) {
    scope.querySelectorAll('.news-card').forEach((card,index) => {
      if (observed.has(card)) return;
      observed.add(card);
      card.style.setProperty('--reveal-delay', `${index%3*60}ms`);
      observer?.observe(card);
    });
  }

  const archive = document.querySelector('[data-archive-prefix]');
  const editorial = window.FAGEditorial;
  const data = window.FAG_NEWS_ARCHIVE;
  if (archive && editorial && data) {
    const explorer = archive.querySelector('.archive-explorer');
    const form = explorer.querySelector('form');
    const input = form.querySelector('input');
    const clear = form.querySelector('.archive-search-clear');
    const chips = [...explorer.querySelectorAll('[data-topic]')];
    const feedback = archive.querySelector('.archive-feedback');
    const empty = archive.querySelector('.archive-empty');
    const more = archive.querySelector('.archive-more');
    const moreButton = more.querySelector('button');
    const pagination = archive.querySelector('.editorial-pagination');
    const count = archive.querySelector('.archive-count');
    const defaultState = archive.querySelector('.editorial-state');
    let grid = archive.querySelector('.editorial-grid');
    if (!grid) {
      grid = document.createElement('div');
      grid.className = 'editorial-grid';
      empty.before(grid);
    }
    const original = grid.innerHTML;
    const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
    const labels = new Map(data.topics);
    const records = data.items.map(item => ({item, search:normalize([item.title,item.excerpt,item.category,...(item.topics || []).map(topic => labels.get(topic) || topic)].join(' '))}));
    let topic = '', limit = 6, timer;
    function syncURL() {
      const url = new URL(location.href);
      for (const [key,value] of [['q',input.value.trim()],['assunto',topic]]) {
        if (value) url.searchParams.set(key,value); else url.searchParams.delete(key);
      }
      try { history.replaceState(null,'',url); } catch { /* Reading from file URLs still works. */ }
    }
    function render({append=false,updateURL=true} = {}) {
      if (!append) grid.querySelectorAll('.news-card').forEach(card => observer?.unobserve(card));
      const query = input.value.trim();
      const active = Boolean(query || topic);
      clear.hidden = !input.value;
      chips.forEach(chip => chip.setAttribute('aria-pressed',String(chip.dataset.topic===topic)));
      feedback.hidden = !active;
      count.hidden = active;
      if (pagination) pagination.hidden = active;
      if (defaultState) defaultState.hidden = active;
      if (updateURL) syncURL();
      if (!active) {
        grid.innerHTML = original;
        grid.hidden = !original;
        empty.hidden = true;
        more.hidden = true;
        feedback.textContent = '';
        revealCards(grid);
        return;
      }
      const terms = normalize(query).split(/\s+/).filter(Boolean);
      const results = records.filter(record => (!topic || record.item.topics?.includes(topic)) && terms.every(term=>record.search.includes(term))).map(record=>record.item);
      const previousCount = append ? grid.children.length : 0;
      const cards = results.slice(previousCount,limit).map(item => editorial.card(item,{prefix:archive.dataset.archivePrefix,namespace:'search'})).join('');
      if (append) grid.insertAdjacentHTML('beforeend',cards); else grid.innerHTML = cards;
      grid.hidden = results.length===0;
      empty.hidden = results.length!==0;
      more.hidden = results.length<=limit;
      feedback.textContent = `${results.length} ${results.length===1?'notícia encontrada':'notícias encontradas'}${query?` para “${query}”`:''}${topic?` em ${labels.get(topic)}`:''}. Exibindo ${Math.min(limit,results.length)} de ${results.length}.`;
      revealCards(grid);
      if (append) grid.children[previousCount]?.querySelector('a')?.focus({preventScroll:true});
    }
    function update() { clearTimeout(timer); limit = 6; render(); }
    input.addEventListener('input',()=>{ clear.hidden = !input.value; clearTimeout(timer); timer = setTimeout(update,220); });
    form.addEventListener('submit',event=>{ event.preventDefault(); update(); });
    clear.addEventListener('click',()=>{ input.value=''; update(); input.focus(); });
    chips.forEach(chip => chip.addEventListener('click',()=>{ topic=chip.dataset.topic; update(); }));
    archive.querySelector('[data-reset-news]').addEventListener('click',()=>{ input.value=''; topic=''; update(); input.focus(); });
    moreButton.addEventListener('click',()=>{
      moreButton.disabled = true;
      moreButton.setAttribute('aria-busy','true');
      const label = moreButton.innerHTML;
      moreButton.textContent = 'Carregando…';
      // Give the loading feedback a paint; the local index needs no network request.
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        limit += 6;
        render({append:true});
        moreButton.innerHTML = label;
        moreButton.disabled = false;
        moreButton.removeAttribute('aria-busy');
      }));
    });
    function restoreURL() {
      clearTimeout(timer);
      const params = new URLSearchParams(location.search);
      input.value = (params.get('q') || '').slice(0,120);
      topic = labels.has(params.get('assunto')) ? params.get('assunto') : '';
      limit = 6;
      render({updateURL:false});
    }
    explorer.hidden = false;
    restoreURL();
    window.addEventListener('popstate',restoreURL);
  }

  const copy = document.querySelector('[data-copy-link]');
  if (copy) {
    let toastTimer;
    copy.hidden = false;
    copy.addEventListener('click',async()=>{
      const status = document.querySelector('.story-copy-status');
      clearTimeout(toastTimer);
      status.classList.remove('is-toast');
      status.textContent = '';
      try {
        await navigator.clipboard.writeText(copy.dataset.copyLink);
        status.classList.add('is-toast');
        status.textContent = 'Link copiado';
        toastTimer = setTimeout(()=>{ status.classList.remove('is-toast'); status.textContent=''; },5000);
      } catch {
        status.textContent = 'Não foi possível copiar automaticamente. Selecione e copie o endereço: ';
        const link = document.createElement('a');
        link.href = copy.dataset.copyLink;
        link.textContent = copy.dataset.copyLink;
        status.append(link);
        const selection = getSelection(), range = document.createRange();
        range.selectNodeContents(link);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });
  }
  const progress = document.querySelector('.story-progress');
  const body = document.querySelector('.story-body');
  if (progress && body) {
    progress.hidden = false;
    let scheduled = false;
    const updateProgress = () => {
      const start = document.querySelector('.story-heading').getBoundingClientRect().top + scrollY;
      const end = body.getBoundingClientRect().bottom + scrollY - innerHeight;
      const fraction = Math.min(1,Math.max(0,(scrollY-start)/Math.max(1,end-start)));
      progress.firstElementChild.style.transform = `scaleX(${fraction})`;
      scheduled = false;
    };
    const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); } };
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule);
    window.addEventListener('load',schedule);
    document.fonts?.ready.then(schedule);
    updateProgress();
  }
  revealCards(document);
})();
