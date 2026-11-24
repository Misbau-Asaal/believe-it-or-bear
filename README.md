# Believe It Or Bear

True stories. Twist endings. Vertical animated shorts for YouTube Shorts, Instagram Reels and TikTok.

This repo is the production pipeline: a voiceover goes in, a finished 1080x1920 MP4 with music and sound effects comes out.

## Layout

| Folder | What's in it |
|---|---|
| `engine/` | The renderer (three.js in headless Chromium): world, cards, ink pass, lens blur, grade (`main.js`), painted textures (`paint.js`), cast drawing (`roman.js`), motion helpers (`motion.js`), `index.html` |
| `tools/` | `build.sh` (episode folder to ready project), `setup.sh` (new episode project), `patch_scale.py` (render scale), `timing.py` (word timings), `render.mjs` (frames), `sheet.py` (contact sheets), `mix.py` (level-locked mix), `finish.sh` (encode + QA) |
| `templates/` | `audio.py`: synthesized music bed + SFX, written as two stems |
| `example/soldier/` | `story.js`: the worked example shot plan ("The Soldier Who Never Left") |
| `episodes/` | One folder per episode: `script.txt`, sources, notes, and once ready `voice.mp3`, `story.js`, `audio.py` |
| `.github/workflows/` | `render.yml`: renders an episode on GitHub Actions |
| `brand/` | `bear.py` draws the mascot avatar and the YouTube banner; the PNGs it made |
| `docs/` | Channel copy: bios, captions, posting rules |

Episode voiceovers (`episodes/*/voice.mp3`) are committed so GitHub can render them; frames and finished videos are not (see `.gitignore`).

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

## Rendering on GitHub (no computer needed)

1. Put the episode in `episodes/<NN-name>/`: `script.txt`, `voice.mp3`, `story.js` (shot plan) and `audio.py` (music + SFX cues).
   An optional `web/` folder inside the episode replaces engine files (for example a new world in `main.js` or new characters in `roman.js`).
2. Open the **Actions** tab, choose **Render episode**, click **Run workflow**, and fill in the episode folder and the title.
3. GitHub builds the project, renders the frames in parallel shards, adds music and SFX at the locked levels, encodes and runs QA.
4. When it finishes, download the **video** artifact from the run page: the MP4, a contact sheet and the mix/QA reports.

Locally the same steps are `bash tools/build.sh <NN-name> <project_dir>`, then `render.mjs`, `audio.py`, `mix.py` and `finish.sh` inside the project.

## Audio rules (fixed)

- Music sits at 50 % of the voice's gated RMS (-6 dB). SFX at or below 50 %, with peaks held under 0.7x the voice peak.
- No ducking, no compression. Loudness is set once in `finish.sh`: one linear gain to about -14 LUFS plus a -1 dBFS peak limiter.

## Rendering notes

- `?s=0.6` renders at 648x1152 and `finish.sh` upscales to 1080x1920. Full size is about 3x slower on one CPU.
- `RESUME=1` skips frames that already exist, so an interrupted render picks up where it stopped.

Built on github.com/mromidev/claude-animated-shorts (MIT): toon.ts, look values and readability rules.
