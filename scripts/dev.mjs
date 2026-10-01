import { spawn } from 'node:child_process';
const grouped = process.platform !== 'win32';
const children = ['dev:api', 'dev:web'].map(script => spawn('npm', ['run', script], { stdio: 'inherit', detached: grouped }));
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    try { if (grouped && child.pid) process.kill(-child.pid, 'SIGTERM'); else child.kill('SIGTERM'); } catch { /* The child may already have exited. */ }
  }
  process.exitCode = code;
}
for (const child of children) {
  child.on('error', error => { console.error(error.message); stop(1); });
  child.on('exit', code => { if (!stopping) stop(code ?? 1); });
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
