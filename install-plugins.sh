#!/usr/bin/env bash
# Claude Code v7.0 — Plugin Installer
# Installs recommended marketplace plugins and tools

set -uo pipefail

echo ""
echo "  Claude Code v7.0 — Plugin Installer"
echo "  ======================================"
echo ""

# Check claude CLI
if ! command -v claude &>/dev/null; then
  echo "ERROR: 'claude' CLI not found. Install Claude Code first."
  exit 1
fi

echo "[1/7] Adding marketplace: everything-claude-code"
claude plugin marketplace add affaan-m/everything-claude-code 2>/dev/null || echo "  (already added or manual add needed)"

echo "[2/7] Adding marketplace: ui-ux-pro-max"
claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill 2>/dev/null || echo "  (already added or manual add needed)"

echo "[3/7] Adding marketplace: compound-engineering"
claude plugin marketplace add EveryInc/compound-engineering-plugin 2>/dev/null || echo "  (already added or manual add needed)"

echo "[4/7] Adding marketplace: safety-net"
claude plugin marketplace add kenryu42/claude-code-safety-net 2>/dev/null || echo "  (already added or manual add needed)"

echo "[5/7] Adding marketplace: claude-hud"
claude plugin marketplace add jarrodwatts/claude-hud 2>/dev/null || echo "  (already added or manual add needed)"

echo "[6/7] Installing GSD (Get Shit Done)"
npx get-shit-done-cc@latest --global --claude 2>/dev/null || echo "  (install manually: npx get-shit-done-cc@latest --global)"

echo "[7/7] Installing gstack skills"
if [ ! -d "$HOME/.claude/skills/gstack" ]; then
  git clone --depth 1 https://github.com/garrytan/gstack.git /tmp/gstack-install 2>/dev/null
  if [ -d /tmp/gstack-install ]; then
    mkdir -p "$HOME/.claude/skills/gstack"
    cp -r /tmp/gstack-install/* "$HOME/.claude/skills/gstack/"
    rm -r /tmp/gstack-install
    echo "  gstack installed to ~/.claude/skills/gstack/"
  else
    echo "  (clone failed — install manually from github.com/garrytan/gstack)"
  fi
else
  echo "  gstack already installed"
fi

echo ""
echo "  ✓ Plugins installed!"
echo ""
echo "  After restarting Claude Code, enable plugins:"
echo "  claude plugin install everything-claude-code"
echo "  claude plugin install ui-ux-pro-max"
echo "  claude plugin install compound-engineering"
echo "  claude plugin install safety-net"
echo ""
echo "  Official plugins (auto-available):"
echo "  superpowers, coderabbit, context7, figma, playwright,"
echo "  semgrep, pinecone, supabase, ralph-loop"
echo ""
