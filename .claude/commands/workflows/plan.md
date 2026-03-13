---
name: workflows:plan
description: Generate a task file from a brainstorm document
argument-hint: "[brainstorm file path]"
---

# Plan

Generates a task file with intent-level steps. Claude decides file-level implementation details, style card loading
timing, and commit boundaries. The pre-commit hook and wrap-up review provide quality enforcement.

## Input

<brainstorm_input> #$ARGUMENTS </brainstorm_input>

**If a brainstorm file path:** Read it. Verify it has a settled approach and no open questions.

**If a feature description or empty:** Ask: "Run `/workflows:brainstorm` first — planning requires a brainstorm with
settled decisions."

**If brainstorm has open questions:** Stop. "This brainstorm has open questions — resolve them before planning."

---

## Research

Before generating, search `docs/solutions/` for relevant past solutions:

```
learnings-researcher("Search docs/solutions/ for: {brainstorm topic and scope}")
```

Include relevant findings as context when generating steps — past mistakes, patterns that worked, gotchas.

**If brainstorm scope is narrow and self-contained** (single module, clear approach) — skip research.

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
    "not_building"     : ["Explicit scope exclusions from brainstorm"],
    "integration_tests": ["test/relevant.integration-test.js"],
    "steps"            : [
        {
            "step"            : 1,
            "intent"          : "What this logical unit accomplishes (1-2 sentences)",
            "scope"           : "Which modules/areas are touched — enough for resumption, not file-level prescription",
            "key_constraints" : ["Settled decisions from the brainstorm that Claude might otherwise re-open"],
            "style_cards"     : ["js-module", "test-file"],
            "checkpoint"      : false,
            "acceptance"      : "How to know this step is done (1 sentence)",
            "status"          : "pending",
            "notes"           : ""
        }
    ],
    "verification"     : ["How to confirm the feature works end-to-end"]
}
```

### Step design

Steps are **logical work units**, not file edits. Each step should be roughly one session of work.

- **3-8 steps** for a typical feature. Fewer than 3 means the feature is simple enough to just implement without a plan.
  More than 8 means decompose the brainstorm into smaller features.
- **Intent** describes what Claude is building, not which files to edit. "Build filter resolution pipeline — merge chip
  filters into IR, chip-wins on conflict" not "Edit resolve-chip-filters.js."
- **Scope** names modules and areas, enough that a resuming session can orient itself. Not file lists.
- **Key constraints** — settled decisions from the brainstorm that are relevant to this step. "Use LookupTable, not
  Map", "chip filters win on conflict", etc. Prevents Claude from re-opening decisions the brainstorm already closed.
  Omit if the step has no relevant constraints.
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

### Style card mapping

When populating `style_cards` for a step, use this mapping:

| File pattern      | Style card        |
|-------------------|-------------------|
| `*.jsx`           | `react-component` |
| `**/selectors.js` | `selector`        |
| `*.tap.js`        | `test-file`       |
| Other `*.js`      | `js-module`       |

### Rules that still apply

These aren't generated as separate steps, but Claude must follow them during implementation:

- **Style cards:** Load the relevant card before writing code in that area
- **TDD:** Write failing tests first when introducing new branching logic or business rules. Do NOT write tests for:
  adding entries to lookup tables/registries, filtering/mapping with standard operations, passing new input to existing
  infrastructure, or wiring components to existing selectors.
- **Action tests:** When implementing a new Action variant → write TAP test for dispatch → reducer → new state
- **UI verification:** When a step adds keyboard, focus, or visual interaction → add specific manual verification items
  to the task file's `verification` array
- **Type definitions:** Modify `type-definitions/*.type.js`, never `src/types/*.js`. Run `yarn types:generate-all` after
- **Commit messages:** Use Problem/Solution/Impact format (see `.claude/tasks/commit-changes.md`)
- **Commit at logical boundaries:** Commit when a logical unit is complete, not at arbitrary file-type transitions
- **Complexity review:** When the style validator reports budget failures, run `review <file>` before attempting fixes.
  The review's simplification strategies table turns "budget exceeded" into actionable moves.
- **Complexity debt:** When modifying a file with `// COMPLEXITY:` or `// COMPLEXITY-TODO:` comments → clean them up,
  run the validator, and fix violations or ask before adding new exemptions
- **Step size:** When a step touches >5 files → split before proceeding, grouped by module or concern
- **Precedent:** When about to introduce a new pattern, library, or file organization that doesn't exist in the
  codebase → stop and flag: "No precedent for X — should I proceed?"
- **Scope discipline:** If it's not in a step's scope or intent, don't do it. If you discover necessary adjacent work,
  note it and ask before expanding scope

### Integration tests

Populate the task file's `integration_tests` array during planning by grepping ABOUTME comments in
`test/*.integration-test.js` for affected component or module names. This isn't limited to `.jsx` changes — selector,
reducer, or utility changes can break integration tests too. Wrap-up runs whatever is listed.

---

## Present the Plan

Present the generated task file summary. Include:

- Step count and checkpoint locations
- The `not_building` list (scope boundaries)
- Any precedent concerns (new patterns, new libraries)

Ask: "Plan ready. Should I start implementing?"

No post-generation agent review. The wrap-up full-branch review catches implementation issues against actual code.
