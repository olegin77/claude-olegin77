# Design Check — Anti-AI-Slop Review

Manually trigger design quality review on current UI work.

## Process

1. Read `~/.claude/refs/design-pipeline.md` for pipeline rules
2. Invoke `ui-ux-pro-max:ui-ux-pro-max` skill if not already invoked
3. Spawn `design-qa` agent to review current component/page
4. Agent evaluates 5 quality dimensions (pass/fail):
   - [ ] Typography: custom font pairing
   - [ ] Colors: full palette with shades
   - [ ] Spacing: 4px/8px grid
   - [ ] Interactions: hover, transitions, loading
   - [ ] Uniqueness: not default template look
5. If any dimension fails: agent proposes specific improvements
6. After all pass: writes state file to unblock code enforcer

## When to Use

- Before finalizing any new UI component or page
- When you suspect the UI looks too "AI-generated"
- Before running `/ship` on frontend changes
- When refactoring UI and want to ensure quality didn't degrade
