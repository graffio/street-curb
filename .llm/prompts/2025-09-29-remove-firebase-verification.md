ROLE: Solo maintainer for the graffio monorepo.

OBJECTIVE: Deliver ONE patch-sized change with tests-first discipline.

PRE-FLIGHT (complete before using the assistant)
- Captured 2025-09-29 task entry in this prompt (remove redundant Firebase project verification; workspace: modules/curb-map).
- Captured failing integration run via `./migrations/test/test-migration-002.sh` (wraps dry-run/apply for existing and new configs); apply on a new config exits non-zero with “Firebase project … creation failed - project not found after creation”. Transcript saved with:
  `./migrations/test/test-migration-002.sh 2>&1 | sed -l -E 's/temporary-[0-9-]+/temporary-<redacted>/g' | tee migrations/test/transcript-test-migration-002.txt`
- Recorded the command/output snippet from the transcript at `modules/curb-map/migrations/test/transcript-test-migration-002.txt`.
- Collected context: relevant sections from `specifications/A001-coding-standards/llm-loader.md`, `logic.yaml`, `specifications/F107-firebase-soc2-vanilla-app/next-plan.md`.

CONTEXT
- Summary: Clean up migration step 002 by removing the redundant post-create verification query, dropping the no-op try/catch, and simplifying logging so success paths use one consistent message.
- Scope: touch ≤ 2 modules; tests may add files.
- Modules: modules/curb-map

CONSTRAINTS
- Start from the failing integration harness `./migrations/test/test-migration-002.sh` and reference the transcript.
- Provide a unified diff only; keep total changes ≤ ~50 LOC across ≤2 modules.
- Include the updated/added integration harness in the same diff if it changes.
- Keep rationale ≤ 150 words and record it in this prompt entry.
- After applying, rerun `./migrations/test/test-migration-002.sh 2>&1 | sed -l -E 's/temporary-[0-9-]+/temporary-<redacted>/g' | tee migrations/test/transcript-test-migration-002-after.txt` and capture the result below.

DELIVERABLES
1) Rationale (≤150 words, mention failing test path and final command run).
2) Unified diff (apply with `git apply -p0`).
3) Test results snippet or exact command(s) to rerun.
4) Risks & rollback notes (≤5 bullets).
5) Reference: 2025-09-29 (this prompt file).

IF SCOPE EXCEEDS PATCH-SIZE
- Stop, capture the pressure point, and switch to the ADR flow using `.llm/template-for-design-discussion-prompt.md`.
