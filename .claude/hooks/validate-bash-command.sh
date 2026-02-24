#!/bin/bash
# ABOUTME: PreToolUse hook for Bash tool
# ABOUTME: Rejects commands containing separators (&&, ;, |) — use separate tool calls instead

input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command')

# Allow git commit (heredoc message format uses newlines, not separators)
# but still block if it chains with && or ;
if echo "$command" | grep -qE '&&|;[^;]|\|[^|]'; then
    echo "Blocked: Use separate Bash tool calls instead of command separators (&&, ;, |)." >&2
    exit 2
fi

exit 0
