---
name: git-pr-workflow
description: >-
  Git branch and GitHub PR workflow: sync with merged main, one light PR per concern,
  safe commits, push, gh pr create. Use when branching, committing, opening PRs, or
  after the user says a prior PR merged. Proactively compress memory in .md rules.
disable-model-invocation: true
---

# Git PR workflow

Project skill for **dhrumilpatel/nexus** (default branch `main`). Use **`gh`** for PRs.

Large multi-topic work: plan a split first (Cursor **split-to-prs** skill) — **never** open one giant PR.

---

## Hard rules

- **Never commit** unless the user explicitly asks.
- **Never** change `git config`, force-push `main`/`master`, or run destructive git commands unless the user explicitly approves.
- **Always** create feature branches from an **updated** `main` (fetch + pull before `checkout -b`).
- **Never** commit directly to `main` — all work must happen on a branch + PR.
- **Never** commit secrets: `app/finnhub-key.js`, `.env`, API keys, credentials.
- Stage **named paths** only — avoid `git add -A` / `git add .` unless the user requests it.
- **Never push** to `main`/`master` unless the user explicitly requests it.
- **One concern per PR** — do not pile follow-ups onto a branch that already had a PR merged; start a **new** branch from latest `main` instead.

---

## Before any new branch or PR (mandatory)

Run this sequence **every time** before `checkout -b` or `gh pr create`:

```bash
git fetch origin
git checkout main
git pull origin main
```

Then check whether the **previous** work is already on `main`:

```bash
# Recent merges on main
git log origin/main --oneline -5

# If user cited a PR number or branch:
gh pr view <number> --json state,mergedAt,title 2>/dev/null
# or
git branch -r --merged origin/main | grep '<old-branch>' 
```

| Finding | Action |
|---------|--------|
| Prior PR **merged** | Branch **only** the delta still missing from `main` — new branch + new PR |
| Prior PR **open** | Push more commits to **that** branch only if scope still matches; do not open a second PR for the same work |
| Commits on old branch but **not** on `main` | `git checkout -b <new-branch>` from `main`, then `cherry-pick` **only** the commits you still need — never reopen the old merged PR branch as-is |

**Do not** open a PR that re-includes changes already merged (reviewers see duplicate diff noise).

---

## Branch from main

```bash
git fetch origin
git checkout main
git pull origin main
git checkout -b <type>/<short-slug>
```

**Branch strategy (Nexus):**

- `fix/` — bug fixes
- `feature/` — new features
- `poc/` — short experiments
- `docs/` — skills, rules, README-only (no product code mixed in unless tiny)
- Prefix matches **this PR’s single concern**, not the whole epic.

Examples: `fix/live-prices-flicker`, `feature/etf-infographic-seed`, `docs/git-pr-workflow-light-prs`.

Do **not** branch from another feature branch unless the user explicitly wants a stacked PR.

---

## Keep PRs light (review discipline)

| Do | Don’t |
|----|--------|
| One user-visible concern or one doc topic | Merge “feature + infographic + skill + refactor” in one PR |
| Split data seed vs UI vs docs when each is reviewable alone | Reuse `feature/foo` after PR #N merged — create `feature/foo-part-2` from `main` |
| ~1–3 bullets in Summary; small diff | 500+ line drive-by changes |
| `docs/` PRs: skills, rules, integration notes only | Sneak app changes into a docs PR |

If the user asks for more work after a merge: **new branch from `main`**, **new PR**, **smaller title**.

---

## Commit

**Author (mandatory):** every commit on a feature branch must use Nexus identity — see [.cursor/rules/nexus-repo-identity.mdc](../../rules/nexus-repo-identity.mdc).

```bash
git add <path1> <path2>   # specific files only
git commit --author="dhrumil4u <dhrumil4u@gmail.com>" -m "$(cat <<'EOF'
<type>: one-line why.

Optional second sentence for context.
EOF
)"
git log -1 --format='%ae'   # must print: dhrumil4u@gmail.com
```

