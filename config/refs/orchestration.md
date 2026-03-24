# Orchestration — Wave Execution & Autonomous Mode

> Read this file when multi-step task or autonomous execution detected.

## Wave Execution Pattern

### Task Plan Format (Markdown)
```markdown
## Wave 1 (parallel)
- [ ] **Task name** | `path/to/file.ts`
  - Action: What to implement
  - Verify: `command to verify`
  - Done: Success criteria

## Wave 2 (depends on Wave 1)
- [ ] **Task name** | `path/to/file.ts`
  - Action: What to implement
  - Verify: `command to verify`
  - Done: Success criteria
```

### Wave Rules
- Tasks in same wave: NO file conflicts, run in parallel subagents
- Tasks in next wave: depend on previous wave completion
- Each subagent gets fresh 200k context (prevents context rot)
- Main session stays at <40% context utilization

### GSD Integration
If GSD is installed (`get-shit-done-cc`):
```bash
# Start GSD workflow
npx get-shit-done-cc

# Quick mode for simple tasks
npx get-shit-done-cc --fast "task description"
```

If GSD not installed: fall back to manual subagent parallelization.

## Autonomous Loop Protocol

```
1. Create git tag: pre-auto-{timestamp}
2. Read task plan
3. Execute next incomplete task in fresh subagent
4. Verify: run <verify> command
   - FAIL → self-correct (max 3 retries per task)
   - PASS → atomic commit, mark complete
5. Check cost: read /tmp/claude-session-STATE/cumulative-cost
   - Over limit ($15 default) → stop, report, commit completed work
6. All tasks done? → final verification
7. Final: full test suite + triple review (Skeptic/Architect/Minimalist)
8. Ship: PR + changelog
```

### Quality Gates (cannot skip)
- Tests must pass (unit + integration + E2E for affected flows)
- TypeScript strict: no errors (`npx tsc --noEmit`)
- Lint: no warnings
- If UI: screenshot comparison passes (design-qa agent)
- If API: request/response contract verified

### Safety Limits
- Max iterations: 50 (env: `AUTONOMOUS_MAX_ITERATIONS=50`)
- Cost limit: $15/session (env: `AUTONOMOUS_COST_LIMIT=15`)
- Destructive ops: always confirm (even in autonomous mode)

### Destructive Operations Classification

| Operation | Auto-execute | Always pause |
|-----------|-------------|-------------|
| DB migration: add column/table | Yes | |
| DB migration: drop/rename/truncate | | Yes |
| git push to feature branch | Yes | |
| git push to main/master | | Yes |
| git push --force | | Yes |
| npm publish | | Yes |
| File deletion in src/ (tests pass) | Yes | |
| .env modification | | Yes |

## Rollback Protocol

Before autonomous execution:
```bash
git tag pre-auto-$(date +%Y%m%d-%H%M%S)
```

Fatal failure:
```bash
git reset --hard pre-auto-{timestamp}
# Report: "Failed at Wave N, Task M. Rolled back."
```

Canary failure:
```bash
git revert HEAD --no-edit
git checkout -b fix/{issue-description}
# Alert: "Canary detected critical issue. Reverted. Fix branch created."
```

## State Files

| File | Purpose |
|------|---------|
| `autonomous-loop-active` | Marks autonomous mode is running |
| `wave-{N}-complete` | Marks wave N finished |
| `cumulative-cost` | Running cost total (dollars) |
| `pre-auto-tag` | Git tag name for rollback |

All in `/tmp/claude-session-${SESSION_ID}/`.

## /ship Pipeline

Full shipping sequence (see `/ship` command):
1. Tests → 2. Lint → 3. Types → 4. Visual verify (if UI) →
5. Enable caching (LAST) → 6. PR → 7. Deploy → 8. Canary smoke
