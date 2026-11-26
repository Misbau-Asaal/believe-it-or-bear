# Automation plan

Goal: script in, posted video out, with one human approval step before anything goes public.

## The pipeline today

| Step | Status | How |
|---|---|---|
| Story and script | human + Claude | Picked and fact-checked per episode (`episodes/NN-name/script.txt` + `sources.md`) |
| Voiceover | built | Free and automatic: the render build speaks `script.txt` with Kokoro (`tools/voice_local.py`, voice am_michael) when the episode has no `voice.mp3`. The older ElevenLabs route (**Make voiceover**, `tools/voice.py`) still works with a paid plan |
| End card | built | `tools/outro.py`: bear + FOLLOW / like / bell, about 2.5 s, on by default (`outro.json` to change) |
| Shot plan, world, cast | Claude | `story.js`, `world.js`, `cast.js`, `audio.py` written per episode from the timing; staging differs every time |
| Render + encode + QA | built | **Actions → Render episode**: parallel shards, locked audio levels, MP4 as the `video` artifact |
| Human check | you | Watch the MP4 before posting |
| Post to YouTube | next | YouTube Data API upload from the render run, private first, after approval |
| Post to TikTok | later | Content Posting API; posts stay private until TikTok audits the app |
| Post to Instagram | later | Meta API with the professional account |

## Episode loop

1. Pick the story; Claude writes and fact-checks `script.txt` and `sources.md` in `episodes/NN-name/`.
2. Claude generates the free voice from the script (same text always gives the same audio), times the phrases and writes the shot plan, world, cast and audio cues, checks stills, commits.
3. Actions → **Render episode**. The build speaks the script again on GitHub, renders, adds the end card. Download the `video` artifact and watch it.
4. Post (manual now; API upload next).

## Secrets (Settings → Secrets and variables → Actions)

None are needed for the free voice. Only the optional ElevenLabs route uses:

- `ELEVENLABS_API_KEY`: from ElevenLabs profile → API keys.
- `ELEVENLABS_VOICE_ID`: the ID of the channel voice (Voices → the voice → copy ID).

Never put keys in files or chat; secrets are hidden from logs and from forks of the public repo.

Note: ElevenLabs free-plan audio has no commercial licence and must credit elevenlabs.io or 11.ai in the title; use a paid plan or the free Kokoro voice for anything monetized.

## Why a human stays in the loop

YouTube's monetization policy excludes mass-produced or repetitive content. Each episode keeps its own story, staging and writing, and every fact is checked before posting.
