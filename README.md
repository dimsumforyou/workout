# Iron Log — Pure Bodybuilding U/L Tracker

Single-file, mobile-first tracker for Jeff Nippard's Pure Bodybuilding Upper/Lower program, pre-loaded with your Weeks 1–10 logs from the Google Sheet.

## Host on GitHub Pages (2 min)

1. Create a repo (e.g. `iron-log`) and drop `index.html` in the root.
2. Repo → **Settings → Pages** → Source: `Deploy from a branch` → branch `main`, folder `/ (root)` → Save.
3. Your app is live at `https://<username>.github.io/iron-log/`.
4. On your phone, open it in Safari/Chrome → **Add to Home Screen**. It runs full-screen like a native app.

## Cloud sync via Google Sheet (optional, recommended)

Makes your logs live across phone + laptop, with the Google Sheet as your personal backend. One-time setup (~3 min):

1. Create a new Google Sheet (e.g. "Iron Log Data").
2. **Extensions → Apps Script** → delete the sample code → paste in `Code.gs` from this repo.
3. Change `SECRET` in the script to your own random string.
4. **Deploy → New deployment → Web app** → Execute as: **Me** · Who has access: **Anyone** → Deploy, authorize, copy the URL ending in `/exec`.
5. In Iron Log → **Data tab → Cloud sync**: paste the URL and your secret → **Connect**. This just saves your credentials — it doesn't upload or download anything by itself. Two buttons then appear: **Download from sheet** (brings the sheet's data onto this device, only if the sheet's copy is newer) and **Upload to sheet** (sends this device's data to the sheet, overwriting what's there). Use Download first on a new device to check for existing data before Uploading.

From then on: every logged set auto-uploads to the sheet in the background (2.5s debounce), the app auto-downloads on open and whenever you return to the tab, and newest data wins — the Data tab shows "This device's data last changed: X ago" so you can see which way a manual Download/Upload would go. The script manages two tabs automatically: **data** (raw state, chunked across rows to stay under Sheets' 50k-per-cell limit — years of logs are fine; don't hand-edit) and **log** (human-readable mirror: one row per exercise per session with cycle, week, day, sets, top set, and notes — regenerated on every sync).

### If you edit the script later

Saving the script in the Apps Script editor does **not** update the live `/exec` URL. Any time you change `Code.gs` (a new `SECRET`, a bug fix, whatever), you must push a new version to the *existing* deployment:

**Deploy → Manage deployments → pencil icon → Version: New version → Deploy.**

This keeps the same `/exec` URL, so you don't need to update anything in the app. Using **Deploy → New deployment** instead creates a brand-new, different URL — if you do that, you'll need to paste the new URL into the app's Cloud sync field again.

### Troubleshooting

- **Status shows "error" with a message like `bad token`:** the secret pasted into the app doesn't match `SECRET` in the deployed script exactly. Re-copy it — special characters (`&`, `*`, etc.) are fine, the app handles them for you.
- **Status shows "error" with `read failed: ...`:** something non-JSON ended up in the `data` tab (a stray label, a manually typed cell). Select all the content in that tab and delete it, then tap **Upload to sheet** — the next successful upload will repopulate it correctly.
- **Want to check the backend directly, bypassing the app?** Visit `your-exec-url?token=your-secret` in a browser (URL-encode special characters in the secret, e.g. `&` → `%26`, `*` → `%2A`). You'll get the raw JSON response: `{"state": null}` means nothing's synced yet, `{"state": {...}}` means it's working, `{"error": "bad token"}` means the token doesn't match.
- **Double-check you're editing the right script.** Opening `script.google.com` directly lists all your Apps Script projects — container-bound scripts show up there too, but a brand-new "Untitled project" you accidentally created isn't connected to your Sheet at all. Open Apps Script *from inside the actual Sheet* (Extensions → Apps Script) to be sure you're editing the one that's actually deployed.

### Security — who can touch your data

- **The web app URL alone is useless without the secret.** Every read and write requires `token` to match `SECRET` in the script; wrong or missing token gets `{error: 'bad token'}` and nothing else. "Anyone has access" in the deploy settings just means Google doesn't require a sign-in — your secret is the actual lock.
- **Never commit the secret to the repo.** It lives only in the script (your Google account) and in your browser's storage after you hit Connect. The `Code.gs` in a public repo should keep the placeholder value.
- **The GitHub Pages site being public is fine** — anyone who finds it just gets a blank copy of the app writing to their own browser storage. They can't see or touch your logs without your `/exec` URL *and* secret.
- The Google Sheet itself follows normal Drive sharing — keep it private (default) and only you can open it.
- If you ever suspect the secret leaked: change `SECRET` in the script, redeploy (new version), and update it in the app. Old token stops working instantly.

Site updates are separate from data — pushing a new `index.html` to GitHub never touches your logs.

## Swapping an exercise (machine taken, equipment broken, etc.)

Tap any exercise title in the Train tab — it expands a swap panel right under it:

- **Sub options** — pulled straight from Nippard's own substitution list for that slot, so you're always picking something built for the same target/purpose.
- **+ New exercise** — type in anything not listed (e.g. a home-gym stand-in). It's saved permanently to that slot's dropdown, so it's there to pick again in any future week without retyping.
- The sets/reps/RPE/rest prescription stays the same as the slot calls for — only the movement changes.
- The swap applies to that specific week's session only; other weeks keep showing the default (or whatever you separately picked for them). A gold "swapped" tag marks any session where you're off the default, and tapping the original name again resets it.
- Progress is tracked per-movement, so a substitute builds its own chart in the Progress tab rather than muddying the main lift's history — pick the swapped name from the exercise picker there to see it.

## How data works

- Logs save automatically to the browser's local storage on your phone — no backend, nothing leaves your device.
- **Data tab → Export backup** downloads a JSON snapshot. Do this occasionally; clearing browser data or switching phones wipes local storage. **Import backup** restores it.
- **Start next cycle** rolls the program back to Week 1 as Cycle 2 without touching history — charts and "Last session" lines run continuously across cycles. No more new sheets.

## Notes

- Week 1 and Week 6 render as intro/deload weeks (RPE ~7–9, fewer working sets), matching the program.
- Tapping the rest chip or checking off a set starts a rest countdown (with vibration on finish, where supported).
- Program content © Jeff Nippard — this is a personal tracking tool for your own purchased copy.
