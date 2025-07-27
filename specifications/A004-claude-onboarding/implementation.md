# Claude Session Onboarding Implementation

**Date:** 2025.07.27  
**Purpose:** Detailed onboarding checklist and template

## New Session Template

```
I'm working on a React/Redux curb management application. Please read these key specifications to understand the project:

1. **Coding Standards**: @A001-coding-standards/implementation.md
2. **Agent Workflow**: @A002-agent-workflow-patterns/implementation.md  
3. **Onboarding Guide**: @A004-claude-onboarding/summary.md

Key constraints:
- Use `yarn` not `npm`, `tap` not `node test`
- Follow functional JavaScript style (no classes, single indentation level)
- Use the three-agent workflow: tech-lead-complexity-reducer → tdd-implementer → code-reviewer
- No tests needed for purely visual UI changes

Current status: [INSERT CURRENT PROJECT STATUS]

Please start by [INSERT SPECIFIC NEXT ACTION].
```

## Verification Checklist

Before starting work, new Claude session should confirm:

- [ ] Read coding standards and understands functional style requirements
- [ ] Understands three-agent workflow pattern
- [ ] Knows to use `yarn` and `tap` commands
- [ ] Understands when tests are/aren't needed
- [ ] Has reviewed current git status
- [ ] Knows current feature being worked on
- [ ] Has appropriate next action identified

## Common Issues to Avoid

- **Tool Usage**: Never suggest `npm` or `node test` - always `yarn` and `tap`
- **Code Style**: No classes, no nested indentation, use early returns
- **Agent Usage**: Don't skip the three-agent workflow for significant changes
- **Testing**: Don't create tests for visual-only changes
- **Commits**: Follow the established commit message format

## Project-Specific Context

### Key Files
- `src/components/SegmentedCurbEditor.jsx` - Main visual editor
- `src/components/CurbTable.jsx` - Mobile table interface
- `src/store/curbStore.js` - Redux state management
- `prompts/` - Agent definitions

### Mathematical Invariant
All operations must preserve: `blockfaceLength = sum(segments.length) + unknownRemaining`

### Testing Strategy
- Use existing tap tests for business logic
- No tests for pure UI/styling changes
- Focus on mathematical invariant preservation