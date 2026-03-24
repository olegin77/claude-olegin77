# Ship — Full Deployment Pipeline

Run the complete shipping pipeline for the current project. Stops on any failure.

## Pipeline

### 1. Pre-flight
```bash
# Verify clean working tree
git status --porcelain
# Verify on feature branch (not main/master)
BRANCH=$(git branch --show-current)
if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  echo "ERROR: Cannot ship from $BRANCH. Create a feature branch first."
  exit 1
fi
```

### 2. Quality Gates
Execute in order, stop on first failure:

- [ ] **Tests**: Run project test command (`npm test`, `pytest`, `cargo test`)
- [ ] **Types**: `npx tsc --noEmit` (TypeScript projects)
- [ ] **Lint**: Run project lint command (`npm run lint`, `ruff check`, `cargo clippy`)
- [ ] **Visual**: If UI changes detected, spawn `design-qa` agent for visual verification

### 3. Caching (LAST step — only for frontend)
If this is a UI project and visual verification passed:
- [ ] Enable caching configs now (ISR, CDN headers, etc.)
- [ ] Add comment: `// Caching enabled post-verification`
- [ ] Commit caching separately: `feat: enable caching post-verification`

Write state file to allow caching:
```bash
STATE_DIR=$(cat /tmp/claude-current-session-state-dir 2>/dev/null)
touch "$STATE_DIR/caching-approved"
```

### 4. Create PR
```bash
gh pr create --title "feat: [description]" --body "$(cat <<'EOF'
## Summary
[Auto-generated from commits]

## Quality Gates
- Tests: PASS
- Types: PASS
- Lint: PASS
- Visual: PASS/N/A

## Test Plan
- [ ] Verify on staging
- [ ] Check canary after deploy
EOF
)"
```

### 5. Post-Merge
After PR approved and merged:
- [ ] Update changelog
- [ ] Tag release if needed: `git tag -a v{version} -m "Release v{version}"`
- [ ] Run `/canary-smoke` on deployed URL
