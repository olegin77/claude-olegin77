# Claude Code Config — v8.0 "Lean Factory"

Optimized Claude Code configuration: 11 plugins, hook-enforced rules, on-demand refs.

## Structure

```
~/.claude/
├── CLAUDE.md              # Main instructions (dispatch table, identity, workflow)
├── settings.json          # Plugins, hooks, statusline
├── settings.local.json    # Local permissions (not shared)
├── rules/                 # Coding standards
│   ├── common/            # Language-agnostic (always loaded)
│   ├── typescript/        # TS/JS specific
│   └── python/            # Python specific
├── refs/                  # On-demand reference docs (loaded by dispatch)
├── hooks/                 # v7 enforcement hooks (code-enforcer, safety-guardrails)
├── agents/                # 47 specialized subagents
└── mcp-configs/           # MCP server definitions
```

## Active Plugins (11)

### Quality Core
- **superpowers** — brainstorming, plans, TDD, debugging, verification, worktrees
- **coderabbit** — AI code review
- **compound-engineering** — multi-agent review, reproduce-bug, specialized reviewers
- **context7** — live library documentation
- **pyright-lsp** — type checking

### Domain Tools
- **figma** — design integration
- **ui-ux-pro-max** — UI/UX design system
- **playwright** — E2E testing
- **commands-database-operations** — DB schema design
- **code-simplifier** — refactoring
- **playground** — interactive HTML playgrounds

## How It Works

1. **Dispatch** — every message scanned against intent table, skill/agent auto-invoked
2. **Enforcement** — hooks block violations (bare find(), process.env in services, etc.)
3. **Orchestration** — wave execution for parallel tasks, autonomous loop protocol

## Token Budget

| Component | ~Tokens |
|-----------|---------|
| CLAUDE.md | ~2,000 |
| Rules (20 files) | ~4,000 |
| 11 plugins (skills + agents) | ~25,000 |
| MCP servers (7) | ~8,000 |
| **Total at session start** | **~39,000** |

Previous v7 with 29 plugins: ~80,000+ tokens. Reduction: ~50%.
