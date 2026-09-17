# Transparência

A página `transparencia.html` é gerada a partir de `src/pages/transparencia.html`.
Segue os tokens de `docs/design_system.html`, com cabeçalho e rodapé compartilhados.

## Acervo

Os 20 arquivos públicos foram recuperados de https://fag.tangua.rj.gov.br/editais/
em 17/09/2026. Os PDFs originais são servidos em `assets/documents/`, sem alteração
de conteúdo ou redirecionamento para o site anterior. `content/documents-provenance.json`
registra URL de origem, tamanho e SHA-256 de cada arquivo para rastreabilidade.

Os nomes e metadados ficam em `content/documents.json`. O build verifica a existência
e a assinatura PDF dos arquivos, gera a listagem inicial e publica somente os campos
necessários à consulta em `assets/data/documents.json`.

### Conferência editorial

- A origem apresenta “Edital 04/2026 – Profissionais FAG/PRONATEC” com a mesma URL
  do Edital 05/2026. Foi incorporado apenas o arquivo efetivamente disponível,
  identificado pelo título da primeira página: Mulheres Inspirando Mulheres.
  O documento 04/2026 depende da disponibilização do arquivo correto.
- “Mulheres Mil – Alunas – 02.24” aponta para um PDF identificado internamente como
  Edital 01/24. A central usa **01/2024** e preserva o arquivo original.
- Datas de publicação foram transcritas dos cabeçalhos do Diário Oficial.
  A data do Edital 05/2026 vem do cronograma de divulgação reiterado na errata.
  Datas de assinatura não foram tratadas automaticamente como publicação;
  os cinco registros sem confirmação exibem “Não informada”.
- O ano representa o documento/publicação, não necessariamente o edital relacionado.
  Por isso, resultados e erratas de 2026 referentes ao edital 04/2025 estão em 2026.
- “Encerrado” foi usado apenas nos editais 02/2025 e 03/2025, assim identificados
  pela página de origem. “Publicado” registra disponibilidade, sem afirmar vigência.
- Nenhum processo foi classificado como atualmente vigente. A seção “Em andamento”
  permanece oculta. Prazo de inscrição passado, isoladamente, não encerra o processo.

## Atualização

1. Adicione o PDF oficial em `assets/documents/`, com nome ASCII descritivo.
2. Cadastre `id`, `type` (`edital`, `portaria`, `publicacao`), `number` (ou `null`),
   `year`, `date` ISO (ou `null`), `title`, `summary`, `status`, `file` e `source`.
3. Atualize a proveniência com o hash do arquivo, sua origem e data da conferência.
4. Execute `npm run build`, `npm run build:check` e `npm test`.

Para status `vigente` ou `andamento`, informe `validFrom`, `validUntil` e `statusSource`
com a evidência oficial do período. A interface verifica o dia civil em São Paulo;
fora desse intervalo mostra apenas “Publicado”, sem presumir encerramento.
Os demais status aceitos são `publicado`, `encerrado` e `arquivado`.

`scripts/import-documents.js` é uma ferramenta manual de migração e refaz o download
dos arquivos definidos no catálogo. Não roda no build e não faz sincronização automática.
`scripts/document-previews.py` usa PyMuPDF para rasterizar as capas reais utilizadas
no hero; os PNGs já estão versionados e o build não depende de Python.

## Consulta

Busca sem distinção de acentos, filtros combinados por tipo/ano/status, três ordens e
oito registros por página. A URL preserva `q`, `tipo`, `ano`, `status`, `ordem` e `pagina`.
Voltar/avançar restaura os filtros. Atalhos de categoria e histórico iniciam uma nova
consulta. As opções são derivadas exclusivamente dos dados publicados.

No celular, a tabela mantém os dados em cartões e os filtros abrem em um painel.
Mensagens de resultado são anunciadas, PDFs identificam a nova aba e as animações
respeitam a preferência do dispositivo e o controle global de pausa.

Sem JavaScript, todos os arquivos continuam disponíveis no HTML. Durante falhas de
carregamento, a listagem inicial permanece acessível e a busca pode ser tentada novamente.
A impressão com JavaScript inclui todos os resultados da consulta atual.

## Verificação visual

`python tests/transparency-check.py` utiliza Playwright e o servidor do projeto.
Configure `FAG_TEST_CHROME` para usar um Chrome instalado. O teste cobre 320–1920px,
busca, filtros, paginação, histórico do navegador, PDFs locais, erros, retomada,
vigência condicional e navegação sem JavaScript. Capturas ficam em `tests/artifacts/`.
