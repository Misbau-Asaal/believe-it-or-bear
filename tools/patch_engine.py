#!/usr/bin/env python3
"""Episode-level engine patches for web/main.js. Idempotent.
   python3 tools/patch_engine.py <project>/web/main.js [episode world.js]

1. Planar ink: no outline from a depth jump across one flat surface (stops grazing-angle ground lines).
2. Cards: per-card sx/sy stretch and a custom ground height (a.ground) for the contact blob.
3. World: if a world.js is given, it replaces the engine's example world. The file must define, in module scope:
   DECK, world (a THREE.Group), helmet (a THREE.Group, may stay empty), clouds (array), waterU (uniforms with
   t/deep/shal/glint), and function worldState(S, f). It may use THREE, T, P, scene, add, box, tbox, toon, texM, M,
   waterNd, rx from main.js."""
import re, sys
p = sys.argv[1]; s = open(p).read(); world = sys.argv[2] if len(sys.argv) > 2 else None

def once(tag, a, b):
    global s
    if tag in s: return
    if a not in s: sys.exit(f"patch_engine: anchor not found for {tag}")
    s = s.replace(a, b, 1)

once("/*planar-ink*/",
     "      e = max(e, smoothstep(.006, .02, (ds - d)/d));                           // depth jump, near side only",
     "      float planar = card ? 0. : smoothstep(.93, .985, dot(n, ns)); /*planar-ink*/\n"
     "      e = max(e, smoothstep(.006, .02, (ds - d)/d) * (1. - planar));           // depth jump, near side only")
once("/*card-stretch*/",
     "const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s);",
     "const s = a.s || 1; c.mesh.scale.set(s * (a.sx || 1) * (a.flip ? -1 : 1), s * (a.sy || 1), s); /*card-stretch*/")
once("/*card-ground*/",
     "if (a.blob !== false && a.y < DECK + 0.5) {",
     "if (a.blob !== false && a.y < (a.ground ?? DECK) + 0.5) { /*card-ground*/")

if world and "/*episode-world*/" not in s:
    # drop the example worldState first (the episode world.js brings its own), then swap the world section
    i, j = s.index("function worldState(S, f) {"), s.index("function drawActors(list, cam) {")
    s = s[:i] + s[j:]
    i, j = s.index("// ---------- world ----------"), s.index("// ---------- cards ----------")
    s = s[:i] + "// ---------- world ---------- /*episode-world*/\n" + open(world).read() + "\n" + s[j:]
open(p, "w").write(s); print("engine patches: applied" + (" + episode world" if world else ""))
