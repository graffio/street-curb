# How We Work

This document explains the system for humans. Claude reads `CLAUDE.md` (which imports `preferences.md`).

## Quick Start

Plan a feature:
```
/workflows:plan [description or spec file]
```

Resume implementation:
```
Continue implementing current-task.json
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

| Tier | What | When loaded | Where |
|------|------|-------------|-------|
| Always in context | Universal principles, workflow, pattern triggers, functional names | Session start | `CLAUDE.md` (inline) |
| Per-step | File-type-specific style rules | Before each implementation step | `.claude/style-cards/*.md` |
| On-demand | Full API references, detailed pattern guides | When signaled by triggers or style cards | `.claude/pattern-catalog/*.md`, `.claude/api-cheatsheets/*.md` |

### Style Cards

~40-line files with judgment rules the validator can't catch:
- `react-component.md` — handler patterns, hook rules, layer boundaries
- `selector.md` — composition, layer boundaries, createSelector usage
- `utility-module.md` — cohesion groups, naming, fail-fast philosophy
- `test-file.md` — TAP structure, Given/When/Then, TDD flow

Loaded via `style_card` field in current-task.json steps. `/workflows:plan` maps file types to cards automatically.

### current-task.json

The implementation driver. JSON steps with `done` boolean. Can't be reinterpreted.

Schema adds `style_card` field:
```json
{ "step": 3, "action": "Implement component", "style_card": "react-component", "done": false }
```

### Mechanical Enforcement

| Gate | When | What |
|------|------|------|
| Pre-commit hook | `git commit` | cli-style-validator + eslint/prettier |
| PostToolUse hook | After Write/Edit on .js/.jsx | eslint --fix + prettier --write |
| current-task.json | During implementation | Whatever the plan says |

### Commands

| Command | Purpose |
|---------|---------|
| `/workflows:plan` | Research → plan → generate current-task.json |
| `/workflows:wrap-up` | Commit quality → knowledge capture → cleanup |
| `/workflows:review` | Parallel agent review (pre-merge) |
| `/workflows:brainstorm` | Exploration before planning |
| `review <file>` | Quick quality check during development |
| `review staged` | Quality check on all staged files |

### Review Agents

| Agent | Focus |
|-------|-------|
| jeff-js-reviewer | Naming, layer placement, pattern choice, fail-fast |
| code-simplicity-reviewer | Complexity, unnecessary abstraction |
| performance-oracle | Performance issues |
| architecture-strategist | Layer violations, structural issues |
| security-sentinel | Security concerns |
| learnings-researcher | Past solutions from docs/solutions/ |

### Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Entry point — principles, workflow, triggers, functional API |
| `preferences.md` | Architectural judgment calls (imported by CLAUDE.md) |
| `conventions.md` | Pointer file — where style rules actually live |
| `workflow.md` | Pointer file — where workflow rules actually live |
| `current-task.json` | Active task spec |
| `style-cards/*.md` | Per-step style guidance |
| `pattern-catalog/*.md` | Tactical pattern references |
| `api-cheatsheets/*.md` | API references for custom data structures |
| `tasks/*.md` | Templates for specific activities |

## Why This Protocol

Claude needs constraints to stay on track. Without them, it:
- Reverts to default style under cognitive load
- Skips advisory review steps
- Interprets instructions loosely

The protocol addresses this with:
- **JSON task spec** — enumerable steps, no room for interpretation
- **Style cards per step** — style guidance in fresh context when needed
- **Mechanical enforcement** — hooks that can't be skipped
- **Checkpoints** — forced approval at decision points

## Complexity-Budget Failures = CHECKPOINT

When the style validator reports "exceeds budget":
1. **Stop** — don't shuffle code to pass
2. **Run `review <file>`** — understand the structural issues
3. **Rethink approach** — move logic to proper layer, use different pattern
4. **Get approval** — if the plan changes, confirm with Jeff

Never add COMPLEXITY or COMPLEXITY-TODO comments without asking Jeff.
