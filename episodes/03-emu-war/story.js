// "The Emu War" — shot plan timed to the Kokoro am_michael voice (41.62 s, 30 fps, 1248 frames; end card added after)
// Phrase frames: 5-46 "In 1932," | 57-96 "Australia went to war." | 109-130 "With birds." |
// 151-291 "About twenty thousand emus were eating the wheat farms of Western Australia." | 312-363 "The farmers were war veterans." |
// 375-419 "So they asked the army for help." | 443-482 "The army sent soldiers." | 494-529 "And two machine guns." | 550-585 "The emus had a plan." |
// 607-650 "They split into small groups." | 662-696 "They posted lookouts." | 709-727 "They ran." | 748-814 "The soldiers fired thousands of bullets." |
// 827-864 "One machine gun jammed." | 889-919 "After weeks of fighting," | 932-1003 "they had killed fewer than a thousand birds." |
// 1024-1127 "Their commander said the emus could face machine guns like tanks." | 1149-1176 "The army went home." | 1200-1229 "The emus stayed."
import { M, camFromKeys, idle, blinkAt, lerp, lerp3, ramp, clamp, q } from './motion.js';
export const FPS = 30, TOTAL = 1248;
export const SHOTS = [
  { id: 'hook', a: 0, b: 107, light: 'day' },
  { id: 'birds', a: 108, b: 150, light: 'day' },
  { id: 'field', a: 151, b: 311, light: 'day' },
  { id: 'farmers', a: 312, b: 374, light: 'day' },
  { id: 'ask', a: 375, b: 442, light: 'day' },
  { id: 'army', a: 443, b: 493, light: 'day' },
  { id: 'guns', a: 494, b: 549, light: 'day' },
  { id: 'plan', a: 550, b: 606, light: 'day' },
  { id: 'split', a: 607, b: 661, light: 'day' },
  { id: 'lookout', a: 662, b: 708, light: 'day' },
  { id: 'ran', a: 709, b: 747, light: 'day' },
  { id: 'fire', a: 748, b: 790, light: 'day' },
  { id: 'dodge', a: 791, b: 826, light: 'day' },
  { id: 'jam', a: 827, b: 866, light: 'day' },
  { id: 'peek', a: 867, b: 888, light: 'day' },
  { id: 'weeks', a: 889, b: 931, light: 'dusk' },
  { id: 'tally', a: 932, b: 1023, light: 'day' },
  { id: 'quote', a: 1024, b: 1086, light: 'day' },
  { id: 'tank', a: 1087, b: 1148, light: 'day' },
  { id: 'home', a: 1149, b: 1199, light: 'golden' },
  { id: 'stayed', a: 1200, b: 1247, light: 'golden' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const { smooth, back, easeOut, easeIn } = M;

// ---------- lights ----------
const base = { fogNear: 120, fogFar: 1300, sat: 1.12, glint: '#effaff', waterDeep: '#2c6c8c', waterShal: '#5aaec4', vig: 0.2, shadowExt: 16 };
export const LIGHTS = {
  day: { ...base, az: 150, el: 48, sky: '#cfe0f4', ground: '#a8744a', hemi: 1.15, sun: '#fff0d6', sunI: 2.6, fog: '#e6dccb', skyTop: '#2f7ad8', skyHor: '#cfe2f4', gain: '#fff6ea' },
  dusk: { ...base, az: 250, el: 14, sky: '#c8a4b0', ground: '#7a4a38', hemi: 1.0, sun: '#ffb47a', sunI: 2.4, fog: '#e8b090', skyTop: '#5a62a8', skyHor: '#f3a878', sat: 1.1, gain: '#fff0e0', vig: 0.28 },
  golden: { ...base, az: 280, el: 10, sky: '#a898c8', ground: '#7a4c36', hemi: 1.0, sun: '#ffae62', sunI: 2.9, fog: '#f2b484', fogNear: 90, fogFar: 1100, skyTop: '#6a6cb4', skyHor: '#ffbe76', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.14, gain: '#fff2e2', vig: 0.26 },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 'field' || S.id === 'split' || S.id === 'tally') L.shadowExt = 60;
  if (S.id === 'army' || S.id === 'home' || S.id === 'ran' || S.id === 'tank') L.shadowExt = 30;
  return L;
};

// ---------- places ----------
const P = (x, y, z) => [x, y, z];
const GUN = [{ x: 30, z: 8 }, { x: 31.3, z: 8.05 }];       // gun line at the camp, aiming north across the road
const PLAN = [-60, 16];

// ---------- cameras ----------
const CAMS = {
  hook: [{ f: 0, pos: P(1.6, 1.45, 7.6), look: P(0.5, 1.3, 0.4), fov: 40 }, { f: 107, pos: P(1.3, 1.45, 6.2), look: P(0.5, 1.35, 0.4), fov: 38 }],
  birds: [{ f: 108, pos: P(0.8, 1.78, -0.6), look: P(0.8, 1.82, -4.6), fov: 34 }, { f: 150, pos: P(0.8, 1.8, -1.2), look: P(0.8, 1.84, -4.6), fov: 32 }],
  field: [
    { f: 151, pos: P(7.6, 1.7, -4.4), look: P(9.8, 1.25, -9.4), fov: 40 },
    { f: 205, pos: P(7.2, 2.4, -3.8), look: P(9.6, 1.3, -10.5), fov: 42 },
    { f: 260, pos: P(5, 7, 3), look: P(5, 0, -22), fov: 46 },
    { f: 311, pos: P(4.5, 10, 6), look: P(4.5, 0, -28), fov: 48 },
  ],
  farmers: [{ f: 312, pos: P(-0.8, 1.55, 6.4), look: P(-0.8, 1.45, -1.0), fov: 40 }, { f: 374, pos: P(-0.8, 1.55, 5.6), look: P(-0.8, 1.5, -1.0), fov: 38 }],
  ask: [{ f: 375, pos: P(-0.2, 1.6, 4.4), look: P(-0.6, 1.55, -0.8), fov: 40 }, { f: 398, pos: P(-0.2, 1.6, 4.2), look: P(-0.6, 1.6, -0.8), fov: 40 }, { f: 442, pos: P(0.2, 1.6, 4.2), look: P(2.2, 3.0, -2.4), fov: 44, ease: 'smooth' }],
  army: [{ f: 443, pos: P(4.2, 1.15, 7.4), look: P(14, 1.5, 1.4), fov: 42 }, { f: 493, pos: P(3.8, 1.2, 7.0), look: P(11, 1.6, 1.4), fov: 40 }],
  guns: [{ f: 494, pos: P(29.6, 1.55, 12.0), look: P(30.5, 1.4, 7.9), fov: 36 }, { f: 549, pos: P(31.8, 1.55, 11.7), look: P(31.0, 1.4, 7.9), fov: 36 }],
  plan: [{ f: 550, pos: P(-60.0, 1.6, 25.4), look: P(-60, 1.35, 16.6), fov: 40 }, { f: 606, pos: P(-60.0, 1.6, 24.4), look: P(-60, 1.4, 16.6), fov: 38 }],
  split: [{ f: 607, pos: P(0, 10, 56), look: P(0, 0, 40), fov: 44 }, { f: 661, pos: P(0, 13, 59), look: P(0, 0, 40), fov: 48 }],
  lookout: [{ f: 662, pos: P(12.9, 1.15, -7.0), look: P(13.6, 2.0, -12.2), fov: 44 }, { f: 708, pos: P(13.0, 1.15, -7.6), look: P(13.6, 2.1, -12.2), fov: 42 }],
  ran: [{ f: 709, pos: P(-1, 1.3, 12.5), look: P(-4, 1.15, 1.6), fov: 44 }, { f: 747, pos: P(-1, 1.3, 12.5), look: P(4, 1.15, 1.6), fov: 44, ease: 'smooth' }],
  fire: [{ f: 748, pos: P(31.6, 1.55, 12.0), look: P(30.1, 1.35, 8.1), fov: 40 }, { f: 790, pos: P(31.5, 1.55, 11.6), look: P(30.1, 1.35, 8.1), fov: 38 }],
  dodge: [{ f: 791, pos: P(30, 1.7, -5.2), look: P(30, 1.25, -12), fov: 44 }, { f: 826, pos: P(30, 1.75, -5.8), look: P(30, 1.25, -12), fov: 42 }],
  jam: [{ f: 827, pos: P(31.9, 1.55, 11.1), look: P(30.1, 1.45, 8.5), fov: 36 }, { f: 866, pos: P(31.7, 1.55, 10.8), look: P(30.1, 1.5, 8.5), fov: 33 }],
  peek: [{ f: 867, pos: P(30.2, 1.8, -1.0), look: P(30.2, 1.85, -4.6), fov: 32 }, { f: 888, pos: P(30.2, 1.82, -1.3), look: P(30.2, 1.86, -4.6), fov: 30 }],
  weeks: [{ f: 889, pos: P(31.2, 1.6, 14.2), look: P(31.2, 1.6, 8.6), fov: 42 }, { f: 931, pos: P(31.2, 1.6, 13.4), look: P(31.2, 1.6, 8.6), fov: 40 }],
  tally: [
    { f: 932, pos: P(33.85, 1.62, 17.4), look: P(33.1, 1.6, 10.5), fov: 40 },
    { f: 978, pos: P(33.8, 1.62, 16.8), look: P(33.1, 1.6, 10.5), fov: 39 },
    { f: 1023, pos: P(37, 8, 19), look: P(32, 1, -18), fov: 48 },
  ],
  quote: [{ f: 1024, pos: P(40.1, 1.7, 12.6), look: P(40.1, 1.95, 6.4), fov: 42 }, { f: 1086, pos: P(40.1, 1.7, 11.8), look: P(40.1, 2.0, 6.4), fov: 40 }],
  tank: [{ f: 1087, pos: P(3.2, 0.9, 6.2), look: P(-7, 1.3, 1.6), fov: 38 }, { f: 1148, pos: P(3.0, 0.95, 4.6), look: P(0.5, 1.35, 1.6), fov: 36 }],
  home: [{ f: 1149, pos: P(-3.5, 1.7, 7.4), look: P(6, 1.4, -0.6), fov: 42 }, { f: 1199, pos: P(-3.2, 1.75, 7.0), look: P(12, 1.4, -0.6), fov: 40 }],
  stayed: [{ f: 1200, pos: P(0, 1.75, 9.6), look: P(0, 1.55, 1.6), fov: 40 }, { f: 1247, pos: P(0, 1.78, 7.6), look: P(0, 1.65, 1.6), fov: 36 }],
};
const KICKS = [{ f: 750, a: 0.03 }, { f: 760, a: 0.03 }, { f: 770, a: 0.03 }, { f: 780, a: 0.03 }, { f: 1100, a: 0.03 }];
export const camAt = (f) => {
  const S = shotAt(f), c = camFromKeys(CAMS[S.id], f, { creep: 0.0008, kicks: KICKS });
  c.flash = S.id === 'fire' && f % 5 === 0 ? 0.25 : 0;
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOCUS = {
  hook: P(0.4, 1.35, 0.6), birds: P(0.8, 1.8, -4.5), farmers: P(-0.8, 1.4, -1.0), ask: P(-0.6, 1.7, -0.8), army: P(11, 1.5, 1.6), guns: P(31, 1.2, 7.9),
  plan: P(-60, 1.4, 16.8), split: P(0, 0, 40), lookout: P(13.6, 2.6, -12), ran: P(0, 1.2, 1.6), fire: P(30.2, 1.3, 8.4), dodge: P(30, 1.2, -11), jam: P(30.3, 1.3, 8.4),
  peek: P(30.2, 1.85, -4.5), weeks: P(31.2, 1.3, 8.8), quote: P(40.1, 1.6, 6.6), tank: P(-2, 1.2, 1.6), home: P(8, 1.4, 1.6), stayed: P(0, 1.5, 1.8),
};
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  if (S.id === 'field') { const t = f < 230 ? P(10.4, 1.05, -9.2) : P(5, 0, -26); return { focus: dist(C.pos, t), cinf: f < 230 ? 8 : 1, near: 1 }; }
  if (S.id === 'tally') { const t = f < 985 ? P(33.1, 1.6, 10.5) : P(32, 1, -14); return { focus: dist(C.pos, t), cinf: f < 985 ? 9 : 1, near: 1 }; }
  if (S.id === 'tank') return { focus: dist(C.pos, P(emuTankX(f), 1.4, 1.6)), cinf: 6, near: 1 };
  const cinf = { split: 0, army: 5, home: 5, ran: 4, lookout: 7, birds: 12, peek: 12, jam: 5, fire: 4 }[S.id] ?? 8;
  return { focus: dist(C.pos, FOCUS[S.id]), cinf, near: 1 };
};
const emuTankX = (f) => lerp(-16, 0.2, smooth(ramp(f, 1087, 1140)));

// ---------- world state ----------
export const worldAt = (f) => {
  const S = shotAt(f), W = { helmet: null };
  W.signY = S.id === 'hook' && f >= 8 ? -3 + 3 * back(ramp(f, 8, 26), 2.2) : -3;
  // guns: on the road in the hook (pointing at the wheat), at the camp gun line later
  const atCamp = (kick = 0, tilt = 0) => [{ x: GUN[0].x, z: GUN[0].z, ry: Math.PI / 2, kick, tilt }, { x: GUN[1].x, z: GUN[1].z, ry: Math.PI / 2 }];
  if (S.id === 'hook') W.guns = [{ x: 0.55, z: 0.5, ry: Math.PI / 2 + 0.25 }];
  else if (S.id === 'guns' || S.id === 'weeks' || S.id === 'tally' || S.id === 'quote') W.guns = atCamp();
  else if (S.id === 'fire') W.guns = atCamp(f % 3 === 0 ? 1 : 0, 0.02);
  else if (S.id === 'jam') W.guns = atCamp(0, f > 840 ? -0.12 : 0.02);
  W.shells = S.id === 'weeks' || S.id === 'tally';
  // the truck: arrives from the east in 'army', parked at the camp, drives off east in 'home'
  if (S.id === 'army') { const t = easeOut(ramp(f, 443, 488)); W.truck = { x: lerp(64, 13, t), z: 1.6, ry: Math.PI, bump: q(Math.abs(Math.sin(f * 0.7)) * 0.03 * (1 - t), 3) }; }
  else if (S.id === 'home') { const t = easeIn(ramp(f, 1152, 1199)); W.truck = { x: lerp(5, 30, t), z: 1.6, ry: 0, bump: q(Math.abs(Math.sin(f * 0.7)) * 0.03, 3) }; }
  else if (['guns', 'weeks', 'tally', 'quote'].includes(S.id)) W.truck = { x: 48, z: 9.5, ry: 0.2 };
  return W;
};

// ---------- actors ----------
const life = (f, seed) => { const i = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(i.bob, 3), tilt: q(i.tilt, 1), headTilt: q(i.headTilt, 1) }; };
const PER = (T, who, o, pos, extra = {}) => ({ key: 'ew' + who + JSON.stringify(o), draw: (p) => T.ewPerson(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const EMU = (T, o, pos, extra = {}) => ({ key: 'emu' + JSON.stringify(o), draw: (p) => T.emuCard(p, o), x: pos[0], y: pos[1], z: pos[2], s: 1.15, ...extra });
const rnd = (i, k = 0) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
// a grazing emu: pecks on and off on its own rhythm; key changes only when the pose changes
const grazer = (T, f, i, pos, extra = {}) => {
  const peck = ((f * 0.025 + rnd(i, 1)) % 1) < 0.45;
  return EMU(T, { mode: peck ? 'peck' : 'stand', expr: peck ? 'happy' : 'neutral', blink: peck ? 0 : blinkAt(f, i), wheat: !peck && rnd(i, 3) < 0.4, look: q(rnd(i, 4) - 0.5, 1) }, pos, { flip: rnd(i, 2) < 0.5, ...extra });
};
const runner = (T, f, i, pos, flip, extra = {}) => EMU(T, { mode: 'run', phase: q(((f * 0.11) + rnd(i, 5)) % 1, 1), expr: rnd(i, 6) < 0.5 ? 'determined' : 'smug' }, pos, { flip, ...extra });

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const per = (who, seed, o, pos, extra) => out.push(PER(T, who, { ...life(f, seed), ...o }, pos, extra));
  switch (S.id) {
    case 'hook': {
      per('gunner', 11, { expr: 'stern', facing: -0.6, look: -0.8, R: 'point', L: 'point' }, P(0.72, 0, 1.45));
      per('major', 12, { expr: f > 60 ? 'grin' : 'stern', facing: 0.4, look: 0.2, L: 'hip', R: f > 62 ? 'point' : 'hip' }, P(-0.55, 0, 0.6));
      break;
    }
    case 'birds': {
      const up = back(ramp(f, 110, 124), 2.0);
      out.push(EMU(T, { front: true, expr: f > 128 ? 'smug' : 'neutral', blink: f > 138 && f < 142 ? 1 : 0, look: 0 }, P(0.8, lerp(-1.3, 0, up), -4.6), { blob: false }));
      for (const [x, z, i] of [[-1.6, -7.5, 3], [3.0, -8.5, 4]]) out.push(grazer(T, f, i, P(x, 0, z)));
      break;
    }
    case 'field': {
      out.push(EMU(T, { mode: f % 40 < 26 ? 'peck' : 'stand', expr: 'happy', wheat: f % 40 >= 26 }, P(9.8, 0, -9.4), { flip: true }));
      for (const [x, z, i] of [[8.4, -11.2, 1], [11.6, -12.4, 2], [12.4, -8.6, 3]]) out.push(grazer(T, f, i, P(x, 0, z)));
      for (let i = 0; i < 90; i++) { const x = -14 + rnd(i, 7) * 40, z = -14 - rnd(i, 8) * 34; out.push(grazer(T, f, 20 + i, P(x, 0, z))); }
      break;
    }
    case 'farmers': {
      per('farmer', 21, { expr: 'stubborn', facing: 0.2, L: 'hip', R: 'hip' }, P(-2.1, 0, -1.0));
      per('farmer2', 22, { expr: f > 340 ? 'stubborn' : 'stern', facing: 0, L: 'cross', R: 'cross' }, P(-0.8, 0, -0.8));
      per('farmer3', 23, { expr: 'stern', facing: -0.2, R: f > 335 ? 'point' : 'hang', look: -0.6 }, P(0.5, 0, -1.0));
      out.push(EMU(T, { mode: 'stand', expr: 'happy', wheat: true }, P(-1.4, 0, -4.3), { flip: true }));
      out.push(grazer(T, f, 31, P(1.4, 0, -5.2)));
      break;
    }
    case 'ask': {
      per('farmer2', 22, { expr: f < 395 ? 'nervous' : 'shock', facing: 0, L: 'hang', R: f >= 388 && f < 404 ? 'up' : 'hang', look: 0.4 }, P(-0.6, 0, -0.8));
      out.push(EMU(T, { mode: 'stand', expr: 'squint', look: 0.6 }, P(-1.5, 0, -4.4)));
      break;
    }
    case 'army': {
      const tx = lerp(64, 13, easeOut(ramp(f, 443, 488)));
      for (let i = 0; i < 3; i++) per(['gunner', 'gunner2', 'gunner3'][i], 41 + i, { expr: 'stern', facing: -0.6, step: q((f * 0.05 + i * 0.33) % 1, 2), R: 'hang' }, P(tx - 5.8 - i * 1.4, 0, 0.9 + (i % 2) * 1.0));
      break;
    }
    case 'guns': {
      per('major', 12, { expr: 'grin', facing: -0.5, L: 'hip', R: f > 515 ? 'thumb' : 'hip' }, P(30.65, 0, 6.9));
      break;
    }
    case 'plan': {
      out.push(EMU(T, { mode: 'stand', expr: f > 575 ? 'smug' : 'determined', stick: true, blink: blinkAt(f, 5), neck: 0.1 }, P(-58.95, 0, 17.4), { flip: true }));
      for (const [x, z, i, ex] of [[-61.0, 18.8, 1, 'determined'], [-61.5, 17.8, 2, 'squint']]) out.push(EMU(T, { mode: 'stand', expr: ex, blink: blinkAt(f, i + 8), look: 0.6 }, P(x, 0, z)));
      break;
    }
    case 'split': {
      const t = smooth(ramp(f, 612, 655)), dirs = [[1, 0.1], [-1, 0.25], [0.25, 1], [-0.3, -1]];
      for (let i = 0; i < 32; i++) { const g = i % 4, d = dirs[g], a = rnd(i, 9) * 6.28, r0 = 1 + rnd(i, 10) * 3;
        const x0 = Math.cos(a) * r0 * 0.7, z0 = 40 + Math.sin(a) * r0 * 0.5, x = x0 + d[0] * t * 6 + (i % 3) * 0.4 * t, z = z0 + d[1] * t * 7;
        out.push(t > 0.02 ? runner(T, f, i, P(x, 0, z), d[0] < 0) : grazer(T, f, i, P(x0, 0, z0))); }
      break;
    }
    case 'lookout': {
      const turn = f < 680 ? false : f < 694 ? true : false;
      out.push(EMU(T, { mode: 'stand', neck: 0.6, binoc: true, expr: 'squint' }, P(13.6, 0, -12.2), { flip: turn, s: 1.3 }));
      for (const [x, z, i] of [[11.8, -10.6, 3], [15.4, -11.0, 4], [12.8, -14.5, 5]]) out.push(grazer(T, f, i, P(x, 0, z)));
      break;
    }
    case 'ran': {
      for (let i = 0; i < 6; i++) { const t0 = 709 + i * 4, x = lerp(-16, 18, clamp((f - t0) / 30)); out.push(runner(T, f, i, P(x, 0, 0.8 + (i % 3) * 0.9), false)); }
      break;
    }
    case 'fire': {
      per('gunner', 11, { expr: f % 6 < 3 ? 'grin' : 'stubborn', facing: -0.3, look: -0.6, R: 'point', L: 'point', headTilt: f % 3 === 0 ? 2 : 0 }, P(30.0, 0, 8.95));
      per('gunner2', 13, { expr: 'stern', facing: -0.4, L: 'cheek', R: 'cheek' }, P(31.5, 0, 7.3));
      break;
    }
    case 'dodge': {
      for (let i = 0; i < 9; i++) { const side = i % 2 ? 1 : -1, t = smooth(ramp(f, 791 + i * 2, 826)), x = 30 + side * (0.4 + rnd(i, 11) * 1.2 + t * 3.5), z = -8.5 - rnd(i, 12) * 6;
        out.push(i === 4 ? EMU(T, { mode: 'peck', expr: 'shock' }, P(30.2, 0, -10.0)) : runner(T, f, i, P(x, 0, z), side < 0)); }
      break;
    }
    case 'jam': {
      per('gunner', 11, { expr: f < 838 ? 'stubborn' : f < 850 ? 'shock' : 'dazed', facing: -0.3, look: f > 838 ? -0.8 : -0.6, R: 'point', L: f > 845 ? 'temple' : 'point', headTilt: f > 850 ? -8 : 0 }, P(30.0, 0, 8.95));
      break;
    }
    case 'peek': {
      const up = back(ramp(f, 868, 878), 2.0);
      out.push(EMU(T, { front: true, expr: f > 879 ? 'wink' : 'smug' }, P(30.2, lerp(-1.3, 0, up), -4.6), { blob: false }));
      break;
    }
    case 'weeks': {
      per('gunner', 11, { expr: 'dazed', facing: 0.2, blink: 0.5, headTilt: 8 }, P(30.65, 0, 9.0));
      per('gunner2', 13, { expr: 'dazed', facing: -0.2, blink: f % 50 < 20 ? 1 : 0.5, headTilt: -10 }, P(31.75, 0, 9.2));
      break;
    }
    case 'tally': {
      per('gunner3', 14, { expr: 'nervous', facing: -0.5, look: -0.6, L: 'temple', R: 'hang' }, P(33.9, 0, 11.5));
      // the field across the road, still full of emus
      for (let i = 0; i < 70; i++) { const x = 6 + rnd(i, 13) * 56, z = -6 - rnd(i, 14) * 40; out.push(grazer(T, f, 50 + i, P(x, 0, z))); }
      break;
    }
    case 'quote': {
      per('major', 12, { expr: f > 1066 ? 'shock' : 'stern', facing: 0.4, look: 0.5, L: 'hip', R: f > 1040 ? 'up' : 'hip' }, P(39.55, 0, 6.4));
      per('reporter', 15, { expr: f > 1070 ? 'shock' : 'neutral', facing: -0.5, look: -0.6, notepad: true, R: 'belly' }, P(40.6, 0, 6.7));
      break;
    }
    case 'tank': {
      const x = emuTankX(f);
      out.push(EMU(T, { mode: f < 1140 ? 'run' : 'stand', phase: q((f * 0.11) % 1, 1), expr: 'determined', helmet: true }, P(x, 0, 1.6)));
      break;
    }
    case 'home': {
      // emus watch the truck go from the wheat edge, heads above the crop
      for (let i = 0; i < 7; i++) out.push(EMU(T, { mode: 'stand', expr: f > 1165 ? 'happy' : 'smug', blink: blinkAt(f, i), look: 0.6 }, P(1 + i * 1.5, 0, -3.9 - (i % 2) * 0.6)));
      break;
    }
    case 'stayed': {
      const xs = [[-1.7, 0.4], [1.7, 0.4], [-0.95, 1.2], [0.95, 1.2], [0, 2.0]];
      xs.forEach(([x, z], i) => { const mid = i === 4;
        out.push(EMU(T, { front: true, expr: mid ? (f > 1228 ? 'wink' : 'smug') : 'happy', slouch: mid && f >= 1212, blink: mid ? 0 : blinkAt(f, i + 3) }, P(x, 0, z), { s: mid ? 1.2 : 1.1 })); });
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
    case 'field': {
      if (f >= 168 && f < 240) { const t = q(clamp((f - 168) / 72), 2); out.push(FX('n20k' + t, (p) => T.fxWord(p, '20,000', Math.min(0.5, t), '#ffd84a', 140), P(9.8, 2.8, -10.0), 1.6)); }
      if (f >= 262) { const t = q(clamp((f - 262) / 49), 2); out.push(FX('n20kb' + t, (p) => T.fxWord(p, '20,000 EMUS', Math.min(0.5, t), '#ffd84a', 96), P(4.5, 3.2, -16), 3.4)); }
      break;
    }
    case 'farmers': {
      if (f >= 340) { const t = q(((f - 340) / 22) % 1, 2); out.push(FX('st' + t, (p) => T.fxSteam(p, t), P(-0.8, 2.25, -0.6), 0.6)); }
      break;
    }
    case 'ask': {
      if (f >= 398) { const t = smooth(ramp(f, 398, 442)); out.push(FX('letter' + q((f * 0.2) % 1, 1), (p) => T.fxLetter(p, (f * 0.03) % 1), P(lerp(-0.2, 3.2, t), lerp(2.3, 3.6, t), lerp(-0.6, -2.8, t)), 0.45)); }
      break;
    }
    case 'army': {
      const tx = lerp(64, 13, easeOut(ramp(f, 443, 488)));
      if (f < 488) for (let i = 0; i < 3; i++) { const k = q(((f * 0.08) + i / 3) % 1, 2); out.push(FX('dust' + i + k, (p) => T.fxDust(p, k, '#d8a07a'), P(tx + 2.6 + k * 2, 0.35 + k * 0.4, 1.6 + (i - 1) * 0.6), 0.6 + 0.5 * k)); }
      break;
    }
    case 'guns': {
      for (const [k, at, x] of [[0, 505, 30.9], [1, 528, 32.2]]) if (f >= at && f < at + 14) { const t = q(ramp(f, at, at + 14), 2); out.push(FX('gl' + k + t, (p) => T.fxStars(p, t), P(x, 1.25, 7.95), 0.5)); }
      if (f >= 520) { const t = q(clamp((f - 520) / 29), 2); out.push(FX('x2' + t, (p) => T.fxWord(p, 'x2', Math.min(0.5, t), '#ffffff', 170), P(30.65, 2.05, 7.9), 0.8)); }
      break;
    }
    case 'split': {
      if (f > 615) for (let i = 0; i < 4; i++) { const k = q(((f * 0.07) + i / 4) % 1, 2), d = [[1, 0.1], [-1, 0.25], [0.25, 1], [-0.3, -1]][i], t = smooth(ramp(f, 612, 655));
        out.push(FX('sd' + i + k, (p) => T.fxDust(p, k, '#d8b07a'), P(d[0] * t * 5, 0.5, 40 + d[1] * t * 6), 1.4)); }
      break;
    }
    case 'ran': {
      for (let i = 0; i < 6; i++) { const t0 = 709 + i * 4, x = lerp(-16, 18, clamp((f - t0) / 30)), k = q(((f * 0.1) + i / 6) % 1, 2);
        if (f > t0) out.push(FX('rd' + i + k, (p) => T.fxDust(p, k, '#d8a07a'), P(x - 1.0 - k, 0.3 + k * 0.3, 0.8 + (i % 3) * 0.9), 0.45 + 0.4 * k)); }
      if (f >= 710 && f < 740) { const t = q(ramp(f, 710, 740), 2); out.push(FX('zoom' + t, (p) => T.fxWord(p, 'ZOOM!', Math.min(0.6, t), '#ffffff', 150, -0.08), P(0, 2.7, 1.6), 1.6)); }
      break;
    }
    case 'fire': {
      if (f % 3 !== 2) { const t = q((f % 3) / 3, 2); out.push(FX('mz' + t, (p) => T.fxMuzzle(p, t), P(30.0, 1.12, 6.75), 0.38, { order: 6 })); }
      for (let i = 0; i < 3; i++) { const t = q(((f * 0.18) + i / 3) % 1, 2); out.push(FX('tr' + i + t, (p) => T.fxTracer(p, t), P(30.0, 1.15 + i * 0.04, 6.4 - t * 6), 0.9)); }
      if (f >= 752 && f < 790) { const t = q(ramp(f, 752, 790), 2); out.push(FX('rat' + t, (p) => T.fxWord(p, 'RAT-A-TAT!', Math.min(0.6, t), '#ffd84a', 78), P(30.5, 1.05, 8.6), 0.8)); }
      break;
    }
    case 'dodge': {
      for (let i = 0; i < 4; i++) { const t = q(((f * 0.2) + i / 4) % 1, 2); out.push(FX('trd' + i + t, (p) => T.fxTracer(p, t), P(28.6 + i * 0.9, 1.3 + (i % 2) * 0.5, -6.5 - t * 6), 0.8)); }
      const t = q(((f - 791) / 34) % 1, 2); out.push(FX('fth' + t, (p) => T.fxFeather(p, t, 2), P(30.4, 1.6, -9.6), 1.4));
      break;
    }
    case 'jam': {
      if (f >= 838 && f < 860) { const t = q(ramp(f, 838, 860), 2); out.push(FX('clk' + t, (p) => T.fxWord(p, 'CLICK.', Math.min(0.6, t), '#ffffff', 110), P(29.85, 1.15, 7.6), 0.75)); }
      if (f >= 842) { const t = q(((f - 842) / 20) % 1, 2); out.push(FX('smk' + t, (p) => T.fxSteam(p, t), P(30.35, 1.25, 7.85), 0.4)); }
      break;
    }
    case 'weeks': {
      const page = Math.min(5, Math.floor((f - 889) / 7)); out.push(FX('cal' + page, (p) => T.fxCal(p, page), P(31.2, 2.05, 8.6), 0.8));
      break;
    }
    case 'quote': {
      if (f >= 1040) { const k = f >= 1100 ? 2 : f >= 1068 ? 1 : 0;
        const lines = [['"They can face'], ['"They can face', 'machine guns'], ['"They can face', 'machine guns', 'like TANKS."']][k];
        out.push(FX('q' + k, (p) => T.fxCaption(p, lines, ['#ffffff', '#ffffff', '#ffd84a'], 62), P(40.1, 1.45, 6.9), 0.9)); }
      break;
    }
    case 'tank': {
      const x = emuTankX(f);
      for (let i = 0; i < 2; i++) { const at = 1092 + i * 9; if (((f - at) % 18 + 18) % 18 < 8 && f >= at) { const t = q((((f - at) % 18 + 18) % 18) / 8, 2); out.push(FX('ping' + i + t, (p) => T.fxPing(p, t), P(x + 0.35, 2.05 + i * 0.1, 1.7), 0.5)); out.push(FX('pw' + i + t, (p) => T.fxWord(p, 'PING!', Math.min(0.6, t), '#ffffff', 110), P(x + 0.3 + i * 0.5, 1.2 + i * 0.25, 1.7), 0.9)); } }
      if (f >= 1104) { const t = q(clamp((f - 1104) / 44), 2), C = camAt(f), d = C.look.map((v, i) => v - C.pos[i]), n = Math.hypot(...d), at = C.pos.map((v, i) => v + d[i] / n * 2.6);
        out.push(FX('tanks' + t, (p) => T.fxWord(p, 'LIKE TANKS!', Math.min(0.45, t), '#ffd84a', 80), P(at[0], at[1] + 0.45 - 0.79, at[2]), 0.7)); }
      for (let i = 0; i < 2; i++) { const k = q(((f * 0.1) + i / 2) % 1, 2); if (f < 1140) out.push(FX('td' + i + k, (p) => T.fxDust(p, k, '#d8a07a'), P(x - 0.9 - k, 0.3 + k * 0.3, 1.6), 0.45 + 0.4 * k)); }
      break;
    }
    case 'home': {
      const t = easeIn(ramp(f, 1152, 1199)), tx = lerp(5, 30, t);
      for (let i = 0; i < 3; i++) { const k = q(((f * 0.08) + i / 3) % 1, 2); if (false) out.push(FX('hd' + i + k, (p) => T.fxDust(p, k, '#e0a880'), P(tx - 3.0 - k * 2, 0.35 + k * 0.4, 1.6 + (i - 1) * 0.6), 0.6 + 0.5 * k)); }
      break;
    }
  }
  return out;
};
