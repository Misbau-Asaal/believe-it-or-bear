// ================= 05 Byron's Bear: cast, held props and fx (appended to the toon library) =================
// People reuse romanFront (arm poses incl. "leash", faces) and add Regency clothes: Byron's coat and open collar with curls,
// black academic gowns, mortarboards, the dons' white bands, a fairground showman. Plus the bear (front and side view), a dog, fx.
FACE.smug = { eye: ["dot", "lid"], brow: [0, -2], mouth: "smirk" };
FACE.awe = { eye: ["shock", "shock"], brow: [-4, -4], mouth: "o" };
export const BB = {
  byron: { tunic: "#2c3756", skin: "#f6d2b4", style: "byron", curls: "#2a1a14" },
  stu1: { tunic: "#2a2830", skin: "#f5c9a0", style: "gown", vest: "#8a6a4a", mortar: true, hair: "#7a5232" },
  stu2: { tunic: "#2a2830", skin: "#c99067", style: "gown", vest: "#4f6a8f", mortar: true, hair: "#2b211c" },
  stu3: { tunic: "#2a2830", skin: "#ffe2c2", style: "gown", vest: "#8a3a3a", mortar: true, hair: "#c8a060", glasses: true },
  don: { tunic: "#1f1d24", skin: "#ffe2c2", style: "gown", vest: "#33303a", bands: true, stout: true, hairKind: "bald", hairCol: "#ece8e0", glasses: true },
  don2: { tunic: "#1f1d24", skin: "#f3d6bb", style: "gown", vest: "#33303a", bands: true, hair: "#a8a49c", brows: "#7a766e" },
  showman: { tunic: "#9a2f36", skin: "#f5c9a0", style: "showman", vest: "#e8c45a", topHat: true, moustache: "#4a2a1a", stout: true },
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
  else if (item === "paper") { p.poly([[x - 16 * u, y - 30 * u], [x + 16 * u, y - 30 * u], [x + 16 * u, y + 8 * u], [x - 16 * u, y + 8 * u]], "#f6f0dc", 1.6 * u); for (let i = 0; i < 4; i++) p.stroke([[x - 11 * u, y - 22 * u + i * 7 * u], [x + 11 * u, y - 22 * u + i * 7 * u]], 1 * u, "#8a8070"); }
};

// ---------------- the bear ----------------
const FUR = "#7e5434", FUR_D = "#583a22", FUR_L = "#a2764a", MUZ = "#dcb88e", NOSE = "#2a1a14", COLLAR = "#c8323a";
/** the bear, front-facing. opts:
 *  pose 'stand' | 'sit' ; L / R: 'hang' | 'up' | 'wave' | 'hold' | 'quill' (paw at the mouth, chewing the quill) | 'write' (paw down, quill on the desk)
 *  expr 'neutral' | 'happy' | 'smug' | 'shock' | 'wink' | 'sad' | 'chew' ; blink ; look ; tongue (panting) ; collar ; bow (ribbon colour)
 *  mortar 0..1 (mortarboard dropping onto the head: 0 = none, <1 falling, 1 = on) ; bob ; wv (wave phase) */
