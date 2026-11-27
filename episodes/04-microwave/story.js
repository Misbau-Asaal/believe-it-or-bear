// "The Chocolate Bar That Invented the Microwave" — shot plan timed to the Kokoro am_michael voice (43.97 s, 30 fps, 1319 frames; end card added after)
// Phrase frames: 5-148 "Legend says the microwave oven was invented by a melted chocolate bar." | 168-207 "In 1945," |
// 219-279 "Percy Spencer built radar parts." | 299-372 "One day he stood next to a running radar tube." | 384-435 "Something in his pocket felt warm." |
// 458-507 "His chocolate bar had melted." | 527-568 "Most people would complain." | 581-616 "Percy got curious." | 637-683 "He held popcorn up to the tube." |
// 698-740 "It popped all over the lab." | 760-790 "Then he tried an egg." | 803-849 "A coworker leaned in close." | 870-919 "The egg exploded in his face." |
// 940-1027 "The tube's invisible waves shake the water in food." | 1043-1075 "Shaking makes heat." | 1096-1194 "The first microwave oven weighed seven hundred fifty pounds." |
// 1222-1265 "Percy's bonus for the patent?" | 1278-1300 "Two dollars."
import { M, camFromKeys, idle, blinkAt, lerp, lerp3, ramp, clamp, q } from './motion.js';
export const FPS = 30, TOTAL = 1319;
export const SHOTS = [
  { id: 'hook', a: 0, b: 160, light: 'lab' },
  { id: 'year', a: 161, b: 216, light: 'ext' },
  { id: 'built', a: 217, b: 296, light: 'lab' },
  { id: 'tube', a: 297, b: 382, light: 'lab' },
  { id: 'warm', a: 383, b: 455, light: 'lab' },
  { id: 'melted', a: 456, b: 524, light: 'lab' },
  { id: 'complain', a: 525, b: 578, light: 'lab' },
  { id: 'curious', a: 579, b: 634, light: 'lab' },
  { id: 'popcorn', a: 635, b: 694, light: 'lab' },
  { id: 'popped', a: 695, b: 757, light: 'lab' },
  { id: 'egg', a: 758, b: 800, light: 'lab' },
  { id: 'lean', a: 801, b: 866, light: 'tense' },
  { id: 'explode', a: 867, b: 937, light: 'lab' },
  { id: 'waves', a: 938, b: 1040, light: 'micro' },
  { id: 'heat', a: 1041, b: 1093, light: 'heat' },
  { id: 'oven', a: 1094, b: 1219, light: 'lab' },
  { id: 'bonus', a: 1220, b: 1275, light: 'office' },
  { id: 'dollars', a: 1276, b: 1318, light: 'sting' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const { smooth, back, easeOut, easeIn } = M;

// ---------- lights ----------
const base = { fogNear: 120, fogFar: 1300, sat: 1.1, glint: '#effaff', waterDeep: '#2c6c8c', waterShal: '#5aaec4', vig: 0.22, shadowExt: 12 };
export const LIGHTS = {
  lab: { ...base, az: 115, el: 58, sky: '#eef2f4', ground: '#9a8a74', hemi: 1.3, sun: '#fff3e0', sunI: 2.1, fog: '#dcd8cc', fogNear: 60, fogFar: 500, skyTop: '#5f9ad8', skyHor: '#d8e6f0', gain: '#fff8ee' },
  tense: { ...base, az: 115, el: 58, sky: '#e8dccc', ground: '#7a6450', hemi: 1.0, sun: '#ffd8a8', sunI: 1.8, fog: '#d8c8b0', fogNear: 60, fogFar: 500, skyTop: '#5a7ab0', skyHor: '#e0c8a8', gain: '#fff0dc', vig: 0.36 },
  ext: { ...base, az: 140, el: 42, sky: '#cfe0f4', ground: '#7a8a5a', hemi: 1.15, sun: '#fff0d6', sunI: 2.6, fog: '#dfe6ec', skyTop: '#2f7ad8', skyHor: '#cfe2f4', gain: '#fff6ea', shadowExt: 30 },
  micro: { ...base, az: 120, el: 50, sky: '#4a6ab0', ground: '#14204a', hemi: 1.4, sun: '#cfe0ff', sunI: 1.1, fog: '#14204a', fogNear: 30, fogFar: 160, skyTop: '#0c1430', skyHor: '#1c2c5c', sat: 1.15, gain: '#e6eeff', vig: 0.34 },
  heat: { ...base, az: 120, el: 50, sky: '#c87a5a', ground: '#3a1a10', hemi: 1.4, sun: '#ffd0a0', sunI: 1.2, fog: '#4a2014', fogNear: 30, fogFar: 160, skyTop: '#2a0c08', skyHor: '#6a2a1c', sat: 1.15, gain: '#fff0e0', vig: 0.34 },
  office: { ...base, az: 125, el: 55, sky: '#f2ece0', ground: '#8a6a4a', hemi: 1.3, sun: '#fff0d8', sunI: 2.0, fog: '#e0d8c8', fogNear: 60, fogFar: 500, skyTop: '#6a9ad0', skyHor: '#e0e8ee', gain: '#fff6e8' },
  sting: { ...base, az: 125, el: 55, sky: '#e8e4dc', ground: '#7a6a5a', hemi: 1.2, sun: '#fff0d8', sunI: 1.9, fog: '#e0d8c8', fogNear: 60, fogFar: 500, skyTop: '#6a9ad0', skyHor: '#e0e8ee', gain: '#f4f0ea', sat: 0.92, vig: 0.42 },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 'popped' || S.id === 'oven') L.shadowExt = 16;
  if (S.id === 'heat') { const k = smooth(ramp(f, 1046, 1080)), A = LIGHTS.micro, B = LIGHTS.heat;
    for (const key of ['sky', 'ground', 'sun', 'fog', 'skyTop', 'skyHor', 'gain']) L[key] = mixHex(A[key], B[key], k); }
  return L;
};
const mixHex = (a, b, t) => { const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], t)).toString(16).padStart(2, '0')).join(''); };

