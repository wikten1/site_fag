# Temas FAG

## Auditoria e escopo

Referência visual: [Living Design System](design_system.html). A implementação usa a arquitetura estática existente, com alterações nas fontes em `src/`, estilos em `assets/css/` e reconstrução dos HTMLs publicados. As alterações locais preexistentes, inclusive a página de privacidade, foram preservadas.

Antes da implementação havia um tema claro declarado em `tokens.css`, metadado de cor fixo, redefinições locais de tokens em Contato e Notícias e centenas de cores literais nos componentes. Foram encontrados fundos, bordas, sombras, gradientes e textos próprios em praticamente todas as páginas. A ilustração SVG de privacidade também tinha cores literais. Não havia um controlador compartilhado de preferência nem regras de `prefers-color-scheme` nas folhas de produção.

As media queries alteravam a composição do hero, a sobreposição da fotografia e a superfície do menu móvel. Essas sobreposições agora usam as mesmas bases RGB dos tokens. As medidas e direções dos gradientes continuam acompanhando o layout, sem criar outra paleta. Estilos inline de tempo de animação e enquadramento das fotografias foram mantidos; não são cores da interface.

## Fonte única de cores

[`assets/css/tokens.css`](../assets/css/tokens.css) contém as cores de produção. Nenhuma página redefine a paleta. `data-theme="light"` e `data-theme="dark"` no elemento `html` selecionam o tema.

| Papel | Tokens |
| --- | --- |
| Marca, invariável | `--brand-forest`, `--brand-deep`, `--brand-green`, `--brand-lime` |
| Fundos e profundidade | `--background`, `--background-secondary`, `--surface`, `--surface-raised`, `--surface-hover` |
| Texto | `--text`, `--text-soft` |
| Interface | `--primary`, `--secondary`, `--highlight`, `--hover`, `--focus` |
| Controles | `--action-bg`, `--action-hover`, `--on-action`, `--on-accent`, `--border-control` |
| Seções de alto contraste | `--inverse-bg`, `--inverse-surface`, `--inverse-text`, `--inverse-muted`, `--inverse-line` |
| Estados | `--success`, `--warning`, `--danger`, `--info` e respectivos `-bg` |
| Efeitos | `--glass`, `--glass-strong`, `--glass-border`, `--overlay`, `--shadow-soft`, `--shadow-float`, `--glow` |
| Plataforma | `--selection-bg`, `--selection-text`, `--theme-color` |

Os nomes históricos `--cream`, `--cream-deep`, `--green` e `--accent` são aliases semânticos para facilitar a manutenção dos componentes existentes. As bases `-rgb` permitem compor opacidades sem duplicar uma cor literal. Preto é usado apenas como máscara alfa decorativa, nunca como fundo do tema escuro.

Textos sobre seções verdes usam os tokens `inverse`, independentemente do tema. Botões sobre superfícies comuns usam `action`/`on-action`; botões claros ou verde-limão usam `on-accent`. Isso evita inverter apenas o fundo e perder o contraste do texto. Logos e marcas de parceiros mantêm as cores originais sobre uma placa neutra apropriada; fotografias e documentos não são invertidos. O mapa do Google é um iframe externo: seu conteúdo é controlado pelo fornecedor, enquanto a moldura e a legenda acompanham os tokens FAG.

## Preferência e navegador

[`assets/js/theme.js`](../assets/js/theme.js) carrega de forma síncrona depois dos tokens e antes dos estilos de página e do conteúdo. Assim a preferência é aplicada antes da primeira pintura. Usa `prefers-color-scheme` somente quando não há escolha manual válida em `localStorage['fag-theme']`. Mudanças do sistema são acompanhadas automaticamente nesse caso. A escolha manual tem prioridade e sincroniza abas da mesma origem pelo evento `storage`. Armazenamento bloqueado não impede a troca durante a sessão.

Os botões são gerados por `src/components/theme-toggle.js`, utilizados no cabeçalho compartilhado, no menu móvel e no cabeçalho compacto do catálogo. Possuem nome acessível, estado `aria-pressed`, texto e ícone, foco visível e área mínima de 44 px. Não navegam, não recarregam a página e não movem o foco nem a rolagem ao alternar. Sem JavaScript, o site continua claro e navegável, e controles inoperantes permanecem ocultos.

`color-scheme: only light` impede a alteração automática compatível do Chrome no tema claro; no tema escuro, `color-scheme: dark` anuncia o suporte explícito e controla os elementos nativos. O metadado `color-scheme` acompanha o estado e `theme-color` é lido do CSS, sem uma segunda paleta em JavaScript. Formulários, opções, autofill, seleção e scrollbar têm cores declaradas. Preferências de alto contraste (`forced-colors`) continuam respeitadas.

Referências: [Chrome: Auto Dark Theme](https://developer.chrome.com/blog/auto-dark-theme) e [MDN: color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme). Extensões que reescrevem CSS e configurações experimentais impostas pelo usuário não podem ser controladas universalmente por um site.

Não existe autenticação no projeto. Para uma futura integração de conta, estão disponíveis `FAGTheme.setPreference('light' | 'dark' | 'system')`, `FAGTheme.getPreference()` e o evento `fag:themechange`. Nenhum dado é enviado a um servidor pela preferência atual.

## Movimento e manutenção

A transição dura 240 ms, limita-se a propriedades visuais e não altera a tipografia nem a geometria. Os ícones mudam com opacidade e pequena rotação. `prefers-reduced-motion` e a opção existente de pausar movimento desabilitam as transições. O efeito glass e as animações existentes de entrada continuam nos componentes originais.

Para criar componentes, escolha tokens pelo papel e pelo fundo real; não use `--background` como cor de texto em um card escuro. Não adicione paletas em breakpoints nem regras de preferência do sistema em CSS de página. Ícones SVG de interface devem usar `currentColor` ou tokens. Estados importantes precisam continuar com texto/ícone, além da cor.

## Verificação

- `npm.cmd test`: testes existentes e regressões de preferência, falha de armazenamento, sincronização e auditoria de cores de produção.
- `npm.cmd run build:check`: consistência entre templates e páginas geradas.
- `tests/theme-check.py`: navegador Chromium, 22 rotas, dois temas e larguras de 320, 390, 768, 1024, 1366 e 1920 px; comparação dos tokens entre resoluções, overflow, persistência, teclado, foco, rolagem, menu móvel, armazenamento bloqueado e fallback sem JavaScript. Também verifica contexto mobile com toque, transição normal, redução de movimento e preservação da tipografia ao alternar.
- Capturas completas e estados interativos ficam em `tests/artifacts/themes/` (ignorado no Git). Formulários usam respostas simuladas, sem envio de mensagem.
- `tests/theme-contrast.js` identifica contraste de texto em superfícies compostas; fotografias e gradientes complexos exigem revisão visual complementar. Não constitui certificação automática de acessibilidade.

As larguras e preferências são emuladas no navegador de desktop. Não equivalem a testes físicos em Android, iOS ou Safari.
