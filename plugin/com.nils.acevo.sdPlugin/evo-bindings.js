// Traegt die Tastenbelegung fuer das AC-Evo-Live-Profil in AC EVO ein.
// Datei: %USERPROFILE%\Saved Games\ACE\input_keyboard.keyboardinputconfiguration (Protobuf)
// Nutzung als Modul: const { apply } = require('./evo-bindings'); apply({ dryRun });
// Nutzung als Skript: node evo-bindings.js [--dry]
const fs = require('fs');
const os = require('os');
const path = require('path');

const SHIFT = 0x10, CTRL = 0x11, ALT = 0x12;
const VK = (c) => c.toUpperCase().charCodeAt(0);
const HOME = 36, END = 35;

// dir: 1 = "-" / runter, 2 = "+" / hoch, null = Schalter ohne Richtung
// guess: ID aus Reihenfolge/Abstaenden abgeleitet, nicht aus einer vorhandenen Belegung bestaetigt
const BINDINGS = [
  { name: 'Pit Limiter', id: 138, vk: VK('L'), mods: [ALT], dir: null },
  { name: 'Zuendung', id: 136, vk: VK('I'), mods: [SHIFT], dir: null },
  { name: 'Anlasser', id: 137, vk: VK('S'), mods: [], dir: null, simple: true },
  { name: 'Scheinwerfer durchschalten', id: 120, vk: VK('L'), mods: [], dir: 1 },
  { name: 'Lichthupe', id: 121, vk: VK('L'), mods: [SHIFT], dir: null },
  { name: 'Blinker links', id: 132, vk: HOME, mods: [ALT], dir: null },
  { name: 'Blinker rechts', id: 133, vk: END, mods: [ALT], dir: null },
  { name: 'Traktionskontrolle -', id: 140, vk: VK('T'), mods: [CTRL], dir: 1 },
  { name: 'Traktionskontrolle +', id: 140, vk: VK('T'), mods: [SHIFT], dir: 2 },
  { name: 'ABS -', id: 144, vk: VK('A'), mods: [CTRL], dir: 1 },
  { name: 'ABS +', id: 144, vk: VK('A'), mods: [SHIFT], dir: 2 },
  { name: 'Motorkennfeld -', id: 146, vk: VK('E'), mods: [CTRL], dir: 1 },
  { name: 'Motorkennfeld +', id: 146, vk: VK('E'), mods: [SHIFT], dir: 2 },
  { name: 'Bremsbalance -', id: 148, vk: VK('B'), mods: [CTRL], dir: 1 },
  { name: 'Bremsbalance +', id: 148, vk: VK('B'), mods: [SHIFT], dir: 2 },
  { name: 'Scheibenwischer', id: 155, vk: VK('W'), mods: [ALT], dir: 1 },
  { name: 'TC-Cut -', id: 142, vk: VK('Y'), mods: [CTRL], dir: 1, guess: true },
  { name: 'TC-Cut +', id: 142, vk: VK('Y'), mods: [SHIFT], dir: 2, guess: true },
  { name: 'Regenscheinwerfer', id: 122, vk: VK('L'), mods: [CTRL], dir: null, guess: true },
  { name: 'Warnblinker', id: 134, vk: VK('H'), mods: [ALT], dir: null, guess: true },
];

// ---- Protobuf-Helfer ----
function varint(n) {
  let v = BigInt(n);
  const out = [];
  do { let b = Number(v & 0x7fn); v >>= 7n; if (v) b |= 0x80; out.push(b); } while (v);
  return Buffer.from(out);
}
function readVarint(buf, p) {
  let v = 0n, s = 0n;
  for (;;) { const c = buf[p++]; v |= BigInt(c & 0x7f) << s; s += 7n; if (!(c & 0x80)) break; }
  return [v, p];
}
const NEG1 = Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01]);

function entry(b) {
  let inner;
  if (b.simple) inner = Buffer.concat([Buffer.from([0x08]), varint(b.id), Buffer.from([0x28]), varint(b.id)]);
  else {
    inner = Buffer.concat([
      Buffer.from([0x08]), varint(b.id), Buffer.from([0x10, 0x01]),
      b.dir ? Buffer.from([0x18, b.dir]) : Buffer.alloc(0),
      Buffer.from([0x20]), NEG1, Buffer.from([0x28]), varint(b.id),
    ]);
  }
  const parts = [Buffer.from([0x0a]), varint(inner.length), inner, Buffer.from([0x10]), varint(b.vk)];
  if (b.mods.length) parts.push(Buffer.from([0x1a]), varint(b.mods.length), Buffer.from(b.mods));
  const body = Buffer.concat(parts);
  return Buffer.concat([Buffer.from([0x12]), varint(body.length), body]);
}

function splitTop(buf) {
  const items = [];
  let p = 0;
  while (p < buf.length) {
    const start = p;
    let tag; [tag, p] = readVarint(buf, p);
    const field = Number(tag >> 3n), wt = Number(tag & 7n);
    let payload = null;
    if (wt === 0) { [, p] = readVarint(buf, p); }
    else if (wt === 2) { let l; [l, p] = readVarint(buf, p); payload = buf.subarray(p, p + Number(l)); p += Number(l); }
    else throw new Error('Unbekannter Wire-Typ ' + wt);
    items.push({ field, raw: buf.subarray(start, p), payload });
  }
  return items;
}

function entryActionId(item) {
  const body = item.payload; // 0a LEN inner ...
  if (body[0] !== 0x0a) return null;
  let p = 1, l; [l, p] = readVarint(body, p);
  const inner = body.subarray(p, p + Number(l));
  if (inner[0] !== 0x08) return null;
  return Number(readVarint(inner, 1)[0]);
}

const defaultFile = () => path.join(os.homedir(), 'Saved Games', 'ACE', 'input_keyboard.keyboardinputconfiguration');

function apply({ file = defaultFile(), dryRun = false } = {}) {
  if (!fs.existsSync(file)) throw new Error('Belegungsdatei nicht gefunden: ' + file + ' (AC EVO einmal starten und beenden)');
  const src = fs.readFileSync(file);
  const items = splitTop(src);
  const ours = new Set(BINDINGS.map((b) => b.id));
  const kept = items.filter((it) => !(it.field === 2 && ours.has(entryActionId(it))));
  const removed = items.length - kept.length;

  // neue Eintraege hinter den letzten vorhandenen Belegungs-Eintrag setzen
  let lastEntry = -1;
  kept.forEach((it, i) => { if (it.field === 2) lastEntry = i; });
  const fresh = BINDINGS.map((b) => ({ field: 2, raw: entry(b) }));
  const merged = [...kept.slice(0, lastEntry + 1), ...fresh, ...kept.slice(lastEntry + 1)];
  const out = Buffer.concat(merged.map((it) => it.raw));

  const result = { file, removed, added: fresh.length, guessed: BINDINGS.filter((b) => b.guess).map((b) => b.name), backup: null, bytes: out.length };
  if (dryRun) return result;

  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  result.backup = file + '.bak-' + stamp;
  fs.copyFileSync(file, result.backup);
  fs.writeFileSync(file, out);
  return result;
}

module.exports = { apply, BINDINGS };

if (require.main === module) {
  try { console.log(JSON.stringify(apply({ dryRun: process.argv.includes('--dry') }), null, 2)); }
  catch (e) { console.error(e.message); process.exit(1); }
}