// ---------- places ----------
const P = (x, y, z) => [x, y, z];
const PR = P(-0.75, 0, -3.25);          // Percy next to the running tube
const HORN = P(-0.28, 1.45, -3.9);       // where the waves come out
const KET = P(0.05, 1.18, -3.9);         // kettle on the test table
const ASSY = P(-5.6, 0, -3.55);          // Percy behind the assembly table
const SCALE = { x: 6.2, z: -3.3 }, DIAL = P(7.15, 1.92, -3.61);
const OFF = 30;
const MX = 200;                          // inside the food

// ---------- cameras ----------
const CAMS = {
  hook: [{ f: 0, pos: P(-0.36, 1.45, -0.95), look: P(-0.56, 1.56, -3.25), fov: 44 }, { f: 160, pos: P(-0.4, 1.48, -1.4), look: P(-0.56, 1.58, -3.25), fov: 40 }],
  year: [{ f: 161, pos: P(-2.0, 1.5, -50), look: P(0.8, 5.4, -78), fov: 48 }, { f: 216, pos: P(-1.5, 1.55, -52.5), look: P(0.9, 5.6, -78), fov: 46 }],
  built: [{ f: 217, pos: P(-5.0, 1.6, 0.4), look: P(-5.55, 1.3, -3.4), fov: 40 }, { f: 296, pos: P(-5.4, 1.6, -0.3), look: P(-5.6, 1.35, -3.4), fov: 38 }],
  tube: [{ f: 297, pos: P(0.9, 1.6, 0.9), look: P(-0.85, 1.35, -3.4), fov: 42 }, { f: 336, pos: P(0.6, 1.6, 0.7), look: P(-0.9, 1.35, -3.5), fov: 42 }, { f: 382, pos: P(-0.2, 1.55, 0.5), look: P(-0.85, 1.4, -3.6), fov: 44 }],
  warm: [{ f: 383, pos: P(-0.55, 1.45, -1.25), look: P(-0.72, 1.45, -3.25), fov: 38 }, { f: 408, pos: P(-0.56, 1.42, -1.45), look: P(-0.72, 1.42, -3.25), fov: 36 }, { f: 455, pos: P(-0.58, 1.3, -1.7), look: P(-0.66, 1.2, -3.25), fov: 34 }],
  melted: [{ f: 456, pos: P(-0.2, 1.3, -1.5), look: P(-0.48, 1.62, -3.25), fov: 40 }, { f: 524, pos: P(-0.22, 1.32, -1.8), look: P(-0.48, 1.64, -3.25), fov: 37 }],
  complain: [{ f: 525, pos: P(2.85, 1.5, -0.3), look: P(2.85, 1.38, -4.5), fov: 42 }, { f: 578, pos: P(2.85, 1.5, -0.7), look: P(2.85, 1.42, -4.5), fov: 40 }],
  curious: [{ f: 579, pos: P(-0.6, 1.62, -1.2), look: P(-0.72, 1.76, -3.25), fov: 40 }, { f: 634, pos: P(-0.64, 1.64, -1.6), look: P(-0.76, 1.8, -3.25), fov: 37, roll: -3 }],
  popcorn: [{ f: 635, pos: P(0.2, 1.55, -0.1), look: P(0.1, 1.38, -3.7), fov: 42 }, { f: 694, pos: P(0.15, 1.52, -0.6), look: P(0.05, 1.38, -3.7), fov: 40 }],
  popped: [{ f: 695, pos: P(0.15, 1.52, -0.6), look: P(0.05, 1.38, -3.7), fov: 40 }, { f: 712, pos: P(0.2, 1.7, 0.6), look: P(0.0, 1.3, -3.6), fov: 44, ease: 'easeOut' }, { f: 757, pos: P(0.5, 2.7, 4.2), look: P(-0.6, 1.05, -3.4), fov: 48 }],
  egg: [{ f: 758, pos: P(0.62, 1.5, -1.3), look: P(0.45, 1.5, -3.4), fov: 40 }, { f: 776, pos: P(0.6, 1.5, -1.4), look: P(0.42, 1.52, -3.4), fov: 40 }, { f: 800, pos: P(0.35, 1.75, -2.2), look: P(0.08, 1.32, -3.9), fov: 40 }],
  lean: [{ f: 801, pos: P(0.75, 1.5, -0.6), look: P(0.45, 1.38, -3.6), fov: 42 }, { f: 866, pos: P(0.45, 1.5, -1.55), look: P(0.25, 1.45, -3.6), fov: 38 }],
  explode: [{ f: 867, pos: P(0.5, 1.52, -1.6), look: P(0.32, 1.48, -3.5), fov: 38 }, { f: 886, pos: P(0.5, 1.52, -1.7), look: P(0.32, 1.48, -3.5), fov: 38 }, { f: 895, pos: P(0.55, 1.55, -1.25), look: P(0.35, 1.48, -3.5), fov: 42, ease: 'easeOut' }, { f: 937, pos: P(0.5, 1.55, -1.6), look: P(0.36, 1.5, -3.5), fov: 38 }],
  waves: [{ f: 938, pos: P(MX, 1.4, 6.0), look: P(MX, 1.3, -2), fov: 46 }, { f: 1040, pos: P(MX + 0.2, 1.35, 4.6), look: P(MX, 1.3, -2), fov: 44 }],
  heat: [{ f: 1041, pos: P(MX + 0.2, 1.35, 4.4), look: P(MX, 1.3, -2), fov: 44 }, { f: 1093, pos: P(MX + 0.05, 1.3, 2.6), look: P(MX - 0.1, 1.25, -1.2), fov: 40 }],
  oven: [
    { f: 1094, pos: P(3.4, 1.35, 2.5), look: P(3.55, 1.2, -3.2), fov: 46 },
    { f: 1140, pos: P(5.0, 1.4, 2.3), look: P(5.45, 1.25, -3.2), fov: 46 },
    { f: 1154, pos: P(5.2, 1.45, 2.1), look: P(5.9, 1.3, -3.2), fov: 46 },
    { f: 1180, pos: P(6.98, 1.93, -2.2), look: P(7.15, 1.92, -3.6), fov: 36, path: [P(6.4, 1.75, 0.2)] },
    { f: 1219, pos: P(6.98, 1.93, -2.35), look: P(7.15, 1.92, -3.6), fov: 35 },
  ],
  bonus: [{ f: 1220, pos: P(OFF + 0.6, 1.55, 2.7), look: P(OFF + 0.55, 1.4, -1.8), fov: 41 }, { f: 1275, pos: P(OFF + 0.62, 1.55, 2.1), look: P(OFF + 0.58, 1.42, -1.8), fov: 40 }],
  dollars: [{ f: 1276, pos: P(OFF + 1.14, 1.62, 0.7), look: P(OFF + 1.27, 1.66, -1.2), fov: 40 }, { f: 1288, pos: P(OFF + 1.15, 1.63, 0.5), look: P(OFF + 1.29, 1.7, -1.2), fov: 38, roll: 2 }, { f: 1318, pos: P(OFF + 1.16, 1.64, 0.25), look: P(OFF + 1.29, 1.7, -1.2), fov: 36, roll: 4 }],
};
const KICKS = [{ f: 705, a: 0.025 }, { f: 886, a: 0.06 }, { f: 1146, a: 0.05 }, { f: 1288, a: 0.012 }];
export const camAt = (f) => {
  const S = shotAt(f), c = camFromKeys(CAMS[S.id], f, { creep: 0.0008, kicks: KICKS });
  c.flash = 0;
  if (f >= 938 && f < 946) c.flash = 0.8 * (1 - (f - 938) / 8);          // into the food
  if (f >= 1094 && f < 1100) c.flash = 0.7 * (1 - (f - 1094) / 6);        // time jump to 1947
  if (f >= 886 && f < 892) c.flash = 0.55 * (1 - (f - 886) / 6);          // the egg goes off
  if (f >= 161 && f < 165) c.flash = 0.35 * (1 - (f - 161) / 4);
  if (S.id === 'year') c.shadowAt = P(0, 2, -66);
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOCUS = {
  hook: P(-0.7, 1.5, -3.25), year: P(1, 4, -78), built: P(-5.6, 1.4, -3.5), tube: P(-0.8, 1.4, -3.3), warm: P(-0.72, 1.4, -3.25), melted: P(-0.6, 1.5, -3.25),
  complain: P(2.8, 1.4, -4.5), curious: P(-0.75, 1.5, -3.25), popcorn: P(0.3, 1.4, -3.4), popped: P(0, 1.3, -3.5), egg: P(0.45, 1.5, -3.4), lean: P(0.4, 1.45, -3.5),
  explode: P(0.35, 1.48, -3.5), waves: P(MX, 1.3, 0), heat: P(MX, 1.3, 0), oven: P(5.6, 1.3, -3.3), bonus: P(OFF + 0.55, 1.4, -1.8), dollars: P(OFF + 1.1, 1.6, -1.2),
};
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  if (S.id === 'egg' && f > 778) return { focus: dist(C.pos, KET), cinf: 9, near: 1 };
  if (S.id === 'oven' && f > 1160) return { focus: dist(C.pos, DIAL), cinf: 7, near: 1 };
  if (S.id === 'popped' && f > 712) return { focus: dist(C.pos, P(0, 1.2, -3.2)), cinf: 2, near: 1 };
  const cinf = { year: 2, popped: 6, oven: 4, waves: 6, heat: 7, complain: 8, built: 8, tube: 6, bonus: 6 }[S.id] ?? 11;
  return { focus: dist(C.pos, FOCUS[S.id]), cinf, near: 1 };
};

