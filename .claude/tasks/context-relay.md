# Context Relay Handoff Protocol

When you see a **"CONTEXT LOW"** message from the PostToolUse hook, follow these steps exactly.

## Steps

### 1. Finish Current Step

Complete whatever step you are working on. Do not leave it half-done.

### 2. Write a Detailed Note

Mark the step `done: true` in the task.json. Write a thorough `note` — not "As planned." The next agent depends on
your notes for context. Include:

- What you did
- Any deviations from the plan
- Anything the next agent should watch out for
- If you tried something that didn't work, say so

### 3. Determine Relay Number

- If your session prompt says "you are relay agent #N", your relay number is N.
- If your session prompt does not mention a relay number, you are the original agent. Your relay number is 0.

### 4. Check Soft Limit

If your relay number is **>= 3**, add this to your step note:

> "WARNING: This task has been relayed 3+ times. User should review progress before continuing."

Then **stop** — do not spawn another subagent. Wait for the user.

### 5. Spawn Relay Subagent

Spawn a general-purpose subagent using this prompt template:

```
Continue implementing {task-file-path} — you are relay agent #{N+1}.

Read the task file, find the first step with done: false, and continue from there.
Read all previous step notes for context on deviations and decisions.

If you encounter a CONTEXT LOW message, read .claude/tasks/context-relay.md and follow the relay protocol.
```

Replace `{task-file-path}` with the actual path (e.g., `docs/brainstorms/2026-02-27-foo.task.json`).
Replace `{N+1}` with your relay number + 1.

## Notes

- The task.json on disk IS the communication protocol — write good notes
- The relay subagent has fresh context but access to all project files
- All guardrails still apply in the relay agent (style cards, reviews, etc.) unless in spike mode
- The relay subagent will see CLAUDE.md and preferences.md automatically
