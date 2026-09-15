# Parcerias — especificação visual e funcional

Página implementada: [parcerias.html](../parcerias.html). Referência criativa principal: [design_system.html](design_system.html). Escopo: somente a página Parcerias, com ativação dos links que já estavam previstos na home e em Sobre a FAG.

## 1. Conceito visual

**Uma rede de instituições conectadas por objetivos em comum.** A página interpreta “Precisão técnica. Presença humana.” com uma composição editorial, linhas finas, tipografia leve e uma rede geométrica discreta. As instituições recebem o mesmo tratamento visual, sem níveis de patrocínio ou destaque comercial.

O fundo `#F5F8F1` dá continuidade à identidade da FAG. Superfícies `#FCFEFA`, áreas de logo brancas e divisores `#D5DFCE` organizam a leitura. Texto principal `#162415`, secundário `#60705D`, links e indicadores `#416E01`. O verde profundo `#03210A` aparece apenas no bloco conceitual e no botão de contato; o hover do botão usa `#011406`. O acento luminoso `#A5E23F` fica restrito ao bloco escuro. Os demais verdes do design system permanecem disponíveis nos tokens, sem obrigatoriedade de utilizar toda a paleta.

## 2. Estrutura e ordem de leitura

1. Cabeçalho compartilhado do site, com busca e acessibilidade.
2. Breadcrumb.
3. Hero interno: contexto, H1, introdução, âncora e rede abstrata.
4. Linha editorial “Uma rede de colaboração”.
5. Introdução institucional em duas colunas.
6. Instituições parceiras: título, texto auxiliar e lista de cards.
7. Bloco conceitual de colaboração.
8. Convite para novas parcerias e contato.
9. Explore também.
10. Rodapé editorial compartilhado.

Não há estatísticas, projetos ou resultados individuais atribuídos aos parceiros. A composição não depende de uma quantidade fixa de instituições.

## 3. Hero interno

O hero usa colunas de aproximadamente 57% / 43%, gap de 60px e padding inferior de 48px. Não ocupa uma tela inteira. O texto é o elemento principal; a rede ocupa a coluna direita.

- Eyebrow: **INSTITUCIONAL · PARCERIAS**, JetBrains Mono 10px, peso 500, tracking `.12em`, ponto de 6px.
- H1: **Parcerias**, Inter 300, `clamp(64px, 7.7vw, 108px)`, linha 1, tracking `-.07em`. O ponto verde é decorativo e ignorado por leitores de tela.
- Introdução: 18px, linha 1.8, largura máxima de 52 caracteres aproximados. Explica a finalidade institucional sem criar projetos específicos.
- Âncora: **Conheça as instituições**, texto e seta para baixo, área mínima de 44px. Leva a `#instituicoes` e transfere o foco para a seção, preservando a sequência do teclado.
- Rede: SVG com seis nós, conexões de 1px e círculos de referência em baixa opacidade. Não usa logos como decoração. Não possui loop ou parallax. É ignorada por tecnologia assistiva.

## 4. Breadcrumb

**Início › Institucional › Parcerias**. Início aponta para `index.html`; Institucional aponta para a página existente `sobre.html`. Parcerias usa `aria-current="page"`, sem link redundante. Lista ordenada dentro de `nav`, com chevrons SVG decorativos. Fonte 12px, links com altura mínima de 44px, transição de cor de 180ms e sublinhado no hover. Mobile: 11px e gaps de 7px.

## 5. Introdução institucional

Layout 40% / 60%, gap de 80px, 96px de espaço vertical. A coluna esquerda contém **COLABORAÇÃO INSTITUCIONAL** e **Conexões que ampliam oportunidades.** A palavra final usa verde institucional. H2 de 32–44px, peso 400, linha 1.15, tracking `-.05em`.

A coluna direita possui dois parágrafos de 16px, linha 1.85, espaçados em 18px. Texto sobre cooperação, qualificação, pesquisa e desenvolvimento do território. Sem card ou superfície adicional.

## 6. Seção principal e grid

**Nossa rede / Instituições parceiras**, com introdução auxiliar de 14px. Cabeçalho separado da grade por 36px. Lista semântica `ul`, preservando a ordem da fonte original.

