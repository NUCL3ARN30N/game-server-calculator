/* Bilingual string table. Key -> { en, de } */

const STRINGS = {
  'app.name': { en: 'Server Genius', de: 'Server Genius' },
  'app.tagline': { en: 'Game server calculator', de: 'Game-Server-Rechner' },
  'app.lead': {
    en: 'Size a dedicated server before you rent it. Pick a game, describe the server you want to run, and get the memory, cores, disk and bandwidth it will actually need.',
    de: 'Dimensioniere deinen Server, bevor du ihn mietest. Spiel auswählen, Server beschreiben – und du bekommst RAM, Kerne, Speicher und Bandbreite, die du wirklich brauchst.',
  },

  'hero.badge': { en: '16 servers · 7 Minecraft flavours', de: '16 Server · 7 Minecraft-Varianten' },
  'hero.a': { en: 'Size it once.', de: 'Einmal richtig planen.' },
  'hero.b': { en: 'Rent it right.', de: 'Einmal richtig mieten.' },

  'u.players': { en: 'players', de: 'Spieler' },
  'u.chunks': { en: 'chunks', de: 'Chunks' },
  'u.blocks': { en: 'blocks', de: 'Blöcke' },
  'u.copies': { en: 'copies', de: 'Kopien' },
  'u.plugins': { en: 'plugins', de: 'Plugins' },
  'u.mods': { en: 'mods', de: 'Mods' },
  'u.saves': { en: 'saves', de: 'Saves' },
  'u.m': { en: 'm', de: 'm' },
  'u.resources': { en: 'resources', de: 'Resources' },
  'u.users': { en: 'users', de: 'Nutzer' },
  'on': { en: 'On', de: 'An' },
  'off': { en: 'Off', de: 'Aus' },

  'nav.github': { en: 'Source', de: 'Quellcode' },
  'nav.theme': { en: 'Switch theme', de: 'Design wechseln' },
  'nav.lang': { en: 'Switch language', de: 'Sprache wechseln' },

  'game.pick': { en: 'Game', de: 'Spiel' },
  'game.minecraft': { en: 'Minecraft', de: 'Minecraft' },
  'game.minecraft.sub': { en: 'Vanilla, Spigot, Paper, Purpur, Forge, Pumpkin', de: 'Vanilla, Spigot, Paper, Purpur, Forge, Pumpkin' },
  'game.hytale': { en: 'Hytale', de: 'Hytale' },
  'game.hytale.sub': { en: 'JVM server, Early Access', de: 'JVM-Server, Early Access' },
  'game.fivem': { en: 'FiveM', de: 'FiveM' },
  'game.fivem.sub': { en: 'GTA V roleplay, one hot thread', de: 'GTA-V-Roleplay, ein heißer Thread' },
  'game.cs2': { en: 'Counter-Strike 2', de: 'Counter-Strike 2' },
  'game.cs2.sub': { en: '64-tick, 15.6 ms budget', de: '64 Tick, 15,6 ms Budget' },
  'game.cs16': { en: 'Counter-Strike 1.6', de: 'Counter-Strike 1.6' },
  'game.cs16.sub': { en: 'HLDS — runs on almost nothing', de: 'HLDS – läuft auf fast nichts' },
  'game.arkse': { en: 'ARK: Evolved', de: 'ARK: Evolved' },
  'game.arkse.sub': { en: 'Per map, lighter than Ascended', de: 'Pro Karte, leichter als Ascended' },
  'game.reforger': { en: 'Arma Reforger', de: 'Arma Reforger' },
  'game.reforger.sub': { en: 'Enfusion, AI-bound', de: 'Enfusion, KI-limitiert' },
  'game.arma4': { en: 'Arma 4', de: 'Arma 4' },
  'game.arma4.sub': { en: 'Unreleased — estimates only', de: 'Unveröffentlicht – nur Schätzung' },
  'game.teamspeak': { en: 'TeamSpeak', de: 'TeamSpeak' },
  'game.teamspeak.sub': { en: 'Bandwidth, not CPU', de: 'Bandbreite statt CPU' },
  'game.mumble': { en: 'Mumble', de: 'Mumble' },
  'game.mumble.sub': { en: 'Murmur, very light', de: 'Murmur, sehr leichtgewichtig' },

  'game.palworld': { en: 'Palworld', de: 'Palworld' },
  'game.palworld.sub': { en: 'Guild bases, pals, 32-player cap', de: 'Gilden-Basen, Pals, 32-Spieler-Limit' },
  'game.ark': { en: 'ARK: Ascended', de: 'ARK: Ascended' },
  'game.ark.sub': { en: 'Per map — clusters multiply', de: 'Pro Karte – Cluster vervielfachen' },
  'game.valheim': { en: 'Valheim', de: 'Valheim' },
  'game.valheim.sub': { en: 'Build-heavy worlds, crossplay', de: 'Bau-lastige Welten, Crossplay' },
  'game.zomboid': { en: 'Project Zomboid', de: 'Project Zomboid' },
  'game.zomboid.sub': { en: 'Java heap, zombie population', de: 'Java-Heap, Zombie-Population' },

  'game.rust': { en: 'Rust', de: 'Rust' },
  'game.rust.sub': { en: 'Procedural map, Oxide or Carbon', de: 'Procedural Map, Oxide oder Carbon' },
  'game.satisfactory': { en: 'Satisfactory', de: 'Satisfactory' },
  'game.satisfactory.sub': { en: 'Dedicated server, co-op factories', de: 'Dedicated Server, Koop-Fabriken' },

  'g.search': { en: 'Filter games…', de: 'Spiele filtern…' },
  'g.none': { en: 'No game matches that.', de: 'Kein Spiel passt dazu.' },

  'cfg.title': { en: 'Your server', de: 'Dein Server' },
  'cfg.reset': { en: 'Reset', de: 'Zurücksetzen' },

  /* field labels */
  'f.software': { en: 'Server software', de: 'Server-Software' },
  'f.players': { en: 'Peak players', de: 'Spieler (Peak)' },
  'f.viewDistance': { en: 'View distance', de: 'Sichtweite' },
  'f.simDistance': { en: 'Simulation distance', de: 'Simulationsdistanz' },
  'f.worldRadius': { en: 'World border radius', de: 'Weltgrenze (Radius)' },
  'f.plugins': { en: 'Plugins', de: 'Plugins' },
  'f.mods': { en: 'Mods', de: 'Mods' },
  'f.backups': { en: 'Backups kept', de: 'Aufbewahrte Backups' },
  'f.mapSize': { en: 'Map size', de: 'Kartengröße' },
  'f.wipeAge': { en: 'Time since wipe', de: 'Zeit seit Wipe' },
  'f.framework': { en: 'Modding framework', de: 'Modding-Framework' },
  'f.stage': { en: 'Factory stage', de: 'Fabrik-Ausbaustufe' },
  'f.viewRadius': { en: 'View radius', de: 'Sichtradius' },
  'f.spread': { en: 'How players play', de: 'Spielverhalten' },
  'f.perfSaver': { en: 'Nitrado PerformanceSaver', de: 'Nitrado PerformanceSaver' },
  'f.resources': { en: 'Resources / scripts', de: 'Resources / Skripte' },
  'f.csMode': { en: 'Game mode', de: 'Spielmodus' },
  'f.scenario': { en: 'Scenario', de: 'Szenario' },
  'f.users': { en: 'Concurrent users', de: 'Gleichzeitige Nutzer' },
  'f.quality': { en: 'Codec quality', de: 'Codec-Qualität' },
  'f.talkRatio': { en: 'How much talking', de: 'Sprechanteil' },
  'f.baseStage': { en: 'Base development', de: 'Basis-Ausbau' },
  'f.arkStage': { en: 'Server age', de: 'Server-Alter' },
  'f.worldStage': { en: 'World development', de: 'Welt-Ausbau' },
  'f.zombiePop': { en: 'Zombie population', de: 'Zombie-Population' },
  'f.autosaves': { en: 'Rotating autosaves', de: 'Rotierende Autosaves' },

  /* field hints */
  'h.players': { en: 'Concurrent, not registered. Memory scales sublinearly — players share chunks.', de: 'Gleichzeitig, nicht registriert. RAM wächst unterlinear – Spieler teilen sich Chunks.' },
  'h.viewDistance': { en: 'Drives bandwidth hard, and chunk memory once the player count climbs.', de: 'Treibt vor allem die Bandbreite – und ab höheren Spielerzahlen den Chunk-Speicher.' },
  'h.simDistance': { en: 'Drives CPU. Keep it below view distance.', de: 'Treibt die CPU. Kleiner als die Sichtweite halten.' },
  'h.worldRadius': { en: 'Caps how much world can ever be generated.', de: 'Begrenzt, wie viel Welt entstehen kann.' },
  'h.mapSize': { en: 'Procedural map edge length in metres.', de: 'Kantenlänge der Procedural Map in Metern.' },
  'h.wipeAge': { en: 'Entity count grows all wipe long, and so does RAM.', de: 'Die Entity-Zahl wächst den ganzen Wipe – und mit ihr der RAM.' },
  'h.stage': { en: 'Building count, not hours played.', de: 'Anzahl der Gebäude, nicht Spielstunden.' },
  'h.backups': { en: 'Local copies. Off-site storage is counted separately.', de: 'Lokale Kopien. Off-site-Speicher zählt separat.' },

  'h.baseStage': { en: 'Pals and structures are what fill memory, not players.', de: 'Pals und Bauten füllen den Speicher – nicht die Spieler.' },
  'h.arkStage': { en: 'Tames and structures accumulate; decay is what caps them.', de: 'Tames und Bauten häufen sich an; nur Verfall begrenzt sie.' },
  'h.worldStage': { en: 'Every placed piece is a ZDO the server holds forever.', de: 'Jedes gebaute Teil ist ein ZDO, das der Server dauerhaft hält.' },
  'h.zombiePop': { en: 'The single biggest CPU cost on a Zomboid server.', de: 'Der größte CPU-Kostenfaktor auf einem Zomboid-Server.' },
  'h.mods': { en: 'Every client needs the identical set, version for version.', de: 'Jeder Client braucht exakt dasselbe Set – Version für Version.' },

  'h.spread': { en: 'A crowd in one place is cheap. Solo explorers each load their own chunks.', de: 'Eine Gruppe an einem Ort ist günstig. Einzelne Entdecker laden je eigene Chunks.' },
  'h.perfSaver': { en: 'Caps TPS, shrinks view radius under load and forces GC. Prevents crash-under-spike.', de: 'Begrenzt TPS, verkleinert den Sichtradius unter Last und erzwingt GC. Verhindert Absturz bei Lastspitzen.' },
  'h.resources': { en: 'Each one costs tick time. Profile with resmon before adding hardware.', de: 'Jede kostet Tick-Zeit. Erst mit resmon messen, dann Hardware kaufen.' },
  'h.users': { en: 'Bandwidth grows with talkers × listeners, not with users alone.', de: 'Die Bandbreite wächst mit Sprechern × Zuhörern, nicht mit den Nutzern allein.' },
  'h.talkRatio': { en: 'Share of users transmitting at the same time.', de: 'Anteil der Nutzer, die gleichzeitig senden.' },
  'h.scenario': { en: 'AI count is the CPU cost. Conflict runs a lot of it.', de: 'Die KI-Anzahl ist der CPU-Kostenfaktor. Conflict nutzt viel davon.' },

  /* select options */
  'o.fresh': { en: 'Fresh wipe (0–3 days)', de: 'Frischer Wipe (0–3 Tage)' },
  'o.mid': { en: 'Mid wipe (1–2 weeks)', de: 'Mitte des Wipes (1–2 Wochen)' },
  'o.late': { en: 'Late wipe (3+ weeks)', de: 'Später Wipe (3+ Wochen)' },
  'o.established': { en: 'Established (weeks old)', de: 'Etabliert (mehrere Wochen)' },
  'o.heavy': { en: 'Heavy builds / long-running', de: 'Viele Bauten / lange Laufzeit' },
  'o.veteran': { en: 'Veteran (months, no wipe)', de: 'Veteran (Monate, kein Wipe)' },
  'o.pal.early': { en: 'Early — first camps', de: 'Früh – erste Camps' },
  'o.pal.mid': { en: 'Mid — several guild bases', de: 'Mitte – mehrere Gildenbasen' },
  'o.pal.late': { en: 'Late — max bases, many pals', de: 'Spät – maximale Basen, viele Pals' },
  'o.pop.low': { en: 'Low (0.6×)', de: 'Niedrig (0,6×)' },
  'o.pop.normal': { en: 'Normal (1×)', de: 'Normal (1×)' },
  'o.pop.high': { en: 'High (2×)', de: 'Hoch (2×)' },
  'o.pop.insane': { en: 'Insane (4×)', de: 'Extrem (4×)' },
  'o.clustered': { en: 'Clustered — one town, together', de: 'Gruppiert – eine Stadt, zusammen' },
  'o.mixed': { en: 'Mixed — some roam, some build', de: 'Gemischt – teils unterwegs, teils bauend' },
  'o.explorers': { en: 'Explorers — each alone, far apart', de: 'Entdecker – jeder allein, weit verstreut' },
  'o.competitive': { en: 'Competitive (5v5)', de: 'Competitive (5v5)' },
  'o.casual': { en: 'Casual / Deathmatch', de: 'Casual / Deathmatch' },
  'o.community': { en: 'Community (surf, KZ, DM)', de: 'Community (Surf, KZ, DM)' },
  'o.gamemaster': { en: 'Game Master (light AI)', de: 'Game Master (wenig KI)' },
  'o.conflict': { en: 'Conflict (heavy AI)', de: 'Conflict (viel KI)' },
  'o.modded': { en: 'Modded campaign', de: 'Modded Kampagne' },
  'o.q.low': { en: 'Low (~24 kbit/s)', de: 'Niedrig (~24 kbit/s)' },
  'o.q.normal': { en: 'Normal (~45 kbit/s)', de: 'Normal (~45 kbit/s)' },
  'o.q.high': { en: 'High (~77 kbit/s)', de: 'Hoch (~77 kbit/s)' },
  'o.t.quiet': { en: 'Quiet — few speak (8%)', de: 'Ruhig – wenige sprechen (8%)' },
  'o.t.mixed': { en: 'Mixed — normal chatter (20%)', de: 'Gemischt – normal (20%)' },
  'o.t.busy': { en: 'Busy — raid night (40%)', de: 'Voll – Raid-Abend (40%)' },
  'o.early': { en: 'Early game — first factories', de: 'Early Game – erste Fabriken' },
  'o.mid.sf': { en: 'Mid game — multiple sites', de: 'Mid Game – mehrere Standorte' },
  'o.late.sf': { en: 'Late game — full map logistics', de: 'Late Game – Logistik über die ganze Karte' },
  'o.mega': { en: 'Megabase — thousands of belts', de: 'Megabase – tausende Bänder' },

  /* results */
  'r.title': { en: 'What to rent', de: 'Was du mieten solltest' },
  'r.ram': { en: 'Memory', de: 'Arbeitsspeicher' },
  'r.ramHeap': { en: 'Java heap', de: 'Java-Heap' },
  'r.ramProcess': { en: 'Process', de: 'Prozess' },
  'r.ramSystem': { en: 'total system RAM', de: 'gesamter System-RAM' },
  'r.cpu': { en: 'CPU', de: 'CPU' },
  'r.cores': { en: 'cores', de: 'Kerne' },
  'r.core': { en: 'core', de: 'Kern' },
  'r.clock': { en: 'boost clock or better', de: 'Boost-Takt oder besser' },
  'r.disk': { en: 'Storage', de: 'Speicher' },
  'r.diskNote': { en: 'NVMe SSD, includes backups', de: 'NVMe-SSD, inkl. Backups' },
  'r.net': { en: 'Uplink', de: 'Uplink' },
  'r.netNote': { en: 'peak upload', de: 'Upload im Peak' },
  'r.traffic': { en: 'per month', de: 'pro Monat' },

  'r.headroom': { en: 'Tick headroom', de: 'Tick-Reserve' },
  'r.headroomNote': {
    en: 'Estimated time to compute one tick on the recommended CPU, against the {budget} ms budget.',
    de: 'Geschätzte Rechenzeit pro Tick auf der empfohlenen CPU, gegen das Budget von {budget} ms.',
  },
  'r.mspt': { en: 'ms per tick', de: 'ms pro Tick' },
  'r.budget': { en: 'budget', de: 'Budget' },
  'r.good': { en: 'Comfortable', de: 'Komfortabel' },
  'r.tight': { en: 'Tight', de: 'Knapp' },
  'r.over': { en: 'Overloaded', de: 'Überlastet' },

  'm.tick': { en: 'Tick', de: 'Tick' },
  'm.heap': { en: 'Heap', de: 'Heap' },
  'm.jump': { en: 'Jump to results', de: 'Zu den Ergebnissen' },

  'r.tier': { en: 'Hardware class', de: 'Hardware-Klasse' },
  'vps.small': { en: 'Small shared-vCPU VPS', de: 'Kleiner VPS mit shared vCPU' },
  'vps.small.d': { en: 'Anything with 2 vCPU and an NVMe disk will do. Roughly the cheapest tier any provider lists.', de: 'Alles mit 2 vCPU und NVMe reicht. Praktisch die günstigste Stufe jedes Anbieters.' },
  'vps.shared': { en: 'Shared-vCPU VPS', de: 'VPS mit shared vCPU' },
  'vps.shared.d': { en: 'Fine for a friends-and-family server. Watch for noisy neighbours on shared cores.', de: 'Passt für einen Server unter Freunden. Auf laute Nachbarn bei shared Cores achten.' },
  'vps.dedicated': { en: 'Dedicated-vCPU VPS', de: 'VPS mit dedizierten vCPU' },
  'vps.dedicated.d': { en: 'Guaranteed cores matter here — a throttled vCPU shows up immediately as lag spikes.', de: 'Garantierte Kerne sind hier wichtig – gedrosselte vCPU zeigen sich sofort als Lag-Spikes.' },
  'metal.ryzen': { en: 'Bare-metal Ryzen', de: 'Bare-Metal-Ryzen' },
  'metal.ryzen.d': { en: 'A high-clock desktop CPU beats a many-core server CPU for this workload. Ryzen 7000/9000 class.', de: 'Eine hochgetaktete Desktop-CPU schlägt hier eine Server-CPU mit vielen Kernen. Ryzen-7000/9000-Klasse.' },
  'metal.big': { en: 'Bare metal, high clock', de: 'Bare Metal, hoher Takt' },
  'metal.big.d': { en: 'At this size, splitting the load across two machines usually beats buying one bigger one.', de: 'In dieser Größe ist Aufteilen auf zwei Maschinen meist besser als eine größere zu kaufen.' },

  'cap.title': { en: 'Already have a box?', de: 'Schon einen Server?' },
  'cap.lead': {
    en: 'Enter what you have and see how far it goes with these settings.',
    de: 'Trag ein, was du hast, und sieh, wie weit es mit diesen Einstellungen reicht.',
  },
  'cap.ram': { en: 'RAM', de: 'RAM' },
  'cap.cores': { en: 'Cores', de: 'Kerne' },
  'cap.fits': { en: 'Fits about', de: 'Reicht für etwa' },
  'cap.players': { en: 'players', de: 'Spieler' },
  'cap.users': { en: 'users', de: 'Nutzer' },
  'cap.byRam': { en: 'Going higher runs out of memory first.', de: 'Mehr davon scheitert zuerst am Arbeitsspeicher.' },
  'cap.byCpu': { en: 'Going higher runs out of cores first.', de: 'Mehr davon scheitert zuerst an den Kernen.' },
  'cap.byTick': { en: 'Going higher breaks the tick budget first — that needs a faster core, not more of them.', de: 'Mehr davon sprengt zuerst das Tick-Budget – dafür braucht es einen schnelleren Kern, nicht mehr davon.' },
  'cap.capped': { en: 'Handles everything this calculator can configure.', de: 'Schafft alles, was dieser Rechner einstellen kann.' },
  'cap.none': {
    en: 'Not enough for this configuration — it needs {ram} GB and {cores} before anyone connects.',
    de: 'Zu wenig für diese Konfiguration – nötig sind {ram} GB und {cores}, bevor sich jemand verbindet.',
  },
  'cap.apply': { en: 'Use this', de: 'Übernehmen' },

  'cfg.share': { en: 'Copy link', de: 'Link kopieren' },
  'cfg.shared': { en: 'Link copied', de: 'Link kopiert' },

  'r.notes': { en: 'Worth knowing', de: 'Gut zu wissen' },

  /* warnings */
  'w.heapBig': {
    en: 'Heaps above 16 GB make garbage collection pauses worse, not better. Trim view distance or split the world across a Velocity proxy before adding RAM.',
    de: 'Heaps über 16 GB verschlimmern GC-Pausen, statt zu helfen. Erst Sichtweite senken oder die Welt über einen Velocity-Proxy aufteilen, dann RAM nachlegen.',
  },
  'w.proxy': {
    en: 'Past roughly 120 players a single JVM tick loop is the bottleneck. Run several backends behind Velocity, or look at Folia.',
    de: 'Ab etwa 120 Spielern ist die Tick-Schleife einer einzelnen JVM der Flaschenhals. Mehrere Backends hinter Velocity betreiben – oder Folia ansehen.',
  },
  'w.viewDistance': {
    en: 'View distance above 16 multiplies both memory and uplink. Set no-tick-view-distance instead so players see far without simulating far.',
    de: 'Sichtweite über 16 vervielfacht RAM und Uplink. Besser no-tick-view-distance setzen: weit sehen, ohne weit zu simulieren.',
  },
  'w.simDistance': {
    en: 'Simulation distance above 10 is the single most expensive setting on the server. Most players never notice a drop to 6.',
    de: 'Simulationsdistanz über 10 ist die teuerste Einstellung überhaupt. Kaum ein Spieler merkt den Unterschied zu 6.',
  },
  'w.singleThread': {
    en: 'The tick loop is one thread. Clock speed sets your TPS; extra cores only serve chunk generation, GC and networking. A 4-core at 5 GHz beats a 16-core at 2.6 GHz for this workload.',
    de: 'Die Tick-Schleife läuft auf einem Thread. Der Takt bestimmt die TPS; zusätzliche Kerne bedienen nur Chunk-Generierung, GC und Netzwerk. 4 Kerne mit 5 GHz schlagen hier 16 Kerne mit 2,6 GHz.',
  },
  'w.purpurThreads': {
    en: 'Purpur is a Paper fork: more config knobs, same single-threaded tick loop. If you actually want the tick spread across cores, that is Folia, which shards the world into independently ticking regions.',
    de: 'Purpur ist ein Paper-Fork: mehr Config-Optionen, aber dieselbe Single-Thread-Tick-Schleife. Wer den Tick wirklich auf mehrere Kerne verteilen will, braucht Folia – es teilt die Welt in unabhängig tickende Regionen.',
  },
  'w.pumpkinAlpha': {
    en: 'Pumpkin is in early development. The memory figures are excellent, but treat it as experimental and keep vanilla-compatible backups.',
    de: 'Pumpkin ist noch in früher Entwicklung. Die RAM-Werte sind hervorragend, aber behandle es als experimentell und halte vanilla-kompatible Backups bereit.',
  },
  'w.pumpkinPlugins': {
    en: 'Pumpkin uses its own plugin API rather than Bukkit. Bedrock cross-play is built in, so you can drop Geyser from the budget.',
    de: 'Pumpkin nutzt eine eigene Plugin-API statt Bukkit. Bedrock-Crossplay ist eingebaut – Geyser kannst du dir sparen.',
  },
  'w.modCount': {
    en: 'Above 250 mods, startup time and heap use grow faster than the mod count. Budget extra RAM for chunk generation on first load.',
    de: 'Über 250 Mods wachsen Startzeit und Heap schneller als die Mod-Zahl. Für die erste Weltgenerierung extra RAM einplanen.',
  },
  'w.usePaper': {
    en: 'Vanilla ticks every entity the naive way. Paper handles the same player count on noticeably less hardware.',
    de: 'Vanilla tickt jede Entity naiv. Paper schafft die gleiche Spielerzahl mit spürbar weniger Hardware.',
  },
  'w.tickRisk': {
    en: 'This configuration is close to missing the tick budget. Expect TPS drops at peak — lower simulation distance first.',
    de: 'Diese Konfiguration reißt das Tick-Budget fast. Rechne mit TPS-Einbrüchen im Peak – zuerst die Simulationsdistanz senken.',
  },
  'w.backupOffsite': {
    en: 'The world is large enough that local backups stop being backups. Ship them off the machine on a schedule.',
    de: 'Die Welt ist groß genug, dass lokale Backups keine Backups mehr sind. Regelmäßig auf eine andere Maschine schieben.',
  },
  'w.rustSsd': {
    en: 'Rust saves the whole map every few minutes. On spinning disks the save stall is visible to players — NVMe is not optional.',
    de: 'Rust speichert alle paar Minuten die ganze Karte. Auf HDDs sehen Spieler das Save-Stocken – NVMe ist Pflicht.',
  },
  'w.rustMap': {
    en: 'Maps of 4500 and up need far more memory than players do. Shrink the map before you buy more RAM.',
    de: 'Karten ab 4500 brauchen weit mehr RAM als die Spieler. Erst die Karte verkleinern, dann RAM kaufen.',
  },
  'w.rustWipe': {
    en: 'Late-wipe entity counts add roughly a third to memory use. Size for week three, not for wipe day.',
    de: 'Späte Wipes erhöhen den RAM-Bedarf um rund ein Drittel. Für Woche drei dimensionieren, nicht für den Wipe-Tag.',
  },
  'w.rustPop': {
    en: 'Above 250 players the server frame rate falls regardless of hardware. Cap the population and use a queue.',
    de: 'Über 250 Spieler fällt die Server-Framerate unabhängig von der Hardware. Population begrenzen und Warteschlange nutzen.',
  },
  'w.rustPlugins': {
    en: 'Oxide hooks run on the main thread. A handful of badly written plugins costs more frame time than fifty players.',
    de: 'Oxide-Hooks laufen im Main-Thread. Ein paar schlecht geschriebene Plugins kosten mehr Frame-Zeit als fünfzig Spieler.',
  },
  'w.sfPlayers': {
    en: 'Satisfactory targets four players. More works, but replication cost climbs steeply and is not well optimised.',
    de: 'Satisfactory ist auf vier Spieler ausgelegt. Mehr geht, aber die Replikationskosten steigen stark und sind kaum optimiert.',
  },
  'w.sfMega': {
    en: 'Megabases are memory-bound, not CPU-bound. Autosave spikes can briefly double resident memory — leave headroom.',
    de: 'Megabases sind RAM- statt CPU-limitiert. Autosave-Spitzen können den belegten Speicher kurz verdoppeln – Reserve lassen.',
  },
  'w.sfMods': {
    en: 'Every client needs the exact same mod set as the server, matched version for version.',
    de: 'Jeder Client braucht exakt dasselbe Mod-Set wie der Server – Version für Version.',
  },
  'w.sfSingleThread': {
    en: 'The factory simulation runs on one thread. Clock speed decides your tick rate; extra cores only help autosaves and networking.',
    de: 'Die Fabriksimulation läuft auf einem Thread. Der Takt bestimmt die Tickrate; zusätzliche Kerne helfen nur bei Autosave und Netzwerk.',
  },

  'w.foliaPlugins': {
    en: 'Most Bukkit plugins do not run on Folia unaltered — they must be written for the region threading model. Check every plugin you depend on before committing to it.',
    de: 'Die meisten Bukkit-Plugins laufen auf Folia nicht unverändert – sie müssen für das Region-Threading geschrieben sein. Prüfe jedes Plugin, auf das du angewiesen bist.',
  },
  'w.foliaSpread': {
    en: 'Folia only pays off when players are spread across the map. A population huddled at spawn sits in one region on one thread, and you get Paper performance with Folia\u2019s compatibility problems.',
    de: 'Folia lohnt sich nur, wenn die Spieler über die Karte verteilt sind. Eine Menge am Spawn sitzt in einer Region auf einem Thread – dann hast du Paper-Leistung mit Folias Kompatibilitätsproblemen.',
  },
  'w.foliaOverkill': {
    en: 'Below roughly 60 players Paper will serve you better: same performance in practice, and every plugin just works.',
    de: 'Unter etwa 60 Spielern fährst du mit Paper besser: praktisch dieselbe Leistung, und jedes Plugin funktioniert einfach.',
  },
  'w.palLeak': {
    en: 'Palworld memory climbs the longer the process runs. Schedule a nightly restart and size for the hours before it, not the minutes after.',
    de: 'Palworlds Speicherverbrauch steigt mit der Laufzeit. Plane einen nächtlichen Neustart und dimensioniere für die Stunden davor, nicht die Minuten danach.',
  },
  'w.palSave': {
    en: 'Save files grow with pal and structure count and can reach several gigabytes. Back them up compressed and prune old ones.',
    de: 'Die Speicherstände wachsen mit Pal- und Bauten-Zahl und können mehrere Gigabyte erreichen. Komprimiert sichern und alte aussortieren.',
  },
  'w.palPop': {
    en: 'Past sixteen players the official server struggles regardless of hardware. The 32-player cap is a limit, not a target.',
    de: 'Über sechzehn Spieler kämpft der offizielle Server unabhängig von der Hardware. Das 32-Spieler-Limit ist eine Grenze, kein Ziel.',
  },
  'w.palFlags': {
    en: 'Start with -useperfthreads -NoAsyncLoadingThread -UseMultithreadForDS. The difference is large enough to be worth checking your launcher passes them.',
    de: 'Mit -useperfthreads -NoAsyncLoadingThread -UseMultithreadForDS starten. Der Unterschied ist groß genug, um zu prüfen, ob dein Launcher sie übergibt.',
  },
  'w.arkPerMap': {
    en: 'These figures are for ONE map. A cluster runs a separate process per map, so four maps means four times the RAM, cores and disk on the same box.',
    de: 'Diese Werte gelten für EINE Karte. Ein Cluster startet pro Karte einen eigenen Prozess – vier Karten bedeuten vierfachen RAM, Kerne und Speicher auf derselben Maschine.',
  },
  'w.arkAscended': {
    en: 'Survival Ascended needs considerably more than Evolved did, and the install alone is around 70 GB per map.',
    de: 'Survival Ascended braucht deutlich mehr als Evolved, und allein die Installation belegt rund 70 GB pro Karte.',
  },
  'w.arkDecay': {
    en: 'On a server this old, structure and tame counts are what you are paying for. Enforce decay and tame limits, or no amount of RAM will hold.',
    de: 'Auf einem so alten Server zahlst du für Bauten- und Tame-Zahlen. Verfall und Tame-Limits durchsetzen – sonst reicht kein RAM.',
  },
  'w.arkMods': {
    en: 'Mods are loaded per map instance, so their cost multiplies across a cluster too.',
    de: 'Mods werden pro Karten-Instanz geladen – ihre Kosten vervielfachen sich also auch im Cluster.',
  },
  'w.valZdo': {
    en: 'Valheim keeps a ZDO for every placed piece, dropped item and tamed animal, forever. Build count drives memory far harder than player count.',
    de: 'Valheim hält für jedes gebaute Teil, jedes fallengelassene Item und jedes gezähmte Tier dauerhaft ein ZDO. Die Bauten-Zahl treibt den Speicher weit stärker als die Spielerzahl.',
  },
  'w.valCap': {
    en: 'Ten players is the built-in cap. Going higher needs a mod, and the networking was never designed for it.',
    de: 'Zehn Spieler sind das eingebaute Limit. Mehr geht nur mit Mod – das Netzwerk war nie dafür ausgelegt.',
  },
  'w.valMods': {
    en: 'BepInEx mods must match on server and every client, version for version.',
    de: 'BepInEx-Mods müssen auf Server und jedem Client übereinstimmen – Version für Version.',
  },
  'w.valBuilds': {
    en: 'Sweep dropped items and demolish abandoned bases periodically. A long-running world slows down from accumulated objects, not from players.',
    de: 'Fallengelassene Items einsammeln und verlassene Basen abreißen. Eine alte Welt wird durch angesammelte Objekte langsam, nicht durch Spieler.',
  },
  'w.pzHeap': {
    en: 'Zomboid runs on the JVM: set the heap in ProjectZomboid64.json, not on the command line. Giving the container more RAM does nothing on its own.',
    de: 'Zomboid läuft auf der JVM: Den Heap in ProjectZomboid64.json setzen, nicht in der Kommandozeile. Mehr Container-RAM allein bringt nichts.',
  },
  'w.pzPop': {
    en: 'Zombie population multiplies the cost of every tick. Doubling it costs more than doubling your player count.',
    de: 'Die Zombie-Population vervielfacht die Kosten jedes Ticks. Sie zu verdoppeln kostet mehr als die Spielerzahl zu verdoppeln.',
  },
  'w.pzMods': {
    en: 'Workshop mods must match on server and clients; mismatches show up as silent desyncs rather than clean errors.',
    de: 'Workshop-Mods müssen auf Server und Clients übereinstimmen; Abweichungen zeigen sich als stille Desyncs statt als saubere Fehler.',
  },
  'w.pzPlayers': {
    en: 'Above roughly 32 players, map streaming rather than the simulation becomes the bottleneck. Fast disk matters as much as clock speed.',
    de: 'Ab etwa 32 Spielern wird das Map-Streaming zum Flaschenhals, nicht die Simulation. Schnelle Disks zählen dann so viel wie der Takt.',
  },

  'w.hyEarly': {
    en: 'Hytale has been in Early Access since January 2026 and the server is still changing fast. Re-check these numbers after big updates.',
    de: 'Hytale ist seit Januar 2026 im Early Access und der Server ändert sich schnell. Nach größeren Updates neu prüfen.',
  },
  'w.hyNoSaver': {
    en: 'Without PerformanceSaver you must size for the worst case, because there is nothing to degrade gracefully — a load spike becomes a crash instead of a lower view radius.',
    de: 'Ohne PerformanceSaver musst du für den schlimmsten Fall dimensionieren – es gibt nichts, was sanft abbaut. Eine Lastspitze wird zum Absturz statt zu einem kleineren Sichtradius.',
  },
  'w.hySaverTps': {
    en: 'PerformanceSaver holds TPS at a stable 20 and drops to 5 when empty. Stable-but-lower beats high-but-fluctuating for how clients predict movement.',
    de: 'PerformanceSaver hält die TPS stabil bei 20 und fällt bei leerem Server auf 5. Stabil-niedriger ist für die Client-Vorhersage besser als hoch-schwankend.',
  },
  'w.hySpread': {
    en: 'Scattered solo explorers are the expensive case: each loads their own chunks with no overlap. This costs far more than the same players standing in one town.',
    de: 'Verstreute Einzelspieler sind der teure Fall: Jeder lädt eigene Chunks ohne Überschneidung. Das kostet weit mehr als dieselben Spieler in einer Stadt.',
  },
  'w.fxSingleThread': {
    en: 'FiveM runs its sync, physics and script runtime on one thread. An 8-core at 5.4 GHz beats a 32-core at 2.6 GHz outright — buy clock, not cores.',
    de: 'FiveM führt Sync, Physik und Skript-Runtime auf einem Thread aus. 8 Kerne mit 5,4 GHz schlagen 32 Kerne mit 2,6 GHz klar – kauf Takt, nicht Kerne.',
  },
  'w.fxOneSync': {
    en: 'Above 32 slots you need OneSync and a Cfx.re licence key. The free tier reaches 48; higher Element Club tiers go to 64 and 128.',
    de: 'Über 32 Slots brauchst du OneSync und einen Cfx.re-Lizenzschlüssel. Die kostenlose Stufe reicht bis 48, höhere Element-Club-Stufen bis 64 und 128.',
  },
  'w.fxResmon': {
    en: 'With this many resources, profiling beats hardware. Open resmon or txAdmin: any script holding more than 0.1–0.2 ms every tick is worth fixing before you upgrade.',
    de: 'Bei so vielen Resources bringt Profiling mehr als Hardware. resmon oder txAdmin öffnen: Jedes Skript über 0,1–0,2 ms pro Tick lohnt sich zu beheben, bevor du aufrüstest.',
  },
  'w.fxDatabase': {
    en: 'The MySQL/MariaDB instance is not counted here. Give it its own RAM budget, and move the website and Discord bots off this box.',
    de: 'Die MySQL-/MariaDB-Instanz ist hier nicht eingerechnet. Plane eigenen RAM dafür ein und verschiebe Website und Discord-Bots auf eine andere Maschine.',
  },
  'w.csTick': {
    en: 'A 64-tick server has 15.6 ms to finish a frame — a third of what Minecraft gets. Clock speed is almost the only thing that matters.',
    de: 'Ein 64-Tick-Server hat 15,6 ms pro Frame – ein Drittel von Minecraft. Der Takt ist fast das Einzige, was zählt.',
  },
  'w.csMetamod': {
    en: 'Plugins run through Metamod:Source and CounterStrikeSharp, in the frame budget. A few badly written ones cost more than the players do.',
    de: 'Plugins laufen über Metamod:Source und CounterStrikeSharp im Frame-Budget. Ein paar schlechte kosten mehr als die Spieler.',
  },
  'w.csPop': {
    en: 'Above 32 slots you are running a community server, not a competitive one. Expect the frame budget to be the limit long before RAM is.',
    de: 'Über 32 Slots betreibst du einen Community-Server, keinen Competitive-Server. Das Frame-Budget limitiert lange vor dem RAM.',
  },
  'w.cs16Tiny': {
    en: 'This server is from 1999. It fits in a modern CPU cache, and the smallest VPS any provider sells is already overkill.',
    de: 'Dieser Server ist von 1999. Er passt in den Cache einer modernen CPU – der kleinste VPS eines jeden Anbieters ist bereits überdimensioniert.',
  },
  'w.cs16Legacy': {
    en: 'Old HLDS builds have known remote-execution holes. Use ReHLDS instead of stock HLDS and keep it behind a firewall.',
    de: 'Alte HLDS-Builds haben bekannte Remote-Execution-Lücken. Nutze ReHLDS statt Standard-HLDS und betreibe es hinter einer Firewall.',
  },
  'w.cs16Amx': {
    en: 'AMX Mod X plugins are the only realistic way to load this server. Even so, you are unlikely to reach 5% of a modern core.',
    de: 'AMX-Mod-X-Plugins sind die einzige realistische Möglichkeit, diesen Server auszulasten. Selbst dann erreichst du kaum 5% eines modernen Kerns.',
  },
  'w.aseVsAsa': {
    en: 'Survival Evolved is markedly lighter than Ascended — roughly half the memory and a quarter of the disk for the same population.',
    de: 'Survival Evolved ist deutlich leichter als Ascended – etwa halber RAM und ein Viertel des Speichers bei gleicher Spielerzahl.',
  },
  'w.armaAi': {
    en: 'On Enfusion the AI count drives the CPU, not the player count. Twenty players commanding hundreds of AI cost more than sixty players fighting each other.',
    de: 'Auf Enfusion treibt die KI-Anzahl die CPU, nicht die Spielerzahl. Zwanzig Spieler mit hunderten KI kosten mehr als sechzig Spieler gegeneinander.',
  },
  'w.armaConflict': {
    en: 'Conflict spawns AI continuously across the whole map. It is by far the most expensive scenario type and the usual reason a Reforger server stutters.',
    de: 'Conflict spawnt laufend KI über die ganze Karte. Es ist mit Abstand das teuerste Szenario und der übliche Grund für Ruckler auf Reforger-Servern.',
  },
  'w.armaMods': {
    en: 'Every client downloads the full mod set from the Workshop on join. Large mod lists turn into long join times before they turn into a server problem.',
    de: 'Jeder Client lädt beim Beitritt das komplette Mod-Set aus dem Workshop. Große Mod-Listen bedeuten lange Beitrittszeiten, bevor sie zum Serverproblem werden.',
  },
  'w.arma4Unreleased': {
    en: 'Arma 4 is not released. Bohemia targets 2027, and no server has ever run. These figures are Arma Reforger scaled up for a bigger Enfusion title — a planning placeholder, not a specification. Re-check at launch.',
    de: 'Arma 4 ist nicht veröffentlicht. Bohemia peilt 2027 an, und es lief noch nie ein Server. Diese Werte sind hochskaliertes Arma Reforger für einen größeren Enfusion-Titel – ein Platzhalter zur Planung, keine Spezifikation. Zum Release neu prüfen.',
  },
  'w.voiceBandwidth': {
    en: 'A voice server is a packet mirror, not a simulation. Each talker\u2019s stream is copied to every listener, so uplink grows with talkers × listeners while CPU and RAM stay almost flat.',
    de: 'Ein Voice-Server ist ein Paket-Spiegel, keine Simulation. Jeder Sprecher-Stream wird an jeden Zuhörer kopiert – der Uplink wächst mit Sprechern × Zuhörern, während CPU und RAM nahezu konstant bleiben.',
  },
  'w.tsLicence': {
    en: 'A free TeamSpeak licence caps a virtual server at 32 slots. The free non-profit licence raises that to 512 across up to 10 virtual servers, and has to be applied for.',
    de: 'Die kostenlose TeamSpeak-Lizenz begrenzt einen virtuellen Server auf 32 Slots. Die kostenlose Non-Profit-Lizenz erhöht das auf 512 über bis zu 10 virtuelle Server und muss beantragt werden.',
  },
  'w.mumbleLight': {
    en: 'Murmur is open source with no slot licence and typically idles under 50 MB. Bandwidth, not the server, is your only real cost.',
    de: 'Murmur ist Open Source, ohne Slot-Lizenz, und braucht im Leerlauf meist unter 50 MB. Nur die Bandbreite kostet wirklich, nicht der Server.',
  },
  'w.voiceChannels': {
    en: 'Split large rooms into channels. Bandwidth is quadratic in a single big channel and nearly linear across several small ones.',
    de: 'Große Räume in Kanäle aufteilen. Die Bandbreite wächst in einem großen Kanal quadratisch, über mehrere kleine fast linear.',
  },
  'w.voiceUplink': {
    en: 'This configuration needs a serious uplink. Check that your provider gives a dedicated port rather than a shared "up to" figure.',
    de: 'Diese Konfiguration braucht einen ernsthaften Uplink. Prüfe, ob dein Anbieter einen dedizierten Port bietet statt einer geteilten „bis zu“-Angabe.',
  },

  /* snippets */
  's.title': { en: 'Ready to paste', de: 'Zum Kopieren' },
  's.start': { en: 'Start command', de: 'Startbefehl' },
  's.compose': { en: 'docker-compose.yml', de: 'docker-compose.yml' },
  's.cfg': { en: 'Config', de: 'Konfiguration' },
  's.systemd': { en: 'systemd unit', de: 'systemd-Unit' },
  's.copy': { en: 'Copy', de: 'Kopieren' },
  's.copied': { en: 'Copied', de: 'Kopiert' },

  /* comparison */
  'c.title': { en: 'Same server, different software*', de: 'Gleicher Server, andere Software*' },
  'c.footnote': {
    en: 'Switching software is not a drop-in swap: extensions do not travel with the world. Bukkit plugins run on Spigot, Paper and Purpur and nowhere else. Forge mods run only on Forge, and every client needs the same mod set. Pumpkin uses its own plugin API rather than Bukkit. Vanilla takes neither. Your world usually survives the move — your plugin and mod list does not.',
    de: 'Ein Wechsel der Software ist kein einfacher Tausch: Erweiterungen ziehen nicht mit der Welt um. Bukkit-Plugins laufen auf Spigot, Paper und Purpur – sonst nirgends. Forge-Mods laufen nur auf Forge, und jeder Client braucht dasselbe Mod-Set. Pumpkin nutzt eine eigene Plugin-API statt Bukkit. Vanilla nimmt gar nichts. Die Welt übersteht den Umzug meist – die Plugin- und Mod-Liste nicht.',
  },
  'c.lead': {
    en: 'Your current settings run through every Minecraft flavour. Memory is total system RAM.',
    de: 'Deine aktuellen Einstellungen durch jede Minecraft-Variante gerechnet. RAM ist der gesamte System-RAM.',
  },
  'c.software': { en: 'Software', de: 'Software' },
  'c.ram': { en: 'RAM', de: 'RAM' },
  'c.cores': { en: 'Cores', de: 'Kerne' },
  'c.tick': { en: 'ms/tick', de: 'ms/Tick' },
  'c.plugins': { en: 'Plugins', de: 'Plugins' },
  'c.yes': { en: 'Bukkit API', de: 'Bukkit-API' },
  'c.no': { en: '—', de: '—' },
  'c.own': { en: 'Own API', de: 'Eigene API' },
  'c.folia': { en: 'Folia-aware only', de: 'Nur Folia-fähige' },
  'c.forge': { en: 'Forge mods', de: 'Forge-Mods' },
  'c.current': { en: 'selected', de: 'ausgewählt' },

  'r.report': { en: 'Numbers look wrong?', de: 'Zahlen falsch?' },
  'r.reportTitle': { en: 'Report a calculation that does not match reality', de: 'Abweichende Berechnung melden' },

  /* footer */
  'ft.disclaimer': {
    en: 'Estimates, not guarantees. Every world, plugin set and player base is different — measure with Spark or the server profiler once you are live.',
    de: 'Schätzungen, keine Garantien. Jede Welt, jedes Plugin-Set und jede Community ist anders – im Livebetrieb mit Spark oder dem Server-Profiler messen.',
  },
  'ft.method': { en: 'How the numbers are calculated', de: 'Wie gerechnet wird' },
};

