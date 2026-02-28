# Context-Low Protocol

When you see a **"CONTEXT LOW"** message from the PostToolUse hook, follow these steps exactly.

## Steps

### 1. Finish Current Step

Complete whatever step you are working on. Do not leave it half-done.

### 2. Write a Detailed Note

Mark the step `done: true` in the task.json. Write a thorough `note` — not "As planned." The next session depends on
your notes for context. Include:

- What you did
- Any deviations from the plan
- Anything the next session should watch out for
- If you tried something that didn't work, say so

### 3. Stop

Tell the user you're stopping due to low context. Do not spawn subagents. Do not continue working.

The external relay loop (`bash/relay-loop.sh`) will start a fresh session that picks up from the next undone step.

## Notes

- The task.json on disk IS the communication protocol — write good notes
- The next session has fresh context but access to all project files
- All guardrails still apply in the next session (style cards, reviews, etc.)
- The next session will see CLAUDE.md and preferences.md automatically
