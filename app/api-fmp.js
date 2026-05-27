// NEXUS — FMP REST routing via Vercel /api/fmp proxy.
// Load before rightpanel.js.

(function(){
  function toNum(v){
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : null;
  }
  function toQuarterLabel(dateStr){
    if (!dateStr || typeof dateStr !== 'string') return null;
    const d = new Date(dateStr);
    if (!Number.isFinite(d.getTime())) return null;
    const q = Math.floor(d.getUTCMonth() / 3) + 1;
    const yy = String(d.getUTCFullYear()).slice(-2);
    return `Q${q}'${yy}`;
  }
  function byDateAsc(a, b){
    return String(a.date || '').localeCompare(String(b.date || ''));
  }
  function fetchJson(path, params){
    const qs = new URLSearchParams({ path });
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v != null) qs.set(k, String(v));
    });
    return fetch('/api/fmp?' + qs.toString())
      .then(async r => {
        let j = null;
        try { j = await r.json(); } catch (e) { return null; }
        if (!r.ok || !j || j.error) return null;
        return j;
      })
      .catch(() => null);
  }
  function getHistoricalMcap(symbol, limit){
    return fetchJson(`historical-market-capitalization/${symbol}`, { limit: limit || 8 });
  }
  function getIncomeStatement(symbol, limit){
    return fetchJson(`income-statement/${symbol}`, { period: 'quarter', limit: limit || 8 });
  }
  function getRatios(symbol, limit){
    return fetchJson(`ratios/${symbol}`, { period: 'quarter', limit: limit || 8 });
  }
  async function getHistory(symbol){
    if (!symbol) return null;
    const tk = String(symbol).toUpperCase();
    const [mcapRaw, incomeRaw, ratioRaw] = await Promise.all([
      getHistoricalMcap(tk, 8),
      getIncomeStatement(tk, 8),
      getRatios(tk, 8)
    ]);
    const mcapRows = Array.isArray(mcapRaw?.historicalMarketCap)
      ? mcapRaw.historicalMarketCap
      : Array.isArray(mcapRaw) ? mcapRaw : [];
    const incomeRows = Array.isArray(incomeRaw) ? incomeRaw : [];
    const ratioRows = Array.isArray(ratioRaw) ? ratioRaw : [];
    if (!mcapRows.length && !incomeRows.length && !ratioRows.length) return null;

    const mcapByDate = {};
    mcapRows.forEach(row => {
      const date = row?.date;
      const raw = toNum(row?.marketCap);
      if (!date || raw == null) return;
      mcapByDate[date] = raw / 1e9;
    });
    const ratioByDate = {};
    ratioRows.forEach(row => {
      const date = row?.date || row?.calendarYear;
      const pe = toNum(row?.priceEarningsRatio);
      if (!date || pe == null) return;
      ratioByDate[date] = pe;
    });
    const incomeByDate = {};
    incomeRows.forEach(row => {
      const date = row?.date;
      if (!date) return;
      incomeByDate[date] = {
        rev: toNum(row?.revenue) != null ? toNum(row.revenue) / 1e9 : null,
        net: toNum(row?.netIncome) != null ? toNum(row.netIncome) / 1e9 : null
      };
    });

    const dateSet = new Set([
      ...Object.keys(mcapByDate),
      ...Object.keys(ratioByDate),
      ...Object.keys(incomeByDate)
    ]);
    const rows = [...dateSet]
      .map(date => ({
        date,
        q: toQuarterLabel(date),
        mc: mcapByDate[date] ?? null,
        pe: ratioByDate[date] ?? null,
        rev: incomeByDate[date]?.rev ?? null,
        net: incomeByDate[date]?.net ?? null
      }))
      .filter(r => r.q)
      .sort(byDateAsc)
      .slice(-8);
    if (!rows.length) return null;

    const latest = rows[rows.length - 1] || {};
    return {
      q: rows.map(r => r.q),
      mc: rows.map(r => r.mc),
      pe: rows.map(r => r.pe),
      rev: latest.rev ?? null,
      net: latest.net ?? null,
      updatedAt: Date.now()
    };
  }
  window.NexusFmpApi = { getHistoricalMcap, getIncomeStatement, getRatios, getHistory };
})();
