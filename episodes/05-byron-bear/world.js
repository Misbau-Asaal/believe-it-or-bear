// ================= 05 Byron's Bear: the college gate and court, a fairground stall, and the exam hall (1805-1807) =================
// Replaces the engine's example world (see tools/patch_engine.py). Floor level DECK = 0.
// Street outside the gate: z > -3.4 (the gate tower's street face). Gate range z -4..-9, tower x -5..5 with the arch.
// Court: x -17..17, z -9.6..-43; fountain at (0, -26); chapel on the left (x < -17), rooms on the right (x > 17), the hall at the back (z < -43).
// Notice board just inside the gate at (-3.0, -10.6), text facing into the court. Fair at x ~60. Exam hall at x ~-60.
const DECK = 0;
const world = new THREE.Group(); scene.add(world);
const helmet = new THREE.Group(); scene.add(helmet); helmet.visible = false;
const cv2 = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const clampTex = (c) => { const t = P.tex(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; };
const FONT = (s, w = 'bold') => `${w} ${s}px "DejaVu Serif", "DejaVu Sans", Georgia, serif`;
const SANS = (s) => `bold ${s}px "DejaVu Sans", Arial, sans-serif`;
const rW = P.rng(55);

// ---------- textures ----------
const ashlar = () => { const [c, g] = cv2(256, 256), r = P.rng(3); g.fillStyle = '#c8b48e'; g.fillRect(0, 0, 256, 256);
  for (let j = 0; j < 8; j++) for (let i = -1; i < 4; i++) { const x = i * 80 + (j % 2) * 40, y = j * 32; g.fillStyle = `hsl(${36 + r() * 8},${28 + r() * 12}%,${66 + r() * 10}%)`; g.fillRect(x + 2, y + 2, 76, 28);
    for (let k = 0; k < 3; k++) { g.fillStyle = `rgba(120,95,60,${.05 + r() * .08})`; g.beginPath(); g.ellipse(x + r() * 76, y + r() * 28, 4 + r() * 10, 2 + r() * 4, 0, 0, 7); g.fill(); } }
  return c; };
const gravel = () => { const [c, g] = cv2(256, 256), r = P.rng(9); g.fillStyle = '#d8c8a4'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) { const v = r(); g.fillStyle = v < .3 ? '#b8a47e' : v < .6 ? '#e6d8b8' : '#c4b08a'; g.beginPath(); g.ellipse(r() * 256, r() * 256, 1 + r() * 2.4, 1 + r() * 1.8, r() * 3, 0, 7); g.fill(); } return c; };
const cobbles = () => { const [c, g] = cv2(256, 256), r = P.rng(12); g.fillStyle = '#6e665c'; g.fillRect(0, 0, 256, 256);
  for (let j = 0; j < 10; j++) for (let i = 0; i < 9; i++) { const x = i * 30 + (j % 2) * 15 + r() * 4, y = j * 26 + r() * 4; g.fillStyle = `hsl(${30 + r() * 10},${8 + r() * 8}%,${44 + r() * 14}%)`; g.beginPath(); g.ellipse(x, y, 13, 11, r(), 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.ellipse(x - 3, y - 4, 6, 3, 0, 0, 7); g.fill(); } return c; };
/** a mullioned window: stone surround, two lights, leaded diamond panes, a transom */
const winTex = (tall = false) => { const W = 256, Hh = tall ? 640 : 320, [c, g] = cv2(W, Hh); g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, W, Hh);
  const glass = (x, y, w, h) => { const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, '#5a7a8a'); gr.addColorStop(1, '#2c3a48'); g.fillStyle = gr; g.fillRect(x, y, w, h);
    g.strokeStyle = 'rgba(30,30,36,.75)'; g.lineWidth = 2; g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); for (let k = -h; k < w + h; k += 18) { g.beginPath(); g.moveTo(x + k, y); g.lineTo(x + k + h, y + h); g.stroke(); g.beginPath(); g.moveTo(x + k, y + h); g.lineTo(x + k + h, y); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(x + 4, y + h); g.lineTo(x + 20, y + h); g.lineTo(x + w * 0.7, y); g.lineTo(x + w * 0.5, y); g.fill(); g.restore(); };
  if (tall) { // pointed gothic window with two lights and a small rose of tracery
    g.fillStyle = '#2c3a48'; g.beginPath(); g.moveTo(24, Hh - 20); g.lineTo(24, 200); g.quadraticCurveTo(24, 40, 128, 16); g.quadraticCurveTo(232, 40, 232, 200); g.lineTo(232, Hh - 20); g.closePath(); g.save(); g.clip(); glass(24, 16, 208, Hh - 36); g.restore();
    g.strokeStyle = '#e8dcc0'; g.lineWidth = 16; g.beginPath(); g.moveTo(128, 120); g.lineTo(128, Hh - 20); g.stroke(); g.lineWidth = 12; g.beginPath(); g.moveTo(24, 360); g.lineTo(232, 360); g.stroke();
    g.beginPath(); g.arc(128, 120, 46, 0, 7); g.stroke(); g.lineWidth = 6; g.strokeStyle = '#3a3030'; g.beginPath(); g.moveTo(24, Hh - 20); g.lineTo(24, 200); g.quadraticCurveTo(24, 40, 128, 16); g.quadraticCurveTo(232, 40, 232, 200); g.lineTo(232, Hh - 20); g.stroke(); }
  else { glass(26, 30, 96, 262); glass(134, 30, 96, 262); g.fillStyle = '#e8dcc0'; g.fillRect(20, 128, 216, 12); g.strokeStyle = '#3a3030'; g.lineWidth = 6; g.strokeRect(20, 24, 216, 274);
    g.fillStyle = '#d8c8a4'; g.fillRect(0, 0, W, 16); g.fillRect(0, Hh - 14, W, 14); }
  return c; };
