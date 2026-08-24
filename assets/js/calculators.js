/*
 * Game Server Calculator - sizing engine
 * Every formula is documented in README.md so the numbers can be argued with.
 */

/* ---------------------------------------------------------------- helpers */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** RAM ladder - real machines and hosting plans come in these sizes. */
const RAM_STEPS = [1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32, 48, 64, 96, 128];
const stepRam = (gb) => RAM_STEPS.find((s) => s >= gb) ?? Math.ceil(gb / 32) * 32;

const round1 = (v) => Math.round(v * 10) / 10;
/* Uplink needs two decimals: a single player at view distance 3 is 0.02 Mbit/s
   and rounding that to one decimal shows the user a flat zero. */
const round2 = (v) => Math.round(v * 100) / 100;

/** Peak Mbps -> GB per month, assuming average concurrency well below peak. */
const monthlyTraffic = (mbps, utilisation = 0.4) =>
  (mbps * utilisation * 2592000) / 8 / 1000;

/* ------------------------------------------------- Minecraft server flavours */

/* Memory is modelled per loaded chunk, not per player - see calcMinecraft.
   kbPerChunk  heap cost of one loaded chunk (palette, heightmaps, light, NBT)
   entityFactor  entities and block entities as a fraction of chunk memory
   perPlayerMb  packet buffers, inventory, advancements - genuinely small
   coresPer  players per helper core; the tick loop itself is always 1 thread */
const MC_SOFTWARE = {
  vanilla: {
    label: 'Vanilla',
    baseMb: 550, kbPerChunk: 62, entityFactor: 0.35, perPlayerMb: 3.0,
    cpuEff: 1.0, coresPer: 60, maxCores: 6, threading: 'single',
    diskBaseGb: 1.5, java: true, plugins: false, mods: false,
    type: 'VANILLA',
  },
  spigot: {
    label: 'Spigot',
    baseMb: 500, kbPerChunk: 56, entityFactor: 0.30, perPlayerMb: 2.8,
    cpuEff: 0.85, coresPer: 55, maxCores: 6, threading: 'single',
    diskBaseGb: 2, java: true, plugins: true, mods: false,
    type: 'SPIGOT',
  },
  paper: {
    label: 'Paper',
    baseMb: 400, kbPerChunk: 48, entityFactor: 0.28, perPlayerMb: 2.5,
    cpuEff: 0.62, coresPer: 50, maxCores: 8, threading: 'single',
    diskBaseGb: 2, java: true, plugins: true, mods: false,
    type: 'PAPER',
  },
  purpur: {
    label: 'Purpur',
    baseMb: 400, kbPerChunk: 47, entityFactor: 0.27, perPlayerMb: 2.5,
    cpuEff: 0.58, coresPer: 50, maxCores: 8, threading: 'single',
    diskBaseGb: 2, java: true, plugins: true, mods: false,
    type: 'PURPUR',
  },
  folia: {
    label: 'Folia',
    baseMb: 500, kbPerChunk: 50, entityFactor: 0.28, perPlayerMb: 2.6,
    cpuEff: 0.62, coresPer: 12, maxCores: 24, threading: 'multi',
    diskBaseGb: 2, java: true, plugins: true, mods: false,
    type: 'FOLIA',
  },
  forge: {
    label: 'Forge',
    baseMb: 1200, kbPerChunk: 90, entityFactor: 0.50, perPlayerMb: 5.0,
    cpuEff: 1.40, coresPer: 60, maxCores: 6, threading: 'single',
    diskBaseGb: 6, java: true, plugins: false, mods: true,
    type: 'FORGE',
  },
  pumpkin: {
    label: 'Pumpkin',
    baseMb: 60, kbPerChunk: 12, entityFactor: 0.15, perPlayerMb: 0.4,
    cpuEff: 0.40, coresPer: 12, maxCores: 32, threading: 'multi',
    diskBaseGb: 0.5, java: false, plugins: false, mods: false,
    type: 'PUMPKIN',
  },
};

/* ------------------------------------------------------------- input schema */

const GAMES = {
  minecraft: {
    icon: 'fa-cube',
    accent: '#5db075',
    fields: [
      {
        id: 'software', type: 'select', def: 'paper',
        options: Object.keys(MC_SOFTWARE).map((k) => ({ v: k, label: MC_SOFTWARE[k].label })),
      },
      { id: 'players', type: 'range', min: 1, max: 300, step: 1, def: 20, unit: 'players' },
      { id: 'viewDistance', type: 'range', min: 3, max: 32, step: 1, def: 10, unit: 'chunks' },
      { id: 'simDistance', type: 'range', min: 3, max: 16, step: 1, def: 6, unit: 'chunks' },
      { id: 'worldRadius', type: 'range', min: 500, max: 20000, step: 500, def: 5000, unit: 'blocks' },
      {
        id: 'plugins', type: 'range', min: 0, max: 120, step: 1, def: 12, unit: 'plugins',
        when: (v) => MC_SOFTWARE[v.software].plugins,
      },
      {
        id: 'mods', type: 'range', min: 0, max: 500, step: 5, def: 120, unit: 'mods',
        when: (v) => MC_SOFTWARE[v.software].mods,
      },
      { id: 'backups', type: 'range', min: 0, max: 30, step: 1, def: 3, unit: 'copies' },
    ],
  },

  rust: {
    icon: 'fa-fire',
    accent: '#cd412b',
    fields: [
      { id: 'players', type: 'range', min: 10, max: 500, step: 5, def: 70, unit: 'players' },
      { id: 'mapSize', type: 'range', min: 1000, max: 6000, step: 250, def: 3500, unit: 'm' },
      {
        id: 'wipeAge', type: 'select', def: 'mid',
        options: [{ v: 'fresh', label: '' }, { v: 'mid', label: '' }, { v: 'late', label: '' }],
      },
      {
        id: 'framework', type: 'select', def: 'none',
        options: [{ v: 'none', label: 'Vanilla' }, { v: 'oxide', label: 'Oxide / uMod' }, { v: 'carbon', label: 'Carbon' }],
      },
      {
        id: 'plugins', type: 'range', min: 0, max: 120, step: 1, def: 20, unit: 'plugins',
        when: (v) => v.framework !== 'none',
      },
      { id: 'backups', type: 'range', min: 0, max: 30, step: 1, def: 5, unit: 'copies' },
    ],
  },

  hytale: {
    icon: 'fa-dice-d20',
    accent: '#c9a227',
    fields: [
      { id: 'players', type: 'range', min: 1, max: 100, step: 1, def: 32, unit: 'players' },
      { id: 'viewRadius', type: 'range', min: 4, max: 16, step: 1, def: 8, unit: 'chunks' },
      {
        id: 'spread', type: 'select', def: 'mixed',
        options: [{ v: 'clustered', label: '' }, { v: 'mixed', label: '' }, { v: 'explorers', label: '' }],
      },
      { id: 'mods', type: 'range', min: 0, max: 40, step: 1, def: 5, unit: 'mods' },
      { id: 'perfSaver', type: 'toggle', def: true },
      { id: 'backups', type: 'range', min: 0, max: 30, step: 1, def: 7, unit: 'copies' },
    ],
  },

  fivem: {
    icon: 'fa-car-side',
    accent: '#f0a30a',
    fields: [
      { id: 'players', type: 'range', min: 8, max: 128, step: 8, def: 32, unit: 'players' },
      {
        id: 'framework', type: 'select', def: 'esx',
        options: [{ v: 'none', label: 'CFX Default' }, { v: 'esx', label: 'ESX' }, { v: 'qbcore', label: 'QBCore / Qbox' }],
      },
      { id: 'resources', type: 'range', min: 10, max: 400, step: 10, def: 120, unit: 'resources' },
      { id: 'backups', type: 'range', min: 0, max: 30, step: 1, def: 7, unit: 'copies' },
    ],
  },

  cs2: {
    icon: 'fa-crosshairs',
    accent: '#de9b35',
    fields: [
      { id: 'players', type: 'range', min: 2, max: 64, step: 2, def: 12, unit: 'players' },
      {
        id: 'csMode', type: 'select', def: 'competitive',
        options: [{ v: 'competitive', label: '' }, { v: 'casual', label: '' }, { v: 'community', label: '' }],
      },
      { id: 'plugins', type: 'range', min: 0, max: 30, step: 1, def: 5, unit: 'plugins' },
    ],
  },

  cs16: {
    icon: 'fa-gun',
    accent: '#8a8f98',
    fields: [
      { id: 'players', type: 'range', min: 2, max: 32, step: 1, def: 16, unit: 'players' },
      { id: 'plugins', type: 'range', min: 0, max: 40, step: 1, def: 8, unit: 'plugins' },
    ],
  },

  arkse: {
    icon: 'fa-bone',
    accent: '#4a9b8f',
    fields: [
      { id: 'players', type: 'range', min: 1, max: 100, step: 1, def: 20, unit: 'players' },
      {
        id: 'arkStage', type: 'select', def: 'fresh',
        options: [{ v: 'fresh', label: '' }, { v: 'established', label: '' }, { v: 'veteran', label: '' }],
      },
      { id: 'mods', type: 'range', min: 0, max: 40, step: 1, def: 3, unit: 'mods' },
      { id: 'backups', type: 'range', min: 0, max: 30, step: 1, def: 5, unit: 'copies' },
    ],
  },

  reforger: {
    icon: 'fa-helmet-safety',
    accent: '#6b7f4a',
    fields: [
      { id: 'players', type: 'range', min: 8, max: 128, step: 8, def: 32, unit: 'players' },
      {
        id: 'scenario', type: 'select', def: 'gamemaster',
        options: [{ v: 'gamemaster', label: '' }, { v: 'conflict', label: '' }, { v: 'modded', label: '' }],
      },
      { id: 'mods', type: 'range', min: 0, max: 40, step: 1, def: 3, unit: 'mods' },
    ],
  },

  arma4: {
    icon: 'fa-crosshairs',
    accent: '#7a8b5a',
    fields: [
      { id: 'players', type: 'range', min: 8, max: 128, step: 8, def: 32, unit: 'players' },
      {
        id: 'scenario', type: 'select', def: 'gamemaster',
        options: [{ v: 'gamemaster', label: '' }, { v: 'conflict', label: '' }, { v: 'modded', label: '' }],
      },
      { id: 'mods', type: 'range', min: 0, max: 60, step: 1, def: 5, unit: 'mods' },
    ],
  },

  teamspeak: {
    icon: 'fa-headset',
    accent: '#3a7fd5',
    fields: [
      { id: 'users', type: 'range', min: 2, max: 512, step: 2, def: 32, unit: 'users' },
      {
        id: 'quality', type: 'select', def: 'normal',
        options: [{ v: 'low', label: '' }, { v: 'normal', label: '' }, { v: 'high', label: '' }],
      },
      {
        id: 'talkRatio', type: 'select', def: 'mixed',
        options: [{ v: 'quiet', label: '' }, { v: 'mixed', label: '' }, { v: 'busy', label: '' }],
      },
    ],
  },

  mumble: {
    icon: 'fa-microphone-lines',
    accent: '#d4772e',
    fields: [
      { id: 'users', type: 'range', min: 2, max: 512, step: 2, def: 32, unit: 'users' },
      {
        id: 'quality', type: 'select', def: 'normal',
        options: [{ v: 'low', label: '' }, { v: 'normal', label: '' }, { v: 'high', label: '' }],
      },
      {
        id: 'talkRatio', type: 'select', def: 'mixed',
        options: [{ v: 'quiet', label: '' }, { v: 'mixed', label: '' }, { v: 'busy', label: '' }],
      },
    ],
  },

  palworld: {
    icon: 'fa-paw',
    accent: '#4fb0e8',
    fields: [
      { id: 'players', type: 'range', min: 1, max: 32, step: 1, def: 8, unit: 'players' },
      {
        id: 'baseStage', type: 'select', def: 'early',
        options: [{ v: 'early', label: '' }, { v: 'mid', label: '' }, { v: 'late', label: '' }],
      },
      { id: 'backups', type: 'range', min: 0, max: 30, step: 1, def: 7, unit: 'copies' },
    ],
  },

  ark: {
    icon: 'fa-dragon',
    accent: '#e07b39',
    fields: [
      { id: 'players', type: 'range', min: 1, max: 127, step: 1, def: 12, unit: 'players' },
      {
        id: 'arkStage', type: 'select', def: 'fresh',
        options: [{ v: 'fresh', label: '' }, { v: 'established', label: '' }, { v: 'veteran', label: '' }],
      },
      { id: 'mods', type: 'range', min: 0, max: 40, step: 1, def: 0, unit: 'mods' },
      { id: 'backups', type: 'range', min: 0, max: 30, step: 1, def: 5, unit: 'copies' },
    ],
  },

  valheim: {
    icon: 'fa-shield-halved',
    accent: '#6ba3c9',
    fields: [
      { id: 'players', type: 'range', min: 1, max: 20, step: 1, def: 5, unit: 'players' },
      {
        id: 'worldStage', type: 'select', def: 'established',
        options: [{ v: 'fresh', label: '' }, { v: 'established', label: '' }, { v: 'heavy', label: '' }],
      },
      { id: 'mods', type: 'range', min: 0, max: 60, step: 1, def: 0, unit: 'mods' },
      { id: 'backups', type: 'range', min: 0, max: 30, step: 1, def: 7, unit: 'copies' },
    ],
  },

  zomboid: {
    icon: 'fa-biohazard',
    accent: '#9ab53c',
    fields: [
      { id: 'players', type: 'range', min: 1, max: 64, step: 1, def: 8, unit: 'players' },
      {
        id: 'zombiePop', type: 'select', def: 'normal',
        options: [{ v: 'low', label: '' }, { v: 'normal', label: '' }, { v: 'high', label: '' }, { v: 'insane', label: '' }],
      },
      { id: 'mods', type: 'range', min: 0, max: 60, step: 1, def: 10, unit: 'mods' },
      { id: 'backups', type: 'range', min: 0, max: 30, step: 1, def: 7, unit: 'copies' },
    ],
  },

  satisfactory: {
    icon: 'fa-industry',
    accent: '#e59b28',
    fields: [
      { id: 'players', type: 'range', min: 1, max: 8, step: 1, def: 4, unit: 'players' },
      {
        id: 'stage', type: 'select', def: 'mid',
        options: [{ v: 'early', label: '' }, { v: 'mid', label: '' }, { v: 'late', label: '' }, { v: 'mega', label: '' }],
      },
      { id: 'mods', type: 'range', min: 0, max: 100, step: 1, def: 0, unit: 'mods' },
      { id: 'autosaves', type: 'range', min: 1, max: 20, step: 1, def: 5, unit: 'saves' },
      { id: 'backups', type: 'range', min: 0, max: 30, step: 1, def: 7, unit: 'copies' },
    ],
  },
};

