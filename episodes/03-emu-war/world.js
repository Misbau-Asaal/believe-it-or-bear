// ================= 03 The Emu War: wheat country, Campion, Western Australia (1932) =================
// Replaces the engine's example world (see tools/patch_engine.py). Ground level DECK = 0.
// Layout: dirt road along x at z 0..3. Wheat north of the road (z < -3). Farm, windmill and gums south.
// Army camp at x ~ 40 south of the road. Plan board in the paddock at x ~ -60.
const DECK = 0;
const world = new THREE.Group(); scene.add(world);
const helmet = new THREE.Group(); scene.add(helmet); helmet.visible = false;
const cv2 = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const clampTex = (c) => { const t = P.tex(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; };
const FONT = (s) => `bold ${s}px "DejaVu Sans", Arial, sans-serif`;
const rW = P.rng(32);

// ---------- textures ----------
const redEarth = () => { const [c, g] = cv2(256, 256), r = P.rng(4); g.fillStyle = '#b8653a'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 260; i++) { g.fillStyle = `hsla(${18 + r() * 14},${40 + r() * 20}%,${36 + r() * 22}%,${.25 + r() * .3})`; g.beginPath(); g.ellipse(r() * 256, r() * 256, 2 + r() * 9, 1 + r() * 5, r() * 3, 0, 7); g.fill(); }
  return c; };
const paddock = () => { const [c, g] = cv2(256, 256), r = P.rng(6); g.fillStyle = '#c7b06a'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 500; i++) { g.strokeStyle = `hsla(${40 + r() * 25},${35 + r() * 25}%,${40 + r() * 25}%,.55)`; g.lineWidth = 1 + r() * 1.5; const x = r() * 256, y = r() * 256; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 6, y - 4 - r() * 8); g.stroke(); }
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(160,90,50,${.15 + r() * .2})`; g.beginPath(); g.ellipse(r() * 256, r() * 256, 4 + r() * 12, 2 + r() * 6, 0, 0, 7); g.fill(); }
  return c; };
const wheatTop = () => { const [c, g] = cv2(256, 256), r = P.rng(8); g.fillStyle = '#e2b84e'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) { const x = r() * 256, y = r() * 256; g.fillStyle = `hsla(${38 + r() * 10},${60 + r() * 20}%,${48 + r() * 22}%,.9)`; g.beginPath(); g.ellipse(x, y, 1.6 + r() * 1.4, 4 + r() * 3, 0.3 + (r() - .5) * .4, 0, 7); g.fill(); }
  for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(150,100,30,${.08 + r() * .1})`; g.beginPath(); g.ellipse(r() * 256, r() * 256, 20 + r() * 40, 8 + r() * 16, 0, 0, 7); g.fill(); }
  return c; };
const wheatSide = () => { const [c, g] = cv2(256, 128), r = P.rng(9); g.fillStyle = '#c99a3a'; g.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 160; i++) { const x = r() * 256; g.strokeStyle = `hsl(${36 + r() * 10},${55 + r() * 15}%,${36 + r() * 20}%)`; g.lineWidth = 1.5 + r(); g.beginPath(); g.moveTo(x, 128); g.lineTo(x + (r() - .5) * 8, 10 + r() * 20); g.stroke();
    g.fillStyle = `hsl(${40 + r() * 8},70%,${52 + r() * 16}%)`; g.beginPath(); g.ellipse(x + (r() - .5) * 8, 10 + r() * 20, 3, 9, 0, 0, 7); g.fill(); }
  return c; };
