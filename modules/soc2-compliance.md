Security Model & SOC2 Conformance Outline
=========================================

Overview
-----------
Graffio’s Firebase/GCP infrastructure is being migrated from ad‑hoc, human-driven actions to scripted, auditable
workflows. The guiding principles are:

- Least privilege: every human and service account receives only the permissions it needs.
- Auditability: infrastructure actions run through scripts/migrations so they can be repeated, logged, and reviewed.
- Progressive hardening: we accept a limited set of short-term compromises while we bootstrap, but document them now and
  plan remediation.

IAM & Firebase Permissions Primer
------------------------------------
Google Cloud Platform (GCP) uses Identity and Access Management (IAM) to control who can do what.

- Entities (“principals”) are either human users (via Google Workspace) or service accounts (robot identities used by
  automation).
- Permissions are granted via roles. Google provides predefined roles (e.g., `roles/resourcemanager.projectCreator`),
  and we can build custom ones later.
- Policies attach roles to principals at the organization, folder, or project level. A policy applied higher in the
  hierarchy (org > folder > project) flows down unless explicitly blocked.

Firebase services sit on top of GCP. Some Firebase features (Auth, Hosting, Functions) have dedicated permissions
exposed through GCP roles such as `roles/firebase.admin`. Others (Firestore, Storage) depend on the underlying GCP APIs.
Because Firebase reuses IAM under the hood, we treat Firebase permissions as part of the same policy model.

Key implications for a mixed technical/non-technical audience:

- Human access should be narrow and temporary. Service accounts should handle repetitive or privileged operations.
- Every infrastructure change we automate must log who triggered it and what happened; this is crucial for SOC2.
- We maintain separate folders/projects for Development, Test, Staging, Production so that a breach in one environment
  cannot easily spread.
 
### Environment Variables

`GOOGLE_APPLICATION_CREDENTIALS` and `CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE` are recognized by the Google SDK:
- `GOOGLE_APPLICATION_CREDENTIALS` tells Application Default Credentials (ADC) which JSON file to use.
- `CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE` makes the `gcloud` CLI use that same file without modifying your global `gcloud auth` state.
- `BOOTSTRAP_SA_KEY_PATH` points the migrations to the hardened key for the org-level bootstrap service account. The helper enforces `chmod 700` on its directory and `chmod 600` on the key file so the credential stays local-only.
- `INFRA_SA_KEY_PATH` can be set to the per-project key emitted by migration 002; exporting it makes it easy to activate the infrastructure service account for migrations 003–005.

### Application Default Credentials (ADC) vs. `gcloud` vs. Firebase auth

In short:

- ADC is the SDK/library mechanism (controlled by `GOOGLE_APPLICATION_CREDENTIALS`).
- `gcloud auth` manages CLI state; override it with `CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE` to stay deterministic.
- Firebase CLI historically used its own auth token; by ensuring service accounts are active via ADC we avoid human tokens there too

**ADC** is a Google SDK convention: client libraries (Firebase Admin, Google APIs) call `google.auth.getApplicationDefault()` to find credentials. 
The lookup order is:
 
1. If `GOOGLE_APPLICATION_CREDENTIALS` points to a JSON key, use that.
2. If running on GCE/GKE/Cloud Functions, use the attached service account.
3. If the user ran `gcloud auth application-default login`, use the stored user token.

**`gcloud` global auth state** refers to credentials stored under `~/.config/gcloud`. When you run `gcloud auth login`, it writes a refresh token there. Subsequent `gcloud` CLI commands reuse that token automatically. MOS: CLI interactive.

**`CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE`** lets you tell the CLI “ignore whatever is in ~/.config/gcloud; instead, use this JSON key for all commands.” That keeps migrations self-contained without polluting the user’s default login.

**Firebase CLI (`firebase login`)** stores its own token (~/.config/firebase). When we run `npx firebase …` under a service account, we often export `GOOGLE_APPLICATION_CREDENTIALS` so the CLI picks it up (recent versions respect ADC). Otherwise we’d need a user token created via `firebase login`, which we’re trying to avoid for automation.




Roles and Permission
------------------------------------

Roles & Permissions Matrix
-----------------------------

