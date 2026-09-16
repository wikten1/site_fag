# Inscrições e Seleções

A página `inscricoes-e-selecoes.html` usa o Design System FAG, o cabeçalho compartilhado e renderização estática. Edite `content/opportunities.json` e execute `npm run build`. O JSON começa vazio: nenhum edital, prazo ou canal de inscrição oficial foi fornecido para esta implementação. Exemplos sintéticos existem somente nos testes e não são publicados.

## Contrato de conteúdo

`items` é uma lista de oportunidades. `featuredId` é opcional e corresponde ao `slug` de uma oportunidade; se não definido, o primeiro processo ativo recebe destaque.

| Campo | Conteúdo |
| --- | --- |
| `slug`, `title` | Identificador único em minúsculas/hífens e título obrigatório |
| `type` | `course`, `program`, `project`, `selection`, `other` |
| `status` | `open`, `ongoing`, `result`, `closed`, `finished`, `upcoming` |
| `description`, `audience` | Contexto e público |
| `modality`, `location`, `vacancies` | Modalidade, local e quantidade inteira positiva de vagas |
| `startDate`, `endDate` | Datas reais em `AAAA-MM-DD` |
| `year` | Ano do histórico; se omitido, usa o ano de encerramento |
| `noticeNumber` | Identificação do edital/processo |
| `notice`, `result` | Objeto de documento: `label`, `url`, `format` e `size` opcionais |
| `documents` | Lista de documentos no mesmo formato |
| `application` | `url` oficial e/ou `instructions` operacionais em texto |
| `requirements`, `observations` | Texto simples para detalhes expandidos |
| `schedule` | Lista de etapas: `title`, `date`, `state` (`completed`, `current`, `future`) |

Campos sem conteúdo são omitidos. Textos são escapados, nunca interpretados como HTML. Resultados preliminares e finais podem ser cadastrados em `documents`; `result` indica o documento que deve receber o CTA principal. O cronograma deve ser atualizado editorialmente, pois a etapa atual não pode ser deduzida apenas de uma data de início.

## Publicação e prazos

O build rejeita inscrições abertas sem datas ou sem URL/instruções operacionais, resultados sem documento, datas inválidas, slugs duplicados e arquivos locais ausentes. URLs externas precisam usar HTTPS; links locais aceitam páginas HTML e PDFs em `assets/documents/`. O servidor entrega PDFs dessa pasta com o tipo correto. Antes de publicar, o responsável pelo conteúdo deve confirmar que o endereço externo é oficial e funciona: a validação de build verifica sua estrutura, não a disponibilidade remota.

Prazos usam dias do calendário de **America/Sao_Paulo**, inclusive o dia final. `open` só fica aberto entre as datas informadas. Nos últimos três dias recebe “Últimos dias”; após a data final, vai automaticamente para o histórico. `upcoming` exige atualização editorial para `open`. `ongoing` e `result` mantêm processos com etapas em curso na seção principal, mesmo após o fim das inscrições. `closed` e `finished` nunca exibem inscrição.

A apresentação pressupõe inscrições disponíveis durante todo o dia final. Se o edital definir encerramento em horário específico, não publique como `open` com esse modelo de datas: cadastre como `ongoing`, informe o horário exato nas observações e use o edital como ação até implementar timestamps com fuso.

O build calcula o estado inicial. No navegador, o mesmo modelo recalcula ao abrir a página, a cada mudança de dia e ao retornar à aba. Para manter o HTML sem JavaScript atualizado, agende um build diário quando houver processos datados e publique novamente sempre que alterar os dados.

## Interface e manutenção

- Busca sem distinção de acentos, status, tipo e ano combinam-se e filtram processos ativos e históricos. O contador é anunciado por tecnologias assistivas.
- Busca aparece com dois ou mais registros. Cada seletor só aparece quando há opções distintas. Sem JavaScript, todo o conteúdo permanece acessível e os controles de filtro ficam ocultos.
- Histórico agrupa por ano. Com mais de seis registros, usa `details` nativo; o ano mais recente e o atual ficam abertos.
- Há estados distintos para coleção vazia e busca sem resultados. Nenhum dado de demonstração é carregado na página pública.
- Os reveals seguem `780ms cubic-bezier(.22,1,.36,1)` e respeitam movimento reduzido e a pausa do cabeçalho.
- O menu compartilhado passa a recolher abaixo de 1120px para acomodar o novo destino.

Arquivos: template em `src/pages/inscricoes-e-selecoes.html`, composição em `src/components/opportunities.js`, modelo compartilhado em `assets/js/shared/opportunities-model.js`, interação em `assets/js/pages/opportunities.js` e estilos em `assets/css/pages/opportunities.css`.

Validação: `npm test`, `npm run build:check` e `python tests/opportunities-check.py`. Os testes de navegador usam até três exemplos sintéticos distintos, replicados somente para testar o volume do histórico. As capturas ficam em `tests/artifacts/`, fora do versionamento.
