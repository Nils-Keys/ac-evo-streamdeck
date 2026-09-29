// Erzeugt HTML-Kompositionen fuer Marketplace/GitHub-Bilder (Thumbnail + Galerie) aus dem Profil im Repo.
// Aufruf: node gen-marketplace.js <ausgabeordner>   (danach mit Edge headless zu PNG rendern, siehe build/render-marketplace.ps1)
const fs = require('fs');
const path = require('path');

const repo = path.join(__dirname, '..');
const outDir = process.argv[2] || path.join(repo, 'marketplace', 'html');
fs.mkdirSync(outDir, { recursive: true });

// ---- Plugin-Renderer laden (wie im Plugin, nur mit Testdaten) ----
const pdir = path.join(repo, 'plugin', 'com.nils.acevo.sdPlugin') + path.sep;
const src = fs.readFileSync(pdir + 'plugin.js', 'utf8');
const body = src.slice(0, src.indexOf('connect(args.port')).replace(/^const args = \{\};[\s\S]*?\n\n/m, 'const args={};\n');
const mod = { exports: {} };
new Function('require', 'module', 'process', body + ';module.exports={render,svg,glyphs,setCur:(s)=>{curSym=s},setFlag:(f)=>{curFlag=f}};')(
  (n) => (n.startsWith('./') ? require(pdir + n.slice(2)) : require(n)), mod, { argv: [] });
const R = mod.exports;

const D = {
  ABSLevel: 5, TCLevel: 4, EngineMap: 2, BrakeBias: 61.5, Fuel: 24, Gear: '3', PitLimiterOn: 0,
  TyreTemperatureFrontLeft: 88, TyreTemperatureFrontRight: 91, TyreTemperatureRearLeft: 84, TyreTemperatureRearRight: 86,
  TyrePressureFrontLeft: 1.79, TyrePressureFrontRight: 1.81, TyrePressureRearLeft: 1.76, TyrePressureRearRight: 1.77,
  TyreWearFrontLeft: 0.06, TyreWearFrontRight: 0.07, TyreWearRearLeft: 0.05, TyreWearRearRight: 0.05,
  CurrentLapTime: '00:01:23.4', LastLapTime: '00:01:22.8', BestLapTime: '00:01:21.9', DeltaToSessionBest: -0.42, Position: 3,
  CompletedLaps: 4, TotalLaps: 10, SessionTimeLeft: '00:09:44', SpeedKmh: 212, Rpms: 7200, OilTemperature: 96,
  AirTemperature: 29.5, RoadTemperature: 31, CarDamagesMax: 0, EstimatedFuelRemaingLaps: 9.5, CurrentSectorIndex: 1,
  BrakeTemperatureFrontLeft: 450, BrakeTemperatureFrontRight: 470, BrakeTemperatureRearLeft: 380, BrakeTemperatureRearRight: 390,
  TyresTemperatureAvg: 87, TyresWearMax: 0.07,
};

const prof = path.join(repo, 'profile', 'AC-Evo-XL.sdProfile');
const pm = JSON.parse(fs.readFileSync(path.join(prof, 'manifest.json'), 'utf8').replace(/^﻿/, ''));
const pages = pm.Pages.Pages;

let uid = 0;
function inline(svg) {
  uid++;
  return svg
    .replace(/<\?xml[^>]*>/, '')
    .split('id="g"').join(`id="g${uid}"`).split('url(#g)').join(`url(#g${uid})`)
    .split('id="r"').join(`id="r${uid}"`).split('url(#r)').join(`url(#r${uid})`)
    .split('id="c"').join(`id="c${uid}"`).split('url(#c)').join(`url(#c${uid})`);
}

// Englische Hilfe-Kacheln (wie im Verteilpaket)
const enDir = path.join(require('os').tmpdir(), 'evo-help-en');
require('child_process').execFileSync(process.execPath, [path.join(__dirname, 'gen-help.js'), enDir, 'en']);
const enTiles = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(enDir, 'layout.json'), 'utf8')).map((e) => [e.key, path.join(enDir, e.file)]));

