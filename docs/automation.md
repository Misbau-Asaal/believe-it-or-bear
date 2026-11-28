# Automation plan

Goal: script in, posted video out. One click renders and schedules both platforms, and you keep a window to watch it first.

## The pipeline today

| Step | Status | How |
|---|---|---|
| Story and script | human + Claude | Picked and fact-checked per episode (`episodes/NN-name/script.txt` + `sources.md`) |
| Voiceover | built | Free and automatic: the render build speaks `script.txt` with Kokoro (`tools/voice_local.py`, voice am_michael). Write years as you want them said with `voice.json` `"say"` (e.g. `"1945": "nineteen forty-five"`) |
| End card | built | `tools/outro.py`: bear + FOLLOW / like / bell, about 2.5 s, on by default (`outro.json` to change) |
| Shot plan, world, cast | Claude | `story.js`, `world.js`, `cast.js`, `audio.py` written per episode from the timing; staging differs every time |
| Render + encode + QA | built | **Actions → Render episode**: parallel shards, locked audio levels, MP4 as the `video` artifact and in the release `ep-<episode>` |
| YouTube | built | Same run. `publish: auto` uploads it private and scheduled to go public at 6 PM New York time on the episode's day in `episodes/schedule.json` (`tools/slot.py`; see `docs/lineup.md`); `manual` leaves it private for you to publish |
| TikTok | built | Same run. `auto` schedules it through Buffer for the same minute, with the caption; without Buffer (or if Buffer refuses) it lands in your TikTok inbox as a draft |
| Human check | you | Watch the private video in YouTube Studio before it goes live. To stop it: set it to Private in YouTube Studio and delete the post in Buffer |
| Instagram | off | The account was disabled by Meta |

## Episode loop

1. Pick the story; Claude writes and fact-checks `script.txt` and `sources.md` in `episodes/NN-name/`.
2. Claude generates the free voice from the script (same text always gives the same audio), times the phrases and writes the shot plan, world, cast and audio cues, checks stills, commits.
3. Actions → **Render episode** (publish: auto). That's all: it goes live on its day from `episodes/schedule.json`, and the run summary says when.

## Why Buffer for TikTok

TikTok's own Content Posting API only lets unaudited apps post privately, and its guidelines don't accept tools that upload to your own accounts, so our app can't be audited for public posts. Buffer is an approved TikTok partner. Its free plan (3 channels, 10 scheduled posts per channel) and its API (on every plan) post publicly with the caption at a set time. Our own TikTok app stays as the fallback (inbox draft).

Buffer setup (once): sign up at buffer.com, connect the Believe It Or Bear TikTok account as a channel, then Settings → API → create a key and save it as the repo secret `BUFFER_API_KEY`.

## Changing the go-live time

`tools/slot.py` takes the episode's day from `episodes/schedule.json` and publishes at 18:00 New York time (summer and winter time handled). An episode with no day, or whose day is less than 4 hours away or past, gets the next day no other episode has, so two episodes never share a day. Change it with workflow env `SLOT_TIME` (e.g. `"20:00"`), `SLOT_TZ` or `SLOT_LEAD_HOURS`.

## Secrets (Settings → Secrets and variables → Actions)

- YouTube (see `docs/youtube_setup.md`): `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`.
- TikTok through Buffer: `BUFFER_API_KEY`.
- TikTok inbox fallback (our sandbox app): `TT_CLIENT_KEY`, `TT_CLIENT_SECRET`, `TT_REFRESH_TOKEN` (saved by the login run), and `GH_PAT` so rotated logins can be saved back.
- The free voice needs no secrets. `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID` are only for the old ElevenLabs route and can be deleted.

Never put keys in files or chat; secrets are hidden from logs and from forks of the public repo.

## Why a human stays in the loop

YouTube's monetization policy excludes mass-produced or repetitive content. Each episode keeps its own story, staging and writing, every fact is checked, and you get a window to watch it before it goes live.
