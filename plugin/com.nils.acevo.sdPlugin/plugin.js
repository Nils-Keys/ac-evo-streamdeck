// AC Evo Live: zeigt SimHub-Werte auf Stream-Deck-Tasten (Node 20, ohne Abhaengigkeiten)
const http = require('http');
const crypto = require('crypto');

const args = {};
for (let i = 2; i < process.argv.length; i += 2) args[process.argv[i].replace(/^-/, '')] = process.argv[i + 1];

let cfgPort = 8888;
try { cfgPort = require('./config.json').port || 8888; } catch { /* optional */ }
let LANG = 'en';
try { LANG = String((JSON.parse(args.info).application || {}).language || 'en'); } catch { /* Standard: englisch */ }
const SIMHUB = { host: '127.0.0.1', port: cfgPort, path: '/api/getgamedata' };
const contexts = new Map(); // context -> { metric, last }
const setups = new Set(); // Tasten der Aktion 'Evo Setup'
const { execFile } = require('child_process');
const glyphs = require('./glyphs');
let send = () => {};
let data = null;

// ---- minimaler WebSocket-Client ----
function frame(sock, op, payload) {
  const len = payload.length;
  let h;
  if (len < 126) h = Buffer.from([0x80 | op, 0x80 | len]);
  else if (len < 65536) { h = Buffer.alloc(4); h[0] = 0x80 | op; h[1] = 0x80 | 126; h.writeUInt16BE(len, 2); }
  else { h = Buffer.alloc(10); h[0] = 0x80 | op; h[1] = 0x80 | 127; h.writeBigUInt64BE(BigInt(len), 2); }
  const mask = crypto.randomBytes(4);
  const m = Buffer.alloc(len);
  for (let i = 0; i < len; i++) m[i] = payload[i] ^ mask[i % 4];
  sock.write(Buffer.concat([h, mask, m]));
}

function connect(port, onMessage, onOpen) {
  const req = http.request({
    host: '127.0.0.1', port,
    headers: {
      Connection: 'Upgrade', Upgrade: 'websocket',
      'Sec-WebSocket-Key': crypto.randomBytes(16).toString('base64'),
      'Sec-WebSocket-Version': '13',
    },
  });
  req.on('upgrade', (res, sock) => {
    let buf = Buffer.alloc(0);
    sock.on('data', (d) => {
      buf = Buffer.concat([buf, d]);
      for (;;) {
        if (buf.length < 2) break;
        let len = buf[1] & 0x7f, off = 2;
        if (len === 126) { if (buf.length < 4) break; len = buf.readUInt16BE(2); off = 4; }
        else if (len === 127) { if (buf.length < 10) break; len = Number(buf.readBigUInt64BE(2)); off = 10; }
        if (buf.length < off + len) break;
        const op = buf[0] & 0x0f;
        const payload = buf.subarray(off, off + len);
        buf = buf.subarray(off + len);
        if (op === 1) onMessage(payload.toString('utf8'));
        else if (op === 8) process.exit(0);
        else if (op === 9) frame(sock, 10, payload);
      }
    });
    sock.on('close', () => process.exit(0));
    sock.on('error', () => process.exit(0));
    onOpen((obj) => frame(sock, 1, Buffer.from(JSON.stringify(obj))));
  });
  req.on('error', () => process.exit(1));
  req.end();
}

// ---- Darstellung im JustPush-Stil ----
const COLORS = { abs: '#FF0BF4', tc: '#00FFF2', cut: '#8A5CFF', map: '#FFA31A', bb: '#FFFFFF', fuel: '#3BE05A', gear: '#FFFFFF', tyre: '#3BE05A', press: '#00FFF2', off: '#FF2020', dim: '#555555' };

function tint(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = (s) => Math.round(((n >> s) & 255) * f).toString(16).padStart(2, '0');
  return '#' + c(16) + c(8) + c(0);
}

