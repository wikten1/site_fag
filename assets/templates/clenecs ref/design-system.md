# Cleanecs Design System

Documentação do sistema visual apresentado em `design-system.html`. O arquivo HTML é a fonte visual e interativa; este documento descreve os elementos que já existem nele, sem introduzir novos padrões.

## Princípios

- Calor e estrutura: neutros suaves, verdes sálvia e recortes angulares organizam a interface.
- Hierarquia medida: títulos grandes e compactos contrastam com texto de leitura arejado.
- Movimento discreto: entradas, elevações e mudanças de cor oferecem resposta sem interromper a leitura.
- Superfícies em camadas: fundos graduais, linhas leves, sombra baixa e vidro translúcido dão profundidade.

## Tipografia

### Famílias

| Uso | Família | Característica |
| --- | --- | --- |
| Interface e texto | `Urbanist` | Família principal para navegação, títulos, corpo e rótulos. |
| Destaques editoriais | `Playfair Display` | Itálico, peso 400 e tracking `-0.02em`. |

### Escala

| Estilo | Seletor de origem | Tamanho / entrelinha |
| --- | --- | --- |
| Heading 1 | `.hero-title` | `clamp(54px, 7vw, 109px)` / `0.90` |
| Heading 2 | `.services-catalog-title` | `clamp(48px, 5vw, 83px)` / `0.95` |
| Heading 3 | `.standard-care-card-title` | `28px` / `29px` |
| Heading 4 | `.process-step-title` | `22px` / `24px` |
| Bold L | `.hero-card-title` | `28px` / `28px` |
| Bold M | `.service-catalog-label` | `18px` / `21px` |
| Bold S | `.testimonial-name` | `14px` / `17px` |
| Paragraph | `.services-catalog-description` | `18px` / `31.5px` |
| Regular L | `.standard-care-card-text` | `16px` / `27.2px` |
| Regular M | `.service-catalog-copy` | `15px` / `26.25px` |
| Regular S | `.testimonial-detail` | `11px` / `14.3px` |

### Regras de composição

- Use `.hero-font-serif` apenas para uma linha ou palavra de destaque dentro de um título.
- Os títulos usam tracking negativo entre `-0.045em` e `-0.075em`.
- Metadados e rótulos usam caixa alta, peso 700 e tracking expandido entre `0.10em` e `0.20em`.
- Texto corrido usa `rgba(47, 49, 45, 0.68-0.78)` para reduzir contraste sem perder legibilidade.

## Tokens Visuais

### Cores

| Token | Valor | Uso |
| --- | --- | --- |
| `--hc-bg` | `#f7f3ee` | Fundo base da página. |
| `--hc-surface` | `rgba(252, 250, 247, 0.72)` | Vidro e superfícies suaves. |
| `--hc-surface-strong` | `rgba(252, 250, 247, 0.88)` | Cards flutuantes. |
| `--hc-text` | `#2f312d` | Texto primário e ações escuras. |
| `--hc-text-soft` | `#7e8078` | Metadados e navegação secundária. |
| `--hc-line` | `#d8d1c7` | Bordas e divisores. |
| `--hc-accent` | `#8fa08c` | Ações primárias, ícones e indicadores ativos. |
| `--hc-accent-dark` | `#6f7f6d` | Estado hover e ênfase secundária. |

### Sombra

| Token | Valor | Uso |
| --- | --- | --- |
| `--hc-shadow` | `0 24px 60px rgba(32, 28, 23, 0.10)` | Card flutuante do hero. |
| `--hc-shadow-soft` | `0 12px 28px rgba(32, 28, 23, 0.08)` | Profundidade sutil disponível no sistema. |

### Superfícies e Gradientes

- Hero: gradiente vertical de `#f7f3ee` para `#e8ede6`, com imagem e sobreposição sálvia.
- Catálogo: gradiente `#eef2ec` para `#e8ede6`, com brilho radial verde no canto superior esquerdo.
- Cards de serviço: três variações de gradiente verde suave aplicadas por `.is-outer` e `.is-middle`.
- Standard care: `#f8faf6` para `#f2f5f0`, com brilho radial no canto superior direito.
- Conversão: gradiente com duas camadas radiais, de `#eef3ed` para `#f8f5f0`.
- Os recortes angulares usam `clip-path: polygon(...)` em navegação, botões, cards, chips e superfícies de destaque.

## Componentes

### Navegação

| Elemento | Seletor | Comportamento |
| --- | --- | --- |
| Barra fixa | `.hero-nav-wrap` | Fixa a `20px` do topo; reduz para `14px` em mobile. |
| Navegação | `.hero-nav` | Fundo translúcido, `backdrop-filter: blur(16px)` e recorte angular. |
| Link | `.hero-nav-links a` | Muda de `--hc-text-soft` para `--hc-text` no hover e no estado `.is-active`. |
| CTA | `.hero-nav-cta` | Fundo sálvia; sobe `1px` e escurece no hover. |

### Botões e Links de Ação

| Variante | Seletor | Altura | Estado hover |
| --- | --- | --- | --- |
| Primário escuro | `.hero-btn-primary` | `52px` | Fundo `#1f201d`, `translateY(-1px)`. |
| Secundário claro | `.hero-btn-secondary` | `52px` | Fundo mais transparente, borda sálvia, `translateY(-1px)`. |
| Compacto sálvia | `.hero-nav-cta`, `.process-cta`, `.services-catalog-button` | `42px` | `--hc-accent-dark`, `translateY(-1px)`. |
| Submit | `.final-conversion-submit` | `48px` | `--hc-accent-dark`, `translateY(-1px)`. |

