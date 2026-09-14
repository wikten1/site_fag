# Análise e reorganização

## 1. Estrutura anterior

O projeto tinha uma home, catálogo de cursos, contato, duas páginas de arquivo de notícias, nove matérias e uma página 404. HTML, CSS e JavaScript puros; Node.js gerava as notícias e atendia o formulário com Nodemailer. Havia testes editoriais, de SMTP e de interface. A pasta `assets/` misturava arquivos publicados, documentação, PNGs originais e três pacotes de referências visuais.

## 2. Problemas identificados

- A home reunia HTML, dois blocos CSS e vários scripts embutidos.
- O build editorial localizava posições de strings em `index.html` para extrair HTML e CSS do cabeçalho. Uma mudança na home podia quebrar a geração.
- Cabeçalho, busca, menu e preferência de movimento tinham implementações sobrepostas na home e nas páginas internas.
- Os cursos repetiam título, imagem, resumo e marcação em duas páginas.
- Notícias da home só apareciam após JavaScript; as matérias já eram estáticas.
- A fonte de produção dependia de uma pasta de referências. Imagens institucionais usavam PNGs grandes.
- Faltavam canonical em páginas institucionais, metadados sociais comuns e sitemap.
- Cinco cards de acesso rápido apontavam para páginas planejadas inexistentes.
- A decoração da seção institucional podia provocar rolagem horizontal em tablet.

## 3. Arquitetura adotada

Geração estática pequena, em CommonJS e Node.js nativo. `config/pages.js` registra páginas; `src/pages/` contém templates; `src/components/` contém a composição compartilhada; `content/` contém dados; `assets/` contém apenas recursos de interface. As URLs `.html` existentes foram preservadas. Não há hidratação de framework, requisições de fragmentos HTML ou dependências novas em produção.

Os arquivos gerados permanecem versionados na raiz e em `noticias/` para manter a publicação estática existente. A repetição no HTML final é intencional: a fonte de edição é única, e cada página funciona por conta própria. `build:check` verifica se as saídas correspondem às fontes.

## 4. Componentes

- `head.js`: título, descrição, canonical, Open Graph, Twitter Card, CSS e scripts `defer`.
- `header.js` e templates: navegação completa e variante compacta do catálogo; prefixos relativos e estado ativo.
- `footer.js` e três templates: variantes institucional, editorial e contato, preservando o desenho de cada página.
- `courses.js`: imagem responsiva, metadados, card, índice e painel de curso, a partir de `content/courses.json`.
- `assets/js/shared/news-model.js`: modelo e cards editoriais usados no navegador e no build; paginação e breadcrumbs editoriais continuam em funções do gerador.
- CSS por componente: navegação, cursos, programas, notícias, atendimento, institucional, acesso rápido e rodapé.
- JavaScript compartilhado do cabeçalho: busca, menu, teclado e preferência de movimento. O comportamento específico do hero fica na home.

Não foram criados componentes genéricos para todo parágrafo, título ou seção. Formulário e hero mantêm templates próprios, proporcionais ao uso atual.

## 5. Duplicações eliminadas

Tokens e base CSS centralizados; cabeçalho e comportamento comuns; cursos unificados; metadados comuns; variantes explícitas de rodapé. Os arquivos antigos de CSS do cabeçalho foram substituídos por uma fonte editável. Quatro PNGs duplicados em `assets/images/` foram removidos após comparação de hash com os originais preservados em `references/images/`.

Os pacotes de referência foram movidos integralmente para `references/templates/`, sem apagar seu conteúdo. Documentos que já tinham alterações locais foram preservados em `docs/`, com atualização dos caminhos. O design system visual é uma referência mais ampla que o site e mantém suas próprias demonstrações; os estilos de produção são os de `assets/css/`.

## 6. SEO e acessibilidade

Canonical e metadados sociais gerados a partir do endereço público configurável. Sitemap com as 14 páginas indexáveis; 404 com `noindex` e resposta HTTP apropriada. O `NewsArticle` existente foi preservado, sem inventar autores, datas ou credenciais institucionais. Home, cards e artigos têm conteúdo estático disponível sem JavaScript.

