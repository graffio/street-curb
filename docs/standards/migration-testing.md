# Migration Testing Standard

## Purpose
Shared guidance for validating infrastructure and Firebase migrations before applying changes to live environments.

## Pre-flight Checklist
1. **Read the specification** and associated architecture docs to understand expected outcomes.
2. **Produce a failing check** (TAP test or integration script) that demonstrates the missing configuration/state.
3. **Capture baseline state** (e.g., `firebase projects:list`, `gcloud services list`) for rollback reference.

## Test Execution
- **Integration Harness**: Prefer shell scripts that invoke the real CLI (`modules/cli-migrator/src/cli.js`) with `--dry-run` and `--apply` sequences.
- **Repeatability**: Ensure scripts can run in temporary projects without manual cleanup.
- **Assertions**: Include checks for API enablement, auth configuration, authorized domains, and any side effects defined in the spec.

## Post-run Verification
1. Re-run the failing check and confirm it passes after migrations apply.
2. Capture command output and log references in the spec or runbook.
3. Update runbooks (`docs/runbooks/*.md`) if manual follow-up steps were required.

## Automation Hooks
- Integrate critical migrations into CI when feasible (`yarn workspace <module> tap`).
- For long-running scripts, document manual invocation with the exact command.

## References
- `CLAUDE.md` for workflow guidance (test-first always)
- `templates/specification-template/` for the new spec format embedding implementation + validation steps
