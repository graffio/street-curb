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
