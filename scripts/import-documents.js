'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const data = require('../content/documents.json');
const root = path.resolve(__dirname, '..');

async function main() {
  await fs.mkdir(path.join(root, 'assets/documents'), { recursive: true });
  const records = [];
  for (const item of data.items) {
    const source = new URL(item.source, 'https://fag.tangua.rj.gov.br/wp-content/uploads/');
    const response = await fetch(source, { signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error(`${item.id}: HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.subarray(0, 5).toString() !== '%PDF-') throw new Error(`${item.id}: not a PDF`);
    await fs.writeFile(path.join(root, 'assets/documents', item.file), bytes);
    records.push({ id: item.id, source: source.href, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
    console.log(`${item.id}: ${bytes.length} bytes`);
  }
  await fs.writeFile(path.join(root, 'content/documents-provenance.json'), JSON.stringify({ checkedAt: data.checkedAt, records }, null, 2) + '\n');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