export const bbBear = (p, o = {}) => {
  const { pose = "stand", expr = "neutral", blink = 0, look = 0, bob = 0 } = o;
  const g = p.g, ow = 9, light = rad(-120), th = thickAngle(light);
  const sit = pose === "sit";
  const by = (sit ? 790 : 690) - bob * 30, hy = (sit ? 520 : 420) - bob * 30;
  if (sit) for (const s of [-1, 1]) { p.ell(300 + s * 110, 935, 70, 48, FUR, ow); p.ell(300 + s * 118, 930, 40, 30, MUZ, 6); for (let i = -1; i <= 1; i++) p.ell(300 + s * 118 + i * 18, 902, 9, 9, MUZ, 4); }
  else for (const s of [-1, 1]) { p.poly(rrect(300 + s * 70 - 50, 800, 300 + s * 70 + 50, 960, 36), FUR_D, ow); p.ell(300 + s * 74, 958, 62, 26, FUR, ow); }
  const bp = blobPts(300, by, { a: sit ? 165 : 150, b: sit ? 150 : 170, nTop: 2.1, nBot: 2.2, egg: 0.06, asym: 0, rot: 0, noise: 0.015, seed: 9 });
  p.shadedFill(bp, FUR_L, FUR_D, light, 160, 0.5);
  p.clip(bp, () => { p.ell(300, by + 30, 95, 115, "#c99c6c", 0); const r = bbRng(3); for (let i = 0; i < 26; i++) { const x = 170 + r() * 260, y = by - 140 + r() * 260; p.stroke([[x, y], [x - 8, y + 18]], 4, FUR_D); } });
  p.inkRing(bp, ow, th);
  const sh = { L: [175, by - 95], R: [425, by - 95] };
  const paw = (x, y) => { p.ell(x, y, 40, 38, FUR, ow); p.ell(x, y + 6, 20, 16, MUZ, 0); };
  const arm = (side, pose_) => {
    const [sx, sy] = sh[side], d = side === "L" ? -1 : 1;
    let end;
    switch (pose_) {
      case "up": end = [sx + d * 40, sy - 230]; break;
      case "wave": end = [sx + d * (60 + Math.sin(o.wv || 0) * 25), sy - 210]; break;
      case "hold": end = [300 + d * 55, by - 20]; break;
      case "quill": end = [300 + d * 40, hy + 70]; break;
      case "write": end = [300 + d * 60, by + 40]; break;
      default: end = [sx + d * 18, sy + 165];
    }
    const mid = [(sx + end[0]) / 2 + d * 30, (sy + end[1]) / 2 + 10];
    p.stroke([[sx, sy], mid, end], 74, INK); p.stroke([[sx, sy], mid, end], 58, side === "L" ? FUR : FUR_L);
    return end;
  };
  const Lp = o.L ?? "hang", Rp = o.R ?? "hang";
  const Le = arm("L", Lp), Re = arm("R", Rp);
  // head
  const hx = 300;
  for (const s of [-1, 1]) { p.ell(hx + s * 82, hy - 78, 40, 38, FUR, ow); p.ell(hx + s * 82, hy - 74, 20, 18, "#c99c6c", 0); }
  const hp = blobPts(hx, hy, { a: 112, b: 100, nTop: 2.1, nBot: 2.0, egg: 0.04, asym: 0, rot: 0, noise: 0.01, seed: 5 });
  p.shadedFill(hp, FUR_L, FUR, light, 112, 0.45); p.inkRing(hp, ow, th);
  if (o.collar) { p.band([[hx - 92, hy + 92], [hx + 92, hy + 92]], COLLAR, 22, 4, "round"); p.ell(hx, hy + 110, 12, 12, null, 5); }
  if (o.bow) { const y = hy + 96; p.poly([[hx, y], [hx - 46, y - 24], [hx - 46, y + 24]], o.bow, 6); p.poly([[hx, y], [hx + 46, y - 24], [hx + 46, y + 24]], o.bow, 6); p.ell(hx, y, 13, 13, o.bow, 5); }
  p.ell(hx, hy + 38, 58, 44, MUZ, 7);
  p.ell(hx, hy + 18, 24, 16, NOSE, 5); p.ell(hx - 6, hy + 13, 7, 4, "#6a5048", 0);
  const lid = lidOf(blink), ey = hy - 18;
  for (const s of [-1, 1]) {
    const ex = hx + s * 42 + look * 6, r = 14;
    const wink = expr === "wink" && s > 0;
    if (expr === "happy" || wink) { p.stroke(ellPts(ex, ey + 4, r, r * 0.8, 200, 340, 0, 10), 7); continue; }
    if (lid >= 1) { p.stroke([[ex - r, ey], [ex + r, ey]], 7); continue; }
    if (expr === "shock") { p.ell(ex, ey, r * 1.35, r * 1.5, "#ffffff", 6); p.dot(ex, ey + 2, 6); continue; }
    p.ell(ex, ey, r * 0.9, r, INK, 0); p.dot(ex + 4, ey - 5, 4, "#ffffff");
    if (expr === "smug" || expr === "chew" || lid > 0) p.poly([[ex - r - 4, ey - r - 6], [ex + r + 4, ey - r - 6], [ex + r + 4, ey - r * 0.1], [ex - r - 4, ey - r * 0.1]], FUR_L, 0), p.stroke([[ex - r - 2, ey - r * 0.1], [ex + r + 2, ey - r * 0.1]], 6);
    if (expr === "sad") p.stroke([[ex - s * (r + 6), ey - r - 4], [ex + s * (r + 8), ey - r - 16]], 7);
    if (expr === "smug") p.stroke([[ex - s * (r + 6), ey - r - 14], [ex + s * (r + 8), ey - r - 20]], 6);
  }
  const my = hy + 52;
  if (expr === "shock" || o.mouth === "open") p.ell(hx, my + 4, 18, 16, "#6a2236", 5);
  else if (expr === "sad") p.stroke(ellPts(hx, my + 16, 18, 10, 200, 340, 0, 10), 6);
  else if (expr === "chew") { p.stroke([[hx, hy + 30], [hx, my - 4]], 5); p.ell(hx + 4, my + 2, 14, 9 + 4 * Math.abs(Math.sin((o.ch || 0) * 3)), "#6a2236", 5); }
  else { p.stroke([[hx, hy + 30], [hx, my - 4]], 5); p.stroke(ellPts(hx, my - 8, 26, 16, 20, 160, 0, 10), 6); if (expr === "happy" || expr === "smug" || expr === "wink") p.ell(hx + 8, my + 10, 10, 8, "#e87a8a", 3); }
  if (o.tongue) { p.poly([[hx - 14, my + 2], [hx + 14, my + 2], [hx + 16, my + 34], [hx, my + 44], [hx - 16, my + 34]], "#ec7a8c", 5); p.stroke([[hx, my + 8], [hx, my + 30]], 3, "#c8506a"); }
  if (expr === "happy" || expr === "wink" || o.blush) for (const s of [-1, 1]) p.ell(hx + s * 72, hy + 20, 16, 10, "#e89a8a88", 0);
  // mortarboard (drops in from above)
  if (o.mortar > 0) { const k = Math.min(1, o.mortar), dy = (1 - k) * -260, tl = (1 - k) * 0.5;
    g.save(); g.translate(hx, hy - 96 + dy); g.rotate(tl - 0.06); g.translate(-hx, -(hy - 96));
    const cy = hy - 96, col = "#1f1d24";
    p.poly(ellPts(hx, cy + 14, 104, 34, 180, 360, 0, 24), col, 7);
    const top = [[hx - 170, cy], [hx + 6, cy - 46], [hx + 176, cy], [hx, cy + 44]];
    p.poly(top.map(([x, y]) => [x, y + 12]), "#0e0d12", 6); p.poly(top, col, 7); p.ell(hx + 3, cy, 10, 7, "#e0b24a", 3);
    p.stroke([[hx + 3, cy], [hx + 136, cy + 8], [hx + 140, cy + 70]], 6, "#e0b24a"); p.poly([[hx + 128, cy + 60], [hx + 152, cy + 60], [hx + 158, cy + 100], [hx + 122, cy + 100]], "#e0b24a", 4);
    g.restore(); }
  // the quill
  for (const [e, q_, d] of [[Le, Lp, -1], [Re, Rp, 1]]) {
    if (q_ === "quill") { p.stroke([[e[0] - d * 70, e[1] - 6], [e[0] + d * 70, e[1] - 30]], 5); p.poly([[e[0] + d * 20, e[1] - 18], [e[0] + d * 120, e[1] - 70], [e[0] + d * 100, e[1] - 40], [e[0] + d * 40, e[1] - 10]], "#fbf7ee", 5); }
    if (q_ === "write") { p.stroke([[e[0] - d * 10, e[1] + 26], [e[0] + d * 30, e[1] - 60]], 5); p.poly([[e[0] + d * 20, e[1] - 36], [e[0] + d * 70, e[1] - 120], [e[0] + d * 46, e[1] - 116], [e[0] + d * 12, e[1] - 50]], "#fbf7ee", 5); }
  }
  paw(Le[0], Le[1]); paw(Re[0], Re[1]);
};

