// Vercel serverless proxy — hides FINNHUB_API_KEY from the browser.
// Client: GET /api/finnhub?path=quote&symbol=NVDA

export default async function handler(req, res) {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    res.status(500).json({ error: 'FINNHUB_API_KEY not set in Vercel environment variables' });
    return;
  }
  const { path, ...params } = req.query || {};
  if (!path || Array.isArray(path)) {
    res.status(400).json({ error: 'query param path required (e.g. quote, stock/recommendation)' });
    return;
  }
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && !Array.isArray(v)) qs.set(k, String(v));
  });
  qs.set('token', token);
  const url = `https://finnhub.io/api/v1/${path}?${qs}`;
  try {
    const upstream = await fetch(url);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(502).json({ error: 'Finnhub upstream request failed' });
  }
}
