#!/usr/bin/env bash
# v7-code-enforcer.sh — Consolidated PreToolUse hook for code rules
# Rules: design-first, caching-last, typeorm-safety, no-process-env, no-any-financial, figma-reference
# Exit codes: 0=allow, 1=warn, 2=block+self-correct
# NOTE: No set -e — grep returning 1 (no match) is normal flow

set -uo pipefail

INPUT=$(cat)
TOOL_NAME="${TOOL_USE_NAME:-}"
FILE_PATH=""

# Detect tool type from JSON fields if TOOL_USE_NAME not set
# Write tool has "content" field, Edit tool has "old_string"/"new_string" fields
if [[ -z "$TOOL_NAME" ]]; then
  if echo "$INPUT" | grep -q '"content"' 2>/dev/null; then
    TOOL_NAME="Write"
  elif echo "$INPUT" | grep -q '"old_string"' 2>/dev/null; then
    TOOL_NAME="Edit"
  fi
fi

# Extract file path using node for reliable JSON parsing (fallback to grep)
if command -v node &>/dev/null; then
  FILE_PATH=$(echo "$INPUT" | node -e "try{const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));console.log(d.file_path||'')}catch{}" 2>/dev/null || echo "")
fi
if [[ -z "$FILE_PATH" ]]; then
  FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/' || echo "")
fi

# Skip non-file operations
[[ -z "$FILE_PATH" ]] && exit 0

# Get state directory
STATE_DIR=$(cat /tmp/claude-current-session-state-dir 2>/dev/null || echo "")
[[ -z "$STATE_DIR" ]] && STATE_DIR="/tmp/claude-session-$$"
[[ ! -d "$STATE_DIR" ]] && mkdir -p "$STATE_DIR"

# Normalize component name: basename without extension, lowercased, spaces to dashes
normalize_component() {
  basename "$1" | sed 's/\.[^.]*$//' | tr '[:upper:]' '[:lower:]' | tr ' ' '-'
}

# === DEPENDENCY CHECKS (graceful degradation) ===
HAS_NODE=false
command -v node &>/dev/null && HAS_NODE=true

# === RULE 1: Design-First Enforcer ===
# Only for NEW .tsx/.vue files in UI directories
if [[ "$TOOL_NAME" == "Write" ]] && [[ "$FILE_PATH" =~ \.(tsx|vue)$ ]]; then
  if [[ "$FILE_PATH" =~ (components|pages|app|screens|views)/ ]]; then
    # Check if file already exists (only block NEW files)
    if [[ ! -f "$FILE_PATH" ]]; then
      # Check for design-approved escape hatch
      if ! echo "$INPUT" | grep -q "design-approved"; then
        COMPONENT=$(normalize_component "$FILE_PATH")
        if [[ ! -f "$STATE_DIR/design-phase-completed-$COMPONENT" ]] && [[ ! -f "$STATE_DIR/design-phase-completed-generic" ]]; then
          echo "BLOCKED: New UI component '$COMPONENT' without design phase." >&2
          echo "Run design-first pipeline:" >&2
          echo "  1. Invoke ui-ux-pro-max:ui-ux-pro-max skill" >&2
          echo "  2. Check Figma context if available" >&2
          echo "  3. Complete design quality checklist" >&2
          echo "  4. Or add '// design-approved' to the file" >&2
          exit 2
        fi
      fi
    fi
  fi
fi

# === RULE 2: Caching-Last Enforcer ===
if [[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx|json)$ ]]; then
  if echo "$INPUT" | grep -qiE "(revalidate|stale-while-revalidate|Cache-Control|s-maxage|CacheInterceptor|CacheTTL|cacheFirst|cache\.put)" 2>/dev/null; then
    COMPONENT=$(normalize_component "$FILE_PATH")
    if [[ ! -f "$STATE_DIR/visual-verify-passed-$COMPONENT" ]] && [[ ! -f "$STATE_DIR/visual-verify-passed-generic" ]] && [[ ! -f "$STATE_DIR/caching-approved" ]]; then
      echo "BLOCKED: Caching configuration detected before visual verification." >&2
      echo "Caching must be the LAST step after:" >&2
      echo "  1. Visual verification passes (screenshot matches design)" >&2
      echo "  2. Functional tests pass (E2E green)" >&2
      echo "  3. Read: ~/.claude/refs/caching-strategy.md" >&2
      exit 2
    fi
  fi
fi

# === RULE 3: TypeORM Safety ===
if [[ "$FILE_PATH" =~ \.ts$ ]] && [[ "$FILE_PATH" =~ src/ ]]; then
  if echo "$INPUT" | grep -qE '\.find\(\s*\)' 2>/dev/null || echo "$INPUT" | grep -qE '\.findOne\(\s*\)' 2>/dev/null; then
    echo "BLOCKED: TypeORM find()/findOne() without where/take clause." >&2
    echo "Always use: this.repo.find({ where: { ... }, take: N, select: [...] })" >&2
    echo "Never use: this.repo.find() — loads entire table." >&2
    exit 2
  fi
fi

# === RULE 4: No process.env in Services/Controllers ===
if [[ "$FILE_PATH" =~ \.ts$ ]] && [[ "$FILE_PATH" =~ src/ ]]; then
  # Skip config files, test files, and config directories
  if [[ ! "$FILE_PATH" =~ (\.config\.|\.spec\.|\.test\.|config/|\.d\.ts) ]]; then
    if echo "$INPUT" | grep -qE 'process\.env\.' 2>/dev/null; then
      echo "BLOCKED: process.env.X in service/controller." >&2
      echo "Use ConfigService injection instead:" >&2
      echo "  constructor(private config: ConfigService) {}" >&2
      echo "  this.config.get('KEY')" >&2
      exit 2
    fi
  fi
fi

# === RULE 5: No 'any' in Financial Code ===
if [[ "$FILE_PATH" =~ (payment|finance|wallet|transaction|billing) ]]; then
  if echo "$INPUT" | grep -qE ':\s*any(\s|;|,|\))' 2>/dev/null; then
    echo "BLOCKED: 'any' type in financial code." >&2
    echo "Use proper types: number for amounts, Decimal for precision," >&2
    echo "string for IDs, enum for statuses." >&2
    exit 2
  fi
fi

# === RULE 6: Figma Reference Check (warn only) ===
if [[ "$TOOL_NAME" == "Write" ]] && [[ "$FILE_PATH" =~ \.(tsx|vue)$ ]]; then
  if [[ "$FILE_PATH" =~ (components|pages|screens)/ ]] && [[ ! -f "$FILE_PATH" ]]; then
    COMPONENT=$(normalize_component "$FILE_PATH")
    if [[ ! -f "$STATE_DIR/figma-checked-$COMPONENT" ]] && [[ ! -f "$STATE_DIR/figma-checked-generic" ]]; then
      echo "NOTE: New UI component without Figma reference check." >&2
      echo "If a Figma design exists, call get_design_context first." >&2
      # Exit 0 — warn only, do not block
    fi
  fi
fi

exit 0
