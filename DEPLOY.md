# Deploy — Free Hosting Options

You need a free URL to share with a client. Here are 3 options ranked by ease.

---

## Option 1 — Render.com (RECOMMENDED) ⭐

**Why:** Free tier, no credit card, one URL for frontend + backend, uses your existing setup.
**You get:** `https://everywhere-cars.onrender.com`
**Catch:** Free instances sleep after 15 min idle (first request takes ~30s to wake). Fine for client demos.

### Steps

1. Push this repo to GitHub (if not already).
2. Go to **https://render.com** → sign up with GitHub.
3. Click **New +** → **Blueprint**.
4. Connect your GitHub repo → Render auto-detects `render.yaml`.
5. Click **Apply** → wait ~3–5 min for first build.
6. Fill in env vars when prompted:
   - `RESEND_API_KEY` — your Resend key
   - `GMAIL_USER` — your Gmail address
   - `GMAIL_APP_PASSWORD` — your Gmail app password
   - `OPERATOR_EMAIL` — where lead notifications go
7. Done. Share the `*.onrender.com` URL.

### Custom domain (optional, still free)
Settings → Custom Domain → add `yourdomain.com`. Render gives free SSL.

---

## Option 2 — Railway (already configured)

**Why:** You already have `railway.toml`, `Dockerfile`, `Procfile`.
**You get:** `https://your-app.up.railway.app`
**Catch:** $5/month free credit (≈500 hrs). Runs out → you'd need to add a card.

### Steps

1. Go to **https://railway.app** → sign up with GitHub.
2. **New Project** → **Deploy from GitHub repo** → pick this repo.
3. Railway reads `Dockerfile` automatically.
4. **Variables** tab → add the env vars (same list as Render above).
5. **Settings** → **Generate Domain** → get your `.up.railway.app` URL.

---

## Option 3 — Netlify (frontend only) + Render backend

**Why:** You asked about Netlify specifically. But Netlify only hosts the React frontend — you still need somewhere to host the Express server.

This is **2 deployments** instead of 1. Not recommended unless you have a reason to.

### If you really want this:

1. Deploy backend to Render or Railway (steps above) → get backend URL, e.g. `https://ec-api.onrender.com`.
2. In `src/api.js` (or wherever you set the API base), point requests to that backend URL via env var `VITE_API_URL`.
3. Go to **https://netlify.com** → New site from Git → pick repo.
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Env var: `VITE_API_URL=https://ec-api.onrender.com`
5. Add `public/_redirects` file with:
   ```
   /*  /index.html  200
   ```
   (so React Router works on direct URL hits)

---

## TL;DR

**Just use Render** (Option 1). One URL, one deploy, free, fits your current code.

The `render.yaml` in this repo is already set up — push to GitHub, connect on Render, fill in env vars, done.
