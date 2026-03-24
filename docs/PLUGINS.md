# Recommended Plugins & Tools

## Official Plugins (auto-managed by Claude Code)

These are installed via `claude plugin install <name>` from the official registry.

| Plugin | Version | Purpose |
|--------|---------|---------|
| **superpowers** | 5.0.5 | Brainstorming, writing plans, TDD, debugging, verification, parallel agents |
| **coderabbit** | 1.0.0 | AI-powered code review |
| **context7** | latest | Up-to-date library/framework documentation |
| **figma** | 1.2.0 | Figma design-to-code integration |
| **playwright** | latest | E2E testing, screenshots, browser automation |
| **semgrep** | latest | Security scanning and SAST |
| **pinecone** | 1.3.0 | Vector database for AI search |
| **supabase** | latest | Database tools and Supabase integration |
| **ralph-loop** | latest | Autonomous iteration loops |
| **pyright-lsp** | 1.0.0 | Python type checking |
| **agent-sdk-dev** | latest | Claude Agent SDK development |
| **plugin-dev** | latest | Plugin development toolkit |
| **code-simplifier** | 1.0.0 | Code simplification and cleanup |
| **playground** | latest | Interactive HTML playgrounds |
| **qodo-skills** | 0.4.0 | Coding rules and PR resolution |

## Marketplace Plugins

Add marketplaces first, then install plugins:

### Everything Claude Code (ECC)
```bash
claude plugin marketplace add affaan-m/everything-claude-code
claude plugin install everything-claude-code
```
- **Version:** 1.9.0
- **Contents:** 25+ agents, 100+ skills, 57+ commands, automated hooks
- **Key features:** Continuous learning, session management, code review, multi-language support

### UI/UX Pro Max
```bash
claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
claude plugin install ui-ux-pro-max
```
- **Version:** 2.5.0
- **Contents:** UI/UX design intelligence — 50+ styles, 161 color palettes, 57 font pairings, 161 product types
- **Critical for:** Design-first pipeline enforcement

### Compound Engineering
```bash
claude plugin marketplace add EveryInc/compound-engineering-plugin
claude plugin install compound-engineering
```
- **Version:** 2.49.0
- **Contents:** Advanced engineering patterns, brainstorming, planning, code review, browser automation

### Safety Net
```bash
claude plugin marketplace add kenryu42/claude-code-safety-net
claude plugin install safety-net
```
- **Version:** 0.8.0
- **Contents:** Safety guardrails, destructive operation detection, custom rules

### Claude HUD
```bash
claude plugin marketplace add jarrodwatts/claude-hud
claude plugin install claude-hud
```
- **Version:** 0.0.10
- **Contents:** Status line HUD for Claude Code

### BuildWithClaude (optional)
```bash
claude plugin marketplace add davepoon/buildwithclaude
```
- **Contents:** Additional agents (development, infrastructure, language specialists, quality/security), database operations, various hooks

## Orchestration Tools

### GSD (Get Shit Done) — v1.28.0
```bash
npx get-shit-done-cc@latest --global --claude
```
Wave-based parallel execution with fresh contexts per task. 57 commands including:
- `/gsd:new-project` — Initialize project with deep context
- `/gsd:plan-phase` — Create detailed phase plans
- `/gsd:execute-phase` — Wave-based parallel execution
- `/gsd:autonomous` — Full autonomous mode
- `/gsd:ship` — PR creation and review
- `/gsd:debug` — Systematic debugging

### gstack (Garry Tan's Software Factory)
```bash
git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
```
49 files including safety guardrails, design review, post-deploy monitoring:
- `/freeze` — Scope lock during debugging
- `/careful` — Destructive operation warnings
- `/canary` — Post-deploy monitoring
- `/ship` — Shipping pipeline
- Design consultation and review workflows

## Plugin Update Commands

```bash
# Update marketplace plugins (git pull)
cd ~/.claude/plugins/marketplaces/everything-claude-code && git pull
cd ~/.claude/plugins/marketplaces/ui-ux-pro-max-skill && git pull
cd ~/.claude/plugins/marketplaces/safety-net-dev && git pull
cd ~/.claude/plugins/marketplaces/compound-engineering-plugin && git pull

# Update GSD
npx get-shit-done-cc@latest --global --claude

# Update gstack
cd ~/.claude/skills/gstack && git pull
# Or if not a git repo:
git clone --depth 1 https://github.com/garrytan/gstack.git /tmp/gstack-update
cp -r /tmp/gstack-update/* ~/.claude/skills/gstack/
rm -r /tmp/gstack-update
```
