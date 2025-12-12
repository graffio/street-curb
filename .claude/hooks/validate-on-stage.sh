#!/bin/bash
# ABOUTME: Claude Code hook to validate staged JS/JSX files on git add
# ABOUTME: Returns JSON feedback with violations and reminder to reread conventions

# Read stdin (contains tool info from Claude Code)
input=$(cat)

# Extract the command from bash tool input
command=$(echo "$input" | jq -r '.tool_input.command // empty')

# Only run on git add commands
if [[ ! "$command" =~ ^git\ add ]]; then
    exit 0
fi

# Get list of staged .js/.jsx files
staged_files=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null | grep -E '\.(jsx?)$' || true)

if [ -z "$staged_files" ]; then
    # No JS/JSX files staged, still remind to reread conventions
    echo "REMINDER: Reread .claude/conventions.md and .claude/preferences.md before continuing."
    exit 0
fi

# Run validator on each staged file
violations=""
has_violations=false
project_dir=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")

for file in $staged_files; do
    if [ -f "$file" ]; then
        result=$(node "$project_dir/modules/cli-style-validator/src/cli.js" "$file" 2>/dev/null || true)

        # Check if result has violations
        is_compliant=$(echo "$result" | jq -r '.isCompliant // true')

        if [ "$is_compliant" = "false" ]; then
            has_violations=true
            file_violations=$(echo "$result" | jq -r '.violations[] | "  Line \(.line): \(.message)"' 2>/dev/null || true)
            violations="$violations\n$file:\n$file_violations"
        fi
    fi
done

# Build response
if [ "$has_violations" = "true" ]; then
    # Escape violations for JSON
    escaped_violations=$(echo -e "$violations" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')

    cat <<EOF
{
  "decision": "block",
  "reason": "Style violations found:\\n$escaped_violations\\n\\nFix these issues, then reread .claude/conventions.md and .claude/preferences.md."
}
EOF
else
    echo "Files validated. REMINDER: Reread .claude/conventions.md and .claude/preferences.md before continuing."
fi

exit 0
