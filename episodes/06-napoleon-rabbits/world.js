// ================= 06 Napoleon vs the Rabbits: a meadow hunt (1807), the treaty tent, a farm, and a 3D rabbit swarm =================
// Replaces the engine's example world (see tools/patch_engine.py). Floor level DECK = 0.
// Hunt: Napoleon at the origin, his party around him; six rabbit crates in a row at z -7 (doors face +z, towards the party);
// the luncheon table at (-4.5, 2.5); the coach at COACH (long axis along x, horses at +x, door on the -z side facing the party).
// The chateau far behind the crates (z -70). Treaty tent at (-16, -4). Farm at x ~40. Rabbits: RABBITS, driven by worldState.
const DECK = 0;
const world = new THREE.Group(); scene.add(world);
const helmet = new THREE.Group(); scene.add(helmet); helmet.visible = false;
const cv2 = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const clampTex = (c) => { const t = P.tex(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; };
const FONT = (s, w = 'bold') => `${w} ${s}px "DejaVu Serif", "DejaVu Sans", Georgia, serif`;
const rW = P.rng(66);

// ---------- textures ----------
const plaster = () => { const [c, g] = cv2(256, 256), r = P.rng(4); g.fillStyle = '#efe6d2'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(150,130,100,${.04 + r() * .06})`; g.beginPath(); g.ellipse(r() * 256, r() * 256, 6 + r() * 20, 4 + r() * 10, 0, 0, 7); g.fill(); } return c; };
const thatch = () => { const [c, g] = cv2(256, 256), r = P.rng(8); g.fillStyle = '#b8924e'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 700; i++) { const x = r() * 256, y = r() * 256; g.strokeStyle = r() < .5 ? '#9a7638' : '#d2ae66'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - .5) * 6, y + 14 + r() * 10); g.stroke(); } return c; };
const slats = (col = '#a87a4a') => { const [c, g] = cv2(256, 256), r = P.rng(13); g.clearRect(0, 0, 256, 256);
  for (let i = 0; i < 5; i++) { g.fillStyle = col; g.fillRect(i * 52 + 4, 0, 28, 256); for (let k = 0; k < 4; k++) { g.fillStyle = `rgba(60,35,15,${.1 + r() * .15})`; g.fillRect(i * 52 + 8 + r() * 20, 0, 2, 256); } }
  g.fillStyle = col; g.fillRect(0, 0, 256, 34); g.fillRect(0, 222, 256, 34); return c; };
const chateauTex = () => { const [c, g] = cv2(1024, 256); g.fillStyle = '#e8dcc2'; g.fillRect(0, 0, 1024, 256);
  for (let i = 0; i < 16; i++) for (let j = 0; j < 2; j++) { const x = 20 + i * 63, y = 40 + j * 110; g.fillStyle = '#5a6a7a'; g.fillRect(x, y, 34, 70); g.strokeStyle = '#f4ecd8'; g.lineWidth = 4; g.strokeRect(x, y, 34, 70); g.beginPath(); g.moveTo(x + 17, y); g.lineTo(x + 17, y + 70); g.moveTo(x, y + 30); g.lineTo(x + 34, y + 30); g.stroke(); }
  return c; };
const tricolour = () => { const [c, g] = cv2(300, 200); for (const [i, col] of ['#2a4aa8', '#f6f4ee', '#c8282b'].entries()) { g.fillStyle = col; g.fillRect(i * 100, 0, 101, 200); } return c; };
const tentStripe = () => { const [c, g] = cv2(512, 256); for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#f4f0e6' : '#2f4f9a'; g.fillRect(i * 512 / 12, 0, 512 / 12 + 1, 256); } return c; };
const treatyTex = () => { const [c, g] = cv2(512, 640), r = P.rng(17); g.fillStyle = '#f4ead0'; g.fillRect(0, 0, 512, 640);
  g.fillStyle = '#2a2018'; g.textAlign = 'center'; g.font = FONT(56); g.fillText('TREATY', 256, 90); g.font = FONT(36, 'italic'); g.fillText('of Peace', 256, 140);
  g.strokeStyle = '#6a5a48'; g.lineWidth = 3; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(60, 200 + i * 40); g.lineTo(60 + 300 + r() * 90, 200 + i * 40); g.stroke(); }
  g.strokeStyle = '#2a2018'; g.lineWidth = 5; g.beginPath(); g.moveTo(120, 560); for (let x = 120; x < 400; x += 20) g.lineTo(x + 10, 540 + (x % 40 ? 30 : -10)); g.stroke();
  g.fillStyle = '#b8282b'; g.beginPath(); g.arc(420, 560, 34, 0, 7); g.fill(); return c; };
const signTex = (lines, sizes, bg = '#2f4f6a', fg = '#f4f1e6', W = 1024, Hh = 512) => { const [c, g] = cv2(W, Hh); g.fillStyle = bg; g.fillRect(0, 0, W, Hh);
  g.strokeStyle = fg; g.lineWidth = 16; g.strokeRect(26, 26, W - 52, Hh - 52); g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((t, i) => { g.font = FONT(sizes[i]); g.fillStyle = fg; g.fillText(t, W / 2, Hh * (i + 0.5) / lines.length + (lines.length > 1 ? (i ? -14 : 14) : 0)); }); return c; };
const mesh = () => { const [c, g] = cv2(128, 128); g.clearRect(0, 0, 128, 128); g.strokeStyle = '#8a8a90'; g.lineWidth = 3;
  for (let i = 0; i <= 128; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(128, i); g.stroke(); } return c; };
const cloth = () => { const [c, g] = cv2(256, 256); g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#e4dccc'; g.lineWidth = 2; for (let i = 0; i < 256; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); } return c; };

// ---------- materials ----------
const tmap = (c, rx = 1, ry = 1) => toon({ map: P.tex(c, rx, ry) });
const MM = {
  plaster: texM(plaster(), 1, 1), thatch: texM(thatch(), 2, 2), slats: toon({ map: clampTex(slats()), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }), slatsD: toon({ map: clampTex(slats('#8a5e34')), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }), crateIn: toon({ color: '#3a2a1a' }),
  chateau: toon({ map: P.tex(chateauTex(), 1, 1) }), tricolour: toon({ map: clampTex(tricolour()), side: THREE.DoubleSide }), tent: toon({ map: P.tex(tentStripe(), 1, 1), side: THREE.DoubleSide }),
  treaty: toon({ map: clampTex(treatyTex()) }), date: new THREE.MeshToonMaterial({ gradientMap: grad, map: clampTex(signTex(['1807'], [300], '#2a3d7a')), side: THREE.DoubleSide }),
  hutchSign: toon({ map: clampTex(signTex(['TAME RABBITS'], [104], '#6a3a22', '#f6e6b8', 1024, 300)) }),
  mesh: new THREE.MeshBasicMaterial({ map: P.tex(mesh(), 4, 2), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }), cloth: texM(cloth(), 1, 1),
  wood: toon({ color: '#9a6a3a' }), woodD: toon({ color: '#5a3a22' }), woodL: toon({ color: '#c89a62' }), slate: toon({ color: '#4e5662' }), roofB: toon({ color: '#3e4650' }),
  coach: toon({ color: '#1e3a2e' }), coachTrim: toon({ color: '#d0a34a' }), wheel: toon({ color: '#8a2a22' }), black: toon({ color: '#222024' }), glass: toon({ color: '#3a4a5a' }),
  iron: toon({ color: '#3a3836' }), gold: toon({ color: '#d0a34a' }), green: toon({ color: '#3a6a3a' }), bottle: toon({ color: '#2a4a2a' }), red: toon({ color: '#b8282b' }), cream: toon({ color: '#efe4c8' }),
  trunk: toon({ color: '#6a4a32' }), leaf: toon({ color: '#5c8a3c' }), leaf2: toon({ color: '#6c9a42' }), leaf3: toon({ color: '#4c7a36' }), hedge: toon({ color: '#4f7a34' }), dirt: M.dirt, grass: M.grass,
  rab: toon({ vertexColors: true }),
};
const put = (geo, mat, x, y, z, parent = world, opts = {}) => add(geo, mat, x, y, z, parent, opts);
const grp = (x, y, z, ry = 0, parent = world) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); return g; };
const flat = (w, d, mat, x, y, z, parent = world) => { const m = put(new THREE.PlaneGeometry(w, d), mat, x, y, z, parent, { cast: false }); m.rotation.x = -Math.PI / 2; return m; };
const plane = (w, h, mat, x, y, z, ry = 0, parent = world) => { const m = put(new THREE.PlaneGeometry(w, h), mat, x, y, z, parent, { cast: false }); m.rotation.y = ry; return m; };
const cyl = (r0, r1, h, n = 12) => new THREE.CylinderGeometry(r0, r1, h, n);
const waterU = { t: { value: 0 }, deep: { value: new THREE.Color('#2f6f8f') }, shal: { value: new THREE.Color('#5fa8bf') }, glint: { value: new THREE.Color('#e9f6ff') } };
const roofX = (x0, x1, zc, depth, y, h, mat = MM.slate) => { const sh = new THREE.Shape(); sh.moveTo(-depth / 2, 0); sh.lineTo(depth / 2, 0); sh.lineTo(0, h); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: x1 - x0, bevelEnabled: false }); const m = put(geo, mat, x0, y, zc); m.rotation.y = Math.PI / 2; return m; };
const tree = (x, z, h = 6, s = 1, parent = world) => { const g = grp(x, 0, z, rW() * 6, parent); g.scale.setScalar(s); put(cyl(0.18, 0.28, h * 0.6, 7), MM.trunk, 0, h * 0.3, 0, g);
  for (const [cx, cy, cz, r] of [[0, h * 0.75, 0, 1.9], [1.1, h * 0.62, 0.3, 1.3], [-1.0, h * 0.66, -0.4, 1.4], [0.2, h * 0.92, 0.5, 1.2]]) { const c = put(new THREE.SphereGeometry(r, 10, 8), [MM.leaf, MM.leaf2, MM.leaf3][Math.floor(rW() * 3)], cx, cy, cz, g); c.scale.y = 0.8; } return g; };
/** merge simple parts into one vertex-coloured geometry: parts = [geometry, colour, position, rotation(euler xyz), scale] */
const mergeParts = (parts) => { const pos = [], nor = [], col = [];
  for (const [geo, c, p, r, s] of parts) { const g = geo.toNonIndexed(); g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s)));
    const A = g.attributes.position.array, Nn = g.attributes.normal.array, cc = new THREE.Color(c); for (let i = 0; i < A.length; i++) { pos.push(A[i]); nor.push(Nn[i]); } for (let i = 0; i < A.length / 3; i++) col.push(cc.r, cc.g, cc.b); }
  const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); return out; };

// ---------- ground and backdrop ----------
const ground = flat(3000, 3000, MM.grass, 0, -0.03, 0);
for (let i = 0; i < 14; i++) { const m = put(new THREE.CircleGeometry(0.6 + rW() * 1.4, 12), MM.dirt, -10 + rW() * 20, -0.02, -12 + rW() * 18, world, { cast: false }); m.rotation.x = -Math.PI / 2; m.scale.y = 0.5; }
// the chateau far behind the crates
{ const g = grp(0, 0, -72);
  put(tbox(46, 12, 10, 2), MM.plaster, 0, 6, 0, g); plane(44, 9, MM.chateau, 0, 6, 5.03, 0, g);
  roofX(-23, 23, -72, 9.6, 12, 5, MM.roofB); put(tbox(10, 17, 12, 2), MM.plaster, 0, 8.5, 0.5, g); roofX(-5, 5, -71.5, 11.6, 17, 6, MM.roofB);
  for (const x of [-24, 24]) { put(tbox(8, 15, 12, 2), MM.plaster, x, 7.5, 0.5, g); const r = put(new THREE.ConeGeometry(6.2, 6, 4), MM.roofB, x, 18, 0.5, g); r.rotation.y = Math.PI / 4; }
  for (let i = 0; i < 8; i++) put(tbox(1.2, 2.4, 1.2, 1), MM.plaster, -20 + i * 5.7, 13.6, -1, g); }
for (let i = 0; i < 40; i++) { const a = rW(), x = -60 + rW() * 120, z = -40 - rW() * 30; if (Math.abs(x) < 26 && z < -62) continue; tree(x, z, 8 + rW() * 5, 1.2); }
for (let i = 0; i < 16; i++) { const x = (rW() < 0.5 ? -1 : 1) * (14 + rW() * 18), z = -10 + rW() * 30, h = 7 + rW() * 4; if (z > -8 && Math.abs(x) < 24) continue; tree(x, z, h, 1.1); }
for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, d = 900 + rW() * 200, r = 160 + rW() * 140; const m = put(new THREE.SphereGeometry(r, 18, 10), i % 2 ? M.hill : M.hillFar, Math.cos(a) * d, -r * 0.86, Math.sin(a) * d, world, { cast: false }); m.scale.y = 0.4; }

// ================= the hunt =================
// six crates with slatted fronts; the doors are hinged at the bottom and drop open towards the party
const CRATES = [-2.75, -1.65, -0.55, 0.55, 1.65, 2.75].map((x) => [x, -7]);
const crateDoors = [];
for (const [x, z] of CRATES) {
  const g = grp(x, 0, z);
  put(tbox(0.9, 0.06, 0.66, 1), MM.woodD, 0, 0.03, 0, g);
  for (const s of [-1, 1]) put(tbox(0.06, 0.6, 0.66, 1), MM.wood, s * 0.42, 0.33, 0, g); put(tbox(0.84, 0.6, 0.03, 1), MM.crateIn, 0, 0.33, -0.31, g);
  const hinge = grp(0, 0.06, 0.33, 0, g); const door = put(tbox(0.84, 0.56, 0.04, 1), MM.slats, 0, 0.28, 0, hinge); crateDoors.push(hinge);
}
// a cart with more crates stacked on it, behind the row
{ const g = grp(5.2, 0, -8.5, -0.4); put(tbox(2.6, 0.12, 1.4, 1), MM.wood, 0, 0.7, 0, g); for (const s of [-1, 1]) { const w = put(cyl(0.45, 0.45, 0.08, 14), MM.wheel, 0.2, 0.45, s * 0.75, g); w.rotation.x = Math.PI / 2; }
  for (const [x, y, z] of [[-0.8, 1.06, -0.3], [0.1, 1.06, -0.3], [0.9, 1.06, 0.2], [-0.4, 1.66, -0.2], [0.5, 1.66, 0.1]]) put(tbox(0.8, 0.56, 0.6, 1), MM.slats, x, y, z, g); }
// the luncheon table
{ const g = grp(-4.6, 0, 2.6, 0.3); put(tbox(2.0, 0.06, 0.9, 1), MM.cloth, 0, 0.76, 0, g); for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(tbox(0.06, 0.74, 0.06, 1), MM.woodD, sx * 0.9, 0.37, sz * 0.38, g);
  put(tbox(2.06, 0.3, 0.96, 1), MM.cloth, 0, 0.62, 0, g);
  for (const x of [-0.6, -0.2, 0.3]) { put(cyl(0.04, 0.05, 0.26, 8), MM.bottle, x, 0.92, -0.15, g); } for (const x of [-0.7, 0, 0.6]) put(cyl(0.12, 0.12, 0.03, 12), MM.cream, x, 0.8, 0.2, g); }
// flags on poles
const FLAG2 = [];   // the right-hand flag; hidden in the run shot, where the camera passes right by its pole
for (const [x, z] of [[-3.2, -1.5], [3.4, -1.2]]) { const pole = put(cyl(0.04, 0.04, 4.2, 6), MM.woodD, x, 2.1, z); const f = plane(1.2, 0.8, MM.tricolour, x + 0.62, 3.7, z, 0); f.userData.flag = true; if (x > 0) FLAG2.push(pole, f); }
// the coach (long axis along x, horses at +x, door on the -z side)
const COACH0 = [5.0, 3.6];
const coach = grp(COACH0[0], 0, COACH0[1]);
{ const body = put(tbox(2.0, 1.25, 1.3, 1), MM.coach, 0, 1.25, 0, coach); put(tbox(2.1, 0.12, 1.4, 1), MM.coachTrim, 0, 1.92, 0, coach); put(tbox(1.9, 0.1, 1.2, 1), MM.black, 0, 2.02, 0, coach);
  put(tbox(2.04, 0.08, 1.34, 1), MM.coachTrim, 0, 0.66, 0, coach);
  for (const s of [-1, 1]) { plane(0.6, 0.45, MM.glass, 0, 1.45, s * 0.66, s > 0 ? 0 : Math.PI, coach); put(tbox(0.68, 0.04, 0.02, 1), MM.coachTrim, 0, 1.7, s * 0.665, coach); put(tbox(0.68, 0.04, 0.02, 1), MM.coachTrim, 0, 1.2, s * 0.665, coach);
    put(tbox(0.04, 0.95, 0.02, 1), MM.coachTrim, -0.36, 1.2, s * 0.665, coach); put(tbox(0.04, 0.95, 0.02, 1), MM.coachTrim, 0.36, 1.2, s * 0.665, coach);
    for (const x of [-0.75, 0.75]) put(tbox(0.36, 0.4, 0.02, 1), MM.glass, x, 1.45, s * 0.66, coach); }
  put(tbox(0.7, 0.5, 1.1, 1), MM.coach, 1.2, 1.0, 0, coach); put(tbox(0.5, 0.08, 1.0, 1), MM.black, 1.25, 1.6, 0, coach);           // driver's box
  for (const s of [-1, 1]) { put(cyl(0.06, 0.06, 0.3, 8), MM.black, 1.0, 1.95, s * 0.62, coach); put(tbox(0.12, 0.14, 0.12, 1), MM.gold, 1.0, 2.15, s * 0.62, coach); }
}
const wheels = [];
for (const [x, r] of [[-0.75, 0.62], [0.85, 0.48]]) for (const s of [-1, 1]) { const w = grp(x, r, s * 0.72, 0, coach); const t = put(new THREE.TorusGeometry(r - 0.04, 0.05, 6, 20), MM.wheel, 0, 0, 0, w);
  for (let i = 0; i < 6; i++) { const sp = put(tbox(0.03, (r - 0.05) * 2, 0.03, 1), MM.wheel, 0, 0, 0, w, { cast: false }); sp.rotation.z = i / 6 * Math.PI; } put(cyl(0.08, 0.08, 0.12, 10), MM.gold, 0, 0, 0, w).rotation.x = Math.PI / 2; wheels.push([w, r]); }
// shafts towards the horses
for (const s of [-1, 1]) put(tbox(2.2, 0.05, 0.05, 1), MM.woodD, 2.5, 0.85, s * 0.3, coach);

// ================= the treaty tent (x ~-16) =================
const TENT = [-16, -4];
{ const g = grp(TENT[0], 0, TENT[1]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(cyl(0.05, 0.05, 2.6, 8), MM.gold, sx * 1.9, 1.3, sz * 1.6, g);
  const roof = put(new THREE.ConeGeometry(2.9, 1.4, 4, 1, true), MM.tent, 0, 3.3, 0, g); roof.rotation.y = Math.PI / 4; roof.scale.z = 0.85;
  for (const sz of [-1]) { const w = plane(3.8, 2.6, MM.tent, 0, 1.3, sz * 1.6, 0, g); }
  put(tbox(1.8, 0.06, 0.9, 1), MM.green, 0, 0.78, -0.1, g); put(tbox(1.86, 0.4, 0.96, 1), MM.green, 0, 0.6, -0.1, g);
  const doc = put(new THREE.PlaneGeometry(0.42, 0.52), MM.treaty, 0.0, 0.815, 0.05, g, { cast: false }); doc.rotation.x = -Math.PI / 2; doc.rotation.z = 0.15;
  put(cyl(0.05, 0.06, 0.08, 10), MM.black, 0.45, 0.86, -0.15, g);
  for (const x of [-2.4, 2.4]) { put(cyl(0.035, 0.035, 3.4, 6), MM.woodD, x, 1.7, 0.6, g); plane(0.9, 0.6, MM.tricolour, x + (x < 0 ? 0.47 : -0.47), 3.0, 0.6, 0, g); }
  const carpet = put(new THREE.PlaneGeometry(3.6, 3.0), MM.red, 0, 0.005, 0, g, { cast: false }); carpet.rotation.x = -Math.PI / 2; }
const signG = grp(TENT[0] + 0.25, 4.2, TENT[1] - 0.4, 0);              // a banner that drops down in front of the tent
put(cyl(0.022, 0.022, 1.1, 6), MM.gold, 0, 0.28, 0, signG).rotation.z = Math.PI / 2; for (const x of [-0.5, 0.5]) put(cyl(0.01, 0.01, 2.0, 4), MM.woodD, x, 1.28, 0, signG, { cast: false });
put(new THREE.PlaneGeometry(0.95, 0.5), MM.date, 0, 0, 0.02, signG);

// ================= the farm (x ~40) =================
const FARM = [40, 0];
{ const g = grp(FARM[0], 0, FARM[1]);
  put(tbox(6, 3, 4, 2), MM.plaster, -1, 1.5, -5, g); const r = roofX(FARM[0] - 4.2, FARM[0] + 2.2, -5, 4.8, 3, 2.4, MM.thatch);
  put(tbox(0.9, 1.9, 0.08, 1), MM.woodD, -0.5, 0.95, -2.96, g); for (const x of [-2.8, 1.0]) { put(tbox(0.8, 0.7, 0.06, 1), MM.glass, x, 1.8, -2.97, g); }
  // two rows of hutches with wire fronts
  for (let row = 0; row < 2; row++) for (let i = 0; i < 3; i++) { const x = -1.2 + i * 0.95, y = 0.5 + row * 0.62, z = -1.2;
    put(tbox(0.9, 0.58, 0.06, 1), MM.woodL, x, y + 0.29, z - 0.29, g); put(tbox(0.8, 0.46, 0.02, 1), MM.black, x, y + 0.29, z - 0.25, g);
    for (const sx of [-0.425, 0.425]) put(tbox(0.05, 0.58, 0.6, 1), MM.woodL, x + sx, y + 0.29, z, g); for (const sy of [0.025, 0.555]) put(tbox(0.9, 0.05, 0.6, 1), MM.woodL, x, y + sy, z, g);
    plane(0.8, 0.46, MM.mesh, x, y + 0.29, z + 0.31, 0, g); }
  for (const x of [-1.6, 1.25]) put(tbox(0.08, 0.5, 0.08, 1), MM.woodD, x, 0.25, -1.0, g);
  put(tbox(1.8, 0.45, 0.06, 1), MM.woodD, -0.25, 2.05, -0.95, g); plane(1.74, 0.42, MM.hutchSign, -0.25, 2.05, -0.91, 0, g);
  for (const x0 of [-5.2, 2.0]) { for (let i = 0; i < 3; i++) put(tbox(0.08, 0.9, 0.08, 1), MM.woodD, x0 + i * 1.2, 0.45, 2.2, g); for (const y of [0.4, 0.75]) put(tbox(2.5, 0.06, 0.05, 1), MM.woodD, x0 + 1.2, y, 2.2, g); }
  for (let i = 0; i < 6; i++) tree(-12 + rW() * 24, -14 - rW() * 8, 7 + rW() * 3, 1.0, g); }
// the wild rabbit's burrow in the field
const BURROW = [33.5, 1.5];
{ const m = put(new THREE.SphereGeometry(0.5, 16, 8), MM.dirt, BURROW[0], -0.12, BURROW[1] - 0.25); m.scale.set(1.5, 0.38, 1.0); { const h = put(new THREE.CircleGeometry(0.2, 16), MM.black, BURROW[0], 0.075, BURROW[1] + 0.1, world, { cast: false }); h.rotation.x = -Math.PI / 2; h.scale.set(1.3, 0.8, 1); } }

// ================= 3D rabbits =================
const RCOLS = ['#fbf8f2', '#fbf8f2', '#c0905e', '#bcb6ae', '#8a6a4a', '#4a4650', '#e8d8b8'];
const rabbitGeo = (c) => { const S = new THREE.SphereGeometry(1, 10, 8);
  return mergeParts([[S, c, [0, 0.12, 0], [0, 0, 0], [0.12, 0.11, 0.16]], [S, c, [0, 0.22, 0.13], [0, 0, 0], [0.08, 0.075, 0.085]],
    [S, c, [0.035, 0.33, 0.1], [-0.35, 0, -0.15], [0.024, 0.085, 0.012]], [S, c, [-0.035, 0.33, 0.1], [-0.35, 0, 0.15], [0.024, 0.085, 0.012]],
    [S, '#ffffff', [0, 0.15, -0.16], [0, 0, 0], [0.04, 0.04, 0.04]], [S, '#1c1a20', [0.045, 0.235, 0.19], [0, 0, 0], [0.013, 0.015, 0.01]], [S, '#1c1a20', [-0.045, 0.235, 0.19], [0, 0, 0], [0.013, 0.015, 0.01]],
    [S, '#f2a8b8', [0, 0.215, 0.215], [0, 0, 0], [0.014, 0.01, 0.01]]]); };
const RGEOS = RCOLS.map(rabbitGeo);
const RABBITS = [];
{ const r = P.rng(77);
  for (let i = 0; i < 150; i++) {
    const m = new THREE.Mesh(RGEOS[Math.floor(r() * RGEOS.length)], MM.rab); m.castShadow = true; world.add(m); m.visible = false;
    const sz = 0.85 + r() * 0.35; m.scale.setScalar(sz);
    RABBITS.push({ m, crate: i % 6, jx: (r() - 0.5) * 0.6, delay: Math.floor(r() * 26), ang: r() * Math.PI * 2, rad: 0.35 + Math.sqrt(r()) * 2.6, travel: 55 + r() * 60, ph: r() * 40,
      side: 0, flankDelay: Math.floor(r() * 30), ringA: r() * Math.PI * 2, ringR: 1.2 + r() * 2.2, jit: r() * 10 });
  }
  RABBITS.forEach((b) => { b.side = Math.cos(b.ang) * b.rad + b.jx >= 0 ? 1 : -1; });
}
const bez = (a, b, c, d, t) => { const u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; };
const sm = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
/** where rabbit b is at frame f: [x, z, moving] or null (still in its crate) */
const rabbitAt = (b, f, S) => {
  const rel = S.rabRelease ?? 1e9; if (f < rel + b.delay) return null;
  const [cx, cz] = CRATES[b.crate], start = [cx + b.jx, cz + 0.45];
  const nap = S.nap || [0, 0], swarm = [nap[0] + Math.cos(b.ang) * b.rad, nap[1] + Math.sin(b.ang) * b.rad * 0.55];
  const t1 = (f - rel - b.delay - 6) / b.travel;
  let p = [start[0] + (swarm[0] - start[0]) * sm(t1), start[1] + (swarm[1] - start[1]) * sm(t1)], moving = t1 < 1;
  if (t1 < 0) p = [start[0], start[1] + 0.4 * Math.min(1, (f - rel - b.delay) / 6)];
  if (!moving) { p[0] += 0.08 * Math.sin((f + b.jit * 9) * 0.21); p[1] += 0.08 * Math.cos((f + b.jit * 7) * 0.17); }
  const fl = S.flank;                                         // [start, end] of the two-wing sweep
  if (fl && f >= fl[0]) {
    const t = sm((f - fl[0] - b.flankDelay) / (fl[1] - fl[0] - 30)), s = b.side;
    const co = S.coach || COACH0, lag = (S.coachV || 0) * (12 + b.jit * 3), end = [co[0] - lag + Math.cos(b.ringA) * b.ringR, co[1] - 0.9 + Math.sin(b.ringA) * b.ringR * 0.6];
    const P0 = [nap[0] + Math.cos(b.ang) * b.rad, nap[1] + Math.sin(b.ang) * b.rad * 0.55];
    const q = bez(P0, [s * 4.2, P0[1] - 1.5], [s * 4.8 + (s < 0 ? 0 : 0.5), 6.5], end, t);
    p = q; moving = t > 0 && t < 1;
    if (t >= 1) { p = [end[0] + 0.06 * Math.sin((f + b.jit * 9) * 0.25), end[1] + 0.06 * Math.cos((f + b.jit * 5) * 0.2)]; moving = !!S.coachMoving; }
  }
  return [p[0], p[1], moving];
};

// ---------- clouds ----------
const clouds = [];
{ const r = P.rng(90);
  for (let i = 0; i < 12; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = (r() - 0.5) * Math.PI * 2, d = 650 + r() * 250; m.position.set(Math.cos(a) * d, 150 + r() * 160, Math.sin(a) * d); m.scale.setScalar(160 + r() * 140);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }

// ---------- per-frame state ----------
const prevPos = new Map();
function worldState(S, f) {
  waterU.t.value = f / 30;
  signG.position.y = S.signY ?? 4.2; signG.visible = signG.position.y < 4.1;
  crateDoors.forEach((h, i) => { h.rotation.x = (S.doors ?? 0) * (Math.PI / 2) * (1 - 0.06 * i % 2); });
  const co = S.coach || COACH0; coach.position.set(co[0], 0, co[1]);
  for (const [w, r] of wheels) w.rotation.z = -(co[0] - COACH0[0]) / r;
  for (const o of FLAG2) o.visible = !S.hideFlag2;
  world.traverse((o) => { if (o.userData.flag) { o.rotation.y = 0.15 * Math.sin(f * 0.15 + o.position.x); } });
  for (const b of RABBITS) {
    const p = rabbitAt(b, f, S);
    if (!p || S.hideRabbits) { b.m.visible = false; continue; }
    const q2 = rabbitAt(b, f + 1, S) || p, dx = q2[0] - p[0], dz = q2[1] - p[1];
    b.m.visible = true; b.m.position.set(p[0], (p[2] ? Math.abs(Math.sin((f + b.ph) * 0.42)) * 0.16 : 0.02 * Math.abs(Math.sin((f + b.ph) * 0.3))), p[1]);
    const nap = S.nap || [0, 0];
    b.m.rotation.y = Math.hypot(dx, dz) > 0.003 ? Math.atan2(dx, dz) : Math.atan2(nap[0] - p[0], nap[1] - p[1]);
  }
}
