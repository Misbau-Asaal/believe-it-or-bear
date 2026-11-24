# Automation plan

Goal: script in, posted video out, with one human approval step before anything goes public.

## The pipeline today

| Step | Status | How |
|---|---|---|
| Story and script | human + Claude | Picked and fact-checked per episode (`episodes/NN-name/script.txt` + `sources.md`) |
| Voiceover | built | **Actions → Make voiceover**: `tools/voice.py` calls ElevenLabs (eleven_v4) and commits `voice.mp3` plus `timing/` (phrase and word frames) back to the episode folder |
| Shot plan, world, cast | Claude | `story.js`, `world.js`, `cast.js`, `audio.py` written per episode from the timing; staging differs every time |
| Render + encode + QA | built | **Actions → Render episode**: parallel shards, locked audio levels, MP4 as the `video` artifact |
| Human check | you | Watch the MP4 before posting |
| Post to YouTube | next | YouTube Data API upload from the render run, private first, after approval |
| Post to TikTok | later | Content Posting API; posts stay private until TikTok audits the app |
| Post to Instagram | later | Meta API with the professional account |

## Episode loop

1. Pick the story; Claude writes and fact-checks `script.txt` and `sources.md` in `episodes/NN-name/`.
2. Actions → **Make voiceover** (episode `NN-name`). Listen to `voice.mp3` in the repo; re-run with a tweaked script or `voice.json` if needed.
3. Claude writes the shot plan, world, cast and audio cues from `timing/phrases.txt`, checks stills, commits.
4. Actions → **Render episode**. Download the `video` artifact and watch it.
5. Post (manual now; API upload next).

## Secrets (Settings → Secrets and variables → Actions)

- `ELEVENLABS_API_KEY`: from ElevenLabs profile → API keys.
- `ELEVENLABS_VOICE_ID`: the ID of the channel voice (Voices → the voice → copy ID). Keep it the same for every episode.

Never put keys in files or chat; secrets are hidden from logs and from forks of the public repo.

## Why a human stays in the loop

YouTube's monetization policy excludes mass-produced or repetitive content. Each episode keeps its own story, staging and writing, and every fact is checked before posting.
