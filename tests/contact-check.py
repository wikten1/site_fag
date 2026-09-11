"""Browser-only fixtures; never send email. Run with Playwright installed."""
import json
import os
import sys
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

if os.environ.get('FAG_TEST_PYTHON_DEPS'):
    sys.path.insert(0, os.environ['FAG_TEST_PYTHON_DEPS'])
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_port}'

try:
    with sync_playwright() as p:
        executable = os.environ.get('FAG_TEST_CHROME')
        browser = p.chromium.launch(**({'executable_path': executable} if executable else {}), headless=True)
        page = browser.new_page(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        state = {'available': True, 'response': 200, 'posts': 0, 'key': None}
        def api(route):
            if route.request.method == 'GET':
                route.fulfill(json={'available': state['available']})
            else:
                state['posts'] += 1
                state['key'] = route.request.headers.get('idempotency-key')
                data = {'ok': state['response'] == 200}
                if state['response'] == 422: data['errors'] = {'email': 'Revise o e-mail informado.'}
                route.fulfill(status=state['response'], json=data)
        page.route('**/api/contato', api)
        page.goto(base + '/index.html', wait_until='domcontentloaded')
        page.locator('.attendance-cta').click()
        page.wait_for_url('**/contato.html')
        page.wait_for_function('!document.querySelector(".contact-fields").disabled')
        assert page.locator('h1').count() == 1
        assert page.locator('h1').inner_text().replace('\n', ' ') == 'Contato e Atendimento'
        assert page.locator('a[href="https://fag.tangua.rj.gov.br/contato/"]').count() == 0
        assert page.locator('.contact-map iframe').get_attribute('title')
        for width in [1440, 1024, 820, 768, 560, 390, 320]:
            page.set_viewport_size({'width': width, 'height': 1000})
            page.wait_for_timeout(100)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
            assert page.locator('.contact-form input,.contact-form textarea,.contact-button').evaluate_all('(els)=>els.every(e=>{const r=e.getBoundingClientRect();return r.x>=0&&r.right<=innerWidth&&r.height>=44})'), width
            assert page.locator('main h1,main h2,main h3,main p,main address').evaluate_all('(els)=>els.every(e=>e.scrollWidth<=e.clientWidth+1)'), width
            print('Reflow OK', width, flush=True)
        page.evaluate('document.documentElement.style.fontSize="200%"')
        page.set_viewport_size({'width': 640, 'height': 900})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.evaluate('document.documentElement.style.fontSize=""')
        page.set_viewport_size({'width': 1440, 'height': 1000})
        button = page.locator('.contact-button')
        button.click()
        assert state['posts'] == 0
        assert page.locator('#contact-name').evaluate('(e)=>e===document.activeElement')
        assert page.locator('[aria-invalid="true"]').count() == 4
        for name, value in [('name','Teste visual'), ('email','email-invalido'), ('phone','+351 912 345 678 ext. 2'), ('subject','Dúvida'), ('message','Mensagem sintética de teste.')]:
            page.locator(f'#contact-{name}').fill(value)
        button.click()
        assert state['posts'] == 0
        assert page.locator('#contact-email-error').is_visible()
        page.locator('#contact-email').fill('teste@example.test')
        state['response'] = 502
        button.click()
        page.wait_for_function('document.querySelector("#contact-status").dataset.state==="error" && !document.querySelector(".contact-button").disabled')
        assert page.locator('#contact-message').input_value() == 'Mensagem sintética de teste.'
        previous_key = state['key']
        state['response'] = 422
        button.click()
        page.wait_for_function('document.querySelector("#contact-email").getAttribute("aria-invalid")==="true"')
        assert page.locator('#contact-email').evaluate('(e)=>e===document.activeElement')
        state['response'] = 200
        button.click()
        page.wait_for_function('document.querySelector("#contact-status").dataset.state==="success"')
        assert previous_key == state['key']
        assert page.locator('#contact-message').input_value() == ''
        assert page.locator('#contact-status').evaluate('(e)=>e===document.activeElement')
        print('Validation, errors, retry, success and keyboard focus OK', flush=True)

        # Hold the request to inspect loading and suppression of duplicate submits.
        page.unroute('**/api/contato', api)
        pending = []
        def delayed(route):
            if route.request.method == 'GET': route.fulfill(json={'available': True})
            else: pending.append(route)
        page.route('**/api/contato', delayed)
        for name,value in [('name','Teste'),('email','teste@example.test'),('subject','Teste'),('message','Somente teste')]: page.locator(f'#contact-{name}').fill(value)
        button.click()
        page.wait_for_timeout(150)
        assert button.is_disabled()
        assert page.locator('#contact-form').get_attribute('aria-busy') == 'true'
        assert button.inner_text().strip() == 'Enviando mensagem…'
        page.locator('#contact-form').evaluate('(e)=>e.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true}))')
        assert len(pending) == 1
        pending[0].abort('failed')
        page.wait_for_function('!document.querySelector(".contact-button").disabled')
        assert page.locator('#contact-message').input_value() == 'Somente teste'
        page.unroute('**/api/contato', delayed)
        page.route('**/api/contato', api)

        page.goto(base + '/contato.html', wait_until='domcontentloaded')
        page.wait_for_function('!document.querySelector(".contact-button").disabled')
        page.locator('#contact-name').focus()
        assert page.locator('#contact-name').evaluate('(e)=>getComputedStyle(e).outlineStyle') == 'solid'
        for name in ['email','phone','subject','message']:
            page.keyboard.press('Tab')
            assert page.locator('#contact-'+name).evaluate('(e)=>e===document.activeElement')
        page.set_viewport_size({'width': 390,'height': 900})
        page.locator('.mobile-menu-btn').click()
        assert page.locator('.mobile-menu-btn').get_attribute('aria-expanded') == 'true'
        page.keyboard.press('Escape')
        assert page.locator('.mobile-menu-btn').get_attribute('aria-expanded') == 'false'
        assert page.locator('.contact-hero-copy').evaluate('(e)=>getComputedStyle(e).animationName') == 'none'
        print('Loading, duplicate protection, network failure, tab order, mobile menu and reduced motion OK', flush=True)

        if '--screenshots' in sys.argv:
            for width in [1440,390]:
                page.set_viewport_size({'width':width,'height':1000})
                page.evaluate('scrollTo(0,0)')
                page.screenshot(path=str(Path(os.environ.get('TEMP', '/tmp'))/f'fag-contact-{width}.png'), full_page=True)
        state['available'] = False
        page.goto(base + '/contato.html', wait_until='domcontentloaded')
        page.locator('.contact-retry').wait_for()
        assert button.is_disabled()
        assert page.locator('#contact-availability').is_visible()
        context = browser.new_context(java_script_enabled=False, viewport={'width':320,'height':900})
        plain = context.new_page()
        plain.goto(base + '/contato.html', wait_until='domcontentloaded')
        assert plain.locator('h1').is_visible()
        assert plain.locator('address').is_visible()
        assert plain.locator('.contact-form noscript').is_visible()
        assert not plain.locator('#contact-availability').is_visible()
        assert plain.evaluate('document.documentElement.scrollWidth <= innerWidth')
        assert not errors, errors
        print('Unavailable service and no-JavaScript fallback OK; no JavaScript errors', flush=True)
        browser.close()
finally:
    server.shutdown()
