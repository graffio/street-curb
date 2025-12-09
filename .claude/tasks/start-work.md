# Start Work

Run at session start before implementation.

## Steps

1. **Check git status** - Any uncommitted changes or untracked files?
2. **If dirty** - Ask Jeff: commit first, stash, or continue?
3. **Check branch** - On correct branch for this task?
4. **If no branch** - Create WIP branch: `git checkout -b wip/<description>`
5. **Check episodic memory** - Search for prior work on this feature/area

## Rules

- Never start implementation with uncommitted changes without asking
- Commit frequently during work, even if task isn't done
- Never use `git add -A` without checking `git status` first
