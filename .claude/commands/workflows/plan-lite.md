---
name: workflows:plan-lite
description: Generate a lightweight task file from a brainstorm document — coarser steps, less ceremony
argument-hint: "[brainstorm file path]"
---

# Plan (Lite)

Experimental alternative to `/workflows:plan`. Generates a task file with fewer, coarser steps. Claude decides
file-level implementation details, style card loading timing, and commit boundaries. The pre-commit hook and wrap-up
full-branch review provide quality enforcement.

**Use `/workflows:plan` instead when:** the feature is large (>3 sessions of work), touches unfamiliar parts of the
codebase, or involves architectural decisions you want prescribed in advance.

## Input

<brainstorm_input> #$ARGUMENTS </brainstorm_input>

**If a brainstorm file path:** Read it. Verify it has a settled approach and no open questions.

**If a feature description or empty:** Ask: "Run `/workflows:brainstorm` first — planning requires a brainstorm with
settled decisions."

**If brainstorm has open questions:** Stop. "This brainstorm has open questions — resolve them before planning."

---

## Generate Task File

Read `.claude/preferences.md` and the brainstorm's Settled Approach before generating.

**Output path:** `docs/brainstorms/{brainstorm-name}.task.json`

### Schema

```json
{
    "feature"          : "Short name",
    "goal"             : "One sentence — what and why",
    "brainstorm"       : "docs/brainstorms/{name}.md",
    "plan_type"        : "lite",
    "not_building"     : ["Explicit scope exclusions from brainstorm"],
    "integration_tests": ["test/relevant.integration-test.js"],
    "steps"            : [
        {
            "step"        : 1,
            "intent"      : "What this logical unit accomplishes (1-2 sentences)",
            "scope"       : "Which modules/areas are touched — enough for resumption, not file-level prescription",
            "style_cards" : ["js-module", "test-file"],
            "checkpoint"  : false,
            "acceptance"  : "How to know this step is done (1 sentence)",
            "status"      : "pending",
            "notes"       : ""
        }
    ],
    "verification"     : ["How to confirm the feature works end-to-end"]
}
```

### Step design

Steps are **logical work units**, not file edits. Each step should be roughly one session of work.

- **3-8 steps** for a typical feature. Fewer than 3 means the feature is simple enough to just implement without a plan.
  More than 8 means consider using `/workflows:plan` instead.
- **Intent** describes what Claude is building, not which files to edit. "Build filter resolution pipeline — merge chip
  filters into IR, chip-wins on conflict" not "Edit resolve-chip-filters.js."
- **Scope** names modules and areas, enough that a resuming session can orient itself. Not file lists.
- **Style cards** lists which cards are relevant to this step. Claude loads them when it starts working on that area.
- **Acceptance** is one sentence describing how to verify the step is done. Prefer testable criteria.
- **Notes** — Claude fills this in during and after implementation. Record deviations, surprises, and in-progress
  breadcrumbs (for resumption). "Started merge logic, 3 of 5 variant tests passing" is useful. Absence of notes on a
  completed step is a rule violation.

### What steps do NOT contain

- File-level edit instructions
- Mechanical review/validator/commit steps (pre-commit hook handles enforcement)
- Code snippets or function signatures
- Prescribed implementation order within a step

### Checkpoints

Mark `"checkpoint": true` when:

- Type/data decomposition choices need approval
- Multiple valid approaches exist and the brainstorm didn't settle it
- The next step depends on choices made in this one
- Introducing a new pattern or library

Claude **must stop and ask** after completing a checkpoint step before proceeding.

### Rules that still apply

These aren't generated as separate steps, but Claude must follow them during implementation:

- **Style cards:** Load the relevant card before writing code in that area
- **TDD:** Write failing tests first when introducing new branching logic or business rules
- **Type definitions:** Modify `type-definitions/*.type.js`, never `src/types/*.js`. Run `yarn types:generate-all` after
- **Integration tests:** If touching `.jsx` files, discover and run relevant integration tests
- **Commit messages:** Use Problem/Solution/Impact format (see `.claude/tasks/commit-changes.md`)
- **Commit at logical boundaries:** Commit when a logical unit is complete, not at arbitrary file-type transitions
- **Scope discipline:** If it's not in a step's scope or intent, don't do it. If you discover necessary adjacent work,
  note it and ask before expanding scope

### Integration tests

If any step's scope includes `.jsx` files in `quicken-web-app/src/`:

- Populate `integration_tests` array by grepping ABOUTME comments in `test/*.integration-test.js` for affected
  component names
- The last step should include running these tests in its acceptance criteria

---

## Present the Plan

Present the generated task file summary. Include:

- Step count and checkpoint locations
- The `not_building` list (scope boundaries)
- Any precedent concerns (new patterns, new libraries)

Ask: "Plan ready. Should I start implementing?"

No post-generation agent review. The wrap-up full-branch review catches implementation issues against actual code.
