# Integração das páginas posteriores à reorganização

## Escopo e diagnóstico

Foram analisadas Sobre, Parcerias, Programas e Projetos, Inscrições e Seleções, Conteúdo Online, Transparência e Política de Privacidade, além das integrações com catálogo, contato e notícias. Todas já estavam cadastradas em `config/pages.js` e usavam templates, metadados, cabeçalho, rodapé e tokens de tema compartilhados. Essa arquitetura foi mantida.

As duplicações principais eram os controladores de entrada por rolagem, a marcação de breadcrumbs e as regras do rodapé compacto. A imagem da página Sobre tinha 2.026.897 bytes em PNG. Não foi introduzido framework, biblioteca ou dependência de produção.

## Componentes reutilizados e generalizados

- `src/components/head.js`, `header.js`, `footer.js` e o controlador de tema continuam sendo os pontos centrais da interface global.
- `src/components/breadcrumb.js` gera os caminhos de navegação de todas as páginas internas e das notícias. `config/breadcrumbs.json` define os itens, o rótulo acessível e as variantes existentes: classes, separadores e posição do estado atual. Os rótulos são escapados e os links recebem o prefixo relativo do build.
- `assets/js/components/reveal.js` concentra observação de rolagem, estado visível, pausa, movimento reduzido, foco e impressão. Sobre, Parcerias, Programas, Conteúdo Online e Inscrições configuram o componente no `main`, por `data-reveal-options`. Privacidade usa a mesma função com foco por seção, mantendo seu índice, indicador de leitura e impressão de respostas.
- `assets/css/components/footer-compact.css` reúne o rodapé compacto de Sobre e Parcerias. Variáveis locais preservam diferenças de dimensões e tipografia; as regras responsivas específicas permanecem nos estilos das páginas.

Quatro scripts que apenas repetiam o comportamento de entrada foram removidos: `pages/about.js`, `partners.js`, `programs.js` e `online.js`. Inscrições e Privacidade mantêm seus scripts específicos, sem a implementação duplicada de entrada por rolagem. Os intervalos, seletores e limites de observação anteriores foram preservados.

Os cards de parceiros, programas, recursos digitais, oportunidades e documentos continuam com seus componentes existentes. Eles têm conteúdo e comportamentos distintos; transformá-los em um único card genérico acrescentaria condicionais sem reduzir responsabilidades.

## Imagens e assets

O PNG `assets/images/institutional/sobre-fag.png` foi preservado em `references/images/sobre-fag.png`. A publicação usa variantes WebP de 640, 1200 e 1672 px, geradas pelo mesmo `scripts/optimize-images.py` já existente:

| Variante | Bytes |
| --- | ---: |
| 640 px | 47.030 |
| 1200 px | 107.694 |
| 1672 px | 161.068 |

A variante de 1200 px representa redução de aproximadamente 94,7% frente ao PNG original. O HTML mantém dimensões, texto alternativo, enquadramento e prioridade da imagem principal; `srcset` e `sizes` permitem ao navegador escolher a resolução. A imagem social também utiliza a variante otimizada.

As marcas de parceiros, imagens de programas, miniaturas de documentos e PDFs continuam nas pastas existentes. Dez logos receberam nomes associados ao identificador da instituição, como `uenf.png`, `seeduc.png`, `pesagro.png` e `firjan-senai.png`, substituindo nomes genéricos ou inconsistentes. Os bytes foram preservados e conferidos por hash; conteúdo e documentação apontam para os novos nomes. Não foram removidos PDFs nem alterados seus bytes, conteúdo ou proveniência. Miniaturas pequenas foram preservadas para evitar otimização sem ganho relevante.

## SEO, performance e preservação

Título, descrição, canonical, Open Graph, sitemap e JSON-LD pertinente continuam no fluxo centralizado existente. A refatoração não acrescenta dados estruturados artificiais. Os breadcrumbs renderizados preservam os caminhos e `aria-current`. O conteúdo permanece estático e legível sem JavaScript.

A redução vem do compartilhamento de código de animação e da imagem responsiva; não há promessa de pontuação Lighthouse ou Core Web Vitals sem medição no ambiente publicado. Os tokens de cores e o tema escuro existentes foram preservados.

## Como ampliar

Cadastre páginas em `config/pages.js`, templates em `src/pages/` e breadcrumbs em `config/breadcrumbs.json`. Carregue `components/reveal` somente se necessário. Exemplo:

```html
<main data-reveal-options='{"selector":"[data-item-reveal]","readyClass":"page-reveal-ready","threshold":0.08}'>
  {{breadcrumb}}
  <h1 data-item-reveal>Título</h1>
</main>
```

O CSS da página controla a aparência e os tempos de transição. As opções adicionais são `delayProperty`, `batch`, `step`, `staggerSelector`, `rootMargin` e `focus`. Links locais que precisam transferir o foco podem usar `data-anchor-focus`. O conteúdo deve continuar visível antes da inicialização do componente.

Execute `npm run build`, `npm run build:check`, `npm test` e os testes de navegador relevantes. Alterações no PNG original exigem reconstruir as imagens pela ferramenta opcional antes do build.

## Validação realizada

- 28 testes Node aprovados, incluindo conteúdo, referências locais, PDFs, filtros, datas, metadados, tema, servidor e breadcrumbs com prefixos relativos.
- Sete páginas verificadas em dois temas e seis larguras, com 28 capturas completas para revisão visual.
- Testes específicos de Sobre, Parcerias, Programas, Inscrições, Privacidade e Transparência aprovados: teclado, busca, menu, filtros, paginação, histórico, pausa, movimento reduzido, impressão e conteúdo sem JavaScript, conforme os recursos de cada página.
- Build reproduzível e ausência de imagens idênticas duplicadas na pasta publicada.
- O diagnóstico de contraste não apontou falhas calculáveis em superfícies sólidas; sinalizou uma legenda sobre imagem/gradiente em Programas para revisão visual. Essa composição foi preservada e revisada nas capturas, sem alegação de certificação automática do contraste sobre fotografias.

## Limites e atenção futura

O envio real de contato continua dependente da configuração SMTP. Disponibilidade de recursos externos, prazos e documentos oficiais devem continuar sendo atualizados nas fontes de conteúdo existentes. Não foram alterados textos legais ou regras de seleção. As validações locais não certificam disponibilidade futura dos sites externos nem métricas de campo de produção.
