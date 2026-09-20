/**
 * One-shot text → richtext content migration for the `home` story.
 *
 * Why this exists instead of `storyblok run-migration`: the CLI runs one field
 * at a time and PUTs the *whole* story on each pass. Storyblok validates the
 * whole story, so as long as any richtext-typed field still holds a plain
 * string the save fails with 422 — every per-field pass is rejected, and the
 * CLI reports "✓ success" anyway because it swallows the error. This converts
 * every richtext field in one pass and saves once.
 *
 * Which fields are richtext is read from the live space schema, so this stays
 * correct no matter what the panel looks like.
 *
 *   node migrations/migrate-richtext.mjs           # dry run, writes nothing
 *   node migrations/migrate-richtext.mjs --apply   # save to the draft
 *
 * Auth: the token stored by `npx storyblok@3 login` (~/.netrc).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const SPACE = '294737692191178';
const SLUG = 'home';
const API = `https://mapi.storyblok.com/v1/spaces/${SPACE}`;
const apply = process.argv.includes('--apply');

const token = (fs.readFileSync(path.join(os.homedir(), '.netrc'), 'utf8').match(/password\s+(\S+)/) || [])[1];
if (!token) throw new Error('No Storyblok token in ~/.netrc — run: npx storyblok@3 login --region eu');

const headers = { Authorization: token, 'Content-Type': 'application/json' };

const get = async (url) => {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status} ${await res.text()}`);
  return res.json();
};

/** Plain string → prosemirror document, preserving the copy. */
const toDocument = (value) => {
  const paragraphs = String(value)
    .split(/\n\s*\n|\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '');

  if (paragraphs.length === 0) return { type: 'doc', content: [{ type: 'paragraph' }] };

  return {
    type: 'doc',
    content: paragraphs.map((text) => ({
      type: 'paragraph',
      content: [{ type: 'text', text }],
    })),
  };
};

/** Walk every blok in the content tree, depth first. */
const walkBloks = (node, visit) => {
  if (Array.isArray(node)) return node.forEach((child) => walkBloks(child, visit));
  if (!node || typeof node !== 'object') return;
  if (typeof node.component === 'string') visit(node);
  Object.values(node).forEach((value) => walkBloks(value, visit));
};

const { components } = await get(`${API}/components`);
const richtextFields = new Map(
  components.map((c) => [
    c.name,
    Object.entries(c.schema || {})
      .filter(([, def]) => def.type === 'richtext')
      .map(([field]) => field),
  ]),
);

const { stories } = await get(`${API}/stories?with_slug=${SLUG}`);
if (!stories.length) throw new Error(`Story "${SLUG}" not found`);
const { story } = await get(`${API}/stories/${stories[0].id}`);

const changes = [];
walkBloks(story.content, (blok) => {
  for (const field of richtextFields.get(blok.component) ?? []) {
    if (typeof blok[field] !== 'string') continue; // already a document, or unset
    changes.push(`${blok.component}.${field}: ${JSON.stringify(blok[field].slice(0, 50))}…`);
    blok[field] = toDocument(blok[field]);
  }
});

if (changes.length === 0) {
  console.log('✓ Nothing to convert — every richtext field already holds a document.');
  process.exit(0);
}

console.log(`${changes.length} pól do konwersji:`);
changes.forEach((c) => console.log('  -', c));

if (!apply) {
  console.log('\nDry run — nic nie zapisano. Uruchom z --apply, aby zapisać do wersji roboczej.');
  process.exit(0);
}

const res = await fetch(`${API}/stories/${story.id}`, {
  method: 'PUT',
  headers,
  body: JSON.stringify({ story, force_update: '1' }),
});

if (!res.ok) {
  console.error(`X Zapis odrzucony: ${res.status}`);
  console.error(await res.text());
  process.exit(1);
}

console.log('\n✓ Zapisano do wersji roboczej. Opublikuj story w panelu Storyblok.');
