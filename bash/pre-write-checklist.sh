#!/bin/bash
# ABOUTME: Claude PreToolUse hook that outputs style checklist before Write/Edit
# ABOUTME: Only triggers for JS/JSX files to remind Claude of conventions

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path')

if [[ "$file_path" =~ \.(js|jsx)$ ]]; then
    cat << 'EOF'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BEFORE WRITING JS:
□ ABOUTME comment (2 lines at top)
□ @sig needs 1-line description too
□ Functions go at TOP of blocks
  (safe: vars initialized before fn *called*)
□ Cohesion groups: P/T/F/V/A/E
  EXCEPT: exported fns at module level, NOT in groups
□ 120 char max, single-level indent
□ No for/while, no render* functions
□ Blank line before multiline functions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF
fi

exit 0
