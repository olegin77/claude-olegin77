#!/usr/bin/env bash
# Claude Code v7.0 "Autonomous Factory" — Installer
# Copies config files to ~/.claude/ and merges hooks into settings.json

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

echo ""
echo "  ╔══════════════════════════════════════════════╗"
echo "  ║  Claude Code v7.0 — Autonomous Factory      ║"
echo "  ║  Installer                                   ║"
echo "  ╚══════════════════════════════════════════════╝"
echo ""

# Check Claude Code exists
if [ ! -d "$CLAUDE_DIR" ]; then
  echo "ERROR: ~/.claude/ not found. Install Claude Code first."
  echo "  npm install -g @anthropic-ai/claude-code"
  exit 1
fi

# Backup existing CLAUDE.md
if [ -f "$CLAUDE_DIR/CLAUDE.md" ]; then
  BACKUP="$CLAUDE_DIR/CLAUDE.md.pre-v7.backup"
  cp "$CLAUDE_DIR/CLAUDE.md" "$BACKUP"
  echo "[backup] Existing CLAUDE.md → $BACKUP"
fi

# 1. Copy CLAUDE.md
cp "$SCRIPT_DIR/config/CLAUDE.md" "$CLAUDE_DIR/CLAUDE.md"
echo "[install] CLAUDE.md v7.0"

# 2. Copy hooks
mkdir -p "$CLAUDE_DIR/hooks"
for hook in "$SCRIPT_DIR"/config/hooks/v7-*.sh; do
  cp "$hook" "$CLAUDE_DIR/hooks/"
  chmod +x "$CLAUDE_DIR/hooks/$(basename "$hook")"
  echo "[install] hooks/$(basename "$hook")"
done

# 3. Copy refs
mkdir -p "$CLAUDE_DIR/refs"
for ref in "$SCRIPT_DIR"/config/refs/*.md; do
  cp "$ref" "$CLAUDE_DIR/refs/"
  echo "[install] refs/$(basename "$ref")"
done

# 4. Copy agents
mkdir -p "$CLAUDE_DIR/agents"
for agent in "$SCRIPT_DIR"/config/agents/*.md; do
  cp "$agent" "$CLAUDE_DIR/agents/"
  echo "[install] agents/$(basename "$agent")"
done

# 5. Copy commands
mkdir -p "$CLAUDE_DIR/commands"
for cmd in "$SCRIPT_DIR"/config/commands/*.md; do
  cp "$cmd" "$CLAUDE_DIR/commands/"
  echo "[install] commands/$(basename "$cmd")"
done

# 6. Copy rules
mkdir -p "$CLAUDE_DIR/rules/common"
for rule in "$SCRIPT_DIR"/config/rules/common/*.md; do
  [ -f "$rule" ] && cp "$rule" "$CLAUDE_DIR/rules/common/" && echo "[install] rules/common/$(basename "$rule")"
done

# 7. Merge hooks into settings.json
SETTINGS="$CLAUDE_DIR/settings.json"
if [ -f "$SETTINGS" ]; then
  if command -v node &>/dev/null; then
    node -e "
const fs = require('fs');
const settings = JSON.parse(fs.readFileSync('$SETTINGS', 'utf8'));
const newHooks = JSON.parse(fs.readFileSync('$SCRIPT_DIR/config/settings-hooks.json', 'utf8')).hooks;

if (!settings.hooks) settings.hooks = {};

// Merge each hook type
for (const [type, hooks] of Object.entries(newHooks)) {
  if (!settings.hooks[type]) settings.hooks[type] = [];
  // Skip if v7 hooks already present
  const hasV7 = settings.hooks[type].some(h => h.description && h.description.startsWith('v7:'));
  if (!hasV7) {
    settings.hooks[type].push(...hooks);
    console.log('[merge] Added v7 hooks to settings.json:', type, '(+' + hooks.length + ')');
  } else {
    console.log('[skip] v7 hooks already in settings.json:', type);
  }
}

fs.writeFileSync('$SETTINGS', JSON.stringify(settings, null, 2));
console.log('[done] settings.json updated');
" 2>&1
  else
    echo "[warn] Node.js not found. Manual hook setup required."
    echo "       See config/settings-hooks.json and merge into ~/.claude/settings.json"
  fi
else
  echo "[warn] No settings.json found. Creating with hooks only."
  cp "$SCRIPT_DIR/config/settings-hooks.json" "$SETTINGS"
  echo "[install] settings.json (hooks only)"
fi

# 8. Initialize state directory
bash "$CLAUDE_DIR/hooks/v7-state-init.sh" >/dev/null 2>&1
echo "[init] State directory created"

echo ""
echo "  ✓ Installation complete!"
echo ""
echo "  Next steps:"
echo "  1. Run: bash install-plugins.sh  (install recommended plugins)"
echo "  2. Restart Claude Code"
echo "  3. Test: try creating a .tsx file in components/ — should be blocked"
echo ""
echo "  To customize for your projects:"
echo "  - Edit ~/.claude/refs/projects.md (see examples/projects-template.md)"
echo "  - Edit ~/.claude/CLAUDE.md dispatch table for your stack"
echo ""
