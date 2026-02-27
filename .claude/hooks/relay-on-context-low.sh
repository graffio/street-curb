#!/bin/bash
# ABOUTME: PostToolUse hook for context window monitoring
# ABOUTME: Checks for .context-low flag and injects relay handoff instruction

# Consume stdin (hooks receive tool call JSON; unused here but required by convention)
cat > /dev/null

# Guard: $CLAUDE_PROJECT_DIR must be set
[ -z "$CLAUDE_PROJECT_DIR" ] && exit 0

FLAG_FILE="$CLAUDE_PROJECT_DIR/.claude/.context-low"

# Atomic consume: mv to a known path succeeds only once even under concurrent calls
if mv "$FLAG_FILE" "$FLAG_FILE.consumed" 2>/dev/null; then
    rm -f "$FLAG_FILE.consumed"
    echo "CONTEXT LOW: Finish your current step with detailed notes, then read .claude/tasks/context-relay.md and execute the relay handoff protocol." >&2
    exit 2
fi

exit 0
