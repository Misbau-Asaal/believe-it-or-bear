"""06 Napoleon vs the Rabbits: synthesized music bed + SFX as two stems (music.wav, sfx.wav). mix.py sets the levels.
Music: a pompous fife-and-drum march for the conqueror that deflates when the bunnies pop up, a court minuet in the
treaty tent with a hunting-horn call, the hunting march for Berthier, a snare roll as the hunters take aim, a bouncy
pizzicato for the released rabbits, a runaway galop for the charge, a curious tick-tock for the wild rabbit, a musette
waltz at the farm, a creeping minor walk for "hungry" with a harp sparkle for the carrot thought, the galop again for the
swarm, sticks and whips, a drum roll and bugle call for the flank, a faster galop for the dash to the carriage, a grand
fanfare for "the greatest general of his age" that slides down into the sting: silence, a low hit, and a little
pizzicato button with the twinkle."""
import numpy as np, wave

SR = 48000
FRAMES = 1415
DUR = FRAMES / 30
N = int(DUR * SR)
rng = np.random.default_rng(61)
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

def fife(f, dur, bright=0.8):
    """a bright wooden flute: odd harmonics, breathy attack, light vibrato"""
    n = int(dur * SR); t = np.arange(n) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 6 * t) * np.minimum(1, t / 0.12)
    ph = 2 * np.pi * f * np.cumsum(vib) / SR
    s = np.sin(ph) + bright * 0.3 * np.sin(2 * ph) + bright * 0.18 * np.sin(3 * ph)
    s = s + 0.12 * bp_fast(rng.standard_normal(n).astype(np.float32), f * 0.8, f * 2.5) * np.exp(-t * 20)
    a = np.minimum(1, t / 0.015) * np.clip((dur - t) / 0.04, 0, 1)
    return lp_fast((s * a).astype(np.float32), 5000)
def slide(m0, m1, d, wob=0.012):
    """a trombone glissando from midi m0 to m1 (the deflating wah)"""
    n = int(d * SR); t = np.arange(n) / SR; m = m0 + (m1 - m0) * (t / d) ** 1.4
    f = midi(m) * (1 + wob * np.sin(2 * np.pi * 5.5 * t)); ph = 2 * np.pi * np.cumsum(f) / SR
    s = sum(np.sin((k + 1) * ph) / (k + 1) ** 1.1 for k in range(10)) * np.minimum(1, t / 0.04) * np.clip((d - t) / 0.2, 0, 1)
    return lp_fast(s.astype(np.float32), 1200)
def timp(f0=55, d=1.2):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f0 * t) * np.exp(-t * 3) + 0.5 * np.sin(2 * np.pi * f0 * 1.5 * t) * np.exp(-t * 5) + lp_fast(noise(d), 300) * np.exp(-t * 18) * 0.5).astype(np.float32)

CH = {60: [64, 67, 72], 55: [62, 67, 71], 53: [65, 69, 72], 57: [64, 69, 72], 50: [65, 69, 74]}
# 1) the march: fife + snare + bass, 2 beats a bar, melody in eighths
def march(t0, t1, bpm=112, gain=1.0, fifes=True, tr=0):
    out = np.zeros(N, np.float32); b = 60 / bpm; k = 0; tt = t0
    roots = [60, 55, 60, 53, 60, 55, 57, 55]
    mel = [72, None, 72, 74, 76, None, 72, None, 79, None, 79, 77, 76, 74, 72, None,
           74, None, 74, 76, 77, None, 74, None, 76, 74, 72, 71, 72, None, 67, None]
    while tt < t1:
        bar, beat = k // 2, k % 2; r = roots[bar % 8] + tr
        if beat == 0: place(out, brass([midi(r - 24)], b * 0.5, 600), tt, 0.55 * gain); place(out, kick(), tt, 0.35 * gain)
        else:
            [place(out, brass([midi(m + tr)], b * 0.3, 1800), tt, 0.16 * gain) for m in CH[r - tr]]
            place(out, snare(0.1), tt, 0.22 * gain)
        place(out, snare(0.05), tt + b / 2, 0.08 * gain)
        if bar % 4 == 3 and beat == 1: [place(out, snare(0.05), tt + b / 2 + i * b / 8, 0.1 * gain) for i in range(4)]
        if fifes:
            for h in range(2):
                m = mel[(k * 2 + h) % len(mel)]
                if m: place(out, fife(midi(m + 12 + tr), b / 2 * 0.9), tt + h * b / 2, 0.2 * gain)
        k += 1; tt += b
    return out