/* ------------------------------------------------------------- Minecraft */

function calcMinecraft(v) {
  const sw = MC_SOFTWARE[v.software];
  const plugins = sw.plugins ? v.plugins : 0;
  const mods = sw.mods ? v.mods : 0;

  // --- memory ------------------------------------------------------------
  // Heap is driven by how many distinct chunks are resident, not by head count.
  // Players cluster around spawn, shops and each other, so their view squares
  // overlap heavily - doubling the players is nowhere near doubling the chunks.
  // players^0.65 approximates that spread; the world border caps it.
  const chunksPerPlayer = Math.pow(2 * v.viewDistance + 1, 2);
  const worldChunks = Math.pow((v.worldRadius * 2) / 16, 2);
  const loadedChunks = Math.min(worldChunks, chunksPerPlayer * Math.pow(v.players, 0.65));

  const chunkMb = (loadedChunks * sw.kbPerChunk) / 1024;
  const liveMb =
    sw.baseMb +
    chunkMb * (1 + sw.entityFactor) +
    v.players * sw.perPlayerMb +
    plugins * 8 +
    mods * 25;

  // A JVM needs headroom above its live set or it collects constantly, and the
  // allocation rate rises with player count. Native servers just need slack
  // for allocator fragmentation.
  const gcHeadroom = 1.7 + v.players * 0.004;
  const procGb = round1(clamp((liveMb * (sw.java ? 1 : 1.25)) / 1024, 0.1, 128));
  const heapGb = sw.java ? stepRam(clamp((liveMb * gcHeadroom) / 1024, 1, 128)) : null;
  const systemGb = stepRam(sw.java ? heapGb * 1.25 + 1 : procGb * 1.4 + 0.75);

  // --- cpu ---------------------------------------------------------------
  // The tick loop is one thread on every JVM flavour here. Extra cores buy
  // chunk generation, GC and netty capacity - never more TPS.
  const simFactor = Math.pow(v.simDistance / 6, 1.4);
  const load =
    v.players * simFactor * sw.cpuEff * (1 + plugins * 0.008) * (1 + mods * 0.004);

  // One thread runs the tick loop, always. Everything on top of that - GC,
  // netty, chunk-generation workers - scales with how much work the server is
  // actually doing, and a quiet server genuinely needs almost none of it.
  // A one-player vanilla world at view distance 3 wants a single core.
  const cores = sw.threading === 'multi'
    ? clamp(Math.round(1 + v.players / sw.coresPer + load / 40), 2, sw.maxCores)
    : clamp(Math.round(1 + load / 40 + v.players / 60 + mods / 150), 1, sw.maxCores);
  // Folia shards the world into independently ticking regions and Pumpkin is
  // parallel by design; both spread tick work across cores at less than perfect
  // efficiency. Every other flavour ticks serially no matter how many cores.
  const parallel = sw.threading === 'multi' ? 1 + (cores - 1) * 0.45 : 1;
  // Sharding is bounded by the busiest region, not the average: players pile
  // into spawn, shops and events. Assume at least a quarter of the tick work
  // can land on one thread however many cores you throw at it.
  const effLoad = sw.threading === 'multi'
    ? Math.max(load / parallel, load * 0.25)
    : load;

  const clockGhz = effLoad < 20 ? 3.0 : effLoad < 45 ? 3.5 : effLoad < 80 ? 4.0 : effLoad < 130 ? 4.5 : 5.0;

  // --- tick budget (50 ms per tick) --------------------------------------
  const mspt = clamp(3 + effLoad * 0.28, 1, 200);

  // --- storage -----------------------------------------------------------
  const totalChunks = Math.pow((v.worldRadius * 2) / 16, 2);
  const generated = Math.min(totalChunks, v.players * 6000);
  const worldGb = (generated * 0.07) / 1024;
  const diskGb = Math.ceil(
    sw.diskBaseGb + worldGb + worldGb * 0.45 * v.backups + mods * 0.02 + 2
  );

  // --- network -----------------------------------------------------------
  const upMbps = round2(v.players * 0.12 * Math.pow(v.viewDistance / 10, 1.7));

  // --- warnings ----------------------------------------------------------
  const warn = [];
  if (sw.java && heapGb > 16) warn.push({ level: 'danger', key: 'w.heapBig' });
  if (v.players > 120 && sw.threading !== 'multi')
    warn.push({ level: 'warn', key: 'w.proxy' });
  if (v.software === 'folia' && v.players < 60)
    warn.push({ level: 'info', key: 'w.foliaOverkill' });
  if (v.viewDistance > 16) warn.push({ level: 'warn', key: 'w.viewDistance' });
  if (v.simDistance > 10) warn.push({ level: 'warn', key: 'w.simDistance' });
  if (sw.java && sw.threading !== 'multi') warn.push({ level: 'info', key: 'w.singleThread' });
  if (v.software === 'folia') warn.push({ level: 'warn', key: 'w.foliaPlugins' });
  if (v.software === 'folia') warn.push({ level: 'info', key: 'w.foliaSpread' });
  if (v.software === 'purpur') warn.push({ level: 'info', key: 'w.purpurThreads' });
  if (v.software === 'pumpkin') warn.push({ level: 'info', key: 'w.pumpkinAlpha' });
  if (v.software === 'pumpkin') warn.push({ level: 'info', key: 'w.pumpkinPlugins' });
  if (v.software === 'forge' && mods > 250) warn.push({ level: 'warn', key: 'w.modCount' });
  if (v.software === 'vanilla' && v.players > 20) warn.push({ level: 'info', key: 'w.usePaper' });
  if (mspt > 40) warn.push({ level: 'danger', key: 'w.tickRisk' });
  if (v.backups > 0 && worldGb > 20) warn.push({ level: 'info', key: 'w.backupOffsite' });

  return {
    heapGb, procGb, java: sw.java, systemGb, cores, clockGhz, mspt, tickBudget: 50,
    diskGb, upMbps, warn,
    subtitle: sw.label,
    ctx: { sw, plugins, mods },
  };
}