| Who                           | SA | Key Roles & Permissions                                                                                                                      | SOC2 Impact                                                                                   | Future Changes                                                                                              |
|-------------------------------|----|----------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------|
| Bootstrap Automation Owner    | 👤 | Human engineer with Workspace MFA                                                                                                            | Demonstrates controlled change process                                                        | Replace local key usage with short-lived impersonation                                                      |
|                               |    | Unlocks Bootstrap SA credentials when running project creation/teardown                                                                      | Must ensure activity is logged in Cloud Audit Logs                                            | Add dual approval before touching staging/production                                                        |
| Bootstrap Service Account     | ✔️ | Org-scope service account                                                                                                                    | Enables automated environment creation while keeping console access limited                   | Tighten to custom role set once exact API calls are known                                                   |
|                               |    | Roles:<br>- resourcemanager.projectCreator<br>- serviceusage.serviceUsageAdmin<br>- billing.projectManager<br>- firebase.managementAdmin<br> | Needs monitoring to satisfy auditors                                                          | Move credentials into Secret Manager and enforce rotation                                                   |
| Infrastructure Engineer       | 👤 | Runs migrations 000–005 from a workstation                                                                                                   | Shows infrastructure is managed through repeatable scripts rather than ad-hoc console actions | Eventually migrate execution to controlled runner/CI while retaining read-only visibility                   |
|                               |    | Temporarily impersonates bootstrap SA, then activates per-project SA                                                                         |                                                                                               |                                                                                                             |
| Per-project Infrastructure SA | ✔️ | Created by Phase 1c inside each project                                                                                                      | Provides least-privilege automation for Firebase Auth, Firestore, Hosting, etc.               | Add service-specific roles later (`storage.admin`, `cloudfunctions.developer`, `cloudsql.client` as needed) |
|                               |    | Scoped roles:<br>- firebase.admin<br>- datastore.owner<br>- serviceusage.serviceUsageConsumer                                                | Supports audit trail requirements                                                             | Rotate keys regularly and store them securely                                                               |
| Application Runtime SAs       | ✔️ | Component-specific service accounts for deployed workloads                                                                                   | Critical for proving production services do not run with admin rights                         | Define custom roles per service; integrate with Secret Manager and automated rotation                       |
|                               |    | Operate with minimal runtime permissions only                                                                                                |                                                                                               |                                                                                                             |
| Support / Customer Success    | 👤 | (Future) Human accounts using admin tooling                                                                                                  | SOC2 requires proof that customer data access is controlled and logged                        | Design break-glass process and auditing for any elevated access                                             |
|                               |    | Will receive read-only or tightly scoped custom roles                                                                                        |                                                                                               |                                                                                                             |
| External Auditor              | 👤 | Temporary read-only access to IAM policies and Cloud Audit Log exports                                                                       | Directly supports SOC2 evidence gathering                                                     | Automate quarterly exports/reports and store approvals                                                      |


Next Steps
------------------------

### Current issues
- Today the Firebase project must be created in the Firebase console, then migrations 002–005 are run
- 003 still assumes you click “Get Started” in the Auth console.
- Phase1c (the per-project infrastructure service account) is only a spec; no migration exists yet.
- The bootstrap (org-level) service account doesn’t exist at all.

Manual console clicks are incompatible with SOC2 repeatability. The staged plan is now:

    1. Bootstrap Service Account (migration 000)
       Run once to create the org-level helper. It holds project creation, billing link, and Firebase management permissions so subsequent migrations can operate headlessly.
    2. Migration 002 rewrite
       Use the bootstrap SA to create the GCP project, move it into the correct folder, attach billing, enable Firebase/APIs, create the per-project infrastructure service account, assign its roles, and mint the hardened key.
    3. Migration 003 (Auth)
       Keep the API-first approach: enable auth providers without console clicks, authenticated via the per-project SA generated in step 2.
    4. Migrations 004–005
       Ensure each migration activates the per-project SA before calling `gcloud` or `firebase`, eliminating human tokens for Firestore configuration and rules deployment.

Sequence summary:

    0. (One-time) Org admin runs migration 000 to mint the bootstrap SA key.
    1. Run migration 002 with the bootstrap SA to create/configure the project and mint the per-project infrastructure SA key.
    2. Activate the per-project key captured by migration 002 and run migrations 003–005 (and beyond).


SOC2 Conformance Path
------------------------

### Milestone 1 – Document & Bootstrap (in progress)

- Adopt the two-service-account model (bootstrap + per-project) and capture their creation in migrations 000–002.
- Enable Admin Activity Cloud Audit Logs at organization and project levels; verify they record every migration
  invocation.
- Store bootstrap SA key in password-protected vault; require MFA for retrieval.
- Log every environment creation/deletion in the infrastructure audit Firestore collection.

### Milestone 2 – Strengthen Operations (short term)

- Implement teardown migration to delete temporary environments in a controlled, auditable manner.
- Ensure migrations are idempotent so environments can be recreated (supports disaster recovery testing).
- Add automated checks that folders/projects contain only expected IAM bindings; alert on drift.

### Milestone 3 – Production Hardening (mid term)

- Move migration execution to a controlled runner (eventual CI) using service account impersonation.
- Store per-project SA keys in Secret Manager; rotate on a 90-day cadence.
- Create environment-specific folders (Development/Test/Staging/Production) with distinct policies and logging sinks.

