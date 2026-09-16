"""Opportunity center: real template, empty/live/archive states and keyboard filtering.
The three synthetic records below exist only in intercepted test responses.
"""
import json
import subprocess
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright
from browser_support import ROOT, ARTIFACTS, launch_options

FIXTURES = r"""
const fs=require('node:fs');
const {template}=require('./scripts/lib/templates');
const config=require('./config/pages').find(p=>p.active==='opportunities');
const render=require('./src/components/opportunities').renderOpportunities;
const open={slug:'demo-curso',title:'Demonstração — qualificação profissional',type:'course',status:'open',description:'Conteúdo exclusivo de teste, sem validade institucional.',audience:'Público de demonstração.',startDate:'2032-04-01',endDate:'2032-04-20',modality:'Presencial',location:'Local de demonstração',vacancies:40,noticeNumber:'DEMO 01',application:{instructions:'Instruções exclusivas do teste. Não existe inscrição real.'},notice:{label:'Documento de demonstração',url:'https://example.org/notice',format:'PDF'},schedule:[{title:'Inscrições',date:'2032-04-01',state:'current'},{title:'Próxima etapa',date:'2032-04-25',state:'future'}]};
const urgent={...open,slug:'demo-programa',title:'Demonstração — programa de formação',type:'program',endDate:'2032-04-12',application:{url:'https://example.org/application'}};
const result={...open,slug:'demo-projeto',title:'Demonstração — projeto educacional',type:'project',status:'result',result:{label:'Resultado de demonstração',url:'https://example.org/result'}};
const examples=[open,urgent,result];
const fixtures={};
for(const count of [1,3,18]) {
  const items=Array.from({length:count},(_,i)=>({...examples[i%3],slug:'demo-'+i,...(i>2?{status:'finished',year:i%2?2031:2030}:{})}));
  const data={items};
  fixtures[count]=template('pages/inscricoes-e-selecoes.html',{
    head:require('./src/components/head')({...config,styles:config.styles.map(x=>'assets/css/'+x+'.css'),scripts:config.scripts.map(x=>'assets/js/'+x+'.js')}),
    header:require('./src/components/header')({active:'opportunities'}),footer:require('./src/components/footer')({variant:'editorial'}),...render(data)
  });
}
process.stdout.write(JSON.stringify(fixtures));
"""

