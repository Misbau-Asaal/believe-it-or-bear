// ================= 03 The Emu War: cast and fx (appended to the toon library) =================
// People reuse romanFront (all its arm poses and faces) and add 1930s Australian hats.
const KHAKI = "#8a7d52";
export const EW = {
  gunner: { tunic: KHAKI, skin: "#f5c9a0", hatKind: "slouch", belts: true },
  gunner2: { tunic: KHAKI, skin: "#ecd0b6", hatKind: "slouch", belts: true, moustache: "#4a3426" },
  gunner3: { tunic: KHAKI, skin: "#c99067", hatKind: "slouch", belts: true },
  major: { tunic: "#7d7048", skin: "#ffe2c2", moustache: "#6b4a2a", stout: true, hatKind: "peaked", sam: true },
  farmer: { tunic: "#5f86b5", skin: "#f5c9a0", hatKind: "slouch", medals: true, apron: null },
  farmer2: { tunic: "#a6533c", skin: "#ecd0b6", hatKind: "slouch", medals: true, moustache: "#8a6a4a", stout: true },
  farmer3: { tunic: "#6f7f4a", skin: "#ffe2c2", hatKind: "slouch", medals: true },
  reporter: { tunic: "#5a5e6a", skin: "#f3d6bb", hatKind: "fedora", tie: true },
};

