# Overlook 2026 — Live Committee Ranking

A small web app for ranking the 2026 film slate. Each committee member opens one
URL, drags the 40 films into their order (1 = best), and submits. Everyone's
ballots land in one live list, and the app shows the combined ranking — updating
automatically as votes come in. You can export the final ranking to CSV.

It works for any number of voters and needs no Claude account.

**Privacy:** the server stores each person's ranking but only ever exposes the
*combined* result and the list of voter names — never how any individual ranked.

---

## What's in here

```
overlook-ranking/
  server.js          the web server (Node + Express)
  package.json       dependencies + start script
  films.json         the 40 films (the data the server validates against)
  public/index.html  the app voters see (films are baked in)
  .gitignore
  README.md          this file
```

---

## Option A — Deploy on Railway (recommended)

You'll need a free **GitHub** account and a **Railway** account (railway.app).

### 1. Put this project on GitHub
Easiest with no command line:
1. On GitHub, click **New repository**, name it e.g. `overlook-ranking`, create it.
2. On the empty repo page, click **uploading an existing file**.
3. Drag in `server.js`, `package.json`, `films.json`, `.gitignore`, `README.md`,
   and the `public` folder (keep `public/index.html` inside a `public` folder).
4. Commit.

(If you prefer the command line: `git init && git add . && git commit -m "init"`
then push to the new repo.)

### 2. Create the Railway service
1. In Railway: **New Project → Deploy from GitHub repo**, pick your repo.
2. Railway auto-detects Node, runs `npm install`, then `npm start`. Wait for the
   first deploy to finish.

### 3. Add a Volume so ballots survive redeploys *(important)*
Railway's normal disk is wiped on every redeploy. To keep votes:
1. Open your service → **Variables / Settings → + Volume** (or "Add Volume").
2. Set the **mount path** to `/data`.
3. Add an environment variable: `DATA_DIR` = `/data`.

Without this, a redeploy erases the ballots — fine for a quick test, not for a
real vote.

### 4. Set the admin key
Add an environment variable:
- `ADMIN_KEY` = *(any secret you choose, e.g. a long random string)*

This is what you'll type into "Organizer controls" to remove a ballot or clear a
round. Keep it to yourself. Without it set, those actions stay disabled.

### 5. Get the public URL
Service → **Settings → Networking → Generate Domain**. That URL
(e.g. `https://overlook-ranking-production.up.railway.app`) is what you send to
the committee.

After changing variables or adding the volume, Railway redeploys automatically.

---

## Option B — Run it on your own computer (for testing)

You need Node.js 18+ installed.

```bash
cd overlook-ranking
npm install
ADMIN_KEY=mysecret npm start
```

Open http://localhost:3000. (On Windows PowerShell:
`$env:ADMIN_KEY="mysecret"; npm start`.) Locally, ballots are saved to a `data/`
folder next to the server.

---

## How people use it

- **Rank the slate** tab: enter your name, drag the films into order, **Submit my
  ranking**. Re-enter the same name any time to load and update your ballot.
- **The room's verdict** tab: the live combined ranking, who's submitted, and
  **Export CSV for Excel**.
- **Organizer controls** (bottom of the verdict tab): paste your `ADMIN_KEY` to
  remove a ballot or clear all ballots for a fresh round.

---

## How the ranking is combined

Films are ordered by **average position** across all ballots (lower is better).
With full 40-film orderings this is identical to a Borda count, so the average is
shown for readability. Ties break by most #1 placements, then lower median rank,
then higher IMDb score.

---

## Environment variables (summary)

| Variable    | Needed?            | Purpose                                             |
|-------------|--------------------|-----------------------------------------------------|
| `DATA_DIR`  | Yes on Railway     | Where ballots are stored. Set to your volume (`/data`). |
| `ADMIN_KEY` | Yes for admin use  | Unlocks remove/clear. Pick any secret string.       |
| `PORT`      | No (auto)          | Railway sets this for you.                          |

---

## Changing the film list later

`films.json` and the films baked into `public/index.html` come straight from your
spreadsheet's "Refined list for ranking" tab. If the slate changes, the simplest
path is to have Claude regenerate both files from the updated spreadsheet so they
stay in sync, then re-upload them to GitHub.
