"""Browser checks: python tests/news-check.py [--screenshots]. Requires Playwright."""
import json
import threading
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ARTIFACTS, launch_options

ROOT = Path(__file__).resolve().parents[1]
items = json.loads((ROOT/'content/news.json').read_text(encoding='utf-8'))['items']
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass
    def do_GET(self):
        try:
            super().do_GET()
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            pass  # Navigation cancels in-flight image requests normally.
server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/'
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(**launch_options(),headless=True)
        page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.goto(base+'index.html')
        page.locator('#noticias-recentes').scroll_into_view_if_needed()
        assert page.locator('.news-card').count()==4
        assert page.locator('.news-archive-link').get_attribute('href')=='noticias.html'
        assert page.locator('.nav-link[href="noticias.html"]').count()==1
        assert all(url.startswith('noticias/') for url in page.locator('.news-card-link').evaluate_all('(nodes)=>nodes.map(n=>n.getAttribute("href"))'))
        for count in range(5):
            page.evaluate('(n)=>FAGNews.render(FAG_NEWS_DATA.items.slice(0,n))',count)
            assert page.locator('.news-card').count()==count
            assert page.locator('[data-news-status]').is_visible()==(count==0)
        page.evaluate('FAGNews.render(FAG_NEWS_DATA.items)')
        page.locator('.news-card-link').first.click()
        assert '/noticias/' in page.url
        assert page.locator('.story-heading h1').count()==1
        page.locator('.story-return a').click()
        assert page.url==base+'noticias.html'
        assert page.locator('.archive-feature .news-card').count()==1
        assert page.locator('.archive-list .news-card').count()==6
        first_ids=page.locator('.news-card').evaluate_all('(nodes)=>nodes.map(n=>n.dataset.newsId)')
        page.locator('.editorial-pagination a[rel="next"]').click()
        assert 'pagina-2.html' in page.url
        assert page.locator('.archive-feature').count()==0
        second_ids=page.locator('.news-card').evaluate_all('(nodes)=>nodes.map(n=>n.dataset.newsId)')
        assert len(first_ids+second_ids)==len(set(first_ids+second_ids))==len(items)
        page.locator('.editorial-pagination a[rel="prev"]').click()
        assert 'noticias.html' in page.url

        # Search covers the entire archive, including the feature and later pages.
        search = page.locator('#news-search')
        search.fill('capacitacao')
        page.locator('.archive-search-submit').click()
        assert page.locator('.archive-list .news-card').count()==1
        assert page.locator('.archive-list .news-card').first.get_attribute('data-news-id')=='capacitacao-servidores'
        assert page.locator('.editorial-pagination').is_hidden()
        assert 'q=capacitacao' in page.url
        page.reload()
        assert search.input_value()=='capacitacao'
        assert page.locator('.archive-list .news-card').count()==1
        page.locator('[data-topic="ciencia"]').click()
        assert page.locator('.archive-empty').is_visible()
        assert page.locator('[data-topic="ciencia"]').get_attribute('aria-pressed')=='true'
        page.locator('[data-reset-news]').click()
        assert search.evaluate('(e)=>e===document.activeElement')
        assert page.locator('.archive-list .news-card').count()==6
        assert page.locator('.editorial-pagination').is_visible()
        page.locator('[data-topic="educacao"]').click()
        assert page.locator('.archive-list .news-card').count()==5
        page.locator('[data-topic=""]').click()
        search.fill('noticias')
        page.locator('.archive-search-submit').click()
        assert page.locator('.archive-list .news-card').count()==6
        page.locator('.archive-more button').click()
        page.wait_for_function('document.querySelectorAll(".archive-list .news-card").length===9')
        assert page.locator('.archive-more').is_hidden()
        result_ids=page.locator('.archive-list .news-card').evaluate_all('(nodes)=>nodes.map(n=>n.dataset.newsId)')
        assert len(set(result_ids))==len(items)
        assert page.locator('.archive-list .news-card-link').nth(6).evaluate('(e)=>e===document.activeElement')
        page.locator('.archive-search-clear').click()
        search.fill('<img src=x onerror=alert(1)>')
        page.locator('.archive-search-submit').click()
        assert page.locator('.archive-empty').is_visible()
        assert page.locator('.archive-feedback img').count()==0
        page.locator('[data-reset-news]').click()

        # Original titles/dates/content, local reading graph and working photographs.
        for item in items:
            response=page.goto(base+'noticias/'+item['slug']+'.html')
            assert response.status==200
            assert page.locator('h1').count()==1
            assert page.locator('h1').inner_text()==item['title']
            assert page.locator('.story-heading time').get_attribute('datetime')==item['publishedAt']
            body=' '.join(page.locator('.story-body').inner_text().split())
            original=' '.join(' '.join(''.join(r['text'] for r in b['runs']) for b in item['blocks']).split())
            assert body==original,(item['id'],body,original)
            assert page.locator('.story-body').evaluate('(e)=>e.getBoundingClientRect().width')<=760
            assert page.locator('a[href*="fag.tangua.rj.gov.br/category/noticias"]').count()==0
            peers=page.locator('.story-related .news-card').evaluate_all('(nodes)=>nodes.map(n=>n.dataset.newsId)')
            assert item['id'] not in peers
            assert all(any(t in item['topics'] for t in next(i for i in items if i['id']==peer)['topics']) for peer in peers)
            for image in page.locator('main img').all():
                image.scroll_into_view_if_needed()
                image.evaluate('(i)=>i.decode()')
                assert image.evaluate('(i)=>i.naturalWidth>0')
            assert not page.locator('main [data-fallback-used]').count()
            assert page.locator('.news-card-link a,.news-card-link button').count()==0

        feature=next(i for i in items if i['featured'])
        for route in ['noticias.html','noticias/pagina-2.html','noticias/'+feature['slug']+'.html']:
            page.goto(base+route)
            for width in [1440,1024,768,640,390,320]:
                page.set_viewport_size({'width':width,'height':1000})
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(route,width)
                assert page.locator('h1').is_visible()
                if '--screenshots' in sys.argv and width in [1440,390] and 'pagina-' not in route:
                    for image in page.locator('main img').all():
                        image.scroll_into_view_if_needed()
                        image.evaluate('(i)=>i.decode()')
                    page.evaluate('window.scrollTo(0,0)')
                    name='archive' if route=='noticias.html' else 'article'
                    page.screenshot(path=str(ARTIFACTS/f'{name}-{width}.png'),full_page=True)
            # Equivalent layout to 200% desktop zoom; also stress doubled text sizing.
            page.set_viewport_size({'width':640,'height':800})
            page.add_style_tag(content='html{font-size:200% !important}')
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),route
            page.reload()
            page.locator('.mobile-menu-btn').click()
            page.keyboard.press('Escape')
            assert page.locator('.mobile-menu-btn').get_attribute('aria-expanded')=='false'
            assert page.locator('.mobile-menu-btn').evaluate('(e)=>e===document.activeElement')
            assert page.locator('.mobile-menu-btn').evaluate('(e)=>getComputedStyle(e).outlineWidth')=='3px'

        page.set_viewport_size({'width':1440,'height':1000})
        page.goto(base+'noticias.html')
        card=page.locator('.news-card-link').first
        card.focus()
        assert card.evaluate('(e)=>getComputedStyle(e).outlineWidth')=='3px'
        page.keyboard.press('Tab')
        assert page.locator('#news-search').evaluate('(e)=>e===document.activeElement')
        assert page.locator('.nav-link.is-active').get_attribute('aria-current')=='page'
        page.locator('main img').first.evaluate('(i)=>{i.removeAttribute("srcset");i.src="/missing.webp"}')
        page.wait_for_function('document.querySelector("main img").dataset.fallbackUsed === "true"')
        assert page.locator('main .news-caption').first.inner_text()=='Ilustração institucional'
        page.goto(base+'noticias/'+feature['slug']+'.html')
        page.evaluate('Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async text=>{window.copiedURL=text}}})')
        page.locator('[data-copy-link]').click()
        assert page.locator('.story-copy-status').inner_text()=='Link copiado'
        assert page.evaluate('window.copiedURL').endswith(feature['slug']+'.html')
        page.evaluate('Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async()=>{throw new Error("denied")}}})')
        page.locator('[data-copy-link]').click()
        assert page.locator('.story-copy-status a').is_visible()
        assert page.locator('.story-progress').is_visible()
        page.locator('.story-share').scroll_into_view_if_needed()
        page.wait_for_function('document.querySelector(".story-progress span").style.transform==="scaleX(1)"')
        assert page.locator('.story-reading-time').inner_text().startswith('2 min')
        assert page.locator('.news-card').first.evaluate('(e)=>getComputedStyle(e).animationName')=='none'
        nojs=browser.new_page(java_script_enabled=False)
        nojs.goto(base+'noticias.html')
        nojs.locator('.news-card-link').first.click()
        assert nojs.locator('.story-body').is_visible()
        nojs.locator('.story-return a').click()
        nojs.locator('.editorial-pagination a[rel="next"]').click()
        assert 'pagina-2' in nojs.url
        nojs.close()
        assert not errors,errors
        browser.close()
        print('PASS: home / archive / article / related; all 9 stories; search, topics, URL state, empty results, load more; sharing; pagination; 6 widths; text zoom; keyboard; no-JS; reduced motion; image fallback.')
finally:
    server.shutdown()
