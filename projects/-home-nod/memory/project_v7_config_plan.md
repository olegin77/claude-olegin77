---
name: v7-autonomous-factory-completed
description: Claude Code v7.0 "Autonomous Factory" deployed 2026-03-23 — hook enforcement, design-first pipeline, GSD orchestration, gstack guardrails
type: project
---

Claude Code Configuration v7.0 "Autonomous Factory" DEPLOYED on 2026-03-23.

**What changed from v6.0:**
- CLAUDE.md rewritten: 8.5k chars (was 12k) with progressive disclosure via refs/
- 5 enforcement hooks: v7-code-enforcer.sh (6 rules), v7-safety-guardrails.sh, v7-state-writer.sh, v7-state-init.sh, v7-cost-breaker.sh
- 4 new refs: design-pipeline.md, caching-strategy.md, orchestration.md, mobile-patterns.md
- 2 new agents: design-qa (UI quality), canary-smoke (post-deploy)
- 4 new commands: /ship, /design-check, /freeze, /canary-smoke
- GSD installed (v1.28.0): 57 commands for wave-based orchestration
- gstack installed: 49 files for safety guardrails and design review
- Mobile stack: React Native + Expo for P2P, NAVR, WeddingUz
- Model routing: Opus (design/security), Sonnet (coding/review), Haiku (mechanical only)

**How to apply:**
- Hook enforcement is automatic (hooks.json updated)
- Design-first blocks new .tsx in UI dirs without design phase
- Caching-last blocks revalidate/Cache-Control without visual verify
- TypeORM find() without where → blocked
- process.env in services → blocked
- State protocol: /tmp/claude-session-$ID/ for inter-hook communication
- Cost breaker: $15/session default (AUTONOMOUS_COST_LIMIT env var)
- Spec: `docs/superpowers/specs/2026-03-22-claude-code-v7-autonomous-factory-design.md`
- Plan: `docs/superpowers/plans/2026-03-22-claude-code-v7-autonomous-factory.md`
