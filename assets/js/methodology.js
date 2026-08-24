/*
 * Methodology page. Everything here is read out of calculators.js at runtime,
 * so the documented constants can never drift from the ones actually used.
 */

const $m = (sel) => document.querySelector(sel);

const GAME_LABELS = {
  minecraft: 'Minecraft', hytale: 'Hytale', rust: 'Rust', palworld: 'Palworld',
  ark: 'ARK: Ascended', arkse: 'ARK: Evolved', valheim: 'Valheim',
  zomboid: 'Project Zomboid', satisfactory: 'Satisfactory', fivem: 'FiveM',
  reforger: 'Arma Reforger', arma4: 'Arma 4', cs2: 'Counter-Strike 2',
  cs16: 'Counter-Strike 1.6', teamspeak: 'TeamSpeak', mumble: 'Mumble',
};
const ORDER = Object.keys(GAME_LABELS);

/* ---- the RAM ladder, straight from the constant ---- */
$m('#ramSteps').textContent = 'RAM_STEPS = [' + RAM_STEPS.join(', ') + '] GB';

/* ---- Minecraft software constants ---- */
$m('#mcTable').innerHTML = `
  <thead><tr>
    <th>Software</th><th>Base</th><th>KB/chunk</th><th>Entity factor</th>
    <th>MB/player</th><th>CPU factor</th><th>Max cores</th><th>Threading</th>
  </tr></thead>
  <tbody>${Object.values(MC_SOFTWARE).map((sw) => `
    <tr>
      <td>${sw.label}</td>
      <td class="n">${sw.baseMb} MB</td>
      <td class="n">${sw.kbPerChunk}</td>
      <td class="n">${sw.entityFactor}</td>
      <td class="n">${sw.perPlayerMb}</td>
      <td class="n">${sw.cpuEff.toFixed(2)}</td>
      <td class="n">${sw.maxCores}</td>
      <td>${sw.threading === 'multi' ? 'parallel' : 'serial tick loop'}</td>
    </tr>`).join('')}</tbody>`;

/* ---- tick budgets, derived by actually running each game ---- */
const results = Object.fromEntries(ORDER.map((g) => {
  const values = Object.fromEntries(GAMES[g].fields.map((f) => [f.id, f.def]));
  return [g, calculate(g, values)];
}));

const budgets = [...new Set(ORDER.map((g) => results[g].tickBudget))].sort((a, b) => a - b);
$m('#budgets').innerHTML = `
  <thead><tr><th>Budget</th><th>Rate</th><th>Applies to</th></tr></thead>
  <tbody>${budgets.map((b) => `
    <tr>
      <td class="n">${b} ms</td>
      <td class="n">${Math.round(1000 / b)} Hz</td>
      <td>${ORDER.filter((g) => results[g].tickBudget === b).map((g) => GAME_LABELS[g]).join(', ')}</td>
    </tr>`).join('')}</tbody>`;

/* ---- every default, computed live ---- */
$m('#defaults').innerHTML = `
  <thead><tr>
    <th>Game</th><th>Memory</th><th>CPU</th><th>Disk</th><th>Uplink</th>
    <th>Tick</th><th>Headroom</th>
  </tr></thead>
  <tbody>${ORDER.map((g) => {
    const r = results[g];
    const ratio = r.mspt / r.tickBudget;
    const color = ratio > 0.8 ? 'var(--err)' : ratio > 0.55 ? 'var(--warn)' : 'var(--ok)';
    const mem = r.heapGb !== null ? `${r.heapGb} G heap / ${r.systemGb} G` : `${r.systemGb} G`;
    const up = r.upMbps < 1 ? `${Math.round(r.upMbps * 1000)} kbit/s`
      : r.upMbps < 1000 ? `${r.upMbps < 10 ? r.upMbps : Math.round(r.upMbps)} Mbit/s`
        : `${Math.round(r.upMbps / 100) / 10} Gbit/s`;
    return `<tr>
      <td>${GAME_LABELS[g]}</td>
      <td class="n">${mem}</td>
      <td class="n">${r.cores}× ${r.clockGhz.toFixed(1)} GHz</td>
      <td class="n">${r.diskGb} G</td>
      <td class="n">${up}</td>
      <td class="n">${r.mspt.toFixed(1)} / ${r.tickBudget} ms</td>
      <td class="n" style="color:${color}">${r.headroom}%</td>
    </tr>`;
  }).join('')}</tbody>`;

/* ---- theme, shared with the calculator ---- */
function readTheme() {
  try { return JSON.parse(localStorage.getItem('theme')) || 'dark'; } catch { return 'dark'; }
}
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $m('#themeIcon').className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  document.querySelector('meta[name=theme-color]').content = theme === 'dark' ? '#08080a' : '#f6f5f9';
  try { localStorage.setItem('theme', JSON.stringify(theme)); } catch { /* private mode */ }
}
applyTheme(readTheme());
$m('#themeBtn').addEventListener('click', () =>
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* offline is optional */ });
}
