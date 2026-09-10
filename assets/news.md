# Notícias recentes — módulo 5.7

`index.html` contém a seção; `news.css` cuida da apresentação e `news.js` seleciona e renderiza as prévias. `news-data.js` é o cadastro editorial inicial, separado dos cursos. Funciona também ao abrir o HTML diretamente, sem servidor.

## Publicação

Cadastre cada matéria uma única vez em `window.FAG_NEWS_DATA.items`, em `news-data.js`. Não é necessário editar o HTML nem criar cards. O cadastro pode crescer; a home exibe no máximo quatro registros. Não há painel administrativo/backend neste projeto estático.

Um CMS pode gerar esse arquivo ou fornecer JSON `{ "items": [...] }` pelo atributo `data-source="/api/noticias-home"` da seção. Nesse caso, o endpoint é a fonte autoritativa e deve retornar até quatro prévias já selecionadas, incluindo o destaque quando houver. Também se aceita um conjunto maior: a seleção local aplica as mesmas regras. Para centenas de matérias, mantenha ordenação/seleção no servidor, com índice de publicação, e paginação no arquivo. Não envie o conteúdo integral das matérias à home. O adaptador `window.FAGNews.render(items)` permite atualizações pelo aplicativo sem manipular o layout.

Campos de cada registro:

| Campo | Contrato |
| --- | --- |
| `id` | String única e estável |
| `type` | `news`; cursos, editais e programas são excluídos |
| `status` | `published`; rascunhos são excluídos |
| `publishedAt` | Data original de publicação `YYYY-MM-DD`; datas futuras/inválidas são excluídas |
| `featured` | Booleano opcional; se vários estiverem marcados, prevalece o mais recente |
| `category` | Nome editorial administrável, sem cores ou layout vinculados ao nome |
| `title`, `excerpt` | Texto simples; título obrigatório, resumo opcional |
| `url` | Destino real da matéria; URLs executáveis são rejeitadas |
| `fallback` | `science`, `community` ou `education`; independente da categoria |
| `image` | Objeto opcional; use `null` quando não houver fotografia apropriada |

A imagem aceita `src`, `sources: [{src, width}]`, `width`, `height`, `alt`, `kind` (`event`, `institutional`, `illustration`), `caption`, `credit` e `sourceUrl`. Fotografia precisa de alt contextual. Fallbacks são decorativos (`alt=""`) e recebem legenda visível “Ilustração institucional”. Créditos não conhecidos permanecem vazios, sem atribuição inventada. Legenda e crédito ficam em HTML. Falha de imagem própria aciona o fallback; falha do fallback preserva o espaço e informa indisponibilidade.

## Seleção e estados

- Ordem decrescente por publicação; desempate por ID. Sem duplicação de ID ou destino.
- Havendo destaque: um destaque e até três outras matérias mais recentes.
- Sem destaque: até quatro matérias recentes em grid uniforme.
- Uma, duas ou três matérias: redistribuição automática sem espaços vazios.
- Nenhuma matéria: mensagem institucional. Falha do endpoint: mensagem própria e acesso ao arquivo, sem apresentar dados antigos silenciosamente.
- Sem JavaScript: mensagem com acesso ao arquivo oficial.
- Desktop com destaque: grade de 12 colunas (7 + 5); tablet: duas colunas com destaque acima; mobile: uma coluna, sem carrossel.

## Conteúdo e destinos iniciais

As quatro prévias foram sintetizadas a partir das publicações do portal oficial, preservando as datas originais. As categorias são a classificação editorial deste novo cadastro. Não foram importados os cursos e anúncios presentes no arquivo antigo.

- [Fórum de Inovação Agrícola, 13/03/2025](https://fag.tangua.rj.gov.br/2025/03/13/1o-forum-de-tecnologias-agricolas-em-tangua-inovacao-e-desenvolvimento-para-o-futuro/) — fotografia real da galeria da matéria, origem preservada em `image.sourceUrl`.
- [Cooperação com o MAST, 21/03/2025](https://fag.tangua.rj.gov.br/2025/03/21/tangua-se-prepara-para-um-novo-salto-cientifico-com-parceria-estrategica/) — fallback de ciência.
- [Entrevista sobre desenvolvimento local, 18/02/2025](https://fag.tangua.rj.gov.br/2025/02/18/inovacao-e-desenvolvimento-local/) — fallback de comunidade.
- [Acesso e oportunidade, 12/02/2025](https://fag.tangua.rj.gov.br/2025/02/12/acesso-e-oportunidade/) — fallback de educação.

O CTA leva ao [arquivo oficial existente](https://fag.tangua.rj.gov.br/category/noticias/), e os cards às matérias existentes. O arquivo antigo possui sua própria organização; seu redesenho e as páginas individuais não fazem parte desta implementação. Não há sincronização automática com o WordPress antigo: isso depende de um endpoint editorial ou da geração do cadastro pelo CMS.

## Imagens e acessibilidade

Os PNGs fornecidos permanecem intactos; derivados WebP têm larguras de 400, 800 e 1200 px. A fotografia original tem 1024 px e não é ampliada. `srcset`, `sizes`, dimensões, lazy loading e reserva de proporção reduzem carga e deslocamentos. Não há títulos sobrepostos às fotos.

Cada card tem um único link, nomeado pelo título, com foco externo ao recorte. Datas usam `time` e descrição por extenso. Títulos permanecem integrais; apenas resumos são limitados. Entradas usam 90 ms de intervalo e respeitam tanto `prefers-reduced-motion` quanto o controle de pausa já existente na home. Conteúdo continua visível se a API de animação/observação estiver indisponível.

## Verificação

`python tests/news-check.py` executa as regressões em navegador headless. Requer o pacote Python `playwright` e Chrome instalado (ou Chromium instalado pelo Playwright em outros sistemas). A opção `--screenshots` salva capturas desktop/mobile na pasta `tests`.

Verificados: oito larguras de 320 a 1440 px; ordenação e limite com 100 registros; duplicatas; múltiplos destaques; datas inválidas/futuras; exclusão de cursos/rascunhos; conjuntos de zero a quatro notícias; navegação por Tab; nomes dos links e foco; fallback de fotografia quebrada; feed populado, vazio, inválido e indisponível; movimento reduzido e navegação sem JavaScript. Sem erros de JavaScript durante a execução. O teste de overflow compara com a página sem o módulo para não atribuir à seção o transbordamento preexistente da decoração `.foundation-atmosphere` no tablet.

Contrastes calculados: texto principal ≥ 15,09:1; texto secundário ≥ 4,93:1; verde institucional ≥ 5,67:1 nas duas superfícies claras. As capturas desktop/mobile foram inspecionadas visualmente. As verificações automatizadas não substituem uma auditoria completa com leitores de tela.
