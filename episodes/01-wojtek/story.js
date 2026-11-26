// "The Bear Who Became a Corporal" (Wojtek) — shot plan timed to the Kokoro am_michael voice (39.94 s, 30 fps, 1198 frames)
// Phrase frames: 5-47 "The Polish army had a bear." | 59-87 "And the bear had a rank." | 113-147 "In nineteen forty-two," |
// 159-227 "soldiers found an orphaned cub in Iran." | 240-269 "They adopted him." | 281-318 "They named him Wojtek." |
// 339-411 "He grew up wrestling the men and sharing their camp." | 436-465 "Then came an order:" | 475-522 "no pets on the transport ship." |
// 544-590 "So the soldiers enlisted him." | 602-648 "Private Wojtek got a paybook," | 657-688 "and a seat on the boat." | 709-743 "At Monte Cassino," |
// 753-804 "the men hauled heavy crates of shells." | 822-845 "Wojtek watched," | 849-884 "stood up, and joined in." | 897-924 "By every account," |
// 931-961 "he never dropped one." | 982-1037 "The army promoted him to corporal." | 1059-1098 "The rule said no pets." | 1110-1179 "Nobody had written a rule about corporals."
import { M, camFromKeys, idle, blinkAt, lerp, lerp3, ramp, clamp, q } from './motion.js';
export const FPS = 30, TOTAL = 1198;
export const SHOTS = [
  { id: 'hook', a: 0, b: 110, light: 'desert' },
  { id: 'cub', a: 111, b: 235, light: 'desert' },
  { id: 'adopt', a: 236, b: 275, light: 'desert' },
  { id: 'name', a: 276, b: 335, light: 'desert' },
  { id: 'wrestle', a: 336, b: 385, light: 'desert' },
  { id: 'camp', a: 386, b: 433, light: 'dusk' },
  { id: 'order', a: 434, b: 500, light: 'sea' },
  { id: 'shocked', a: 501, b: 543, light: 'sea' },
  { id: 'enlist', a: 544, b: 601, light: 'sea' },
  { id: 'paybook', a: 602, b: 656, light: 'sea' },
  { id: 'boat', a: 657, b: 708, light: 'sea' },
  { id: 'cassino', a: 709, b: 752, light: 'war' },
  { id: 'haul', a: 753, b: 821, light: 'war' },
  { id: 'watch', a: 822, b: 848, light: 'war' },
  { id: 'stand', a: 849, b: 896, light: 'war' },
  { id: 'carry', a: 897, b: 981, light: 'war' },
  { id: 'promote', a: 982, b: 1058, light: 'golden' },
  { id: 'rule', a: 1059, b: 1109, light: 'sea' },
  { id: 'corporals', a: 1110, b: 1197, light: 'sea' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const { smooth, back, easeOut, easeIn } = M;

// ---------- lights ----------
const base = { fogNear: 120, fogFar: 1400, sat: 1.1, glint: '#effaff', waterDeep: '#2c6c8c', waterShal: '#5aaec4', vig: 0.2, shadowExt: 16 };
export const LIGHTS = {
  desert: { ...base, az: 140, el: 50, sky: '#d8e4f2', ground: '#c8a070', hemi: 1.15, sun: '#fff0d4', sunI: 2.6, fog: '#f0e2c8', skyTop: '#3d86d8', skyHor: '#e6ecf2', gain: '#fff6ea' },
  dusk: { ...base, az: 250, el: 12, sky: '#c8a4b0', ground: '#8a5a40', hemi: 1.05, sun: '#ffb47a', sunI: 2.5, fog: '#e8b090', skyTop: '#5a62a8', skyHor: '#f3a878', gain: '#fff0e0', vig: 0.28 },
  sea: { ...base, az: 160, el: 42, sky: '#cfe0f4', ground: '#8a8a7a', hemi: 1.2, sun: '#fff4e0', sunI: 2.4, fog: '#d8e4ee', skyTop: '#3f80d4', skyHor: '#d2e2f2', waterDeep: '#2c6c8c', waterShal: '#5aaec4' },
  war: { ...base, az: 120, el: 34, sky: '#c4c8c8', ground: '#7a7a6a', hemi: 1.15, sun: '#ffe8cc', sunI: 2.1, fog: '#c8c4b8', fogNear: 80, fogFar: 700, skyTop: '#7a90a8', skyHor: '#d0cec4', sat: 0.98, vig: 0.26 },
  golden: { ...base, az: 280, el: 12, sky: '#a898c8', ground: '#7a5c46', hemi: 1.0, sun: '#ffae62', sunI: 2.8, fog: '#f2b484', fogNear: 90, fogFar: 900, skyTop: '#6a6cb4', skyHor: '#ffbe76', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.12, gain: '#fff2e2', vig: 0.26 },
};
export const lightFor = (S, f) => { const L = { ...LIGHTS[S.light] }; if (S.id === 'cassino' || S.id === 'boat') L.shadowExt = 40; return L; };

// ---------- places ----------
const P = (x, y, z) => [x, y, z];
const DX = 300, CX = 600;

// ---------- cameras ----------
const CAMS = {
  hook: [{ f: 0, pos: P(-1.6, 1.5, 6.4), look: P(-1.6, 1.45, 0.2), fov: 40 }, { f: 52, pos: P(0.2, 1.5, 6.2), look: P(0.2, 1.45, 0.2), fov: 40, ease: 'smooth' }, { f: 66, pos: P(2.6, 1.5, 5.6), look: P(2.6, 1.5, 0.2), fov: 38, ease: 'easeOut' }, { f: 110, pos: P(2.6, 1.5, 4.8), look: P(2.6, 1.55, 0.2), fov: 36 }],
  cub: [{ f: 111, pos: P(-12.0, 1.5, 7.4), look: P(-13.2, 1.1, 1.0), fov: 42 }, { f: 200, pos: P(-13.2, 1.3, 6.4), look: P(-13.2, 0.9, 1.4), fov: 42 }, { f: 235, pos: P(-13.2, 1.2, 5.8), look: P(-13.2, 0.85, 1.4), fov: 40 }],
  adopt: [{ f: 236, pos: P(-12.5, 1.55, 4.8), look: P(-12.6, 1.4, 1.2), fov: 38 }, { f: 275, pos: P(-12.5, 1.55, 4.2), look: P(-12.6, 1.45, 1.2), fov: 36 }],
  name: [{ f: 276, pos: P(-2.5, 1.55, 7.4), look: P(-2.5, 1.5, 2.0), fov: 40 }, { f: 335, pos: P(-2.5, 1.55, 6.4), look: P(-2.5, 1.5, 2.0), fov: 38 }],
  wrestle: [{ f: 336, pos: P(1.0, 1.5, 7.6), look: P(1.0, 1.45, 3.0), fov: 40 }, { f: 385, pos: P(1.4, 1.45, 7.0), look: P(1.0, 1.45, 3.0), fov: 38 }],
  camp: [{ f: 386, pos: P(3.0, 1.3, 8.4), look: P(3.0, 1.05, 3.2), fov: 40 }, { f: 433, pos: P(3.0, 1.3, 7.6), look: P(3.0, 1.1, 3.2), fov: 38 }],
  order: [{ f: 434, pos: P(DX + 0.8, 1.7, 5.0), look: P(DX + 0.9, 2.2, -3.8), fov: 44 }, { f: 470, pos: P(DX + 0.8, 1.7, 4.6), look: P(DX + 0.9, 2.2, -3.8), fov: 44 }, { f: 488, pos: P(DX + 0.65, 1.95, -0.6), look: P(DX + 0.62, 1.95, -4.2), fov: 40, ease: 'easeOut' }, { f: 500, pos: P(DX + 0.65, 1.95, -0.8), look: P(DX + 0.62, 1.95, -4.2), fov: 40 }],
  shocked: [{ f: 501, pos: P(DX - 1.0, 1.6, 2.6), look: P(DX - 1.0, 1.6, -1.4), fov: 38 }, { f: 543, pos: P(DX - 1.0, 1.6, 2.1), look: P(DX - 1.0, 1.65, -1.4), fov: 36 }],
  enlist: [{ f: 544, pos: P(DX - 2.9, 1.6, 8.4), look: P(DX - 2.9, 1.4, 1.4), fov: 40 }, { f: 601, pos: P(DX - 2.9, 1.6, 7.8), look: P(DX - 2.9, 1.45, 1.4), fov: 40 }],
  paybook: [{ f: 602, pos: P(DX - 3.0, 1.6, 5.6), look: P(DX - 3.0, 1.4, 1.4), fov: 38 }, { f: 656, pos: P(DX - 3.0, 1.6, 5.2), look: P(DX - 3.0, 1.4, 1.4), fov: 36 }],
  boat: [{ f: 657, pos: P(DX + 2.6, 1.4, -2.4), look: P(DX + 2.8, 5.6, -12.2), fov: 46 }, { f: 708, pos: P(DX + 2.6, 1.4, -3.0), look: P(DX + 2.8, 5.7, -12.2), fov: 44 }],
  cassino: [{ f: 709, pos: P(CX - 0.2, 1.6, 10.5), look: P(CX + 4, 9, -60), fov: 50 }, { f: 752, pos: P(CX - 0.2, 1.7, 9.6), look: P(CX + 5, 10, -60), fov: 48 }],
  haul: [{ f: 753, pos: P(CX - 2.6, 1.5, 6.6), look: P(CX - 2.6, 1.35, -0.2), fov: 44 }, { f: 821, pos: P(CX - 0.6, 1.5, 6.6), look: P(CX - 0.6, 1.35, -0.2), fov: 44 }],
  watch: [{ f: 822, pos: P(CX - 4.5, 1.25, 6.0), look: P(CX - 4.5, 1.15, 2.2), fov: 38 }, { f: 848, pos: P(CX - 4.5, 1.25, 5.6), look: P(CX - 4.5, 1.2, 2.2), fov: 36 }],
  stand: [{ f: 849, pos: P(CX - 4.0, 1.6, 7.6), look: P(CX - 4.0, 1.8, 1.8), fov: 42 }, { f: 896, pos: P(CX - 3.6, 1.6, 7.2), look: P(CX - 3.6, 2.0, 1.4), fov: 42 }],
  carry: [{ f: 897, pos: P(CX - 4.4, 1.7, 7.6), look: P(CX - 4.4, 1.9, 0.8), fov: 42 }, { f: 981, pos: P(CX + 1.2, 1.7, 7.6), look: P(CX + 1.2, 1.9, 0.8), fov: 42 }],
  promote: [{ f: 982, pos: P(CX + 0.6, 1.7, 9.6), look: P(CX + 0.6, 1.7, 4.0), fov: 40 }, { f: 1058, pos: P(CX + 0.4, 1.75, 8.4), look: P(CX + 0.2, 1.8, 4.0), fov: 38 }],
  rule: [{ f: 1059, pos: P(DX + 1.3, 1.75, 2.4), look: P(DX + 1.1, 1.9, -3.8), fov: 40 }, { f: 1109, pos: P(DX + 1.3, 1.75, 1.8), look: P(DX + 1.1, 1.9, -3.8), fov: 38 }],
  corporals: [{ f: 1110, pos: P(DX + 1.4, 1.7, 4.6), look: P(DX + 1.4, 1.75, -3.0), fov: 42 }, { f: 1197, pos: P(DX + 1.2, 1.75, 3.2), look: P(DX + 1.1, 1.8, -3.0), fov: 38 }],
};
export const camAt = (f) => {
  const S = shotAt(f), c = camFromKeys(CAMS[S.id], f, { creep: 0.0008, kicks: [{ f: 716, a: 0.04 }, { f: 735, a: 0.03 }] });
  c.flash = (f >= 716 && f < 720) || (f >= 735 && f < 738) ? 0.25 : 0;
  return c;
};

// ---------- lens ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const FOCUS = {
  hook: P(1, 1.4, 0.2), cub: P(-13.2, 0.8, 1.6), adopt: P(-12.6, 1.4, 1.3), name: P(-2.5, 1.4, 2.2), wrestle: P(1.0, 1.4, 3.0), camp: P(3, 1.0, 3.3),
  order: P(DX + 0.8, 1.8, -3.6), shocked: P(DX - 1.0, 1.5, -1.4), enlist: P(DX - 3.0, 1.3, 1.6), paybook: P(DX - 3.0, 1.3, 1.6), boat: P(DX + 2.8, 5.6, -12.2),
  cassino: P(CX - 0.5, 2.0, 3.5), haul: P(CX - 1.5, 1.3, 0), watch: P(CX - 4.5, 1.1, 2.2), stand: P(CX - 3.6, 1.6, 1.6), carry: P(CX - 1.6, 1.6, 0.8),
  promote: P(CX + 0.5, 1.6, 4.1), rule: P(DX + 1.3, 1.8, -3.6), corporals: P(DX + 1.4, 1.6, -2.8),
};
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  if (S.id === 'carry') return { focus: dist(C.pos, P(bearCarryX(f), 1.6, 0.8)), cinf: 6, near: 1 };
  if (S.id === 'paybook') return { focus: 1.6, cinf: 14, near: 1 };
  const cinf = { cassino: 3, boat: 4, haul: 5, order: 6 }[S.id] ?? 8;
  return { focus: dist(C.pos, FOCUS[S.id]), cinf, near: 1 };
};
const bearCarryX = (f) => lerp(CX - 5.2, CX + 0.8, ramp(f, 897, 981));

