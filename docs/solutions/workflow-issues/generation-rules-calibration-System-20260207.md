---
module: System
date: 2026-02-07
problem_type: workflow_issue
component: tooling
symptoms:
  - "Claude partially follows 300-line conventions.md but reverts under cognitive load"
  - "Duplicate commands and files drift out of sync"
  - "Plan generator interprets abstract rules too broadly"
  - "Style guidance loaded at wrong time — too early or never"
root_cause: inadequate_documentation
resolution_type: workflow_improvement
severity: high
tags: [workflow-consolidation, generation-rules, context-architecture, style-cards, calibration]
---

# Workflow Consolidation: Lessons from Rebuilding the SDLC Process

## Solution

### 1. Three-Tier Context Architecture

Every reference file needs an explicit trigger mechanism ("how does it know?"):

| Tier | Size | When loaded | Trigger mechanism |
|------|------|-------------|-------------------|
| Always-on | ~100 lines | Session start | `@import` in CLAUDE.md |
| Per-step | ~40 lines each | Before writing code | `style_card` field in task file |
| On-demand | Full APIs | When pattern detected | Signal table in CLAUDE.md |

### 2. Style Cards as Pre-Write Priming

40-line focused cards loaded per-step via `style_card` field in the task file.
Each covers judgment rules the validator can't enforce. Same rules as conventions.md,
but in fresh context at the moment of writing — compliance jumps dramatically.

### 3. Pointer Files Over Monoliths

conventions.md (300 lines) → 15-line table pointing to where rules actually live.
Rules belong where they're enforced: style cards, validator config, hooks.

### 4. Mechanical Generation Rules

Observable signals beat semantic conditions:

| Abstract (ignored) | Mechanical (followed) |
|--------------------|-----------------------|
| "after each logical chunk" | "when style_card transitions between steps" |
| "data transformation" triggers TDD | Enumerated exclusion list of what NOT to test |
| "before modifying file >100 lines" | "before modifying any existing file" (unconditional) |
| `selectors/**/*.js` | `**/selectors.js` (match actual path) |

### 5. Separate Judgment from Mechanics

jeff-js-reviewer was rewritten to check ONLY what machines can't: naming quality, layer
placement, pattern choice, complexity. The validator handles structure, exports, cohesion.

### 6. Track Fuzzy Gaps Separately

Clear rules → implement immediately. Fuzzy rules (browser test strategy, complexity
heuristics) → `specifications/close-style-system-gaps.md` for calibration against real usage.
Don't block on rules you can't yet specify.

## Why This Works

1. **Context placement > content.** The same rules in fresh context (40 lines, right
   before writing) get followed. In stale context (300 lines, session start) they don't.

2. **Enumerated exclusions close interpretive gaps.** "Do NOT generate test steps for:
   [specific list]" is followed. "Generate tests for domain logic" is interpreted too broadly.

3. **Observable triggers are uncheckable.** "Compare adjacent style_card values" has one
   interpretation. "Identify logical chunks" has many.

4. **Redundancy is drift.** Every duplicate file, command, or rule is a future
   inconsistency. One source of truth per concern.

5. **End-to-end testing is essential.** 4 rounds of `/workflows:plan` on a real spec to
   calibrate. Code review and reading the rules couldn't find these problems — only
   running the system against real input exposed them.

## Prevention

- **Every reference file needs a trigger mechanism.** If you can't answer "how does it
  know when to load this?" — the file won't be loaded.
- **Lead with exclusions in generation rules.** "Do NOT X for: [list]" beats "Do X when:
  [condition]"
- **Make rules unconditional when the action is cheap.** Remove the condition entirely.
- **Test workflow changes with a real feature spec.** Expect 2-4 calibration rounds.
- **Audit for dead files periodically.** Installed-but-unused components accumulate.
- **Match glob patterns to actual file paths.** Check against the real project structure.

## Problem

Two overlapping workflow systems (original workflow.md + compound engineering) with 500+
lines of always-on context, 36+ dead files, duplicate commands, and rules that Claude
partially followed. Style violations caught at commit time (too late) instead of prevented
at write time.

## Environment
- Module: System (`.claude/` workflow infrastructure)
- Date: 2026-02-07
- Scope: 10 commits, ~12,000 lines removed, ~500 lines added

## Symptoms
- Claude partially follows conventions.md (300 lines) but reverts to defaults under load
- Two planning commands (plan + plan-feature), two finish commands (compound + record)
- 5 unused agents, 3 unused skills adding noise to tool lists
- Plan generator produces plumbing tests, batches commits, uses wrong style cards
- jeff-js-reviewer duplicates checks the validator already handles

## What Didn't Work

**Attempted Solution 1:** Large always-on context files (conventions.md 300 lines)
- **Why it failed:** Claude follows rules in fresh context but drops them as conversation
  grows. 300 lines at session start gets buried.

**Attempted Solution 2:** Abstract generation rules ("after each logical chunk", "data transformation")
- **Why it failed:** Claude finds interpretive wiggle room in abstract conditions. Took 4
  iterations of the TDD rule alone to close all the gaps.

## Related Issues

No related issues documented yet.
