# FAG — Design System

Documentação baseada em [design_system.html](design_system.html), identificado na interface como **DS / 01.0**. Os valores abaixo refletem o CSS e o JavaScript dessa referência; recomendações e limitações são indicadas quando necessário.

## Identidade e princípios

A FAG — Fundação de Apoio à Gestão Integrada em Saúde — adota a proposta **“Precisão técnica. Presença humana.”**. A linguagem combina verdes da marca, neutros esverdeados, tipografia clara, superfícies translúcidas e movimento suave.

- **Clareza:** hierarquia evidente, textos legíveis e espaço entre elementos.
- **Consistência:** tokens compartilhados para cores, efeitos e dimensões.
- **Profundidade:** alternância de seções claras e escuras, gradientes, bordas discretas e camadas de vidro.
- **Geometria:** cantos recortados em painéis e botões; círculos e pílulas em indicadores e controles específicos.
- **Movimento:** entradas progressivas, respostas curtas à interação e animações ambientais.
- **Acessibilidade:** foco visível, estados acompanhados por texto e respeito à preferência de movimento reduzido.

O HTML declara referências de estrutura em Clenecs, tipografia em Autonomous Systems e movimento em Emerald.

## Cores

### Tokens de identidade e neutros

| Token CSS | Valor | Aplicação |
| --- | --- | --- |
| `--forest` | `#03210a` | Verde profundo: fundos escuros, CTA do hero e identidade |
| `--forest-deep` | `#011406` | Profundidade, hover do CTA, tooltip e fechamento |
| `--forest-mid` | `#416e01` | Verde institucional |
| `--lime` | `#78be08` | Destaques, ícones, indicadores e ações em contexto escuro |
| `--lime-bright` | `#a5e23f` | Gradientes de ação e brilhos |
| `--cream` | `#f5f8f1` | Fundo claro e texto em superfícies escuras |
| `--cream-deep` | `#e8efe2` | Variação do fundo claro |
| `--white` | `#fcfefa` | Superfícies elevadas |
| `--hc-bg` | `#f5f8f1` | Fundo da página |
| `--hc-surface` | `rgba(252, 254, 250, .72)` | Superfície translúcida |
| `--hc-surface-strong` | `rgba(252, 254, 250, .9)` | Superfície de maior opacidade |
| `--hc-text` | `#162415` | Texto principal da interface clara |
| `--hc-text-soft` | `#60705d` | Texto secundário e auxiliares |
| `--hc-line` | `#d5dfce` | Bordas e divisores |
| `--hc-accent` | `#6aaa04` | Acento de interface e bordas em hover |
| `--hc-accent-dark` | `#416e01` | Rótulos, foco de campos e destaques institucionais |

`--hc-accent` e `--lime` são cores distintas. O verde-limão é recomendado pelo catálogo para uso sobre verde profundo; o texto principal do corpo usa `--hc-text`.

### Feedback

| Token | Valor | Significado |
| --- | --- | --- |
| `--success` | `#416e01` | Sucesso / operacional |
| `--warning` | `#9b5e0c` | Atenção |
| `--danger` | `#b63d32` | Erro |
| `--info` | `#237889` | Informação |

Combinar cor, texto e, quando aplicável, ícone. O catálogo demonstra badges de sucesso, atenção, erro e estado neutro; não define uma classe `.badge.info`.

### Combinações apresentadas no catálogo

| Combinação | Contraste informado pelo HTML |
| --- | --- |
| Verde profundo / Neblina | `15.97:1` — AAA |
| Verde-limão / Verde profundo | `7.48:1` — AAA |
| Verde institucional / Neblina | `5.67:1` — AA |

Esses números são reproduzidos da referência, sem auditoria independente. A indicação vale para os pares apresentados e não certifica todos os componentes, transparências ou estados da página.

### Gradientes e textura

O gradiente de assinatura combina uma luz radial com uma base verde:

```css
background:
  radial-gradient(circle at 88% 18%, rgba(120,190,8,.88), rgba(106,170,4,.2) 27%, transparent 45%),
  linear-gradient(135deg, #011406, #416e01 54%, #03210a);
```

Seções escuras usam variações entre `#011406`, `#03210a` e `#17460c`, com grade decorativa de `72px × 72px`. A camada `.grain` aplica ruído SVG com opacidade `.035` e não intercepta cliques.

