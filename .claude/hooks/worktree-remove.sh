#!/bin/bash
# ABOUTME: WorktreeRemove hook
# ABOUTME: Removes worktrees and cleans up their branches

input=$(cat)
worktree_path=$(echo "$input" | jq -r '.worktree_path')

# Get the branch name before removing
branch=$(git -C "$worktree_path" branch --show-current 2>/dev/null)

# Remove worktree — fails if unclean (uncommitted changes), which is intentional
git worktree remove "$worktree_path" >&2

# Clean up the branch (spike branches have unmerged changes by design)
if [ -n "$branch" ] && [ "$branch" != "main" ]; then
    git branch -D "$branch" >&2
fi
