# LLM Loader for Specification Template

This template provides the structure for creating new specifications.
Use this template when creating new F### specifications.

## Template Structure

### Required Files
- `background.md` — Overview, canonical references, phase outline
- `tasks.yaml` — Executable task list (implementation, validation, tests)

### Optional Files (copy only if you truly need them)
- `meta.yaml` — Specification metadata for automation hooks
- `llm-loader.md` — Extra context loader when background/tasks are insufficient

## Usage

1. Copy `background.md.template` → `background.md` and `tasks.yaml.template` → `tasks.yaml`.
2. Replace every `{{PLACEHOLDER}}` with concrete project data (spec id, doc references, task details).
3. Reference `docs/architecture/…` for deep technical content instead of embedding long code blocks.
4. Keep implementation steps, validation, and test plans co-located inside each task.
5. Add optional files only when a spec truly needs them (e.g., automation metadata).

**Important**: Do NOT copy unused template files - only copy what you will actually use and fill out.

## Key Principles

- **Architecture separation**: Reference `docs/architecture/` rather than embedding
- **Decision tracking**: Document rationale in `decisions.md`
- **Task granularity**: Break work into specific, executable tasks
- **Human-readable**: Focus on clarity and context
