# Fundamentals cache (Node)

Not loaded by browser. One JSON per ticker: `<SYMBOL>.json`.

## Shape

```json
{ "schemaVersion": 1, "symbol": "NVDA", "blocks": {
  "fundamentals_revenue_net": { "fetchedAt": 1710000000000, "ttlMs": 7776000000,
    "data": { "revB": 60.9, "netB": 29.8 } } } }
```

Atomic writes (`*.tmp.<pid>`). Stale when `now > fetchedAt + ttlMs`.

## API (`scripts/fundamentals-cache.mjs`)

`cacheDir()` · `readTickerDoc` · `getBlock` · `setBlock` · `invalidateBlock` · `ttlForBlock`

Env: `NEXUS_CACHE_DIR` (default `cache/`)

## Smoke tests (from inner `Nexus/`)

```bash
export NEXUS_CACHE_DIR="$(mktemp -d)"
node scripts/fundamentals-cache.mjs set NVDA fundamentals_revenue_net '{"revB":60.9,"netB":29.8}'
test -f "$NEXUS_CACHE_DIR/NVDA.json" && echo OK
node scripts/fundamentals-cache.mjs get NVDA fundamentals_revenue_net
node scripts/fundamentals-cache.mjs invalidate NVDA fundamentals_revenue_net
rm -rf "$NEXUS_CACHE_DIR"
```