/** row of carved, painted coats of arms (our own simple designs) */
const armsTex = () => { const [c, g] = cv2(1024, 200); g.fillStyle = '#cdb994'; g.fillRect(0, 0, 1024, 200); g.fillStyle = '#b8a27c'; g.fillRect(0, 0, 1024, 10); g.fillRect(0, 190, 1024, 10);
  const cols = [['#2f4f8a', '#e0b24a'], ['#a8282b', '#f2ead8'], ['#2f6a3a', '#e0b24a'], ['#e0b24a', '#2a2630'], ['#5a3a8a', '#f2ead8'], ['#a8282b', '#e0b24a']];
  cols.forEach(([a, b], i) => { const x = 85 + i * 171, y = 30; g.fillStyle = a; g.beginPath(); g.moveTo(x - 55, y); g.lineTo(x + 55, y); g.lineTo(x + 55, y + 70); g.quadraticCurveTo(x + 50, y + 130, x, y + 148); g.quadraticCurveTo(x - 50, y + 130, x - 55, y + 70); g.closePath(); g.fill();
    g.lineWidth = 7; g.strokeStyle = '#3a2a1a'; g.stroke(); g.fillStyle = b;
    if (i % 3 === 0) { g.fillRect(x - 55, y + 52, 110, 22); } else if (i % 3 === 1) { g.beginPath(); g.moveTo(x, y + 18); g.lineTo(x + 26, y + 70); g.lineTo(x, y + 122); g.lineTo(x - 26, y + 70); g.closePath(); g.fill(); }
    else { for (const [dx, dy] of [[-22, 30], [22, 30], [0, 80]]) { g.beginPath(); g.arc(x + dx, y + dy, 14, 0, 7); g.fill(); } } });
  return c; };