Os estados explícitos no design de origem são `default` e `hover`. Foco é fornecido pelo navegador para links e botões; não há estilo customizado de `:focus`, `:active` ou `:disabled` para botões.

### Campos de Formulário

| Elemento | Seletor | Comportamento |
| --- | --- | --- |
| Campo de texto | `.final-conversion-input` | Sem fundo, apenas borda inferior, `15px`. |
| Select | `.final-conversion-select` | Compartilha a aparência do input e remove aparência nativa. |
| Foco | `:focus` | Borda inferior muda para `--hc-accent` em `180ms ease`. |
| Checkbox | `.final-conversion-check` | O quadrado interno fica visível quando o input está marcado. |

### Cards

| Variante | Seletor | Uso | Hover |
| --- | --- | --- | --- |
| Card flutuante | `.hero-floating-card` | Síntese de informações no hero. | Não recebe hover; flutua continuamente. |
| Serviço | `.service-catalog-card` | Catálogo de serviços e superfícies. | Sobe `2px`; imagem amplia para `1.04`. |
| Standard care | `.standard-care-card` | Benefícios, ícones e escalas de ícone. | Sobe `2px`, clareia o gradiente e reforça sombra/borda. |
| Testimonial | `.testimonial-card` | Motion gallery. | Sobe `3px` e muda borda/sombra. |

### Disclosure

- Seletor: `.final-conversion-faq-item`.
- Elemento nativo: `details` e `summary`.
- No estado `[open]`, `.final-conversion-faq-icon` gira `180deg` e recebe `--hc-accent-dark`.
- Duração: `180ms ease`.

## Layout e Espaçamento

| Padrão | Seletor | Estrutura |
| --- | --- | --- |
| Hero | `.hero-content` | Grid `1.05fr .95fr`, `42px` de gap, largura máxima de `1280px`. |
| Catálogo | `.services-catalog-grid` | Três colunas; cada coluna contém dois cards com gap de `16px`. |
| Standard care | `.standard-care-grid` | Quatro colunas com gap de `24px`. |
| Process split | `.process-grid` | Duas colunas iguais com gap de `42px`. |
| Conversão | `.final-conversion-quote` | Grid `.9fr 1.1fr`, contexto à esquerda e formulário à direita. |

### Breakpoints

| Breakpoint | Ajustes |
| --- | --- |
| `1200px` | O grid `.standard-care-grid` passa de quatro para duas colunas. |
| `1080px` | Hero, catálogo, process split e conversão passam para uma coluna; os links centrais da navegação somem. |
| `720px` | Padding lateral entre `14px` e `22px`; ações do hero ocupam toda a largura; grids passam para uma coluna. |

## Motion e Interação

### Animações

| Nome | Seletor | Definição |
| --- | --- | --- |
| Entrada do hero | `.hero-fade-up` | `heroFadeUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards`. |
| Flutuação | `.hero-float-soft` | `heroFloatSoft 7s ease-in-out infinite`. |
| Revelação de seção | `.service-catalog-reveal`, `.standard-care-reveal`, `.process-reveal` | `heroFadeUp 0.8s ease-out forwards`, inicialmente pausada. |

### Keyframes

`heroFadeUp`:

- Início: `opacity: 0`, `translateY(28px)`, `blur(6px)`.
- Fim: `opacity: 1`, `translateY(0)`, `blur(0)`.

`heroFloatSoft`:

- Início e fim: `translateY(0)`.
- Meio: `translateY(-12px)`.

### Scroll Reveal

- Um `IntersectionObserver` observa os elementos de revelação.
- Configuração: `threshold: 0.12` e `rootMargin: 0px 0px -10% 0px`.
- Ao entrar na viewport, a classe `.is-visible` é adicionada e o elemento deixa de ser observado.
- A animação acontece uma única vez, como no design de referência.

### Durações de Hover

- Navegação, botões, bordas e links: `180ms ease`.
- Cards standard care e testimonials: `220ms ease`.
- Imagem de serviço: `700ms ease` para o zoom.

## Ícones

- Sistema: `iconify-icon`, usando o conjunto Solar Linear.
- Tamanhos utilizados: `14px`, `16px` e `18px` em chips, listas, badges e ações.
- Cor: os ícones herdam cor do contexto; exemplos incluem `--hc-accent`, `--hc-accent-dark` e `--hc-text`.
- Ícones recorrentes: `solar:arrow-right-linear`, `solar:check-read-linear`, `solar:leaf-linear`, `solar:shield-check-linear`, `solar:calendar-linear` e `solar:alt-arrow-down-linear`.

## Assets e Dependências

- Imagem principal: `assets/22dd7a232342672b_0b9f293f-1d43-45a5-8afa-a26a82.png`.
- Ícones: `assets/2aca3a415088b0b0_iconify-icon.min.js`.
- Motion assets preservados: `assets/5468a19b889d2341_gsap.min.js` e `assets/d705d104381eeb97_ScrollTrigger.min.js`.
- Fontes: Urbanist e Playfair Display, carregadas do Google Fonts.

## Referência de Implementação

Para uma representação visual e interativa dos padrões, abra `design-system.html`. Ao implementar uma página com este sistema, reutilize os seletores existentes e preserve seus valores de transição, recorte, gradiente e breakpoint.
