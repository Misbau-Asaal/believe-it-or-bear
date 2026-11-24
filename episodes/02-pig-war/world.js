// ================= 02 The Pig War: San Juan Island (1859) + a palace room for the arbitration =================
// Replaces the engine's example world (see tools/patch_engine.py). Ground level DECK = 0.
const DECK = 0;
const world = new THREE.Group(); scene.add(world);
const helmet = new THREE.Group(); scene.add(helmet); helmet.visible = false;
const cv2 = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const clampTex = (c) => { const t = P.tex(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; };
const FONT = (s) => `bold ${s}px "DejaVu Sans", Arial, sans-serif`;
const rW = P.rng(23);

// ---------- textures ----------
const logsTex = () => { const [c, g] = cv2(256, 256), r = P.rng(3); g.fillStyle = '#7a5434'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 8; i++) { const y = i * 32; g.fillStyle = `hsl(28,40%,${34 + r() * 10}%)`; g.fillRect(0, y + 2, 256, 28); g.fillStyle = 'rgba(255,220,170,.18)'; g.fillRect(0, y + 5, 256, 5); g.fillStyle = 'rgba(30,18,10,.85)'; g.fillRect(0, y, 256, 3);
    for (let k = 0; k < 5; k++) { g.strokeStyle = 'rgba(40,24,12,.35)'; g.lineWidth = 1.5; g.beginPath(); const x = r() * 256; g.moveTo(x, y + 8); g.lineTo(x + 30 + r() * 30, y + 10 + r() * 14); g.stroke(); } }
  return c; };
const canvasTex = (col = '#efe9da', stripe = null) => { const [c, g] = cv2(128, 128), r = P.rng(5); g.fillStyle = col; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.08)'; g.fillRect(i * 16, 0, 16, 128); }
  for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(120,100,70,${.05 + r() * .08})`; g.beginPath(); g.ellipse(r() * 128, r() * 128, 4 + r() * 12, 2 + r() * 6, 0, 0, 7); g.fill(); }
  if (stripe) { g.fillStyle = stripe; g.fillRect(0, 96, 128, 14); }
  return c; };
const hullTex = () => { const [c, g] = cv2(1024, 256); g.fillStyle = '#23201f'; g.fillRect(0, 0, 1024, 256);
  g.fillStyle = '#e0b24a'; g.fillRect(0, 70, 1024, 46); g.fillStyle = '#e0b24a'; g.fillRect(0, 150, 1024, 10);
  for (let i = 0; i < 14; i++) { g.fillStyle = '#141212'; g.fillRect(40 + i * 70, 78, 30, 30); }
  g.fillStyle = '#7a2a22'; g.fillRect(0, 216, 1024, 40); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(0, i * 6, 1024, 1); } return c; };
const sailTex = () => { const [c, g] = cv2(256, 256); g.fillStyle = '#f2ead6'; g.fillRect(0, 0, 256, 256);
  for (let i = 1; i < 5; i++) { g.strokeStyle = 'rgba(120,100,70,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, i * 51); g.lineTo(256, i * 51); g.stroke(); }
  for (let i = 1; i < 8; i++) { g.strokeStyle = 'rgba(120,100,70,.18)'; g.lineWidth = 2; g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, 256); g.stroke(); } return c; };
const usFlag = () => { const [c, g] = cv2(380, 200); for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#ffffff' : '#c8202e'; g.fillRect(0, i * 200 / 13, 380, 200 / 13 + 1); }
  g.fillStyle = '#2b3a78'; g.fillRect(0, 0, 160, 108); g.fillStyle = '#ffffff';
  for (let r = 0; r < 5; r++) for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(14 + k * 26 + (r % 2) * 13, 13 + r * 21, 4.5, 0, 7); g.fill(); } return c; };
const unionFlag = () => { const [c, g] = cv2(400, 200); g.fillStyle = '#1f3a7a'; g.fillRect(0, 0, 400, 200);
  const diag = (w, col) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(0, 0); g.lineTo(400, 200); g.moveTo(400, 0); g.lineTo(0, 200); g.stroke(); };
  diag(40, '#ffffff'); diag(14, '#c8202e'); g.fillStyle = '#ffffff'; g.fillRect(165, 0, 70, 200); g.fillRect(0, 65, 400, 70); g.fillStyle = '#c8202e'; g.fillRect(180, 0, 40, 200); g.fillRect(0, 80, 400, 40); return c; };
const imperialFlag = () => { const [c, g] = cv2(300, 200); [['#141414', 0], ['#ffffff', 1], ['#d0242e', 2]].forEach(([col, i]) => { g.fillStyle = col; g.fillRect(0, i * 200 / 3, 300, 200 / 3 + 1); }); return c; };
const signTex = (lines, sizes, bg = '#e9d6a4', fg = '#3b2a1c') => { const [c, g] = cv2(1024, 512), r = P.rng(9); g.fillStyle = bg; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(90,60,30,${.04 + r() * .08})`; g.beginPath(); g.ellipse(r() * 1024, r() * 512, 20 + r() * 60, 3 + r() * 8, 0, 0, 7); g.fill(); }
  g.strokeStyle = '#5a3b22'; g.lineWidth = 28; g.strokeRect(14, 14, 996, 484); g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((t, i) => { g.font = FONT(sizes[i]); g.fillStyle = fg; g.fillText(t, 512, 512 * (i + 0.5) / lines.length + (i ? -10 : 10)); }); return c; };