# 2) the galop: fast oom-pah with a running fife line and snare on every beat
def galop(t0, t1, bpm=172, gain=1.0, tr=0):
    out = np.zeros(N, np.float32); b = 60 / bpm; k = 0; tt = t0
    roots = [60, 55, 60, 55, 53, 60, 55, 60]
    mel = [79, 77, 76, 77, 79, None, 72, None, 77, 76, 74, 76, 77, None, 71, None,
           76, 74, 72, 74, 76, 79, 84, 79, 77, 74, 71, 74, 72, None, 72, None]
    while tt < t1:
        bar, beat = k // 2, k % 2; r = roots[bar % 8] + tr
        if beat == 0: place(out, brass([midi(r - 24)], b * 0.45, 700), tt, 0.5 * gain); place(out, kick(), tt, 0.3 * gain)
        else: [place(out, brass([midi(m + tr)], b * 0.25, 2000), tt, 0.14 * gain) for m in CH[r - tr]]
        place(out, snare(0.07), tt, (0.12 if beat == 0 else 0.2) * gain)
        for h in range(2):
            m = mel[(k * 2 + h) % len(mel)]
            if m: place(out, fife(midi(m + 12 + tr), b / 2 * 0.85), tt + h * b / 2, 0.18 * gain)
        k += 1; tt += b
    return out