/* ------------------------------------------------------------------- Rust */

const WIPE_FACTOR = { fresh: 0.8, mid: 1.0, late: 1.3 };

function calcRust(v) {
  const wipe = WIPE_FACTOR[v.wipeAge];
  const plugins = v.framework === 'none' ? 0 : v.plugins;
  const frameworkOverhead = v.framework === 'oxide' ? 1.5 : v.framework === 'carbon' ? 1.0 : 0;

  const mapFactor = Math.pow(v.mapSize / 1000, 2) * 0.5;
  const ramGb = (4 + mapFactor + v.players * 0.04 + plugins * 0.05 + frameworkOverhead) * wipe;
  const systemGb = stepRam(ramGb + 1.5);

  const cores = clamp(Math.round(3 + v.players / 50 + plugins / 40), 4, 32);
  const load = v.players * wipe * (1 + plugins * 0.01) * (1 + mapFactor / 20);
  const clockGhz = load < 40 ? 3.4 : load < 90 ? 3.8 : load < 160 ? 4.2 : 4.6;

  const mspt = clamp(5 + load * 0.095, 2, 120);

  const mapGb = Math.pow(v.mapSize / 1000, 2) * 0.035 * wipe;
  const diskGb = Math.ceil(20 + mapGb + mapGb * 0.6 * v.backups + 5);
  // install (~20 GB) dominates; saves are megabytes, not gigabytes

  const upMbps = round2(v.players * 0.2 * (1 + mapFactor / 40));

  const warn = [];
  warn.push({ level: 'info', key: 'w.rustSsd' });
  if (v.mapSize >= 4500) warn.push({ level: 'warn', key: 'w.rustMap' });
  if (v.wipeAge === 'late') warn.push({ level: 'info', key: 'w.rustWipe' });
  if (v.players > 250) warn.push({ level: 'warn', key: 'w.rustPop' });
  if (mspt > 26) warn.push({ level: 'danger', key: 'w.tickRisk' });
  if (v.framework === 'oxide' && plugins > 40) warn.push({ level: 'warn', key: 'w.rustPlugins' });

  return {
    heapGb: null, java: false, systemGb, cores, clockGhz, mspt, tickBudget: 33,
    diskGb, upMbps, warn,
    subtitle: v.framework === 'none' ? 'Vanilla' : v.framework === 'oxide' ? 'Oxide / uMod' : 'Carbon',
    ctx: { plugins },
  };
}

/* ----------------------------------------------------------- Satisfactory */

const SF_STAGE = { early: 0, mid: 2.5, late: 6, mega: 12 };

function calcSatisfactory(v) {
  const stage = SF_STAGE[v.stage];
  const ramGb = 5 + stage + v.players * 0.7 + v.mods * 0.15;
  const systemGb = stepRam(ramGb + 1.5);

  const cores = clamp(Math.round(2.5 + stage / 5 + v.players / 4), 4, 16);
  const load = 20 + stage * 6 + v.players * 4 + v.mods * 0.4;
  const clockGhz = load < 45 ? 3.4 : load < 70 ? 3.8 : 4.2;
  const mspt = clamp(8 + stage * 1.6 + v.players * 0.9 + v.mods * 0.05, 3, 120);

  const saveMb = 40 + stage * 55 + v.mods * 2;
  const savesGb = (saveMb * v.autosaves) / 1024;
  const diskGb = Math.ceil(15 + savesGb + savesGb * 0.7 * v.backups + 3);

  const upMbps = round2(v.players * 0.6 + stage * 0.15);

  const warn = [];
  if (v.players > 4) warn.push({ level: 'warn', key: 'w.sfPlayers' });
  if (v.stage === 'mega') warn.push({ level: 'warn', key: 'w.sfMega' });
  if (v.mods > 0) warn.push({ level: 'info', key: 'w.sfMods' });
  warn.push({ level: 'info', key: 'w.sfSingleThread' });
  if (mspt > 28) warn.push({ level: 'danger', key: 'w.tickRisk' });

  return {
    heapGb: null, java: false, systemGb, cores, clockGhz, mspt, tickBudget: 33,
    diskGb, upMbps, warn,
    subtitle: 'Dedicated Server',
    ctx: {},
  };
}

/* --------------------------------------------------------------- Palworld */

const PAL_STAGE = { early: 0, mid: 3, late: 8 };

function calcPalworld(v) {
  const stage = PAL_STAGE[v.baseStage];
  // Palworld holds every pal, base and structure in memory and has a long
  // history of climbing until restarted. Size for the restart interval, not
  // for the first hour after one.
  const ramGb = 5 + v.players * 0.5 + stage;
  const systemGb = stepRam(ramGb + 2);

  const cores = clamp(Math.round(3 + v.players / 8), 4, 16);
  const load = v.players * 2.2 + stage * 4;
  const clockGhz = load < 30 ? 3.4 : load < 55 ? 3.8 : 4.2;
  const mspt = clamp(8 + v.players * 0.7 + stage * 2.5, 3, 120);

  const saveGb = 0.4 + stage * 0.7;
  const diskGb = Math.ceil(12 + saveGb + saveGb * 0.7 * v.backups + 3);
  const upMbps = round2(v.players * 0.35);

  const warn = [];
  warn.push({ level: 'warn', key: 'w.palLeak' });
  if (v.baseStage !== 'early') warn.push({ level: 'info', key: 'w.palSave' });
  if (v.players > 16) warn.push({ level: 'warn', key: 'w.palPop' });
  warn.push({ level: 'info', key: 'w.palFlags' });
  if (mspt > 26) warn.push({ level: 'danger', key: 'w.tickRisk' });

  return {
    heapGb: null, java: false, systemGb, cores, clockGhz, mspt, tickBudget: 33,
    diskGb, upMbps, warn, subtitle: 'Dedicated Server', ctx: {},
  };
}

/* -------------------------------------------------- ARK: Survival Ascended */

const ARK_STAGE = { fresh: 0, established: 3, veteran: 7 };

function calcArk(v) {
  const stage = ARK_STAGE[v.arkStage];
  // Structures and tames dominate, not player count - and every figure here is
  // for ONE map. A cluster multiplies all of it.
  const ramGb = 8 + v.players * 0.12 + stage + v.mods * 0.25;
  const systemGb = stepRam(ramGb + 2);

  const cores = clamp(Math.round(3 + v.players / 20 + v.mods / 20), 4, 16);
  const load = v.players * 1.1 + stage * 5 + v.mods * 0.5;
  const clockGhz = load < 40 ? 3.6 : load < 70 ? 4.0 : 4.4;
  const mspt = clamp(10 + v.players * 0.35 + stage * 3 + v.mods * 0.15, 4, 120);

  const saveGb = 0.8 + stage * 0.9 + v.mods * 0.05;
  const diskGb = Math.ceil(70 + saveGb + saveGb * 0.7 * v.backups + 5);
  const upMbps = round2(v.players * 0.25);

  const warn = [];
  warn.push({ level: 'warn', key: 'w.arkPerMap' });
  warn.push({ level: 'info', key: 'w.arkAscended' });
  if (v.arkStage === 'veteran') warn.push({ level: 'warn', key: 'w.arkDecay' });
  if (v.mods > 15) warn.push({ level: 'warn', key: 'w.arkMods' });
  if (mspt > 26) warn.push({ level: 'danger', key: 'w.tickRisk' });

  return {
    heapGb: null, java: false, systemGb, cores, clockGhz, mspt, tickBudget: 33,
    diskGb, upMbps, warn, subtitle: 'Survival Ascended', ctx: {},
  };
}

/* ---------------------------------------------------------------- Valheim */

const VAL_STAGE = { fresh: 0, established: 1.4, heavy: 3.2 };

function calcValheim(v) {
  const stage = VAL_STAGE[v.worldStage];
  // Valheim keeps a ZDO for every placed piece in the world, so build count
  // drives memory far more than head count does.
  const ramGb = 1.8 + v.players * 0.28 + stage + v.mods * 0.08;
  const systemGb = stepRam(ramGb + 1);

  const cores = clamp(Math.round(1 + v.players / 4 + v.mods / 60), 2, 8);
  const load = v.players * 3 + stage * 8 + v.mods * 0.3;
  const clockGhz = load < 25 ? 3.2 : load < 45 ? 3.6 : 4.0;
  const mspt = clamp(6 + v.players * 1.1 + stage * 3 + v.mods * 0.1, 3, 120);

  const worldGb = 0.15 + stage * 0.4;
  const diskGb = Math.ceil(3 + worldGb + worldGb * 0.6 * v.backups + 2);
  const upMbps = round2(v.players * 0.3);

  const warn = [];
  warn.push({ level: 'info', key: 'w.valZdo' });
  if (v.players > 10) warn.push({ level: 'warn', key: 'w.valCap' });
  if (v.mods > 0) warn.push({ level: 'info', key: 'w.valMods' });
  if (v.worldStage === 'heavy') warn.push({ level: 'warn', key: 'w.valBuilds' });
  if (mspt > 26) warn.push({ level: 'danger', key: 'w.tickRisk' });

  return {
    heapGb: null, java: false, systemGb, cores, clockGhz, mspt, tickBudget: 33,
    diskGb, upMbps, warn, subtitle: 'Dedicated Server', ctx: {},
  };
}

/* -------------------------------------------------------- Project Zomboid */

const PZ_POP = { low: 0.6, normal: 1.0, high: 2.0, insane: 4.0 };

