
// ================= 02 The Pig War: cast and fx (appended to the toon library) =================
// People reuse romanFront (all its arm poses) and add the hats this story needs.
export const PW = {
  farmer: { tunic: "#5f86b5", skin: "#f5c9a0", apron: "#7a5a3a", hatKind: "straw" },
  hbc: { tunic: "#2f5b4a", skin: "#ecd0b6", moustache: "#5a3b2a", stout: true, hatKind: "tophat" },
  usSol: { tunic: "#2f4f8f", skin: "#f5c9a0", spear: true, hatKind: "shako", belts: true },
  usSol2: { tunic: "#2f4f8f", skin: "#c99067", spear: true, hatKind: "shako", belts: true, moustache: "#2a201a" },
  usOff: { tunic: "#24407a", skin: "#ffe2c2", moustache: "#6b4a2a", stout: true, hatKind: "shako_tall", sash: "#d8b04a" },
  ukSol: { tunic: "#c0352f", skin: "#ffe2c2", spear: true, hatKind: "shako", belts: true },
  ukSol2: { tunic: "#c0352f", skin: "#ecd0b6", spear: true, hatKind: "shako", belts: true, moustache: "#4a3426" },
  ukOff: { tunic: "#b02a2a", skin: "#f5c9a0", moustache: "#b88a5a", stout: true, hatKind: "shako_tall", sash: "#e8c45a" },
  kaiser: { tunic: "#2f3a5a", skin: "#f3d6bb", moustache: "#6b5a48", stout: true, hatKind: "pickel", sash: "#e8c45a" },
  judge: { tunic: "#1f1c24", skin: "#f5c9a0", hatKind: "wig" },
  judge2: { tunic: "#1f1c24", skin: "#ecd0b6", hatKind: "wig", moustache: "#cfcac0" },
};

