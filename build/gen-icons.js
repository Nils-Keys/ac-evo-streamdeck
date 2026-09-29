// Erzeugt das eigene Icon-Set (144x144 SVG) fuer AC Evo Live.
// Aufruf: node gen-icons.js <zielordner>
const fs = require('fs');
const path = require('path');

const out = process.argv[2] || path.join(__dirname, '..', 'icons');
fs.mkdirSync(out, { recursive: true });

const C = {
  abs: '#FF3DD8', tc: '#00E5FF', cut: '#9B6BFF', bb: '#E8ECF1', map: '#FFA31A',
  ind: '#FFD400', light: '#35E07A', blue: '#4D8DFF', haz: '#FF7A00', red: '#FF3B30', gray: '#A0A4AB',
};
const FONT = "font-family=\"Arial,Helvetica,sans-serif\" font-weight=\"bold\"";
const BG = '#0b0c10';

function frame(color, inner, label) {
  const plate = label
    ? `<path d="M3 102 H141 V128 L128 141 H16 L3 128 Z" fill="${color}"/><text x="72" y="130" ${FONT} font-size="22" letter-spacing="2" text-anchor="middle" fill="${BG}">${label}</text>`
    : '';
  const stripes = [-40, 0, 40, 80, 120].map((x) => `<path d="M${x} 100 L${x + 100} 0" stroke="${color}" stroke-opacity="0.07" stroke-width="10"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#232833"/><stop offset="1" stop-color="#090a0d"/></linearGradient>
<radialGradient id="r" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${color}" stop-opacity="0.5"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>
<clipPath id="c"><path d="M16 3 H128 L141 16 V128 L128 141 H16 L3 128 V16 Z"/></clipPath>
</defs>
<path d="M16 3 H128 L141 16 V128 L128 141 H16 L3 128 V16 Z" fill="url(#g)"/>
<g clip-path="url(#c)">${stripes}<circle cx="72" cy="54" r="58" fill="url(#r)"/></g>
<path d="M16 3 H128 L141 16 V128 L128 141 H16 L3 128 V16 Z" fill="none" stroke="${color}" stroke-width="4"/>
<path d="M18 9 H126 L135 18" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="2"/>
<g transform="translate(72 52) scale(1.08) translate(-72 -56)">${inner}</g>
${plate}
</svg>
`;
}
const W = '#FFFFFF';
const stroke = (c, w) => `fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

// ---- Symbole (Mitte ca. 72/56) ----
const dShape = (c) => `<path d="M58 36 H74 A20 20 0 0 1 74 76 H58 Z" fill="${c}"/>`;
const glyph = {
  esc: `<rect x="40" y="34" width="64" height="44" rx="9" ${stroke(W, 4)}/><text x="72" y="63" ${FONT} font-size="24" text-anchor="middle" fill="${W}">ESC</text>`,
  limiter: `<circle cx="72" cy="56" r="29" ${stroke(C.red, 8)}/><text x="72" y="65" ${FONT} font-size="26" text-anchor="middle" fill="${W}">PIT</text>`,
  ignition: `<path d="M58 38 A24 24 0 1 0 86 38" ${stroke(W, 7)}/><path d="M72 28 V54" ${stroke('#9B6BFF', 7)}/>`,
  starter: `<circle cx="72" cy="56" r="29" ${stroke(C.red, 7)}/><path d="M63 42 V70 L88 56 Z" fill="${W}" stroke="${W}" stroke-width="3" stroke-linejoin="round"/>`,
  indl: `<path d="M28 56 L60 28 V44 H112 V68 H60 V84 Z" fill="${C.ind}"/>`,
  indr: `<path d="M116 56 L84 28 V44 H32 V68 H84 V84 Z" fill="${C.ind}"/>`,
  lights: `<g transform="translate(10,0)">${dShape(C.light)}<path d="M50 42 L28 48 M50 56 L28 62 M50 70 L28 76" ${stroke(C.light, 5)}/></g>`,
  flash: `<g transform="translate(6,0)">${dShape(C.blue)}<path d="M50 42 H28 M50 56 H28 M50 70 H28" ${stroke(C.blue, 5)}/><path d="M104 24 L92 46 H102 L96 66 L116 40 H105 L112 24 Z" fill="${W}"/></g>`,
  rain: `<g transform="translate(4,0)">${dShape(C.blue)}<path d="M50 42 L28 48 M50 56 L28 62 M50 70 L28 76" ${stroke(C.blue, 5)}/><path d="M102 34 L96 48 M112 38 L106 52 M102 58 L96 72 M112 62 L106 76" ${stroke(W, 4)}/></g>`,
  hazard: `<path d="M72 24 L112 90 H32 Z" ${stroke(C.haz, 8)}/><path d="M72 46 L94 80 H50 Z" ${stroke(W, 4)}/>`,
  tyre: `<circle cx="72" cy="56" r="29" ${stroke(W, 7)}/><circle cx="72" cy="56" r="13" ${stroke(C.blue, 5)}/><path d="M72 43 V27 M85 56 H101 M72 69 V85 M59 56 H43" ${stroke(W, 3)}/>`,
  wheel: `<circle cx="72" cy="56" r="29" ${stroke(W, 7)}/><path d="M43 56 H101 M72 56 V85" ${stroke(W, 6)}/><circle cx="72" cy="56" r="6" fill="${W}"/>`,
  wiper: `<path d="M32 82 A46 46 0 0 1 112 82" ${stroke(W, 5)}/><path d="M72 84 L44 46" ${stroke('#5AD1FF', 9)}/><circle cx="72" cy="84" r="7" fill="${W}"/>`,
  next: `<path d="M56 30 L86 56 L56 82" ${stroke(W, 10)}/>`,
  back: `<path d="M88 30 L58 56 L88 82" ${stroke(W, 10)}/>`,
};

const adjust = (color, txt, up, size) => {
  const d = up ? 'M104 32 h16 M112 24 v16' : 'M104 32 h16';
  return `<text x="60" y="80" ${FONT} font-size="${size || 36}" text-anchor="middle" fill="${W}">${txt}</text><circle cx="112" cy="32" r="15" fill="${color}"/><path d="${d}" ${stroke(BG, 4)}/>`;
};

const icons = {
  'esc': frame(C.gray, glyph.esc, 'HOME'),
  'limiter': frame(C.red, glyph.limiter, 'LIMITER'),
  'ignition': frame('#9B6BFF', glyph.ignition, 'IGNITION'),
  'starter': frame(C.red, glyph.starter, 'STARTER'),
  'ind-left': frame(C.ind, glyph.indl, 'LEFT'),
  'ind-right': frame(C.ind, glyph.indr, 'RIGHT'),
  'lights': frame(C.light, glyph.lights, 'LIGHTS'),
  'flash': frame(C.blue, glyph.flash, 'FLASH'),
  'rain': frame(C.blue, glyph.rain, 'RAIN'),
  'hazard': frame(C.haz, glyph.hazard, 'HAZARD'),
  'tyres': frame(C.blue, glyph.tyre, 'TYRES'),
  'wheel': frame(C.gray, glyph.wheel, 'WHEEL'),
  'back': frame(C.gray, glyph.back, 'BACK'),
  'next': frame(C.gray, glyph.next, 'NEXT'),
  'wiper': frame('#5AD1FF', glyph.wiper, 'WIPER'),
  'abs-up': frame(C.abs, adjust(C.abs, 'ABS', true), 'UP'),
  'abs-down': frame(C.abs, adjust(C.abs, 'ABS', false), 'DOWN'),
  'tc-up': frame(C.tc, adjust(C.tc, 'TC', true, 46), 'UP'),
  'tc-down': frame(C.tc, adjust(C.tc, 'TC', false, 46), 'DOWN'),
  'cut-up': frame(C.cut, adjust(C.cut, 'CUT', true), 'UP'),
  'cut-down': frame(C.cut, adjust(C.cut, 'CUT', false), 'DOWN'),
  'bb-up': frame(C.bb, adjust(C.bb, 'BB', true, 46), 'UP'),
  'bb-down': frame(C.bb, adjust(C.bb, 'BB', false, 46), 'DOWN'),
  'map-up': frame(C.map, adjust(C.map, 'MAP', true), 'UP'),
  'map-down': frame(C.map, adjust(C.map, 'MAP', false), 'DOWN'),
};

for (const [name, svg] of Object.entries(icons)) fs.writeFileSync(path.join(out, name + '.svg'), svg);
console.log(Object.keys(icons).length + ' Icons -> ' + out);
