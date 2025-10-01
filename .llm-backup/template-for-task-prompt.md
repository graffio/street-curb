### ROLE
Solo maintainer for the graffio monorepo.

### OBJECTIVE 
Deliver ONE patch-sized change with tests-first discipline.

### PRE-FLIGHT (complete before using the assistant)
- Capture the task details (timestamp, spec sentence, target module) in this prompt file.
- Ensure a failing check exists (TAP spec or integration harness). If it is a TAP spec, place it under `modules/<name>/test/*.tap.js`; if it is a shell harness, note the script path.
- Run the verification command (e.g., `yarn workspace <module> tap`, a single TAP file, or `bash/test-migration-002.sh`). Record the command and outcome below.
- Collect relevant context snippets from `.llm/context-for-llm.md` (only the sections the model needs) and any relevant specs/ADRs for the prompt.

### CONTEXT
- Summary: {{WHAT_IS_BROKEN_OR_DESIRED in 1–3 sentences}}
- Scope: touch ≤ 2 modules; tests may add files.
- Modules: list workspaces touched (e.g., `modules/curb-map`).

### CONSTRAINTS
- Start from the failing check (link or inline). If none, write one at {{TEST_PATH}} or provide the integration script before coding.
- Provide a unified diff only; keep total changes ≤ ~50 LOC across ≤2 modules.
- Include the updated/added TAP spec or integration harness in the same diff.
- Keep rationale ≤ 150 words and capture it in this prompt file.
- After applying, rerun the targeted tests and note the command + result below.
- Add any reflections (prompt friction, next tweaks) in this prompt file.

### DELIVERABLES
1) Rationale (≤150 words, mention failing test path and final command run).
2) Unified diff (apply with `git apply -p0`).
3) Test results snippet or exact command(s) to rerun.
4) Risks & rollback notes (≤5 bullets).
5) Reference for this prompt entry (timestamp or filename).

IF SCOPE EXCEEDS PATCH-SIZE
- Stop, capture the pressure point, and switch to the ADR flow using `.llm/template-for-design-discussion-prompt.md`.