const graveTex = () => { const [c, g] = cv2(256, 320); g.fillStyle = '#a7a39b'; g.fillRect(0, 0, 256, 320); const r = P.rng(4);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(60,60,55,${.06 + r() * .1})`; g.beginPath(); g.ellipse(r() * 256, r() * 320, 3 + r() * 10, 2 + r() * 6, 0, 0, 7); g.fill(); }
  g.textAlign = 'center'; g.fillStyle = '#3a3733'; g.font = FONT(64); g.fillText('PIG', 128, 150); g.font = FONT(44); g.fillText('1859', 128, 215);
  g.strokeStyle = '#3a3733'; g.lineWidth = 6; g.beginPath(); g.moveTo(128, 40); g.lineTo(128, 95); g.moveTo(104, 60); g.lineTo(152, 60); g.stroke(); return c; };
const mapTex = (stamped) => { const [c, g] = cv2(1024, 680), r = P.rng(11);
  g.fillStyle = '#ead9b0'; g.fillRect(0, 0, 1024, 680);
  for (let i = 0; i < 200; i++) { g.fillStyle = `rgba(120,90,50,${.03 + r() * .06})`; g.beginPath(); g.ellipse(r() * 1024, r() * 680, 10 + r() * 50, 6 + r() * 30, 0, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(90,140,170,.35)'; g.fillRect(40, 40, 944, 600);
  const land = (pts, col = '#cdbb86') => { g.fillStyle = col; g.strokeStyle = '#5a4630'; g.lineWidth = 4; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.stroke(); };
  land([[40, 40], [300, 40], [330, 160], [300, 300], [340, 420], [300, 640], [40, 640]]);                 // big island to the west
  land([[760, 40], [984, 40], [984, 640], [800, 640], [740, 500], [780, 360], [720, 220], [770, 120]]);   // mainland to the east
  land([[470, 230], [560, 200], [620, 260], [600, 380], [540, 450], [470, 410], [440, 320]], '#d9c78f');   // San Juan Island
  g.fillStyle = '#3b2a1c'; g.textAlign = 'center'; g.font = FONT(30); g.fillText('SAN JUAN', 530, 330); g.font = FONT(22); g.fillText('ISLAND', 530, 362);
  g.setLineDash(stamped ? [] : [18, 14]); g.strokeStyle = '#b0241f'; g.lineWidth = stamped ? 12 : 7; g.beginPath(); g.moveTo(400, 40); g.bezierCurveTo(370, 220, 420, 420, 380, 640); g.stroke(); g.setLineDash([]);
  if (stamped) { g.save(); g.translate(560, 520); g.rotate(-0.18); g.strokeStyle = '#c4212b'; g.lineWidth = 12; g.strokeRect(-170, -62, 340, 124); g.fillStyle = '#c4212b'; g.font = FONT(86); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('U.S.A.', 0, 4); g.restore(); }
  g.strokeStyle = '#5a4630'; g.lineWidth = 10; g.strokeRect(20, 20, 984, 640); return c; };
const wallTex = () => { const [c, g] = cv2(256, 256); g.fillStyle = '#7a2230'; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = 'rgba(230,180,90,.22)'; g.beginPath(); const cx = x * 64 + 32 + (y % 2) * 32, cy = y * 64 + 32; g.moveTo(cx, cy - 18); g.lineTo(cx + 12, cy); g.lineTo(cx, cy + 18); g.lineTo(cx - 12, cy); g.closePath(); g.fill(); } return c; };

// ---------- materials ----------
const MM = {
  grass: texM(P.grass(6), 60, 60), sand: toon({ color: '#e2cf9c' }), dirt: texM(P.dirt(7), 3, 3), dirtDark: toon({ color: '#6b4a2c' }),
  logs: texM(logsTex(), 2, 1), shingle: toon({ color: '#5a4a46' }), door: toon({ color: '#4a3020' }), win: toon({ color: '#2b2a36' }), chim: texM(P.stone(14, 30, 10, 58), 1, 2),
  post: toon({ color: '#7a5434' }), leaf: toon({ color: '#4f8a34' }), leaf2: toon({ color: '#3d7230' }), fir: toon({ color: '#2f5e3a' }), fir2: toon({ color: '#3b6e40' }), trunk: toon({ color: '#5b4330' }),
  tent: new THREE.MeshToonMaterial({ gradientMap: grad, map: P.tex(canvasTex()), side: THREE.DoubleSide }), tentR: new THREE.MeshToonMaterial({ gradientMap: grad, map: P.tex(canvasTex('#f1ece0', '#b8282b')), side: THREE.DoubleSide }),
  dark: toon({ color: '#1f1b22' }), iron: toon({ color: '#3d3c3e' }), wood: toon({ color: '#6b4a2e' }), woodL: toon({ color: '#9a6e40' }),
  hull: texM(hullTex(), 1, 1), deck: toon({ color: '#a2774a' }), mast: toon({ color: '#7a5434' }), sail: new THREE.MeshToonMaterial({ gradientMap: grad, map: P.tex(sailTex()), side: THREE.DoubleSide }),
  usFlag: new THREE.MeshToonMaterial({ gradientMap: grad, map: clampTex(usFlag()), side: THREE.DoubleSide }), ukFlag: new THREE.MeshToonMaterial({ gradientMap: grad, map: clampTex(unionFlag()), side: THREE.DoubleSide }),
  deFlag: new THREE.MeshToonMaterial({ gradientMap: grad, map: clampTex(imperialFlag()), side: THREE.DoubleSide }),
  sign: new THREE.MeshToonMaterial({ gradientMap: grad, map: clampTex(signTex(['SAN JUAN ISLAND', '1859'], [96, 170])), side: THREE.DoubleSide }),
  grave: new THREE.MeshToonMaterial({ gradientMap: grad, map: clampTex(graveTex()) }), graveSide: toon({ color: '#a7a39b' }),
  map: new THREE.MeshToonMaterial({ gradientMap: grad, map: clampTex(mapTex(false)) }), mapS: new THREE.MeshToonMaterial({ gradientMap: grad, map: clampTex(mapTex(true)) }),
  wall: texM(wallTex(), 6, 3), trim: toon({ color: '#d9a845' }), floor: texM(P.planks(21), 4, 4), desk: toon({ color: '#4a2e1e' }), paper: toon({ color: '#f2ecd8' }),
  hill: toon({ color: '#6f9a46' }), rock: toon({ color: '#8b857b' }), mount: toon({ color: '#7f97ab' }), snow: toon({ color: '#f1f4f8' }), far: toon({ color: '#5f8a5a' }),
  flowerR: toon({ color: '#e0475a' }), flowerY: toon({ color: '#f2c94a' }), flowerW: toon({ color: '#ffffff' }),
};
MM.floor.map.rotation = Math.PI / 2;
const put = (geo, mat, x, y, z, parent = world, opts = {}) => add(geo, mat, x, y, z, parent, opts);
const grp = (x, y, z, ry = 0, parent = world) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g); return g; };

// ---------- sea ----------
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
      float shore = 1. - smoothstep(0., 1., length(vW.xz/vec2(84.,66.)) - .1);
      vec3 c = mix(deep, shal, .25 + .45*n + .5*shore);
      float streak = smoothstep(.72, .78, noise(vW.xz*vec2(.3,.3) + vec2(t*.12, -t*.2)));
      c = mix(c, glint, streak*.6);
      gl_FragColor = vec4(c,1.);
      #include <fog_fragment>
    }`,
});
{ const w = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), waterMat); w.rotation.x = -Math.PI / 2; w.position.y = -0.35; w.userData.nd = waterNd; w.receiveShadow = false; scene.add(w); }

