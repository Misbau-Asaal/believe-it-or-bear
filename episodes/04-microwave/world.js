// ================= 04 The Microwave: the radar lab (1945-47), its building, the boss's office, and inside the food =================
// Replaces the engine's example world (see tools/patch_engine.py). Floor level DECK = 0.
// Lab: an open-top room x -9..9, z -6..3 (camera side open). Bench at the back left, the running tube (test rig) at x -1.6,
//      the test table at x 0, chalkboard and shelves to the right, the 1947 oven and the platform scale at x ~6.
// Building exterior at z ~ -85 (seen from z ~ -55). Office at x ~30. Inside-the-food dome at x 200.
const DECK = 0;
const world = new THREE.Group(); scene.add(world);
const helmet = new THREE.Group(); scene.add(helmet); helmet.visible = false;
const cv2 = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const clampTex = (c) => { const t = P.tex(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; };
const FONT = (s) => `bold ${s}px "DejaVu Sans", Arial, sans-serif`;
const rW = P.rng(45);

// ---------- textures ----------
const tiles = () => { const [c, g] = cv2(256, 256), r = P.rng(4);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#7d9884' : '#e6dec8'; g.fillRect(i * 64, j * 64, 64, 64); }
  g.strokeStyle = 'rgba(60,50,40,.35)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.moveTo(0, i * 64); g.lineTo(256, i * 64); g.stroke(); }
  for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(90,70,50,${.03 + r() * .06})`; g.beginPath(); g.ellipse(r() * 256, r() * 256, 4 + r() * 18, 2 + r() * 8, r() * 3, 0, 7); g.fill(); } return c; };
const wallTex = () => { const [c, g] = cv2(256, 512), r = P.rng(6); g.fillStyle = '#e2dbc6'; g.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(150,130,100,${.03 + r() * .05})`; g.beginPath(); g.ellipse(r() * 256, r() * 380, 10 + r() * 40, 6 + r() * 20, 0, 0, 7); g.fill(); }
  g.fillStyle = '#6f8f7c'; g.fillRect(0, 390, 256, 122); g.fillStyle = '#4f6a5a'; g.fillRect(0, 386, 256, 8); g.fillStyle = '#3f4a44'; g.fillRect(0, 500, 256, 12); return c; };
const windowTex = (cols = 3, rows = 4) => { const [c, g] = cv2(256, 320); const gr = g.createLinearGradient(0, 0, 0, 320); gr.addColorStop(0, '#cfe6fa'); gr.addColorStop(1, '#f4fbff'); g.fillStyle = gr; g.fillRect(0, 0, 256, 320);
  g.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(20 + i * 50, 320); g.lineTo(60 + i * 50, 320); g.lineTo(120 + i * 50, 0); g.lineTo(100 + i * 50, 0); g.fill(); }
  g.fillStyle = '#3c4a46'; for (let i = 0; i <= cols; i++) g.fillRect(i * (256 - 12) / cols, 0, 12, 320); for (let j = 0; j <= rows; j++) g.fillRect(0, j * (320 - 12) / rows, 256, 12); return c; };
