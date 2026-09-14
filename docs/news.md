# Notícias — arquivo e experiência de leitura

## Rotas do redesign

- `noticias.html`: arquivo editorial oficial, destino do menu e CTA da home.
- `noticias/pagina-N.html`: páginas seguintes do acervo.
- `noticias/SLUG.html`: matéria individual, com breadcrumb, título original, data, categoria, imagem, conteúdo, galeria quando disponível e notícias relacionadas.
- `404.html`: estado de endereço indisponível, com retorno para o novo arquivo. Configure a hospedagem para servi-lo como documento de erro com HTTP 404; a configuração do servidor não pertence a este repositório estático.

A interface antiga não é destino de cards, menus, breadcrumbs ou recomendações. URLs antigas ficam somente na proveniência dos registros de migração. Links externos presentes no texto original (YouTube, Cecierj, redes sociais e arquivos de vídeo) foram preservados como referências da própria matéria.

## Uma origem editorial

O cabeçalho vem de `src/components/header.html` e `src/components/header.js`, compartilhados pela home, contato e notícias. Edite seus estilos em `assets/css/components/header.css` e seu comportamento em `assets/js/components/header.js`. O build não extrai mais marcação ou CSS da home. A preferência de movimento permanece compartilhada entre páginas.

Edite **`content/news.json`** e execute:

```sh
node scripts/build-news.js
```

Esse comando executa o build completo, sem pacotes adicionais ou acesso à rede: páginas institucionais, arquivo, artigos e `assets/js/data/news.js`, contendo apenas as quatro prévias da home. Não edite esses arquivos gerados manualmente. O layout e os componentes ficam em `src/`, `scripts/build-news.js`, `assets/js/shared/news-model.js`, `assets/css/components/news.css` e `assets/css/pages/editorial.css`.

`assets/js/shared/news-model.js` fornece o mesmo componente de card e as mesmas regras de validação/seleção ao gerador e à home. Não há três cadastros de notícia: as saídas HTML são artefatos gerados a partir de uma única fonte. Um CMS futuro deve exportar esse contrato e executar o build no processo de publicação. Não há backend administrativo nem sincronização automática com o WordPress antigo.

O arquivo usa paginação nativa com seis cards por página e um destaque adicional opcional na primeira página. Só os HTMLs e imagens visitados são carregados; não é baixado todo o histórico nem o texto de outras matérias. Breadcrumbs, paginação, menu mobile e leitura funcionam sem JavaScript. O carregamento é o nativo do navegador, sem estado artificial de espera. O HTML é entregue já preenchido, eliminando a dependência de requisições de feed em tempo de navegação. A home mantém mensagem de erro se seu feed local não carregar.

As categorias reais recuperadas são `notícias` e, em alguns casos, a categoria genérica `Uncategorized`. A apresentação normaliza a capitalização para **Notícias** e omite o marcador sem classificação. Não foram criadas categorias públicas de Educação/Eventos/Ciência. Com nove matérias e uma categoria útil, não há filtros nem busca específicos; portanto, não há estados vazios de filtros inexistentes.

## Contrato de publicação

| Campo | Conteúdo |
| --- | --- |
| `id`, `slug` | Identificadores únicos, minúsculos, com letras ASCII, números e hífens |
| `type`, `status` | Apenas `news` + `published` entram nas páginas |
| `publishedAt` | Data original `YYYY-MM-DD`, sem substituir pela data da migração |
| `title`, `category` | Texto editorial original; obrigatórios |
| `excerpt` | Prévia curta; na migração, trecho literal do primeiro parágrafo substantivo |
| `subtitle` | Linha fina opcional, se fornecida pelo conteúdo |
| `featured` | Booleano opcional; entre vários, prevalece o mais recente |
| `topics` | Relações factuais de assunto/projeto, usadas nas recomendações |
| `image`, `gallery` | Imagem principal opcional e imagens complementares |
| `blocks` | Parágrafos, H2/H3, listas e citações, em blocos estruturados |
| `sourceUrl`, `sourceId` | Proveniência da migração; não exibida como navegação |