## Tipografia

### Famílias

| Família | Uso | Pesos carregados | Fallback |
| --- | --- | --- | --- |
| Inter | Títulos, parágrafos e controles | 100–900 | `system-ui`, fontes do sistema, `sans-serif` |
| JetBrains Mono | Dados, código, índices, metadados e rótulos técnicos | 100–800 | `ui-monospace`, `SFMono-Regular`, `Consolas`, `monospace` |

As fontes são carregadas pelo Google Fonts com `display=swap` e preconexão aos domínios de fontes. As classes `.font-serif` e `.hero-font-serif` também usam **Inter**; seus nomes não representam uma terceira família.

### Escala do catálogo

| Classe | Tamanho CSS | Peso | Altura de linha | Espaçamento entre letras |
| --- | --- | --- | --- | --- |
| `.type-h1` | `clamp(3.2rem, 6vw, 5.25rem)` | 300 | 1.05 | `-.06em` |
| `.type-h2` | `clamp(2.7rem, 5vw, 4rem)` | 350 | 1.05 | `-.055em` |
| `.type-h3` | `40px` | 450 | 1.12 | `-.045em` |
| `.type-h4` | `30px` | 500 | 1.20 | `-.035em` |
| `.type-h5` | `23px` | 550 | 1.25 | `-.025em` |
| `.type-h6` | `18px` | 600 | 1.35 | `-.015em` |
| `.type-body-lg` | `20px` | 400 | 1.70 | `-.01em` |
| `.type-body` | `16px` | 400 | 1.65 | `0` |
| `.type-body-sm` | `14px` | 400 | 1.60 | `.005em` |
| `.type-caption` | `12px` | 500 | 1.50 | `.02em` |
| `.type-label` | `11px` | 650 | 1.30 | `.12em` |
| `.type-helper` | `11px` | 400 | 1.45 | `.01em` |

Labels usam caixa alta. H1 e H2 são fluidos; os exemplos de 84px e 64px exibidos no HTML correspondem aos limites superiores com raiz de 16px. Em telas de até 560px, H3 passa a 34px e H4 a 27px.

### Títulos editoriais

- `.hero-title`: `clamp(3.6rem, 7vw, 7.3rem)`, peso 300, linha `.89`, tracking `-.078em`.
- `.hero-title-accent`: verde institucional, peso 400 e tracking `-.072em`.
- `.section-title`: `clamp(2.8rem, 5.2vw, 5.4rem)`, peso 350, linha `.93`, tracking `-.068em`, largura máxima de `12ch`.
- `.hero-description`: 17px, linha 1.75 e largura máxima de `54ch`.
- `.section-description`: 16px, linha 1.75 e largura máxima de `52ch`.
- `.hero-eyebrow` e `.section-eyebrow`: JetBrains Mono, 10px, peso 600, tracking `.16em` e caixa alta.

## Layout, superfícies e geometria

| Elemento / token | Especificação |
| --- | --- |
| `--max` | `1380px` |
| `.section-shell` | Largura máxima de `1240px`, centralizada |
| `.section` | Padding padrão de `124px 24px` |
| `.section-head` | Colunas `1fr .74fr`, gap de 50px, margem inferior de 58px |
| `.hero-content` | Máximo de 1260px; colunas `1.04fr .96fr`; gap de 42px |
| `.color-grid` | 12 colunas; gap de 16px; cards ocupam 4 ou 6 colunas |
| `.component-panel` | Colunas `250px 1fr`; gap de 34px; padding de 32px |
| `.form-grid` | 2 colunas; gap de 16px |
| `.demo-card-grid` | 3 colunas; gap de 14px |
| `.icon-grid` | 6 colunas; gap de 12px |
| `--radius-sm` / `--radius-md` / `--radius-lg` | `10px` / `18px` / `28px` |
| `--shadow-soft` | `0 12px 32px rgba(13, 35, 12, .08)` |
| `--shadow-float` | `0 30px 80px rgba(1, 20, 6, .18)` |
| `--ease-out` | `cubic-bezier(.16, 1, .3, 1)` |

