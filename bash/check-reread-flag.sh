#!/bin/bash
# ABOUTME: Claude UserPromptSubmit hook that checks for .needs-reread flag
# ABOUTME: Outputs reminder to reread conventions after commits, then deletes flag

flag_file="$CLAUDE_PROJECT_DIR/.claude/.needs-reread"

if [ -f "$flag_file" ]; then
    rm "$flag_file"
    echo "Post-commit reminder: Reread .claude/conventions.md and .claude/preferences.md before continuing."
fi

exit 0
