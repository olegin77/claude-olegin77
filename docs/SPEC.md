# Claude Code Configuration v7.0 — "Autonomous Factory"

## Full Specification

**Date:** 2026-03-22
**Author:** nod + Claude Opus 4.6
**Status:** Design approved, spec reviewed, pending implementation
**Review:** Architecture review completed — 4 critical issues fixed, 5 high issues addressed
**Scope:** Complete overhaul of ~/.claude/ configuration for maximum autonomous operation

---

## 1. Problem Statement

### Current issues (v6.0):
1. **Rules as suggestions** — CLAUDE.md dispatch table is advisory; Claude can skip rules without enforcement
2. **No design-first pipeline** — `ui-ux-pro-max` skill invocation is inconsistent; no enforced chain design → review → implement → QA
3. **Context rot** — all work accumulates in one context window; quality degrades past 60% utilization
4. **No post-deploy monitoring** — no `/canary`, no visual regression, no error watch after ship
5. **No wave-based execution** — parallelization exists but lacks dependency graphs
6. **Caching before visual verify** — ISR/CDN/service-worker enabled during development, user sees stale content
7. **Design quality (AI slop)** — generated UI looks generic even with references/screenshots/videos
8. **No mobile routing** — React Native/Expo patterns absent from dispatch and agents

### Requirements:
- **Autonomous operation** — Claude plans, codes, tests, reviews, commits, creates PRs without manual intervention
- **Quality gates** — autonomous but with self-correction; if tests fail or review finds issues, fix automatically
- **Design-first enforcement** — physically impossible to write UI code without completing design phase
- **Caching-last enforcement** — cache headers/ISR/CDN enabled only after visual verification
- **Wave-based orchestration** — independent tasks run in parallel with fresh contexts; dependent tasks wait
- **Post-deploy canary** — monitor errors, performance, visual regressions after ship
- **All 7+ projects supported** — project-aware routing for existing + new projects
- **Mobile development** — React Native + Expo integrated into dispatch and orchestration
- **Model routing quality-first** — Haiku only for mechanical tasks (grep, format); all reasoning on Sonnet/Opus

---

## 2. Architecture

### Three-Layer Model

```
┌──────────────────────────────────────────────────────┐
│  LAYER 3: ORCHESTRATION                              │
│  GSD wave execution, fresh context per executor,     │
│  ralph-wiggum autonomous loops, post-deploy canary,  │
│  gstack safety guardrails (/freeze, /careful)        │
├──────────────────────────────────────────────────────┤
│  LAYER 2: ENFORCEMENT (Hooks)                        │
│  PreToolUse: block violations (exit 2 → self-correct)│
│  PostToolUse: auto-format, lint, type-check, screenshot│
│  Stop: verify completion, autonomous continuation    │
├──────────────────────────────────────────────────────┤
│  LAYER 1: INTELLIGENCE (CLAUDE.md v7)                │
│  Dispatch table, project routing, progressive        │
│  disclosure, design-first pipeline, model routing    │
└──────────────────────────────────────────────────────┘
```

**Principle:** Layer 1 suggests, Layer 2 enforces, Layer 3 orchestrates.

---

## 3. CLAUDE.md v7.0 — Core Rewrite

### 3.1 New Mandatory Dispatch Table

Additions to existing table:

| Intent keyword | Action | Priority |
|---|---|---|
| UI, design, component, page, layout, landing, mobile screen | `Skill: ui-ux-pro-max:ui-ux-pro-max` + design-first pipeline enforce | CRITICAL |
| mobile, react native, expo, app, screen, navigation | Read `~/.claude/refs/mobile-patterns.md` + agent `mobile-developer` | HIGH |
| ship, deploy, release, publish | Orchestration: wave verify → PR → deploy → canary | HIGH |
| cache, ISR, revalidate, CDN, service worker | Read `~/.claude/refs/caching-strategy.md` + WARN: caching last | HIGH |
| figma, design reference, mockup | `mcp__claude_ai_Figma__get_design_context` + compare | HIGH |

### 3.2 Design-First Pipeline (new section in CLAUDE.md)

```markdown
## DESIGN-FIRST PIPELINE — MANDATORY FOR ALL UI WORK

> This is ENFORCED by hooks. Skipping = blocked by exit code 2.

When ANY UI work is detected (component, page, layout, style, CSS, mobile screen):

1. INVOKE `ui-ux-pro-max:ui-ux-pro-max` — ALWAYS, NO EXCEPTIONS
2. CHECK Figma — if project has Figma URL in refs/projects.md, call get_design_context
3. PROPOSE design — mockup or detailed description with:
   - Anti-AI-slop score (0-10 on 5 dimensions)
   - Typography: custom font pairing, not system defaults
   - Color depth: full palette, not 2-3 colors
   - Spacing rhythm: 4px/8px grid system
   - Micro-interactions: hover, transitions, loading states
   - Uniqueness: not generic Bootstrap/Tailwind defaults
4. GET approval — wait for user confirmation (autonomous mode: self-approve if score >= 7/10 on all dimensions)
5. IMPLEMENT — with design tokens from step 3
6. SCREENSHOT — capture via Playwright, compare vs mockup
7. VISUAL VERIFY — confirm implementation matches design
8. CACHING LAST — enable ISR/CDN/cache ONLY after step 7 passes
```

