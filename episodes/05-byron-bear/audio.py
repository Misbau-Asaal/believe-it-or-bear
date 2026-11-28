"""05 Byron's Bear: synthesized music bed + SFX as two stems (music.wav, sfx.wav). mix.py sets the levels.
Music: a dainty harpsichord minuet (plucked bass, triple time) for Cambridge, two stern trombone notes for "no dogs",
tiptoe pizzicato while Byron reads the rules again (stamp hit on "Banned", a ding for the idea), a barrel-organ waltz at
the fair, the minuet again for the walk, a brass stab when the students drop their books, a plodding march for the
officials, a snare roll for "his answer ready", then the sting: silence, a low hit, and a fanfare as the mortarboard lands;
a ticking clock and a quiet harpsichord tag in the exam hall, ending on one chord for the wink."""
import numpy as np, wave

SR = 48000
FRAMES = 1173
DUR = FRAMES / 30
N = int(DUR * SR)
rng = np.random.default_rng(51)
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


def harpsi(f, dur=0.5):
    """bright plucked string with a quick decay and a faint second string a hair sharp"""
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum((0.72 ** k) * np.sin(2 * np.pi * f * (k + 1) * (1 + 0.0004 * k * k) * t) for k in range(10))
    s += 0.35 * sum((0.6 ** k) * np.sin(2 * np.pi * f * 1.003 * (k + 1) * t) for k in range(6))
    return hp_fast((s * env(n, 0.002, dur * 0.3)).astype(np.float32) * 0.5, 120)
def organ(fs, dur):
    """barrel organ: a few sine stops with a little tremolo"""
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in fs: s += np.sin(2 * np.pi * f * t) + 0.5 * np.sin(4 * np.pi * f * t) + 0.25 * np.sin(6 * np.pi * f * t)
    a = np.minimum(1, t / 0.02) * np.clip((dur - t) / 0.05, 0, 1) * (1 + 0.15 * np.sin(2 * np.pi * 6.5 * t))
    return (s * a / (1.75 * len(fs))).astype(np.float32)
def roll(d, lo=0.2, hi=1.0):
    out = np.zeros(int(d * SR), np.float32); tt = 0.0; k = 0
    while tt < d - 0.07:
        g = lo + (hi - lo) * tt / d; sn = snare(0.07); i = int(tt * SR); out[i:i + len(sn)] += sn[: len(out) - i] * g * (0.8 + 0.2 * (k % 2)); tt += 0.045; k += 1
    return out

music = np.zeros(N, np.float32)

# 1) the minuet: harpsichord in 3/4 (bass on the downbeat, chords on 2 and 3, a melody of eighths)
def minuet(t0, t1, bpm=126, gain=1.0, melody=True):
    out = np.zeros(N, np.float32); b = 60 / bpm; k = 0; tt = t0
    roots = [55, 50, 55, 48, 55, 50, 52, 50]                      # G D G C G D Em D
    chords = {55: [67, 71, 74], 50: [66, 69, 74], 48: [64, 67, 72], 52: [64, 67, 71]}
    mel = [79, 78, 79, 81, 83, 79, 81, 79, 78, 76, 74, 76, 79, 76, 72, 74, 76, 72, 74, 76, 78, 74, 76, 78, 79, 81, 83, 81, 79, 78, 76, 74, 76, 78, 79, None, 79, 81, 79, 78, 76, 74, 74, 76, 74, 72, 71, None]
    while tt < t1:
        bar, beat = k // 3, k % 3; r = roots[bar % 8]
        if beat == 0: place(out, harpsi(midi(r - 12), 0.7), tt, 0.55 * gain)
        else: [place(out, harpsi(midi(m), 0.35), tt, 0.16 * gain) for m in chords[r]]
        if melody:
            for h in range(2):
                m = mel[(k * 2 + h) % len(mel)]
                if m: place(out, harpsi(midi(m), 0.3), tt + h * b / 2, 0.3 * gain)
        k += 1; tt += b
    return out
