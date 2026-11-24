# Automation plan

Goal: script in, posted video out, with one human approval step before anything goes public.

| Step | Status | How |
|---|---|---|
| Script | human | Written and fact-checked per episode (`episodes/NN-name/script.txt` + `sources.md`) |
| Voiceover | to build | ElevenLabs API from `script.txt`; API key in GitHub repo secrets |
| Timing, music, SFX, mix | done | `timing.py`, `audio.py`, `mix.py` |
| Shot plan | partly | `story.js` written per episode; staging differs every time |
| Render + encode | to build | GitHub Actions workflow on push of an episode folder; MP4 as a workflow artifact |
| Post to YouTube | to build | YouTube Data API (videos.insert) after approval |
| Post to TikTok | later | Content Posting API; posts stay private until TikTok audits the app |
| Post to Instagram | later | Meta API with the professional account |

Build order: render on Actions, then voiceover from the API, then auto-post to YouTube, then TikTok and Instagram.
