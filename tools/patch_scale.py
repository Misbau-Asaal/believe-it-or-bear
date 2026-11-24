#!/usr/bin/env python3
"""Make web/main.js honour ?s=<scale> (render below 1080x1920; finish.sh upscales). Idempotent.
   python3 tools/patch_scale.py <project>/web/main.js"""
import sys
p = sys.argv[1]; s = open(p).read()
if "const SC =" in s: print("scale patch: already present"); sys.exit(0)
rep = [
    ("const W = 1080, H = 1920;", "const SC = parseFloat(new URLSearchParams(location.search).get('s') || '1');\nconst W = Math.round(1080 * SC), H = Math.round(1920 * SC);"),
    ("const CW = 1200, CH = 2000, CM = 2.25;", "const CS = Math.max(0.6, Math.min(1, SC * 1.2)), CW = Math.round(1200 * CS), CH = Math.round(2000 * CS), CM = 2.25;"),
    ("inkU.px.value = 2.5;", "inkU.px.value = 2.5 * SC;"),
    ("dofU.cinf.value = D.cinf;", "dofU.cinf.value = D.cinf * SC;"),
]
for a, b in rep:
    if a not in s: sys.exit(f"scale patch: anchor not found: {a!r}")
    s = s.replace(a, b, 1)
open(p, "w").write(s); print("scale patch: applied")