// ---------- island ----------
const IX = 70, IZ = 54; // island half-axes (m)
{ const beach = put(new THREE.CircleGeometry(1, 96), MM.sand, 0, -0.12, 0, world, { cast: false }); beach.rotation.x = -Math.PI / 2; beach.scale.set(IX + 6, IZ + 6, 1);
  const g = put(new THREE.CircleGeometry(1, 96), MM.grass, 0, 0, 0, world, { cast: false }); g.rotation.x = -Math.PI / 2; g.scale.set(IX, IZ, 1); }
// rolling hills on the island's north side + rocks on the shore
for (const [x, z, r, sy] of [[-10, -44, 22, 0.32], [18, -46, 20, 0.28], [42, -34, 16, 0.3], [-40, -36, 18, 0.3], [56, 18, 12, 0.22], [-58, 22, 12, 0.22]]) { const h = put(new THREE.SphereGeometry(r, 24, 12), MM.hill, x, -r * sy * 0.55, z, world, { cast: false }); h.scale.y = sy; }
for (let i = 0; i < 26; i++) { const a = rW() * Math.PI * 2, rr = 0.96 + rW() * 0.1; const r = put(new THREE.DodecahedronGeometry(0.6 + rW() * 1.2, 0), MM.rock, Math.cos(a) * IX * rr, 0, Math.sin(a) * IZ * rr); r.rotation.set(rW(), rW() * 6, rW()); r.scale.y = 0.6; }
// fir trees
const fir = (x, z, h = 8, parent = world) => { const g = grp(x, 0, z, 0, parent); put(new THREE.CylinderGeometry(0.18, 0.28, h * 0.35, 6), MM.trunk, 0, h * 0.17, 0, g);
  for (let k = 0; k < 3; k++) put(new THREE.ConeGeometry(h * (0.3 - k * 0.07), h * 0.42, 9), k % 2 ? MM.fir2 : MM.fir, 0, h * (0.36 + k * 0.2), 0, g); return g; };