**Message style:** 1–2 sentences, focus on **why**. Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.

**Before commit:** `git status` + `git diff` — no secrets, intended files only. **Before push:** verify author email (Vercel rejects unrecognized authors).

---

## Push

```bash
git push -u origin HEAD
```

---

## Open a pull request

### Pre-flight (parallel when possible)

```bash
git fetch origin
git pull origin main          # on feature branch: rebase if behind (see below)
git status
git diff origin/main...HEAD   # only what this PR should contain
git log origin/main..HEAD --oneline
```

Confirm:

- Base is **`main`** and you are **not behind** `origin/main` (if behind: `git pull --rebase origin main` on feature branch, then push — ask before force-push).
- Diff does **not** repeat commits already on `main` from a merged PR.
- Branch pushed with upstream.

### Create PR with `gh`

```bash
git push -u origin HEAD   # if needed

gh pr create --title "Short imperative title" --body "$(cat <<'EOF'
## Summary
- What changed and why (1–3 bullets max)

## Test plan
- [ ] (only if not docs-only)

EOF
)"
```

Use [pr-template.md](pr-template.md). **No empty PRs.** Return the **PR URL**.

**Draft:** Never `--draft` — open ready-for-review PRs unless the user explicitly requests a draft.

**Issues:** `Closes #123` when applicable.

---

## Proactive memory (do without being asked)

After meaningful work — merge, new feature, or data/schema change — **update compressed context** in the same session or the next docs PR:

| File | What to keep |
|------|----------------|
| `.cursor/rules/nexus-context.mdc` | ≤12 bullets: repo identity, active feature flags, data paths, open PR # if any |
| `integrations/README.md` | One line per integration when wiring changes |

**Compress, don’t bloat:** replace stale bullets; no paste of full diffs or chat logs. Use **token-management** skill for journal cadence.

When opening a PR, if context changed, include a **one-line** update to `nexus-context.mdc` in a **docs** PR or the same PR only if scope stays tiny.

---

## PR best practices

| Practice | Guidance |
|----------|----------|
| Scope | One concern per PR |
| Size | Small, reviewable; separate docs from code |
| Base | Always from fresh `main`; verify prior PR merged |
| CI | Fix failures caused by this PR |
| Review | **babysit** skill when asked |
| Secrets | Re-check `git diff` before every commit |

---

## Common situations

| Situation | Action |
|-----------|--------|
| User: “PR #8 merged, open another” | `git pull origin main` → confirm merge → new branch → **only** unmerged commits |
| Uncommitted work on `main` | Stash or branch — never commit to `main` without approval |
| Behind `main` | Rebase feature branch on `origin/main`; push (force only with user OK) |
| Wrong base / bloated PR | Close or retarget; recreate branch from `main` with cherry-picks |
| Auth / push fails | `gh auth status`; HTTPS remote; retry DNS once |

---

## Nexus repo notes

- Remote: `origin` → `https://github.com/dhrumilpatel/nexus`
- Identity: `dhrumil4u <dhrumil4u@gmail.com>` — always `--author=…` on commit; never use the agent machine’s default email
- Rule file: [nexus-repo-identity.mdc](../../rules/nexus-repo-identity.mdc)
- Do not commit `app/finnhub-key.js`
- Deploy / live-price PRs: note Vercel / LIVE check in Summary — [deployment.md](../../../deployment.md)

---

## Quick checklist

```
- [ ] git fetch && checkout main && pull
- [ ] Prior PR merged? → new branch; only delta commits
- [ ] Single concern; diff stays light
- [ ] Named paths staged; no secrets
- [ ] `git log -1 --format='%ae'` is `dhrumil4u@gmail.com`
- [ ] Pushed with upstream; not behind main
- [ ] gh pr create with Summary (+ test plan if code)
- [ ] nexus-context.mdc updated if durable state changed
- [ ] PR URL shared with user
```
