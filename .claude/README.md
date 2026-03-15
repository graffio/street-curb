# How We Work

This document explains the system for humans. Claude reads `CLAUDE.md` (which imports `preferences.md`).

## Quick Start

Plan a feature:

```
/workflows:plan [brainstorm file path]
```

Resume implementation:

```
Continue implementing docs/brainstorms/{name}.task.json
```

Review files:

```
review <file>
review staged
```

Finish up:

```
/workflows:wrap-up
```

## The System

### Three Tiers of Reference Material

| Tier              | What                                                               | When loaded      | Where                          |
|-------------------|--------------------------------------------------------------------|--------------------|--------------------------------|
| Always in context | Universal principles, workflow, pattern triggers, functional names | Session start      | `CLAUDE.md` (inline)           |
| Always in context | File-type-specific style rules (~160 lines total)                  | Session start      | `.claude/style-cards/*.md`     |
| On-demand         | Full API references                                                | When needed        | `.claude/api-cheatsheets/*.md` |

### Style Cards

~40-line files with judgment rules the validator can't catch:

- `react-component.md` — handler patterns, hook rules, layer boundaries
- `selector.md` — composition, layer boundaries, memoization
- `js-module.md` — cohesion groups, naming, fail-fast philosophy
- `test-file.md` — TAP structure, Given/When/Then, TDD flow

All loaded at session start (~160 lines total). The `style_cards` field in task files documents which areas a step touches.

### Task Files

Named JSON files co-located with brainstorms: `docs/brainstorms/{name}.task.json`. Gitignored (`*.task.json`). JSON
steps with `status` field. Can't be reinterpreted.

### Mechanical Enforcement

| Gate             | When                         | What                                  |
|------------------|------------------------------|---------------------------------------|
| Pre-commit hook  | `git commit`                 | cli-style-validator + eslint/prettier |
| PostToolUse hook | After Write/Edit on .js/.jsx | eslint --fix + prettier --write       |
| Task file        | During implementation        | Whatever the plan says                |

### Commands

| Command                 | Purpose                                      |
|-------------------------|----------------------------------------------|
| `/workflows:plan`       | Read brainstorm → generate task file         |
| `/workflows:wrap-up`    | Full-branch review → commit quality → knowledge capture → cleanup |
| `/workflows:brainstorm` | Exploration before planning                                       |
| `review <file>`         | Quick quality check during development       |
| `review staged`         | Quality check on all staged files            |

### Review Agents

| Agent                    | Focus                                              | Used by          |
|--------------------------|----------------------------------------------------|------------------|
| jeff-js-reviewer         | Naming, layer placement, pattern choice, fail-fast | review, wrap-up  |
| code-simplicity-reviewer | Abstraction justification, YAGNI, cross-file duplication | review, wrap-up  |
| architecture-strategist  | Layer violations, simplification strategies, cross-file patterns | wrap-up          |
| performance-oracle       | Performance issues                                 | wrap-up          |
| security-sentinel        | Security concerns                                  | wrap-up          |
| learnings-researcher     | Past solutions from docs/solutions/                | plan             |

### Key Files

| File                           | Purpose                                                      |
|--------------------------------|--------------------------------------------------------------|
| `CLAUDE.md`                    | Entry point — principles, workflow, triggers, functional API |
| `preferences.md`               | Architectural judgment calls (imported by CLAUDE.md)         |
| `docs/brainstorms/*.task.json` | Active task spec (gitignored)                                |
| `style-cards/*.md`             | Style guidance (loaded at session start)                     |
| `api-cheatsheets/*.md`         | API references for custom data structures                    |
| `tasks/*.md`                   | Templates for specific activities                            |

## Why This Protocol

Claude needs constraints to stay on track. Without them, it:

- Reverts to default style under cognitive load
- Skips advisory review steps
- Interprets instructions loosely

The protocol addresses this with:

- **JSON task spec** — enumerable steps, no room for interpretation
- **Style cards at session start** — all style guidance loaded upfront (~160 lines)
- **Mechanical enforcement** — hooks that can't be skipped
- **Checkpoints** — forced approval at decision points

## Complexity-Budget Failures = CHECKPOINT

When the style validator reports "exceeds budget":

1. **Stop** — don't shuffle code to pass
2. **Run `review <file>`** — understand the structural issues
3. **Rethink approach** — move logic to proper layer, use different pattern
4. **Get approval** — if the plan changes, confirm with Jeff

Never add COMPLEXITY or COMPLEXITY-TODO comments without asking Jeff.