const clear = (x, z) => Math.hypot(x / 1.4, z) < 14 || Math.hypot(x - 36, z - 6) < 15 || Math.hypot(x + 36, z - 6) < 15 || Math.hypot(x / 2.2, z - 24) < 16;
for (let i = 0; i < 90; i++) { const x = (rW() - 0.5) * 2 * IX * 0.92, z = (rW() - 0.5) * 2 * IZ * 0.92; if ((x / IX) ** 2 + (z / IZ) ** 2 > 0.8 || clear(x, z)) continue; fir(x, z, 6 + rW() * 7); }
for (const [x, z, h] of [[11, -8, 10], [14, -12, 8], [-14, -5, 9], [-16, 4, 7]]) fir(x, z, h);
// far shores: big island to the west, mountains to the east (snow)
for (let i = 0; i < 9; i++) { const g = put(new THREE.SphereGeometry(70 + rW() * 40, 24, 12), MM.far, -260 - rW() * 80, -18, -200 + i * 55, world, { cast: false }); g.scale.y = 0.35 + rW() * 0.15; }
for (let i = 0; i < 12; i++) { const a = -0.9 + i * 0.16, d = 420 + rW() * 80, hh = 70 + rW() * 90, g = grp(Math.cos(a) * d, -4, Math.sin(a) * d);
  put(new THREE.ConeGeometry(70 + rW() * 50, hh, 9), MM.mount, 0, hh / 2, 0, g, { cast: false }); put(new THREE.ConeGeometry(22 + rW() * 8, hh * 0.3, 9), MM.snow, 0, hh * 0.86, 0, g, { cast: false }); }

