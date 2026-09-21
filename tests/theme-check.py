"""Real browser theme regression and full-page visual review artifacts.
Requires Playwright and Pillow; FAG_TEST_CHROME can select the browser binary.
Run against the actual Node HTTP server, without SMTP or external submissions.
"""
import argparse, json, os, subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tests/artifacts/themes'
OUT.mkdir(parents=True, exist_ok=True)
WIDTHS = [320, 390, 768, 1024, 1366, 1920]
TOKENS = ['--background', '--background-secondary', '--surface', '--text', '--text-soft', '--green', '--focus', '--line']
parser = argparse.ArgumentParser()
parser.add_argument('--routes', help='Comma-separated routes for a focused recheck')
args = parser.parse_args()

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get('FAG_TEST_CHROME', 'C:/Program Files/Google/Chrome/Application/chrome.exe'), headless=True)
    server = subprocess.Popen(['node', '-e', "const app=require('./server/contact-server').createApp();app.listen(0,'127.0.0.1',()=>console.log(app.address().port));"], cwd=ROOT, stdout=subprocess.PIPE, text=True)
    try:
        base = f'http://127.0.0.1:{server.stdout.readline().strip()}/'
        routes = sorted([x.name for x in ROOT.glob('*.html')] + ['noticias/' + x.name for x in (ROOT/'noticias').glob('*.html')])
        if args.routes: routes = args.routes.split(',')
        context = browser.new_context(reduced_motion='reduce', color_scheme='light')
        page = context.new_page()
        errors, contrast, shots = [], [], []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(base)
        assert page.locator('html').get_attribute('data-theme') == 'light'
        page.emulate_media(color_scheme='dark')
        page.wait_for_function("document.documentElement.dataset.theme === 'dark'")
        assert page.locator('html').get_attribute('data-theme') == 'dark'
        toggle = page.locator('[data-theme-toggle]').first
        toggle.click()
        assert page.evaluate("localStorage.getItem('fag-theme')") == 'light'
        page.emulate_media(color_scheme='light')
        page.emulate_media(color_scheme='dark')
        assert page.locator('html').get_attribute('data-theme') == 'light'
        page.reload()
        assert page.locator('html').get_attribute('data-theme') == 'light'
        page.evaluate('scrollTo(0,700)')
        before = page.evaluate('scrollY')
        page.locator('[data-theme-toggle]').first.focus()
        page.keyboard.press('Space')
        assert page.evaluate('scrollY') == before
        assert page.locator('html').get_attribute('data-theme') == 'dark'
        assert page.evaluate("getComputedStyle(document.activeElement).outlineStyle") != 'none'
        # All tabs share the manual preference; removing it resumes system choice.
        other = context.new_page(); other.goto(base + 'sobre.html')
        other.evaluate("FAGTheme.setPreference('light')")
        page.wait_for_function("document.documentElement.dataset.theme === 'light'")
        other.close()
        page.evaluate("FAGTheme.setPreference('system')")
        assert page.locator('html').get_attribute('data-theme') == 'dark'
        for route in routes:
            page.goto(base + route, wait_until='networkidle')
            for theme in ['light', 'dark']:
                page.evaluate('(theme) => FAGTheme.setPreference(theme)', theme)
                baseline = None
                for width in WIDTHS:
                    page.set_viewport_size({'width': width, 'height': 1000})
                    page.evaluate('new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))')
                    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (route, theme, width, 'overflow')
                    tokens = page.evaluate('(names) => names.map(n => getComputedStyle(document.documentElement).getPropertyValue(n).trim())', TOKENS)
                    if baseline is None: baseline = tokens
                    assert baseline == tokens, (route, theme, width, 'palette differs')
                    scheme = page.evaluate('getComputedStyle(document.documentElement).colorScheme')
                    assert scheme == ('dark' if theme == 'dark' else 'light only'), scheme
                    assert page.locator('meta[name="theme-color"]').get_attribute('content') == tokens[0]
                    assert page.locator('[data-theme-toggle]').first.is_visible()
                    if width in [390,1366]:
                        # Trigger lazy media/reveals through every section before capturing.
                        page.evaluate("async () => { for(let y=0;y<document.body.scrollHeight;y+=700){scrollTo(0,y);await new Promise(r=>requestAnimationFrame(r));} scrollTo(0,0); }")
                        page.locator('img').evaluate_all("imgs => Promise.all(imgs.map(img => { img.loading='eager'; return img.decode().catch(() => null); }))")
                        page.wait_for_timeout(100)
                        name = f'{route.replace("/", "_").replace(".html", "")}-{theme}-{width}.png'
                        page.screenshot(path=str(OUT/name), full_page=True)
                        shots.append(name)
                        if width == 1366:
                            findings = page.evaluate((ROOT/'tests/theme-contrast.js').read_text(encoding='utf-8'))
                            if findings: contrast.append({'route':route,'theme':theme,'findings':findings})
                print('Reviewed', route, theme, flush=True)
            if page.locator('.mobile-menu-btn').count():
                page.set_viewport_size({'width':390,'height':900})
                page.locator('.mobile-menu-btn').click()
                menu_toggle=page.locator('.theme-toggle-menu')
                assert menu_toggle.is_visible()
                menu_toggle.click()
                assert menu_toggle.get_attribute('aria-pressed') == 'false'
                page.keyboard.press('Escape')
                assert page.locator('.mobile-menu-btn').get_attribute('aria-expanded') == 'false'
        assert not errors, errors
        (OUT/('contrast-focused.json' if args.routes else 'contrast.json')).write_text(json.dumps(contrast,indent=2),encoding='utf-8')
        # Inspect real interactive surfaces in both palettes. Contact is fully mocked.
        for theme in ['light', 'dark']:
            page.set_viewport_size({'width':390,'height':900})
            page.goto(base)
            page.evaluate('(t)=>FAGTheme.setPreference(t)',theme)
            page.locator('.mobile-menu-btn').click()
            page.screenshot(path=str(OUT/f'component-menu-{theme}.png'))
            page.keyboard.press('Escape')
            page.locator('#page-search summary').click()
            page.locator('#page-search-input').fill('educação')
            page.locator('.search-submit').click()
            page.screenshot(path=str(OUT/f'component-search-{theme}.png'))
            page.keyboard.press('Escape')
            page.locator('#accessibility-tools summary').click()
            page.screenshot(path=str(OUT/f'component-accessibility-{theme}.png'))
            page.goto(base+'conteudo-online.html')
            page.locator('.online-faq summary').first.click()
            page.locator('.online-faq').screenshot(path=str(OUT/f'component-faq-{theme}.png'))
            page.goto(base+'politica-de-privacidade.html')
            page.locator('.privacy-disclosure summary').first.click()
            page.locator('.privacy-disclosure').first.screenshot(path=str(OUT/f'component-privacy-{theme}.png'))
            page.goto(base+'transparencia.html')
            page.locator('.doc-mobile-filters').click()
            page.locator('.doc-filters').screenshot(path=str(OUT/f'component-filters-{theme}.png'))
            page.route('**/api/contato', lambda route: route.fulfill(json={'available':True}) if route.request.method=='GET' else route.fulfill(json={'ok':True}))
            page.goto(base+'contato.html')
            page.locator('.contact-button').click()
            assert page.locator('[aria-invalid="true"]').count() == 4
            page.locator('.contact-form').screenshot(path=str(OUT/f'component-form-error-{theme}.png'))
            for name,value in [('name','Teste visual'),('email','teste@example.test'),('subject','Teste'),('message','Teste local sem envio.')]:page.locator('#contact-'+name).fill(value)
            page.locator('.contact-button').click()
            page.locator('#contact-status[data-state="success"]').wait_for()
            page.locator('.contact-form').screenshot(path=str(OUT/f'component-form-success-{theme}.png'))
            page.unroute('**/api/contato')
        # Real mobile browser context: same tokens, touch input and device scale 2.
        phone = browser.new_context(is_mobile=True,has_touch=True,device_scale_factor=2,viewport={'width':390,'height':844},color_scheme='dark',reduced_motion='reduce')
        pp=phone.new_page();pp.goto(base)
        for theme in ['dark','light']:
            pp.evaluate('(t)=>FAGTheme.setPreference(t)',theme)
            page.evaluate('(t)=>FAGTheme.setPreference(t)',theme)
            read_tokens='names=>names.map(n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim())'
            assert pp.evaluate(read_tokens,TOKENS)==page.evaluate(read_tokens,TOKENS)
        phone.close()
        # Normal motion changes only colors; reduced motion removes the transition.
        page.goto(base+'index.html')
        page.set_viewport_size({'width':1366,'height':1000})
        page.emulate_media(reduced_motion='no-preference')
        page.wait_for_timeout(900)
        typography='()=>{const s=getComputedStyle(document.querySelector("h1"));return [s.fontFamily,s.fontSize,s.fontWeight,s.lineHeight,s.letterSpacing];}'
        before=page.evaluate(typography)
        page.evaluate("addEventListener('fag:themechange',()=>{window.themeTransitionObserved=document.documentElement.classList.contains('theme-changing');})")
        page.locator('[data-theme-toggle]').first.click()
        assert page.evaluate('window.themeTransitionObserved'), 'Normal motion must enable the color transition'
        assert page.evaluate(typography)==before
        page.wait_for_function('!document.documentElement.classList.contains("theme-changing")')
        page.emulate_media(reduced_motion='reduce')
        page.locator('[data-theme-toggle]').first.click()
        assert not page.locator('html').evaluate('el=>el.classList.contains("theme-changing")')
        # Browser preference and storage denial must not prevent rendering or toggling.
        restricted = browser.new_context(color_scheme='dark', reduced_motion='reduce')
        restricted.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Blocked','SecurityError')}})")
        rp=restricted.new_page();rp.goto(base)
        assert rp.locator('html').get_attribute('data-theme') == 'dark'
        rp.locator('[data-theme-toggle]').first.click()
        assert rp.locator('html').get_attribute('data-theme') == 'light'
        restricted.close()
        nojs = browser.new_page(java_script_enabled=False, viewport={'width':320,'height':900})
        nojs.goto(base)
        assert nojs.locator('[data-theme-toggle]:visible').count() == 0
        assert nojs.locator('main').is_visible()
        assert nojs.evaluate('document.documentElement.scrollWidth <= innerWidth')
        (OUT/('report-focused.json' if args.routes else 'report.json')).write_text(json.dumps({'routes':routes,'themes':['light','dark'],'widths':WIDTHS,'screenshots':shots,'errors':errors},indent=2),encoding='utf-8')
        print(f'PASS: {len(routes)} routes × 2 themes × {len(WIDTHS)} widths; {len(shots)} full-page screenshots; preference, storage, keyboard, scrolling, mobile menu, no JS.')
        from PIL import Image, ImageDraw
        for route in routes:
            slug=route.replace('/','_').replace('.html','')
            names=[f'{slug}-{theme}-{width}.png' for width in [1366,390] for theme in ['light','dark']]
            panels=[]
            for name in names:
                im=Image.open(OUT/name).convert('RGB');im.thumbnail((380,2100));panels.append((name,im))
            sheet=Image.new('RGB',(1520,max(im.height for _,im in panels)+40),'#dddddd')
            draw=ImageDraw.Draw(sheet)
            for i,(name,im) in enumerate(panels):
                draw.text((i*380+5,8),name[-35:],fill='black');sheet.paste(im,(i*380,35))
            sheet.save(OUT/f'review-{slug}.jpg')
    finally:
        server.terminate();server.wait(timeout=10);browser.close()
