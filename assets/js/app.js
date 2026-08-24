/* Server Genius — UI controller */

const GAME_ORDER = [
  'minecraft', 'hytale', 'rust', 'palworld', 'ark', 'arkse', 'valheim', 'zomboid',
  'satisfactory', 'fivem', 'reforger', 'arma4', 'cs2', 'cs16', 'teamspeak', 'mumble',
];
const $ = (sel) => document.querySelector(sel);

const store = {
  get(k, fb) { try { const v = localStorage.getItem(k); return v === null ? fb : JSON.parse(v); } catch { return fb; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
};

const state = {
  game: 'minecraft',
  values: {},
  tab: 'start',
};

/* ------------------------------------------------------------- defaults */

function defaults(game) {
  const v = {};
  for (const f of GAMES[game].fields) v[f.id] = f.def;
  return v;
}

function visibleFields(game, values) {
  return GAMES[game].fields.filter((f) => !f.when || f.when(values));
}

/* ------------------------------------------------------------- rendering */

/* People search for what they call the thing, not what the card says. */
const GAME_ALIASES = {
  minecraft: 'mc java paper spigot purpur folia forge pumpkin bukkit vanilla modded',
  hytale: 'java jvm hypixel voxel performancesaver nitrado',
  rust: 'facepunch oxide umod carbon survival wipe',
  palworld: 'pal pals pocketpair survival',
  ark: 'asa survival ascended dino dinosaur',
  arkse: 'ase survival evolved dino dinosaur',
  valheim: 'viking iron gate survival zdo',
  zomboid: 'pz java jvm zombie survival indie stone',
  satisfactory: 'coffee stain factory factorio-like automation',
  fivem: 'gta gta5 grand theft auto roleplay rp esx qbcore cfx txadmin',
  reforger: 'arma bohemia enfusion military milsim',
  arma4: 'arma bohemia enfusion military milsim unreleased',
  cs2: 'csgo counter strike source valve fps shooter competitive',
  cs16: 'counter strike hlds rehlds valve fps shooter goldsrc amx',
  teamspeak: 'voice comms chat ts ts3 ts5 voip talk',
  mumble: 'voice comms chat murmur voip talk opensource',
};

function renderGames() {
  $('#games').innerHTML = GAME_ORDER.map((g) => `
    <button class="gamecard" type="button" data-game="${g}"
            data-search="${t('game.' + g + '.sub')} ${GAME_ALIASES[g] || ''}"
            title="${t('game.' + g + '.sub')}"
            aria-pressed="${g === state.game}" style="--game:${GAMES[g].accent}">
      <span class="gamecard__icon"><i class="fa-solid ${GAMES[g].icon}"></i></span>
      <span class="gamecard__t">${t('game.' + g)}</span>
    </button>`).join('');

  $('#games').querySelectorAll('.gamecard').forEach((b) =>
    b.addEventListener('click', () => selectGame(b.dataset.game)));

  filterGames($('#gameSearch').value);
}

/* Sixteen cards is a lot to scan. Match on the visible name and subtitle so
   "voice", "gta" or "java" all land somewhere sensible. */
function filterGames(term) {
  const q = (term || '').trim().toLowerCase();
  let shown = 0;
  $('#games').querySelectorAll('.gamecard').forEach((card) => {
    const haystack = (card.innerText + ' ' + card.dataset.search).toLowerCase();  // name + hidden subtitle + aliases
    const hit = !q || q.split(/\s+/).every((word) => haystack.includes(word));
    card.hidden = !hit;
    if (hit) shown++;
  });
  $('#gamesEmpty').hidden = shown > 0;
}

$('#gameSearch').addEventListener('input', (e) => filterGames(e.target.value));
$('#gameSearch').addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { e.target.value = ''; filterGames(''); }
  if (e.key === 'Enter') {
    const first = [...$('#games').querySelectorAll('.gamecard')].find((c) => !c.hidden);
    if (first) selectGame(first.dataset.game);
  }
});

function optionLabel(fieldId, opt) {
  const map = OPTION_KEYS[fieldId];
  return map && map[opt.v] ? t(map[opt.v]) : opt.label;
}

