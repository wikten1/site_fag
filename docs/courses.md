# Catálogo de cursos

A página `cursos.html` é gerada a partir de `src/pages/cursos.html`. O conteúdo permanece em `content/courses.json`, compartilhado com os cards da página inicial.

## Componentes e interação

- `src/components/courses.js`: o modo de catálogo reutiliza os cards, adicionando detalhes nativos (`details` / `summary`) e os identificadores históricos dos cursos.
- `assets/css/pages/catalog.css`: hero, filtros, composição EAD e adaptações da página; utiliza os tokens compartilhados e preserva o cabeçalho compacto. O rodapé é a variante editorial existente.
- `assets/js/pages/catalog.js`: busca por nome sem distinção de acentos ou maiúsculas, filtros combinados, contagens, estado vazio, limpeza e abertura de cursos pelos links da home.
- Sem JavaScript, todos os cursos e seus detalhes continuam acessíveis; os controles de busca são exibidos somente após sua inicialização.

## Limites do conteúdo confirmado

Os seis cursos disponíveis são presenciais. Há cinco identificados como “Curso técnico” e um como “Formação complementar”; a classificação Técnico não implica vinculação ao PRONATEC. Nenhum curso tem oferta EAD, situação de inscrição ou endereço de inscrição confirmado. Por isso, EAD retorna um estado vazio explicativo, e os cards não exibem badges de status ou botões de inscrição.

O endereço da Plataforma EAD e a página de inscrições/seleções ainda não existem no projeto. A página informa a indisponibilidade de acesso e direciona dúvidas para `contato.html`. Quando houver dados oficiais, atualizar a classificação no renderizador e os destinos no template, sem usar endereços provisórios.

## Verificação

- `npm.cmd run build` e `npm.cmd run build:check`.
- `npm.cmd test`: valida recursos, rotas, fragmentos, metadados e consistência dos cursos entre páginas.
- `python tests/courses-check.py`, com Playwright instalado e `FAG_TEST_CHROME` opcional: verifica busca, combinação de filtros, estados vazios, teclado, links diretos, larguras de 320 a 1440 px, texto a 200%, movimento reduzido e acesso sem JavaScript. Capturas ficam em `tests/artifacts/` (ignoradas pelo Git).
