# NEXUS v1 — Deployment (Vercel)

**Repository:** [https://github.com/dhrumilpatel/nexus](https://github.com/dhrumilpatel/nexus)

Production hosting for the static dashboard with **automatic live price refresh** via Finnhub REST polling. API keys stay on the server (Vercel serverless proxy).

---

## Finnhub config split

| File | Committed | Contents |
|------|-----------|----------|
| `app/finnhub-config.js` | Yes (or built on Vercel) | `USE_PROXY`, `POLL_MS`, `USE_WS` — **no API key** |
| `app/finnhub-key.js` | **No** (gitignored) | `NEXUS_FINNHUB_KEY` only — local dev |
| `app/finnhub-config.deploy.js` | Yes | Production settings template |
| `app/finnhub-key.example.js` | Yes | Copy → `finnhub-key.js` after clone |

Production: key in Vercel env `FINNHUB_API_KEY` → `/api/finnhub`. Local: paste key in `finnhub-key.js`.

---

## Overview

| Item | Value |
|------|--------|
| Host | [Vercel](https://vercel.com) Hobby (free) |
| GitHub | [dhrumilpatel/nexus](https://github.com/dhrumilpatel/nexus) |
| Live prices | `live-prices.js` → `/api/finnhub` → Finnhub `/quote` |
| Poll interval | Default **120s** |
| WebSocket | Local only (`finnhub-key.js` + `USE_WS=true`); off on Vercel |

---

## First deploy

### 1. Push to GitHub

```bash
cd Nexus
git remote add origin https://github.com/dhrumilpatel/nexus.git
# or: git remote set-url origin https://github.com/dhrumilpatel/nexus.git
git add .
git commit -m "feat: NEXUS v1 — Vercel + Finnhub live prices"
git push -u origin main
```

If the remote repo already has commits: `git pull --rebase origin main` before push.

### 2. Import on Vercel

1. [vercel.com/new](https://vercel.com/new) → Import **dhrumilpatel/nexus**.
2. **Framework Preset:** Other  
3. **Root Directory:** folder with `index.html` (repo root if app is at top level).  
4. **Build / output / install:** leave empty — [`vercel.json`](vercel.json) runs:

   `cp app/finnhub-config.deploy.js app/finnhub-config.js && printf … > app/finnhub-key.js`

5. Click **Deploy**.

### 3. Environment variable (required)

| Name | Value |
|------|--------|
| `FINNHUB_API_KEY` | Your Finnhub API key |

Set for Production, Preview, and Development → **Redeploy**.

---

## How live refresh works

1. `app.js` → `NexusLivePrices.start()` on load.
2. `finnhub-config.deploy.js` → `USE_PROXY=true`.
3. Poll `/api/finnhub?path=quote&symbol=…` for active tickers (~2 min cycle).
4. DOM patch via `data-nexus-tk`; dashboard sentiment via `/stock/recommendation`.

---

## Verify production

| Check | Expected |
|-------|----------|
| Header | **LIVE** or **SYNC** |
| `/api/finnhub?path=quote&symbol=AAPL` | JSON with `c`, `dp` |
| ~2 min | Prices update after sector change |

---

## Local development

```bash
cp app/finnhub-config.example.js app/finnhub-config.js
cp app/finnhub-key.example.js app/finnhub-key.js
# Paste Finnhub key into finnhub-key.js only
npx serve .
```

Direct Finnhub + WebSocket: `USE_PROXY=false`, `USE_WS=true` in `finnhub-config.js`.

**Proxy locally (matches production):**

```bash
cp app/finnhub-config.deploy.js app/finnhub-config.js
printf '%s\n' "window.NEXUS_FINNHUB_KEY='';" > app/finnhub-key.js
export FINNHUB_API_KEY=your_key_here
npx vercel dev
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| STATIC badge | `FINNHUB_API_KEY` on Vercel; redeploy |
| 404 `finnhub-key.js` | Build step failed — check Vercel build log |
| 404 `finnhub-config.js` | Same — `cp finnhub-config.deploy.js` |
| Key in git | Only `finnhub-key.js` is secret — must stay gitignored |

---

## Security

- **Never commit** `app/finnhub-key.js`.
- **Never put** `NEXUS_FINNHUB_KEY` in `finnhub-config.js` or `finnhub-config.deploy.js`.
- Production: `FINNHUB_API_KEY` in Vercel only.

---

## Build handover checklist

**Pre-deploy**

- [ ] Remote: `https://github.com/dhrumilpatel/nexus.git`
- [ ] `api/finnhub.js`, `vercel.json`, `finnhub-api.js`, `finnhub-config.deploy.js`, `finnhub-key.example.js` committed
- [ ] No API keys in committed files
- [ ] `index.html`: `finnhub-config.js` → `finnhub-key.js` → `finnhub-api.js`

**Vercel**

- [ ] Import **dhrumilpatel/nexus**
- [ ] `FINNHUB_API_KEY` set
- [ ] Build log shows config + empty key file copy

**Smoke test**

- [ ] LIVE/SYNC badge
- [ ] Quote proxy works
- [ ] Prices update within one poll cycle

---

## Related docs

- [`integrations/README.md`](integrations/README.md) — Proxy pattern  
- [`integrations/api-finnhub.md`](integrations/api-finnhub.md) — Endpoints  
