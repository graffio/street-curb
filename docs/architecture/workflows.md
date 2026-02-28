---
summary: Claude Code workflow system — spike validation, context relay, and the brainstorm/plan/implement/wrap-up lifecycle
keywords: workflow, spike, relay, context window, brainstorm, plan, worktree, hooks
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

## Context Relay

Automatic session handoff when context window runs low. An external bash loop starts fresh interactive sessions.

```
Statusline (every message exchange)
    │  Reads context_window.remaining_percentage
    │  When < 25%: writes .claude/.context-low flag
    ▼
PostToolUse hook (relay-on-context-low.sh)
    │  Matcher: Bash|Edit|Write|WebFetch|NotebookEdit
    │  Atomic consume: mv flag, emit stderr, exit 2
    ▼
Agent sees "CONTEXT LOW" instruction
    │  Reads .claude/tasks/context-relay.md
    │  Completes current step with detailed notes
    │  Stops (no subagent spawn)
    ▼
bash/relay-loop.sh detects session exited
    │  Checks task.json for remaining undone steps
    │  Starts fresh interactive claude session
    ▼
New session picks up from first undone step
```

**Key components:**
- `bash/relay-loop.sh` — external loop that starts fresh interactive `claude` sessions
- `~/.claude/statusline.sh` — writes `.context-low` flag (user-level config, outside repo)
- `.claude/hooks/relay-on-context-low.sh` — PostToolUse hook, atomic flag consumption
- `.claude/tasks/context-relay.md` — protocol the agent follows: finish step, write notes, stop
- Safety cap: max iterations (default 10) prevents runaway loops

## File Layout

| File | Purpose |
|------|---------|
| `.claude/commands/workflows/brainstorm.md` | Phase 1: explore what to build |
| `.claude/commands/workflows/spike.md` | Phase 1.5: validate ideas fast |
| `.claude/commands/workflows/plan.md` | Phase 2: generate task.json |
| `.claude/commands/workflows/wrap-up.md` | Phase 4: commit quality, knowledge, cleanup |
| `.claude/commands/workflows/review.md` | PR review (parallel agents) |
| `bash/relay-loop.sh` | External loop: fresh interactive sessions on context relay |
| `.claude/tasks/context-relay.md` | Context-low protocol: finish step, write notes, stop |
| `.claude/hooks/relay-on-context-low.sh` | Context flag detection hook |
| `~/.claude/statusline.sh` | Context monitoring + flag writer |