// ---------- world state ----------
export const worldAt = (f) => {
  const S = shotAt(f), W = { helmet: null };
  W.signIran = S.id === 'cub' && f >= 113 ? -3 + 3 * back(ramp(f, 113, 131), 2.2) : -3;
  W.signCas = S.id === 'cassino' && f >= 710 ? -3 + 3 * back(ramp(f, 710, 728), 2.2) : -3;
  return W;
};

// ---------- actors ----------
const life = (f, seed) => { const i = idle(f, seed); return { seed, blink: blinkAt(f, seed), bob: q(i.bob, 3), tilt: q(i.tilt, 1), headTilt: q(i.headTilt, 1) }; };
const PER = (T, who, o, pos, extra = {}) => ({ key: 'wj' + who + JSON.stringify(o), draw: (p) => T.wjPerson(p, who, o), x: pos[0], y: pos[1], z: pos[2], ...extra });
const BEAR = (T, o, pos, extra = {}) => ({ key: 'bear' + JSON.stringify(o), draw: (p) => T.bearCard(p, o), x: pos[0], y: pos[1], z: pos[2], s: 1.12, ...extra });

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const per = (who, seed, o, pos, extra) => out.push(PER(T, who, { ...life(f, seed), ...o }, pos, extra));
  const bear = (o, pos, extra) => out.push(BEAR(T, { blink: blinkAt(f, 77), ...o }, pos, extra));
  switch (S.id) {
    case 'hook': {
      for (const [who, x, sd] of [['sol', -2.4, 1], ['sol2', -1.2, 2], ['sol3', 0, 3], ['sarge', 1.2, 4]]) per(who, sd, { expr: 'stern', R: f > 62 ? 'temple' : 'hang' }, P(x, 0, 0));
      bear({ expr: f > 74 ? 'smug' : 'neutral', stripes: true, cap: true, R: f > 62 ? 'salute' : 'hang', L: 'hang' }, P(2.7, 0, 0.15));
      break;
    }
    case 'cub': {
      bear({ cub: true, pose: 'sit', expr: f > 200 ? 'happy' : 'neutral', look: f > 180 ? 0.6 : 0, blink: blinkAt(f, 5) }, P(-13.4, 0, 1.8), { s: 1.0 });
      if (f >= 160) { const t = smooth(ramp(f, 160, 200)); per('sol', 1, { expr: f > 205 ? 'smile' : 'shock', facing: -0.5, look: -0.7, step: f < 200 ? q(((f - 160) * 0.05) % 1, 2) : 0, L: f > 205 ? 'cheek' : 'hang', R: f > 205 ? 'cheek' : 'hang' }, P(lerp(-9.8, -12.45, t), 0, 1.0));
        per('sol2', 2, { expr: f > 210 ? 'smile' : 'neutral', facing: -0.4, look: -0.6, step: f < 205 ? q(((f - 160) * 0.05 + 0.5) % 1, 2) : 0 }, P(lerp(-16.8, -13.95, smooth(ramp(f, 165, 205))), 0, 0.6)); }
      break;
    }
    case 'adopt': {
      per('sol', 1, { expr: 'smile', facing: 0, L: 'belly', R: 'belly' }, P(-12.6, 0, 1.2));
      bear({ cub: true, pose: 'sit', expr: 'happy' }, P(-12.6, 0.55, 1.42), { s: 1.0, blob: false });
      break;
    }
    case 'name': {
      bear({ cub: true, pose: 'sit', expr: f > 300 ? 'smug' : 'happy', L: f > 296 ? 'up' : 'hang' }, P(-2.5, 0.86, 2.45), { s: 1.0, blob: false });
      for (const [who, x, sd] of [['sol', -3.6, 1], ['sol2', -1.4, 2], ['sarge', -2.5, 4]]) per(who, sd, { expr: f > 292 ? 'laugh' : 'smile', R: f > 290 ? 'up' : 'hang', L: who === 'sarge' && f > 290 ? 'up' : 'hang' }, P(x, 0, x === -2.5 ? 1.2 : 1.7));
      break;
    }
    case 'wrestle': {
      const sway = q(Math.sin(f * 0.25) * 0.08, 2);
      bear({ expr: 'happy', L: 'wrestle', R: 'wrestle' }, P(1.55 + sway, 0, 3.0), { roll: -sway * 0.8 });
      per('sol3', 3, { expr: 'grin', facing: 0.5, L: 'up', R: 'up', tilt: q(8 + sway * 40, 1) }, P(0.45 + sway, 0, 3.05));
      per('sol2', 2, { expr: 'laugh', facing: 0.3, R: 'up' }, P(-0.6, 0, 2.2));
      break;
    }
    case 'camp': {
      bear({ pose: 'sit', expr: f % 60 < 40 ? 'happy' : 'neutral', R: 'hold', L: 'hang', mug: true }, P(2.55, 0, 3.4));
      per('sol', 1, { expr: 'smile', facing: -0.4, L: 'belly' }, P(3.55, 0, 3.0));
      per('sarge', 4, { expr: 'laugh', facing: -0.2, R: 'hip' }, P(3.3, 0, 2.0));
      break;
    }
    case 'order': {
      per('navy', 21, { expr: 'stern', facing: -0.4, look: -0.6, L: f > 468 ? 'point' : 'hip', R: 'hip' }, P(DX + 2.0, 0, -3.1));
      bear({ expr: 'neutral', L: 'hang' }, P(DX - 1.6, 0, -1.4));
      per('sol', 1, { expr: 'neutral', facing: 0.3 }, P(DX - 2.8, 0, -1.8));
      break;
    }
    case 'shocked': {
      bear({ expr: 'shock' }, P(DX - 1.0, 0, -1.4));
      per('sol', 1, { expr: f > 520 ? 'nervous' : 'shock', facing: 0.3, L: 'cheek', R: 'cheek' }, P(DX - 2.1, 0, -1.9));
      break;
    }
    case 'enlist': {
      per('sarge', 4, { expr: f > 585 ? 'grin' : 'stern', facing: 0.3, look: 0.6, R: f > 578 && f < 590 ? 'up' : 'hang' }, P(DX - 3.6, 0, 0.75));
      bear({ expr: f > 570 ? 'smug' : 'neutral', R: 'salute' }, P(DX - 2.5, 0, 2.2));
      per('sol', 1, { expr: 'grin', facing: 0.4, R: 'thumb' }, P(DX - 1.6, 0, 1.4));
      break;
    }
    case 'paybook': {
      per('sarge', 4, { expr: 'grin', facing: 0.3, look: 0.6 }, P(DX - 3.6, 0, 0.75));
      bear({ expr: 'happy', paybook: true, L: 'hold', R: 'hold' }, P(DX - 2.5, 0, 2.2));
      break;
    }
    case 'boat': {
      bear({ expr: 'happy', R: 'wave', wv: q(f * 0.4, 1) }, P(DX + 2.8, 4.62, -12.3), { ground: 4.62 });
      per('sol', 1, { expr: 'laugh', R: 'wave', wv: q(f * 0.4 + 1, 1) }, P(DX + 1.5, 4.62, -12.4), { ground: 4.62 });
      per('sol2', 2, { expr: 'smile' }, P(DX + 4.1, 4.62, -12.4), { ground: 4.62 });
      break;
    }
    case 'cassino': break;
    case 'haul': {
      for (let i = 0; i < 3; i++) { const t0 = 753 + i * 14, x = lerp(CX - 4.4, CX + 0.6, clamp((f - t0) / 70)); per(['helm', 'helm2', 'helm'][i], 31 + i, { expr: 'nervous', facing: 0.5, step: q(((f - t0) * 0.04) % 1, 2), crate: true, L: 'hang', R: 'hang' }, P(x, 0, -0.6 + i * 0.5)); }
      break;
    }
    case 'watch': {
      const look = q(Math.sin((f - 822) * 0.12) * 0.8, 1);
      bear({ pose: 'sit', expr: f > 838 ? 'determined' : 'neutral', look }, P(CX - 4.5, 0, 2.2));
      break;
    }
    case 'stand': {
      const up = f >= 856, t = smooth(ramp(f, 866, 884));
      bear({ pose: up ? 'stand' : 'sit', expr: 'determined', L: f >= 878 ? 'carry' : 'hang', R: f >= 878 ? 'carry' : 'hang', crate: f >= 878, bob: up && f < 862 ? -0.4 : 0, step: f > 866 && f < 878 ? q(((f - 866) * 0.06) % 1, 2) : 0 }, P(lerp(CX - 4.5, CX - 3.3, t), 0, lerp(2.2, 1.3, t)));
      per('helm2', 32, { expr: f > 880 ? 'shock' : 'neutral', facing: -0.4, look: -0.7, crate: true }, P(CX - 1.8, 0, 0.2));
      break;
    }
    case 'carry': {
      const bx = bearCarryX(f);
      bear({ expr: f > 930 ? 'smug' : 'determined', L: 'carry', R: 'carry', crate: true, step: q(((f - 897) * 0.045) % 1, 2) }, P(bx, 0, 0.9));
      per('helm', 31, { expr: 'shock', facing: 0.4, look: 0.7, crate: true, step: q(((f - 897) * 0.045 + 0.5) % 1, 2) }, P(bx - 1.4, 0, 0.2));
      per('helm2', 32, { expr: f > 940 ? 'laugh' : 'nervous', facing: -0.3, look: -0.6, crate: true, step: q(((f - 897) * 0.045 + 0.25) % 1, 2) }, P(bx + 1.3, 0, 0.0));
      break;
    }
    case 'promote': {
      const pinned = f >= 1008;
      bear({ expr: pinned ? 'happy' : 'neutral', stripes: pinned, cap: true, R: f > 1030 ? 'salute' : 'hang' }, P(CX - 0.1, 0, 4.2));
      per('officer', 41, { expr: f > 1012 ? 'grin' : 'stern', facing: -0.6, look: -0.7, L: f >= 994 && f < 1012 ? 'point' : 'hang', R: f > 1030 ? 'temple' : 'hip' }, P(CX + 1.15, 0, 3.9));
      for (const [who, x, sd] of [['helm', -1.4, 31], ['helm2', 2.4, 32]]) per(who, sd, { expr: 'smile', R: f > 1036 ? 'temple' : 'hang' }, P(CX + x, 0, 2.6));
      break;
    }
    case 'rule': {
      per('navy', 21, { expr: 'stubborn', facing: -0.5, look: -0.7, L: 'point', R: 'hip', headTilt: q(4 * Math.sin(f * 0.3), 1) }, P(DX + 2.1, 0, -3.3));
      break;
    }
    case 'corporals': {
      const t = smooth(ramp(f, 1110, 1134));
      bear({ expr: f > 1172 ? 'wink' : 'smug', stripes: true, cap: true, R: f > 1132 ? 'salute' : 'hang', step: f < 1134 ? q(((f - 1110) * 0.06) % 1, 2) : 0 }, P(lerp(DX - 0.6, DX + 0.75, t), 0, lerp(-1.4, -2.5, t)));
      per('navy', 21, { expr: f < 1140 ? 'stubborn' : f < 1156 ? 'shock' : 'dazed', facing: -0.5, look: -0.7, L: f < 1140 ? 'point' : 'hang', R: f > 1158 ? 'temple' : 'hip' }, P(DX + 2.1, 0, -3.3));
      break;
    }
  }
  return out;
};

