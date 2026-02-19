# Workflow Artifacts Consolidation

**Date:** 2026-02-18
**Status:** Brainstorm — approach settled, open questions remain

## What We're Building

Reduce the number of workflow artifacts, eliminate redundant intermediate files, make remaining artifacts searchable, and support parallel agents working on the same repo.

## Why This Matters

1. **Too many artifact types with overlapping purposes.** Brainstorms, specifications, task files, solution docs, architecture docs, and style cards — six categories, several redundant.
2. **Single `current-task.json` blocks parallel work.** Two agents can't plan simultaneously because `/workflows:plan` writes to one hardcoded path.
3. **Knowledge loss at wrap-up.** Brainstorms are deleted but wrap-up doesn't reliably capture their decisions into permanent docs. The "why" disappears.
4. **Architecture docs aren't discoverable.** No frontmatter, no tags — you either know which doc to read or you read all of them.

## Settled Decisions

### Kill specification files

Specifications are an intermediate format between brainstorm and task file. The brainstorm already has decisions, scope, and approach. The task file has execution steps. The spec reformats one into the other — adds no unique value.

- Stop creating files in `specifications/`
- Remove `!specifications/` from `.claudeignore`
- `/workflows:plan` reads the brainstorm directly instead of producing a spec

### Named task files, co-located with brainstorms

Replace single `.claude/current-task.json` with named task files alongside their brainstorm:

```
docs/brainstorms/2026-02-10-require-action-registry-rule.md          (tracked)
docs/brainstorms/2026-02-10-require-action-registry-rule.task.json   (gitignored)
```

- Same name stem, `.task.json` extension
- Add `*.task.json` to `.gitignore` — brainstorm stays tracked (so `@` works), task file is ephemeral
- Multiple task files can coexist — parallel agents, no conflicts
- Session identifies its task file via `@` reference at start

### Task file schema changes

- Remove `plan_source` field (no more specs)
- Add `brainstorm` field pointing to the co-located brainstorm doc
- Rest of schema (steps, style_card, verification, integration_tests) unchanged

### Brainstorms: tracked, then absorbed and deleted at wrap-up

Brainstorms stay in git during active work (so `@` finds them). At wrap-up:

1. Brainstorm decisions get absorbed into solution doc and/or architecture doc
2. Brainstorm file is deleted
3. Task file is deleted

### Architecture docs: add YAML frontmatter

Same discoverability pattern as solution docs:

```yaml
---
title: Keyboard System
covers: [ActionRegistry, DEFAULT_BINDINGS, key dispatch, LIFO resolution]
module: modules/keymap, modules/quicken-web-app
---
```

Enables `grep -l "ActionRegistry" docs/architecture/*.md` — same search pattern as solution docs.

### Don't use built-in EnterPlanMode

Claude Code's built-in plan mode is redundant with `/workflows:plan`. Don't use it. If it creates files, they're noise.

## Files That Need Changes

8 files reference `current-task.json` — all need updating:

| File | Change |
|------|--------|
| `CLAUDE.md` | "Follow your active task file" instead of "follow current-task.json exactly" |
| `.claude/README.md` | Update schema docs, resume command, key files table |
| `.claude/conventions.md` | Update style_card enforcement references |
| `.claude/workflow.md` | Update task execution pointer |
| `.claude/commands/workflows/plan.md` | Rewrite: take brainstorm name, write co-located `.task.json`, no specs |
| `.claude/commands/workflows/wrap-up.md` | Rewrite: identify task file, absorption rules, delete both files |
| `docs/architecture/integration-testing.md` | Update integration_tests reference |
| `docs/solutions/workflow-issues/generation-rules-calibration-System-20260207.md` | Update references |

Additional:
- Add `*.task.json` to `.gitignore`
- Remove `!specifications/` from `.claudeignore`

### Absorption rules: declare upfront, validate at wrap-up

Every brainstorm gets a `Knowledge Destination` section declaring where its content goes after implementation.

