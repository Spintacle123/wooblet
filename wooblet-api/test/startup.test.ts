import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

function importEntrypoint(vercel: string) {
  const env = { ...process.env, VERCEL: vercel };
  delete env.MONGODB_URI;
  return spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', "await import('./src/main.ts'); console.log('import completed');"], { cwd: new URL('..', import.meta.url), env, encoding: 'utf8', timeout: 15000 });
}

test('Vercel imports start bootstrap rather than silently leaving the server unstarted', () => {
  const result = importEntrypoint('1');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Set MONGODB_URI/);
});

test('non-Vercel imports remain side-effect free for test harnesses', () => {
  const result = importEntrypoint('0');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /import completed/);
});