function keySvg(pageDir, a, flag, key) {
  const u = a.UUID || '';
  if (u === 'com.elgato.streamdeck.system.text' && enTiles[key]) return fs.readFileSync(enTiles[key], 'utf8');
  if (u === 'com.nils.acevo.display') {
    const metric = a.Settings && a.Settings.metric;
    R.setCur(R.glyphs.FOR[metric] || null);
    R.setFlag(flag && metric !== 'flag' ? flag : null);
    const s = R.render(metric, flag ? { ...D, ...flagData(flag) } : D);
    R.setCur(null); R.setFlag(null);
    return s;
  }
  if (u === 'com.elgato.streamdeck.profile.rotate') return null; // wird im Paket entfernt
  const img = a.States && a.States[0] && a.States[0].Image;
  if (img) {
    const p = path.join(pageDir, img);
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  }
  return null;
}
const flagData = (c) => ({ Flag_Yellow: c === '#FFD400' ? 1 : 0, Flag_Blue: c === '#3D7BFF' ? 1 : 0, Flag_Blue_: 0 });

function deck(pageId, flag) {
  const dir = path.join(prof, 'Profiles', pageId.toUpperCase());
  const m = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8').replace(/^﻿/, ''));
  const acts = m.Controllers[0].Actions || {};
  let cells = '';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) {
    const a = acts[`${c},${r}`];
    let s = null;
    if (a) s = a.UUID === 'com.nils.acevo.setup' ? setupSvg() : keySvg(dir, a, flag, `${c},${r}`);
    cells += `<div class="k">${s ? inline(s) : ''}</div>`;
  }
  return `<div class="deck">${cells}</div>`;
}

// Nachbildung der Plugin-Taste "SETUP KEYS" (gleiche Zeichenroutine wie im Plugin, englische Beschriftung)
function setupSvg() { R.setCur(null); R.setFlag(null); return R.svg('#35E07A', 'SETUP', 'KEYS', 20); }

const CSS = `
*{box-sizing:border-box}body{margin:0;width:1920px;height:960px;background:radial-gradient(circle at 30% 20%,#1b2030 0,#0a0b10 60%);font-family:Arial,Helvetica,sans-serif;color:#fff;overflow:hidden}
.top{position:absolute;left:100px;top:56px;right:100px}
h1{margin:0;font-size:84px;letter-spacing:2px;font-weight:800}
h1 span{color:#00E5FF}
h2{margin:8px 0 0;font-size:34px;font-weight:400;color:#aeb6c4}
.stage{position:absolute;left:0;right:0;top:250px;display:flex;justify-content:center}
.bezel{padding:34px 40px;background:linear-gradient(#20242e,#12141a);border-radius:44px;box-shadow:0 30px 80px #000c,inset 0 0 0 2px #2c3140}
.deck{display:grid;grid-template-columns:repeat(8,128px);grid-auto-rows:128px;gap:16px}
.k{width:128px;height:128px;background:#000;border-radius:14px;overflow:hidden}.k svg{width:128px;height:128px;display:block}
.cap{position:absolute;left:100px;right:100px;bottom:34px;font-size:30px;color:#8e98aa}
.cap b{color:#fff}
.tag{position:absolute;right:100px;top:70px;font-size:26px;padding:10px 22px;border:2px solid #35E07A;color:#35E07A;border-radius:30px}
`;

function page(title, sub, caption, deckHtml, tag) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>
<div class="top"><h1>${title}</h1><h2>${sub}</h2></div>${tag ? `<div class="tag">${tag}</div>` : ''}
<div class="stage"><div class="bezel">${deckHtml}</div></div>${caption ? `<div class="cap">${caption}</div>` : ''}</body></html>`;
}

const t = (s) => s;
const out = {
  'thumbnail': page('AC EVO <span>LIVE</span>', 'Stream Deck XL profile for Assetto Corsa EVO · live values via SimHub', '', deck(pages[0]), 'Stream Deck XL'),
  'gallery-1': page('Car controls', 'Page 1 · lights, indicators, ABS / TC / map / brake bias with live values', '<b>Live value in the middle</b> of every +/- group. Hotkeys match the key bindings set up by the one-press installer.', deck(pages[0])),
  'gallery-2': page('Tyres in a V', 'Page 2 · temperature, pressure and wear for all four tyres', '<b>Flag mode:</b> when a flag is active, all value keys flash in the flag colour (yellow shown).', deck(pages[1], '#FFD400')),
  'gallery-3': page('Race info', 'Page 3 · lap times, delta, position, temperatures, brakes, damage', 'All values come live from SimHub while AC EVO is running.', deck(pages[2])),
  'gallery-4': page('Built-in help & key setup', 'Page 4 · one press writes the key bindings into AC EVO (with backup)', 'Close AC EVO, press the green SETUP KEYS key, done. A backup of your bindings is created first.', deck(pages[3])),
};
for (const [n, html] of Object.entries(out)) fs.writeFileSync(path.join(outDir, n + '.html'), html);
console.log(Object.keys(out).length + ' Seiten -> ' + outDir);
