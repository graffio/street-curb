#!/bin/bash
file_path=$(jq -r '.tool_input.file_path' | head -n 1)

if [[ "$file_path" =~ \.(jsx?)$ ]]; then
    npx eslint --fix "$file_path" 2>/dev/null || true
    npx prettier --write "$file_path" 2>/dev/null || true
fi

exit 0
