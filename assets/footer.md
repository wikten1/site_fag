# FAG · Área 5.10 — Rodapé

Implementado em `index.html`, com estilos isolados em `footer.css`. Referência visual: `design_system.html`, conceito “Precisão técnica. Presença humana.” O nome institucional segue o briefing e a marca fornecida, pois o nome de fundação de saúde presente no catálogo não corresponde a este projeto.

## Composição e medidas

A superfície principal usa verde profundo `#03210A`. Um recorte de 36px no canto superior esquerdo faz a transição do fundo claro; o espaçamento de 80px já existente após Atendimento mantém o respiro. O fundo tem grade de 96px, linhas com 3,5% de opacidade e círculos/nós estáticos em SVG, com traço a 6%. São elementos abstratos, sem reproduzir a marca.

| Componente | Especificação |
| --- | --- |
| Container | Centralizado, máximo de 1240px, margens mínimas de 32px |
| Área principal | Padding superior 80px e inferior 64px |
| Grid desktop | 12 colunas iguais; gap horizontal 32px; proporção 4 / 2 / 2 / 4 |
| Identidade | 4 colunas, respiro direito 24px; marca até 300px de largura |
| Painel da marca | `#FCFEFA`, padding 22px 24px, recortes de 14px; imagem original proporcional, sem filtros |
| Descrição | Trecho já presente na seção A Fundação; máximo de 38ch; margem superior 26px |
| Institucional / Acesso | 2 colunas cada; títulos com marcador de 22 × 2px |
| Privacidade e contato | 4 colunas; divisor esquerdo e padding esquerdo de 24px |
| Listas | Links com altura mínima 44px, padding vertical 9px e gap 2px |
| Redes | Grade 2 × 2, gap 8px, largura máxima 300px, controles de pelo menos 44px de altura |
| Contatos | Ícone de 18px + gap 12px + texto; gap vertical 20px; linha superior com padding 24px |
| Faixa inferior | Fundo `#011406`; borda superior de 1px; padding vertical 24px; copyright à esquerda e retorno ao início à direita |

As alturas são livres: o texto pode quebrar e os blocos crescem com zoom e tradução. O recorte é aplicado apenas às superfícies decorativas, preservando o contorno de foco.

## Conteúdo e navegação

| Grupo | Conteúdo / destino |
| --- | --- |
| Marca | Logo oficial `raw_files/Logo.png`; retorno para `#hero-title` |
| Descrição | “Conectamos formação, pesquisa, tecnologia e políticas sociais para ampliar oportunidades e impulsionar o desenvolvimento socioeconômico do território.” Reutilizada de `index.html` |
| Institucional | Sobre a FAG → `#sobre-a-fag`; Parcerias → indisponível; Contato e Atendimento → `contato.html` |
| Acesso | Cursos → `cursos.html`; Notícias → `noticias.html`; Transparência e Conteúdo Online → indisponíveis |
| Privacidade | LGPD e Política de Privacidade → indisponíveis |
| Endereço | Rua 19 de Novembro, nº 60, Sala 202, Tanguá – RJ, CEP 24.890-000; reutilizado de Atendimento e `contato.html` |
| Telefone / e-mail | `(21) 0000-0000` e `contato@exemplo.gov.br`; texto de exemplo explicitamente identificado, sem chamadas ou envio de e-mail |
| Redes | Instagram, Facebook, YouTube e LinkedIn; botões desabilitados, nomes visíveis e aviso “CONTEÚDO EXEMPLO — Perfis de exemplo — substituir pelos canais oficiais.” |
| Ação de contato | Link discreto “Central de Atendimento” → `contato.html` |
| Copyright | Ano atualizado por JavaScript, fallback 2026; nome institucional completo em texto; sem créditos promocionais |

“Em breve” indica destinos não publicados nesta implementação. Os itens usam `aria-disabled="true"` e não possuem `href` nem entram na sequência de Tab. Não se reaproveitam as rotas planejadas do Acesso Rápido, que ainda não têm arquivos de destino. Antes de disponibilizar cada item, substituir o `span.footer-pending` por um `a.footer-link` com URL confirmada e retirar “Em breve”. Não foram criados documentos legais fictícios.

Para publicar os canais sociais, substituir o botão de exemplo por um `a.footer-social`, informar a URL oficial e remover `disabled` e os avisos. Acrescentar uma seta externa e um nome acessível como “Instagram da FAG (site externo)”. Se abrir nova aba, indicar “abre em nova aba” e usar `target="_blank" rel="noopener noreferrer"`. Os estilos de hover e active já atendem aos links sociais. Nenhum perfil externo é presumido.

## Tipografia, cores e ícones