const chalkTex = () => { const [c, g] = cv2(1024, 560), r = P.rng(15); g.fillStyle = '#2f3f37'; g.fillRect(0, 0, 1024, 560);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,255,255,${.02 + r() * .04})`; g.beginPath(); g.ellipse(r() * 1024, r() * 560, 30 + r() * 80, 10 + r() * 30, r(), 0, 7); g.fill(); }
  const ch = (pts, w = 7) => { g.strokeStyle = 'rgba(245,245,238,.9)'; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
  // a magnetron cross-section: a ring of eight cavities round the cathode
  g.strokeStyle = 'rgba(245,245,238,.9)'; g.lineWidth = 7; g.beginPath(); g.arc(230, 270, 150, 0, 7); g.stroke(); g.beginPath(); g.arc(230, 270, 34, 0, 7); g.stroke();
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.beginPath(); g.arc(230 + Math.cos(a) * 100, 270 + Math.sin(a) * 100, 26, 0, 7); g.stroke(); ch([[230 + Math.cos(a) * 60, 270 + Math.sin(a) * 60], [230 + Math.cos(a) * 76, 270 + Math.sin(a) * 76]], 6); }
  // waves leaving a horn
  ch([[470, 230], [560, 190], [560, 350], [470, 310], [470, 230]]);
  for (let k = 0; k < 3; k++) { const pts = []; for (let x = 0; x <= 300; x += 10) pts.push([600 + x, 270 + 40 * Math.sin(x / 30 + k)]); ch(pts.map(([x, y]) => [x, y + (k - 1) * 90]), 6); }
  g.fillStyle = 'rgba(245,245,238,.9)'; g.font = FONT(56); g.textAlign = 'center'; g.fillText('λ ≈ 12 cm', 760, 500);
  g.strokeStyle = '#7a5434'; g.lineWidth = 28; g.strokeRect(0, 0, 1024, 560); return c; };
const voltTex = () => { const [c, g] = cv2(512, 256); g.fillStyle = '#f2c230'; g.fillRect(0, 0, 512, 256); g.fillStyle = '#1f1b22'; g.fillRect(0, 0, 512, 22); g.fillRect(0, 234, 512, 22);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = FONT(64); g.fillText('DANGER', 256, 82); g.font = FONT(50); g.fillText('HIGH VOLTAGE', 256, 168);
  g.beginPath(); g.moveTo(34, 60); g.lineTo(70, 60); g.lineTo(52, 120); g.lineTo(78, 120); g.lineTo(30, 200); g.lineTo(46, 136); g.lineTo(22, 136); g.closePath(); g.fill(); return c; };
const clockTex = () => { const [c, g] = cv2(256, 256); g.fillStyle = '#f6f1e2'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.lineWidth = 14; g.strokeStyle = '#2a2420'; g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.lineWidth = i % 3 ? 5 : 10; g.beginPath(); g.moveTo(128 + Math.sin(a) * 92, 128 - Math.cos(a) * 92); g.lineTo(128 + Math.sin(a) * 108, 128 - Math.cos(a) * 108); g.stroke(); } return c; };
const dialTex = () => { const [c, g] = cv2(512, 512); g.fillStyle = '#fbf7ea'; g.beginPath(); g.arc(256, 256, 244, 0, 7); g.fill(); g.lineWidth = 20; g.strokeStyle = '#2a2420'; g.stroke();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#2a2420';
  for (let v = 0; v <= 1000; v += 50) { const a = (-135 + 270 * v / 1000) * Math.PI / 180, big = v % 250 === 0; g.lineWidth = big ? 9 : 4; g.beginPath(); g.moveTo(256 + Math.sin(a) * (big ? 170 : 190), 256 - Math.cos(a) * (big ? 170 : 190)); g.lineTo(256 + Math.sin(a) * 222, 256 - Math.cos(a) * 222); g.stroke();
    if (big) { g.font = FONT(v === 750 ? 50 : 40); g.fillStyle = v === 750 ? '#c8323a' : '#2a2420'; g.fillText(String(v), 256 + Math.sin(a) * 128, 256 - Math.cos(a) * 128); } }
  g.fillStyle = '#2a2420'; g.font = FONT(54); g.fillText('LB', 256, 380); return c; };
const ovenTex = () => { const [c, g] = cv2(512, 1024), r = P.rng(8); g.fillStyle = '#b4bcc0'; g.fillRect(0, 0, 512, 1024);
  for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(255,255,255,${.04 + r() * .06})`; g.fillRect(r() * 512, 0, 3 + r() * 6, 1024); }
  g.fillStyle = '#8f989d'; g.fillRect(30, 30, 452, 230); g.strokeStyle = '#3a4246'; g.lineWidth = 8; g.strokeRect(30, 30, 452, 230);
  for (const [x, col] of [[110, '#2a2c30'], [256, '#2a2c30'], [402, '#2a2c30']]) { g.fillStyle = '#e8e4d8'; g.beginPath(); g.arc(x, 130, 52, 0, 7); g.fill(); g.lineWidth = 8; g.stroke(); g.fillStyle = col; g.beginPath(); g.arc(x, 130, 24, 0, 7); g.fill(); g.fillRect(x - 4, 82, 8, 30); }
  g.fillStyle = '#d23a2a'; g.beginPath(); g.arc(256, 225, 16, 0, 7); g.fill();
  g.fillStyle = '#9aa3a8'; g.fillRect(40, 300, 432, 420); g.lineWidth = 10; g.strokeRect(40, 300, 432, 420);
  g.fillStyle = '#26323a'; g.fillRect(100, 360, 312, 230); g.fillStyle = 'rgba(255,220,140,.35)'; g.fillRect(120, 380, 272, 190); g.lineWidth = 8; g.strokeStyle = '#3a4246'; g.strokeRect(100, 360, 312, 230);
  g.fillStyle = '#5a6268'; g.fillRect(420, 450, 30, 120);
  g.fillStyle = '#2f3438'; g.fillRect(150, 640, 212, 46); g.fillStyle = '#f2ecd8'; g.font = FONT(30); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MICROWAVE OVEN', 256, 664);
  g.fillStyle = '#5a6268'; for (let i = 0; i < 9; i++) g.fillRect(80, 770 + i * 24, 352, 10);
  g.strokeStyle = '#3a4246'; g.lineWidth = 12; g.strokeRect(0, 0, 512, 1024); return c; };
const brickTex = () => { const [c, g] = cv2(256, 256), r = P.rng(11); g.fillStyle = '#d8cfc2'; g.fillRect(0, 0, 256, 256);
  for (let j = 0; j < 16; j++) for (let i = -1; i < 5; i++) { const x = i * 64 + (j % 2) * 32, y = j * 16; g.fillStyle = `hsl(${8 + r() * 10},${45 + r() * 15}%,${36 + r() * 12}%)`; g.fillRect(x + 2, y + 2, 60, 12); } return c; };
const asphalt = () => { const [c, g] = cv2(256, 256), r = P.rng(12); g.fillStyle = '#6e6c6a'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 600; i++) { g.fillStyle = `rgba(${r() < .5 ? 40 : 160},${r() < .5 ? 40 : 160},${r() < .5 ? 40 : 160},${.08 + r() * .1})`; g.fillRect(r() * 256, r() * 256, 2, 2); } return c; };
const signTex = (lines, sizes, bg = '#2f4f6a', fg = '#f4f1e6', W = 1024, Hh = 512) => { const [c, g] = cv2(W, Hh); g.fillStyle = bg; g.fillRect(0, 0, W, Hh);
  g.strokeStyle = fg; g.lineWidth = 16; g.strokeRect(26, 26, W - 52, Hh - 52); g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((t, i) => { g.font = FONT(sizes[i]); g.fillStyle = fg; g.fillText(t, W / 2, Hh * (i + 0.5) / lines.length + (lines.length > 1 ? (i ? -14 : 14) : 0)); }); return c; };