| Largura de viewport | Colunas | Margens laterais | Gap |
| --- | --- | --- | --- |
| Acima de 1100px | 4 | mínimo 40px; container máximo 1240px | 20px |
| 901–1100px | 3 | 40px | 20px |
| 601–900px | 2 | 24px | 20px |
| Até 600px | 1 | 20px | 16px |

As colunas usam `minmax(0, 1fr)`. A última linha se alinha à esquerda. Cards incompletos não se esticam para preencher a linha, e não são adicionados espaços reservados. Todas as instituições estão disponíveis desde o HTML inicial.

## 7. Card e nome institucional

Cada item contém `article` com nome acessível associado ao H3. Padding de 24px, borda de 1px, raio de 4px, fundo quase branco. O card se adapta à quantidade de texto, sem truncar nomes. Cards da mesma linha mantêm altura equivalente.

Área do logo: 148px de altura no desktop, 152px no mobile. Abaixo, intervalo de 22px (20px no mobile). H3 de 14px, peso 550, linha 1.6; no mobile, 15px. Descrição opcional de 13px/1.7 somente quando houver conteúdo confirmado. A área de ação, quando existente, fica no final do card.

## 8. Logos e fidelidade das marcas

Os **17 arquivos locais são idênticos, byte a byte, às imagens publicadas na [página antiga de Parcerias](https://fag.tangua.rj.gov.br/convenios/)**, conferidos em 15/09/2026. Já estavam presentes em `assets/images/partners/` e foram incorporados diretamente. A página publicada não consulta esse endereço para carregar imagens nem redireciona a navegação para o site antigo.

- Sem conversão de cores, filtros, recortes, máscaras ou reprocessamento.
- `object-fit: contain`, largura e altura automáticas, limites de 100% da área útil. Logos menores que a área não são ampliados artificialmente.
- Imagens centralizadas e com proporção intrínseca declarada em `width` / `height`.
- Carregamento adiado com `loading="lazy"` e decodificação assíncrona.
- O arquivo SINDPANIFIC possui letras brancas: apenas sua superfície de apoio usa cinza neutro `#303330` para preservar legibilidade. A imagem permanece intacta.
- As margens internas já presentes nos arquivos originais são preservadas. Isso pode resultar em pesos ópticos diferentes entre marcas, sem sacrificar sua integridade.
- Os logos usam `alt=""` porque o nome completo aparece imediatamente abaixo, no H3 que identifica o artigo. A informação é anunciada uma única vez. Se a imagem for utilizada sem esse texto adjacente, usar “Logo da [instituição]”.

## 9. Instituições e destinos

As identidades foram lidas nos logos; nomes complementares e destinos foram conferidos nas páginas institucionais abaixo. Não foram atribuídas categorias ou descrições de parceria. Os URLs confirmados estão em `content/partners.json`. A ausência de URL significa ausência de destino confirmado para esta entrega, não inexistência de site.

| Instituição | Destino confirmado |
| --- | --- |
| Universidade Estadual do Norte Fluminense Darcy Ribeiro | [UENF](https://uenf.br/portal/) |
| Sindicato das Indústrias de Panificação e Confeitaria de Niterói e São Gonçalo | [SINDPANIFIC](https://sindpanific.associativismo-firjan.com.br/) |
| Museu de Astronomia e Ciências Afins | [MAST](https://www.gov.br/mast/pt-br) |
| Secretaria de Estado de Educação do Rio de Janeiro | [SEEDUC](https://www.seeduc.rj.gov.br/) |
| Pesagro-Rio | [Pesagro-Rio](https://www.rj.gov.br/pesagro/) |
| Sindicato Rural de Itaboraí | Card informativo |
| Ministério da Educação | [MEC](https://www.gov.br/mec/pt-br) |
| Firjan SENAI | [Firjan SENAI](https://www.firjansenai.com.br/) |
| Fundação de Apoio à Escola Técnica do Estado do Rio de Janeiro | [FAETEC](https://www.faetec.rj.gov.br/) |
| Biohope | Card informativo |
| Fundação CECIERJ | [Fundação CECIERJ](https://cecierj.edu.br/) |
| Centro de Tecnologias Estratégicas do Nordeste | [CETENE](https://www.gov.br/cetene/pt-br) |
| Geo Brasilis | Card informativo |
| Instituto Federal Fluminense | Card informativo |
| Ministério da Ciência, Tecnologia e Inovação | [MCTI](https://www.gov.br/mcti/pt-br) |
| Instituto Rio Metrópole | Card informativo |
| Secretaria de Estado de Trabalho e Renda do Rio de Janeiro | [SETRAB](https://www.rj.gov.br/trabalho/) |

## 10. Links externos e distinção de interatividade

O card com URL tem um único link real: **Visitar instituição**, acompanhado de ícone externo. Sua área clicável se estende ao card, sem links aninhados. Nome acessível: “Visitar instituição: [nome] (site externo)”. Abre na mesma aba; o usuário pode usar os comandos normais do navegador para abrir em outra aba. Não há redirecionamento intermediário.

Cards sem URL não possuem âncora, seta, cursor de link, posição na sequência de Tab ou efeito de elevação. O nome e a marca permanecem legíveis. Nada aparece como botão desabilitado ou ação vazia.

## 11. Estados dos componentes

| Estado | Resposta |
| --- | --- |
| Padrão | Superfície clara, borda suave, logo estável |
| Hover em card com link | Somente mouse preciso: sobe 4px; borda `#9DB782`; sombra `0 8px 20px #03210A08`; fundo branco; logo escala 1.02; ícone desloca 2px em cada eixo; texto sublinhado |
| Hover em card informativo | Sem transformação ou sombra |
| Foco de teclado no parceiro | Outline de 3px `#416E01`, afastado 5px, contorna o card inteiro; texto do link sublinhado |
| Foco dos demais controles | Outline global de 3px, afastado 5px |
| Pressionado | Superfície secundária e borda verde nos cards navegáveis; botão de contato escurece |
| Link de navegação relacionado | Cor e borda verdes, texto sublinhado, seta desloca 2px |

Transições de card, logo e seta: 220ms. Estados são reconhecíveis por ícone, texto, contorno e sublinhado, além da cor. Não há hover obrigatório em dispositivos de toque.

## 12. Movimento, stagger e preferência do usuário

Entrada no viewport: opacidade 0→1, deslocamento vertical 24px→0, blur 8px→0; 720ms; `cubic-bezier(.22,1,.36,1)`. O observador remove cada elemento após a primeira entrada. A grade aplica 70ms de intervalo, limitado a 210ms por lote, evitando acumular atrasos ao crescer.

O SVG do bloco escuro desenha suas linhas em 1800ms e faz os nós aparecerem em 1600ms. Após a entrada, permanece estático. Não há carrossel, animação ambiental contínua ou movimento contínuo sobre as marcas.

Com `prefers-reduced-motion: reduce`, as entradas, transformações de hover, blur, stagger e animações da rede são removidos. A preferência “Pausar animações” do cabeçalho produz o mesmo resultado, inclusive quando ativada durante uma entrada. A mudança de preferência do sistema também é acompanhada.

Sem JavaScript, todo o conteúdo permanece visível e os links funcionam. Ao receber foco de teclado ou imprimir, os elementos ficam visíveis imediatamente. JavaScript não é necessário para montar a lista de parceiros.

## 13. Bloco de rede e CTA institucional

Bloco conceitual entre a grade e o contato: verde profundo, padding de 52px × 56px, duas colunas, pequeno corte diagonal de 16px. Texto de 26–36px: **Construindo conexões para transformar oportunidades em desenvolvimento.** A rede possui seis nós e é puramente decorativa.

Em seguida, área clara com o título **Sua instituição deseja colaborar com a FAG?**, texto de 15px/1.8 e botão **Entrar em contato**, apontando para `contato.html`. O botão tem altura mínima de 54px, padding de 16px × 24px e texto com seta. No mobile, ocupa a largura disponível. Nenhum novo e-mail, formulário ou telefone foi criado.

## 14. Navegação relacionada

**Explore também**, título de 18px e links editoriais de 14px com divisor inferior. Três colunas no desktop, uma no mobile:

- Sobre a FAG → `sobre.html`.
- Programas e Projetos → seção existente `index.html#programas-e-projetos`.
- Cursos → `cursos.html`.

Contato já é oferecido pelo CTA imediatamente anterior. A página é alcançável pelo link Parcerias no rodapé da home e na navegação relacionada de Sobre a FAG, substituindo os estados “Em breve”.

## 15. Comportamento responsivo e espaçamentos

| Elemento | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| Container | Até 1240px | Margens 24–40px | Margens 20px |
| H1 | Até 108px | 76px até 900px | 56–76px |
| Hero | Texto + rede | Duas colunas, rede menor | Texto em coluna; rede de 140px, baixa opacidade, no topo direito |
| Introdução | 40% / 60%, gap 80px | Gap 36–48px | Uma coluna |
| Espaço entre grandes blocos | 96px | 80px | 56px |
| Cards | Padding 24px | Padding 24px | Padding 24px |
| Bloco escuro | Duas colunas | Duas colunas compactas | Uma coluna; SVG de 180px |
| Contato | Texto e botão lado a lado | Botão abaixo até 900px | Botão em largura total |

Nenhum conteúdo depende de altura fixa de texto. Nomes longos quebram naturalmente. A ordem do documento coincide com a leitura visual. Layout conferido até 320px, sem rolagem horizontal.

## 16. Crescimento, categorização futura e estado vazio

Com poucos parceiros, a grade mantém suas dimensões naturais e ocupa apenas as linhas necessárias. Com 10, 17 ou 30 itens, cresce verticalmente, preserva a ordem e adia o carregamento das imagens. Não há filtros porque a fonte não informa categorias confirmadas.

Cada registro é independente: `id`, `name`, `logo`, `width`, `height`; opcionalmente `description`, `url` e `logoSurface`. `category` pode ser acrescentada futuramente aos dados, mas não gera rótulos ou controles na implementação atual. A função de renderização recebe uma coleção e pode atender a uma seleção futura sem alterar o card.

Se uma coleção maior justificar filtros, só usar categorias editorialmente confirmadas. Especificação da futura extensão: botões compactos com `aria-pressed`, foco preservado no filtro selecionado, atualização anunciada por uma região de status e transição curta de opacidade. Para volumes muito altos, adotar páginas locais de 24 itens, com links anterior/próxima e página atual semanticamente marcada. Esses controles não fazem parte da entrega atual, pois não são necessários para os 17 registros.

Quando `items` está vazio, o mesmo ponto da página renderiza um painel claro com ícone de conexões, título **Parcerias em atualização** e mensagem curta convidando a retornar. Sem contagem zero, ação falsa ou linguagem técnica. O contato e a navegação relacionada continuam disponíveis. O layout foi exercitado com 0, 4, 10 e 30 registros.

## 17. Acessibilidade e critérios de aceite

- Documento em português, um único H1, hierarquia H2/H3 e landmarks de navegação, conteúdo principal e rodapé.
- Atalho “Ir para o conteúdo”; busca compartilhada encontra o nome de cada parceiro e move o foco para seu título.
- Card navegável usa âncora nativa, funciona com teclado e possui indicação de domínio externo.
- Gráficos decorativos e logos adjacentes ao nome não repetem anúncios.
- Interação não depende de cor nem de hover; alvos principais têm pelo menos 44px.
- Reservas de espaço e dimensões intrínsecas reduzem deslocamentos durante o carregamento das imagens.
- Sem falhas de recursos locais, requisições de imagens para o site antigo ou erros JavaScript nos cenários verificados.
- Avaliação automatizada e inspeção visual não substituem uma avaliação completa com leitores de tela.

## 18. Arquivos e atualização

| Arquivo | Responsabilidade |
| --- | --- |
| `src/pages/parcerias.html` | Composição e conteúdo editorial |
| `content/partners.json` | Instituições, logos locais, dimensões e destinos confirmados |
| `src/components/partners.js` | Cards, URLs seguras e estado vazio |
| `assets/css/pages/partners.css` | Layout, estados, responsividade e animação |
| `assets/js/pages/partners.js` | Entradas progressivas e foco da âncora |
| `assets/images/partners/` | 17 imagens originais, sem alterações |
| `tests/partners-check.py` | Verificação no navegador e cenários de crescimento |

Para atualizar, acrescentar o arquivo local e o registro, mantendo um `id` exclusivo. Preencher URL apenas após confirmação institucional e descrição apenas com conteúdo aprovado. Executar `npm run build`; a saída versionada é `parcerias.html`. O build também inclui a rota no sitemap e valida a existência dos logos.

Validação: `npm run build:check`, `npm test` e `python tests/partners-check.py` com as ferramentas opcionais já documentadas no projeto. Capturas de desktop, tablet e mobile ficam em `tests/artifacts/partners-*.png`.
