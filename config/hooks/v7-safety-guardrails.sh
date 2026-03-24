#!/usr/bin/env bash
# v7-safety-guardrails.sh — Safety guardrails (freeze + careful)
# Exit codes: 0=allow, 1=warn, 2=block
# NOTE: No set -e — grep returning 1 (no match) is normal flow

set -uo pipefail

INPUT=$(cat)
TOOL_NAME="${TOOL_USE_NAME:-}"
FILE_PATH=""
COMMAND=""

# Extract file path (node first, grep fallback)
if command -v node &>/dev/null; then
  FILE_PATH=$(echo "$INPUT" | node -e "try{const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));console.log(d.file_path||'')}catch{}" 2>/dev/null || echo "")
fi
if [[ -z "$FILE_PATH" ]]; then
  FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' || echo "")
fi

# Extract command for Bash tool (node first, grep fallback)
if command -v node &>/dev/null; then
  COMMAND=$(echo "$INPUT" | node -e "try{const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));console.log(d.command||'')}catch{}" 2>/dev/null || echo "")
fi
if [[ -z "$COMMAND" ]]; then
  COMMAND=$(echo "$INPUT" | grep -o '"command"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"command"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' || echo "")
fi

STATE_DIR=$(cat /tmp/claude-current-session-state-dir 2>/dev/null || echo "")
[[ -z "$STATE_DIR" ]] && STATE_DIR="/tmp/claude-session-$$"

# === FREEZE: Scope Lock ===
if [[ -f "$STATE_DIR/freeze-active" ]]; then
  FREEZE_DIR=$(cat "$STATE_DIR/freeze-directory" 2>/dev/null || echo "")
  if [[ -n "$FREEZE_DIR" ]] && [[ -n "$FILE_PATH" ]]; then
    if [[ ! "$FILE_PATH" =~ ^$FREEZE_DIR ]]; then
      echo "BLOCKED: /freeze is active. Edits restricted to: $FREEZE_DIR" >&2
      echo "Run /unfreeze to remove scope lock." >&2
      exit 2
    fi
  fi
fi

# === CAREFUL: Destructive Operation Warnings (only when /careful is active) ===
if [[ -f "$STATE_DIR/careful-active" ]]; then
  if [[ -n "$COMMAND" ]]; then
    if echo "$COMMAND" | grep -qE '(rm\s+-rf|git\s+push\s+--force|git\s+reset\s+--hard|DROP\s+TABLE|TRUNCATE|DELETE\s+FROM|docker\s+rm|npm\s+publish)' 2>/dev/null; then
      echo "WARNING: Destructive operation detected: $COMMAND" >&2
      echo "This requires user confirmation." >&2
      exit 1
    fi
  fi
fi

exit 0