# 3) bunny pizzicato: bouncy staccato plucks with a woodblock on the offbeat
def pizz(t0, t1, bpm=144, gain=1.0, minor=False):
    out = np.zeros(N, np.float32); b = 60 / bpm; k = 0; tt = t0
    line = ([72, None, 76, None, 79, None, 76, None, 77, None, 81, None, 79, 77, 76, None] if not minor else
            [60, None, 63, None, 67, None, 66, None, 65, None, 63, None, 62, None, 59, None])
    while tt < t1:
        m = line[k % 16]
        if m: place(out, pluck(midi(m), 0.18, 0.55), tt, 0.4 * gain)
        if k % 4 == 0: place(out, pluck(midi((48 if (k // 8) % 2 == 0 else 43) - (12 if minor else 0)), 0.35, 0.3), tt, 0.5 * gain)
        if k % 4 == 2 and not minor: place(out, woodblock(1400 + 300 * ((k // 4) % 2)), tt, 0.12 * gain)
        k += 1; tt += b / 2
    return out
# 4) the court minuet (harpsichord, 3/4)
def minuet(t0, t1, bpm=120, gain=1.0):
    out = np.zeros(N, np.float32); b = 60 / bpm; k = 0; tt = t0
    roots = [55, 50, 55, 48, 55, 50, 52, 50]
    chords = {55: [67, 71, 74], 50: [66, 69, 74], 48: [64, 67, 72], 52: [64, 67, 71]}
    mel = [79, 78, 79, 81, 83, 79, 81, 79, 78, 76, 74, 76, 79, 76, 72, 74, 76, 72, 74, 76, 78, 74, 76, 78, 79, 81, 83, 81, 79, 78, 76, 74, 76, 78, 79, None]
    while tt < t1:
        bar, beat = k // 3, k % 3; r = roots[bar % 8]
        if beat == 0: place(out, harpsi(midi(r - 12), 0.7), tt, 0.55 * gain)
        else: [place(out, harpsi(midi(m), 0.35), tt, 0.16 * gain) for m in chords[r]]
        for h in range(2):
            m = mel[(k * 2 + h) % len(mel)]
            if m: place(out, harpsi(midi(m), 0.3), tt + h * b / 2, 0.3 * gain)
        k += 1; tt += b
    return out

# hook: the conqueror's march; it deflates when he spots the bunnies (96)
music += gate(march(0.0, F(97), 112, 0.75), 0, F(97))
place(music, brass([midi(48), midi(55), midi(60), midi(64)], 0.9, 2600), F(2), 0.35)
place(music, slide(55, 43, 0.75), F(97), 0.55)
place(music, pluck(midi(72), 0.2), F(116), 0.35); place(music, pluck(midi(67), 0.25), F(121), 0.35)
# the treaty tent: a court minuet; a small brass "ta-da" as the 1807 banner drops; a hunting-horn call for the hunt
music += gate(minuet(F(130), F(268), 118, 0.85), F(130), F(268)); fade_out(music, F(262), F(268), False)
place(music, brass([midi(55), midi(59), midi(62), midi(67)], 0.55, 2400), F(180), 0.3)
for at, m, d in [(272, 60, 0.18), (278, 60, 0.18), (284, 64, 0.18), (290, 67, 0.5), (306, 64, 0.18), (312, 67, 0.6)]: place(music, brass([midi(m), midi(m - 12)], d, 2200), F(at), 0.45)
# Berthier rounds them up: the hunting march, then pizzicato over the crates
music += gate(march(F(323), F(409), 118, 0.85), F(323), F(409)); fade_out(music, F(402), F(409), False)
music += gate(pizz(F(410), F(450), 140, 0.7), F(410), F(450))
# taking aim: a snare roll building over a low pad, cut dead as the cages open
place(music, roll(F(501) - F(451), 0.1, 0.75), F(451), 0.5); place(music, pad([midi(43), midi(50)], F(501) - F(451)), F(451), 0.35)
music[int(F(500) * SR):int(F(503) * SR)] = 0
# the cages open: a brass stab, then the bunnies' pizzicato (they hop... the wrong way)
place(music, brass([midi(60), midi(64), midi(67)], 0.35, 2400), F(506), 0.35)
music += gate(pizz(F(512), F(611), 144, 0.9), F(512), F(611))
place(music, brass([midi(49), midi(55), midi(58)], 0.5, 2000), F(586), 0.3)
# the charge: the galop
music += gate(galop(F(611), F(676), 168), F(611), F(676)); fade_out(music, F(670), F(676), False)
place(music, brass([midi(49), midi(55), midi(58), midi(64)], 0.6, 2400), F(640), 0.45)
# the wild rabbit: a curious tick-tock with two question plucks
for i in range(int((F(738) - F(678)) / 0.4)): place(music, woodblock(1500 if i % 2 else 1100), F(678) + i * 0.4, 0.14)
for at, m in [(700, 72), (706, 74), (712, 76)]: place(music, pluck(midi(m), 0.3, 0.5), F(at), 0.35)
place(music, slide(67, 55, 0.35), F(718), 0.3)
# the farm: a musette waltz on the barrel organ
b = 60 / 156; tt = F(740); k = 0
walz = [76, 79, 84, 79, 77, 81, 84, 81, 76, 79, 84, 79, 74, 77, 79, 74]
while tt < F(806):
    beat = k % 3; r = [48, 43, 48, 43][(k // 3) % 4]
    if beat == 0: place(music, organ([midi(r)], b * 0.8), tt, 0.4)
    else: place(music, organ([midi(r + 16), midi(r + 19)], b * 0.5), tt, 0.18)
    place(music, organ([midi(walz[k % 16])], b * 0.9), tt, 0.22)
    k += 1; tt += b
fade_out(music, F(800), F(806), False)
# hungry: a creeping minor pizzicato; harp sparkle for the carrot thought
music += gate(pizz(F(808), F(862), 112, 0.8, minor=True), F(808), F(862))
place(music, pad([midi(48), midi(51), midi(55)], F(862) - F(820)), F(820), 0.28)
for i, m in enumerate([72, 76, 79, 84, 88]): place(music, harpsi(midi(m), 0.8), F(862) + i * 0.06, 0.28)
place(music, pad([midi(60), midi(64), midi(67), midi(72)], F(905) - F(864), 0.02), F(864), 0.3)
# the swarm, the sticks and the whips: the galop, a stab when the hat flies
music += gate(galop(F(906), F(1113), 176), F(906), F(1113)); fade_out(music, F(1106), F(1113), False)
place(music, brass([midi(50), midi(56), midi(59), midi(65)], 0.5, 2400), F(988), 0.4)
# the flank: a drum roll building, a bugle call, low brass pushing
place(music, roll(F(1224) - F(1114), 0.15, 0.8), F(1114), 0.28)
for i in range(6): place(music, brass([midi(43 + (i % 2) * 2)], 0.35, 700), F(1114) + i * 0.6, 0.35)
for at, m, d in [(1150, 67, 0.15), (1155, 67, 0.15), (1160, 72, 0.15), (1165, 76, 0.4), (1180, 72, 0.15), (1185, 76, 0.15), (1190, 79, 0.7)]: place(music, brass([midi(m)], d, 2800), F(at), 0.32)
place(music, timp(49, 1.0), F(1206), 0.6)
# the dash to the carriage: a faster galop
music += gate(galop(F(1226), F(1299), 188, 0.95, 2), F(1226), F(1299)); fade_out(music, F(1293), F(1299), False)
# "the greatest general of his age": a grand fanfare with timpani... that slides down into the sting
for at, ch, d in [(1300, [48, 55, 60, 64], 0.5), (1316, [53, 57, 60, 65], 0.5), (1330, [55, 59, 62, 67], 0.55)]:
    place(music, brass([midi(m) for m in ch], d, 2800), F(at), 0.36); place(music, timp(midi(ch[0] - 12) * 2, 0.8), F(at), 0.3)
place(music, brass([midi(48), midi(55), midi(60), midi(64), midi(72)], 0.5, 3000), F(1344), 0.36)
place(music, slide(60, 41, 0.45, 0.02), F(1349), 0.4)
# the sting: silence, a low hit on "outflanked", then a little pizzicato button with the twinkle
hit = np.arange(int(1.4 * SR)) / SR
place(music, (np.sin(2 * np.pi * 41 * hit) * np.exp(-hit * 2.4) + lp_fast(noise(1.4), 120) * np.exp(-hit * 6) * 0.6).astype(np.float32), F(1358), 0.55)
place(music, pluck(midi(79), 0.25, 0.6), F(1397), 0.45); place(music, pluck(midi(72), 0.5, 0.5), F(1402), 0.5); place(music, pluck(midi(48), 0.6, 0.3), F(1402), 0.45)

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


def squeak(f0=None):
    d = 0.09; n = int(d * SR); t = np.arange(n) / SR; f0 = f0 or 2400 + 1200 * rng.random(); f = f0 * (1 + 0.25 * np.sin(np.pi * t / d))
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.35).astype(np.float32)
def patter(d, rate=18, lo=0.3, hi=1.0):
    """lots of little paws: soft taps scattered in time"""
    n = int(d * SR); s = np.zeros(n, np.float32); m = int(0.04 * SR); tt = np.arange(m) / SR
    for i in range(int(d * rate)):
        j = int(rng.random() * max(1, n - m)); g = lo + (hi - lo) * j / n
        tap = (lp_fast(noise(0.04), 900 + 600 * rng.random()) * np.exp(-tt * 90)).astype(np.float32)
        s[j:j + m] += tap * g * (0.5 + 0.5 * rng.random())
    return s
def click():
    a = thunk(1800, 0.03) * 0.4; b = thunk(1200, 0.04) * 0.5; out = np.zeros(int(0.12 * SR), np.float32)
    out[:len(a)] += a; j = int(0.06 * SR); out[j:j + len(b)] += b; return out
def crack():
    d = 0.25; n = int(d * SR); t = np.arange(n) / SR
    return (hp_fast(noise(d), 2000) * np.exp(-t * 60) * 1.6 + np.sin(2 * np.pi * 3000 * t) * np.exp(-t * 90) * 0.3).astype(np.float32)
def clop(f0=None):
    f0 = f0 or 500 + 200 * rng.random(); w = thunk(110, 0.1) * 0.4; wb = woodblock(f0) * 0.7; w[:len(wb)] += wb; return w
def gallop(d, rate=2.6):
    out = np.zeros(int(d * SR), np.float32)
    for i in range(int(d * rate)):
        for k, off in enumerate((0, 0.07, 0.16, 0.22)):
            c = clop(); j = int((i / rate + off) * SR)
            if j < len(out): out[j:j + len(c)] += c[: len(out) - j] * (0.7 + 0.3 * (k == 0))
    return out
def whinny(d=0.9):
    n = int(d * SR); t = np.arange(n) / SR; f = 700 * (1 - 0.35 * t / d) * (1 + 0.06 * np.sin(2 * np.pi * 14 * t))
    return lp_fast((np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.2 * np.sin(np.pi * t / d) ** 0.6).astype(np.float32), 2500) + bp_fast(noise(d), 1500, 4000) * 0.05
def growl(d=0.7, f0=70):
    n = int(d * SR); t = np.arange(n) / SR; f = f0 * (1 + 0.3 * np.sin(2 * np.pi * 3 * t))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.6 + 0.4 * np.sin(2 * np.pi * 11 * t)) + 0.4 * lp_fast(noise(d), 300)
    return lp_fast((s * np.sin(np.pi * t / d)).astype(np.float32), 500)

# hook: the bunnies pop up one by one; a quick gasp when he spots them
for i, fr in enumerate((72, 78, 84, 90)): place(sfx, pop(500 + 140 * i), F(fr), 0.7); place(sfx, squeak(), F(fr + 4), 0.4)
place(sfx, whoosh(0.25), F(95), 0.4); place(sfx, boing(0.7, 300), F(98), 0.3)
# the tent: the quill scratching, the 1807 banner drops, paper, a cheer
place(sfx, scratch(F(212) - F(140)), F(140), 0.3)
place(sfx, whoosh(0.35), F(164), 0.4); place(sfx, thunk(150, 0.25), F(178), 0.7); place(sfx, ting(2637, 0.6), F(180), 0.25)
place(sfx, paper(0.4), F(214), 0.6); place(sfx, crowd(F(258) - F(216)), F(216), 0.5); place(sfx, clunk(), F(263), 0.4)
# Berthier: crates of squeaking bunnies
place(sfx, whoosh(0.3), F(330), 0.35)
for fr in (384, 396, 404, 414, 421, 430, 437, 446): place(sfx, squeak(), F(fr), 0.35)
# taking aim: the muskets cock one after another
for fr in (458, 465, 472, 479): place(sfx, click(), F(fr), 0.8)
# the cages open
place(sfx, whoosh(0.3), F(503), 0.4)
for i, fr in enumerate(range(505, 517, 2)): place(sfx, thunk(120 + 15 * i, 0.22), F(fr), 0.6)
place(sfx, patter(F(611) - F(516), 14, 0.3, 0.9), F(516), 0.6)
for fr in (522, 540, 566, 590): place(sfx, squeak(), F(fr), 0.3)
# the charge: a stampede of paws, the "?!"
place(sfx, patter(F(676) - F(611), 40, 0.7, 1.0), F(611), 0.75); place(sfx, rumble(2.2), F(611), 0.4)
place(sfx, boing(0.8, 260), F(642), 0.35)
# the wild rabbit: up, a question, and back down the hole
place(sfx, pop(650), F(685), 0.7); place(sfx, ting(3136, 0.5), F(700), 0.3)
place(sfx, whoosh(0.25), F(717), 0.4); place(sfx, pop(420), F(724), 0.6); place(sfx, thunk(90, 0.2), F(722), 0.3)
# the farm: coins for the farmer, squeaks from the hutches, a chuckle
place(sfx, jingle(0.9, 14), F(748), 0.45); place(sfx, jingle(0.4, 10), F(772), 0.4)
for fr in (756, 768, 781, 795): place(sfx, squeak(), F(fr), 0.3)
# hungry: the tummy rumbles, a drool drip, the thought-bubble pop
place(sfx, growl(0.7, 70), F(816), 0.7); place(sfx, growl(0.6, 60), F(834), 0.7)
place(sfx, drip(), F(848), 0.5); place(sfx, pop(900), F(862), 0.5)
# the swarm: paws everywhere, panic, a bunny bounces onto his head and knocks the hat off
place(sfx, patter(F(1000) - F(906), 34, 0.6, 1.0), F(906), 0.7); place(sfx, crowd(F(1000) - F(910)), F(910), 0.45)
place(sfx, boing(0.6, 280), F(966), 0.35); place(sfx, thunk(220, 0.15), F(978), 0.5)
place(sfx, pop(800), F(988), 0.7); place(sfx, whoosh(0.3), F(990), 0.4); place(sfx, thunk(160, 0.2), F(999), 0.5)
# the sticks: swishing at nothing
for fr in (1004, 1008, 1020, 1024, 1036, 1040): place(sfx, whoosh(0.16), F(fr), 0.55)
place(sfx, patter(F(1050) - F(1001), 26, 0.6, 0.8), F(1001), 0.55)
# the whips: two cracks, a whinny, stamping hooves
for fr in (1060, 1082, 1104): place(sfx, crack(), F(fr), 0.9)
place(sfx, whinny(0.9), F(1066), 0.5)
for fr in range(1070, 1110, 7): place(sfx, clop(), F(fr), 0.4)
# the flank: two waves of paws sweeping round, the men gasp
place(sfx, patter(F(1225) - F(1113), 40, 0.5, 1.0), F(1113), 0.7); place(sfx, whoosh(1.0), F(1118), 0.35); place(sfx, whoosh(1.0), F(1150), 0.35)
place(sfx, crowd(0.9), F(1150), 0.5)
# the run: quick boots, the carriage door, the whip, off they go
for fr in range(1230, 1268, 5): place(sfx, step(), F(fr), 0.55)
place(sfx, click(), F(1262), 0.4); place(sfx, clunk(), F(1270), 0.8); place(sfx, crack(), F(1292), 0.8)
place(sfx, patter(F(1299) - F(1226), 30, 0.6, 0.9), F(1226), 0.55)
place(sfx, gallop(F(1352) - F(1298)), F(1298), 0.45); place(sfx, scrape(F(1352) - F(1300)), F(1300), 0.35)
place(sfx, patter(F(1352) - F(1299), 30, 0.8, 0.5), F(1299), 0.5)
fade_out(sfx, F(1346), F(1354))
# the final bunny: a puff of the chest, the twinkle
place(sfx, thunk(240, 0.12), F(1372), 0.5); place(sfx, ting(4186, 0.6), F(1394), 0.4)

for name, buf in (("music", music), ("sfx", sfx)):
    pk = float(np.abs(buf).max()) or 1.0
    with wave.open(f"{name}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(buf / pk, -1, 1) * 32767).astype(np.int16).tobytes())
print("stems ok", DUR)