Inter em títulos (15px/600, linha 1,5), descrição (15px/400, linha 1,7), links e contatos (14px, linha 1,6–1,7), redes e copyright (13px). Medidas em `rem` respeitam a preferência de fonte. JetBrains Mono aparece somente na localização editorial e no ano (12px). Notas de exemplo usam 12px; o pequeno rótulo complementar usa 11px.

Títulos usam `#FCFEFA`, texto secundário `#C3D0BD` e notas/indisponíveis `#A6B89F`, sem reduzir a opacidade do conteúdo. Acentos e foco usam `#A5E23F`; os marcadores usam `#78BE08`. Divisores usam `#D5DFCE` com 14% de opacidade. O menor contraste textual desses pares é superior a 7:1 sobre o fundo principal; bordas decorativas não comunicam informação.

Os SVGs lineares locais seguem os ícones já implementados na página (traço de 1,5px, `currentColor`, cantos arredondados), sem acrescentar dependência remota do Iconify. Endereço, telefone e e-mail têm rótulos escritos; todos os ícones redundantes e a arte de fundo usam `aria-hidden="true"`.

## Estados

| Estado | Links | Redes sociais |
| --- | --- | --- |
| Default | Texto `#C3D0BD`, sem sublinhado | Superfície clara a 3,5%, borda discreta, ícone e nome |
| Hover | Verde-limão e sublinhado a 5px; seta da Central avança 4px e retorno sobe 3px | Quando habilitadas: sobe 2px, borda/texto verde-limão |
| Focus-visible | Contorno sólido de 3px `#A5E23F`, afastado 5px, mais sublinhado | Mesmo contorno, preservado fora da superfície |
| Active | Texto claro e fundo claro a 8% | Quando habilitadas: escala `.98` |
| Disabled | Texto legível, “Em breve”, `aria-disabled`; sem ação | `disabled` nativo, borda tracejada, rótulo de exemplo; sem hover ou movimento |

Transições de 180ms. Sem reveal ou animações contínuas. `prefers-reduced-motion: reduce` e a opção “Pausar animações” do site removem transições e deslocamentos. O retorno ao início conserva a navegação nativa e transfere o foco para o título da página.

## Responsividade e acessibilidade

| Largura CSS | Organização |
| --- | --- |
| Acima de 1100px | Quatro blocos em grid de 12 colunas |
| 761–1100px | Identidade ocupa a primeira linha, marca/descrição à esquerda e redes à direita; três grupos abaixo; padding vertical 72px/56px |
| 561–760px | Margens de 24px; navegação em duas colunas e contato abaixo, com endereço/canais lado a lado |
| Até 560px | Uma coluna: marca, descrição, redes, Institucional, Acesso, privacidade, contatos, copyright; padding vertical 60px/56px, gap 40px; marca até 280px |

O landmark é um `footer` fora de `main`; cada navegação recebe nome próprio. Contatos usam `address`; listas usam `ul/li`. Os grupos curtos ficam sempre visíveis, sem accordion. Todos os controles habilitados são links nativos com destinos existentes e alvos de pelo menos 44 × 44px. O nome institucional completo está em texto no copyright, além da imagem da marca.

O layout usa colunas `minmax(0, 1fr)`, quebra de e-mail e largura fluida para reflow a 320px. Em zoom de 200%, a largura CSS reduzida aciona os breakpoints. Há tratamento para cores forçadas, incluindo foco com a cor `Highlight` do sistema e proteção do fundo claro da marca.

## Verificação realizada

Revisão no Chrome com Playwright: 320, 390, 560, 640, 760, 768, 820, 1024, 1100, 1280 e 1440px. O rodapé manteve conteúdo dentro dos blocos e controles com pelo menos 44 × 44px. Foram inspecionadas capturas desktop, tablet e mobile.

Também passaram: ampliação de fonte raiz para 200%; viewport de 640px com escala de dispositivo 2, simulando o espaço disponível de uma janela de 1280px em zoom de 200%; sequência de Tab; foco de 3px; retorno ao título com Enter; sete destinos válidos; execução sem erros JavaScript; conteúdo e links sem JavaScript; foco e proteção da marca em cores forçadas. Contraste mínimo calculado dos textos: 8,14:1. Isso é uma verificação do componente, não uma certificação de acessibilidade do site inteiro.

Observação sobre a página existente: há 4px de transbordamento horizontal nas larguras de 1024 e 1100px. Em 1100px, remover o rodapé mantém o documento em 1104px, confirmando origem externa ao novo componente. Em 320px, o documento permanece sem transbordamento. Esse comportamento anterior não foi alterado nesta entrega.
