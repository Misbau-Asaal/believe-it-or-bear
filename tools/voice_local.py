#!/usr/bin/env python3
"""Free, self-hosted voiceover with Kokoro-82M (Apache-2.0, commercial use allowed). No API key.

  python3 tools/voice_local.py <episode dir>                 -> <episode dir>/voice.mp3
  python3 tools/voice_local.py --line "Some text" out.wav    -> one line (used for the outro)

Settings come from <episode dir>/voice.json when present, e.g. {"voice": "am_michael", "speed": 1.1,
"say": {"Wojtek": "Voytek"}} ("say" respells words for pronunciation only; script.txt keeps the real spelling).
Each sentence is spoken separately and joined with fixed pauses (short inside a paragraph, longer
between paragraphs), so pacing is predictable and tools/timing.py finds clean gaps.
Model files (about 350 MB) are downloaded once into ~/.cache/kokoro from the kokoro-onnx GitHub release.
Needs: pip install kokoro-onnx soundfile, and ffmpeg."""
import json, os, re, subprocess, sys, urllib.request
import numpy as np

REL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
FILES = {"kokoro-v1.0.onnx": 300_000_000, "voices-v1.0.bin": 25_000_000}
CACHE = os.environ.get("KOKORO_DIR", os.path.expanduser("~/.cache/kokoro"))
DEFAULTS = {"voice": "am_michael", "speed": 1.1, "lang": "en-us", "gap": 0.32, "para_gap": 0.6, "lead": 0.15, "tail": 0.5}

def model():
    os.makedirs(CACHE, exist_ok=True)
    for name, min_size in FILES.items():
        p = os.path.join(CACHE, name)
        if not os.path.exists(p) or os.path.getsize(p) < min_size:
            print("downloading", name); urllib.request.urlretrieve(REL + name, p + ".part"); os.replace(p + ".part", p)
    from kokoro_onnx import Kokoro
    return Kokoro(os.path.join(CACHE, "kokoro-v1.0.onnx"), os.path.join(CACHE, "voices-v1.0.bin"))

def say(k, text, cfg):
    for w, r in cfg.get("say", {}).items(): text = text.replace(w, r)
    s, sr = k.create(text, voice=cfg["voice"], speed=cfg["speed"], lang=cfg["lang"])
    s = np.asarray(s, np.float32)
    # trim the model's own leading/trailing silence so our gaps are the only pauses
    nz = np.flatnonzero(np.abs(s) > 0.01)
    if len(nz): s = s[max(0, nz[0] - int(0.02 * sr)): nz[-1] + int(0.06 * sr)]
    return s, sr

def write(audio, sr, out):
    raw = out + ".f32"; audio.astype(np.float32).tofile(raw)
    args = ["-b:a", "160k"] if out.endswith(".mp3") else ["-c:a", "pcm_s16le"]
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(sr), "-ac", "1", "-i", raw, *args, out], check=True)
    os.remove(raw)

def main():
    a = sys.argv[1:]
    if a[:1] == ["--line"]:
        cfg = dict(DEFAULTS); text, out = a[1], a[2]
        if len(a) > 3 and os.path.exists(a[3]): cfg.update(json.load(open(a[3])))
        k = model(); s, sr = say(k, text, cfg)
        write(np.concatenate([np.zeros(int(0.05 * sr), np.float32), s, np.zeros(int(0.1 * sr), np.float32)]), sr, out)
        print(f"{out}: {len(s)/sr:.2f} s"); return
    ep = a[0]; cfg = dict(DEFAULTS)
    if os.path.exists(f"{ep}/voice.json"): cfg.update(json.load(open(f"{ep}/voice.json")))
    paras = [p.strip() for p in open(f"{ep}/script.txt").read().split("\n\n") if p.strip()]
    k = model(); parts = []; sr = 24000
    for pi, para in enumerate(paras):
        sents = [x for x in re.split(r"(?<=[.!?])\s+", " ".join(para.split())) if x]
        for si, sent in enumerate(sents):
            s, sr = say(k, sent, cfg); parts.append(s)
            last = pi == len(paras) - 1 and si == len(sents) - 1
            parts.append(np.zeros(int((cfg["tail"] if last else cfg["gap"] if si < len(sents) - 1 else cfg["para_gap"]) * sr), np.float32))
    audio = np.concatenate([np.zeros(int(cfg["lead"] * sr), np.float32)] + parts)
    audio *= 0.89 / max(1e-6, float(np.abs(audio).max()))
    write(audio, sr, f"{ep}/voice.mp3")
    print(f"{ep}/voice.mp3: {len(audio)/sr:.1f} s, voice {cfg['voice']} at speed {cfg['speed']}")

if __name__ == "__main__":
    main()