music += gate(minuet(0.0, F(268)), 0, F(268))
place(music, brass([midi(55), midi(59), midi(62), midi(67)], 0.6, 2400), F(129), 0.3)        # "In 1805"
fade_out(music, F(262), F(268), False)
music += gate(minuet(F(269), F(318), 120, 0.85), F(269), F(318)); fade_out(music, F(312), F(318), False)
place(music, harpsi(midi(91), 0.8), F(282), 0.25); place(music, harpsi(midi(95), 0.8), F(288), 0.25)   # "loved animals" sparkle

# 2) the rules: two stern trombone notes, the second on "no dogs"
for m, d, at in [(43, 0.7, 326), (38, 1.0, 377)]: place(music, trombone(m, d, 0.01), F(at), 0.4)
place(music, pad([midi(38), midi(45)], F(415) - F(330)), F(330), 0.35)

# 3) reading again: tiptoe pizzicato (minor), a stamp hit on "Banned", a question, the idea
b = 60 / 132; tt = F(418); k = 0
line = [62, None, 65, None, 69, 68, 69, None, 62, None, 65, None, 70, 69, 67, None]
while tt < F(596):
    m = line[k % 16]
    if m and not (F(498) < tt < F(512)): place(music, pluck(midi(m), 0.2, 0.5), tt, 0.38)
    if k % 4 == 0: place(music, pluck(midi(38 if (k // 8) % 2 == 0 else 41), 0.35, 0.3), tt, 0.45)
    if k % 2 == 1: place(music, woodblock(1500 if k % 4 == 1 else 1100), tt, 0.14)
    k += 1; tt += b / 2
place(music, brass([midi(38), midi(45), midi(50)], 0.5, 1600), F(500), 0.5)                  # BANNED
for i, m in enumerate([79, 83, 86]): place(music, harpsi(midi(m), 0.6), F(572) + i * 0.07, 0.3)   # the idea
fade_out(music, F(592), F(597))

# 4) the fair: a barrel-organ waltz
b = 60 / 168; tt = F(598); k = 0
walz = [72, 76, 79, 76, 74, 77, 81, 77, 76, 79, 84, 79, 74, 77, 79, 74]
while tt < F(655):
    beat = k % 3; r = [48, 43, 48, 43][(k // 3) % 4]
    if beat == 0: place(music, organ([midi(r)], b * 0.8), tt, 0.4)
    else: place(music, organ([midi(r + 16), midi(r + 19)], b * 0.5), tt, 0.18)
    place(music, organ([midi(walz[k % 16])], b * 0.9), tt, 0.22)
    k += 1; tt += b
place(music, brass([midi(60), midi(64), midi(67), midi(72)], 0.5, 2600), F(626), 0.3)      # SOLD
fade_out(music, F(650), F(655))

# 5) the walk: the minuet again, a little perkier; it stops for "just like a dog", then a happy little tag
music += gate(minuet(F(656), F(726), 132, 0.95), F(656), F(726)); fade_out(music, F(720), F(726), False)
for i, m in enumerate([74, 79, 83, 86]): place(music, harpsi(midi(m), 0.5), F(730) + i * 0.09, 0.28)
music += gate(minuet(F(744), F(774), 126, 0.7, melody=False), F(744), F(774)); fade_out(music, F(768), F(774), False)

# 6) the students: a brass stab when the books drop
place(music, brass([midi(49), midi(55), midi(58), midi(64)], 0.7, 2200), F(786), 0.42)

# 7) the officials: a plodding march (low brass on each step), tension pad, rising
b = 60 / 104; tt = F(814); k = 0
while tt < F(924):
    r = [41, 41, 43, 44][(k // 2) % 4]
    place(music, brass([midi(r)], b * 0.45, 700), tt, 0.5); place(music, kick(), tt, 0.25)
    if k % 2 == 1: place(music, snare(0.05), tt, 0.08)
    k += 1; tt += b
place(music, pad([midi(53), midi(56)], F(924) - F(860)), F(860), 0.3)

# 8) his answer ready: a snare roll building, cut dead before the line
place(music, roll(F(980) - F(930), 0.1, 0.8), F(930), 0.55)
music[int(F(980) * SR):int(F(984) * SR)] = 0

# 9) the sting: a low hit on "He should sit", then a fanfare as the mortarboard lands
hit = np.arange(int(1.4 * SR)) / SR
place(music, (np.sin(2 * np.pi * 41 * hit) * np.exp(-hit * 2.4) + lp_fast(noise(1.4), 120) * np.exp(-hit * 6) * 0.6).astype(np.float32), F(984), 0.9)
for at, ch, d in [(1012, [60, 64, 67], 0.25), (1020, [60, 64, 67], 0.15), (1025, [65, 69, 72], 0.25), (1032, [67, 71, 74, 79], 0.9)]: place(music, brass([midi(m) for m in ch], d, 2800), F(at), 0.36)
fade_out(music, F(1036), F(1044))

# 10) the exam hall: a quiet harpsichord tag over the clock, ending on one chord for the wink
music += gate(minuet(F(1050), F(1146), 100, 0.55), F(1050), F(1146)); fade_out(music, F(1138), F(1146), False)
for m in [67, 71, 74, 79]: place(music, harpsi(midi(m), 1.4), F(1150), 0.3)
place(music, harpsi(midi(43), 1.6), F(1150), 0.5)
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



def yip(f0=900):
    d = 0.16; n = int(d * SR); t = np.arange(n) / SR; f = f0 * (1.3 - 0.5 * t / d)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 0.5 * 0.7 + bp_fast(noise(d), 800, 3000) * np.exp(-t * 30) * 0.3).astype(np.float32)
def pant(d, rate=4.5):
    n = int(d * SR); t = np.arange(n) / SR
    return (bp_fast(noise(d), 600, 2600) * (0.5 + 0.5 * np.sin(2 * np.pi * rate * t)) ** 3 * 0.5).astype(np.float32)
def clink(f0=None):
    d = 0.12; n = int(d * SR); t = np.arange(n) / SR; f0 = f0 or 2500 + 2000 * rng.random()
    return (sum(np.sin(2 * np.pi * f0 * r * t) * np.exp(-t * (60 + 20 * r)) for r in (1, 1.47, 2.09)) * 0.25).astype(np.float32)
def jingle(d, rate=10):
    out = np.zeros(int(d * SR), np.float32)
    for i in range(int(d * rate)):
        c = clink(); j = int((i + 0.3 * rng.random()) / rate * SR); out[j:j + len(c)] += c[: len(out) - j] * (0.5 + 0.5 * rng.random())
    return out
def bell(f0=1568, d=1.2):
    n = int(d * SR); t = np.arange(n) / SR
    return (sum(np.sin(2 * np.pi * f0 * r * t) * np.exp(-t * k) for r, k in [(1, 3), (2.4, 5), (3.0, 7), (4.2, 9)]) * 0.25).astype(np.float32)
def crowd(d):
    n = int(d * SR); t = np.arange(n) / SR
    return (bp_fast(noise(d), 300, 2200) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t) * np.sin(2 * np.pi * 1.9 * t)) * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3) * 0.35).astype(np.float32)
def scratch(d):
    n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(noise(d), 3500) * (0.3 + 0.7 * (np.sin(2 * np.pi * 7 * t) > 0)) * 0.3).astype(np.float32)
def munch():
    d = 0.09; n = int(d * SR); t = np.arange(n) / SR
    return (bp_fast(noise(d), 400, 2500) * np.exp(-t * 50) * 0.6).astype(np.float32)
def paw():
    return thunk(60, 0.18) * 0.5
def grunt(f0=110, d=0.35):
    n = int(d * SR); t = np.arange(n) / SR; f = f0 * (1 + 0.25 * np.sin(np.pi * t / d))
    return lp_fast((np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.sin(np.pi * t / d) * 0.25).astype(np.float32) + 0.2 * lp_fast(noise(d), 400), 900)

# the hook: the bear slides in
place(sfx, whoosh(0.35), F(72), 0.5); place(sfx, boing(0.8, 220), F(82), 0.35); place(sfx, grunt(130, 0.4), F(92), 0.5)
# Cambridge, 1805
place(sfx, whoosh(0.5), F(116), 0.4); place(sfx, thunk(110, 0.3), F(132), 0.9)
for fr in (150, 176, 214): place(sfx, tweet(), F(fr), 0.3)
for fr in range(136, 266, 15): place(sfx, step(), F(fr), 0.4)
# the dog
for fr in (279, 290): place(sfx, yip(1000 if fr == 279 else 1200), F(fr), 0.6)
place(sfx, pant(1.0), F(292), 0.35); place(sfx, ting(2637, 0.5), F(283), 0.2)
# the rules: a sharp tap on the board
place(sfx, thunk(700, 0.06), F(334), 0.5); place(sfx, thunk(700, 0.06), F(378), 0.6)
# reading again: the magnifier, "Dogs?", the stamp, the scan, the idea
place(sfx, whoosh(0.3), F(428), 0.35); place(sfx, ting(3136, 0.5), F(470), 0.35)
place(sfx, thunk(85, 0.5), F(500), 1.0); place(sfx, thunk(220, 0.15), F(500), 0.5)
place(sfx, whoosh(0.4), F(525), 0.4); place(sfx, boing(0.7, 300), F(532), 0.3)
place(sfx, ting(3136, 0.9), F(572), 0.5); place(sfx, thunk(900, 0.05), F(571), 0.3)
# the fair: crowd, coins, a bell for SOLD
place(sfx, crowd(F(655) - F(597)), F(597), 0.6)
place(sfx, jingle(0.8, 14), F(608), 0.5); place(sfx, bell(1568, 1.2), F(628), 0.4)
# the walk: chain jingling in time, soft paws, then panting
place(sfx, jingle(F(726) - F(656), 7), F(656), 0.45)
for fr in range(660, 724, 10): place(sfx, paw(), F(fr), 0.45)
for fr in range(664, 724, 15): place(sfx, step(), F(fr), 0.3)
place(sfx, thunk(70, 0.3), F(734), 0.5); place(sfx, pant(1.2, 5), F(738), 0.45); place(sfx, grunt(140, 0.3), F(752), 0.4)
# the students: books hit the ground
for fr in (800, 804, 807): place(sfx, thunk(160, 0.18), F(fr), 0.7)
# the officials: footsteps, then the query
for fr in range(816, 852, 9): place(sfx, step(), F(fr), 0.6)
place(sfx, boing(0.9, 260), F(876), 0.35)
# the answer: a twinkle
place(sfx, ting(4186, 0.6), F(942), 0.35)
# the mortarboard drops and lands
place(sfx, whoosh(0.4), F(1002), 0.5); place(sfx, pop(700), F(1012), 0.8); place(sfx, ting(2637, 0.7), F(1016), 0.3)
# the exam hall: a clock, chewing, scratching, the wink
place(sfx, whoosh(0.5), F(1042), 0.5)
for i in range(int((F(1172) - F(1046)) / 0.5)): place(sfx, woodblock(1900 if i % 2 else 1500), F(1046) + i * 0.5, 0.14)
for fr in range(1052, 1082, 6): place(sfx, munch(), F(fr), 0.5)
place(sfx, scratch(F(1138) - F(1086)), F(1086), 0.5)
place(sfx, ting(3520, 0.6), F(1148), 0.4)

for name, buf in (("music", music), ("sfx", sfx)):
    pk = float(np.abs(buf).max()) or 1.0
    with wave.open(f"{name}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(buf / pk, -1, 1) * 32767).astype(np.int16).tobytes())
print("stems ok", DUR)