### Milestone 4 – Continuous Compliance (long term)

- Automate quarterly IAM reviews (scripted export + human sign-off stored in ticketing system).
- Integrate key rotation, incident response drills, and environment rebuild exercises into the compliance calendar.
- Produce SOC2 evidence package (policies, logs, review artifacts) with minimal manual effort.

Running initial migrations
-----------------------------------

### Point to the environment configuration you want to bootstrap
    export CONFIG=modules/curb-map/migrations/config/temporary-20250922-114452.config.js
    export PROJECT_ID=$(node -e "console.log(require('./$CONFIG').default.firebaseProject.projectId)")

### Prepare the bootstrap service account key path
    export BOOTSTRAP_SA_KEY_PATH="$HOME/.config/curbmap/bootstrap-service-account.json"

### Run the bootstrap helper (creates the org-level service account)
    node modules/cli-migrator/src/cli.js "$CONFIG" modules/curb-map/migrations/src/000-bootstrap-service-account.js --apply

### Activate the org-level bootstrap service account (for project creation + IAM setup)
    export BOOTSTRAP_KEY="$BOOTSTRAP_SA_KEY_PATH"
    gcloud auth activate-service-account bootstrap-migrator@curbmap-automation-admin.iam.gserviceaccount.com --key-file="$BOOTSTRAP_KEY"
    export GOOGLE_APPLICATION_CREDENTIALS="$BOOTSTRAP_KEY"
    export CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE="$BOOTSTRAP_KEY"

### Run the combined bootstrap migration (project creation + per-project SA)
    node modules/cli-migrator/src/cli.js "$CONFIG" modules/curb-map/migrations/src/002-create-firebase-project.js --apply

### Switch to the per-project infrastructure service account for day-to-day migrations
    export INFRA_KEY=$(node -e "console.log(require('./$CONFIG').default.infrastructureServiceAccountKeyPath)")
    gcloud auth activate-service-account "firebase-infrastructure-sa@${PROJECT_ID}.iam.gserviceaccount.com" --key-file="$INFRA_KEY"
    export GOOGLE_APPLICATION_CREDENTIALS="$INFRA_KEY"
    export CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE="$INFRA_KEY"
    gcloud config set project "$PROJECT_ID"

### Run the Firebase configuration migrations with the per-project credentials
    node modules/cli-migrator/src/cli.js "$CONFIG" modules/curb-map/migrations/src/003-configure-authentication.js --apply
    node modules/cli-migrator/src/cli.js "$CONFIG" modules/curb-map/migrations/src/004-configure-firestore.js --apply
    node modules/cli-migrator/src/cli.js "$CONFIG" modules/curb-map/migrations/src/005-deploy-security-rules.js --apply

Decisions & Documented Shortcuts
-----------------------------------

### Decision: Keep migrations runnable from developer laptops while we bootstrap.
- Justification: Increases debuggability while infrastructure is new. Mitigation: require MFA, password-protected key
storage, and document every run in audit logs.
- Planned Fix: Transition to CI runner once the migration surface stabilizes; using impersonation so no raw key leaves the
vault.


### Use predefined Google roles (e.g., `roles/firebase.admin`) instead of custom roles initially.
- Justification: Faster onboarding; easier for a small team.
- Planned Fix: Replace with custom least-privilege roles after we catalog the exact API calls made by the migrations and
runtime services.

### Accept manual quarterly IAM review (spreadsheet + human check) in the short term.
- Justification: SOC2 requires evidence, but automated tooling is not yet built.
- Planned Fix: Build a script that exports IAM bindings and diffs them; store results alongside review notes to simplify
audits.

### Store per-project SA keys on disk during Phase 1c.
- Justification: Local migrations need credentials today; no central secret store yet.
- Planned Fix: Move keys into Secret Manager and update migrations to fetch them securely; eventually rotate keys
automatically.

### Delay environment-specific root folders until we consolidate temp environments.
- Justification: Multiple temp projects are easier to manage in a single folder during prototyping.
- Planned Fix: Create `/Development`, `/Test`, `/Staging`, `/Production` folders before introducing real customer data;
move projects appropriately and update policies.

Next Steps
-------------

    • Finalize the bootstrap and teardown migrations, ensuring they log to the audit collection.
    • Draft written operational procedures (who runs migrations, where logs are stored, how to request access).
    • Schedule the first IAM review and key rotation even if it is manual; documenting it early strengthens the SOC2 story.
    • Educate the broader team on folder hierarchy, environment lifecycle, and expectations for handling credentials.

This document should be revisited every quarter as part of the compliance cadence; update the roles table, milestones,
and decisions as practices mature.