function renderFields() {
  const v = state.values;
  $('#fields').innerHTML = visibleFields(state.game, v).map((f) => {
    const hint = STRINGS['h.' + f.id] ? `<p class="field__hint">${t('h.' + f.id)}</p>` : '';

    if (f.type === 'toggle') {
      return `<div class="field">
        <div class="field__top">
          <label class="field__label" for="f_${f.id}">${t('f.' + f.id)}</label>
          <span class="field__val">${v[f.id] ? t('on') : t('off')}</span>
        </div>
        <button class="switch" type="button" id="f_${f.id}" data-field="${f.id}"
                role="switch" aria-checked="${v[f.id]}"><span class="knob"></span></button>
        ${hint}</div>`;
    }

    if (f.type === 'select') {
      return `<div class="field">
        <div class="field__top"><label class="field__label" for="f_${f.id}">${t('f.' + f.id)}</label></div>
        <select id="f_${f.id}" data-field="${f.id}">
          ${f.options.map((o) => `<option value="${o.v}"${o.v === v[f.id] ? ' selected' : ''}>${optionLabel(f.id, o)}</option>`).join('')}
        </select>${hint}</div>`;
    }

    const pct = ((v[f.id] - f.min) / (f.max - f.min)) * 100;
    return `<div class="field">
      <div class="field__top">
        <label class="field__label" for="f_${f.id}">${t('f.' + f.id)}</label>
        <output class="field__val" id="o_${f.id}">${fmtVal(f, v[f.id])}</output>
      </div>
      <input type="range" id="f_${f.id}" data-field="${f.id}"
             min="${f.min}" max="${f.max}" step="${f.step}" value="${v[f.id]}"
             style="--pct:${pct}%" aria-describedby="o_${f.id}">
      ${hint}</div>`;
  }).join('');

  $('#fields').querySelectorAll('.switch').forEach((el) => {
    el.addEventListener('click', () => {
      state.values[el.dataset.field] = !state.values[el.dataset.field];
      persist(); renderFields(); renderResults();
    });
  });

  $('#fields').querySelectorAll('input[data-field], select[data-field]').forEach((el) => {
    el.addEventListener('input', () => {
      const f = GAMES[state.game].fields.find((x) => x.id === el.dataset.field);
      state.values[f.id] = f.type === 'select' ? el.value : Number(el.value);

      if (f.type === 'range') {
        el.style.setProperty('--pct', ((el.value - f.min) / (f.max - f.min)) * 100 + '%');
        $('#o_' + f.id).textContent = fmtVal(f, Number(el.value));
      }
      // A select can show or hide other fields, so the panel is rebuilt - but
      // rebuilding throws away focus, which strands keyboard users.
      if (f.type === 'select') {
        renderFields();
        const again = document.getElementById('f_' + f.id);
        if (again) again.focus();
      }
      persist();
      renderResults();
    });
  });
}

function fmtVal(f, val) {
  const unit = f.unit ? t('u.' + f.unit) : '';
  const n = val.toLocaleString(LANG === 'de' ? 'de-DE' : 'en-US');
  if (f.id === 'worldRadius' || f.id === 'mapSize') return `±${n} ${unit}`;
  return `${n} ${unit}`.trim();
}

/* ------------------------------------------------------------- results */

function renderResults() {
  const r = calculate(state.game, state.values);

  const ramBig = r.heapGb ?? r.systemGb;
  const ramSub = r.heapGb !== null
    ? `${t('r.ramHeap')} · <b>${r.systemGb} GB</b> ${t('r.ramSystem')}`
    : r.procGb !== undefined
      ? `${t('r.ramSystem')} · ${t('r.ramProcess')} ~<b>${fmtMem(r.procGb)}</b>`
      : t('r.ramSystem');

  $('#stats').innerHTML = `
    ${stat('fa-memory', t('r.ram'), ramBig, 'GB', ramSub)}
    ${stat('fa-microchip', t('r.cpu'), r.cores, t(r.cores === 1 ? 'r.core' : 'r.cores'),
      `<b>${r.clockGhz.toFixed(1)} GHz</b> ${t('r.clock')}`)}
    ${stat('fa-hard-drive', t('r.disk'), r.diskGb, 'GB', t('r.diskNote'))}
    ${stat('fa-network-wired', t('r.net'), netValue(r.upMbps), netUnit(r.upMbps),
      `${t('r.netNote')} · <b>${fmtTraffic(r.trafficGb)}</b> ${t('r.traffic')}`)}
  `;

  renderBar(r);
  renderReport(r);
  renderTick(r);
  renderCapacity();
  renderTier(r);
  renderNotes(r);
  renderSnippets(r);
  renderCompare();
}

/* ------------------------------------------------------------- capacity */

function budgetFromInputs() {
  const ram = clampNum($('#capRam'), 1, 512, 8);
  const cores = clampNum($('#capCores'), 1, 128, 4);
  return { ramGb: ram, cores };
}

function clampNum(el, lo, hi, fallback) {
  const n = Number(el.value);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : fallback;
}

