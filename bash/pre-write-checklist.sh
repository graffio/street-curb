#!/bin/bash
# ABOUTME: Claude PreToolUse hook that outputs style checklist before Write/Edit
# ABOUTME: Uses JSON permissionDecisionReason to show reminders to Claude

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path')

if [[ "$file_path" =~ \.(js|jsx)$ ]]; then
    # Output JSON so Claude sees the reminder via permissionDecisionReason
    cat << 'EOF'
{
  "permissionDecision": "allow",
  "permissionDecisionReason": "BEFORE WRITING JS: □ ABOUTME (2 lines) □ @sig needs description □ Functions at TOP of blocks □ Cohesion groups P/T/F/V/A/E (exported fns at module level, NOT in groups) □ 120 char max □ No for/while □ Blank line before multiline fns"
}
EOF
else
    # Non-JS files: allow without message
    echo '{"permissionDecision": "allow"}'
fi

exit 0
