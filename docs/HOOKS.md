# Hook System Documentation

## How It Works

Claude Code v7.0 uses a **3-layer enforcement model**. Layer 2 (Hooks) physically prevents violations — Claude cannot bypass them.

### Hook Types

| Type | When | Purpose |
|------|------|---------|
| **PreToolUse** | Before Write/Edit/Bash | Block violations before they happen |
| **PostToolUse** | After Skill invocation | Track state (design phase completed, etc.) |
| **SessionStart** | Session begins | Initialize state directory |

### Exit Codes

| Code | Meaning | Effect |
|------|---------|--------|
| 0 | Allow | Operation proceeds |
| 1 | Warn | Warning shown, operation proceeds |
| 2 | Block | Operation blocked, error fed back to Claude for self-correction |

## Hook Scripts

### v7-code-enforcer.sh (PreToolUse: Write|Edit)

6 enforcement rules in one consolidated script:

1. **Design-first** — Blocks NEW .tsx/.vue files in `components/`, `pages/`, `app/`, `screens/`, `views/` directories if no design phase state file exists
2. **Caching-last** — Blocks `revalidate`, `stale-while-revalidate`, `Cache-Control`, `s-maxage`, `CacheInterceptor`, `CacheTTL`, `cacheFirst`, `cache.put` if no visual-verify state file exists
3. **TypeORM safety** — Blocks `.find()` and `.findOne()` without `where`/`take` in `src/**/*.ts`
4. **No process.env** — Blocks `process.env.X` in `src/**/*.ts` (except `*.config.*`, `*.spec.*`, `*.test.*`, `config/`)
5. **No any financial** — Blocks `: any` in files with `payment`, `finance`, `wallet`, `transaction`, `billing` in path
6. **Figma reference** — Warns (exit 1) on new UI component without Figma context check

### v7-safety-guardrails.sh (PreToolUse: Write|Edit|Bash)

2 safety features:

1. **Freeze** — When `/freeze` is active, blocks all Write/Edit operations outside the frozen directory
2. **Careful** — When `/careful` is active, warns on destructive Bash commands (`rm -rf`, `git push --force`, `DROP TABLE`, etc.)

### v7-state-init.sh (SessionStart)

Creates `/tmp/claude-session-{PID}/` directory for inter-hook communication. Cleans up stale sessions older than 24h.

### v7-state-writer.sh (PostToolUse: Skill)

Detects when `ui-ux-pro-max` skill or Figma `get_design_context` was invoked. Writes state files:
- `design-phase-completed-{component}` — unlocks code enforcer for that component
- `figma-checked-{component}` — records Figma context was fetched

### v7-cost-breaker.sh (called by autonomous loop)

Reads cumulative cost from state file, compares against `AUTONOMOUS_COST_LIMIT` (default: $15). Returns exit code 2 if exceeded.

## State Protocol

Hooks communicate via files in `/tmp/claude-session-{PID}/`:

```
/tmp/claude-session-12345/
├── design-phase-completed-button     # Design phase done for Button component
├── visual-verify-passed-button       # Visual verification passed
├── figma-checked-button              # Figma context was fetched
├── freeze-active                     # /freeze is enabled
├── freeze-directory                  # Contains frozen directory path
├── careful-active                    # /careful is enabled
├── caching-approved                  # Global caching approval
├── autonomous-loop-active            # Autonomous mode running
├── cumulative-cost                   # Running cost total (dollars)
└── wave-{N}-complete                 # Wave N finished
```

Component names are normalized: `basename` without extension, lowercased, spaces→dashes.

## Adding Custom Rules

Edit `v7-code-enforcer.sh` and add a new rule section:

```bash
# === RULE 7: Your Custom Rule ===
if [[ "$FILE_PATH" =~ your_pattern ]]; then
  if echo "$INPUT" | grep -qE 'your_regex' 2>/dev/null; then
    echo "BLOCKED: Your rule description" >&2
    echo "Fix: How to fix the issue" >&2
    exit 2
  fi
fi
```

## Troubleshooting

**Hook not firing?**
- Hooks must be in `~/.claude/settings.json` under `hooks` key (NOT in `hooks/hooks.json` — that's plugin format)
- Check matcher matches the tool name exactly: `Write`, `Edit`, `Bash`, `Skill`

**Hook blocks everything?**
- Check state directory exists: `cat /tmp/claude-current-session-state-dir`
- Run `bash ~/.claude/hooks/v7-state-init.sh` to reinitialize

**Need to bypass temporarily?**
- Design-first: add `// design-approved` to file
- Caching-last: `touch $(cat /tmp/claude-current-session-state-dir)/caching-approved`
- Freeze: `rm $(cat /tmp/claude-current-session-state-dir)/freeze-active`
