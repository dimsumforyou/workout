# Iron Log — Pure Bodybuilding U/L Tracker

Single-file, mobile-first tracker for Jeff Nippard's Pure Bodybuilding Upper/Lower program, pre-loaded with your Weeks 1–10 logs from the Google Sheet.

## Host on GitHub Pages (2 min)

1. Create a repo (e.g. `iron-log`) and drop `index.html` in the root.
2. Repo → **Settings → Pages** → Source: `Deploy from a branch` → branch `main`, folder `/ (root)` → Save.
3. Your app is live at `https://<username>.github.io/iron-log/`.
4. On your phone, open it in Safari/Chrome → **Add to Home Screen**. It runs full-screen like a native app.

## How data works

- Logs save automatically to the browser's local storage on your phone — no backend, nothing leaves your device.
- **Data tab → Export backup** downloads a JSON snapshot. Do this occasionally; clearing browser data or switching phones wipes local storage. **Import backup** restores it.
- **Start next cycle** rolls the program back to Week 1 as Cycle 2 without touching history — charts and "Last session" lines run continuously across cycles. No more new sheets.

## Notes

- Week 1 and Week 6 render as intro/deload weeks (RPE ~7–9, fewer working sets), matching the program.
- Tapping the rest chip or checking off a set starts a rest countdown (with vibration on finish, where supported).
- Program content © Jeff Nippard — this is a personal tracking tool for your own purchased copy.
