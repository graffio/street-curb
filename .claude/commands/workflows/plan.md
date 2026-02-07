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

Write a plan file in `specifications/`:
- Filename: `specifications/{descriptive-name}.md` (kebab-case, 3-5 words)
- Content: problem statement, proposed approach, acceptance criteria, key decisions

Keep it concise. The plan is a working document, not a formal spec.

**Present plan to user for review.**

**[CHECKPOINT]** — User reviews/edits the plan before proceeding.

---

## Step 3: Generate current-task.json

Read `.claude/preferences.md` before generating. Then produce `current-task.json` using the schema and
generation rules below.

### Schema

```json
{
    "feature": "Short name",
    "goal": "One sentence — what and why",
    "plan_source": "specifications/{plan-file}.md",
    "templates_used": ["commit-changes.md"],
    "steps": [
        {
            "step": 1,
            "action": "Specific action description",
            "style_card": "utility-module",
            "done": false
        }
    ],
    "verification": ["How to confirm the feature works"]
}
```

### Required: style_card field

Every implementation step that creates or modifies a file MUST include a `style_card` field.

| File pattern        | style_card        |
|---------------------|-------------------|
| `*.jsx`             | `react-component` |
| `selectors/**/*.js` | `selector`        |
| `*.tap.js`          | `test-file`       |
| Other `*.js`        | `utility-module`  |

Non-code steps (commits, reviews, checkpoints) do not need `style_card`.

**When executing a step with `style_card`:** Read `.claude/style-cards/{style_card}.md` BEFORE writing code.

### Generation Rules

These rules make JSON generation mechanical, not ad-hoc. Apply all of them:

| Rule | Condition | What to generate |
|------|-----------|------------------|
| **Style card** | Every step that creates/modifies code | `style_card` field based on file type mapping above |
| **Review agents** | Before every `git commit` step (unconditional) | Step: "Spawn jeff-js-reviewer and code-simplicity-reviewer on staged changes. Fix blocking issues." |
| **Commit** | After each logical chunk (unconditional) | `git add` + commit step using commit-changes.md format |
| **Checkpoint** | At decision points (judgment) | `[CHECKPOINT]` prefix on step action |
| **Complexity review** | Before modifying file >100 lines | Step: "Run complexity review on {file}" |
| **Style-compliance debt** | When touching modules listed in style-compliance-debt.md | Step: "Review known debt in {module} — see specifications/style-compliance-debt.md" |
| **Learnings** | When a previously-solved domain is involved | "Related: {solution path} — {summary}" in plan markdown |

### Step Rules

- Steps must be specific enough to follow without reading anything else
- **Validator after each implementation step** — add: "Run style validator on changed files, fix violations"
- **Intermediate commits** — after each logical chunk, not batched to the end
- Always include final commit step at the end
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

Present the generated current-task.json summary and ask:
"Plan and task spec ready. Should I start implementing?"

Keep plan file in specifications/ for reference during implementation.
