#!/usr/bin/env python3
"""Upload a finished short to YouTube (Data API v3, resumable upload). Standard library only.

  python3 tools/youtube_upload.py <video.mp4> <episodes/NN-name/post.json> [--privacy private|unlisted|public]

Credentials come from the environment (GitHub secrets): YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN.
If they are missing the script says so and exits 0, so renders still succeed before YouTube is set up.

post.json: {"title": "...", "description": "...", "tags": [...], "category": "27",
            "privacy": "private", "publish_at": "2026-12-01T12:00:00Z" (optional, needs privacy private),
            "synthetic": false, "made_for_kids": false}
Default privacy is private: the video waits in YouTube Studio until you watch it and press Publish (the human check)."""
import json, os, sys, time, urllib.error, urllib.parse, urllib.request

TOKEN_URL = os.environ.get("YT_TOKEN_URL", "https://oauth2.googleapis.com/token")
UPLOAD_URL = os.environ.get("YT_UPLOAD_URL", "https://www.googleapis.com/upload/youtube/v3/videos")

def call(req, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=600) as r: return r.status, dict(r.headers), r.read()
        except urllib.error.HTTPError as e:
            body = e.read().decode(errors="replace")
            if e.code >= 500 and i < tries - 1: time.sleep(5 * (i + 1)); continue
            sys.exit(f"YouTube returned {e.code}: {body[:600]}")
        except (urllib.error.URLError, TimeoutError) as e:
            if i < tries - 1: time.sleep(5 * (i + 1)); continue
            sys.exit(f"network error: {e}")

def main():
    a = sys.argv[1:]
    if len(a) < 2: sys.exit(__doc__)
    video, post_path = a[0], a[1]
    privacy = a[a.index("--privacy") + 1] if "--privacy" in a else None
    cid, secret, refresh = (os.environ.get(k, "").strip() for k in ("YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN"))
    if not (cid and secret and refresh):
        print("YouTube upload skipped: add the YT_CLIENT_ID, YT_CLIENT_SECRET and YT_REFRESH_TOKEN secrets (docs/youtube_setup.md)."); return
    post = json.load(open(post_path))
    privacy = privacy or post.get("privacy", "private")
    if privacy == "none": print("YouTube upload skipped (privacy: none)."); return

    # 1) a fresh access token from the stored refresh token
    data = urllib.parse.urlencode({"client_id": cid, "client_secret": secret, "refresh_token": refresh, "grant_type": "refresh_token"}).encode()
    _, _, body = call(urllib.request.Request(TOKEN_URL, data=data, method="POST"))
    token = json.loads(body)["access_token"]

    # 2) start a resumable upload with the metadata
    status = {"privacyStatus": privacy, "selfDeclaredMadeForKids": bool(post.get("made_for_kids", False)),
              "containsSyntheticMedia": bool(post.get("synthetic", False))}
    if post.get("publish_at") and privacy == "private": status["publishAt"] = post["publish_at"]
    meta = {"snippet": {"title": post["title"][:100], "description": post.get("description", "")[:5000], "tags": post.get("tags", []),
                        "categoryId": str(post.get("category", "27")), "defaultLanguage": "en", "defaultAudioLanguage": "en"},
            "status": status}
    size = os.path.getsize(video)
    req = urllib.request.Request(UPLOAD_URL + "?uploadType=resumable&part=snippet,status", data=json.dumps(meta).encode(), method="POST",
                                 headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json; charset=UTF-8",
                                          "X-Upload-Content-Type": "video/mp4", "X-Upload-Content-Length": str(size)})
    _, headers, _ = call(req)
    where = headers.get("Location") or headers.get("location")
    if not where: sys.exit("YouTube did not return an upload URL")

    # 3) send the file
    with open(video, "rb") as f: blob = f.read()
    _, _, body = call(urllib.request.Request(where, data=blob, method="PUT", headers={"Authorization": f"Bearer {token}", "Content-Type": "video/mp4"}))
    vid = json.loads(body)["id"]
    lines = [f"Uploaded to YouTube as **{privacy}**: https://youtu.be/{vid}",
             f"Review and publish in YouTube Studio: https://studio.youtube.com/video/{vid}/edit"]
    if status.get("publishAt"): lines.append(f"Scheduled to go public at {status['publishAt']}.")
    print("\n".join(lines))
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as s: s.write("\n### YouTube\n" + "\n\n".join(lines) + "\n")

if __name__ == "__main__":
    main()