const ironTex = () => { const [c, g] = cv2(128, 128); g.fillStyle = '#a9b0b4'; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,.22)' : 'rgba(40,50,60,.22)'; g.fillRect(i * 8, 0, 8, 128); }
  const r = P.rng(5); for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(150,80,40,${.1 + r() * .15})`; g.beginPath(); g.ellipse(r() * 128, r() * 128, 4 + r() * 10, 3 + r() * 8, 0, 0, 7); g.fill(); }
  return c; };
const weather = () => { const [c, g] = cv2(256, 256), r = P.rng(12); g.fillStyle = '#d8cdb6'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(90,70,50,.28)'; g.fillRect(0, i * 29, 256, 3); }
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(120,100,80,${.04 + r() * .08})`; g.fillRect(r() * 256, r() * 256, 30 + r() * 60, 2 + r() * 4); } return c; };
const signTex = (lines, sizes, bg = '#2f5e3a', fg = '#f4f1e6') => { const [c, g] = cv2(1024, 512); g.fillStyle = bg; g.fillRect(0, 0, 1024, 512);
  g.strokeStyle = fg; g.lineWidth = 16; g.strokeRect(30, 30, 964, 452); g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((t, i) => { g.font = FONT(sizes[i]); g.fillStyle = fg; g.fillText(t, 512, 512 * (i + 0.5) / lines.length + (i ? -14 : 14)); }); return c; };
const chalk = (g, pts, w = 8) => { g.strokeStyle = 'rgba(245,245,240,.92)'; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
const boardBase = (g, W, H) => { g.fillStyle = '#2f3b34'; g.fillRect(0, 0, W, H); const r = P.rng(15); for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(255,255,255,${.02 + r() * .04})`; g.beginPath(); g.ellipse(r() * W, r() * H, 30 + r() * 80, 10 + r() * 30, r(), 0, 7); g.fill(); } };
const planTex = () => { const [c, g] = cv2(1024, 680); boardBase(g, 1024, 680);
  g.fillStyle = '#f4f1e6'; g.textAlign = 'center'; g.font = FONT(64); g.fillText('THE PLAN', 512, 82);
  // the army: a box with a gun, left; the flock: a circle that splits into three arrows, right
  chalk(g, [[110, 300], [270, 300], [270, 400], [110, 400], [110, 300]]); g.font = FONT(44); g.fillText('ARMY', 190, 366);
  chalk(g, [[270, 330], [330, 330]], 10);
  chalk(g, [[640, 360], [640 + 70 * Math.cos(0), 360]], 0);
  g.beginPath(); g.strokeStyle = 'rgba(245,245,240,.92)'; g.lineWidth = 8; g.arc(560, 360, 70, 0, 7); g.stroke();
  for (const [x, y] of [[540, 340], [580, 350], [550, 385], [585, 380]]) { g.fillStyle = '#f4f1e6'; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); }
  for (const [dx, dy] of [[1, -0.9], [1.2, 0], [1, 0.9]]) { const x0 = 640, y0 = 360 + dy * 40, x1 = 640 + dx * 230, y1 = 360 + dy * 230; chalk(g, [[x0, y0], [x1, y1]]); const a = Math.atan2(y1 - y0, x1 - x0); chalk(g, [[x1 - 40 * Math.cos(a - 0.5), y1 - 40 * Math.sin(a - 0.5)], [x1, y1], [x1 - 40 * Math.cos(a + 0.5), y1 - 40 * Math.sin(a + 0.5)]]); }
  g.font = FONT(40); g.fillText('SPLIT UP', 860, 150); g.fillText('RUN', 900, 620);
  // emu footprints across the bottom
  for (let i = 0; i < 6; i++) { const x = 120 + i * 120, y = 560 + (i % 2) * 40; chalk(g, [[x, y], [x + 30, y - 22]], 6); chalk(g, [[x, y], [x + 34, y]], 6); chalk(g, [[x, y], [x + 30, y + 22]], 6); }
  g.strokeStyle = '#7a5434'; g.lineWidth = 26; g.strokeRect(0, 0, 1024, 680); return c; };
const tallyTex = () => { const [c, g] = cv2(1024, 680); boardBase(g, 1024, 680);
  g.fillStyle = '#f4f1e6'; g.textAlign = 'center'; g.font = FONT(78); g.fillText('EMUS LEFT', 512, 120);
  g.font = FONT(130); g.fillText('20,000', 512, 300); chalk(g, [[250, 260], [780, 250]], 14); chalk(g, [[260, 300], [790, 280]], 10);
  g.font = FONT(96); g.fillStyle = '#ffd84a'; g.fillText('STILL ~19,000', 512, 470);
  g.font = FONT(56); g.fillStyle = '#f4f1e6'; g.fillText('WEEK 1   2   3   4   5', 512, 610);
  g.strokeStyle = '#7a5434'; g.lineWidth = 26; g.strokeRect(0, 0, 1024, 680); return c; };
const canvasTex = (col = '#b8ab84') => { const [c, g] = cv2(128, 128), r = P.rng(5); g.fillStyle = col; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.07)'; g.fillRect(i * 16, 0, 16, 128); }
  for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(80,70,40,${.05 + r() * .08})`; g.beginPath(); g.ellipse(r() * 128, r() * 128, 4 + r() * 12, 2 + r() * 6, 0, 0, 7); g.fill(); } return c; };
