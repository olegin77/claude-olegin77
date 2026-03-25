# Design-First Pipeline

> Read this file when UI/design work is detected.

## Mandatory Chain (enforced by v7-code-enforcer.sh)

1. INVOKE `ui-ux-pro-max:ui-ux-pro-max` — ALWAYS, NO EXCEPTIONS
2. CHECK Figma — if project has Figma URL in refs/projects.md, call `get_design_context`
3. PROPOSE design with quality checklist (all must pass):
   - [ ] Typography: custom font pairing (not system defaults)
   - [ ] Colors: full palette (min 5 colors + shades)
   - [ ] Spacing: consistent 4px/8px grid
   - [ ] Interactions: hover, transitions, loading states
   - [ ] Uniqueness: not default Bootstrap/Tailwind appearance
4. GET approval (autonomous mode: all 5 pass = self-approve)
5. IMPLEMENT with design tokens from step 3
6. SCREENSHOT via Playwright, compare vs mockup
7. VISUAL VERIFY — implementation matches design
8. CACHING LAST — enable ISR/CDN/cache ONLY after step 7

## Hook State Files

After design phase completes, PostToolUse writes:
```
/tmp/claude-session-STATE/design-phase-completed-{component-name}
```

After visual verify passes:
```
/tmp/claude-session-STATE/visual-verify-passed-{component-name}
```

Component name normalized: basename without extension, lowercased, spaces→dashes.

## Escape Hatch

Add `// design-approved` comment at top of file to skip design-first check.
Only for refactoring existing components, NOT for new UI creation.

## Figma Integration

If project has Figma:
1. Call `mcp__claude_ai_Figma__get_design_context` with fileKey + nodeId
2. Extract design tokens (colors, spacing, typography)
3. Map to project's design system
4. Use Code Connect if component mappings exist

If no Figma: skip Figma steps, pipeline still requires steps 1-8.

## Common Design Anti-Patterns (AI Slop)

AVOID:
- System fonts (system-ui, Arial, Helvetica) without explicit design decision
- Only 2-3 colors with no shade variants
- Default Tailwind spacing without custom scale
- No hover states or transitions
- Generic card/button patterns identical to shadcn defaults
- Placeholder images from picsum/unsplash without context

PREFER:
- Custom font pairing from Google Fonts or self-hosted
- 5+ color palette with 50-950 shade scale
- 4px/8px grid with consistent rhythm
- Micro-interactions on every interactive element
- Custom illustration or iconography style
- Project-specific component variants