Os testes verificam um H1 e um main por página, IDs únicos, imagens com descrição e dimensões, destinos locais e fragmentos. O link de pular conteúdo foi centralizado. Menus mantêm controle de foco, Escape, `inert` e navegação sem JavaScript. Atalhos sem destino usam “Em breve” e o padrão de indisponibilidade já existente no rodapé.

Referências técnicas: [JavaScript e SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) e [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), do Google Search Central.

## 7. Performance

| Recurso | PNG original | WebP de referência |
| --- | ---: | ---: |
| Hero | 1.883.328 bytes | 97.056 bytes, 1200 px |
| Institucional | 1.799.461 bytes | 70.096 bytes, 1200 px |
| Mulheres Mil | 1.998.310 bytes | 95.160 bytes, 1200 px |
| PRONATEC | 513.173 bytes | 41.304 bytes, 1200 px |
| Logo | 880.655 bytes | 39.826 bytes, 480 px |

Essas variantes somam aproximadamente 95% menos bytes que os originais correspondentes. O navegador escolhe o tamanho conforme `srcset`/`sizes`; a economia efetiva depende da tela e da densidade de pixels. A home também oferece hero de 640 e 1672 px. O enquadramento e as proporções foram mantidos.

A imagem do hero mantém `fetchpriority="high"` e não usa lazy loading. O preload fixo do PNG foi retirado para não baixar uma versão adicional à escolhida pelo navegador. Imagens abaixo da dobra mantêm lazy loading e dimensões declaradas. A fonte Inter foi copiada para `assets/fonts/`, com `font-display: swap`; a fonte Mono continua com a configuração existente do Google Fonts.

CSS e JavaScript embutidos foram extraídos para permitir reuso e cache. O servidor responde com ETag/304, mantendo revalidação porque os nomes dos recursos não têm hash. O feed estático da home evita inserção tardia dos cards e o script preserva os nós já renderizados.

Critérios aplicados: [otimização do LCP](https://web.dev/articles/optimize-lcp) e [imagens responsivas](https://web.dev/learn/design/responsive-images). Não foi atribuída uma nota Lighthouse nem certificação de Core Web Vitals: estas exigem medições próprias no ambiente de publicação e dados reais de uso para métricas de campo.

## 8. Arquivos e validação

Os principais grupos modificados são os templates em `src/`, configurações em `config/`, o build em `scripts/`, a organização de CSS/JS/fontes/imagens em `assets/`, o servidor HTTP e a documentação. HTMLs, feed, sitemap e robots são reconstruídos com `npm run build`.

Validação inclui testes de modelo editorial com 200 registros simulados, integração HTTP/SMTP local, referências dos HTMLs gerados, imagens, conteúdo, busca, teclado, paginação, responsividade e funcionamento sem JavaScript. Os testes do formulário não enviam mensagens a terceiros. Capturas antes/depois ficam em `tests/artifacts/` durante a revisão local e não são publicadas.

## 9. Novas páginas

O [README](../README.md#criar-uma-página) contém um exemplo completo. Reutilize o cabeçalho e a variante de rodapé adequada, carregue apenas o CSS/JS necessário e cadastre a página. Títulos, descrições e imagens sociais devem representar o conteúdo real. Para uma nova notícia ou curso, edite os dados, sem copiar a marcação existente.

Os breakpoints permanecem próximos aos componentes que controlam, para preservar o comportamento atual. `820px` é o limite compartilhado entre CSS e JavaScript da navegação. CSS custom properties não são usadas em condições de media queries; a tabela de estilos do componente é a referência de cada largura.

## 10. Melhorias futuras

Criar os destinos de Editais, Portarias, Transparência, Biblioteca Digital e EAD quando houver conteúdo aprovado. Configurar SMTP de produção; confirmar a origem de publicação e configurar redirecionamentos das URLs históricas quando a migração pública ocorrer. Medir Lighthouse e métricas de campo em produção antes de acrescentar mais otimizações.

Hospedar a fonte Mono localmente, aplicar Brotli/Gzip no servidor de borda, adotar nomes de assets com hash e automatizar build/testes na integração contínua são opções futuras. CMS, framework, bundler, biblioteca de componentes e fragmentação adicional do backend não são necessários para o porte atual.
