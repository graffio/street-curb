### Repo Snapshot
- Workspaces live under `modules/*`
- `modules/functional`: functional programming primitive package (`@graffio/functional`).
- `modules/design-system`: design tokens + UI primitives package (`@graffio/design-system`)
- `modules/curb-map`: migrations, infrastructure, and app logic -- the main, and currently only, app
- `modules/cli-*`: internal tooling (`cli-migrator`, `cli-style-validator`, `cli-type-generator`).
- `modules/types-generation`: code generator for Tagged and Tagged Sum types; backing for `yarn types:generate`
- Specs in `specifications/*` drive requirements (coding standards, F107 Firebase plan, etc.).

### Architecture Documentation
- `docs/architecture/`: Reusable architectural patterns and design decisions
  - `event-sourcing.md`: Event sourcing patterns, queue processing, idempotency
  - `queue-mechanism.md`: Offline queue processing, conflict resolution, retry logic
  - `offline-first.md`: Offline-first design patterns, connection management, sync strategies
  - `multi-tenant.md`: Organization hierarchy, data isolation, RBAC patterns
  - `billing-integration.md`: Billing integration, webhook processing, data export patterns
  - `authentication.md`: Authentication patterns, security models, access control
  - `data-model.md`: Data modeling patterns, event sourcing, database design
  - `security.md`: Security architecture, compliance, audit patterns
  - `deployment.md`: Deployment architecture, environments, infrastructure

### Specification Standards
- `docs/standards/specification-format/`: Meta-standards for all specifications
- `templates/specification-template/`: Template for creating new specifications
- `specifications/F107-firebase-soc2-vanilla-app/`: CurbMap implementation specification

### Coding Standards Highlights
- Pure functional JavaScript only: avoid `class`, `new`, mutation; rely on helpers from `@graffio/functional`.
- One indentation level per function; extract helpers to the top of the current scope.
- Functions ≥5 lines (and exports) require slightly relaxed Hindley–Milner `@sig` annotations (capitalized primitives).
- Prefer `const`, fall back to `let`, never `var`; strings use single quotes unless escaping.
- No `for`/`while` loops—use higher-order combinators, except when simple loops include async/await calls
- One export block at the bottom; avoid default exports.
- TAP tests must read as prose: Given/When/Then with articles and natural-language assertions.

### Runtime & Tooling Defaults
- Language: JavaScript; ESM modules with explicit extensions (`"type": "module"`).
- Node target: 20.x LTS.
- Tests: Node TAP (`yarn tap` from root or any specific module; `yarn tap:file <file-path>` for a single file).
- Formatting: ESLint (@eslint.config.js) + Prettier (config in root package.json`)
- Types: regenerate with `yarn types:generate` or `yarn types:watch` when touching generated constructors.

### Testing Expectations
- Always add or surface a failing check (TAP spec or integration harness) before code changes.
- Unit-level coverage lives under `modules/<name>/test/*.tap.js` (Given/When/Then prose).
- Long-running or side-effectful integration flows (e.g., Firebase migrations) can live as shell scripts in `bash/` or  
  module-specific `integration/` folders. Tap files can be run automatically, but integrations only by a human

### Automation Backlog (optional context)
- `yarn guard:diff`: enforce diff size + lint before commit.
- Property-based tests for high-risk functional helpers (`fast-check`).
- Safe apply sandbox via `git worktree` for risky migrations.