function renderCapacity() {
  const out = $('#capOut');
  const cap = capacity(state.game, state.values, budgetFromInputs());
  if (!cap) { out.innerHTML = ''; return; }

  const unit = t(cap.field === 'users' ? 'cap.users' : 'cap.players');

  if (cap.players === 0) {
    // Report what it would actually take to seat one player.
    const min = calculate(state.game, { ...state.values, [cap.field]: cap.min });
    out.className = 'cap__out cap__out--none';
    out.innerHTML = `<i class="fa-solid fa-circle-exclamation big"></i>
      <span class="why">${t('cap.none', { ram: min.systemGb, cores: min.cores })}</span>`;
    return;
  }

  const why = cap.capped ? t('cap.capped')
    : cap.limit === 'ram' ? t('cap.byRam')
      : cap.limit === 'cpu' ? t('cap.byCpu') : t('cap.byTick');

  out.className = 'cap__out';
  out.innerHTML = `
    <span class="big">${cap.players}</span>
    <span class="why"><b>${unit}</b> — ${why}</span>`;
}

['#capRam', '#capCores'].forEach((sel) => {
  $(sel).addEventListener('input', renderCapacity);
  $(sel).addEventListener('change', () => {
    // Snap the field to the value actually used, so it cannot show 9999.
    const b = budgetFromInputs();
    $('#capRam').value = b.ramGb;
    $('#capCores').value = b.cores;
    store.set('budget', b);
    renderCapacity();
  });
});

/* Compact readout that follows the user while they are up in the sliders. */
function renderBar(r) {
  const ratio = r.mspt / r.tickBudget;
  const color = ratio > 0.8 ? 'var(--err)' : ratio > 0.55 ? 'var(--warn)' : 'var(--ok)';
  $('#mbar').innerHTML = `
    <span class="mbar__item"><span class="mbar__k">${t('r.ram')}</span><span class="mbar__v">${r.systemGb} GB</span></span>
    <span class="mbar__item"><span class="mbar__k">${t('r.cpu')}</span><span class="mbar__v">${r.cores}\u00d7 ${r.clockGhz.toFixed(1)}</span></span>
    <span class="mbar__item"><span class="mbar__k">${t('r.disk')}</span><span class="mbar__v">${r.diskGb} GB</span></span>
    <span class="mbar__item"><span class="mbar__k">${t('m.tick')}</span><span class="mbar__v plain" style="color:${color}">${r.headroom}%</span></span>
    <i class="fa-solid fa-arrow-up mbar__up" aria-hidden="true"></i>`;
  $('#mbar').setAttribute('aria-label', t('m.jump'));
}

/* A calculator nobody can correct stays wrong. This prefills a GitHub issue
   with the exact inputs and outputs so a report is one click and no typing. */
function renderReport(r) {
  const cfg = Object.entries(state.values).map(([k, val]) => `- ${k}: ${val}`).join('\n');
  const body = [
    '### What the calculator said', '',
    `- Game: ${t('game.' + state.game)} (${r.subtitle})`,
    r.heapGb !== null ? `- Heap: ${r.heapGb} GB` : null,
    `- System RAM: ${r.systemGb} GB`,
    `- CPU: ${r.cores} cores @ ${r.clockGhz.toFixed(1)} GHz`,
    `- Storage: ${r.diskGb} GB`,
    `- Uplink: ${r.upMbps} Mbit/s`,
    `- Estimated tick: ${r.mspt.toFixed(1)} ms of ${r.tickBudget} ms`,
    '', '### Configuration', '', cfg,
    '', '### What it actually uses', '',
    'Please describe the real figures you measured, and how you measured them',
    '(Spark report, `htop`, `docker stats`, server profiler...). Real numbers',
    'from production are what improve the model.',
    '', '### Link', '', location.href,
  ].filter(Boolean).join('\n');

  const url = 'https://github.com/NUCL3ARN30N/game-server-calculator/issues/new'
    + '?labels=calibration'
    + '&title=' + encodeURIComponent(`[calibration] ${t('game.' + state.game)}: figures look off`)
    + '&body=' + encodeURIComponent(body);

  const el = $('#reportBtn');
  el.href = url;
  el.title = t('r.reportTitle');
}

/* Pick a unit that keeps the figure to a few characters. A quiet server should
   not read "0 Mbit/s", and a 512-user voice server should not read
   "10889.28 Mbit/s" - that is 10.9 Gbit/s, and it overflowed the card. */
const netValue = (mbps) =>
  mbps < 1 ? Math.round(mbps * 1000)
    : mbps < 10 ? mbps
      : mbps < 1000 ? Math.round(mbps)
        : Math.round(mbps / 100) / 10;

