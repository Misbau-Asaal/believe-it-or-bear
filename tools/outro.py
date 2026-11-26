#!/usr/bin/env python3
"""End card: the bear pops in over a blurred last frame with FOLLOW / like / bell, plus a short sting.
Run in the project folder after mix.py and before encoding (finish.sh does this):
  python3 outro.py            appends frames to frames/ and audio to mix_raw.wav (in place)
Uses avatar.png, and outro_voice.wav when present (the spoken line). About 2.5 s, kept short so Shorts still loop."""
import glob, os, subprocess, numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

FPS, SR = 30, 48000
frames = sorted(glob.glob("frames/f*.jpg")); N = len(frames)
last = Image.open(frames[-1]).convert("RGB"); W, H = last.size; u = W / 1080

def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

vo = load("outro_voice.wav") if os.path.exists("outro_voice.wav") else np.zeros(0, np.float32)
VO_AT = 0.30                                              # the line starts once the bear has landed
D = max(2.4, VO_AT + len(vo) / SR + 0.45); M = round(D * FPS)

def font(px):
    for f in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf", "DejaVuSans-Bold.ttf"]:
        try: return ImageFont.truetype(f, int(px))
        except OSError: pass
    return ImageFont.load_default()

clamp = lambda x: max(0.0, min(1.0, x))
def back(t):                                             # ease-out-back: overshoot, settle
    t = clamp(t); c = 1.9; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2
def ease(t): t = clamp(t); return 1 - (1 - t) ** 3

bg = last.filter(ImageFilter.GaussianBlur(14 * u))
bg = Image.blend(bg, Image.new("RGB", (W, H), (28, 52, 92)), 0.45)
av = Image.open("avatar.png").convert("RGB"); AV = int(420 * u)
av = av.resize((AV, AV), Image.LANCZOS); mask = Image.new("L", (AV, AV), 0); ImageDraw.Draw(mask).ellipse((0, 0, AV - 1, AV - 1), fill=255)
F_name, F_btn, F_sub = font(64 * u), font(92 * u), font(54 * u)
INK, WHITE, RED = (24, 24, 30), (255, 255, 255), (232, 46, 46)

def centered(d, y, text, f, fill, stroke=0):
    w = d.textlength(text, font=f); d.text(((W - w) / 2, y), text, font=f, fill=fill, stroke_width=stroke, stroke_fill=INK)

def heart(d, cx, cy, r, fill):
    d.ellipse((cx - r, cy - r * 0.9, cx, cy + r * 0.1), fill=fill); d.ellipse((cx, cy - r * 0.9, cx + r, cy + r * 0.1), fill=fill)
    d.polygon([(cx - r * 0.97, cy - r * 0.25), (cx + r * 0.97, cy - r * 0.25), (cx, cy + r)], fill=fill)

def bell(d, cx, cy, r, fill):
    d.ellipse((cx - r * 0.18, cy - r * 1.05, cx + r * 0.18, cy - r * 0.7), fill=fill)
    d.polygon([(cx - r * 0.55, cy - r * 0.5), (cx + r * 0.55, cy - r * 0.5), (cx + r * 0.85, cy + r * 0.5), (cx - r * 0.85, cy + r * 0.5)], fill=fill)
    d.ellipse((cx - r * 0.55, cy - r * 0.95, cx + r * 0.55, cy - r * 0.15), fill=fill)
    d.rounded_rectangle((cx - r, cy + r * 0.4, cx + r, cy + r * 0.62), radius=r * 0.1, fill=fill)
    d.ellipse((cx - r * 0.22, cy + r * 0.6, cx + r * 0.22, cy + r * 1.0), fill=fill)

def badge(img, cx, cy, s, kind, wiggle=0.0):
    if s <= 0.01: return
    R = int(78 * u * s); layer = Image.new("RGBA", (R * 2 + 8, R * 2 + 8), (0, 0, 0, 0)); d = ImageDraw.Draw(layer); c = R + 4
    d.ellipse((c - R, c - R, c + R, c + R), fill=WHITE, outline=INK, width=max(2, int(6 * u)))
    (heart if kind == "heart" else bell)(d, c, c + (R * 0.08 if kind == "heart" else 0), R * 0.5, RED)
    layer = layer.rotate(wiggle, resample=Image.BICUBIC); img.paste(layer, (int(cx - c), int(cy - c)), layer)

