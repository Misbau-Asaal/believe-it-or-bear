// ================= 04 The Microwave: cast, held props and fx (appended to the toon library) =================
// People reuse romanFront (arm poses incl. "pocket" and "hold", faces) and add 1940s lab clothes, glasses, hair,
// things held in the hand, and the effects (waves, popcorn, egg splat, water droplets, thermometer).
export const MW = {
  percy: { tunic: "#f1f2ec", skin: "#f5c9a0", style: "coat", shirt: "#d6e4ef", tie: "#2f4a7a", glasses: true, hairKind: "recede", hairCol: "#7a6250" },
  tech: { tunic: "#a9c6de", skin: "#ecd0b6", style: "braces", bow: "#c8323a", hair: "#2b211c", moustache: "#3a2a20" },
  tech2: { tunic: "#5f8a8a", dress: "#4f7a7a", skin: "#c99067", style: "collar", hair: "#3b2418", bun: true },
  boss: { tunic: "#4a4e5a", skin: "#ffe2c2", stout: true, style: "suit", shirt: "#f2f2ee", tie: "#8a2a2a", hairKind: "bald", hairCol: "#d9d6d0", moustache: "#d9d6d0", glasses: true },
  mover: { tunic: "#d8c9a6", skin: "#c99067", style: "overalls", bib: "#3f6a8f", cap: "#3f6a8f" },
  mover2: { tunic: "#c9d3dc", skin: "#f5c9a0", style: "overalls", bib: "#7a4a32", cap: "#8a3a2a", moustache: "#5a3b2a" },
  grump: { tunic: "#c9b48a", skin: "#ffe2c2", style: "braces", bow: "#2f5e3a", hairKind: "bald", hairCol: "#8a6a4a", stout: true },
};
const CHOC = "#6b3f22", CHOC_D = "#4a2814", CHOC_L = "#8d5a36";
const mwRng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

