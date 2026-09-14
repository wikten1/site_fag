# Contato e Atendimento

`contato.html` é a rota interna canônica. A seção 5.9 aponta para ela. O endereço foi migrado do conteúdo institucional já confirmado; a página antiga não é destino nem dependência desta experiência.

## Executar

Fonte da página: `src/pages/contato.html`. Estilos: `assets/css/pages/contact.css`. Comportamento: `assets/js/pages/contact.js`. Após alterar o template, execute `npm run build`.

Use Node.js 24 ou superior, `npm.cmd ci` e `npm.cmd start` no PowerShell (em outros shells, `npm ci` e `npm start`). Abra `http://127.0.0.1:3000/contato.html`.

A interface funciona em hospedagem estática, mas o envio requer o serviço `server/contact-server.js` na mesma origem, na rota `/api/contato`. Sem esse serviço ou sem configuração SMTP, o formulário informa indisponibilidade, preservando a localização e o mapa. Não há envio simulado ou dependência do WordPress antigo.

## Ativar o envio real

Copie `.env.example` para `.env` e preencha os dados fornecidos pela Fundação:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`;
- `MAIL_FROM`: endereço autorizado pelo provedor SMTP;
- `CONTACT_TO`: um único endereço institucional que receberá as mensagens;
- `PUBLIC_ORIGIN`: origem exata do site, sem barra final (HTTPS em produção).

O remetente e o destinatário são fixos no servidor. O e-mail do visitante é usado somente em `Reply-To`. Nenhuma credencial ou endereço não confirmado é publicado nos arquivos da interface. `npm.cmd run check:mail` verifica conexão e autenticação sem enviar e-mail. A configuração segue a [documentação SMTP do Nodemailer](https://nodemailer.com/smtp).

Em produção, execute o serviço atrás de HTTPS, configure `NODE_ENV=production` e encaminhe `/api/contato` ao Node preservando a origem. A limitação de 5 tentativas por 10 minutos usa o IP do socket; atrás de proxy ela será compartilhada pelos visitantes. Configure a limitação por visitante no proxy antes de ajustar esse limite no serviço. Não confiar em `X-Forwarded-For` enviado livremente pelo cliente.

Não foi definido um endereço destinatário nem uma conta SMTP nesta entrega. Nenhuma mensagem foi enviada a canais reais durante os testes.

## Comportamento

- Nome, e-mail, assunto e mensagem obrigatórios; telefone opcional, sem máscara rígida.
- Validação no navegador e no servidor; erros ligados aos campos; resumo anunciado e foco no primeiro erro.
- Feedback de carregamento; bloqueio de envios concorrentes; mensagem preservada em falha.
- Sucesso somente quando o servidor SMTP aceita o destinatário institucional. Isso confirma o encaminhamento, não a leitura nem a entrega final na caixa postal.
- Repetições da mesma solicitação usam uma chave de idempotência, mantida por 15 minutos em memória. Reiniciar o serviço limpa essa proteção. Não há repetição automática após timeout; uma queda de conexão depois da aceitação SMTP pode deixar o resultado incerto.
- Limite de corpo de 24 KiB, limite de tentativas, origem verificada, destinatário fixo, texto simples e acesso a arquivos/URLs desativado no transporte.
- Nenhuma mensagem ou dado pessoal fica em logs, localStorage ou no repositório. O destino de armazenamento das mensagens é a conta de e-mail institucional configurada.

O mapa usa a busca pelo endereço textual, sem coordenadas inventadas, e depende do Google Maps. O endereço em HTML e o link externo permanecem disponíveis como alternativa.

## Verificar

`npm.cmd test` executa a regressão editorial e os testes da API/SMTP local. `python tests/contact-check.py` usa Playwright para verificar navegação, reflow, teclado e estados do formulário com respostas de teste interceptadas; esses testes de interface não enviam e-mail. Os testes de SMTP usam exclusivamente um servidor efêmero em loopback.
