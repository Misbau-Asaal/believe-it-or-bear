// ================= 01 Wojtek: desert camp in Iran (x ~ 0), the dock (x ~ 300), Monte Cassino (x ~ 600) =================
// Replaces the engine's example world (see tools/patch_engine.py). Ground level DECK = 0.
const DECK = 0;
const world = new THREE.Group(); scene.add(world);
const helmet = new THREE.Group(); scene.add(helmet); helmet.visible = false;
const cv2 = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const clampTex = (c) => { const t = P.tex(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; };
const FONT = (s) => `bold ${s}px "DejaVu Sans", Arial, sans-serif`;
const rW = P.rng(7);

// ---------- textures ----------
const sandTex = () => { const [c, g] = cv2(256, 256), r = P.rng(3); g.fillStyle = '#e2c48e'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 300; i++) { g.fillStyle = `hsla(${34 + r() * 10},${40 + r() * 20}%,${62 + r() * 18}%,${.3 + r() * .3})`; g.beginPath(); g.ellipse(r() * 256, r() * 256, 2 + r() * 10, 1 + r() * 4, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 12; i++) { g.strokeStyle = 'rgba(160,120,70,.18)'; g.lineWidth = 3; g.beginPath(); const y = r() * 256; g.moveTo(0, y); g.bezierCurveTo(80, y - 10, 170, y + 12, 256, y); g.stroke(); }
  return c; };
const rockTex = () => { const [c, g] = cv2(256, 256), r = P.rng(5); g.fillStyle = '#9a9a82'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 260; i++) { g.fillStyle = `hsla(${50 + r() * 30},${10 + r() * 15}%,${45 + r() * 25}%,${.3 + r() * .3})`; g.beginPath(); g.ellipse(r() * 256, r() * 256, 3 + r() * 12, 2 + r() * 8, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(90,110,60,${.15 + r() * .2})`; g.beginPath(); g.ellipse(r() * 256, r() * 256, 4 + r() * 10, 3 + r() * 6, 0, 0, 7); g.fill(); }
  return c; };
const crateTex = () => { const [c, g] = cv2(256, 256); g.fillStyle = '#8a6a3a'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? '#7d5f33' : '#93723f'; g.fillRect(0, i * 52, 256, 50); g.fillStyle = 'rgba(40,25,10,.5)'; g.fillRect(0, i * 52 + 49, 256, 3); }
  g.strokeStyle = '#5a4024'; g.lineWidth = 14; g.strokeRect(7, 7, 242, 242); g.fillStyle = '#2a2a24'; g.font = FONT(44); g.textAlign = 'center'; g.fillText('AMMO', 128, 142); return c; };
const signTex = (lines, sizes, bg = '#e9d6a4', fg = '#3b2a1c', frame = '#5a3b22') => { const [c, g] = cv2(1024, 512), r = P.rng(9); g.fillStyle = bg; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(90,60,30,${.03 + r() * .06})`; g.beginPath(); g.ellipse(r() * 1024, r() * 512, 20 + r() * 60, 3 + r() * 8, 0, 0, 7); g.fill(); }
  g.strokeStyle = frame; g.lineWidth = 28; g.strokeRect(14, 14, 996, 484); g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((t, i) => { g.font = FONT(sizes[i]); g.fillStyle = Array.isArray(fg) ? fg[i] : fg; g.fillText(t, 512, 512 * (i + 0.5) / lines.length + (i ? -10 : 10)); }); return c; };
const canvasTex = (col = '#cbbf98') => { const [c, g] = cv2(128, 128), r = P.rng(5); g.fillStyle = col; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.07)'; g.fillRect(i * 16, 0, 16, 128); }
  for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(80,70,40,${.05 + r() * .08})`; g.beginPath(); g.ellipse(r() * 128, r() * 128, 4 + r() * 12, 2 + r() * 6, 0, 0, 7); g.fill(); } return c; };
const hullTex = () => { const [c, g] = cv2(1024, 256); g.fillStyle = '#4a5258'; g.fillRect(0, 0, 1024, 256);
  for (let i = 0; i < 18; i++) { g.fillStyle = '#1e2226'; g.beginPath(); g.arc(40 + i * 55, 70, 11, 0, 7); g.fill(); }
  g.fillStyle = '#8a2a22'; g.fillRect(0, 210, 1024, 46); g.fillStyle = 'rgba(255,255,255,.06)'; for (let i = 0; i < 40; i++) g.fillRect(0, i * 6, 1024, 1); return c; };
const polishFlag = () => { const [c, g] = cv2(300, 200); g.fillStyle = '#ffffff'; g.fillRect(0, 0, 300, 100); g.fillStyle = '#d4213d'; g.fillRect(0, 100, 300, 100); return c; };

// ---------- materials ----------
const MM = {
  sand: texM(sandTex(), 60, 60), rock: texM(rockTex(), 50, 50), rockS: toon({ color: '#8f8d78' }), boulder: toon({ color: '#a39a84' }),
  dune: toon({ color: '#d9b87e' }), mount: toon({ color: '#b48a6a' }), mountF: toon({ color: '#a89cb0' }), snow: toon({ color: '#f1f0ec' }),
  palm: toon({ color: '#3f7a3a' }), palm2: toon({ color: '#4f8c40' }), trunk: toon({ color: '#8a6a44' }),
  tent: new THREE.MeshToonMaterial({ gradientMap: grad, map: P.tex(canvasTex()), side: THREE.DoubleSide }), dark: toon({ color: '#1f1b22' }),
  wood: toon({ color: '#7a5434' }), woodL: toon({ color: '#9a6e40' }), plank: texM(P.planks(21), 2, 6), crate: texM(crateTex(), 1, 1),
  steel: toon({ color: '#585e63' }), steelD: toon({ color: '#2c3034' }), khaki: toon({ color: '#7a7350' }), khakiD: toon({ color: '#5e5a3e' }), tyre: toon({ color: '#26242a' }), glass: toon({ color: '#9fb7c4' }),
  hull: texM(hullTex(), 1, 1), deck: toon({ color: '#9a8a70' }), super: toon({ color: '#e8e4da' }), funnel: toon({ color: '#c8a040' }), funnelT: toon({ color: '#1f1b22' }),
  ruin: texM(P.stone(14, 36, 12, 70), 2, 2), ruinD: toon({ color: '#b8ae98' }), mug: toon({ color: '#d8d4c8' }), fire: toon({ color: '#ffb040' }), log: toon({ color: '#5a3a22' }),
  rope: toon({ color: '#c8b48a' }), post: toon({ color: '#6b4e34' }),
  flag: new THREE.MeshToonMaterial({ gradientMap: grad, map: clampTex(polishFlag()), side: THREE.DoubleSide }),
  signIran: new THREE.MeshToonMaterial({ gradientMap: grad, map: clampTex(signTex(['IRAN', '1942'], [150, 190])), side: THREE.DoubleSide }),
  signCas: new THREE.MeshToonMaterial({ gradientMap: grad, map: clampTex(signTex(['MONTE CASSINO', 'ITALY 1944'], [112, 120])), side: THREE.DoubleSide }),
  signPets: new THREE.MeshToonMaterial({ gradientMap: grad, map: clampTex(signTex(['NO PETS', 'ON THE SHIP'], [170, 96], '#f2efe6', ['#c41e2a', '#1f2a44'], '#1f2a44')), side: THREE.DoubleSide }),
};
const put = (geo, mat, x, y, z, parent = world, opts = {}) => add(geo, mat, x, y, z, parent, opts);
const grp = (x, y, z, ry = 0, parent = world) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); return g; };
const flat = (w, d, mat, x, y, z) => { const m = put(new THREE.PlaneGeometry(w, d), mat, x, y, z, world, { cast: false }); m.rotation.x = -Math.PI / 2; return m; };

// ---------- the sea (only visible at the dock) ----------
const waterU = { t: { value: 0 }, deep: { value: new THREE.Color('#2f6f8f') }, shal: { value: new THREE.Color('#5fa8bf') }, glint: { value: new THREE.Color('#e9f6ff') } };
const waterMat = new THREE.ShaderMaterial({
  uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), ...waterU }, fog: true,
  vertexShader: `#include <fog_pars_vertex>
    varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;
    #include <fog_vertex>
    }`,
  fragmentShader: `#include <fog_pars_fragment>
    uniform float t; uniform vec3 deep, shal, glint; varying vec3 vW;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
    void main(){ vec2 p = vW.xz*.12 + vec2(t*.05, -t*.08);
      float n = noise(p) * .6 + noise(p*2.3 + 7.) * .4;
      vec3 c = mix(deep, shal, .3 + .5*n);
      float streak = smoothstep(.72, .78, noise(vW.xz*vec2(.3,.3) + vec2(t*.12, -t*.2)));
      c = mix(c, glint, streak*.6);
      gl_FragColor = vec4(c,1.);
      #include <fog_fragment>
    }`,
});
{ const w = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), waterMat); w.rotation.x = -Math.PI / 2; w.position.set(300, -0.35, -600); w.userData.nd = waterNd; scene.add(w); }

// ---------- ground: desert (x < 150), dock quay (150..450, z > -2), Cassino rock (x > 450) ----------
flat(1000, 3000, MM.sand, -350, -0.02, 0);
flat(300, 1400, MM.sand, 300, -0.02, 698);           // quay land south of the waterline z = -2
flat(1400, 3000, MM.rock, 1150, -0.02, 0);
// quay edge (stone) and the pier
put(tbox(300, 1.2, 1.0, 2), MM.ruinD, 300, -0.6, -2.5, world, { cast: false });

// ================= zone A: the desert camp in Iran =================
// dunes + far mountains
for (let i = 0; i < 16; i++) { const a = rW() * Math.PI * 2, d = 60 + rW() * 80, r = 10 + rW() * 18; const m = put(new THREE.SphereGeometry(r, 20, 10), MM.dune, Math.cos(a) * d, -r * 0.8, Math.sin(a) * d, world, { cast: false }); m.scale.set(1.6, 0.6, 1); }
for (let i = 0; i < 14; i++) { const a = -2.6 + i * 0.32, d = 520 + rW() * 120, h = 90 + rW() * 110, g = grp(Math.cos(a) * d, -4, Math.sin(a) * d);
  put(new THREE.ConeGeometry(110 + rW() * 60, h, 7), i % 2 ? MM.mount : MM.mountF, 0, h / 2, 0, g, { cast: false }); if (h > 160) put(new THREE.ConeGeometry(28, h * 0.25, 7), MM.snow, 0, h * 0.88, 0, g, { cast: false }); }
const palm = (x, z, h = 6) => { const g = grp(x, 0, z, rW() * 6); let px = 0, py = 0;
  for (let i = 0; i < 6; i++) { const s = put(new THREE.CylinderGeometry(0.18 - i * 0.015, 0.22 - i * 0.015, h / 6 + 0.05, 7), MM.trunk, px, py + h / 12, 0, g); s.rotation.z = -0.06 * i; px += Math.sin(0.06 * i) * h / 6; py += h / 6; }
  for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2, f = put(new THREE.ConeGeometry(0.35, 3.2, 4), k % 2 ? MM.palm : MM.palm2, px + Math.cos(a) * 1.3, py - 0.3, Math.sin(a) * 1.3, g); f.rotation.set(Math.sin(a) * 1.9, 0, -Math.cos(a) * 1.9); f.scale.z = 0.3; }
  return g; };
for (const [x, z, h] of [[-9, -14, 7], [-12, -10, 6], [11, -16, 8], [16, -9, 6], [-20, 6, 7], [22, 8, 6]]) palm(x, z, h);
// tents in two rows, a flag, the campfire and a table with mugs
const tent = (x, z, ry, s = 1) => { const g = grp(x, 0, z, ry); g.scale.setScalar(s);
  const sh = new THREE.Shape(); sh.moveTo(-1.6, 0); sh.lineTo(1.6, 0); sh.lineTo(0, 2.2); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 3.6, bevelEnabled: false }); geo.translate(0, 0, -1.8); put(geo, MM.tent, 0, 0, 0, g);
  const d = new THREE.Shape(); d.moveTo(-0.6, 0); d.lineTo(0.6, 0); d.lineTo(0, 1.5); d.closePath(); put(new THREE.ShapeGeometry(d), MM.dark, 0, 0, 1.805, g, { cast: false }); return g; };
for (const [x, z, ry] of [[-7, -5, 0.1], [-2.5, -6, 0], [2.5, -6, -0.05], [7, -5, -0.1], [-8, 8, Math.PI], [8, 8, Math.PI]]) tent(x, z, ry);
const flags = [];
{ const g = grp(0, 0, -9); put(new THREE.CylinderGeometry(0.07, 0.09, 7, 8), MM.post, 0, 3.5, 0, g);
  const cloth = put(new THREE.PlaneGeometry(2.0, 1.2, 12, 6), MM.flag, 1.06, 6.3, 0, g, { cast: false }); cloth.userData.cloth = cloth.geometry.attributes.position.array.slice(); flags.push(cloth); }
const CAMPFIRE = { x: 3, z: 2.5 };
{ const g = grp(CAMPFIRE.x, 0, CAMPFIRE.z); for (let i = 0; i < 4; i++) { const l = put(new THREE.CylinderGeometry(0.07, 0.07, 0.9, 6), MM.log, 0, 0.1, 0, g); l.rotation.set(Math.PI / 2, i * 0.8, 0.2); }
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; put(new THREE.DodecahedronGeometry(0.12, 0), MM.boulder, Math.cos(a) * 0.55, 0.06, Math.sin(a) * 0.55, g); } }
const TABLE = { x: -2.5, z: 2.2 };
{ const g = grp(TABLE.x, 0, TABLE.z); put(tbox(2.0, 0.08, 0.9, 1), MM.woodL, 0, 0.8, 0, g); for (const [x, z] of [[-0.9, -0.38], [0.9, -0.38], [-0.9, 0.38], [0.9, 0.38]]) put(tbox(0.07, 0.8, 0.07, 1), MM.wood, x, 0.4, z, g);
  for (const x of [-0.6, -0.1, 0.5]) put(new THREE.CylinderGeometry(0.05, 0.045, 0.11, 10), MM.mug, x, 0.9, 0.1, g); }
// rocks where the cub is found
for (const [x, z, s] of [[-14, 0.5, 1.2], [-15.5, -0.6, 0.8], [-12.6, -1.2, 0.7], [-16.4, 1.4, 0.6]]) { const r = put(new THREE.DodecahedronGeometry(s, 0), MM.boulder, x, s * 0.4, z); r.rotation.set(rW(), rW() * 6, rW()); r.scale.y = 0.7; }
const signIran = grp(-15.6, 0, -0.9, 0.25);
put(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 6), MM.post, -0.95, 1.3, 0, signIran); put(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 6), MM.post, 0.95, 1.3, 0, signIran);
put(new THREE.PlaneGeometry(2.3, 1.15), MM.signIran, 0, 1.95, 0.08, signIran);

// ================= zone B: the dock =================
const DX = 300;
{ const pier = put(tbox(10, 0.3, 9, 2), MM.plank, DX, -0.15, -6.5); for (let i = 0; i < 6; i++) for (const z of [-2.5, -10.5]) put(new THREE.CylinderGeometry(0.22, 0.22, 3, 8), MM.wood, DX - 4.6 + i * 1.85, -1.1, z); }
for (const x of [DX - 4.4, DX + 4.4]) { put(new THREE.CylinderGeometry(0.18, 0.22, 0.5, 10), MM.steelD, x, 0.25, -9.8); }
// the transport ship, moored along the pier
const ship = grp(DX + 4, 0, -16, 0);
{ const sh = new THREE.Shape(); sh.moveTo(-26, 4.5); sh.lineTo(22, 4.5); sh.lineTo(28, 6.0); sh.lineTo(23, -2); sh.lineTo(-24, -2); sh.lineTo(-27, 1.0); sh.closePath();
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 9, bevelEnabled: false }); hg.translate(0, 0, -4.5);
  const uv = hg.attributes.uv, pos = hg.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + 27) / 55, (pos.getY(i) + 2) / 8);
  put(hg, MM.hull, 0, 0, 0, ship);
  put(tbox(48, 0.2, 8.6, 2), MM.deck, -1, 4.5, 0, ship);
  put(tbox(10, 3.2, 6.4, 2), MM.super, -6, 6.1, 0, ship); put(tbox(6, 2.2, 5.6, 2), MM.super, -6, 8.8, 0, ship);
  for (let i = 0; i < 6; i++) put(box(0.9, 0.7, 0.05), MM.dark, -10 + i * 1.6, 6.5, 3.22, ship, { cast: false });
  put(new THREE.CylinderGeometry(1.3, 1.5, 4.5, 16), MM.funnel, -4, 11.5, 0, ship); put(new THREE.CylinderGeometry(1.32, 1.32, 0.8, 16), MM.funnelT, -4, 13.4, 0, ship);
  for (const x of [10, -18]) { put(new THREE.CylinderGeometry(0.18, 0.24, 11, 8), MM.steel, x, 10, 0, ship); }
  put(tbox(6, 1.2, 5, 2), MM.super, 14, 5.1, 0, ship); }
// gangplank from the pier up to the deck
const gang = put(tbox(1.4, 0.12, 7.2, 1), MM.plank, DX + 2.5, 2.3, -8.4); gang.rotation.x = 0.62;
for (const s of [-1, 1]) { const r = put(new THREE.CylinderGeometry(0.03, 0.03, 7.4, 5), MM.rope, DX + 2.5 + s * 0.7, 3.1, -8.4); r.rotation.x = Math.PI / 2 + 0.62; }
const signPets = grp(DX + 0.6, 0, -4.2, 0.1);
put(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 6), MM.post, -0.95, 1.3, 0, signPets); put(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 6), MM.post, 0.95, 1.3, 0, signPets);
put(new THREE.PlaneGeometry(2.3, 1.15), MM.signPets, 0, 1.95, 0.08, signPets);
// the enlistment desk on the quay
const DESK = { x: DX - 3.5, z: 1.5 };
{ const g = grp(DESK.x, 0, DESK.z); put(tbox(1.8, 0.1, 0.9, 1), MM.woodL, 0, 0.85, 0, g); put(tbox(1.8, 0.75, 0.06, 1), MM.wood, 0, 0.42, 0.42, g);
  for (const [x, z] of [[-0.85, -0.4], [0.85, -0.4]]) put(tbox(0.08, 0.85, 0.08, 1), MM.wood, x, 0.42, z, g);
  const pap = put(new THREE.PlaneGeometry(0.6, 0.42), MM.mug, -0.3, 0.91, 0.05, g, { cast: false }); pap.rotation.x = -Math.PI / 2; pap.rotation.z = 0.15;
  put(new THREE.CylinderGeometry(0.06, 0.08, 0.14, 10), MM.dark, 0.5, 0.97, 0, g); }
for (const [x, z] of [[DX + 7, 3], [DX + 8.2, 3.2], [DX + 7.6, 3.1]]) put(tbox(1.0, 0.8, 0.8, 1), MM.crate, x, x === DX + 7.6 ? 1.2 : 0.4, z);

// ================= zone C: Monte Cassino =================
const CX = 600;
for (let i = 0; i < 22; i++) { const a = rW() * Math.PI * 2, d = 26 + rW() * 60, r = 8 + rW() * 16; const m = put(new THREE.SphereGeometry(r, 18, 10), MM.rockS, CX + Math.cos(a) * d, -r * 0.7, Math.sin(a) * d - 10, world, { cast: false }); m.scale.set(1.5, 0.7, 1.2); }
for (let i = 0; i < 30; i++) { const r = put(new THREE.DodecahedronGeometry(0.3 + rW() * 0.9, 0), MM.boulder, CX + (rW() - 0.5) * 50, 0.1, (rW() - 0.5) * 30 - 8); r.rotation.set(rW(), rW() * 6, rW()); r.scale.y = 0.6; }
// the monastery hill far behind, with the ruined abbey on top
const HILL = { x: CX + 30, z: -260 };
{ const h = put(new THREE.ConeGeometry(150, 120, 12), MM.rockS, HILL.x, 0, HILL.z, world, { cast: false }); h.position.y = 50; h.scale.z = 0.7;
  const ab = grp(HILL.x, 110, HILL.z);
  for (const [x, z, w, d, hh] of [[0, 0, 40, 18, 9], [-14, 10, 12, 10, 6], [16, 8, 10, 12, 7], [4, -6, 22, 8, 12]]) { const b = put(tbox(w, hh, d, 4), MM.ruin, x, hh / 2, z, ab, { cast: false }); }
  for (let i = 0; i < 8; i++) put(tbox(2 + rW() * 3, 2 + rW() * 3, 1 + rW() * 2, 2), MM.ruinD, (rW() - 0.5) * 40, 10 + rW() * 3, (rW() - 0.5) * 18, ab, { cast: false }); }
for (let i = 0; i < 10; i++) { const a = -2.4 + i * 0.25, d = 480 + rW() * 100, h = 120 + rW() * 120, g = grp(CX + Math.cos(a) * d, -4, Math.sin(a) * d);
  put(new THREE.ConeGeometry(130, h, 7), MM.mountF, 0, h / 2, 0, g, { cast: false }); }
// the supply dump: a lorry, crate stacks, an artillery piece
const CRATES = { x: CX - 3, z: -1 };
for (const [x, y, z] of [[0, 0, 0], [1.05, 0, 0.05], [0.5, 0.8, 0.02], [-1.0, 0, 0.2], [-1.0, 0.8, 0.2], [2.1, 0, -0.1]]) put(tbox(1.0, 0.8, 0.8, 1), MM.crate, CRATES.x + x, y + 0.4, CRATES.z + z);
const lorry = grp(CX - 9, 0, -2.5, 0.1);
{ put(tbox(4.6, 0.25, 2.0, 1), MM.steelD, -0.4, 0.75, 0, lorry); put(tbox(1.6, 0.9, 1.5, 1), MM.khaki, 2.4, 1.3, 0, lorry); put(tbox(1.3, 1.5, 1.9, 1), MM.khaki, 1.0, 1.65, 0, lorry);
  put(box(0.06, 0.6, 1.5), MM.glass, 1.67, 2.0, 0, lorry, { cast: false }); put(tbox(3.0, 0.5, 2.1, 1), MM.khakiD, -1.4, 1.1, 0, lorry);
  for (const [x, y] of [[-2.2, 1.75], [-1.2, 1.75], [-1.7, 2.55]]) put(tbox(0.9, 0.75, 0.75, 1), MM.crate, x, y, 0, lorry);
  for (const [x, z] of [[2.4, 1], [2.4, -1], [-1.9, 1], [-1.9, -1]]) { const w = put(new THREE.CylinderGeometry(0.48, 0.48, 0.3, 16), MM.tyre, x, 0.48, z * 0.95, lorry); w.rotation.x = Math.PI / 2; } }
const gun = grp(CX + 6, 0, -5, -0.5);
{ for (const s of [-1, 1]) { const w = put(new THREE.CylinderGeometry(0.7, 0.7, 0.16, 18), MM.khakiD, 0, 0.7, s * 0.85, gun); w.rotation.x = Math.PI / 2; }
  put(tbox(1.1, 1.3, 0.08, 1), MM.khaki, 0.15, 1.1, 0, gun).rotation.y = Math.PI / 2;
  const b = put(new THREE.CylinderGeometry(0.11, 0.15, 3.4, 12), MM.khakiD, 1.4, 1.5, 0, gun); b.rotation.z = Math.PI / 2 - 0.3;
  const tr = put(tbox(2.6, 0.18, 0.25, 1), MM.khakiD, -1.4, 0.5, 0, gun); tr.rotation.z = 0.25; }
const signCas = grp(CX - 0.5, 0, 3.5, 0.15);
put(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 6), MM.post, -0.95, 1.3, 0, signCas); put(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 6), MM.post, 0.95, 1.3, 0, signCas);
put(new THREE.PlaneGeometry(2.3, 1.15), MM.signCas, 0, 1.95, 0.08, signCas);

// ---------- clouds ----------
const clouds = [];
{ const r = P.rng(90);
  for (let i = 0; i < 16; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = 650 + r() * 250; m.position.set(300 + Math.cos(a) * d, 110 + r() * 150, Math.sin(a) * d); m.scale.setScalar(160 + r() * 140);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }

// ---------- per-frame state ----------
function worldState(S, f) {
  waterU.t.value = f / 30;
  for (const fl of flags) { const pa = fl.geometry.attributes.position, base = fl.userData.cloth; for (let i = 0; i < pa.count; i++) { const x = base[i * 3]; pa.setZ(i, Math.sin(f * 0.22 + x * 2.8) * 0.12 * (x + 1.2)); } pa.needsUpdate = true; }
  for (const [g, k] of [[signIran, 'signIran'], [signCas, 'signCas']]) { g.position.y = S[k] ?? -3; g.visible = g.position.y > -2.9; }
  ship.position.y = Math.sin(f * 0.04) * 0.06; ship.rotation.z = Math.sin(f * 0.03) * 0.006;
}
