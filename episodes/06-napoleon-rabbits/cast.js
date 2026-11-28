// ================= 06 Napoleon vs the Rabbits: cast, held props and fx (appended to the toon library) =================
// People reuse romanFront (arm poses, faces) with 1807 dress: Napoleon's coat, waistcoat, red collar, epaulettes and side-on bicorne,
// Berthier's plumed bicorne and gold braid, hunters' green coats, a farmer's smock and straw hat, a coachman. Plus rabbits (front and side) and fx.
FACE.smug = { eye: ["dot", "lid"], brow: [0, -2], mouth: "smirk" };
FACE.awe = { eye: ["shock", "shock"], brow: [-4, -4], mouth: "o" };
FACE.proud = { eye: ["lid", "lid"], brow: [1, -3], mouth: "smirk" };
export const BB = {
  napoleon: { tunic: "#27407a", skin: "#f3d3b6", style: "uniform", vest: "#f4f1e8", lapel: "#f4f1e8", collar: "#b8282b", epau: true, bicorne: "side", sides: "#3a2a22", forelock: true, stout: true },
  berthier: { tunic: "#1f3570", skin: "#f5c9a0", style: "uniform", vest: "#f4f1e8", lapel: "#1f3570", collar: "#1f3570", epau: true, braid: true, bicorne: "plume", sides: "#6a4a32" },
  hunter: { tunic: "#2f5a3a", skin: "#f5c9a0", style: "coat", vest: "#c9a24a", bicorne: "plain", sides: "#5a3b2a" },
  hunter2: { tunic: "#3d5a2a", skin: "#c99067", style: "coat", vest: "#e8dcc0", bicorne: "plain", sides: "#2b211c" },
  hunter3: { tunic: "#2f4a3a", skin: "#ffe2c2", style: "coat", vest: "#a8323a", bicorne: "plain", sides: "#c8a060", moustache: "#a8804a" },
  farmer: { tunic: "#c8bc98", skin: "#e8b48a", style: "smock", straw: true, hair: "#8a6a4a", beard: "#8a6a4a", stout: true },
  coachman: { tunic: "#8a2a2a", skin: "#f5c9a0", style: "showman", vest: "#e8c45a", topHat: true, moustache: "#4a2a1a", stout: true },
};
const bbRng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

