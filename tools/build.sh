#!/usr/bin/env bash
# Assemble a ready-to-render project from an episode folder.
#   bash tools/build.sh <episode, e.g. 02-pig-war> <project_dir>
# The episode folder must contain: script.txt, story.js (shot plan), audio.py (music + SFX cues).
# voice.mp3 is optional: without it the free Kokoro voice is generated from script.txt (tools/voice_local.py, voice.json).
# The end card (tools/outro.py) is on by default; episodes/<ep>/outro.json can set {"enabled": false} or a different "line".
# Optional: episodes/<ep>/retime.json (re-voiced episode, see tools/retime.py), episodes/<ep>/cast.js (extra characters/fx), episodes/<ep>/world.js (the episode's world, see tools/patch_engine.py),
#           episodes/<ep>/web/ (files that replace engine files outright).
set -e
KIT="$(cd "$(dirname "$0")/.." && pwd)"; EP="${1:?episode}"; P="${2:?project dir}"; E="$KIT/episodes/$EP"
for f in script.txt story.js audio.py; do [ -f "$E/$f" ] || { echo "missing episodes/$EP/$f"; exit 1; }; done
bash "$KIT/tools/setup.sh" "$P" "episodes/$EP"
cp "$E/story.js" "$P/web/story.js"; cp "$E/audio.py" "$P/audio.py"
# voice: the episode's own voice.mp3 if there is one, otherwise generate the free local voice (same text -> same audio)
OUTRO_LINE=$(python3 -c "import json,os;c=json.load(open('$E/outro.json')) if os.path.exists('$E/outro.json') else {};print('' if c.get('enabled',True) is False else c.get('line','Follow for more true stories.'))")
NEED_TTS=""; [ -f "$E/voice.mp3" ] || NEED_TTS=1; [ -n "$OUTRO_LINE" ] && NEED_TTS=1
if [ -n "$NEED_TTS" ] && ! python3 -c "import kokoro_onnx, soundfile" 2>/dev/null; then
  pip install -q kokoro-onnx==0.6.1 onnxruntime==1.29.0 soundfile 2>/dev/null || pip install -q --break-system-packages kokoro-onnx==0.6.1 onnxruntime==1.29.0 soundfile; fi
if [ -f "$E/voice.mp3" ]; then cp "$E/voice.mp3" "$P/voice.mp3"
else mkdir -p "$P/vo"; cp "$E/script.txt" "$P/vo/"; [ -f "$E/voice.json" ] && cp "$E/voice.json" "$P/vo/"
  python3 "$KIT/tools/voice_local.py" "$P/vo" && mv "$P/vo/voice.mp3" "$P/voice.mp3"; fi
cp "$KIT/tools/outro.py" "$P/outro.py"; cp "$KIT/brand/avatar.png" "$P/avatar.png"
if [ -n "$OUTRO_LINE" ]; then VJ=""; [ -f "$E/voice.json" ] && VJ="$E/voice.json"
  python3 "$KIT/tools/voice_local.py" --line "$OUTRO_LINE" "$P/outro_voice.wav" $VJ || echo "outro voice skipped"
else touch "$P/no_outro"; fi
[ -d "$E/web" ] && cp -r "$E/web/." "$P/web/"
# optional episode extras: cast.js (characters/fx, appended to the toon library), world.js (replaces the example world)
CAST=""; [ -f "$E/cast.js" ] && CAST="$E/cast.js"
cat "$P/web/toonbase.js" "$P/web/roman.js" $CAST > "$P/web/toon.js"
python3 "$KIT/tools/patch_scale.py" "$P/web/main.js"
WORLD=""; [ -f "$E/world.js" ] && WORLD="$E/world.js"
python3 "$KIT/tools/patch_engine.py" "$P/web/main.js" $WORLD
# re-voiced episode: stretch the original shot plan and audio cues onto the new voice (see tools/retime.py)
[ -f "$E/retime.json" ] && python3 "$KIT/tools/retime.py" "$P" "$E/retime.json"
( cd "$P" && python3 timing.py voice.mp3 script.txt --out work | tail -n +1 )
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$P/voice.mp3")
python3 -c "print(round($D * 30))" > "$P/frames.txt"
echo "built $P: $(cat "$P/frames.txt") frames"
