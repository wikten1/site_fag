# Conteúdo Online

Rota publicada: `conteudo-online.html`. Template: `src/pages/conteudo-online.html`.
Os cards são renderizados em HTML no build, sem depender de JavaScript.

## Inventário e verificação — 17/09/2026

- **Biblioteca Digital:** o portal da FAG divulga o Portal de Livros Abertos da USP em sua [publicação Biblioteca Digital, reproduzida no arquivo](https://fag.tangua.rj.gov.br/author/bryanna/page/2/). [Destino oficial](https://www.livrosabertos.abcd.usp.br/portaldelivrosUSP) verificado com HTTP 200 e título correspondente.
- **Plataforma EAD:** o link da [página Cursos da FAG](https://fag.tangua.rj.gov.br/cursos/) aponta para `https://ead.tangua.rj.gov.br/login/index.php`. A consulta direta expirou. A URL está preservada no inventário, mas não é publicada como ação até nova verificação. O card exibe “Temporariamente indisponível” e oferece atendimento interno. Essa falha de consulta não confirma manutenção do sistema.
- **Senac EAD:** [divulgado pela FAG](https://fag.tangua.rj.gov.br/2024/04/04/75-cursos-gratuitos/); o [Programa Senac de Gratuidade](https://www.ead.senac.br/gratuito/) foi consultado. O texto não reproduz o número histórico de cursos nem promete inscrições abertas.

As fontes do portal anterior ficam apenas neste registro e no inventário. Não são destinos de navegação da página publicada.

## Manutenção

Editar `content/online.json` e executar `npm run build`. Cada recurso contém `id` único, nome, categoria, responsável, descrição, informação complementar, destino, CTA, ícone e nível (`primary` ou `complementary`). Novos recursos devem ter fonte oficial e destino verificado. Recursos principais usam grade responsiva; recursos complementares usam cards compactos, com composição horizontal quando há apenas um item.

Estados aceitos em `status`:

- `available`: publica a ação para o destino confirmado.
- `new`: acrescenta o badge textual “Novo”.
- `unavailable`: publica “Temporariamente indisponível” e atendimento, sem link ao destino.
- `maintenance`: publica “Em manutenção” e atendimento, sem link ao destino.

Para reativar a EAD, confirmar o funcionamento da URL, alterar seu estado para `available` e atualizar a data e a nota de verificação. O card passa a mostrar a ação externa e a indicação de nova aba automaticamente.

Os destinos externos recebem `target="_blank"`, `rel="noopener noreferrer"`, indicação textual e nome acessível. URLs absolutas para páginas do portal substituído são rejeitadas. Destinos internos devem usar rotas `.html` do novo site; a suíte de testes confere sua existência.

Não há busca nem filtros específicos: o inventário atual tem três recursos. Perguntas frequentes usam `details` nativo. Animações são opcionais, respeitam movimento reduzido e a opção global “Pausar animações”.
