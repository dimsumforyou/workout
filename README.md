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
5. In Iron Log → **Data tab → Cloud sync**: paste the URL and your secret → **Connect**.

From then on: every logged set auto-pushes to the sheet (2.5s debounce), the app pulls on open and whenever you return to the tab, and newest data wins. The script manages two tabs automatically: **data** (raw state, chunked across rows to stay under Sheets' 50k-per-cell limit — years of logs are fine; don't hand-edit) and **log** (human-readable mirror: one row per exercise per session with cycle, week, day, sets, top set, and notes — regenerated on every sync).

### Security — who can touch your data

- **The web app URL alone is useless without the secret.** Every read and write requires `token` to match `SECRET` in the script; wrong or missing token gets `{error: 'bad token'}` and nothing else. "Anyone has access" in the deploy settings just means Google doesn't require a sign-in — your secret is the actual lock.
- **Never commit the secret to the repo.** It lives only in the script (your Google account) and in your browser's storage after you hit Connect. The `Code.gs` in a public repo should keep the placeholder value.
- **The GitHub Pages site being public is fine** — anyone who finds it just gets a blank copy of the app writing to their own browser storage. They can't see or touch your logs without your `/exec` URL *and* secret.
- The Google Sheet itself follows normal Drive sharing — keep it private (default) and only you can open it.
- If you ever suspect the secret leaked: change `SECRET` in the script, redeploy (new version), and update it in the app. Old token stops working instantly.

Site updates are separate from data — pushing a new `index.html` to GitHub never touches your logs.

## How data works

- Logs save automatically to the browser's local storage on your phone — no backend, nothing leaves your device.
- **Data tab → Export backup** downloads a JSON snapshot. Do this occasionally; clearing browser data or switching phones wipes local storage. **Import backup** restores it.
- **Start next cycle** rolls the program back to Week 1 as Cycle 2 without touching history — charts and "Last session" lines run continuously across cycles. No more new sheets.

## Notes

- Week 1 and Week 6 render as intro/deload weeks (RPE ~7–9, fewer working sets), matching the program.
- Tapping the rest chip or checking off a set starts a rest countdown (with vibration on finish, where supported).
- Program content © Jeff Nippard — this is a personal tracking tool for your own purchased copy.
