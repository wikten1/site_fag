'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const net = require('node:net');
const { once } = require('node:events');
const { randomUUID } = require('node:crypto');
const nodemailer = require('nodemailer');
const { createApp, createMailer, smtpMailer } = require('../server/contact-server');
const sample = { name: 'Teste de integração', email: 'visitante@example.test', phone: '+351 912 345 678 ext. 2', subject: 'Informação sobre curso', message: 'Mensagem sintética de teste, sem dados de visitantes.' };

async function start(t, options = {}) {
  const server = createApp(options);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); return new Promise(resolve => server.close(resolve)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  return {
    base,
    post: (body = sample, headers = {}) => fetch(base + '/api/contato', {
      method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json', 'Idempotency-Key': randomUUID(), ...headers }, body: JSON.stringify(body)
    })
  };
}

async function smtpStub(t, reject = false) {
  const messages = [], recipients = [], sockets = new Set();
  const server = net.createServer(socket => {
    sockets.add(socket); socket.on('close', () => sockets.delete(socket));
    let buffer = '', data = false, lines = [];
    socket.write('220 localhost test SMTP\r\n');
    socket.on('data', chunk => {
      buffer += chunk.toString();
      let end;
      while ((end = buffer.indexOf('\r\n')) >= 0) {
        const line = buffer.slice(0, end); buffer = buffer.slice(end + 2);
        if (data) {
          if (line === '.') { data = false; messages.push(lines.join('\n')); lines = []; socket.write('250 Accepted by local test sink\r\n'); }
          else lines.push(line);
        } else if (/^(EHLO|HELO)/.test(line)) socket.write('250-localhost\r\n250 SIZE 25000\r\n');
        else if (/^RCPT TO:/.test(line)) { recipients.push(line); socket.write(reject ? '550 Recipient rejected\r\n' : '250 OK\r\n'); }
        else if (line === 'DATA') { data = true; socket.write('354 Send data\r\n'); }
        else if (line === 'QUIT') socket.end('221 Bye\r\n');
        else socket.write('250 OK\r\n');
      }
    });
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => { sockets.forEach(socket => socket.destroy()); return new Promise(resolve => server.close(resolve)); });
  // This plaintext transport is test-only and can only reach the local test sink.
  const transport = nodemailer.createTransport({ host: '127.0.0.1', port: server.address().port, secure: false, ignoreTLS: true });
  return { mailer: smtpMailer(transport, 'site@example.test', 'fundacao@example.test'), messages, recipients };
}

test('unconfigured service never acknowledges success; private files inaccessible', async t => {
  assert.equal(createMailer({}), null);
  const app = await start(t);
  assert.deepEqual(await (await fetch(app.base + '/api/contato')).json(), { available: false });
  assert.equal((await app.post()).status, 503);
  for (const name of ['.env', 'package.json', 'server/contact-server.js', '.git/config', 'assets/../.env']) assert.equal((await fetch(app.base + '/' + name)).status, 404);
  const page = await fetch(app.base + '/contato.html');
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Contato e Atendimento/);
});

test('validation, origin, content type, body limits and method checks precede sending', async t => {
  let sent = 0;
  const app = await start(t, { mailer: { send: async () => { sent++; } }, rateLimit: 30 });
  const bad = await app.post({ ...sample, name: ' ', email: 'x\r\nBcc: a@b.test', message: '' });
  assert.equal(bad.status, 422);
  assert.deepEqual(Object.keys((await bad.json()).errors).sort(), ['email', 'message', 'name']);
  assert.equal((await app.post(sample, { Origin: 'https://unrelated.example' })).status, 403);
  assert.equal((await app.post(sample, { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await fetch(app.base + '/api/contato', { method: 'DELETE' })).status, 405);
  const large = await app.post({ ...sample, message: 'x'.repeat(26000) });
  assert.equal(large.status, 413);
  assert.equal((await app.post({ ...sample, subject: 'x'.repeat(161) })).status, 422);
  assert.equal((await app.post(sample, { 'Idempotency-Key': 'invalid' })).status, 400);
  assert.equal(sent, 0);
});

test('actual loopback SMTP accepts only fixed recipient; concurrent retries send once', async t => {
  const sink = await smtpStub(t);
  const app = await start(t, { mailer: sink.mailer, rateLimit: 30 });
  const headers = { 'Idempotency-Key': randomUUID() };
  const results = await Promise.all([app.post({ ...sample, to: 'intruder@example.test' }, headers), app.post(sample, headers)]);
  for (const result of results) { assert.equal(result.status, 200); assert.deepEqual(await result.json(), { ok: true }); }
  assert.equal(sink.messages.length, 1);
  assert.equal(sink.recipients.length, 1);
  assert.match(sink.recipients[0], /fundacao@example\.test/);
  assert.match(sink.messages[0].replace(/\n[ \t]+/g, ' '), /Reply-To:.*visitante@example\.test/);
  assert.match(sink.messages[0], /From:.*site@example\.test/);
  assert.equal((await app.post({ ...sample, message: 'Changed payload' }, headers)).status, 409);
  assert.equal((await app.post({ ...sample, phone: '' })).status, 200);
});

test('SMTP rejection is an error, never a success response', async t => {
  const sink = await smtpStub(t, true);
  const app = await start(t, { mailer: sink.mailer });
  const result = await app.post();
  assert.equal(result.status, 502);
  assert.deepEqual(await result.json(), { ok: false, code: 'delivery-unconfirmed' });
  assert.equal(sink.messages.length, 0);
});

test('rate limit blocks additional attempts', async t => {
  let sent = 0;
  const app = await start(t, { mailer: { send: async () => { sent++; } }, rateLimit: 2 });
  assert.equal((await app.post()).status, 200);
  assert.equal((await app.post()).status, 200);
  const limited = await app.post();
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get('retry-after')) > 0);
  assert.equal(sent, 2);
});