/** the rules, pinned to a board (the "NO DOGS" line is line II) */
const RULE_Y = [460, 610, 760, 910];
const rulesTex = () => { const [c, g] = cv2(1024, 1280), r = P.rng(21); g.fillStyle = '#5a3a22'; g.fillRect(0, 0, 1024, 1280);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(30,15,5,${.08 + r() * .1})`; g.fillRect(0, r() * 1280, 1024, 2 + r() * 4); }
  g.fillStyle = '#f4ead0'; g.fillRect(70, 70, 884, 1140); g.fillStyle = 'rgba(160,130,80,.12)'; for (let i = 0; i < 18; i++) { g.beginPath(); g.ellipse(70 + r() * 884, 70 + r() * 1140, 30 + r() * 80, 20 + r() * 40, 0, 0, 7); g.fill(); }
  for (const [x, y] of [[100, 100], [924, 100], [100, 1180], [924, 1180]]) { g.fillStyle = '#a8282b'; g.beginPath(); g.arc(x, y, 16, 0, 7); g.fill(); }
  g.fillStyle = '#2a2018'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = FONT(64); g.fillText('TRINITY COLLEGE', 512, 190);
  g.font = FONT(110); g.fillText('RULES', 512, 310); g.fillRect(250, 375, 524, 6);
  g.textAlign = 'left'; const lines = ['I.  Wear your gown.', 'II.  No dogs.', 'III.  Be in by ten.', 'IV.  No noise in Hall.'];
  lines.forEach((t, i) => { g.font = FONT(i === 1 ? 84 : 70); g.fillStyle = i === 1 ? '#7a1a1a' : '#2a2018'; g.fillText(t, 140, RULE_Y[i]); });
  g.font = FONT(44, 'italic'); g.fillStyle = '#4a3a2a'; g.textAlign = 'right'; g.fillText('By order of the Master', 900, 1110); return c; };
const noDogsTex = () => { const [c, g] = cv2(512, 640); g.fillStyle = '#f4ead0'; g.fillRect(0, 0, 512, 640); g.strokeStyle = '#3a2a1a'; g.lineWidth = 22; g.strokeRect(11, 11, 490, 618);
  // a simple dog silhouette, crossed out
  g.fillStyle = '#2a2018'; g.beginPath(); g.ellipse(250, 300, 120, 62, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(368, 222, 58, 50, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(420, 238, 36, 22, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(346, 196, 22, 44, -0.5, 0, 7); g.fill(); for (const x of [168, 210, 290, 332]) g.fillRect(x - 13, 320, 26, 110); g.lineWidth = 22; g.strokeStyle = '#2a2018'; g.beginPath(); g.moveTo(140, 280); g.quadraticCurveTo(90, 240, 100, 180); g.stroke();
  g.strokeStyle = '#c8282b'; g.lineWidth = 34; g.beginPath(); g.arc(256, 290, 200, 0, 7); g.stroke(); g.beginPath(); g.moveTo(115, 150); g.lineTo(397, 430); g.stroke();
  g.fillStyle = '#c8282b'; g.font = SANS(92); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NO DOGS', 256, 560); return c; };
const signTex = (lines, sizes, bg = '#2f4f6a', fg = '#f4f1e6', W = 1024, Hh = 512) => { const [c, g] = cv2(W, Hh); g.fillStyle = bg; g.fillRect(0, 0, W, Hh);
  g.strokeStyle = fg; g.lineWidth = 16; g.strokeRect(26, 26, W - 52, Hh - 52); g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((t, i) => { g.font = FONT(sizes[i]); g.fillStyle = fg; g.fillText(t, W / 2, Hh * (i + 0.5) / lines.length + (lines.length > 1 ? (i ? -14 : 14) : 0)); }); return c; };
const stripes = (a, b, n = 8, W = 512, Hh = 256) => { const [c, g] = cv2(W, Hh); for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * W / n, 0, W / n + 1, Hh); } return c; };
const bunting = () => { const [c, g] = cv2(1024, 128); const cols = ['#d8323a', '#f2c230', '#3a7ad8', '#3aa85a', '#f2ead8'];
  for (let i = 0; i < 16; i++) { g.fillStyle = cols[i % 5]; g.beginPath(); g.moveTo(i * 64 + 4, 6); g.lineTo(i * 64 + 60, 6); g.lineTo(i * 64 + 32, 118); g.closePath(); g.fill(); g.strokeStyle = '#3a2a1a'; g.lineWidth = 4; g.stroke(); }
  g.fillStyle = '#3a2a1a'; g.fillRect(0, 2, 1024, 6); return c; };
const oak = () => { const [c, g] = cv2(256, 256), r = P.rng(31); g.fillStyle = '#6a4428'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const x = i * 128, y = j * 128; g.fillStyle = '#4e301c'; g.fillRect(x, y, 128, 128); g.fillStyle = '#7a5032'; g.fillRect(x + 14, y + 14, 100, 100); g.fillStyle = '#86593a'; g.fillRect(x + 24, y + 24, 80, 80);
    for (let k = 0; k < 10; k++) { g.fillStyle = `rgba(40,20,10,${.06 + r() * .08})`; g.fillRect(x + 24 + r() * 70, y + 24, 2, 80); } } return c; };
const flags = () => { const [c, g] = cv2(256, 256), r = P.rng(33); g.fillStyle = '#5a5046'; g.fillRect(0, 0, 256, 256);
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { g.fillStyle = (i + j) % 2 ? '#e4dccc' : '#3a3632'; g.fillRect(i * 64 + 2, j * 64 + 2, 60, 60); g.fillStyle = `rgba(255,255,255,${.03 + r() * .05})`; g.fillRect(i * 64 + 6, j * 64 + 6, 30, 20); } return c; };
const portraitTex = (hue) => { const [c, g] = cv2(256, 320); g.fillStyle = '#b8902a'; g.fillRect(0, 0, 256, 320); g.fillStyle = '#7a5a1a'; g.fillRect(10, 10, 236, 300);
  const gr = g.createRadialGradient(128, 130, 10, 128, 160, 180); gr.addColorStop(0, `hsl(${hue},25%,35%)`); gr.addColorStop(1, `hsl(${hue},30%,14%)`); g.fillStyle = gr; g.fillRect(22, 22, 212, 276);
  g.fillStyle = '#1a1416'; g.beginPath(); g.ellipse(128, 300, 90, 110, 0, 0, 7); g.fill(); g.fillStyle = '#f2f0e8'; g.fillRect(116, 196, 24, 30);
  g.fillStyle = '#e8c8a8'; g.beginPath(); g.ellipse(128, 142, 40, 50, 0, 0, 7); g.fill(); g.fillStyle = '#e8e4dc'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(128 + s * 44, 150, 18, 42, 0, 0, 7); g.fill(); }
  g.fillStyle = '#2a2018'; for (const s of [-1, 1]) { g.beginPath(); g.arc(128 + s * 14, 138, 4, 0, 7); g.fill(); } g.fillRect(116, 166, 24, 3); return c; };
const clockTex = () => { const [c, g] = cv2(256, 256); g.fillStyle = '#f6f1e2'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.lineWidth = 14; g.strokeStyle = '#2a2420'; g.stroke();
  g.fillStyle = '#2a2420'; g.font = FONT(30); g.textAlign = 'center'; g.textBaseline = 'middle'; ['XII', 'III', 'VI', 'IX'].forEach((t, i) => { const a = i * Math.PI / 2; g.fillText(t, 128 + Math.sin(a) * 88, 128 - Math.cos(a) * 88); }); return c; };
const paperTex = (bear) => { const [c, g] = cv2(512, 640), r = P.rng(bear ? 5 : 7); g.fillStyle = '#f6f0dc'; g.fillRect(0, 0, 512, 640);
  g.fillStyle = '#2a2018'; g.textAlign = 'center'; g.font = FONT(52); g.fillText('EXAMINATION', 256, 80); g.fillRect(90, 100, 332, 4);
  g.textAlign = 'left'; g.font = FONT(40); g.fillText('NAME:', 50, 180);
  if (bear) { // a paw print for a name, and scribbles
    g.fillStyle = '#3a2a1a'; g.beginPath(); g.ellipse(300, 170, 40, 32, 0, 0, 7); g.fill(); for (const [dx, dy] of [[-40, -38], [-14, -54], [14, -54], [40, -38]]) { g.beginPath(); g.ellipse(300 + dx, 170 + dy, 13, 15, 0, 0, 7); g.fill(); }
    g.strokeStyle = '#3a2a1a'; g.lineWidth = 6; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(60, 270 + i * 58); for (let x = 60; x < 450; x += 18) g.lineTo(x, 270 + i * 58 + (r() - 0.5) * 26); g.stroke(); } }
  else { g.strokeStyle = '#4a4038'; g.lineWidth = 3; g.beginPath(); g.moveTo(190, 180); g.lineTo(440, 180); g.stroke(); for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(60, 260 + i * 52); g.lineTo(60 + 140 + r() * 240, 260 + i * 52); g.stroke(); } }
  return c; };

// ---------- materials ----------
const basic = (c, opts = {}) => new THREE.MeshBasicMaterial({ map: clampTex(c), fog: false, ...opts });
const tmap = (c, rx = 1, ry = 1) => toon({ map: P.tex(c, rx, ry) });
const MM = {
  ashlar: texM(ashlar(), 1, 1), ashlarX: tmap(ashlar(), 0.5, 0.5), gravel: texM(gravel(), 18, 18), cobbles: texM(cobbles(), 20, 10),
  win: toon({ map: clampTex(winTex(false)) }), tallWin: toon({ map: clampTex(winTex(true)) }), arms: toon({ map: clampTex(armsTex()) }),
  rules: toon({ map: clampTex(rulesTex()) }), noDogs: toon({ map: clampTex(noDogsTex()) }),
  date: new THREE.MeshToonMaterial({ gradientMap: grad, map: clampTex(signTex(['1805'], [300], '#2f4f3a')), side: THREE.DoubleSide }),
  fairSign: toon({ map: clampTex(signTex(['TAME BEAR', 'FOR SALE'], [150, 110], '#7a1f24', '#f6e6b8')) }),
  stripe: tmap(stripes('#c8323a', '#f4ead8', 16), 1, 1), stripeB: tmap(stripes('#2f5a9a', '#f4ead8', 16), 1, 1), awning: toon({ map: clampTex(stripes('#c8323a', '#f4ead8', 10)), side: THREE.DoubleSide }),
  bunting: new THREE.MeshBasicMaterial({ map: P.tex(bunting(), 3, 1), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }),
  oak: texM(oak(), 1, 1), flags: texM(flags(), 6, 6), plaster: M.plaster, clock: toon({ map: clampTex(clockTex()) }),
  pA: toon({ map: clampTex(portraitTex(20)) }), pB: toon({ map: clampTex(portraitTex(210)) }), pC: toon({ map: clampTex(portraitTex(120)) }),
  paper: toon({ map: clampTex(paperTex(false)) }), paperBear: toon({ map: clampTex(paperTex(true)) }),
  wood: toon({ color: '#7a5032' }), woodD: toon({ color: '#4e301c' }), door: toon({ color: '#5a3a24' }), iron: toon({ color: '#3a3836' }), slate: toon({ color: '#5a6068' }), lead: toon({ color: '#8a9096' }),
  stoneL: toon({ color: '#e2d4b4' }), water: toon({ color: '#6aa8c4' }), black: toon({ color: '#26242a' }), brass: toon({ color: '#d0a34a' }), cream: toon({ color: '#efe4c8' }),
  red: toon({ color: '#b8282b' }), barrel: toon({ color: '#8a5a32' }), straw: toon({ color: '#e0c070' }), post: toon({ color: '#6b4e34' }), lamp: new THREE.MeshBasicMaterial({ color: '#fff0c0' }),
  trunk: toon({ color: '#6a4a32' }), leaf: toon({ color: '#5c8a3c' }), leaf2: toon({ color: '#6c9a42' }), leaf3: toon({ color: '#4c7a36' }), hedge: toon({ color: '#4f7a34' }),
  plank: M.plank, grass: M.grass, dirt: M.dirt, roof: M.roof,
};
const put = (geo, mat, x, y, z, parent = world, opts = {}) => add(geo, mat, x, y, z, parent, opts);
const grp = (x, y, z, ry = 0, parent = world) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); return g; };
const flat = (w, d, mat, x, y, z, parent = world) => { const m = put(new THREE.PlaneGeometry(w, d), mat, x, y, z, parent, { cast: false }); m.rotation.x = -Math.PI / 2; return m; };
const plane = (w, h, mat, x, y, z, ry = 0, parent = world) => { const m = put(new THREE.PlaneGeometry(w, h), mat, x, y, z, parent, { cast: false }); m.rotation.y = ry; return m; };
const cyl = (r0, r1, h, n = 12) => new THREE.CylinderGeometry(r0, r1, h, n);
const waterU = { t: { value: 0 }, deep: { value: new THREE.Color('#2f6f8f') }, shal: { value: new THREE.Color('#5fa8bf') }, glint: { value: new THREE.Color('#e9f6ff') } };
/** merlons along a parapet from a to b (x or z axis) at height y */
const crenel = (axis, a, b, y, c, mat = MM.ashlar, step = 1.0) => { for (let s = a + step / 2; s < b; s += step) put(tbox(axis === 'x' ? 0.55 : 0.45, 0.6, axis === 'x' ? 0.45 : 0.55, 2), mat, axis === 'x' ? s : c, y + 0.3, axis === 'x' ? c : s, world, { cast: false }); };
/** a pitched roof along x (ridge parallel to x) */
const roofX = (x0, x1, zc, depth, y, h, mat = MM.slate) => { const sh = new THREE.Shape(); sh.moveTo(-depth / 2, 0); sh.lineTo(depth / 2, 0); sh.lineTo(0, h); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: x1 - x0, bevelEnabled: false }); const m = put(geo, mat, x0, y, zc); m.rotation.y = Math.PI / 2; return m; };
const roofZ = (z0, z1, xc, depth, y, h, mat = MM.slate) => { const sh = new THREE.Shape(); sh.moveTo(-depth / 2, 0); sh.lineTo(depth / 2, 0); sh.lineTo(0, h); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false }); return put(geo, mat, xc, y, z0); };
const tree = (x, z, h = 6, s = 1) => { const g = grp(x, 0, z, rW() * 6); g.scale.setScalar(s); put(cyl(0.18, 0.28, h * 0.6, 7), MM.trunk, 0, h * 0.3, 0, g);
  for (const [cx, cy, cz, r] of [[0, h * 0.75, 0, 1.9], [1.1, h * 0.62, 0.3, 1.3], [-1.0, h * 0.66, -0.4, 1.4], [0.2, h * 0.92, 0.5, 1.2]]) { const c = put(new THREE.SphereGeometry(r, 10, 8), [MM.leaf, MM.leaf2, MM.leaf3][Math.floor(rW() * 3)], cx, cy, cz, g); c.scale.y = 0.8; } return g; };

// ---------- ground ----------
const ground = flat(3000, 3000, MM.grass, 0, -0.03, 0);
flat(90, 26, MM.cobbles, 0, -0.01, 9);                                  // the street
flat(34.4, 34, MM.gravel, 0, -0.005, -26.4);                            // the court
for (const [x0, x1, z0, z1] of [[-15.6, -3.6, -24.0, -11.6], [3.6, 15.6, -24.0, -11.6], [-15.6, -3.6, -41.2, -28.8], [3.6, 15.6, -41.2, -28.8]]) flat(x1 - x0, z1 - z0, MM.grass, (x0 + x1) / 2, 0.0, (z0 + z1) / 2);
// low stone kerbs round the lawns
for (const [x0, x1, z0, z1] of [[-15.6, -3.6, -24.0, -11.6], [3.6, 15.6, -24.0, -11.6], [-15.6, -3.6, -41.2, -28.8], [3.6, 15.6, -41.2, -28.8]]) {
  for (const z of [z0, z1]) put(tbox(x1 - x0, 0.08, 0.12, 2), MM.stoneL, (x0 + x1) / 2, 0.04, z, world, { cast: false });
  for (const x of [x0, x1]) put(tbox(0.12, 0.08, z1 - z0, 2), MM.stoneL, x, 0.04, (z0 + z1) / 2, world, { cast: false }); }

// ================= the gate tower =================
{ // street-to-court slab with an arched passage (extruded, so the arch has real depth)
  const sh = new THREE.Shape(); sh.moveTo(-5, 0); sh.lineTo(-1.8, 0); sh.lineTo(-1.8, 3.6); sh.absarc(0, 3.6, 1.8, Math.PI, 0, true); sh.lineTo(1.8, 0); sh.lineTo(5, 0); sh.lineTo(5, 15); sh.lineTo(-5, 15); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 6.2, bevelEnabled: false, curveSegments: 16 }); geo.translate(0, 0, -9.6);
  put(geo, MM.ashlarX, 0, 0, 0);
  // the open gates folded back against the passage walls, and the dark vault
  for (const s of [-1, 1]) { const d = put(tbox(0.12, 3.6, 1.9, 1), MM.door, s * 1.7, 1.8, -4.6); for (let i = 0; i < 4; i++) put(tbox(0.14, 0.06, 1.9, 1), MM.iron, s * 1.68, 0.6 + i * 0.95, -4.6, world, { cast: false }); }
  // arch moulding, the band of arms, windows on both faces, string courses
  for (const [z, ry] of [[-3.38, 0], [-9.62, Math.PI]]) {
    const t = put(new THREE.TorusGeometry(2.0, 0.18, 6, 20, Math.PI), MM.stoneL, 0, 3.6, z); t.rotation.y = ry;
    for (const s of [-1, 1]) put(tbox(0.36, 3.6, 0.3, 1), MM.stoneL, s * 2.0, 1.8, z);
    plane(7.4, 1.45, MM.arms, 0, 6.6, z + (ry ? -0.03 : 0.03), ry);
    for (const y of [9.4, 12.6]) { plane(2.4, 2.4, MM.win, 0, y, z + (ry ? -0.03 : 0.03), ry); for (const s of [-1, 1]) plane(1.3, 1.9, MM.win, s * 3.0, y, z + (ry ? -0.03 : 0.03), ry); }
    put(tbox(10.2, 0.22, 0.3, 2), MM.stoneL, 0, 7.6, z); put(tbox(10.2, 0.22, 0.3, 2), MM.stoneL, 0, 14.9, z);
  }
  crenel('x', -5, 5, 15, -3.6); crenel('x', -5, 5, 15, -9.4);
  // four corner turrets with caps
  for (const sx of [-1, 1]) for (const z of [-3.4, -9.6]) { const x = sx * 5;
    put(cyl(0.95, 1.0, 18, 8), MM.ashlarX, x, 9, z); put(cyl(1.15, 1.15, 0.5, 8), MM.stoneL, x, 18.25, z); put(new THREE.ConeGeometry(1.05, 2.2, 8), MM.lead, x, 19.6, z); put(cyl(0.05, 0.05, 1.0, 4), MM.iron, x, 21.0, z, world, { cast: false });
    for (const y of [6, 11]) plane(0.4, 1.1, MM.win, x + (sx > 0 ? -0.0 : 0.0), y, z + (z > -6 ? 0.97 : -0.97), z > -6 ? 0 : Math.PI); }
}
// ================= ranges (two storeys, ashlar, mullioned windows, battlements) =================
const range = (x0, x1, z0, z1, h, opts = {}) => {
  const w = x1 - x0, d = z1 - z0; put(tbox(Math.abs(w), h, Math.abs(d), 2), MM.ashlar, (x0 + x1) / 2, h / 2, (z0 + z1) / 2);
  if (!opts.noRoof) { if (Math.abs(w) > Math.abs(d)) roofX(Math.min(x0, x1), Math.max(x0, x1), (z0 + z1) / 2, Math.abs(d) * 0.9, h, 2.6); else roofZ(Math.min(z0, z1), Math.max(z0, z1), (x0 + x1) / 2, Math.abs(w) * 0.9, h, 2.6); }
};
const windowsOn = (axis, a, b, c, face, ys, mat = MM.win, w = 1.5, hh = 1.9, step = 3.0) => { // face: +1 / -1 = which side the windows look out of
  for (let s = a + step / 2; s < b - 0.3; s += step) for (const y of ys) { if (axis === 'x') plane(w, hh, mat, s, y, c + face * 0.03, face > 0 ? 0 : Math.PI); else plane(w, hh, mat, c + face * 0.03, y, s, face > 0 ? Math.PI / 2 : -Math.PI / 2); } };
// the gate range either side of the tower (street face z -4, court face z -9)
for (const [x0, x1] of [[-19, -5], [5, 19]]) { range(x0, x1, -4, -9, 10); windowsOn('x', x0, x1, -4, 1, [3.0, 6.8]); windowsOn('x', x0, x1, -9, -1, [3.0, 6.8]); crenel('x', x0, x1, 10, -4.2); crenel('x', x0, x1, 10, -8.8);
  put(tbox(x1 - x0, 0.2, 0.25, 2), MM.stoneL, (x0 + x1) / 2, 5.0, -3.9); put(tbox(x1 - x0, 0.2, 0.25, 2), MM.stoneL, (x0 + x1) / 2, 5.0, -9.1);
  for (const s of [0.3, 0.7]) { const x = x0 + (x1 - x0) * s; put(tbox(0.9, 2.2, 0.9, 1), MM.ashlar, x, 11.4, -6.5); } }  // chimneys
// right range (rooms), court face x 17
range(17, 23, -9, -43, 10); windowsOn('z', -43, -9, 17, -1, [3.0, 6.8]); crenel('z', -43, -9, 10, 17.2);
for (const z of [-14, -22, -30, -38]) put(tbox(0.9, 2.2, 0.9, 1), MM.ashlar, 20, 11.4, z);
// left range: the chapel, taller, with tall windows and buttresses
range(-23, -17, -9, -43, 13); windowsOn('z', -43, -9, -17, 1, [6.0], MM.tallWin, 2.2, 5.5, 4.25); crenel('z', -43, -9, 13, -17.2);
for (let z = -9; z >= -43; z -= 4.25) { put(tbox(0.9, 12, 1.0, 1), MM.ashlar, -16.6, 6, z); put(new THREE.ConeGeometry(0.35, 1.6, 4), MM.stoneL, -16.6, 13.8, z); }
// the hall at the back, court face z -43, with tall windows and a lantern on the roof
range(-19, 19, -43, -49, 12); windowsOn('x', -15, 15, -43, 1, [6.0], MM.tallWin, 2.2, 5.5, 5.0); crenel('x', -19, 19, 12, -43.2);
{ const g = grp(0, 14.2, -46); put(cyl(1.0, 1.1, 2.0, 6), MM.lead, 0, 1.0, 0, g); put(new THREE.ConeGeometry(1.25, 1.8, 6), MM.lead, 0, 2.9, 0, g); put(cyl(0.05, 0.05, 1.2, 4), MM.iron, 0, 4.2, 0, g, { cast: false }); }
put(tbox(3.4, 4.8, 1.2, 1), MM.ashlar, 0, 2.4, -42.4); put(tbox(2.0, 3.2, 0.1, 1), MM.door, 0, 1.6, -41.78);   // the hall porch
// ---- the fountain ----
const FOUNT = { x: 0, z: -26 };
{ const g = grp(FOUNT.x, 0, FOUNT.z);
  put(cyl(2.7, 2.8, 0.6, 8), MM.stoneL, 0, 0.3, 0, g); put(cyl(2.45, 2.45, 0.05, 8), MM.water, 0, 0.55, 0, g, { cast: false });
  put(cyl(0.45, 0.6, 1.6, 8), MM.ashlar, 0, 1.2, 0, g); put(cyl(0.9, 0.5, 0.25, 8), MM.stoneL, 0, 2.05, 0, g);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; put(cyl(0.1, 0.12, 3.6, 6), MM.stoneL, Math.cos(a) * 1.85, 2.4, Math.sin(a) * 1.85, g); }
  put(cyl(2.25, 2.25, 0.4, 8), MM.ashlar, 0, 4.35, 0, g); crenelRing(g);
  const cap = put(new THREE.ConeGeometry(2.2, 2.6, 8), MM.lead, 0, 5.85, 0, g); put(new THREE.SphereGeometry(0.28, 10, 8), MM.brass, 0, 7.3, 0, g);
  for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * Math.PI * 2; put(new THREE.ConeGeometry(0.16, 0.7, 4), MM.stoneL, Math.cos(a) * 2.15, 4.9, Math.sin(a) * 2.15, g); } }
function crenelRing(g) { for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; if (i % 2) continue; const m = put(tbox(0.4, 0.35, 0.3, 1), MM.ashlar, Math.cos(a) * 2.1, 4.72, Math.sin(a) * 2.1, g, { cast: false }); m.rotation.y = -a; } }
// ---- the notice board just inside the gate, and the NO DOGS sign outside ----
const BOARD = { x: -3.0, z: -10.6, y: 1.55 };
{ const g = grp(BOARD.x, 0, BOARD.z, Math.PI);
  for (const s of [-1, 1]) put(tbox(0.1, 2.3, 0.1, 1), MM.woodD, s * 0.62, 1.15, 0, g);
  put(tbox(1.36, 1.68, 0.06, 1), MM.woodD, 0, BOARD.y, 0, g); put(new THREE.PlaneGeometry(1.28, 1.6), MM.rules, 0, BOARD.y, 0.035, g, { cast: false });
  const t = put(tbox(1.5, 0.08, 0.3, 1), MM.woodD, 0, 2.43, 0.05, g); }
const NODOG = { x: 3.95, z: -1.55 };
{ const g = grp(NODOG.x, 0, NODOG.z, -0.12); put(tbox(0.08, 2.0, 0.08, 1), MM.woodD, 0, 1.0, -0.05, g); put(tbox(0.66, 0.82, 0.05, 1), MM.woodD, 0, 1.86, 0, g); put(new THREE.PlaneGeometry(0.6, 0.75), MM.noDogs, 0, 1.86, 0.03, g, { cast: false }); }
// ---- the street outside: lamp posts, bollards, trees and roofs beyond the college ----
for (const x of [-8, 8.5]) { put(cyl(0.07, 0.1, 3.4, 8), MM.iron, x, 1.7, -2.6); put(tbox(0.36, 0.5, 0.36, 1), MM.black, x, 3.6, -2.6); put(tbox(0.26, 0.36, 0.26, 1), MM.lamp, x, 3.6, -2.6, world, { cast: false }); put(new THREE.ConeGeometry(0.3, 0.3, 4), MM.black, x, 4.0, -2.6); }
for (let i = 0; i < 18; i++) tree(-60 + rW() * 120, -60 - rW() * 30, 9 + rW() * 5, 1.3);
for (let i = 0; i < 12; i++) { const x = -50 + i * 9 + rW() * 3, h = 9 + rW() * 6; put(tbox(7, h, 8, 2), MM.ashlar, x, h / 2, -58 - rW() * 8); roofX(x - 3.5, x + 3.5, -58, 7.2, h, 3); }
for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, d = 900 + rW() * 200, r = 160 + rW() * 140; const m = put(new THREE.SphereGeometry(r, 18, 10), i % 2 ? M.hill : M.hillFar, Math.cos(a) * d, -r * 0.86, -20 + Math.sin(a) * d, world, { cast: false }); m.scale.y = 0.4; }
// the year sign on the lawn (pops up), text facing the gate
const signG = grp(2.0, 0, -14.2, Math.PI + 0.1);
put(cyl(0.06, 0.06, 2.3, 6), MM.post, -0.66, 1.15, 0, signG); put(cyl(0.06, 0.06, 2.3, 6), MM.post, 0.66, 1.15, 0, signG);
put(new THREE.PlaneGeometry(1.6, 0.8), MM.date, 0, 1.85, 0.08, signG);

// ================= the fair (x ~60) =================
const FAIR = { x: 60, z: -1 };
{ const g = grp(FAIR.x, 0, FAIR.z);
  const dirt = put(new THREE.CircleGeometry(9, 24), MM.dirt, 0, 0.0, -2, g, { cast: false }); dirt.rotation.x = -Math.PI / 2;
  // the stall: counter, striped awning on posts, the sign
  put(tbox(3.2, 1.0, 0.7, 1), MM.wood, 0, 0.5, -2.2, g); put(tbox(3.3, 0.08, 0.8, 1), MM.woodD, 0, 1.02, -2.2, g);
  for (const s of [-1, 1]) for (const z of [-2.5, -1.9]) put(cyl(0.06, 0.06, 2.8, 6), MM.post, s * 1.55, 1.4, z, g);
  const aw = put(new THREE.PlaneGeometry(3.4, 1.4), MM.awning, 0, 2.75, -1.95, g, { cast: false }); aw.rotation.x = -1.05;
  put(tbox(2.4, 0.9, 0.08, 1), MM.woodD, 0, 3.4, -2.4, g); put(new THREE.PlaneGeometry(2.3, 0.8), MM.fairSign, 0, 3.4, -2.35, g, { cast: false });
  // the big tent behind
  put(cyl(3.2, 3.2, 2.8, 16), MM.stripe, -0.5, 1.4, -6.2, g); put(new THREE.ConeGeometry(3.6, 2.6, 16), MM.stripe, -0.5, 4.1, -6.2, g); put(cyl(0.04, 0.04, 1.4, 4), MM.post, -0.5, 6.0, -6.2, g, { cast: false });
  put(new THREE.PlaneGeometry(0.5, 0.3), MM.red, -0.5, 6.5, -6.2, g, { cast: false });
  // more tents, barrels, straw, crates
  for (const [x, z, r, m] of [[-7, -7, 2.4, MM.stripeB], [7.5, -8, 2.8, MM.stripe], [-11, -12, 2.2, MM.stripe], [12, -13, 2.4, MM.stripeB]]) { put(cyl(r, r, 2.4, 14), m, x, 1.2, z, g); put(new THREE.ConeGeometry(r * 1.12, 2.2, 14), m, x, 3.5, z, g); }
  for (const [x, z] of [[2.3, -1.6], [2.7, -2.4], [-2.4, -1.8]]) put(cyl(0.32, 0.28, 0.8, 12), MM.barrel, x, 0.4, z, g);
  put(tbox(0.8, 0.5, 0.6, 1), MM.straw, -2.9, 0.25, -2.6, g); put(tbox(0.6, 0.6, 0.6, 1), MM.wood, 2.9, 0.3, -3.0, g);
  // bunting between poles
  for (const [x0, x1, z] of [[-4.5, 4.5, -3.2], [-6, 2, -5]]) { put(cyl(0.05, 0.05, 4.2, 6), MM.post, x0, 2.1, z, g); put(cyl(0.05, 0.05, 4.2, 6), MM.post, x1, 2.1, z, g);
    const b = put(new THREE.PlaneGeometry(x1 - x0, 0.42), MM.bunting, (x0 + x1) / 2, 3.75, z, g, { cast: false }); }
  for (let i = 0; i < 8; i++) tree(-20 + rW() * 40, -20 - rW() * 12, 7 + rW() * 3, 1.0).position.add(new THREE.Vector3(FAIR.x, 0, FAIR.z));
}

// ================= the exam hall (x ~-60) =================
const HALL = { x: -60, z: -5 };
const DESKS = [];       // [x, z] of each desk (front edge towards +z)
{ const g = grp(HALL.x, 0, 0);
  flat(16, 20, MM.flags, HALL.x, 0.002, -4);
  put(tbox(16.4, 10, 0.3, 2), MM.plaster, 0, 5, -14.15, g); for (const s of [-1, 1]) put(tbox(0.3, 10, 20, 2), MM.plaster, s * 8.15, 5, -4, g);
  // oak panelling to 3 m on three walls
  put(tbox(16, 3, 0.12, 3), MM.oak, 0, 1.5, -13.94, g); for (const s of [-1, 1]) put(tbox(0.12, 3, 20, 3), MM.oak, s * 7.94, 1.5, -4, g);
  put(tbox(16, 0.16, 0.2, 1), MM.woodD, 0, 3.05, -13.9, g); for (const s of [-1, 1]) put(tbox(0.2, 0.16, 20, 1), MM.woodD, s * 7.9, 3.05, -4, g);
  // tall windows on the side walls, portraits and the clock on the back wall
  for (const z of [-11, -6.5, -2]) for (const s of [-1, 1]) plane(2.0, 5.0, MM.tallWin, s * 7.98, 6.2, z, s > 0 ? -Math.PI / 2 : Math.PI / 2, g);
  for (const [x, m] of [[-4.6, MM.pA], [4.6, MM.pB]]) { put(tbox(1.9, 2.4, 0.08, 1), MM.brass, x, 5.2, -13.95, g); plane(1.7, 2.2, m, x, 5.2, -13.9, 0, g); }
  plane(1.5, 1.5, MM.clock, 0, 5.4, -13.95, 0, g); put(tbox(1.7, 1.7, 0.06, 1), MM.woodD, 0, 5.4, -13.99, g);
  // the high table at the back
  put(tbox(6, 0.9, 1.0, 1), MM.woodD, 0, 0.45 + 0.3, -12.6, g); put(tbox(7, 0.3, 2.2, 1), MM.wood, 0, 0.15, -12.6, g);
  // rows of desks with benches, papers, inkwells
  const rows = [-2.6, -5.0, -7.4], cols = [-2.3, 0, 2.3];
  rows.forEach((z, ri) => cols.forEach((x, ci) => {
    put(tbox(1.5, 0.06, 0.7, 1), MM.wood, x, 0.8, z, g); put(tbox(1.5, 0.74, 0.05, 1), MM.woodD, x, 0.4, z + 0.33, g);
    for (const s of [-1, 1]) put(tbox(0.05, 0.8, 0.66, 1), MM.woodD, x + s * 0.72, 0.4, z, g);
    put(tbox(1.4, 0.06, 0.32, 1), MM.wood, x, 0.46, z - 0.62, g); for (const s of [-1, 1]) put(tbox(0.05, 0.46, 0.3, 1), MM.woodD, x + s * 0.66, 0.23, z - 0.62, g);
    const bear = ri === 0 && ci === 1, pp = put(new THREE.PlaneGeometry(0.42, 0.52), bear ? MM.paperBear : MM.paper, x - 0.1, 0.835, z + 0.05, g, { cast: false }); pp.rotation.x = -Math.PI / 2; pp.rotation.z = (ci - 1) * 0.08 + 0.05;
    put(cyl(0.05, 0.06, 0.08, 10), MM.black, x + 0.45, 0.87, z - 0.1, g);
    DESKS.push([HALL.x + x, z]);
  }));
}

// ---------- clouds ----------
const clouds = [];
{ const r = P.rng(90);
  for (let i = 0; i < 12; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = (r() - 0.5) * Math.PI * 2, d = 650 + r() * 250; m.position.set(Math.cos(a) * d, 150 + r() * 160, -20 + Math.sin(a) * d); m.scale.setScalar(160 + r() * 140);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }

// ---------- per-frame state ----------
function worldState(S, f) {
  waterU.t.value = f / 30;
  signG.position.y = S.signY ?? -3; signG.visible = signG.position.y > -2.9;
}