// ---------- the farm (origin) ----------
{ const g = grp(-7, 0, -9, 0.25); put(tbox(5.2, 2.6, 4.2, 2), MM.logs, 0, 1.3, 0, g);
  const sh = new THREE.Shape(); sh.moveTo(-3.0, 0); sh.lineTo(3.0, 0); sh.lineTo(0, 1.8); sh.closePath();
  const roof = new THREE.ExtrudeGeometry(sh, { depth: 4.8, bevelEnabled: false }); roof.translate(0, 0, -2.4); put(roof, MM.shingle, 0, 2.6, 0, g);
  put(box(0.95, 1.8, 0.08), MM.door, 0.6, 0.9, 2.12, g, { cast: false }); put(box(0.8, 0.7, 0.08), MM.win, -1.5, 1.5, 2.12, g, { cast: false });
  put(tbox(0.7, 4.6, 0.7, 1.2), MM.chim, -2.2, 2.3, -1.2, g); }
// fenced potato garden: x -2..6, z -6..0 (gap at the front for the gate)
const GX0 = -2, GX1 = 6, GZ0 = -6, GZ1 = 0;
for (let x = GX0; x <= GX1; x += 1) for (const z of [GZ0, GZ1]) { if (z === GZ1 && x > 0.5 && x < 2.5) continue; put(tbox(0.12, 1.0, 0.12, 1), MM.post, x, 0.5, z); }
for (let z = GZ0 + 1; z < GZ1; z += 1) for (const x of [GX0, GX1]) put(tbox(0.12, 1.0, 0.12, 1), MM.post, x, 0.5, z);
for (const y of [0.4, 0.82]) { put(tbox(GX1 - GX0, 0.07, 0.06, 1), MM.post, (GX0 + GX1) / 2, y, GZ0); for (const x of [GX0, GX1]) put(tbox(0.06, 0.07, GZ1 - GZ0, 1), MM.post, x, y, (GZ0 + GZ1) / 2);
  put(tbox(2.5, 0.07, 0.06, 1), MM.post, -0.75, y, GZ1); put(tbox(3.5, 0.07, 0.06, 1), MM.post, 4.25, y, GZ1); }
{ const soil = put(new THREE.PlaneGeometry(GX1 - GX0, GZ1 - GZ0), MM.dirt, (GX0 + GX1) / 2, 0.01, (GZ0 + GZ1) / 2, world, { cast: false }); soil.rotation.x = -Math.PI / 2; }
for (const z of [-1.1, -2.4, -3.7, -5.0]) for (let x = GX0 + 0.6; x < GX1 - 0.4; x += 0.9) {
  if (Math.abs(x - 2.6) < 1.1 && Math.abs(z + 2.4) < 0.8) continue; // the pig's dug-up patch
  const m = put(new THREE.SphereGeometry(0.32, 10, 6), MM.dirtDark, x, 0.02, z); m.scale.set(1.2, 0.45, 0.8);
  for (let k = 0; k < 3; k++) put(new THREE.SphereGeometry(0.16 + rW() * 0.06, 8, 6), k % 2 ? MM.leaf : MM.leaf2, x + (rW() - 0.5) * 0.3, 0.22 + rW() * 0.08, z + (rW() - 0.5) * 0.2);
}
for (let i = 0; i < 7; i++) { const m = put(new THREE.SphereGeometry(0.22 + rW() * 0.14, 8, 6), MM.dirtDark, 2.6 + (rW() - 0.5) * 1.8, 0.04, -2.4 + (rW() - 0.5) * 1.0); m.scale.y = 0.5; }
// date sign (pops up), gravestone (end)
const signG = grp(-3.4, 0, 1.6, 0.2);
put(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 6), MM.post, -0.95, 1.3, 0, signG); put(new THREE.CylinderGeometry(0.07, 0.07, 2.6, 6), MM.post, 0.95, 1.3, 0, signG);
put(new THREE.PlaneGeometry(2.3, 1.15), MM.sign, 0, 1.95, 0.08, signG);
const graveG = grp(1.5, 0, 1.4, -0.15);
{ const sh = new THREE.Shape(); sh.moveTo(-0.32, 0); sh.lineTo(0.32, 0); sh.lineTo(0.32, 0.55); sh.absarc(0, 0.55, 0.32, 0, Math.PI, false); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.14, bevelEnabled: false }); geo.translate(0, 0, -0.07);
  const uv = geo.attributes.uv, pos = geo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + 0.32) / 0.64, pos.getY(i) / 0.87);
  put(geo, [MM.grave, MM.graveSide], 0, 0, 0, graveG);
  const mound = put(new THREE.SphereGeometry(0.5, 12, 6), MM.dirtDark, 0, 0, 0.55, graveG); mound.scale.set(0.8, 0.22, 1.1);
  for (let i = 0; i < 9; i++) { const f = put(new THREE.SphereGeometry(0.06, 6, 5), [MM.flowerR, MM.flowerY, MM.flowerW][i % 3], -0.35 + (i % 5) * 0.17, 0.08, 0.12 + Math.floor(i / 5) * 0.12, graveG); }
}

