"""Browser coverage for the document center and its offline fallback."""
import json
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
from browser_support import ROOT, ARTIFACTS, launch_options

data = json.loads((ROOT / 'content/documents.json').read_text(encoding='utf-8'))
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, **launch_options())
    server = subprocess.Popen(['node', '-e', "const app=require('./server/contact-server').createApp();app.listen(0,'127.0.0.1',()=>console.log(app.address().port));"], cwd=ROOT, stdout=subprocess.PIPE, text=True)
    try:
        base = f'http://127.0.0.1:{server.stdout.readline().strip()}/'
        page = browser.new_page(reduced_motion='reduce', viewport={'width': 1440, 'height': 1000})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(base + 'transparencia.html', wait_until='networkidle')
        assert page.locator('#doc-count').inner_text() == '20 documentos encontrados'
        assert page.locator('#doc-results tbody tr').count() == 8
        assert page.locator('#em-andamento').is_hidden()
        assert page.locator('.nav-link[aria-current="page"]').inner_text() == 'Transparência'
        for width in [1920, 1440, 1280, 1130, 1120, 1024, 900, 768, 600, 390, 320]:
            page.set_viewport_size({'width': width, 'height': 1000})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
            if width > 1120:
                assert page.locator('#nav-links').evaluate('(el)=>{const r=el.getBoundingClientRect(),b=document.querySelector(".brand-lockup").getBoundingClientRect(),a=document.querySelector(".nav-actions").getBoundingClientRect(); return r.left>=b.right && r.right<=a.left && el.scrollWidth<=r.width+1}'), f'nav overlap {width}'
            if width in [1440, 390]:
                page.screenshot(path=str(ARTIFACTS / f'transparency-{width}.png'), full_page=True)
                page.screenshot(path=str(ARTIFACTS / f'transparency-viewport-{width}.png'))
            if width == 1440:
                assert page.locator('.doc-paper-front').evaluate('(el) => {const r=el.getBoundingClientRect(),b=document.querySelector(".doc-baseline").getBoundingClientRect();return r.bottom < b.top}')
                assert page.locator('.doc-paper img').evaluate_all('(images) => images.every(img => img.complete && img.naturalWidth > 0)')
        page.set_viewport_size({'width': 1440, 'height': 1000})
        page.locator('#doc-query').fill('tecnicos 2026')
        page.wait_for_function('document.querySelector("#doc-count").textContent.startsWith("1 documento")')
        assert page.locator('#doc-results').inner_text().find('01/2026') >= 0
        page.locator('#doc-type').select_option('portaria')
        assert page.locator('#doc-empty').is_visible()
        page.locator('[data-clear-documents]').click()
        assert page.locator('#doc-query').evaluate('el => el === document.activeElement')
        page.locator('#doc-next').click()
        assert 'pagina=2' in page.url
        assert page.locator('#doc-page-number').inner_text() == 'Página 2 de 3'
        page.locator('#doc-next').click()
        assert page.locator('#doc-results tbody tr').count() == 4
        page.go_back()
        assert page.locator('#doc-page-number').inner_text() == 'Página 2 de 3'
        page.locator('[data-year="2024"]').click()
        assert page.locator('#doc-results tbody tr').count() == 3
        assert 'ano=2024' in page.url
        page.reload(wait_until='networkidle')
        assert page.locator('#doc-year').input_value() == '2024'
        page.locator('[data-category="portaria"]').click()
        assert page.locator('#doc-results tbody tr').count() == 1
        assert page.locator('#doc-year').input_value() == ''
        assert page.locator('#doc-results a').get_attribute('href') == 'assets/documents/portaria-01-2024.pdf'
        page.set_viewport_size({'width': 390, 'height': 844})
        page.locator('.doc-mobile-filters').click()
        assert page.locator('#doc-filter-fields').is_visible()
        page.locator('#doc-year').focus()
        page.keyboard.press('Escape')
        assert page.locator('#doc-filter-fields').is_hidden()
        page.locator('.mobile-menu-btn').click()
        assert page.locator('.nav-link[aria-current="page"]').is_visible()
        page.keyboard.press('Escape')
        for item in data['items']:
            response = page.request.get(base + 'assets/documents/' + item['file'])
            assert response.status == 200
            assert response.headers['content-type'] == 'application/pdf'
            assert response.body().startswith(b'%PDF-')
        assert page.locator('main a[href*="fag.tangua.rj.gov.br"]').count() == 0
        page.route('**/assets/data/documents.json', lambda route: route.fulfill(status=503, body='unavailable'))
        page.reload(wait_until='networkidle')
        assert page.locator('#doc-error').is_visible()
        assert page.locator('#doc-results a').count() == 8
        page.unroute('**/assets/data/documents.json')
        page.locator('#doc-retry').click()
        page.wait_for_function('document.querySelector("#doc-error").hidden && !document.querySelector("#doc-filters").hidden')
        assert page.locator('#doc-query').evaluate('el => el === document.activeElement')

        fixture = dict(data['items'][0], status='andamento', validFrom='2020-01-01', validUntil='2099-01-01', statusSource='Synthetic test evidence')
        page.route('**/assets/data/documents.json', lambda route: route.fulfill(content_type='application/json', body=json.dumps({'items': [fixture]})))
        page.goto(base + 'transparencia.html', wait_until='networkidle')
        assert page.locator('#em-andamento').is_visible()
        assert page.locator('#doc-active-items a').count() == 1
        page.unroute('**/assets/data/documents.json')
        nojs = browser.new_page(java_script_enabled=False, viewport={'width': 390, 'height': 844})
        nojs.goto(base + 'transparencia.html')
        assert nojs.locator('.doc-table tbody tr').count() == len(data['items'])
        assert nojs.evaluate('document.documentElement.scrollWidth <= innerWidth')
        for route in ['index.html', 'sobre.html', 'parcerias.html', 'cursos.html', 'conteudo-online.html', 'noticias.html']:
            for width in [1440, 1130, 390, 320]:
                page.set_viewport_size({'width': width, 'height': 1000})
                page.goto(base + route, wait_until='networkidle')
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (route, width)
        assert not errors, errors
        print('PASS: responsive layouts, navigation, search, combined filters, pagination, browser history, PDFs, retry, active state and no-JS fallback')
    finally:
        browser.close()
        server.terminate()
        server.wait(timeout=10)
