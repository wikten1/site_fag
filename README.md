# Site institucional da FAG

HTML estático, CSS e JavaScript puros, gerados com Node.js 24+. O servidor de contato usa Nodemailer. Não há framework de interface nem dependência adicional para o build.

## Desenvolvimento

```sh
npm ci
npm run build
npm start
```

Abra `http://127.0.0.1:3000/`. No PowerShell com restrição de execução de scripts, use `npm.cmd` no lugar de `npm`.

Edite os templates em `src/`, os dados em `content/` e os estilos/scripts em `assets/`. Execute `npm run build` após alterar templates, conteúdo ou configuração. Os HTMLs da raiz e de `noticias/` são saídas versionadas: não os edite diretamente. Alterações em CSS e JavaScript de interface não exigem build.

## Estrutura

```text
config/              Endereço público e registro das páginas
content/             Notícias, cursos e manifesto de notícias geradas
src/
  pages/             Templates das páginas institucionais
  components/        Cabeçalhos, rodapés, metadados e cursos
assets/
  css/
    tokens.css       Cores, fontes, dimensões e curvas de movimento
    base.css         Fonte local, reset, foco e acessibilidade global
    components/      Estilos de componentes e seções reutilizáveis
    pages/           Estilos específicos de páginas
  js/
    components/      Navegação, busca, rodapé e interações de seções
    pages/           Comportamento da home, notícias e contato
    shared/          Modelo editorial compartilhado com o build
    data/            Prévia de notícias gerada para a home
  fonts/             Fontes usadas pelo site
  images/            Imagens publicadas, incluindo WebP responsivo
scripts/             Build e ferramentas opcionais de imagens/migração
server/              HTTP e API de contato
tests/               Testes de conteúdo, servidor e navegador
docs/                Arquitetura, design system e documentação funcional
references/          Imagens originais e referências visuais preservadas
index.html etc.      Páginas publicadas; saídas do build
noticias/            Artigos e paginação; saídas do build
robots.txt           Saída do build
sitemap.xml          Saída do build
```

## Criar uma página

Veja também [a integração das novas páginas](docs/page-integration.md), com os padrões compartilhados de breadcrumbs, animações, rodapé compacto e imagens responsivas. Os caminhos de navegação são configurados em `config/breadcrumbs.json` e inseridos nos templates por `{{breadcrumb}}`.

1. Crie `src/pages/projetos.html`, seguindo este exemplo:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>{{head}}</head>
<body class="editorial-page">
  <a class="skip-link" href="#conteudo">Ir para o conteúdo</a>
  {{header}}
  <main id="conteudo" tabindex="-1">
    <div class="editorial-shell" data-page-search>
      <h1>Projetos</h1>
      <p>Conteúdo aprovado da página.</p>
    </div>
  </main>
  {{footer}}
</body>
</html>
```

2. Adicione uma entrada a `config/pages.js`:

```js
{
  route: 'projetos.html', template: 'projetos.html', footer: 'editorial',
  title: 'Projetos — FAG', description: 'Descrição específica e fiel à página.',
  styles: ['components/header', 'pages/editorial'],
  scripts: ['components/header']
}
```

3. Execute `npm run build`. O cabeçalho, o rodapé, os metadados e o sitemap serão compostos automaticamente. Acrescente o link à navegação quando a página estiver pronta.

Templates não executam expressões: `{{nome}}` insere somente valores fornecidos pelo build e falha se o nome não existir. Para páginas em subpastas, use `{{prefix}}` em links e imagens locais. O gerador calcula esse prefixo a partir da rota.

Os cursos são editados em `content/courses.json`: a mesma alteração aparece nos cards da home, no índice e nas descrições do catálogo. As notícias são editadas em `content/news.json`; veja [o contrato editorial](docs/news.md). `node scripts/build-news.js` continua funcionando e executa o build completo, para manter a home sincronizada.

## Verificação

```sh
npm run build:check
npm test
```

Os testes de navegador usam Python e Playwright como ferramentas opcionais de desenvolvimento:

```sh
python -m pip install -r tests/requirements.txt
python -m playwright install chromium
python tests/news-header-check.py
python tests/news-check.py
python tests/contact-check.py
python tests/site-check.py
python tests/about-check.py
python tests/partners-check.py
python tests/programs-check.py
python tests/opportunities-check.py
```

Para usar um Chrome instalado, configure `FAG_TEST_CHROME` com o caminho do executável. Os testes não enviam e-mails reais: o SMTP de integração é simulado em loopback, e o teste de interface intercepta a API.

`scripts/optimize-images.py` usa Pillow para reconstruir as variantes WebP das imagens institucionais. É uma tarefa opcional, separada do build normal. As imagens geradas já estão versionadas.

## Publicação

O endereço público usado nos metadados está em `config/site.js`; `FAG_SITE_URL` permite substituí-lo no ambiente do **build**. O padrão mantém o domínio já utilizado pelo projeto. A estrutura de publicação atual pressupõe a raiz do domínio. Não use o endereço de desenvolvimento como canonical de produção.

Publique somente os HTMLs gerados, `noticias/`, `assets/`, `robots.txt` e `sitemap.xml`. `docs/`, `references/`, `src/`, `content/` e ferramentas são material de desenvolvimento. Configure a hospedagem estática para retornar `404.html` com status HTTP 404. O servidor Node já atende esses arquivos e faz revalidação de cache por ETag.

O envio do formulário exige o servidor Node na mesma origem e as variáveis SMTP descritas em [.env.example](.env.example) e [Contato](docs/contact.md). `PUBLIC_ORIGIN` configura a origem permitida pela API; não substitui `FAG_SITE_URL` do build.

Veja [a análise e as decisões da refatoração](docs/architecture.md) e [o catálogo visual](docs/design_system.html). Para visualizar o catálogo localmente, use um servidor de arquivos no diretório do projeto; o servidor de produção disponibiliza apenas os recursos públicos.

A página [Parcerias](parcerias.html) usa os registros de `content/partners.json` e logos locais em `assets/images/partners/`. Consulte a [especificação de UX/UI e atualização](docs/parcerias.md).

A página [Programas e Projetos](programas-e-projetos.html) usa `content/programs.json`, com destaque configurável e cards informativos. Consulte a [documentação de conteúdo e manutenção](docs/programs.md).

A central [Inscrições e Seleções](inscricoes-e-selecoes.html) usa `content/opportunities.json`, com busca, filtros, histórico e prazos calculados. Consulte o [contrato de conteúdo e publicação](docs/opportunities.md).

A central [Transparência](transparencia.html) reúne PDFs oficiais locais com busca, filtros e histórico. Consulte a [documentação do acervo e sua atualização](docs/transparency.md).
