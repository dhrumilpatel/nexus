// Vercel serverless proxy — Yahoo Finance chart API for intl quotes Finnhub free tier misses.
// Client: GET /api/yahoo?symbol=AAC.ST

export default async function handler(req, res) {
  const symbol = req.query?.symbol;
  if (!symbol || Array.isArray(symbol)) {
    res.status(400).json({ error: 'query param symbol required (e.g. AAC.ST)' });
    return;
  }
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  try {
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Nexus/1.0)' },
    });
    const data = await upstream.json();
    const result = data?.chart?.result?.[0];
    if (!result?.meta) {
      res.status(upstream.ok ? 404 : upstream.status).json({ error: 'No quote data' });
      return;
    }
    const m = result.meta;
    const c = m.regularMarketPrice;
    const pc = m.chartPreviousClose ?? m.previousClose ?? null;
    const dp = c != null && pc ? ((c - pc) / pc) * 100 : null;
    res.status(200).json({ c, pc, dp });
  } catch (e) {
    res.status(502).json({ error: 'Yahoo upstream request failed' });
  }
}
