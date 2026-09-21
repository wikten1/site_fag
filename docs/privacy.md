# LGPD e Política de Privacidade

Rota: `politica-de-privacidade.html`. Edite `src/pages/politica-de-privacidade.html`, nunca a saída gerada. Estilos e comportamento em `assets/css/pages/privacy.css` e `assets/js/pages/privacy.js`. Cabeçalho, rodapé, fontes, tokens e breadcrumb são compartilhados.

## Fonte e integridade editorial

Conteúdo consultado em 18/09/2026 na [Política de Privacidade publicada pela FAG](https://fag.tangua.rj.gov.br/politica-de-privacidade/). Essa é a data da consulta, **não** uma data de revisão jurídica. A fonte não informa versão ou data de atualização da política, encarregado ou PDF próprio; esses dados não foram inventados nem exibidos.

Os parágrafos institucionais foram preservados. Títulos de navegação, texto de orientação e composição gráfica foram acrescentados para facilitar a leitura. Cookies foi deslocado de “Formas de Coleta” para uma seção própria, com identificação da origem; “Segurança Local do Dispositivo” foi agrupado com proteção. Termos de Uso, missão legal e segurança local usam detalhes expansíveis. A lista de seis direitos repete somente categorias presentes na fonte, sem acrescentar definições jurídicas. Telefone e e-mail provêm do parágrafo “Dúvidas e Requisições”; não são apresentados como contato de um encarregado.

Não há dependência de consulta ao site antigo em runtime. As referências públicas são Planalto e ANPD. Os links internos apontam para a nova arquitetura. A fonte antiga é registrada apenas nesta documentação de manutenção.

## Cookies e conteúdo futuro

A menção institucional a cookies foi preservada como trecho da política original. Ela não é um inventário técnico do novo site. Não foi criado gerenciador fictício, banner de consentimento ou categoria de cookies. Antes de publicar alterações jurídicas, a instituição deve conferir esse trecho com as tecnologias efetivamente adotadas. O cabeçalho compartilhado já armazena uma preferência de animação em sessionStorage; esta página não introduz cookies, analytics ou armazenamento adicional.

Quando houver documento oficial, encarregado ou data jurídica confirmada, acrescentar essas informações a partir da fonte aprovada. Não usar a data de build nem o timestamp técnico do CMS como data jurídica. Não criar arquivo PDF sintético apresentado como documento oficial.

## Comportamento e verificação

Índice lateral sticky; índice expansível até 820px; âncoras com compensação do cabeçalho; foco encaminhado à seção no clique; indicador ativo e barra discreta atualizados em requestAnimationFrame com eventos passivos. Entradas usam IntersectionObserver, animação inicial finita e preferências de movimento do sistema e cabeçalho. Sem JS, índice e texto continuam disponíveis. Impressão abre trechos complementares e restaura seu estado ao terminar.

Execute `npm run build`, `npm run build:check`, `npm test` e `python tests/privacy-check.py` (Playwright conforme `tests/requirements.txt`). Capturas são salvas em `tests/artifacts/`.
