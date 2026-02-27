---
name: workflows:spike
description: Fast vibe-code validation of a brainstorm idea in an isolated worktree
argument-hint: "[brainstorm file path]"
---

# Spike

Fast, guardrail-free coding to validate whether a brainstorm idea **feels right** before committing to a full plan.
Sits between `/workflows:brainstorm` and `/workflows:plan` in the feature lifecycle.

**NEVER CODE IN THIS FILE.** This is a command template. The spike code goes in the worktree.

## Input

<brainstorm_input> #$ARGUMENTS </brainstorm_input>

**If a brainstorm file path:** Read it. Verify it has a settled approach.

**If empty:** Scan `docs/brainstorms/*.md` for recent brainstorms (exclude `deferred-*`). Present choices using
AskUserQuestion.

**If no brainstorm exists:** Say: "Run `/workflows:brainstorm` first — spiking requires a brainstorm with settled
decisions."

## Phase 1: Understand Scope

Read the brainstorm's **Settled Approach** (or **Settled Decisions**) section.

Infer what to spike — propose a focused scope. Use **AskUserQuestion**:

"Based on the brainstorm, I'd spike: **[description]**. Sound right, or would you like to focus on something specific?"

Keep the scope narrow. A spike that takes more than ~30 minutes of coding has too much scope.

## Phase 2: Set Up Worktree

Create an isolated worktree for the spike:

```
Use the EnterWorktree tool with name: "spike-{brainstorm-topic}"
```

Note the worktree path from the tool's response — you'll need it for the findings section.

All spike work happens in the worktree. The main branch stays clean.

## Phase 3: Code

Code freely. **No guardrails:**

- No style cards
- No complexity reviews
- No review agents
- No cohesion groups or section ordering
- No TDD requirements

**Pre-commit hooks still run** (formatting is automatic anyway).

**All commits use `[SPIKE]` prefix.** Example:

```
[SPIKE] Wire up basic report table with mock data
```

Focus on validating the idea, not writing production code. Cut corners. Use hardcoded values. Skip error handling.
The goal is to **see if the approach feels right**, not to write the final implementation.

## Phase 4: Capture Findings

When done — user says "done", "enough", or "that's what I needed" — capture what was learned.

Use **AskUserQuestion** to prompt reflection:

"What did you learn from this spike? Anything surprise you or change your thinking?"

Then append findings to the brainstorm doc as a new section:

```markdown
## Spike Findings (N): <topic>

**Date:** YYYY-MM-DD

**What we tested:**
- [bullet points]

**Results:**
- [what worked, what didn't, surprises]

**Key learnings:**
- [insights that should inform the real implementation]

**Revised assumptions:**
- [anything from the settled approach that needs updating, or "None"]
```

Number the findings section sequentially (1, 2, 3...) if multiple spikes are run against the same brainstorm.

**Important:** The worktree persists after the spike. During real implementation, you can reference the spike code via
file reads from the worktree path. This is **read-only reference** — never cherry-pick or copy-paste spike code
directly into the real implementation. The real code goes through the full plan/review cycle.

## Phase 5: Next Steps

Use **AskUserQuestion**:

"Spike findings captured. Worktree persists for reference at the path shown during setup. What next?"

Options:

1. **Spike again** — Explore a different aspect of the same brainstorm
2. **Proceed to planning** — Run `/workflows:plan` (will read the updated brainstorm with spike findings)
3. **Done for now** — Return later

## Rules

- Keep spikes short and focused — if scope creep happens, stop and narrow
- Always capture findings before ending, even if the spike "failed" — failure is valuable data
- Never modify the main branch — all spike code stays in the worktree
- The brainstorm doc (on main branch) is the only artifact that crosses the boundary
