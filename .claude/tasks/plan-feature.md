# Plan Feature

Use after brainstorming to create a task spec.

## Steps

1. Check episodic memory for prior work on this feature
2. Identify which task templates in `.claude/tasks/` apply
3. **Read each template** and incorporate its steps into the plan
4. Write `current-task.json` (schema below)

## Output Schema

```json
{
  "feature": "Short name",
  "goal": "One sentence - what are we building and why",
  "templates_used": ["add-redux-action.md", "commit-changes.md"],
  "steps": [
    { "step": 1, "action": "Specific action from template or brainstorm", "done": false },
    { "step": 2, "action": "Next specific action", "done": false }
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
- Always include commit step (from `commit-changes.md`) at the end
- If no template exists for a step, note it—we'll create one

## Checkpoints

Identify decision points in the plan that need user approval:
- Type/data decomposition choices
- Library vs custom implementation
- Any step where multiple valid approaches exist

Mark these in steps with `[CHECKPOINT]` prefix. During implementation, use `implementation-checkpoint.md` template at these points.

## Precedent Check

Only ask when introducing something **new** - not for routine additions like new Action variants or selectors.

**Ask first if no codebase precedent for:**
- New architectural pattern or abstraction
- New library/dependency
- New file organization structure
- Language feature not used elsewhere

When flagging: "No precedent for X - should I proceed?" Keep it brief.
