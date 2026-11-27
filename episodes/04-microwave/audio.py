"""04 The Microwave: synthesized music bed + SFX as two stems (music.wav, sfx.wav). mix.py sets the levels.
Music: a bouncy 1940s lab tune (pizzicato bass, clarinet-ish lead, brushed snare) for the setup, a grumpy trombone for
"Most people would complain", a sneaky rising line for the idea and the popcorn, brass hits for the pops, a ticking
tension drone for the egg that cuts dead on the explosion, a dreamy wobbly pad inside the food that climbs as it heats,
a heavy oompah for the 750-pound oven, a hopeful little tune in the office, then the sting: silence, a low hit, crickets."""
import numpy as np, wave

SR = 48000
FRAMES = 1319
DUR = FRAMES / 30
N = int(DUR * SR)
rng = np.random.default_rng(45)
F = lambda f: f / 30
midi = lambda m: 440 * 2 ** ((m - 69) / 12)

def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)
def lp_fast(x, cutoff):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)
def hp_fast(x, cutoff):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 - 1 / (1 + (f / cutoff) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)
def bp_fast(x, lo, hi): return hp_fast(lp_fast(x, hi), lo)
def place(buf, sig, t0, gain=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if i < N and j > i: buf[i:j] += sig[: j - i] * gain
def noise(d): return rng.standard_normal(int(d * SR)).astype(np.float32)
def fade_out(buf, a, b, clear_after=True):
    i0, i1 = int(a * SR), min(N, int(b * SR)); buf[i0:i1] *= np.linspace(1, 0, i1 - i0)
    if clear_after: buf[i1:] *= 0
def gate(buf, a, b):
    m = np.zeros(N, np.float32); m[int(a * SR):int(b * SR)] = 1; return buf * m

# ---------------- instruments ----------------
def clar(f, dur, bright=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    vib = 1 + 0.005 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.2)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    s = np.sin(ph) + bright * 0.5 * np.sin(3 * ph) + bright * 0.25 * np.sin(5 * ph) + 0.1 * np.sin(2 * ph)
    a = np.minimum(1, t / 0.025) * np.clip((dur - t) / 0.06, 0, 1)
    return lp_fast((s * a).astype(np.float32), 3200)
def brass(fs, dur, cut=1600):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in fs:
        ph = 2 * np.pi * f * t + 0.003 * np.sin(2 * np.pi * 5 * t)
        s += sum(np.sin((k + 1) * ph) / (k + 1) ** 1.3 for k in range(8))
    a = np.minimum(1, t / 0.06) * np.clip((dur - t) / 0.15, 0, 1)
    return lp_fast((s * a).astype(np.float32), cut) / len(fs)
def pluck(f, dur=0.3, bright=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum((bright ** k) * np.sin(2 * np.pi * f * (k + 1) * t) / (k + 1) for k in range(6))
    return (s * env(n, 0.003, dur * 0.35)).astype(np.float32)
def brush(d=0.1):
    n = int(d * SR); t = np.arange(n) / SR
    return bp_fast((rng.standard_normal(n) * np.exp(-t * 30)).astype(np.float32), 1500, 7000) * 0.6
def snare(d=0.12):
    n = int(d * SR); t = np.arange(n) / SR
    return hp_fast((rng.standard_normal(n) * np.exp(-t * 35) * 0.7 + np.sin(2 * np.pi * 200 * t) * np.exp(-t * 25) * 0.4).astype(np.float32), 400)
def kick():
    n = int(0.35 * SR); t = np.arange(n) / SR; f = 48 + 60 * np.exp(-t * 25)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)).astype(np.float32)
def woodblock(f0=1200):
    d = 0.08; n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f0 * t) * np.exp(-t * 60) + 0.3 * bp_fast(noise(d), 1500, 4000) * np.exp(-t * 80)).astype(np.float32)
