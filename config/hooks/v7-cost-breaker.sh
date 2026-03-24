#!/usr/bin/env bash
# v7-cost-breaker.sh — Checks cumulative cost against limit
# Called by autonomous loop after each task completion
# Reads: /tmp/claude-session-STATE/cumulative-cost
# Env: AUTONOMOUS_COST_LIMIT (default: 15 dollars)
# NOTE: No set -e

set -uo pipefail

STATE_DIR=$(cat /tmp/claude-current-session-state-dir 2>/dev/null || echo "")
[[ -z "$STATE_DIR" ]] && exit 0

COST_FILE="$STATE_DIR/cumulative-cost"
LIMIT="${AUTONOMOUS_COST_LIMIT:-15}"

# Read current cumulative cost
CURRENT="0"
if [[ -f "$COST_FILE" ]]; then
  CURRENT=$(cat "$COST_FILE" 2>/dev/null || echo "0")
fi

# Compare using awk for float comparison
EXCEEDED=$(awk "BEGIN {print ($CURRENT >= $LIMIT) ? 1 : 0}" 2>/dev/null || echo "0")

if [[ "$EXCEEDED" == "1" ]]; then
  echo "COST LIMIT REACHED: \$$CURRENT spent (limit: \$$LIMIT)" >&2
  echo "Autonomous loop stopping. Completed work has been committed." >&2
  echo "Increase limit: export AUTONOMOUS_COST_LIMIT=25" >&2
  exit 2
fi

exit 0
