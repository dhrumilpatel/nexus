# Hosting — Vercel

**Phase:** 1A · **Cost:** Free (Hobby)

**Canonical deploy guide:** [`../deployment.md`](../deployment.md) — first deploy, `FINNHUB_API_KEY`, live price verification, troubleshooting, build handover checklist.

---

## Quick summary

- Static site on Vercel (Framework **Other**, no output dir).
- `vercel.json` copies deploy config + empty `finnhub-key.js` at build. Secrets: `finnhub-key.js` (gitignored) or Vercel `FINNHUB_API_KEY`.
- Live prices: REST poll via `/api/finnhub` (see `api/finnhub.js`).
- Push `main` → auto-deploy; branches → preview URLs.