/** head geometry exactly as romanFront computes it */
const pwHead = (O, opts) => {
  const { seed = 3, facing = 0, bob = 0, tilt = 0, headTilt = 0 } = opts;
  const H = headBlob(seed, 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.stout ? 1.12 : 1.08, legsL = 1.38, sole = 975, cx = 300;
  const torsoBot = sole - legsL * HH - bob * HH, chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  return { H, W, HH, u, cx, hc, chin, torsoBot, rot: tilt + headTilt ? [rad(tilt + headTilt), cx, chin, cpx - cx, cpy - chin] : null, bodyRot: tilt ? [rad(tilt), cx, hipY] : null };
};

/** a person from PW (or any outfit object) with a story hat. opts as romanFront, plus aim (rifle levelled) */
export const pwPerson = (p, key, opts = {}) => {
  const O0 = typeof key === "string" ? PW[key] : key;
  const O = { ...O0 }; delete O.cap; delete O.hair;
  const R = opts.aim ? "point" : (opts.R ?? (O.spear ? "spear" : "hang"));
  const L = opts.aim ? "hang" : (opts.L ?? "hang");
  romanFront(p, O, { ...opts, L, R });
  const G = pwHead(O, opts), { H, HH, u, cx, hc } = G, light = opts.light ?? rad(-120), ow = 5 * u, thick = thickAngle(light);
  // cross belts + sash on the torso (only when no arm crosses the body)
  const Ta = (0.4 * G.W) / 1.06 * (O.stout ? 1.12 : 1), tcx = cx + 3 * u * (opts.facing || 0), front = ["belly", "cross", "shield"];
  p.rot = G.bodyRot;
  if (O.belts && !front.includes(L) && !front.includes(R)) for (const s of [-1, 1])
    p.band([[tcx - s * 0.62 * Ta, G.chin + 0.12 * HH], [tcx + s * 0.62 * Ta, G.torsoBot - 0.28 * HH]], "#f1efe6", 0.075 * HH, 1.4 * u);
  if (O.belts && !front.includes(L) && !front.includes(R)) p.ell(tcx, (G.chin + G.torsoBot) / 2 - 0.04 * HH, 5 * u, 5 * u, "#d9dde0", 1.4 * u);
  if (O.sash && !front.includes(L) && !front.includes(R)) p.band([[tcx - 0.95 * Ta, G.torsoBot - 0.26 * HH], [tcx + 0.95 * Ta, G.torsoBot - 0.26 * HH]], O.sash, 0.1 * HH, 1.4 * u);
  if (opts.aim) { // levelled rifle from the shoulder past the right hand
    const y = G.chin + 0.02 * HH, x0 = tcx - 0.2 * Ta, x1 = tcx + Ta * 1.1 + 92 * u;
    p.band([[x0, y + 6 * u], [x1, y]], "#6d4a2a", 5 * u, 1.4 * u, "round");
    p.band([[x1 - 40 * u, y], [x1 + 6 * u, y - 1 * u]], "#8d949c", 3 * u, 1.2 * u, "round");
  }
  // hat
  p.rot = G.rot;
  const hp = blobPts(cx, hc, H), crown = hc - H.b;
  const k = O0.hatKind;
  if (k === "straw") {
    const by = crown + 0.22 * HH;
    p.ell(cx, by, 0.98 * G.W, 0.11 * HH, "#e2c06a", ow);
    const cr = [[cx - 0.36 * G.W, by], [cx - 0.33 * G.W, by - 0.34 * HH], [cx + 0.33 * G.W, by - 0.34 * HH], [cx + 0.36 * G.W, by]];
    p.shadedFill(cr, "#e8c873", "#b8913e", light, 0.35 * G.W, 0.4); p.poly(cr, null, ow);
    p.band([[cx - 0.35 * G.W, by - 0.07 * HH], [cx + 0.35 * G.W, by - 0.07 * HH]], "#9b3a2a", 0.06 * HH, 1.2 * u);
    for (let i = -4; i <= 4; i++) p.stroke([[cx + i * 0.2 * G.W, by - 0.02 * HH], [cx + i * 0.24 * G.W, by + 0.05 * HH]], 1.2 * u, "#b8913e");
  } else if (k === "pickel") {
    const by = crown + 0.26 * HH, dome = [...ellPts(cx, by, 0.5 * G.W, 0.42 * HH, 180, 360, 0, 32)];
    p.shadedFill(dome, "#24212a", "#0f0d12", light, 0.5 * G.W, 0.5); p.poly(dome, null, ow);
    p.stroke(ellPts(cx - 0.18 * G.W, by - 0.25 * HH, 0.12 * G.W, 0.08 * HH, 200, 300, 0, 10), 3 * u, "#ffffff55");
    p.poly([[cx - 0.07 * G.W, by - 0.4 * HH], [cx, by - 0.78 * HH], [cx + 0.07 * G.W, by - 0.4 * HH]], "#e0b24a", 2.2 * u);
    p.ell(cx, by - 0.4 * HH, 0.09 * G.W, 0.035 * HH, "#e0b24a", 2.2 * u);
    p.poly([[cx - 0.13 * G.W, by - 0.04 * HH], [cx, by - 0.26 * HH], [cx + 0.13 * G.W, by - 0.04 * HH], [cx, by + 0.02 * HH]], "#e0b24a", 2.2 * u);
    p.band([[cx - 0.5 * G.W, by], [cx + 0.5 * G.W, by]], "#3a3540", 0.06 * HH, 1.6 * u, "round");
  } else if (k === "wig") {
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) p.ell(cx + s * 0.98 * H.a, hc - 0.32 * H.b + i * 0.36 * H.b, 0.2 * H.a, 0.2 * H.b, "#ecebe6", 2.6 * u);
    const top = ellPts(cx, hc - 0.48 * H.b, H.a * 1.02, H.b * 0.62, 180, 360, 0, 32); p.shadedFill(top, "#f2f1ec", "#c9c6bd", light, H.a, 0.4); p.poly(top, null, 3 * u);
  } else if (k) hatOn(p, { hat: k, cap: "#888", hair: "#555", jacket: O.tunic }, hp, H, cx, hc, light, opts.seed ?? 3, opts.facing ?? 0, false);
  p.rot = null;
};

