# Context Relay via Interactive Loop

**Date:** 2026-02-27
**Status:** Brainstorm

## What We're Building

Replace the current subagent-based context relay with an external bash loop that starts fresh interactive `claude` sessions. When a session runs out of context, it finishes its current step, writes notes to task.json, and exits. The loop checks task.json for remaining steps and starts a new session.

## Why This Matters

The current relay system tells the agent to spawn a subagent when context runs low. This has three problems:

1. **Unreliable** — the agent receives an advisory "CONTEXT LOW" message but may ignore it
2. **Invisible** — subagent output is hidden from the user; no ability to interact, steer, or approve checkpoints
3. **Wrong abstraction** — relay is a process-level concern, not an agent-level concern

## Settled Approach

### The loop

A bash script (`bash/relay-loop.sh`) that:

1. Takes a task.json path and optional max-iterations (default 10)
2. Checks task.json for remaining undone steps — exits if all done
3. Starts an interactive `claude` session with an initial prompt:
   ```
   claude "Continue implementing $TASK_FILE — you are relay #N.
   Read the task file, find the first step with done: false, continue from there.
   Read all previous step notes for context.
   If you see CONTEXT LOW, finish your current step with detailed notes and stop."
   ```
4. Waits for the session to exit (context low, user exits, task complete)
5. Loops back to step 2

### What stays the same

- **Statusline** (`~/.claude/statusline.sh`) — still writes `.context-low` flag when remaining context < 25%
- **Hook** (`relay-on-context-low.sh`) — still fires and injects "CONTEXT LOW" message via exit 2
- **Task.json** — still the state bridge between sessions; `done: true` + `note` carry context forward

### What changes

- **`context-relay.md`** — rewritten: "finish step, write notes, stop" (no subagent spawn)
- **New script** — `bash/relay-loop.sh` replaces the subagent relay mechanism
- **`workflows.md`** — updated to describe loop-based relay instead of subagent relay

### Key properties

- **Interactive sessions** — `claude "prompt"` (not `claude -p`). User can interact at any point: checkpoints, mid-step, whenever
- **Fresh context per iteration** — no degradation, full 200k window each time
- **Mechanical relay** — the bash loop *will* start the next session; no advisory instructions to an LLM
- **Checkpoints work naturally** — `[CHECKPOINT]` steps happen inside the interactive session, user responds normally
- **Visible** — every iteration is a top-level session the user can see and steer
- **Clean exit** — all steps done → agent tells user → user exits → loop exits to zsh
- **Safety cap** — max iterations (default 10) prevents runaway loops

### What we're NOT building

- No AFK vs interactive modes — it's always interactive
- No `.afk` flag file
- No subagent spawning from inside the agent
- No Stop hooks or ralph-wiggum plugin
- No `claude -p` (non-interactive) mode
- No magic completion strings (`<promise>COMPLETE</promise>`)

## Knowledge Destination

- `architecture:` docs/architecture/workflows.md (update relay section)

## Open Questions

None — all resolved.

- **Prompt method:** Positional prompt (`claude "Continue implementing..."`). Simpler, visible as the first message. CLAUDE.md and task file carry the real context.
- **Threshold:** Keep 25%. Maximizes work per session.