### 3.3 Caching-Last Rule (new section)

```markdown
## CACHING STRATEGY — ALWAYS LAST

> ENFORCED by PreToolUse hook. Writing cache config before visual verify = blocked.

NEVER enable during development:
- next.config.js: `revalidate`, `staleWhileRevalidate`
- HTTP headers: `Cache-Control`, `s-maxage`, `stale-while-revalidate`
- Service Worker: `cache.put()`, `cacheFirst`, `staleWhileRevalidate`
- CDN: Cloudflare cache rules, Vercel edge caching
- NestJS: `@CacheInterceptor`, `@CacheTTL`

ENABLE caching ONLY:
1. After visual verification passes (screenshot matches design)
2. After functional testing passes (E2E green)
3. As the FINAL commit before PR/deploy
4. With explicit comment: `// Caching enabled post-verification`
```

### 3.4 Autonomous Mode Protocol (new section)

```markdown
## AUTONOMOUS MODE — RALPH-WIGGUM ENHANCED

When task is received:
1. PLAN — decompose into waves (dependency graph)
2. EXECUTE — each wave task in fresh subagent context
3. VERIFY per task — tests pass? lint clean? types OK?
   - NO → self-correct in same subagent, retry (max 3)
   - YES → atomic commit, report back
4. VERIFY per wave — all tasks in wave complete?
   - NO → continue wave
   - YES → start next wave
5. FINAL VERIFY — all waves done:
   - Run full test suite
   - Self-review via 3 sub-agents (Skeptic, Architect, Minimalist)
   - Fix any issues found
   - Visual verify if UI changes
6. SHIP — commit, PR, changelog update
7. CANARY — if deployed: monitor errors for 5 minutes

Quality gates (cannot skip):
- Tests must pass (unit + integration + E2E for affected flows)
- TypeScript strict: no errors
- Lint: no warnings
- If UI: screenshot comparison passes
- If API: request/response contract verified

Safety limits:
- Max 50 iterations per autonomous loop
- Destructive operations: always confirm (even in autonomous mode)
- /freeze auto-activates during debugging (restrict to affected directory)
```

### 3.5 Mobile Development (new section)

```markdown
## MOBILE DEVELOPMENT — REACT NATIVE + EXPO

Stack: React Native 0.76+ | Expo SDK 52+ | TypeScript strict

Project routing:
| Project | Mobile needs |
|---------|-------------|
| P2P (Tashkent marketplace) | Buyer/seller mobile app |
| NAVR.uz | Customer mobile app |
| WeddingUz | Event booking mobile |
| New projects | Mobile-first by default |

Dispatch: any mobile keyword → Read ~/.claude/refs/mobile-patterns.md + agent mobile-developer

Patterns enforced:
- Expo Router (file-based navigation)
- React Query for server state
- Zustand for client state (not Redux)
- EAS Build for CI/CD
- OTA updates for hotfixes
- Platform-specific code: .ios.tsx / .android.tsx only when necessary
```

### 3.6 Project Routing v2 (updated)

Add to existing table:

| Project | Primary agent | Secondary | Mobile agent |
|---------|--------------|-----------|-------------|
| All TS projects | `typescript-expert` | domain-specific | `mobile-developer` |
| All Python projects | `python-expert` | domain-specific | `mobile-developer` |
| New projects | auto-detect from files | auto-detect | `mobile-developer` if mobile |

### 3.7 Model Routing v2.1 — Quality-First

```markdown
## MODEL ROUTING — QUALITY FIRST

| Task | Model | Rationale |
|------|-------|-----------|
| Architecture, security audit, complex design | Opus 4.6 | Maximum reasoning |
| Main coding, feature implementation | Sonnet 4.6 | Best coding model |
| Self-review sub-agents (3x parallel) | Sonnet 4.6 | Review = critical, no Haiku |
| Design review, anti-AI-slop scoring | Opus 4.6 | Design = pain point, maximum quality |
| Wave executors (parallel coding) | Sonnet 4.6 | Fast + quality |
| Documentation generation | Sonnet 4.6 | Docs = cross-session memory |
| File search, glob, grep operations | Haiku 4.5 | Mechanical, 100% verifiable |
| Auto-formatting, linting | Haiku 4.5 | Deterministic, no AI judgment needed |

Rule: If in doubt → Sonnet. Haiku ONLY for operations where output is deterministic.
```

---

## 4. Hook Enforcement System

### 4.1 New PreToolUse Hooks

#### Hook: design-first-enforcer
```
Event: PreToolUse (Write, Edit)
Trigger: File matches *.tsx, *.vue, *.svelte, *.css, *.scss AND content contains UI keywords
         (className, style, component, render, return <, View, Text, TouchableOpacity)
Check: Has ui-ux-pro-max been invoked in this session for this component?
Exit 2 message: "BLOCKED: UI code detected without design phase. Run design-first pipeline:
  1. Invoke ui-ux-pro-max:ui-ux-pro-max
  2. Check Figma context if available
  3. Propose design with anti-AI-slop score
  4. Get approval before writing code"
