---
name: git-pr-workflow
description: >-
  Git branch and GitHub PR workflow: always branch from updated main, safe commits,
  push, and gh pr create with a clear Summary. Use when the user asks to
  create a branch, commit, push, open a pull request, or follow git best practices.
disable-model-invocation: true
---

# Git PR workflow

Project skill for **dhrumilpatel/nexus** (default branch `main`). Use **`gh`** for PRs.

Large multi-topic work: plan a split first (Cursor **split-to-prs** skill) — do not open one giant PR.

---

## Hard rules

- **Never commit** unless the user explicitly asks.
- **Never** change `git config`, force-push `main`/`master`, or run destructive git commands unless the user explicitly approves.
- **Always** create feature branches from an **updated** `main` (fetch + pull before `checkout -b`).
- **Never** commit secrets: `app/finnhub-key.js`, `.env`, API keys, credentials.
- Stage **named paths** only — avoid `git add -A` / `git add .` unless the user requests it.
- **Never push** to `main`/`master` unless the user explicitly requests it.

---

## Branch from main

Run in order:

```bash
git fetch origin
git checkout main
git pull origin main
git checkout -b <type>/<short-slug>
```

**Branch names:** `feat/`, `fix/`, `docs/`, `chore/`, `refactor/`, `test/` + kebab-case (e.g. `feat/dashboard-kpi`, `docs/compress-md`).

Do **not** branch from another feature branch unless the user explicitly wants a stack.

---

## Commit

```bash
git add <path1> <path2>   # specific files only
git commit -m "$(cat <<'EOF'
<type>: one-line why.

Optional second sentence for context.
EOF
)"
```

**Message style:** 1–2 sentences, focus on **why**. Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.

**Before commit:** run `git status` and `git diff` — confirm no secrets and only intended files are staged.

---

## Push

```bash
git push -u origin HEAD
```

First push on a branch must set upstream (`-u`). Re-push after new commits on the same branch.

---

## Open a pull request

### Before creating the PR

Run in parallel when possible:

```bash
git status
git diff
git log origin/main..HEAD
git branch -vv
```

- Branch is pushed and tracks `origin`.
- Base is `main` and branch is not stale (if behind: `git fetch origin && git pull --rebase origin main` on the feature branch, then push — ask user before force-push).
- Changes match what the user expects in this PR.

### Create PR with `gh`

```bash
git push -u origin HEAD   # if not already pushed

gh pr create --title "Short imperative title" --body "$(cat <<'EOF'
## Summary
- What changed and why (bullet 1)
- User-visible impact or risk (bullet 2)

EOF
)"
```

**Required PR body sections:**

| Section | Rule |
|---------|------|
| `## Summary` | 1–3 bullets — what and why |

Use [pr-template.md](pr-template.md) as the skeleton. **No empty PRs.**

**Title:** imperative mood, ~72 characters or fewer, aligned with the commit.

**Draft PRs:** add `--draft` only if the user asks.

**Linked issues:** add `Closes #123` or `Fixes #123` in the body when applicable.

Return the **PR URL** to the user when done.

---

## PR best practices

| Practice | Guidance |
|----------|----------|
| Scope | One concern per PR |
| Size | Small, reviewable diffs; separate docs-only from code when possible |
| Base | Always target `main` from fresh `main` |
| CI | Wait for checks; fix failures caused by this PR |
| Review | Address comments; use **babysit** skill if asked to get PR merge-ready |
| Secrets | Re-check `git diff` before every commit |
| Amend | Only when user rules allow (HEAD commit by you, not pushed, etc.) |

---

## Common situations

| Situation | Action |
|-----------|--------|
| Uncommitted work on `main` | Stash or branch first — never commit directly to `main` without user approval |
| Behind `main` | `git fetch origin && git pull --rebase origin main` on feature branch; push (feature branch force-push only with user OK) |
| Wrong branch base | Recreate from `main` or change base on GitHub |
| Auth / private repo | `gh auth login`; verify `gh auth status` |
| No upstream | `git push -u origin HEAD` |
| User asked only for PR | Still verify branch/commits; do not commit unless asked |

---

## Nexus repo notes

- Remote: `origin` → `https://github.com/dhrumilpatel/nexus` (private).
- Do not commit `app/finnhub-key.js` (gitignored).
- Deploy or live-price changes: include quick Vercel / LIVE verification notes in PR summary — see [deployment.md](../../../deployment.md).

---

## Quick checklist

```
- [ ] On main, pulled latest
- [ ] Feature branch created from main
- [ ] Commits: intended files only, no secrets
- [ ] Pushed with upstream
- [ ] PR has a clear Summary
- [ ] PR URL shared with user
```
