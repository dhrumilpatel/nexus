# Hosting — Vercel

**Phase:** 1A (Active now)
**Cost:** Free (Hobby plan)
**Status:** Ready to deploy — no configuration needed

---

## Why Vercel

- Zero config for static HTML/CSS/JS — no build step, no package.json needed
- Global edge CDN — fast worldwide, no server to manage
- Automatic HTTPS — SSL certificate auto-provisioned
- GitHub integration — push to main = auto deploy in ~30 seconds
- Deploy previews — every branch gets a live preview URL
- Free custom domain support (`.vercel.app` subdomain always free)
- Generous free tier: 100GB bandwidth/month, unlimited deploys

---

## Setup: First Deploy (One Time)

### Step 1 — Create GitHub Repository

```bash
# In your local nexus-v8/ folder:
git init
git add .
git commit -m "feat: NEXUS v8 modular architecture"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nexus-dashboard.git
git push -u origin main
```

### Step 2 — Connect Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up / Log in with GitHub
2. Click **Add New Project**
3. Import your `nexus-dashboard` repository
4. Framework preset: **Other** (not Next.js, not Vite — plain static)
5. Build settings: leave everything blank
   - Build command: *(empty)*
   - Output directory: *(empty — Vercel serves from root)*
   - Install command: *(empty)*
6. Click **Deploy**

Done. Your dashboard is live at `https://nexus-dashboard-xxx.vercel.app`

### Step 3 — Custom Domain (Optional)

In Vercel project settings → Domains → Add domain. Point your DNS CNAME to `cname.vercel-dns.com`.

---

## Ongoing Deployments

Every `git push origin main` triggers an automatic deploy. No action needed.

```bash
# Typical workflow after any file change:
git add data/stocks.js
git commit -m "data: update NVDA ytd and Q2 revenue"
git push
# Live in ~30 seconds
```

Branch previews — for testing before going live:
```bash
git checkout -b feature/wheel-view
# make changes
git push origin feature/wheel-view
# Vercel creates: nexus-dashboard-git-feature-wheel-view-xxx.vercel.app
# Test it, then merge to main for live deploy
```

---

## Project Structure for Vercel

Vercel serves `index.html` at the root. All other files are served relative to it. No special config needed as long as the structure is:

```
/ (repo root)
├── index.html          → served at /
├── nexus.css           → served at /nexus.css
├── data/
│   ├── stocks.js       → served at /data/stocks.js
│   ├── sectors.js      → served at /data/sectors.js
│   └── themes.js       → served at /data/themes.js
├── views/
│   └── view-*.js       → served at /views/view-*.js
└── app/
    └── *.js            → served at /app/*.js
```

The `index.html` script tags reference these paths:
```html
<script src="data/stocks.js"></script>   <!-- relative path, works everywhere -->
```

---

## Environment Variables (Phase 2+)

For Phase 2 API keys — set in Vercel dashboard, not in code.

**Setting a variable:**
1. Vercel project → Settings → Environment Variables
2. Add key: `FINNHUB_API_KEY` / value: `your_key`
3. Environment: Production + Preview + Development
4. Redeploy for changes to take effect

**Accessing in code (Phase 2 — Vercel Serverless Functions):**
```javascript
// api/prices.js (Vercel serverless function)
export default function handler(req, res) {
  const key = process.env.FINNHUB_API_KEY;
  // proxy Finnhub call here
}
```

For Phase 1, no environment variables are needed — TradingView widgets require no keys.

---

## Vercel Configuration File (Optional)

Create `vercel.json` in repo root only if needed for custom headers or redirects:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "s-maxage=60, stale-while-revalidate" }
      ]
    }
  ]
}
```

For Phase 1, no `vercel.json` is needed at all.

---

## Limits (Free Hobby Plan)

| Limit | Value | NEXUS usage |
|-------|-------|-------------|
| Bandwidth | 100 GB/month | Single user — effectively unlimited |
| Deployments | Unlimited | Fine |
| Serverless functions | 12 per project | Phase 2 needs 1-2 |
| Function execution | 10s timeout | Fine for API proxying |
| Build time | 45 min/month | ~30 seconds per build = 90 deploys/month free |

For a personal dashboard with one user, free tier is permanent — no reason to upgrade.

---

## Troubleshooting

**404 on JS files:** Check path in `index.html` script tags matches actual file location. Paths are case-sensitive on Vercel (Linux server).

**Styles not loading:** Check `<link rel="stylesheet" href="nexus.css">` in `index.html` head.

**TradingView widgets blank:** These load from TradingView CDN — no CORS issues, but they require the page to be served over HTTP/S (not `file://`). Always test via Vercel preview URL, not local file open.

**Deployment not triggering:** Check GitHub webhook in repo Settings → Webhooks. Vercel auto-creates this — if missing, disconnect and reconnect the Vercel GitHub integration.
