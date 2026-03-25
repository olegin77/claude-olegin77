#!/usr/bin/env bash
# v7-state-writer.sh — PostToolUse hook that writes state files
# Detects skill invocations and verification completions
# NOTE: No set -e — grep returning 1 (no match) is normal flow

set -uo pipefail

INPUT=$(cat)
STATE_DIR=$(cat /tmp/claude-current-session-state-dir 2>/dev/null || echo "")
[[ -z "$STATE_DIR" ]] && exit 0
[[ ! -d "$STATE_DIR" ]] && mkdir -p "$STATE_DIR"

# Normalize component name (same logic as v7-code-enforcer.sh)
normalize_component() {
  basename "$1" | sed 's/\.[^.]*$//' | tr '[:upper:]' '[:lower:]' | tr ' ' '-'
}

# Extract file path from tool output if available
FILE_PATH=""
if command -v node &>/dev/null; then
  FILE_PATH=$(echo "$INPUT" | node -e "try{const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));console.log(d.file_path||d.filePath||'')}catch{}" 2>/dev/null || echo "")
fi

# Detect ui-ux-pro-max skill completion
if echo "$INPUT" | grep -qi "ui-ux-pro-max" 2>/dev/null; then
  if [[ -n "$FILE_PATH" ]]; then
    COMPONENT=$(normalize_component "$FILE_PATH")
  else
    COMPONENT="generic"
  fi
  touch "$STATE_DIR/design-phase-completed-$COMPONENT"
fi

# Detect Figma context fetch
if echo "$INPUT" | grep -qi "get_design_context\|figma" 2>/dev/null; then
  if [[ -n "$FILE_PATH" ]]; then
    COMPONENT=$(normalize_component "$FILE_PATH")
  else
    COMPONENT="generic"
  fi
  touch "$STATE_DIR/figma-checked-$COMPONENT"
fi

exit 0
