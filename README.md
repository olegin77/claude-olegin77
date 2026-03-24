# Claude Code v7.0 — "Autonomous Factory"

> Production-grade Claude Code configuration with hook enforcement, design-first pipeline, wave-based orchestration, and autonomous execution loops.

**Battle-tested** across 7+ projects (NestJS, Next.js, Django, FastAPI, React Native, Rust/Solana).

---

## What This Is

A complete Claude Code setup that makes Claude:
- **Autonomous** — plans, codes, tests, reviews, commits without manual intervention
- **Enforced** — critical rules enforced by hooks (exit code 2 = blocked), not just CLAUDE.md suggestions
- **Design-first** — impossible to write UI code without completing design phase
- **Safe** — caching enabled only after visual verification, scope locks during debugging, cost limits on autonomous runs

## Architecture: 3 Layers

```
┌─────────────────────────────────────────────────┐
│  LAYER 3: ORCHESTRATION                         │
│  GSD wave execution, fresh context per task,    │
│  autonomous loops, post-deploy canary           │
├─────────────────────────────────────────────────┤
│  LAYER 2: ENFORCEMENT (Hooks)                   │
│  PreToolUse blocks violations (exit code 2),    │
│  PostToolUse tracks state, SessionStart init    │
├─────────────────────────────────────────────────┤
│  LAYER 1: INTELLIGENCE (CLAUDE.md)              │
│  Dispatch table, project routing, progressive   │
│  disclosure, model routing                      │
└─────────────────────────────────────────────────┘
```

## Quick Install

```bash
# 1. Clone this repo
git clone https://github.com/olegin77/claude-olegin77.git
cd claude-olegin77

# 2. Run installer
bash install.sh

# 3. Install recommended plugins
bash install-plugins.sh

# 4. Restart Claude Code
```

## What Gets Installed

### Hook Enforcement (6 rules — Layer 2)

| Rule | What it does | Exit Code |
|------|-------------|-----------|
| **Design-first** | Blocks new .tsx in UI dirs without design phase | 2 (block) |
| **Caching-last** | Blocks `revalidate`/`Cache-Control` without visual verification | 2 (block) |
| **No `process.env`** | Blocks `process.env.X` in services/controllers (use ConfigService) | 2 (block) |
| **No bare `find()`** | Blocks TypeORM `find()`/`findOne()` without `where`/`take` | 2 (block) |
| **No `any` financial** | Blocks `any` type in payment/finance/wallet code | 2 (block) |
| **Figma check** | Warns on new UI component without Figma reference | 1 (warn) |

Escape hatch: add `// design-approved` at top of file.

### Auto-Dispatch Table

Claude automatically invokes the right skill/agent based on your message:

| You say | Claude does |
|---------|------------|
| UI, design, component, page | `ui-ux-pro-max` skill + `design-qa` agent |
| mobile, react native, expo | Reads mobile patterns + `mobile-developer` agent |
| fix, bug, error | `systematic-debugging` skill |
| add, create, build | `brainstorming` → `writing-plans` skills |
| ship, deploy, release | Full shipping pipeline (`/ship`) |
| cache, ISR, revalidate | Reads caching strategy — **caching always last** |
| test, tdd | `test-driven-development` skill |
| done, commit | `verification-before-completion` skill |
| review, PR | `coderabbit:review` |
| NestJS, service, controller | Reads NestJS patterns + `typescript-expert` |

### Safety Guardrails

| Command | What it does |
|---------|-------------|
| `/freeze src/users/` | Locks all edits to that directory (debugging scope lock) |
| `/ship` | Full pipeline: test → lint → types → visual verify → cache → PR → canary |
| `/canary-smoke https://...` | Post-deploy smoke test (console errors + screenshot) |
| `/design-check` | Manual design quality review |

### Model Routing

| Task | Model |
|------|-------|
| Architecture, security, design review | **Opus** |
| Coding, wave executors, self-review | **Sonnet** |
| File search, formatting (mechanical) | **Haiku** |

### Cost Protection

Autonomous mode has a **$15/session cost limit** by default. Configurable via `AUTONOMOUS_COST_LIMIT` env var.

---

## File Structure