/** the bear walking on all fours, side view facing right (flip the card to face left). opts:
 *  step 0..1 (walk phase), expr 'neutral' | 'happy', blink, tongue, collar, sitDown 0..1 (sits back on its haunches), wag */
export const BEAR_COLLAR = [432, 708];          // collar ring in design units (for the chain)
export const bbBearSide = (p, o = {}) => {
  const { step = 0, expr = "neutral", blink = 0, sit = 0 } = o, light = rad(-120), th = thickAngle(light), ow = 9, two = Math.PI * 2;
  const g = p.g, rise = Math.abs(Math.sin(step * two)) * 6 * (1 - sit);
  g.save(); g.translate(0, -rise);
  // legs: far pair darker, behind the body
  const leg = (x0, y0, ph, far, back) => {
    const sw = Math.sin((step + ph) * two) * 34 * (1 - sit), lift = Math.max(0, Math.cos((step + ph) * two)) * 22 * (1 - sit);
    const fx = back && sit > 0 ? x0 + 40 * sit : x0 + sw, fy = 962 - lift;
    p.stroke([[x0, y0], [(x0 + fx) / 2 - (back ? 10 : -6), (y0 + fy) / 2], [fx, fy - 12]], 64 + 14, INK); p.stroke([[x0, y0], [(x0 + fx) / 2 - (back ? 10 : -6), (y0 + fy) / 2], [fx, fy - 12]], 64, far ? FUR_D : FUR);
    p.ell(fx + 10, fy - 8, 40, 20, far ? FUR_D : FUR, ow);
  };
  const bodyY = 700 + 40 * sit, rot = -0.42 * sit;
  leg(400, 760, 0.5, true, false); leg(185 + 30 * sit, 770 + 40 * sit, 0, true, true);
  // tail
  p.ell(95 + 40 * sit, 650 + 60 * sit, 30, 24, FUR_D, ow, 0, 360, (o.wag || 0) * 20);
  // body
  g.save(); g.translate(300, bodyY); g.rotate(rot); g.translate(-300, -bodyY);
  const bp = blobPts(300, bodyY, { a: 205, b: 128, nTop: 2.1, nBot: 2.3, egg: -0.05, asym: 0, rot: 0, noise: 0.012, seed: 11 });
  p.shadedFill(bp, FUR_L, FUR_D, light, 200, 0.5); p.clip(bp, () => { const r = bbRng(8); for (let i = 0; i < 24; i++) { const x = 130 + r() * 340, y = bodyY - 100 + r() * 190; p.stroke([[x, y], [x - 10, y + 16]], 4, FUR_D); } });
  p.inkRing(bp, ow, th);
  g.restore();
  leg(415, 770, 0, false, false); leg(205 + 30 * sit, 780 + 40 * sit, 0.5, false, true);
  // head (raised a little when sitting)
  const hx = 470 - 20 * sit, hy = 600 - 70 * sit;
  p.ell(hx - 40, hy - 70, 34, 32, FUR, ow); p.ell(hx - 40, hy - 66, 16, 14, "#c99c6c", 0);
  const hp = blobPts(hx, hy, { a: 92, b: 84, nTop: 2.1, nBot: 2.0, egg: 0.02, asym: 0, rot: 0, noise: 0.01, seed: 6 });
  p.shadedFill(hp, FUR_L, FUR, light, 92, 0.45); p.inkRing(hp, ow, th);
  p.ell(hx + 76, hy + 22, 46, 34, MUZ, 7); p.ell(hx + 112, hy + 8, 16, 13, NOSE, 4);
  const ex = hx + 30, ey = hy - 18;
  if (expr === "happy") p.stroke(ellPts(ex, ey + 4, 12, 10, 200, 340, 0, 10), 7);
  else if (lidOf(blink) >= 1) p.stroke([[ex - 12, ey], [ex + 12, ey]], 7);
  else { p.ell(ex, ey, 11, 13, INK, 0); p.dot(ex + 4, ey - 5, 3.6, "#ffffff"); }
  p.stroke(ellPts(hx + 84, hy + 38, 22, 12, 20, 150, 0, 10), 5);
  if (o.tongue) { p.poly([[hx + 76, hy + 46], [hx + 98, hy + 46], [hx + 100, hy + 80], [hx + 86, hy + 90], [hx + 72, hy + 78]], "#ec7a8c", 5); p.stroke([[hx + 86, hy + 52], [hx + 86, hy + 76]], 3, "#c8506a"); }
  if (o.collar) { p.band([[hx - 70, hy + 30], [hx - 30, hy + 92]], COLLAR, 26, 4, "round"); p.ell(BEAR_COLLAR[0] - 20 * sit, BEAR_COLLAR[1] - 70 * sit, 13, 13, null, 5); }
  g.restore();
};

