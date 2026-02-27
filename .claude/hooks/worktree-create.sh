#!/bin/bash
# ABOUTME: WorktreeCreate hook
# ABOUTME: Creates worktrees outside the main repo to prevent path drift, installs deps

input=$(cat)
name=$(echo "$input" | jq -r '.name')

WORKTREE_DIR="/Users/Shared/projects/worktrees"
WORKTREE_PATH="$WORKTREE_DIR/$name"

mkdir -p "$WORKTREE_DIR"

# All output except the final path must go to stderr
git worktree add "$WORKTREE_PATH" -b "worktree-$name" HEAD >&2

(cd "$WORKTREE_PATH" && yarn install --frozen-lockfile) >&2

# Print ONLY the absolute path — this is the hook contract
echo "$WORKTREE_PATH"
