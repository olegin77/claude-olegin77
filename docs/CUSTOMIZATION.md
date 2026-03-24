# Customization Guide

## Add Your Projects

Create `~/.claude/refs/projects.md` based on the template:

```bash
cp examples/projects-template.md ~/.claude/refs/projects.md
# Edit with your project details
```

Then update the dispatch table in `~/.claude/CLAUDE.md` to add project-specific routing:

```markdown
### Project Routing

| Project (cwd) | Primary | Secondary |
|---|---|---|
| MyApp (`/path/to/myapp`) | `typescript-expert` | `nextjs-app-router-developer` |
| MyAPI (`/path/to/api`) | `python-expert` | `backend-architect` |
```

## Customize Hook Rules

### Disable a rule
Comment out the rule section in `~/.claude/hooks/v7-code-enforcer.sh`:

```bash
# === RULE 3: TypeORM Safety === (DISABLED)
# if [[ "$FILE_PATH" =~ \.ts$ ]] ...
```

### Add a new rule
Add a section to `v7-code-enforcer.sh`:

```bash
# === RULE 7: No console.log in production ===
if [[ "$FILE_PATH" =~ src/ ]] && [[ ! "$FILE_PATH" =~ (\.test\.|\.spec\.) ]]; then
  if echo "$INPUT" | grep -qE 'console\.(log|debug)' 2>/dev/null; then
    echo "BLOCKED: console.log in production code." >&2
    echo "Use a proper logger (winston, pino, etc.)" >&2
    exit 2
  fi
fi
```

### Change enforcement to warning
Change `exit 2` to `exit 1` for any rule — operation proceeds but shows warning.

## Configure Cost Limits

```bash
# Default: $15 per autonomous session
export AUTONOMOUS_COST_LIMIT=25

# Or set per-project in project CLAUDE.md:
# Cost limit: $30 for this complex project
```

## Set Up Figma Integration

1. Install Figma plugin: `claude plugin install figma`
2. Add Figma URLs to your `refs/projects.md`:

```markdown
| Project | Figma |
|---------|-------|
| MyApp | https://figma.com/design/abc123/MyApp |
```

3. When working on UI, Claude will auto-fetch design context.

## Customize Design Quality Checklist

Edit `~/.claude/refs/design-pipeline.md` anti-AI-slop section:

```markdown
## Design Quality Checklist (all must pass)
- [ ] Typography: [your font requirements]
- [ ] Colors: [your palette requirements]
- [ ] Spacing: [your grid system]
- [ ] Interactions: [your animation requirements]
- [ ] Uniqueness: [your brand requirements]
```

## Add Language-Specific Rules

Create `~/.claude/rules/python/` or `~/.claude/rules/golang/` directories with files that extend common rules:

```markdown
# rules/python/coding-style.md
> Extends [common/coding-style.md](../common/coding-style.md)

- Use Black formatter (line length 88)
- Type hints on all public functions
- Docstrings: Google style
```

## Disable Hooks Temporarily

```bash
# Remove v7 hooks from settings.json temporarily
# Or just remove the state directory to bypass state-dependent checks:
rm -r /tmp/claude-session-*/
```
