// "The Pig War" — shot plan timed to voice.mp3 (42.19 s, 30 fps, 1266 frames)
// Phrase frames: 0-71 "Two empires nearly went to war." | 84-122 "Over one pig." | 149-186 "In 1859," | 190-308 "an American farmer on San Juan Island found a pig digging up his garden." |
// 323-340 "He shot it." | 357-405 "The pig belonged to the British." | 421-472 "Things escalated fast." | 484-528 "The Americans sent soldiers." | 537-584 "The British sent warships." |
// 598-611 "Soon," | 617-764 "hundreds of troops and dozens of cannons faced each other across one small island." | 782-807 "Nobody fired." | 821-854 "For twelve years," |
// 859-907 "both armies just camped there." | 919-940 "Same island." | 952-977 "Opposite ends." | 995-1010 "Finally," | 1014-1084 "a German emperor was asked to settle the border." |
// 1099-1155 "His panel sided with the Americans." | 1168-1223 "The final death toll of the Pig War?" | 1239-1260 "One pig."
import { M, camFromKeys, idle, blinkAt, lerp, lerp3, ramp, clamp, q } from './motion.js';
export const FPS = 30, TOTAL = 1266;
export const SHOTS = [
  { id: 'hook', a: 0, b: 83, light: 'day' },
  { id: 'pig', a: 84, b: 148, light: 'day' },
  { id: 'farm', a: 149, b: 322, light: 'day' },
  { id: 'aim', a: 323, b: 339, light: 'day' },
  { id: 'bang', a: 340, b: 356, light: 'day' },
  { id: 'hbc', a: 357, b: 420, light: 'day' },
  { id: 'argue', a: 421, b: 483, light: 'day' },
  { id: 'march', a: 484, b: 536, light: 'day' },
  { id: 'ship', a: 537, b: 597, light: 'day' },
  { id: 'standoff', a: 598, b: 781, light: 'day' },
  { id: 'nobody', a: 782, b: 820, light: 'day' },
  { id: 'campUK', a: 821, b: 870, light: 'autumn' },
  { id: 'campUS', a: 871, b: 918, light: 'winter' },
  { id: 'aerial', a: 919, b: 951, light: 'day' },
  { id: 'pan', a: 952, b: 994, light: 'day' },
  { id: 'kaiser', a: 995, b: 1097, light: 'room' },
  { id: 'panel', a: 1098, b: 1167, light: 'room' },
  { id: 'toll', a: 1168, b: 1237, light: 'golden' },
  { id: 'end', a: 1238, b: 1265, light: 'golden' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const { smooth, back, easeOut, easeIn } = M;
const RX = 600; // palace room x offset

// ---------- lights ----------
const base = { fogNear: 90, fogFar: 900, sat: 1.1, glint: '#effaff', waterDeep: '#2c6c8c', waterShal: '#5aaec4', vig: 0.2, shadowExt: 16 };
export const LIGHTS = {
  day: { ...base, az: 140, el: 44, sky: '#c4d6f2', ground: '#8a8262', hemi: 1.15, sun: '#fff1dc', sunI: 2.5, fog: '#cadcf0', skyTop: '#3f80d4', skyHor: '#c3daf2' },
  autumn: { ...base, az: 120, el: 30, sky: '#d8cdb8', ground: '#8a6a42', hemi: 1.1, sun: '#ffd9a8', sunI: 2.4, fog: '#e6d2b4', skyTop: '#6f93c8', skyHor: '#eed9b8', sat: 1.12, gain: '#fff3e4' },
  winter: { ...base, az: 150, el: 22, sky: '#dfe7f2', ground: '#9aa4ae', hemi: 1.3, sun: '#eaf2ff', sunI: 1.8, fog: '#dfe8f2', skyTop: '#8aa6c8', skyHor: '#e6eef6', sat: 0.9, waterDeep: '#36586e', waterShal: '#7a9cae' },
  golden: { ...base, az: 12, el: 11, sky: '#9a90c8', ground: '#6a4c40', hemi: 1.0, sun: '#ffb46c', sunI: 2.8, fog: '#f0b88c', fogNear: 70, fogFar: 800, skyTop: '#6f6eb0', skyHor: '#ffc27e', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.12, gain: '#fff2e2', waterDeep: '#3d5a86', waterShal: '#d99a6e', glint: '#ffe2a8', vig: 0.26 },
  room: { ...base, az: 200, el: 38, sky: '#fff0dc', ground: '#a07050', hemi: 1.8, sun: '#ffe8c8', sunI: 2.2, fog: '#3a2a26', fogNear: 60, fogFar: 300, skyTop: '#3a2a26', skyHor: '#3a2a26', sat: 1.08, gain: '#fff1e0', vig: 0.3, shadowExt: 10 },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 'standoff' || S.id === 'aerial' || S.id === 'pan') L.shadowExt = 70;
  if (S.id === 'ship') L.shadowExt = 40;
  return L;
};

// ---------- cameras ----------
const P = (x, y, z) => [x, y, z];
const CAMS = {
  hook: [{ f: 0, pos: P(0, 1.6, 10.5), look: P(0, 1.45, 3.6), fov: 32 }, { f: 83, pos: P(0, 1.58, 7.8), look: P(0, 1.48, 3.6), fov: 30 }],
  pig: [{ f: 84, pos: P(4.7, 0.7, -0.6), look: P(2.75, 0.45, -2.4), fov: 32 }, { f: 148, pos: P(4.3, 0.68, -1.0), look: P(2.75, 0.45, -2.4), fov: 30 }],
  farm: [
    { f: 149, pos: P(-1.2, 1.9, 8.6), look: P(-3.2, 1.7, 1.4), fov: 40 },
    { f: 186, pos: P(-1.6, 1.9, 7.6), look: P(-3.3, 1.8, 1.4), fov: 38 },
    { f: 200, pos: P(1.6, 2.2, 8.4), look: P(-3.2, 1.1, -3.6), fov: 42 },
    { f: 250, pos: P(1.6, 2.1, 7.6), look: P(-0.8, 1.1, -0.6), fov: 40 },
    { f: 262, pos: P(-2.2, 1.55, 4.2), look: P(1.6, 0.95, -1.6), fov: 38 },
    { f: 322, pos: P(-2.0, 1.55, 3.6), look: P(1.6, 0.95, -1.6), fov: 34 },
  ],
  aim: [{ f: 323, pos: P(-1.0, 1.55, 3.6), look: P(0.3, 1.5, 0.6), fov: 30 }, { f: 339, pos: P(-0.8, 1.55, 3.2), look: P(0.3, 1.5, 0.6), fov: 27 }],
  bang: [{ f: 340, pos: P(5.0, 2.0, 6.0), look: P(11, 6.0, -8), fov: 44 }, { f: 356, pos: P(5.2, 2.1, 5.6), look: P(11, 6.4, -8), fov: 42 }],
  hbc: [{ f: 357, pos: P(1.0, 1.45, 7.6), look: P(1.0, 1.2, 0.8), fov: 40 }, { f: 420, pos: P(1.0, 1.45, 7.0), look: P(1.0, 1.25, 0.8), fov: 39 }],
  argue: [{ f: 421, pos: P(1.0, 1.5, 6.6), look: P(1.0, 1.4, 0.8), fov: 38 }, { f: 432, pos: P(1.0, 1.6, 5.0), look: P(1.0, 1.55, 0.8), fov: 36, ease: 'easeOut' }, { f: 483, pos: P(1.0, 1.6, 4.7), look: P(1.0, 1.58, 0.8), fov: 35 }],
  march: [{ f: 484, pos: P(15.4, 1.4, 4.6), look: P(19.8, 1.2, -2.4), fov: 40 }, { f: 536, pos: P(15.5, 1.4, 4.4), look: P(19.0, 1.25, -1.2), fov: 39 }],
  ship: [{ f: 537, pos: P(-63, 2.2, 9.5), look: P(-110, 8, 4), fov: 44 }, { f: 597, pos: P(-63.5, 2.3, 9.2), look: P(-100, 9, 4), fov: 42 }],
  standoff: [
    { f: 598, pos: P(-37, 3.2, 6), look: P(0, 1.0, 4), fov: 44 },
    { f: 700, pos: P(-52, 13, 8), look: P(2, 0.5, 4), fov: 46 },
    { f: 781, pos: P(-58, 20, 10), look: P(6, 0, 4), fov: 48 },
  ],
  nobody: [{ f: 782, pos: P(27.2, 1.9, 9.6), look: P(29.4, 1.2, 3.4), fov: 38 }, { f: 820, pos: P(27.4, 1.9, 9.0), look: P(29.4, 1.2, 3.4), fov: 36 }],
  campUK: [{ f: 821, pos: P(-38.5, 1.5, 19.5), look: P(-44, 1.0, 11), fov: 38 }, { f: 870, pos: P(-39.5, 1.5, 18.5), look: P(-44, 1.0, 11), fov: 36 }],
  campUS: [{ f: 871, pos: P(39.5, 1.5, 19.5), look: P(44, 1.0, 11), fov: 38 }, { f: 918, pos: P(40.5, 1.5, 18.5), look: P(44, 1.0, 11), fov: 36 }],
  aerial: [{ f: 919, pos: P(0, 150, 12), look: P(0, 0, 4), fov: 54, roll: 90 }, { f: 951, pos: P(0, 140, 12), look: P(0, 0, 4), fov: 54, roll: 90 }],
  pan: [{ f: 952, pos: P(0, 26, 46), look: P(-44, 2, 4), fov: 40 }, { f: 962, pos: P(0, 26, 46), look: P(-44, 2, 4), fov: 40 }, { f: 978, pos: P(0, 26, 46), look: P(44, 2, 4), fov: 40, ease: 'smooth' }, { f: 994, pos: P(2, 25, 44), look: P(44, 2, 4), fov: 38 }],
  kaiser: [{ f: 995, pos: P(RX, 2.4, 4.8), look: P(RX, 2.6, -3.0), fov: 46 }, { f: 1097, pos: P(RX, 2.3, 3.8), look: P(RX, 2.5, -3.0), fov: 44 }],
  panel: [{ f: 1098, pos: P(RX, 2.2, 6.6), look: P(RX, 2.6, -2.8), fov: 48 }, { f: 1167, pos: P(RX, 2.2, 5.8), look: P(RX, 2.7, -2.8), fov: 46 }],
  toll: [{ f: 1168, pos: P(1.5, 1.45, 8.2), look: P(1.5, 1.0, 1.0), fov: 34 }, { f: 1237, pos: P(1.5, 1.35, 6.6), look: P(1.5, 0.95, 1.0), fov: 32 }],
  end: [{ f: 1238, pos: P(1.5, 0.75, 4.0), look: P(1.5, 0.75, 1.3), fov: 32 }, { f: 1265, pos: P(1.5, 0.78, 3.5), look: P(1.5, 0.85, 1.3), fov: 30 }],
};
const KICKS = [{ f: 340, a: 0.07 }, { f: 432, a: 0.04 }, { f: 1122, a: 0.05 }];
export const camAt = (f) => {
  const S = shotAt(f), c = camFromKeys(CAMS[S.id], f, { creep: 0.0008, kicks: KICKS });
  c.flash = f >= 340 && f < 346 ? 0.7 * (1 - (f - 340) / 6) : f >= 1122 && f < 1126 ? 0.4 * (1 - (f - 1122) / 4) : 0;
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOCUS = {
  hook: P(0, 1.5, 3.6), pig: P(2.75, 0.5, -2.4), aim: P(0.3, 1.5, 0.6), bang: P(11, 6, -8), hbc: P(1, 1.4, 0.8), argue: P(1, 1.6, 0.8),
  march: P(18, 1.3, 1), ship: P(-100, 6, 4), standoff: P(-24, 1, 4), nobody: P(29.4, 1.0, 4.0), campUK: P(-44, 1, 11), campUS: P(44, 1, 11), aerial: P(0, 0, 0), pan: P(0, 2, 4),
  kaiser: P(RX, 2.0, -2.3), panel: P(RX, 2.0, -0.3), toll: P(1.5, 1.0, 1.0), end: P(1.5, 0.75, 1.3),
};
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  if (S.id === 'farm') { const t = f < 262 ? P(-1.5, 1.2, -0.5) : P(1.4, 1.0, -1.2); return { focus: dist(C.pos, t), cinf: 7, near: 1 }; }
  const cinf = { standoff: 2, aerial: 0, pan: 2, ship: 4, march: 6, end: 12, pig: 12 }[S.id] ?? 9;
  return { focus: dist(C.pos, FOCUS[S.id]), cinf, near: 1 };
};

// ---------- world state ----------
export const worldAt = (f) => {
  const S = shotAt(f), W = { helmet: null };
  W.signY = f >= 152 && f < 262 ? -3 + 3 * back(ramp(f, 152, 172), 2.2) : -3;
  W.grave = f >= 1168;
  W.stamped = f >= 1122;
  W.shipX = S.id === 'ship' ? lerp(-150, -96, smooth(ramp(f, 537, 597))) : -92;
  return W;
};

// ---------- actors ----------
const life = (f, seed) => { const i = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(i.bob, 3), tilt: q(i.tilt, 1), headTilt: q(i.headTilt, 1) }; };
const PER = (T, who, o, pos, extra = {}) => ({ key: 'pw' + who + JSON.stringify(o), draw: (p) => T.pwPerson(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const PIG = (T, o, pos, extra = {}) => ({ key: 'pig' + JSON.stringify(o), draw: (p) => T.pigCard(p, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const MARCHER = (T, side, v, phase, pos, extra = {}) => {
  const o = side === 'us' ? { ...T.RIFLEMAN, jacket: '#2f4f8f', pants: '#3b4a6a', skin: T.SKINS[v % 4] } : { ...T.RIFLEMAN, jacket: '#c0352f', pants: '#2b2f3a', skin: T.SKINS[v % 4] };
  if (v % 3 === 1) o.moustache = '#4a3426';
  const op = { mode: phase === null ? 'stand' : 'march', phase: phase ?? 0, expr: 'stern', seed: 5 + v, facing: side === 'us' ? -1 : 1 };
  return { key: 'm' + side + v + JSON.stringify(op), draw: (p) => T.bodyFront(p, o, op), x: pos[0], y: pos[1], z: pos[2], ...extra };
};
const SITTER = (T, side, v, o2, pos, extra = {}) => {
  const o = side === 'us' ? { ...T.RIFLEMAN, jacket: '#2f4f8f', pants: '#3b4a6a', rifle: false, skin: T.SKINS[v % 4] } : { ...T.RIFLEMAN, jacket: '#c0352f', pants: '#2b2f3a', rifle: false, skin: T.SKINS[v % 4] };
  const op = { mode: 'sit', expr: 'neutral', seed: 9 + v, ...o2 };
  return { key: 's' + side + v + JSON.stringify(op), draw: (p) => T.bodyFront(p, o, op), x: pos[0], y: pos[1], z: pos[2], ...extra };
};

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const per = (who, seed, o, pos, extra) => out.push(PER(T, who, { ...life(f, seed), ...o }, pos, extra));
  switch (S.id) {
    case 'hook': {
      per('ukOff', 11, { expr: 'stubborn', facing: 1, look: 0.6 }, P(-0.62, 0, 3.6));
      per('usOff', 12, { expr: 'stubborn', facing: -1, look: -0.6 }, P(0.62, 0, 3.6));
      per('ukSol', 13, { expr: 'stern', facing: 1 }, P(-2.4, 0, 1.6)); per('usSol', 14, { expr: 'stern', facing: -1 }, P(2.4, 0, 1.6));
      if (f >= 50) out.push(PIG(T, { expr: 'chew', chew: q((f * 0.08) % 1, 2), blink: blinkAt(f, 3) }, P(0, 0, 3.0), { s: 0.8 }));
      break;
    }
    case 'pig': {
      const chewing = f < 130;
      out.push(PIG(T, { expr: chewing ? 'chew' : 'happy', chew: q((f * 0.09) % 1, 2), blink: blinkAt(f, 3), dig: true }, P(2.6, 0, -2.4)));
      break;
    }
    case 'farm': {
      // the pig digging in the garden the whole time
      out.push(PIG(T, { expr: f > 300 ? 'shock' : 'chew', chew: q((f * 0.09) % 1, 2), dig: true, blink: blinkAt(f, 3) }, P(2.6, 0, -2.4), { sx: 1 }));
      if (f >= 196) {
        const t = smooth(ramp(f, 196, 252)), x = lerp(-6.0, -0.4, t), z = lerp(-6.4, 0.9, t), walking = f < 252;
        const ex = f < 262 ? 'smile' : f < 285 ? 'shock' : 'stubborn';
        per('farmer', 21, { expr: ex, facing: f < 262 ? 0.4 : 1, look: f >= 262 ? 0.7 : 0.2, step: walking ? q(((f - 196) * 0.05) % 1, 2) : 0, L: f >= 262 && f < 285 ? 'cheek' : 'hang', R: f >= 262 && f < 285 ? 'cheek' : 'hang' }, P(x, 0, z));
      }
      break;
    }
    case 'aim': per('farmer', 21, { expr: 'stubborn', facing: 1, look: 0.8, aim: true }, P(0.0, 0, 0.6)); break;
    case 'hbc': {
      per('farmer', 21, { expr: 'nervous', facing: 1, look: 0.6, L: 'cheek', R: 'hang' }, P(0.25, 0, 0.8));
      const arrive = smooth(ramp(f, 357, 372));
      per('hbc', 31, { expr: 'stubborn', facing: -1, look: -0.7, L: f > 368 ? 'point' : 'hang', R: 'hip' }, P(lerp(3.6, 1.75, arrive), 0, 0.8));
      break;
    }
    case 'argue': {
      const shake = (s) => q(3 * Math.sin(f * 0.9 + s), 1);
      per('farmer', 21, { expr: 'stubborn', facing: 1, look: 0.8, L: 'hip', R: 'point', headTilt: shake(0) }, P(0.6, 0, 0.8));
      per('hbc', 31, { expr: 'stubborn', facing: -1, look: -0.8, L: 'point', R: 'hip', headTilt: shake(2) }, P(1.42, 0, 0.8));
      break;
    }
    case 'march': {
      const adv = (f - 484) * 0.045, ph = q(((f - 484) * 0.055) % 1, 2);
      out.push(PER(T, 'usOff', { ...life(f, 41), expr: 'stern', facing: -1, R: 'up', step: ph }, P(19.6 - adv * 0.5, 0, -3.0 + adv)));
      for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) out.push(MARCHER(T, 'us', r * 2 + c, (ph + c * 0.5) % 1, P(20.2 - adv * 0.5 + r * 0.7 + c * 0.9, 0, -4.4 + adv - r * 1.3 + c * 0.2)));
      break;
    }
    case 'ship': {
      per('ukSol', 51, { expr: 'grin', facing: -1, look: -0.7, R: 'spear' }, P(-65.2, 0, 10.9));
      break;
    }
    case 'standoff': {
      for (let i = 0; i < 9; i++) { out.push(MARCHER(T, 'us', i, null, P(24, 0, -4 + i * 2.0), { s: 1.4 })); out.push(MARCHER(T, 'uk', i, null, P(-24, 0, -4 + i * 2.0))); }
      per('usOff', 61, { expr: 'stern', facing: -1, R: 'up' }, P(21.5, 0, 4.5)); per('ukOff', 62, { expr: 'stern', facing: 1, L: 'up' }, P(-21.5, 0, 4.5));
      break;
    }
    case 'nobody': {
      per('usSol2', 71, { expr: f > 800 ? 'whistle' : 'neutral', facing: -1, look: -0.4, R: 'spear' }, P(30.6, 0, 2.0));
      break;
    }
    case 'campUK': {
      out.push(SITTER(T, 'uk', 1, { expr: 'smile' }, P(-43, 0, 13.6))); out.push(SITTER(T, 'uk', 2, { expr: 'laugh' }, P(-44.4, 0, 14.2)));
      out.push(SITTER(T, 'uk', 3, { expr: 'dazed', blink: 1 }, P(-45.6, 0, 13.4)));
      per('ukSol2', 81, { expr: 'neutral', facing: 1, R: 'spear' }, P(-41.6, 0, 12.4));
      break;
    }
    case 'campUS': {
      out.push(SITTER(T, 'us', 1, { expr: 'smile' }, P(43, 0, 13.6))); out.push(SITTER(T, 'us', 2, { expr: 'neutral', blink: 1 }, P(44.4, 0, 14.2)));
      out.push(SITTER(T, 'us', 3, { expr: 'laugh' }, P(45.6, 0, 13.4)));
      per('usSol', 91, { expr: 'nervous', facing: -1, R: 'spear', L: 'cheek' }, P(41.6, 0, 12.4));
      break;
    }
    case 'pan': case 'aerial': {
      for (let i = 0; i < 5; i++) { out.push(MARCHER(T, 'us', i, null, P(40 + (i % 3) * 2, 0, 2 + i * 1.6))); out.push(MARCHER(T, 'uk', i, null, P(-40 - (i % 3) * 2, 0, 2 + i * 1.6))); }
      break;
    }
    case 'kaiser': {
      per('kaiser', 101, { expr: f > 1040 ? 'stern' : 'neutral', look: f > 1040 ? 0 : -0.4, R: f > 1045 ? 'up' : 'hang', L: 'hip' }, P(RX, 0, -2.4));
      break;
    }
    case 'panel': {
      per('kaiser', 101, { expr: f > 1124 ? 'smile' : 'stern', L: 'hip', facing: 0 }, P(RX - 0.55, 0, -2.4));
      const nod = (s) => f > 1126 ? q(4 * Math.sin((f - 1126) * 0.45 + s), 1) : 0;
      per('judge', 111, { expr: 'neutral', facing: 1, R: f > 1102 && f < 1124 ? 'up' : 'hang', headTilt: nod(0) }, P(RX - 1.1, 0, -0.3));
      per('judge2', 112, { expr: f > 1124 ? 'smile' : 'neutral', L: f > 1108 && f < 1124 ? 'up' : 'hang', headTilt: nod(1) }, P(RX + 0.05, 0, -0.1));
      per('judge', 113, { expr: 'neutral', facing: -1, L: f > 1102 && f < 1124 ? 'up' : 'hang', headTilt: nod(2) }, P(RX + 1.15, 0, -0.3));
      break;
    }
    case 'toll': {
      per('ukOff', 121, { expr: 'nervous', facing: 0.4, look: 0.2, headTilt: 6, blink: 0.5 }, P(0.55, 0, 0.45));
      per('usOff', 122, { expr: 'nervous', facing: -0.4, look: -0.2, headTilt: -6, blink: 0.5 }, P(2.45, 0, 0.45));
      if (f > 1200) per('farmer', 21, { expr: 'nervous', facing: 0, look: 0 }, P(-0.9, 0, -0.3));
      break;
    }
    case 'end': {
      const rise = smooth(ramp(f, 1240, 1258));
      out.push(PIG(T, { expr: f > 1252 ? 'wink' : 'happy', ghost: true, halo: true }, P(1.5, lerp(-0.3, 0.95, rise), 1.15), { s: 0.62, blob: false, shadow: false, alpha: 0.95, order: 1 }));
      break;
    }
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  switch (S.id) {
    case 'pig': case 'farm': {
      if (S.id === 'pig' && f < 128) out.push(FX('potato', (p) => T.fxPotato(p), P(3.05, 0.42, -2.25), 0.18, { order: 6 }));
      // dirt flicking up behind the digging pig
      for (let i = 0; i < 4; i++) { const k = ((f * 0.06) + i * 0.25) % 1, x = 2.1 - k * 0.6, y = 0.15 + Math.sin(k * Math.PI) * 0.7; out.push(FX('dirt' + i, (p) => p.ell(300, 500, 120, 90, '#6b4a2c', 18), P(x, y, -2.3 + i * 0.05), 0.08)); }
      if (S.id === 'farm' && f >= 292) { const t = q(((f - 292) / 26) % 1, 2); out.push(FX('steam' + t, (p) => T.fxSteam(p, t), P(-0.4, 2.05, 1.0), 0.7)); }
      if (S.id === 'farm' && f >= 262 && f < 290) { const t = q(ramp(f, 262, 290), 2); out.push(FX('ex' + t, (p) => T.fxWord(p, '!', t, '#ffffff', 300, 0), P(-0.4, 2.35, 1.0), 0.6)); }
      break;
    }
    case 'bang': {
      const t = q(ramp(f, 340, 356), 2);
      out.push(FX('bang' + t, (p) => T.fxWord(p, 'BANG!', Math.min(0.6, t)), P(9.8, 6.5, -6), 3.4));
      for (let i = 0; i < 7; i++) { const k = t * 1.2, a = -0.3 + i * 0.4; out.push(FX('bird' + i + q((f * 0.5 + i) % 1, 1), (p) => T.fxBird(p, (f * 0.5 + i) % 1), P(11 + Math.cos(a) * k * 6, 7 + k * 4 + Math.sin(i) * 0.6, -8 + Math.sin(a) * 2), 1.3)); }
      break;
    }
    case 'argue': {
      const t = q(((f - 421) / 20) % 1, 2);
      out.push(FX('st1' + t, (p) => T.fxSteam(p, t), P(0.6, 2.05, 0.9), 0.6)); out.push(FX('st2' + t, (p) => T.fxSteam(p, (t + 0.4) % 1), P(1.42, 2.15, 0.9), 0.6));
      if (f >= 430 && f < 460) { const k = q(ramp(f, 430, 460), 2); out.push(FX('bb' + k, (p) => T.fxBurst(p, k, '#ffd84a'), P(1.0, 1.95, 1.0), 1.0)); }
      break;
    }
    case 'nobody': {
      const t = smooth(ramp(f, 786, 806)), y = lerp(3.4, 1.02, t), x = lerp(26.5, 28.2, t);
      out.push(FX('birdN' + q(f % 4 < 2 && t < 1 ? 0.25 : 0, 2), (p) => T.fxBird(p, t < 1 ? (f % 4) / 4 : 0.25), P(x, y, 3.65), 0.35));
      break;
    }
    case 'campUK': { const t = q(((f - 821) / 60) % 1, 3); out.push(FX('leaves' + t, (p) => T.fxLeafFall(p, t, 2), P(-41.8, 1.8, 15.6), 2.2)); break; }
    case 'campUS': { const t = q(((f - 871) / 70) % 1, 3); out.push(FX('snow' + t, (p) => T.fxSnow(p, t, 3), P(41.8, 1.8, 15.6), 2.4)); out.push(FX('snow2' + t, (p) => T.fxSnow(p, (t + 0.5) % 1, 7), P(44, 2.2, 12), 3.2)); break; }
    case 'panel': {
      if (f >= 1122 && f < 1140) { const k = q(ramp(f, 1122, 1140), 2); out.push(FX('stb' + k, (p) => T.fxStars(p, k), P(RX + 1.3, 2.4, -3.3), 0.9)); }
      break;
    }
  }
  return out;
};
