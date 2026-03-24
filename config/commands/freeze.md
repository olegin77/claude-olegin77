# Freeze — Scope Lock for Debugging

Restrict all file edits to a specific directory. Prevents scope creep during debugging.

## Usage

`/freeze src/users/` — lock edits to src/users/ and subdirectories
`/freeze .` — lock edits to current working directory

## Activate

```bash
STATE_DIR=$(cat /tmp/claude-current-session-state-dir 2>/dev/null)
if [ -z "$STATE_DIR" ]; then
  echo "ERROR: State directory not initialized. Start a new session."
  exit 1
fi

FREEZE_DIR="$1"
if [ -z "$FREEZE_DIR" ]; then
  echo "Usage: /freeze <directory>"
  echo "Example: /freeze src/users/"
  exit 1
fi

echo "$FREEZE_DIR" > "$STATE_DIR/freeze-directory"
touch "$STATE_DIR/freeze-active"
echo "Scope locked to: $FREEZE_DIR"
echo "All Write/Edit operations outside this directory will be BLOCKED."
echo "Run /unfreeze to remove the lock."
```

## Unfreeze

To remove scope lock, delete the state files:
```bash
STATE_DIR=$(cat /tmp/claude-current-session-state-dir 2>/dev/null)
rm -f "$STATE_DIR/freeze-active" "$STATE_DIR/freeze-directory"
echo "Scope lock removed. Edits unrestricted."
```

## How It Works

The `v7-safety-guardrails.sh` PreToolUse hook checks for `freeze-active` state file.
If present, any Write/Edit operation to a file OUTSIDE the frozen directory is blocked with exit code 2.
