#!/bin/bash
# ABOUTME: Git pre-commit hook that validates staged JS/JSX files
# ABOUTME: Creates .needs-reread flag on success to trigger Claude reread reminder

set -e

# Get list of staged .js/.jsx files (excluding generated src/types/ and type-definitions/)
staged_files=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null | grep -E '\.(jsx?)$' | grep -v -e 'src/types/' -e 'type-definitions/' || true)

if [ -z "$staged_files" ]; then
    exit 0
fi

# Run validator on each staged file
project_dir=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
has_violations=false
violations=""

for file in $staged_files; do
    if [ -f "$file" ]; then
        result=$(node "$project_dir/modules/cli-style-validator/src/cli.js" "$file" 2>/dev/null || true)
        is_compliant=$(echo "$result" | jq -r 'if .isCompliant == false then "false" else "true" end')

        if [ "$is_compliant" = "false" ]; then
            has_violations=true
            file_violations=$(echo "$result" | jq -r '.violations[] | "  Line \(.line): \(.message)"' 2>/dev/null || true)
            violations="$violations\n$file:\n$file_violations"
        fi
    fi
done

if [ "$has_violations" = "true" ]; then
    echo -e "Style violations found:\n$violations"
    echo ""
    echo "Fix these issues before committing."
    exit 1
fi

# Validation passed - create flag for Claude reread reminder
touch "$project_dir/.claude/.needs-reread"

exit 0