def pad(fs, dur, wob=0.0):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in fs:
        for det in (-0.004, 0.004):
            s += np.sin(2 * np.pi * f * (1 + det) * t + wob * np.sin(2 * np.pi * 6 * t))
    a = np.minimum(1, t / 0.4) * np.clip((dur - t) / 0.4, 0, 1)
    return lp_fast((s * a / (2 * len(fs))).astype(np.float32), 1800)
def trombone(m, d, wob=0.0):
    n = int(d * SR); t = np.arange(n) / SR; w = 1 + wob * np.sin(2 * np.pi * 6 * t)
    ph = 2 * np.pi * midi(m) * np.cumsum(np.ones(n) * w) / SR
    s = sum(np.sin((k + 1) * ph) / (k + 1) ** 1.1 for k in range(10)) * np.minimum(1, t / 0.04) * np.clip((d - t) / 0.12, 0, 1)
    return lp_fast(s.astype(np.float32), 1100)

music = np.zeros(N, np.float32)

# 1) the lab tune: swung eighths at 118 bpm (pizz bass, brushes, clarinet lead from the second bar)
def lab_tune(t0, t1, bpm=118, gain=1.0, lead=True):
    out = np.zeros(N, np.float32); b = 60 / bpm; k = 0; tt = t0
    bass = [48, 55, 52, 55, 53, 57, 55, 50]
    mel = [72, 74, 76, 79, None, 76, 77, 74, 72, None, 69, 71, 72, 76, 74, None, 76, 77, 79, 81, None, 79, 77, 76, 74, 72, 71, 74, 72, None, None, None]
    while tt < t1:
        sw = b / 2 * (1.32 if k % 2 == 0 else 0.68)
        if k % 2 == 0: place(out, pluck(midi(bass[(k // 2) % 8]), 0.45, 0.35), tt, 0.55 * gain)
        place(out, brush(0.09), tt, (0.16 if k % 2 else 0.08) * gain)
        if k % 4 == 2: place(out, snare(0.06), tt, 0.07 * gain)
        if lead and k >= 8:
            m = mel[(k - 8) % 32]
            if m: place(out, clar(midi(m), sw * 0.92), tt, 0.2 * gain)
        k += 1; tt += sw
    return out
music += gate(lab_tune(0.0, F(160)), 0, F(160)); fade_out(music, F(150), F(160), False)   # the hook, ending on the cut outside
music += gate(lab_tune(F(165), F(524), 118, 0.95), F(165), F(524))
place(music, brass([midi(60), midi(64), midi(67)], 0.5, 2200), F(170), 0.3)               # "In 1945" hit
fade_out(music, F(515), F(524))

# 2) "Most people would complain": grumpy trombone, two low notes
for m, d, at in [(43, 0.45, 528), (41, 0.8, 548)]: place(music, trombone(m, d, 0.012), F(at), 0.38)

# 3) the idea and the popcorn: sneaky rising plucks, 579 -> 704
b = 60 / 128; tt = F(580); k = 0
line = [60, None, 63, 60, 65, None, 67, 63, 60, None, 63, 67, 70, None, 72, None]
while tt < F(704):
    m = line[k % 16]
    if m: place(music, pluck(midi(m + (12 if tt > F(650) else 0)), 0.22, 0.45), tt, 0.42)
    if k % 4 == 0: place(music, pluck(midi(48 if (k // 16) % 2 == 0 else 51), 0.4, 0.3), tt, 0.5)
    if k % 2 == 1: place(music, woodblock(1400 if k % 4 == 1 else 1000), tt, 0.2)
    k += 1; tt += b / 2
place(music, clar(midi(84), 0.5), F(600), 0.22); place(music, clar(midi(88), 0.6), F(606), 0.22)       # the idea

# 4) POP: brass hits on the pops, then the lab tune briefly, 705 -> 757
for at, ch in [(705, [60, 64, 67, 72]), (716, [62, 65, 69, 74]), (726, [64, 67, 71, 76])]: place(music, brass([midi(m) for m in ch], 0.35, 2600), F(at), 0.32)
music += gate(lab_tune(F(735), F(757), 132, 0.8, lead=False), F(735), F(757))

# 5) the egg: a ticking tension drone that rises and cuts dead on the explosion (886)
tt = F(760); k = 0
while tt < F(885):
    x = (tt - F(760)) / (F(885) - F(760)); place(music, woodblock(1800 if k % 2 else 1300), tt, 0.16 + 0.2 * x); k += 1; tt += 60 / (110 + 70 * x) / 2
dr = pad([midi(38), midi(45)], F(885) - F(762)); place(music, dr * np.linspace(0.2, 1, len(dr)).astype(np.float32), F(762), 0.5)
for i, m in enumerate([62, 63, 64, 65, 66]): place(music, clar(midi(m), 0.5, 0.3), F(800) + i * 0.5, 0.1 + 0.03 * i)
music[int(F(885) * SR):int(F(902) * SR)] = 0
tt = F(902)                                                       # after the explosion: a sad slide down
for m, d in [(60, 0.3), (59, 0.3), (58, 0.3), (57, 0.8)]: place(music, trombone(m, d, 0.0 if d < 0.5 else 0.015), tt, 0.3); tt += d

# 6) inside the food: dreamy pad + bubbly plucks; jitters on "shake", climbs as it heats
place(music, pad([midi(57), midi(64), midi(69)], F(1093) - F(940)), F(940), 0.55)
for i in range(60):
    at = F(950) + i * 0.17
    if at > F(1090): break
    place(music, pluck(midi([81, 84, 88, 86, 83, 79][i % 6] + (3 if at > F(1043) else 0)), 0.18, 0.6), at, 0.18)
tj = np.arange(int((F(1093) - F(988)) * SR)) / SR
jit = (np.sin(2 * np.pi * midi(69) * tj * (1 + 0.5 * np.clip((tj - 1.8) / 1.5, 0, 1))) * (np.sin(2 * np.pi * 15 * tj) > 0)).astype(np.float32)
place(music, lp_fast(jit, 2400), F(988), 0.12)
rise = np.arange(int((F(1092) - F(1043)) * SR)) / SR
place(music, (np.sin(2 * np.pi * np.cumsum(300 + 900 * rise / rise[-1]) / SR) * np.minimum(1, rise / 0.3) * 0.5).astype(np.float32), F(1043), 0.25)

# 7) the 750-pound oven: heavy oompah, 1094 -> 1219
def oompah(t0, t1, bpm=92, gain=1.0):
    out = np.zeros(N, np.float32); b = 60 / bpm; k = 0; tt = t0
    roots = [36, 43, 41, 43]
    while tt < t1:
        r = roots[(k // 2) % 4]
        if k % 2 == 0: place(out, brass([midi(r)], b * 0.5, 600), tt, 0.6 * gain); place(out, kick(), tt, 0.4 * gain)
        else: place(out, brass([midi(r + 12), midi(r + 16), midi(r + 19)], b * 0.35, 1400), tt, 0.22 * gain); place(out, snare(0.06), tt, 0.1 * gain)
        k += 1; tt += b
    return out
music += gate(oompah(F(1098), F(1146)), F(1098), F(1146))
place(music, brass([midi(31), midi(38)], 1.2, 700), F(1146), 0.55)                       # the landing
music += gate(oompah(F(1162), F(1216), 104, 0.9), F(1162), F(1216))
place(music, brass([midi(48), midi(55), midi(60), midi(64)], 0.6, 2400), F(1186), 0.35)
fade_out(music, F(1210), F(1219), False); music[int(F(1219) * SR):int(F(1220) * SR)] = 0

# 8) the office: hopeful little tune, 1220 -> 1275 (stops dead for the sting)
tt = F(1222)
for k, m in enumerate([72, 76, 79, 84, 83, 79, 81, 84]):
    place(music, pluck(midi(m), 0.3, 0.55), tt, 0.35)
    if k % 2 == 0: place(music, pluck(midi([48, 55, 53, 55][k // 2 % 4]), 0.4, 0.3), tt, 0.4)
    tt += 0.21
place(music, brass([midi(60), midi(64), midi(67), midi(72)], 0.9, 2400), F(1250), 0.25)
music[int(F(1276) * SR):] = 0

# 9) the sting: a low hit on "dollars", then nothing but a cricket (sfx)
hit = np.arange(int(1.6 * SR)) / SR
place(music, (np.sin(2 * np.pi * 41 * hit) * np.exp(-hit * 2.2) + lp_fast(noise(1.6), 120) * np.exp(-hit * 6) * 0.6).astype(np.float32), F(1288), 0.9)

# ---------------- sfx ----------------
sfx = np.zeros(N, np.float32)
def whoosh(d=0.5):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 1500) * np.sin(np.pi * t / d) ** 2 * 0.6).astype(np.float32)
def thunk(f0=90, d=0.3):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f0 * t * (1 + 0.6 * np.exp(-t * 40))) * np.exp(-t * 14) + lp_fast(noise(d), 1200) * np.exp(-t * 30) * 0.5).astype(np.float32)
def ting(f0=2093, d=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(f0, 4), (f0 * 1.5, 6), (f0 * 2, 8)]) * 0.3).astype(np.float32)
def pop(f0=None):
    d = 0.06; n = int(d * SR); t = np.arange(n) / SR; f0 = f0 or 600 + 900 * rng.random()
    return (np.sin(2 * np.pi * f0 * t * (1 - 0.5 * t / d)) * np.exp(-t * 90) + hp_fast(noise(d), 1500) * np.exp(-t * 140) * 0.8).astype(np.float32)
def drip():
    d = 0.14; n = int(d * SR); t = np.arange(n) / SR; f = 900 + 1400 * (t / d)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30) * 0.6).astype(np.float32)
def gloop(d=0.5):
    n = int(d * SR); t = np.arange(n) / SR; f = 140 + 60 * np.sin(2 * np.pi * 7 * t)
    return (lp_fast((np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d)).astype(np.float32) + 0.3 * lp_fast(noise(d), 500), 900) * 0.7).astype(np.float32)
def hiss(d=0.8, lo=3000):
    n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(noise(d), lo) * np.sin(np.pi * t / d) * 0.35).astype(np.float32)
def hum(d):
    n = int(d * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * 60 * k * t) / k for k in (1, 2, 3, 5)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.7 * t)) + 0.15 * bp_fast(noise(d), 2000, 6000)
    return (s * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.2) * 0.4).astype(np.float32)
def clunk():
    a = thunk(70, 0.35); b = np.zeros_like(a); c = thunk(160, 0.2); j = int(0.04 * SR); b[j:j + len(c)] = c[: len(b) - j]; return a + 0.5 * b
def crinkle(d=0.6):
    n = int(d * SR); s = np.zeros(n, np.float32)
    for i in range(int(d * 60)):
        j = int(rng.random() * (n - 2000)); s[j:j + 600] += hp_fast(noise(600 / SR), 2500) * np.exp(-np.arange(600) / 80) * (0.3 + 0.7 * rng.random())
    return s * 0.6
def step(): return thunk(75, 0.12) * 0.6
def rattle(d, rate=14):
    n = int(d * SR); s = np.zeros(n, np.float32); m = int(0.05 * SR); tt = np.arange(m) / SR
    for i in range(int(d * rate)):
        j = int(i / rate * SR); g = (np.sin(2 * np.pi * (900 + 300 * (i % 3)) * tt) * np.exp(-tt * 80)).astype(np.float32)
        s[j:j + m] += g[: n - j] * (0.2 + 0.8 * i / (d * rate))
    return s
def boom():
    d = 1.6; n = int(d * SR); t = np.arange(n) / SR
    crack = hp_fast(noise(d), 1200) * np.exp(-t * 30) * 1.2
    low = lp_fast(noise(d), 220) * np.exp(-t * 4) * 2.2 + np.sin(2 * np.pi * 45 * t) * np.exp(-t * 5) * 0.8
    wet = bp_fast(noise(d), 300, 2500) * np.exp(-((t - 0.05) / 0.08) ** 2) * 1.0
    return (crack + low + wet).astype(np.float32)
def splat(d=0.35):
    n = int(d * SR); t = np.arange(n) / SR
    return (bp_fast(noise(d), 200, 1800) * np.exp(-t * 18) * 0.9).astype(np.float32)
def wub(d=0.5, f0=110):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f0 * t + 3 * np.sin(2 * np.pi * 6 * t)) * np.sin(np.pi * t / d) * 0.5).astype(np.float32)
def scrape(d):
    n = int(d * SR); t = np.arange(n) / SR
    grit = (rng.random(n) < 0.08).astype(np.float32) * rng.standard_normal(n).astype(np.float32)
    return (bp_fast(grit + 0.4 * noise(d), 150, 1600) * (0.6 + 0.4 * np.sin(2 * np.pi * 2.3 * t)) * np.minimum(1, t / 0.15) * np.minimum(1, (d - t) / 0.15) * 1.2).astype(np.float32)
