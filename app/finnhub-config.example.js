// Copy to finnhub-config.js for local settings. Key goes in finnhub-key.js (see finnhub-key.example.js).
window.NEXUS_FINNHUB_USE_PROXY = false;
window.NEXUS_FINNHUB_POLL_MS = 60000;
window.NEXUS_FINNHUB_USE_WS = true;
//
// Production on Vercel: finnhub-config.deploy.js + FINNHUB_API_KEY env — see deployment.md

// Optional: Dashboard Finnhub bundle cache TTL (ms; minimum 60s). Default 6h.
// window.NEXUS_FINNHUB_DASH_TTL_MS = 21600000;
