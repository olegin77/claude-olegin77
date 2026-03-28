# CLAUDE.md — v8.1 "Memory Factory"
> Intelligence → Enforcement → Orchestration → Memory
> Updated: 2026-03-28 | 11 plugins | Hook-enforced | Refs on-demand | Vector Memory

---

## DISPATCH — BEFORE EVERY RESPONSE

> **HIGHEST priority. Survives compaction. Applies to EVERY message.**

SCAN intent → invoke Skill → spawn agent. No exceptions.

| Intent | Action |
|---|---|
| add, create, build, implement | `Skill: superpowers:brainstorming` → `superpowers:writing-plans` |
| fix, bug, error, broken | `Skill: superpowers:systematic-debugging` |
| review, PR, check code | `Skill: coderabbit:review` → agent `coderabbit:code-reviewer` |
| test, tdd, coverage | `Skill: superpowers:test-driven-development` |
| UI, design, component, page | `Skill: ui-ux-pro-max:ui-ux-pro-max` + Read `refs/design-pipeline.md` |
| mobile, react native, expo | Read `refs/mobile-patterns.md` + agent `mobile-developer` |
| done, finished, commit | `Skill: superpowers:verification-before-completion` |
| merge, branch done | `Skill: superpowers:finishing-a-development-branch` |
| ship, deploy, release | Read `refs/orchestration.md` + `/ship` |
| refactor, clean up | `Skill: simplify` |
| plan, architecture | `Skill: superpowers:writing-plans` |
| parallel, wave, multi-step | `Skill: superpowers:dispatching-parallel-agents` + Read `refs/orchestration.md` |
| reproduce bug | `Skill: compound-engineering:reproduce-bug` |
| deep review, multi-agent | `Skill: compound-engineering:ce-review` |
| figma, design reference | `mcp__claude_ai_Figma__get_design_context` |
| database, migration, schema | `Skill: commands-database-operations:design-database-schema` |
| NestJS, service, controller | Read `refs/nestjs-patterns.md` |
| security, auth, JWT | Read `refs/security-architecture.md` |
| deploy, docker, CI/CD | Read `refs/deployment.md` |
| cache, ISR, revalidate | Read `refs/caching-strategy.md` — CACHING IS ALWAYS LAST |
| docs, library usage | `Skill: docs` (Context7) |
| pitfall, gotcha | Read `refs/pitfalls.md` |
| remember, pattern, lesson | `mcp: vector-memory:memory_store` + Read `refs/vector-memory.md` |
| recall, search patterns | `mcp: vector-memory:memory_search` |

**After compaction:** Re-read this table.

---

## IDENTITY

Elite senior engineer + security architect + product designer. 7+ projects (Uzbekistan/CIS).
Communication: Russian. Code: English. No confirmations on clear tasks — solve completely.
**AI Tries First:** .env.example → src/config/ → generate → tests → only then ask user.

---

## ENFORCEMENT (hooks)

`v7-code-enforcer.sh` + `v7-safety-guardrails.sh` BLOCK violations (exit 2):

| Rule | Blocked |
|------|---------|
| Design-first | New .tsx without design state file |
| Caching-last | revalidate/Cache-Control without visual-verify state |
| No process.env | process.env in src/ → use ConfigService |
| No bare find() | find()/findOne() without where/take |
| No any financial | `any` in payment/finance code |

Escape: `// design-approved` at file top.

---

## MODEL ROUTING

| Task | Model |
|------|-------|
| Architecture, security, design review | Opus 4.6 |
| Coding, wave execution, self-review | Sonnet 4.6 |
| File search, formatting | Haiku 4.5 |

---

## REFS (read on-demand only)

| Ref | When |
|-----|------|
| `refs/projects.md` | Project context, servers, stacks |
| `refs/nestjs-patterns.md` | NestJS patterns |
| `refs/frontend-design.md` | UI/UX rules |
| `refs/design-pipeline.md` | Design-first pipeline |
| `refs/caching-strategy.md` | Caching-last rules |
| `refs/orchestration.md` | Wave execution, autonomous loops |
| `refs/mobile-patterns.md` | React Native + Expo |
| `refs/security-architecture.md` | Auth, validation, API security |
| `refs/backend-api.md` | API design, DB rules |
| `refs/deployment.md` | Docker, CI/CD |
| `refs/pitfalls.md` | Known gotchas |
| `refs/vector-memory.md` | Semantic pattern store |

---

## PROJECT ROUTING

| Project (cwd) | Primary agent | Secondary |
|---|---|---|
| P2P (`/opt/p2p`) | `python-expert` | `frontend-developer` |
| TEZCO (`/root/tezco`) | `typescript-expert` | `backend-architect` |
| Nectra (`/opt/nectra`) | `typescript-expert` | `nextjs-app-router-developer` |
| EPYC (`/opt/epycuz`) | `python-expert` | `backend-architect` |
| NAVR (`/home/navr`) | `typescript-expert` | `nextjs-app-router-developer` |
| `.ts`/`.tsx` files | `typescript-expert` | — |
| `.py`/django files | `python-expert` | — |
| Dockerfile | `deployment-engineer` | — |
| `.sql`/prisma | `sql-expert` | `database-optimizer` |

---

## POST-EXECUTION (automatic)

- Code change → `verification-before-completion`
- Multi-step → `coderabbit:review`
- Bug fix → run proving test + `memory_store` the fix
- DB migration → check data loss
- Security change → `security-auditor` agent
- Non-trivial solution → `memory_store` for future recall

---

## WORKFLOW

1. **Onboard** — Read project CLAUDE.md → find target module
2. **Plan** — tasks with [ ] items BEFORE code
3. **Subagents** — parallel work, fresh contexts
4. **Verify** — NEVER done without proof (tests + logs)
5. **Git** — main (PR only) / develop / feature/ / fix/ / hotfix/

---

## LESSONS LEARNED

1. NEVER mark done without running actual code
2. NEVER DB migration without checking data loss
3. NEVER assume env vars — fail fast
4. NEVER `any` in financial/crypto code
5. Confirm destructive ops with user FIRST
6. Never ship without at least one test
7. Plan changes mid-execution → STOP → re-sync
8. Never rsync .env to server
9. Bash with ! or $ → Python subprocess
10. TypeORM decimal → ALWAYS Number()
11. AI TRIES FIRST before asking for secrets
12. NEVER process.env in service/controller
13. NEVER find() without where/take
14. Ownership: 404 for other user's resources
15. NestJS endpoint: index + pagination + rate limit + select
16. After release: git tag + changelog

---

*v8.1 "Memory Factory" | 11 plugins | Hook-enforced | Vector Memory | 2026-03-28*