with sync_playwright() as p:
    browser = p.chromium.launch(**launch_options(), headless=True)
    server = subprocess.Popen(['node', '-e', "const app=require('./server/contact-server').createApp();app.listen(0,'127.0.0.1',()=>console.log(app.address().port));"], cwd=ROOT, stdout=subprocess.PIPE, text=True)
    try:
        base = f'http://127.0.0.1:{server.stdout.readline().strip()}/'
        page = browser.new_page(reduced_motion='reduce', viewport={'width': 1440, 'height': 1000})
        errors, failures = [], []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('response', lambda response: failures.append(response.url) if response.url.startswith(base) and response.status >= 400 else None)
        page.goto(base + 'inscricoes-e-selecoes.html', wait_until='networkidle')
        assert page.locator('.nav-link[aria-current="page"]').inner_text() == 'Inscrições e Seleções'
        assert page.locator('#op-active-empty').is_visible()
        assert page.locator('#op-history-empty').is_visible()
        assert page.locator('#op-filters').count() == 0
        for width in [1440, 1280, 1121, 1120, 1024, 820, 760, 390, 320]:
            page.set_viewport_size({'width': width, 'height': 1000})
            page.evaluate('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), width
            if width > 1120:
                assert page.locator('#nav-links').evaluate('(el)=>{const r=el.getBoundingClientRect(),b=document.querySelector(".brand-lockup").getBoundingClientRect(),a=document.querySelector(".nav-actions").getBoundingClientRect(); return r.left>=b.right && r.right<=a.left && el.scrollWidth<=r.width+1}'), width
            if width in [1440, 390]: page.screenshot(path=str(ARTIFACTS / f'opportunities-empty-{width}.png'), full_page=True)
        page.locator('.mobile-menu-btn').click()
        assert page.locator('.mobile-menu-btn').get_attribute('aria-expanded') == 'true'
        page.keyboard.press('Escape')
        page.locator('a[href="#como-participar"]').click()
        assert page.evaluate('document.activeElement.id') == 'como-participar'
        page.locator('.op-related a[href="cursos.html"]').click()
        page.wait_for_url('**/cursos.html')
        page.locator('.catalog-text-link[href="inscricoes-e-selecoes.html"]').click()
        page.wait_for_url('**/inscricoes-e-selecoes.html')

        fixtures = json.loads(subprocess.check_output(['node', '-e', FIXTURES], cwd=ROOT).decode('utf-8'))
        page.clock.set_fixed_time(datetime(2032, 4, 10, 15, tzinfo=timezone.utc))
        for count in [1, 3, 18]:
            page.route('**/inscricoes-e-selecoes.html', lambda route: route.fulfill(body=fixtures[str(count)], content_type='text/html'))
            page.goto(base + 'inscricoes-e-selecoes.html', wait_until='networkidle')
            assert page.locator('.op-card').count() == count
            assert page.locator('.op-badge--open').count() == 1
            assert page.locator('#op-filters').count() == (0 if count == 1 else 1)
            for width in [1440, 820, 390, 320]:
                page.set_viewport_size({'width': width, 'height': 1000})
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (count, width)
            if count == 3:
                assert page.locator('.op-badge--urgent').count() == 1
                assert page.locator('.op-badge--result').count() == 1
                for width in [1440, 390]:
                    page.set_viewport_size({'width': width, 'height': 1000})
                    page.screenshot(path=str(ARTIFACTS / f'opportunities-fixture-{width}.png'), full_page=True)
                page.locator('#op-query').fill('qualificacao')
                page.wait_for_function('document.querySelectorAll(".op-card").length===1')
                assert page.locator('#op-count').inner_text() == '1 oportunidade encontrada'
                page.locator('#op-type').select_option('project')
                assert page.locator('#op-no-results').is_visible()
                page.locator('[data-clear-filters]').click()
                page.wait_for_function('document.querySelectorAll(".op-card").length===3')
                assert page.evaluate('document.activeElement.id') == 'op-query'
                page.locator('#op-status').select_option('open')
                assert page.locator('.op-card').count() == 2
                page.locator('#op-reset').click()
                page.wait_for_function('document.querySelectorAll(".op-card").length===3')
                summary = page.locator('.op-details summary').first
                summary.focus()
                page.keyboard.press('Enter')
                page.wait_for_function('document.querySelector(".op-details summary").getAttribute("aria-expanded")==="true"')
                assert summary.evaluate('(el)=>getComputedStyle(el).outlineStyle') == 'solid'
                page.locator('a[href="#instrucoes-demo-0"]').click()
                assert page.evaluate('document.activeElement.id') == 'instrucoes-demo-0'
            if count == 18:
                assert page.locator('details.op-year').count() == 2
                assert page.locator('.op-card--archived .op-button').filter(has_text='inscrição').count() == 0
                page.locator('#op-year').select_option('2030')
                assert page.locator('#op-active .op-card').count() == 0
                assert page.locator('#op-active-filter-empty').is_visible()
                assert page.locator('#op-history-list .op-card').count() > 0
            page.unroute('**/inscricoes-e-selecoes.html')

        motion = browser.new_page(viewport={'width': 1440, 'height': 1000})
        motion.goto(base + 'inscricoes-e-selecoes.html', wait_until='networkidle')
        for element in motion.locator('.aura-view-reveal').all(): element.scroll_into_view_if_needed()
        motion.wait_for_timeout(950)
        assert motion.locator('.aura-view-reveal:not(.is-visible)').count() == 0
        motion.locator('#accessibility-tools summary').click()
        motion.locator('#utility-motion').check()
        assert motion.locator('.aura-view-reveal').evaluate_all('(els)=>els.every(el=>getComputedStyle(el).opacity==="1" && getComputedStyle(el).transform==="none")')
        nojs = browser.new_page(java_script_enabled=False, viewport={'width': 320, 'height': 1000})
        nojs.goto(base + 'inscricoes-e-selecoes.html', wait_until='networkidle')
        assert nojs.locator('#op-active-empty').is_visible()
        assert nojs.evaluate('document.documentElement.scrollWidth <= innerWidth')
        nojs.route('**/inscricoes-e-selecoes.html', lambda route: route.fulfill(body=fixtures['3'], content_type='text/html'))
        nojs.reload(wait_until='networkidle')
        assert nojs.locator('.op-card').count() == 3
        assert nojs.locator('#op-filters').is_hidden()
        nojs.locator('.op-details summary').first.click()
        assert nojs.locator('.op-details').first.get_attribute('open') is not None
        assert not errors, errors
        assert not failures, failures
        print(json.dumps({'result': 'PASS', 'widths': 9, 'collection_sizes': [0, 1, 3, 18], 'checks': ['navigation', 'filters', 'search', 'empty states', 'history', 'keyboard', 'motion', 'no JS'], 'screenshots': str(ARTIFACTS)}))
    finally:
        server.terminate()
        server.wait(timeout=10)
        browser.close()
