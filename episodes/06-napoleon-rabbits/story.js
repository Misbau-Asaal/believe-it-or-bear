// "Napoleon Lost a Battle to Rabbits" — shot plan timed to the Kokoro am_michael voice (47.16 s, 30 fps, 1415 frames; end card added after)
// Phrase frames: 5-56 "Napoleon conquered half of Europe." | 68-119 "Then he lost a battle to bunnies." | 140-203 "Legend says that in 1807," |
// 216-256 "to celebrate a peace treaty," | 268-305 "he wanted a rabbit hunt." | 330-370 "His chief of staff, Berthier," | 381-432 "rounded up hundreds of rabbits." |
// 453-487 "The hunters took aim." | 501-534 "The cages opened." | 555-599 "But the rabbits didn't run away." | 612-654 "They ran straight at Napoleon." |
// 676-730 "Nobody had caught wild rabbits." | 742-796 "They'd bought tame ones from farmers." | 816-849 "And these were hungry." | 861-904 "To them, people meant dinner." |
// 924-990 "They swarmed his boots and climbed his legs." | 1002-1038 "His men swung sticks." | 1051-1092 "The coachmen cracked whips." |
// 1113-1205 "Then the rabbits split in two and came around both sides." | 1226-1279 "Napoleon ran for his carriage." | 1299-1348 "The greatest general of his age," | 1358-1395 "outflanked by bunnies."
import { M, camFromKeys, idle, blinkAt, lerp, lerp3, ramp, clamp, q } from './motion.js';
export const FPS = 30, TOTAL = 1415;
export const SHOTS = [
  { id: 'hook', a: 0, b: 127, light: 'meadow' },
  { id: 'year', a: 128, b: 322, light: 'tent' },
  { id: 'berthier', a: 323, b: 450, light: 'meadow' },
  { id: 'aim', a: 451, b: 500, light: 'meadow' },
  { id: 'open', a: 501, b: 554, light: 'meadow' },
  { id: 'stream', a: 555, b: 610, light: 'meadow' },
  { id: 'charge', a: 611, b: 675, light: 'panic' },
  { id: 'wild', a: 676, b: 738, light: 'farm' },
  { id: 'farm', a: 739, b: 806, light: 'farm' },
  { id: 'hungry', a: 807, b: 905, light: 'meadow' },
  { id: 'swarm', a: 906, b: 1000, light: 'panic' },
  { id: 'sticks', a: 1001, b: 1050, light: 'panic' },
  { id: 'whips', a: 1051, b: 1112, light: 'panic' },
  { id: 'flank', a: 1113, b: 1225, light: 'high' },
  { id: 'run', a: 1226, b: 1298, light: 'panic' },
  { id: 'away', a: 1299, b: 1352, light: 'meadow' },
  { id: 'final', a: 1353, b: 1414, light: 'sting' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const { smooth, back, easeOut, easeIn } = M;

// ---------- lights ----------
const base = { fogNear: 120, fogFar: 1300, sat: 1.12, glint: '#effaff', waterDeep: '#2c6c8c', waterShal: '#5aaec4', vig: 0.22, shadowExt: 12 };
export const LIGHTS = {
  meadow: { ...base, az: 140, el: 52, sky: '#cfe4f6', ground: '#7a9a4a', hemi: 1.2, sun: '#fff4dc', sunI: 2.5, fog: '#dbe8f0', skyTop: '#2f7ad8', skyHor: '#cfe4f4', gain: '#fff8ec' },
  tent: { ...base, az: 120, el: 48, sky: '#f0e4cc', ground: '#8a7a4a', hemi: 1.3, sun: '#fff0d4', sunI: 2.3, fog: '#e8e0cc', skyTop: '#3f86d8', skyHor: '#e6e6dc', gain: '#fff4e4', shadowExt: 8 },
  farm: { ...base, az: 110, el: 38, sky: '#f4e2c4', ground: '#8a7a4a', hemi: 1.2, sun: '#ffe6bc', sunI: 2.5, fog: '#f0e0c4', skyTop: '#4a8ad8', skyHor: '#f4e2c8', gain: '#fff0dc', shadowExt: 10 },
  panic: { ...base, az: 140, el: 52, sky: '#d8e4f0', ground: '#7a9a4a', hemi: 1.15, sun: '#fff0d6', sunI: 2.4, fog: '#dbe4ec', skyTop: '#3a7ad0', skyHor: '#d8e4f0', gain: '#fff6ea', sat: 1.18, vig: 0.32, shadowExt: 10 },
  high: { ...base, az: 140, el: 58, sky: '#cfe4f6', ground: '#7a9a4a', hemi: 1.2, sun: '#fff4dc', sunI: 2.5, fog: '#dbe8f0', skyTop: '#2f7ad8', skyHor: '#cfe4f4', gain: '#fff8ec', shadowExt: 16 },
  sting: { ...base, az: 140, el: 40, sky: '#e6dcd0', ground: '#7a8a4a', hemi: 1.1, sun: '#ffe6c4', sunI: 2.3, fog: '#e4dcd4', skyTop: '#4a74b8', skyHor: '#e8dcd0', gain: '#fff2e4', vig: 0.4, shadowExt: 8 },
};
export const lightFor = (S, f) => ({ ...LIGHTS[S.light] });

// ---------- places and paths ----------
const P = (x, y, z) => [x, y, z];
const TENT = [-16, -4], NT = P(-16.1, 0, -4.75), FARM = 40, BURROW = [33.5, 1.5];
const CRATES = [-2.75, -1.65, -0.55, 0.55, 1.65, 2.75];
const PARTY = { berthier: P(-1.15, 0, 0.6), hunter: P(-2.05, 0, 0.25), hunter2: P(1.2, 0, 0.35), hunter3: P(2.1, 0, 0.6) };
const COACH0 = [5.0, 3.6], DOOR = [4.7, 2.7];
const napAt = (f) => { const t = smooth(ramp(f, 1228, 1266)); return [lerp(0, DOOR[0], t), lerp(0, DOOR[1], t)]; };
const coachX = (f) => COACH0[0] + 10 * Math.pow(ramp(f, 1300, 1414), 2);
const coachV = (f) => (coachX(f + 1) - coachX(f));
const HATB = P(-0.42, 0, 0.55);                                        // where the rabbit with Napoleon's hat sits after the swarm

// ---------- cameras ----------
const CAMS = {
  hook: [{ f: 0, pos: P(0.2, 1.55, 2.9), look: P(0.05, 1.45, 0), fov: 40 }, { f: 70, pos: P(0.2, 1.55, 2.8), look: P(0.05, 1.45, 0), fov: 39 },
    { f: 92, pos: P(0.25, 1.15, 3.5), look: P(0.05, 0.95, 0), fov: 50, ease: 'easeOut' }, { f: 127, pos: P(0.25, 1.12, 3.65), look: P(0.05, 0.92, 0), fov: 51 }],
  year: [{ f: 128, pos: P(-15.7, 1.5, -0.9), look: P(-15.75, 1.32, -4.6), fov: 50 }, { f: 260, pos: P(-15.8, 1.5, -1.3), look: P(-15.85, 1.4, -4.6), fov: 46 },
    { f: 272, pos: P(-16.05, 1.55, -2.7), look: P(-16.1, 1.5, -4.75), fov: 42, ease: 'easeOut' }, { f: 322, pos: P(-16.05, 1.55, -3.0), look: P(-16.1, 1.52, -4.75), fov: 40 }],
  berthier: [{ f: 323, pos: P(-1.2, 1.5, -2.6), look: P(-1.45, 1.4, -5.4), fov: 42 }, { f: 374, pos: P(-1.15, 1.48, -2.75), look: P(-1.45, 1.38, -5.4), fov: 41 },
    { f: 410, pos: P(0.2, 1.0, -4.0), look: P(0.1, 0.45, -7.0), fov: 50 }, { f: 450, pos: P(0.9, 1.0, -4.3), look: P(0.8, 0.42, -7.0), fov: 48 }],
  aim: [{ f: 451, pos: P(3.9, 1.35, 3.3), look: P(0.5, 1.1, -0.7), fov: 50 }, { f: 500, pos: P(3.7, 1.33, 3.1), look: P(0.5, 1.1, -0.7), fov: 48 }],
  open: [{ f: 501, pos: P(0.15, 0.62, -4.4), look: P(0.0, 0.35, -7.0), fov: 46 }, { f: 554, pos: P(0.15, 0.58, -4.1), look: P(0.0, 0.35, -7.0), fov: 50 }],
  stream: [{ f: 555, pos: P(0.4, 1.7, -9.6), look: P(0.0, 0.7, -2.5), fov: 48 }, { f: 610, pos: P(0.3, 1.6, -9.0), look: P(0.0, 0.75, -2.0), fov: 46 }],
  charge: [{ f: 611, pos: P(0.35, 0.45, -2.6), look: P(0.05, 1.0, 0.0), fov: 50 }, { f: 675, pos: P(0.3, 0.42, -2.3), look: P(0.05, 1.05, 0.0), fov: 48, roll: -3 }],
  wild: [{ f: 676, pos: P(33.7, 0.55, 3.4), look: P(33.5, 0.35, 1.5), fov: 42 }, { f: 738, pos: P(33.68, 0.5, 3.2), look: P(33.5, 0.33, 1.5), fov: 40 }],
  farm: [{ f: 739, pos: P(FARM - 0.05, 1.4, 4.4), look: P(FARM - 0.05, 1.05, -1.0), fov: 56 }, { f: 806, pos: P(FARM - 0.05, 1.38, 4.1), look: P(FARM - 0.05, 1.05, -1.0), fov: 54 }],
  hungry: [{ f: 807, pos: P(3.75, 0.42, -1.1), look: P(3.6, 0.4, -2.2), fov: 44 }, { f: 860, pos: P(3.74, 0.44, -1.25), look: P(3.6, 0.42, -2.2), fov: 42 },
    { f: 872, pos: P(3.72, 0.55, -0.85), look: P(3.55, 0.55, -2.2), fov: 50, ease: 'easeOut' }, { f: 905, pos: P(3.72, 0.55, -0.95), look: P(3.55, 0.56, -2.2), fov: 49 }],
  swarm: [{ f: 906, pos: P(0.15, 1.15, 2.6), look: P(0.0, 0.95, 0.0), fov: 48 }, { f: 1000, pos: P(0.12, 1.25, 2.4), look: P(0.0, 1.1, 0.0), fov: 46, roll: 2 }],
  sticks: [{ f: 1001, pos: P(0.0, 1.35, 3.5), look: P(0.0, 1.05, 0.3), fov: 54 }, { f: 1050, pos: P(0.05, 1.35, 3.3), look: P(0.0, 1.05, 0.3), fov: 52, roll: -2 }],
  whips: [{ f: 1051, pos: P(5.6, 1.8, 0.7), look: P(6.2, 1.9, 3.6), fov: 46 }, { f: 1112, pos: P(5.65, 1.8, 0.95), look: P(6.2, 1.95, 3.6), fov: 44 }],
  flank: [{ f: 1113, pos: P(1.0, 9.0, -6.6), look: P(1.0, 0, 1.1), fov: 56 }, { f: 1225, pos: P(1.0, 10.2, -7.4), look: P(1.1, 0, 1.4), fov: 57 }],
  run: [{ f: 1226, pos: P(0.9, 1.4, -2.6), look: P(1.0, 1.0, 0.8), fov: 52 }, { f: 1268, pos: P(3.4, 1.4, -1.5), look: P(4.5, 1.2, 2.6), fov: 50 }, { f: 1298, pos: P(3.5, 1.4, -1.3), look: P(4.7, 1.3, 2.8), fov: 49 }],
  away: [{ f: 1299, pos: P(7.0, 1.0, -3.0), look: P(5.8, 1.1, 3.4), fov: 54 }, { f: 1352, pos: P(7.8, 1.0, -2.9), look: P(7.3, 1.1, 3.4), fov: 52 }],
  final: [{ f: 1353, pos: P(1.25, 0.46, 1.05), look: P(2.4, 0.42, 0.95), fov: 44 }, { f: 1414, pos: P(1.55, 0.44, 1.0), look: P(2.4, 0.42, 0.95), fov: 38, roll: 3 }],
};
const KICKS = [{ f: 506, a: 0.01 }, { f: 642, a: 0.015 }, { f: 988, a: 0.02 }, { f: 1060, a: 0.012 }, { f: 1082, a: 0.012 }];
export const camAt = (f) => {
  const S = shotAt(f), c = camFromKeys(CAMS[S.id], f, { creep: 0.0008, kicks: KICKS });
  c.flash = 0;
  for (const [a, k] of [[128, 0.5], [676, 0.45], [807, 0.3], [1353, 0.3]]) if (f >= a && f < a + 5) c.flash = k * (1 - (f - a) / 5);
  if (S.id === 'flank') c.shadowAt = P(1, 0, 1);
  if (S.id === 'stream') c.shadowAt = P(0, 0, -4);
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOCUS = {
  hook: P(0, 1.4, 0), year: P(-16.1, 1.4, -4.75), berthier: P(-1.45, 1.4, -5.4), aim: P(0, 1.2, 0), open: P(0, 0.35, -6.9), stream: P(0, 0.6, -3.5), charge: P(0, 1.1, 0),
  wild: P(33.5, 0.3, 1.6), farm: P(FARM, 1.0, -0.5), hungry: P(3.6, 0.4, -2.2), swarm: P(0, 1.0, 0.1), sticks: P(0, 1.1, 0.4), whips: P(6.2, 1.9, 3.6), flank: P(1, 0, 1),
  run: P(3, 1, 1.8), away: P(7, 1.2, 3.6), final: P(2.4, 0.4, 0.95),
};
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  if (S.id === 'run') { const n = napAt(f); return { focus: dist(C.pos, P(n[0], 1.0, n[1])), cinf: 5, near: 1 }; }
  const cinf = { flank: 0, stream: 3, aim: 4, farm: 5, away: 4, hungry: 11, final: 11 }[S.id] ?? 8;
  return { focus: dist(C.pos, FOCUS[S.id]), cinf, near: 1 };
};

// ---------- world state ----------
export const worldAt = (f) => {
  const S = shotAt(f), W = { helmet: null };
  W.signY = S.id === 'year' && f >= 166 ? 4.2 - 1.8 * back(ramp(f, 166, 180), 2.0) : 4.2;
  W.doors = Math.min(1, back(ramp(f, 505, 516), 1.4));
  W.rabRelease = 508; W.flank = [1110, 1225]; W.nap = napAt(f);
  W.coach = [coachX(f), COACH0[1]]; W.coachV = coachV(f); W.coachMoving = f >= 1300;
  W.hideRabbits = S.id === 'year' || S.id === 'wild' || S.id === 'farm';
  W.hideFlag2 = S.id === 'run';
  return W;
};

// ---------- actors ----------
const life = (f, seed) => { const i = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(i.bob, 3), tilt: q(i.tilt, 1), headTilt: q(i.headTilt, 1) }; };
const PER = (T, who, o, pos, extra = {}) => ({ key: 'bb' + who + JSON.stringify(o), draw: (p) => T.bbPerson(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const BUN = (T, o, pos, s, extra = {}) => ({ key: 'bun' + JSON.stringify(o), draw: (p) => T.bunny(p, o), x: pos[0], y: pos[1], z: pos[2], s, ...extra });
const BUNS = (T, o, pos, s, extra = {}) => ({ key: 'buns' + JSON.stringify(o), draw: (p) => T.bunnySide(p, o), x: pos[0], y: pos[1], z: pos[2], s, ...extra });
const HORSE = (T, o, pos, s, extra = {}) => ({ key: 'hrs' + JSON.stringify(o), draw: (p) => T.horseSide(p, o), x: pos[0], y: pos[1], z: pos[2], s, ...extra });
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
const bl = (f, seed) => blinkAt(f, seed);
const COLS = ['white', 'brown', 'grey', 'spot', 'black', 'white'];

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const per = (who, seed, o, pos, extra) => out.push(PER(T, who, { ...life(f, seed), ...o }, pos, extra));
  const party = (o = {}) => {        // the hunting party around Napoleon
    for (const [who, seed] of [['berthier', 12], ['hunter', 21], ['hunter2', 22], ['hunter3', 23]]) per(who, seed, { expr: 'neutral', facing: 0, look: 0, L: 'hang', R: 'hold', hold: { side: 1, item: 'musket' }, ...(o[who] || o.all || {}) }, PARTY[who]);
  };
  const horses = () => { const x = coachX(f), moving = f >= 1300, ph = moving ? q((f * 0.09) % 1, 2) : 0;
    out.push(HORSE(T, { ph }, P(x + 2.65, 0, COACH0[1] - 0.32), 1.35)); out.push(HORSE(T, { ph: q((ph + 0.5) % 1, 2), col: '#3a2a22' }, P(x + 2.7, 0, COACH0[1] + 0.34), 1.35)); };
  switch (S.id) {
    case 'hook': {
      const shocked = f >= 96;
      per('napoleon', 3, { expr: shocked ? 'shock' : 'proud', facing: 0, look: shocked ? -0.3 : 0, L: shocked ? 'hip' : 'hang', R: shocked ? 'hang' : 'pocket', headTilt: shocked ? 5 : 0 }, P(0, 0, 0));
      [[-0.55, 0.75, 72], [0.5, 0.85, 78], [0.95, 0.45, 84], [-1.0, 0.35, 90]].forEach(([x, z, t0], i) => { if (f < t0) return;
        const k = back(ramp(f, t0, t0 + 8), 1.8); out.push(BUN(T, { col: COLS[i], expr: f > t0 + 14 ? 'hungry' : 'neutral', blink: bl(f, i + 4), look: -x }, P(x, -0.7 * (1 - k), z), 0.27, { blob: k > 0.9 })); });
      break;
    }
    case 'year': {
      const sign = f < 214, cheer = f >= 214 && f < 262;
      per('napoleon', 3, { expr: sign ? 'squint' : cheer ? 'grin' : 'smug', facing: 0, look: 0, L: f >= 262 ? 'hip' : 'hang', R: sign ? 'hold' : cheer ? 'up' : 'hold',
        hold: sign ? { side: 1, item: 'quill' } : cheer ? { side: 1, item: 'paper' } : { side: 1, item: 'musket' }, headTilt: sign ? 8 : 0 }, NT, { blob: false });
      break;
    }
    case 'berthier': {
      per('berthier', 12, { expr: 'grin', facing: 0.2, look: 0.3, L: 'hip', R: f >= 332 && f < 372 ? 'up' : 'hang' }, P(-1.5, 0, -5.4));
      CRATES.forEach((x, i) => out.push(BUN(T, { col: COLS[i], expr: i % 2 ? 'happy' : 'neutral', blink: bl(f, i + 3), look: q(Math.sin(f * 0.05 + i), 1) }, P(x + 0.04, 0.45 + 0.03 * Math.sin(f * 0.2 + i), -7.08), 0.2, { blob: false })));
      break;
    }
    case 'aim': {
      per('napoleon', 3, { expr: 'squint', facing: 0.4, look: 0.8, L: 'hang', R: 'hold', hold: { side: 1, item: 'musket', aim: true } }, P(0, 0, 0));
      party({ all: { expr: 'squint', facing: 0.4, look: 0.8, R: 'hold', hold: { side: 1, item: 'musket', aim: true } }, berthier: { expr: 'grin', facing: 0.4, look: 0.8, L: 'hip', R: 'hang' } });
      break;
    }
    case 'open': {
      CRATES.forEach((x, i) => { const go = ramp(f, 520 + i * 3, 554), z = lerp(-7.08, -4.9, go), hop = Math.abs(Math.sin((f + i * 7) * 0.45)) * (go > 0 && go < 1 ? 1 : 0);
        out.push(BUN(T, { col: COLS[i], expr: f < 512 ? 'neutral' : 'hungry', blink: bl(f, i + 3), hop: q(hop, 1) }, P(x + 0.04, f < 512 ? 0.45 : 0.06 + hop * 0.12, z), 0.2, { blob: f >= 512 })); });
      break;
    }
    case 'stream': {
      per('napoleon', 3, { expr: f < 585 ? 'neutral' : 'awe', facing: 0, look: 0, L: 'hang', R: 'hold', hold: { side: 1, item: 'musket', aim: f < 585 } }, P(0, 0, 0));
      party({ all: { expr: f < 588 ? 'squint' : 'shock', R: 'hold', hold: { side: 1, item: 'musket', aim: f < 590 } } });
      break;
    }
    case 'charge': {
      const sh = f >= 640;
      per('napoleon', 3, { expr: sh ? 'shock' : 'neutral', facing: 0, look: 0, L: sh ? 'up' : 'hang', R: sh ? 'up' : 'hang', tilt: sh ? q(3 * Math.sin(f * 0.6), 1) : 0 }, P(0, 0, 0));
      break;
    }
    case 'wild': {
      const up = back(ramp(f, 684, 694), 1.6), down = easeIn(ramp(f, 718, 726)), y = -0.62 * (1 - up) - 0.62 * down;
      if (f >= 684 && down < 1) out.push(BUN(T, { col: 'brown', expr: f < 712 ? 'neutral' : 'shock', look: f < 712 ? Math.sin(f * 0.25) : 0, blink: bl(f, 9) }, P(BURROW[0], y, BURROW[1] + 0.12), 0.28, { blob: false }));
      break;
    }
    case 'farm': {
      per('farmer', 31, { expr: f < 770 ? 'grin' : 'laugh', facing: -0.3, look: -0.8, L: 'belly', R: 'belly' }, P(FARM + 0.95, 0, -0.5));
      out.push(BUN(T, { col: 'white', expr: 'happy', blink: bl(f, 5) }, P(FARM + 0.92, 0.62, -0.28), 0.2, { blob: false }));
      per('hunter3', 23, { expr: 'grin', facing: 0.4, look: 0.8, L: 'hang', R: 'hold', hold: f < 776 ? { side: 1, item: 'purse', t: 0 } : undefined }, P(FARM - 1.05, 0, -0.4));
      for (let row = 0; row < 2; row++) for (let i = 0; i < 3; i++) out.push(BUN(T, { col: COLS[(i + row * 3) % 6], expr: (i + row) % 2 ? 'happy' : 'neutral', blink: bl(f, i + row * 3 + 1) }, P(FARM - 1.2 + i * 0.95, 0.53 + row * 0.62, -1.25), 0.16, { blob: false, shadow: false }));
      break;
    }
    case 'hungry': {
      const hungry = f >= 836;
      out.push(BUN(T, { col: 'white', expr: hungry ? 'hungry' : 'neutral', drool: f >= 846, blink: hungry ? 0 : bl(f, 6), look: hungry ? -0.4 : 0 }, P(3.6, 0, -2.2), 0.3));
      break;
    }
    case 'swarm': {
      const hatOff = f >= 988;
      per('napoleon', 3, { expr: f < 950 ? 'shock' : 'pained', facing: 0, look: q(Math.sin(f * 0.3), 1), L: (f >> 3) % 2 ? 'up' : 'hip', R: (f >> 3) % 2 ? 'hip' : 'up', tilt: q(4 * Math.sin(f * 0.5), 1), hat: !hatOff }, P(0, 0, 0));
      out.push(BUN(T, { col: 'brown', expr: 'hungry', blink: bl(f, 2), hop: q(Math.abs(Math.sin(f * 0.4)), 1) }, P(-0.2, 0, 0.16), 0.22));
      const climb = ramp(f, 930, 975); out.push(BUN(T, { col: 'grey', expr: 'fierce', blink: bl(f, 3) }, P(0.22, 0.1 + 0.5 * climb, 0.15), 0.2, { blob: false }));
      // a rabbit hops up onto his hat, knocks it off, and ends up wearing it
      if (f >= 966) { const up = back(ramp(f, 966, 978), 1.4), fall = easeIn(ramp(f, 990, 999)); const y = lerp(0.3, 1.86, up) * (1 - fall);
        out.push(BUN(T, { col: 'white', expr: hatOff ? 'happy' : 'fierce', bicorne: hatOff, blink: bl(f, 8) }, P(lerp(0.3, -0.05, up) + fall * -0.35, y, 0.06 + fall * 0.4), 0.2, { blob: fall > 0.9 })); }
      break;
    }
    case 'sticks': {
      per('napoleon', 3, { expr: 'pained', facing: 0, look: 0, L: 'up', R: 'up', tilt: q(3 * Math.sin(f * 0.6), 1), hat: false }, P(0, 0, 0));
      const sw = (k) => ((f + k) >> 3) % 2;
      per('hunter', 21, { expr: 'stubborn', facing: 0.4, look: 0.6, L: 'hang', R: sw(0) ? 'up' : 'point', hold: { side: 1, item: 'stick' } }, P(-0.88, 0, 0.45));
      per('hunter2', 22, { expr: 'stubborn', facing: -0.4, look: -0.6, L: sw(4) ? 'up' : 'point', R: 'hang', hold: { side: -1, item: 'stick' } }, P(0.9, 0, 0.5));
      out.push(BUN(T, { col: 'white', expr: 'smug', bicorne: true, blink: bl(f, 8) }, HATB, 0.2));
      break;
    }
    case 'whips': {
      const t = ((f - 1051) % 22) / 22;
      per('coachman', 41, { expr: 'stern', facing: -0.2, look: -0.6, L: 'hang', R: 'up', hold: { side: 1, item: 'whip', t: q(t, 1) } }, P(6.25, 1.0, COACH0[1] + 0.02), { blob: false, shadow: false });
      horses();
      break;
    }
    case 'flank': {
      per('napoleon', 3, { expr: 'shock', facing: 0, look: 0, L: 'up', R: 'up', hat: false }, P(0, 0, 0));
      party({ all: { expr: 'shock', L: 'up', R: 'up', hold: undefined } });
      out.push(BUN(T, { col: 'white', expr: 'smug', bicorne: true, blink: bl(f, 8) }, HATB, 0.2));
      horses();
      break;
    }
    case 'run': {
      const n = napAt(f), inCoach = f >= 1270;
      if (!inCoach) per('napoleon', 3, { expr: 'shock', facing: 0.6, look: 0.9, L: 'up', R: 'up', step: f >= 1228 ? q((f * 0.11) % 1, 2) : 0, hat: false, tilt: 6 }, P(n[0], 0, n[1]));
      party({ all: { expr: 'shock', L: 'up', R: 'up', hold: undefined } });
      out.push(BUN(T, { col: 'white', expr: 'smug', bicorne: true, blink: bl(f, 8) }, HATB, 0.2));
      horses();
      break;
    }
    case 'away': {
      horses();
      out.push(BUN(T, { col: 'white', expr: 'neutral', bicorne: true, look: 1, blink: bl(f, 8) }, P(2.4, 0, 0.95), 0.32));
      break;
    }
    case 'final': {
      horses();
      const turn = f >= 1372;
      out.push(BUN(T, { col: 'white', expr: turn ? 'smug' : 'neutral', bicorne: true, chest: turn, look: turn ? 0 : 1, blink: turn ? 0 : bl(f, 8) }, P(2.4, 0, 0.95), 0.32));
      break;
    }
  }
  return out;
};

// ---------- 2D effects ----------
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  switch (S.id) {
    case 'hook': if (f >= 98) { const t = q(ramp(f, 98, 127), 2); out.push(FX('q' + t, (p) => T.fxQuery(p, t), P(0.35, 1.75, 0.1), 0.25)); } break;
    case 'charge': if (f >= 642) { const t = q(ramp(f, 642, 675), 2); out.push(FX('q' + t, (p) => T.fxQuery(p, t), P(0.45, 1.85, 0.1), 0.32)); } break;
    case 'wild': if (f >= 700 && f < 718) { const t = q(ramp(f, 700, 718), 2); out.push(FX('wq' + t, (p) => T.fxWord(p, '?', Math.min(0.6, t), '#ffd84a', 300, 0.1), P(BURROW[0] + 0.2, 0.32, BURROW[1] + 0.15), 0.2)); }
      if (f >= 720) { const k = q(ramp(f, 720, 738), 2); out.push(FX('dp' + k, (p) => T.fxDustPuff(p, k), P(BURROW[0], -0.1, BURROW[1] + 0.2), 0.3)); } break;
    case 'hungry':
      if (f >= 816 && f < 852) { const t = q(((f - 816) / 12) % 1, 2); out.push(FX('rb' + t, (p) => T.fxRumble(p, t), P(3.6, -0.02, -2.15), 0.3)); }
      if (f >= 862) { const t = q(ramp(f, 862, 905), 2); out.push(FX('ct' + t, (p) => T.fxCarrotThought(p, t), P(3.45, 0.55, -2.25), 0.32, { order: 6 })); }
      break;
    case 'swarm': if (f >= 930) { const t = q(((f - 930) / 20) % 1, 2); out.push(FX('sw' + t, (p) => T.fxSweat(p, t), P(0, 1.25, 0.08), 0.32)); } break;
    case 'whips': for (const t0 of [1060, 1082]) if (f >= t0 && f < t0 + 14) { const t = q(ramp(f, t0, t0 + 14), 2); out.push(FX('cr' + t0 + t, (p) => T.fxCrack(p, t), P(5.78, 2.3, COACH0[1] - 0.3), 0.33, { order: 7 })); } break;
    case 'run': if (f >= 1230 && f < 1268) { const n = napAt(f), k = q(((f - 1230) / 10) % 1, 2); out.push(FX('rp' + k, (p) => T.fxDustPuff(p, k), P(n[0] - 0.35, -0.05, n[1] - 0.1), 0.25)); } break;
    case 'final': if (f >= 1394 && f < 1412) { const t = q(ramp(f, 1394, 1412), 2); out.push(FX('tw' + t, (p) => T.fxTwinkle(p, t), P(2.47, 0.5, 1.0), 0.12)); } break;
  }
  return out;
};
