# Perplexity Sonar Pro

**Phase:** 3
**Cost:** Pay-per-query — Sonar Pro ~$5 per 1,000 queries. Personal use = negligible cost.
**Status:** ⏳ Pending — API access needed
**Sign up:** https://www.perplexity.ai/api
**Docs:** https://docs.perplexity.ai
**Target file:** `app/api-perplexity.js` (new file, Phase 3)

---

## What NEXUS Uses It For

The Intelligence tab left panel currently shows a placeholder. Phase 3 wires it to Perplexity Sonar Pro for real AI-powered research with live web citations.

**Use cases:**
- "Why is NVDA moving today?" — real-time catalyst analysis
- "NVDA vs AMD — analyst outlook next quarter?" — comparative intelligence
- "Key risks for MU position right now?" — risk surface scan
- "Semiconductor sector catalysts this week?" — sector-level briefing
- "Recent insider activity at TSMC?" — supplementary to SEC data

**Why Perplexity over OpenAI/Claude for this:**
Sonar Pro has live web access with source citations built in. For financial intelligence, sources matter — the answer needs to say "according to Goldman Sachs note May 8..." not generate plausibly-sounding text. Perplexity's citation model is purpose-built for this.

---

## Authentication

API key in Authorization header. Must use serverless proxy — never expose in client code.

```javascript
// api/perplexity.js — Vercel serverless proxy
export default async function handler(req, res) {
  const { question, context } = req.body;

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: `You are a financial intelligence assistant for a professional investor. 
                    Be concise and specific. Always cite sources. 
                    Context: ${context}`
        },
        { role: 'user', content: question }
      ],
      max_tokens: 800,
      return_citations: true,
      search_recency_filter: 'week',   // prioritise recent news
    })
  });

  const data = await response.json();
  res.json({
    answer: data.choices[0].message.content,
    citations: data.citations || [],
  });
}
```

---

## API Response Format

```javascript
// Response from Sonar Pro
{
  "id": "...",
  "model": "sonar-pro",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "NVIDIA's move today is driven by..."
    }
  }],
  "citations": [
    "https://www.reuters.com/technology/nvidia-...",
    "https://seekingalpha.com/article/...",
  ]
}
```

NEXUS renders the `content` as markdown-lite text and lists `citations` as clickable source links below the answer.

---

## Context Injection Strategy

The quality of Sonar Pro answers depends on context sent with the query. NEXUS injects:

```javascript
function buildContext(tk) {
  const st = S[tk];
  return [
    `Stock: ${tk} (${st.n})`,
    `Price: ${st.px} | Today: ${pct(st.ch)} | YTD: ${fmtYTD(st.ytd)}`,
    `MCap: ${st.ms} | P/E: ${st.pe ? st.pe.toFixed(1) + 'x' : 'N/A'}`,
    `Revenue: ${fmtRev(st.rev)} | Net Income: ${fmtNet(st.net)}`,
    `Sector: ${CUR} | Tags: ${(st.tags||[]).join(', ')}`,
    `Analyst Rating: ${st.rt} (${st.an} analysts)`,
  ].join('\n');
}
```

This ensures the AI knows exactly which stock, its current price context, and sector positioning without the user having to re-explain.

---

## Suggested Questions (Auto-Generated)

The intelligence panel pre-populates question suggestions based on `SEL_STOCK`:

```javascript
function getSuggestedQuestions(tk) {
  const st = S[tk];
  const isUp = st.ytd > 50;
  const isExpensive = st.pe > 80;

  return [
    `Why is ${tk} ${st.ch >= 0 ? 'up' : 'down'} today?`,
    `What are analysts saying about ${tk} next quarter?`,
    `Key risks to ${tk} position right now?`,
    isUp ? `Is ${tk}'s YTD rally sustainable?` : `What's the catalyst for ${tk} recovery?`,
    isExpensive ? `Is ${tk}'s valuation justified at ${st.pe?.toFixed(0)}x PE?` : null,
    `Compare ${tk} to its closest competitors`,
  ].filter(Boolean);
}
```

---

## Rate Limits and Cost

| Metric | Value |
|--------|-------|
| Model | sonar-pro |
| Cost per query | ~$0.005 (half a cent) |
| 100 queries | ~$0.50 |
| 1,000 queries | ~$5.00 |
| Rate limit | Not restrictive for personal use |

For a personal dashboard used actively: expect < $5/month at heavy usage. Negligible.

**No caching needed** — financial questions are time-sensitive (today's move, this week's news). Fresh answers are the value.

---

## UI Implementation (Phase 3)

```
Intelligence tab left panel — current state (Phase 1):
  [Mock placeholder with question suggestions]
  [RESEARCH → button that does nothing]

Phase 3 upgrade:
  [Suggested question buttons — click to auto-fill]
  [Text input for custom questions]
  [RESEARCH → button → calls /api/perplexity → streams response]
  [Response renders with markdown formatting]
  [Citations listed as clickable source links]
  [Loading state: animated "Querying Sonar Pro..." with dots]
```

**Streaming response** (better UX — text appears as it generates):
```javascript
// Use Server-Sent Events or fetch with ReadableStream
// Vercel functions support streaming responses
```

---

## Implementation Plan (Phase 3)

```
New files:
  app/api-perplexity.js    buildContext(), getSuggestedQuestions(), queryPerplexity()
  api/perplexity.js        Vercel serverless proxy with streaming support

Modified files:
  views/view-news.js       Replace mockPerp() with real queryPerplexity() call
                           Add citation rendering
                           Add streaming text display
                           Add suggested question buttons
```
