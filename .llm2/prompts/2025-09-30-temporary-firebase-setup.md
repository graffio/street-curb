### ROLE
Solo maintainer for the graffio monorepo.

### OBJECTIVE
Validate the revised manual setup guide and extend `bash/create-temporary-config.sh` so it keeps generating the temporary config while also printing the sandbox setup steps (with dry-run warning and doc links).

### PRE-FLIGHT (complete before using the assistant)
- Run `bash/create-temporary-config.sh` (baseline output) and capture the current message in this prompt.
- Re-read `specifications/F107-firebase-soc2-vanilla-app/manual-setup.md` to confirm it now covers sandbox + prod/staging through the “Production & Staging Considerations” section.

### CONTEXT
- Architecture content lives in `docs/architecture/*`; F107 phase guides link into those files.
- `.llm2/` workflow enforces failing check, prompt logging, and guardrails (<50 LOC, ≤2 modules).

### CONSTRAINTS
- Keep script changes modest: preserve working-directory check and config generation behaviour, then append guidance output.
- Script must not call Firebase APIs; it should continue to produce the config file and print manual steps referencing the doc.
- Record commands/results (baseline + updated script output) in this prompt after implementation.

### DELIVERABLES
1. Manual setup doc reference confirmed (no additional edits unless gaps found).
2. Updated `bash/create-temporary-config.sh` that (a) still generates the temporary config/ID and (b) prints numbered manual steps with doc reference and dry-run warning.
3. Verification snippet showing the new script output (including config creation and instructions).
4. Risks/rollback notes (e.g., mismatch between script text and doc).

### POST-WORK LOG
- Baseline script run: `bash/create-temporary-config.sh` → TODO capture output

- Baseline script run (2025-10-01): `../../bash/create-temporary-config.sh`
    - Result: ✅ Created `migrations/config/temporary-20251001-124703.config.js` and printed project ID + 002 migration hint.
- Updated script run (2025-10-01): `../../bash/create-temporary-config.sh`
    - Result: ✅ Created `migrations/config/temporary-20251001-124802.config.js` and printed manual setup steps with doc reference + scripted next step.
    - Note: remove extra temporary configs when they are no longer needed.
- Risks/rollback: ensure instructions stay in sync with manual; revert via `git checkout -- bash/create-temporary-config.sh` if behaviour regresses.
- Updated script run (2025-10-01, v2): `../../bash/create-temporary-config.sh`
    - Result: ✅ Created `migrations/config/temporary-20251001-125455.config.js` and printed numbered manual steps with project-specific commands.
    - Reminder: clean up temporary configs (`migrations/config/temporary-*.config.js`) when finished practicing.