| Destination | When | What gets written |
|-------------|------|-------------------|
| `solution:` path (new/update) | Brainstorm solved a **problem with symptoms** — bug, perf issue, confusing behavior | Problem, Root Cause, Solution, Prevention |
| `architecture:` path (update) | Brainstorm **changes how a subsystem works** — new data flow, new component relationships | Update affected doc to reflect new state |
| `decisions:` append | **Isolated decision** that doesn't warrant a full doc | 3-line entry: Context / Decision / Why |
| `none` | Knowledge lives in the code — no symptoms, no pattern, no architecture change | Nothing — just delete the brainstorm |

**At wrap-up:**
1. Execute the declared destinations (mechanical — follow the brainstorm's instructions)
2. Check if implementation revealed gotchas not in the brainstorm — if yes, ask whether to expand the declared destination or add a new one
3. Delete brainstorm and task file

### Solution doc format: front-load actionable content

Current order optimizes for storytelling. New order optimizes for consumption — what I need most comes first:

```
YAML frontmatter (symptoms, tags — discovery)
## Solution        — what to do (read 90% of the time)
## Prevention      — what to avoid (read often)
## Key Decisions   — why this approach (read sometimes)
## Problem         — background (read on first encounter only)
## Root Cause      — deep understanding (read rarely)
```

Target 50-80 lines per doc. Cut code examples to minimum needed.

### Kill pattern-catalog

`.claude/pattern-catalog/` has 4 files (action, lookup-table, selector-composition, tagged-sum). The trigger table in CLAUDE.md is the valuable part — it reminds me to use the right pattern. The detailed reference docs behind it are rarely needed; the codebase demonstrates the patterns.

- Delete `.claude/pattern-catalog/` directory
- Keep CLAUDE.md trigger table, just drop the file links — the pattern *name* is the instruction
- Pattern-reference solution docs (dispatch-intent-pattern-migration, filter-chip-selector-extraction, handler-per-file-dispatch-pattern) — assess individually: delete if style card already covers the content, otherwise condense into the style card

This reduces absorption destinations to 4: `solution`, `architecture`, `decisions`, `none`.

### Brainstorm template: required sections

For `/workflows:plan` to mechanically generate a task file from a brainstorm, brainstorms need consistent structure:

```markdown
# Title
**Date / Status**
## What We're Building       — scope summary
## Why This Matters           — problem statement
## Settled Approach           — key decisions, per-component changes
## Knowledge Destination      — where content goes at wrap-up
## Open Questions             — must be empty before planning
```

## Open Questions

1. **Pattern-reference solution docs.** 3 solution docs are really pattern references (dispatch-intent, filter-chip-selector, handler-per-file-dispatch). Assess each: delete if covered by style cards, otherwise condense key content into the relevant style card.

2. **Architecture doc frontmatter schema.** Solution docs use `symptoms` — architecture docs don't have symptoms. What fields make architecture docs discoverable? Proposed: `title`, `covers` (key concepts), `module`.

## Jeff TODOs (not Claude work)

- Resolve orphan docs at `docs/` root: `tagged-types.md`, `bootstrap-automation-overview.md`, `GCP-security-history.md`
- Assess `docs/runbooks/` and `docs/soc2-compliance/` for staleness

## Scope

- Rewrite `/workflows:plan` — brainstorm-to-task-file pipeline, no specs
- Rewrite `/workflows:wrap-up` — absorption rules, named file cleanup
- Update all 8 `current-task.json` references
- Add YAML frontmatter to architecture docs
- Update `.gitignore` and `.claudeignore`
- Kill `specifications/` folder
- Kill `.claude/pattern-catalog/` — condense useful content into style cards
- Audit pattern-reference solution docs — delete or absorb into style cards
- Reformat existing solution docs — front-load Solution/Prevention sections

## Related

- `less-react` brainstorm — active work that will be first user of new workflow
- `require-action-registry-rule` brainstorm — queued work waiting for named task file support
