Next Step – Bootstrap Service Account helper (Task A)

## Objective
Document and script the one-time bootstrap service account flow so subsequent migrations can run without manual console work.

## Actions
1. Draft helper instructions that create the org-level “bootstrap” service account with required roles (`roles/resourcemanager.projectCreator`, `roles/serviceusage.serviceUsageAdmin`, `roles/billing.projectManager`, `roles/firebase.managementAdmin`).
2. Define secure local storage for its JSON key (e.g. `~/.config/graffio/bootstrap-service-account.json`) and reference via env vars (`BOOTSTRAP_SA_KEY_PATH`).
3. Outline CLI steps (gcloud commands + key permissions) to provision and verify the account.
4. Update documentation to explain when and how operators run this bootstrap step before executing migration 002.

## Hand-off Notes
- No repo changes yet; next writable session should codify these instructions and ensure key paths are gitignored before adding migration code.
- After Task A is complete, proceed to implement migration 006 (Phase 1c) using the new per-project service account structure.
