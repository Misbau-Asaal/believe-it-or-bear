# YouTube auto-upload: one-time setup (about 15 minutes)

After this, **Actions → Render episode** renders the video and uploads it to the channel as **private**,
with the title, description and tags from `episodes/<NN-name>/post.json`. You watch it in YouTube Studio and press Publish.
That is the one human check before anything goes public.

You need: the Google account that owns the Believe It Or Bear channel, and the GitHub repo open in a browser.

## 1. Create a Google Cloud project and turn on the YouTube API
1. Go to https://console.cloud.google.com and sign in with the channel's Google account.
2. Top bar → project picker → **New project** → name it `believe-it-or-bear` → Create, then select it.
3. Search bar → **YouTube Data API v3** → **Enable**.

## 2. Set up the consent screen
1. Search bar → **Google Auth Platform** (or "OAuth consent screen") → **Get started**.
2. App name `Believe It Or Bear Uploader`, your email as support and developer contact. Audience: **External**. Create.
3. Open **Audience** → **Publish app** → Confirm.
   Leave it in Testing and the upload key stops working after 7 days.
   You do not need Google verification. You will see an "unverified app" warning once, in step 4.

## 3. Create the OAuth client
1. **Clients** → **Create client** → type **Web application**, name `uploader`.
2. Under **Authorized redirect URIs** add exactly: `https://developers.google.com/oauthplayground`
3. Create. Copy the **Client ID** and **Client secret**. Keep them private.

## 4. Get the refresh token (OAuth Playground)
1. Open https://developers.google.com/oauthplayground
2. Gear icon (top right) → tick **Use your own OAuth credentials** → paste the Client ID and Client secret → Close.
3. In the left box "Input your own scopes", paste: `https://www.googleapis.com/auth/youtube.upload` → **Authorize APIs**.
4. Sign in with the channel's account. If it asks which channel, pick **Believe It Or Bear**.
   On "Google hasn't verified this app" click **Advanced → Go to Believe It Or Bear Uploader (unsafe)** → **Continue / Allow**.
   It's your own app, so this is expected.
5. Back in the Playground, click **Exchange authorization code for tokens**. Copy the **Refresh token**.

## 5. Save three secrets in GitHub
Repo → **Settings → Secrets and variables → Actions → New repository secret**, three times:

| Name | Value |
|---|---|
| `YT_CLIENT_ID` | the Client ID |
| `YT_CLIENT_SECRET` | the Client secret |
| `YT_REFRESH_TOKEN` | the refresh token |

Never paste these into chat, issues or files. Secrets are hidden from logs.

## 6. Update the render workflow (GitHub can't let Claude edit workflow files)
1. Open `docs/workflows/render.yml` in the repo → **Raw** → select all → copy.
2. Open `.github/workflows/render.yml` → pencil (Edit) → select all → paste → **Commit changes**.

## 7. Try it
**Actions → Render episode → Run workflow**: episode `03-emu-war`, upload `private`. Leave the title empty.
When the run is green, the summary shows the YouTube link. The video is waiting, private, in YouTube Studio → Content.
Watch it, then set it to Public (or schedule it).

Options:
- `upload: unlisted` or `public` skips the private step. `none` only renders.
- In `post.json`, `"publish_at": "2026-12-05T11:00:00Z"` schedules the video to go public by itself (keep privacy `private`).
- `"synthetic": true` turns on YouTube's "altered or synthetic content" label. YouTube asks for it on realistic content.
  These are clearly animated cartoons, so it is off by default.

If an upload fails with `invalid_grant`, the refresh token was revoked or expired. Redo step 4 and update `YT_REFRESH_TOKEN`.