/** a dog sitting, front view. opts: expr 'happy' | 'sad' | 'neutral', droop 0..1 (ears and head down), tongue, wag (tail phase), blink */
export const bbDog = (p, o = {}) => {
  const { expr = "happy", droop = 0, wag = 0, blink = 0 } = o, light = rad(-120), th = thickAngle(light), ow = 9;
  const C = "#f2e6d2", C_D = "#d2bea0", SPOT = "#8a5a36";
  // tail
  const ta = Math.sin(wag * Math.PI * 2) * 0.6 * (1 - droop);
  p.stroke([[380, 900], [440 + 50 * Math.sin(ta), 860 - 60 * Math.cos(ta)]], 34 + 14, INK); p.stroke([[380, 900], [440 + 50 * Math.sin(ta), 860 - 60 * Math.cos(ta)]], 34, C);
  const bp = blobPts(300, 820, { a: 115, b: 135, nTop: 2.3, nBot: 2.0, egg: 0.25, asym: 0, rot: 0, noise: 0.01, seed: 4 });
  p.shadedFill(bp, C, C_D, light, 120, 0.5); p.clip(bp, () => p.ell(360, 760, 50, 60, SPOT, 0)); p.inkRing(bp, ow, th);
  for (const s of [-1, 1]) { p.ell(300 + s * 70, 945, 44, 26, C, ow); p.stroke([[300 + s * 30, 830], [300 + s * 50, 930]], 48 + 14, INK); p.stroke([[300 + s * 30, 830], [300 + s * 50, 930]], 48, C); p.ell(300 + s * 50, 940, 30, 22, C, ow); }
  const hy = 610 + droop * 30, hx = 300;
  for (const s of [-1, 1]) { const ex = hx + s * (92 - 10 * droop), ang = s * (0.25 - 0.4 * droop); p.ell(ex, hy - 10 + droop * 50, 34, 72, s > 0 ? SPOT : "#a06a40", ow, 0, 360, ang * 57); }
  const hp = blobPts(hx, hy, { a: 96, b: 88, nTop: 2.2, nBot: 1.9, egg: -0.1, asym: 0, rot: 0, noise: 0.01, seed: 7 });
  p.shadedFill(hp, C, C_D, light, 96, 0.45); p.clip(hp, () => p.ell(hx + 50, hy - 40, 44, 40, SPOT, 0)); p.inkRing(hp, ow, th);
  p.ell(hx, hy + 40, 50, 36, "#fbf4e6", 6); p.ell(hx, hy + 22, 20, 14, NOSE, 4);
  const ey = hy - 12;
  for (const s of [-1, 1]) { const ex = hx + s * 38;
    if (expr === "happy") p.stroke(ellPts(ex, ey + 4, 13, 10, 200, 340, 0, 10), 7);
    else if (lidOf(blink) >= 1) p.stroke([[ex - 12, ey], [ex + 12, ey]], 7);
    else { p.ell(ex, ey, 12, 14, INK, 0); p.dot(ex + 4, ey - 5, 4, "#ffffff"); if (expr === "sad") p.stroke([[ex - s * 18, ey - 18], [ex + s * 14, ey - 30]], 6); } }
  if (expr === "sad") p.stroke(ellPts(hx, hy + 62, 16, 9, 200, 340, 0, 10), 6);
  else { p.stroke(ellPts(hx - 14, hy + 44, 14, 10, 20, 160, 0, 8), 5); p.stroke(ellPts(hx + 14, hy + 44, 14, 10, 20, 160, 0, 8), 5); }
  if (o.tongue && expr !== "sad") { p.poly([[hx - 12, hy + 52], [hx + 12, hy + 52], [hx + 14, hy + 82], [hx, hy + 90], [hx - 14, hy + 82]], "#ec7a8c", 5); }
};