// gleicher Look wie die Tasten-Icons: abgeschnittene Ecken, Lichtschein, Farbplatte mit Label unten
// curFlag != null: Flag-Modus, die Taste wird komplett in der Flaggenfarbe dargestellt
let curFlag = null;
let curSym = null; // Symbol-Name der aktuellen Anzeige
function svg(color, label, value, size) {
  const str = String(value);
  const vs = Math.min(label ? 58 : 80, size ? size * 1.7 : str.length > 4 ? 40 : str.length > 2 ? 48 : 58);
  const fl = curFlag;
  const bgTop = fl ? fl : '#232833', bgBot = fl ? fl : '#090a0d';
  const txt = fl ? '#0b0c10' : '#ffffff';
  const plateFill = fl ? '#0b0c10' : color, plateTxt = fl ? fl : '#0b0c10';
  const plate = label ? `<path d="M3 102 H141 V128 L128 141 H16 L3 128 Z" fill="${plateFill}"/><text x="72" y="130" font-family="Arial,Helvetica,sans-serif" font-weight="bold" font-size="${label.length > 8 ? 17 : 22}" letter-spacing="${label.length > 8 ? 1 : 2}" text-anchor="middle" fill="${plateTxt}">${label}</text>` : '';
  const vy = label ? 70 + Math.round(vs / 3) : 72 + Math.round(vs / 3);
  const stripes = fl ? '' : [-40, 0, 40, 80, 120].map((x) => `<path d="M${x} 100 L${x + 100} 0" stroke="${color}" stroke-opacity="0.07" stroke-width="10"/>`).join('');
  const glow = fl ? '' : `<circle cx="72" cy="54" r="58" fill="url(#r)"/>`;
  const shape = 'M16 3 H128 L141 16 V128 L128 141 H16 L3 128 V16 Z';
  const sym = curSym && label ? glyphs.glyph(curSym, fl ? '#0b0c10' : color, 54, 8, 1.5) : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="144" height="144" viewBox="0 0 144 144"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bgTop}"/><stop offset="1" stop-color="${bgBot}"/></linearGradient><radialGradient id="r" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${color}" stop-opacity="0.5"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient><clipPath id="c"><path d="${shape}"/></clipPath></defs><path d="${shape}" fill="url(#g)"/><g clip-path="url(#c)">${stripes}${glow}</g><path d="${shape}" fill="none" stroke="${fl || color}" stroke-width="4"/>${sym}<text x="72" y="${vy}" font-family="Arial,Helvetica,sans-serif" font-weight="bold" font-size="${vs}" text-anchor="middle" fill="${txt}">${str}</text>${plate}</svg>`;
}

const FLAGS = [['Flag_Black', '#FFFFFF'], ['Flag_Yellow', '#FFD400'], ['Flag_Blue', '#3D7BFF'], ['Flag_White', '#EEEEEE'], ['Flag_Orange', '#FF9D00'], ['Flag_Green', '#35E07A'], ['Flag_Checkered', '#FFFFFF']];
function activeFlag(d) { const f = d && FLAGS.find((x) => d[x[0]]); return f ? f[1] : null; }
const num = (v, d = 0) => (typeof v === 'number' && isFinite(v) ? v.toFixed(d) : '--');

// SimHub liefert Zeiten als "hh:mm:ss.fffffff" oder als Sekunden
function toSec(v) {
  if (typeof v === 'number') return v;
  const m = /^(?:(\d+)\.)?(\d+):(\d+):(\d+(?:\.\d+)?)$/.exec(String(v || ''));
  return m ? (+(m[1] || 0)) * 86400 + +m[2] * 3600 + +m[3] * 60 + +m[4] : null;
}
function tstr(v) { const s = toSec(v); if (s == null || s <= 0) return '--'; const m = Math.floor(s / 60); return m + ':' + (s - m * 60).toFixed(1).padStart(4, '0'); }
function tleft(v) { const s = toSec(v); if (s == null || s < 0) return '--'; const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = Math.floor(s % 60); return h ? h + ':' + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0') : m + ':' + String(x).padStart(2, '0'); }
function render(metric, d) {
  if (!d) return svg(COLORS.dim, '', 'EVO', 20);
  const lvl = (name, label, col) => { const v = d[name]; return v === 0 ? svg(COLORS.off, label, 'OFF', 22) : svg(col, label, num(v)); };
  switch (metric) {
    case 'abs': return lvl('ABSLevel', 'ABS', COLORS.abs);
    case 'tc': return lvl('TCLevel', 'TC', COLORS.tc);
    case 'cut': return svg(COLORS.dim, 'CUT', '--');
    case 'map': return svg(COLORS.map, 'MAP', num(d.EngineMap));
    case 'bb': return svg(COLORS.bb, 'BB', num(d.BrakeBias, 1), 24);
    case 'fuel': return svg(COLORS.fuel, 'FUEL', num(d.Fuel, 0) + 'L', 26);
    case 'gear': return svg(COLORS.gear, 'GEAR', d.Gear == null ? '-' : d.Gear, 34);
    case 'limiter': return d.PitLimiterOn ? svg('#FFA31A', 'LIMIT', 'ON', 24) : svg(COLORS.dim, 'LIMIT', 'OFF', 22);
    case 'tt_fl': case 'tt_fr': case 'tt_rl': case 'tt_rr': {
      const k = { tt_fl: 'FrontLeft', tt_fr: 'FrontRight', tt_rl: 'RearLeft', tt_rr: 'RearRight' }[metric];
      const v = d['TyreTemperature' + k];
      const c = v < 70 ? '#4DA6FF' : v < 105 ? COLORS.tyre : COLORS.off;
      return svg(c, metric.slice(3).toUpperCase() + ' C', num(v), 28);
    }
    case 'tp_fl': case 'tp_fr': case 'tp_rl': case 'tp_rr': {
      const k = { tp_fl: 'FrontLeft', tp_fr: 'FrontRight', tp_rl: 'RearLeft', tp_rr: 'RearRight' }[metric];
      return svg(COLORS.press, metric.slice(3).toUpperCase() + ' PSI', num(d['TyrePressure' + k] * 14.5038, 1), 24);
    }
    case 'tw_fl': case 'tw_fr': case 'tw_rl': case 'tw_rr': {
      const k = { tw_fl: 'FrontLeft', tw_fr: 'FrontRight', tw_rl: 'RearLeft', tw_rr: 'RearRight' }[metric];
      const w = d['TyreWear' + k];
      return svg(COLORS.tyre, metric.slice(3).toUpperCase() + ' WEAR', w == null ? '--' : num(100 - w * (w <= 1 ? 100 : 1)) + '%', 24);
    }
    case 'flag': {
      const f = [['Flag_Black', '#FFFFFF', 'BLACK'], ['Flag_Yellow', '#FFE600', 'YELLOW'], ['Flag_Blue', '#3D7BFF', 'BLUE'], ['Flag_White', '#FFFFFF', 'WHITE'], ['Flag_Orange', '#FFA31A', 'ORANGE'], ['Flag_Green', '#3BE05A', 'GREEN'], ['Flag_Checkered', '#FFFFFF', 'FINISH']].find((x) => d[x[0]]);
      return f ? svg(f[1], 'FLAG', f[2], 15) : svg(COLORS.dim, 'FLAG', '-', 26);
    }
    case 'lap': return svg('#00E5FF', 'LAP', tstr(d.CurrentLapTime), 17);
    case 'last': return svg('#FFFFFF', 'LAST', tstr(d.LastLapTime), 17);
    case 'best': return svg('#B266FF', 'BEST', tstr(d.BestLapTime), 17);
    case 'delta': { const v = d.DeltaToSessionBest; const c = typeof v !== 'number' ? COLORS.dim : v <= 0 ? '#35E07A' : '#FF3B30'; return svg(c, 'DELTA', typeof v === 'number' ? (v > 0 ? '+' : '') + v.toFixed(2) : '--', 21); }
    case 'pos': return svg('#FFD400', 'POS', d.Position ? 'P' + d.Position : '--', 30);
    case 'laps': return svg('#FFFFFF', 'LAPS', d.TotalLaps > 0 ? num(d.CompletedLaps) + '/' + num(d.TotalLaps) : num(d.CompletedLaps), 24);
    case 'left': return svg('#FFA31A', 'LEFT', tleft(d.SessionTimeLeft), 20);
    case 'speed': return svg('#00E5FF', 'KM/H', num(d.SpeedKmh), 30);
    case 'rpm': return svg('#FF3D3D', 'RPM', num(d.Rpms), 22);
    case 'oil': return svg('#FFA31A', 'OIL', num(d.OilTemperature) + '°', 26);
    case 'air': return svg('#4D8DFF', 'AIR', num(d.AirTemperature) + '°', 26);
    case 'road': return svg('#4D8DFF', 'TRACK', num(d.RoadTemperature) + '°', 26);
    case 'damage': { const v = d.CarDamagesMax; return svg(v > 0 ? '#FF3B30' : '#35E07A', 'DAMAGE', num(v), 30); }
    case 'fuellaps': return svg('#35E07A', 'FUEL LAPS', num(d.EstimatedFuelRemaingLaps, 1), 26);
    case 'sector': return svg('#B266FF', 'SECTOR', d.CurrentSectorIndex == null ? '--' : 'S' + (d.CurrentSectorIndex + 1), 30);
    case 'br_fl': case 'br_fr': case 'br_rl': case 'br_rr': {
      const k = { br_fl: 'FrontLeft', br_fr: 'FrontRight', br_rl: 'RearLeft', br_rr: 'RearRight' }[metric];
      const v = d['BrakeTemperature' + k];
      const c = v < 200 ? '#4DA6FF' : v < 700 ? '#35E07A' : '#FF3B30';
      return svg(c, 'BRK ' + metric.slice(3).toUpperCase(), num(v), 26);
    }
    case 'tyreavg': return svg('#35E07A', 'TYRES', num(d.TyresTemperatureAvg) + '°', 26);
    case 'wearmax': { const w = d.TyresWearMax; return svg('#35E07A', 'WEAR', w == null ? '--' : num(100 - w * (w <= 1 ? 100 : 1)) + '%', 24); }
    default: return svg(COLORS.dim, '?', metric || '', 16);
  }
}

function paint(ctx) {
  const c = contexts.get(ctx);
  if (!c) return;
  const flag = c.metric !== 'flag' && c.flagMode !== 'disabled' ? activeFlag(data) : null;
  curFlag = flag && (c.flagMode === 'solid' || Math.floor(Date.now() / 500) % 2 === 0) ? flag : null; // 'solid' = dauerhaft, sonst blinkend
  curSym = glyphs.FOR[c.metric] || null;
  const img = render(c.metric, data);
  curFlag = null; curSym = null;
  if (img === c.last) return;
  c.last = img;
  send({ event: 'setImage', context: ctx, payload: { image: 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(img), target: 0 } });
}

// ---- Makro: Tastenbelegung in AC EVO eintragen ----
function setKey(ctx, img) {
  send({ event: 'setImage', context: ctx, payload: { image: 'data:image/svg+xml;charset=utf8,' + encodeURIComponent(img), target: 0 } });
}
function setupIdle(ctx) { setKey(ctx, LANG.toLowerCase().startsWith('de') ? svg('#35E07A', 'EINRICHTEN', 'TASTEN', 16) : svg('#35E07A', 'SETUP', 'KEYS', 20)); }
function runSetup(ctx) {
  execFile('tasklist', ['/FI', 'IMAGENAME eq AssettoCorsaEVO.exe', '/NH'], { windowsHide: true }, (err, out) => {
    if (/AssettoCorsaEVO\.exe/i.test(out || '')) { // Evo ueberschreibt die Datei beim Beenden
      setKey(ctx, svg('#FF3B30', 'CLOSE', 'EVO', 26));
      send({ event: 'showAlert', context: ctx });
    } else {
      try { require('./evo-bindings').apply(); setKey(ctx, svg('#35E07A', 'DONE', 'OK', 30)); send({ event: 'showOk', context: ctx }); }
      catch (e) { setKey(ctx, svg('#FF3B30', 'ERROR', '!', 30)); send({ event: 'showAlert', context: ctx }); }
    }
    setTimeout(() => setupIdle(ctx), 3000);
  });
}
function poll() {
  http.get({ ...SIMHUB, timeout: 1500 }, (res) => {
    let s = '';
    res.on('data', (d) => (s += d));
    res.on('end', () => {
      try { const j = JSON.parse(s); data = j && j.NewData && j.GameName === 'AssettoCorsaEVO' ? j.NewData : null; } catch { data = null; }
      contexts.forEach((_, ctx) => paint(ctx));
    });
  }).on('error', () => { data = null; contexts.forEach((_, ctx) => paint(ctx)); }).on('timeout', function () { this.destroy(); });
}

connect(args.port, (msg) => {
  let m; try { m = JSON.parse(msg); } catch { return; }
  if (m.action === 'com.nils.acevo.setup') {
    if (m.event === 'willAppear') { setups.add(m.context); setupIdle(m.context); }
    else if (m.event === 'willDisappear') setups.delete(m.context);
    else if (m.event === 'keyUp') runSetup(m.context);
    return;
  }
  if (m.event === 'willAppear' || m.event === 'didReceiveSettings') {
    const st = (m.payload && m.payload.settings) || {};
    contexts.set(m.context, { metric: st.metric || '', flagMode: st.flagMode || 'enabled', last: null });
    paint(m.context);
  } else if (m.event === 'willDisappear') contexts.delete(m.context);
}, (s) => {
  send = s;
  send({ event: args.registerEvent, uuid: args.pluginUUID });
  setInterval(poll, 250);
});