const panelTex = () => { const [c, g] = cv2(256, 512), r = P.rng(17); g.fillStyle = '#efe4c8'; g.fillRect(0, 0, 256, 512);
  g.fillStyle = '#7a4e2e'; g.fillRect(0, 300, 256, 212); for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(40,20,10,.35)'; g.fillRect(i * 64, 300, 4, 212); }
  for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(60,30,15,${.05 + r() * .08})`; g.fillRect(r() * 256, 300 + r() * 212, 40 + r() * 60, 2); }
  g.fillStyle = '#5a3a22'; g.fillRect(0, 294, 256, 10); return c; };
const certTex = () => { const [c, g] = cv2(640, 480); g.fillStyle = '#5a3a22'; g.fillRect(0, 0, 640, 480); g.fillStyle = '#f7f0da'; g.fillRect(34, 34, 572, 412);
  g.strokeStyle = '#b8902a'; g.lineWidth = 6; g.strokeRect(54, 54, 532, 372); g.fillStyle = '#2a2420'; g.textAlign = 'center'; g.font = FONT(64); g.fillText('PATENT', 320, 130);
  g.font = FONT(26); g.fillText('METHOD OF TREATING FOODSTUFFS', 320, 190);
  g.strokeStyle = '#2a2420'; g.lineWidth = 4; g.strokeRect(220, 220, 200, 130); g.fillStyle = '#c8d0d4'; g.fillRect(222, 222, 196, 126); g.fillStyle = '#3a4a52'; g.fillRect(240, 240, 120, 90);
  g.fillStyle = '#c8323a'; g.beginPath(); g.arc(520, 370, 40, 0, 7); g.fill(); g.fillStyle = '#e8c060'; g.beginPath(); g.arc(520, 370, 26, 0, 7); g.fill(); return c; };
const blindsTex = () => { const [c, g] = cv2(256, 320); g.fillStyle = '#f6eed2'; g.fillRect(0, 0, 256, 320); g.fillStyle = '#d8caa0'; for (let i = 0; i < 20; i++) g.fillRect(0, i * 16 + 10, 256, 5);
  g.fillStyle = '#5a3a22'; g.fillRect(0, 0, 256, 10); g.fillRect(0, 310, 256, 10); g.fillRect(0, 0, 10, 320); g.fillRect(246, 0, 10, 320); return c; };
const scopeTex = () => { const [c, g] = cv2(256, 192); g.fillStyle = '#103020'; g.fillRect(0, 0, 256, 192); g.strokeStyle = 'rgba(120,255,160,.25)'; g.lineWidth = 2;
  for (let i = 1; i < 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, 192); g.stroke(); } for (let j = 1; j < 6; j++) { g.beginPath(); g.moveTo(0, j * 32); g.lineTo(256, j * 32); g.stroke(); }
  g.strokeStyle = '#7dffa8'; g.lineWidth = 5; g.beginPath(); for (let x = 0; x <= 256; x += 4) { const y = 96 + 50 * Math.sin(x / 14); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); return c; };
const domeTex = () => { const [c, g] = cv2(512, 256), r = P.rng(19); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#1a2a5a'); gr.addColorStop(1, '#0e1838'); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${90 + r() * 60},${130 + r() * 60},${220},${.08 + r() * .12})`; g.beginPath(); g.ellipse(r() * 512, r() * 256, 10 + r() * 40, 8 + r() * 26, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(200,225,255,${.2 + r() * .4})`; g.beginPath(); g.arc(r() * 512, r() * 256, 1 + r() * 2, 0, 7); g.fill(); } return c; };

// ---------- materials ----------
const basic = (c, opts = {}) => new THREE.MeshBasicMaterial({ map: clampTex(c), fog: false, ...opts });
const MM = {
  tiles: texM(tiles(), 9, 4.5), wall: texM(wallTex(), 1, 1), trim: toon({ color: '#4f6a5a' }), pipe: toon({ color: '#8a8f86' }), pipeD: toon({ color: '#5c625c' }),
  win: basic(windowTex()), winOut: basic(windowTex(4, 3)),
  bench: toon({ color: '#9a6e40' }), benchD: toon({ color: '#6a4a2a' }), steel: toon({ color: '#7d878a' }), steelD: toon({ color: '#3a4044' }), green: toon({ color: '#5f7a6a' }), greenD: toon({ color: '#3f5446' }),
  copper: toon({ color: '#d08a4a' }), copperD: toon({ color: '#9a5a2a' }), magnet: toon({ color: '#c8323a' }), black: toon({ color: '#26242a' }), white: toon({ color: '#f2f0e8' }), cream: toon({ color: '#ece2c8' }),
  brass: toon({ color: '#d0a34a' }), glass: toon({ color: '#9fb7c4' }), lampShade: toon({ color: '#3f5a4a' }), bulb: new THREE.MeshBasicMaterial({ color: '#fff2c0' }),
  glow: new THREE.MeshBasicMaterial({ color: '#ffb070' }), redLamp: new THREE.MeshBasicMaterial({ color: '#ff4a3a' }),
  chalk: toon({ map: clampTex(chalkTex()) }), volt: toon({ map: clampTex(voltTex()) }), clock: toon({ map: clampTex(clockTex()) }), dial: toon({ map: clampTex(dialTex()) }),
  oven: toon({ map: clampTex(ovenTex()) }), ovenSide: toon({ color: '#a4acb0' }), scope: basic(scopeTex()),
  popcorn: toon({ color: '#fbf5e4' }), hull: toon({ color: '#e8b84a' }), egg: toon({ color: '#fbf3e2' }), kettle: toon({ color: '#c3c9cc' }), kettleD: toon({ color: '#4a4e52' }),
  brick: texM(brickTex(), 1, 1), asphalt: texM(asphalt(), 30, 30), curb: toon({ color: '#c8c2b4' }), roofM: toon({ color: '#5a5e66' }), doorM: toon({ color: '#3f5a4a' }),
  sign: toon({ map: clampTex(signTex(['RADAR LAB'], [150], '#2f4f6a'))}), date: new THREE.MeshToonMaterial({ gradientMap: grad, map: clampTex(signTex(['1945'], [300], '#2f5e3a')), side: THREE.DoubleSide }),
  post: toon({ color: '#6b4e34' }), trunk: toon({ color: '#6a4a32' }), leaf: toon({ color: '#5c8a3c' }), leaf2: toon({ color: '#6c9a42' }), leaf3: toon({ color: '#4c7a36' }),
  car: toon({ color: '#2f4a6a' }), carD: toon({ color: '#1f2f44' }), chrome: toon({ color: '#d8dde0' }),
  panel: texM(panelTex(), 1, 1), cert: toon({ map: clampTex(certTex()) }), blinds: basic(blindsTex()), desk: toon({ color: '#7a4e2e' }), deskD: toon({ color: '#5a3622' }), lampG: toon({ color: '#2f6a4a' }),
  plank: M.plank, grass: M.grass,
  dome: new THREE.MeshBasicMaterial({ map: P.tex(domeTex(), 3, 2), side: THREE.BackSide, fog: false }), bub: toon({ color: '#4a6aaa' }), bub2: toon({ color: '#6a8ac8' }),
};
const put = (geo, mat, x, y, z, parent = world, opts = {}) => add(geo, mat, x, y, z, parent, opts);
const grp = (x, y, z, ry = 0, parent = world) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); return g; };
const flat = (w, d, mat, x, y, z, parent = world) => { const m = put(new THREE.PlaneGeometry(w, d), mat, x, y, z, parent, { cast: false }); m.rotation.x = -Math.PI / 2; return m; };
const cyl = (r0, r1, h, n = 12) => new THREE.CylinderGeometry(r0, r1, h, n);
const waterU = { t: { value: 0 }, deep: { value: new THREE.Color('#2f6f8f') }, shal: { value: new THREE.Color('#5fa8bf') }, glint: { value: new THREE.Color('#e9f6ff') } };

// ---------- ground outside ----------
const ground = flat(3000, 3000, MM.grass, 0, -0.03, 0);

// ================= the lab =================
flat(18, 9, MM.tiles, 0, 0.0, -1.5);
put(tbox(18.6, 5, 0.3, 2), MM.wall, 0, 2.5, -6.15);
for (const s of [-1, 1]) put(tbox(0.3, 5, 9.3, 2), MM.wall, s * 9.15, 2.5, -1.5);
put(tbox(18, 0.12, 0.06, 1), MM.trim, 0, 0.06, -5.98); // skirting
// windows high on the back and left walls
for (const x of [-7.3, -4.7, 2.8]) { put(new THREE.PlaneGeometry(1.9, 2.1), MM.win, x, x > 0 ? 3.85 : 3.45, -5.99, world, { cast: false }); put(tbox(2.05, 0.12, 0.2, 1), MM.trim, x, x > 0 ? 2.75 : 2.35, -5.92); }
for (const z of [-3.6, -0.6]) { const w = put(new THREE.PlaneGeometry(2.0, 2.1), MM.win, -8.99, 3.5, z, world, { cast: false }); w.rotation.y = Math.PI / 2; }
// pipes along the top of the back wall
for (const y of [4.55, 4.8]) { const pp = put(cyl(0.07, 0.07, 18, 10), y > 4.7 ? MM.pipeD : MM.pipe, 0, y, -5.88); pp.rotation.z = Math.PI / 2; }
// hanging lamps (cords run up out of frame)
for (const [x, z] of [[-6, -3.2], [-2, -3.2], [2, -3.2], [6, -3.2], [-4, 0.2], [4, 0.2]]) {
  put(cyl(0.012, 0.012, 2.4, 4), MM.black, x, 5.6, z, world, { cast: false });
  put(new THREE.ConeGeometry(0.42, 0.32, 16, 1, true), MM.lampShade, x, 4.3, z);
  put(new THREE.SphereGeometry(0.11, 10, 8), MM.bulb, x, 4.14, z, world, { cast: false });
}
// clock and the voltage sign
{ const ck = put(cyl(0.38, 0.38, 0.06, 28), MM.clock, 0.6, 3.95, -5.96); ck.rotation.x = Math.PI / 2; }
put(new THREE.PlaneGeometry(1.1, 0.55), MM.volt, -1.6, 2.35, -5.98, world, { cast: false });
// chalkboard
put(tbox(2.75, 1.5, 0.06, 1), MM.benchD, 2.8, 1.85, -5.98); put(new THREE.PlaneGeometry(2.6, 1.42), MM.chalk, 2.8, 1.85, -5.94, world, { cast: false });
put(tbox(2.6, 0.06, 0.14, 1), MM.benchD, 2.8, 1.08, -5.9);

// ---- the workbench (back left) with a row of finished magnetrons ----
const magnetronGeo = (parent, x, y, z, s = 1) => { const g = grp(x, y, z, 0, parent); g.scale.setScalar(s);
  put(tbox(0.36, 0.3, 0.3, 1), MM.copper, 0, 0.15, 0, g); for (let i = 0; i < 4; i++) put(tbox(0.4, 0.025, 0.34, 1), MM.copperD, 0, 0.05 + i * 0.07, 0, g);
  put(cyl(0.05, 0.05, 0.14, 10), MM.steel, 0, 0.36, 0, g); for (const sx of [-1, 1]) put(tbox(0.06, 0.34, 0.34, 1), MM.magnet, sx * 0.21, 0.17, 0, g); return g; };
{ const g = grp(-6.1, 0, -5.4);
  put(tbox(5.0, 0.1, 1.0, 1), MM.bench, 0, 0.95, 0, g); put(tbox(5.0, 0.06, 0.9, 1), MM.benchD, 0, 0.3, 0, g);
  for (const x of [-2.4, 2.4]) for (const z of [-0.42, 0.42]) put(tbox(0.08, 0.95, 0.08, 1), MM.steelD, x, 0.47, z, g);
  for (let i = 0; i < 6; i++) magnetronGeo(g, -2.0 + i * 0.42, 1.0, -0.15, 0.85);
  // oscilloscope
  put(tbox(0.7, 0.5, 0.55, 1), MM.green, 1.8, 1.25, -0.1, g); put(new THREE.PlaneGeometry(0.42, 0.32), MM.scope, 1.75, 1.28, 0.18, g, { cast: false });
  for (const x of [2.06, 2.06]) { const k = put(cyl(0.04, 0.04, 0.04, 10), MM.black, x, 1.18, 0.18, g); k.rotation.x = Math.PI / 2; }
  // soldering iron stand + spools
  put(cyl(0.12, 0.14, 0.05, 12), MM.steelD, 0.6, 1.03, 0.2, g); const iron = put(cyl(0.02, 0.03, 0.4, 8), MM.black, 0.6, 1.18, 0.2, g); iron.rotation.z = 0.9;
  for (const [x, col] of [[1.05, MM.magnet], [1.25, MM.brass]]) put(cyl(0.07, 0.07, 0.1, 12), col, x, 1.05, 0.25, g); }
// ---- the assembly table in the room, where Percy builds tubes (he stands behind it, facing the camera) ----
const ASSY = { x: -5.6, z: -2.9 };
{ const g = grp(ASSY.x, 0, ASSY.z);
  put(tbox(2.1, 0.08, 0.8, 1), MM.bench, 0, 0.95, 0, g); put(tbox(2.1, 0.86, 0.05, 1), MM.benchD, 0, 0.48, 0.36, g);
  for (const x of [-1.0, 1.0]) put(tbox(0.06, 0.92, 0.75, 1), MM.benchD, x, 0.46, 0, g);
  for (const [x, s] of [[-0.75, 0.8], [-0.35, 0.8], [0.65, 0.8]]) magnetronGeo(g, x, 0.99, -0.05, s);
  for (let i = 0; i < 5; i++) put(tbox(0.12, 0.025, 0.14, 1), MM.copperD, 0.15 + (i % 3) * 0.12, 1.0 + Math.floor(i / 3) * 0.03, 0.12, g);
  const sd = put(cyl(0.012, 0.012, 0.22, 6), MM.magnet, 0.35, 1.0, 0.2, g); sd.rotation.z = Math.PI / 2; sd.rotation.y = 0.5; }
// ---- shelves (back right) ----
{ const g = grp(7.3, 0, -5.75);
  for (const s of [-1, 1]) put(tbox(0.06, 2.9, 0.42, 1), MM.benchD, s * 1.2, 1.45, 0, g);
  for (const y of [0.4, 1.15, 1.9, 2.65]) put(tbox(2.46, 0.05, 0.42, 1), MM.bench, 0, y, 0, g);
  for (let i = 0; i < 5; i++) magnetronGeo(g, -0.9 + i * 0.45, 1.18, 0, 0.7);
  for (let i = 0; i < 4; i++) put(tbox(0.4, 0.3 + (i % 2) * 0.1, 0.32, 1), i % 2 ? MM.cream : MM.green, -0.8 + i * 0.55, 2.08, 0, g);
  for (let i = 0; i < 6; i++) put(cyl(0.09, 0.09, 0.28, 10), i % 2 ? MM.glass : MM.steel, -1.0 + i * 0.4, 0.57, 0, g); }

// ---- the running tube: the test rig (x -1.6) ----
const RIG = { x: -1.6, z: -3.9 };
const rigGlow = [];
{ const g = grp(RIG.x, 0, RIG.z);
  put(tbox(1.15, 1.25, 0.85, 1), MM.green, 0, 0.625, 0, g); put(tbox(1.2, 0.08, 0.9, 1), MM.greenD, 0, 1.27, 0, g);
  for (const [x, y] of [[-0.32, 0.92], [0, 0.92], [0.32, 0.92]]) { const d = put(cyl(0.11, 0.11, 0.03, 20), MM.cream, x, y, 0.43, g); d.rotation.x = Math.PI / 2; const n = put(tbox(0.015, 0.09, 0.01, 1), MM.black, x + 0.02, y + 0.03, 0.45, g); n.rotation.z = -0.5; }
  for (const x of [-0.3, 0.3]) { const k = put(cyl(0.05, 0.05, 0.05, 12), MM.black, x, 0.6, 0.44, g); k.rotation.x = Math.PI / 2; }
  rigGlow.push(put(new THREE.SphereGeometry(0.045, 10, 8), MM.redLamp, 0.0, 0.62, 0.43, g, { cast: false }));
  put(tbox(0.7, 0.3, 0.02, 1), MM.steelD, 0, 0.3, 0.43, g);
  // the magnetron on top: copper block, fins, red magnet, cooling fins, output stub
  const m = grp(0, 1.31, 0, 0, g);
  put(tbox(0.46, 0.4, 0.42, 1), MM.copper, 0, 0.2, 0, m); for (let i = 0; i < 5; i++) put(tbox(0.54, 0.025, 0.5, 1), MM.copperD, 0, 0.05 + i * 0.075, 0, m);
  put(tbox(0.12, 0.5, 0.5, 1), MM.magnet, -0.3, 0.22, 0, m); put(tbox(0.12, 0.5, 0.5, 1), MM.magnet, 0.3, 0.22, -0.02, m);
  put(cyl(0.06, 0.06, 0.2, 10), MM.steel, 0, 0.5, 0, m);
  // waveguide to the right and the horn
  put(tbox(0.55, 0.16, 0.24, 1), MM.copperD, 0.55, 0.14, 0, m);
  const horn = new THREE.CylinderGeometry(0.36, 0.1, 0.5, 4, 1, true); horn.rotateY(Math.PI / 4); horn.rotateZ(-Math.PI / 2);
  const hm = put(horn, MM.copper, 1.07, 0.14, 0, m); hm.material = MM.copper; hm.material.side = THREE.DoubleSide;
  const gl = put(new THREE.PlaneGeometry(0.46, 0.46), MM.glow, 1.3, 0.14, 0, m, { cast: false }); gl.rotation.y = Math.PI / 2; rigGlow.push(gl);
  // cables to the wall
  for (const dz of [-0.2, 0.2]) { const c = put(cyl(0.035, 0.035, 2.3, 6), MM.black, -0.4, 1.0, -1.0 + dz * 0.2, g); c.rotation.x = 0.9; }
}
const HORN = { x: RIG.x + 1.32, y: 1.45, z: RIG.z };
// ---- the test table (x 0) ----
const TABLE = { x: 0.05, z: -3.9, h: 1.15 };
{ const g = grp(TABLE.x, 0, TABLE.z);
  put(tbox(0.85, 0.06, 0.65, 1), MM.bench, 0, TABLE.h, 0, g);
  for (const x of [-0.37, 0.37]) for (const z of [-0.27, 0.27]) put(tbox(0.05, TABLE.h, 0.05, 1), MM.steelD, x, TABLE.h / 2, z, g); }
// the kettle with a hole cut in its side, and the egg
const kettle = grp(TABLE.x, TABLE.h + 0.03, TABLE.z);
{ put(cyl(0.2, 0.24, 0.3, 20), MM.kettle, 0, 0.15, 0, kettle); put(new THREE.SphereGeometry(0.2, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), MM.kettle, 0, 0.3, 0, kettle);
  put(cyl(0.04, 0.05, 0.05, 10), MM.kettleD, 0, 0.5, 0, kettle);
  const sp = put(cyl(0.03, 0.05, 0.28, 8), MM.kettle, 0.27, 0.22, 0, kettle); sp.rotation.z = -0.9;
  const hd = put(new THREE.TorusGeometry(0.16, 0.025, 6, 16, Math.PI), MM.kettleD, 0, 0.42, 0, kettle);
  const hole = put(new THREE.CircleGeometry(0.075, 18), MM.black, -0.215, 0.16, 0.0, kettle, { cast: false }); hole.rotation.y = -Math.PI / 2 - 0.0; }
const egg = put(new THREE.SphereGeometry(0.075, 16, 12), MM.egg, 0, 0, 0); egg.scale.set(1, 1.28, 1); egg.visible = false;
// popcorn: pieces everywhere after the pop (revealed in order)
const popcorn = [];
{ const r = P.rng(71), spots = [[TABLE.x, TABLE.h + 0.06, TABLE.z, 0.42, 0.3], [-0.4, 0.04, -3.0, 2.6, 1.8], [-6.1, 1.04, -5.15, 2.2, 0.3], [1.6, 0.04, -2.2, 2.2, 1.6]];
  const pg = new THREE.SphereGeometry(0.05, 9, 7);
  for (let i = 0; i < 220; i++) { const [x, y, z, w, d] = spots[i < 30 ? 0 : i < 150 ? 1 : i < 180 ? 2 : 3];
    const m = put(pg, i % 7 ? MM.popcorn : MM.hull, x + (r() - 0.5) * w, y, z + (r() - 0.5) * d, world, { cast: false }); m.rotation.set(r() * 6, r() * 6, r() * 6); const k = 0.8 + r() * 0.6; m.scale.set(k * 1.15, k * 0.8, k); m.position.y += 0.03 * k; m.visible = false; popcorn.push(m); } }

// ---- the 1947 oven, its dolly, and the platform scale (x ~6) ----
const SCALE = { x: 6.2, z: -3.3 };
{ const g = grp(SCALE.x, 0, SCALE.z);
  put(tbox(1.5, 0.16, 1.3, 1), MM.steel, 0, 0.08, 0, g); put(tbox(1.38, 0.02, 1.18, 1), MM.steelD, 0, 0.165, 0, g);
  put(tbox(0.16, 1.75, 0.16, 1), MM.green, 0.95, 0.875, -0.45, g); }
const DIAL = { x: SCALE.x + 0.95, y: 1.92, z: SCALE.z - 0.36 };
{ const d = put(cyl(0.36, 0.36, 0.1, 32), MM.green, DIAL.x, DIAL.y, DIAL.z - 0.02); d.rotation.x = Math.PI / 2;
  const f = put(new THREE.CircleGeometry(0.32, 32), MM.dial, DIAL.x, DIAL.y, DIAL.z + 0.035, world, { cast: false }); }
const needle = grp(DIAL.x, DIAL.y, DIAL.z + 0.05);
{ put(tbox(0.02, 0.27, 0.012, 1), MM.magnet, 0, 0.12, 0, needle, { cast: false }); put(cyl(0.03, 0.03, 0.02, 12), MM.black, 0, 0, 0.005, needle).rotation.x = Math.PI / 2; }
const oven = grp(3.9, 0, -3.3);
{ const body = put(tbox(1.05, 2.15, 0.9, 1), MM.ovenSide, 0, 1.075 + 0.08, 0, oven); put(new THREE.PlaneGeometry(1.0, 2.1), MM.oven, 0, 1.155, 0.452, oven, { cast: false });
  put(tbox(1.12, 0.08, 0.96, 1), MM.steelD, 0, 2.27, 0, oven); put(tbox(1.05, 0.08, 0.9, 1), MM.steelD, 0, 0.06, 0, oven);
  const hose = put(new THREE.TorusGeometry(0.22, 0.04, 6, 18), MM.black, 0.15, 2.34, 0, oven); hose.rotation.x = Math.PI / 2; }
const dolly = grp(3.9, 0, -3.3);
{ put(tbox(1.2, 0.06, 1.0, 1), MM.benchD, 0, 0.1, 0, dolly); for (const x of [-0.5, 0.5]) for (const z of [-0.4, 0.4]) { const w = put(cyl(0.06, 0.06, 0.05, 10), MM.black, x, 0.06, z, dolly); w.rotation.x = Math.PI / 2; } }

// ================= the building, outside (z ~ -85) =================
const BLD = { z: -78 };
{ put(tbox(36, 8, 14, 2), MM.brick, 0, 4, BLD.z - 7);
  // sawtooth roof
  for (let i = 0; i < 6; i++) { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(6, 0); sh.lineTo(0, 1.8); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 14, bevelEnabled: false }); geo.translate(0, 0, -7); put(geo, MM.roofM, -18 + i * 6, 8, BLD.z - 7); }
  for (const row of [0, 1]) for (let i = 0; i < 8; i++) { const x = -15.75 + i * 4.5; if (row === 0 && Math.abs(x) < 3) continue;
    put(new THREE.PlaneGeometry(2.6, 2.4), MM.winOut, x, 2.3 + row * 3.4, BLD.z + 0.02, world, { cast: false }); put(tbox(2.8, 0.15, 0.25, 1), MM.curb, x, 1.05 + row * 3.4, BLD.z + 0.1); }
  put(tbox(3.2, 3.0, 0.2, 1), MM.doorM, 0, 1.5, BLD.z + 0.05); put(tbox(0.06, 2.9, 0.06, 1), MM.black, 0, 1.45, BLD.z + 0.18);
  put(tbox(4.2, 0.18, 1.6, 1), MM.steelD, 0, 3.4, BLD.z + 0.8); for (const s of [-1, 1]) put(cyl(0.05, 0.05, 3.4, 8), MM.steelD, s * 1.9, 1.7, BLD.z + 1.5);
  put(new THREE.PlaneGeometry(5.2, 1.3), MM.sign, 0, 4.6, BLD.z + 0.04, world, { cast: false });
  for (const s of [-1, 1]) put(tbox(3.6, 0.2, 2.2, 1), MM.curb, s * 0.0, 0.1, BLD.z + 1.1); }
flat(60, 30, MM.asphalt, 0, -0.015, BLD.z + 16);
flat(4, 14, MM.curb, 0, -0.01, BLD.z + 8.5);
// the radar dish on the roof (turns)
const dish = grp(3.5, 9.2, BLD.z - 4);
{ put(cyl(0.35, 0.5, 1.4, 12), MM.steelD, 0, -0.5, 0, dish); }
const dishHead = grp(0, 0.4, 0, 0, dish);
{ const yoke = put(tbox(0.2, 1.4, 0.2, 1), MM.steel, 0, 0.6, 0, dishHead);
  const dg = new THREE.SphereGeometry(2.6, 28, 10, 0, Math.PI * 2, 0, 0.62); dg.rotateX(-Math.PI / 2 - 0.45);
  const dm = put(dg, new THREE.MeshToonMaterial({ gradientMap: grad, color: '#d8dde0', side: THREE.DoubleSide }), 0, 1.3 + 2.3, -2.6 * Math.cos(0.45) + 0.2, dishHead);
  const feed = put(cyl(0.05, 0.05, 1.9, 6), MM.steelD, 0, 1.75, 0.55, dishHead); feed.rotation.x = -1.1; }
// trees, lamp posts and a parked car on the forecourt
const tree = (x, z, h = 6, s = 1) => { const g = grp(x, 0, z, rW() * 6); g.scale.setScalar(s); put(cyl(0.18, 0.28, h * 0.6, 7), MM.trunk, 0, h * 0.3, 0, g);
  for (const [cx, cy, cz, r] of [[0, h * 0.75, 0, 1.9], [1.1, h * 0.62, 0.3, 1.3], [-1.0, h * 0.66, -0.4, 1.4], [0.2, h * 0.92, 0.5, 1.2]]) { const c = put(new THREE.SphereGeometry(r, 10, 8), [MM.leaf, MM.leaf2, MM.leaf3][Math.floor(rW() * 3)], cx, cy, cz, g); c.scale.y = 0.8; } return g; };
for (const [x, z, h] of [[-9, BLD.z + 4, 7], [9.5, BLD.z + 4.5, 6.5], [-16, BLD.z + 9, 8], [15, BLD.z + 10, 7], [-14, BLD.z + 26, 6], [16, BLD.z + 28, 7]]) tree(x, z, h);
for (let i = 0; i < 30; i++) { const a = rW() * Math.PI * 2, d = 120 + rW() * 160; tree(Math.cos(a) * d, BLD.z + Math.sin(a) * d, 8 + rW() * 5, 1.3); }
for (const x of [-5, 5]) { put(cyl(0.06, 0.08, 4.2, 8), MM.steelD, x, 2.1, BLD.z + 9); put(new THREE.SphereGeometry(0.22, 10, 8), MM.bulb, x, 4.3, BLD.z + 9); }
{ const g = grp(-6.5, 0, BLD.z + 12, 0.3);
  put(tbox(4.4, 0.7, 1.7, 1), MM.car, 0, 0.75, 0, g); put(tbox(2.2, 0.7, 1.5, 1), MM.car, -0.3, 1.45, 0, g); put(box(0.06, 0.55, 1.3), MM.glass, 0.82, 1.45, 0, g, { cast: false });
  for (const s of [-1, 1]) put(box(1.6, 0.45, 0.04), MM.glass, -0.3, 1.47, s * 0.76, g, { cast: false });
  for (const [x, z] of [[1.4, 0.8], [1.4, -0.8], [-1.4, 0.8], [-1.4, -0.8]]) { const w = put(cyl(0.38, 0.38, 0.25, 16), MM.black, x, 0.38, z, g); w.rotation.x = Math.PI / 2; const f = put(new THREE.SphereGeometry(0.55, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), MM.carD, x, 0.55, z * 1.02, g); f.scale.set(1.3, 0.7, 0.55); }
  put(tbox(0.12, 0.3, 1.8, 1), MM.chrome, 2.25, 0.55, 0, g); put(tbox(0.12, 0.3, 1.8, 1), MM.chrome, -2.25, 0.55, 0, g); }
// far hills
for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, d = 900 + rW() * 200, r = 160 + rW() * 140; const m = put(new THREE.SphereGeometry(r, 18, 10), i % 2 ? M.hill : M.hillFar, Math.cos(a) * d, -r * 0.86, BLD.z + Math.sin(a) * d, world, { cast: false }); m.scale.y = 0.4; }
// the date sign on the lawn (pops up)
const signG = grp(0.1, 0, BLD.z + 16, -0.1);
put(cyl(0.07, 0.07, 2.4, 6), MM.post, -0.9, 1.2, 0, signG); put(cyl(0.07, 0.07, 2.4, 6), MM.post, 0.9, 1.2, 0, signG);
put(new THREE.PlaneGeometry(2.2, 1.1), MM.date, 0, 1.85, 0.08, signG);

// ================= the boss's office (x ~30) =================
const OFF = { x: 30, z: -1 };
{ const g = grp(OFF.x, 0, OFF.z);
  const fl = put(new THREE.PlaneGeometry(8, 7), MM.plank, 0, 0.0, 0, g, { cast: false }); fl.rotation.x = -Math.PI / 2;
  put(tbox(8.4, 4.2, 0.2, 2), MM.panel, 0, 2.1, -3.1, g); put(tbox(0.2, 4.2, 7, 2), MM.panel, -4.1, 2.1, 0, g);
  put(new THREE.PlaneGeometry(1.2, 0.9), MM.cert, -1.0, 2.25, -2.98, g, { cast: false });
  put(new THREE.PlaneGeometry(1.7, 2.0), MM.blinds, 2.3, 2.3, -2.98, g, { cast: false });
  // desk, lamp, phone, in-tray, filing cabinet, plant
  put(tbox(2.3, 0.08, 1.0, 1), MM.desk, 0.6, 0.95, -1.6, g); put(tbox(2.3, 0.88, 0.06, 1), MM.deskD, 0.6, 0.47, -1.12, g);
  for (const s of [-1, 1]) put(tbox(0.06, 0.88, 0.95, 1), MM.deskD, 0.6 + s * 1.12, 0.47, -1.6, g);
  put(cyl(0.1, 0.12, 0.04, 12), MM.brass, 1.4, 1.01, -1.8, g); put(cyl(0.015, 0.015, 0.38, 6), MM.brass, 1.4, 1.2, -1.8, g);
  const sh = put(new THREE.CylinderGeometry(0.06, 0.2, 0.14, 16, 1, false, 0, Math.PI), MM.lampG, 1.4, 1.4, -1.75, g); sh.rotation.z = Math.PI / 2; sh.rotation.y = Math.PI / 2;
  put(tbox(0.28, 0.08, 0.2, 1), MM.black, -0.1, 1.03, -1.7, g); put(tbox(0.3, 0.05, 0.08, 1), MM.black, -0.1, 1.1, -1.7, g);
  put(tbox(0.42, 0.08, 0.32, 1), MM.desk, 0.3, 1.03, -1.85, g); put(tbox(0.36, 0.03, 0.26, 1), MM.cream, 0.3, 1.08, -1.85, g);
  put(tbox(0.7, 1.4, 0.6, 1), MM.steel, -3.4, 0.7, -2.6, g); for (let i = 0; i < 3; i++) put(tbox(0.4, 0.05, 0.02, 1), MM.brass, -3.4, 0.35 + i * 0.42, -2.29, g);
  put(cyl(0.2, 0.16, 0.4, 12), MM.copperD, 3.4, 0.2, -2.6, g); for (let i = 0; i < 5; i++) { const l = put(new THREE.SphereGeometry(0.22, 8, 6), MM.leaf, 3.4 + Math.cos(i * 1.3) * 0.2, 0.62 + (i % 2) * 0.2, -2.6 + Math.sin(i * 1.3) * 0.2, g); l.scale.y = 1.3; } }

// ================= inside the food (x 200): a dark-blue dome with floating bubbles =================
const MICRO = { x: 200, y: 0, z: 0 };
const dome = put(new THREE.SphereGeometry(26, 32, 18), MM.dome, MICRO.x, 6, MICRO.z, world, { cast: false }); dome.userData.sky = true;
{ const r = P.rng(88); for (let i = 0; i < 70; i++) { const a = r() * Math.PI * 2, d = 4 + r() * 16, y = -2 + r() * 12;
  const b = put(new THREE.SphereGeometry(0.15 + r() * 0.45, 12, 8), r() < 0.5 ? MM.bub : MM.bub2, MICRO.x + Math.cos(a) * d, y, MICRO.z - 6 - r() * 14 + Math.sin(a) * 3, world, { cast: false }); } }

// ---------- clouds ----------
const clouds = [];
{ const r = P.rng(90);
  for (let i = 0; i < 12; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = -Math.PI / 2 + (r() - 0.5) * 2.2, d = 650 + r() * 250; m.position.set(Math.cos(a) * d, 120 + r() * 140, BLD.z + Math.sin(a) * d); m.scale.setScalar(160 + r() * 140);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }

// ---------- per-frame state ----------
function worldState(S, f) {
  waterU.t.value = f / 30;
  ground.visible = !S.micro;
  // the tube: glow pulses while it runs
  const run = S.run ?? 0, pulse = run * (0.75 + 0.25 * Math.sin(f * 0.9));
  MM.glow.color.setRGB(0.25 + 0.75 * pulse, 0.18 + 0.5 * pulse, 0.12 + 0.3 * pulse); MM.redLamp.color.set(run > 0 ? '#ff4a3a' : '#5a2a2a');
  // popcorn revealed in order
  const pc = Math.round((S.popcorn ?? 0) * popcorn.length); popcorn.forEach((m, i) => { m.visible = i < pc; });
  // kettle wobble and the egg
  kettle.rotation.z = S.wobble ?? 0; kettle.position.y = TABLE.h + 0.03 + Math.abs(S.wobble ?? 0) * 0.15;
  egg.visible = !!S.egg; if (S.egg) egg.position.set(S.egg[0], S.egg[1], S.egg[2]);
  // the oven, the dolly and the scale needle
  const O = S.oven || { x: 3.9, y: 0, rz: 0 }; oven.position.set(O.x, O.y, SCALE.z); oven.rotation.z = O.rz || 0; oven.visible = O.show !== false;
  dolly.visible = !!S.dolly; dolly.position.set(O.x, 0, SCALE.z);
  needle.rotation.z = -((-135 + 270 * Math.max(0, Math.min(1.05, (S.lb ?? 0) / 1000))) * Math.PI / 180);
  // outside: the dish turns, the date sign pops up
  dishHead.rotation.y = f * 0.035;
  signG.position.y = S.signY ?? -3; signG.visible = signG.position.y > -2.9;
  // inside the food: the dome warms up
  const h = S.heat ?? 0; MM.dome.color.setRGB(1, 1 - 0.35 * h, 1 - 0.7 * h); MM.bub.color.set(h > 0.5 ? '#c86a4a' : '#4a6aaa'); MM.bub2.color.set(h > 0.5 ? '#e89a6a' : '#6a8ac8');
}
