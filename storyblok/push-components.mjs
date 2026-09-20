/**
 * Push the component schema in storyblok/components.json to the space.
 *
 * Why not `storyblok push-components`: the CLI calls GET /spaces/{id}/internal_tags
 * unconditionally, and that endpoint rejects the token issued by `storyblok
 * login` ("This endpoint does not support this token type"), so the whole task
 * dies with "Forbidden" before touching a single component. Everything else the
 * push needs — reading and writing components — works with that same token.
 *
 * Differences from the CLI worth knowing:
 *  - a component is PUT as {…existing, …fromFile}, so fields this repo does not
 *    manage (component group, icon, presets, internal tags) are preserved;
 *  - the schema itself is REPLACED, so a field added in the panel but missing
 *    from the file disappears. The dry run lists those before anything is sent.
 *
 *   node storyblok/push-components.mjs           # dry run, writes nothing
 *   node storyblok/push-components.mjs --apply   # push
 *
 * Auth: the token stored by `npx storyblok@3 login` (~/.netrc).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SPACE = '294737692191178';
const API = `https://mapi.storyblok.com/v1/spaces/${SPACE}`;
const FILE = new URL('./components.json', import.meta.url);
const apply = process.argv.includes('--apply');

const token = (fs.readFileSync(path.join(os.homedir(), '.netrc'), 'utf8').match(/password\s+(\S+)/) || [])[1];
if (!token) throw new Error('Brak tokenu w ~/.netrc — uruchom: npx storyblok@3 login --region eu');

const headers = { Authorization: token, 'Content-Type': 'application/json' };

const send = async (url, method = 'GET', body) => {
  const res = await fetch(url, { method, headers, body: body && JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status} ${text}`);
  return text ? JSON.parse(text) : null;
};

const { components: local } = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const { components: remote } = await send(`${API}/components`);
const byName = new Map(remote.map((c) => [c.name, c]));

/** What changes in one component's schema, field by field. */
const describe = (existing, next) => {
  const before = existing?.schema ?? {};
  const after = next.schema ?? {};
  const lines = [];
  for (const key of Object.keys(after)) {
    if (!(key in before)) lines.push(`    + ${key} (${after[key].type})`);
    else if (before[key].type !== after[key].type)
      lines.push(`    ~ ${key}: ${before[key].type} → ${after[key].type}`);
  }
  for (const key of Object.keys(before)) {
    if (!(key in after)) lines.push(`    - ${key} (${before[key].type}) — ZNIKNIE Z PANELU`);
  }
  if (existing && existing.display_name !== next.display_name) {
    lines.push(`    ~ nazwa: "${existing.display_name}" → "${next.display_name}"`);
  }
  return lines;
};

let created = 0;
let updated = 0;
let removals = 0;

for (const component of local) {
  const existing = byName.get(component.name);
  const changes = describe(existing, component);
  removals += changes.filter((l) => l.includes('ZNIKNIE')).length;

  if (!existing) {
    console.log(`+ ${component.name} — nowy komponent`);
    changes.forEach((l) => console.log(l));
    created++;
    if (apply) await send(`${API}/components`, 'POST', { component });
    continue;
  }

  if (changes.length === 0) {
    console.log(`= ${component.name} — bez zmian`);
    continue;
  }

  console.log(`~ ${component.name}`);
  changes.forEach((l) => console.log(l));
  updated++;
  // Merge so panel-side settings this repo does not model survive the push.
  if (apply) {
    await send(`${API}/components/${existing.id}`, 'PUT', {
      component: { ...existing, ...component },
    });
  }
}

const orphans = remote.filter((c) => !local.some((l) => l.name === c.name));
if (orphans.length) {
  console.log(`\nW przestrzeni, poza plikiem (nietykane): ${orphans.map((c) => c.name).join(', ')}`);
}

console.log(`\n${created} nowych, ${updated} do aktualizacji, ${removals} pól do usunięcia.`);
console.log(apply ? '✓ Wysłano.' : 'Dry run — nic nie wysłano. Uruchom z --apply.');