def rumble(d):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 140) * 2.5 * np.exp(-t * 2.5)).astype(np.float32)
def boing(d=1.2, f0=180):
    n = int(d * SR); t = np.arange(n) / SR; f = f0 * (1 + 0.6 * np.exp(-t * 3) * np.sin(2 * np.pi * 9 * t))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.4) * 0.5).astype(np.float32)
def tick(): return (hp_fast(noise(0.03), 3000) * np.exp(-np.arange(int(0.03 * SR)) / SR * 200)).astype(np.float32)
def paper(d=0.4):
    n = int(d * SR); t = np.arange(n) / SR
    return (bp_fast(noise(d), 1500, 6000) * np.sin(np.pi * t / d) * 0.35).astype(np.float32)
def rip(d=0.35):
    n = int(d * SR); t = np.arange(n) / SR
    return (bp_fast(noise(d), 800, 5000) * (0.5 + 0.5 * (rng.random(n) < 0.3)) * np.sin(np.pi * t / d) * 0.6).astype(np.float32)
def cricket(d):
    n = int(d * SR); t = np.arange(n) / SR
    g = ((t * 2.6) % 1 < 0.3).astype(np.float32) * (np.sin(2 * np.pi * 45 * t) > 0).astype(np.float32)
    return (np.sin(2 * np.pi * 4300 * t) * g * 0.25).astype(np.float32)
