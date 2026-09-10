"""Browser regression checks. Requires Python + playwright and local Chrome.
Run from any directory: python tests/news-check.py [--screenshots]
"""
import json
import threading
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}/index.html'

try:
    with sync_playwright() as p:
        chrome = Path('C:/Program Files/Google/Chrome/Application/chrome.exe')
        browser = p.chromium.launch(executable_path=str(chrome) if chrome.exists() else None, headless=True)
        page = browser.new_page(viewport={'width': 1440, 'height': 1100}, reduced_motion='reduce')
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(url, wait_until='load')
        page.locator('#noticias-recentes').scroll_into_view_if_needed()
        page.wait_for_function('document.querySelectorAll(".news-card").length === 4')
        assert page.locator('.news-grid.has-featured').count() == 1
        assert page.locator('.news-card-link').count() == 4
        assert page.locator('.news-feature-label').count() == 1
        assert page.locator('.news-caption').all_text_contents().count('Ilustração institucional') == 3
        assert page.locator('.news-archive-link').get_attribute('href') == 'https://fag.tangua.rj.gov.br/category/noticias/'
        page.wait_for_function('Array.from(document.querySelectorAll(".news img")).every(i => i.complete && i.naturalWidth > 0)')

        # Rules: growing archives, ordering, duplicate destinations, malformed data,
        # multiple highlights, draft/course records and future dates.
        result = page.evaluate('''() => {
          const base = FAG_NEWS_DATA.items[0];
          const make = (i, extra = {}) => ({...base, id: `n-${i}`, featured: false,
            url: `https://example.org/noticia/${i}`, publishedAt: '2025-03-13', ...extra});
          const records = Array.from({length: 100}, (_, i) => make(i));
          records.push(make('feature-old', {featured: true, publishedAt: '2025-01-01'}));
          records.push(make('feature-new', {featured: true, publishedAt: '2025-03-20'}));
          records.push(make('future', {featured: true, publishedAt: '2999-01-01'}));
          records.push(make('draft', {status: 'draft'}), make('course', {type: 'course'}));
          records.push(make('date', {publishedAt: '2025-02-30'}));
          records.push(make('invalid-url', {url: 'javascript:alert(1)'}));
          records.push(make('empty-title', {title: ' '}), null);
          records.push({...records[0]}, make('duplicate-url', {url: records[1].url}));
          const selected = FAGNews.selectNews(records, '2026-09-10');
          return { ids: selected.map(x => x.id),
            urls: selected.map(x => x.url),
            recent: FAGNews.selectNews([make('older', {publishedAt: '2024-01-01'}), make('newer')], '2026-09-10').map(x => x.id) };
        }''')
        assert len(result['ids']) == len(set(result['ids'])) == len(set(result['urls'])) == 4
        assert result['ids'][0] == 'n-feature-new', result
        assert result['recent'] == ['n-newer', 'n-older']

        for count in [0, 1, 2, 3, 4]:
            page.evaluate('(n) => FAGNews.render(FAG_NEWS_DATA.items.slice(0,n))', count)
            assert page.locator('.news-card').count() == count
            assert page.locator('[data-news-status]').is_visible() == (count == 0)
            assert page.locator('.news-grid.has-featured').count() == (1 if count == 4 else 0)
        page.evaluate('FAGNews.render(FAG_NEWS_DATA.items.map(x => ({...x, featured:false})))')
        assert page.locator('.news-grid.has-featured').count() == 0
        assert page.locator('.news-card').count() == 4
        page.evaluate('FAGNews.render(FAG_NEWS_DATA.items)')

        # One tab stop per card, a named link, visible unclipped keyboard focus.
        cards = page.locator('.news-card-link')
        cards.first.focus()
        page.keyboard.press('Tab')
        assert cards.nth(1).evaluate('(a) => a === document.activeElement')
        assert cards.nth(1).evaluate('(a) => getComputedStyle(a).outlineWidth') == '3px'
        assert cards.nth(1).evaluate('(a) => document.getElementById(a.getAttribute("aria-labelledby")).textContent.length') > 0
        assert page.locator('.news-card-link a, .news-card-link button').count() == 0
        assert page.locator('.news time[datetime][aria-label]').count() == 4
        assert page.locator('.news').evaluate('(s) => s.getAnimations({subtree:true}).length') == 0

        # Failed authentic image -> correctly labelled fallback, never a false photo.
        page.evaluate('''() => FAGNews.render([{...FAG_NEWS_DATA.items[0], image: {
          ...FAG_NEWS_DATA.items[0].image, src:'assets/missing-news-image.webp', sources:[]
        }}])''')
        page.wait_for_function('document.querySelector(".news-caption").textContent === "Ilustração institucional"')
        assert page.locator('.news img').get_attribute('alt') == ''
        page.evaluate('FAGNews.render(FAG_NEWS_DATA.items)')

        # Responsive reflow and representative images at desktop, tablet and mobile.
        for width in [1440, 1280, 1024, 820, 768, 767, 390, 320]:
            page.set_viewport_size({'width': width, 'height': 1100})
            page.locator('#noticias-recentes').scroll_into_view_if_needed()
            page.wait_for_timeout(120)
            dims = page.evaluate('''() => ({
              viewport: innerWidth, page: document.documentElement.scrollWidth,
              cards: [...document.querySelectorAll('.news-card')].map(n => {
                const r = n.getBoundingClientRect(); return {x:r.x, y:r.y, width:r.width, right:r.right};
              })
            })''')
            # The existing foundation decoration overflows at some tablet widths.
            # Verify this module does not introduce any additional page overflow.
            baseline = page.evaluate('''() => {
              const s = document.querySelector('.news'); s.hidden = true;
              const w = document.documentElement.scrollWidth; s.hidden = false; return w;
            }''')
            assert dims['page'] <= max(width, baseline), (width, dims)
            assert all(c['x'] >= 0 and c['right'] <= width for c in dims['cards']), dims
            if width > 820:
                assert page.evaluate('''() => {
                  const menu = document.querySelector('.nav-links').getBoundingClientRect();
                  const brand = document.querySelector('.brand-lockup').getBoundingClientRect();
                  const action = document.querySelector('.nav-actions').getBoundingClientRect();
                  return brand.right <= menu.left && menu.right <= action.left;
                }'''), f'Header overlaps at {width}px'
            if width < 768:
                assert len(set(round(c['x']) for c in dims['cards'])) == 1
                assert all(dims['cards'][i]['y'] < dims['cards'][i+1]['y'] for i in range(3))
            if '--screenshots' in sys.argv and width in [1440, 390]:
                page.locator('#noticias-recentes').screenshot(path=str(ROOT / 'tests' / f'news-{width}.png'), style='.site-nav, .utility-bar, .skip-link { visibility: hidden !important; }')

        # Endpoint success/empty/error must be distinguishable, with archive access.
        html = (ROOT / 'index.html').read_text(encoding='utf-8').replace('class="news" id=', 'class="news" data-source="/news-feed" id=')
        feed_records = page.evaluate('JSON.stringify(FAG_NEWS_DATA)')
        for response in [
            {'status': 200, 'body': feed_records, 'expected': 'populated'},
            {'status': 200, 'body': '{"items":[]}', 'expected': 'empty'},
            {'status': 200, 'body': '{}', 'expected': 'error'},
            {'status': 503, 'body': '{}', 'expected': 'error'}
        ]:
            feed_page = browser.new_page()
            feed_page.route('**/index.html', lambda route: route.fulfill(body=html, content_type='text/html'))
            feed_page.route('**/news-feed', lambda route: route.fulfill(status=response['status'], body=response['body'], content_type='application/json'))
            feed_page.goto(url)
            feed_page.wait_for_function('!document.querySelector(".news").hasAttribute("aria-busy")')
            text = feed_page.locator('[data-news-status]').inner_text()
            if response['expected'] == 'populated':
                assert feed_page.locator('.news-card').count() == 4
                assert not feed_page.locator('[data-news-status]').is_visible()
            else:
                assert ('em breve' in text) if response['expected'] == 'empty' else ('Não foi possível' in text)
            assert feed_page.locator('.news-archive-link').is_visible()
            feed_page.close()

        nojs = browser.new_page(java_script_enabled=False)
        nojs.goto(url)
        assert nojs.locator('.news noscript').is_visible()
        assert nojs.locator('.news-archive-link').is_visible()
        nojs.close()
        assert not errors, errors
        browser.close()
        print(json.dumps({'result': 'PASS', 'viewports': 8, 'records_tested': 100, 'page_errors': errors}))
finally:
    server.shutdown()
