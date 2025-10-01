# Migration Guide: .llm/ → .llm2/

## What Changed

### New Architecture References
- **Architecture Patterns**: Now reference `docs/architecture/` files instead of embedded content
- **Implementation Details**: Reference specific specification phase files (e.g., `specifications/F107-firebase-soc2-vanilla-app/phase2-events.md`)
- **Separation of Concerns**: Clear distinction between reusable patterns and implementation-specific details

### Updated Templates
- **Context**: Updated to include architecture documentation references
- **SOP**: Enhanced with architecture reference guidelines
- **Task Prompts**: Include architecture and implementation context fields
- **Design Templates**: Reference architecture docs for architectural decisions

## How to Use .llm2/

### For Architectural Work
1. Reference the appropriate `docs/architecture/` file for patterns
2. Use specification phase files for implementation details
3. Follow the same daily loop process as before

### For Implementation Work
1. Reference the specific specification phase file
2. Use `docs/architecture/` for context on patterns being implemented
3. Follow the same test-first discipline

### Template Usage
- Use `.llm2/template-for-task-prompt.md` for patch-sized changes
- Use `.llm2/template-for-design-discussion-prompt.md` for ADR-level discussions
- Use `.llm2/template-for-design-decision.md` for final ADR documents
- Use `.llm2/template-for-commit.md` for commit messages

## Architecture Reference Quick Guide

| Concern | Reference File |
|---------|----------------|
| Event Sourcing | `docs/architecture/event-sourcing.md` |
| Queue Processing | `docs/architecture/queue-mechanism.md` |
| Offline-First | `docs/architecture/offline-first.md` |
| Multi-Tenant | `docs/architecture/multi-tenant.md` |
| Billing Integration | `docs/architecture/billing-integration.md` |
| Authentication | `docs/architecture/authentication.md` |
| Data Model | `docs/architecture/data-model.md` |
| Security | `docs/architecture/security.md` |
| Deployment | `docs/architecture/deployment.md` |

## Migration Checklist

- [x] Create `.llm2/` directory structure
- [x] Migrate all templates with updated references
- [x] Update context to include architecture docs
- [x] Update SOP with architecture reference guidelines
- [x] Create migration guide
- [ ] Test new workflow with actual development tasks
- [ ] Validate all references work correctly
- [ ] Remove old `.llm/` directory

## Rollback Plan

If issues arise with `.llm2/`, you can:
1. Continue using `.llm/` for immediate work
2. Fix issues in `.llm2/` based on feedback
3. Gradually migrate to `.llm2/` once stable
4. Remove `.llm/` only after full validation
