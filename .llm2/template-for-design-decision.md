# ADR {{DATE}}: {{TITLE}}

- Trigger: {{PROMPT_ENTRY OR ROADMAP LINK}}
- Status: {{STATUS|Proposed}}
- Pre-checks: {{TEST_COMMANDS AND RESULTS}}

## Context
{{WHY_CHANGE_IS_NEEDED; constraints; non-goals}}

## Options
1) {{Option A}} – pros/cons
2) {{Option B}} – pros/cons
3) {{Option C}} – pros/cons

## Decision
{{Chosen option and why}}

## Consequences
- Positive: {{LIST}}
- Negative / Risks: {{LIST}}

## Test Strategy
{{Unit, integration, contract tests; Storybook updates; TAP suites to extend}}

## Observability
{{What metrics/logs to add; transcripts or monitoring follow-ups}}

## Rollback Plan
{{Exact steps to revert or feature-flag}}

## Architecture References
When making architectural decisions, reference the appropriate `docs/architecture/` files:
- **Event Sourcing**: `docs/architecture/event-sourcing.md`
- **Queue Processing**: `docs/architecture/queue-mechanism.md`
- **Offline-First**: `docs/architecture/offline-first.md`
- **Multi-Tenant**: `docs/architecture/multi-tenant.md`
- **Billing Integration**: `docs/architecture/billing-integration.md`
- **Authentication**: `docs/architecture/authentication.md`
- **Data Model**: `docs/architecture/data-model.md`
- **Security**: `docs/architecture/security.md`
- **Deployment**: `docs/architecture/deployment.md`
