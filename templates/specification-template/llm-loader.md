# LLM Loader for Specification Template

This template provides the structure for creating new specifications.
Use this template when creating new F### specifications.

## Template Structure

### Required Files
- `README.md` - Overview and quick start
- `architecture.md` - Technical architecture (references docs/architecture/)
- `decisions.md` - Decision rationale
- `implementation.md` - Implementation phases
- `tasks.yaml` - Task breakdown

### Optional Files
- `setup.md` - Manual setup instructions
- `testing.md` - Testing strategy
- `migration.md` - Migration procedures

## Usage

1. Copy the `templates/` directory to your new specification
2. Rename files from `.template` to actual names
3. Replace `{{PLACEHOLDERS}}` with actual content
4. Reference `docs/architecture/` for architectural context
5. Follow docs/standards/specification-format/ for structure

## Key Principles

- **Architecture separation**: Reference `docs/architecture/` rather than embedding
- **Decision tracking**: Document rationale in `decisions.md`
- **Task granularity**: Break work into specific, executable tasks
- **Human-readable**: Focus on clarity and context
