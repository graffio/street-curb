#!/bin/bash
# ABOUTME: PreToolUse hook for Bash tool — enforces simple, reviewable commands
# ABOUTME: Blocks cd (path drift), blocks chaining (&&, ;), allows pipes to safe output filters
input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command')

# Only check the first line — subsequent lines are heredoc content (commit messages, etc.)
# which may contain &&, ;, cd, | as plain text.
first_line=$(echo "$command" | head -1)

# --- Block cd: mutates persistent shell state, causes "lost in subfolder" problems ---
if echo "$first_line" | grep -qE '^\s*cd\s'; then
    echo "Blocked: 'cd' changes persistent shell state — you'll lose track of your working directory." >&2
    echo "Fix: use absolute paths, or --cwd / -C flags:" >&2
    echo "  yarn --cwd modules/foo test" >&2
    echo "  git -C modules/foo status" >&2
    exit 2
fi

# --- Block command chaining: && ---
if echo "$first_line" | grep -qE '&&'; then
    echo "Blocked: use separate Bash tool calls instead of chaining with &&." >&2
    echo "Fix: make two Bash tool calls, or use absolute paths instead of 'cd dir && cmd'." >&2
    exit 2
fi

# Strip || and ;; before checking for | and ; — these are valid bash operators,
# not command separators. (|| = logical OR, ;; = case terminator)
cleaned=$(echo "$first_line" | sed 's/||//g; s/;;//g')

# --- Block command chaining: ; ---
if echo "$cleaned" | grep -qE ';'; then
    echo "Blocked: use separate Bash tool calls instead of chaining with ;." >&2
    exit 2
fi

# --- Pipes: allow only to known-safe output filters ---
if echo "$cleaned" | grep -qE '\|'; then
    safe="tail head grep wc sort jq cut awk sed tr uniq column cat tee"
    targets=$(echo "$cleaned" | grep -oE '\|[&]?\s*[a-zA-Z0-9_/-]+' | sed 's/|[&]* *//')
    for target in $targets; do
        if ! echo " $safe " | grep -q " $target "; then
            echo "Blocked: pipe to '$target' is not in the safe filter list." >&2
            echo "Allowed: $safe" >&2
            exit 2
        fi
    done
fi

exit 0
