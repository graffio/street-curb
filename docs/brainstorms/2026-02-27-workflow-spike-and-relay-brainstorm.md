# Spike Workflow + Context Relay

**Date:** 2026-02-27
**Status:** Brainstorm

## What We're Building

Two additions to the workflow system:

1. **`/workflows:spike`** — A fast "vibe-code" command for validating ideas before committing to a full plan. Sits between brainstorm and plan in the flow. No guardrails, disposable code in a worktree, knowledge captured back to the brainstorm doc.

2. **Context relay** — Automatic handoff when context window degrades during long task.json implementations. The running agent checkpoints progress in task.json and spawns a fresh agent to continue, with no human in the loop.

## Why This Matters

**Spike:** The brainstorm/plan/implement/wrap-up flow works well but skips a "does this feel right?" validation step. Jeff has hit this multiple times — committing to a full plan only to discover the approach doesn't feel right once implemented. A lightweight spike catches this early.

**Relay:** Long implementations (like the 27-step action-registry migration) degrade as context fills. Jeff is often AFK and can't manually restart sessions. The system needs to be self-healing.

## Settled Decisions

### `/workflows:spike`

- **Standalone command**, not a phase within brainstorm
- **Reads the current brainstorm doc** for context on what to spike
- **Infers spike scope from brainstorm**, then confirms with user before starting
- **No guardrails**: no style cards, no reviews, no complexity checks, no cohesion groups
- **Runs in a git worktree** — isolated from main branch, stays around as reference during real implementation
- **`[SPIKE]` prefix on all commits** within the worktree
- **Iterative flow**: brainstorm -> spike -> update brainstorm -> spike again? -> plan
- **Spike findings appended to brainstorm doc** as `## Spike Findings` sections (numbered if multiple spikes)
- Findings capture: what worked, what didn't, surprises, revised assumptions
- **Worktree persists** until `/workflows:wrap-up` deletes it — real implementation can reference spike code via file reads
- Pre-commit hooks still run (formatting is automatic anyway)
- No rollback needed — spike code never touches the main branch

### Context Relay

- **Relay race model**: one agent runs until context thins, auto-hands-off to a fresh agent
- **task.json is the communication protocol** — already has `done` fields and `note` per step
- Handoff mechanics: mark current progress in task.json, spawn fresh general-purpose subagent with "Continue implementing docs/brainstorms/X.task.json"
- **Note quality is critical** — the outgoing agent must write good `note` fields so the incoming agent has context on deviations
- No complex parent/child orchestration, no grouping decisions
- **AFK-compatible** — no human needed for the handoff
- **Soft limit at 3 handoffs** — after 3 relays, the next agent warns the user but continues
- **Applies to both implementation and spikes** — same relay protection everywhere

### Relay Trigger Mechanism (validated)

Architecture using existing infrastructure:

1. **Statusline script** (`~/.claude/statusline.sh`) runs on every message exchange and receives `context_window.remaining_percentage`. Modify it to write `.claude/.context-low` flag when remaining drops below threshold (e.g., 25%).
2. **PostToolUse hook** (fires on agent's own tool calls, works AFK) checks for the flag and injects a relay instruction via `exit 2` + stderr message.
3. **Agent** sees the instruction, finishes current step with good notes, spawns relay subagent.

## Knowledge Destination

| Destination | Content |
|---|---|
| `architecture:` docs/architecture/workflows.md (update) | New spike workflow, relay handoff protocol |
| `decisions:` append | Relay-race over per-cluster orchestration; worktree isolation for spikes |

## Spike Findings (1): Relay Trigger Validation

**Date:** 2026-02-27

**What we tested:**
- Does the statusline fire during autonomous (AFK) tool calls?
- Can a PostToolUse hook inject a message the agent can see and act on?

**Results:**
- **Statusline fires reliably** — 7 invocations logged during a short burst of autonomous tool calls. Token counts increment accurately. `remaining_percentage` is calculated correctly.
- **PostToolUse hook injection works** — but only with `exit 2` + stderr output. The initially attempted JSON format (`{"result": "warn", "message": "..."}`) was silently ignored because those aren't recognized fields.
- **Correct hook output format:** `echo "message" >&2; exit 2` — this produces a blocking error that appears in the agent's context as a system reminder.
- **Flag file approach works** — statusline writes flag (external, no permissions), hook reads/deletes flag (external, no permissions), agent never touches the flag file directly.

**Key learnings:**
- PostToolUse hooks must use `exit 2` + stderr for messages the agent needs to see. `exit 0` + stdout is only visible in verbose mode.
- The hook consuming (deleting) the flag on read prevents repeated warnings on every subsequent tool call.
- No permission issues in production — only the test setup required manual flag creation.

**Revised assumptions:** None — the proposed architecture works as designed. No fallback needed.

## Open Questions

None — all resolved and validated.