/** head geometry exactly as romanFront computes it */
const ewHead = (O, opts) => {
  const { seed = 3, facing = 0, bob = 0, tilt = 0, headTilt = 0 } = opts;
  const H = headBlob(seed, 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.stout ? 1.12 : 1.08, legsL = 1.38, sole = 975, cx = 300;
  const torsoBot = sole - legsL * HH - bob * HH, chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  return { H, W, HH, u, cx, hc, chin, torsoBot, rot: tilt + headTilt ? [rad(tilt + headTilt), cx, chin, cpx - cx, cpy - chin] : null, bodyRot: tilt ? [rad(tilt), cx, hipY] : null };
};

/** a person from EW (or any outfit object) with a 1930s hat. opts as romanFront */
export const ewPerson = (p, key, opts = {}) => {
  const O0 = typeof key === "string" ? EW[key] : key;
  const O = { ...O0 }; delete O.cap; delete O.hair;
  const R = opts.R ?? "hang", L = opts.L ?? "hang";
  romanFront(p, O, { ...opts, L, R });
  const G = ewHead(O, opts), { H, HH, u, cx, hc } = G, light = opts.light ?? rad(-120), ow = 5 * u;
  const Ta = (0.4 * G.W) / 1.06 * (O.stout ? 1.12 : 1), tcx = cx + 3 * u * (opts.facing || 0), front = ["belly", "cross", "shield"];
  const clear = !front.includes(L) && !front.includes(R);
  p.rot = G.bodyRot;
  if (O.belts && clear) p.band([[tcx - 0.62 * Ta, G.chin + 0.12 * HH], [tcx + 0.62 * Ta, G.torsoBot - 0.28 * HH]], "#6a5a3a", 0.07 * HH, 1.4 * u);
  if ((O.belts || O.sam) && clear) p.band([[tcx - 0.95 * Ta, G.torsoBot - 0.22 * HH], [tcx + 0.95 * Ta, G.torsoBot - 0.22 * HH]], "#6a4a2a", 0.08 * HH, 1.4 * u);
  if (O.sam && clear) p.band([[tcx + 0.6 * Ta, G.chin + 0.1 * HH], [tcx - 0.55 * Ta, G.torsoBot - 0.24 * HH]], "#7a5030", 0.06 * HH, 1.4 * u);
  if (O.tie && clear) p.poly([[tcx - 6 * u, G.chin + 0.02 * HH], [tcx + 6 * u, G.chin + 0.02 * HH], [tcx + 8 * u, G.chin + 0.42 * HH], [tcx, G.chin + 0.5 * HH], [tcx - 8 * u, G.chin + 0.42 * HH]], "#b8323a", 1.6 * u);
  if (O.medals && clear) for (let i = 0; i < 3; i++) { const x = tcx - 0.42 * Ta + i * 10 * u, y = G.chin + 0.2 * HH;
    p.poly([[x - 4 * u, y - 6 * u], [x + 4 * u, y - 6 * u], [x + 4 * u, y + 4 * u], [x - 4 * u, y + 4 * u]], ["#c8202e", "#2b5aa8", "#6a2b8a"][i], 1.2 * u); p.ell(x, y + 10 * u, 4.6 * u, 4.6 * u, "#e0b24a", 1.4 * u); }
  // hat
  p.rot = G.rot;
  const crown = hc - H.b, k = O0.hatKind;
  if (k === "slouch") { // wide felt brim, left side pinned up with the rising-sun badge
    const by = crown + 0.24 * HH, col = "#8a6e44", dark = "#6a5232";
    const brim = [...ellPts(cx + 0.06 * G.W, by, 0.9 * G.W, 0.12 * HH, 0, 180, 0, 18), [cx - 0.42 * G.W, by + 0.02 * HH], [cx - 0.5 * G.W, by - 0.42 * HH], [cx - 0.58 * G.W, by - 0.06 * HH]];
    const br = [...ellPts(cx + 0.06 * G.W, by, 0.9 * G.W, 0.12 * HH, 180, 360, 0, 18)];
    p.poly([...br, ...ellPts(cx + 0.06 * G.W, by, 0.9 * G.W, 0.12 * HH, 0, 180, 0, 18)], col, ow);
    const cr = [[cx - 0.4 * G.W, by], [cx - 0.36 * G.W, by - 0.36 * HH], [cx - 0.08 * G.W, by - 0.42 * HH], [cx, by - 0.34 * HH], [cx + 0.08 * G.W, by - 0.42 * HH], [cx + 0.36 * G.W, by - 0.36 * HH], [cx + 0.4 * G.W, by]];
    p.shadedFill(cr, col, dark, light, 0.4 * G.W, 0.4); p.poly(cr, null, ow);
    p.band([[cx - 0.4 * G.W, by - 0.07 * HH], [cx + 0.4 * G.W, by - 0.07 * HH]], "#3e3226", 0.07 * HH, 1.2 * u);
    const up = [[cx - 0.4 * G.W, by + 0.04 * HH], [cx - 0.46 * G.W, by - 0.4 * HH], [cx - 0.62 * G.W, by - 0.34 * HH], [cx - 0.84 * G.W, by + 0.02 * HH]];
    p.shadedFill(up, "#9a7c50", dark, light, 0.3 * G.W, 0.4); p.poly(up, null, ow);
    p.ell(cx - 0.56 * G.W, by - 0.18 * HH, 6 * u, 6 * u, "#e0b24a", 1.4 * u);
  } else if (k === "peaked") {
    const by = crown + 0.27 * HH;
    const top = ellPts(cx, by - 0.2 * HH, 0.56 * G.W, 0.14 * HH, 0, 360, 0, 32); p.shadedFill(top, "#7d7048", "#5a5034", light, 0.56 * G.W, 0.4); p.poly(top, null, ow);
    const band = [[cx - 0.46 * G.W, by - 0.2 * HH], [cx + 0.46 * G.W, by - 0.2 * HH], [cx + 0.44 * G.W, by + 0.02 * HH], [cx - 0.44 * G.W, by + 0.02 * HH]];
    p.poly(band, "#b8323a", ow); p.ell(cx, by - 0.1 * HH, 7 * u, 7 * u, "#e0b24a", 1.6 * u);
    p.poly([...ellPts(cx + 0.06 * G.W, by + 0.01 * HH, 0.46 * G.W, 0.09 * HH, 0, 180, 0, 16)], "#2a2420", ow);
  } else if (k === "fedora") {
    const by = crown + 0.24 * HH;
    p.poly(ellPts(cx, by, 0.78 * G.W, 0.1 * HH, 0, 360, 0, 32), "#4a4a52", ow);
    const cr = [[cx - 0.38 * G.W, by], [cx - 0.34 * G.W, by - 0.4 * HH], [cx, by - 0.3 * HH], [cx + 0.34 * G.W, by - 0.4 * HH], [cx + 0.38 * G.W, by]];
    p.shadedFill(cr, "#55555e", "#3a3a42", light, 0.4 * G.W, 0.4); p.poly(cr, null, ow);
    p.band([[cx - 0.38 * G.W, by - 0.08 * HH], [cx + 0.38 * G.W, by - 0.08 * HH]], "#1f1f24", 0.08 * HH, 1.2 * u);
    p.poly([[cx + 0.2 * G.W, by - 0.12 * HH], [cx + 0.3 * G.W, by - 0.26 * HH], [cx + 0.34 * G.W, by - 0.1 * HH]], "#f2ecd8", 1.2 * u); // PRESS card
  }
  p.rot = null;
  if (opts.notepad) { const x = tcx + Ta * 1.05, y = G.chin + 0.28 * HH; p.poly(rrect(x - 16 * u, y - 22 * u, x + 16 * u, y + 22 * u, 2 * u), "#f2ecd8", 1.6 * u); for (let i = 0; i < 4; i++) p.stroke([[x - 10 * u, y - 12 * u + i * 8 * u], [x + 10 * u, y - 12 * u + i * 8 * u]], 1.4 * u, "#7a8aa8"); }
};

// ---------------- the emu ----------------
const EMU = "#6b5848", EMU_D = "#4a3c32", EMU_L = "#8c7864", EMU_SKIN = "#7f9bc4", LEG = "#8e9096", LEG_D = "#6a6c72", BEAK = "#3a3230";
/** emu facing right (flip the card for left). opts:
 *  mode 'stand' | 'run' | 'peck' ; phase 0..1 (run) ; neck 0..1+ extra stretch ; headTurn: 'side' | 'front'
 *  expr 'neutral' | 'squint' | 'shock' | 'smug' | 'happy' | 'determined' | 'wink' ; blink ; look (-1..1)
 *  wheat (stalk in beak), stick (pointer in beak), helmet, slouch, binoc */
export const emuCard = (p, opts = {}) => {
  const { mode = "stand", phase = 0, expr = "neutral", blink = 0, look = 0, neck = 0, front = false } = opts;
  const ow = 9, light = rad(-120), th = thickAngle(light), two = Math.PI * 2;
  const run = mode === "run", peck = mode === "peck";
  const bob = run ? Math.abs(Math.sin(two * phase)) * -26 : 0;
  const bx = 262, by = (run ? 560 : 600) + bob;
  // legs: thigh hidden in feathers; shin + backward ankle + foot with three toes
  const leg = (x0, ang, far) => {
    const hip = [x0, by + 80], len1 = 170, len2 = 150;
    const kneeA = ang + 0.25, k = [hip[0] + Math.sin(kneeA) * len1 * 0.2, hip[1] + len1];
    const foot = run ? [hip[0] + Math.sin(ang) * 230, Math.min(972, hip[1] + Math.cos(ang) * 300)] : [hip[0] - 6, 966];
    const kn = run ? [(hip[0] + foot[0]) / 2 - 34, (hip[1] + foot[1]) / 2 + 10] : [hip[0] - 16, hip[1] + 150];
    const col = far ? LEG_D : LEG;
    p.stroke([hip, kn, foot], 34, INK); p.stroke([hip, kn, foot], 22, col);
    const lift = foot[1] < 960;
    for (const [dx, dy] of [[46, lift ? 10 : 4], [34, lift ? 22 : 8], [-18, lift ? 14 : 2]]) { p.stroke([foot, [foot[0] + dx, foot[1] + dy]], 16, INK); p.stroke([foot, [foot[0] + dx, foot[1] + dy]], 8, col); }
  };
  if (run) { const a = Math.sin(two * phase) * 0.75; leg(250, -a, true); leg(280, a, false); }
  else { leg(238, 0, true); leg(292, 0, false); }
  // neck path: base at the body front, head position by mode
  const base = [bx + 120, by - 60];
  let hx, hy;
  if (peck) { hx = bx + 250; hy = 890; } else if (run) { hx = bx + 250; hy = by - 250 - neck * 120; } else { hx = bx + 180 + neck * 20; hy = by - 330 - neck * 240; }
  const mid = peck ? [bx + 230, by - 40] : [base[0] + (hx - base[0]) * 0.2 + 30, base[1] + (hy - base[1]) * 0.55];
  const neckPts = []; for (let i = 0; i <= 16; i++) { const t = i / 16, s = 1 - t; neckPts.push([s * s * base[0] + 2 * s * t * mid[0] + t * t * hx, s * s * base[1] + 2 * s * t * mid[1] + t * t * (hy + 20)]); }
  p.stroke(neckPts, 62, INK); p.stroke(neckPts.slice(0, 8), 46, EMU); p.stroke(neckPts.slice(6), 40, EMU_SKIN);
  // fuzzy feather ring where the blue skin starts
  for (let i = 0; i < 6; i++) { const [x, y] = neckPts[7]; p.stroke([[x - 22 + i * 9, y - 4], [x - 26 + i * 9, y + 18]], 6, EMU_D); }
  // body: shaggy egg with a drooping tail, feather strokes, ragged bottom fringe
  const bp = blobPts(bx, by, { a: 185, b: 128, nTop: 2.2, nBot: 2.0, egg: -0.08, asym: 0.08, rot: run ? 0.12 : 0.04, noise: 0.03, seed: 11 });
  p.shadedFill(bp, EMU_L, EMU_D, light, 185, 0.5);
  p.clip(bp, () => { const r = P_rng(7); for (let i = 0; i < 70; i++) { const x = bx - 170 + r() * 340, y = by - 110 + r() * 220; p.stroke([[x, y], [x - 14 - r() * 10, y + 22 + r() * 14]], 5, r() < 0.5 ? EMU_D : EMU); } });
  p.inkRing(bp, ow, th);
  for (let i = 0; i < 12; i++) { const x = bx - 150 + i * 26, y = by + 100 + Math.sin(i * 1.7) * 8; p.poly([[x - 14, y - 10], [x, y + 26 + (i % 3) * 8], [x + 14, y - 10]], i % 2 ? EMU : EMU_D, 6); }
  // head
  const hd = { a: front ? 54 : 50, b: front ? 50 : 42, nTop: 2.2, nBot: 2.0, egg: 0, asym: 0, rot: 0, noise: 0.02, seed: 5 };
  const hp = blobPts(hx, hy, hd);
  p.shadedFill(hp, EMU_SKIN, "#5e7aa4", light, hd.a, 0.4);
  p.clip(hp, () => { p.ell(hx - 6, hy - 34, 58, 30, EMU_D, 0); });
  p.inkRing(hp, ow, th);
  for (let i = 0; i < 5; i++) p.stroke([[hx - 24 + i * 11, hy - 38], [hx - 30 + i * 13, hy - 64 - (i % 2) * 14]], 7, EMU_D); // shaggy tuft
  const lid = lidOf(blink);
  const eye = (ex, ey, r, wink = false) => {
    if (expr === "happy" || wink) { p.stroke(ellPts(ex, ey + 4, r * 0.8, r * 0.6, 200, 340, 0, 10), 7); return; }
    if (lid >= 1) { p.stroke([[ex - r, ey], [ex + r, ey]], 7); return; }
    const big = expr === "shock" ? 1.25 : 1;
    p.ell(ex, ey, r * big, r * 1.1 * big, "#ffffff", 6);
    p.ell(ex + look * 4 + 2, ey + 2, r * 0.62, r * 0.62, "#c8742a", 0); p.dot(ex + look * 5 + 3, ey + 2, expr === "shock" ? 5 : 8); p.dot(ex + look * 5 + 6, ey - 3, 3, "#ffffff");
    const lidY = expr === "squint" || expr === "smug" ? 0.35 : lid > 0 ? lid * 1.1 - 0.4 : -2;
    if (lidY > -1) { const top = ey - r * 1.1 * big, cut = top + (lidY + 0.4) * r * 1.1; p.poly([[ex - r - 2, top - 4], [ex + r + 2, top - 4], [ex + r + 2, cut], [ex - r - 2, cut]], EMU_SKIN, 0); p.stroke([[ex - r - 2, cut], [ex + r + 2, cut]], 6); }
    if (expr === "determined") p.stroke([[ex - r - 4, ey - r - 10], [ex + r + 6, ey - r + 2]], 8);
    if (expr === "shock") p.stroke([[ex - r, ey - r * 1.5], [ex + r, ey - r * 1.7]], 6);
  };
  if (front) {
    eye(hx - 24, hy - 6, 17, false); eye(hx + 24, hy - 6, 17, expr === "wink");
    const open = expr === "shock" ? 16 : 0;
    p.ell(hx, hy + 26, 30, 13 + open, BEAK, 6); p.stroke([[hx - 26, hy + 26], [hx + 26, hy + 26]], 3, "#6a605a");
    for (const s of [-1, 1]) p.dot(hx + s * 9, hy + 20, 3, "#8a807a");
    if (expr === "smug" || expr === "happy" || expr === "wink") p.stroke(ellPts(hx, hy + 30, 24, 12, 20, 160, 0, 10), 5, "#1a1414");
  } else {
    // beak (opens on shock) and eye
    const open = expr === "shock" ? 16 : 0;
    p.poly([[hx + 24, hy - 2], [hx + 86, hy + 10], [hx + 26, hy + 18]], BEAK, 6);
    p.poly([[hx + 24, hy + 18 + open * 0.2], [hx + 78, hy + 16 + open], [hx + 24, hy + 30 + open]], BEAK, 6);
    if (expr === "smug" || expr === "happy") p.stroke([[hx + 22, hy + 22], [hx + 10, hy + 14]], 5);
    eye(hx + 4, hy - 8, 18);
    if (opts.wheat) { p.stroke([[hx + 60, hy + 16], [hx + 140, hy + 70]], 7, "#b8913e"); for (let i = 0; i < 5; i++) p.ell(hx + 100 + i * 9, hy + 40 + i * 7, 6, 11, "#e2b84e", 3); }
    if (opts.stick) { p.stroke([[hx + 50, hy + 14], [hx + 220, hy + 120]], 16, INK); p.stroke([[hx + 50, hy + 14], [hx + 220, hy + 120]], 8, "#8a5a30"); }
    if (opts.binoc) { for (const dy of [-16, 10]) { p.poly(rrect(hx - 4, hy - 8 + dy - 11, hx + 70, hy - 8 + dy + 11, 6), "#2a2a30", 5); p.ell(hx + 70, hy - 8 + dy, 6, 11, "#9fc3e8", 3); } p.stroke([[hx + 10, hy - 30], [hx - 30, hy + 40]], 4, "#6a4a2a"); }
  }
  if (opts.helmet) { // Brodie helmet
    const hy0 = hy - hd.b * 0.55; p.poly(ellPts(hx, hy0 + 6, 84, 16, 0, 360, 0, 28), "#6f6a48", 6);
    const dome = ellPts(hx, hy0, 52, 42, 180, 360, 0, 24); p.shadedFill(dome, "#7f7a54", "#5a5638", light, 52, 0.4); p.poly(dome, null, 6);
  }
  if (opts.slouch) { // the soldier's hat, left behind
    const hy0 = hy - hd.b * 0.6;
    p.poly([...ellPts(hx, hy0 + 4, 92, 18, 0, 360, 0, 28)], "#8a6e44", 6);
    const cr = [[hx - 40, hy0 + 4], [hx - 36, hy0 - 44], [hx, hy0 - 38], [hx + 36, hy0 - 44], [hx + 40, hy0 + 4]]; p.shadedFill(cr, "#8a6e44", "#6a5232", light, 40, 0.4); p.poly(cr, null, 6);
    p.band([[hx - 40, hy0 - 6], [hx + 40, hy0 - 6]], "#3e3226", 10, 2);
    p.poly([[hx - 40, hy0 + 6], [hx - 50, hy0 - 46], [hx - 70, hy0 - 40], [hx - 90, hy0 + 2]], "#9a7c50", 6); p.ell(hx - 64, hy0 - 18, 7, 7, "#e0b24a", 2);
  }
};
const P_rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

// ---------------- fx ----------------
export const fxWord = (p, word, t = 1, col = "#ffd84a", size = 150, rot = -0.12) => {
  const g = p.g, k = Math.min(1, t * 4), s = 0.6 + 0.5 * k - 0.1 * Math.max(0, t - 0.5);
  g.save(); g.translate(300, 500); g.rotate(rot); g.scale(s, s); g.font = `bold ${size}px "DejaVu Sans", Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.globalAlpha = Math.min(1, (1 - t) * 4); g.lineJoin = "round"; g.lineWidth = 26; g.strokeStyle = INK; g.strokeText(word, 0, 0); g.fillStyle = col; g.fillText(word, 0, 0); g.restore();
};
/** bold caption that stays (no fade): used for quotes */
export const fxCaption = (p, lines, col = "#ffffff", size = 70) => {
  const g = p.g; g.save(); g.font = `bold ${size}px "DejaVu Sans", Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  lines.forEach((t, i) => { const y = 500 + (i - (lines.length - 1) / 2) * size * 1.15; g.lineWidth = size * 0.28; g.strokeStyle = INK; g.strokeText(t, 300, y); g.fillStyle = Array.isArray(col) ? col[i] : col; g.fillText(t, 300, y); });
  g.restore();
};
export const fxMuzzle = (p, t) => { const r = 60 + 80 * (1 - t); const pts = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = i % 2 ? r * 0.45 : r * (0.8 + 0.4 * ((i * 7) % 3) / 2); pts.push([300 + Math.cos(a) * rr, 500 + Math.sin(a) * rr]); } p.poly(pts, "#ffd84a", 8); p.ell(300, 500, r * 0.3, r * 0.3, "#fff6c8", 0); };
export const fxTracer = (p, t) => { const x = 40 + t * 520; p.stroke([[x - 90, 500], [x, 500]], 14, "#ffe9a0"); p.stroke([[x - 50, 500], [x, 500]], 6, "#ffffff"); };
export const fxPing = (p, t) => { for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3, r0 = 30 + t * 60, r1 = r0 + 50; p.stroke([[300 + Math.cos(a) * r0, 500 + Math.sin(a) * r0], [300 + Math.cos(a) * r1, 500 + Math.sin(a) * r1]], 10, "#ffe27a"); } };
export const fxLetter = (p, t) => { const g = p.g; g.save(); g.translate(300, 500); g.rotate(-0.25 + Math.sin(t * 9) * 0.15);
  p.poly([[-150, -95], [150, -95], [150, 95], [-150, 95]].map(([x, y]) => [x + 300, y + 500]).map(([x, y]) => [x - 300, y - 500]), "#f2ecd8", 9);
  p.stroke([[-150, -95], [0, 10], [150, -95]], 7); g.font = 'bold 54px "DejaVu Sans", Arial, sans-serif'; g.textAlign = "center"; g.fillStyle = "#b8323a"; g.fillText("HELP!", 0, 70);
  for (let i = 0; i < 2; i++) { g.lineWidth = 8; g.strokeStyle = INK; g.beginPath(); g.moveTo(-160 - i * 40, -40 + i * 30); g.lineTo(-210 - i * 40, -40 + i * 30); g.stroke(); }
  g.restore(); };