// ---------- camps ----------
const flags = [];
const flagPole = (x, z, mat, h = 7) => { const g = grp(x, 0, z); put(new THREE.CylinderGeometry(0.07, 0.09, h, 8), MM.post, 0, h / 2, 0, g); put(new THREE.SphereGeometry(0.14, 8, 6), MM.trim, 0, h + 0.05, 0, g);
  const cloth = put(new THREE.PlaneGeometry(2.0, 1.05, 12, 6), mat, 1.06, h - 0.65, 0, g); cloth.userData.cloth = cloth.geometry.attributes.position.array.slice(); flags.push(cloth); return g; };
const aTent = (x, z, ry, s = 1) => { const g = grp(x, 0, z, ry); g.scale.setScalar(s);
  const sh = new THREE.Shape(); sh.moveTo(-1.3, 0); sh.lineTo(1.3, 0); sh.lineTo(0, 2.0); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 3.2, bevelEnabled: false }); geo.translate(0, 0, -1.6); put(geo, MM.tent, 0, 0, 0, g);
  const d = new THREE.Shape(); d.moveTo(-0.5, 0); d.lineTo(0.5, 0); d.lineTo(0, 1.35); d.closePath(); put(new THREE.ShapeGeometry(d), MM.dark, 0, 0, 1.605, g, { cast: false }); return g; };
const bellTent = (x, z, s = 1) => { const g = grp(x, 0, z); g.scale.setScalar(s);
  put(new THREE.CylinderGeometry(1.5, 1.5, 1.0, 20, 1, true), MM.tentR, 0, 0.5, 0, g); put(new THREE.ConeGeometry(1.55, 1.9, 20), MM.tent, 0, 1.95, 0, g);
  put(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 5), MM.post, 0, 3.0, 0, g); put(box(0.7, 0.9, 0.05), MM.dark, 0, 0.45, 1.5, g, { cast: false }); return g; };
const cannon = (x, z, ry) => { const g = grp(x, 0, z, ry);
  put(tbox(1.5, 0.35, 0.6, 1), MM.wood, 0, 0.55, 0, g).rotation.z = 0.12;
  const b = put(new THREE.CylinderGeometry(0.14, 0.2, 2.2, 14), MM.iron, 0.55, 0.85, 0, g); b.rotation.z = Math.PI / 2 - 0.06;
  put(new THREE.SphereGeometry(0.2, 10, 8), MM.iron, -0.55, 0.88, 0, g);
  for (const s of [-1, 1]) { const w = put(new THREE.CylinderGeometry(0.55, 0.55, 0.1, 16), MM.woodL, 0.1, 0.55, s * 0.4, g); w.rotation.x = Math.PI / 2; put(new THREE.CylinderGeometry(0.12, 0.12, 0.14, 8), MM.iron, 0.1, 0.55, s * 0.42, g).rotation.x = Math.PI / 2; }
  return g; };
