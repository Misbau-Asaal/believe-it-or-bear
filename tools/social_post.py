#!/usr/bin/env python3
"""Post a finished episode to TikTok (scheduled through Buffer, or as a draft in the TikTok inbox) and Instagram (Reel).
Standard library + PyNaCl.

  python3 tools/social_post.py publish <NN-name> [tiktok|buffer|instagram|...] [--at 2026-12-01T23:00:00Z]
      tiktok    the video lands in your TikTok inbox; you add the caption and post in the app
      buffer    Buffer posts it on TikTok by itself, with the caption, at --at (or in 5 minutes);
                falls back to the inbox draft if Buffer isn't set up or refuses
  python3 tools/social_post.py refresh            (keeps the Instagram and TikTok logins alive; run weekly)
  python3 tools/social_post.py tiktok-login <code> (one time: turns the code from the TikTok login page into TT_REFRESH_TOKEN)

The video comes from the GitHub release `ep-<NN-name>` that the render workflow creates (a public URL Instagram can fetch).
Caption: post.json "caption", else its description.

Environment (GitHub secrets):
  IG_TOKEN                        Instagram long-lived token (Instagram API with Instagram Login), valid 60 days, refreshed here
  TT_CLIENT_KEY, TT_CLIENT_SECRET TikTok app keys
  TT_REFRESH_TOKEN                TikTok refresh token (valid 365 days, rotated here)
  BUFFER_API_KEY                  Buffer API key (publish.buffer.com/settings/api); the TikTok channel connected in Buffer is used
                                  (or BUFFER_CHANNEL_ID to pick one)
  GH_PAT                          fine-grained GitHub token with "Secrets: read and write" on this repo, so refreshed tokens
                                  can be saved back into the secrets
  GITHUB_REPOSITORY               set by GitHub Actions
Missing secrets for a platform = that platform is skipped with a message (never a crash)."""
import base64, json, os, sys, time, urllib.error, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone

IG_API = os.environ.get("IG_API", "https://graph.instagram.com/v23.0")
IG_REFRESH = os.environ.get("IG_REFRESH_URL", "https://graph.instagram.com/refresh_access_token")
TT_API = os.environ.get("TT_API", "https://open.tiktokapis.com/v2")
GH_API = os.environ.get("GH_API", "https://api.github.com")
BUFFER_API = os.environ.get("BUFFER_API", "https://api.buffer.com")
REPO = os.environ.get("GITHUB_REPOSITORY", "Misbau-Asaal/believe-it-or-bear")
env = lambda k: os.environ.get(k, "").strip()

def http(url, data=None, method=None, headers=None, form=False, raw=False, tries=3):
    h = dict(headers or {})
    if data is not None and not isinstance(data, bytes):
        if form: data = urllib.parse.urlencode(data).encode(); h.setdefault("Content-Type", "application/x-www-form-urlencoded")
        else: data = json.dumps(data).encode(); h.setdefault("Content-Type", "application/json; charset=UTF-8")
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, data=data, method=method, headers=h), timeout=600) as r:
                body = r.read(); return (r, body) if raw else (json.loads(body) if body.strip() else {})
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="replace")
            if e.code >= 500 and i < tries - 1: time.sleep(5 * (i + 1)); continue
            raise RuntimeError(f"{method or ('POST' if data else 'GET')} {url.split('?')[0]} -> {e.code}: {msg[:500]}")
        except urllib.error.URLError as e:
            if i < tries - 1: time.sleep(5 * (i + 1)); continue
            raise RuntimeError(f"network error: {e}")

def summary(line):
    print(line)
    if env("GITHUB_STEP_SUMMARY"):
        with open(env("GITHUB_STEP_SUMMARY"), "a") as s: s.write(line + "\n\n")

