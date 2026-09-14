"""Visual and interaction review of the institutional About page.
Uses the existing optional Playwright setup and only a local HTTP server.
"""
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
        page.goto(base + 'sobre.html', wait_until='networkidle')
        assert ' '.join(page.locator('h1').inner_text().split()) == 'Sobre a FAG.'
        assert page.locator('.nav-link[aria-current="page"]').get_attribute('href') == 'sobre.html'
        assert page.locator('.about-related-pending').get_attribute('aria-disabled') == 'true'
        assert page.locator('.about-related-pending').get_attribute('href') is None
        assert page.locator('.about-values-list dt').all_text_contents() == ['Compromisso', 'Responsabilidade Social', 'Transparência', 'Ética', 'Cooperação']
        assert page.locator('.about-principle').first.locator('.about-principle-content p').count() == 3
        assert 'Espaço reservado' not in page.locator('main').inner_text()
        assert page.locator('.about-contact-button').get_attribute('href') == 'contato.html'
        page.locator('.about-photo-frame img').evaluate('(img) => img.decode()')
        assert page.locator('.about-photo-frame img').evaluate('(img) => img.naturalWidth') == 1672
        for width in [1440, 1280, 1024, 900, 820, 768, 700, 560, 390, 320]:
            page.set_viewport_size({'width': width, 'height': 1000})
            page.evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, 'horizontal overflow')
            cards = page.locator('.about-principle').evaluate_all('(cards) => cards.map(card => ({x:card.offsetLeft, y:card.offsetTop, width:card.offsetWidth}))')
            if width > 900:
                assert cards[0]['y'] == cards[1]['y'] == cards[2]['y'], (width, cards)
            elif width > 700:
                assert cards[0]['y'] == cards[1]['y'] < cards[2]['y'], (width, cards)
            else:
                assert cards[0]['y'] < cards[1]['y'] < cards[2]['y'], (width, cards)
            if width in [1440, 820, 390, 320]:
                page.screenshot(path=str(ARTIFACTS / f'about-{width}.png'), full_page=True)
        page.locator('.mobile-menu-btn').click()
        assert page.locator('.mobile-menu-btn').get_attribute('aria-expanded') == 'true'
        page.keyboard.press('Escape')
        assert page.locator('.mobile-menu-btn').get_attribute('aria-expanded') == 'false'
        page.locator('#page-search summary').click()
        page.locator('#page-search-input').fill('pesquisa')
        page.locator('.search-submit').click()
        assert page.locator('.search-result').count() > 0
        page.keyboard.press('Escape')
        page.locator('.about-discover').click()
        assert page.evaluate('document.activeElement.id') == 'quem-somos'
        page.keyboard.press('Tab')
        assert page.locator('a[href="cursos.html"].about-related-row').evaluate('(link) => link === document.activeElement')
        assert page.evaluate('getComputedStyle(document.activeElement).outlineStyle') != 'none'
        page.locator('.about-contact-button').click()
        page.wait_for_url('**/contato.html')
        assert page.locator('h1').is_visible()

        # Default motion reveals content, and the shared pause control reveals all.
        motion = browser.new_page(viewport={'width': 1440, 'height': 900})
        motion.goto(base + 'sobre.html', wait_until='networkidle')
        motion.wait_for_function('getComputedStyle(document.querySelector("h1")).opacity === "1"')
        for selector in ['.about-introduction', '.about-statement', '.about-principle:nth-child(1)', '.about-principle:nth-child(2)', '.about-principle:nth-child(3)', '.about-related', '.about-contact']:
            motion.locator(selector).scroll_into_view_if_needed()
            motion.wait_for_timeout(900)
        assert motion.locator('[data-about-reveal]:not(.is-visible)').count() == 0
        motion.goto(base + 'sobre.html', wait_until='networkidle')
        motion.locator('#accessibility-tools summary').click()
        motion.locator('#utility-motion').check()
        assert motion.locator('[data-about-reveal]:not(.is-visible)').count() == 0
        assert motion.locator('.about-contact-button').evaluate('(el) => getComputedStyle(el).transitionDuration') == '0s'

        nojs = browser.new_page(java_script_enabled=False)
        for width in [1440, 320]:
            nojs.set_viewport_size({'width': width, 'height': 1000})
            nojs.goto(base + 'sobre.html', wait_until='networkidle')
            assert nojs.evaluate('document.documentElement.scrollWidth <= innerWidth')
            assert nojs.locator('[data-about-reveal]').evaluate_all('(elements) => elements.every(el => getComputedStyle(el).opacity === "1")')
            assert nojs.locator('.about-contact-button').is_visible()
        assert not errors, errors
        assert not failures, failures
        print(json.dumps({'result': 'PASS', 'widths': 10, 'layouts': ['desktop', 'tablet 2+1', 'mobile'], 'checks': ['image', 'links', 'search', 'menu', 'keyboard', 'reveals', 'reduced motion', 'pause', 'no JS'], 'screenshots': str(ARTIFACTS)}))
    finally:
        server.terminate()
        server.wait(timeout=10)
        browser.close()