Um bloco usa `{"type":"p","runs":[{"text":"Texto original","href":"https://destino-opcional"}]}`. Texto e atributos são escapados; não se injeta HTML arbitrário. Tipos permitidos: `p`, `h2`, `h3`, `li`, `blockquote`. Links para notícias migradas são reescritos para a nova rota.

Imagem: `src`, `sources: [{src,width}]`, `width`, `height`, `kind`, `alt`, `caption`, `credit`, `sourceUrl`. Fotografia documental precisa de alt contextual. `kind: institutional` preserva integralmente as composições históricas fornecidas pela instituição, sem cortar seus registros. Fallbacks ilustrativos têm `alt=""` e legenda explícita. Imagens que falham recebem fallback local; uma segunda falha informa indisponibilidade sem quebrar o espaço reservado.

As imagens possuem versões WebP proporcionais, limitadas à resolução original, `srcset`, `sizes` e dimensões. A imagem principal da matéria/destaque carrega prioritariamente; demais fotos e galerias usam lazy loading. Vídeos históricos são links opcionais, evitando carregamento pesado e reprodução automática.

## Regras editoriais

- Mais recentes primeiro; desempate estável por ID.
- IDs e slugs duplicados, datas inválidas, cursos, rascunhos e publicações futuras são excluídos ou rejeitados no build.
- Destaque não reaparece no grid; ao desmarcá-lo, retorna à posição cronológica.
- Relacionadas: até três matérias com assuntos compartilhados, por quantidade de relações e depois por data. Sem relações, a seção é omitida; não há preenchimento aleatório.
- Acervo vazio gera mensagem institucional; poucas notícias nunca criam cards vazios.
- O manifesto `content/news-generated.json` permite remover apenas páginas antigas que tenham sido geradas pelo sistema quando uma publicação sair do acervo. Caminhos são validados e arquivos sem a assinatura do gerador não são removidos.
- Execute novamente o build ao chegar a data de uma publicação programada; a hospedagem estática não executa agendamentos sozinha.

## Migração inicial

Foram incorporadas nove matérias jornalísticas de 2024 e 2025: visita do MAST; Fórum de Inovação Agrícola; entrevista sobre desenvolvimento local; Acesso e oportunidade; Impacto do Pré-Vestibular Social; lançamento do Mulheres Mil; cooperação FAG/IFF; novas instalações da FAETEC; capacitação dos servidores.

Títulos, datas e texto foram preservados. Não foram corrigidas silenciosamente inconsistências do texto histórico nem atualizados prazos de inscrição antigos. Três subtítulos do fórum foram promovidos a H2 sem mudança de redação. As nove fotografias complementares da galeria foram mantidas. Composições gráficas históricas com registro fotográfico foram preservadas e identificadas; os dois posts de pré-vestibular sem foto própria adequada usam o fallback institucional.

`scripts/migrate-news.py` documenta a importação inicial dos IDs revisados a partir de um export da API pública. Requer Pillow e curl. **Não é o comando de publicação cotidiana**: executá-lo novamente substitui o cadastro pelos registros da migração. `scripts/news-photo-review.json` registra a revisão visual das imagens e seus textos alternativos.

A especificação completa “6. Páginas internas → Notícias” não estava nos arquivos disponíveis. A implementação segue os requisitos correspondentes fornecidos na solicitação, o `design_system.html` e os componentes existentes na home.

## Verificação

```sh
node scripts/build-news.js --check
node tests/news-model.test.js
python tests/news-check.py
python tests/news-header-check.py
```

O teste de navegador requer Playwright Python e Chrome. `--screenshots` gera capturas na pasta `tests`. Cobertura: modelo com 200 matérias/34 páginas, paginação sem perdas ou duplicações, títulos/datas/textos das nove páginas, links internos, imagens, home, teclado, foco, menu mobile, seis larguras de 320 a 1440 px, texto a 200%, movimento reduzido, fallback e leitura/paginação sem JavaScript. Os pares de texto e superfícies claros mantêm os contrastes AA do módulo anterior.
