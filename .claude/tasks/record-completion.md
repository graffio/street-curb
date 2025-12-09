# Record Completion

Run after finishing a feature/task.

## Steps

1. **Architectural decisions?** → Add to `docs/architecture/` (patterns, rationale)
2. **Outcome summary** → Append to `specifications/completed-specifications.md`
3. **Delete current-task.json**

## Outcome Format

```markdown
## YYYY-MM-DD - Feature Name
**Purpose:** One sentence

- Bullet points of what was done
- Key implementation details
- Deferred items (if any)
```

## Rules

- Keep outcome summaries brief (10-20 lines)
- Architecture docs are reusable patterns; outcomes are historical record
- Don't duplicate—reference architecture docs from outcomes if needed
