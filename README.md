# Server Genius

[![GitHub stars](https://img.shields.io/github/stars/NUCL3ARN30N/game-server-calculator?style=for-the-badge)](https://github.com/NUCL3ARN30N/game-server-calculator/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/NUCL3ARN30N/game-server-calculator?style=for-the-badge)](https://github.com/NUCL3ARN30N/game-server-calculator/network/members)
[![GitHub issues](https://img.shields.io/github/issues/NUCL3ARN30N/game-server-calculator?style=for-the-badge)](https://github.com/NUCL3ARN30N/game-server-calculator/issues)
[![GitHub license](https://img.shields.io/github/license/NUCL3ARN30N/game-server-calculator?style=for-the-badge)](LICENSE)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=for-the-badge&logo=githubpages&logoColor=white)

> Game server calculator — work out the RAM, cores, disk and bandwidth a dedicated server actually needs, before you rent it

## Quick Start

**Live at:** [https://gsc.genius-space.org](https://gsc.genius-space.org)

Pick a game, describe the server you want to run, and read off the hardware. Every number
updates live as you move a slider.

## Supported Servers

| #  | Server                     | What drives the numbers                                    |
| -- | -------------------------- | ---------------------------------------------------------- |
| 1  | **Minecraft**              | Loaded chunks, view and simulation distance, plugins, mods |
| 2  | **Hytale**                 | JVM heap, player spread, PerformanceSaver toggle           |
| 3  | **Rust**                   | Map size, wipe age, Oxide or Carbon plugins                |
| 4  | **Palworld**               | Guild bases and pals; 32-player cap                        |
| 5  | **ARK: Survival Ascended** | Structures and tames, **per map** — clusters multiply      |
| 6  | **ARK: Survival Evolved**  | Same shape as Ascended, roughly half the weight            |
| 7  | **Valheim**                | ZDO count from placed pieces, not head count               |
| 8  | **Project Zomboid**        | Java heap, zombie population multiplier                    |
| 9  | **Satisfactory**           | Factory stage; single-threaded simulation                  |
| 10 | **FiveM**                  | Resource count, framework, one hot thread                  |
| 11 | **Arma Reforger**          | AI count, not player count                                 |
| 12 | **Arma 4**                 | Unreleased — extrapolated from Reforger                    |
| 13 | **Counter-Strike 2**       | 64-tick, a 15.6 ms frame budget                            |
| 14 | **Counter-Strike 1.6**     | HLDS — runs on almost nothing                              |
| 15 | **TeamSpeak**              | Talkers × listeners, codec quality                         |
| 16 | **Mumble**                 | Same, on Murmur                                            |

## Minecraft Server Software

All seven run through your exact settings side by side, so the cost of each is a number.

| Software    | Tick loop | Extensions       | Notes                                             |
| ----------- | --------- | ---------------- | ------------------------------------------------- |
| **Vanilla** | Serial    | —                | Ticks every entity the naive way                  |
| **Spigot**  | Serial    | Bukkit API       | Modest gains over Vanilla                         |
| **Paper**   | Serial    | Bukkit API       | The default choice for most servers               |
| **Purpur**  | Serial    | Bukkit API       | Paper fork — more config, same threading          |
| **Folia**   | Parallel  | Folia-aware only | Region-sharded; worth it above ~60 spread players |
| **Forge**   | Serial    | Forge mods       | Mod registries dominate memory, not players       |
| **Pumpkin** | Parallel  | Own API          | Native Rust, ~100 MB, Bedrock crossplay built in  |

## What You Get

| Output             | Detail                                             |
| ------------------ | -------------------------------------------------- |
| **Memory**         | Java heap where it applies, plus total system RAM  |
| **CPU**            | Core count and the boost clock to aim for          |
| **Storage**        | World or save data plus your backup retention      |
| **Uplink**         | Peak upload and estimated monthly transfer         |
| **Tick headroom**  | Estimated ms per tick against that engine's budget |
| **Hardware class** | Shared vCPU, dedicated vCPU or bare metal          |

## Tick Budgets

The headroom meter reads against the real budget for each engine — the main reason a
Counter-Strike server and a Minecraft server want opposite hardware.

| Budget  | Rate   | Servers                                                                |
| ------- | ------ | ---------------------------------------------------------------------- |
| 10 ms   | 100 Hz | Counter-Strike 1.6                                                     |
| 15.6 ms | 64 Hz  | Counter-Strike 2                                                       |
| 20 ms   | 50 Hz  | TeamSpeak, Mumble                                                      |
| 33 ms   | 30 Hz  | Rust, Palworld, both ARKs, Valheim, Zomboid, Satisfactory, FiveM, Arma |
| 50 ms   | 20 Hz  | Minecraft, Hytale                                                      |

Green is under 55% of budget, amber to 80%, red beyond. Every game's default configuration is
guaranteed to open in the green.

## Features

| #  | Feature                 | Description                                                         |
| -- | ----------------------- | ------------------------------------------------------------------- |
| 1  | Live sizing             | Every slider recalculates instantly, no submit button               |
| 2  | Tick headroom meter     | Estimated ms per tick against the engine's own budget               |
| 3  | Software comparison     | Your settings through all seven Minecraft flavours at once          |
| 4  | Already have a box?     | Reverse mode — enter RAM and cores, get the population that fits    |
| 5  | Ready-to-paste snippets | Start command, Compose, config file and systemd unit                |
| 6  | Worth knowing           | Context-aware warnings for the exact configuration on screen        |
| 7  | Shareable URLs          | The full configuration lives in the query string; Copy link button  |
| 8  | Game filter             | Matches names and aliases — "voice", "gta", "dino", "csgo"          |
| 9  | Report a calculation    | Opens a prefilled GitHub issue when a number disagrees with reality |
| 10 | Bilingual               | English and German, detected from the browser and switchable        |
| 11 | Dark and light themes   | Dark by default, remembered between visits                          |
| 12 | Installable PWA         | Works offline once loaded                                           |

## Ready to Paste

Every result comes with four tabs of working configuration for that exact server:

| Tab                | Contents                                                                   |
| ------------------ | -------------------------------------------------------------------------- |
| **Start command**  | SteamCMD install and launch flags, or tuned Aikar flags for JVM servers    |
| **docker-compose** | The community image for that game, with matching CPU and memory limits     |
| **Config**         | `server.properties`, `server.cfg`, `PalWorldSettings.ini`, `config.json` … |
| **systemd unit**   | Service file with `CPUQuota` and `MemoryMax` already filled in             |

## Already Have a Box?

Work the model backwards. Enter the memory and cores you already have and it reports the
largest population that fits at your current settings, along with whichever constraint stops
it going higher — memory, cores, or tick time. Tick time means buy clock speed, not more RAM.

## Confidence Ratings

The methodology page rates every game, because the evidence behind them is not uniform.

| Rating     | Meaning                                                                 | Servers                                                                 |
| ---------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **High**   | Developer documentation, or a figure several independent hosts agree on | Minecraft, Hytale, Rust, FiveM, Palworld, Project Zomboid, Satisfactory |
| **Medium** | Community consensus and reported production configurations              | Counter-Strike 2 and 1.6, both ARKs, Arma Reforger and Arma 4           |
| **Low**    | Extrapolated from a related title or a small sample                     | Valheim                                                                 |

## Methodology

**[How the numbers are calculated](https://nucl3arn30n.github.io/game-server-calculator/methodology.html)** — every
formula, every constant, and every source, linked per game. The constant tables on that page
are read out of the calculator at runtime, so the documentation cannot drift from the tool.

Memory is modelled per loaded chunk rather than per player, because that is how servers
actually behave: players cluster and share chunks, so twenty of them cost nowhere near twenty
times one. The result is leaner than the usual advice — twenty players on Paper with a dozen
plugins wants a 2 GB heap, not the 6–8 GB a host will happily sell you.

Estimates, not guarantees. Measure once you are live: [Spark](https://spark.lucko.me/) for
Minecraft and Zomboid, `resmon` or txAdmin for FiveM, `server.fps` and `perf 2` for Rust.

## Requirements

**Browser:** Any modern browser (Chrome, Firefox, Safari, Edge)
**Server:** None — fully static, runs 100% client-side
**Dependencies:** Loaded via CDN (Font Awesome, Google Fonts — DM Sans, Playfair Display, JetBrains Mono)

---

Badges from [envoy1084/awesome-badges](https://github.com/envoy1084/awesome-badges)
