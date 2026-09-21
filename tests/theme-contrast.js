/* Diagnostic: WCAG contrast for rendered text over solid/composited surfaces.
   Photography/complex gradients still require the accompanying visual review. */
() => {
  const rgba = s => {
    const values = (s.match(/[\d.]+/g) || []).map(Number);
    return s.startsWith('color(srgb ') ? values.map((v,i) => i < 3 ? v * 255 : v) : values;
  };
  const blend = (a,b) => { const alpha=a[3] ?? 1; return a.slice(0,3).map((v,i)=>v*alpha+b[i]*(1-alpha)).concat(1); };
  const lum = c => c.slice(0,3).map(v => v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
  const issues=[], seen=new Set();
  for(const el of document.querySelectorAll('body *')) {
    if (!el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}) || ['SCRIPT','STYLE','SVG','OPTION'].includes(el.tagName) || el.closest('svg, [aria-hidden="true"]')) continue;
    const text=[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join(' ').trim();
    if(!/[\p{L}\p{N}]/u.test(text))continue;
    const style=getComputedStyle(el), layers=[];
    for(let a=el;a;a=a.parentElement){
      const s=getComputedStyle(a);
      const r=a.getBoundingClientRect();
      for(const pseudo of ['::after','::before']){
        const ps=getComputedStyle(a,pseudo);
        if(ps.content!=='none' && ps.position==='absolute' && parseFloat(ps.width)>=r.width*.8 && parseFloat(ps.height)>=r.height*.8) layers.push(rgba(ps.backgroundColor));
      }
      const surface=a.querySelector(':scope > .button-surface, :scope > .card-surface, :scope > .foundation-module-surface');
      if(surface){
        const after=getComputedStyle(surface,'::after');
        if(after.content!=='none')layers.push(rgba(after.backgroundColor));
        layers.push(rgba(getComputedStyle(surface).backgroundColor));
      }
      layers.push(rgba(s.backgroundColor));
    }
    let bg=[255,255,255,1];
    for(const c of layers.reverse())if(c.length>=3)bg=blend(c,bg);
    const fg=blend(rgba(style.color),bg), a=lum(fg), b=lum(bg), ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    const min=parseFloat(style.fontSize)>=24 || (parseFloat(style.fontSize)>=18.66&&parseInt(style.fontWeight)>=700)?3:4.5;
    const key=el.className+'|'+style.color+'|'+bg.join();
    if(ratio<min-.02&&!seen.has(key)){
      seen.add(key);
      const selector=el.tagName.toLowerCase()+(el.className?'.'+String(el.className).split(' ').join('.'):''), sample=text.slice(0,70);
      if(style.backgroundImage!=='none') issues.push({selector,text:sample,requiresVisualReview:true,reason:'Text over gradient/image; solid-color calculation does not represent the rendered background.'});
      else issues.push({selector,text:sample,ratio:Math.round(ratio*100)/100,min,fg:style.color,bg:bg.map(Math.round)});
    }
  }
  return issues;
}
