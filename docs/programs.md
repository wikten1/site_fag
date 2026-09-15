# Programas e Projetos

A página `programas-e-projetos.html` reutiliza o cabeçalho e o rodapé editorial, os tokens, o container, o breadcrumb e os estilos dos cards de programas existentes. O template fica em `src/pages/programas-e-projetos.html`; CSS e movimento específicos ficam em `assets/css/pages/programs.css` e `assets/js/pages/programs.js`.

## Conteúdo

Edite `content/programs.json` e execute `npm run build`. `featuredId` escolhe qualquer registro para o destaque; os demais aparecem na listagem, sem duplicação. Remova o valor de `featuredId` para apresentar todos na listagem. A coleção vazia apresenta uma mensagem editorial, sem botões sem destino.

Cada registro contém `id`, `name`, `type`, `category`, `description`, `image` (caminho sem sufixo de tamanho), `imageAlt`, `width` e `height`. `objective`, `audience`, `imageNote` e `link` são opcionais. `imageFit: "contain"` preserva identidades visuais, como a marca PRONATEC. As imagens precisam de variantes locais `-640.webp` e `-1200.webp`. A renderização escapa o texto e valida IDs, dimensões, imagens e destinos locais.

Para adicionar um link, informe `link.href` (página local existente) e `link.label` (texto que descreve o destino). Sem link, o card permanece informativo. Para um destino externo futuro, amplie primeiro a validação do componente e valide a fonte. A notícia do Mulheres Mil é um registro de lançamento, sem indicação de inscrições abertas ou oferta atual.

O conteúdo inicial foi adaptado dos programas já apresentados na home e da notícia local do Mulheres Mil. O campo `source` registra a procedência editorial e não é exibido. As fotografias de apresentação são identificadas como ilustrativas. Os pilares descrevem a missão institucional, sem estatísticas ou resultados atribuídos a programas. Novas iniciativas só devem ser incluídas após validação do conteúdo. A home conserva sua apresentação resumida independente; revise-a quando houver mudanças institucionais nos programas.

## Verificação

```sh
npm run build:check
npm test
python tests/programs-check.py
```

O teste de navegador segue a configuração de Playwright descrita no README e verifica nove larguras, imagens, busca, menu, destinos, foco, movimento reduzido, pausa de animações, conteúdo sem JavaScript e coleções de 0, 2, 4, 8 e 15 programas. As capturas ficam em `tests/artifacts/`.