def save_secret(name, value):
    """Store a rotated token back into the repo's Actions secrets (needs GH_PAT)."""
    pat = env("GH_PAT")
    if not pat: summary(f"⚠️ {name} was refreshed but GH_PAT is missing, so the new value could not be saved."); return False
    from nacl import encoding, public
    h = {"Authorization": f"Bearer {pat}", "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    key = http(f"{GH_API}/repos/{REPO}/actions/secrets/public-key", headers=h)
    box = public.SealedBox(public.PublicKey(key["key"].encode(), encoding.Base64Encoder()))
    enc = base64.b64encode(box.encrypt(value.encode())).decode()
    http(f"{GH_API}/repos/{REPO}/actions/secrets/{name}", {"encrypted_value": enc, "key_id": key["key_id"]}, method="PUT", headers=h)
    return True

# ---------------- release (where the video lives) ----------------
def release_video(ep):
    tag = f"ep-{ep}"
    url = f"{os.environ.get('RELEASE_BASE', f'https://github.com/{REPO}/releases/download')}/{tag}/{ep}.mp4"
    # Instagram fetches the URL itself; hand it the final (redirected) download address
    req = urllib.request.Request(url, method="HEAD")
    try:
        with urllib.request.urlopen(req, timeout=60) as r: final = r.geturl()
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"no video at {url} ({e.code}). Render the episode first; the render workflow uploads it to the release {tag}.")
    return url, final

def download(url, path):
    with urllib.request.urlopen(url, timeout=600) as r, open(path, "wb") as f: f.write(r.read())
    return path

# ---------------- Instagram ----------------
def ig_refresh():
    tok = env("IG_TOKEN")
    if not tok: print("Instagram: no IG_TOKEN, skipped."); return None
    r = http(f"{IG_REFRESH}?" + urllib.parse.urlencode({"grant_type": "ig_refresh_token", "access_token": tok}))
    new = r.get("access_token")
    if new and new != tok: save_secret("IG_TOKEN", new)
    days = int(r.get("expires_in", 0)) // 86400
    print(f"Instagram: token refreshed, valid for {days} more days.")
    return new or tok

def ig_publish(ep, post, video_url):
    tok = ig_refresh()
    if not tok: return
    me = http(f"{IG_API}/me?" + urllib.parse.urlencode({"fields": "user_id,username", "access_token": tok}))
    uid = me.get("user_id") or me.get("id")
    caption = post.get("caption") or post.get("description", "")
    c = http(f"{IG_API}/{uid}/media", {"media_type": "REELS", "video_url": video_url, "caption": caption[:2200], "share_to_feed": "true", "access_token": tok}, form=True)
    cid = c["id"]
    for i in range(40):                       # up to 10 minutes for Instagram to process the video
        time.sleep(15)
        st = http(f"{IG_API}/{cid}?" + urllib.parse.urlencode({"fields": "status_code,status", "access_token": tok}))
        if st.get("status_code") == "FINISHED": break
        if st.get("status_code") in ("ERROR", "EXPIRED"): raise RuntimeError(f"Instagram could not process the video: {st}")
    else: raise RuntimeError("Instagram is still processing after 10 minutes; try again later.")
    pub = http(f"{IG_API}/{uid}/media_publish", {"creation_id": cid, "access_token": tok}, form=True)
    link = ""
    try: link = http(f"{IG_API}/{pub['id']}?" + urllib.parse.urlencode({"fields": "permalink", "access_token": tok})).get("permalink", "")
    except RuntimeError: pass
    summary(f"Instagram: posted as a Reel on @{me.get('username', '?')} {link}")

# ---------------- TikTok ----------------
def tt_token():
    key, sec, ref = env("TT_CLIENT_KEY"), env("TT_CLIENT_SECRET"), env("TT_REFRESH_TOKEN")
    if not (key and sec and ref): print("TikTok: TT_CLIENT_KEY / TT_CLIENT_SECRET / TT_REFRESH_TOKEN missing, skipped."); return None
    r = http(f"{TT_API}/oauth/token/", {"client_key": key, "client_secret": sec, "grant_type": "refresh_token", "refresh_token": ref}, form=True)
    if "access_token" not in r: raise RuntimeError(f"TikTok token refresh failed: {r}")
    if r.get("refresh_token") and r["refresh_token"] != ref: save_secret("TT_REFRESH_TOKEN", r["refresh_token"])
    print(f"TikTok: login refreshed (refresh token valid {int(r.get('refresh_expires_in', 0)) // 86400} more days).")
    return r["access_token"]