function calcZomboid(v) {
  const pop = PZ_POP[v.zombiePop];
  // Zomboid runs on the JVM, so it has a heap you set explicitly in
  // ProjectZomboid64.json. Roughly 2 GB plus half a gig per player.
  const heapRaw = 2 + v.players * 0.45 + v.mods * 0.02;
  const heapGb = stepRam(clamp(heapRaw, 2, 64));
  const systemGb = stepRam(heapGb * 1.15 + 0.75);

  const cores = clamp(Math.round(1 + v.players / 6 + v.mods / 60), 2, 12);
  const load = v.players * 3 * pop + v.mods * 0.4;
  const clockGhz = load < 25 ? 3.2 : load < 50 ? 3.6 : load < 90 ? 4.0 : 4.4;
  const mspt = clamp(6 + v.players * 0.5 * pop + v.mods * 0.05, 3, 120);

  const mapGb = 1.5 + v.players * 0.35;
  const diskGb = Math.ceil(5 + mapGb + mapGb * 0.5 * v.backups + 2);
  const upMbps = round2(v.players * 0.2 * (1 + (pop - 1) * 0.15));

  const warn = [];
  warn.push({ level: 'info', key: 'w.pzHeap' });
  if (pop >= 2) warn.push({ level: 'warn', key: 'w.pzPop' });
  if (v.mods > 0) warn.push({ level: 'info', key: 'w.pzMods' });
  if (v.players > 32) warn.push({ level: 'warn', key: 'w.pzPlayers' });
  if (mspt > 26) warn.push({ level: 'danger', key: 'w.tickRisk' });

  return {
    heapGb, java: true, systemGb, cores, clockGhz, mspt, tickBudget: 33,
    diskGb, upMbps, warn, subtitle: 'Build 41+', ctx: {},
  };
}

/* ----------------------------------------------------------------- Hytale */

/* The Nitrado PerformanceSaver docs describe the load curve precisely: a large
   group in a small area is cheap, while a few players each exploring alone is
   expensive. Same chunk-residency shape as Minecraft, steeper spread term. */
const HY_SPREAD = { clustered: 0.40, mixed: 0.70, explorers: 0.95 };

function calcHytale(v) {
  const spread = HY_SPREAD[v.spread];
  const chunksPerPlayer = Math.pow(2 * v.viewRadius + 1, 2);
  const loadedChunks = chunksPerPlayer * Math.pow(v.players, spread);

  let liveMb = 700 + (loadedChunks * 70) / 1024 * 1.3 + v.players * 4 + v.mods * 15;
  // PerformanceSaver shrinks the view radius under pressure and forces GC when
  // chunk counts say memory can be freed, so the working set stays lower.
  if (v.perfSaver) liveMb *= 0.75;

  const gcHeadroom = (v.perfSaver ? 1.5 : 1.75) + v.players * 0.004;
  const heapGb = stepRam(clamp((liveMb * gcHeadroom) / 1024, 1, 128));
  const systemGb = stepRam(heapGb * 1.25 + 1);

  let load = v.players * Math.pow(v.viewRadius / 8, 1.3) * (0.5 + spread) * (1 + v.mods * 0.01);
  if (v.perfSaver) load *= 0.78;           // TPS cap plus dynamic view radius

  const cores = clamp(Math.round(1 + load / 40 + v.players / 50 + v.mods / 40), 1, 12);
  const clockGhz = load < 20 ? 3.0 : load < 45 ? 3.5 : load < 80 ? 4.0 : 4.5;
  const mspt = clamp(4 + load * 0.30, 1, 200);

  const worldGb = 1 + v.players * 0.25 * (0.5 + spread);
  const diskGb = Math.ceil(4 + worldGb + worldGb * 0.5 * v.backups + v.mods * 0.05 + 2);
  const upMbps = round2(v.players * 0.12 * Math.pow(v.viewRadius / 8, 1.6));

  const warn = [];
  warn.push({ level: 'info', key: 'w.hyEarly' });
  if (!v.perfSaver) warn.push({ level: 'warn', key: 'w.hyNoSaver' });
  if (v.spread === 'explorers') warn.push({ level: 'warn', key: 'w.hySpread' });
  if (v.perfSaver) warn.push({ level: 'info', key: 'w.hySaverTps' });
  if (mspt > 40) warn.push({ level: 'danger', key: 'w.tickRisk' });

  return {
    heapGb, java: true, systemGb, cores, clockGhz, mspt, tickBudget: 50,
    diskGb, upMbps, warn, subtitle: v.perfSaver ? 'PerformanceSaver' : 'Early Access', ctx: {},
  };
}

/* ------------------------------------------------------------------ FiveM */

const FX_FW = { none: 0, esx: 1.0, qbcore: 1.5 };

function calcFivem(v) {
  // Community figures converge on 4-6 GB base plus 0.3-0.5 GB per player, with
  // resources and MLOs on top. The bottleneck is one thread, always.
  const ramGb = 3.5 + v.players * 0.28 + v.resources * 0.015 + FX_FW[v.framework];
  const systemGb = stepRam(ramGb + 0.5);

  const cores = clamp(Math.round(2 + v.players / 32 + v.resources / 200), 4, 16);
  const load = v.players * 1.4 + v.resources * 0.25 + FX_FW[v.framework] * 8;
  const clockGhz = load < 50 ? 4.0 : load < 100 ? 4.5 : 5.0;
  const mspt = clamp(4 + v.players * 0.2 + v.resources * 0.025 + FX_FW[v.framework] * 2, 2, 120);

  const resGb = 4 + v.resources * 0.08;
  const diskGb = Math.ceil(12 + resGb + resGb * 0.4 * v.backups + 3);
  const upMbps = round2(v.players * 0.08);

  const warn = [];
  warn.push({ level: 'info', key: 'w.fxSingleThread' });
  if (v.players > 32) warn.push({ level: 'warn', key: 'w.fxOneSync' });
  if (v.resources > 150) warn.push({ level: 'warn', key: 'w.fxResmon' });
  warn.push({ level: 'info', key: 'w.fxDatabase' });
  if (mspt > 26) warn.push({ level: 'danger', key: 'w.tickRisk' });

  return {
    heapGb: null, java: false, systemGb, cores, clockGhz, mspt, tickBudget: 33,
    diskGb, upMbps, warn,
    subtitle: v.framework === 'none' ? 'CFX Default' : v.framework === 'esx' ? 'ESX' : 'QBCore',
    ctx: {},
  };
}

/* ------------------------------------------------------- Counter-Strike 2 */

function calcCs2(v) {
  const modeCost = v.csMode === 'competitive' ? 1.0 : v.csMode === 'casual' ? 1.15 : 1.35;
  const ramGb = 1.2 + v.players * 0.05 + v.plugins * 0.04;
  const systemGb = stepRam(ramGb + 1);

  const cores = clamp(Math.round(1 + v.players / 24 + v.plugins / 20), 2, 6);
  const load = v.players * modeCost + v.plugins * 0.4;
  const clockGhz = load < 20 ? 3.4 : load < 40 ? 3.8 : 4.2;
  // 64-tick server: the whole budget is 15.6 ms, which is why clock beats cores.
  const mspt = clamp(1.5 + v.players * 0.12 * modeCost + v.plugins * 0.06, 0.5, 60);

  const diskGb = 45;
  const upMbps = round2(v.players * 0.2);

  const warn = [];
  warn.push({ level: 'info', key: 'w.csTick' });
  if (v.plugins > 0) warn.push({ level: 'info', key: 'w.csMetamod' });
  if (v.players > 32) warn.push({ level: 'warn', key: 'w.csPop' });
  if (mspt > 12) warn.push({ level: 'danger', key: 'w.tickRisk' });

  return {
    heapGb: null, java: false, systemGb, cores, clockGhz, mspt, tickBudget: 15.6,
    diskGb, upMbps, warn, subtitle: 'Source 2 dedicated', ctx: {},
  };
}

/* ----------------------------------------------------- Counter-Strike 1.6 */

function calcCs16(v) {
  // HLDS from 1999. The whole server fits in the L3 cache of a modern CPU.
  const ramMb = 64 + v.players * 6 + v.plugins * 4;
  const procGb = round1(ramMb / 1024);
  const systemGb = stepRam(procGb + 0.5);

  const cores = 1;
  const load = v.players * 0.8 + v.plugins * 0.3;
  const clockGhz = 2.4;
  // sys_ticrate 100 -> a 10 ms frame budget.
  const mspt = clamp(0.4 + v.players * 0.06 + v.plugins * 0.04, 0.1, 30);

  const diskGb = 2;
  const upMbps = round2(v.players * 0.05);

  const warn = [];
  warn.push({ level: 'info', key: 'w.cs16Tiny' });
  warn.push({ level: 'info', key: 'w.cs16Legacy' });
  if (v.plugins > 0) warn.push({ level: 'info', key: 'w.cs16Amx' });

  return {
    heapGb: null, java: false, procGb, systemGb, cores, clockGhz, mspt, tickBudget: 10,
    diskGb, upMbps, warn, subtitle: 'HLDS', ctx: {},
  };
}

/* --------------------------------------------- ARK: Survival Evolved (ASE) */

function calcArkSe(v) {
  const stage = ARK_STAGE[v.arkStage];
  const ramGb = 6 + v.players * 0.1 + stage * 0.8 + v.mods * 0.2;
  const systemGb = stepRam(ramGb + 1.5);

  const cores = clamp(Math.round(2.5 + v.players / 25 + v.mods / 25), 4, 12);
  const load = v.players * 0.9 + stage * 4 + v.mods * 0.5;
  const clockGhz = load < 35 ? 3.4 : load < 65 ? 3.8 : 4.2;
  const mspt = clamp(7 + v.players * 0.28 + stage * 2.2 + v.mods * 0.12, 3, 120);

  const saveGb = 0.5 + stage * 0.5 + v.mods * 0.03;
  const diskGb = Math.ceil(25 + saveGb + saveGb * 0.7 * v.backups + 3);
  const upMbps = round2(v.players * 0.2);

  const warn = [];
  warn.push({ level: 'warn', key: 'w.arkPerMap' });
  warn.push({ level: 'info', key: 'w.aseVsAsa' });
  if (v.arkStage === 'veteran') warn.push({ level: 'warn', key: 'w.arkDecay' });
  if (v.mods > 10) warn.push({ level: 'warn', key: 'w.arkMods' });
  if (mspt > 26) warn.push({ level: 'danger', key: 'w.tickRisk' });

  return {
    heapGb: null, java: false, systemGb, cores, clockGhz, mspt, tickBudget: 33,
    diskGb, upMbps, warn, subtitle: 'Survival Evolved', ctx: {},
  };
}