// American camp (east, x > 0): A-tents, cannons facing west
const US = { x: 36, z: 6 };
[[40, -2], [44, -2], [48, -2], [40, 10], [44, 10], [48, 10], [52, 4], [52, -6]].forEach(([x, z], i) => aTent(x, z, -Math.PI / 2 + (rW() - 0.5) * 0.2, 0.95));
const usCannons = [[29, -1], [29, 4], [29, 9], [30, 14]].map(([x, z]) => cannon(x, z, Math.PI));
flagPole(44, 4, MM.usFlag);
// English camp (west, x < 0): bell tents, cannons facing east
[[-40, -2], [-44, -3], [-48, -1], [-40, 11], [-44, 12], [-48, 10], [-52, 5]].forEach(([x, z]) => bellTent(x, z, 0.95));
const ukCannons = [[-29, -1], [-29, 4], [-29, 9], [-30, 14]].map(([x, z]) => cannon(x, z, 0));
flagPole(-44, 4, MM.ukFlag);
// a little crate stack + campfire smoke spot each side (static props)
for (const [x, z] of [[46, 2], [-46, 6]]) { put(tbox(0.8, 0.6, 0.6, 1), MM.woodL, x, 0.3, z); put(tbox(0.8, 0.6, 0.6, 1), MM.woodL, x + 0.9, 0.3, z + 0.1); put(tbox(0.8, 0.6, 0.6, 1), MM.woodL, x + 0.45, 0.9, z + 0.05); }

// ---------- the warship (sails in along z on the west side) ----------
const ship = grp(-92, 0, 4, 0);
{ const sh = new THREE.Shape(); sh.moveTo(-15, 3.2); sh.lineTo(12, 3.2); sh.lineTo(17, 4.2); sh.lineTo(13, -1.8); sh.lineTo(-13, -1.8); sh.lineTo(-15.5, 1.0); sh.closePath();
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 7, bevelEnabled: false }); hg.translate(0, 0, -3.5);
  const uv = hg.attributes.uv, pos = hg.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + 16) / 33, (pos.getY(i) + 1.8) / 6);
  put(hg, MM.hull, 0, 0, 0, ship);
  put(tbox(28, 0.2, 6.6, 2), MM.deck, -1, 3.2, 0, ship);
  put(tbox(4, 1.6, 6.8, 1), MM.hull, -13.5, 4.0, 0, ship);
  const masts = [[-7, 19], [1, 22], [8.5, 17]];
  for (const [x, h] of masts) { put(new THREE.CylinderGeometry(0.2, 0.3, h, 8), MM.mast, x, 3.2 + h / 2, 0, ship);
    for (let k = 0; k < 3; k++) { const y = 3.2 + h * (0.35 + k * 0.22), w = 7.5 - k * 1.8; const yard = put(new THREE.CylinderGeometry(0.1, 0.1, w + 1, 6), MM.mast, x, y + h * 0.1, 0, ship); yard.rotation.x = Math.PI / 2;
      const sail = new THREE.PlaneGeometry(w, h * 0.18, 4, 4); const sp = sail.attributes.position; for (let i = 0; i < sp.count; i++) sp.setZ(i, 0.5 * (1 - (sp.getX(i) / (w / 2)) ** 2));
      const s = put(sail, MM.sail, x + 0.35, y, 0, ship); s.rotation.y = Math.PI / 2; } }
  const bs = put(new THREE.CylinderGeometry(0.12, 0.2, 9, 6), MM.mast, 18, 5.5, 0, ship); bs.rotation.z = Math.PI / 2 - 0.35;
  const ens = put(new THREE.PlaneGeometry(2.4, 1.2, 10, 5), MM.ukFlag, -16.8, 6.3, 0, ship); ens.userData.cloth = ens.geometry.attributes.position.array.slice(); flags.push(ens);
  put(new THREE.CylinderGeometry(0.06, 0.06, 4, 6), MM.mast, -15.6, 5.6, 0, ship); }

