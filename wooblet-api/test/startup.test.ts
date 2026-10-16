import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

function importEntrypoint(vercel: string) {
  const env = { ...process.env, VERCEL: vercel };
  delete env.MONGODB_URI;
  return spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', "const { default: handler } = await import('./src/main.ts'); if (typeof handler !== 'function') throw new Error('Missing HTTP handler'); console.log('import completed');"], { cwd: new URL('..', import.meta.url), env, encoding: 'utf8', timeout: 15000 });
}

test('Vercel imports expose a callable handler without starting the database', () => {
  const result = importEntrypoint('1');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /import completed/);
});

test('non-Vercel imports remain side-effect free for test harnesses', () => {
  const result = importEntrypoint('0');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /import completed/);
});

test('handler awaits initialization and reports configuration failures on request', async () => {
  const { default: handler } = await import('../src/main.js');
  const original = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;
  try {
    await assert.rejects(handler({} as any, {} as any), /Set MONGODB_URI/);
    await assert.rejects(handler({} as any, {} as any), /Set MONGODB_URI/);
  } finally {
    if (original !== undefined) process.env.MONGODB_URI = original;
  }
});