/** geometry exactly as romanFront computes it */
const mwGeo = (O, opts) => {
  const { seed = 3, facing = 0, bob = 0, tilt = 0, headTilt = 0 } = opts;
  const H = headBlob(seed, 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.stout ? 1.12 : 1.08, legsL = 1.38, sole = 975, cx = 300;
  const torsoBot = sole - legsL * HH - bob * HH, chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const Ta = (0.4 * W) / 1.06 * (O.stout ? 1.12 : 1), tcx = cx + 3 * u * facing;
  const T = { a: Ta, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: O.stout ? 0.17 : 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tp = blobPts(tcx, torsoBot - T.b, T);
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  return { H, W, HH, u, cx, hc, chin, torsoBot, hipY, Ta, tcx, tp, fx: cx + 7 * u * facing, facing,
    headRot: tilt + headTilt ? [rad(tilt + headTilt), cx, chin, cpx - cx, cpy - chin] : null, bodyRot: tilt ? [rad(tilt), cx, hipY] : null };
};
/** arm control points exactly as romanFront computes them */
const mwArm = (G, side, pose, opts = {}) => {
  const { tcx, Ta, chin, HH, u, cx, hc, H, torsoBot } = G;
  const s = [tcx + side * 0.85 * Ta, chin + 0.12 * HH], X = (k) => tcx + side * (Ta * 1.1 + k * u);
  switch (pose) {
    case "point": return [s, [X(28), s[1] - 0.02 * HH], [X(62), s[1] - 0.1 * HH]];
    case "up": return [s, [X(14), s[1] - 0.3 * HH], [X(22), s[1] - 0.75 * HH]];
    case "hip": return [s, [X(22), s[1] + 0.3 * HH], [tcx + side * Ta * 0.95, torsoBot - 0.3 * HH]];
    case "belly": return [s, [X(8), s[1] + 0.45 * HH], [tcx + side * 0.25 * Ta, torsoBot - 0.35 * HH]];
    case "lift": return [s, [X(20), s[1] - 0.25 * HH], [X(4), s[1] - 0.82 * HH]];
    case "cross": return [s, [X(2), s[1] + 0.38 * HH], [tcx - side * 0.45 * Ta, s[1] + 0.32 * HH]];
    case "reach": { const lf = (opts.lift || 0) * 0.62 * HH; return [s, [X(42), s[1] - 0.12 * HH - lf * 0.6], [X(82), s[1] - 0.5 * HH - lf]]; }
    case "thumb": return [s, [X(20), s[1] + 0.12 * HH], [X(44), s[1] - 0.12 * HH]];
    case "pocket": return [s, [X(6), s[1] + 0.4 * HH], [tcx + side * 0.46 * Ta, chin + 0.36 * HH]];
    case "hold": return [s, [X(12), s[1] + 0.4 * HH], [X(-4), s[1] + 0.1 * HH]];
    case "cheek": return [s, [X(16), s[1] + 0.05 * HH], [cx + side * (H.a + 2 * u), hc + 0.25 * H.b]];
    default: return [s, [X(4), s[1] + 0.48 * HH], [X(3), chin + 1.04 * HH]];
  }
};
const MW_FRONT = ["belly", "cross", "shield", "pocket", "hold"];

/** a 1940s lab person. opts as romanFront plus:
 *  pocket 'bar' | 'melt' | 'none' (chocolate bar in the coat pocket), egg 0..1 (egg on the face),
 *  hold { side: -1|1, item: 'bar'|'melt'|'bag'|'egg'|'envelope'|'bills'|'magnetron', droop, t } */
export const mwPerson = (p, key, opts = {}) => {
  const O = typeof key === "string" ? MW[key] : key;
  const R = opts.R ?? "hang", L = opts.L ?? "hang";
  romanFront(p, O, { ...opts, L, R });
  const G = mwGeo(O, opts), { H, HH, u, cx, hc, chin, torsoBot, Ta, tcx, tp } = G, light = opts.light ?? rad(-120);
  const armCol = mix(O.tunic, INK, 0.5);
  // ---- clothes on the torso (clipped to it; the belt romanFront draws is painted over with the same gradient) ----
  p.rot = G.bodyRot;
  p.clip(tp, () => {
    const beltY = torsoBot - 0.24 * HH;
    p.clip([[0, beltY - 0.06 * HH], [600, beltY - 0.06 * HH], [600, beltY + 0.06 * HH], [0, beltY + 0.06 * HH]], () => p.gradFill(tp, O.tunic, mul(O.tunic, SH_CLOTH), light));
    const top = chin + 0.03 * HH;
    if (O.style === "coat" || O.style === "suit") {
      p.poly([[tcx - 0.3 * Ta, top], [tcx + 0.3 * Ta, top], [tcx, chin + 0.5 * HH]], O.shirt, 1.4 * u);
      if (O.tie) { p.poly([[tcx - 4 * u, top + 1 * u], [tcx + 4 * u, top + 1 * u], [tcx + 3 * u, top + 7 * u], [tcx - 3 * u, top + 7 * u]], O.tie, 1.2 * u);
        p.poly([[tcx - 3 * u, top + 7 * u], [tcx + 3 * u, top + 7 * u], [tcx + 5 * u, chin + 0.42 * HH], [tcx, chin + 0.48 * HH], [tcx - 5 * u, chin + 0.42 * HH]], O.tie, 1.2 * u); }
      for (const s of [-1, 1]) p.stroke([[tcx + s * 0.36 * Ta, top - 2 * u], [tcx + s * 0.03 * Ta, chin + 0.54 * HH]], 1.8 * u);
      p.stroke([[tcx, chin + 0.54 * HH], [tcx, torsoBot + 0.2 * HH]], 1.4 * u);
      for (const k of [0.66, 0.84]) p.ell(tcx + 4 * u, chin + k * HH, 2.4 * u, 2.4 * u, O.style === "coat" ? "#d9dbd2" : "#2a2c33", 1 * u);
      if (O.style === "coat") { // chest pocket (viewer's right) with the chocolate bar
        const px = tcx + 0.5 * Ta, py = chin + 0.36 * HH;
        if (opts.pocket === "bar" || opts.pocket === "melt") {
          const melt = opts.pocket === "melt";
          p.poly([[px - 6 * u, py - (melt ? 4 : 10) * u], [px + 6 * u, py - (melt ? 3 : 10) * u], [px + 6 * u, py + 2 * u], [px - 6 * u, py + 2 * u]], melt ? CHOC_D : "#c8323a", 1.2 * u);
          if (!melt) p.band([[px - 6 * u, py - 6 * u], [px + 6 * u, py - 6 * u]], "#e8c060", 1.6 * u, 0.6 * u);
        }
        p.poly([[px - 11 * u, py], [px + 11 * u, py], [px + 10 * u, py + 15 * u], [px - 10 * u, py + 15 * u]], "#f6f7f2", 1.4 * u);
        p.stroke([[px - 11 * u, py + 3 * u], [px + 11 * u, py + 3 * u]], 1 * u, "#b9bcb2");
        if (opts.pocket === "melt") { // brown ooze soaking through and running down
          const r = mwRng(9);
          p.poly(blobPts(px, py + 9 * u, { a: 9 * u, b: 6 * u, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0, noise: 0.08, seed: 4 }), CHOC, 0);
          for (let i = 0; i < 3; i++) { const x = px - 6 * u + i * 6 * u, l = (8 + r() * 12) * u; p.stroke([[x, py + 12 * u], [x, py + 12 * u + l]], 3 * u, CHOC); p.dot(x, py + 12 * u + l, 2.4 * u, CHOC); }
        }
      } else p.poly([[tcx - 0.62 * Ta, chin + 0.32 * HH], [tcx - 0.42 * Ta, chin + 0.32 * HH], [tcx - 0.52 * Ta, chin + 0.24 * HH]], "#f2f2ee", 1 * u);
    } else if (O.style === "braces") {
      for (const s of [-1, 1]) p.band([[tcx + s * 0.46 * Ta, chin - 0.05 * HH], [tcx + s * 0.34 * Ta, torsoBot]], "#6a3a2a", 3.6 * u, 0.9 * u);
      p.stroke([[tcx - 0.2 * Ta, chin + 0.02 * HH], [tcx, chin + 0.12 * HH], [tcx + 0.2 * Ta, chin + 0.02 * HH]], 1.6 * u);
    } else if (O.style === "overalls") {
      p.poly([[tcx - 0.5 * Ta, chin + 0.24 * HH], [tcx + 0.5 * Ta, chin + 0.24 * HH], [tcx + 0.62 * Ta, torsoBot + 0.2 * HH], [tcx - 0.62 * Ta, torsoBot + 0.2 * HH]], O.bib, 1.6 * u);
      for (const s of [-1, 1]) { p.band([[tcx + s * 0.45 * Ta, chin + 0.26 * HH], [tcx + s * 0.62 * Ta, chin - 0.04 * HH]], O.bib, 4 * u, 0.9 * u); p.ell(tcx + s * 0.42 * Ta, chin + 0.28 * HH, 2.6 * u, 2.6 * u, "#e0b24a", 0.8 * u); }
      p.poly([[tcx - 0.18 * Ta, chin + 0.36 * HH], [tcx + 0.18 * Ta, chin + 0.36 * HH], [tcx + 0.18 * Ta, chin + 0.52 * HH], [tcx - 0.18 * Ta, chin + 0.52 * HH]], mix(O.bib, INK, 0.25), 1 * u);
    } else if (O.style === "collar") {
      for (const s of [-1, 1]) p.ell(tcx + s * 0.16 * Ta, chin + 0.07 * HH, 0.2 * Ta, 0.07 * HH, "#f4f1e6", 1.4 * u, s > 0 ? -90 : 90, s > 0 ? 90 : 270);
    }
  });
  if (O.style === "braces" && O.bow) { const y = chin + 0.06 * HH;
    p.poly([[tcx, y], [tcx - 11 * u, y - 6 * u], [tcx - 11 * u, y + 6 * u]], O.bow, 1.4 * u); p.poly([[tcx, y], [tcx + 11 * u, y - 6 * u], [tcx + 11 * u, y + 6 * u]], O.bow, 1.4 * u); p.ell(tcx, y, 3 * u, 3 * u, O.bow, 1.2 * u); }
  // front arms go back on top of the clothes
  for (const [side, pose] of [[-1, L], [1, R]]) if (MW_FRONT.includes(pose)) {
    const pts = mwArm(G, side, pose, opts); p.stroke(curve(pts[0], pts[1], pts[2]), 5.2 * u, armCol); p.dot(pts[2][0], pts[2][1], 5.5 * u);
  }
  // ---- head: hair, glasses, egg ----
  p.rot = G.headRot;
  const fx = G.fx;
  if (O.hairKind === "recede" || O.hairKind === "bald") {
    for (const s of [-1, 1]) p.ell(cx + s * 0.9 * H.a + 3 * u * G.facing, hc - 0.16 * H.b, 0.15 * H.a, 0.3 * H.b, O.hairCol, 1.8 * u);
    if (O.hairKind === "recede") for (let i = 0; i < 3; i++) p.stroke(curve([cx - 0.36 * H.a + i * 8 * u, hc - 0.86 * H.b], [cx - 0.1 * H.a + i * 8 * u, hc - 1.02 * H.b], [cx + 0.2 * H.a + i * 6 * u, hc - 0.9 * H.b]), 2.6 * u, O.hairCol);
    p.ell(cx - 0.3 * H.a, hc - 0.72 * H.b, 0.12 * H.a, 0.06 * H.b, "#ffffff88", 0, 0, 360, -20);
  }
  if (O.bun) { p.ell(cx + 0.08 * H.a, hc - 1.04 * H.b, 0.3 * H.a, 0.22 * H.b, O.hair, 2 * u); p.stroke([[cx - 0.22 * H.a, hc - 1.2 * H.b], [cx + 0.42 * H.a, hc - 0.92 * H.b]], 2.4 * u, "#e8b53a"); }
  if (O.glasses) {
    for (const s of [-1, 1]) { p.ell(fx + s * 13 * u, hc, 10.5 * u, 9.5 * u, "rgba(210,235,255,0.22)", 2.2 * u); p.stroke([[fx + s * 13 * u - 5 * u, hc - 4 * u], [fx + s * 13 * u - 1 * u, hc - 6 * u]], 1.4 * u, "#ffffff"); }
    p.stroke([[fx - 2.5 * u, hc - 1.5 * u], [fx, hc - 3 * u], [fx + 2.5 * u, hc - 1.5 * u]], 2 * u);
    for (const s of [-1, 1]) p.stroke([[fx + s * 23.5 * u, hc - 2 * u], [cx + s * 0.97 * H.a, hc - 5 * u]], 2 * u);
  }
  if (opts.egg > 0) { const k = opts.egg, r = mwRng(21);
    p.poly(blobPts(fx + 3 * u, hc + 4 * u, { a: 36 * u * k, b: 30 * u * k, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0.3, noise: 0.12, seed: 8 }), "#fff8ea", 1.6 * u);
    p.poly(blobPts(fx + 8 * u, hc + 8 * u, { a: 15 * u * k, b: 12 * u * k, nTop: 2, nBot: 2, egg: 0, asym: 0, rot: 0, noise: 0.06, seed: 3 }), "#ffcc2a", 1.6 * u);
    for (let i = 0; i < 4; i++) { const x = fx - 24 * u + i * 16 * u + r() * 6 * u, y0 = hc + 18 * u, l = (10 + r() * 22) * u * k; p.stroke([[x, y0], [x, y0 + l]], 4 * u, i % 2 ? "#ffcc2a" : "#fff8ea"); p.ell(x, y0 + l, 2.6 * u, 3.2 * u, i % 2 ? "#ffcc2a" : "#fff8ea", 1 * u); }
    for (let i = 0; i < 5; i++) p.ell(fx - 40 * u + r() * 80 * u, hc - 40 * u + r() * 30 * u, (3 + r() * 4) * u, (3 + r() * 3) * u, r() < 0.4 ? "#ffcc2a" : "#fff8ea", 1 * u);
  }
  p.rot = null;
  // ---- something in the hand ----
  if (opts.hold) {
    const h = opts.hold, side = h.side ?? 1, pose = side > 0 ? R : L, [hx, hy] = mwArm(G, side, pose, opts)[2];
    p.rot = G.bodyRot;
    holdItem(p, h.item, hx, hy, u, h, side);
    p.dot(hx, hy, 5.5 * u); // the hand stays on top of what it holds
    p.rot = null;
  }
};

const holdItem = (p, item, x, y, u, h, side) => {
  if (item === "bar" || item === "melt") mwBar(p, x, y, item === "melt" ? (h.droop ?? 1) : 0, h.dir ?? -side, u);
  else if (item === "bag") mwBag(p, x, y, h.t ?? 0, u);
  else if (item === "egg") p.ell(x, y - 11 * u, 9 * u, 12 * u, "#fbf4e4", 2 * u), p.ell(x - 3 * u, y - 16 * u, 2.4 * u, 3.4 * u, "#ffffff", 0);
  else if (item === "envelope") { const o = h.open ?? 0, x0 = x - 20 * u, y0 = y - 30 * u;
    p.poly([[x0, y0], [x0 + 40 * u, y0], [x0 + 40 * u, y0 + 26 * u], [x0, y0 + 26 * u]], "#efe6cc", 1.8 * u);
    p.stroke([[x0, y0], [x0 + 20 * u, y0 + 14 * u], [x0 + 40 * u, y0]], 1.4 * u);
    if (o > 0) p.poly([[x0, y0], [x0 + 20 * u, y0 - 14 * u * o], [x0 + 40 * u, y0]], "#e6dab8", 1.4 * u); }
  else if (item === "bills") mwBills(p, x, y, u, h.t ?? 1);
  else if (item === "magnetron") mwMagnetron(p, x, y - 16 * u, u);
};

/** chocolate bar held at (x, y): wrapper in the hand, chocolate sticking up; droop 0..1 melts it over toward dir */
export const mwBar = (p, x, y, droop, dir, u) => {
  const w = 20 * u, L = 30 * u, y0 = y - 6 * u, N = 12, cl = [[x, y0]], ang = (s) => dir * droop * 2.3 * s * s;
  for (let i = 1; i <= N; i++) { const s = i / N, a = ang(s), [px, py] = cl[i - 1]; cl.push([px + Math.sin(a) * L / N, py - Math.cos(a) * L / N]); }
  const left = [], right = [];
  cl.forEach(([px, py], i) => { const s = i / N, a = ang(s), hw = w / 2 * (1 - 0.25 * s * droop), nx = Math.cos(a), ny = Math.sin(a); left.push([px - nx * hw, py - ny * hw]); right.push([px + nx * hw, py + ny * hw]); });
  const tip = cl[N], aT = ang(1);
  const body = [...left, [tip[0] + Math.sin(aT) * 3 * u, tip[1] - Math.cos(aT) * 3 * u], ...right.reverse()];
  // drips hang straight down from the lower edge of the bent part
  if (droop > 0.05) { const edge = dir > 0 ? left : right.slice().reverse(), r = mwRng(5);
    for (const s of [0.55, 0.75, 0.92]) { const [px, py] = edge[Math.round(s * N)], l = (6 + 14 * r()) * u * droop; p.stroke([[px, py], [px, py + l]], 3.4 * u + 2.4 * u, INK); p.stroke([[px, py], [px, py + l]], 3.4 * u, CHOC); p.ell(px, py + l, 2.6 * u, 3.4 * u, CHOC, 1.2 * u); } }
  p.poly(body, CHOC, 2 * u);
  if (droop < 0.35) for (const s of [0.34, 0.67]) { const i = Math.round(s * N); p.stroke([left[i], right[N - i] || right[i]], 1.2 * u, CHOC_L); }
  if (droop > 0.2) p.stroke(cl.slice(2, N - 1).map(([px, py]) => [px - 4 * u, py]), 1.6 * u, "#a06a44");
  // wrapper
  p.poly([[x - w / 2 - 1 * u, y0], [x + w / 2 + 1 * u, y0], [x + w / 2 + 2 * u, y + 14 * u], [x - w / 2 - 2 * u, y + 14 * u]], "#c8323a", 2 * u);
  p.band([[x - w / 2, y0 + 3 * u], [x + w / 2, y0 + 3 * u]], "#e8c060", 2 * u, 0.6 * u);
  p.ell(x, y + 6 * u, 6 * u, 3.4 * u, "#f4f1e6", 1 * u);
};
/** striped paper popcorn bag, bottom at the hand; t 0..1 heats it up (shakes, puffs, pops open) */
export const mwBag = (p, x, y, t, u) => {
  const sh = t > 0.2 ? Math.sin(t * 60) * 2.2 * u * Math.min(1, (t - 0.2) * 3) : 0, puff = 1 + 0.18 * Math.max(0, t - 0.5) * 2;
  const w = 17 * u * puff, h = 40 * u, bx = x + sh, by = y + 4 * u;
  const pts = [[bx - w * 0.82, by], [bx + w * 0.82, by], [bx + w, by - h], [bx - w, by - h]];
  p.poly(pts, "#f2e4bd", 2 * u);
  p.clip(pts, () => { for (const k of [-0.6, 0, 0.6]) p.poly([[bx + k * w - 4 * u, by], [bx + k * w + 4 * u, by], [bx + k * w * 1.2 + 4.8 * u, by - h], [bx + k * w * 1.2 - 4.8 * u, by - h]], "#d2403a", 0); });
  p.poly(pts, null, 2 * u);
  const zz = []; for (let i = 0; i <= 8; i++) zz.push([bx - w + i * w / 4, by - h - (i % 2 ? 4 : 0) * u]); p.stroke(zz, 2 * u);
  if (t > 0.8) for (let i = 0; i < 4; i++) popPiece(p, bx - w * 0.6 + i * w * 0.4, by - h - 4 * u - (i % 2) * 6 * u, 6 * u, i);
};
export const mwBills = (p, x, y, u, t = 1) => {
  const g = p.g, [X, Y] = p.P(x, y - 6 * u), rot0 = p.rot ? p.rot[0] : 0;
  for (const [a, dx] of [[-0.22 * t, -6], [0.16 * t, 6]]) {
    g.save(); g.translate(X + dx * u, Y); g.rotate(rot0 + a - 0.05);
    const W = 46 * u, H = 21 * u; g.lineJoin = "round";
    g.fillStyle = "#a8cf9c"; g.strokeStyle = INK; g.lineWidth = 2 * u; g.beginPath(); g.rect(-W / 2, -H, W, H); g.fill(); g.stroke();
    g.strokeStyle = "#4f7f4a"; g.lineWidth = 1.2 * u; g.strokeRect(-W / 2 + 2.5 * u, -H + 2.5 * u, W - 5 * u, H - 5 * u);
    g.fillStyle = "#cfe6c4"; g.beginPath(); g.ellipse(0, -H / 2, 7 * u, 7.5 * u, 0, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#2f5a2c"; g.font = `bold ${8 * u}px "DejaVu Sans", Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("1", -W / 2 + 7 * u, -H + 7 * u); g.fillText("1", W / 2 - 7 * u, -7 * u); g.fillText("$", 0, -H / 2 + 0.5 * u);
    g.restore();
  }
};
export const mwMagnetron = (p, x, y, u) => {
  const pts = rrect(x - 16 * u, y - 14 * u, x + 16 * u, y + 14 * u, 3 * u);
  p.shadedFill(pts, "#d08a4a", "#9a5a2a", rad(-120), 16 * u, 0.4); p.poly(pts, null, 2 * u);
  for (let i = 0; i < 4; i++) p.stroke([[x - 14 * u, y - 9 * u + i * 6 * u], [x + 14 * u, y - 9 * u + i * 6 * u]], 1.2 * u, "#8a4a20");
  p.ell(x, y, 6 * u, 6 * u, "#3a2a22", 1.4 * u); p.poly(rrect(x - 3 * u, y - 24 * u, x + 3 * u, y - 14 * u, 1 * u), "#b8bcc0", 1.4 * u);
};
const popPiece = (p, x, y, r, seed = 0) => {
  const a = seed * 1.7;
  for (const [dx, dy, k] of [[0, 0, 0.62], [0.7, -0.3, 0.52], [-0.62, -0.38, 0.55], [0.08, -0.82, 0.5]]) {
    const c = Math.cos(a), s = Math.sin(a), ox = (dx * c - dy * s) * r, oy = (dx * s + dy * c) * r; p.ell(x + ox, y + oy, r * k, r * k, "#fffaf0", r * 0.16); }
  p.ell(x + Math.cos(a + 1.6) * r * 0.5, y + Math.sin(a + 1.6) * r * 0.5, r * 0.28, r * 0.2, "#f0c040", r * 0.1);
};

// ---------------- water droplet (the "water in food") ----------------
const DROP = "#7cc8f2", DROP_D = "#3f88c4", HOT = "#ff8a3a", HOT_D = "#c8401a";
/** opts: expr 'neutral' | 'happy' | 'shock' | 'dazed' | 'hot'; hot 0..1 (turns orange, sweats, steams); blink; sq squash */
export const fxDroplet = (p, o = {}) => {
  const { expr = "neutral", hot = 0, blink = 0, sq = 0, look = 0 } = o, g = p.g, light = rad(-120);
  const col = mix(DROP, HOT, hot), dk = mix(DROP_D, HOT_D, hot);
  g.save(); g.translate(300, 860); g.scale(1 + sq, 1 - sq); g.translate(-300, -860);
  const cy = 640, r = 210, d = 430, th = Math.acos(r / d) * 180 / Math.PI;
  const pts = [[300, cy - d], ...ellPts(300, cy, r, r, -90 + th, 270 - th, 0, 40)];
  p.shadedFill(pts, col, dk, light, r, 0.4); p.inkRing(pts, 14, thickAngle(light));
  p.ell(222, 520, 26, 54, "#ffffffaa", 0, 0, 360, 25);
  // face
  const ey = 640, lx = 238 + look * 10, rx2 = 362 + look * 10;
  const eye = (x) => {
    if (expr === "happy") { p.arc(x, ey + 8, 26, 20, 200, 340, 10); return; }
    if (expr === "dazed") { const sp = []; for (let i = 0; i < 30; i++) { const a = i / 30 * Math.PI * 5, rr = 3 + i * 1.1; sp.push([x + Math.cos(a) * rr, ey + Math.sin(a) * rr]); } p.ell(x, ey, 34, 38, "#ffffff", 8); p.stroke(sp, 6); return; }
    if (blink > 0.5) { p.stroke([[x - 26, ey], [x + 26, ey]], 9); return; }
    const big = expr === "shock" ? 1.25 : 1; p.ell(x, ey, 30 * big, 36 * big, "#ffffff", 8); p.dot(x + look * 8 + 4, ey + 4, expr === "shock" ? 10 : 15); p.dot(x + look * 8 + 9, ey - 3, 4, "#ffffff");
  };
  eye(lx); eye(rx2);
  if (expr === "shock") p.ell(300, 760, 30, 38, "#5a1e28", 8);
  else if (expr === "dazed") p.stroke([[250, 760], [270, 748], [290, 764], [310, 748], [330, 764], [350, 752]], 8);
  else if (expr === "hot") { p.ell(300, 758, 40, 30, "#5a1e28", 8); p.ell(300, 776, 18, 12, "#e8647a", 0); }
  else p.arc(300, 730, 40, 28, 20, 160, 9);
  if (hot > 0.15) { // cheeks, sweat and steam
    for (const s of [-1, 1]) p.ell(300 + s * 110, 712, 26, 14, "#ff5a4a88", 0);
    const t = (o.t ?? 0);
    for (let i = 0; i < 3; i++) { const k = (t * 1.6 + i / 3) % 1, s = i % 2 ? 1 : -1; p.ell(300 + s * (200 + k * 90), 520 - k * 60 + (k * k) * 160, 14, 20, "#bfe6ff", 5); }
    if (hot > 0.5) for (let i = 0; i < 3; i++) { const k = (t * 1.2 + i / 3) % 1, x = 230 + i * 70 + Math.sin(k * 7 + i) * 16, y = 160 - k * 150; g.save(); g.globalAlpha = (1 - k) * Math.min(1, (hot - 0.5) * 3);
      p.stroke([[x, y + 70], [x - 14, y + 46], [x + 10, y + 22], [x - 6, y]], 12, "#ffffff"); g.restore(); }
  }
  g.restore();
};

// ---------------- fx ----------------
export const fxWord = (p, word, t = 1, col = "#ffd84a", size = 150, rot = -0.12) => {
  const g = p.g, k = Math.min(1, t * 4), s = 0.6 + 0.5 * k - 0.1 * Math.max(0, t - 0.5);
  g.save(); g.translate(300, 500); g.rotate(rot); g.scale(s, s); g.font = `bold ${size}px "DejaVu Sans", Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.globalAlpha = Math.min(1, (1 - t) * 4); g.lineJoin = "round"; g.lineWidth = 26; g.strokeStyle = INK; g.strokeText(word, 0, 0); g.fillStyle = col; g.fillText(word, 0, 0); g.restore();
};
export const fxSteam = (p, t) => { for (let i = 0; i < 3; i++) { const k = (t + i / 3) % 1, x = 230 + i * 70 + Math.sin(k * 6 + i) * 20, y = 640 - k * 380, r = 30 + k * 40; p.g.save(); p.g.globalAlpha = 1 - k; p.ell(x, y, r, r * 0.8, "#ffffff", 7); p.g.restore(); } };
export const fxThought = (p) => { p.ell(300, 470, 270, 220, "#ffffff", 10); for (const [x, y, r] of [[120, 760, 40], [80, 860, 24], [60, 930, 14]]) p.ell(x, y, r, r, "#ffffff", 8); };
/** thought bubble with a (modern) microwave oven, a chocolate bar going round inside */
export const fxOvenThought = (p, t) => {
  fxThought(p);
  p.poly(rrect(140, 370, 460, 580, 22), "#dfe3e6", 10);
  p.poly(rrect(160, 392, 380, 558, 12), "#2f3e46", 7);
  p.g.save(); p.g.globalAlpha = 0.55; p.ell(270, 475, 90, 60, "#ffe9a0", 0); p.g.restore();
  const a = t * 6, bx = 270 + Math.sin(a) * 30; p.poly([[bx - 30, 486], [bx + 30, 486], [bx + 30, 500], [bx - 30, 500]], CHOC, 5); p.poly([[bx - 30, 486], [bx - 8, 486], [bx - 8, 500], [bx - 30, 500]], "#c8323a", 5);
  p.ell(270, 506, 70, 10, "#9aa8ae", 5);
  for (let i = 0; i < 6; i++) p.ell(405 + (i % 2) * 24, 412 + Math.floor(i / 2) * 30, 8, 8, "#9aa4aa", 4);
  p.poly(rrect(392, 512, 442, 542, 6), "#5a6a72", 4);
};
/** invisible waves made visible: curved fronts moving right */
export const fxWaves = (p, t, col = "#ffd86a") => {
  const g = p.g;
  for (let i = 0; i < 4; i++) { const k = (t + i / 4) % 1, r = 60 + k * 420; g.save(); g.globalAlpha = Math.min(1, (1 - k) * 1.6) * Math.min(1, k * 6);
    const pts = []; for (let j = 0; j <= 24; j++) { const a = (-38 + 76 * j / 24) * Math.PI / 180; pts.push([60 + Math.cos(a) * r, 500 + Math.sin(a) * r]); }
    p.stroke(pts, 22, INK); p.stroke(pts, 12, col); p.stroke(pts, 4, "#ffffff"); g.restore(); }
};
/** a travelling wave line across the card */
export const fxBeam = (p, t, col = "#ffd86a", amp = 70) => {
  const pts = []; for (let x = 10; x <= 590; x += 8) pts.push([x, 500 + amp * Math.sin(x / 600 * Math.PI * 4 - t * Math.PI * 2)]);
  p.stroke(pts, 26, INK); p.stroke(pts, 15, col); p.stroke(pts, 5, "#ffffff");
};
export const fxGlow = (p, k = 1, col = "255,170,110") => {
  const g = p.g, gr = g.createRadialGradient(300, 500, 0, 300, 500, 280);
  gr.addColorStop(0, `rgba(${col},${0.85 * k})`); gr.addColorStop(0.5, `rgba(${col},${0.35 * k})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(0, 200, 600, 600);
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
/** popcorn bursting out of the centre, falling under gravity (t 0..1) */
export const fxPopburst = (p, t, seed = 1) => {
  const r = mwRng(seed * 7 + 1);
  for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 2.6, v = 260 + r() * 260, x = 300 + Math.cos(a) * v * t, y = 520 + Math.sin(a) * v * t + 520 * t * t;
    popPiece(p, x, y, 22 + r() * 12, i + seed); }
};
export const fxPopPiece = (p, rot = 0) => popPiece(p, 300, 500, 120, rot);
/** the egg going off: white star burst, yolk core, flying droplets (t 0..1) */
export const fxSplat = (p, t) => {
  const g = p.g, k = Math.min(1, t * 3.2), a = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1, r = mwRng(13);
  g.save(); g.globalAlpha = a;
  const pts = []; for (let i = 0; i < 28; i++) { const ang = i / 28 * Math.PI * 2, rr = (i % 2 ? 120 : 200 + r() * 90) * k; pts.push([300 + Math.cos(ang) * rr, 500 + Math.sin(ang) * rr]); }
  p.poly(pts, "#fffaf0", 10); p.ell(300, 500, 92 * k, 84 * k, "#ffcc2a", 9);
  for (let i = 0; i < 12; i++) { const ang = r() * Math.PI * 2, d = (140 + r() * 260) * Math.min(1, t * 1.6), y = 500 + Math.sin(ang) * d + 220 * t * t; p.ell(300 + Math.cos(ang) * d, y, 14 + r() * 12, 14 + r() * 12, i % 3 ? "#fffaf0" : "#ffcc2a", 6); }
  g.restore();
};
export const fxSparks = (p, t) => { const r = mwRng(Math.floor(t * 40) + 3);
  for (let i = 0; i < 9; i++) { const a = r() * Math.PI * 2, l = 60 + r() * 160; p.stroke([[300, 500], [300 + Math.cos(a) * l, 500 + Math.sin(a) * l]], 10, i % 2 ? "#fff6c8" : "#ffc84a"); }
  p.ell(300, 500, 34, 34, "#ffffff", 0); };
export const fxChocDrip = (p, t, col = CHOC) => { const y = 300 + t * t * 560; p.poly([[300, y - 70], [330, y], [300, y + 34], [270, y]], col, 8); p.ell(300, y + 4, 32, 32, col, 8); };
export const fxSweat = (p, t) => { for (let i = 0; i < 3; i++) { const k = (t + i / 3) % 1, s = i % 2 ? 1 : -1, x = 300 + s * (40 + k * 200), y = 420 - k * 120 + k * k * 260;
  p.g.save(); p.g.globalAlpha = 1 - k * 0.6; p.poly([[x, y - 46], [x + 24, y], [x, y + 18], [x - 24, y]], "#bfe6ff", 7); p.g.restore(); } };
/** thermometer, level 0..1 */
export const fxThermo = (p, level) => {
  p.poly(rrect(250, 120, 350, 800, 50), "#ffffff", 11);
  const top = 770 - level * 620; p.poly(rrect(282, top, 318, 800, 18), level > 0.6 ? "#e8322a" : "#e85a3a", 0);
  for (let i = 0; i < 8; i++) p.stroke([[330, 200 + i * 75], [350, 200 + i * 75]], 7);
  p.ell(300, 830, 78, 78, level > 0.6 ? "#e8322a" : "#e85a3a", 11); p.ell(276, 806, 16, 22, "#ffffff99", 0);
};
/** floor crack under a heavy landing */
export const fxCrack = (p, k) => { const r = mwRng(31); for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI, l = (120 + r() * 160) * k, m = 0.5 + r() * 0.2;
  p.stroke([[300, 500], [300 + Math.cos(a) * l * m + (r() - 0.5) * 30, 500 + Math.sin(a) * l * m * 0.35], [300 + Math.cos(a) * l, 500 + Math.sin(a) * l * 0.35]], 9); } };
