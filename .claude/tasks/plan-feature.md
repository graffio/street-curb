# Plan Feature

Use after brainstorming to create a task spec.

## Steps

1. Identify which task templates in `.claude/tasks/` apply
2. **Read each template** and incorporate its steps into the plan
3. Write `current-task.json` (schema below)
4. Keep plan file (e.g., `~/.claude/plans/*.md`) for reference during implementation

## Output Schema

```json
{
  "feature": "Short name",
  "goal": "One sentence - what are we building and why",
  "templates_used": ["add-redux-action.md", "commit-changes.md"],
  "steps": [
    { "step": 1, "action": "[CHECKPOINT] Specific action needing approval", "done": false },
    { "step": 2, "action": "Specific action from template or brainstorm", "done": false }
  ],
  "verification": [
    "Tests pass",
    "No lint errors"
  ]
}
```

## Rules

- **Inline template steps** - don't reference templates, copy their steps into the plan
- Steps must be specific enough to follow without reading anything else
- **Complexity review first** - if modifying an existing file > 100 lines, run complexity review before planning changes. This reveals budget headroom and simplification opportunities.
- **Validator after each step** - after each implementation step that modifies JS/JSX files, add a step: "Run style validator on changed files, fix violations before proceeding". This keeps violations fresh in context. Don't consolidate these for aesthetics — plans are execution checklists, not documents to read.
- **Intermediate commits** - include `git add` + commit steps after each logical chunk (e.g., after creating types, after adding reducer logic). This triggers the style validator hook.
- Always include final commit step (from `commit-changes.md`) at the end
- If no template exists for a step, note it—we'll create one
- **Keep plan for negotiation** - plan file survives until `record-completion.md`. If design issues arise during implementation, update plan → regenerate `current-task.json`

## Checkpoints

Identify decision points that need user approval:
- Type/data decomposition choices
- Library vs custom implementation
- Any step where multiple valid approaches exist

Mark with `[CHECKPOINT]` prefix in the step's `action` text. During implementation, use `implementation-checkpoint.md` template at these points.

## Precedent Check

Only ask when introducing something **new** - not for routine additions like new Action variants or selectors.

**Ask first if no codebase precedent for:**
- New architectural pattern or abstraction
- New library/dependency
- New file organization structure
- Language feature not used elsewhere

When flagging: "No precedent for X - should I proceed?" Keep it brief.
