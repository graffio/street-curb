## Standard Operating Procedure

### Daily Loop

1. **Capture the spec** in the task prompt (timestamp, one-line summary, target workspace, roadmap link if any).
2. **Surface a failing TAP test** under the owning module. Migrations must use integration-style TAP specs that exercise
   the real CLI entry points (no mocks).
3. **Pre-flight check** before prompting:
    - Run the verification command for this task (e.g., `yarn workspace <module> tap`, a targeted TAP spec, or an
      integration shell script such as `bash/test-migration-002.sh --dry-run`).
    - Note the exact command + result in the prompt you're assembling.
4. **Assemble context**: skim the relevant spec (`specifications/*`), coding standards loader/logic, and any ADR tied to the work.
   - For architectural decisions, reference `docs/architecture/` patterns
   - For implementation details, reference specific specification phase files
5. **Fill `.llm2/template-for-task-prompt.md`** with the summary, failing test path, scope, commands, and notes, then
   hand it to the LLM.
6. **Apply the proposed patch manually**, keeping the diff ≤ ~50 LOC across ≤2 modules.
7. **Re-run targeted tests** and capture command + outcome in the prompt (or a short follow-up note) so the record lives
   alongside the diff.
8. **Review the diff** with `git diff --stat` + `git diff --word-diff`, note risks/rollback, and proceed to commit/PR.

### Logging & Reviews

- Prompts under `.llm2/prompts/` act as the record of what ran; review them periodically for recurring pain points or
  revert spikes.
- Promote repeated friction to automation tasks or ADRs when scope jumps.

### Guardrails

- Always start from a failing test or integration run; if you cannot produce one quickly, stop and reconsider scope.
- Keep patches small. If the diff grows beyond the guardrail, switch to the ADR path before writing more code.
- Migrations and infrastructure changes require an integration run (can be a shell harness) before merging; do not
  auto-wire these into the global `yarn tap` suite if runtime or side effects are prohibitive—just log the
  command/output.
- Record every command you run (tests, generators, integration scripts) inside the prompt so the transcript captures it.

### When to Write an ADR

Create an ADR using `.llm2/template-for-design-discussion-prompt.md` when:

- The change alters architecture, introduces a new dependency, or spans >2 modules.
- The work cannot be finished inside a single patch loop.
- You are modifying shared contracts (functional helpers, infrastructure clients) and need to document options.
  Tie the ADR back to the prompt entry or roadmap note that triggered it.

### Architecture References

When working on architectural concerns, reference the appropriate `docs/architecture/` files:
- **Event Sourcing**: `docs/architecture/event-sourcing.md`
- **Queue Processing**: `docs/architecture/queue-mechanism.md`
- **Offline-First**: `docs/architecture/offline-first.md`
- **Multi-Tenant**: `docs/architecture/multi-tenant.md`
- **Billing Integration**: `docs/architecture/billing-integration.md`
- **Authentication**: `docs/architecture/authentication.md`
- **Data Model**: `docs/architecture/data-model.md`
- **Security**: `docs/architecture/security.md`
- **Deployment**: `docs/architecture/deployment.md`

For implementation details, reference the specific specification phase files (e.g., `specifications/F107-firebase-soc2-vanilla-app/phase2-events.md`).

## Templates & Context

| File                                       | Primary Target | Purpose                                                                                                   |
|--------------------------------------------|----------------|-----------------------------------------------------------------------------------------------------------|
| `sop.md`                                   | Human          | Daily operating procedure for the patch loop and guardrails.                                              |
| `context-for-llm.md`                       | LLM            | Context bundle to paste into prompts (repo snapshot, coding standards highlights, tooling/testing defaults, backlog). |
| `template-for-task-prompt.md`              | Human → LLM    | Form to fill before kicking off a patch-sized request.                                                    |
| `template-for-design-discussion-prompt.md` | Human → LLM    | Form to fill when a change needs ADR-level discussion.                                                    |
| `template-for-design-decision.md`          | Human          | Markdown skeleton for the final ADR you commit.                                                           |
| `template-for-commit.md`                   | Human          | Commit-message scaffold summarizing change, tests, and references.                                        |

Keep this SOP synchronized with your actual practice; when the process changes, update Part A and mirror the change in
Part B if the model needs to know.
