"""03 The Emu War: synthesized music bed + SFX as two stems (music.wav, sfx.wav). mix.py sets the levels.
Music: a pompous brass-and-snare army march, a sneaky pizzicato "heist" tune for the emus' plan, the march again
(faster) for the shooting that dies on the jammed gun, a weary waltz for the weeks, a low drum for "like tanks",
a sad trombone for "The army went home." and the sneaky tune again for "The emus stayed."""
import numpy as np, wave

SR = 48000
FRAMES = 1248
DUR = FRAMES / 30
N = int(DUR * SR)
rng = np.random.default_rng(32)
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
def woodblock(f0=1200):
    d = 0.08; n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f0 * t) * np.exp(-t * 60) + 0.3 * bp_fast(noise(d), 1500, 4000) * np.exp(-t * 80)).astype(np.float32)
def fade_out(buf, a, b):
    i0, i1 = int(a * SR), int(b * SR); buf[i0:i1] *= np.linspace(1, 0, i1 - i0)
def gate(buf, a, b):  # keep only [a, b)
    m = np.zeros(N, np.float32); m[int(a * SR):int(b * SR)] = 1; return buf * m

# 1) the army march: 0 -> 549 (brass + snare + tuba), a fanfare hit on "And two machine guns."
def march(t0, t1, bpm, gain=1.0):
    out = np.zeros(N, np.float32); beat = 60 / bpm; tt = t0; k = 0
    mel = [60, 64, 67, 72, 71, 67, 64, 67, 65, 69, 72, 69, 67, 64, 62, 60, 62, 65, 69, 74, 72, 69, 67, 65, 64, 67, 72, 67, 64, 62, 60, 60]
    bass = [36, 43, 36, 43, 41, 36, 43, 36]
    while tt < t1:
        if k % 2 == 0: place(out, brass([midi(bass[(k // 2) % 8])], beat * 0.45, 500), tt, 0.5 * gain)
        place(out, snare(0.08), tt, (0.12 if k % 2 else 0.2) * gain)
        if k % 4 == 0: place(out, bass_drum(), tt, 0.45 * gain)
        if k % 8 == 7: place(out, snare(0.06), tt + beat / 4, 0.1 * gain)
        if k >= 4: place(out, brass([midi(mel[k % 32] + 12)], beat / 2 * 0.85, 2200), tt, 0.22 * gain)
        k += 1; tt += beat / 2
    return out
music += gate(march(0.0, F(549), 112), 0, F(549))
place(music, brass([midi(48), midi(55), midi(60), midi(64)], 1.2, 2400), F(494), 0.5)
fade_out(music, F(538), F(549))

# 2) the emus' sneaky plan: 550 -> 747, staccato minor plucks + woodblock
def sneaky(t0, t1, bpm=128, gain=1.0):
    out = np.zeros(N, np.float32); b = 60 / bpm; tt = t0; k = 0
    line = [57, None, 60, 57, 63, 62, None, 57, 55, None, 57, 60, 59, None, 56, None]
    while tt < t1:
        n = line[k % 16]
        if n: place(out, pluck(midi(n), 0.22, 0.45), tt, 0.5 * gain)
        if k % 4 == 0: place(out, pluck(midi(45 if (k // 16) % 2 == 0 else 41), 0.4, 0.3), tt, 0.5 * gain)
        if k % 2 == 1: place(out, woodblock(1400 if k % 4 == 1 else 1000), tt, 0.25 * gain)
        k += 1; tt += b / 2
    return out
music += gate(sneaky(F(550), F(747)), F(550), F(747))
fade_out(music, F(740), F(747))

# 3) the shooting: the march again, faster, dying on the jammed gun (838)
music += gate(march(F(748), F(838), 140, 0.9), F(748), F(838))
fade_out(music, F(832), F(838))
# little sneaky sting for the winking emu
for i, m in enumerate([69, 72, 76]): place(music, pluck(midi(m), 0.25, 0.5), F(870) + i * 0.12, 0.45)

# 4) weeks go by: a weary waltz, 889 -> 1023
b3 = 60 / 84; tt = F(889); k = 0
wal = [(45, [57, 60, 64]), (40, [55, 59, 64]), (41, [57, 60, 65]), (40, [56, 59, 64])]
while tt < F(1023):
    root, ch = wal[(k // 3) % 4]
    place(music, pluck(midi(root), 0.6, 0.35) if k % 3 == 0 else pluck(midi(ch[k % 3]), 0.3, 0.4), tt, 0.4 if k % 3 == 0 else 0.22)
    if k % 6 == 0: place(music, brass([midi(ch[0] + 12)], b3 * 2.6, 1200), tt, 0.12)
    k += 1; tt += b3
fade_out(music, F(1015), F(1023))

# 5) "like tanks": low war drums and a rising brass line, 1024 -> 1148
tt = F(1030); k = 0
while tt < F(1146):
    place(music, bass_drum(), tt, 0.55 if k % 2 == 0 else 0.35); k += 1; tt += 60 / 100 / (2 if tt > F(1087) else 1)
for i, notes in enumerate([[43, 50], [45, 52], [47, 54], [48, 55, 60]]): place(music, brass([midi(m) for m in notes], 0.9, 1400), F(1040) + i * 0.9, 0.3)
fade_out(music, F(1140), F(1148))

# 6) "The army went home.": sad trombone, wah wah wah waaah
tt = F(1150)
for m, d in [(58, 0.42), (57, 0.42), (56, 0.42), (55, 1.2)]:
    n = int(d * SR); t = np.arange(n) / SR; wob = 1 + (0.012 * np.sin(2 * np.pi * 6 * t) if d > 1 else 0)
    ph = 2 * np.pi * midi(m) * np.cumsum(np.ones(n) * wob) / SR
    s = sum(np.sin((k + 1) * ph) / (k + 1) ** 1.1 for k in range(10)) * np.minimum(1, t / 0.04) * np.clip((d - t) / 0.12, 0, 1)
    place(music, lp_fast(s.astype(np.float32), 1100), tt, 0.35); tt += d

# 7) "The emus stayed.": the sneaky tune, ending on a button chord
music += gate(sneaky(F(1200), F(1236), 128), F(1200), F(1236))
place(music, brass([midi(57), midi(64), midi(69)], 0.5, 2000), F(1236), 0.45)

# ---------------- sfx ----------------
sfx = np.zeros(N, np.float32)

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

def boom_emu(d=0.9):  # the emu's low drumming "boom-boom-boom"
    n = int(d * SR); t = np.arange(n) / SR; s = np.zeros(n, np.float32)
    for i in range(4):
        j = int(i * 0.2 * SR); m = min(n - j, int(0.18 * SR)); tt = np.arange(m) / SR
        s[j:j + m] += (np.sin(2 * np.pi * 75 * tt) * np.sin(np.pi * tt / 0.18)).astype(np.float32)
    return s
def burst(d, rate=11):
    n = int(d * SR); s = np.zeros(n, np.float32)
    for i in range(int(d * rate)):
        j = int(i / rate * SR); g = gunshot()[: int(0.25 * SR)]; s[j:j + len(g)] += g[: n - j] * 0.55
    return s
def ricochet():
    d = 0.5; n = int(d * SR); t = np.arange(n) / SR; f = 3800 * np.exp(-t * 2.2) + 900
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5) * 0.5 + hp_fast(noise(d), 3000) * np.exp(-t * 60) * 0.6).astype(np.float32)
def engine(d):
    n = int(d * SR); t = np.arange(n) / SR
    pulse = (np.sin(2 * np.pi * 28 * t) > 0.6).astype(np.float32)
    return (lp_fast(noise(d) * pulse, 400) * 2.0 + np.sin(2 * np.pi * 56 * t) * 0.3).astype(np.float32) * np.minimum(1, t / 0.3) * np.minimum(1, (d - t) / 0.3)
def click(): return (hp_fast(noise(0.05), 2000) * np.exp(-np.arange(int(0.05 * SR)) / SR * 120)).astype(np.float32)

place(sfx, whoosh(0.5), F(4), 0.4); place(sfx, thunk(110, 0.3), F(18), 0.9)          # date sign pops up
place(sfx, thunk(300, 0.12), F(64), 0.5)                                              # major points
place(sfx, whoosh(0.4), F(108), 0.5); place(sfx, boom_emu(), F(116), 0.9)             # the emu pops up
place(sfx, ting(2093, 0.6), F(139), 0.3)                                              # blink
for fr in range(152, 300, 11): place(sfx, crunch(0.1), F(fr), 0.45)                  # pecking wheat
place(sfx, boom_emu(), F(200), 0.5); place(sfx, wind(F(311) - F(240), 900), F(240), 0.5)
place(sfx, hiss(0.9), F(340), 0.6)                                                    # steaming farmer
place(sfx, whoosh(0.6), F(398), 0.6); place(sfx, flutter(1.0), F(402), 0.35)          # the letter flies off
place(sfx, engine(F(493) - F(443)), F(443), 0.7)                                      # the truck
for fr in range(447, 490, 9): place(sfx, step(), F(fr), 0.45)
place(sfx, clang(0.6), F(505), 0.4); place(sfx, ting(2637, 0.8), F(507), 0.4); place(sfx, ting(2793, 0.8), F(530), 0.4)   # gleam
place(sfx, thunk(200, 0.2), F(552), 0.4); place(sfx, thunk(250, 0.2), F(580), 0.4)    # stick taps the board
for fr in range(612, 650, 4): place(sfx, step(), F(fr), 0.35)                        # scattering feet
place(sfx, whoosh(0.5), F(682), 0.4); place(sfx, ting(1760, 0.5), F(694), 0.3)        # lookout swivels
place(sfx, whoosh(1.0), F(708), 0.9)                                                  # ZOOM
for fr in range(710, 740, 3): place(sfx, step(), F(fr), 0.4)
place(sfx, burst(F(790) - F(750)), F(750), 0.8)                                       # RAT-A-TAT
place(sfx, burst(F(826) - F(791), 9), F(791), 0.45)
for fr in (796, 806, 818): place(sfx, ricochet(), F(fr), 0.4)
place(sfx, click(), F(838), 1.0); place(sfx, click(), F(846), 0.8); place(sfx, hiss(0.8), F(842), 0.4)   # jam
place(sfx, ting(3136, 0.8), F(880), 0.5)                                              # wink
place(sfx, wind(F(931) - F(889), 600), F(889), 0.6)
for fr in range(889, 931, 7): place(sfx, whoosh(0.18), F(fr), 0.25)                  # calendar pages
place(sfx, thunk(90, 0.35), F(985), 0.5); place(sfx, wind(F(1023) - F(990), 900), F(990), 0.5)
for fr in range(1092, 1140, 9): place(sfx, ricochet(), F(fr), 0.55)                  # PING PING
for fr in range(1090, 1140, 4): place(sfx, step(), F(fr), 0.4)
place(sfx, engine(F(1199) - F(1150)), F(1150), 0.5)
place(sfx, boom_emu(), F(1206), 0.6); place(sfx, ting(3136, 1.0), F(1229), 0.6)      # the wink

for name, buf in (("music", music), ("sfx", sfx)):
    pk = float(np.abs(buf).max()) or 1.0
    with wave.open(f"{name}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(buf / pk, -1, 1) * 32767).astype(np.int16).tobytes())
print("stems ok", DUR)