const netUnit = (mbps) => (mbps < 1 ? 'kbit/s' : mbps < 1000 ? 'Mbit/s' : 'Gbit/s');
const fmtTraffic = (gb) => (gb < 1000 ? `${gb} GB` : `${(gb / 1000).toFixed(1)} TB`);

/** Sub-gigabyte figures read better in MB. */
function fmtMem(gb) {
  return gb < 1 ? `${Math.round(gb * 1024)} MB` : `${gb} GB`;
}

function stat(icon, key, value, unit, sub) {
  return `<div class="stat">
    <div class="stat__k"><i class="fa-solid ${icon}"></i>${key}</div>
    <div class="stat__v">${value}<small>${unit}</small></div>
    <div class="stat__s">${sub}</div>
  </div>`;
}

function renderTick(r) {
  const LEDS = 28;
  const lit = Math.round((Math.min(r.mspt, r.tickBudget) / r.tickBudget) * LEDS);
  const ratio = r.mspt / r.tickBudget;
  const tone = ratio > 0.8 ? 'danger' : ratio > 0.55 ? 'warn' : '';
  const verdict = ratio > 0.8 ? t('r.over') : ratio > 0.55 ? t('r.tight') : t('r.good');
  const color = ratio > 0.8 ? 'var(--err)' : ratio > 0.55 ? 'var(--warn)' : 'var(--ok)';

  $('#tick').innerHTML = `
    <div class="tick__top">
      <span class="tick__label">${t('r.headroom')}</span>
      <span class="tick__verdict" style="color:${color}">${verdict} · ${r.headroom}%</span>
    </div>
    <div class="leds" role="img" aria-label="${r.mspt.toFixed(1)} ${t('r.mspt')}">
      ${Array.from({ length: LEDS }, (_, i) =>
        `<span class="led ${i < lit ? 'on ' + tone : ''}"></span>`).join('')}
    </div>
    <div class="tick__scale">
      <span>${r.mspt.toFixed(1)} ${t('r.mspt')}</span>
      <span>${r.tickBudget} ms ${t('r.budget')}</span>
    </div>
    <p class="tick__note">${t('r.headroomNote', { budget: r.tickBudget })}</p>`;
}

function renderTier(r) {
  $('#tier').innerHTML = `
    <div class="tier__icon"><i class="fa-solid fa-server"></i></div>
    <div>
      <div class="tier__t">${t(r.tier)}</div>
      <div class="tier__d">${t(r.tier + '.d')}</div>
    </div>`;
}

function renderNotes(r) {
  const icons = { info: 'fa-circle-info', warn: 'fa-triangle-exclamation', danger: 'fa-circle-exclamation' };
  $('#notes').innerHTML = r.warn.map((w) => `
    <li class="note note--${w.level}">
      <i class="fa-solid ${icons[w.level]}"></i><span>${t(w.key)}</span>
    </li>`).join('');
  $('#notesPanel').style.display = r.warn.length ? '' : 'none';
}

/* ------------------------------------------------------------- snippets */

let currentCode = '';

function renderSnippets(r) {
  const tabs = [
    ['start', t('s.start')],
    ['compose', t('s.compose')],
    ['cfg', t('s.cfg')],
    ['systemd', t('s.systemd')],
  ];
  $('#tabs').innerHTML = tabs.map(([id, label]) =>
    `<button class="tab" role="tab" data-tab="${id}" aria-selected="${id === state.tab}">${label}</button>`).join('');

  $('#tabs').querySelectorAll('.tab').forEach((b) =>
    b.addEventListener('click', () => { state.tab = b.dataset.tab; renderResults(); }));

  currentCode = state.tab === 'systemd'
    ? SYSTEMD(t('game.' + state.game), r.cores, r.systemGb)
    : r.snippets[state.tab];

  $('#code').textContent = currentCode;
}

$('#copyBtn').addEventListener('click', async () => {
  const label = $('#copyBtn').querySelector('span');
  try {
    await navigator.clipboard.writeText(currentCode);
    label.textContent = t('s.copied');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = currentCode; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove();
    label.textContent = t('s.copied');
  }
  setTimeout(() => { label.textContent = t('s.copy'); }, 1600);
});

/* ------------------------------------------------------------- compare */