def tt_caption(post):
    """Caption to paste in the TikTok app: post.json "tiktok_caption", else the title (without #shorts) + the hashtag line."""
    if post.get("tiktok_caption"): return post["tiktok_caption"]
    title = post.get("title", "").replace("#shorts", "").strip()
    tags = [l.strip() for l in post.get("description", "").splitlines() if l.strip().startswith("#")]
    tags = " ".join(tags[-1].split()[:5]) if tags else ""          # Buffer/TikTok: at most 5 hashtags
    return title + ("\n\n" + tags if tags else "")

def tt_draft(ep, path, post=None):
    tok = tt_token()
    if not tok: return
    size = os.path.getsize(path)
    chunk = size if size <= 64_000_000 else 10_000_000            # TikTok: one chunk up to 64 MB, otherwise 5-64 MB chunks
    count = max(1, size // chunk)                                  # the last chunk carries the remainder
    h = {"Authorization": f"Bearer {tok}"}
    init = http(f"{TT_API}/post/publish/inbox/video/init/", {"source_info": {"source": "FILE_UPLOAD", "video_size": size, "chunk_size": chunk, "total_chunk_count": count}}, headers=h)
    if init.get("error", {}).get("code", "ok") != "ok": raise RuntimeError(f"TikTok init failed: {init['error']}")
    up, pid = init["data"]["upload_url"], init["data"]["publish_id"]
    with open(path, "rb") as f: blob = f.read()
    for i in range(count):
        a = i * chunk; b = size if i == count - 1 else a + chunk
        http(up, blob[a:b], method="PUT", raw=True, headers={"Content-Type": "video/mp4", "Content-Range": f"bytes {a}-{b - 1}/{size}", "Content-Length": str(b - a)})
    for i in range(40):
        time.sleep(10)
        st = http(f"{TT_API}/post/publish/status/fetch/", {"publish_id": pid}, headers=h)
        s = st.get("data", {}).get("status")
        if s in ("SEND_TO_USER_INBOX", "PUBLISH_COMPLETE"): break
        if s == "FAILED": raise RuntimeError(f"TikTok processing failed: {st}")
    summary("TikTok: sent to your TikTok inbox as a draft. Open TikTok → Inbox → the upload notification, paste this caption, and post:")
    summary("```\n" + tt_caption(post or {}) + "\n```")


# ---------------- TikTok through Buffer (posts publicly, with the caption, at a set time) ----------------
def gql(query):
    key = env("BUFFER_API_KEY")
    r = http(BUFFER_API, {"query": query}, headers={"Authorization": f"Bearer {key}"})
    if r.get("errors"): raise RuntimeError(f"Buffer: {r['errors'][0].get('message', r['errors'])}")
    return r.get("data", {})
def gstr(v): return json.dumps(v, ensure_ascii=False)          # a JSON string is a valid GraphQL string literal
def buffer_channel():
    if env("BUFFER_CHANNEL_ID"): return env("BUFFER_CHANNEL_ID"), "?"
    orgs = gql("query { account { organizations { id name } } }")["account"]["organizations"]
    for o in orgs:
        chans = gql(f"query {{ channels(input: {{ organizationId: {gstr(o['id'])} }}) {{ id name displayName service }} }}")["channels"]
        for c in chans:
            if "tiktok" in str(c.get("service", "")).lower(): return c["id"], c.get("displayName") or c.get("name") or "?"
    raise RuntimeError("Buffer: no TikTok channel connected. In Buffer, connect the Believe It Or Bear TikTok account first.")
def buffer_schedule(ep, post, video_url, at=""):
    if not env("BUFFER_API_KEY"): print("Buffer: no BUFFER_API_KEY secret, so TikTok goes to your inbox as a draft instead."); return False
    cid, name = buffer_channel()
    if not at: at = (datetime.now(timezone.utc) + timedelta(minutes=5)).strftime("%Y-%m-%dT%H:%M:%SZ")   # no time given: in 5 minutes
    when = f"mode: customScheduled, dueAt: {gstr(at)}"
    q = (f"mutation {{ createPost(input: {{ channelId: {gstr(cid)}, text: {gstr(tt_caption(post))}, schedulingType: automatic, {when}, "
         f"assets: [{{ video: {{ url: {gstr(video_url)}, metadata: {{ thumbnailOffset: 1500 }} }} }}] }}) "
         "{ ... on PostActionSuccess { post { id dueAt } } ... on MutationError { message } } }")
    r = gql(q).get("createPost") or {}
    if r.get("message") or not r.get("post"): raise RuntimeError(f"Buffer refused the post: {r.get('message', r)}")
    summary(f"TikTok: scheduled through Buffer on {name} for {r['post'].get('dueAt') or at or 'now'} (UTC), with the caption. "
            "Nothing to do in the TikTok app. To cancel, delete it in Buffer.")
    return True

TT_REDIRECT = os.environ.get("TT_REDIRECT", "https://misbau-asaal.github.io/believe-it-or-bear/tiktok.html")
def tt_login(code):
    key, sec = env("TT_CLIENT_KEY"), env("TT_CLIENT_SECRET")
    if not (key and sec): sys.exit("add the TT_CLIENT_KEY and TT_CLIENT_SECRET secrets first")
    r = http(f"{TT_API}/oauth/token/", {"client_key": key, "client_secret": sec, "code": urllib.parse.unquote(code.strip()),
                                        "grant_type": "authorization_code", "redirect_uri": TT_REDIRECT}, form=True)
    if "refresh_token" not in r: sys.exit(f"TikTok did not accept the code (they expire after a few minutes, log in again): {r}")
    if not save_secret("TT_REFRESH_TOKEN", r["refresh_token"]): sys.exit(1)
    summary(f"TikTok: logged in (scopes: {r.get('scope', '?')}). TT_REFRESH_TOKEN saved; it stays valid while the weekly refresh runs.")

# ---------------- main ----------------
def main():
    a = sys.argv[1:]
    if not a: sys.exit(__doc__)
    if a[0] == "tiktok-login": return tt_login(a[1])
    if a[0] == "refresh":
        errs = []
        for f in (ig_refresh, tt_token):
            try: f()
            except Exception as e: errs.append(str(e)); print(e)
        if errs: sys.exit(1)
        return
    at = a[a.index("--at") + 1] if "--at" in a and a.index("--at") + 1 < len(a) else ""
    rest = [x for i, x in enumerate(a) if x != "--at" and (i == 0 or a[i - 1] != "--at")]
    ep = rest[1]; targets = (rest[2] if len(rest) > 2 else "tiktok").split(",")
    post = json.load(open(f"episodes/{ep}/post.json"))
    try: url, final = release_video(ep)
    except RuntimeError as e: sys.exit(str(e))
    errs = []
    if "instagram" in targets:
        try: ig_publish(ep, post, final)
        except Exception as e: errs.append(f"Instagram: {e}"); summary(f"❌ Instagram: {e}")
    if "buffer" in targets:
        done = False
        try: done = buffer_schedule(ep, post, url, at)
        except Exception as e: summary(f"⚠️ {e}. Sending TikTok to your inbox as a draft instead.")
        if not done and "tiktok" not in targets: targets.append("tiktok")
    if "tiktok" in targets:
        try: tt_draft(ep, download(url, f"/tmp/{ep}.mp4"), post)
        except Exception as e: errs.append(f"TikTok: {e}"); summary(f"❌ TikTok: {e}")
    if errs: sys.exit(1)

if __name__ == "__main__":
    main()
