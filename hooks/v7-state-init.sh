#!/usr/bin/env bash
# v7-state-init.sh — Initialize state directory for hook communication
# Called by SessionStart hook to create shared state dir for PreToolUse/PostToolUse hooks
# State files track design phases, visual verification, freeze scope, cost limits

set -uo pipefail

STATE_DIR="/tmp/claude-session-$$"
mkdir -p "$STATE_DIR"
echo "$STATE_DIR" > /tmp/claude-current-session-state-dir

# Cleanup stale sessions (older than 24h)
find /tmp -maxdepth 1 -name "claude-session-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true

echo "$STATE_DIR"