/** geometry exactly as romanFront computes it */
const bbGeo = (O, opts) => {
  const { seed = 3, facing = 0, bob = 0, tilt = 0, headTilt = 0 } = opts;
  const H = headBlob(seed, 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.stout ? 1.12 : 1.08, legsL = 1.38, sole = 975, cx = 300;
  const torsoBot = sole - legsL * HH - bob * HH, chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const Ta = (0.4 * W) / 1.06 * (O.stout ? 1.12 : 1), tcx = cx + 3 * u * facing;
  const T = { a: Ta, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: O.stout ? 0.17 : 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tp = blobPts(tcx, torsoBot - T.b, T);
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  return { H, W, HH, u, cx, hc, chin, torsoBot, hipY, Ta, tcx, tp, fx: cx + 7 * u * facing, facing, crown: hc - H.b,
    headRot: tilt + headTilt ? [rad(tilt + headTilt), cx, chin, cpx - cx, cpy - chin] : null, bodyRot: tilt ? [rad(tilt), cx, hipY] : null };
};
/** arm control points exactly as romanFront computes them */
const bbArm = (G, side, pose, opts = {}) => {
  const { tcx, Ta, chin, HH, u, cx, hc, H, torsoBot } = G;
  const s = [tcx + side * 0.85 * Ta, chin + 0.12 * HH], X = (k) => tcx + side * (Ta * 1.1 + k * u);
  switch (pose) {
    case "point": return [s, [X(28), s[1] - 0.02 * HH], [X(62), s[1] - 0.1 * HH]];
    case "up": return [s, [X(14), s[1] - 0.3 * HH], [X(22), s[1] - 0.75 * HH]];
    case "wave": return [s, [X(16), s[1] - 0.2 * HH], [X(30 + 10 * Math.sin(opts.wv || 0)), s[1] - 0.62 * HH]];
    case "hip": return [s, [X(22), s[1] + 0.3 * HH], [tcx + side * Ta * 0.95, torsoBot - 0.3 * HH]];
    case "belly": return [s, [X(8), s[1] + 0.45 * HH], [tcx + side * 0.25 * Ta, torsoBot - 0.35 * HH]];
    case "temple": return [s, [X(26), s[1] + 0.05 * HH], [cx + side * (H.a + 16 * u), hc - 0.1 * HH]];
    case "lift": return [s, [X(20), s[1] - 0.25 * HH], [X(4), s[1] - 0.82 * HH]];
    case "cross": return [s, [X(2), s[1] + 0.38 * HH], [tcx - side * 0.45 * Ta, s[1] + 0.32 * HH]];
    case "reach": { const lf = (opts.lift || 0) * 0.62 * HH; return [s, [X(42), s[1] - 0.12 * HH - lf * 0.6], [X(82), s[1] - 0.5 * HH - lf]]; }
    case "cheek": return [s, [X(16), s[1] + 0.05 * HH], [cx + side * (H.a + 2 * u), hc + 0.25 * H.b]];
    case "thumb": return [s, [X(20), s[1] + 0.12 * HH], [X(44), s[1] - 0.12 * HH]];
    case "pocket": return [s, [X(6), s[1] + 0.4 * HH], [tcx + side * 0.46 * Ta, chin + 0.36 * HH]];
    case "hold": return [s, [X(12), s[1] + 0.4 * HH], [X(-4), s[1] + 0.1 * HH]];
    case "leash": return [s, [X(16), s[1] + 0.3 * HH], [X(36), s[1] + 0.52 * HH]];
    default: return [s, [X(4), s[1] + 0.48 * HH], [X(3), chin + 1.04 * HH]];
  }
};
const BB_FRONT = ["belly", "cross", "shield", "pocket", "hold"];
/** where a person's hand is, in card design units (for chains and props placed in the world) */
export const bbHand = (key, side, pose, opts = {}) => { const O = typeof key === "string" ? BB[key] : key; return bbArm(bbGeo(O, opts), side, pose, opts)[2]; };

/** a Regency-era person. opts as romanFront plus hold { side: -1|1, item: 'purse'|'magnifier'|'book'|'books'|'chain'|'quill'|'paper', t } */
export const bbPerson = (p, key, opts = {}) => {
  const O = typeof key === "string" ? BB[key] : key;
  const R = opts.R ?? "hang", L = opts.L ?? "hang";
  romanFront(p, O, { ...opts, L, R });
  const G = bbGeo(O, opts), { H, W, HH, u, cx, hc, chin, torsoBot, Ta, tcx, tp } = G, light = opts.light ?? rad(-120);
  const armCol = mix(O.tunic, INK, 0.5);
  // ---- clothes on the torso (clipped to it; romanFront's belt is painted over with the same gradient) ----
  p.rot = G.bodyRot;
  p.clip(tp, () => {
    const beltY = torsoBot - 0.24 * HH;
    p.clip([[0, beltY - 0.06 * HH], [600, beltY - 0.06 * HH], [600, beltY + 0.06 * HH], [0, beltY + 0.06 * HH]], () => p.gradFill(tp, O.tunic, mul(O.tunic, SH_CLOTH), light));
    const top = chin + 0.02 * HH;
    if (O.style === "byron") {
      p.poly([[tcx - 0.36 * Ta, top], [tcx + 0.36 * Ta, top], [tcx + 0.22 * Ta, chin + 0.66 * HH], [tcx - 0.22 * Ta, chin + 0.66 * HH]], "#d9b456", 1.4 * u);   // waistcoat
      p.poly([[tcx - 0.3 * Ta, top], [tcx + 0.3 * Ta, top], [tcx, chin + 0.36 * HH]], "#fbf7ee", 1.4 * u);                                                  // open shirt
      for (const k of [0.46, 0.56]) p.ell(tcx, chin + k * HH, 2.2 * u, 2.2 * u, "#8a6a2a", 0.8 * u);
      for (const s of [-1, 1]) p.poly([[tcx + s * 0.36 * Ta, top - 1 * u], [tcx + s * 0.66 * Ta, top + 3 * u], [tcx + s * 0.24 * Ta, chin + 0.68 * HH]], mix(O.tunic, "#ffffff", 0.1), 1.6 * u); // lapels
      p.stroke([[tcx, chin + 0.68 * HH], [tcx, torsoBot + 0.2 * HH]], 1.4 * u);
    } else if (O.style === "gown") {
      p.poly([[tcx - 0.24 * Ta, top], [tcx + 0.24 * Ta, top], [tcx + 0.3 * Ta, torsoBot + 0.2 * HH], [tcx - 0.3 * Ta, torsoBot + 0.2 * HH]], O.vest, 1.4 * u);
      p.poly([[tcx - 0.2 * Ta, top], [tcx + 0.2 * Ta, top], [tcx, chin + 0.2 * HH]], "#f6f2e8", 1.2 * u);
      for (let i = 0; i < 3; i++) p.ell(tcx, chin + (0.32 + i * 0.16) * HH, 2.2 * u, 2.2 * u, mix(O.vest, "#d8c090", 0.5), 0.8 * u);
      for (const s of [-1, 1]) p.stroke([[tcx + s * 0.25 * Ta, top], [tcx + s * 0.32 * Ta, torsoBot + 0.2 * HH]], 2 * u, "#4a4652");
    } else if (O.style === "uniform") {   // dress coat over a white waistcoat, lapels, gold buttons (marshal: gold embroidery)
      p.poly([[tcx - 0.3 * Ta, top], [tcx + 0.3 * Ta, top], [tcx + 0.26 * Ta, torsoBot + 0.2 * HH], [tcx - 0.26 * Ta, torsoBot + 0.2 * HH]], O.vest, 1.4 * u);
      for (let i = 0; i < 4; i++) p.ell(tcx, chin + (0.24 + i * 0.15) * HH, 1.8 * u, 1.8 * u, "#c8c0a8", 0.6 * u);
      for (const s of [-1, 1]) {
        const lap = [[tcx + s * 0.3 * Ta, top], [tcx + s * 0.64 * Ta, top + 2 * u], [tcx + s * 0.52 * Ta, chin + 0.64 * HH], [tcx + s * 0.27 * Ta, chin + 0.68 * HH]];
        p.poly(lap, O.lapel || O.tunic, 1.4 * u);
        if (O.braid) p.stroke(lap.map(([x, y], i) => [x - s * 2 * u, y + (i % 2 ? 2 : -2) * u]), 2.4 * u, "#e0b24a");
        for (let i = 0; i < 4; i++) p.ell(tcx + s * 0.44 * Ta, chin + (0.12 + i * 0.14) * HH, 2.4 * u, 2.4 * u, "#e8c050", 0.8 * u);
      }
    } else if (O.style === "coat") {      // a hunting coat over a coloured waistcoat
      p.poly([[tcx - 0.32 * Ta, top], [tcx + 0.32 * Ta, top], [tcx + 0.22 * Ta, torsoBot + 0.1 * HH], [tcx - 0.22 * Ta, torsoBot + 0.1 * HH]], O.vest, 1.4 * u);
      for (let i = 0; i < 4; i++) p.ell(tcx, chin + (0.24 + i * 0.15) * HH, 2 * u, 2 * u, "#e8c050", 0.8 * u);
      for (const s of [-1, 1]) p.poly([[tcx + s * 0.32 * Ta, top - 1 * u], [tcx + s * 0.6 * Ta, top + 3 * u], [tcx + s * 0.24 * Ta, chin + 0.62 * HH]], mix(O.tunic, INK, 0.25), 1.6 * u);
      p.poly([[tcx - 0.22 * Ta, top], [tcx + 0.22 * Ta, top], [tcx, chin + 0.16 * HH]], "#f6f2e8", 1.2 * u);
    } else if (O.style === "smock") {     // a farmer's smock: gathered front panel and a red neckerchief
      const pan = [[tcx - 0.42 * Ta, top + 0.04 * HH], [tcx + 0.42 * Ta, top + 0.04 * HH], [tcx + 0.42 * Ta, chin + 0.5 * HH], [tcx - 0.42 * Ta, chin + 0.5 * HH]];
      p.poly(pan, mix(O.tunic, "#ffffff", 0.25), 1.2 * u);
      for (let i = -4; i <= 4; i++) p.stroke([[tcx + i * 0.09 * Ta, top + 0.06 * HH], [tcx + i * 0.09 * Ta + 1.5 * u, chin + 0.27 * HH], [tcx + i * 0.09 * Ta, chin + 0.48 * HH]], 1 * u, mix(O.tunic, INK, 0.3));
    } else if (O.style === "showman") {
      const vest = [[tcx - 0.34 * Ta, top], [tcx + 0.34 * Ta, top], [tcx + 0.3 * Ta, torsoBot + 0.1 * HH], [tcx - 0.3 * Ta, torsoBot + 0.1 * HH]];
      p.poly(vest, O.vest, 1.4 * u); p.clip(vest, () => { for (let i = -3; i <= 3; i++) p.stroke([[tcx + i * 0.11 * Ta, top], [tcx + i * 0.11 * Ta, torsoBot + 0.2 * HH]], 2.4 * u, "#c8323a"); });
      p.poly(vest, null, 1.4 * u);
      for (const s of [-1, 1]) p.poly([[tcx + s * 0.34 * Ta, top - 1 * u], [tcx + s * 0.62 * Ta, top + 3 * u], [tcx + s * 0.3 * Ta, chin + 0.55 * HH]], mix(O.tunic, INK, 0.2), 1.6 * u);
      p.stroke([[tcx - 0.36 * Ta, chin + 0.52 * HH], [tcx - 0.05 * Ta, chin + 0.46 * HH], [tcx + 0.3 * Ta, chin + 0.56 * HH]], 1.6 * u, "#e0b24a");  // watch chain
    }
  });
  const bandsAt = chin + 0.01 * HH;
  if (O.bands) for (const s of [-1, 1]) p.poly([[tcx + s * 1 * u, bandsAt], [tcx + s * 6.5 * u, bandsAt], [tcx + s * 7.5 * u, chin + 0.17 * HH], [tcx + s * 1.5 * u, chin + 0.17 * HH]], "#fbfaf4", 1.2 * u);
  if (O.style === "byron") { // the loose black neck ribbon
    const y = chin + 0.05 * HH; p.poly([[tcx, y], [tcx - 9 * u, y - 4 * u], [tcx - 8 * u, y + 5 * u]], "#1c1820", 1 * u); p.poly([[tcx, y], [tcx + 9 * u, y - 3 * u], [tcx + 8 * u, y + 6 * u]], "#1c1820", 1 * u);
    p.stroke([[tcx - 1 * u, y + 2 * u], [tcx - 4 * u, y + 0.16 * HH]], 2.2 * u, "#1c1820"); p.stroke([[tcx + 1 * u, y + 2 * u], [tcx + 5 * u, y + 0.14 * HH]], 2.2 * u, "#1c1820");
    for (const s of [-1, 1]) p.poly([[tcx + s * 2 * u, chin - 0.02 * HH], [tcx + s * 0.42 * Ta, chin - 0.04 * HH], [tcx + s * 0.3 * Ta, chin + 0.12 * HH]], "#fbf7ee", 1.4 * u); // collar points
  }
  if (O.style === "uniform") {
    p.poly([[tcx - 0.36 * Ta, chin - 0.03 * HH], [tcx + 0.36 * Ta, chin - 0.03 * HH], [tcx + 0.32 * Ta, chin + 0.07 * HH], [tcx - 0.32 * Ta, chin + 0.07 * HH]], O.collar, 1.4 * u);
    p.poly([[tcx - 0.12 * Ta, chin + 0.03 * HH], [tcx + 0.12 * Ta, chin + 0.03 * HH], [tcx, chin + 0.16 * HH]], "#f6f2e8", 1 * u);
    if (O.epau) for (const s of [-1, 1]) { const ex = tcx + s * 0.84 * Ta, ey = chin + 0.1 * HH;
      for (let i = -3; i <= 3; i++) p.stroke([[ex + i * 2.4 * u, ey + 3 * u], [ex + i * 2.6 * u, ey + 11 * u]], 1.4 * u, "#e0b24a");
      p.ell(ex, ey, 11 * u, 5 * u, "#e8c050", 1.4 * u, 0, 360, s * -10); }
  }
  if (O.style === "smock") { const y = chin + 0.04 * HH; p.poly([[tcx - 0.36 * Ta, y - 0.04 * HH], [tcx + 0.36 * Ta, y - 0.04 * HH], [tcx, y + 0.16 * HH]], "#c8323a", 1.4 * u); }
  if (O.style === "showman") { const y = chin + 0.05 * HH; p.poly([[tcx, y], [tcx - 10 * u, y - 6 * u], [tcx - 10 * u, y + 6 * u]], "#2a2a5a", 1.4 * u); p.poly([[tcx, y], [tcx + 10 * u, y - 6 * u], [tcx + 10 * u, y + 6 * u]], "#2a2a5a", 1.4 * u); p.ell(tcx, y, 3 * u, 3 * u, "#2a2a5a", 1.2 * u); }
  // front arms go back on top of the clothes
  for (const [side, pose] of [[-1, L], [1, R]]) if (BB_FRONT.includes(pose)) {
    const pts = bbArm(G, side, pose, opts); p.stroke(curve(pts[0], pts[1], pts[2]), 5.2 * u, armCol); p.dot(pts[2][0], pts[2][1], 5.5 * u);
  }
  // ---- head: hair, curls, glasses, hats ----
  p.rot = G.headRot;
  const fx = G.fx;
  if (O.curls) { const r = bbRng(5), hcol = O.curls, hx0 = cx + 2 * u * G.facing, hy0 = hc - 0.02 * HH;
    const arc = ellPts(hx0, hy0, H.a * 1.04, H.b * 1.08, 208, 332, 0, 24);
    p.poly(arc, hcol, 1.8 * u);
    ellPts(hx0, hy0, H.a * 1.04, H.b * 1.08, 166, 374, 0, 15).forEach(([x, y]) => { const rr = 0.15 * H.a * (0.85 + 0.3 * r()); p.ell(x, y, rr, rr * 0.92, hcol, 1.8 * u); p.arc(x + rr * 0.1, y + rr * 0.1, rr * 0.5, rr * 0.45, 200, 380, 1.2 * u, "#5a4234"); });
    const [x0, y0] = arc[0], [x1, y1] = arc[arc.length - 1];
    for (let i = 1; i < 5; i++) { const t = i / 5, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + 1.5 * u, rr = 0.12 * H.a; p.ell(x, y, rr, rr * 0.9, hcol, 1.6 * u); p.arc(x, y, rr * 0.45, rr * 0.4, 200, 380, 1.1 * u, "#5a4234"); }
  }
  if (O.hairKind === "bald") {
    for (const s of [-1, 1]) p.ell(cx + s * 0.9 * H.a + 3 * u * G.facing, hc - 0.12 * H.b, 0.17 * H.a, 0.32 * H.b, O.hairCol, 1.8 * u);
    p.ell(cx - 0.3 * H.a, hc - 0.72 * H.b, 0.12 * H.a, 0.06 * H.b, "#ffffff88", 0, 0, 360, -20);
  }
  if (O.glasses) {
    for (const s of [-1, 1]) { p.ell(fx + s * 13 * u, hc, 10 * u, 9 * u, "rgba(210,235,255,0.22)", 2 * u); p.stroke([[fx + s * 13 * u - 5 * u, hc - 4 * u], [fx + s * 13 * u - 1 * u, hc - 6 * u]], 1.4 * u, "#ffffff"); }
    p.stroke([[fx - 2.5 * u, hc - 1.5 * u], [fx, hc - 3 * u], [fx + 2.5 * u, hc - 1.5 * u]], 2 * u);
    for (const s of [-1, 1]) p.stroke([[fx + s * 23 * u, hc - 2 * u], [cx + s * 0.97 * H.a, hc - 5 * u]], 2 * u);
  }
  if (O.mortar && opts.mortar !== false) mortarboard(p, cx + 2 * u * G.facing, G.crown, HH, W, u);
  if (O.sides) for (const s of [-1, 1]) p.ell(cx + s * 0.9 * H.a + 2 * u * G.facing, hc - 0.32 * H.b, 0.15 * H.a, 0.3 * H.b, O.sides, 1.6 * u);
  if (O.sides && opts.hat === false) p.poly(ellPts(cx + 2 * u * G.facing, hc - 0.04 * HH, H.a * 1.03, H.b * 1.06, 205, 335, 0, 20), O.sides, 1.6 * u);
  if (O.forelock) { const x = cx + 0.12 * H.a + 3 * u * G.facing, y = hc - 0.62 * H.b; p.poly([[x - 9 * u, y - 6 * u], [x + 8 * u, y - 7 * u], [x + 2 * u, y + 4 * u], [x - 4 * u, y + 12 * u], [x - 5 * u, y + 2 * u]], O.sides, 1.4 * u); }
  if (O.bicorne && opts.hat !== false) bicorne(p, cx + 2 * u * G.facing, G.crown, HH, W, u, O.bicorne, light);
  if (O.straw) { const yb = G.crown + 0.24 * HH, col = "#e2c27a";
    p.poly(ellPts(cx, yb, 0.52 * W, 0.46 * HH, 180, 360, 0, 20), col, 1.8 * u); p.band([[cx - 0.5 * W, yb - 0.08 * HH], [cx + 0.5 * W, yb - 0.08 * HH]], "#8a4a2a", 0.08 * HH, 1 * u);
    p.ell(cx, yb + 1 * u, 0.92 * W, 0.08 * HH, col, 1.8 * u); for (let i = -3; i <= 3; i++) p.stroke([[cx + i * 0.12 * W, yb - 0.3 * HH], [cx + i * 0.14 * W, yb - 0.12 * HH]], 0.8 * u, "#b8964a"); }
  if (O.topHat) { const yb = G.crown + 0.22 * HH, ht = 0.78 * HH, wb = 0.3 * W, wt = 0.33 * W, col = "#2a2630";
    const body = [[cx - wb, yb], [cx - wt, yb - ht], [cx + wt, yb - ht], [cx + wb, yb]];
    p.shadedFill(body, col, mul(col, SH_FELT), light, wt, 0.4); p.band([[cx - wb - 1 * u, yb - 0.12 * HH], [cx + wb + 1 * u, yb - 0.12 * HH]], "#c8323a", 0.1 * HH, 1.2 * u); p.poly(body, null, 1.8 * u);
    p.ell(cx, yb + 1 * u, 0.46 * W, 0.05 * HH, "#1d1b22", 1.8 * u); }
  p.rot = null;
  // ---- something in the hand ----
  if (opts.hold) {
    const h = opts.hold, side = h.side ?? 1, pose = side > 0 ? R : L, [hx, hy] = bbArm(G, side, pose, opts)[2];
    p.rot = G.bodyRot; bbItem(p, h.item, hx, hy, u, h, side); p.dot(hx, hy, 5.5 * u); p.rot = null;
  }
};
/** mortarboard: skull cap, a square board seen from the front (a flat diamond), button and tassel */
const mortarboard = (p, cx, crown, HH, W, u, col = "#1f1d24", tassel = "#e0b24a") => {
  const by = crown + 0.08 * HH;
  p.poly(ellPts(cx, by + 0.1 * HH, 0.48 * W, 0.15 * HH, 180, 360, 0, 24), col, 1.8 * u);
  const top = [[cx - 0.7 * W, by], [cx + 0.02 * W, by - 0.09 * HH], [cx + 0.72 * W, by], [cx, by + 0.09 * HH]];
  p.poly(top.map(([x, y]) => [x, y + 4 * u]), mix(col, "#000000", 0.3), 1.6 * u);
  p.poly(top, col, 1.8 * u); p.stroke([[cx - 0.5 * W, by - 0.01 * HH], [cx - 0.1 * W, by - 0.06 * HH]], 1.2 * u, "#5a5662");
  p.ell(cx + 0.01 * W, by, 3 * u, 2 * u, tassel, 0.8 * u);
  p.stroke([[cx + 0.01 * W, by], [cx + 0.56 * W, by + 0.02 * HH], [cx + 0.58 * W, by + 0.24 * HH]], 1.6 * u, tassel);
  p.poly([[cx + 0.55 * W, by + 0.2 * HH], [cx + 0.61 * W, by + 0.2 * HH], [cx + 0.63 * W, by + 0.32 * HH], [cx + 0.53 * W, by + 0.32 * HH]], tassel, 1 * u);
};
const bbItem = (p, item, x, y, u, h, side) => {
  if (item === "purse") { const t = h.t ?? 0;
    p.ell(x, y + 14 * u, 15 * u, 17 * u, "#8a5a32", 1.8 * u); p.poly([[x - 7 * u, y - 2 * u], [x + 7 * u, y - 2 * u], [x + 3 * u, y + 2 * u], [x - 3 * u, y + 2 * u]], "#6a4024", 1.2 * u);
    for (let i = 0; i < 3; i++) p.ell(x - 8 * u + i * 8 * u, y - 4 * u - (i % 2) * 3 * u - t * 6 * u, 4 * u, 4 * u, "#f0c040", 1 * u); }
  else if (item === "magnifier") { const gx = x + side * 10 * u, gy = y - 34 * u;
    p.stroke([[x, y + 4 * u], [gx - side * 4 * u, gy + 14 * u]], 5 * u, "#6a4024");
    p.ell(gx, gy, 17 * u, 17 * u, "rgba(205,235,255,0.35)", 3.2 * u); p.arc(gx, gy, 14 * u, 14 * u, 0, 360, 1.4 * u, "#d0a34a");
    p.stroke([[gx - 8 * u, gy - 7 * u], [gx - 3 * u, gy - 11 * u]], 2 * u, "#ffffff"); }
  else if (item === "book") p.poly([[x - 14 * u, y - 22 * u], [x + 14 * u, y - 24 * u], [x + 15 * u, y + 6 * u], [x - 13 * u, y + 8 * u]], "#7a2f2a", 1.8 * u);
  else if (item === "books") { for (let i = 0; i < 3; i++) { const yy = y - 4 * u - i * 9 * u; p.poly(rrect(x - 18 * u + i * 2 * u, yy - 8 * u, x + 18 * u + i * 2 * u, yy, 1.5 * u), ["#7a2f2a", "#2f5a3a", "#3a4a7a"][i], 1.6 * u); p.stroke([[x - 14 * u + i * 2 * u, yy - 4 * u], [x + 16 * u + i * 2 * u, yy - 4 * u]], 1 * u, "#f2e6c8"); } }
  else if (item === "chain") for (let i = 0; i < 3; i++) p.ell(x + side * (3 + i * 5) * u, y + (4 + i * 6) * u, 3.4 * u, 2.4 * u, null, 1.6 * u, 0, 360, i % 2 ? 60 : -30);
  else if (item === "quill") { p.stroke([[x, y], [x + side * 8 * u, y - 40 * u]], 1.6 * u); p.poly([[x + side * 3 * u, y - 12 * u], [x + side * 18 * u, y - 44 * u], [x + side * 6 * u, y - 46 * u]], "#fbf7ee", 1.2 * u); }
  else if (item === "musket") { // aimed (point pose) or held across the body
    const a0 = h.aim ? [x - side * 36 * u, y + 12 * u] : [x - side * 26 * u, y + 40 * u], a1 = h.aim ? [x + side * 128 * u, y - 16 * u] : [x + side * 30 * u, y - 70 * u];
    const mx = a0[0] + (a1[0] - a0[0]) * 0.34, my = a0[1] + (a1[1] - a0[1]) * 0.34;
    p.stroke([a0, [mx, my]], 9 * u, "#7a4a2a"); p.stroke([[mx, my], a1], 3.6 * u, "#4a4a52"); p.stroke([[mx, my], [mx + (a1[0] - mx) * 0.2, my + (a1[1] - my) * 0.2]], 3.6 * u, "#7a4a2a"); }
  else if (item === "stick") p.stroke([[x - side * 8 * u, y + 14 * u], [x + side * 18 * u, y - 60 * u]], 4 * u, "#8a5a32");
  else if (item === "whip") { const t = h.t ?? 0, k = Math.sin(t * Math.PI);
    p.stroke([[x, y + 6 * u], [x + side * 10 * u, y - 26 * u]], 3.2 * u, "#5a3a24");
    p.stroke(curve([x + side * 10 * u, y - 26 * u], [x + side * (40 + 30 * k) * u, y - (80 - 60 * t) * u], [x + side * (70 + 50 * t) * u, y - (30 - 50 * t) * u]), 1.4 * u, "#3a2a1a"); }
  else if (item === "carrot") { p.poly([[x - 8 * u, y - 4 * u], [x + 8 * u, y - 4 * u], [x + 1 * u, y + 34 * u]], "#f08a2a", 1.4 * u); for (const dx of [-5, 0, 5]) p.stroke([[x, y - 4 * u], [x + dx * u, y - 16 * u]], 2.4 * u, "#3a8a3a"); }
  else if (item === "paper") { p.poly([[x - 16 * u, y - 30 * u], [x + 16 * u, y - 30 * u], [x + 16 * u, y + 8 * u], [x - 16 * u, y + 8 * u]], "#f6f0dc", 1.6 * u); for (let i = 0; i < 4; i++) p.stroke([[x - 11 * u, y - 22 * u + i * 7 * u], [x + 11 * u, y - 22 * u + i * 7 * u]], 1 * u, "#8a8070"); }
};

/** bicorne: "side" (worn sideways, Napoleon), "plume" (with a white feather edge) or "plain"; tricolour cockade */
const bicorne = (p, cx, crown, HH, W, u, kind, light) => {
  const by = crown + 0.08 * HH, w = kind === "plain" ? 0.66 * W : 0.82 * W, h = kind === "plain" ? 0.36 * HH : 0.46 * HH, col = "#1c1a20";
  const pts = [...ellPts(cx, by, w, h, 180, 360, 0, 28), ...ellPts(cx, by - 0.02 * HH, w * 0.98, 0.09 * HH, 0, 180, 0, 16)];
  if (kind === "plume") p.stroke(ellPts(cx, by - 0.02 * HH, w * 0.96, h * 1.02, 195, 345, 0, 24), 9 * u, "#f6f4ee");
  p.shadedFill(pts, col, mul(col, SH_FELT), light, w, 0.4); p.inkRing(pts, 1.8 * u, thickAngle(light));
  p.stroke(ellPts(cx, by, w * 0.97, h * 0.96, 190, 350, 0, 24), 1.6 * u, kind === "plume" ? "#e0b24a" : "#3a3640");
  const kx = cx + 0.5 * w, ky = by - 0.46 * h; p.ell(kx, ky, 7 * u, 7 * u, "#2a4aa8", 1.2 * u); p.ell(kx, ky, 4.6 * u, 4.6 * u, "#f6f4ee", 0); p.ell(kx, ky, 2.4 * u, 2.4 * u, "#c8282b", 0);
  p.stroke([[kx, ky - 7 * u], [kx - 4 * u, by - 0.04 * HH]], 1.4 * u, "#e0b24a");
};

// ---------------- rabbits ----------------
const RAB = { white: ["#fbf8f2", "#d8d0c2"], grey: ["#bcb6ae", "#8a847c"], brown: ["#c0905e", "#8a6038"], spot: ["#fbf8f2", "#d8d0c2"], black: ["#4a4650", "#2c2a30"] };
const PINK = "#f2a8b8";
/** a rabbit sitting up, front view (card units: feet at 950, ear tips ~220). opts: col, expr 'neutral'|'hungry'|'happy'|'fierce'|'chew'|'shock'|'smug',
 *  blink, look, hop 0..1 (stretch), flop 0..1 (right ear flops), carrot, chest (paw on chest, like a certain emperor), bicorne, drool */
export const bunny = (p, o = {}) => {
  const { col = "white", expr = "neutral", blink = 0, look = 0, hop = 0, flop = 0 } = o, [C, D] = RAB[col] || RAB.white, light = rad(-120), th = thickAngle(light), ow = 9, g = p.g;
  const sq = 1 + 0.14 * hop;
  g.save(); g.translate(300, 975); g.scale(1 / Math.sqrt(sq), sq); g.translate(-300, -975);
  for (const s of [-1, 1]) p.ell(300 + s * 72, 948, 64, 26, C, ow);
  const bp = blobPts(300, 795, { a: 150, b: 150, nTop: 2.2, nBot: 2.0, egg: 0.22, asym: 0, rot: 0, noise: 0.01, seed: 3 });
  p.shadedFill(bp, C, D, light, 150, 0.45);
  p.clip(bp, () => { p.ell(300, 845, 82, 92, mix(C, "#ffffff", 0.45), 0); if (col === "spot") { p.ell(380, 740, 70, 60, "#3a3632", 0); p.ell(220, 870, 44, 36, "#3a3632", 0); } });
  p.inkRing(bp, ow, th);
  const hy = 565;
  // ears behind the head
  for (const s of [-1, 1]) { const fl = s > 0 ? flop : 0, rot = s * (12 + 95 * fl), L = 240, bx = 300 + s * 48, by0 = hy - 70;
    const ex = bx + Math.sin(rad(rot)) * L / 2, ey = by0 - Math.cos(rad(rot)) * L / 2;
    p.ell(ex, ey, 40, L / 2, col === "spot" && s < 0 ? "#3a3632" : C, ow, 0, 360, rot); p.ell(ex + Math.sin(rad(rot)) * 8, ey - Math.cos(rad(rot)) * 8, 20, L / 2 - 30, PINK, 0, 0, 360, rot); }
  const hp = blobPts(300, hy, { a: 124, b: 110, nTop: 2.1, nBot: 2.0, egg: -0.08, asym: 0, rot: 0, noise: 0.01, seed: 5 });
  p.shadedFill(hp, C, D, light, 124, 0.45); if (col === "spot") p.clip(hp, () => p.ell(240, hy - 40, 60, 50, "#3a3632", 0)); p.inkRing(hp, ow, th);
  for (const s of [-1, 1]) p.ell(300 + s * 46, hy + 52, 46, 34, mix(C, "#ffffff", 0.5), 0);
  // eyes
  const lid = lidOf(blink), ey = hy - 8, big = expr === "hungry" ? 30 : 22;
  for (const s of [-1, 1]) { const ex = 300 + s * 54 + look * 8;
    if (expr === "happy" || (expr === "smug" && s > 0)) { p.stroke(ellPts(ex, ey + 6, 20, 15, 200, 340, 0, 10), 8); continue; }
    if (lid >= 1) { p.stroke([[ex - 18, ey], [ex + 18, ey]], 8); continue; }
    if (expr === "shock") { p.ell(ex, ey, 26, 30, "#ffffff", 7); p.dot(ex, ey + 2, 7); continue; }
    p.ell(ex, ey, big * 0.9, big, INK, 0); p.dot(ex + 6, ey - 8, big * 0.3, "#ffffff"); p.dot(ex - 6, ey + 7, big * 0.14, "#ffffff");
    if (expr === "fierce") p.stroke([[ex - s * 26, ey - 34], [ex + s * 22, ey - 22]], 9);
    if (expr === "chew" || expr === "smug") p.poly([[ex - 26, ey - 32], [ex + 26, ey - 32], [ex + 26, ey - 6], [ex - 26, ey - 6]], C, 0), p.stroke([[ex - 22, ey - 6], [ex + 22, ey - 6]], 7);
  }
  // nose, mouth, teeth, whiskers
  p.poly([[288, hy + 30], [312, hy + 30], [300, hy + 44]], PINK, 4);
  const teeth = expr === "hungry" || expr === "chew" || expr === "fierce" || expr === "happy";
  p.stroke([[300, hy + 44], [300, hy + 54]], 4); p.stroke(ellPts(286, hy + 54, 14, 10, 0, 180, 0, 8), 4); p.stroke(ellPts(314, hy + 54, 14, 10, 0, 180, 0, 8), 4);
  if (teeth) p.poly(rrect(290, hy + 58, 310, hy + 78 + (expr === "chew" ? 4 * Math.sin((o.ch || 0) * 3) : 0), 3), "#ffffff", 3), p.stroke([[300, hy + 58], [300, hy + 76]], 2);
  if (expr === "shock") p.ell(300, hy + 70, 12, 14, "#6a2236", 4);
  if (o.drool) p.poly([[312, hy + 76], [320, hy + 76], [318, hy + 108], [314, hy + 112], [311, hy + 104]], "#bfe6ff", 3);
  for (const s of [-1, 1]) for (const k of [-1, 0, 1]) p.stroke([[300 + s * 40, hy + 44 + k * 8], [300 + s * 110, hy + 34 + k * 18]], 2.4, "#5a5250");
  for (const s of [-1, 1]) p.ell(300 + s * 84, hy + 30, 18, 11, "#f2a0a888", 0);
  // front paws
  if (o.chest) { p.ell(330, 700, 34, 30, C, ow); p.ell(250, 880, 34, 28, C, ow); }
  else if (o.carrot) { p.poly([[278, 690], [322, 690], [304, 820]], "#f08a2a", 6); for (const dx of [-14, 0, 14]) p.stroke([[300, 690], [300 + dx, 640]], 9, "#3a8a3a"); for (const s of [-1, 1]) p.ell(300 + s * 34, 712, 30, 26, C, ow); }
  else for (const s of [-1, 1]) p.ell(300 + s * 52, 880, 32, 28, C, ow);
  if (o.bicorne) { const by = hy - 92, w = 190, h = 92, colH = "#1c1a20";
    const pts = [...ellPts(300, by, w, h, 180, 360, 0, 28), ...ellPts(300, by - 4, w * 0.98, 22, 0, 180, 0, 16)];
    p.shadedFill(pts, colH, mul(colH, SH_FELT), light, w, 0.4); p.inkRing(pts, 6, th);
    const kx = 300 + 0.5 * w, ky = by - 0.46 * h; p.ell(kx, ky, 18, 18, "#2a4aa8", 3); p.ell(kx, ky, 12, 12, "#f6f4ee", 0); p.ell(kx, ky, 6, 6, "#c8282b", 0); }
  g.restore();
};
/** a rabbit hopping, side view facing right. opts: col, ph 0..1 (hop phase), expr 'neutral'|'hungry'|'fierce', blink */
export const bunnySide = (p, o = {}) => {
  const { col = "white", ph = 0, expr = "neutral", blink = 0 } = o, [C, D] = RAB[col] || RAB.white, light = rad(-120), th = thickAngle(light), ow = 9, g = p.g;
  const air = Math.max(0, Math.sin(ph * Math.PI * 2)), yo = -air * 90, st = 1 + 0.25 * air;
  g.save(); g.translate(0, yo);
  p.ell(120, 770, 34, 30, "#ffffff", ow);                                                              // tail
  p.ell(200 - 30 * air, 900 + 10 * air, 90, 40, C, ow, 0, 360, -10 - 30 * air);                       // hind leg
  g.save(); g.translate(300, 800); g.scale(st, 1 / st); g.rotate(-0.12 * air); g.translate(-300, -800);
  const bp = blobPts(300, 800, { a: 180, b: 110, nTop: 2.2, nBot: 2.1, egg: 0.1, asym: 0, rot: 0, noise: 0.01, seed: 4 });
  p.shadedFill(bp, C, D, light, 170, 0.45); if (col === "spot") p.clip(bp, () => p.ell(260, 760, 70, 55, "#3a3632", 0)); p.inkRing(bp, ow, th);
  g.restore();
  p.ell(430 + 50 * air, 905 - 10 * air, 40, 22, C, ow, 0, 360, 20 * air);                                // front paws
  const hx = 470, hy = 700;
  for (const k of [0, 1]) p.ell(hx - 60 - k * 18, hy - 110 + k * 6, 30, 110, k ? D : C, ow, 0, 360, -55 + k * 8 - 15 * air);   // ears swept back
  const hp = blobPts(hx, hy, { a: 96, b: 86, nTop: 2.1, nBot: 2.0, egg: -0.05, asym: 0, rot: 0, noise: 0.01, seed: 6 });
  p.shadedFill(hp, C, D, light, 96, 0.45); p.inkRing(hp, ow, th);
  p.ell(hx + 70, hy + 20, 40, 30, mix(C, "#ffffff", 0.5), 0); p.ell(hx + 104, hy + 6, 12, 10, PINK, 3);
  const ex = hx + 34, ey = hy - 14;
  if (lidOf(blink) >= 1) p.stroke([[ex - 16, ey], [ex + 16, ey]], 7);
  else { p.ell(ex, ey, expr === "hungry" ? 22 : 17, expr === "hungry" ? 24 : 19, INK, 0); p.dot(ex + 6, ey - 7, 6, "#ffffff"); if (expr === "fierce") p.stroke([[ex - 22, ey - 30], [ex + 22, ey - 18]], 8); }
  if (expr === "hungry" || expr === "fierce") p.poly(rrect(hx + 82, hy + 36, hx + 98, hy + 56, 3), "#ffffff", 3);
  for (const k of [-1, 0, 1]) p.stroke([[hx + 90, hy + 22 + k * 7], [hx + 160, hy + 12 + k * 16]], 2.4, "#5a5250");
  g.restore();
};

// ---------------- fx ----------------
/** a thought bubble with a carrot dressed as Napoleon (what the rabbits see) */
export const fxCarrotThought = (p, t) => {
  const g = p.g, k = Math.min(1, t * 4), s = k < 1 ? k * 1.1 : 1.1 - 0.1 * Math.min(1, (t - 0.25) * 4);
  g.save(); g.translate(300, 560); g.scale(s, s); g.translate(-300, -560);
  for (const [x, y, r] of [[150, 900, 22], [190, 840, 34]]) p.ell(x, y, r, r, "#ffffff", 7);
  const cl = []; for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; cl.push([300 + Math.cos(a) * 230, 470 + Math.sin(a) * 250]); }
  for (const [x, y] of cl) p.ell(x, y, 90, 90, "#ffffff", 8); p.ell(300, 470, 250, 270, "#ffffff", 0);
  // the carrot
  const bob = Math.sin(t * 20) * 6;
  p.poly([[230, 380 + bob], [370, 380 + bob], [312, 700 + bob], [300, 712 + bob], [288, 700 + bob]], "#f08a2a", 8);
  for (const y of [450, 520, 590]) p.stroke([[250 + (y - 450) * 0.15, y + bob], [285 + (y - 450) * 0.1, y + 6 + bob]], 5, "#c8641a");
  for (const s2 of [-1, 1]) { p.ell(300 + s2 * 26, 430 + bob, 13, 15, INK, 0); p.dot(300 + s2 * 26 + 4, 425 + bob, 4, "#ffffff"); }
  p.stroke(ellPts(300, 470 + bob, 22, 12, 20, 160, 0, 8), 5);
  const by = 372 + bob, w = 130, h = 70; const pts = [...ellPts(300, by, w, h, 180, 360, 0, 24), ...ellPts(300, by - 4, w * 0.98, 16, 0, 180, 0, 12)];
  p.poly(pts, "#1c1a20", 7); p.ell(300 + 0.5 * w, by - 0.46 * h, 14, 14, "#2a4aa8", 3); p.ell(300 + 0.5 * w, by - 0.46 * h, 8, 8, "#f6f4ee", 0); p.ell(300 + 0.5 * w, by - 0.46 * h, 4, 4, "#c8282b", 0);
  for (const [x, y] of [[120, 300], [480, 330], [470, 620]]) p.poly([[x, y - 24], [x + 7, y - 7], [x + 24, y], [x + 7, y + 7], [x, y + 24], [x - 7, y + 7], [x - 24, y], [x - 7, y - 7]], "#ffe27a", 4);
  g.restore();
};
/** whip crack: a jagged burst and the word */
export const fxCrack = (p, t) => {
  const g = p.g, k = Math.min(1, t * 6), a = t > 0.7 ? (1 - t) / 0.3 : 1; g.save(); g.globalAlpha = a; g.translate(300, 500); g.scale(0.5 + 0.6 * k, 0.5 + 0.6 * k);
  const pts = []; for (let i = 0; i < 16; i++) { const r = i % 2 ? 90 : 200; const an = i / 16 * Math.PI * 2; pts.push([Math.cos(an) * r, Math.sin(an) * r]); }
  p.poly(pts, "#fff3a0", 10); g.rotate(-0.15); g.font = `900 120px "DejaVu Sans", Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  g.lineWidth = 22; g.strokeStyle = INK; g.strokeText("CRACK!", 0, 0); g.fillStyle = "#ff7a3a"; g.fillText("CRACK!", 0, 0); g.restore();
};
/** a puff of dust behind a running rabbit (fxPuff exists in toonbase) (k 0..1) */
export const fxDustPuff = (p, k) => { const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - k); for (let i = 0; i < 5; i++) p.ell(300 + (i - 2) * 60 * (0.6 + k), 820 - k * 80 - (i % 2) * 40, 60 + 60 * k, 50 + 40 * k, "#efe4cc", 8); g.restore(); };
/** a tummy rumble: wiggly lines */
export const fxRumble = (p, t) => { for (let i = 0; i < 3; i++) { const r = 160 + i * 60 + 20 * Math.sin(t * 30 + i); p.stroke(ellPts(300, 640, r, r * 0.7, 300 + i * 4, 360 - i * 4, 0, 12), 10, "#ffffff"); p.stroke(ellPts(300, 640, r, r * 0.7, 180 + i * 4, 240 - i * 4, 0, 12), 10, "#ffffff"); } };
export const fxWord = (p, word, t = 1, col = "#ffd84a", size = 150, rot = -0.12) => {
  const g = p.g, k = Math.min(1, t * 4), s = 0.6 + 0.5 * k - 0.1 * Math.max(0, t - 0.5);
  g.save(); g.translate(300, 500); g.rotate(rot); g.scale(s, s); g.font = `bold ${size}px "DejaVu Sans", Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.globalAlpha = Math.min(1, (1 - t) * 4); g.lineJoin = "round"; g.lineWidth = 26; g.strokeStyle = INK; g.strokeText(word, 0, 0); g.fillStyle = col; g.fillText(word, 0, 0); g.restore();
};
/** big "?" and "!" popping */
export const fxQuery = (p, t) => {
  const g = p.g, k = Math.min(1, t * 5), s = k < 1 ? k * 1.15 : 1.15 - 0.15 * Math.min(1, (t - 0.2) * 4);
  g.save(); g.translate(300, 520); g.scale(s, s); g.font = `900 360px "DejaVu Sans", Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  for (const [ch, x, r, col] of [["?", -90, -0.18, "#ffd84a"], ["!", 100, 0.14, "#ff7a5a"]]) { g.save(); g.translate(x, 0); g.rotate(r + Math.sin(t * 20) * 0.04); g.lineWidth = 30; g.strokeStyle = INK; g.strokeText(ch, 0, 0); g.fillStyle = col; g.fillText(ch, 0, 0); g.restore(); }
  g.restore();
};
export const fxBulb = (p, t) => {
  const g = p.g, s = t < 0.25 ? t / 0.25 * 1.18 : 1.18 - 0.18 * Math.min(1, (t - 0.25) / 0.2);
  g.save(); g.translate(300, 500); g.scale(s, s); g.translate(-300, -500);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 - Math.PI / 2, r0 = 160, r1 = 205 + 25 * Math.sin(t * 30 + i); p.stroke([[300 + Math.cos(a) * r0, 430 + Math.sin(a) * r0], [300 + Math.cos(a) * r1, 430 + Math.sin(a) * r1]], 16, INK); p.stroke([[300 + Math.cos(a) * r0, 430 + Math.sin(a) * r0], [300 + Math.cos(a) * r1, 430 + Math.sin(a) * r1]], 8, "#ffe27a"); }
  p.ell(300, 430, 115, 120, "#fff3a0", 11); p.ell(262, 392, 26, 40, "#ffffff", 0, 0, 360, 25);
  p.stroke([[270, 520], [285, 460], [300, 490], [315, 460], [330, 520]], 7, "#c89a2a");
  p.poly(rrect(245, 540, 355, 620, 10), "#b8bcc0", 9); for (const y of [565, 590]) p.stroke([[250, y], [350, y]], 6, "#7a8086");
  p.ell(300, 636, 26, 14, INK, 0);
  g.restore();
};
/** the lead: links along a sagging curve from (x0, y0) to (x1, y1), design units */
export const fxSweat = (p, t) => { for (let i = 0; i < 3; i++) { const k = (t + i / 3) % 1, s = i % 2 ? 1 : -1, x = 300 + s * (40 + k * 200), y = 420 - k * 120 + k * k * 260;
  p.g.save(); p.g.globalAlpha = 1 - k * 0.6; p.poly([[x, y - 46], [x + 24, y], [x, y + 18], [x - 24, y]], "#bfe6ff", 7); p.g.restore(); } };
/** twinkle on a smug grin */
/** twinkle on a smug grin */
export const fxTwinkle = (p, t) => { const k = Math.sin(Math.min(1, t) * Math.PI), r = 150 * k; if (r < 2) return;
  p.poly([[300, 500 - r], [300 + r * 0.22, 500 - r * 0.22], [300 + r, 500], [300 + r * 0.22, 500 + r * 0.22], [300, 500 + r], [300 - r * 0.22, 500 + r * 0.22], [300 - r, 500], [300 - r * 0.22, 500 - r * 0.22]], "#fffbe0", 8); };
/** coins flying from the purse to the showman (t 0..1) */
/** a carriage horse, side view facing right, trotting. opts: ph 0..1 (trot phase), col */
export const horseSide = (p, o = {}) => {
  const { ph = 0, col = "#6a4428" } = o, D = mul(col, [0.72, 0.72, 0.78]), light = rad(-120), th = thickAngle(light), ow = 8, g = p.g, two = Math.PI * 2;
  const leg = (x0, y0, k, far) => { const sw = Math.sin((ph + k) * two) * 40, lift = Math.max(0, Math.cos((ph + k) * two)) * 28;
    const kx = x0 + sw * 0.5, ky = (y0 + 930) / 2 - lift * 0.5, fx = x0 + sw, fy = 950 - lift;
    p.stroke([[x0, y0], [kx, ky], [fx, fy]], 30 + 12, INK); p.stroke([[x0, y0], [kx, ky], [fx, fy]], 30, far ? D : col); p.ell(fx + 4, fy + 6, 20, 12, "#2a2420", 5); };
  const bob = Math.abs(Math.sin(ph * two)) * 8;
  g.save(); g.translate(0, -bob);
  leg(420, 640, 0.5, true); leg(170, 640, 0, true);
  p.stroke([[100, 560], [60, 640], [70, 720]], 40, "#2a2420");                                        // tail
  const bp = blobPts(300, 590, { a: 190, b: 95, nTop: 2.2, nBot: 2.2, egg: 0, asym: 0, rot: 0, noise: 0.01, seed: 8 });
  p.shadedFill(bp, col, D, light, 190, 0.45); p.inkRing(bp, ow, th);
  p.band([[200, 520], [400, 520]], "#2a2420", 26, 3); p.band([[300, 500], [300, 680]], "#2a2420", 20, 3);     // harness
  leg(440, 650, 0, false); leg(190, 650, 0.5, false);
  // neck and head
  const neck = [[430, 520], [520, 360], [575, 380], [520, 600]];
  p.shadedFill(neck, col, D, light, 80, 0.4); p.poly(neck, null, ow);
  const hp = [[515, 330], [600, 345], [660, 420], [650, 450], [600, 445], [535, 400]]; p.shadedFill(hp, col, D, light, 70, 0.4); p.poly(hp, null, ow);
  p.ell(560, 335, 14, 30, col, 6, 0, 360, 20); p.stroke([[505, 345], [470, 400], [450, 470], [430, 530]], 22, "#2a2420");          // ear, mane
  p.ell(575, 370, 8, 9, INK, 0); p.dot(577, 367, 3, "#ffffff"); p.ell(640, 430, 5, 4, INK, 0);
  p.stroke([[600, 440], [560, 480], [500, 520]], 4, "#2a2420");
  g.restore();
};
