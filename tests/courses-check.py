"""Course discovery: filters, deep links, keyboard, reflow and no-JS access."""
import subprocess
from playwright.sync_api import sync_playwright, expect
from browser_support import ROOT, ARTIFACTS, launch_options

with sync_playwright() as p:
    browser = p.chromium.launch(**launch_options(), headless=True)
    server = subprocess.Popen(
        ['node', '-e', "const app=require('./server/contact-server').createApp();app.listen(0,'127.0.0.1',()=>console.log(app.address().port));"],
        cwd=ROOT, stdout=subprocess.PIPE, text=True,
    )
    try:
        base = f'http://127.0.0.1:{server.stdout.readline().strip()}/'
        page = browser.new_page(reduced_motion='reduce', viewport={'width':1440,'height':1000})
        errors, failures = [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('response', lambda res: failures.append(res.url) if res.url.startswith(base) and res.status >= 400 else None)
        page.goto(base + 'cursos.html', wait_until='networkidle')
        cards = page.locator('[data-catalog-item]:visible')
        expect(cards).to_have_count(6)
        expect(page.locator('h1')).to_have_count(1)
        search = page.get_by_role('searchbox', name='Buscar curso pelo nome')
        search.fill('  SEGURANCA  ')
        expect(cards).to_have_count(1)
        expect(page.get_by_role('status')).to_have_text('1 curso encontrado')
        page.locator('[data-filter="tecnico"]').click()
        expect(cards).to_have_count(1)
        expect(page.locator('[data-filter="tecnico"]')).to_have_attribute('aria-pressed', 'true')
        search.fill('informatica')
        expect(cards).to_have_count(1)
        page.locator('[data-filter="todos"]').click()
        expect(cards).to_have_count(2)
        search.fill('curso inexistente')
        expect(cards).to_have_count(0)
        expect(page.locator('.catalog-empty')).to_be_visible()
        page.locator('.catalog-empty [data-clear]').click()
        expect(search).to_be_focused()
        expect(cards).to_have_count(6)
        page.locator('[data-filter="tecnico"]').click()
        expect(cards).to_have_count(5)
        page.locator('[data-filter="presencial"]').click()
        expect(cards).to_have_count(6)
        expect(page.locator('[data-filter="presencial"]')).to_have_attribute('aria-pressed', 'true')
        page.locator('[data-filter="ead"]').click()
        expect(cards).to_have_count(0)
        expect(page.locator('[data-empty-message]')).to_contain_text('Ainda não há cursos identificados como EAD')
        page.locator('.catalog-empty [data-clear]').click()
        summary = page.locator('.course-description summary').first
        first_card = page.locator('[data-catalog-item]').first.locator('.course-card')
        adjacent_card = page.locator('[data-catalog-item]').nth(1).locator('.course-card')
        first_height_before = first_card.bounding_box()['height']
        adjacent_height_before = adjacent_card.bounding_box()['height']
        summary.focus()
        page.keyboard.press('Enter')
        expect(page.locator('.course-description').first).to_have_attribute('open', '')
        assert first_card.bounding_box()['height'] > first_height_before
        assert abs(adjacent_card.bounding_box()['height'] - adjacent_height_before) < 1
        page.keyboard.press('Tab')
        expect(page.locator('.course-expanded a').first).to_be_focused()
        summary.click()
        page.locator('[data-filter="ead"]').click()
        page.evaluate("location.hash = 'informatica-basica'")
        expect(cards).to_have_count(6)
        expect(page.locator('#informatica-basica details')).to_have_attribute('open', '')
        page.goto(base + 'cursos.html#meio-ambiente', wait_until='networkidle')
        expect(page.locator('#meio-ambiente details')).to_have_attribute('open', '')
        expect(page.locator('#meio-ambiente')).to_be_focused()
        page.goto(base + 'cursos.html', wait_until='networkidle')
        for width in [1440, 1280, 1199, 1024, 820, 768, 700, 600, 390, 320]:
            page.set_viewport_size({'width':width,'height':1000})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
            columns = page.locator('.courses-grid').evaluate('(grid) => getComputedStyle(grid).gridTemplateColumns.split(" ").length')
            assert columns == (3 if width >= 1200 else 2 if width >= 700 else 1), (width, columns)
        for width in [1440, 320]:
            page.set_viewport_size({'width':width,'height':1000})
            page.locator('body').evaluate('(body) => document.fonts.ready')
            for img in page.locator('.course-media img').all():
                img.evaluate('(img) => { img.loading = "eager"; return img.decode(); }')
            page.screenshot(path=str(ARTIFACTS / f'courses-{width}.png'), full_page=True)
        page.set_viewport_size({'width':640,'height':500})
        page.evaluate("document.documentElement.style.fontSize = '200%'")
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), '200% text zoom'
        page.evaluate("document.documentElement.style.fontSize = ''")
        nojs = browser.new_page(java_script_enabled=False, viewport={'width':320,'height':1000})
        nojs.goto(base + 'cursos.html', wait_until='networkidle')
        expect(nojs.locator('.course-card')).to_have_count(6)
        expect(nojs.locator('.catalog-controls')).to_be_hidden()
        nojs.locator('summary').first.click()
        expect(nojs.locator('.course-expanded p').first).to_be_visible()
        assert nojs.evaluate('document.documentElement.scrollWidth <= innerWidth')
        motion = browser.new_page(viewport={'width':1440,'height':1000})
        motion.goto(base + 'cursos.html', wait_until='networkidle')
        motion.locator('.catalog-ead').scroll_into_view_if_needed()
        expect(motion.locator('.catalog-ead')).to_have_class('catalog-ead is-visible')
        motion.emulate_media(reduced_motion='reduce')
        assert motion.locator('.catalog-ead').evaluate('(el) => getComputedStyle(el).opacity') == '1'
        assert not errors, errors
        assert not failures, failures
        print('PASS: search, combined filters, empty states, deep links, keyboard, 320–1440px, 200% text zoom, reduced motion and no JavaScript.')
    finally:
        server.terminate()
        server.wait(timeout=10)
        browser.close()
