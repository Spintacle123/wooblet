import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { bootstrap } from '../src/main.js';
import helmet from 'helmet';

test('Helmet default import sets the expected security headers', () => {
  const headers = new Map<string, string | number | readonly string[]>();
  let nextCalled = false;
  helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })(
    {} as any,
    { setHeader: (key: string, value: string) => headers.set(key.toLowerCase(), value), removeHeader() {} } as any,
    () => { nextCalled = true; },
  );
  assert.equal(nextCalled, true);
  assert.equal(headers.get('cross-origin-resource-policy'), 'cross-origin');
  assert.equal(headers.get('x-content-type-options'), 'nosniff');
});

test('API loads Helmet through a statically traceable runtime import', async () => {
  // Importing the entrypoint exercises its top-level Helmet load without starting MongoDB.
  assert.equal(typeof bootstrap, 'function');
  const source = await readFile(new URL('../src/main.ts', import.meta.url), 'utf8');
  assert.match(source, /import helmetImport,.*from 'helmet'/);
  assert.doesNotMatch(source, /createRequire/);
});