O HTML declara os tokens de raio, mas os componentes principais utilizam recortes com `clip-path`. Não há uma escala global de espaçamento declarada em variáveis: os espaçamentos são definidos em cada componente.

Os recortes atingem os cantos superior esquerdo e inferior direito. Exemplos: botões com 11px, cards com 13px, painéis com 14px, modal com 18px e moldura do hero com 24px.

```css
/* Recorte usado na base dos botões. */
clip-path: polygon(
  11px 0, 100% 0, 100% calc(100% - 11px),
  calc(100% - 11px) 100%, 0 100%, 0 11px
);
```

Superfícies de vidro combinam transparência, borda de 1px e `backdrop-filter`. A fotografia do hero usa `object-fit: cover`, saturação `.7`, contraste `.92` e sobreposições para acomodar o texto.

## Componentes

### Botões

A base `.btn`, compartilhada visualmente com os botões do hero, usa altura mínima de 52px, padding horizontal de 24px, gap de 10px, fonte de 11px/700, caixa alta e tracking `.1em`.

| Classe | Aparência e comportamento |
| --- | --- |
| `.hero-btn-primary` | Fundo verde profundo e texto creme; hover sobe 3px e escurece o fundo; seta avança 4px |
| `.hero-btn-secondary` | Superfície clara translúcida, borda e blur de 12px; hover sobe 3px |
| `.btn.btn-primary` | Gradiente de `--lime-bright` para `--lime`, texto profundo e sombra verde; hover sobe 3px |
| `.btn.btn-secondary` | Fundo `--white`, texto principal e borda; hover sobe 3px |
| `.btn.btn-ghost` | Pílula com contorno verde-limão; hover preenche o fundo |
| `.btn.btn-icon` | Controle circular de 52px; hover gira 8° e amplia para 1.06 |
| `.nav-cta` | Altura mínima de 42px, padding horizontal de 16px e recorte de 9px |

Em `.btn:active`, a escala passa a `.98`. Em `.btn:disabled`, a opacidade é `.38`, o cursor é `not-allowed` e a transformação e sombra são removidas. O brilho contínuo dos botões primários tem ciclo de 4.8s.

```html
<button class="btn btn-primary" type="button">
  Continuar
  <iconify-icon icon="solar:arrow-right-linear" aria-hidden="true"></iconify-icon>
</button>

<button class="btn btn-primary" type="button" disabled>Indisponível</button>
```

### Campos de formulário

Classes: `.field`, `.field-label`, `.input`, `.select`, `.textarea` e `.helper`. `.field.full` ocupa toda a grade.

- Inputs e selects: altura mínima de 50px, padding horizontal de 15px, borda de 1px e cantos retos.
- Textarea: altura mínima de 105px, padding superior de 14px e redimensionamento vertical.
- Hover: borda `--hc-accent`.
- Foco: borda institucional, fundo branco e anel `0 0 0 4px rgba(106,170,4,.13)`.
- Erro: `.input.is-error` altera a borda; `.helper.is-error` altera a cor da mensagem.

O exemplo abaixo associa explicitamente a mensagem ao campo:

```html
<label class="field">
  <span class="field-label">Nome completo</span>
  <input class="input" type="text" aria-describedby="nome-helper"
    placeholder="Como devemos chamar você?">
  <small class="helper" id="nome-helper">Insira nome e sobrenome.</small>
</label>
```

O HTML demonstra uma textarea com `is-error`, porém o seletor de borda de erro cobre apenas `.input.is-error`. A mensagem de erro é estática; não existe validação de formulário implementada.

### Cards

`.standard-care-card` usa altura mínima de 230px, padding de 23px, gradiente claro esverdeado, borda de 1px e recorte de 13px. No hover, sobe 6px, reforça a borda e recebe sombra.

A estrutura reúne `.standard-care-card-badge-row`, badge, índice, `.standard-care-card-title` e `.standard-care-card-text`. O título tem 24px/520; o texto, 13px/1.6.

O card de destaque `.hero-floating-card` tem largura máxima de 410px, fundo escuro translúcido, blur de 20px, recorte de 16px, imagem, status e linhas de dados. A imagem amplia para 1.05 no hover. O atributo `data-tilt` ativa inclinação por ponteiro quando as condições de movimento permitem.

### Navegação

