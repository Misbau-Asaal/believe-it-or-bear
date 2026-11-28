// "Lord Byron's College Banned Dogs, So He Brought a Bear" — shot plan timed to the Kokoro am_michael voice (39.10 s, 30 fps, 1173 frames; end card added after)
// Phrase frames: 5-66 "Lord Byron's college banned dogs." | 78-107 "So he brought a bear." | 129-157 "In 1805," |
// 172-250 "the young poet arrived at Trinity College, Cambridge." | 278-310 "He loved animals." | 322-367 "But the college rules were clear:" |
// 377-401 "no dogs." | 422-457 "Byron read them again." | 470-487 "Dogs?" | 500-514 "Banned." | 527-543 "Bears?" | 555-578 "Not a word." |
// 599-636 "So he bought a tame bear." | 658-716 "He walked it around the college on a chain," | 727-753 "just like a dog." | 778-803 "Students stared." |
// 816-906 "Then the officials asked Byron what he meant to do with it." | 927-962 "He had his answer ready." | 984-1028 "He should sit for a fellowship." |
// 1048-1071 "In other words," | 1079-1148 "the bear should take the exam to teach at Cambridge."
import { M, camFromKeys, idle, blinkAt, lerp, lerp3, ramp, clamp, q } from './motion.js';
export const FPS = 30, TOTAL = 1173;
export const SHOTS = [
  { id: 'hook', a: 0, b: 117, light: 'street' },
  { id: 'year', a: 118, b: 268, light: 'court' },
  { id: 'animals', a: 269, b: 318, light: 'court' },
  { id: 'rules', a: 319, b: 415, light: 'court' },
  { id: 'reread', a: 416, b: 465, light: 'court' },
  { id: 'dogs', a: 466, b: 524, light: 'court' },
  { id: 'bears', a: 525, b: 551, light: 'court' },
  { id: 'notword', a: 552, b: 596, light: 'court' },
  { id: 'bought', a: 597, b: 655, light: 'fair' },
  { id: 'walk', a: 656, b: 774, light: 'court' },
  { id: 'stared', a: 775, b: 812, light: 'court' },
  { id: 'asked', a: 813, b: 925, light: 'tense' },
  { id: 'ready', a: 926, b: 980, light: 'tense' },
  { id: 'fellow', a: 981, b: 1043, light: 'sting' },
  { id: 'exam', a: 1044, b: 1172, light: 'hall' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const { smooth, back, easeOut, easeIn } = M;

// ---------- lights ----------
const base = { fogNear: 120, fogFar: 1300, sat: 1.1, glint: '#effaff', waterDeep: '#2c6c8c', waterShal: '#5aaec4', vig: 0.22, shadowExt: 14 };
export const LIGHTS = {
  street: { ...base, az: 150, el: 40, sky: '#d6e4f2', ground: '#8a8070', hemi: 1.2, sun: '#fff0d6', sunI: 2.5, fog: '#dfe6ec', skyTop: '#3f86d8', skyHor: '#d6e6f4', gain: '#fff6ea' },
  court: { ...base, az: 140, el: 46, sky: '#d0e2f4', ground: '#7a8a5a', hemi: 1.2, sun: '#fff2dc', sunI: 2.5, fog: '#dfe6ec', skyTop: '#2f7ad8', skyHor: '#cfe2f4', gain: '#fff6ea', shadowExt: 18 },
  tense: { ...base, az: 140, el: 46, sky: '#d8d8e4', ground: '#6a7050', hemi: 1.1, sun: '#ffe8cc', sunI: 2.2, fog: '#d8dce4', skyTop: '#3a6ab0', skyHor: '#d8dce8', gain: '#fff2e4', vig: 0.34, shadowExt: 14 },
  sting: { ...base, az: 140, el: 46, sky: '#d8d8e0', ground: '#6a7050', hemi: 1.1, sun: '#ffe8cc', sunI: 2.1, fog: '#d8dce4', skyTop: '#3a6ab0', skyHor: '#d8dce8', gain: '#f6f0ea', sat: 0.95, vig: 0.42, shadowExt: 10 },
  fair: { ...base, az: 120, el: 34, sky: '#f2dcc0', ground: '#8a7a5a', hemi: 1.2, sun: '#ffe2b0', sunI: 2.5, fog: '#f0dcc4', skyTop: '#4a8ad8', skyHor: '#f6dcc0', gain: '#fff0dc' },
  hall: { ...base, az: 110, el: 64, sky: '#f2e4cc', ground: '#6a4a30', hemi: 1.35, sun: '#fff0d4', sunI: 1.9, fog: '#e8dcc4', fogNear: 60, fogFar: 400, skyTop: '#6a9ad0', skyHor: '#e8e4dc', gain: '#fff4e4', shadowExt: 12 },
};
export const lightFor = (S, f) => ({ ...LIGHTS[S.light] });

// ---------- places ----------
const P = (x, y, z) => [x, y, z];
const BY_H = P(3.05, 0, -0.85), BEAR_H = P(2.3, 0, -1.4);          // outside the gate, by the NO DOGS sign
const BOARD = { x: -3.0, z: -10.6 };                                   // the rules, just inside the gate
const BY_B = P(-1.95, 0, -11.05);
const L2 = 1.59, L3 = 1.40, L4 = 1.21, LX = -2.98;                     // rule lines II-IV (world y) and the "No dogs" words (world x)
const BY_A = P(-0.95, 0, -19.4), BEAR_A = P(-0.2, 0.0, -19.15);       // by the fountain, when the officials come
const WZ = -16;                                                        // the walk across the lawn
const FAIR = 60, HALL = -60, BEAR_X = P(-60.0, 0.4, -3.15);

// ---------- the walk ----------
const walkX = (f) => lerp(-6.4, -3.3, smooth(ramp(f, 656, 724)));
const sitAt = (f) => smooth(ramp(f, 726, 738));
const byWalkX = (f) => walkX(f) - 1.55;

// ---------- cameras ----------
const CAMS = {
  hook: [{ f: 0, pos: P(3.45, 1.5, 2.7), look: P(3.45, 1.45, -1.2), fov: 43 }, { f: 72, pos: P(3.42, 1.5, 2.6), look: P(3.43, 1.45, -1.2), fov: 42 },
    { f: 86, pos: P(2.95, 1.45, 3.1), look: P(2.85, 1.38, -1.2), fov: 46, ease: 'easeOut' }, { f: 117, pos: P(2.93, 1.45, 2.9), look: P(2.85, 1.4, -1.2), fov: 45 }],
  year: [{ f: 118, pos: P(2.2, 1.55, -19.4), look: P(1.3, 2.2, -9), fov: 50 }, { f: 268, pos: P(1.6, 2.2, -21.0), look: P(0.1, 3.8, -9), fov: 52 }],
  animals: [{ f: 269, pos: P(6.95, 1.45, -15.2), look: P(6.7, 1.28, -18.1), fov: 40 }, { f: 318, pos: P(6.9, 1.45, -15.7), look: P(6.7, 1.3, -18.1), fov: 38 }],
  rules: [{ f: 319, pos: P(-2.5, 1.5, -14.8), look: P(-2.68, 1.42, -10.7), fov: 50 }, { f: 368, pos: P(-2.55, 1.52, -14.4), look: P(-2.72, 1.46, -10.7), fov: 48 },
    { f: 392, pos: P(-2.88, 1.6, -12.3), look: P(-2.92, 1.58, -10.6), fov: 40 }, { f: 415, pos: P(-2.9, 1.6, -12.45), look: P(-2.93, 1.58, -10.6), fov: 39 }],
  reread: [{ f: 416, pos: P(-2.0, 1.45, -14.3), look: P(-2.38, 1.36, -10.8), fov: 48 }, { f: 465, pos: P(-2.05, 1.47, -13.9), look: P(-2.4, 1.38, -10.8), fov: 46 }],
  dogs: [{ f: 466, pos: P(-2.88, 1.56, -12.2), look: P(-2.88, 1.52, -10.6), fov: 44 }, { f: 524, pos: P(-2.9, 1.57, -12.0), look: P(-2.9, 1.53, -10.6), fov: 43 }],
  bears: [{ f: 525, pos: P(-2.9, 1.5, -12.05), look: P(-2.9, 1.45, -10.6), fov: 44 }, { f: 551, pos: P(-2.9, 1.48, -12.15), look: P(-2.9, 1.44, -10.6), fov: 45 }],
  notword: [{ f: 552, pos: P(-2.02, 1.56, -12.95), look: P(-1.97, 1.55, -11.05), fov: 39 }, { f: 596, pos: P(-2.0, 1.58, -12.6), look: P(-1.97, 1.6, -11.05), fov: 37, roll: -2 }],
  bought: [{ f: 597, pos: P(FAIR + 0.1, 1.5, 4.9), look: P(FAIR + 0.1, 1.35, -1.0), fov: 46 }, { f: 655, pos: P(FAIR + 0.1, 1.5, 4.5), look: P(FAIR + 0.1, 1.35, -1.0), fov: 45 }],
  asked: [{ f: 813, pos: P(1.6, 1.5, -15.2), look: P(1.9, 1.3, -19.6), fov: 46 }, { f: 852, pos: P(0.4, 1.6, -13.2), look: P(0.35, 1.15, -19.5), fov: 50 },
    { f: 925, pos: P(-0.1, 1.5, -14.6), look: P(-0.05, 1.15, -19.4), fov: 48 }],
  ready: [{ f: 926, pos: P(-0.98, 1.55, -17.5), look: P(-0.95, 1.56, -19.4), fov: 39 }, { f: 980, pos: P(-0.98, 1.57, -17.8), look: P(-0.95, 1.6, -19.4), fov: 36 }],
  fellow: [{ f: 981, pos: P(-0.56, 1.15, -15.8), look: P(-0.56, 1.05, -19.3), fov: 47 }, { f: 1043, pos: P(-0.5, 1.1, -16.4), look: P(-0.5, 1.0, -19.3), fov: 44, roll: 3 }],
  exam: [{ f: 1044, pos: P(HALL, 2.0, 3.6), look: P(HALL, 1.0, -4.5), fov: 50 }, { f: 1078, pos: P(HALL, 1.75, 1.6), look: P(HALL, 1.05, -3.8), fov: 46 },
    { f: 1140, pos: P(HALL - 0.02, 1.32, -0.85), look: P(HALL, 1.12, -3.2), fov: 38 }, { f: 1172, pos: P(HALL - 0.02, 1.3, -1.15), look: P(HALL, 1.14, -3.2), fov: 36 }],
};
const KICKS = [{ f: 500, a: 0.012 }, { f: 1010, a: 0.02 }];
export const camAt = (f) => {
  const S = shotAt(f);
  let c;
  if (S.id === 'walk') { // a tracking shot that follows Byron and the bear, then settles on the bear
    const m = (walkX(f) + byWalkX(f)) / 2 + 0.15, k = smooth(ramp(f, 726, 760));
    c = { pos: lerp3(P(m + 0.1, 1.35, -10.7), P(-3.5, 1.2, -12.3), k), look: lerp3(P(m, 0.85, WZ), P(-3.5, 0.8, WZ), k), fov: lerp(46, 44, k), roll: 0 };
  } else if (S.id === 'stared') {
    c = camFromKeys([{ f: 775, pos: P(4.8, 1.5, -11.7), look: P(4.8, 1.35, -15.4), fov: 48 }, { f: 812, pos: P(4.8, 1.5, -12.2), look: P(4.8, 1.38, -15.4), fov: 46 }], f, { creep: 0.0008 });
  } else c = camFromKeys(CAMS[S.id], f, { creep: 0.0008, kicks: KICKS });
  c.flash = 0;
  if (f >= 597 && f < 601) c.flash = 0.45 * (1 - (f - 597) / 4);        // off to the fair
  if (f >= 656 && f < 660) c.flash = 0.35 * (1 - (f - 656) / 4);
  if (f >= 1044 && f < 1050) c.flash = 0.75 * (1 - (f - 1044) / 6);     // into the exam hall
  if (f >= 984 && f < 988) c.flash = 0.25 * (1 - (f - 984) / 4);
  if (S.id === 'year') c.shadowAt = P(0, 2, -16);
  if (S.id === 'walk') c.shadowAt = P(-4.5, 1, WZ);
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOCUS = {
  hook: P(3.0, 1.5, -0.85), year: P(0.8, 1.8, -11), animals: P(6.7, 1.3, -18.1), rules: P(-2.5, 1.5, -10.8), reread: P(-2.0, 1.5, -11.0), dogs: P(-2.9, 1.55, -10.62),
  bears: P(-2.9, 1.45, -10.62), notword: P(-1.97, 1.55, -11.05), bought: P(FAIR + 0.1, 1.1, -1.0), stared: P(4.8, 1.5, -15.4), asked: P(0.4, 1.3, -19.4),
  ready: P(-0.95, 1.55, -19.4), fellow: P(-0.55, 1.3, -19.3), exam: P(HALL, 1.1, -3.2),
};
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  if (S.id === 'walk') return { focus: dist(C.pos, P(walkX(f) - 0.7, 0.9, WZ)), cinf: 5, near: 1 };
  const cinf = { year: 2, asked: 5, bought: 6, exam: f < 1080 ? 4 : 9, rules: 7, reread: 8 }[S.id] ?? 10;
  return { focus: dist(C.pos, FOCUS[S.id]), cinf, near: 1 };
};

// ---------- world state ----------
export const worldAt = (f) => {
  const S = shotAt(f), W = { helmet: null };
  W.signY = S.id === 'year' && f >= 128 ? -3 + 3 * back(ramp(f, 128, 146), 2.2) : -3;
  return W;
};

// ---------- actors ----------
const life = (f, seed) => { const i = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(i.bob, 3), tilt: q(i.tilt, 1), headTilt: q(i.headTilt, 1) }; };
const PER = (T, who, o, pos, extra = {}) => ({ key: 'bb' + who + JSON.stringify(o), draw: (p) => T.bbPerson(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const BEAR = (T, o, pos, extra = {}) => ({ key: 'bear' + JSON.stringify(o), draw: (p) => T.bbBear(p, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const BEARS = (T, o, pos, extra = {}) => ({ key: 'bears' + JSON.stringify(o), draw: (p) => T.bbBearSide(p, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const DOG = (T, o, pos, extra = {}) => ({ key: 'dog' + JSON.stringify(o), draw: (p) => T.bbDog(p, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
const bearLife = (f, seed) => ({ blink: blinkAt(f, seed), bob: q(0.01 * Math.sin((f + seed * 9) * 0.1), 3) });
const BEAR_S = 0.92, BEAR_SIDE_S = 0.95;
/** Byron's opts while walking (also used to find his hand for the chain) */
const byWalkOpts = (f) => { const moving = f < 724, st = moving ? q((f * 0.075) % 1, 2) : 0;
  return { ...life(f, 3), expr: f < 727 ? 'smile' : 'grin', facing: 0.55, look: 0.8, L: 'hang', R: 'leash', step: st, hold: { side: 1, item: 'chain' } }; };

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const per = (who, seed, o, pos, extra) => out.push(PER(T, who, { ...life(f, seed), ...o }, pos, extra));
  switch (S.id) {
    case 'hook': {
      const bear = f >= 74, slide = back(ramp(f, 74, 88), 1.6);
      per('byron', 3, { expr: f < 72 ? 'smug' : f < 92 ? 'grin' : 'smug', facing: f < 72 ? 0.2 : -0.25, look: f < 72 ? 0.5 : -0.7, L: f >= 80 ? 'point' : 'hip', R: f < 72 ? 'thumb' : 'hip' }, BY_H);
      if (bear) out.push(BEAR(T, { ...bearLife(f, 7), expr: f < 96 ? 'happy' : 'smug', L: 'hang', R: f >= 84 ? 'wave' : 'hang', wv: q(f * 0.5, 1), collar: true }, P(lerp(1.35, BEAR_H[0], slide), 0, BEAR_H[2]), { s: BEAR_S }));
      break;
    }
    case 'year': {
      const t = smooth(ramp(f, 132, 268)), x = lerp(-0.25, -0.85, t), z = lerp(-8.0, -12.8, t);
      per('byron', 3, { expr: 'smile', facing: 0.1, look: 0, L: 'hold', R: 'hang', step: f > 132 && f < 266 ? q((f * 0.07) % 1, 2) : 0, hold: { side: -1, item: 'books' } }, P(x, 0, z));
      break;
    }
    case 'animals': {
      per('byron', 3, { expr: f < 286 ? 'grin' : 'laugh', facing: 0.1, look: 0.2, L: 'belly', R: 'belly', headTilt: q(4 * Math.sin(f * 0.15), 1) }, P(6.72, 0, -18.2));
      out.push(DOG(T, { expr: 'happy', tongue: true, wag: q((f * 0.18) % 1, 2) }, P(6.62, 0.6, -17.92), { s: 0.48, blob: false }));
      break;
    }
    case 'rules': {
      per('don', 11, { expr: f < 377 ? 'stern' : 'stubborn', facing: -0.3, look: 0.7, L: 'hip', R: f >= 330 ? 'point' : 'hang', bob: f >= 377 && f < 395 ? q(0.01 * Math.sin(f * 1.2), 3) : 0 }, P(-1.98, 0, -10.95));
      break;
    }
    case 'reread': {
      const near = f >= 430;
      per('byron', 3, { expr: f < 430 ? 'neutral' : 'squint', facing: 0.35, look: 0.9, L: 'hang', R: near ? 'point' : 'hold', hold: { side: 1, item: 'magnifier' }, headTilt: near ? 5 : 0 }, BY_B);
      break;
    }
    case 'notword': {
      const sly = f >= 568;
      per('byron', 3, { expr: f < 560 ? 'squint' : sly ? 'smug' : 'neutral', facing: 0, look: sly ? -0.4 : 0.5, L: 'hang', R: sly ? 'cheek' : 'hold', hold: sly ? undefined : { side: 1, item: 'magnifier' }, headTilt: sly ? -5 : 3 }, BY_B);
      break;
    }
    case 'bought': {
      const paid = f >= 622;
      per('byron', 3, { expr: f < 610 ? 'smile' : 'grin', facing: 0.4, look: 0.8, L: 'hip', R: 'hold', hold: paid ? undefined : { side: 1, item: 'purse', t: q(ramp(f, 604, 618), 1) } }, P(FAIR - 0.82, 0, -1.0));
      per('showman', 21, { expr: paid ? 'laugh' : 'grin', facing: -0.4, look: -0.8, L: paid ? 'hold' : 'point', R: 'hip', hold: paid ? { side: -1, item: 'purse', t: 0 } : undefined }, P(FAIR + 0.95, 0, -1.25));
      out.push(BEAR(T, { ...bearLife(f, 7), pose: 'sit', expr: paid ? 'happy' : 'neutral', look: paid ? -0.6 : 0, bow: '#d8323a', L: 'hang', R: paid && f > 630 ? 'wave' : 'hang', wv: q(f * 0.5, 1) }, P(FAIR + 0.1, 0, -0.75), { s: 0.78 }));
      break;
    }
    case 'walk': {
      const sit = q(sitAt(f), 2), bx = walkX(f), st = f < 724 ? q((f * 0.05) % 1, 2) : 0;
      out.push(BEARS(T, { step: st, collar: true, tongue: f >= 734, expr: f >= 744 ? 'happy' : 'neutral', sit, blink: blinkAt(f, 7), wag: f >= 734 ? q(Math.sin(f * 0.9), 1) : 0 }, P(bx, 0, WZ), { s: BEAR_SIDE_S }));
      const o = byWalkOpts(f); per('byron', 3, o, P(byWalkX(f), 0, WZ));
      break;
    }
    case 'stared': {
      const drop = f >= 786;
      per('stu1', 31, { expr: f < 784 ? 'neutral' : 'shock', facing: -0.3, look: -0.9, L: drop ? 'up' : 'hold', R: drop ? 'up' : 'hang', hold: drop ? undefined : { side: -1, item: 'books' } }, P(4.1, 0, -15.2));
      per('stu2', 32, { expr: f < 788 ? 'neutral' : 'awe', facing: -0.2, look: -0.9, L: f >= 790 ? 'cheek' : 'hang', R: f >= 790 ? 'cheek' : 'hang' }, P(4.78, 0, -15.6));
      per('stu3', 33, { expr: f < 782 ? 'smile' : 'shock', facing: -0.4, look: -0.9, L: 'hang', R: 'hold', hold: { side: 1, item: 'book' }, tilt: f >= 782 ? -4 : 0 }, P(5.45, 0, -15.25));
      break;
    }
    case 'asked': {
      const inT = smooth(ramp(f, 813, 852)), stp = f < 852 ? q((f * 0.07) % 1, 2) : 0;
      per('byron', 3, { expr: f < 860 ? 'smile' : f < 896 ? 'nervous' : 'neutral', facing: 0.3, look: 0.8, L: 'hang', R: 'leash', hold: { side: 1, item: 'chain' } }, BY_A);
      out.push(BEAR(T, { ...bearLife(f, 7), pose: 'sit', expr: f < 876 ? 'happy' : 'neutral', look: 0.6, collar: true, L: 'hang', R: 'hang' }, BEAR_A, { s: 0.8 }));
      per('don', 11, { expr: f < 856 ? 'stern' : 'stubborn', facing: -0.4, look: -0.9, L: f >= 868 ? 'point' : 'hang', R: 'hip', step: stp }, P(lerp(2.7, 1.0, inT), 0, -19.6));
      per('don2', 12, { expr: f < 880 ? 'stern' : 'shock', facing: -0.4, look: -0.9, L: 'cross', R: 'cross', step: stp }, P(lerp(3.4, 1.72, inT), 0, -19.95));
      break;
    }
    case 'ready': {
      const up = f >= 934;
      per('byron', 3, { expr: f < 930 ? 'neutral' : 'smug', facing: -0.1, look: 0.4, L: 'hip', R: up ? 'up' : 'hang', headTilt: up ? -4 : 0 }, BY_A);
      break;
    }
    case 'fellow': {
      const drop = f >= 1003 ? back(ramp(f, 1003, 1016), 1.8) : 0;
      per('byron', 3, { expr: f < 1018 ? 'grin' : 'smug', facing: 0.3, look: 0.8, L: 'hip', R: 'point' }, BY_A);
      out.push(BEAR(T, { ...bearLife(f, 7), pose: 'sit', expr: f < 1000 ? 'neutral' : f < 1016 ? 'shock' : 'smug', look: f < 1000 ? -0.6 : 0, collar: true, mortar: q(drop, 2) || 0, L: 'hang', R: 'hang' }, BEAR_A, { s: 0.8 }));
      break;
    }
    case 'exam': {
      // students writing at the other desks, the invigilator watching the bear
      const writing = (seed) => ({ expr: 'squint', facing: 0, look: 0, L: 'hang', R: 'hold', hold: { side: 1, item: 'quill' }, headTilt: 6, tilt: 3 + q(Math.sin(f * 0.3 + seed) * 1.5, 0) });
      const stare = f >= 1096;
      const seat = (who, seed, x, z, o = {}) => per(who, seed, { ...writing(seed), ...(stare && o.stare ? { expr: 'awe', look: o.stare, headTilt: 0, tilt: 0 } : {}), ...o.base }, P(HALL + x, -0.1, z - 0.55), { blob: false, shadow: false });
      seat('stu2', 41, -2.3, -2.6, { stare: 0.9 }); seat('stu3', 42, 2.3, -2.6, { stare: -0.9 });
      seat('stu1', 43, -2.3, -5.0); seat('stu2', 45, 2.3, -5.0, { stare: -0.6 });
      seat('stu1', 46, -2.3, -7.4); seat('stu2', 47, 0, -7.4); seat('stu3', 48, 2.3, -7.4);
      per('don2', 12, { expr: f < 1110 ? 'stern' : 'shock', facing: -0.5, look: -0.9, L: 'cross', R: 'cross' }, P(HALL + 3.4, 0, -1.6));
      const chew = f < 1084, wink = f >= 1146;
      out.push(BEAR(T, { ...bearLife(f, 7), pose: 'sit', expr: chew ? 'chew' : wink ? 'wink' : f >= 1136 ? 'smug' : 'neutral', ch: q(f * 0.3, 1), look: f >= 1136 ? 0 : -0.3, mortar: 1, collar: true,
        L: 'hang', R: chew ? 'quill' : 'write' }, BEAR_X, { s: 0.78, blob: false }));
      break;
    }
  }
  return out;
};

// ---------- 2D effects ----------
/** a chain from world point A to world point B (both [x, y]) in the plane z */
const chainFx = (out, T, A, B, z, sag = 0.1) => {
  const s = q(Math.max(0.25, (Math.abs(B[0] - A[0]) + 0.05) / 1.08), 2), k = 0.00225 * s, cx = (A[0] + B[0]) / 2, y0 = Math.min(A[1], B[1]) - 0.5;
  const dx = (x) => q(300 + (x - cx) / k, 0), dy = (y) => q(975 - (y - y0) / k, 0), sg = q(sag / k, 0);
  const a = [dx(A[0]), dy(A[1])], b = [dx(B[0]), dy(B[1])];
  out.push(FX('ch' + a + b + sg + s, (p) => T.fxChain(p, a[0], a[1], b[0], b[1], sg), [cx, y0, z], s, { order: 6 }));
};
const handW = (T, opts, pos, side, pose) => { const [hx, hy] = T.bbHand('byron', side, pose, opts); return [pos[0] + (hx - 300) * 0.00225, pos[1] + (975 - hy) * 0.00225]; };
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  switch (S.id) {
    case 'animals': {
      if (f >= 280) { const t = q(((f - 280) / 34) % 1, 2); out.push(FX('ht' + t, (p) => T.fxHearts(p, t), P(6.7, 1.45, -17.85), 0.5)); }
      break;
    }
    case 'dogs': {
      const y = f < 470 ? lerp(L3, L2, smooth(ramp(f, 466, 470))) : L2, wob = q(f * 0.1, 1);
      out.push(FX('mg' + q(y, 2) + wob, (p) => T.fxMagnifier(p, wob), P(LX + 0.02, q(y - 0.375, 3), BOARD.z - 0.06), 0.3, { order: 6 }));
      if (f >= 500) { const t = q(ramp(f, 500, 524) * 0.8, 2); out.push(FX('stp' + t, (p) => T.fxStamp(p, 'BANNED', t), P(-2.9, 1.16, BOARD.z - 0.08), 0.42, { order: 7 })); }
      break;
    }
    case 'bears': {
      const k = smooth(ramp(f, 525, 541)), y = f < 541 ? lerp(L2 - 0.1, L4 - 0.05, k) : L4 - 0.05 + 0.03 * Math.sin((f - 541) * 0.8), x = LX + 0.12 * Math.sin(f * 0.45), wob = q(f * 0.1, 1);
      out.push(FX('mgb' + q(x, 2) + q(y, 2) + wob, (p) => T.fxMagnifier(p, wob), P(q(x, 2), q(y - 0.375, 3), BOARD.z - 0.06), 0.3, { order: 6 }));
      if (f >= 530) { const t = q(ramp(f, 530, 551), 2); out.push(FX('qm' + t, (p) => T.fxWord(p, '?', Math.min(0.6, t), '#ffd84a', 300, 0.1), P(-2.7, 1.42, BOARD.z - 0.1), 0.28, { order: 7 })); }
      break;
    }
    case 'notword': {
      if (f >= 572) { const t = q(ramp(f, 572, 596), 2); out.push(FX('bulb' + t, (p) => T.fxBulb(p, t), P(BY_B[0] - 0.02, 1.62, BY_B[2] + 0.05), 0.3)); }
      break;
    }
    case 'bought': {
      if (f >= 608 && f < 632) { const t = q(ramp(f, 608, 632), 2); out.push(FX('cn' + t, (p) => T.fxCoins(p, t), P(FAIR + 0.05, 0.4, -0.9), 0.75)); }
      if (f >= 626) { const t = q(ramp(f, 626, 655), 2); out.push(FX('sold' + t, (p) => T.fxWord(p, 'SOLD!', Math.min(0.6, t), '#ffd84a', 140, -0.1), P(FAIR + 0.1, 1.05, -0.6), 0.75)); }
      break;
    }
    case 'walk': {
      const o = byWalkOpts(f), bx = walkX(f), sit = sitAt(f);
      const A = handW(T, o, P(byWalkX(f), 0, WZ), 1, 'leash');
      const B = [bx + (T.BEAR_COLLAR[0] - 20 * sit - 300) * 0.00225 * BEAR_SIDE_S, (975 - (T.BEAR_COLLAR[1] - 70 * sit)) * 0.00225 * BEAR_SIDE_S];
      chainFx(out, T, A, B, WZ + 0.03, 0.1 + 0.08 * sit);
      if (f >= 744) { const t = q(((f - 744) / 30) % 1, 2); out.push(FX('wh' + t, (p) => T.fxHearts(p, t), P(bx + 0.25, 0.9, WZ + 0.05), 0.4)); }
      break;
    }
    case 'stared': {
      if (f >= 786 && f < 812) { const t = q(ramp(f, 786, 812), 2); out.push(FX('bk' + t, (p) => T.fxBooks(p, t), P(3.92, 0.1, -15.1), 0.45)); }
      if (f >= 790) { const t = q(ramp(f, 790, 812), 2); out.push(FX('ex' + t, (p) => T.fxWord(p, '!!', Math.min(0.6, t), '#ffffff', 170, 0.08), P(4.78, 1.55, -15.5), 0.5)); }
      break;
    }
    case 'asked': {
      const A = handW(T, { ...life(f, 3), facing: 0.3, L: 'hang', R: 'leash' }, BY_A, 1, 'leash');
      chainFx(out, T, A, [BEAR_A[0], 0.81], BY_A[2] + 0.1, 0.14);
      if (f >= 876) { const t = q(ramp(f, 876, 925), 2); out.push(FX('qq' + t, (p) => T.fxQuery(p, t), P(0.5, 1.45, -19.7), 0.42)); }
      break;
    }
    case 'ready': {
      if (f >= 940 && f < 962) { const t = q(ramp(f, 940, 962), 2); out.push(FX('tw' + t, (p) => T.fxTwinkle(p, t), P(BY_A[0] + 0.06, 1.22, BY_A[2] + 0.1), 0.18)); }
      break;
    }
    case 'fellow': {
      if (f >= 1016 && f < 1040) { const t = q(ramp(f, 1016, 1040), 2); out.push(FX('st' + t, (p) => T.fxStars(p, t), P(BEAR_A[0], 1.05, BEAR_A[2] + 0.1), 0.55)); }
      break;
    }
    case 'exam': {
      if (f >= 1146 && f < 1168) { const t = q(ramp(f, 1146, 1168), 2); out.push(FX('tw' + t, (p) => T.fxTwinkle(p, t), P(BEAR_X[0] + 0.12, 0.95, BEAR_X[2] + 0.1), 0.2)); }
      break;
    }
  }
  return out;
};
