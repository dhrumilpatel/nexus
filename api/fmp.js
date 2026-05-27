// Vercel serverless proxy — hides FMP_API_KEY from the browser.
// Client: GET /api/fmp?path=income-statement/NVDA&period=quarter&limit=8

export default async function handler(req, res) {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'FMP_API_KEY not set in Vercel environment variables' });
    return;
  }
  const { path, ...params } = req.query || {};
  if (!path || Array.isArray(path)) {
    res.status(400).json({ error: 'query param path required (e.g. income-statement/NVDA)' });
    return;
  }
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && !Array.isArray(v)) qs.set(k, String(v));
  });
  qs.set('apikey', apiKey);
  const url = `https://financialmodelingprep.com/api/v3/${path}?${qs.toString()}`;
  try {
    const upstream = await fetch(url);
    const text = await upstream.text();
    let data = null;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { error: 'FMP upstream returned invalid JSON' };
    }
    res.status(upstream.status).json(data);
  } catch (e) {
    res.status(502).json({ error: 'FMP upstream request failed' });
  }
}