`.site-nav` é fixa, centralizada, com altura de 66px, topo de 16px e largura `min(calc(100% - 32px), 1320px)`. Usa vidro a 72%, blur de 20px e recorte de 12px.

- Após 24px de rolagem, `.is-scrolled` reduz o topo para 8px, aumenta a opacidade e reforça a sombra.
- Links usam 12px/600 e uma linha de 1px no hover ou em `.is-active`.
- Um `IntersectionObserver` atualiza o link ativo conforme a seção visível.
- No mobile, `.mobile-menu-btn` alterna `.menu-open` e `aria-expanded`.
- Ao selecionar um link, o menu é fechado.

### Seções

O padrão combina `.section`, `.section-shell`, `.section-head`, `.section-eyebrow`, `.section-title` e `.section-description`. Orbes, grades e gradientes criam profundidade decorativa.

A referência alterna hero claro, tipografia clara, cores escuras, componentes claros com painéis escuros, movimento escuro, ícones claros e fechamento escuro.

### Modal

O diálogo usa `.modal-backdrop`, `.modal-card`, `.modal-close` e o ID `system-modal`.

| Propriedade | Valor implementado |
| --- | --- |
| Backdrop | `rgba(1,20,6,.7)` e blur de 14px |
| Camada | `z-index: 120` |
| Card | Largura máxima de 560px, padding de 34px e recorte de 18px |
| Entrada do card | `translateY(26px) scale(.97)` para estado normal, em 360ms |
| Transição do backdrop | 260ms |

`data-modal-open` abre o diálogo; `data-modal-close`, clique no backdrop ou Escape fecham. A abertura bloqueia a rolagem do corpo e leva o foco ao botão de fechar; o fechamento devolve o foco ao acionador. O elemento tem `role="dialog"`, `aria-modal`, `aria-labelledby` e `aria-hidden` atualizado pelo script.

O texto do catálogo menciona backdrop de 68%, mas o CSS implementa **70%**. Não há contenção de foco por Tab implementada.

### Badges

`.badge` usa formato de pílula, altura mínima de 30px, padding horizontal de 10px, gap de 7px e fonte de 10px/650. Variantes: `.success`, `.warning`, `.danger` e `.neutral`.

```html
<span class="badge success">
  <iconify-icon icon="solar:check-circle-linear" aria-hidden="true"></iconify-icon>
  Operacional
</span>
```

### Tooltips

`.tooltip-wrap` posiciona `.tooltip` acima do acionador, com distância de 12px. O tooltip tem largura máxima de 220px, padding de `10px 12px`, fundo profundo e fonte de 11px/1.45.

Aparece por hover ou `:focus-within`, com transição de 180ms e deslocamento inicial de 8px. Usa `role="tooltip"`; o primeiro exemplo associa o acionador por `aria-describedby`. Ao reutilizar, manter essa associação. O tooltip complementa uma informação e não substitui um label essencial.

## Movimento e interação

| Classe / efeito | Duração | Comportamento |
| --- | --- | --- |
| `.aura-view-reveal` | 780ms | Opacidade 0 → 1, deslocamento padrão de 28px e blur de 10px → 0 |
| `.hero-fade-up` | 900ms | Entrada com 28px e blur de 6px |
| `.reveal-word` | 1.15s | Palavra sobe de `translateY(120%)` dentro de uma máscara |
| `.nav-enter` | 850ms | Entrada da navegação com deslocamento de 18px e blur de 6px |
| `.hero-float-soft` | 7s, contínuo | Flutuação vertical de até 12px |
| `.orbital-system` | 28s, contínuo | Órbita externa; pseudo-elemento interno usa rotação inversa de 18s |
| `pulseGlow` | 2.6s, contínuo | Pulso de opacidade e escala |
| `diagnosticFlow` | 3.8s, contínuo | Fluxo luminoso vertical |
| `drift` | 10s, contínuo | Deslocamento ambiental de até `26px, -18px` |
| `shine` | 4.8s, contínuo | Faixa de brilho sobre ações primárias |

O reveal usa `cubic-bezier(.22,1,.36,1)`. Os parâmetros `--aura-x`, `--aura-y` e `--aura-delay` ajustam direção e atraso. O observador usa `threshold: .12` e `rootMargin: '0px 0px -7% 0px'`; cada elemento é revelado uma vez.

