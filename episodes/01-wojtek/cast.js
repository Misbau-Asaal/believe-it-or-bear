// ================= 01 Wojtek: cast and fx (appended to the toon library) =================
// People reuse romanFront (arm poses and faces) with WWII hats; Wojtek is a front-facing cartoon bear.
const BD = "#7d7550";
export const WJ = {
  sol: { tunic: BD, skin: "#f5c9a0", hatKind: "beret", belts: true },
  sol2: { tunic: BD, skin: "#ecd0b6", hatKind: "beret", belts: true, moustache: "#6b4a2a" },
  sol3: { tunic: BD, skin: "#ffe2c2", hatKind: "beret", belts: true },
  helm: { tunic: BD, skin: "#f5c9a0", hatKind: "brodie", belts: true },
  helm2: { tunic: BD, skin: "#ecd0b6", hatKind: "brodie", belts: true, moustache: "#4a3426" },
  sarge: { tunic: BD, skin: "#f3d6bb", hatKind: "beret", moustache: "#8a6a4a", stout: true, belts: true },
  officer: { tunic: "#6f6a48", skin: "#ffe2c2", moustache: "#6b4a2a", stout: true, hatKind: "peaked", cap: "#6f6a48", band: "#b8323a", sam: true },
  navy: { tunic: "#1f2a44", skin: "#f5c9a0", hatKind: "peaked", cap: "#f2f0ea", band: "#1f2a44", stout: true, buttons: true },
};