```

#### Hook: caching-last-enforcer
```
Event: PreToolUse (Write, Edit)
Trigger: Content contains revalidate|stale-while|Cache-Control|s-maxage|CacheInterceptor|CacheTTL|cache.put|cacheFirst
Check: Is this the final commit stage? Has visual verification passed?
Exit 2 message: "BLOCKED: Caching config detected before visual verification.
  Caching must be the LAST step after:
  1. Visual verification passes (screenshot matches design)
  2. Functional tests pass (E2E green)
  Move caching to final commit."
```

#### Hook: typeorm-safety
```
Event: PreToolUse (Write, Edit)
Trigger: File matches *.ts AND content contains .find( or .findOne( without where clause
Check: Grep for find/findOne without { where: or { take:
Exit 2 message: "BLOCKED: TypeORM find() without where/take clause detected.
  Always use: this.repo.find({ where: { ... }, take: N, select: [...] })
  Never use: this.repo.find() — this loads entire table."
```

#### Hook: no-process-env
```
Event: PreToolUse (Write, Edit)
Trigger: File matches src/**/*.ts (not *.config.ts, not *.spec.ts) AND content contains process.env
Check: Is process.env used outside of config files?
Exit 2 message: "BLOCKED: process.env.X detected in service/controller.
  Use ConfigService injection instead:
  constructor(private config: ConfigService) {}
  this.config.get('KEY')"
```

#### Hook: no-any-financial
```
Event: PreToolUse (Write, Edit)
Trigger: File path contains payment|finance|wallet|transaction|billing AND content contains : any
Check: Is 'any' type used in financial code?
Exit 2 message: "BLOCKED: 'any' type in financial code.
  Use proper types: number for amounts, Decimal for precision,
  string for IDs, enum for statuses."
```

#### Hook: figma-reference-check
```
Event: PreToolUse (Write, Edit)
Trigger: New component file created (*.tsx) in components/ or pages/ directory
Check: Has Figma get_design_context been called for this component?
Exit 1 message (warn, not block): "WARNING: New UI component without Figma reference.
  If a Figma design exists, call get_design_context first for pixel-perfect implementation."
```

### 4.2 Enhanced PostToolUse Hooks

#### Hook: auto-screenshot-compare
```
Event: PostToolUse (Write, Edit)
Trigger: UI file modified (*.tsx, *.vue, *.css)
Action: If dev server running, capture screenshot via Playwright
  Compare with previous screenshot (if exists)
  Report visual diff percentage
  If diff > 30%: warn user about major visual change
```

#### Hook: atomic-commit-per-task
```
Event: PostToolUse (Write, Edit)
Trigger: Task marked as completed in autonomous mode
Action: Stage affected files, create atomic commit with task description
  Format: "feat(wave-N/task-M): <task description>"
```

### 4.3 Enhanced Stop Hooks

#### Hook: autonomous-continuation
```
Event: Stop
Trigger: Active autonomous loop with incomplete tasks
Action: Check if all planned tasks are complete
  If incomplete: re-inject prompt with remaining tasks (ralph-wiggum pattern)
  If complete: proceed to final verification
  Max iterations: 50 (configurable via AUTONOMOUS_MAX_ITERATIONS env var)
```

#### Hook: triple-review-gate
```
Event: Stop
Trigger: Autonomous mode completing
Action: Spawn 3 sub-agents in parallel (all Sonnet 4.6):
  1. Skeptic: "Find reasons this code will break in production"
  2. Architect: "Does this follow project patterns and CLAUDE.md rules?"
  3. Minimalist: "What can be removed without losing functionality?"
  Collect results. If any CRITICAL issues: auto-fix and re-verify.
  If only MEDIUM/LOW: note in PR description.
```

---

## 5. Orchestration System

### 5.1 GSD Wave Execution

Install: `npx get-shit-done-cc@latest --global`

Integration with existing workflow:

```
User task received
    ↓
Phase 1: DISCUSS (if ambiguous)
  → Surface gray areas, lock preferences
  → Store decisions in STATE.md
    ↓
Phase 2: PLAN
  → Parallel researchers (fresh context each)
  → Generate XML task plan:
    <plan>
      <wave id="1" parallel="true">
        <task type="auto">
          <name>Create User entity</name>
          <files>src/users/entities/user.entity.ts</files>
          <action>Define User entity with TypeORM decorators...</action>
          <verify>npm run build && npm run test -- --grep User</verify>
          <done>User entity compiles, passes unit test</done>
        </task>
        <task type="auto">
          <name>Create Product entity</name>
          <files>src/products/entities/product.entity.ts</files>
          <action>Define Product entity...</action>
          <verify>npm run build && npm run test -- --grep Product</verify>
          <done>Product entity compiles, passes unit test</done>
        </task>
      </wave>
      <wave id="2" depends="1">
        <task type="auto">
          <name>Create Order service</name>
          <files>src/orders/orders.service.ts</files>
          <action>Implement OrderService using User + Product...</action>
          <verify>npm run test -- --grep Order</verify>
          <done>OrderService passes all tests including relations</done>
        </task>
      </wave>
    </plan>
    ↓
Phase 3: EXECUTE
  → Wave 1: parallel subagents (fresh 200k context each)
  → Wave 2: starts after Wave 1 completes
  → Each task: implement → verify → atomic commit
    ↓
Phase 4: VERIFY
  → Full test suite
  → Triple review (Skeptic/Architect/Minimalist)
  → Visual regression (if UI)
  → Lint + types clean
    ↓
Phase 5: SHIP
  → PR with auto-generated description
  → Changelog update
  → Version bump if needed
    ↓
Phase 6: CANARY (if deployed)
  → Monitor console errors for 5 min
  → Check Core Web Vitals
  → Screenshot comparison with production
```

### 5.2 Safety Guardrails (from gstack)

New commands to create:

#### /freeze <directory>
```
Purpose: Restrict all file edits to specified directory
Use: During debugging, prevent scope creep
Auto-trigger: When debugging enters 3rd iteration without fix
Implementation: PreToolUse hook that blocks Write/Edit outside frozen directory
Exit: /unfreeze or task completion
```

#### /careful
```
Purpose: Extra warnings before destructive operations
Use: During production-adjacent work
Implementation: PreToolUse hook that warns on:
  - git push/force
  - rm/delete operations
  - DROP/TRUNCATE/DELETE SQL
  - docker rm/rmi
  - npm publish
```

#### /canary
```
Purpose: Post-deploy monitoring
Use: After shipping to production
Implementation: Autonomous loop that:
  1. Opens deployed URL in Playwright
  2. Checks console for errors (every 30s for 5 min)
  3. Captures Core Web Vitals (LCP, FID, CLS)
  4. Compares screenshots with pre-deploy baseline
  5. Reports anomalies
  6. Auto-creates hotfix branch if critical error found
```

#### /ship
```
Purpose: Full shipping pipeline
Use: When feature is ready to deploy
Implementation: Sequential pipeline:
  1. Run full test suite (unit + integration + E2E)
  2. Lint + type check
  3. Visual regression check (if UI)
  4. Enable caching (if UI — this is where caching goes)
  5. Create PR with comprehensive description
  6. After merge: deploy
  7. After deploy: /canary
```

### 5.3 Autonomous Loop Protocol

Based on ralph-wiggum pattern from official claude-code plugins:

```
Configuration:
  MAX_ITERATIONS=50
  COMPLETION_MARKER="ALL_TASKS_COMPLETE"
  QUALITY_GATES=["tests", "lint", "types", "visual"]

Loop:
  1. Read current task plan
  2. Execute next incomplete task in fresh subagent
  3. Verify task completion (run <verify> command)
  4. If failed: self-correct (max 3 retries per task)
  5. If passed: atomic commit, mark task complete
  6. Check: all tasks done?
     - No: continue to step 1
     - Yes: run final verification
  7. Final verification:
     - Full test suite
     - Triple review
     - Visual check (if UI)
  8. Ship or report completion

Stop conditions:
  - All tasks complete + all gates pass
  - Max iterations reached
  - Destructive operation needed (pause for confirmation)
  - Cost budget exceeded
```

---

## 6. New Reference Files

### 6.1 ~/.claude/refs/mobile-patterns.md (NEW)

Content covers:
- React Native 0.76+ with New Architecture
- Expo SDK 52+ with Expo Router
- Navigation patterns (file-based with Expo Router)
- State management (Zustand + React Query)
- Platform-specific code conventions
- EAS Build and OTA update workflows
- Testing with React Native Testing Library
- Performance optimization (Hermes, lazy loading, FlatList)

### 6.2 ~/.claude/refs/caching-strategy.md (NEW)

Content covers:
- The "caching last" principle with rationale
- Next.js ISR/SSG caching patterns
- NestJS CacheInterceptor patterns
- CDN configuration (Cloudflare, Vercel Edge)
- Service Worker strategies
- When to enable each cache layer
- How to verify before enabling
- Debug commands for cache invalidation

### 6.3 ~/.claude/refs/orchestration.md (NEW)

Content covers:
- GSD wave execution reference
- XML task format specification
- Wave dependency rules
- Fresh context per executor rationale
- Autonomous loop configuration
- Quality gate definitions
- Safety guardrail commands
- Post-deploy canary protocol

### 6.4 ~/.claude/refs/design-pipeline.md (NEW)

Content covers:
- Design-first enforcement rules
- Anti-AI-slop scoring system (5 dimensions, 0-10 each)
- Figma integration workflow
- Typography selection guidelines
- Color palette depth requirements
- Spacing system (4px/8px grid)
- Micro-interaction checklist
- Screenshot comparison workflow
- Visual regression detection thresholds

---

## 7. New Agents

### 7.1 design-enforcer agent (NEW)

```yaml
name: design-enforcer
description: Enforces design-first pipeline for all UI work
model: opus
tools: [Read, Grep, Glob, Bash]
```

Responsibilities:
- Verify ui-ux-pro-max was invoked before UI code
- Score design proposals on 5 anti-AI-slop dimensions
- Check Figma context was fetched if available
- Verify visual implementation matches design
- Block caching until visual verification passes

### 7.2 visual-verifier agent (NEW)

```yaml
name: visual-verifier
description: Captures and compares screenshots for visual regression detection
model: sonnet
tools: [Read, Bash, Glob]
```

Responsibilities:
- Capture screenshots via Playwright after UI changes
- Compare with baseline screenshots (pixel diff)
- Compare with Figma mockups if available
- Report diff percentage and highlight areas
- Approve or reject visual changes

### 7.3 canary-monitor agent (NEW)

```yaml
name: canary-monitor
description: Post-deploy monitoring for errors, performance, and visual regressions
model: sonnet
tools: [Read, Bash, Glob, Grep]
```

Responsibilities:
- Open deployed URL in headless browser
- Monitor console for errors (5 min watch)
- Capture Core Web Vitals (LCP, FID, CLS)
- Compare screenshots with pre-deploy baseline
- Auto-create hotfix branch if critical issues found
- Generate canary report

### 7.4 wave-orchestrator agent (NEW)

```yaml
name: wave-orchestrator
description: Manages GSD wave-based parallel task execution
model: sonnet
tools: [Read, Write, Edit, Bash, Glob, Grep]
```

Responsibilities:
- Parse XML task plans
- Determine wave dependencies
- Dispatch parallel subagents per wave
- Collect results and verify completions
- Manage autonomous loop lifecycle
- Report progress to main session

---

## 8. New Commands

### 8.1 /freeze <directory>
Restrict edits to a single directory during debugging.

### 8.2 /careful
Enable extra warnings for destructive operations.

### 8.3 /canary <url>
Start post-deploy monitoring on a deployed URL.

### 8.4 /ship
Run full shipping pipeline: test → lint → visual → cache → PR → deploy → canary.

### 8.5 /design-check
Manually trigger anti-AI-slop review on current UI.

### 8.6 /wave-status
Show current wave execution progress.

---

## 9. Plugins to Install

| Plugin | Source | Command |
|---|---|---|
| GSD | npm | `npx get-shit-done-cc@latest --global` |
| gstack | GitHub | Clone `garrytan/gstack` skills to `~/.claude/skills/gstack/` |
| feature-dev | Official | `claude plugin install feature-dev` from anthropics/claude-code |
| hookify | Official | `claude plugin install hookify` from anthropics/claude-code |
| Conductor | wshobson | `claude plugin marketplace add wshobson/agents` then install conductor |

---

## 10. Updated hooks.json Structure

The new hooks.json will contain:

### PreToolUse hooks (14 total):
1. design-first-enforcer (NEW — exit code 2)
2. caching-last-enforcer (NEW — exit code 2)
3. typeorm-safety (NEW — exit code 2)
4. no-process-env (NEW — exit code 2)
5. no-any-financial (NEW — exit code 2)
6. figma-reference-check (NEW — exit code 1 warn)
7. freeze-scope-lock (NEW — exit code 2 when active)
8. careful-destructive-warn (NEW — exit code 1)
9. auto-start-dev-servers (existing)
10. tmux-reminder (existing)
11. git-push-review (existing)
12. doc-file-warning (existing)
13. strategic-compaction (existing)
14. continuous-learning-observer (existing)

### PostToolUse hooks (7 total):
1. auto-screenshot-compare (NEW)
2. atomic-commit-per-task (NEW — autonomous mode only)
3. log-pr-urls (existing)
4. async-build-analysis (existing)
5. quality-gate-checks (existing)
6. auto-format-js-ts (existing)
7. typescript-type-check (existing)

### Stop hooks (6 total):
1. autonomous-continuation (NEW — ralph-wiggum)
2. triple-review-gate (NEW — 3 sub-agents)
3. console-log-check (existing)
4. persist-session-state (existing)
5. evaluate-session-patterns (existing)
6. cost-tracking (existing)

---

## 11. Progressive Disclosure Update

Current problem: CLAUDE.md loads full dispatch table + all rules upfront (~22k chars).

New approach (from wshobson/agents pattern):

### Always loaded (~8k chars):
- Identity + operating mode
- Mandatory dispatch table (keyword → action mapping)
- Anti-skip rules
- Autonomous mode trigger
- Lesson rules (compact list)

### Loaded on activation (~15k chars each):
- Design-first pipeline details (when UI work detected)
- Orchestration protocol (when multi-step task detected)
- Mobile patterns (when mobile work detected)
- Security architecture (when auth/security work detected)
- NestJS patterns (when NestJS work detected)

### Loaded on demand (~5k chars each):
- Caching strategy (when cache keyword detected)
- Deployment procedures (when deploy detected)
- Pitfalls reference (when known-issue pattern detected)

This reduces initial context from ~22k to ~8k chars, freeing 14k tokens for actual work.

---

## 12. Migration Plan (High Level)

### Phase 1: Foundation (Session 1)
- Rewrite CLAUDE.md v7.0 with new sections
- Create new reference files (mobile, caching, orchestration, design-pipeline)
- Update refs/projects.md with mobile info

### Phase 2: Enforcement (Session 2)
- Implement all new PreToolUse hooks
- Implement new PostToolUse hooks
- Implement new Stop hooks
- Test each hook individually

### Phase 3: Agents & Commands (Session 3)
- Create design-enforcer agent
- Create visual-verifier agent
- Create canary-monitor agent
- Create wave-orchestrator agent
- Create new commands (/freeze, /careful, /canary, /ship, /design-check, /wave-status)

### Phase 4: Orchestration (Session 4)
- Install GSD globally
- Install gstack skills
- Install feature-dev and hookify from official plugins
- Configure autonomous loop protocol
- Test wave execution on a small feature

### Phase 5: Integration Testing (Session 5)
- Test full pipeline: task → plan → waves → execute → verify → ship → canary
- Test design-first enforcement on UI task
- Test caching-last enforcement
- Test autonomous mode with quality gates
- Fix any integration issues

### Phase 6: Documentation (Session 6)
- Update all project CLAUDE.md files
- Update audit.md, report.md, changelog.md
- Create v7.0 migration guide
- Clean up deprecated v6.0 artifacts

---

## 13. Success Criteria

1. **Auto-activation rate: 100%** — every relevant skill/agent activates without manual /command
2. **Design-first compliance: 100%** — impossible to write UI code without design phase
3. **Caching-last compliance: 100%** — impossible to enable caching before visual verify
4. **Autonomous task completion: 90%+** — 9/10 tasks complete without user intervention
5. **Context utilization: <40%** — main session stays lean via fresh executor contexts
6. **Visual quality score: 7+/10** — anti-AI-slop scoring on all 5 dimensions
7. **Post-deploy zero-surprise: 100%** — canary catches issues before users do
8. **All hook rules enforced: 100%** — critical rules in hooks, not just CLAUDE.md text

---

## Appendix A: File Inventory (v7.0)

```
~/.claude/
├── CLAUDE.md                          ← v7.0 rewrite (~8k always-loaded + refs)
├── AGENTS.md                          ← updated with new agents
├── settings.json                      ← updated permissions for autonomous mode
├── hooks/
│   └── hooks.json                     ← 14 PreToolUse + 7 PostToolUse + 6 Stop
├── refs/
│   ├── projects.md                    ← +mobile projects, +new projects
│   ├── nestjs-patterns.md             ← existing
│   ├── frontend-design.md             ← existing
│   ├── security-architecture.md       ← existing
│   ├── backend-api.md                 ← existing
│   ├── deployment.md                  ← existing
│   ├── pitfalls.md                    ← existing
│   ├── design-pipeline.md             ← NEW
│   ├── orchestration.md               ← NEW
│   ├── mobile-patterns.md             ← NEW
│   └── caching-strategy.md            ← NEW
├── agents/
│   ├── design-enforcer.md             ← NEW
│   ├── visual-verifier.md             ← NEW
│   ├── canary-monitor.md              ← NEW
│   ├── wave-orchestrator.md           ← NEW
│   └── ... (27 existing agents)
├── skills/
│   ├── gsd/                           ← NEW (installed via npx)
│   ├── gstack/                        ← NEW (cloned from GitHub)
│   └── ... (47 existing skills)
├── commands/
│   ├── freeze.md                      ← NEW
│   ├── careful.md                     ← NEW
│   ├── canary.md                      ← NEW
│   ├── ship.md                        ← NEW
│   ├── design-check.md                ← NEW
│   ├── wave-status.md                 ← NEW
│   └── ... (57 existing commands)
├── security.md                        ← existing
├── testing.md                         ← existing
└── rules/                             ← existing (no changes needed)
```

## Appendix B: Cost Estimate

Based on model routing v2.1:
- Autonomous feature (3-wave, 8 tasks): ~$2-5 per feature
- Design review (Opus): ~$0.50 per review
- Self-review (3x Sonnet): ~$0.30 per review
- Canary monitoring (5 min): ~$0.10 per deploy
- Daily usage estimate: $15-30 (vs current ~$20-40 with less output)

Net effect: More output for similar or lower cost due to parallel execution efficiency.

---

## Appendix C: Architecture Review Fixes

All issues from the architecture review have been incorporated. Summary of changes:

### CRITICAL Fixes Applied

**C1. Hook State Tracking — State File Protocol**

Hooks cannot access session history. Solution: file-based state tracking.

```
State directory: /tmp/claude-session-${CLAUDE_SESSION_ID}/
Files written by PostToolUse hooks:
  - design-phase-completed-{component}  (after ui-ux-pro-max invoked)
  - visual-verify-passed-{component}     (after screenshot comparison passes)
  - autonomous-loop-active               (when autonomous mode starts)
  - wave-{N}-complete                    (when wave finishes)

Checked by PreToolUse hooks:
  - design-first-enforcer checks: design-phase-completed-{component} exists?
  - caching-last-enforcer checks: visual-verify-passed-{component} exists?

Cleanup: SessionStart hook removes stale /tmp/claude-session-* directories older than 24h
```

**C2. Cost Circuit Breaker**

```
Environment variable: AUTONOMOUS_COST_LIMIT=15 (dollars, default)
Checked: after every task completion (not just at Stop)
Implementation: cost-tracker.js updated to write cumulative cost to state file
  /tmp/claude-session-${CLAUDE_SESSION_ID}/cumulative-cost
  Autonomous loop reads this file before starting next task
  If exceeded: stop loop, report to user, commit completed work
Per-project override: set in project CLAUDE.md
```

**C3. Triple Review Removed from Stop Hook**

Triple review (Skeptic/Architect/Minimalist) is now ONLY in the orchestration layer (Phase 4, Step 5 of autonomous loop). NOT a Stop hook.

Updated Stop hooks (5 total, not 6):
1. autonomous-continuation (ralph-wiggum re-inject)
2. console-log-check (existing)
3. persist-session-state (existing)
4. evaluate-session-patterns (existing)
5. cost-tracking (existing)

**C4. /freeze is Manual Only**

Removed auto-trigger on "3rd debugging iteration." `/freeze` is now manual-only command. When debugging enters 3+ iterations, a WARNING (exit code 1) suggests using `/freeze`, but does not enforce it.

### HIGH Fixes Applied

**H1. Hook Consolidation**

14 PreToolUse hooks consolidated into 3 scripts:

1. `v7-code-enforcer.sh` — combines: design-first, caching-last, typeorm-safety, no-process-env, no-any-financial, figma-reference (matcher: Write/Edit on *.ts, *.tsx, *.css, *.scss)
2. `v7-safety-guardrails.sh` — combines: freeze-scope-lock, careful-destructive-warn (matcher: Write/Edit/Bash)
3. Existing hooks unchanged (6 hooks): dev-servers, tmux, git-push, doc-warning, compaction, learning

Total: 9 PreToolUse hooks (was 14), ~300ms max overhead (was ~700ms)

**H2. Design-First Trigger Narrowed**

Enforcer ONLY triggers on:
- NEW file creation (not edits to existing files)
- Files in: `components/`, `pages/`, `app/`, `screens/`, `views/` directories
- Escape hatch: `// design-approved` comment at top of file skips check
- Existing component refactoring: NOT blocked

**H3. Wave Orchestrator → GSD Thin Wrapper**

Removed standalone `wave-orchestrator` agent. GSD handles wave execution. The `/wave-status` command reads GSD state instead of managing its own.

Updated agents (3 new, not 4):
1. `design-qa` (merged design-enforcer + visual-verifier)
2. `canary-smoke` (simplified from canary-monitor)
3. Removed: wave-orchestrator (use GSD)

**H4. Model Routing — Documented Limitations**

Model routing is PARTIALLY achievable:
- Agent definitions: `model: haiku` or `model: sonnet` in YAML frontmatter ✓
- Sub-agents inherit parent model unless overridden in definition ✓
- Primary session model: set at startup, cannot change mid-conversation ✗
- Runtime model switching: NOT available in Claude Code ✗

Practical result: main session on Opus/Sonnet, sub-agents can be configured individually.

**H5. Canary Split into Two**

1. `/canary-smoke <url>` — quick Playwright smoke test (load page, check console errors, 30s)
2. `/canary-monitor` — long-term: check Sentry/Vercel Analytics APIs for error rates, performance regression. Requires API keys configured in project .env.

### MEDIUM Fixes Applied

**M1. Progressive Disclosure — Always-Loaded Reduced**

Always-loaded CLAUDE.md target: ~4k chars (was 8k estimate, was 22k in v6.0):
- Identity: 200 chars
- Dispatch table (keywords only, no details): 2k chars
- Anti-skip rules: 500 chars
- Lesson rules (compact): 1k chars
- Autonomous mode trigger (one-liner): 300 chars
Total: ~4k

Everything else loads via refs/ on activation.

**M2. Task Format — Markdown, Not XML**

Unless GSD specifically requires XML, task plans use Markdown:

```markdown
## Wave 1 (parallel)
- [ ] **Create User entity** | `src/users/entities/user.entity.ts`
  - Action: Define User entity with TypeORM decorators
  - Verify: `npm run build && npm run test -- --grep User`
  - Done: User entity compiles, passes unit test

- [ ] **Create Product entity** | `src/products/entities/product.entity.ts`
  - Action: Define Product entity
  - Verify: `npm run build && npm run test -- --grep Product`
  - Done: Product entity compiles, passes unit test

## Wave 2 (depends on Wave 1)
- [ ] **Create Order service** | `src/orders/orders.service.ts`
  - Action: Implement OrderService using User + Product
  - Verify: `npm run test -- --grep Order`
  - Done: OrderService passes all tests including relations
```

If GSD requires XML, a conversion utility will translate this format.

**M3. Rollback Protocol Added**

```
Before autonomous execution:
  1. git tag pre-auto-{timestamp}
  2. Store tag name in state file

If autonomous loop fails fatally:
  1. git reset --hard pre-auto-{timestamp}
  2. Report: "Autonomous execution failed at Wave N, Task M. Rolled back to pre-auto-{timestamp}."
  3. Preserve error logs for debugging

If /canary finds critical issue:
  1. git revert HEAD --no-edit (revert last merge, not hard reset)
  2. Auto-create fix/{issue} branch from pre-deploy state
  3. Alert user: "Canary detected critical issue. Reverted deploy. Fix branch created."
```

**M4. Graceful Degradation for Dependencies**

| Dependency | If missing | Fallback |
|---|---|---|
| GSD | Wave execution unavailable | Sequential subagent execution with manual wave tracking |
| gstack | /freeze, /careful unavailable | Commands simply not available, core functionality unaffected |
| Figma MCP | Figma check skipped | No warning on component creation, design-first still enforces ui-ux-pro-max |
| Playwright | Visual verification skipped | PR description notes: "Visual review required: Playwright not available" |
| Sentry/Vercel APIs | /canary-monitor unavailable | Only /canary-smoke (Playwright) available |

Each hook checks for dependency existence before running. Missing dependency = skip that check, not fail.

**M5. Destructive Operations Classification**

| Operation | Autonomous: auto-execute | Autonomous: always pause |
|---|---|---|
| DB migration: add column/table | ✓ auto | |
| DB migration: drop/rename column | | ✓ pause |
| DB migration: truncate/delete data | | ✓ pause |
| git push to feature branch | ✓ auto | |
| git push to main/master | | ✓ pause |
| git push --force | | ✓ pause |
| npm publish | | ✓ pause |
| docker rm/rmi | | ✓ pause |
| File deletion in src/ | ✓ auto (if tests pass after) | |
| .env modification | | ✓ pause |

### Simplification Fixes Applied

**O1. Anti-AI-Slop: Checklist, Not Scores**

Replaced numeric 0-10 scoring with pass/fail checklist:

```
Design Quality Checklist (all must pass):
- [ ] Typography: custom font pairing used (not system defaults)
- [ ] Colors: full palette defined (min 5 colors + shades)
- [ ] Spacing: consistent 4px/8px grid system
- [ ] Interactions: hover states, transitions, loading states defined
- [ ] Uniqueness: no default Bootstrap/Tailwind appearance
```

Self-approve in autonomous mode: all 5 checks pass.

**O2. Agents Consolidated**

3 new agents (was 4):
1. `design-qa` — merged design-enforcer + visual-verifier
2. `canary-smoke` — simplified smoke test only
3. Removed: wave-orchestrator (GSD handles this)

**O3. Commands Grouped**

New commands use subcommand pattern:
- `/design check` — anti-AI-slop review
- `/design pipeline` — show pipeline status
- `/canary smoke <url>` — quick smoke test
- `/canary monitor` — long-term monitoring
- `/safe freeze <dir>` — scope lock
- `/safe careful` — destructive warnings
- `/ship` — full pipeline (stays top-level, most used)

### Updated Migration Plan (revised sequencing)

**Phase 1: Foundation + State Protocol** (Session 1)
- Design state file protocol (/tmp/claude-session-$ID/)
- Rewrite CLAUDE.md v7.0 (4k always-loaded core)
- Create new ref files (mobile, caching, orchestration, design-pipeline)
- Update refs/projects.md

**Phase 2: Hooks + Incremental Testing** (Session 2)
- Implement v7-code-enforcer.sh (consolidated)
- Test each rule in isolation (write violating code, verify block)
- Implement v7-safety-guardrails.sh
- Test freeze + careful
- Update PostToolUse hooks (state file writers)
- Test state file read/write cycle

**Phase 3: Agents + Commands + Testing** (Session 3)
- Create design-qa agent + test on real component
- Create canary-smoke agent + test on deployed URL
- Create commands (/design, /canary, /safe, /ship)
- Test each command individually

**Phase 4: Orchestration + One Plugin at a Time** (Session 4)
- Install GSD + verify wave execution on toy task
- Install gstack + verify /freeze works
- Install feature-dev + verify 7-phase flow
- Install hookify + verify custom hook creation
- Configure autonomous loop + test on small feature

**Phase 5: End-to-End on Real Feature** (Session 5)
- Pick one real feature from one active project
- Run full pipeline: task → plan → waves → execute → verify → ship
- If UI: verify design-first enforcement works
- If API: verify TypeORM/ConfigService hooks work
- Fix integration issues

**Phase 6: Rollout + Docs** (Session 6)
- Apply to remaining active projects
- Update project CLAUDE.md files
- Update audit.md, report.md, changelog.md
- Clean up v6.0 deprecated artifacts

### Updated File Inventory (post-review)

```
~/.claude/
├── CLAUDE.md                          ← v7.0 (~4k always-loaded core)
├── AGENTS.md                          ← updated with 3 new agents
├── settings.json                      ← updated permissions
├── hooks/
│   ├── hooks.json                     ← 9 PreToolUse + 7 PostToolUse + 5 Stop
│   ├── v7-code-enforcer.sh            ← NEW: consolidated code rules
│   └── v7-safety-guardrails.sh        ← NEW: consolidated safety rules
├── refs/
│   ├── projects.md                    ← updated
│   ├── design-pipeline.md             ← NEW
│   ├── orchestration.md               ← NEW (includes state protocol)
│   ├── mobile-patterns.md             ← NEW
│   ├── caching-strategy.md            ← NEW
│   └── ... (existing refs)
├── agents/
│   ├── design-qa.md                   ← NEW (merged enforcer + verifier)
│   ├── canary-smoke.md                ← NEW (simplified)
│   └── ... (27 existing agents)
├── commands/
│   ├── design/                        ← NEW (check.md, pipeline.md)
│   ├── canary/                        ← NEW (smoke.md, monitor.md)
│   ├── safe/                          ← NEW (freeze.md, careful.md)
│   ├── ship.md                        ← NEW
│   └── ... (57 existing commands)
└── ... (existing files unchanged)
```