// ---------- world state ----------
const POP = 705;                                       // the bag bursts
const BOOM = 886;                                      // the egg goes off
const LAND = 1146;                                     // the oven lands on the scale
const ovenAt = (f) => {
  if (f < 1094) return { x: 3.9, y: 0, rz: 0 };
  const push = smooth(ramp(f, 1098, 1134)), x = lerp(3.9, 5.55, push);
  if (f < 1134) return { x, y: 0, rz: Math.sin(f * 0.8) * 0.006 };
  const h = ramp(f, 1134, LAND), y = 0.16 + 0.22 * Math.sin(Math.PI * h) - (f > LAND ? 0 : 0) , x2 = lerp(5.55, SCALE.x, smooth(h));
  if (f < LAND) return { x: x2, y: lerp(0, 0.16, h) + 0.25 * Math.sin(Math.PI * h), rz: -0.04 * Math.sin(Math.PI * h) };
  const b = Math.max(0, f - LAND) / 30; return { x: SCALE.x, y: 0.16 - 0.03 * Math.exp(-b * 9) * Math.cos(b * 40), rz: 0.01 * Math.exp(-b * 6) * Math.sin(b * 30) };
};
const lbAt = (f) => { if (f < LAND) return 0; const t = (f - LAND) / 30; return 750 + (0 - 750) * Math.exp(-t * 2.6) * Math.cos(t * 7.5) + 0; };
export const worldAt = (f) => {
  const S = shotAt(f), W = { helmet: null };
  W.run = ['hook', 'warm', 'melted', 'curious', 'popcorn', 'popped', 'egg', 'lean', 'explode'].includes(S.id) ? 1 : S.id === 'tube' ? smooth(ramp(f, 338, 348)) : 0;
  W.popcorn = f >= POP && f < 938 ? (S.id === 'popped' ? smooth(ramp(f, POP, 748)) : 1) : 0;
  if (S.id === 'egg' && f >= 780) { const t = clamp((f - 780) / 12), x = lerp(0.27, KET[0], t), z = lerp(-3.3, KET[2], t), y = lerp(1.63, 1.42, t) + 0.25 * Math.sin(Math.PI * t) * (1 - t);
    W.egg = t < 1 ? [x, y, z] : null; }
  if (S.id === 'egg' && f >= 792) W.wobble = Math.sin(f * 1.3) * 0.02;
  if (S.id === 'lean') W.wobble = Math.sin(f * 1.6) * 0.015 * (0.4 + 1.6 * ramp(f, 820, 866));
  if (S.id === 'explode') W.wobble = f < BOOM ? Math.sin(f * 2.2) * 0.07 * ramp(f, 867, BOOM) : Math.sin(f * 1.4) * 0.12 * Math.exp(-(f - BOOM) / 8);
  W.oven = S.id === 'oven' ? ovenAt(f) : { x: 2.6, y: 0, rz: 0, show: false };
  W.dolly = S.id === 'oven' && f < 1134;
  W.lb = S.id === 'oven' ? lbAt(f) : 0;
  W.signY = S.id === 'year' && f >= 164 ? -3 + 3 * back(ramp(f, 164, 182), 2.2) : -3;
  W.heat = S.id === 'heat' ? smooth(ramp(f, 1046, 1085)) : 0;
  W.micro = S.id === 'waves' || S.id === 'heat';
  return W;
};

