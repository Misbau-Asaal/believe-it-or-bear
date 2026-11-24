#!/usr/bin/env bash
# Assemble a ready-to-render project from an episode folder.
#   bash tools/build.sh <episode, e.g. 02-pig-war> <project_dir>
# The episode folder must contain: script.txt, voice.mp3, story.js (shot plan), audio.py (music + SFX cues).
# Optional: episodes/<ep>/cast.js (extra characters/fx), episodes/<ep>/world.js (the episode's world, see tools/patch_engine.py),
#           episodes/<ep>/web/ (files that replace engine files outright).
set -e
KIT="$(cd "$(dirname "$0")/.." && pwd)"; EP="${1:?episode}"; P="${2:?project dir}"; E="$KIT/episodes/$EP"
for f in script.txt voice.mp3 story.js audio.py; do [ -f "$E/$f" ] || { echo "missing episodes/$EP/$f"; exit 1; }; done
bash "$KIT/tools/setup.sh" "$P" "episodes/$EP"
cp "$E/story.js" "$P/web/story.js"; cp "$E/audio.py" "$P/audio.py"; cp "$E/voice.mp3" "$P/voice.mp3"
[ -d "$E/web" ] && cp -r "$E/web/." "$P/web/"
# optional episode extras: cast.js (characters/fx, appended to the toon library), world.js (replaces the example world)
CAST=""; [ -f "$E/cast.js" ] && CAST="$E/cast.js"
cat "$P/web/toonbase.js" "$P/web/roman.js" $CAST > "$P/web/toon.js"
python3 "$KIT/tools/patch_scale.py" "$P/web/main.js"
WORLD=""; [ -f "$E/world.js" ] && WORLD="$E/world.js"
python3 "$KIT/tools/patch_engine.py" "$P/web/main.js" $WORLD
( cd "$P" && python3 timing.py voice.mp3 script.txt --out work | tail -n +1 )
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$P/voice.mp3")
python3 -c "print(round($D * 30))" > "$P/frames.txt"
echo "built $P: $(cat "$P/frames.txt") frames"