// ---------------- the pig ----------------
const PIG = "#f4a9ba", PIG_D = "#d97f98", SNOUT = "#ea8ea6", HOOF = "#4a3034";
/** pig standing, facing right (flip the card to face left). opts: expr ('happy'|'shock'|'chew'|'neutral'|'wink'), chew 0..1, blink, dig (dirt on snout), ghost, halo, step */
export const pigCard = (p, opts = {}) => {
  const { expr = "neutral", chew = 0, blink = 0, dig = false, ghost = false, step = 0, look = 0 } = opts;
  const g = p.g; g.save(); if (ghost) g.globalAlpha = 0.82;
  const body = ghost ? "#f4f4ff" : PIG, dark = ghost ? "#c8cbe8" : PIG_D, snout = ghost ? "#e6e7fb" : SNOUT, ow = 9, light = rad(-120), th = thickAngle(light);
  const by = 838;
  if (ghost) { // little wings
    for (const s of [0, 1]) { const wx = 250 + s * 40, wy = 760 - s * 6, w = [[wx, wy], [wx - 90, wy - 70 + s * 10], [wx - 120, wy - 10], [wx - 70, wy + 20]]; p.poly(w, "#ffffff", 7); for (let i = 0; i < 3; i++) p.stroke([[wx - 30 - i * 25, wy + 6], [wx - 50 - i * 25, wy - 40 + i * 10]], 3, "#c8cbe8"); }
  }
  // tail
  const tp = []; for (let i = 0; i <= 30; i++) { const t = i / 30, a = t * Math.PI * 3.2; tp.push([150 - t * 20 + Math.cos(a) * 14 * (1 - t * 0.5), by - 40 - t * 26 + Math.sin(a) * 14 * (1 - t * 0.5)]); }
  p.stroke(tp, 12, INK); p.stroke(tp, 6, dark);
  // legs (back pair darker, behind)
  const legs = [[205, 0.5], [255, 0], [345, 0.5], [395, 0]];
  legs.forEach(([x, ph], i) => {
    const up = step ? Math.max(0, Math.sin(Math.PI * 2 * (step + ph))) * 16 : 0, back = i % 2 === 0;
    const pts = rrect(x - 21, by + 40 - up, x + 21, 962 - up, 12);
    p.poly(pts, back ? dark : body, ow);
    p.poly(rrect(x - 22, 944 - up, x + 22, 972 - up, 8), ghost ? "#d6d8f0" : HOOF, 6);
  });
  // body
  const bp = blobPts(285, by, { a: 160, b: 104, nTop: 2.3, nBot: 2.0, egg: 0.05, asym: 0, rot: 0, noise: 0.01, seed: 4 });
  p.shadedFill(bp, body, dark, light, 160, 0.45);
  p.clip(bp, () => { p.ell(250, by + 52, 110, 34, ghost ? "#ffffff" : "#f8c3cf", 0); if (!ghost) for (let i = 0; i < 5; i++) p.ell(200 + i * 40, by - 50 + (i % 2) * 20, 9, 6, "#ffffff55", 0); });
  p.inkRing(bp, ow, th);
  // head
  const hx = 430, hy = 770 + (expr === "chew" ? Math.sin(chew * Math.PI * 2) * 4 : 0);
  for (const s of [-1, 1]) { const ex = hx + s * 46 - 6, ear = [[ex - 26, hy - 50], [ex + s * 10, hy - 112], [ex + 28, hy - 46]]; p.poly(ear, dark, ow); p.poly([[ex - 12, hy - 56], [ex + s * 6, hy - 92], [ex + 14, hy - 54]], ghost ? "#ffffff" : "#f8c3cf", 0); }
  const hp = blobPts(hx, hy, { a: 86, b: 80, nTop: 2.2, nBot: 2.1, egg: -0.05, asym: 0, rot: 0, noise: 0.01, seed: 7 });
  p.shadedFill(hp, body, dark, light, 86, 0.4); p.inkRing(hp, ow, th);
  // snout
  const sx = hx + 52, sy = hy + 24;
  p.ell(sx, sy, 40, 31, snout, 8);
  for (const s of [-1, 1]) p.ell(sx + s * 13, sy, 6, 10, ghost ? "#9ea3c8" : "#8a3a52", 0);
  if (dig) for (const [dx, dy, r] of [[-20, 22, 7], [12, 26, 6], [26, 12, 5], [-34, 8, 4]]) p.ell(sx + dx, sy + dy, r, r * 0.8, "#6b4a2c", 0);
  // eyes
  const ey = hy - 18, lid = lidOf(blink);
  for (const [i, s] of [[0, -1], [1, 1]]) {
    const ex = hx + 8 + s * 30 + look * 6;
    if (expr === "happy" || (expr === "wink" && i === 1)) p.stroke(ellPts(ex, ey + 4, 13, 10, 200, 340, 0, 10), 6);
    else if (expr === "shock") { p.ell(ex, ey, 16, 19, "#ffffff", 5); p.dot(ex + 2, ey + 2, 6); }
    else if (lid >= 1) p.stroke([[ex - 12, ey], [ex + 12, ey]], 6);
    else { p.dot(ex, ey, 9); p.dot(ex + 3, ey - 4, 3, "#ffffff"); }
  }
  // mouth
  const mx = sx - 6, my = sy + 38;
  if (expr === "shock") p.ell(mx, my + 4, 12, 14, "#6a2236", 5);
  else if (expr === "chew") { const o = Math.abs(Math.sin(chew * Math.PI * 2)); p.ell(mx, my, 16, 4 + o * 9, "#6a2236", 5); }
  else p.stroke(ellPts(mx, my - 8, 18, 12, 20, 160, 0, 10), 6);
  // cheek blush
  if (!ghost) p.ell(hx - 30, hy + 30, 16, 10, "#f58aa6aa", 0);
  if (opts.halo) { p.ell(hx, hy - 150, 70, 18, null, 0); g.save(); g.lineWidth = 12; g.strokeStyle = "#ffd84a"; g.beginPath(); g.ellipse(hx, hy - 150, 70, 18, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 4; g.strokeStyle = "#fff3b0"; g.stroke(); g.restore(); }
  g.restore();
};
/** half-eaten potato held near the pig's mouth (separate card so it can drop) */
export const fxPotato = (p) => { p.ell(300, 520, 70, 52, "#b8864a", 9); for (const [x, y] of [[270, 500], [325, 530], [300, 548]]) p.dot(x, y, 6, "#7a5530"); p.ell(345, 500, 26, 34, "#f2e2b0", 0); };

// ---------------- fx ----------------
export const fxBird = (p, flap = 0, col = "#2a2230") => {
  const a = Math.sin(flap * Math.PI * 2) * 40;
  p.stroke([[200, 500 - a], [255, 470], [300, 500]], 14, col); p.stroke([[300, 500], [345, 470], [400, 500 - a]], 14, col);
};
export const fxWord = (p, word, t = 1, col = "#ffd84a", size = 150, rot = -0.12) => {
  const g = p.g, k = Math.min(1, t * 4), s = 0.6 + 0.5 * k - 0.1 * Math.max(0, t - 0.5);
  g.save(); g.translate(300, 500); g.rotate(rot); g.scale(s, s); g.font = `bold ${size}px "DejaVu Sans", Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.globalAlpha = Math.min(1, (1 - t) * 4); g.lineJoin = "round"; g.lineWidth = 26; g.strokeStyle = INK; g.strokeText(word, 0, 0); g.fillStyle = col; g.fillText(word, 0, 0); g.restore();
};
export const fxSteam = (p, t) => { for (let i = 0; i < 3; i++) { const k = (t + i / 3) % 1, x = 230 + i * 70 + Math.sin(k * 6 + i) * 20, y = 640 - k * 380, r = 30 + k * 40; p.g.save(); p.g.globalAlpha = 1 - k; p.ell(x, y, r, r * 0.8, "#ffffff", 7); p.g.restore(); } };
export const fxSnow = (p, t, seed = 1) => { const r = (i) => (Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453) % 1; for (let i = 0; i < 60; i++) { const x = (Math.abs(r(i)) * 600 + Math.sin(t * 6 + i) * 20) % 600, y = (Math.abs(r(i + 50)) * 1000 + t * 1000) % 1000; p.ell(x, y, 4, 4, "#ffffff", 1.5); } };
export const fxLeafFall = (p, t, seed = 1) => { const cols = ["#d9822b", "#c4452c", "#e6b13a"]; for (let i = 0; i < 12; i++) { const r = Math.abs(Math.sin(i * 7.1 + seed)), x = (r * 600 + Math.sin(t * 8 + i) * 40) % 600, y = ((r * 3.3 % 1) * 1000 + t * 900) % 1000; p.g.save(); p.g.translate(x, y); p.g.rotate(t * 6 + i); p.poly([[0, -22], [16, 0], [0, 22], [-16, 0]], cols[i % 3], 4); p.g.restore(); } };
