# Claude Project Guide

## Core Values

- **Doing it right is better than doing it fast** — Systematic work beats shortcuts always
- **Honesty over agreeability** — Push back on bad ideas with specific technical reasoning
- **Peer relationship** — No hierarchy, no sycophancy; direct feedback expected
- **Stop and ask** — Never guess; clarify unclear requirements immediately
- **Read files only when necessary** — Don't explore without purpose

## Test-Driven Development (Mandatory)

**For ALL features and bugfixes:**
1. **RED**: Write the test first, watch it fail
2. **GREEN**: Write minimal code to make it pass
3. **REFACTOR**: Clean up if needed

**Why this matters:**
- Tests that pass without code changes don't test anything
- Writing tests after guarantees they'll pass (useless)
- Failing first proves the test works

**Never skip this.** If you find yourself writing implementation before tests, stop immediately.

## YAGNI (You Aren't Gonna Need It)

Build what was asked for. Nothing more.

**Don't:**
- Add "nice to have" features
- Build for hypothetical future needs
- Create abstractions before you need them twice
- Add configuration options that weren't requested

**Why:** Every line of code is liability. Unused features create maintenance burden and complexity.

## Prefer Simple, Readable, Maintainable

Clever code is hard to debug. Simple code is easy to understand.

**Guidelines:**
- Obvious over clever
- Readable over compact
- Maintainable over performant (unless performance is the requirement)
- Standard patterns over novel approaches

## Minimize Changes, Reduce Duplication

**Change as little as possible:**
- Smaller diffs = easier review = fewer bugs
- One logical change per commit
- Don't refactor while fixing bugs (separate commits)

**Remove duplication when you see it:**
- Extract common patterns
- But don't abstract prematurely (see YAGNI)

## Naming

Names should describe **purpose**, not implementation or history.

**Avoid:**
- `newUserProcessor` vs `oldUserProcessor` (use purpose: `asyncUserProcessor` vs `syncUserProcessor`)
- `legacyAuth`, `authV2` (describe what makes them different)
- `wrapperFunction`, `helperUtils` (describe what they actually do)
- Abbreviations (except universally known: `id`, `url`, `api`)

**Good names answer:** "What does this do?" or "What is this for?"

## Comments

**Write comments that explain:**
- **What** this code does (especially business logic)
- **Why** decisions were made

**Don't write comments that explain:**
- How the code works (code should be self-explanatory)
- Change history (that's what git is for)
- Implementation details visible in the code

## Debugging Process (Four Phases)

When you encounter a bug, follow this systematic approach:

**Phase 1: Root Cause Investigation**
- Trace the bug backward to find the original trigger
- Add instrumentation/logging when needed
- Find where invalid data originates, not just where it fails

**Phase 2: Pattern Analysis**
- Compare broken behavior against working examples
- Identify what's different
- Look for similar patterns elsewhere in the codebase

**Phase 3: Hypothesis Formation**
- Form ONE specific hypothesis about the cause
- Make it falsifiable
- Don't try multiple things at once

**Phase 4: Minimal Testing & Implementation**
- Test the hypothesis with minimal changes
- Verify the fix before continuing
- Run tests to confirm

**Never:** Guess at fixes, try random changes, or make multiple changes simultaneously.

## Git Usage

**For non-trivial changes:**
- Commit frequently with clear messages
- One logical change per commit
- Use branches for features/experiments
- Keep commits focused and atomic

**Commit messages:**
- First line: Brief summary (50 chars or less)
- Blank line
- Details if needed (wrap at 72 chars)
- Reference issue/spec numbers

## Push Back and Call Out Issues

**If something seems wrong:**
- Say so immediately with specific reasoning
- Don't proceed with bad ideas hoping they'll work
- Better to discuss now than debug later

**If requirements are unclear:**
- Stop and ask for clarification
- Don't guess at intent
- Better to interrupt than build the wrong thing

## Project Standards

### Required Reading
1. **Coding Standards**: `docs/standards/coding-standards.md` — Functional JavaScript patterns, testing format
2. **Architecture Patterns**: `docs/architecture/README.md` — Domain-specific designs (event-sourcing, multi-tenant, etc.)
2. **Commit Format**: `docs/standards/commit-format.md` — Format for git commits

### Key Project Constraints

**Language & Style:**
- JavaScript only (TypeScript forbidden — no syntax, files, or JSDoc types)
- Functional programming (no `class`, `new`, mutation; use `@graffio/functional`)
- One indentation level per function (extract helpers, early returns)
- Pure functions preferred

**Testing:**
- Framework: Node TAP (`test/*.tap.js`)
- Format: Given/When/Then with proper English articles
- Commands: `yarn tap` (all tests), `yarn tap:file <path>` (single test), `yarn tap:integration` (all integration tests)
- Test-first always — start with failing test

**Tooling:**
- Package manager: `yarn` (never `npm`)
- Types: `yarn types:generate` (regenerate tagged types)
- Node: 20.x LTS, ESM modules

### Project Structure

**Workspaces** (`modules/*`):
- `modules/curb-map` — Main app (migrations, infrastructure, app logic)
- `modules/functional` — Functional programming primitives (`@graffio/functional`)
- `modules/design-system` — Design tokens + UI primitives
- `modules/cli-*` — Internal tooling
- `modules/types-generation` — Code generator for Tagged/TaggedSum types

**Specifications**: `specifications/*` drive requirements

**Architecture**: `docs/architecture/` — Reusable patterns (event-sourcing, queue processing, offline-first, multi-tenant, billing integration, authentication, data model, security, deployment)

## Communication Style

- **Tool success**: One line only ("Commit created: abc123")
- **Advice/proposals**: Bullets + `file:line` references, assume domain knowledge
- **Technical issues**: Problem → options → recommendation (one line why)
- **No superlatives** unless genuinely warranted
- **Be brief** — Concise responses, minimal explanation

## Workflow

1. **Simple tasks**: Direct implementation (with test first)
2. **Complex tasks**: Discussion → `/superpowers:brainstorm` → `/superpowers:write-plan` → implement
3. **Always**: Start with failing test (RED/GREEN TDD)
4. **Patch size**: ≤50 LOC across ≤2 modules
5. **Architecture decisions**: Reference `docs/architecture/` patterns

## Working with Superpowers

This project uses [Superpowers](https://github.com/obra/superpowers) for systematic AI-assisted development.

**Key workflows:**
- `/superpowers:brainstorm` — Design refinement through Socratic questioning
- `/superpowers:write-plan` — Create implementation plans
- `/superpowers:execute-plan` — Execute plans in batches with review checkpoints

**Skills activate automatically** when relevant (test-driven development, systematic debugging, verification before completion).
