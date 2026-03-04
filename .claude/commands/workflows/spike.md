---
name: workflows:spike
description: Fast vibe-code validation of a brainstorm idea in an isolated worktree
argument-hint: "[brainstorm file path]"
---

# Spike

Fast, guardrail-free coding to validate whether a brainstorm idea **feels right** before committing to a full plan.
Sits between `/workflows:brainstorm` and `/workflows:plan` in the feature lifecycle.

**This session creates the worktree and hands off.** The actual coding happens in fresh `claude` session(s) whose
primary working directory IS the worktree. This is structural — subagents inherit primary cwd, so they work on the
correct branch.

## Input

<brainstorm_input> #$ARGUMENTS </brainstorm_input>

**If a brainstorm file path:** Read it. Verify it has a settled approach.

**If empty (no path):** Scan `docs/brainstorms/*.md` for recent brainstorms (exclude `deferred-*`). Present choices using
AskUserQuestion.

**If no brainstorm exists:** Say: "Run `/workflows:brainstorm` first — spiking requires a brainstorm with settled
decisions."

## Phase 1: Scope

Read the brainstorm's **Settled Approach** (or **Settled Decisions**) section.

Infer what to spike — propose a focused scope.

Use **AskUserQuestion**:

"Based on the brainstorm, I'd spike: **[description]**. Sound right, or would you like to focus on something specific?"

Keep the scope narrow. A spike that takes more than ~30 minutes of coding has too much scope.

## Phase 2: Create Worktree

**Before creating the worktree**, ensure the brainstorm file is committed to main. The worktree checks out HEAD —
untracked files won't be copied. If the brainstorm is untracked, commit it now:

```bash
git add docs/brainstorms/{name}.md
git commit -m "Add {name} brainstorm"
```

Create an isolated worktree using git commands directly (do NOT use the EnterWorktree tool):

```bash
git worktree add /Users/Shared/projects/worktrees/spike-{name} -b worktree-spike-{name} HEAD
```

Then install dependencies in the worktree (use `--cwd` to avoid changing this session's working directory):

```bash
yarn --cwd /Users/Shared/projects/worktrees/spike-{name} install --frozen-lockfile
```

**Naming conventions** (must match `worktree-create.sh` hook):

- Worktree directory: `/Users/Shared/projects/worktrees/spike-{name}`
- Branch name: `worktree-spike-{name}`

## Phase 3: Generate Task File

Generate a spike-weight task.json and write it to `<worktree>/docs/brainstorms/{name}.task.json`.

**Spike-weight task.json schema:**

```json
{
    "feature"   : "Spike: {feature}",
    "goal"      : "Validate {what we're testing}",
    "brainstorm": "docs/brainstorms/{name}.md",
    "spike"     : true,
    "steps"     : [
        {
            "step"  : 1,
            "action": "Coarse description of what to build",
            "done"  : false,
            "note"  : ""
        }
    ]
}
```

Rules for spike-weight steps:

- Prefer fewer steps (2-3 for a typical spike), combine sequential phases (build → test → document).
- Coarse steps — not file-level granularity
- No `style_card` fields
- No `rule: "unconditional"` steps (no review agents, no complexity reviews)
- Commit at the end of each coding step, not as separate steps — "build X and commit" not "build X" then "commit".
  Use `[SPIKE]` prefix on commit messages. Commit message format (required by pre-commit hook):
  ```
  [SPIKE] Short summary

  Problem: What was wrong/missing
  Solution: The approach taken
  Impact: What this enables/prevents/improves
  ```
  Do NOT try to read the commit hook to learn this format — it's right here.
- The style validator auto-skips on `worktree-spike-*` branches — no COMPLEXITY-TODO comments needed.
  Prettier and ESLint still run (formatting is automatic).
- Last step is always:

> Capture spike findings — review code diff against main (`git diff main...HEAD`),
> synthesize into brainstorm doc's `## Spike Findings (N)` section, commit on spike branch with `[SPIKE]` prefix.
>
> Findings format:
> ```
> ## Spike Findings (N): <topic>
> **Date:** YYYY-MM-DD
> **What we tested:** [bullets]
> **Results:** [what worked, what didn't, surprises]
> **Key learnings:** [insights for real implementation]
> **Revised assumptions:** [changes to settled approach, or None]
> **Validator violations suppressed:** [COMPLEXITY comments added, or None]
> ```

## Phase 4: Handoff

Print a block the user copies into their terminal:

````
Run this in your terminal:

```
cd /Users/Shared/projects/worktrees/spike-{name}
claude
```

Then tell it: "Run docs/brainstorms/{name}.task.json"
````

Then say:

"Worktree ready at `/Users/Shared/projects/worktrees/spike-{name}` on branch `worktree-spike-{name}`.
Start a claude session there and point it at the task file. When finished, run `/workflows:wrap-up` from the main repo
to harvest doc changes back to main."

This session is done. Do not continue — the spike happens in the worktree session.

## Rules

- **Never use EnterWorktree** — it changes this session's cwd but subagents still use the original primary directory
- Keep spikes short and focused — if scope creep happens, stop and narrow
- Always capture findings before ending, even if the spike "failed" — failure is valuable data
- Never modify the main branch — all spike work stays in the worktree
- Doc changes cross the boundary at wrap-up via harvest, not during the spike
- Never cherry-pick or copy-paste spike code into the real implementation — real code goes through the full plan/review
  cycle
