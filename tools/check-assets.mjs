/*
 * Structural guard. The calculator renders most of its markup from JavaScript,
 * so a deleted CSS rule or a renamed element id produces a page that still
 * "works" and looks broken — no error, no failing test. This checks that the
 * contract between the JS, the markup and the stylesheet still holds.
 *
 *   node tools/check-assets.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');

const css = read('assets/css/style.css');
const html = read('index.html');
const methodology = read('methodology.html');
const app = read('assets/js/app.js');

const problems = [];

/* --- Every class the JS renders must have a rule to style it. ------------- */
const REQUIRED_SELECTORS = [
  // page furniture
  '.wrap', '.ambg', 'header', '.header-inner', '.logo', '.logo-icon', '.logo-text',
  '.hlink', '.hero', '.hero-badge', '.hero-title', '.hero-accent', '.hero-desc',
  '.eyebrow', '.eyebrow-row', '.gsearch', '.empty',
  // game picker — deleted by accident once; that is why this list exists
  '.games', '.gamecard', '.gamecard__icon', '.gamecard__t',
  // layout
  '.split', '.col', '.card', '.card-head', '.card-body', '.sticky',
  // fields
  '.field', '.field__top', '.field__label', '.field__val', '.field__hint', '.switch',
  // results
  '.stats', '.stat', '.stat__k', '.stat__v', '.stat__s',
  '.tick', '.tick__top', '.leds', '.led', '.tick__scale', '.tick__note',
  '.tier', '.tier__icon', '.tier__t', '.tier__d',
  '.notes', '.note', '.tabs', '.tab', '.codebox',
  '.pill', '.lead', '.footnote', '.mbar', '.mbar__item', '.mbar__k', '.mbar__v',
  // methodology page
  '.prose', '.conf', '.srcs',
];

/* Media-query overrides do not count. A selector that only exists inside
   `@media (max-width: 560px)` leaves the component unstyled on desktop, which
   is exactly the failure this guard was written for — so strip @media blocks
   and require every selector in the base cascade. */
function stripAtBlocks(source) {
  let out = '';
  for (let i = 0; i < source.length; i++) {
    if (source.startsWith('@media', i) || source.startsWith('@supports', i)) {
      const open = source.indexOf('{', i);
      if (open === -1) break;
      let depth = 1, j = open + 1;
      while (j < source.length && depth > 0) {
        if (source[j] === '{') depth++;
        else if (source[j] === '}') depth--;
        j++;
      }
      i = j - 1;
      continue;
    }
    out += source[i];
  }
  return out;
}

const baseCss = stripAtBlocks(css);

for (const sel of REQUIRED_SELECTORS) {
  // match at a token boundary so `.card` does not match `.card-head`
  const escaped = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(^|[\\s,>+~])${escaped}(?![\\w-])\\s*[,{:[]`, 'm');
  if (!re.test(baseCss)) problems.push(`stylesheet has no base rule for "${sel}" (media-query overrides do not count)`);
}

/* --- Every id the JS reaches for must exist in the markup. ---------------- */
const pages = { 'index.html': html, 'methodology.html': methodology };
// Shared ids across pages are fine and expected (both have a theme toggle);
// a repeated id *within* one page is the bug — only the first one ever binds.
const ids = new Set();
for (const [, src] of Object.entries(pages)) {
  for (const m of src.matchAll(/id="([^"]+)"/g)) ids.add(m[1]);
}
for (const [file, src] of Object.entries(pages)) {
  const seen = new Set();
  for (const m of src.matchAll(/id="([^"]+)"/g)) {
    if (seen.has(m[1])) problems.push(`${file}: duplicate id "${m[1]}"`);
    seen.add(m[1]);
  }
}

for (const m of app.matchAll(/\$\('#([\w-]+)'\)/g)) {
  if (!ids.has(m[1])) problems.push(`app.js reaches for #${m[1]}, which no page defines`);
}
for (const m of app.matchAll(/getElementById\('([\w-]+)'\)/g)) {
  if (!ids.has(m[1])) problems.push(`app.js reaches for #${m[1]}, which no page defines`);
}

/* --- Files referenced by the service worker must exist. ------------------- */
for (const m of read('sw.js').matchAll(/^\s*'([^']+)',/gm)) {
  const f = m[1];
  if (f === './') continue;
  if (!fs.existsSync(path.join(root, f))) problems.push(`sw.js caches "${f}", which does not exist`);
}

/* --- Both pages must load the same stylesheet and their scripts. ---------- */
for (const [file, src] of Object.entries(pages)) {
  if (!src.includes('assets/css/style.css')) problems.push(`${file}: does not load the stylesheet`);
  for (const m of src.matchAll(/<script src="([^"]+)"/g)) {
    if (!fs.existsSync(path.join(root, m[1]))) problems.push(`${file}: loads missing script "${m[1]}"`);
  }
}

if (problems.length) {
  console.error('FAIL\n' + problems.map((p) => '  - ' + p).join('\n'));
  process.exit(1);
}
console.log(`OK: ${REQUIRED_SELECTORS.length} selectors present, ${ids.size} ids unique, sw + script refs resolve`);