/* --------------------------------------------------- Arma Reforger / Arma 4 */

const ARMA_SCENARIO = { gamemaster: 0, conflict: 1.4, modded: 2.2 };

function calcArma(v, future) {
  const sc = ARMA_SCENARIO[v.scenario];
  // Enfusion. Conflict runs a lot of AI, and AI is the whole CPU story here.
  const scale = future ? 1.5 : 1.0;
  const ramGb = (3 + v.players * 0.12 + sc + v.mods * 0.15) * scale;
  const systemGb = stepRam(ramGb + 1.5);

  const cores = clamp(Math.round(2 + v.players / 24 + v.mods / 30), 4, 16);
  const load = (v.players * 0.9 + sc * 12 + v.mods * 0.6) * scale;
  const clockGhz = load < 45 ? 3.6 : load < 85 ? 4.0 : 4.4;
  const mspt = clamp((5 + v.players * 0.22 + sc * 4 + v.mods * 0.25) * (future ? 1.15 : 1), 2, 120);

  const diskGb = Math.ceil((future ? 40 : 15) + v.mods * 0.4 + 3);
  const upMbps = round2(v.players * 0.25 * scale);

  const warn = [];
  if (future) warn.push({ level: 'danger', key: 'w.arma4Unreleased' });
  warn.push({ level: 'info', key: 'w.armaAi' });
  if (v.scenario === 'conflict') warn.push({ level: 'warn', key: 'w.armaConflict' });
  if (v.mods > 10) warn.push({ level: 'warn', key: 'w.armaMods' });
  if (mspt > 26) warn.push({ level: 'danger', key: 'w.tickRisk' });

  return {
    heapGb: null, java: false, systemGb, cores, clockGhz, mspt, tickBudget: 33,
    diskGb, upMbps, warn,
    subtitle: future ? 'Estimated — unreleased' : 'Enfusion engine', ctx: {},
  };
}

/* ------------------------------------------------- TeamSpeak / Mumble (voice) */

const VOICE_KBPS = {
  teamspeak: { low: 25, normal: 45, high: 77 },
  mumble: { low: 24, normal: 40, high: 72 },
};
const TALK_RATIO = { quiet: 0.08, mixed: 0.20, busy: 0.40 };

function calcVoice(v, kind) {
  const kbps = VOICE_KBPS[kind][v.quality];
  const ratio = TALK_RATIO[v.talkRatio];
  const talkers = Math.max(1, Math.round(v.users * ratio));

  // A voice server is a packet mirror: each talker's stream is duplicated to
  // every other listener, so upload grows with talkers x listeners, not users.
  const upMbps = round2((talkers * (v.users - 1) * kbps * 1.35) / 1000);

  const baseMb = kind === 'teamspeak' ? 60 : 25;
  const procGb = round1((baseMb + v.users * 1.2) / 1024);
  const systemGb = stepRam(procGb + 0.75);

  const cores = clamp(Math.round(0.5 + talkers / 40), 1, 4);
  const clockGhz = 2.4;
  // Opus runs on 20 ms frames: every packet has to be mirrored inside one.
  const mspt = clamp(0.3 + (talkers * v.users) / 900, 0.1, 40);

  const diskGb = kind === 'teamspeak' ? 2 : 1;

  const warn = [];
  warn.push({ level: 'info', key: 'w.voiceBandwidth' });
  if (kind === 'teamspeak' && v.users > 32) warn.push({ level: 'warn', key: 'w.tsLicence' });
  if (kind === 'mumble') warn.push({ level: 'info', key: 'w.mumbleLight' });
  if (v.talkRatio === 'busy' && v.users > 64) warn.push({ level: 'warn', key: 'w.voiceChannels' });
  if (upMbps > 100) warn.push({ level: 'danger', key: 'w.voiceUplink' });

  return {
    heapGb: null, java: false, procGb, systemGb, cores, clockGhz, mspt, tickBudget: 20,
    diskGb, upMbps, warn,
    subtitle: kind === 'teamspeak' ? 'TeamSpeak 3 / 5' : 'Mumble (Murmur)', ctx: {},
  };
}

/* ------------------------------------------------------------- dispatcher */

/* URLs are shareable and hand-editable, and localStorage can hold values from
   an older version of the app. Anything reaching a formula gets clamped to its
   declared range, checked against its option list, or replaced by its default.
   Without this, "?software=bogus" is a blank page and "?players=abc" is NaN. */
function sanitize(game, raw) {
  const spec = GAMES[game];
  if (!spec) return null;
  const v = {};

  for (const f of spec.fields) {
    const given = raw ? raw[f.id] : undefined;

    if (f.type === 'select') {
      v[f.id] = f.options.some((o) => o.v === given) ? given : f.def;
    } else if (f.type === 'toggle') {
      v[f.id] = typeof given === 'boolean' ? given : given === 'true' ? true : given === 'false' ? false : f.def;
    } else {
      const n = Number(given);
      v[f.id] = Number.isFinite(n) ? clamp(n, f.min, f.max) : f.def;
    }
  }
  return v;
}

function calculate(game, rawValues) {
  const v = sanitize(game, rawValues);
  if (!v) throw new Error(`Unknown game: ${game}`);

  const r =
    game === 'minecraft' ? calcMinecraft(v)
      : game === 'rust' ? calcRust(v)
        : game === 'palworld' ? calcPalworld(v)
          : game === 'ark' ? calcArk(v)
            : game === 'valheim' ? calcValheim(v)
              : game === 'zomboid' ? calcZomboid(v)
                : game === 'hytale' ? calcHytale(v)
                  : game === 'fivem' ? calcFivem(v)
                    : game === 'cs2' ? calcCs2(v)
                      : game === 'cs16' ? calcCs16(v)
                        : game === 'arkse' ? calcArkSe(v)
                          : game === 'reforger' ? calcArma(v, false)
                            : game === 'arma4' ? calcArma(v, true)
                              : game === 'teamspeak' ? calcVoice(v, 'teamspeak')
                                : game === 'mumble' ? calcVoice(v, 'mumble')
                                  : calcSatisfactory(v);

  r.game = game;
  r.headroom = clamp(Math.round(((r.tickBudget - r.mspt) / r.tickBudget) * 100), 0, 100);
  r.trafficGb = Math.round(monthlyTraffic(r.upMbps));
  r.tier = pickTier(r);
  r.snippets = buildSnippets(game, v, r);
  return r;
}

/** Map the result onto a hardware class people can actually rent. */
function pickTier(r) {
  if (r.systemGb <= 4 && r.cores <= 2) return 'vps.small';
  if (r.systemGb <= 8 && r.clockGhz <= 3.5) return 'vps.shared';
  if (r.systemGb <= 16 && r.clockGhz <= 4.0) return 'vps.dedicated';
  if (r.systemGb <= 32) return 'metal.ryzen';
  return 'metal.big';
}

/* --------------------------------------------------------- capacity solver */

/* The calculator's inverse: people far more often own a box already than get to
   buy one for a workload. Binary-search the player slider for the largest count
   that fits inside a given RAM and core budget while staying inside the tick
   budget, and report which of the three actually ran out first. */
function capacity(game, values, budget) {
  const spec = GAMES[game];
  const field = spec.fields.find((f) => f.id === 'players' || f.id === 'users');
  if (!field) return null;

  const fits = (n) => {
    const r = calculate(game, { ...values, [field.id]: n });
    return {
      r,
      ram: r.systemGb <= budget.ramGb,
      cpu: r.cores <= budget.cores,
      tick: r.mspt <= r.tickBudget * 0.8,   // same threshold as the amber band
      get ok() { return this.ram && this.cpu && this.tick; },
    };
  };

  if (!fits(field.min).ok) {
    return { players: 0, field: field.id, limit: firstLimit(fits(field.min)), min: field.min, capped: false };
  }

  let lo = field.min;
  let hi = field.max;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2 / field.step) * field.step;
    if (mid > hi) break;
    if (fits(mid).ok) lo = mid; else hi = mid - field.step;
  }

  const at = fits(lo);
  // What stops the next step up? That is the thing worth upgrading.
  const next = fits(Math.min(field.max, lo + field.step));
  return {
    players: lo,
    field: field.id,
    result: at.r,
    limit: lo >= field.max ? null : firstLimit(next),
    capped: lo >= field.max,
    min: field.min,
  };
}

function firstLimit(f) {
  if (!f.ram) return 'ram';
  if (!f.cpu) return 'cpu';
  if (!f.tick) return 'tick';
  return null;
}

/* ---------------------------------------------------------------- snippets */

function aikarFlags(heapGb) {
  const big = heapGb >= 12;
  return [
    `java -Xms${heapGb}G -Xmx${heapGb}G \\`,
    '  -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 \\',
    '  -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC \\',
    '  -XX:+AlwaysPreTouch -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 \\',
    `  -XX:G1NewSizePercent=${big ? 40 : 30} -XX:G1MaxNewSizePercent=${big ? 50 : 40} \\`,
    `  -XX:G1HeapRegionSize=${big ? 16 : 8}M -XX:G1ReservePercent=${big ? 15 : 20} \\`,
    `  -XX:InitiatingHeapOccupancyPercent=${big ? 20 : 15} -XX:G1MixedGCLiveThresholdPercent=90 \\`,
    '  -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 \\',
    '  -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 \\',
    '  -Dusing.aikars.flags=https://mcflags.emc.gs -Daikars.new.flags=true \\',
    '  -jar server.jar --nogui',
  ].join('\n');
}

