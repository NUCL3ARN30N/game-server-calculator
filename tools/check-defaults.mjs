/*
 * Guard rail: a first-time visitor must always land on a configuration that is
 * comfortably within its tick budget, so the number they see is one they can
 * actually rent against. Also checks that nothing is missing a translation.
 *
 *   node tools/check-defaults.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = ['assets/js/i18n.js', 'assets/js/calculators.js']
  .map((f) => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');

const tmp = path.join(root, '.check.mjs');
fs.writeFileSync(tmp, src + '\nexport { GAMES, calculate, STRINGS, OPTION_KEYS };');
const m = await import('file://' + tmp);
fs.unlinkSync(tmp);

const MIN_HEADROOM = 50;   // percent of the tick budget left free
const problems = [];

for (const game of Object.keys(m.GAMES)) {
  const values = Object.fromEntries(m.GAMES[game].fields.map((f) => [f.id, f.def]));
  const r = m.calculate(game, values);

  if (r.headroom < MIN_HEADROOM) {
    problems.push(`${game}: default headroom ${r.headroom}% is below ${MIN_HEADROOM}% `
      + `(${r.mspt.toFixed(1)} ms of a ${r.tickBudget} ms budget)`);
  }
  for (const [key, val] of Object.entries({ systemGb: r.systemGb, cores: r.cores, diskGb: r.diskGb })) {
    if (!Number.isFinite(val) || val <= 0) problems.push(`${game}: ${key} is ${val}`);
  }

  const need = [`game.${game}`, `game.${game}.sub`];
  for (const f of m.GAMES[game].fields) {
    need.push(`f.${f.id}`);
    if (f.unit) need.push(`u.${f.unit}`);
    if (f.type === 'select') {
      const map = m.OPTION_KEYS[f.id];
      for (const o of f.options) {
        if (map && map[o.v]) need.push(map[o.v]);
        else if (!map && !o.label) problems.push(`${game}: option ${f.id}/${o.v} has no label or key`);
      }
    }
  }
  for (const k of need) if (!m.STRINGS[k]) problems.push(`${game}: missing string "${k}"`);
}

for (const key of [...new Set([...src.matchAll(/key: '(w\.[a-zA-Z0-9.]+)'/g)].map((x) => x[1]))]) {
  if (!m.STRINGS[key]) problems.push(`missing warning string "${key}"`);
}
for (const [k, v] of Object.entries(m.STRINGS)) {
  if (!v.en) problems.push(`string "${k}" has no English`);
  if (!v.de) problems.push(`string "${k}" has no German`);
}

if (problems.length) {
  console.error('FAIL\n' + problems.map((p) => '  - ' + p).join('\n'));
  process.exit(1);
}
console.log(`OK: ${Object.keys(m.GAMES).length} games, all defaults >= ${MIN_HEADROOM}% headroom, translations complete`);