```
claude-olegin77/
├── install.sh                    # Main installer
├── install-plugins.sh            # Plugin installer
├── config/
│   ├── CLAUDE.md                 # v7.0 core config (~8.5k chars)
│   ├── hooks/
│   │   ├── v7-code-enforcer.sh   # 6 enforcement rules
│   │   ├── v7-safety-guardrails.sh # freeze + careful
│   │   ├── v7-state-init.sh      # Session state initialization
│   │   ├── v7-state-writer.sh    # PostToolUse state tracking
│   │   └── v7-cost-breaker.sh    # Autonomous cost limiter
│   ├── refs/
│   │   ├── design-pipeline.md    # Design-first pipeline rules
│   │   ├── caching-strategy.md   # Caching-last rules
│   │   ├── orchestration.md      # Wave execution + autonomous loops
│   │   └── mobile-patterns.md    # React Native + Expo patterns
│   ├── agents/
│   │   ├── design-qa.md          # Design quality + visual verification
│   │   ├── canary-smoke.md       # Post-deploy smoke test
│   │   └── mobile-developer.md   # React Native specialist
│   ├── commands/
│   │   ├── ship.md               # Full shipping pipeline
│   │   ├── freeze.md             # Scope lock for debugging
│   │   ├── design-check.md       # Anti-AI-slop review
│   │   └── canary-smoke.md       # Post-deploy verification
│   └── rules/
│       └── common/               # Language-agnostic coding rules
├── docs/
│   ├── SPEC.md                   # Full v7.0 specification
│   ├── HOOKS.md                  # Hook system documentation
│   ├── PLUGINS.md                # Recommended plugins list
│   └── CUSTOMIZATION.md          # How to customize for your projects
└── examples/
    └── projects-template.md      # Template for refs/projects.md
```

## Recommended Plugins

### Official (auto-managed by Claude Code)
| Plugin | Purpose |
|--------|---------|
| superpowers | Brainstorming, plans, TDD, debugging, verification |
| coderabbit | AI code review |
| context7 | Up-to-date library docs |
| figma | Figma design integration |
| playwright | E2E testing + screenshots |
| semgrep | Security scanning |
| pinecone | Vector search |
| supabase | Database tools |
| ralph-loop | Autonomous iteration loops |

### Marketplace
| Plugin | Source | Purpose |
|--------|--------|---------|
| everything-claude-code | `affaan-m/everything-claude-code` | 25+ agents, 100+ skills, hooks, commands |
| ui-ux-pro-max | `nextlevelbuilder/ui-ux-pro-max-skill` | UI/UX design intelligence |
| compound-engineering | `EveryInc/compound-engineering-plugin` | Advanced engineering patterns |
| safety-net | `kenryu42/claude-code-safety-net` | Safety guardrails |
| claude-hud | `jarrodwatts/claude-hud` | Status line HUD |

### Orchestration
| Tool | Install | Purpose |
|------|---------|---------|
| GSD (Get Shit Done) | `npx get-shit-done-cc@latest --global` | Wave-based parallel execution |
| gstack | `git clone garrytan/gstack` → skills/ | Safety guardrails + design review |

## Lessons Learned (16 battle-tested rules)

1. NEVER mark done without running actual code
2. NEVER create DB migration without checking data loss
3. NEVER assume env vars — fail fast with clear message
4. NEVER `any` in financial/cryptographic code
5. Confirm destructive ops with user FIRST
6. Never ship without at least one test on happy path
7. Plan changes mid-execution → STOP → re-sync
8. Never rsync .env to server
9. Bash with `!` or `$` → use Python subprocess
10. TypeORM decimal → ALWAYS `Number()` convert
11. AI TRIES FIRST before asking for secrets
12. NEVER `process.env` in service/controller — ConfigService only
13. NEVER `find()` without `where`/`take` in TypeORM
14. Ownership: 404 for other user's resources, NEVER 403
15. Every NestJS endpoint: index + pagination + rate limit + select
16. After release: git tag + changelog + report version table

## Customization

See [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md) for how to:
- Add your own projects to the dispatch table
- Customize hook rules
- Add project-specific agents
- Configure cost limits
- Set up Figma integration

## License

MIT — use freely, credit appreciated.

---

*v7.0 "Autonomous Factory" | Created by [@olegin77](https://github.com/olegin77) | 2026-03-23*
