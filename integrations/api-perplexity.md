# Perplexity Sonar Pro

**Phase:** 3 · **Cost:** ~$5 / 1K queries (Sonar Pro)  
**Status:** Pending · **Target:** `app/api-perplexity.js`  
**Docs:** https://docs.perplexity.ai  
**Proxy:** `integrations/README.md` → Proxy pattern (POST + `Authorization: Bearer`)

---

## Use in NEXUS

Intelligence tab left panel (Phase 3): live web Q&A with citations — catalysts, comps, risks, sector briefings. Sonar Pro for sourced answers vs plain LLM text.

---

## API shape

`POST https://api.perplexity.ai/chat/completions`

- Model: `sonar-pro`
- `return_citations: true`, `search_recency_filter: 'week'`
- System prompt: financial assistant + injected stock context
- Response: `choices[0].message.content` + `citations[]` → markdown-lite + source links in `view-news.js`

---

## Context injection

`buildContext(tk)` from `S[tk]`: name, px, ch, ytd, mcap, PE, rev, net, sector, tags, analyst rating.

`getSuggestedQuestions(tk)`: dynamic chips (today move, quarter outlook, risks, valuation if high PE, etc.).

---

## Implementation (Phase 3)

**New:** `app/api-perplexity.js`, `api/perplexity.js` (optional streaming).

**Modify:** `view-news.js` — replace mock; citation list; loading state.

No answer caching — time-sensitive queries.