out = []
for i in range(M):
    t = i / FPS
    img = Image.blend(last, bg, ease(t / 0.25)); d = ImageDraw.Draw(img)
    # bear avatar with a white ring, pops in and bobs
    s = back(t / 0.35); bob = np.sin(t * 5.5) * 8 * u * clamp((t - 0.35) / 0.2)
    if s > 0.02:
        sz = max(2, int(AV * s)); ring = int(18 * u * s); cy = int(H * 0.36 + bob)
        d.ellipse((W / 2 - sz / 2 - ring, cy - sz / 2 - ring, W / 2 + sz / 2 + ring, cy + sz / 2 + ring), fill=WHITE, outline=INK, width=max(2, int(7 * u)))
        img.paste(av.resize((sz, sz)), (int(W / 2 - sz / 2), int(cy - sz / 2)), mask.resize((sz, sz)))
        d = ImageDraw.Draw(img)
    # channel name, FOLLOW button (pulses), subline
    a = ease((t - 0.25) / 0.25)
    if a > 0:
        centered(d, H * 0.36 + AV / 2 + 50 * u + (1 - a) * 40 * u, "BELIEVE IT OR BEAR", F_name, WHITE, int(5 * u))
        p = 1 + 0.05 * max(0, np.sin((t - 0.9) * 7)) * (t > 0.9)
        bw, bh = 560 * u * a * p, 150 * u * a * p; by = H * 0.62
        d.rounded_rectangle((W / 2 - bw / 2, by - bh / 2, W / 2 + bw / 2, by + bh / 2), radius=bh / 2, fill=RED, outline=INK, width=max(2, int(7 * u)))
        if a > 0.6:
            f = font(92 * u * a * p); w = d.textlength("FOLLOW", font=f); d.text(((W - w) / 2, by - 56 * u * a * p), "FOLLOW", font=f, fill=WHITE)
        b = ease((t - 0.45) / 0.25)
        if b > 0: centered(d, by + bh / 2 + 34 * u, "for more true stories", F_sub, (255, 255, 255), int(4 * u))
    # like + bell badges pop in below the button (clear of the Shorts side buttons)
    badge(img, W * 0.39, H * 0.775, back((t - 0.6) / 0.3), "heart", 10 * np.sin(t * 9) * clamp((t - 0.9) / 0.2))
    badge(img, W * 0.61, H * 0.775, back((t - 0.72) / 0.3), "bell", 14 * np.sin(t * 12) * clamp((t - 1.0) / 0.2))
    path = f"frames/f{N + i:04d}.jpg"; img.save(path, quality=94); out.append(path)

# ---- audio: pop when the bear lands, two-note chime on FOLLOW, little rattle for the bell, then the line
L = M / FPS; a = np.zeros(int(L * SR), np.float32); tt = lambda d: np.arange(int(d * SR)) / SR
def put(x, at): i = int(at * SR); n = min(len(x), len(a) - i); a[i:i + n] += x[:n]
k = tt(0.12); put(np.sin(2 * np.pi * (300 + 900 * k / 0.12) * k) * np.exp(-k * 30) * 0.8, 0.08)                      # pop
for at, hz in [(0.32, 784), (0.47, 1175)]:                                                                              # chime
    k = tt(0.6); put((np.sin(2 * np.pi * hz * k) + 0.35 * np.sin(2 * np.pi * hz * 2 * k)) * np.exp(-k * 6) * 0.45, at)
k = tt(0.35); put(np.sin(2 * np.pi * 1568 * k) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 22 * k))) * np.exp(-k * 9) * 0.25, 1.0)  # bell
mix = load("mix_raw.wav"); n0 = round(N / FPS * SR); mix = np.pad(mix, (0, max(0, n0 - len(mix))))[:n0]
def grms(x):
    k = int(0.05 * SR); f = x[:len(x) // k * k].reshape(-1, k); r = np.sqrt((f ** 2).mean(1)); keep = r > np.abs(x).max() * 0.01
    return float(np.sqrt((f[keep] ** 2).mean())) if keep.any() else 1e-6
ref = grms(mix)
if len(vo): vseg = np.zeros_like(a); i = int(VO_AT * SR); m = min(len(vo), len(a) - i); vseg[i:i + m] = vo[:m]; vseg *= 0.9 * ref / grms(vo); a = a * (0.5 * ref / grms(a)) + vseg
else: a *= 0.6 * ref / grms(a)
a[-int(0.08 * SR):] *= np.linspace(1, 0, int(0.08 * SR))
np.concatenate([mix, a]).astype(np.float32).tofile("mix_raw.f32")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "mix_raw.f32", "-c:a", "pcm_f32le", "mix_raw.wav"], check=True)
print(f"outro: {M} frames ({L:.2f} s) appended after frame {N - 1}" + (" with spoken line" if len(vo) else ""))
