import { readFile, writeFile, access } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
async function exists(path) { try { await access(path); return true; } catch { return false; } }
for (const app of ['wooblet-api', 'wooblet-web']) {
  const target = `${app}/${app === 'wooblet-api' ? '.env' : '.env.local'}`;
  if (await exists(target)) { console.log(`${target} already exists; kept your settings.`); continue; }
  let contents = await readFile(`${app}/.env.example`, 'utf8');
  if (app === 'wooblet-api') contents = contents.replace('replace-with-a-random-secret-at-least-32-characters', randomBytes(32).toString('hex')).replace('replace-with-another-random-secret-at-least-32-characters', randomBytes(32).toString('hex')).replace('ADMIN_PASSWORD=\n', `ADMIN_PASSWORD=${randomBytes(18).toString('base64url')}\n`);
  await writeFile(target, contents, { mode: 0o600 });
  console.log(`Created ${target}.`);
}
console.log('Admin login: use ADMIN_EMAIL and ADMIN_PASSWORD from wooblet-api/.env after running npm run seed.');
