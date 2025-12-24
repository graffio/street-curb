# Implementation Checkpoint

Use at design decision points during implementation to get user approval before proceeding.

## When to Use

- Before choosing between libraries vs custom implementation
- Before deciding on type/data decomposition
- When making a choice without explicit guidance in conventions.md or preferences.md
- After completing a logical unit, before continuing to the next
- When unsure if your approach matches Jeff's style

## Steps

1. **Reread** `.claude/conventions.md`
2. **Reread** `.claude/preferences.md`
3. **State the decision point** clearly
4. **Present options** with trade-offs
5. **Wait for approval** before proceeding

## Output Format

```
CHECKPOINT: [brief description of decision point]

Context: [what you've done so far]

Options:
A) [option] - [trade-off]
B) [option] - [trade-off]

Recommendation: [X] because [reason]

Awaiting approval before proceeding.
```

## Example

```
CHECKPOINT: Data structure for column configurations

Context: Implementing table column management. Need to store column visibility, width, and order.

Options:
A) Single flat object with columnId keys - Simple, but order requires separate array
B) LookupTable of ColumnDescriptor Tagged types - More structured, order in each descriptor
C) Array of plain objects - Preserves order, but loses O(1) lookup

Recommendation: B because it aligns with existing patterns (TableLayout uses LookupTable) and Tagged types provide validation.

Awaiting approval before proceeding.
```

## Rules

- Don't skip checkpoints to "save time" - rework is more expensive
- If the answer seems obvious, state it but still wait for confirmation
- Quote relevant sections from conventions.md or preferences.md in your reasoning
