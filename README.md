# Believe It Or Bear

True stories. Twist endings. Vertical animated shorts for YouTube Shorts, Instagram Reels and TikTok.

This repo is the production pipeline: a voiceover goes in, a finished 1080x1920 MP4 with music and sound effects comes out.

## Layout

| Folder | What's in it |
|---|---|
| `engine/` | The renderer (three.js in headless Chromium): world, cards, ink pass, lens blur, grade (`main.js`), painted textures (`paint.js`), cast drawing (`roman.js`), motion helpers (`motion.js`), `index.html` |
| `tools/` | `setup.sh` (new episode project), `timing.py` (word timings), `render.mjs` (frames), `sheet.py` (contact sheets), `mix.py` (level-locked mix), `finish.sh` (encode + QA) |
| `templates/` | `audio.py`: synthesized music bed + SFX, written as two stems |
| `example/soldier/` | `story.js`: the worked example shot plan ("The Soldier Who Never Left") |
| `episodes/` | One folder per episode: `script.txt`, sources and notes |
| `brand/` | `bear.py` draws the mascot avatar and the YouTube banner; the PNGs it made |
| `docs/` | Channel copy: bios, captions, posting rules |

Voiceovers, frames and finished videos are not committed (see `.gitignore`).

## Making an episode

```bash
bash tools/setup.sh ~/shorts/02-pig-war episodes/02-pig-war
cd ~/shorts/02-pig-war
cp /path/to/voiceover.mp3 voice.mp3
python3 timing.py voice.mp3 script.txt --out work     # phrase and word timings
# write web/story.js (shot plan) and audio.py (music + SFX cues) against work/phrases.json
HASH="?s=0.4" node render.mjs stills/test "0-9999" 45 && python3 sheet.py stills/test sheet.jpg 10   # quick review
HASH="?s=0.6" RESUME=1 node render.mjs frames "0-<last frame>"                                     # full render
python3 audio.py && python3 mix.py voice.mp3 music.wav sfx.wav
bash finish.sh "Episode Title"
```

## Audio rules (fixed)

- Music sits at 50 % of the voice's gated RMS (-6 dB). SFX at or below 50 %, with peaks held under 0.7x the voice peak.
- No ducking, no compression. Loudness is set once in `finish.sh`: one linear gain to about -14 LUFS plus a -1 dBFS peak limiter.

## Rendering notes

- `?s=0.6` renders at 648x1152 and `finish.sh` upscales to 1080x1920. Full size is about 3x slower on one CPU.
- `RESUME=1` skips frames that already exist, so an interrupted render picks up where it stopped.

Built on github.com/mromidev/claude-animated-shorts (MIT): toon.ts, look values and readability rules.