// ---------------- fx ----------------
export const fxWord = (p, word, t = 1, col = "#ffd84a", size = 150, rot = -0.12) => {
  const g = p.g, k = Math.min(1, t * 4), s = 0.6 + 0.5 * k - 0.1 * Math.max(0, t - 0.5);
  g.save(); g.translate(300, 500); g.rotate(rot); g.scale(s, s); g.font = `bold ${size}px "DejaVu Sans", Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.globalAlpha = Math.min(1, (1 - t) * 4); g.lineJoin = "round"; g.lineWidth = 26; g.strokeStyle = INK; g.strokeText(word, 0, 0); g.fillStyle = col; g.fillText(word, 0, 0); g.restore();
};
export const fxHearts = (p, t) => { for (let i = 0; i < 4; i++) { const k = (t + i / 4) % 1, x = 200 + i * 70 + Math.sin(k * 7 + i) * 30, y = 760 - k * 520, r = 26 + 10 * Math.sin(i);
  p.g.save(); p.g.globalAlpha = Math.min(1, (1 - k) * 2.5); p.poly([[x, y + r * 1.3], [x - r * 1.3, y - r * 0.1], [x - r * 0.65, y - r * 0.9], [x, y - r * 0.45], [x + r * 0.65, y - r * 0.9], [x + r * 1.3, y - r * 0.1]], "#ff6a8a", 6); p.g.restore(); } };
/** a rubber stamp slamming down (t 0..1) */
export const fxStamp = (p, word, t, col = "#d23a2a") => {
  const g = p.g, k = t < 0.15 ? 1.35 - 0.35 * (t / 0.15) : 1, a = t > 0.85 ? (1 - t) / 0.15 : 1;
  g.save(); g.globalAlpha = a; g.translate(300, 500); g.rotate(-0.16); g.scale(k, k);
  g.lineJoin = "round"; g.strokeStyle = col; g.lineWidth = 16; g.strokeRect(-250, -90, 500, 180); g.lineWidth = 6; g.strokeRect(-232, -72, 464, 144);
  g.font = `900 ${Math.min(120, Math.round(780 / Math.max(4, word.length)))}px "DejaVu Sans", Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(word, 0, 6); g.restore();
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
export const fxChain = (p, x0, y0, x1, y1, sag = 60) => {
  const n = Math.max(6, Math.round(Math.hypot(x1 - x0, y1 - y0) / 22));
  for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + sag * 4 * t * (1 - t);
    const dx = (x1 - x0) / n, dy = (y1 - y0) / n + sag * 4 * (1 - 2 * t) / n, a = Math.atan2(dy, dx) * 180 / Math.PI;
    if (i % 2) p.ell(x, y, 13, 4.5, "#8a9096", 4, 0, 360, a); else p.ell(x, y, 13, 9, null, 5, 0, 360, a); }
};
/** the big magnifying glass, for the close-up on the rules (t: little wobble) */
export const fxMagnifier = (p, t = 0) => {
  const g = p.g; g.save(); g.translate(300, 420); g.rotate(-0.25 + Math.sin(t * 6) * 0.03);
  p.stroke([[60, 200], [170, 470]], 54 + 16, INK); p.stroke([[60, 200], [170, 470]], 54, "#7a4a2a"); p.stroke([[40, 150], [62, 205]], 70, "#d0a34a");
  g.fillStyle = "rgba(220,240,255,0.22)"; g.beginPath(); g.arc(0, 0, 200, 0, 7); g.fill();
  g.lineWidth = 42; g.strokeStyle = INK; g.stroke(); g.lineWidth = 26; g.strokeStyle = "#d0a34a"; g.stroke();
  g.lineWidth = 12; g.strokeStyle = "rgba(255,255,255,0.8)"; g.beginPath(); g.arc(0, 0, 160, rad(200), rad(250)); g.stroke(); g.restore();
};
/** books falling from someone's arms (t 0..1) */
export const fxBooks = (p, t, seed = 1) => { const r = bbRng(seed * 13 + 2);
  for (let i = 0; i < 3; i++) { const x = 220 + i * 80 + (r() - 0.5) * 60, y = 300 + 600 * t * t + i * 30, a = (r() - 0.5) * 2 + t * (2 + i); const g = p.g; g.save(); g.translate(x, y); g.rotate(a);
    p.poly(rrect(-60, -38, 60, 38, 6), ["#7a2f2a", "#2f5a3a", "#3a4a7a"][i], 8); p.stroke([[-48, 0], [48, 0]], 5, "#f2e6c8"); g.restore(); } };
