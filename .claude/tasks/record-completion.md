# Record Completion

Run after finishing a feature/task.

## Steps

1. **Architectural decisions?** → Add to project-local docs:
   - `modules/curb-map/docs/architecture/` for curb-map
   - `modules/quicken-web-app/docs/architecture/` for quicken-web-app
   - `docs/architecture/` for shared infrastructure patterns
2. **Quick decisions?** → Append to project-local `docs/decisions.md`:
   - "We chose X because Y" that doesn't warrant an architecture doc
   - Format: `### YYYY-MM-DD: Title` + Context/Decision/Why (1 sentence each)
3. **Outcome summary** → Append to `specifications/completed-specifications.md`
4. **Delete current-task.json**
5. **Delete plan file** (e.g., `~/.claude/plans/*.md` used for this feature)

## Outcome Format

```markdown
## [project] Feature Name (YYYY-MM-DD)
**Purpose:** One sentence

- Bullet points of what was done
- Key implementation details
- Deferred items (if any)
```

**Project tags:** `[curb-map]`, `[quicken-web-app]`, `[infrastructure]` (shared tooling)

## Rules

- Keep outcome summaries brief (10-20 lines)
- Architecture docs are reusable patterns; outcomes are historical record
- Don't duplicate—reference architecture docs from outcomes if needed