const OPTION_KEYS = {
  wipeAge: { fresh: 'o.fresh', mid: 'o.mid', late: 'o.late' },
  stage: { early: 'o.early', mid: 'o.mid.sf', late: 'o.late.sf', mega: 'o.mega' },
  baseStage: { early: 'o.pal.early', mid: 'o.pal.mid', late: 'o.pal.late' },
  arkStage: { fresh: 'o.fresh', established: 'o.established', veteran: 'o.veteran' },
  worldStage: { fresh: 'o.fresh', established: 'o.established', heavy: 'o.heavy' },
  spread: { clustered: 'o.clustered', mixed: 'o.mixed', explorers: 'o.explorers' },
  csMode: { competitive: 'o.competitive', casual: 'o.casual', community: 'o.community' },
  scenario: { gamemaster: 'o.gamemaster', conflict: 'o.conflict', modded: 'o.modded' },
  quality: { low: 'o.q.low', normal: 'o.q.normal', high: 'o.q.high' },
  talkRatio: { quiet: 'o.t.quiet', mixed: 'o.t.mixed', busy: 'o.t.busy' },
  zombiePop: { low: 'o.pop.low', normal: 'o.pop.normal', high: 'o.pop.high', insane: 'o.pop.insane' },
};

let LANG = 'en';

function t(key, params) {
  const entry = STRINGS[key];
  let s = entry ? (entry[LANG] ?? entry.en) : key;
  if (params) for (const [k, val] of Object.entries(params)) s = s.replace(`{${k}}`, val);
  return s;
}
