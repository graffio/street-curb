# Repository Guidelines

## A001 Compliance Highlights
- Review `@specifications/A001-coding-standards/llm-loader.md` before touching code; follow the must-level rules.
- Stay purely functional: avoid `class`, `new`, or mutation; reach for helpers in `@functional` modules.
- Keep the stack JavaScript-only; TypeScript syntax, `.ts/.tsx` files, and JSDoc typing are rejected.
- Cap each function at one indentation level and add Hindley-Milner `@sig` annotations to 5+ line functions.
- TAP specs must use Given/When/Then sentences with articles; mirror the examples in `tests.yaml`.

## Project Structure & Module Organization
- Packages live in `modules/*` with `src/` for code and `test/` for TAP suites sharing folder names.
- Shared primitives are in `modules/functional`; design tokens in `modules/design-system`.
- CLI tooling resides in `modules/cli-*`; generated types land in each module's `type-definitions/`.
- Long-form references belong in `docs/`; agent prompts in `prompts/`; specs like A001 live in `specifications/`.

## Build, Test, and Development Commands
- `yarn types:generate` rebuilds runtime type definitions from workspace specs.
- `yarn types:watch` monitors schema edits during iterative agent or model work.
- `yarn tap` runs every workspace suite through `bash/run-tap.sh`.
- `yarn workspace <name> tap` targets one package; `yarn clean` resets all `node_modules`.

## Coding Style & Naming Principles
- Honor `must`, `should`, and `avoid` severities in `logic.yaml`; justify any `should` deviations in PR notes.
- ESM modules with single export statements at the bottom; prefer descriptive named exports over default.
- Format with 4-space indentation, single quotes, minimal arrow syntax, and 120 character max lines.
- Scripts use kebab-case; React-like components use PascalCase; TAP tests end with `.tap.js`.

## Testing Workflow
- Co-locate TAP tests under `test/*.tap.js`; make fixtures deterministic and side-effect free.
- Given/When/Then hierarchy is required; keep prose natural and include articles per A001 guidance.
- Cover runtime validation paths and boundary checks alongside pure function branches.
- Stub Firebase or other externals inside the owning module's helpers.

## Commit & PR Expectations
- Write imperative subjects under ~72 chars and expand context in the body with bullets when needed.
- Reference touched workspaces inline (e.g., `modules/curb-map/migrations/...`) and cite spec IDs guiding choices.
- Document validation steps (`yarn tap`, schema diffs) and description any accepted `should`-level deviations.
- Attach screenshots or logs for UX or migration updates; list residual risks explicitly.

## Agent Playbook
- Scope automation changes to one workspace per PR and regenerate types when touching schemas.
- Respect generated artifacts; edit outputs only with matching `types:generate` updates committed.
- Run `yarn tap` before finishing; log TODOs only when paired with a tracking issue link.

@specifications/A001-coding-standards/logic.yaml
@fast-tools.md
