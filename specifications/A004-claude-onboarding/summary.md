# Claude Session Onboarding

**Date:** 2025.07.27  
**Purpose:** Standard onboarding instructions for new Claude sessions

## Essential Reading Order
1. **@A001-coding-standards/implementation.md** - Core development standards
2. **@A002-agent-workflow-patterns/implementation.md** - Three-agent workflow system
3. **@A006-specification-standards/implementation.md** - Documentation structure

## Critical Constraints
- **Tools**: Use `yarn` not `npm`, `tap` not `node test`
- **Style**: Functional JavaScript (no classes, single indentation level)
- **Workflow**: Use three-agent sequence: tech-lead-complexity-reducer → tdd-implementer → code-reviewer
- **Testing**: No tests needed for purely visual UI changes
- **Commits**: Follow format in @A005-commit-format/

## Project Context
React/Redux curb management application for street data collection. Components:
- **SegmentedCurbEditor**: Visual drag-drop interface
- **CurbTable**: Mobile-friendly table editor  
- **Redux store**: Mathematical invariant enforcement

## Current Architecture
- Functional programming with early returns and guard clauses
- Redux for all state management
- Mathematical invariant: `sum(segments.length) + unknownRemaining = blockfaceLength`
- Mobile-first responsive design

## Getting Started
1. Review current git status and recent commits
2. Check @F### specs for active work
3. Use appropriate agent for next task type
4. Follow commit standards when changes are complete