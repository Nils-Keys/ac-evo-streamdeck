// Erzeugt die Text-Kacheln fuer die Hilfe-Seite (Seite 4). Aufruf: node gen-help.js <zielordner>
const fs = require('fs');
const path = require('path');
const out = process.argv[2] || path.join(__dirname, '..', 'icons', 'help');
fs.mkdirSync(out, { recursive: true });

const glyphs = require(path.join(__dirname, '..', 'plugin', 'com.nils.acevo.sdPlugin', 'glyphs.js'));
const FONT = 'font-family="Arial,Helvetica,sans-serif" font-weight="bold"';
const BG = '#0b0c10';
const Y = '#FFD400', C = '#00E5FF', M = '#FF3DD8', G = '#35E07A', GR = '#A0A4AB';

// [spalte, reihe, farbe, badge?, zeilen]
// Links: Seiten-Erklaerung (Spalte 0-2). Rechts: SETUP in 3 Schritten (Spalte 4-6). Unten rechts: SETUP-Taste.
const tilesDe = [
  [0, 0, Y, true, ['SEITE', '1']], [1, 0, Y, false, ['STEUERN'], 'wheel'], [2, 0, Y, false, ['Tasten', 'für Evo']],
  [0, 1, C, true, ['SEITE', '2']], [1, 1, C, false, ['REIFEN'], 'tyre'], [2, 1, C, false, ['Temp,', 'Druck,', 'Verschl.']],
  [0, 2, M, true, ['SEITE', '3']], [1, 2, M, false, ['INFO'], 'watch'], [2, 2, M, false, ['Zeiten,', 'Speed,', 'Temp']],
  [4, 0, G, true, ['1']], [5, 0, G, false, ['Evo']], [6, 0, G, false, ['beenden']],
  [4, 1, G, true, ['2']], [5, 1, G, false, ['grüne', 'Taste']], [6, 1, G, false, ['drücken']],
  [4, 2, G, true, ['3']], [5, 2, G, false, ['DONE']], [6, 2, G, false, ['= fertig']],
  [4, 3, G, false, ['Tasten']], [5, 3, G, false, ['in Evo']], [6, 3, G, false, ['eintragen', '→']],
];

const tilesEn = [
  [0, 0, Y, true, ['PAGE', '1']], [1, 0, Y, false, ['CONTROLS'], 'wheel'], [2, 0, Y, false, ['Sends', 'keys', 'to Evo']],
  [0, 1, C, true, ['PAGE', '2']], [1, 1, C, false, ['TYRES'], 'tyre'], [2, 1, C, false, ['Temp,', 'Pressure,', 'Wear']],
  [0, 2, M, true, ['PAGE', '3']], [1, 2, M, false, ['INFO'], 'watch'], [2, 2, M, false, ['Lap times,', 'Speed,', 'Temps']],
  [4, 0, G, true, ['1']], [5, 0, G, false, ['Close']], [6, 0, G, false, ['Evo']],
  [4, 1, G, true, ['2']], [5, 1, G, false, ['green', 'key']], [6, 1, G, false, ['press']],
  [4, 2, G, true, ['3']], [5, 2, G, false, ['DONE']], [6, 2, G, false, ['= ready']],
  [4, 3, G, false, ['Sets']], [5, 3, G, false, ['keys']], [6, 3, G, false, ['in Evo', '→']],
];
const tiles = process.argv[3] === 'en' ? tilesEn : tilesDe;
const size = (lines) => {
  const n = Math.max(...lines.map((l) => l.length));
  if (lines.length === 1 && lines[0].length <= 2) return 72; // grosse Ziffer
  return n <= 3 ? 44 : n <= 4 ? 38 : n <= 5 ? 34 : n <= 6 ? 30 : n <= 7 ? 24 : n <= 8 ? 22 : 20;
};

function tile(color, badge, lines, sym) {
  const fs_ = sym ? Math.min(size(lines), 30) : size(lines), lh = fs_ * 1.2, total = lh * lines.length;
  const y0 = (sym ? 88 : 72) - total / 2 + fs_ * 0.85;
  const g = sym ? glyphs.glyph(sym, color, 46, 14, 2.1) : '';
  const txt = lines.map((l, i) => `<text x="72" y="${(y0 + i * lh).toFixed(1)}" ${FONT} font-size="${fs_}" text-anchor="middle" fill="${badge ? BG : '#FFFFFF'}">${l}</text>`).join('');
  const shape = 'M16 3 H128 L141 16 V128 L128 141 H16 L3 128 V16 Z';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#232833"/><stop offset="1" stop-color="#090a0d"/></linearGradient></defs>
<path d="${shape}" fill="${badge ? color : 'url(#g)'}"/>
<path d="${shape}" fill="none" stroke="${color}" stroke-width="4"/>
${g}${txt}
</svg>
`;
}
const layout = [];
for (const [c, r, color, badge, lines, sym] of tiles) {
  const name = `help-${c}-${r}.svg`;
  fs.writeFileSync(path.join(out, name), tile(color, badge, lines, sym));
  layout.push({ key: `${c},${r}`, file: name });
}
fs.writeFileSync(path.join(out, 'layout.json'), JSON.stringify(layout));
console.log(layout.length + ' Hilfe-Kacheln -> ' + out);
