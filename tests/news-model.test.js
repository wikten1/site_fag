const assert = require('node:assert/strict');
const E = require('../assets/js/shared/news-model.js');
const source = require('../content/news.json').items;
const base = source[0];
const items = Array.from({length:200},(_,i)=>({...base,id:`record-${i}`,slug:`record-${i}`,featured:false,publishedAt:'2025-01-01'}));
items[21].featured=true;
assert.equal(E.selectNews(items).length,4);
assert.equal(E.selectNews(items)[0].id,items[21].id);
const seen = new Set([items[21].id]);
const totalPages=E.archive(items).pages;
assert.equal(totalPages,34);
for(let n=1;n<=totalPages;n++) {
  const page=E.archive(items,n);
  assert(page.items.length<=6);
  for(const item of page.items){assert(!seen.has(item.id));seen.add(item.id);}
  if(n>1)assert.equal(page.featured,null);
}
assert.equal(seen.size,200);
assert.equal(E.archive(items.map(i=>({...i,featured:false}))).featured,undefined);
assert.equal(E.archive([]).pages,1);
assert.equal(E.archive([]).total,0);
assert.equal(E.archive(items,999).current,34);
assert.equal(E.archive(items,-2).current,1);
assert.equal(E.published([...items,items[0],{...items[0],id:'same-slug'}]).length,200);
for(const change of [{publishedAt:'2099-01-01'},{publishedAt:'2025-02-30'},{status:'draft'},{type:'course'},{slug:'../escape'},{slug:'javascript:alert(1)'},{title:''}]) {
  assert.equal(E.published([{...base,...change}],'2026-09-10').length,0);
}
for(const item of source) {
  assert(E.related(item,source).every(other=>other.id!==item.id && other.topics.some(t=>item.topics.includes(t))));
  assert(!E.url(item).startsWith('http'));
  assert(!item.title.includes('?'));
  assert(!item.excerpt.endsWith('?'));
}
assert.match(E.card({...base,title:'<script>alert(1)</script>'}),/&lt;script&gt;/);
assert.doesNotMatch(E.card({...base,title:'<script>alert(1)</script>'}),/<script>/);
console.log('PASS: 200 records, 34 archive pages, no duplicate/omitted stories, related topics, validation and escaping.');
