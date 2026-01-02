#!/bin/bash
# ABOUTME: PostToolUse hook for JS/JSX files after Write/Edit
# ABOUTME: Runs eslint and prettier to auto-format code

input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path')

if [[ "$file_path" =~ \.(jsx?)$ ]]; then
    npx eslint --fix "$file_path" 2>/dev/null || true
    npx prettier --write "$file_path" 2>/dev/null || true
fi

exit 0