// ---------- the palace room (arbitration), far from the island ----------
const ROOM = new THREE.Vector3(600, 0, 0);
const room = grp(ROOM.x, 0, ROOM.z);
put(tbox(16, 0.2, 12, 2), MM.floor, 0, -0.1, 0, room);
put(tbox(16, 7, 0.3, 4), MM.wall, 0, 3.5, -4.2, room);
for (const s of [-1, 1]) put(tbox(0.3, 7, 10, 4), MM.wall, s * 8, 3.5, 0.6, room);
put(tbox(16, 0.25, 0.4, 1), MM.trim, 0, 6.6, -4.0, room); put(tbox(16, 0.18, 0.4, 1), MM.trim, 0, 1.1, -4.0, room);
const mapG = grp(0, 3.4, -4.02, 0, room);
const mapMesh = put(new THREE.PlaneGeometry(4.2, 2.8), MM.map, 0, 0, 0.07, mapG, { cast: false });
put(tbox(4.5, 3.1, 0.08, 1), MM.trim, 0, 0, -0.02, mapG);
{ const d = grp(0, 0, -1.4, 0, room); put(tbox(3.4, 0.14, 1.4, 1), MM.desk, 0, 1.0, 0, d);
  for (const [x, z] of [[-1.55, -0.55], [1.55, -0.55], [-1.55, 0.55], [1.55, 0.55]]) put(tbox(0.14, 1.0, 0.14, 1), MM.desk, x, 0.5, z, d);
  put(tbox(3.2, 0.5, 0.06, 1), MM.desk, 0, 0.7, 0.66, d);
  const pap = put(new THREE.PlaneGeometry(0.8, 0.55), MM.paper, -0.6, 1.08, 0.2, d, { cast: false }); pap.rotation.x = -Math.PI / 2; pap.rotation.z = 0.15;
  put(new THREE.CylinderGeometry(0.08, 0.1, 0.16, 10), MM.dark, 0.9, 1.15, 0.1, d); put(new THREE.CylinderGeometry(0.012, 0.012, 0.4, 5), MM.flowerW, 0.95, 1.3, 0.1, d).rotation.z = 0.4; }
{ const fg = grp(-6.4, 0, -3.6, 0, room); put(new THREE.CylinderGeometry(0.06, 0.06, 4.4, 8), MM.trim, 0, 2.2, 0, fg); const c = put(new THREE.PlaneGeometry(1.5, 2.2), MM.deFlag, 0.8, 3.1, 0, fg, { cast: false }); c.rotation.z = Math.PI / 2; c.rotation.y = 0; }

// ---------- clouds ----------
const clouds = [];
{ const r = P.rng(90);
  for (let i = 0; i < 16; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = 650 + r() * 250; m.position.set(Math.cos(a) * d, 120 + r() * 160, Math.sin(a) * d); m.scale.setScalar(160 + r() * 140);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }

// ---------- per-frame state ----------
function worldState(S, f) {
  waterU.t.value = f / 30;
  for (const fl of flags) { const pa = fl.geometry.attributes.position, base = fl.userData.cloth; for (let i = 0; i < pa.count; i++) { const x = base[i * 3]; pa.setZ(i, Math.sin(f * 0.22 + x * 2.8) * 0.12 * (x + 1.2)); } pa.needsUpdate = true; }
  signG.position.y = S.signY ?? -3; signG.visible = signG.position.y > -2.9;
  graveG.visible = !!S.grave;
  mapMesh.material = S.stamped ? MM.mapS : MM.map;
  ship.position.x = S.shipX ?? -92;
  ship.rotation.z = Math.sin(f * 0.04) * 0.012; ship.position.y = Math.sin(f * 0.05) * 0.08;
}
