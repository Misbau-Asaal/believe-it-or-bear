"""02 The Pig War: synthesized music bed + SFX as two stems (music.wav, sfx.wav). mix.py sets the levels.
Music: a fife-and-drum march that stops dead on "Nobody fired.", a lighter camp tune for the twelve years,
a slow solemn brass line for the death toll, and silence for "One pig." (just the oink and a chime)."""
import numpy as np, wave

SR = 48000
FRAMES = 1266
DUR = FRAMES / 30
N = int(DUR * SR)
rng = np.random.default_rng(12)
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

# ---------------- instruments ----------------
def fife(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.15)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    s = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
    s = s + 0.04 * lp_fast(noise(dur), 3000)                         # breath
    a = np.minimum(1, t / 0.02) * np.clip((dur - t) / 0.05, 0, 1)
    return (s * a).astype(np.float32)
def brass(fs, dur, cut=1600):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in fs:
        ph = 2 * np.pi * f * t + 0.003 * np.sin(2 * np.pi * 5 * t)
        s += sum(np.sin((k + 1) * ph) / (k + 1) ** 1.3 for k in range(8))
    a = np.minimum(1, t / 0.08) * np.clip((dur - t) / 0.2, 0, 1)
    return lp_fast((s * a).astype(np.float32), cut) / len(fs)
def pluck(f, dur=0.3, bright=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum((bright ** k) * np.sin(2 * np.pi * f * (k + 1) * t) / (k + 1) for k in range(6))
    return (s * env(n, 0.003, dur * 0.35)).astype(np.float32)
def snare(d=0.12):
    n = int(d * SR); t = np.arange(n) / SR
    return hp_fast((rng.standard_normal(n) * np.exp(-t * 35) * 0.7 + np.sin(2 * np.pi * 200 * t) * np.exp(-t * 25) * 0.4).astype(np.float32), 400)
def bass_drum():
    n = int(0.35 * SR); t = np.arange(n) / SR; f = 48 + 60 * np.exp(-t * 25)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)).astype(np.float32)

music = np.zeros(N, np.float32)

# 1) march: 0 -> 781 ("Nobody fired." cuts it dead)
BPM = 116; beat = 60 / BPM
melody = [67, 67, 71, 74, 72, 71, 69, 67, 66, 69, 72, 71, 69, 67, 66, 62,   # 4 bars of eighth notes, G major
          67, 69, 71, 72, 74, 76, 74, 71, 72, 71, 69, 67, 69, 66, 67, 67]