```html
<article class="standard-care-card aura-view-reveal"
  style="--aura-x: 20px; --aura-y: 0; --aura-delay: 80ms;">
  <!-- Conteúdo do card -->
</article>
```

As palavras do hero recebem atraso inicial de `.22s`, com incremento de `.045s`. Com GSAP e ScrollTrigger disponíveis, os orbes recebem paralaxe com `yPercent: -18` e `scrub: 1.2`. A inclinação por ponteiro exige `(pointer:fine)` e movimento reduzido desativado.

Com `prefers-reduced-motion: reduce`, o CSS reduz durações para `.01ms`, limita animações a uma iteração e desativa a rolagem suave. O JavaScript revela o conteúdo diretamente e evita tilt e animações condicionadas ao GSAP.

## Iconografia

O runtime é **Iconify**, com **Solar Linear** como família principal. A orientação do catálogo permite Lucide quando o conceito não existir no conjunto principal.

| Tamanho orientativo | Aplicação |
| --- | --- |
| 12px | Chips, indicadores e metadados compactos |
| 16px | Botões, links e controles comuns |
| 20–24px | Features, campos e navegação principal |

O catálogo recomenda traço óptico de 1.5px e herança de cor pelo contexto (`currentColor`). Essas orientações não são impostas por uma regra global de tamanho ou espessura; os ícones na grade de demonstração usam 26px.

Exemplos utilizados: `solar:leaf-linear`, `solar:shield-check-linear`, `solar:palette-linear`, `solar:layers-linear`, `solar:code-linear`, `solar:accessibility-linear` e `solar:arrow-right-up-linear`.

## Responsividade

As regras usam `max-width` e são cumulativas.

| Breakpoint | Alterações principais |
| --- | --- |
| Até 1080px | Hero em duas colunas iguais; painéis com coluna lateral de 200px; grade de ícones com 3 colunas |
| Até 820px | Navegação mobile; hero, cabeçalhos, painéis e área de movimento em 1 coluna; seções com padding de `96px 20px`; cards de cores com meia largura; orientações de ícones em 2 colunas |
| Até 560px | Ações do hero com largura total; formulários, cards e cores em 1 coluna; ícones em 2 colunas; orientações e rodapé empilhados; padding lateral das seções de 16px |

O hero passa a `clamp(3.3rem, 7vw, 5.6rem)` até 1080px e `clamp(3.15rem, 15vw, 5rem)` até 560px. No menor breakpoint, sua descrição usa 15px. Os trilhos laterais decorativos são ocultados até 820px.

## Acessibilidade e revisão

A referência implementa foco global de 3px com offset de 3px, foco específico nos campos, labels em formulários, textos alternativos nas imagens, atributos de diálogo e estado expandido no menu. Elementos decorativos como ruído e trilhos usam `aria-hidden`.

Para reutilização, o checklist apresentado no próprio modal orienta revisar contraste, teclado, hierarquia tipográfica, erros, responsividade e movimento reduzido. Além disso, a implementação atual requer completar a contenção de foco do modal, as associações de ajuda/erro dos campos e a cobertura visual de erro para textarea/select quando esses comportamentos forem necessários.

## Arquivos e dependências

O design system é uma página HTML com CSS e JavaScript inline. Não depende de um framework de interface.

| Recurso | Localização relativa a este documento |
| --- | --- |
| Referência visual e implementação | [design_system.html](design_system.html) |
| Logo FAG | [Logo.png](raw_files/Logo.png) |
| Fotografia do hero e fechamento | `templates/clenecs ref/assets/22dd7a232342672b_0b9f293f-1d43-45a5-8afa-a26a82.png` |
| Iconify | `templates/clenecs ref/assets/2aca3a415088b0b0_iconify-icon.min.js` |
| GSAP | `templates/clenecs ref/assets/5468a19b889d2341_gsap.min.js` |
| ScrollTrigger | `templates/clenecs ref/assets/d705d104381eeb97_ScrollTrigger.min.js` |
| Fontes | Google Fonts: Inter e JetBrains Mono |

Os exemplos deste documento pressupõem o CSS e os runtimes da referência. Para manter a documentação sincronizada, atualizar valores, classes e comportamentos sempre que o HTML mudar.
