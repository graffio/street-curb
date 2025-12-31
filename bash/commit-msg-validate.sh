#!/bin/bash
# ABOUTME: Git commit-msg hook that validates commit message format
# ABOUTME: Enforces Problem/Solution/Impact structure per .claude/tasks/commit-changes.md

set -e

msg_file="$1"
msg=$(cat "$msg_file")

# Skip merge commits
if echo "$msg" | head -1 | grep -q "^Merge "; then
    exit 0
fi

# Skip if message is very short (likely amend or fixup)
line_count=$(echo "$msg" | wc -l | tr -d ' ')
if [ "$line_count" -lt 3 ]; then
    echo "Commit message too short. Use Problem/Solution/Impact format."
    echo "See .claude/tasks/commit-changes.md"
    exit 1
fi

# Check for required sections
missing=""

if ! echo "$msg" | grep -q "Problem:"; then
    missing="$missing Problem:"
fi

if ! echo "$msg" | grep -q "Solution:"; then
    missing="$missing Solution:"
fi

if ! echo "$msg" | grep -q "Impact:"; then
    missing="$missing Impact:"
fi

if [ -n "$missing" ]; then
    echo "Commit message missing required sections:$missing"
    echo ""
    echo "Required format (see .claude/tasks/commit-changes.md):"
    echo "  [Problem being solved, ~50 chars]"
    echo ""
    echo "  Problem: What was wrong/missing"
    echo "  Solution: The approach taken"
    echo "  Impact: What this enables/prevents/improves"
    exit 1
fi

exit 0
