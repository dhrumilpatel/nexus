# PR body template

Copy into `gh pr create --body "$(cat <<'EOF' ... EOF)"`.

**Before opening:** `git fetch origin && git checkout main && git pull origin main` — confirm prior PR is merged; branch only contains new delta.

```markdown
## Summary
- (1–3 bullets: what + why — keep light for review)

## Test plan
- [ ] (skip section for docs-only PRs)
```

## Optional sections (add when useful)

```markdown
## Notes
- Follow-up PR after #N merged
- Breaking change / migration

## Related
- Closes #
```

## Anti-patterns

- Re-opening a merged feature branch with extra commits (bloats review)
- Mixing unrelated features + docs + data seed in one PR
- Skipping `git pull origin main` before `gh pr create`
