"""Local browser checks for the partners directory and its progressive enhancement."""
import json
import subprocess
from playwright.sync_api import sync_playwright
from browser_support import ROOT, ARTIFACTS, launch_options


with sync_playwright() as p:
    browser = p.chromium.launch(**launch_options(), headless=True)
    server = subprocess.Popen(
        ['node', '-e', "const app=require('./server/contact-server').createApp();app.listen(0,'127.0.0.1',()=>console.log(app.address().port));"],
        cwd=ROOT, stdout=subprocess.PIPE, text=True,
    )
    try:
        base = f'http://127.0.0.1:{server.stdout.readline().strip()}/'
        data = json.loads((ROOT / 'content/partners.json').read_text(encoding='utf-8'))['items']
        page = browser.new_page(reduced_motion='reduce', viewport={'width': 1440, 'height': 1000})
        errors, failures, old_requests = [], [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('response', lambda res: failures.append(res.url) if res.url.startswith(base) and res.status >= 400 else None)
        page.on('request', lambda req: old_requests.append(req.url) if 'fag.tangua.rj.gov.br' in req.url else None)
        page.goto(base + 'parcerias.html', wait_until='networkidle')
        assert page.locator('h1').inner_text() == 'Parcerias.'
        assert page.locator('.partners-breadcrumb [aria-current="page"]').inner_text() == 'Parcerias'
        assert page.locator('.partner-card').count() == len(data)
        assert page.locator('.partner-link').count() == sum(bool(item.get('url')) for item in data)
        page.locator('.partner-logo img').evaluate_all('(images) => Promise.all(images.map(img => { img.loading="eager"; return img.decode(); }))')
        for index, item in enumerate(data):
            card = page.locator('.partner-card').nth(index)
            assert card.locator('h3').inner_text() == item['name']
            assert card.locator('img').evaluate('(img) => img.naturalWidth') == item['width']
            assert card.locator('img').evaluate('(img) => getComputedStyle(img).objectFit') == 'contain'
            assert card.locator('a').count() == int(bool(item.get('url')))
            if item.get('url'):
                assert card.locator('a').get_attribute('href') == item['url']
                assert 'site externo' in card.locator('a').get_attribute('aria-label')
        for width in [1440, 1280, 1100, 1024, 900, 820, 768, 600, 390, 320]:
            page.set_viewport_size({'width': width, 'height': 1000})
            page.evaluate('new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
            columns = page.locator('.partners-grid').evaluate('(grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length')
            assert columns == (4 if width > 1100 else 3 if width > 900 else 2 if width > 600 else 1), (width, columns)
            assert page.locator('[data-partner-reveal]').evaluate_all('(els) => els.every(el => getComputedStyle(el).opacity === "1")')
            if width in [1440, 820, 390, 320]:
                page.screenshot(path=str(ARTIFACTS / f'partners-{width}.png'), full_page=True)
        page.locator('.mobile-menu-btn').click()
        assert page.locator('.mobile-menu-btn').get_attribute('aria-expanded') == 'true'
        page.keyboard.press('Escape')
        page.locator('#page-search summary').click()
        page.locator('#page-search-input').fill('Astronomia')
        page.locator('.search-submit').click()
        assert page.locator('.search-result').count() == 1
        page.locator('.search-result').click()
        assert page.evaluate('document.activeElement.id') == 'partner-mast'
        page.locator('.partners-discover').click()
        assert page.evaluate('document.activeElement.id') == 'instituicoes'
        page.keyboard.press('Tab')
        assert page.locator('.partner-link').first.evaluate('(el) => el === document.activeElement')
        assert page.locator('.partner-card').first.evaluate('(el) => getComputedStyle(el).outlineStyle') == 'solid'
        page.locator('.partners-button').click()
        page.wait_for_url('**/contato.html')

        motion = browser.new_page(viewport={'width': 1440, 'height': 1000})
        motion.goto(base + 'parcerias.html', wait_until='networkidle')
        for element in motion.locator('[data-partner-reveal]').all():
            element.scroll_into_view_if_needed()
        motion.wait_for_timeout(1000)
        assert motion.locator('[data-partner-reveal]:not(.is-visible)').count() == 0
        linked = motion.locator('.partner-card.has-link').first
        linked.hover()
        motion.wait_for_timeout(260)
        assert linked.evaluate('(el) => getComputedStyle(el).transform') == 'matrix(1, 0, 0, 1, 0, -4)'
        info = motion.locator('.partner-card:not(.has-link)').first
        info.hover()
        assert info.evaluate('(el) => getComputedStyle(el).transform') == 'none'
        assert info.evaluate('(el) => getComputedStyle(el).cursor') != 'pointer'
        motion.locator('#accessibility-tools summary').click()
        motion.locator('#utility-motion').check()
        linked.hover()
        assert linked.evaluate('(el) => getComputedStyle(el).transform') == 'none'
        assert motion.locator('.statement-lines path').evaluate('(el) => getComputedStyle(el).animationName') == 'none'
        motion.emulate_media(reduced_motion='reduce')
        assert linked.evaluate('(el) => getComputedStyle(el).transitionDuration') == '0s'

        nojs = browser.new_page(java_script_enabled=False, reduced_motion='reduce')
        for width in [1440, 320]:
            nojs.set_viewport_size({'width': width, 'height': 1000})
            nojs.goto(base + 'parcerias.html', wait_until='networkidle')
            assert nojs.locator('.partner-card').count() == len(data)
            assert nojs.locator('[data-partner-reveal]').evaluate_all('(els) => els.every(el => getComputedStyle(el).opacity === "1")')
            assert nojs.evaluate('document.documentElement.scrollWidth <= innerWidth')

        # Exercise the real renderer with empty / small / larger collections.
        for count in [0, 4, 10, 30]:
            markup = subprocess.check_output(['node', '-e', f"const d=require('./content/partners.json').items;const items=Array.from({{length:{count}}},(_,i)=>({{...d[i%d.length],id:'test-'+i}}));process.stdout.write(require('./src/components/partners').renderPartners(items));"], cwd=ROOT).decode('utf-8')
            page.goto(base + 'parcerias.html', wait_until='networkidle')
            page.locator('.partners-grid').evaluate('(el,html) => el.outerHTML=html', markup)
            assert page.locator('.partner-card').count() == count
            if count == 0:
                assert page.locator('.partners-empty h3').inner_text() == 'Parcerias em atualização'
                assert page.locator('.partners-empty a').count() == 0
            for width in [1440, 820, 320]:
                page.set_viewport_size({'width': width, 'height': 1000})
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (count, width)
        assert not errors, errors
        assert not failures, failures
        assert not old_requests, old_requests
        print(json.dumps({'result': 'PASS', 'partners': len(data), 'widths': 10, 'collection_sizes': [0, 4, 10, 30], 'checks': ['local images', 'links', 'search', 'menu', 'focus', 'hover', 'entry motion', 'pause', 'reduced motion', 'no JS', 'no legacy requests'], 'screenshots': str(ARTIFACTS)}))
    finally:
        server.terminate()
        server.wait(timeout=10)
        browser.close()