const barkTex = () => { const [c, g] = cv2(128, 256), r = P.rng(21); g.fillStyle = '#e8e1d2'; g.fillRect(0, 0, 128, 256);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${150 + r() * 60},${140 + r() * 40},${120 + r() * 30},${.25 + r() * .3})`; g.beginPath(); g.ellipse(r() * 128, r() * 256, 6 + r() * 16, 12 + r() * 40, 0, 0, 7); g.fill(); } return c; };
const ausFlag = () => { const [c, g] = cv2(400, 200); g.fillStyle = '#1f3a7a'; g.fillRect(0, 0, 400, 200);
  const q = (x, y, w, h) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    const diag = (lw, col) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y + h); g.moveTo(x + w, y); g.lineTo(x, y + h); g.stroke(); };
    diag(20, '#ffffff'); diag(7, '#c8202e'); g.fillStyle = '#ffffff'; g.fillRect(x + w / 2 - 17, y, 34, h); g.fillRect(x, y + h / 2 - 17, w, 34); g.fillStyle = '#c8202e'; g.fillRect(x + w / 2 - 10, y, 20, h); g.fillRect(x, y + h / 2 - 10, w, 20); g.restore(); };
  q(0, 0, 200, 100);
  const star = (cx, cy, r, n = 7) => { g.fillStyle = '#ffffff'; g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r * 0.45 : r; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.closePath(); g.fill(); };
  star(100, 152, 30); for (const [x, y, r] of [[300, 40, 14], [250, 95, 14], [350, 85, 14], [300, 165, 14], [325, 115, 7]]) star(x, y, r);
  return c; };

// ---------- materials ----------
const MM = {
  earth: texM(redEarth(), 80, 80), road: texM(redEarth(), 30, 2, '#e0a27c'), paddock: texM(paddock(), 40, 40),
  wheatTop: texM(wheatTop(), 60, 40), wheatSide: texM(wheatSide(), 60, 1), stalk: toon({ color: '#d9ae44' }), stalk2: toon({ color: '#c79a36' }),
  post: toon({ color: '#6b4e34' }), wire: toon({ color: '#5c5a58' }),
  iron: texM(ironTex(), 3, 1), ironR: texM(ironTex(), 4, 2, '#b86a4a'), weather: texM(weather(), 2, 1), trim: toon({ color: '#3f5f3a' }), dark: toon({ color: '#1f1b22' }), win: toon({ color: '#2b2a36' }),
  steel: toon({ color: '#585e63' }), steelD: toon({ color: '#2c3034' }), brass: toon({ color: '#d0a34a' }), wood: toon({ color: '#7a5434' }), woodL: toon({ color: '#9a6e40' }),
  bark: texM(barkTex(), 1, 2), gum: toon({ color: '#7d9a6a' }), gum2: toon({ color: '#6a8a5c' }), gumD: toon({ color: '#5a7a52' }),
  far: toon({ color: '#8f9a6a' }), farB: toon({ color: '#9aa7b8' }), rock: toon({ color: '#a05a3a' }),
  khaki: toon({ color: '#7a7350' }), khakiD: toon({ color: '#5e5a3e' }), tyre: toon({ color: '#26242a' }), glass: toon({ color: '#9fb7c4' }),
  tent: new THREE.MeshToonMaterial({ gradientMap: grad, map: P.tex(canvasTex()), side: THREE.DoubleSide }),
  tank: texM(ironTex(), 6, 1, '#c8ced2'),
  sign: new THREE.MeshToonMaterial({ gradientMap: grad, map: clampTex(signTex(['CAMPION, W.A.', '1932'], [104, 190])), side: THREE.DoubleSide }),
  plan: new THREE.MeshToonMaterial({ gradientMap: grad, map: clampTex(planTex()) }), tally: new THREE.MeshToonMaterial({ gradientMap: grad, map: clampTex(tallyTex()) }),
  flag: new THREE.MeshToonMaterial({ gradientMap: grad, map: clampTex(ausFlag()), side: THREE.DoubleSide }),
  shell: toon({ color: '#d8a84a' }),
};
const put = (geo, mat, x, y, z, parent = world, opts = {}) => add(geo, mat, x, y, z, parent, opts);
const grp = (x, y, z, ry = 0, parent = world) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); return g; };
const flat = (w, d, mat, x, y, z, parent = world) => { const m = put(new THREE.PlaneGeometry(w, d), mat, x, y, z, parent, { cast: false }); m.rotation.x = -Math.PI / 2; return m; };

// no sea in this story; the engine still expects water uniforms
const waterU = { t: { value: 0 }, deep: { value: new THREE.Color('#2f6f8f') }, shal: { value: new THREE.Color('#5fa8bf') }, glint: { value: new THREE.Color('#e9f6ff') } };

// ---------- ground ----------
flat(4000, 4000, MM.earth, 0, -0.02, 0);
flat(600, 300, MM.paddock, 0, -0.01, 152);                    // paddock south of the road
{ const r = flat(600, 3.6, MM.road, 0, 0.0, 1.5); }            // the road (z -0.3 .. 3.3)
// wheat: a raised slab (heads at 0.95 m) with a stalky front edge and tufts along the edges near the road
const WH = 0.95, WZ1 = -3.2;                                  // front edge of the crop
const wheatBlock = (x0, x1, z0, z1) => {
  const w = x1 - x0, d = z1 - z0, g = grp((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const top = put(new THREE.PlaneGeometry(w, d), MM.wheatTop, 0, WH, 0, g, { cast: false }); top.rotation.x = -Math.PI / 2;
  const fr = put(new THREE.PlaneGeometry(w, WH), MM.wheatSide, 0, WH / 2, d / 2, g, { cast: false });
  return g; };
wheatBlock(-300, 300, -400, WZ1);
// a ragged edge of tufts along the front of the crop (gives the edge a silhouette)
const tuftGeo = new THREE.ConeGeometry(0.16, 0.5, 6);
{ const r = P.rng(41);
  for (let x = -70; x <= 70; x += 0.45) { const z = WZ1 - 0.05 + (r() - 0.5) * 0.25, h = 0.8 + r() * 0.5;
    const t = put(tuftGeo, r() < 0.5 ? MM.stalk : MM.stalk2, x + (r() - .5) * .2, WH - 0.05 + h * 0.2, z); t.scale.set(1, h, 1); t.rotation.set((r() - .5) * .3, 0, (r() - .5) * .3); } }
// eaten patches: flattened circles of stubble cut into the crop where the flock has been
const eaten = [[-10, -14, 6], [8, -22, 7], [26, -12, 5], [-30, -26, 8], [44, -30, 9], [-52, -16, 6], [0, -40, 10]];
for (const [x, z, r] of eaten) { const m = put(new THREE.CircleGeometry(r, 28), MM.paddock, x, WH + 0.01, z, world, { cast: false }); m.rotation.x = -Math.PI / 2; m.scale.set(1, 0.7, 1); }

// ---------- fence along the north side of the road, broken where the emus came through ----------
const FZ = -2.4, BREAK0 = -3.5, BREAK1 = 1.5;
for (let x = -90; x <= 90; x += 3) {
  if (x > BREAK0 && x < BREAK1) continue;
  put(new THREE.CylinderGeometry(0.07, 0.09, 1.3, 6), MM.post, x, 0.65, FZ);
}
for (const y of [0.45, 0.8, 1.15]) for (const [a, b] of [[-90, BREAK0 - 0.5], [BREAK1 + 1.5, 90]]) { const w = put(new THREE.CylinderGeometry(0.012, 0.012, b - a, 4), MM.wire, (a + b) / 2, y, FZ, world, { cast: false }); w.rotation.z = Math.PI / 2; }
// the broken bit: two leaning posts and sagging wire on the ground
{ const p1 = put(new THREE.CylinderGeometry(0.07, 0.09, 1.3, 6), MM.post, BREAK0 + 0.6, 0.45, FZ); p1.rotation.z = 0.9;
  const p2 = put(new THREE.CylinderGeometry(0.07, 0.09, 1.3, 6), MM.post, BREAK1 - 0.4, 0.4, FZ + 0.3); p2.rotation.set(0.5, 0, -1.1);
  for (const y of [0.05, 0.15]) { const w = put(new THREE.CylinderGeometry(0.012, 0.012, 4.5, 4), MM.wire, -1, y, FZ + 0.4, world, { cast: false }); w.rotation.z = Math.PI / 2; w.rotation.y = 0.15; } }

// ---------- gum trees ----------
const gum = (x, z, h = 9, s = 1, parent = world) => { const g = grp(x, 0, z, rW() * 6, parent); g.scale.setScalar(s);
  const t = put(new THREE.CylinderGeometry(0.22, 0.38, h * 0.6, 7), MM.bark, 0, h * 0.3, 0, g); t.rotation.z = (rW() - 0.5) * 0.12;
  for (const [bx, by, bz, rz] of [[0.6, h * 0.55, 0, -0.7], [-0.7, h * 0.62, 0.3, 0.8], [0.1, h * 0.7, -0.6, 0.3]]) { const b = put(new THREE.CylinderGeometry(0.08, 0.14, h * 0.32, 6), MM.bark, bx * 0.6, by, bz * 0.6, g); b.rotation.z = rz; }
  for (const [cx, cy, cz, r] of [[1.4, h * 0.8, 0, 1.9], [-1.5, h * 0.86, 0.4, 1.7], [0, h * 0.98, -0.8, 2.1], [0.2, h * 0.74, 1.2, 1.5]]) { const c = put(new THREE.SphereGeometry(r, 10, 7), [MM.gum, MM.gum2, MM.gumD][Math.floor(rW() * 3)], cx, cy, cz, g); c.scale.y = 0.62; }
  return g; };
for (const [x, z, h] of [[-26, 22, 11], [-6, 26, 9], [22, 30, 12], [58, 26, 10], [-48, 30, 12], [-70, 10, 9], [76, 12, 9], [92, 34, 12], [-96, 24, 10], [8, 9.5, 8]]) gum(x, z, h);
for (let i = 0; i < 30; i++) { const a = rW() * Math.PI * 2, d = 160 + rW() * 200; if (Math.sin(a) < -0.2) continue; gum(Math.cos(a) * d, Math.sin(a) * d, 10 + rW() * 5); }
for (let i = 0; i < 26; i++) { const x = -400 + i * 32 + rW() * 20; gum(x, -360 - rW() * 40, 12 + rW() * 6, 1.2); }   // tree line far behind the wheat

// ---------- far horizon: low flat ranges ----------
for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, d = 1100 + rW() * 200, r = 180 + rW() * 160; const m = put(new THREE.SphereGeometry(r, 20, 10), i % 2 ? MM.far : MM.farB, Math.cos(a) * d, -r * 0.88, Math.sin(a) * d, world, { cast: false }); m.scale.y = 0.35; }

// ---------- the farm (south of the road, west) ----------
const FARM = { x: -18, z: 12 };
{ const g = grp(FARM.x, 0, FARM.z, Math.PI);
  put(tbox(8, 2.8, 6, 2), MM.weather, 0, 1.4, 0, g);
  const sh = new THREE.Shape(); sh.moveTo(-4.4, 0); sh.lineTo(4.4, 0); sh.lineTo(0, 2.0); sh.closePath();
  const roof = new THREE.ExtrudeGeometry(sh, { depth: 6.6, bevelEnabled: false }); roof.translate(0, 0, -3.3); roof.rotateY(Math.PI / 2); put(roof, MM.ironR, 0, 2.8, 0, g);
  // veranda along the front (toward the road = -z in group space after the PI turn -> +z local)
  const ver = put(tbox(9, 0.08, 2.6, 2), MM.iron, 0, 2.5, 4.2, g); ver.rotation.x = 0.12;
  for (const x of [-4.2, -1.4, 1.4, 4.2]) put(new THREE.CylinderGeometry(0.07, 0.07, 2.5, 6), MM.post, x, 1.25, 5.3, g);
  put(tbox(9, 0.15, 2.6, 2), MM.wood, 0, 0.08, 4.2, g);
  put(box(1.0, 2.0, 0.08), MM.dark, 0.8, 1.0, 3.04, g, { cast: false }); for (const x of [-2.4, 2.6]) put(box(1.1, 0.9, 0.08), MM.win, x, 1.6, 3.04, g, { cast: false });
  put(tbox(0.6, 4.4, 0.6, 1), MM.rock, -3.2, 2.2, -1.6, g);
  // rainwater tank
  const tk = grp(5.4, 0, 1.6, 0, g); put(new THREE.CylinderGeometry(1.2, 1.2, 2.2, 18), MM.tank, 0, 1.1, 0, tk); put(new THREE.ConeGeometry(1.3, 0.45, 18), MM.tank, 0, 2.42, 0, tk); }
// windmill (blades turn)
const windmill = grp(-6, 0, 18);
{ const legs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (const [x, z] of legs) { const l = put(new THREE.CylinderGeometry(0.05, 0.07, 9.2, 5), MM.steel, x * 0.55, 4.5, z * 0.55, windmill); l.rotation.set(-z * 0.11, 0, x * 0.11); }
  for (const y of [2, 4.5, 7]) { const k = 1 - y / 11; put(tbox(1.9 * k + 0.25, 0.06, 0.06, 1), MM.steel, 0, y, 1.0 * k, windmill); put(tbox(1.9 * k + 0.25, 0.06, 0.06, 1), MM.steel, 0, y, -1.0 * k, windmill); }
  put(tbox(0.3, 0.3, 1.2, 1), MM.steelD, 0, 9.1, 0, windmill);
  const vane = put(new THREE.BoxGeometry(0.04, 0.9, 1.6), MM.iron, 0, 9.2, -1.2, windmill); }
const rotor = grp(0, 9.1, 0.7, 0, windmill);
for (let i = 0; i < 14; i++) { const b = put(new THREE.BoxGeometry(0.34, 1.5, 0.03), MM.iron, 0, 0, 0, rotor); const a = i / 14 * Math.PI * 2; b.position.set(Math.sin(a) * 0.95, Math.cos(a) * 0.95, 0); b.rotation.z = -a; b.rotation.y = 0.35; }
put(new THREE.CylinderGeometry(0.16, 0.16, 0.2, 10), MM.steelD, 0, 0, 0.05, rotor).rotation.x = Math.PI / 2;
// water trough
put(tbox(2.6, 0.5, 0.7, 1), MM.iron, -3.6, 0.25, 17.6);

// ---------- date sign by the road (pops up) ----------
const signG = grp(1.75, 0, -1.4, -0.15);
put(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 6), MM.post, -0.95, 1.3, 0, signG); put(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 6), MM.post, 0.95, 1.3, 0, signG);
put(new THREE.PlaneGeometry(2.3, 1.15), MM.sign, 0, 1.95, 0.08, signG);

// ---------- the plan board in the paddock (x ~ -60) ----------
const PLAN = { x: -60, z: 16 };
{ const g = grp(PLAN.x, 0, PLAN.z, 0); put(new THREE.PlaneGeometry(2.4, 1.6), MM.plan, 0, 1.55, 0.04, g, { cast: false }); put(tbox(2.5, 1.7, 0.06, 1), MM.wood, 0, 1.55, 0, g);
  for (const s of [-1, 1]) { const l = put(new THREE.CylinderGeometry(0.04, 0.05, 2.6, 5), MM.wood, s * 1.0, 1.2, -0.25, g); l.rotation.x = 0.18; }
  const l3 = put(new THREE.CylinderGeometry(0.04, 0.05, 2.6, 5), MM.wood, 0, 1.2, -0.7, g); l3.rotation.x = -0.35; }

// ---------- army camp (south of the road, east) ----------
const CAMP = { x: 40, z: 14 };
const tent = (x, z, ry, s = 1) => { const g = grp(x, 0, z, ry); g.scale.setScalar(s);
  const sh = new THREE.Shape(); sh.moveTo(-1.6, 0); sh.lineTo(1.6, 0); sh.lineTo(0, 2.2); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 3.6, bevelEnabled: false }); geo.translate(0, 0, -1.8); put(geo, MM.tent, 0, 0, 0, g);
  const d = new THREE.Shape(); d.moveTo(-0.6, 0); d.lineTo(0.6, 0); d.lineTo(0, 1.5); d.closePath(); put(new THREE.ShapeGeometry(d), MM.dark, 0, 0, 1.805, g, { cast: false }); return g; };
for (const [x, z, ry] of [[44, 16, 0.1], [49, 15, -0.1], [54, 17, 0.05], [46, 22, 0], [52, 23, 0.1]]) tent(x, z, ry);
const flags = [];
{ const g = grp(38, 0, 18); put(new THREE.CylinderGeometry(0.07, 0.09, 7, 8), MM.post, 0, 3.5, 0, g);
  const cloth = put(new THREE.PlaneGeometry(2.0, 1.0, 12, 6), MM.flag, 1.06, 6.35, 0, g, { cast: false }); cloth.userData.cloth = cloth.geometry.attributes.position.array.slice(); flags.push(cloth); }
// crates of ammunition and the tally board
for (const [x, z, y] of [[36.5, 12, 0.3], [37.4, 12.1, 0.3], [36.9, 12.05, 0.9], [35.6, 12.6, 0.3]]) put(tbox(0.8, 0.6, 0.6, 1), MM.khakiD, x, y, z);
const TALLY = { x: 33, z: 10.5 };
{ const g = grp(TALLY.x, 0, TALLY.z, 0.15); put(new THREE.PlaneGeometry(2.4, 1.6), MM.tally, 0, 1.6, 0.04, g, { cast: false }); put(tbox(2.5, 1.7, 0.06, 1), MM.wood, 0, 1.6, 0, g);
  for (const s of [-1, 1]) put(new THREE.CylinderGeometry(0.05, 0.05, 2.5, 5), MM.wood, s * 1.15, 1.25, -0.05, g); }
// spent shell casings scattered in front of the gun spot (shown from the 'weeks' shot)
const shells = new THREE.Group(); world.add(shells);
{ const r = P.rng(77); for (let i = 0; i < 160; i++) { const s = put(new THREE.CylinderGeometry(0.015, 0.015, 0.07, 5), MM.shell, 30.2 + (r() - 0.5) * 2.6, 0.015, 8.6 + (r() - 0.5) * 1.8, shells, { cast: false }); s.rotation.set(Math.PI / 2, r() * 6, 0); } }

// ---------- the truck (1930s army lorry, drives along the road) ----------
const truck = grp(0, 0, 1.6, 0);
{ const body = grp(0, 0, 0, 0, truck);
  put(tbox(4.6, 0.25, 2.0, 1), MM.steelD, -0.4, 0.75, 0, body);                       // chassis
  put(tbox(1.6, 0.9, 1.5, 1), MM.khaki, 2.4, 1.3, 0, body);                           // bonnet
  put(tbox(0.06, 0.7, 1.2, 1), MM.steelD, 3.22, 1.25, 0, body);                       // grille
  for (const s of [-1, 1]) put(new THREE.SphereGeometry(0.16, 10, 8), MM.glass, 3.2, 1.62, s * 0.62, body);   // lamps
  put(tbox(1.3, 1.5, 1.9, 1), MM.khaki, 1.0, 1.65, 0, body);                           // cab
  put(box(0.06, 0.6, 1.5), MM.glass, 1.67, 2.0, 0, body, { cast: false });              // windscreen
  for (const s of [-1, 1]) put(box(0.7, 0.55, 0.06), MM.glass, 1.0, 2.0, s * 0.96, body, { cast: false });
  put(tbox(3.0, 0.5, 2.1, 1), MM.khakiD, -1.4, 1.1, 0, body);                         // tray
  const cov = new THREE.CylinderGeometry(1.05, 1.05, 3.0, 16, 1, true, 0, Math.PI); cov.rotateZ(Math.PI / 2);
  put(cov, MM.tent, -1.4, 1.35, 0, body);
  for (const [x, z] of [[2.4, 1], [2.4, -1], [-1.9, 1], [-1.9, -1], [-0.9, 1], [-0.9, -1]]) { const w = put(new THREE.CylinderGeometry(0.48, 0.48, 0.3, 16), MM.tyre, x, 0.48, z * 0.95, truck); w.rotation.x = Math.PI / 2; put(new THREE.CylinderGeometry(0.2, 0.2, 0.32, 10), MM.khaki, x, 0.48, z * 0.95, truck).rotation.x = Math.PI / 2; }
  for (const s of [-1, 1]) { const m = put(new THREE.CylinderGeometry(0.56, 0.56, 0.36, 16, 1, false, 0, Math.PI), MM.khaki, 2.4, 0.5, s * 0.95, body); m.rotation.x = Math.PI / 2; } }

// ---------- the two Lewis guns (positioned per shot) ----------
const lewis = () => { const g = new THREE.Group(); world.add(g);
  for (const a of [0, 2.1, 4.2]) { const l = put(new THREE.CylinderGeometry(0.025, 0.03, 1.2, 5), MM.steelD, Math.sin(a) * 0.28, 0.55, Math.cos(a) * 0.28, g); l.rotation.set(Math.cos(a) * 0.45, 0, -Math.sin(a) * 0.45); }
  const top = grp(0, 1.12, 0, 0, g);
  put(new THREE.CylinderGeometry(0.075, 0.075, 0.85, 12), MM.steel, 0.42, 0, 0, top).rotation.z = Math.PI / 2;        // cooling shroud
  for (let i = 0; i < 6; i++) put(new THREE.CylinderGeometry(0.082, 0.082, 0.02, 12), MM.steelD, 0.12 + i * 0.12, 0, 0, top).rotation.z = Math.PI / 2;
  put(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), MM.steelD, 1.02, 0, 0, top).rotation.z = Math.PI / 2;         // muzzle
  put(tbox(0.36, 0.14, 0.12, 1), MM.steelD, -0.14, -0.01, 0, top);                                                    // receiver
  put(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 18), MM.steelD, -0.02, 0.11, 0, top);                                // pan magazine
  put(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 8), MM.steel, -0.02, 0.15, 0, top);
  const st = put(tbox(0.5, 0.12, 0.08, 1), MM.wood, -0.55, -0.06, 0, top); st.rotation.z = 0.12;                      // stock
  put(tbox(0.06, 0.14, 0.05, 1), MM.wood, -0.25, -0.13, 0, top);                                                      // grip
  g.userData.top = top; return g; };
const guns = [lewis(), lewis()];

// ---------- clouds ----------
const clouds = [];
{ const r = P.rng(90);
  for (let i = 0; i < 14; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = 650 + r() * 250; m.position.set(Math.cos(a) * d, 110 + r() * 150, Math.sin(a) * d); m.scale.setScalar(160 + r() * 140);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }

// ---------- per-frame state ----------
function worldState(S, f) {
  waterU.t.value = f / 30;
  for (const fl of flags) { const pa = fl.geometry.attributes.position, base = fl.userData.cloth; for (let i = 0; i < pa.count; i++) { const x = base[i * 3]; pa.setZ(i, Math.sin(f * 0.22 + x * 2.8) * 0.12 * (x + 1.2)); } pa.needsUpdate = true; }
  rotor.rotation.z = -f * 0.09;
  signG.position.y = S.signY ?? -3; signG.visible = signG.position.y > -2.9;
  const T_ = S.truck || { x: 300, z: 1.6, ry: 0 };
  truck.position.set(T_.x, (T_.bump ?? 0), T_.z); truck.rotation.y = T_.ry ?? 0; truck.visible = T_.x < 290;
  guns.forEach((g, i) => { const s = (S.guns || [])[i]; g.visible = !!s; if (!s) return; g.position.set(s.x, 0, s.z); g.rotation.y = s.ry ?? 0; g.userData.top.rotation.z = s.tilt ?? 0; g.userData.top.position.y = 1.12 + (s.kick ?? 0) * 0.01; g.userData.top.position.x = -(s.kick ?? 0) * 0.03; });
  shells.visible = !!S.shells;
}