// ---------- 2D effects ----------
const FX = (key, draw, pos, s, extra = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 5, ...extra });
// a card that sits in front of the camera: d metres ahead, centred `up` metres above the view line
const atCam = (f, d, up = 0, s = 1) => { const C = camAt(f), v = C.look.map((x, i) => x - C.pos[i]), n = Math.hypot(...v); return [C.pos[0] + v[0] / n * d, C.pos[1] + v[1] / n * d + up - 1.125 * s, C.pos[2] + v[2] / n * d]; };
export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  switch (S.id) {
    case 'hook': {
      if (f >= 64 && f < 84) { const t = q(ramp(f, 64, 84), 2); out.push(FX('st' + t, (p) => T.fxStars(p, t), P(2.45, 1.75, 0.35), 0.5)); }
      break;
    }
    case 'cub': case 'adopt': {
      if (f >= 205) { const t = q(((f - 205) / 40) % 1, 2); out.push(FX('ht' + t, (p) => T.fxHearts(p, t), S.id === 'cub' ? P(-12.6, 1.2, 1.6) : P(-12.6, 1.4, 1.5), 0.8)); }
      break;
    }
    case 'name': {
      if (f >= 284) { const t = q(clamp((f - 284) / 50), 2); out.push(FX('nm' + t, (p) => T.fxWord(p, 'WOJTEK!', Math.min(0.45, t), '#ffd84a', 110), atCam(f, 3.0, 0.75, 0.8), 0.8)); }
      break;
    }
    case 'wrestle': {
      const k = q(((f - 336) / 18) % 1, 2); out.push(FX('wd' + k, (p) => T.fxDust(p, k, '#e8d0a0'), P(1.0, 0.0, 3.4), 0.6));
      break;
    }
    case 'camp': {
      const k = q(((f - 386) / 24) % 1, 2); out.push(FX('stm' + k, (p) => T.fxSteam(p, k), P(2.75, 1.0, 3.6), 0.4));
      const k2 = q(((f - 386) / 30) % 1, 2); out.push(FX('fs' + k2, (p) => T.fxSmoke(p, k2, 3), P(3.0, 0.1, 2.5), 0.8));
      break;
    }
    case 'shocked': {
      if (f < 525) { const t = q(ramp(f, 501, 525), 2); out.push(FX('wh' + t, (p) => T.fxWord(p, '!?', Math.min(0.6, t), '#ffffff', 220, 0), P(DX - 1.0, 2.2, -1.2), 0.6)); }
      break;
    }
    case 'enlist': {
      if (f >= 580 && f < 600) { const t = q(ramp(f, 580, 600), 2); out.push(FX('stp' + t, (p) => T.fxWord(p, 'STAMP!', Math.min(0.6, t), '#ff5a5a', 120), P(DX - 3.6, 1.2, 1.3), 0.8)); }
      break;
    }
    case 'paybook': {
      const t = q(ramp(f, 602, 656), 2); out.push(FX('pb' + t, (p) => T.fxPaybook(p, t), atCam(f, 1.6, 0, 0.62), 0.62, { order: 8 }));
      break;
    }
    case 'boat': {
      const k = q(((f - 657) / 22) % 1, 2); out.push(FX('fun' + k, (p) => T.fxSteam(p, k), P(DX, 14.2, -16), 4.0));
      break;
    }
    case 'cassino': {
      for (const [at, x, z] of [[716, CX + 20, -250], [735, CX + 48, -240]]) if (f >= at && f < at + 16) { const t = q(ramp(f, at, at + 16), 2); out.push(FX('bm' + at + t, (p) => T.fxBoom(p, t), P(x, 110, z), 40)); }
      const k = q(((f - 709) / 40) % 1, 2); out.push(FX('sm' + k, (p) => T.fxSmoke(p, k, 1), P(CX + 30, 108, -255), 60));
      break;
    }
    case 'haul': {
      for (let i = 0; i < 3; i++) { const t0 = 753 + i * 14, x = lerp(CX - 4.4, CX + 0.6, clamp((f - t0) / 70)), k = q(((f - 753) / 20 + i / 3) % 1, 2); out.push(FX('sw' + i + k, (p) => T.fxSweat(p, k), P(x + 0.25, 1.5, -0.5 + i * 0.5), 0.6)); }
      if (f >= 760) { const k = q(((f - 760) / 40) % 1, 2); out.push(FX('hs' + k, (p) => T.fxSmoke(p, k, 2), P(CX + 30, 108, -255), 60)); }
      break;
    }
    case 'stand': {
      if (f >= 878 && f < 896) { const t = q(ramp(f, 878, 896), 2); out.push(FX('ups' + t, (p) => T.fxStars(p, t), P(lerp(CX - 4.5, CX - 3.3, 1), 3.0, 1.4), 0.7)); }
      break;
    }
    case 'carry': {
      if (f >= 931) { const t = q(clamp((f - 931) / 50), 2); out.push(FX('cd' + t, (p) => T.fxCaption(p, ['CRATES DROPPED:', '0'], ['#ffffff', '#ffd84a'], 54), atCam(f, 3.2, 0.95, 0.8), 0.8)); }
      break;
    }
    case 'promote': {
      if (f >= 1004 && f < 1030) { const t = q(ramp(f, 1004, 1030), 2); out.push(FX('sp' + t, (p) => T.fxStripes(p, t), P(CX - 0.45, 1.25, 4.5), 0.45)); out.push(FX('ss' + t, (p) => T.fxStars(p, t), P(CX - 0.45, 1.6, 4.5), 0.6)); }
      if (f >= 1012) { const t = q(clamp((f - 1012) / 46), 2); out.push(FX('cpl' + t, (p) => T.fxWord(p, 'CORPORAL!', Math.min(0.45, t), '#ffd84a', 84), atCam(f, 3.4, 1.0, 0.85), 0.85)); }
      break;
    }
    case 'corporals': {
      if (f >= 1150 && f < 1175) { const t = q(ramp(f, 1150, 1175), 2); out.push(FX('q' + t, (p) => T.fxWord(p, '?!', Math.min(0.6, t), '#ffffff', 200, 0), P(DX + 2.1, 2.2, -3.0), 0.5)); }
      break;
    }
  }
  return out;
};