bassline = [43, 50, 43, 50, 38, 45, 43, 50]
MARCH_END = F(781)
tt = 0.0; k = 0
while tt < MARCH_END:
    bar = k // 8
    if k % 2 == 0: place(music, pluck(midi(bassline[(k // 2) % 8]), 0.3, 0.45), tt, 0.35)
    if k % 4 == 0: place(music, bass_drum(), tt, 0.5)
    place(music, snare(0.09), tt, 0.16 if k % 2 else 0.24)
    if k % 8 == 6: place(music, snare(0.07), tt + beat / 4, 0.12)
    if bar >= 1: place(music, fife(midi(melody[k % 32] + 12), beat / 2 * 0.92), tt, 0.16)
    k += 1; tt += beat / 2
i0 = int((MARCH_END - 0.03) * SR); i1 = int((MARCH_END + 0.05) * SR)
music[i0:i1] *= np.linspace(1, 0, i1 - i0); music[i1:] = 0

# 2) camp years: 821 -> 1167, lazy plucks + soft fife, slower
BPM2 = 88; b2 = 60 / BPM2; t0 = F(821); t1 = F(1167)
tune2 = [74, 71, 72, 69, 71, 67, 69, 66, 67, 64, 66, 62, 64, 66, 67, 69]
chords2 = [(55, [67, 71, 74]), (52, [64, 67, 71]), (48, [64, 67, 72]), (50, [62, 66, 69])]
tt = t0; k = 0
while tt < t1:
    root, ch = chords2[(k // 4) % 4]
    place(music, pluck(midi(root), 0.5, 0.4), tt, 0.3)
    place(music, pluck(midi(ch[k % 3]), 0.35, 0.55), tt + b2 / 2, 0.14)
    if k % 2 == 0: place(music, fife(midi(tune2[(k // 2) % 16] + 12), b2 * 0.9), tt, 0.09)
    k += 1; tt += b2
i0 = int((t1 - 0.4) * SR); i1 = int(t1 * SR); music[i0:i1] *= np.linspace(1, 0, i1 - i0); music[i1:] = 0

# 3) solemn brass for the death toll: 1168 -> about 1236, then silence for "One pig."
tt = F(1168); seq = [([55, 59, 62], 1.0), ([52, 55, 59], 1.0), ([48, 52, 55], 1.0), ([50, 54, 57], 1.2)]
for notes, d in seq:
    place(music, brass([midi(m) for m in notes], d * 0.98, 1200), tt, 0.16); tt += d
place(music, brass([midi(43), midi(50), midi(55)], 0.9, 900), tt, 0.12)
i0 = int(F(1236) * SR); music[i0:] = 0

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
def oink(d=0.22, f0=170):
    n = int(d * SR); t = np.arange(n) / SR
    f = f0 * (1 + 0.5 * np.sin(np.pi * t / d)); ph = 2 * np.pi * np.cumsum(f) / SR
    saw = (2 * (ph / (2 * np.pi) % 1) - 1).astype(np.float32)
    s = bp_fast(saw, 500, 1400) + 0.3 * bp_fast(noise(d), 600, 1600) * np.abs(saw)
    return (s * np.sin(np.pi * t / d) ** 0.7).astype(np.float32)
def oinks():
    s = np.zeros(int(0.6 * SR), np.float32); a = oink(0.22, 170); s[:len(a)] += a
    b = oink(0.2, 190); i = int(0.3 * SR); s[i:i + len(b)] += b; return s
def crunch(d=0.12):
    n = int(d * SR); t = np.arange(n) / SR
    clicks = (rng.random(n) < 0.02).astype(np.float32) * rng.standard_normal(n).astype(np.float32)
    return (bp_fast(clicks + 0.2 * noise(d), 800, 5000) * np.exp(-t * 20)).astype(np.float32)
def step(): return thunk(75, 0.12) * 0.6
def gunshot():
    d = 1.4; n = int(d * SR); t = np.arange(n) / SR
    crack = hp_fast(noise(d), 1200) * np.exp(-t * 40) * 1.4
    boom = lp_fast(noise(d), 300) * np.exp(-t * 6) * 2.0
    echo = np.zeros(n, np.float32); j = int(0.18 * SR); echo[j:] = (lp_fast(noise(d), 900) * np.exp(-t * 5))[: n - j] * 0.5
    return (crack + boom + echo).astype(np.float32)
def flutter(d=1.2):
    n = int(d * SR); t = np.arange(n) / SR
    am = (np.sin(2 * np.pi * 14 * t) > 0.3).astype(np.float32)
    return (bp_fast(noise(d), 400, 3000) * am * np.exp(-t * 1.5) * 0.7).astype(np.float32)
def hiss(d=0.8):
    n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(noise(d), 3000) * np.sin(np.pi * t / d) * 0.35).astype(np.float32)
def clang(d=0.6):
    n = int(d * SR); t = np.arange(n) / SR
    return (sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in [(523, 6), (787, 8), (1180, 10), (1650, 12)]) * 0.25 + hp_fast(noise(d), 2000) * np.exp(-t * 30) * 0.4).astype(np.float32)
def waves(d):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 700) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.18 * t) ** 2) * np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.8)).astype(np.float32)
def creak(d=0.6, f0=120):
    n = int(d * SR); t = np.arange(n) / SR
    ph = np.cumsum(f0 * (1 + 0.35 * np.sin(2 * np.pi * 1.3 * t / d))) / SR; pulses = (np.mod(ph, 1) < 0.08).astype(np.float32)
    return (hp_fast(lp_fast(pulses * (0.6 + 0.4 * rng.random(n).astype(np.float32)), 2200) * np.sin(np.pi * t / d), 200) * 2.5).astype(np.float32)
def bell(f0=880, d=1.6):
    n = int(d * SR); t = np.arange(n) / SR
    return (sum(np.sin(2 * np.pi * f0 * m * t) * np.exp(-t * k) for m, k in [(1, 2), (2.76, 3.5), (5.4, 6)]) * 0.3).astype(np.float32)
def cricket(d):
    n = int(d * SR); t = np.arange(n) / SR
    gate = ((t * 3.2) % 1 < 0.35).astype(np.float32) * (np.sin(2 * np.pi * 45 * t) > 0).astype(np.float32)
    return (np.sin(2 * np.pi * 4300 * t) * gate * 0.25).astype(np.float32)
def tweet():
    d = 0.3; n = int(d * SR); t = np.arange(n) / SR
    f = 3200 + 1200 * np.sin(np.pi * t / d * 3)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.4).astype(np.float32)
def wind(d, cut=600):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), cut) * (0.4 + 0.3 * np.sin(2 * np.pi * 0.3 * t)) * np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.8)).astype(np.float32)
def rumble(d):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 140) * 2.5 * np.minimum(1, t / (d * 0.7))).astype(np.float32)
def drumroll(d):
    n = int(d * SR); s = np.zeros(n, np.float32); rate = 18
    for i in range(int(d * rate)):
        j = int(i / rate * SR); g = snare(0.06); s[j:j + len(g)] += g[: n - j] * (0.3 + 0.7 * i / (d * rate))
    return s

