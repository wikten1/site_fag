"""Privacy reading flow: responsive layout, anchors, keyboard and fallbacks."""
import subprocess
from playwright.sync_api import sync_playwright
from browser_support import ROOT, ARTIFACTS, launch_options

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, **launch_options())
    server = subprocess.Popen(['node', '-e', "const app=require('./server/contact-server').createApp();app.listen(0,'127.0.0.1',()=>console.log(app.address().port));"], cwd=ROOT, stdout=subprocess.PIPE, text=True)
    try:
        base = f'http://127.0.0.1:{server.stdout.readline().strip()}/'
        page = browser.new_page(reduced_motion='reduce', viewport={'width': 1440, 'height': 1000})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(base + 'politica-de-privacidade.html', wait_until='networkidle')
        assert page.locator('h1').count() == 1
        assert page.locator('.privacy-document > section').count() == 9
        assert page.locator('.privacy-rights-grid li').count() == 6
        assert page.locator('main a[href*="fag.tangua.rj.gov.br"]').count() == 0
        assert page.locator('a[href="mailto:fag.fundacao@tangua.rj.gov.br"]').count() == 2
        page.locator('#page-search summary').click()
        page.locator('#page-search-input').fill('portabilidade')
        page.locator('#page-search-input').press('Enter')
        assert page.locator('.search-result').count() == 1
        assert 'Seus direitos' in page.locator('.search-result').inner_text()
        page.keyboard.press('Escape')
        for width in [1920, 1440, 1280, 1024, 821, 820, 768, 580, 390, 320]:
            page.set_viewport_size({'width': width, 'height': 1000})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, page.evaluate('[...document.querySelectorAll("body *")].filter(el=>el.getBoundingClientRect().right>innerWidth+1).map(el=>[el.tagName,el.className,el.getBoundingClientRect().right]).slice(0,15)'))
            if width in [1440, 390]:
                page.screenshot(path=str(ARTIFACTS / f'privacy-{width}.png'), full_page=True)
                page.screenshot(path=str(ARTIFACTS / f'privacy-viewport-{width}.png'))
        page.set_viewport_size({'width': 1440, 'height': 1000})
        page.locator('.privacy-index a[href="#direitos"]').click()
        page.wait_for_function('document.querySelector(".privacy-index a[aria-current]").hash === "#direitos"')
        assert page.locator('#direitos').evaluate('(el) => el === document.activeElement')
        assert page.locator('#direitos').bounding_box()['y'] > 120
        assert page.locator('.privacy-index-inner').bounding_box()['y'] > 120
        assert page.locator('.privacy-progress span').evaluate('el => getComputedStyle(el).transform') != 'matrix(0, 0, 0, 1, 0, 0)'
        summary = page.locator('.privacy-disclosure summary').first
        summary.focus()
        page.keyboard.press('Enter')
        assert page.locator('.privacy-disclosure').first.get_attribute('open') is not None
        page.keyboard.press('Space')
        assert page.locator('.privacy-disclosure').first.get_attribute('open') is None
        page.set_viewport_size({'width': 390, 'height': 844})
        assert page.locator('#privacy-index-links').is_hidden()
        page.locator('.privacy-index-toggle').click()
        page.locator('.privacy-index a[href="#contato-privacidade"]').click()
        assert page.locator('#privacy-index-links').is_hidden()
        assert page.locator('#contato-privacidade').evaluate('(el) => el === document.activeElement')
        assert page.locator('#contato-privacidade').bounding_box()['y'] > 100
        page.locator('.privacy-index-toggle').click()
        page.locator('.privacy-index a').first.focus()
        page.keyboard.press('Escape')
        assert page.locator('#privacy-index-links').is_hidden()
        assert page.locator('.privacy-index-toggle').evaluate('(el) => el === document.activeElement')
        # A 640 CSS-pixel viewport covers the reflow of a 1280px desktop at 200% zoom.
        page.set_viewport_size({'width': 640, 'height': 450})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.evaluate('window.dispatchEvent(new Event("beforeprint"))')
        assert page.locator('.privacy-disclosure[open]').count() == 3
        page.evaluate('window.dispatchEvent(new Event("afterprint"))')
        assert page.locator('.privacy-disclosure[open]').count() == 0
        assert page.locator('.privacy-art').evaluate('el => getComputedStyle(el).animationName') == 'none'
        page.locator('.privacy-top-link').click()
        assert page.evaluate('scrollY') < 300
        nojs = browser.new_page(java_script_enabled=False, viewport={'width': 390, 'height': 844})
        nojs.goto(base + 'politica-de-privacidade.html')
        assert nojs.locator('#privacy-index-links').is_visible()
        nojs.locator('.privacy-disclosure summary').first.click()
        assert nojs.locator('.privacy-disclosure').first.get_attribute('open') is not None
        assert nojs.evaluate('document.documentElement.scrollWidth <= innerWidth')
        animated = browser.new_page(viewport={'width': 1440, 'height': 1000})
        animated.goto(base + 'politica-de-privacidade.html', wait_until='networkidle')
        animated.locator('a[href="#direitos"]').first.click()
        animated.wait_for_function('document.querySelector("#direitos").classList.contains("is-visible")')
        animated.evaluate('document.documentElement.dataset.motionPaused = "true"')
        animated.wait_for_function('getComputedStyle(document.querySelector(".privacy-art")).animationName === "none"')
        assert animated.locator('[data-privacy-reveal]:not(.is-visible)').count() == 0
        assert not errors, errors
        print('Privacy: responsive layout, keyboard, anchors, progress, print, motion and no-JS checks passed.')
    finally:
        server.terminate()
        server.wait(timeout=10)
        browser.close()
