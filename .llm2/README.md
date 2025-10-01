# .llm2/ - Daily Operations Workflow

This directory contains the updated daily operations workflow for the graffio-monorepo, designed to work with the new architecture documentation structure.

## Quick Start

1. **Read the SOP**: Start with `sop.md` for the daily operating procedure
2. **Use Templates**: Fill out the appropriate template for your task
3. **Reference Architecture**: Use `docs/architecture/` files for architectural context
4. **Follow Test-First**: Always start with a failing test

## Files

### Core Workflow
- `sop.md` - Standard Operating Procedure for daily development
- `context-for-llm.md` - Context bundle for LLM prompts
- `migration-guide.md` - Guide for migrating from `.llm/` to `.llm2/`

### Templates
- `template-for-task-prompt.md` - For patch-sized changes
- `template-for-design-discussion-prompt.md` - For ADR-level discussions
- `template-for-design-decision.md` - For final ADR documents
- `template-for-commit.md` - For commit messages

### Prompts
- `prompts/` - Directory for storing prompt transcripts and records

## Architecture Integration

This workflow is designed to work with the new architecture documentation structure:

- **`docs/architecture/`** - Reusable architectural patterns
- **`specifications/`** - Implementation-specific details
- **Clear separation** between patterns and implementation

## Key Improvements Over .llm/

1. **Architecture References**: Clear guidance on when to reference architecture docs
2. **Implementation Context**: Better separation between patterns and implementation
3. **Updated Templates**: All templates reference the new structure
4. **Migration Support**: Clear migration path from the old workflow

## Usage Examples

### For a New Feature
1. Check if it involves architectural patterns → reference `docs/architecture/`
2. Check if it's implementation-specific → reference specification phase files
3. Use `template-for-task-prompt.md` for patch-sized changes
4. Use `template-for-design-discussion-prompt.md` for larger changes

### For Bug Fixes
1. Use `template-for-task-prompt.md`
2. Reference relevant architecture docs if the bug involves patterns
3. Reference specification files if the bug is implementation-specific

### For Architectural Decisions
1. Use `template-for-design-discussion-prompt.md`
2. Reference relevant `docs/architecture/` files
3. Consider impact on other specifications

## Migration from .llm/

See `migration-guide.md` for detailed migration instructions. The old `.llm/` directory remains available during the transition period.
