'use strict';
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const nodemailer = require('nodemailer');

const ROOT = path.resolve(__dirname, '..');
const configuredPages = new Set(require('../config/pages').map(page => page.route));
const emailPattern = /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/;
const unavailable = { ok: false, code: 'unavailable' };
function validate(data) {
  const values = {}, errors = {};
  const limits = { name: 120, email: 254, phone: 50, subject: 160, message: 5000 };
  const required = { name: 'Informe seu nome.', email: 'Informe seu e-mail.', subject: 'Informe o assunto da mensagem.', message: 'Escreva sua mensagem.' };
  for (const [key, max] of Object.entries(limits)) {
    const value = data && typeof data[key] === 'string' ? data[key].trim() : '';
    values[key] = value;
    if (required[key] && !value) errors[key] = required[key];
    else if (value.length > max) errors[key] = `Use até ${max} caracteres.`;
    else if (key !== 'message' && /[\x00-\x1f\x7f]/.test(value)) errors[key] = 'Revise o texto deste campo.';
  }
  if (values.email && !emailPattern.test(values.email)) errors.email = 'Informe um endereço de e-mail válido.';
  return { values, errors };
}

function createMailer(env = process.env) {
  if (![env.SMTP_HOST, env.SMTP_USER, env.SMTP_PASS, env.MAIL_FROM, env.CONTACT_TO].every(Boolean)) return null;
  if (![env.MAIL_FROM, env.CONTACT_TO].every(value => emailPattern.test(value))) throw new Error('MAIL_FROM and CONTACT_TO must each contain one valid address.');
  const port = Number(env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid SMTP_PORT.');
  const secure = env.SMTP_SECURE === 'true' || port === 465;
  const transport = nodemailer.createTransport({
    host: env.SMTP_HOST, port, secure, requireTLS: !secure,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    tls: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
    disableFileAccess: true, disableUrlAccess: true
  });
  return smtpMailer(transport, env.MAIL_FROM, env.CONTACT_TO);
}

function smtpMailer(transport, from, to) {
  return {
    verify: () => transport.verify(),
    async send(values, id) {
      const result = await transport.sendMail({
        from: { name: 'FAG — Contato e Atendimento', address: from }, to,
        replyTo: { name: values.name, address: values.email },
        subject: `[Contato FAG] ${values.subject}`,
        messageId: `<${id}@${from.split('@')[1]}>`,
        text: `Nova mensagem pelo site da FAG\n\nNome: ${values.name}\nE-mail: ${values.email}\nTelefone: ${values.phone || 'Não informado'}\nAssunto: ${values.subject}\n\n${values.message}`,
        disableFileAccess: true, disableUrlAccess: true
      });
      if (!result.accepted?.some(address => address.toLowerCase() === to.toLowerCase())) throw new Error('SMTP recipient not accepted.');
    }
  };
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(data));
}
async function readJSON(req) {
  let length = 0;
  const chunks = [];
  for await (const chunk of req) {
    length += chunk.length;
    if (length > 24576) { const error = new Error('body-limit'); error.status = 413; throw error; }
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { const error = new Error('invalid-json'); error.status = 400; throw error; }
}

function createApp({ mailer = null, root = ROOT, origin = '', rateLimit = 5, windowMs = 600000 } = {}) {
  const rates = new Map();
  const submissions = new Map();
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon' };
  const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { return json(res, 400, { ok: false }); }
    if (pathname === '/api/contato') {
      if (req.method === 'GET') return json(res, 200, { available: Boolean(mailer) });
      if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return json(res, 405, { ok: false }); }
      const allowedOrigin = origin || `http://${req.headers.host}`;
      if (req.headers.origin !== allowedOrigin || req.headers['sec-fetch-site'] === 'cross-site') return json(res, 403, { ok: false });
      if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return json(res, 415, { ok: false });
      if (!mailer) return json(res, 503, unavailable);
      const now = Date.now();
      for (const [key, value] of rates) if (value.expires <= now) rates.delete(key);
      for (const [key, value] of submissions) if (value.expires <= now) submissions.delete(key);
      // Use the socket address, never an untrusted X-Forwarded-For header.
      const ip = req.socket.remoteAddress;
      let rate = rates.get(ip);
      if (!rate) {
        if (rates.size >= 10000) return json(res, 429, { ok: false });
        rate = { count: 0, expires: now + windowMs };
        rates.set(ip, rate);
      }
      if (rate.count >= rateLimit) { res.setHeader('Retry-After', String(Math.ceil((rate.expires - now) / 1000))); return json(res, 429, { ok: false }); }
      rate.count++;
      try {
        const data = await readJSON(req);
        const { values, errors } = validate(data);
        if (Object.keys(errors).length) return json(res, 422, { ok: false, errors });
        const id = req.headers['idempotency-key'] || '';
        if (!/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i.test(id)) return json(res, 400, { ok: false });
        const hash = createHash('sha256').update(JSON.stringify(values)).digest('hex');
        const existing = submissions.get(id);
        if (existing && existing.hash !== hash) return json(res, 409, { ok: false });
        if (!existing && submissions.size >= 2000) return json(res, 429, { ok: false });
        if (existing) await existing.promise;
        else {
          const promise = Promise.resolve().then(() => mailer.send(values, id));
          submissions.set(id, { hash, promise, expires: now + 900000 });
          try { await promise; }
          catch (error) { submissions.delete(id); throw error; }
        }
        // Success is only acknowledged after SMTP accepts the fixed recipient.
        return json(res, 200, { ok: true });
      } catch (error) {
        // Do not expose credentials, SMTP responses, or visitor data in logs.
        return json(res, error.status || 502, { ok: false, code: error.status ? 'invalid-request' : 'delivery-unconfirmed' });
      }
    }
    if (!['GET', 'HEAD'].includes(req.method)) return json(res, 405, { ok: false });
    const name = pathname === '/' ? 'index.html' : pathname.slice(1);
    const allowed = configuredPages.has(name) || /^(?:[^/\\]+\.html|noticias\/[^/\\]+\.html|sitemap\.xml|robots\.txt|assets\/(?:css|js|images|fonts)\/.+\.(?:css|js|png|jpe?g|webp|svg|woff2?|ico))$/i.test(name);
    if (!allowed || name.split(/[\/\\]/).some(part => part.startsWith('.'))) return json(res, 404, { ok: false });
    try {
      const filename = await fs.realpath(path.join(root, name));
      const relative = path.relative(await fs.realpath(root), filename);
      if (relative.startsWith('..') || path.isAbsolute(relative)) return json(res, 404, { ok: false });
      const bytes = await fs.readFile(filename);
      const etag = '"' + createHash('sha256').update(bytes).digest('base64url') + '"';
      const headers = { 'Content-Type': types[path.extname(filename).toLowerCase()], 'Cache-Control': 'no-cache', 'ETag': etag };
      if (req.headers['if-none-match']?.split(/\s*,\s*/).some(tag => tag === '*' || tag.replace(/^W\//, '') === etag)) {
        res.writeHead(304, headers);
        return res.end();
      }
      res.writeHead(name === '404.html' ? 404 : 200, { ...headers, 'Content-Length': bytes.length });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    } catch {
      if (name.endsWith('.html')) {
        try {
          const bytes = await fs.readFile(path.join(root, '404.html'));
          res.writeHead(404, { 'Content-Type': types['.html'], 'Content-Length': bytes.length, 'Cache-Control': 'no-cache' });
          return res.end(req.method === 'HEAD' ? undefined : bytes);
        } catch { /* A custom root may not provide an error page. */ }
      }
      json(res, 404, { ok: false });
    }
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;
  return server;
}

if (require.main === module) {
  const mailer = createMailer();
  if (process.argv.includes('--verify-mail')) {
    if (!mailer) { console.error('SMTP not configured. Complete .env using .env.example.'); process.exitCode = 1; }
    else mailer.verify().then(() => console.log('SMTP connection verified; no message sent.')).catch(() => { console.error('SMTP verification failed. Review the server configuration.'); process.exitCode = 1; });
  } else {
    const port = Number(process.env.PORT || 3000);
    const host = process.env.HOST || '127.0.0.1';
    if (process.env.NODE_ENV === 'production' && !process.env.PUBLIC_ORIGIN?.startsWith('https://')) throw new Error('Set PUBLIC_ORIGIN to the public HTTPS origin.');
    createApp({ mailer, origin: process.env.PUBLIC_ORIGIN || '' }).listen(port, host, () => {
      console.log(`FAG: http://${host}:${port}/contato.html`);
      console.log(mailer ? 'Contact SMTP configured.' : 'Contact sending unavailable until SMTP is configured.');
    });
  }
}
module.exports = { createApp, createMailer, smtpMailer, validate };