function buildSnippets(game, v, r) {
  if (game === 'minecraft') {
    const sw = MC_SOFTWARE[v.software];
    const start = sw.java
      ? aikarFlags(r.heapGb)
      : [
        '# Pumpkin ships as a single native binary - no JVM, no flags.',
        'curl -L -o pumpkin https://github.com/Pumpkin-MC/Pumpkin/releases/latest/download/pumpkin-x86_64-unknown-linux-gnu',
        'chmod +x pumpkin && ./pumpkin',
        '',
        '# or build from source for your exact CPU:',
        'git clone https://github.com/Pumpkin-MC/Pumpkin.git && cd Pumpkin',
        'RUSTFLAGS="-C target-cpu=native" cargo build --release',
      ].join('\n');

    const compose = sw.java
      ? [
        'services:',
        '  minecraft:',
        '    image: itzg/minecraft-server:latest',
        '    container_name: mc-server',
        '    ports: ["25565:25565"]',
        '    environment:',
        '      EULA: "TRUE"',
        `      TYPE: "${sw.type}"`,
        '      VERSION: "LATEST"',
        `      MEMORY: "${r.heapGb}G"`,
        '      USE_AIKAR_FLAGS: "true"',
        `      MAX_PLAYERS: "${v.players}"`,
        `      VIEW_DISTANCE: "${v.viewDistance}"`,
        `      SIMULATION_DISTANCE: "${v.simDistance}"`,
        `      MAX_WORLD_SIZE: "${v.worldRadius}"`,
        '    volumes: ["./data:/data"]',
        '    restart: unless-stopped',
        '    deploy:',
        '      resources:',
        `        limits: { cpus: "${r.cores}", memory: ${r.systemGb}G }`,
      ].join('\n')
      : [
        '# No official image yet - build one from the release binary:',
        'services:',
        '  pumpkin:',
        '    build: .',
        '    container_name: pumpkin-server',
        '    ports: ["25565:25565", "19132:19132/udp"]',
        '    volumes: ["./data:/data"]',
        '    restart: unless-stopped',
        '    deploy:',
        '      resources:',
        `        limits: { cpus: "${r.cores}", memory: ${r.systemGb}G }`,
      ].join('\n');

    const cfg = sw.java
      ? [
        '# server.properties',
        `max-players=${v.players}`,
        `view-distance=${v.viewDistance}`,
        `simulation-distance=${v.simDistance}`,
        `max-world-size=${v.worldRadius}`,
        'network-compression-threshold=256',
        'sync-chunk-writes=false',
        '',
        ...(sw.type === 'PAPER' || sw.type === 'PURPUR' ? [
          '# config/paper-world-defaults.yml',
          'chunks:',
          `  autosave-interval: 6000`,
          'entities:',
          '  spawning:',
          `    per-player-mob-spawns: true`,
          '  behavior:',
          '    disable-chest-cat-detection: true',
        ] : []),
      ].join('\n')
      : [
        '# configuration.toml',
        `max_players = ${v.players}`,
        `view_distance = ${v.viewDistance}`,
        `simulation_distance = ${v.simDistance}`,
        'default_difficulty = "Normal"',
        '',
        '# features.toml',
        'bedrock_support = true',
      ].join('\n');

    return { start, compose, cfg };
  }

  if (game === 'rust') {
    const start = [
      './RustDedicated -batchmode -nographics \\',
      '  +server.port 28015 +server.queryport 28017 \\',
      '  +server.identity "myserver" \\',
      '  +server.hostname "My Rust Server" \\',
      '  +server.level "Procedural Map" \\',
      `  +server.worldsize ${v.mapSize} \\`,
      '  +server.seed 1337 \\',
      `  +server.maxplayers ${v.players} \\`,
      '  +server.saveinterval 300 \\',
      '  +rcon.port 28016 +rcon.password "CHANGE_ME" +rcon.web 1 \\',
      '  -logfile ./logs/server.log',
    ].join('\n');

    const compose = [
      'services:',
      '  rust:',
      '    image: didstopia/rust-server:latest',
      '    container_name: rust-server',
      '    ports: ["28015:28015/udp", "28016:28016", "28082:28082"]',
      '    environment:',
      '      RUST_SERVER_NAME: "My Rust Server"',
      `      RUST_SERVER_WORLDSIZE: "${v.mapSize}"`,
      `      RUST_SERVER_MAXPLAYERS: "${v.players}"`,
      '      RUST_SERVER_SEED: "1337"',
      '      RUST_RCON_PASSWORD: "CHANGE_ME"',
      `      RUST_OXIDE_ENABLED: "${v.framework === 'oxide' ? 'true' : 'false'}"`,
      '    volumes: ["./data:/steamcmd/rust"]',
      '    restart: unless-stopped',
      '    deploy:',
      '      resources:',
      `        limits: { cpus: "${r.cores}", memory: ${r.systemGb}G }`,
    ].join('\n');

    const cfg = [
      '# server.cfg - drop in server/myserver/cfg/',
      'server.tickrate 30',
      'server.saveinterval 300',
      `server.maxplayers ${v.players}`,
      'fps.limit 256',
      'decay.upkeep true',
      '',
      '# Wipe housekeeping keeps the entity count - and the RAM curve - flat.',
      '# Full wipe: delete server/myserver/*.sav and player data monthly.',
    ].join('\n');

    return { start, compose, cfg };
  }

  if (game === 'hytale') {
    const start = [
      '# Hytale ships a JVM server. Heap goes on the java command line.',
      `java -Xms${r.heapGb}G -Xmx${r.heapGb}G \\`,
      '  -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 \\',
      '  -XX:+AlwaysPreTouch -XX:G1HeapRegionSize=8M \\',
      '  -jar hytale-server.jar nogui',
      '',
      ...(v.perfSaver ? [
        '# PerformanceSaver (Nitrado, MIT) - drop the jar in mods/',
        '#   https://www.curseforge.com/hytale/mods/nitrado-performancesaver',
      ] : [
        '# Consider PerformanceSaver: it caps TPS, shrinks the view radius under',
        '# pressure and forces GC, which prevents load-spike crashes outright.',
      ]),
    ].join('\n');
    const compose = [
      'services:',
      '  hytale:',
      '    image: eclipse-temurin:21-jre',
      '    container_name: hytale-server',
      '    working_dir: /data',
      '    command: >',
      `      java -Xms${r.heapGb}G -Xmx${r.heapGb}G -XX:+UseG1GC -jar hytale-server.jar nogui`,
      '    ports: ["5520:5520/udp"]',
      '    volumes: ["./data:/data"]',
      '    restart: unless-stopped',
      '    deploy:',
      '      resources:',
      `        limits: { cpus: "${r.cores}", memory: ${r.systemGb}G }`,
    ].join('\n');
    const cfg = [
      '# HytaleServerConfig',
      `maxPlayers = ${v.players}`,
      `viewRadius = ${v.viewRadius}`,
      '',
      ...(v.perfSaver ? [
        '# mods/performance-saver config',
        'tpsLimit = 20            # stable 20 beats fluctuating 30',
        'emptyServerTps = 5',
        'dynamicViewRadius = true',
        `minViewRadius = ${Math.max(4, v.viewRadius - 3)}`,
        `maxViewRadius = ${v.viewRadius}`,
      ] : [
        '# Without PerformanceSaver, size for the worst case: a handful of',
        '# players each exploring alone in different directions.',
      ]),
    ].join('\n');
    return { start, compose, cfg };
  }

  if (game === 'fivem') {
    const start = [
      'mkdir -p /opt/fivem && cd /opt/fivem',
      '# Grab the latest recommended build from the artifacts server',
      'curl -sLO https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/fx.tar.xz',
      'tar xf fx.tar.xz',
      '',
      './run.sh +exec server.cfg',
      '',
      '# txAdmin runs on :40120 for first-time setup and recipe deployment.',
    ].join('\n');
    const compose = [
      'services:',
      '  fivem:',
      '    image: spritsail/fivem:latest',
      '    container_name: fivem-server',
      '    ports: ["30120:30120/tcp", "30120:30120/udp", "40120:40120/tcp"]',
      '    environment:',
      '      LICENSE_KEY: "CHANGE_ME"   # keymaster.fivem.net',
      '    volumes: ["./server-data:/config"]',
      '    restart: unless-stopped',
      '    deploy:',
      '      resources:',
      `        limits: { cpus: "${r.cores}", memory: ${r.systemGb}G }`,
      '',
      '  mariadb:',
      '    image: mariadb:11',
      '    environment: { MARIADB_ROOT_PASSWORD: "CHANGE_ME", MARIADB_DATABASE: "fivem" }',
      '    volumes: ["./db:/var/lib/mysql"]',
      '    restart: unless-stopped',
    ].join('\n');
    const cfg = [
      '# server.cfg',
      'endpoint_add_tcp "0.0.0.0:30120"',
      'endpoint_add_udp "0.0.0.0:30120"',
      `sv_maxclients ${v.players}`,
      v.players > 32 ? 'set onesync on          # required above 32 slots' : '# set onesync on        # only needed above 32 slots',
      'sv_licenseKey "CHANGE_ME"',
      'set steam_webApiKey "none"',
      '',
      '# Profile before you upgrade: resmon in-game, or txAdmin.',
      '# Any resource holding >0.1 ms every tick is worth investigating.',
    ].join('\n');
    return { start, compose, cfg };
  }

  if (game === 'cs2') {
    const start = [
      '# SteamCMD, AppID 730 (CS2 dedicated server)',
      'steamcmd +force_install_dir /opt/cs2 \\',
      '  +login anonymous +app_update 730 validate +quit',
      '',
      '/opt/cs2/game/bin/linuxsteamrt64/cs2 -dedicated \\',
      '  -console -usercon -port 27015 \\',
      `  +game_type ${v.csMode === 'competitive' ? '0 +game_mode 1' : '0 +game_mode 0'} \\`,
      '  +map de_dust2 \\',
      `  +sv_setsteamaccount YOUR_GSLT -maxplayers_override ${v.players}`,
    ].join('\n');
    const compose = [
      'services:',
      '  cs2:',
      '    image: joedwards32/cs2:latest',
      '    container_name: cs2-server',
      '    ports: ["27015:27015/tcp", "27015:27015/udp"]',
      '    environment:',
      '      STEAMAPPVALIDATE: "0"',
      '      CS2_SERVERNAME: "My CS2 Server"',
      `      CS2_MAXPLAYERS: "${v.players}"`,
      `      CS2_GAMEALIAS: "${v.csMode}"`,
      '      CS2_RCONPW: "CHANGE_ME"',
      '      CS2_GSLT: "YOUR_TOKEN"   # steamcommunity.com/dev/managegameservers',
      '    volumes: ["./data:/home/steam/cs2-dedicated"]',
      '    restart: unless-stopped',
    ].join('\n');
    const cfg = [
      '# game/csgo/cfg/server.cfg',
      'sv_setsteamaccount "YOUR_GSLT"',
      'rcon_password "CHANGE_ME"',
      'sv_hibernate_when_empty 1     # idles the tick loop on an empty server',
      'sv_minrate 128000',
      'sv_maxrate 786432',
      '',
      '# CS2 is sub-tick, but the server still runs a 64-tick loop: a 15.6 ms',
      '# budget per frame. Clock speed decides everything here.',
    ].join('\n');
    return { start, compose, cfg };
  }

  if (game === 'cs16') {
    const start = [
      '# SteamCMD, AppID 90 (Half-Life dedicated server)',
      'steamcmd +force_install_dir /opt/hlds \\',
      '  +login anonymous +app_set_config 90 mod cstrike \\',
      '  +app_update 90 validate +quit',
      '',
      '/opt/hlds/hlds_run -game cstrike -console -pingboost 3 \\',
      `  +ip 0.0.0.0 +port 27015 +map de_dust2 +maxplayers ${v.players} \\`,
      '  +sys_ticrate 100',
    ].join('\n');
    const compose = [
      'services:',
      '  cs16:',
      '    image: pwntr/cs16-server:latest',
      '    container_name: cs16-server',
      '    ports: ["27015:27015/udp", "27015:27015/tcp"]',
      '    environment:',
      `      MAXPLAYERS: "${v.players}"`,
      '      MAP: "de_dust2"',
      '      RCON_PASSWORD: "CHANGE_ME"',
      '    volumes: ["./data:/opt/hlds/cstrike"]',
      '    restart: unless-stopped',
      '    deploy:',
      '      resources:',
      `        limits: { cpus: "${r.cores}", memory: ${r.systemGb}G }`,
    ].join('\n');
    const cfg = [
      '# cstrike/server.cfg',
      'hostname "My CS 1.6 Server"',
      'rcon_password "CHANGE_ME"',
      'sv_lan 0',
      'sys_ticrate 100',
      'sv_maxrate 25000',
      'sv_maxupdaterate 101',
      'mp_autoteambalance 1',
      '',
      '# AMX Mod X plugins live in cstrike/addons/amxmodx/configs/plugins.ini',
    ].join('\n');
    return { start, compose, cfg };
  }

  if (game === 'arkse') {
    const start = [
      '# SteamCMD, AppID 376030 (ARK: Survival Evolved dedicated server)',
      'steamcmd +force_install_dir /opt/ase \\',
      '  +login anonymous +app_update 376030 validate +quit',
      '',
      '/opt/ase/ShooterGame/Binaries/Linux/ShooterGameServer \\',
      `  TheIsland?listen?SessionName=MyServer?MaxPlayers=${v.players}?Port=7777?QueryPort=27015 \\`,
      '  -server -log -NoBattlEye',
      '',
      '# One process per map, exactly like Ascended.',
    ].join('\n');
    const compose = [
      'services:',
      '  ase:',
      '    image: hermsi/ark-server:latest',
      '    container_name: ase-island',
      '    ports: ["7777:7777/udp", "27015:27015/udp", "27020:27020/tcp"]',
      '    environment:',
      '      SESSIONNAME: "My ARK Server"',
      `      MAX_PLAYERS: "${v.players}"`,
      '      SERVERMAP: "TheIsland"',
      '      ADMIN_PASSWORD: "CHANGE_ME"',
      '      BACKUP_ONSTOP: "true"',
      '    volumes: ["./data:/app"]',
      '    restart: unless-stopped',
      '    deploy:',
      '      resources:',
      `        limits: { cpus: "${r.cores}", memory: ${r.systemGb}G }`,
    ].join('\n');
    const cfg = [
      '# ShooterGame/Saved/Config/LinuxServer/GameUserSettings.ini',
      '[ServerSettings]',
      `MaxPlayers=${v.players}`,
      'AutoSavePeriodMinutes=15',
      'TheMaxStructuresInRange=10500',
      'PvEStructureDecayPeriodMultiplier=1.0',
      '',
      '# ASE is 64-bit but ages badly: restart daily and keep decay enabled,',
      '# or structure count will outgrow whatever RAM you bought.',
    ].join('\n');
    return { start, compose, cfg };
  }

  if (game === 'reforger' || game === 'arma4') {
    const future = game === 'arma4';
    const start = [
      future
        ? '# Arma 4 is not released (Bohemia target: 2027). This is the Reforger'
        : '# SteamCMD, AppID 1874900 (Arma Reforger dedicated server)',
      future ? '# procedure, which Arma 4 is expected to resemble. Verify at launch.' : '',
      'steamcmd +force_install_dir /opt/reforger \\',
      '  +login anonymous +app_update 1874900 validate +quit',
      '',
      '/opt/reforger/ArmaReforgerServer \\',
      '  -config ./config.json -backendlog -nothrow \\',
      `  -maxFPS 60 -bindPort 2001`,
    ].filter(Boolean).join('\n');
    const compose = [
      'services:',
      '  reforger:',
      '    image: acemod/arma-reforger:latest',
      '    container_name: reforger-server',
      '    ports: ["2001:2001/udp", "17777:17777/udp"]',
      '    volumes: ["./config.json:/reforger/config.json", "./data:/reforger/profile"]',
      '    restart: unless-stopped',
      '    deploy:',
      '      resources:',
      `        limits: { cpus: "${r.cores}", memory: ${r.systemGb}G }`,
    ].join('\n');
    const cfg = [
      '# config.json',
      '{',
      '  "bindAddress": "0.0.0.0", "bindPort": 2001,',
      '  "game": {',
      '    "name": "My Server",',
      `    "maxPlayers": ${v.players},`,
      `    "scenarioId": "${v.scenario === 'conflict'
        ? '{ECC61978EDCC2B5A}Missions/23_Campaign.conf'
        : '{59AD59368755F41A}Missions/21_GM_Eden.conf'}",`,
      '    "gameProperties": {',
      '      "serverMaxViewDistance": 2500,',
      '      "networkViewDistance": 1500,',
      '      "serverMinGrassDistance": 50',
      '    }',
      '  }',
      '}',
      '',
      '# networkViewDistance is the big lever: it decides how many entities the',
      '# server replicates per player, and AI count decides the rest.',
    ].join('\n');
    return { start, compose, cfg };
  }

  if (game === 'teamspeak' || game === 'mumble') {
    const ts = game === 'teamspeak';
    const start = ts ? [
      '# TeamSpeak 3 server',
      'wget https://files.teamspeak-services.com/releases/server/3.13.7/teamspeak3-server_linux_amd64-3.13.7.tar.bz2',
      'tar xf teamspeak3-server_linux_amd64-*.tar.bz2 && cd teamspeak3-server_linux_amd64',
      'touch .ts3server_license_accepted',
      './ts3server_startscript.sh start',
      '',
      '# Note the ServerAdmin token printed on first start - it is shown once.',
    ].join('\n') : [
      '# Mumble server (Murmur)',
      'apt install mumble-server',
      'dpkg-reconfigure mumble-server      # sets the SuperUser password',
      'systemctl enable --now mumble-server',
    ].join('\n');
    const compose = ts ? [
      'services:',
      '  teamspeak:',
      '    image: teamspeak:latest',
      '    container_name: teamspeak',
      '    ports: ["9987:9987/udp", "10011:10011", "30033:30033"]',
      '    environment: { TS3SERVER_LICENSE: "accept" }',
      '    volumes: ["./data:/var/ts3server"]',
      '    restart: unless-stopped',
    ].join('\n') : [
      'services:',
      '  mumble:',
      '    image: mumblevoip/mumble-server:latest',
      '    container_name: mumble',
      '    ports: ["64738:64738/tcp", "64738:64738/udp"]',
      '    environment:',
      '      MUMBLE_CONFIG_SERVER_PASSWORD: ""',
      `      MUMBLE_CONFIG_USERS: "${v.users}"`,
      `      MUMBLE_CONFIG_BANDWIDTH: "${VOICE_KBPS.mumble[v.quality] * 1000}"`,
      '      MUMBLE_SUPERUSER_PASSWORD: "CHANGE_ME"',
      '    volumes: ["./data:/data"]',
      '    restart: unless-stopped',
    ].join('\n');
    const cfg = ts ? [
      '# ts3server.ini',
      'query_protocols=raw,ssh',
      'query_timeout=300',
      'licensepath=licensekey.dat',
      '',
      `# Slots: ${v.users}. The free licence caps a virtual server at 32 slots;`,
      '# a free non-profit licence raises it to 512 across 10 virtual servers.',
      '# Bandwidth is talkers x listeners: split big rooms into channels.',
    ].join('\n') : [
      '# /etc/mumble-server.ini',
      `users=${v.users}`,
      `bandwidth=${VOICE_KBPS.mumble[v.quality] * 1000}`,
      'opusthreshold=0',
      'sendversion=false',
      '',
      '# bandwidth is the PER-CLIENT ceiling in bits/s, not the server total.',
      '# Lower it before you buy a bigger uplink.',
    ].join('\n');
    return { start, compose, cfg };
  }

  if (game === 'palworld') {
    const start = [
      '# SteamCMD, AppID 2394010',
      'steamcmd +force_install_dir /opt/palworld \\',
      '  +login anonymous +app_update 2394010 validate +quit',
      '',
      '# The perf flags matter more here than on most servers.',
      '/opt/palworld/PalServer.sh -useperfthreads -NoAsyncLoadingThread \\',
      `  -UseMultithreadForDS -players=${v.players} -port=8211 -queryport=27015`,
    ].join('\n');

    const compose = [
      'services:',
      '  palworld:',
      '    image: thijsvanloef/palworld-server-docker:latest',
      '    container_name: palworld-server',
      '    ports: ["8211:8211/udp", "27015:27015/udp"]',
      '    environment:',
      '      PUID: "1000"',
      '      PGID: "1000"',
      '      PORT: "8211"',
      `      PLAYERS: "${v.players}"`,
      '      MULTITHREADING: "true"',
      '      RCON_ENABLED: "true"',
      '      RCON_PORT: "25575"',
      '      ADMIN_PASSWORD: "CHANGE_ME"',
      '      # Scheduled restarts keep memory in check.',
      '      AUTO_REBOOT_ENABLED: "true"',
      '      AUTO_REBOOT_CRON_EXPRESSION: "0 4 * * *"',
      '      BACKUP_ENABLED: "true"',
      '    volumes: ["./data:/palworld"]',
      '    restart: unless-stopped',
      '    deploy:',
      '      resources:',
      `        limits: { cpus: "${r.cores}", memory: ${r.systemGb}G }`,
    ].join('\n');

    const cfg = [
      '# Pal/Saved/Config/LinuxServer/PalWorldSettings.ini',
      '[/Script/Pal.PalGameWorldSettings]',
      `OptionSettings=(ServerPlayerMaxNum=${v.players},ServerName="My Palworld Server",`,
      '  bIsMultiplayer=True,DeathPenalty=All,bEnablePlayerToPlayerDamage=False,',
      '  BaseCampMaxNumInGuild=4,PalEggDefaultHatchingTime=2.0,',
      '  AutoSaveSpan=180.0,bIsUseBackupSaveData=True)',
      '',
      '# Fewer, larger guild bases cost far less memory than many small ones.',
    ].join('\n');

    return { start, compose, cfg };
  }

  if (game === 'ark') {
    const start = [
      '# SteamCMD, AppID 2430930 (Survival Ascended dedicated server)',
      'steamcmd +force_install_dir /opt/asa \\',
      '  +login anonymous +app_update 2430930 validate +quit',
      '',
      '/opt/asa/ShooterGame/Binaries/Win64/ArkAscendedServer.exe \\',
      `  TheIsland_WP?listen?MaxPlayers=${v.players}?Port=7777?QueryPort=27015 \\`,
      '  -servergamelog -NoBattlEye -WinLiveMaxPlayers=' + v.players,
      '',
      '# One process per map. A cluster of four maps needs four of these.',
    ].join('\n');

    const compose = [
      'services:',
      '  asa:',
      '    image: acekorneya/asa_server:latest',
      '    container_name: asa-island',
      '    ports: ["7777:7777/udp", "27015:27015/udp"]',
      '    environment:',
      '      MAP_NAME: "TheIsland_WP"',
      `      MAX_PLAYERS: "${v.players}"`,
      '      SESSION_NAME: "My ASA Server"',
      '      SERVER_ADMIN_PASSWORD: "CHANGE_ME"',
      '      CLUSTER_ID: "mycluster"',
      '      UPDATE_SERVER: "TRUE"',
      '    volumes: ["./data:/home/pok/arkserver"]',
      '    restart: unless-stopped',
      '    deploy:',
      '      resources:',
      `        limits: { cpus: "${r.cores}", memory: ${r.systemGb}G }`,
    ].join('\n');

    const cfg = [
      '# ShooterGame/Saved/Config/WindowsServer/GameUserSettings.ini',
      '[ServerSettings]',
      `MaxPlayers=${v.players}`,
      'AutoSavePeriodMinutes=15',
      'StructureResistanceMultiplier=1.0',
      'TheMaxStructuresInRange=10500',
      '',
      '# Decay is the only thing keeping structure count - and RAM - bounded.',
      'PvEStructureDecayPeriodMultiplier=1.0',
      'bAutoPvEUseSystemTime=false',
    ].join('\n');

    return { start, compose, cfg };
  }

  if (game === 'valheim') {
    const start = [
      '# SteamCMD, AppID 896660',
      'steamcmd +force_install_dir /opt/valheim \\',
      '  +login anonymous +app_update 896660 validate +quit',
      '',
      'export templdpath=$LD_LIBRARY_PATH',
      'export LD_LIBRARY_PATH=/opt/valheim/linux64:$LD_LIBRARY_PATH',
      'export SteamAppId=892970',
      '',
      '/opt/valheim/valheim_server.x86_64 \\',
      '  -name "My Valheim Server" -port 2456 -world "Dedicated" \\',
      '  -password "CHANGE_ME" -crossplay -savedir /opt/valheim/data',
    ].join('\n');

    const compose = [
      'services:',
      '  valheim:',
      '    image: lloesche/valheim-server:latest',
      '    container_name: valheim-server',
      '    ports: ["2456-2457:2456-2457/udp"]',
      '    environment:',
      '      SERVER_NAME: "My Valheim Server"',
      '      WORLD_NAME: "Dedicated"',
      '      SERVER_PASS: "CHANGE_ME"',
      '      SERVER_PUBLIC: "true"',
      '      BACKUPS_INTERVAL: "3600"',
      `      BACKUPS_MAX_COUNT: "${v.backups}"`,
      '      UPDATE_CRON: "0 4 * * *"',
      '    volumes: ["./config:/config", "./data:/opt/valheim"]',
      '    cap_add: ["sys_nice"]',
      '    restart: unless-stopped',
      '    deploy:',
      '      resources:',
      `        limits: { cpus: "${r.cores}", memory: ${r.systemGb}G }`,
    ].join('\n');

    const cfg = [
      '# config/adminlist.txt - one SteamID64 per line',
      '76561198000000000',
      '',
      '# Valheim has no tuning file worth the name. The levers that matter:',
      '#   - keep the world trimmed; every dropped item is a ZDO forever',
      '#   - restart weekly so the ZDO table gets rebuilt',
      '#   - back up worlds/local/Dedicated.db AND .fwl together, they pair up',
    ].join('\n');

    return { start, compose, cfg };
  }

  if (game === 'zomboid') {
    const start = [
      '# SteamCMD, AppID 380870',
      'steamcmd +force_install_dir /opt/pz \\',
      '  +login anonymous +app_update 380870 validate +quit',
      '',
      '# Heap is set in ProjectZomboid64.json, NOT on the command line.',
      `#   "-Xmx${r.heapGb}g", "-Xms${r.heapGb}g"`,
      '',
      '/opt/pz/start-server.sh -servername myserver -adminpassword CHANGE_ME',
    ].join('\n');

    const compose = [
      'services:',
      '  zomboid:',
      '    image: renegademaster/zomboid-dedicated-server:latest',
      '    container_name: zomboid-server',
      '    ports: ["16261:16261/udp", "16262:16262/udp"]',
      '    environment:',
      '      SERVER_NAME: "myserver"',
      `      MAX_PLAYERS: "${v.players}"`,
      `      MAX_RAM: "${r.heapGb}g"`,
      '      ADMIN_PASSWORD: "CHANGE_ME"',
      '      AUTOSAVE_INTERVAL: "15"',
      '      PAUSE_ON_EMPTY: "true"',
      '    volumes: ["./data:/home/steam/ZomboidDedicatedServer"]',
      '    restart: unless-stopped',
      '    deploy:',
      '      resources:',
      `        limits: { cpus: "${r.cores}", memory: ${r.systemGb}G }`,
    ].join('\n');

    const cfg = [
      '# Zomboid/Server/myserver.ini',
      `MaxPlayers=${v.players}`,
      'PauseEmpty=true',
      'SaveWorldEveryMinutes=15',
      'ZombiePopulationMultiplier=' + PZ_POP[v.zombiePop].toFixed(1),
      '',
      '# Zomboid/Server/myserver_SandboxVars.lua',
      '#   Zombies = population preset, RespawnHours, RedistributeHours',
      '#   Higher population is the single biggest CPU cost on the server.',
    ].join('\n');

    return { start, compose, cfg };
  }

  const start = [
    '# Install via SteamCMD (AppID 1690800)',
    'steamcmd +force_install_dir /opt/satisfactory \\',
    '  +login anonymous +app_update 1690800 validate +quit',
    '',
    '/opt/satisfactory/FactoryServer.sh -multihome=0.0.0.0',
  ].join('\n');

  const compose = [
    'services:',
    '  satisfactory:',
    '    image: wolveix/satisfactory-server:latest',
    '    container_name: satisfactory-server',
    '    ports: ["7777:7777/udp", "7777:7777/tcp"]',
    '    environment:',
    '      MAXPLAYERS: "' + v.players + '"',
    '      PGID: "1000"',
    '      PUID: "1000"',
    `      MEMORY_LIMIT: "${r.systemGb}G"`,
    '      AUTOSAVENUM: "' + v.autosaves + '"',
    '    volumes: ["./data:/config"]',
    '    restart: unless-stopped',
    '    deploy:',
    '      resources:',
    `        limits: { cpus: "${r.cores}", memory: ${r.systemGb}G }`,
  ].join('\n');

  const cfg = [
    '# Saved/Config/LinuxServer/Game.ini',
    '[/Script/FactoryGame.FGSaveSession]',
    `mNumRotatingAutosaves=${v.autosaves}`,
    '',
    '# Saved/Config/LinuxServer/Engine.ini',
    '[/Script/Engine.Player]',
    'ConfiguredInternetSpeed=104857600',
    'ConfiguredLanSpeed=104857600',
    '[/Script/OnlineSubsystemUtils.IpNetDriver]',
    'MaxClientRate=104857600',
    'MaxInternetClientRate=104857600',
  ].join('\n');

  return { start, compose, cfg };
}

const SYSTEMD = (game, cores, mem) => [
  '[Unit]',
  `Description=${game} dedicated server`,
  'After=network-online.target',
  '',
  '[Service]',
  'User=gameserver',
  'WorkingDirectory=/opt/gameserver',
  'ExecStart=/opt/gameserver/start.sh',
  'Restart=on-failure',
  'RestartSec=15',
  `CPUQuota=${cores * 100}%`,
  `MemoryMax=${mem}G`,
  'Nice=-5',
  '',
  '[Install]',
  'WantedBy=multi-user.target',
].join('\n');