def tweet():
    d = 0.3; n = int(d * SR); t = np.arange(n) / SR; f = 3200 + 1200 * np.sin(np.pi * t / d * 3)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.4).astype(np.float32)
def kettle_whistle(d):
    n = int(d * SR); t = np.arange(n) / SR; f = 1400 + 1200 * t / d
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t)) * np.minimum(1, t / 0.4) * 0.25 + hp_fast(noise(d), 4000) * 0.05).astype(np.float32)

# the hook: thought bubble, melting, drips
place(sfx, whoosh(0.3), F(31), 0.4); place(sfx, pop(900), F(35), 0.7); place(sfx, ting(2637, 0.5), F(40), 0.25)
place(sfx, gloop(0.9), F(106), 0.7)
for fr in (120, 134, 146): place(sfx, drip(), F(fr + 10), 0.6)
# outside, 1945
place(sfx, whoosh(0.5), F(158), 0.5); place(sfx, thunk(110, 0.3), F(170), 0.9)
for fr in (180, 196): place(sfx, tweet(), F(fr), 0.35)
# building tubes: soldering sizzle, a gleam
for fr in range(220, 296, 9): place(sfx, hiss(0.18, 4000), F(fr), 0.4)
place(sfx, whoosh(0.3), F(244), 0.3); place(sfx, ting(2793, 0.8), F(252), 0.45)
# the tube switches on and hums (through the egg, cut on the explosion; quieter in the complain cutaway)
place(sfx, clunk(), F(338), 0.9)
place(sfx, hum(F(886) - F(340)), F(340), 0.32)
sfx[int(F(525) * SR):int(F(579) * SR)] *= 0.35
# warm pocket and the melt
place(sfx, hiss(1.0, 2500), F(418), 0.45); place(sfx, thunk(320, 0.1), F(432), 0.3)
place(sfx, gloop(0.6), F(460), 0.6)
for fr in (470, 488, 503, 514): place(sfx, drip(), F(fr + 12), 0.55)
# complain: stomps and a steam whistle
for fr in (530, 538, 546): place(sfx, step(), F(fr), 0.8)
place(sfx, hiss(0.9, 2000), F(545), 0.5)
# the idea
place(sfx, ting(3136, 0.9), F(600), 0.5); place(sfx, thunk(900, 0.05), F(599), 0.3)
# popcorn: paper bag, sizzle building, pops
place(sfx, crinkle(0.6), F(638), 0.7); place(sfx, hiss(1.6, 2500), F(652), 0.35)
for fr in (668, 678, 686, 692): place(sfx, pop(), F(fr), 0.35)
for i in range(70): place(sfx, pop(), F(704) + (i / 70) ** 1.6 * (F(752) - F(704)), 0.35 + 0.4 * rng.random())
for fr in (705, 716, 726): place(sfx, pop(500), F(fr), 1.0); place(sfx, whoosh(0.25), F(fr), 0.3)
# the egg
place(sfx, whoosh(0.35), F(780), 0.4); place(sfx, ting(1046, 0.3), F(792), 0.5); place(sfx, thunk(400, 0.08), F(792), 0.4)
for fr in range(803, 826, 6): place(sfx, step(), F(fr), 0.6)
place(sfx, rattle(F(886) - F(834), 16), F(834), 0.35)
place(sfx, boom(), F(886), 1.0)
for fr in (896, 908, 920): place(sfx, splat(0.2), F(fr), 0.4); place(sfx, drip(), F(fr + 4), 0.4)
# inside the food
place(sfx, whoosh(0.6), F(934), 0.6)
for i in range(3): place(sfx, wub(1.4, 90 + 20 * i), F(978 + i * 9), 0.4)
for fr in range(988, 1090, 2): place(sfx, tick(), F(fr), 0.18)
place(sfx, kettle_whistle(F(1093) - F(1048)), F(1048), 0.5); place(sfx, hiss(1.5, 2200), F(1050), 0.4)
# the oven
place(sfx, whoosh(0.5), F(1090), 0.6); place(sfx, scrape(F(1134) - F(1098)), F(1098), 0.8)
place(sfx, whoosh(0.4), F(1136), 0.5)
place(sfx, thunk(55, 0.6), F(1146), 1.0); place(sfx, rumble(1.2), F(1146), 0.7)
place(sfx, boing(1.3, 160), F(1148), 0.5)
for i in range(10): place(sfx, tick(), F(1150) + i * 0.09, 0.3)
place(sfx, ting(2093, 0.7), F(1186), 0.35)
# the office and the sting
place(sfx, paper(0.4), F(1248), 0.6); place(sfx, ting(2637, 0.6), F(1238), 0.3)
place(sfx, rip(0.3), F(1277), 0.7); place(sfx, paper(0.3), F(1286), 0.5)
place(sfx, cricket(F(1318) - F(1294)), F(1294), 0.5)

for name, buf in (("music", music), ("sfx", sfx)):
    pk = float(np.abs(buf).max()) or 1.0
    with wave.open(f"{name}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(buf / pk, -1, 1) * 32767).astype(np.int16).tobytes())
print("stems ok", DUR)