place(sfx, whoosh(0.6), F(2), 0.4)                                   # hook
place(sfx, oinks(), F(52), 0.8)                                      # the pig wanders in
for fr in range(86, 128, 9): place(sfx, crunch(), F(fr), 0.7)        # chewing
place(sfx, oink(0.25, 200), F(130), 0.6)
place(sfx, whoosh(0.4), F(150), 0.5); place(sfx, thunk(110, 0.3), F(164), 0.9)   # date sign pops up
for fr in range(198, 252, 9): place(sfx, step(), F(fr), 0.5)         # farmer walks to the garden
for fr in range(200, 320, 14): place(sfx, crunch(0.1), F(fr), 0.35)  # the pig still digging
place(sfx, ting(1760, 0.8), F(262), 0.5)                             # "!"
place(sfx, hiss(0.9), F(292), 0.6)                                   # steam
place(sfx, thunk(300, 0.12), F(326), 0.5)                            # rifle raised (click)
place(sfx, gunshot(), F(340), 1.0); place(sfx, flutter(1.3), F(342), 0.8)
for fr in (358, 366): place(sfx, step(), F(fr), 0.5)                 # the trader storms in
place(sfx, whoosh(0.4), F(421), 0.5); place(sfx, clang(0.6), F(432), 0.7); place(sfx, hiss(1.2), F(440), 0.5)
for fr in range(486, 536, 8): place(sfx, step(), F(fr), 0.7)         # marching boots
place(sfx, waves(F(597) - F(537)), F(537), 0.5); place(sfx, creak(0.8, 110), F(548), 0.6); place(sfx, bell(880), F(566), 0.5)
place(sfx, whoosh(0.8), F(598), 0.5); place(sfx, drumroll(F(780) - F(700)), F(700), 0.45); place(sfx, rumble(F(780) - F(640)), F(640), 0.4)
place(sfx, cricket(F(820) - F(783)), F(783), 0.6); place(sfx, tweet(), F(803), 0.6)   # "Nobody fired."
place(sfx, wind(F(870) - F(821), 900), F(821), 0.5); place(sfx, wind(F(918) - F(871), 500), F(871), 0.6)
place(sfx, whoosh(0.7), F(919), 0.5); place(sfx, whoosh(0.5), F(962), 0.6)
place(sfx, thunk(70, 0.4), F(996), 0.6)                              # "Finally,"
place(sfx, thunk(95, 0.35), F(1122), 1.0); place(sfx, ting(2349, 1.0), F(1124), 0.5)  # STAMP
place(sfx, oink(0.24, 210), F(1244), 0.7); place(sfx, ting(3136, 1.2), F(1252), 0.6)  # "One pig." + wink

for name, buf in (("music", music), ("sfx", sfx)):
    pk = float(np.abs(buf).max()) or 1.0
    with wave.open(f"{name}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(buf / pk, -1, 1) * 32767).astype(np.int16).tobytes())
print("stems ok", DUR)
