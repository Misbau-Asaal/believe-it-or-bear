#!/usr/bin/env python3
"""Voiceover from an episode script with the ElevenLabs API.

  ELEVENLABS_API_KEY=... ELEVENLABS_VOICE_ID=... python3 tools/voice.py episodes/03-name [--model eleven_v4]

Reads <episode>/script.txt, writes <episode>/voice.mp3. Optional <episode>/voice.json overrides the defaults below,
e.g. {"model_id": "eleven_v4", "voice_settings": {"stability": 0.5, "speed": 1.05}}.
Blank lines in the script are kept as paragraph breaks, which the voice reads as longer pauses.
No third-party packages: urllib only."""
import json, os, sys, urllib.request, urllib.error

DEFAULTS = {"model_id": "eleven_v4",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "speed": 1.05, "use_speaker_boost": True}}
API = os.environ.get("ELEVENLABS_API_URL", "https://api.elevenlabs.io")

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args: sys.exit("usage: voice.py <episode folder> [--model MODEL]")
    ep = args[0].rstrip("/")
    key, voice = os.environ.get("ELEVENLABS_API_KEY"), os.environ.get("ELEVENLABS_VOICE_ID")
    if not key or not voice: sys.exit("missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID (set them as GitHub repository secrets)")
    text = open(os.path.join(ep, "script.txt"), encoding="utf-8").read().strip()
    if not text: sys.exit(f"{ep}/script.txt is empty")
    cfg = json.loads(json.dumps(DEFAULTS))
    if os.path.exists(os.path.join(ep, "voice.json")):
        extra = json.load(open(os.path.join(ep, "voice.json")))
        cfg["voice_settings"].update(extra.pop("voice_settings", {})); cfg.update(extra)
    if "--model" in sys.argv: cfg["model_id"] = sys.argv[sys.argv.index("--model") + 1]
    body = json.dumps({"text": text, **cfg}).encode()
    req = urllib.request.Request(f"{API}/v1/text-to-speech/{voice}?output_format=mp3_44100_128", data=body, method="POST",
                                 headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"})
    try:
        with urllib.request.urlopen(req, timeout=300) as r: audio = r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs returned {e.code}: {e.read().decode(errors='replace')[:500]}")
    if len(audio) < 2000: sys.exit(f"ElevenLabs returned only {len(audio)} bytes; not saving")
    open(os.path.join(ep, "voice.mp3"), "wb").write(audio)
    print(f"wrote {ep}/voice.mp3 ({len(audio) // 1024} KB) with {cfg['model_id']}, {len(text.split())} words")

if __name__ == "__main__": main()