function renderCompare() {
  const panel = $('#comparePanel');
  if (state.game !== 'minecraft') { panel.style.display = 'none'; return; }
  panel.style.display = '';

  const rows = Object.keys(MC_SOFTWARE).map((key) => {
    const vals = { ...state.values, software: key };
    const sw = MC_SOFTWARE[key];
    if (!sw.plugins) vals.plugins = 0;
    if (!sw.mods) vals.mods = 0;
    const r = calculate('minecraft', vals);
    const ext = sw.mods ? t('c.forge')
      : key === 'folia' ? t('c.folia')
        : sw.plugins ? t('c.yes')
          : key === 'pumpkin' ? t('c.own') : t('c.no');
    const ratio = r.mspt / r.tickBudget;
    const color = ratio > 0.8 ? 'var(--err)' : ratio > 0.55 ? 'var(--warn)' : 'var(--ok)';
    return `<tr class="${key === state.values.software ? 'is-current' : ''}">
      <td>${sw.label}${key === state.values.software ? `<span class="pill">${t('c.current')}</span>` : ''}</td>
      <td class="n">${r.systemGb} GB</td>
      <td class="n">${r.cores}</td>
      <td class="n" style="color:${color}">${r.mspt.toFixed(1)}</td>
      <td>${ext}</td>
    </tr>`;
  }).join('');

  $('#compare').innerHTML = `
    <thead><tr>
      <th>${t('c.software')}</th><th>${t('c.ram')}</th><th>${t('c.cores')}</th>
      <th>${t('c.tick')}</th><th>${t('c.plugins')}</th>
    </tr></thead><tbody>${rows}</tbody>`;
}

$('#mbar').addEventListener('click', () => {
  document.getElementById('stats').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

/* ------------------------------------------------------------- state */

function selectGame(game) {
  state.game = game;
  state.values = sanitize(game, { ...defaults(game), ...store.get('values.' + game, {}) });
  state.tab = 'start';
  document.querySelectorAll('.gamecard').forEach((b) =>
    b.setAttribute('aria-pressed', String(b.dataset.game === game)));
  persist();
  renderFields();
  renderResults();
}

/* Writing the URL and localStorage on every input event means ~60 calls per
   slider drag. Safari throws a SecurityError above 100 replaceState calls in
   30 seconds, so two drags used to break the page on iOS. Rendering stays
   immediate; only the persistence is deferred. */
let persistTimer = null;

function persistNow() {
  store.set('game', state.game);
  store.set('values.' + state.game, state.values);
  const q = new URLSearchParams({ g: state.game, ...state.values });
  history.replaceState(null, '', '?' + q.toString());
}

function persist() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(persistNow, 250);
}

// Never lose the last edit if the tab goes away mid-drag.
addEventListener('pagehide', persistNow);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') persistNow();
});

function fromUrl() {
  const q = new URLSearchParams(location.search);
  const g = q.get('g');
  if (!g || !GAMES[g]) return null;
  return { game: g, values: sanitize(g, Object.fromEntries(q.entries())) };
}

/* ------------------------------------------------------------- i18n / theme */

function applyLang(lang) {
  LANG = lang;
  document.documentElement.lang = lang;
  $('#langLabel').textContent = lang.toUpperCase();
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  store.set('lang', lang);
  renderGames();
  renderFields();
  renderResults();
}

$('#langBtn').addEventListener('click', () => applyLang(LANG === 'en' ? 'de' : 'en'));

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('#themeIcon').className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  document.querySelector('meta[name=theme-color]').content = theme === 'dark' ? '#08080a' : '#f6f5f9';
  store.set('theme', theme);
}

$('#themeBtn').addEventListener('click', () =>
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

$('#shareBtn').addEventListener('click', async () => {
  const label = $('#shareBtn').querySelector('span');
  try {
    await navigator.clipboard.writeText(location.href);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = location.href; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove();
  }
  label.textContent = t('cfg.shared');
  setTimeout(() => { label.textContent = t('cfg.share'); }, 1600);
});

$('#resetBtn').addEventListener('click', () => {
  state.values = defaults(state.game);
  persist(); renderFields(); renderResults();
});

/* ------------------------------------------------------------- boot */

(function init() {
  applyTheme(store.get('theme', 'dark'));   // Genius Space is a dark-first brand

  const shared = fromUrl();
  const browserDe = (navigator.language || 'en').toLowerCase().startsWith('de');
  LANG = store.get('lang', browserDe ? 'de' : 'en');

  state.game = shared ? shared.game : store.get('game', 'minecraft');
  if (!GAMES[state.game]) state.game = 'minecraft';
  state.values = shared ? shared.values
    : sanitize(state.game, { ...defaults(state.game), ...store.get('values.' + state.game, {}) });

  const savedBudget = store.get('budget', null);
  if (savedBudget) {
    $('#capRam').value = savedBudget.ramGb;
    $('#capCores').value = savedBudget.cores;
  }

  applyLang(LANG);

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is optional */ });
  }
})();
