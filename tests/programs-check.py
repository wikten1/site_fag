"""Programs page: responsive layout, real navigation and progressive enhancement."""
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
        page = browser.new_page(reduced_motion='reduce', viewport={'width': 1440, 'height': 1000})
        errors, failures = [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('response', lambda response: failures.append(response.url) if response.url.startswith(base) and response.status >= 400 else None)
        page.goto(base + 'programas-e-projetos.html', wait_until='networkidle')
        assert page.locator('h1').inner_text().replace('\n', ' ') == 'Programas e Projetos'
        assert page.locator('.nav-link[aria-current="page"]').inner_text() == 'Programas e Projetos'
        assert page.locator('.program-featured h2').inner_text() == 'Mulheres Mil'
        assert page.locator('.programs-grid .program-card').count() == 1
        assert page.locator('#pronatec a').count() == 0
        page.locator('main img').evaluate_all('(images) => Promise.all(images.map(img => {img.loading="eager"; return img.decode()}))')
        for width in [1440, 1280, 1024, 820, 768, 760, 600, 390, 320]:
            page.set_viewport_size({'width': width, 'height': 1000})
            page.evaluate('new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
            assert page.locator('main img').evaluate_all('(images) => images.every(img => img.getBoundingClientRect().width > 0 && img.getBoundingClientRect().height > 0)'), width
            assert page.locator('[data-program-reveal]').evaluate_all('(els) => els.every(el => getComputedStyle(el).opacity === "1")')
            if width in [1440, 820, 390]:
                page.screenshot(path=str(ARTIFACTS / f'programs-{width}.png'), full_page=True)
        page.locator('.mobile-menu-btn').click()
        assert page.locator('.mobile-menu-btn').get_attribute('aria-expanded') == 'true'
        page.keyboard.press('Escape')
        page.locator('#page-search summary').click()
        page.locator('#page-search-input').fill('PRONATEC')
        page.locator('.search-submit').click()
        assert page.locator('.search-result').count() == 1
        page.locator('.search-result').click()
        assert page.evaluate('document.activeElement.id') == 'program-pronatec'
        page.locator('a[href="#iniciativas"]').click()
        assert page.evaluate('document.activeElement.id') == 'iniciativas'
        page.locator('.program-featured .program-link').click()
        page.wait_for_url('**/noticias/*mulheres-mil.html')
        page.go_back(wait_until='networkidle')
        page.locator('.initiatives-contact a').click()
        page.wait_for_url('**/contato.html')

        motion = browser.new_page(viewport={'width': 1440, 'height': 1000})
        motion.goto(base + 'programas-e-projetos.html', wait_until='networkidle')
        for element in motion.locator('[data-program-reveal]').all():
            element.scroll_into_view_if_needed()
        motion.wait_for_timeout(900)
        assert motion.locator('[data-program-reveal]:not(.is-visible)').count() == 0
        motion.locator('.program-featured .program-link').focus()
        assert motion.locator('.program-featured .program-link').evaluate('(el) => getComputedStyle(el).outlineStyle') == 'solid'
        motion.locator('#accessibility-tools summary').click()
        motion.locator('#utility-motion').check()
        assert motion.locator('[data-program-reveal]').evaluate_all('(els) => els.every(el => getComputedStyle(el).opacity === "1" && getComputedStyle(el).translate === "none")')
        motion.emulate_media(reduced_motion='reduce')
        assert motion.locator('.program-featured').evaluate('(el) => getComputedStyle(el).transitionDuration') == '0s'

        nojs = browser.new_page(java_script_enabled=False, viewport={'width': 320, 'height': 1000})
        nojs.goto(base + 'programas-e-projetos.html', wait_until='networkidle')
        assert nojs.locator('.program-card').count() == 2
        assert nojs.locator('[data-program-reveal]').evaluate_all('(els) => els.every(el => getComputedStyle(el).opacity === "1")')
        assert nojs.evaluate('document.documentElement.scrollWidth <= innerWidth')

        # Render varying collections and promote a different program using the data contract.
        for count in [0, 2, 4, 8, 15]:
            script = f"const d=require('./content/programs.json');const items=Array.from({{length:{count}}},(_,i)=>({{...d.items[i%d.items.length],id:'sample-'+i}}));process.stdout.write(JSON.stringify(require('./src/components/programs').renderPrograms({{items,featuredId:items.at(-1)?.id}})));"
            rendered = json.loads(subprocess.check_output(['node', '-e', script], cwd=ROOT).decode('utf-8'))
            page.goto(base + 'programas-e-projetos.html', wait_until='networkidle')
            page.locator('.initiatives-feature').evaluate('(el, html) => el.outerHTML=html', rendered['programFeatured'])
            page.locator('.programs-grid').evaluate('(el, html) => el.outerHTML=html', rendered['programGrid'])
            assert page.locator('.program-card').count() == count
            if count:
                assert page.locator('.program-featured').get_attribute('id') == f'sample-{count-1}'
            for width in [1440, 820, 390, 320]:
                page.set_viewport_size({'width': width, 'height': 1000})
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (count, width)
        assert not errors, errors
        assert not failures, failures
        print(json.dumps({'result': 'PASS', 'widths': 9, 'collection_sizes': [0, 2, 4, 8, 15], 'checks': ['images', 'menu', 'search', 'links', 'focus', 'motion', 'pause', 'reduced motion', 'no JS', 'featured promotion'], 'screenshots': str(ARTIFACTS)}))
    finally:
        server.terminate()
        server.wait(timeout=10)
        browser.close()
