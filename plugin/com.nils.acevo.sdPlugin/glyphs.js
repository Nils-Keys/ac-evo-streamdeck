// Kleine Symbole (24x24), Farbe ueber den Platzhalter @C. Gemeinsam genutzt von plugin.js und build/gen-help.js
const S = {
  therm: '<rect x="10" y="2" width="4" height="13" rx="2"/><circle cx="12" cy="19" r="3.5" fill="@C"/>',
  gauge: '<path d="M3 18 A9 9 0 0 1 21 18"/><path d="M12 18 L17 10"/>',
  tyre: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/>',
  disc: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5" fill="@C"/><circle cx="12" cy="5.5" r="1" fill="@C"/><circle cx="12" cy="18.5" r="1" fill="@C"/><circle cx="5.5" cy="12" r="1" fill="@C"/><circle cx="18.5" cy="12" r="1" fill="@C"/>',
  skid: '<circle cx="12" cy="8" r="5"/><path d="M3 19 Q7.5 15 12 19 T21 19"/>',
  engine: '<path d="M4 9 H8 L10 6 H15 V9 H18 L20 12 V17 H4 Z"/>',
  balance: '<path d="M12 4 V20 M5 20 H19 M4 8 H20"/><path d="M4 8 L2 13 H6 Z M20 8 L18 13 H22 Z"/>',
  fuel: '<path d="M5 21 V4 H14 V21 Z"/><path d="M14 9 H17 Q19 9 19 11 V17 Q19 19 21 19"/><path d="M7 8 H12"/>',
  cog: '<circle cx="12" cy="12" r="4"/><path d="M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M5 5 L7 7 M17 17 L19 19 M5 19 L7 17 M17 7 L19 5"/>',
  ring: '<circle cx="12" cy="12" r="9"/><path d="M7 12 H17"/>',
  watch: '<circle cx="12" cy="14" r="8"/><path d="M12 14 V9 M9 2 H15 M12 2 V6"/>',
  cup: '<path d="M7 3 H17 V9 Q17 14 12 14 Q7 14 7 9 Z"/><path d="M12 14 V18 M8 21 H16 M17 5 H20 Q20 9 17 10 M7 5 H4 Q4 9 7 10"/>',
  delta: '<path d="M12 4 L21 19 H3 Z"/>',
  podium: '<rect x="2" y="13" width="6" height="8"/><rect x="9" y="7" width="6" height="14"/><rect x="16" y="15" width="6" height="6"/>',
  loop: '<path d="M19 12 A7 7 0 1 1 15 6 M15 2 V6 H19"/>',
  hourglass: '<path d="M6 3 H18 M6 21 H18 M7 3 Q7 11 12 12 Q17 11 17 3 M7 21 Q7 13 12 12 Q17 13 17 21"/>',
  drop: '<path d="M12 3 Q19 12 19 15 A7 7 0 0 1 5 15 Q5 12 12 3 Z"/>',
  road: '<path d="M9 3 L4 21 M15 3 L20 21 M12 5 V8 M12 11 V14 M12 17 V20"/>',
  warn: '<path d="M12 3 L22 20 H2 Z"/><path d="M12 9 V14 M12 17 V17.5"/>',
  sector: '<path d="M3 16 L9 8 L15 16 L21 8"/>',
  flag: '<path d="M6 3 V21"/><path d="M6 4 H19 L16 8 L19 12 H6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5 Q9.5 7 12 7 Q14.5 7 14.5 9.5 Q14.5 11 12 12 V14 M12 16.5 V17"/>',
  wheel: '<circle cx="12" cy="12" r="9"/><path d="M3 12 H21 M12 12 V21"/>',
};

// Anzeige-Wert (metric) -> Symbol
const FOR = {
  abs: 'disc', tc: 'skid', cut: 'skid', map: 'engine', bb: 'balance', fuel: 'fuel', fuellaps: 'fuel', gear: 'cog', limiter: 'ring',
  tt_fl: 'therm', tt_fr: 'therm', tt_rl: 'therm', tt_rr: 'therm',
  tp_fl: 'gauge', tp_fr: 'gauge', tp_rl: 'gauge', tp_rr: 'gauge',
  tw_fl: 'tyre', tw_fr: 'tyre', tw_rl: 'tyre', tw_rr: 'tyre', tyreavg: 'tyre', wearmax: 'tyre',
  lap: 'watch', last: 'watch', best: 'cup', delta: 'delta', pos: 'podium', laps: 'loop', left: 'hourglass',
  speed: 'gauge', rpm: 'gauge', oil: 'drop', air: 'therm', road: 'road', damage: 'warn', sector: 'sector',
  br_fl: 'disc', br_fr: 'disc', br_rl: 'disc', br_rr: 'disc', flag: 'flag',
};

// Liefert ein SVG-Fragment (Gruppe) an Position x/y mit Skalierung s
function glyph(name, color, x, y, s) {
  const body = S[name];
  if (!body) return '';
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body.split('@C').join(color)}</g>`;
}

module.exports = { S, FOR, glyph };