export const fxSweat = (p, t) => { for (let i = 0; i < 3; i++) { const k = (t + i / 3) % 1, s = i % 2 ? 1 : -1, x = 300 + s * (40 + k * 200), y = 420 - k * 120 + k * k * 260;
  p.g.save(); p.g.globalAlpha = 1 - k * 0.6; p.poly([[x, y - 46], [x + 24, y], [x, y + 18], [x - 24, y]], "#bfe6ff", 7); p.g.restore(); } };
/** twinkle on a smug grin */
export const fxTwinkle = (p, t) => { const k = Math.sin(Math.min(1, t) * Math.PI), r = 150 * k; if (r < 2) return;
  p.poly([[300, 500 - r], [300 + r * 0.22, 500 - r * 0.22], [300 + r, 500], [300 + r * 0.22, 500 + r * 0.22], [300, 500 + r], [300 - r * 0.22, 500 + r * 0.22], [300 - r, 500], [300 - r * 0.22, 500 - r * 0.22]], "#fffbe0", 8); };
/** coins flying from the purse to the showman (t 0..1) */
export const fxCoins = (p, t) => { for (let i = 0; i < 5; i++) { const k = Math.min(1, Math.max(0, t * 1.6 - i * 0.12)), x = 120 + 360 * k, y = 600 - 260 * Math.sin(Math.PI * k) + i * 8; if (k <= 0 || k >= 1) continue;
  p.ell(x, y, 26, 26 * Math.abs(Math.cos(k * 12 + i)) + 4, "#f0c040", 6); } };