const wjHead = (O, opts) => {
  const { seed = 3, facing = 0, bob = 0, tilt = 0, headTilt = 0 } = opts;
  const H = headBlob(seed, 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const torsoL = O.stout ? 1.12 : 1.08, legsL = 1.38, sole = 975, cx = 300;
  const torsoBot = sole - legsL * HH - bob * HH, chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  return { H, W, HH, u, cx, hc, chin, torsoBot, rot: tilt + headTilt ? [rad(tilt + headTilt), cx, chin, cpx - cx, cpy - chin] : null, bodyRot: tilt ? [rad(tilt), cx, hipY] : null };
};

/** a WWII soldier (or sailor). opts as romanFront, plus crate (carrying a crate in front) */
export const wjPerson = (p, key, opts = {}) => {
  const O0 = typeof key === "string" ? WJ[key] : key;
  const O = { ...O0 }; delete O.cap; delete O.hair;
  const R = opts.R ?? "hang", L = opts.L ?? "hang";
  romanFront(p, O, { ...opts, L, R });
  const G = wjHead(O, opts), { H, HH, u, cx, hc } = G, light = opts.light ?? rad(-120), ow = 5 * u;
  const Ta = (0.4 * G.W) / 1.06 * (O.stout ? 1.12 : 1), tcx = cx + 3 * u * (opts.facing || 0), front = ["belly", "cross", "shield"];
  const clear = !front.includes(L) && !front.includes(R);
  p.rot = G.bodyRot;
  if (O.belts && clear) p.band([[tcx - 0.95 * Ta, G.torsoBot - 0.22 * HH], [tcx + 0.95 * Ta, G.torsoBot - 0.22 * HH]], "#6a5a3a", 0.08 * HH, 1.4 * u);
  if (O.sam && clear) { p.band([[tcx - 0.95 * Ta, G.torsoBot - 0.22 * HH], [tcx + 0.95 * Ta, G.torsoBot - 0.22 * HH]], "#6a4a2a", 0.08 * HH, 1.4 * u); p.band([[tcx + 0.6 * Ta, G.chin + 0.1 * HH], [tcx - 0.55 * Ta, G.torsoBot - 0.24 * HH]], "#7a5030", 0.06 * HH, 1.4 * u); }
  if (O.buttons && clear) for (let i = 0; i < 3; i++) for (const s of [-1, 1]) p.ell(tcx + s * 0.3 * Ta, G.chin + (0.18 + i * 0.22) * HH, 3.4 * u, 3.4 * u, "#e0b24a", 1.2 * u);
  p.rot = G.rot;
  const crown = hc - H.b, k = O0.hatKind;
  if (k === "beret") {
    const by = crown + 0.26 * HH, top = ellPts(cx + 0.12 * G.W, by - 0.12 * HH, 0.62 * G.W, 0.2 * HH, 0, 360, -0.12, 32);
    p.shadedFill(top, "#3f3d30", "#2a2920", light, 0.6 * G.W, 0.4); p.poly(top, null, ow);
    p.band([[cx - 0.46 * G.W, by + 0.01 * HH], [cx + 0.46 * G.W, by + 0.01 * HH]], "#2a2920", 0.07 * HH, 1.4 * u);
    p.ell(cx - 0.24 * G.W, by - 0.08 * HH, 6 * u, 7 * u, "#d8d8d0", 1.4 * u); // the eagle badge
  } else if (k === "brodie") {
    const by = crown + 0.3 * HH;
    p.poly(ellPts(cx, by, 0.86 * G.W, 0.1 * HH, 0, 360, 0, 32), "#5e5a3e", ow);
    const dome = ellPts(cx, by, 0.52 * G.W, 0.5 * HH, 180, 360, 0, 28); p.shadedFill(dome, "#6f6a48", "#4e4a32", light, 0.52 * G.W, 0.4); p.poly(dome, null, ow);
  } else if (k === "peaked") {
    const by = crown + 0.27 * HH;
    const top = ellPts(cx, by - 0.2 * HH, 0.56 * G.W, 0.14 * HH, 0, 360, 0, 32); p.shadedFill(top, O0.cap, mix(O0.cap, INK, 0.25), light, 0.56 * G.W, 0.4); p.poly(top, null, ow);
    p.poly([[cx - 0.46 * G.W, by - 0.2 * HH], [cx + 0.46 * G.W, by - 0.2 * HH], [cx + 0.44 * G.W, by + 0.02 * HH], [cx - 0.44 * G.W, by + 0.02 * HH]], O0.band, ow);
    p.ell(cx, by - 0.1 * HH, 7 * u, 7 * u, "#e0b24a", 1.6 * u);
    p.poly([...ellPts(cx + 0.06 * G.W, by + 0.01 * HH, 0.46 * G.W, 0.09 * HH, 0, 180, 0, 16)], "#1f1b22", ow);
  }
  p.rot = null;
  if (opts.crate) crateAt(p, tcx, G.chin + 0.62 * HH, 1.0);
};
/** an ammo crate drawn into a card, centred at (x, y) */
export const crateAt = (p, x, y, s = 1) => {
  const w = 120 * s, h = 92 * s; p.poly(rrect(x - w, y - h, x + w, y + h, 8 * s), "#8a6a3a", 9 * s);
  for (let i = 1; i < 4; i++) p.stroke([[x - w + 6, y - h + i * h / 2], [x + w - 6, y - h + i * h / 2]], 4 * s, "#6a4f28");
  p.stroke([[x - w + 10, y - h + 10], [x + w - 10, y + h - 10]], 7 * s, "#6a4f28");
  const g = p.g; g.save(); g.font = `bold ${Math.round(40 * s)}px "DejaVu Sans", Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#2a2a24"; g.fillText("AMMO", x, y + 2); g.restore();
};

// ---------------- Wojtek ----------------
const FUR = "#7a5232", FUR_D = "#563820", FUR_L = "#a07448", MUZ = "#d8b48a", NOSE = "#2a1a14";
/** Wojtek, front-facing. opts:
 *  pose 'stand' | 'sit' ; cub (small, big head) ; L / R arms: 'hang' | 'up' | 'salute' | 'hold' | 'carry' | 'wave' | 'hug'
 *  expr 'neutral' | 'happy' | 'smug' | 'shock' | 'wink' | 'determined' | 'sad' ; blink ; look (-1..1) ; mouth 'open'
 *  stripes (corporal chevrons), cap (beret), crate (carried over the head), shell (hugged), mug, paybook, bob, step */
export const bearCard = (p, o = {}) => {
  const { pose = "stand", cub = false, expr = "neutral", blink = 0, look = 0, bob = 0, step = 0 } = o;
  const g = p.g, ow = 9, light = rad(-120), th = thickAngle(light);
  g.save();
  if (cub) { g.translate(300, 975); g.scale(0.5, 0.5); g.translate(-300, -975); }
  const sit = pose === "sit" || cub;
  const lift = step ? Math.abs(Math.sin(step * Math.PI * 2)) * 18 : 0;
  const by = (sit ? 790 : 690) - bob * 30 - lift * 0.4, hy = (sit ? 520 : 420) - bob * 30 - lift * 0.4 + (cub ? 30 : 0), hs = cub ? 1.25 : 1;
  // legs and feet
  if (sit) for (const s of [-1, 1]) { p.ell(300 + s * 110, 935, 70, 48, FUR, ow); p.ell(300 + s * 118, 930, 40, 30, MUZ, 6); for (let i = -1; i <= 1; i++) p.ell(300 + s * 118 + i * 18, 902, 9, 9, MUZ, 4); }
  else for (const s of [-1, 1]) { const up = step ? Math.max(0, Math.sin(step * Math.PI * 2 + (s > 0 ? Math.PI : 0))) * 26 : 0;
    p.poly(rrect(300 + s * 70 - 50, 800 - up, 300 + s * 70 + 50, 960 - up, 36), FUR_D, ow); p.ell(300 + s * 74, 958 - up, 62, 26, FUR, ow); }
  // body
  const bp = blobPts(300, by, { a: sit ? 165 : 150, b: sit ? 150 : 170, nTop: 2.1, nBot: 2.2, egg: 0.06, asym: 0, rot: 0, noise: 0.015, seed: 9 });
  p.shadedFill(bp, FUR_L, FUR_D, light, 160, 0.5);
  p.clip(bp, () => { p.ell(300, by + 30, 95, 115, "#c49a6a", 0); const r = P_rng(3); for (let i = 0; i < 26; i++) { const x = 170 + r() * 260, y = by - 140 + r() * 260; p.stroke([[x, y], [x - 8, y + 18]], 4, FUR_D); } });
  p.inkRing(bp, ow, th);
  // corporal chevrons on the left sleeve (drawn on the shoulder)
  const sh = { L: [175, by - 95], R: [425, by - 95] };
  // arms
  const paw = (x, y) => { p.ell(x, y, 40, 38, FUR, ow); p.ell(x, y + 6, 20, 16, MUZ, 0); };
  const arm = (side, pose_) => {
    const [sx, sy] = sh[side], d = side === "L" ? -1 : 1;
    let end;
    switch (pose_) {
      case "up": end = [sx + d * 40, sy - 230]; break;
      case "wave": end = [sx + d * (60 + Math.sin((o.wv || 0)) * 25), sy - 210]; break;
      case "salute": end = [300 + d * 70, hy - 50]; break;
      case "carry": end = [300 + d * 105, hy - 130]; break;
      case "hold": end = [300 + d * 55, by - 20]; break;
      case "hug": end = [300 + d * 70, by - 40]; break;
      case "wrestle": end = [sx + d * 90, sy - 120]; break;
      default: end = [sx + d * 18, sy + 165];
    }
    const mid = [(sx + end[0]) / 2 + d * 30, (sy + end[1]) / 2 + 10];
    p.stroke([[sx, sy], mid, end], 74, INK); p.stroke([[sx, sy], mid, end], 58, side === "L" ? FUR : FUR_L);
    if (o.stripes && side === "L") { for (let i = 0; i < 2; i++) { const cx_ = (sx + mid[0]) / 2 - 4, cy_ = (sy + mid[1]) / 2 - 6 + i * 20; p.stroke([[cx_ - 24, cy_ - 10], [cx_, cy_ + 8], [cx_ + 24, cy_ - 10]], 13, INK); p.stroke([[cx_ - 22, cy_ - 10], [cx_, cy_ + 6], [cx_ + 22, cy_ - 10]], 7, "#f2e6b8"); } }
    return end;
  };
  const front = (q) => ["hold", "hug"].includes(q);
  const Lp = o.L ?? "hang", Rp = o.R ?? "hang";
  // props behind the paws
  if (o.shell) { p.poly([[268, by - 150], [332, by - 150], [332, by + 80], [268, by + 80]], "#c8a04a", 8); p.poly([[268, by - 150], [300, by - 225], [332, by - 150]], "#9aa0a6", 8); p.band([[268, by + 50], [332, by + 50]], "#8a6a2a", 14, 3); }
  const Le = arm("L", Lp), Re = arm("R", Rp);
  // head
  const hx = 300, H = { a: 112 * hs, b: 100 * hs };
  for (const s of [-1, 1]) { p.ell(hx + s * 82 * hs, hy - 78 * hs, 40 * hs, 38 * hs, FUR, ow); p.ell(hx + s * 82 * hs, hy - 74 * hs, 20 * hs, 18 * hs, "#c49a6a", 0); }
  const hp = blobPts(hx, hy, { a: H.a, b: H.b, nTop: 2.1, nBot: 2.0, egg: 0.04, asym: 0, rot: 0, noise: 0.01, seed: 5 });
  p.shadedFill(hp, FUR_L, FUR, light, H.a, 0.45); p.inkRing(hp, ow, th);
  p.ell(hx, hy + 38 * hs, 58 * hs, 44 * hs, MUZ, 7);
  p.ell(hx, hy + 18 * hs, 24 * hs, 16 * hs, NOSE, 5); p.ell(hx - 6 * hs, hy + 13 * hs, 7 * hs, 4 * hs, "#6a5048", 0);
  // eyes
  const lid = lidOf(blink), ey = hy - 18 * hs;
  for (const s of [-1, 1]) {
    const ex = hx + s * 42 * hs + look * 6, r = 14 * hs;
    const wink = expr === "wink" && s > 0;
    if (expr === "happy" || wink) { p.stroke(ellPts(ex, ey + 4, r, r * 0.8, 200, 340, 0, 10), 7); continue; }
    if (lid >= 1) { p.stroke([[ex - r, ey], [ex + r, ey]], 7); continue; }
    if (expr === "shock") { p.ell(ex, ey, r * 1.35, r * 1.5, "#ffffff", 6); p.dot(ex, ey + 2, 6 * hs); continue; }
    p.ell(ex, ey, r * (cub ? 1.2 : 0.9), r * (cub ? 1.3 : 1.0), INK, 0); p.dot(ex + 4 * hs, ey - 5 * hs, 4 * hs, "#ffffff");
    if (expr === "smug" || lid > 0) p.poly([[ex - r - 4, ey - r - 6], [ex + r + 4, ey - r - 6], [ex + r + 4, ey - r * 0.1], [ex - r - 4, ey - r * 0.1]], FUR_L, 0), p.stroke([[ex - r - 2, ey - r * 0.1], [ex + r + 2, ey - r * 0.1]], 6);
    if (expr === "determined") p.stroke([[ex - s * (r + 8), ey - r - 16], [ex + s * (r + 6), ey - r - 4]], 9);
    if (expr === "sad") p.stroke([[ex - s * (r + 6), ey - r - 4], [ex + s * (r + 8), ey - r - 16]], 7);
  }
  // mouth
  const my = hy + 52 * hs;
  if (expr === "shock" || o.mouth === "open") p.ell(hx, my + 4, 18 * hs, 16 * hs, "#6a2236", 5);
  else if (expr === "sad") p.stroke(ellPts(hx, my + 16, 18 * hs, 10 * hs, 200, 340, 0, 10), 6);
  else { p.stroke([[hx, hy + 30 * hs], [hx, my - 4]], 5); p.stroke(ellPts(hx, my - 8, 26 * hs, 16 * hs, 20, 160, 0, 10), 6); if (expr === "happy" || expr === "smug" || expr === "wink") p.ell(hx + 8, my + 10, 10 * hs, 8 * hs, "#e87a8a", 3); }
  if (cub || expr === "happy") for (const s of [-1, 1]) p.ell(hx + s * 72 * hs, hy + 20 * hs, 16 * hs, 10 * hs, "#e89a8a88", 0);
  // hat
  if (o.cap) { const top = ellPts(hx + 18, hy - 92 * hs, 90 * hs, 30 * hs, 0, 360, -0.15, 28); p.shadedFill(top, "#3f3d30", "#2a2920", light, 90, 0.4); p.poly(top, null, 7); p.band([[hx - 70 * hs, hy - 78 * hs], [hx + 74 * hs, hy - 84 * hs]], "#2a2920", 12, 3); p.ell(hx - 30, hy - 96 * hs, 9, 10, "#d8d8d0", 3); }
  // things in the paws (in front)
  if (o.crate) crateAt(p, 300, Math.min(Le[1], Re[1]) - 80, 1.15);
  if (o.mug) { const x = Re[0] - 30, y = Re[1] - 30; p.poly(rrect(x - 26, y - 30, x + 26, y + 30, 6), "#e8e4d8", 6); p.stroke(ellPts(x + 34, y, 14, 16, -90, 90, 0, 10), 7); }
  if (o.paybook) { const x = 300, y = by - 10; p.poly(rrect(x - 70, y - 50, x + 70, y + 50, 6), "#6a2a22", 7); const gg = p.g; gg.save(); gg.font = 'bold 26px "DejaVu Sans", Arial, sans-serif'; gg.textAlign = "center"; gg.fillStyle = "#e0c070"; gg.fillText("PAYBOOK", x, y + 8); gg.restore(); }
  for (const [e, q] of [[Le, Lp], [Re, Rp]]) paw(e[0], e[1]);
  g.restore();
};
const P_rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

// ---------------- fx ----------------
export const fxWord = (p, word, t = 1, col = "#ffd84a", size = 150, rot = -0.12) => {
  const g = p.g, k = Math.min(1, t * 4), s = 0.6 + 0.5 * k - 0.1 * Math.max(0, t - 0.5);
  g.save(); g.translate(300, 500); g.rotate(rot); g.scale(s, s); g.font = `bold ${size}px "DejaVu Sans", Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
  g.globalAlpha = Math.min(1, (1 - t) * 4); g.lineJoin = "round"; g.lineWidth = 26; g.strokeStyle = INK; g.strokeText(word, 0, 0); g.fillStyle = col; g.fillText(word, 0, 0); g.restore();
};
export const fxHearts = (p, t) => { for (let i = 0; i < 4; i++) { const k = (t + i / 4) % 1, x = 200 + i * 70 + Math.sin(k * 7 + i) * 30, y = 760 - k * 520, r = 26 + 10 * Math.sin(i);
  p.g.save(); p.g.globalAlpha = 1 - k * k; p.ell(x - r * 0.5, y, r * 0.6, r * 0.6, "#ff5a78", 5); p.ell(x + r * 0.5, y, r * 0.6, r * 0.6, "#ff5a78", 5); p.poly([[x - r * 1.05, y + 6], [x + r * 1.05, y + 6], [x, y + r * 1.4]], "#ff5a78", 5); p.g.restore(); } };
export const fxPaybook = (p, t) => { const g = p.g, s = 0.85 + 0.15 * Math.min(1, t * 5); g.save(); g.translate(300, 500); g.scale(s, s); g.rotate(-0.05);
  p.poly(rrect(-230, -300, 230, 300, 18).map(([x, y]) => [x, y]), "#7a2a22", 12); p.poly(rrect(-200, -270, 200, 270, 10), "#f2e6c8", 6);
  g.textAlign = "center"; g.fillStyle = "#3a2a1c"; g.font = 'bold 44px "DejaVu Sans", Arial, sans-serif'; g.fillText("SOLDIER'S", 0, -180); g.fillText("PAYBOOK", 0, -125);
  g.font = 'bold 34px "DejaVu Sans", Arial, sans-serif'; g.fillText("Name:", -90, -30); g.fillStyle = "#1f3a8a"; g.font = 'bold italic 54px "DejaVu Sans", Arial, sans-serif'; g.fillText("Wojtek", 40, 40);
  g.fillStyle = "#3a2a1c"; g.font = 'bold 34px "DejaVu Sans", Arial, sans-serif'; g.fillText("Rank: Private", 0, 130);
  if (t > 0.35) { g.save(); g.translate(90, 210); g.rotate(-0.2); g.strokeStyle = "#c4212b"; g.lineWidth = 8; g.strokeRect(-110, -40, 220, 80); g.fillStyle = "#c4212b"; g.font = 'bold 44px "DejaVu Sans", Arial, sans-serif'; g.fillText("ENLISTED", 0, 16); g.restore(); }
  g.restore(); };
export const fxStripes = (p, t) => { const s = 0.7 + 0.3 * Math.min(1, t * 4); p.g.save(); p.g.translate(300, 500); p.g.scale(s, s); p.poly(rrect(-150, -170, 150, 170, 30), "#6f6a48", 10);
  for (let i = 0; i < 2; i++) { const y = -50 + i * 90; p.stroke([[-110, y - 40], [0, y + 30], [110, y - 40]], 46, INK); p.stroke([[-104, y - 40], [0, y + 24], [104, y - 40]], 30, "#f2e6b8"); }
  p.g.restore(); };
export const fxBoom = (p, t) => { const r = 80 + 180 * t; p.g.save(); p.g.globalAlpha = Math.max(0, 1 - t); const pts = []; for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, rr = i % 2 ? r * 0.55 : r; pts.push([300 + Math.cos(a) * rr, 520 + Math.sin(a) * rr]); } p.poly(pts, "#ffb040", 8); p.ell(300, 520, r * 0.4, r * 0.4, "#fff0b0", 0); p.g.restore(); };
export const fxSmoke = (p, t, seed = 1) => { for (let i = 0; i < 5; i++) { const k = (t + i / 5) % 1, x = 300 + Math.sin(i * 2.3 + seed) * 80 + k * 40, y = 900 - k * 700, r = 60 + k * 120; p.g.save(); p.g.globalAlpha = 0.85 * (1 - k); p.ell(x, y, r, r * 0.8, "#8a8a86", 6); p.g.restore(); } };
export const fxSweat = (p, t) => { for (let i = 0; i < 2; i++) { const k = (t + i * 0.5) % 1; p.g.save(); p.g.globalAlpha = 1 - k; p.poly([[300 + i * 80, 400 + k * 160], [318 + i * 80, 440 + k * 160], [300 + i * 80, 460 + k * 160], [282 + i * 80, 440 + k * 160]], "#9fd4ff", 5); p.g.restore(); } };
export const fxSteam = (p, t) => { for (let i = 0; i < 3; i++) { const k = (t + i / 3) % 1, x = 230 + i * 70 + Math.sin(k * 6 + i) * 20, y = 640 - k * 380, r = 30 + k * 40; p.g.save(); p.g.globalAlpha = 1 - k; p.ell(x, y, r, r * 0.8, "#ffffff", 7); p.g.restore(); } };
export const fxCaption = (p, lines, col = "#ffffff", size = 70) => {
  const g = p.g; g.save(); g.font = `bold ${size}px "DejaVu Sans", Arial, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  lines.forEach((t, i) => { const y = 500 + (i - (lines.length - 1) / 2) * size * 1.15; g.lineWidth = size * 0.28; g.strokeStyle = INK; g.strokeText(t, 300, y); g.fillStyle = Array.isArray(col) ? col[i] : col; g.fillText(t, 300, y); });
  g.restore();
};
