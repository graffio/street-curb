---
name: audit-claude-config
description: Audit .claude/ directory for inconsistencies, broken references, stale content, and potential improvements. Run periodically to keep Claude configuration healthy.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

# Audit Claude Configuration

Systematic review of `.claude/` for health issues. Run every few weeks or after major changes.

## Checks

### 1. Broken File References

Scan all `.claude/` markdown files for file paths and verify they exist.

**What to grep for:**
- `api-cheatsheets/*.md` references
- `style-cards/*.md` references
- `docs/solutions/` paths
- `modules/` paths
- Script paths (`.sh`, `.py`, `.js`)

```
Grep: pattern="\\.claude/|docs/|modules/" path=.claude/ glob="*.md" output_mode=content
```

For each path found, verify the target exists. Report missing files.

### 2. Contradictions Between Files

Check for conflicting guidance across tiers:

**CLAUDE.md vs style cards:**
- Hook rules in CLAUDE.md should match style card guidance
- Import rules (Radix direct vs facade) should be consistent
- Pattern triggers should point to files that exist

**Style cards vs code cheatsheets:**
- Code examples in cheatsheets should follow current style card rules
- No examples showing banned patterns (e.g., useEffect in components)

### 3. Stale Content

**Deleted modules:**
```
Grep: pattern="design-system|@graffio/design-system" path=.claude/ glob="*.md"
```
Flag any references to modules that no longer exist in the workspace.

**Obsolete technology references:**
```
Grep: pattern="Rails|ActiveRecord|ruby|Sidekiq|hotwire|turbo|stimulus" path=.claude/ glob="*.md" -i=true
```
This is a JavaScript-only monorepo. Flag any Rails/Ruby references.

**Dead command/skill references:**
```
Grep: pattern="/deepen-plan|/doc-fix|skill-creator" path=.claude/ glob="*.md"
```
Flag references to commands or skills that don't exist.

### 4. Agent Consistency

For each agent in `.claude/agents/`:
- **Frontmatter fields:** Check `name`, `description`, `model` are present
- **Description length:** Flag descriptions over 200 chars (token cost in every session)
- **Model setting:** Note any using non-`inherit` model (intentional? document why)
- **Technology match:** Body should reference JavaScript/React/Redux, not Rails/Ruby

### 5. Settings Cruft

**settings.local.json:**
- Flag permission rules containing `__NEW_LINE_` (accidental saves)
- Flag permission rules containing multiline strings or `EOF`
- Flag permission rules over 100 chars (likely accidental)
- Check for duplicates

**settings.json:**
- Verify hooks reference scripts that exist
- Check defaultMode is intentional

### 6. Schema Alignment

**compound-docs schema vs actual docs:**
- Read a sample of `docs/solutions/**/*.md` frontmatter
- Check if `component` and `problem_type` values match schema.yaml enums
- Flag docs using values not in the schema

### 7. Brainstorm Cross-Reference

**Unimplemented decisions:**
- Read `docs/brainstorms/*.md`
- For each "Key Decision" or "Decision Made", check if `.claude/` files reflect it
- Flag decisions that haven't been propagated to guidance files

**Completed brainstorms:**
- If a brainstorm's decisions are fully implemented, note it for cleanup

### 8. Opus 4.6 Optimization Opportunities

Flag artifacts that were written for earlier models and may be unnecessarily verbose:
- Agent body text over 100 lines (earlier models needed step-by-step; Opus 4.6 doesn't)
- Task files over 150 lines that duplicate agent capabilities
- Pointer files that add indirection without value

## Output Format

```markdown
## .claude/ Audit Results

### Broken References
- [file:line] → [missing target]

### Contradictions
- [file A] says X, [file B] says Y

### Stale Content
- [file] references [deleted thing]

### Agent Issues
- [agent] — [issue]

### Settings Cruft
- [file:line] — [garbage rule]

### Schema Drift
- [doc file] uses [value] not in schema

### Unimplemented Brainstorm Decisions
- [brainstorm] decided [X], but [guidance file] still says [Y]

### Optimization Opportunities
- [file] could be simplified for Opus 4.6

### Summary
- X broken references, Y contradictions, Z stale items
- Recommended actions (prioritized)
```
