---
date: 2026-02-28
topic: spike-workflow-rewrite
---

# Spike Workflow Rewrite: EnterWorktree → Worktree Handoff

**Date:** 2026-02-28
**Status:** Brainstorm

## What We're Building

Rewrite `.claude/commands/workflows/spike.md` so the implementation happens in a `claude` session whose primary working directory IS the worktree — not in the original session that created the worktree.

## Why This Matters

Task/Explore subagents don't inherit worktree working directory — they use the session's original primary directory. This means subagents read and write files on the wrong branch. Advisory "use the worktree path" is fragile. The fix is structural: the implementation session's primary working directory must BE the worktree.

## Settled Approach

### Always relay-loop

Always generate a spike-weight task.json and hand off to `relay-loop.sh`. No branching logic based on spike size.

For small spikes that finish in one session, the overhead is near-zero: relay-loop starts one `claude` session, it
finishes all steps, relay-loop checks remaining with `jq`, finds 0, exits. The task.json provides better structured
context than an inline prompt anyway.

### Phase structure (replaces current 5-phase spike)

1. **Scope** (same as today) — read brainstorm, propose focused scope, confirm with user
2. **Create worktree** — `git worktree add /Users/Shared/projects/worktrees/spike-{name} -b worktree-spike-{name} HEAD` + `yarn install --frozen-lockfile` in the worktree
3. **Generate task.json** — spike-weight steps, write into worktree
4. **Handoff** — print relay-loop command, exit

### Spike-weight task.json

Generate spike-weight task.json:
- Coarse steps — not file-level granularity
- No `style_card` fields, no `rule: "unconditional"` steps
- `[SPIKE]` commit prefix on all commits
- COMPLEXITY comments allowed to suppress validator
- Last step: "Capture spike findings — review code diff against main, synthesize into brainstorm doc's `## Spike Findings (N)` section, commit on spike branch"

Print:

```
cd /Users/Shared/projects/worktrees/spike-{name}
bash bash/relay-loop.sh docs/brainstorms/{name}.task.json
```

### Branch naming

Branch name: `worktree-spike-{name}` (matches the `worktree-{name}` convention from `worktree-create.sh`). Worktree directory: `/Users/Shared/projects/worktrees/spike-{name}`. Wrap-up's harvest step uses `git worktree list` to find it, so both must be predictable.

### Findings capture

The final task.json step captures findings. It reads the code diff against main and any step notes, asks the user what
they learned, synthesizes into `## Spike Findings (N)` section. Self-sufficient — doesn't depend on prior notes being
populated.

After either path, user runs `/workflows:wrap-up` from main repo to harvest doc changes back to main.

### What stays the same

- Scope negotiation (Phase 1)
- No guardrails during coding (no style cards, no TDD, no reviews)
- `[SPIKE]` commit prefix
- Findings append to brainstorm doc
- Wrap-up harvests docs back to main
- Worktree path: `/Users/Shared/projects/worktrees/spike-{name}`

### What changes

| Before | After |
|--------|-------|
| `EnterWorktree` tool | `git worktree add` via Bash |
| Code in this session | Code in new session(s) in worktree |
| Subagents use wrong cwd | Subagents use worktree cwd |
| No task.json | Spike-weight task.json always |
| Findings captured in this session | Findings captured by relay session |
| Session stays open during coding | Session exits after creating worktree |

## Knowledge Destination

`none` — knowledge lives in the rewritten spike.md command file itself.

## Open Questions

None.
