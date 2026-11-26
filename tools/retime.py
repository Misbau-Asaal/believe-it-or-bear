#!/usr/bin/env python3
"""Re-time a finished episode to a new voiceover without rewriting its shot plan or audio cues.
  python3 tools/retime.py <project_dir> <episodes/NN-name/retime.json>      (build.sh runs this when retime.json exists)

retime.json: {"total": <new frame count>, "anchors": [[original frame, new frame], ...]} with a pair at every phrase start
and end (from tools/timing.py on the old and the new voice). Frames in between are stretched linearly.
- web/story.js becomes web/story_base.js, and a new web/story.js calls every function with the matching original frame.
- audio.py gets FRAMES = total and an F() that maps its original cue frames onto the new timing."""
import json, re, sys
P, cfg = sys.argv[1], json.load(open(sys.argv[2]))
K, total = cfg["anchors"], cfg["total"]
pairs = ",".join(f"[{o},{n}]" for o, n in K)

story = open(f"{P}/web/story.js").read()
open(f"{P}/web/story_base.js", "w").write(story)
open(f"{P}/web/story.js", "w").write(f"""// Re-timed shot plan (tools/retime.py). The original timing lives in story_base.js.
import * as B from './story_base.js';
const K = [{pairs}];   // [original frame, new frame]
export const warp = (f) => {{ for (let i = 1; i < K.length; i++) if (f <= K[i][1]) {{ const [o0, n0] = K[i - 1], [o1, n1] = K[i]; return o0 + (o1 - o0) * (f - n0) / Math.max(1e-6, n1 - n0); }} return K[K.length - 1][0]; }};
const unwarp = (o) => {{ for (let i = 1; i < K.length; i++) if (o <= K[i][0]) {{ const [o0, n0] = K[i - 1], [o1, n1] = K[i]; return Math.round(n0 + (n1 - n0) * (o - o0) / Math.max(1e-6, o1 - o0)); }} return K[K.length - 1][1]; }};
export const FPS = 30, TOTAL = {total};
export const SHOTS = B.SHOTS.map((s) => ({{ ...s, a: unwarp(s.a), b: s.b >= B.TOTAL - 1 ? TOTAL - 1 : unwarp(s.b + 1) - 1 }}));
export const LIGHTS = B.LIGHTS;
export const shotAt = (f) => B.shotAt(warp(f));
export const lightFor = (S, f) => B.lightFor(S, warp(f));
export const camAt = (f) => B.camAt(warp(f));
export const dofAt = (f) => B.dofAt(warp(f));
export const worldAt = (f) => B.worldAt(warp(f));
export const actorsAt = (f, T) => B.actorsAt(warp(f), T);
export const fxAt = (f, T) => B.fxAt(warp(f), T);
""")

a = open(f"{P}/audio.py").read()
a, n1 = re.subn(r"^FRAMES = \d+", f"FRAMES = {total}", a, count=1, flags=re.M)
mapper = f"""# cue frames are in the original timing; F maps them onto the new voice (tools/retime.py)
_K = [{pairs.replace('[', '(').replace(']', ')')}]
def F(o):
    for (o0, n0), (o1, n1) in zip(_K, _K[1:]):
        if o <= o1: return (n0 + (n1 - n0) * (o - o0) / max(1e-6, o1 - o0)) / 30
    return _K[-1][1] / 30"""
a, n2 = re.subn(r"^F = lambda f: f / 30\s*$", lambda m: mapper, a, count=1, flags=re.M)
if not (n1 and n2): sys.exit("retime: audio.py needs 'FRAMES = N' and 'F = lambda f: f / 30' lines")
open(f"{P}/audio.py", "w").write(a)
print(f"retimed to {total} frames ({len(K)} anchors)")