export const fxFeather = (p, t, seed = 1) => { for (let i = 0; i < 5; i++) { const r = Math.abs(Math.sin(i * 7.7 + seed)), x = 150 + r * 300 + Math.sin(t * 7 + i) * 50, y = 300 + ((r * 5.3) % 1) * 300 + t * 400; p.g.save(); p.g.translate(x, y); p.g.rotate(t * 5 + i); p.poly([[0, -40], [12, 0], [0, 40], [-12, 0]], "#6b5848", 4); p.stroke([[0, -40], [0, 40]], 3, "#3a3028"); p.g.restore(); } };
export const fxThought = (p) => { p.ell(300, 470, 270, 220, "#ffffff", 10); for (const [x, y, r] of [[120, 760, 40], [80, 860, 24], [60, 930, 14]]) p.ell(x, y, r, r, "#ffffff", 8); };
export const fxSteam = (p, t) => { for (let i = 0; i < 3; i++) { const k = (t + i / 3) % 1, x = 230 + i * 70 + Math.sin(k * 6 + i) * 20, y = 640 - k * 380, r = 30 + k * 40; p.g.save(); p.g.globalAlpha = 1 - k; p.ell(x, y, r, r * 0.8, "#ffffff", 7); p.g.restore(); } };
export const fxCal = (p, page) => { p.poly(rrect(120, 260, 480, 760, 20), "#ffffff", 10); p.poly(rrect(120, 260, 480, 380, 20), "#c8323a", 10);
  const g = p.g; g.save(); g.textAlign = "center"; g.textBaseline = "middle"; g.font = 'bold 60px "DejaVu Sans", Arial, sans-serif'; g.fillStyle = "#ffffff"; g.fillText(page < 4 ? "NOV" : "DEC", 300, 322);
  g.font = 'bold 200px "DejaVu Sans", Arial, sans-serif'; g.fillStyle = INK; g.fillText(["2", "9", "16", "23", "1", "8"][page % 6], 300, 580); g.restore(); };