// ---------- actors ----------
const life = (f, seed) => { const i = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(i.bob, 3), tilt: q(i.tilt, 1), headTilt: q(i.headTilt, 1) }; };
const PER = (T, who, o, pos, extra = {}) => ({ key: 'mw' + who + JSON.stringify(o), draw: (p) => T.mwPerson(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const DROPC = (T, o, pos, extra = {}) => ({ key: 'drop' + JSON.stringify(o), draw: (p) => T.fxDroplet(p, o), x: pos[0], y: pos[1], z: pos[2], s: 0.5, blob: false, shadow: false, ...extra });
const rnd = (i, k = 0) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const DROPS = [[-0.95, 1.55, -0.6, 1], [0.15, 0.65, 0.2, 2], [1.05, 1.45, -1.0, 3], [-0.25, 1.95, -2.4, 4], [0.7, 0.35, -2.8, 5], [-1.5, 0.7, -3.5, 6], [1.9, 2.1, -4.5, 7], [-2.3, 2.3, -5.5, 8]];

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const per = (who, seed, o, pos, extra) => out.push(PER(T, who, { ...life(f, seed), ...o }, pos, extra));
  switch (S.id) {
    case 'hook': {
      const droop = q(smooth(ramp(f, 106, 136)), 2);
      const expr = f < 30 ? 'smile' : f < 108 ? 'squint' : f < 140 ? 'shock' : 'pained';
      per('percy', 3, { expr, facing: 0.15, look: f < 30 ? 0 : 0.5, R: 'up', L: 'hip', hold: { side: 1, item: droop > 0 ? 'melt' : 'bar', droop }, pocket: 'none' }, PR);
      break;
    }
    case 'built': {
      const up = f >= 248;
      per('percy', 3, { expr: up ? 'grin' : 'whistle', facing: 0, look: up ? 0.3 : 0, R: up ? 'up' : 'hold', L: up ? 'hip' : 'hold', hold: { side: 1, item: 'magnetron' }, pocket: 'bar' }, ASSY);
      per('tech2', 21, { expr: 'neutral', facing: 0.3, look: 0.6, R: 'hold', L: 'hang' }, P(-6.55, 0, -4.75));
      break;
    }
    case 'tube': {
      per('percy', 3, { expr: f < 345 ? 'whistle' : 'smile', facing: -0.2, look: f > 350 ? -0.6 : 0, L: 'hip', R: 'hip', pocket: 'bar' }, PR);
      break;
    }
    case 'warm': {
      const expr = f < 410 ? 'whistle' : f < 428 ? 'neutral' : 'nervous';
      per('percy', 3, { expr, facing: 0, look: f > 410 ? 0.3 : 0, L: 'hip', R: f >= 428 ? 'pocket' : 'hip', pocket: f >= 418 ? 'melt' : 'bar', bob: f > 428 ? q(0.01 * Math.sin(f * 1.5), 3) : 0 }, PR);
      break;
    }
    case 'melted': {
      const droop = q(lerp(0.55, 1, smooth(ramp(f, 458, 500))), 2);
      per('percy', 3, { expr: f < 494 ? 'shock' : 'pained', facing: 0.1, look: 0.6, L: 'hang', R: 'up', hold: { side: 1, item: 'melt', droop }, pocket: 'melt' }, PR);
      break;
    }
    case 'complain': {
      const shake = q(Math.sin(f * 0.9) * 3, 0);
      per('grump', 31, { expr: f < 540 ? 'stern' : 'stubborn', facing: 0.3, look: 0.4, L: 'hip', R: 'up', hold: { side: 1, item: 'melt', droop: 1 }, tilt: shake }, P(2.4, 0, -4.4));
      per('tech2', 21, { expr: f < 548 ? 'pained' : 'stubborn', facing: -0.3, look: -0.4, L: 'cross', R: 'cross' }, P(3.3, 0, -4.65));
      break;
    }
    case 'curious': {
      const expr = f < 598 ? 'squint' : 'grin';
      per('percy', 3, { expr, facing: f < 598 ? 0.15 : -0.35, look: f < 598 ? 0.6 : -0.8, L: 'hip', R: 'up', hold: { side: 1, item: 'melt', droop: 1 }, pocket: 'melt', headTilt: f < 598 ? 6 : -4 }, PR);
      break;
    }
    case 'popcorn': {
      const t = q(clamp((f - 650) / 50) * 0.9, 2);
      per('percy', 3, { expr: f < 668 ? 'grin' : 'squint', facing: -0.4, look: -0.8, L: 'point', R: 'hip', hold: { side: -1, item: 'bag', t }, pocket: 'melt' }, P(0.45, 0, -3.3));
      break;
    }
    case 'popped': {
      const sh = f < 735;
      per('percy', 3, { expr: sh ? 'shock' : 'laugh', facing: -0.2, look: -0.4, L: 'up', R: 'up', pocket: 'melt', tilt: f < 712 ? q(-6 * Math.exp(-(f - 705) / 6), 1) : 0 }, P(0.45, 0, -3.3));
      if (f > 712) { per('tech', 11, { expr: f < 735 ? 'shock' : 'dazed', facing: 0.3, look: 0.6, L: 'up', R: 'up' }, P(-1.5, 0, -2.5));
        per('tech2', 21, { expr: f < 738 ? 'shock' : 'laugh', facing: -0.3, look: -0.6, L: 'cheek', R: 'cheek' }, P(1.8, 0, -2.1)); }
      break;
    }
    case 'egg': {
      const has = f < 780;
      per('percy', 3, { expr: f < 770 ? 'grin' : 'squint', facing: -0.3, look: -0.6, L: 'up', R: 'hip', hold: has ? { side: -1, item: 'egg' } : undefined, pocket: 'melt' }, P(0.6, 0, -3.3));
      break;
    }
    case 'lean': {
      const walkIn = smooth(ramp(f, 801, 826)), x = lerp(1.6, 0.48, walkIn), lean = q(-14 * smooth(ramp(f, 828, 846)), 0);
      per('tech', 11, { expr: f < 829 ? 'neutral' : 'squint', facing: -0.5, look: -0.8, L: 'hang', R: f > 829 ? 'hip' : 'hang', tilt: lean, headTilt: lean * 0.4, step: f < 826 ? q((f * 0.06) % 1, 2) : 0 }, P(x, 0, -3.45));
      per('percy', 3, { expr: 'nervous', facing: -0.4, look: -0.8, L: 'up', R: 'up', pocket: 'melt' }, P(1.5, 0, -3.05));
      break;
    }
    case 'explode': {
      const after = f >= BOOM, k = after ? Math.exp(-(f - BOOM) / 5) : 0;
      const tilt = after ? q(lerp(8, 0, 1 - k) + 10 * k, 0) : -14;
      per('tech', 11, { expr: !after ? 'squint' : f < 903 ? 'shock' : 'dazed', facing: -0.3, look: after ? 0 : -0.8, L: after && f < 905 ? 'up' : 'hang', R: after && f < 905 ? 'up' : 'hip', tilt, headTilt: after ? 0 : -6, egg: after ? 1 : 0, blink: after && f > 912 && f < 917 ? 1 : 0 }, P(0.48, 0, -3.45));
      per('percy', 3, { expr: !after ? 'nervous' : f < 898 ? 'shock' : 'laugh', facing: -0.3, look: -0.6, L: after ? 'belly' : 'up', R: after ? 'belly' : 'up', pocket: 'melt' }, P(1.5, 0, -3.05));
      break;
    }
    case 'waves':
    case 'heat': {
      const shakeOn = f >= 988, hot = S.id === 'heat' ? q(smooth(ramp(f, 1050, 1082)), 2) : 0;
      DROPS.forEach(([x, y, z, i]) => {
        const amp = shakeOn ? (S.id === 'heat' ? 0.07 : 0.05 * ramp(f, 988, 1000)) : 0, jx = amp * (f % 2 ? 1 : -1) * (0.6 + 0.4 * rnd(i, 2)), fl = 0.06 * Math.sin(f * 0.07 + i);
        const expr = hot > 0.4 ? 'hot' : !shakeOn ? (rnd(i, 3) < 0.5 ? 'happy' : 'neutral') : f < 1006 ? 'shock' : 'dazed';
        out.push(DROPC(T, { expr, hot, blink: shakeOn ? 0 : blinkAt(f, i), sq: q(shakeOn ? 0.04 * (f % 2 ? 1 : -1) : 0.03 * Math.sin(f * 0.1 + i), 2), look: q(Math.sin(i * 2.3) * 0.6, 1), t: q(((f * 0.04) + i * 0.13) % 1, 1) }, P(MX + x + jx, y + fl, z)));
      });
      break;
    }
    case 'oven': {
      const O = ovenAt(f), pushing = f < 1146;
      for (const [who, seed, dz, dx] of [['mover', 41, 0.35, -0.8], ['mover2', 42, -0.3, -0.78]]) {
        const expr = pushing ? 'pained' : f < 1165 ? 'dazed' : 'relief';
        per(who, seed, { expr, facing: 0.5, look: 0.8, L: pushing ? 'cross' : 'temple', R: pushing ? 'point' : 'hang', tilt: pushing ? 12 : 0, step: pushing && f < 1134 ? q((f * 0.05 + seed * 0.3) % 1, 2) : 0 },
          P(pushing ? O.x + dx : SCALE.x - 1.3 + (seed - 41) * 0.15, 0, SCALE.z + dz));
      }
      break;
    }
    case 'bonus': {
      const handed = f >= 1252;
      per('boss', 51, { expr: 'smile', facing: 0.4, look: 0.7, R: handed ? 'hip' : 'point', L: 'hip', hold: handed ? undefined : { side: 1, item: 'envelope' } }, P(OFF + 0.0, 0, -2.45));
      per('percy', 3, { expr: f < 1233 ? 'smile' : 'grin', facing: -0.4, look: -0.8, L: handed ? 'hold' : f > 1238 ? 'point' : 'hang', R: 'hip', hold: handed ? { side: -1, item: 'envelope' } : undefined, pocket: 'none' }, P(OFF + 1.1, 0, -1.2));
      break;
    }
    case 'dollars': {
      const out2 = f >= 1286;
      per('percy', 3, { expr: f < 1284 ? 'grin' : f < 1292 ? 'neutral' : 'dazed', facing: 0.05, look: 0, blink: f > 1300 && f < 1305 ? 1 : 0, L: out2 ? 'hang' : 'hold', R: out2 ? 'up' : 'hip',
        hold: out2 ? { side: 1, item: 'bills', t: q(lerp(1, 0.4, smooth(ramp(f, 1296, 1312))), 1) } : { side: -1, item: 'envelope', open: q(ramp(f, 1276, 1284), 1) }, pocket: 'none' }, P(OFF + 1.1, 0, -1.2));
      break;
    }
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
const wavesAt = (out, T, f, pos, s = 0.7, flip = false) => { const t = q(((f * 0.045) % 1), 2); out.push(FX('wv' + t, (p) => T.fxWaves(p, t), pos, s, { flip })); };
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  const glow = (pos, s = 0.5) => { const k = q(0.75 + 0.25 * Math.sin(f * 0.9), 2); out.push(FX('gl' + k, (p) => T.fxGlow(p, k), pos, s, { order: 4 })); };
  switch (S.id) {
    case 'hook': {
      glow(P(HORN[0] + 0.1, HORN[1] - 0.56, HORN[2] + 0.42), 0.5);
      if (f >= 33 && f < 104) { const t = q((f - 33) / 30, 2), k = back(ramp(f, 33, 45), 2.0); out.push(FX('ovt' + q(k, 2) + t, (p) => T.fxOvenThought(p, t), P(PR[0] - 0.12, 2.1 - 0.455 * k, PR[2] + 0.1), q(0.38 * k, 2) || 0.01)); }
      if (f >= 120) for (const [at, dx] of [[120, 0.36], [134, 0.42], [146, 0.33]]) if (f >= at && f < at + 16) { const t = q((f - at) / 16, 2); out.push(FX('dr' + at + t, (p) => T.fxChocDrip(p, t), P(PR[0] + dx, 1.2, PR[2] + 0.05), 0.12)); }
      break;
    }
    case 'built': {
      if (f % 9 < 6) { const t = q((f % 9) / 6, 1); out.push(FX('sp' + t + (f % 27), (p) => T.fxSparks(p, f % 27), P(-6.37, 0.88, -4.68), 0.22)); }
      if (f >= 252 && f < 268) { const t = q(ramp(f, 252, 268), 2); out.push(FX('st' + t, (p) => T.fxStars(p, t), P(ASSY[0] + 0.36, 1.15, ASSY[2] + 0.1), 0.4)); }
      break;
    }
    case 'tube': {
      if (f >= 343) { glow(P(HORN[0] + 0.1, HORN[1] - 0.56, HORN[2] + 0.42), 0.5); wavesAt(out, T, f, P(-1.12, 0.65, -3.15), 0.8); }   // leaking from the tube, washing over Percy
      if (f >= 340 && f < 356) { const t = q(ramp(f, 340, 356), 2); out.push(FX('hum' + t, (p) => T.fxWord(p, 'HMMMM', Math.min(0.6, t * 0.6 + 0.1), '#ffd86a', 120, -0.05), P(-1.6, 1.45, -3.8), 0.7)); }
      break;
    }
    case 'warm': {
      wavesAt(out, T, f, P(-1.12, 0.65, -3.15), 0.8);
      if (f >= 418) { const t = q(((f - 418) / 20) % 1, 2); out.push(FX('stp' + t, (p) => T.fxSteam(p, t), P(PR[0] + 0.13, 1.25, PR[2] + 0.08), 0.22)); }
      if (f >= 430) { const t = q(((f - 430) / 18) % 1, 2); out.push(FX('sw' + t, (p) => T.fxSweat(p, t), P(PR[0], 1.3, PR[2] + 0.05), 0.35)); }
      break;
    }
    case 'melted': {
      for (const [at, dx] of [[470, 0.39], [488, 0.45], [503, 0.36], [514, 0.42]]) if (f >= at && f < at + 18) { const t = q((f - at) / 18, 2); out.push(FX('dr' + at + t, (p) => T.fxChocDrip(p, t), P(PR[0] + dx, 1.25, PR[2] + 0.05), 0.12)); }
      break;
    }
    case 'complain': {
      if (f >= 548) { const t = q(ramp(f, 548, 578), 2); out.push(FX('hm' + t, (p) => T.fxWord(p, 'HMPH!', Math.min(0.6, t), '#ff8a6a', 130, 0.1), P(2.4, 1.35, -4.3), 0.6)); }
      if (f >= 540) { const t = q(((f - 540) / 18) % 1, 2); out.push(FX('st2' + t, (p) => T.fxSteam(p, t), P(3.3, 2.0, -4.6), 0.45)); }
      break;
    }
    case 'curious': {
      if (f >= 599) { const t = q(ramp(f, 599, 634), 2); out.push(FX('bulb' + t, (p) => T.fxBulb(p, t), P(PR[0] - 0.05, 1.52, PR[2] + 0.05), 0.38)); }
      break;
    }
    case 'popcorn': {
      glow(P(HORN[0] + 0.1, HORN[1] - 0.56, HORN[2] + 0.42), 0.5); wavesAt(out, T, f, P(HORN[0] + 0.46, HORN[1] - 0.84, HORN[2] + 0.45), 0.75);
      break;
    }
    case 'popped': {
      if (f < 712) glow(P(HORN[0] + 0.1, HORN[1] - 0.56, HORN[2] + 0.42), 0.5);
      if (f >= POP && f < POP + 30) { const t = q((f - POP) / 30, 2); out.push(FX('pb' + t, (p) => T.fxPopburst(p, t, 1), P(0.12, 0.6, -3.25), 0.7)); out.push(FX('pb2' + t, (p) => T.fxPopburst(p, t * 0.9, 2), P(0.0, 0.7, -3.3), 0.6)); }
      for (const [at, x, y, w] of [[POP, 0.3, 1.35, 'POP!'], [716, -0.7, 1.6, 'POP!'], [726, 0.9, 1.4, 'POP!']]) if (f >= at && f < at + 18) { const t = q((f - at) / 18, 2); out.push(FX('pw' + at + t, (p) => T.fxWord(p, w, Math.min(0.6, t), '#ffffff', 150, -0.1 + (at % 3) * 0.08), P(x, y, -3.2), 0.6)); }
      if (f > 712) for (let i = 0; i < 14; i++) { const k = ((f - 712) * 0.03 + rnd(i, 1)) % 1, x = -2.6 + rnd(i, 2) * 5.2, z = -3.6 + rnd(i, 3) * 2.2, y = 3.6 - k * 3.6;
        out.push(FX('pp' + i + q(k * 6, 0), (p) => T.fxPopPiece(p, i + Math.floor(k * 6)), P(x, y, z), 0.09)); }
      break;
    }
    case 'egg': {
      glow(P(HORN[0] + 0.1, HORN[1] - 0.56, HORN[2] + 0.42), 0.5);
      if (f >= 785) wavesAt(out, T, f, P(HORN[0] + 0.43, HORN[1] - 0.79, HORN[2] + 0.45), 0.7);
      break;
    }
    case 'lean': {
      glow(P(HORN[0] + 0.1, HORN[1] - 0.56, HORN[2] + 0.42), 0.5); wavesAt(out, T, f, P(HORN[0] + 0.43, HORN[1] - 0.79, HORN[2] + 0.45), 0.7);
      break;
    }
    case 'explode': {
      if (f < BOOM) { glow(P(HORN[0] + 0.1, HORN[1] - 0.56, HORN[2] + 0.42), 0.5); wavesAt(out, T, f, P(HORN[0] + 0.43, HORN[1] - 0.79, HORN[2] + 0.45), 0.7); }
      if (f >= BOOM && f < BOOM + 24) { const t = q((f - BOOM) / 24, 2); out.push(FX('sp' + t, (p) => T.fxSplat(p, t), P(0.18, 0.5, -3.65), 0.9, { order: 6 })); }
      if (f >= BOOM + 2 && f < BOOM + 22) { const t = q((f - BOOM - 2) / 20, 2); out.push(FX('bw' + t, (p) => T.fxWord(p, 'BLAM!', Math.min(0.6, t), '#ffd84a', 150, -0.12), P(0.3, 1.2, -3.6), 0.75)); }
      break;
    }
    case 'waves':
    case 'heat': {
      if (f >= 978) for (let i = 0; i < 3; i++) { const t0 = 978 + i * 9, x = lerp(-3.5, 3.5, ((f - t0) / 40) % 1), ph = q(((f * 0.08) + i / 3) % 1, 2);
        if (f >= t0) out.push(FX('bm' + i + ph, (p) => T.fxBeam(p, ph, S.id === 'heat' ? '#ffb86a' : '#ffe58a', 70), P(MX + x * 0.3, 0.55 + i * 0.7, 0.6 - i * 1.2), 1.6, { alpha: 0.9 })); }
      if (S.id === 'heat' && f >= 1052) { const lv = q(lerp(0.12, 0.95, smooth(ramp(f, 1052, 1086))), 2); out.push(FX('th' + lv, (p) => T.fxThermo(p, lv), P(MX + 0.42, 0.75, 0.4), 0.36)); }
      if (S.id === 'heat' && f >= 1066) { const t = q(ramp(f, 1066, 1093), 2); out.push(FX('hot' + t, (p) => T.fxWord(p, 'HEAT!', Math.min(0.55, t), '#ff8a3a', 150, -0.1), P(MX + 0.05, 1.22, 0.6), 0.6)); }
      break;
    }
    case 'oven': {
      const O = ovenAt(f);
      if (f < 1146) for (const [dx, dz, i] of [[-1.0, 0.35, 0], [-0.98, -0.3, 1]]) { const t = q(((f * 0.05) + i / 2) % 1, 2); out.push(FX('ms' + i + t, (p) => T.fxSweat(p, t), P(O.x + dx, 1.32, SCALE.z + dz + 0.05), 0.3)); }
      if (f >= LAND && f < LAND + 20) { const t = q((f - LAND) / 20, 2); out.push(FX('dst' + t, (p) => T.fxDust(p, t, '#d8d0c0'), P(SCALE.x, -0.55, SCALE.z + 0.7), 0.9));
        out.push(FX('thd' + t, (p) => T.fxWord(p, 'THUD!', Math.min(0.6, t), '#ffffff', 150, 0.08), P(SCALE.x - 0.1, 1.25, SCALE.z + 0.5), 0.8)); }
      break;
    }
    case 'bonus': {
      if (f >= 1236 && f < 1252) { const t = q(ramp(f, 1236, 1252), 2); out.push(FX('stb' + t, (p) => T.fxStars(p, t), P(OFF + 1.1, 0.95, -1.15), 0.5)); }
      break;
    }
  }
  return out;
};
