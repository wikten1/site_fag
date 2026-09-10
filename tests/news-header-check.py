"""Header visual parity and utility behavior; requires Playwright Python + Chrome."""
import threading
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
    def do_GET(self):
        try: super().do_GET()
        except (ConnectionAbortedError,ConnectionResetError,BrokenPipeError): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/'
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',headless=True)
        page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        def style():
            return page.locator('#navbar').evaluate('''n=>{
              const s=getComputedStyle(n),g=getComputedStyle(n,'::before'),r=n.getBoundingClientRect();
              return {width:r.width,height:r.height,top:s.top,gap:s.gap,padding:s.padding,bg:g.backgroundColor,clip:g.clipPath,blur:g.backdropFilter};
            }''')
        for width in [1440,1024,820,390,320]:
            page.set_viewport_size({'width':width,'height':1000})
            page.goto(base+'index.html')
            page.wait_for_function('document.querySelector("#navbar").classList.contains("nav-enhanced")')
            home=style()
            page.goto(base+'noticias.html')
            assert style()==home,(width,style(),home)
            assert page.locator('.utility-bar').is_visible()
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
            assert page.locator('.editorial-breadcrumb').bounding_box()['y'] >= page.locator('#navbar').bounding_box()['y']+page.locator('#navbar').bounding_box()['height']
            if width<821:
                assert page.locator('#nav-links').evaluate('(e)=>e.inert')
                page.locator('.mobile-menu-btn').click()
                assert page.locator('#nav-links').is_visible()
                assert not page.locator('#nav-links').evaluate('(e)=>e.inert')
                page.keyboard.press('Escape')
                assert page.locator('.mobile-menu-btn').evaluate('(e)=>e===document.activeElement')
            page.locator('#accessibility-tools summary').click()
            assert page.locator('#utility-motion').is_disabled()
            assert page.locator('#motion-preference-note').is_visible()
            page.keyboard.press('Escape')
            assert page.locator('#accessibility-tools summary').evaluate('(e)=>e===document.activeElement')
        page.set_viewport_size({'width':1440,'height':1000})
        page.emulate_media(reduced_motion='no-preference')
        page.goto(base+'noticias.html')
        page.wait_for_timeout(900)
        page.locator('#accessibility-tools summary').click()
        page.locator('#utility-motion').check()
        assert page.evaluate('document.documentElement.dataset.motionPaused')=='true'
        page.goto(base+'index.html')
        assert page.evaluate('document.documentElement.dataset.motionPaused')=='true'
        page.goto(base+'noticias.html')
        assert page.evaluate('document.documentElement.dataset.motionPaused')=='true'
        page.locator('#page-search summary').click()
        assert page.locator('#page-search-input').evaluate('(e)=>e===document.activeElement')
        page.locator('#page-search-input').fill('inovacao')
        page.locator('.search-submit').click()
        assert page.locator('.search-result').count()>0
        page.locator('.search-result').first.click()
        assert not page.locator('#page-search').evaluate('(e)=>e.open')
        assert page.evaluate('document.activeElement.matches("h1,h2,h3")')
        page.locator('#page-search summary').click()
        page.locator('#page-search-input').fill('zzzzzzzzzz')
        page.locator('.search-submit').click()
        assert 'Nenhum resultado' in page.locator('.search-status').inner_text()
        page.keyboard.press('Escape')
        page.evaluate('scrollTo(0,600)')
        page.wait_for_function('document.querySelector("#navbar").classList.contains("is-scrolled")')
        assert page.locator('#navbar').evaluate('(e)=>getComputedStyle(e).position')=='fixed'
        assert page.locator('#navbar').evaluate('(e)=>parseFloat(getComputedStyle(e).top)')==page.locator('.utility-bar').bounding_box()['height']+8
        page.evaluate('scrollTo(0,0)')
        page.wait_for_timeout(100)
        page.screenshot(path=str(ROOT/'tests/header-desktop.png'))
        page.set_viewport_size({'width':390,'height':844})
        page.locator('.mobile-menu-btn').click()
        page.screenshot(path=str(ROOT/'tests/header-mobile.png'))
        page.locator('#accessibility-tools summary').click()
        assert page.locator('.mobile-menu-btn').get_attribute('aria-expanded')=='false'
        nojs=browser.new_page(java_script_enabled=False,viewport={'width':320,'height':900})
        nojs.goto(base+'noticias.html')
        assert nojs.locator('.nav-link').last.is_visible()
        assert nojs.locator('.editorial-breadcrumb').bounding_box()['y']>nojs.locator('#navbar').bounding_box()['y']+nojs.locator('#navbar').bounding_box()['height']
        nojs.close()
        assert not errors,errors
        browser.close()
        print('PASS: header parity at 5 widths; utility panels; search; keyboard; motion persistence; scroll; no-JS.')
finally: server.shutdown()
