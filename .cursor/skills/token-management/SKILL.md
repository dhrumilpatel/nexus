---
name: token-management
description: >-
  Keep agent context lean and durable by compressing memory, updating markdown docs,
  and keeping the workspace clean during multi-step work. Use when the user asks to
  compress memory/docs, reduce token usage, clean the workspace, or keep long tasks organized.
disable-model-invocation: true
---

# Token management

Use this skill to prevent context bloat while keeping repo state trustworthy.

---

## Core outcomes

- Preserve only durable decisions and current status.
- Keep markdown docs concise and non-duplicative.
- Keep git workspace predictable (no accidental mixed-scope diffs).

---

## Operating cadence

### After each small task

1. Capture the outcome in 1-3 bullets (what changed, why, status).
2. Remove temporary notes or repeated text in working docs.
3. Run a quick cleanliness check:

```bash
git status --short
git diff --stat
```

### After every 2-4 tasks (or any major context shift)

1. Compress memory into a short snapshot in `journal.md`:
   - current branch / PR
   - completed items
   - open risks
   - next actions
2. Update canonical docs only (no duplicate guidance across files).
3. Re-check for drift between `README.md`, `DOCUMENTATION.md`, and integration docs.

---

## Compression rules

- Prefer one canonical source per topic; link instead of repeating.
- Keep sections skimmable (short bullets, short tables, minimal prose).
- Remove stale status text and time-bound chatter after it is superseded.
- Keep examples only when they change behavior or avoid mistakes.
- If two files say the same thing, keep the stronger source and trim the other.

---

## Markdown maintenance workflow

1. Identify changed docs:

```bash
git status --short
```

2. Check for duplicates/overlap (use `rg`):

```bash
rg "pattern" README.md DOCUMENTATION.md AGENT-GUIDE.md integrations
```

3. Edit for compression:
   - short headers
   - concise bullets
   - links to canonical references
4. Validate formatting:

```bash
git diff --check -- '*.md'
```

---

## Workspace-clean best practices

- Keep one concern per branch and per PR.
- Stage named paths only; avoid broad staging unless explicitly requested.
- Before commit/PR, ensure unrelated edits are not included.
- If unrelated WIP exists, isolate it with stash or a dedicated branch.
- Never commit secrets, generated credentials, or local-only key files.
- After merges, sync `main` and branch fresh for the next scope.

---

## PR hygiene best practices

- Keep PR description concise and current with the latest scope.
- Update PR summary when requirements change.
- Reply to review comments with commit references when fixes land.
- Keep checklists realistic and actionable; remove sections the team does not use.

---

## Definition of done for a task cycle

```text
- [ ] Memory compressed (short durable snapshot)
- [ ] Relevant .md docs updated and deduplicated
- [ ] Workspace checked (status/diff clean for intended scope)
- [ ] Next actions listed clearly
```

---

## Invocation examples

- "Use token-management and compress memory now."
- "Apply token-management after this feature and clean markdown."
- "Run token-management hygiene before opening the PR."
