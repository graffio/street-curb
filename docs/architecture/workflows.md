---
summary: Claude Code workflow system — spike validation and the brainstorm/plan/implement/wrap-up lifecycle
keywords: workflow, spike, context window, brainstorm, plan, worktree, hooks
module: system
---

# Workflow System

## Overview

The feature lifecycle: **brainstorm → spike (optional) → plan → implement → wrap-up**.

Each phase is a `/workflows:*` command in `.claude/commands/workflows/`.

## Spike Workflow

`/workflows:spike` provides fast, guardrail-free coding in an isolated worktree to validate whether a brainstormed idea
"feels right" before committing to a full plan.

```
Brainstorm (settled decisions)
    │
    ▼
/workflows:spike
    │  ┌─────────────────────────────┐
    │  │ EnterWorktree: spike-{name} │
    │  │ No style cards              │
    │  │ No reviews                  │
    │  │ [SPIKE] commit prefix       │
    │  │ COMPLEXITY comments allowed │
    │  └─────────────────────────────┘
    │
    ▼
Findings → appended to brainstorm doc
    │
    ▼
Worktree persists as reference during real implementation
    │
    ▼
/workflows:plan reads updated brainstorm
```

**Key rules:**
- Spike code is reference-only — never cherry-picked into real implementation
- COMPLEXITY comments suppress style validator; violations recorded in spike findings
- Worktree cleaned up during `/workflows:wrap-up`

## File Layout

| File | Purpose |
|------|---------|
| `.claude/commands/workflows/brainstorm.md` | Phase 1: explore what to build |
| `.claude/commands/workflows/spike.md` | Phase 1.5: validate ideas fast |
| `.claude/commands/workflows/plan.md` | Phase 2: generate task.json |
| `.claude/commands/workflows/wrap-up.md` | Phase 4: commit quality, knowledge, cleanup |
| `.claude/commands/workflows/review.md` | PR review (parallel agents) |
| `~/.claude/statusline.sh` | Context monitoring (user-level config, outside repo) |
