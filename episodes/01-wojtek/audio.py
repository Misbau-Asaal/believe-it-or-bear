"""01 Wojtek: synthesized music bed + SFX as two stems (music.wav, sfx.wav). mix.py sets the levels.
Music: a proud brass march for the bear with a rank, a music box for the cub, a bouncy camp tune, a brass stab on
"no pets", a cheeky pluck tune for the enlistment, low war drums at Monte Cassino that build as Wojtek stands up,
the march again (heroic) while he carries the crates, a fanfare for the promotion, a stern tuba for the rule,
and the cheeky tune for the punchline."""
import numpy as np, wave

SR = 48000
FRAMES = 1198
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

def musicbox(t0, t1, gain=1.0):
    out = np.zeros(N, np.float32); b = 60 / 96; tt = t0; k = 0
    tune = [72, 76, 79, 84, 83, 79, 76, 79, 77, 81, 84, 81, 79, 76, 74, 72]
    while tt < t1:
        place(out, pluck(midi(tune[k % 16] + 12), 0.6, 0.25), tt, 0.35 * gain)
        if k % 2 == 0: place(out, pluck(midi([48, 53, 55, 48][(k // 4) % 4] + 12), 0.8, 0.3), tt, 0.25 * gain)
        k += 1; tt += b / 2
    return out
def bouncy(t0, t1, gain=1.0):
    out = np.zeros(N, np.float32); b = 60 / 132; tt = t0; k = 0
    bass = [43, 50, 47, 50, 48, 55, 52, 55]; mel = [67, None, 71, 74, None, 72, 71, 69]
    while tt < t1:
        place(out, pluck(midi(bass[k % 8]), 0.3, 0.4), tt, 0.5 * gain)
        if mel[k % 8]: place(out, pluck(midi(mel[k % 8] + 12), 0.2, 0.5), tt, 0.3 * gain)
        if k % 2 == 1: place(out, woodblock(1300), tt, 0.25 * gain)
        k += 1; tt += b / 2
    return out

def roll(d):
    n = int(d * SR); s = np.zeros(n, np.float32); rate = 18
    for i in range(int(d * rate)):
        j = int(i / rate * SR); g = snare(0.06); s[j:j + len(g)] += g[: n - j] * (0.3 + 0.7 * i / (d * rate))
    return s

# 1) the bear with a rank: proud march 0 -> 110
music += gate(march(0.0, F(110), 112), 0, F(110)); fade_out(music, F(102), F(110))
# 2) the cub: music box 111 -> 335
music += gate(musicbox(F(111), F(335)), F(111), F(335)); fade_out(music, F(326), F(335))
# 3) growing up in camp: bouncy 336 -> 433
music += gate(bouncy(F(336), F(433)), F(336), F(433)); fade_out(music, F(425), F(433))
# 4) the order: low pad, then a brass stab on "no pets"
place(music, brass([midi(38), midi(45)], F(474) - F(436), 700), F(436), 0.25)
place(music, brass([midi(50), midi(53), midi(56)], 1.2, 2200), F(476), 0.55)
place(music, brass([midi(38), midi(44)], 1.0, 600), F(505), 0.3)
# 5) the enlistment and the boat: cheeky plucks 544 -> 708
music += gate(sneaky(F(544), F(708), 132), F(544), F(708)); fade_out(music, F(700), F(708))
# 6) Monte Cassino: war drums and a low minor brass line 709 -> 896, building to the lift
tt = F(712); k = 0
while tt < F(878):
    place(music, bass_drum(), tt, 0.6 if k % 2 == 0 else 0.35); k += 1; tt += 60 / (96 if tt < F(822) else 120) / 2
for i, notes in enumerate([[38, 45], [36, 43], [34, 41], [33, 40]]): place(music, brass([midi(m) for m in notes], 1.4, 900), F(712) + i * 1.5, 0.3)
place(music, roll(F(878) - F(850)), F(850), 0.5)
place(music, brass([midi(48), midi(55), midi(60), midi(64)], 1.0, 2400), F(878), 0.5)
# 7) he carries the crates: the march, heroic 897 -> 981
music += gate(march(F(890), F(981), 120, 1.0), F(890), F(981)); fade_out(music, F(975), F(981))
# 8) promotion fanfare 982 -> 1058
for i, (notes, d) in enumerate([([55, 59, 62], 0.5), ([55, 59, 62], 0.25), ([60, 64, 67], 0.9), ([62, 65, 69], 0.5), ([64, 67, 72], 1.4)]):
    place(music, brass([midi(m) for m in notes], d * 0.95, 2400), F(1006) + sum(x[1] for x in [([], 0.5), ([], 0.25), ([], 0.9), ([], 0.5)][:i]), 0.45)
# 9) "The rule said no pets.": a stern tuba
for i, m in enumerate([43, 43, 38, 43]): place(music, brass([midi(m - 12), midi(m)], 0.35, 500), F(1062) + i * 0.4, 0.45)
# 10) the punchline: cheeky plucks, a button chord
music += gate(sneaky(F(1112), F(1186), 132), F(1112), F(1186))
place(music, brass([midi(55), midi(62), midi(67)], 0.5, 2200), F(1186), 0.5)

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
def step(): return thunk(75, 0.12) * 0.6

def squeak(f0=1400, d=0.25):
    n = int(d * SR); t = np.arange(n) / SR; f = f0 * (1 + 0.4 * np.sin(np.pi * t / d))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.5).astype(np.float32)
def cheer(d=1.2):
    n = int(d * SR); t = np.arange(n) / SR
    return (bp_fast(noise(d), 500, 2500) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t)) * np.minimum(1, t / 0.1) * np.exp(-t * 1.5)).astype(np.float32)
def horn(d=1.6, f0=110):
    n = int(d * SR); t = np.arange(n) / SR; ph = 2 * np.pi * f0 * t
    s = sum(np.sin((k + 1) * ph) / (k + 1) for k in range(10)) + 0.6 * sum(np.sin((k + 1) * ph * 1.26) / (k + 1) for k in range(8))
    return lp_fast((s * np.minimum(1, t / 0.08) * np.clip((d - t) / 0.2, 0, 1)).astype(np.float32), 900) * 0.4
def growl(d=0.6):
    n = int(d * SR); t = np.arange(n) / SR; f = 90 + 30 * np.sin(np.pi * t / d)
    s = (2 * ((np.cumsum(f) / SR) % 1) - 1).astype(np.float32)
    return (lp_fast(s * (0.7 + 0.3 * rng.random(n).astype(np.float32)), 700) * np.sin(np.pi * t / d)).astype(np.float32)
def crackle(d):
    n = int(d * SR); s = ((rng.random(n) < 0.004).astype(np.float32) * rng.standard_normal(n).astype(np.float32))
    return hp_fast(s, 1500) * 0.8
def boomfar(d=1.8):
    n = int(d * SR); t = np.arange(n) / SR
    return (lp_fast(noise(d), 180) * np.exp(-t * 2.5) * 3.0).astype(np.float32)

place(sfx, whoosh(0.4), F(60), 0.4); place(sfx, ting(2637, 0.8), F(66), 0.5)          # the salute, stripes glint
place(sfx, whoosh(0.5), F(112), 0.4); place(sfx, thunk(110, 0.3), F(124), 0.9)        # IRAN 1942 sign
place(sfx, squeak(1500), F(150), 0.5); place(sfx, squeak(1700), F(190), 0.5)          # the cub
for fr in range(162, 200, 9): place(sfx, step(), F(fr), 0.4)
place(sfx, ting(2093, 0.8), F(206), 0.4); place(sfx, ting(2349, 0.8), F(240), 0.4)    # hearts
place(sfx, squeak(1600), F(252), 0.5)
place(sfx, cheer(1.4), F(288), 0.8)                                                   # "Wojtek!"
for fr in range(340, 385, 10): place(sfx, thunk(80, 0.25), F(fr), 0.6)               # wrestling thuds
place(sfx, growl(0.7), F(350), 0.5); place(sfx, cheer(1.0), F(360), 0.5)
place(sfx, crackle(F(433) - F(386)), F(386), 0.6)                                      # campfire
place(sfx, horn(1.4, 98), F(436), 0.6)                                                  # ship horn at the dock
place(sfx, thunk(140, 0.3), F(478), 0.6); place(sfx, whoosh(0.4), F(488), 0.4)
place(sfx, ting(1568, 0.6), F(503), 0.4)                                               # !?
place(sfx, thunk(70, 0.4), F(580), 1.0); place(sfx, ting(2793, 0.8), F(582), 0.4)      # STAMP
place(sfx, whoosh(0.5), F(602), 0.4); place(sfx, ting(3136, 0.8), F(616), 0.4)        # ENLISTED
place(sfx, horn(1.8, 110), F(670), 0.7); place(sfx, cheer(1.0), F(662), 0.5)           # all aboard
place(sfx, whoosh(0.5), F(710), 0.4); place(sfx, thunk(110, 0.3), F(722), 0.8)        # MONTE CASSINO sign
place(sfx, boomfar(), F(716), 0.9); place(sfx, boomfar(), F(735), 0.8)
for fr in range(760, 820, 9): place(sfx, step(), F(fr), 0.45)
place(sfx, boomfar(), F(790), 0.5)
place(sfx, growl(0.5), F(856), 0.6); place(sfx, thunk(90, 0.3), F(878), 0.8); place(sfx, ting(2637, 0.8), F(880), 0.5)
for fr in range(900, 980, 10): place(sfx, step(), F(fr), 0.55)
place(sfx, ting(2093, 0.8), F(932), 0.5)                                               # "0"
place(sfx, ting(2637, 1.0), F(1006), 0.5); place(sfx, cheer(1.6), F(1014), 0.7)       # promotion
place(sfx, whoosh(0.4), F(1032), 0.4)
place(sfx, thunk(160, 0.2), F(1066), 0.5); place(sfx, thunk(160, 0.2), F(1078), 0.5)  # tapping the sign
for fr in range(1112, 1134, 8): place(sfx, step(), F(fr), 0.5)
place(sfx, whoosh(0.4), F(1132), 0.5); place(sfx, ting(1568, 0.6), F(1152), 0.4); place(sfx, whoosh(0.4), F(1158), 0.4)
place(sfx, ting(3136, 1.0), F(1174), 0.6)                                              # the wink

for name, buf in (("music", music), ("sfx", sfx)):
    pk = float(np.abs(buf).max()) or 1.0
    with wave.open(f"{name}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(buf / pk, -1, 1) * 32767).astype(np.int16).tobytes())
print("stems ok", DUR)
