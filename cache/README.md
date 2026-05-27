# Fundamentals file cache (Node)

**Not loaded by the browser.** Disk cache for fetch scripts / serverless jobs. One JSON per ticker in this directory.

## Layout

| Path | Purpose |
|------|---------|
| `<SYMBOL>.json` | Cached blocks (e.g. `NVDA.json`) |
| `fundamentals-cache.example.json` | Example shape |
| `.gitignore` | Ignores `*.json`; keeps `*.example.json` |

## JSON shape

```json
{
  "schemaVersion": 1,
  "symbol": "NVDA",
  "blocks": {
    "fundamentals_revenue_net": {
      "fetchedAt": 1710000000000,
      "ttlMs": 7776000000,
      "data": { "revB": 60.9, "netB": 29.8 }
    }
  }
}
```

`fetchedAt` + `ttlMs` → stale when `now > fetchedAt + ttlMs`. Writes: atomic rename (`*.tmp.<pid>`).

## Script API — `../scripts/fundamentals-cache.mjs`

| Export | Role |
|--------|------|
| `cacheDir()` | `NEXUS_CACHE_DIR` or `Nexus/cache/` |
| `readTickerDoc(sym)` | Full doc or `null` |
| `getBlock(sym, blockName)` | `{ stale, block, doc }` |
| `setBlock(sym, blockName, data, ttlMs)` | Merge + save |
| `invalidateBlock(sym, blockName)` | Remove block |
| `ttlForBlock(blockName)` | Default TTL heuristics |

## Environment

| Variable | Effect |
|----------|--------|
| `NEXUS_CACHE_DIR` | Override cache directory |

---

## Smoke tests (manual)

Run from inner **`Nexus/`** (contains `cache/` and `scripts/`).

```bash
cd Nexus
export NEXUS_CACHE_DIR="$(mktemp -d)"

node scripts/fundamentals-cache.mjs set NVDA fundamentals_revenue_net '{"revB":60.9,"netB":29.8}'
# expect: ok + saved JSON

test -f "$NEXUS_CACHE_DIR/NVDA.json" && echo OK

node scripts/fundamentals-cache.mjs get NVDA fundamentals_revenue_net
# expect: stale false, block with data

node scripts/fundamentals-cache.mjs invalidate NVDA fundamentals_revenue_net

node scripts/fundamentals-cache.mjs get NVDA fundamentals_revenue_net
# expect: stale true, block null

rm -rf "$NEXUS_CACHE_DIR" && unset NEXUS_CACHE_DIR
```

**Default cache dir (optional):**

```bash
cd Nexus
node scripts/fundamentals-cache.mjs set AAPL quote '{"c":190}'
test -f cache/AAPL.json && echo OK
node scripts/fundamentals-cache.mjs invalidate AAPL quote
rm -f cache/AAPL.json
```

Requires Node.js.
