---
name: workflows:plan
description: Research, plan, and generate current-task.json for a feature or fix
argument-hint: "[feature description, spec file path, or brief idea]"
---

# Plan

Transform a feature description, spec file, or idea into a plan and then into `current-task.json`.

## Feature Description

<feature_description> #$ARGUMENTS </feature_description>

**If empty, ask:** "What would you like to plan?"

Do not proceed until you have a clear feature description.

---

## Step 1: Research (scales to input)

**If input is vague or exploratory** — run parallel research agents:

- Task learnings-researcher("Search docs/solutions/ for: {feature_description}")
- Task repo-research-analyst("Find existing patterns and code for: {feature_description}")

**If input is a detailed spec file** — read it. Skip or go light on external research.

**Always check:** Does `specifications/style-compliance-debt.md` list any modules this work will touch?
If yes, note the debt and affected files — this feeds into the generation rules.

Consolidate findings:

- Relevant file paths from codebase
- Institutional learnings from docs/solutions/ (include as "Related: [path] — [summary]")
- Style-compliance debt in affected modules
- Existing patterns to follow

---

## Step 2: Produce Plan

**If the spec already contains approach, acceptance criteria, and key decisions** — use it as the plan. Present it to
the user and skip to Step 3.

**Otherwise** — write a plan file in `specifications/`:

- Filename: `specifications/{descriptive-name}.md` (kebab-case, 3-5 words)
- Content: problem statement, proposed approach, acceptance criteria, key decisions
- Keep it concise. The plan is a working document, not a formal spec.

**Present plan to user for review.**

**[CHECKPOINT]** — User reviews/edits the plan before proceeding.

---

## Step 3: Generate current-task.json

Read `.claude/preferences.md` before generating. Then produce `current-task.json` using the schema and
generation rules below.

### Schema

```json
{
    "feature"       : "Short name",
    "goal"          : "One sentence — what and why",
    "plan_source"   : "specifications/{plan-file}.md",
    "templates_used": ["commit-changes.md"],
    "steps"         : [
        {
            "step"      : 1,
            "action"    : "Specific action description",
            "style_card": "utility-module",
            "done"      : false
        }
    ],
    "verification"  : ["How to confirm the feature works"]
}
```

### Required: style_card field

Every implementation step that creates or modifies a file MUST include a `style_card` field.

| File pattern      | style_card        |
|-------------------|-------------------|
| `*.jsx`           | `react-component` |
| `**/selectors.js` | `selector`        |
| `*.tap.js`        | `test-file`       |
| Other `*.js`      | `utility-module`  |

Non-code steps (commits, reviews, checkpoints) do not need `style_card`.

**When executing a step with `style_card`:** Read `.claude/style-cards/{style_card}.md` BEFORE writing code.

### Generation Rules

These rules make JSON generation mechanical, not ad-hoc. Apply all of them:

| Rule                      | Condition                                                                                            | What to generate                                                                                                                                                                                                                                                                               |
|---------------------------|------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Style card**            | Every step that creates/modifies code                                                                | `style_card` field based on file type mapping above                                                                                                                                                                                                                                            |
| **Review agents**         | Before every `git commit` step (unconditional)                                                       | Step: "Spawn jeff-js-reviewer and code-simplicity-reviewer on staged changes. Fix blocking issues."                                                                                                                                                                                            |
| **Commit**                | When implementation steps transition to a different `style_card` value, and at the end               | Insert review + `git add` + commit steps at each `style_card` boundary. Use commit-changes.md format.                                                                                                                                                                                          |
| **Checkpoint**            | At decision points (judgment)                                                                        | `[CHECKPOINT]` prefix on step action                                                                                                                                                                                                                                                           |
| **Complexity review**     | Before modifying any existing file (unconditional)                                                   | Step: "[CHECKPOINT] Run complexity review on {file}. Report style card violations found. Wait for approval before proceeding."                                                                                                                                                                 |
| **Style-compliance debt** | When touching modules listed in style-compliance-debt.md                                             | Step: "Review known debt in {module} — see specifications/style-compliance-debt.md"                                                                                                                                                                                                            |
| **TDD step**              | Implementation introduces NEW branching logic or business rules that don't exist yet in the codebase | Step: "Write failing test for {behavior}" with `style_card: test-file`. Do NOT generate test steps for: adding entries to lookup tables/registries, filtering/mapping data with standard operations, passing new input to existing infrastructure, or wiring components to existing selectors. |
| **Action test**           | Step introduces a new Action variant                                                                 | Step: "Write TAP test for {Action} round-trip (dispatch → reducer → new state)" with `style_card: test-file`                                                                                                                                                                                   |
| **UI verification**       | Step adds keyboard, focus, or visual interaction                                                     | Add specific manual verification items to `verification` list describing expected browser behavior                                                                                                                                                                                             |
| **Learnings**             | When a previously-solved domain is involved                                                          | "Related: {solution path} — {summary}" in plan markdown                                                                                                                                                                                                                                        |

### Step Rules

- Steps must be specific enough to follow without reading anything else
- **Validator after each implementation step** — add: "Run style validator on changed files, fix violations"
- **Commit at style_card boundaries** — when steps transition from one `style_card` to another, insert review + commit
  before continuing. Always include a final commit at the end.
- Mark decision points with `[CHECKPOINT]` prefix

### Checkpoint Identification

Add `[CHECKPOINT]` when:

- Type/data decomposition choices
- Library vs custom implementation
- Multiple valid approaches exist
- Significant plan changes needed

### Precedent Check

Only flag when introducing something genuinely new:

- New architectural pattern or abstraction
- New library/dependency
- New file organization structure

"No precedent for X — should I proceed?"

---

## Post-Generation

Before presenting the plan, run review agents in parallel (unconditional):

- Spawn **architecture-strategist** — review the plan for architectural concerns, scope, and pattern choices
- Spawn **code-simplicity-reviewer** — review the plan for over-engineering, unnecessary steps, and YAGNI violations

Incorporate blocking feedback into the plan before presenting.

Present the generated current-task.json summary and ask:
"Plan and task spec ready. Should I start implementing?"

Keep plan file in specifications/ for reference during implementation.
