#!/usr/bin/env python3
"""python3 mix.py voice.mp3 music.wav sfx.wav  ->  mix_raw.wav (float32 mono, 48 kHz)

Level lock, no ducking and no compression:
  music = 50 % of the voice's gated RMS (-6.0 dB)
  sfx   = 50 % of the voice's gated RMS, then scaled down further if a hit would exceed 0.7x the voice peak.
The gate is relative to each signal's own peak, so the measurement does not move when a stem is rescaled."""
import sys, subprocess, numpy as np
SR = 48000
def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()
def gated_rms(x, thresh_db=-40, win=0.05):
    k = int(win * SR); n = len(x) // k * k; fr = x[:n].reshape(-1, k); r = np.sqrt((fr ** 2).mean(1))
    keep = 20 * np.log10(r + 1e-9) > 20 * np.log10(np.abs(x).max() + 1e-9) + thresh_db
    return float(np.sqrt((fr[keep] ** 2).mean())) if keep.any() else 1e-6
db = lambda a, b: 20 * np.log10(a / b)
voice, music, sfx = (load(p) for p in sys.argv[1:4])
N = len(voice); music = np.pad(music, (0, max(0, N - len(music))))[:N]; sfx = np.pad(sfx, (0, max(0, N - len(sfx))))[:N]
rv, rm, rs = gated_rms(voice), gated_rms(music), gated_rms(sfx, -45)
gm = 0.5 * rv / rm; gs = 0.5 * rv / rs
pv = float(np.abs(voice).max()); ps = float(np.abs(sfx * gs).max())
if ps > 0.7 * pv: gs *= 0.7 * pv / ps
mix = voice + music * gm + sfx * gs
print(f"voice gated RMS {20*np.log10(rv):.1f} dBFS | music {db(gated_rms(music*gm), rv):+.1f} dB vs voice | "
      f"sfx {db(gated_rms(sfx*gs, -45), rv):+.1f} dB vs voice | sfx peak {db(np.abs(sfx*gs).max(), pv):+.1f} dB vs voice peak | mix peak {np.abs(mix).max():.2f}")
mix.astype(np.float32).tofile("mix_raw.f32")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "mix_raw.f32", "-c:a", "pcm_f32le", "mix_raw.wav"], check=True)
