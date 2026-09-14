"""Complete public-site smoke checks using the actual Node HTTP server.
Requires Playwright; FAG_TEST_CHROME may point to an existing Chrome executable.
"""
import json
import os
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
CHROME = os.environ.get('FAG_TEST_CHROME')

with sync_playwright() as p:
    browser = p.chromium.launch(**({'executable_path': CHROME} if CHROME else {}), headless=True)
    # No SMTP credentials are loaded by this fixture.
    script = "const app=require('./server/contact-server').createApp();app.listen(0,'127.0.0.1',()=>console.log(app.address().port));"
    server = subprocess.Popen(['node', '-e', script], cwd=ROOT, stdout=subprocess.PIPE, text=True)
    try:
        base = f'http://127.0.0.1:{server.stdout.readline().strip()}/'
        page = browser.new_page(reduced_motion='reduce')
        errors, failures = [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('response', lambda response: failures.append(response.url) if response.url.startswith(base) and response.status >= 400 else None)
        routes = ['index.html', 'cursos.html', 'contato.html', 'noticias.html']
        routes += ['noticias/' + file.name for file in (ROOT/'noticias').glob('*.html')]
        for route in routes:
            page.goto(base + route, wait_until='networkidle')
            assert page.locator('h1').count() == 1, route
            assert page.locator('main').count() == 1, route
            for width in [1440, 1024, 820, 768, 560, 390, 320]:
                page.set_viewport_size({'width': width, 'height': 1000})
                page.evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (route, width, page.evaluate('[...document.querySelectorAll("main *, footer *")].filter(e => e.getBoundingClientRect().right > innerWidth + 1).slice(0,12).map(e=>[e.className,e.getBoundingClientRect().right])'))
            for img in page.locator('img').all():
                img.scroll_into_view_if_needed()
                img.evaluate('(img) => img.decode()')
            if route == 'index.html':
                assert page.locator('.quick-card[aria-disabled="true"]').count() == 5
                page.locator('#page-search summary').click()
                page.locator('#page-search-input').fill('seguranca')
                page.locator('.search-submit').click()
                assert page.locator('.search-result').count() > 0
                page.keyboard.press('Escape')
                page.locator('.mobile-menu-btn').click()
                page.locator('.nav-link[href="#cursos-e-oportunidades"]').click()
                assert page.locator('.mobile-menu-btn').get_attribute('aria-expanded') == 'false'
                assert page.evaluate('document.activeElement.id') == 'cursos-e-oportunidades'
        nojs = browser.new_page(java_script_enabled=False, viewport={'width':320,'height':900})
        for route in ['index.html', 'cursos.html', 'noticias.html', 'contato.html']:
            nojs.goto(base + route, wait_until='networkidle')
            assert nojs.evaluate('document.documentElement.scrollWidth <= innerWidth'), route
            if route == 'index.html':
                assert nojs.locator('.news-card').count() == 4
                nojs.locator('.news-card-link').first.click()
                assert nojs.locator('.story-body').is_visible()
        assert not errors, errors
        assert not failures, failures
        print(f'PASS: {len(routes)} pages; 7 widths; all images; real HTTP; home search/menu; no-JS; no broken resources or JavaScript errors.')
    finally:
        server.terminate()
        server.wait(timeout=10)
        browser.close()
