# Curb Map Bootstrap Automation Overview

## 1. Background for Non-Technical Stakeholders

Google Cloud Platform (GCP) organizes resources in a hierarchy: an **organization** contains **folders** and **projects**. Projects host the actual services (Compute Engine, Firestore, Firebase, etc.). Access is governed by **Identity and Access Management (IAM)** roles that can be applied at any level—roles granted higher in the hierarchy flow down to everything beneath.

Automation relies on **service accounts**, which are robot identities. Because service accounts are powerful, Google discourages storing long-lived JSON keys. The safer pattern is to let trusted humans or machines obtain **short-lived tokens** by impersonating a service account or by using **Workload Identity Federation (WIF)** to exchange external credentials for Google-issued tokens. That keeps access ephemeral, policy-controlled, and auditable.

GCP also enforces **organization policies**. These guardrails prevent risky actions such as creating new service-account keys. Policies can target the whole organization or specific folders/projects with conditions. When `constraints/iam.disableServiceAccountKeyCreation` is enforced, attempts to mint keys fail unless a temporary, scoped exception is applied programmatically.

Firebase builds on top of GCP. A Firebase project is just a GCP project with additional APIs enabled and Firebase-managed service accounts. Enabling Firebase programmatically involves calling the Firebase Management API—no console work should be necessary.

## 2. History of GCP Security Controls

- **Early years**: automation often relied on user-managed JSON keys and broad organization-level roles, which made monitoring and revocation difficult.
- **2017–2019**: Google introduced organization policies such as `iam.disableServiceAccountKeyCreation` and IAM Conditions to curb risky behavior without breaking legacy tooling.
- **2020 onward**: IAM Credentials API logging, Workload Identity Federation, and hardened auditing became the default recommendations, pushing best practice toward short-lived impersonation with policy-backed guardrails.
- **Today**: security reviews (SOC 2, ISO, internal) expect keyless automation, scoped privileges, and verifiable evidence of every privileged action.

## 3. Why a Bootstrap Service Account Exists

`bootstrap-migrator@curbmap-automation-admin` allows us to run infrastructure migrations without handing broad org permissions to every developer. The workflow now emphasizes:

- Access via impersonation or WIF only—no JSON keys stored on disk.
- Least-privilege folder bindings so the account can create projects, enable services, and link billing only where necessary.
- Detailed audit evidence for every privileged action.

## 4. Guiding Principles

1. **Keyless by default**: no JSON keys after the initial bootstrap. If a key is ever unavoidable, generate it, place it in a managed secret, and delete local copies immediately.
2. **Scoped privileges**: bind roles at the smallest scope (folder or custom role) and avoid organization-wide grants when possible.
3. **Programmatic policy windows**: open/close temporary exceptions via the Org Policy API—never via manual console toggles.
4. **Single source of truth**: call Google’s GA REST APIs directly. Avoid `gcloud` alpha/beta commands and interactive prompts.
5. **Traceability**: log who ran the migration, what changed, and which ticket approved it.

## 5. High-Level Flow (Plain English)

1. Human operator confirms they have the right administrative roles (org policy admin, billing admin, folder admin, service usage admin, plus project-level IAM admin).
2. Check that the control-plane project `curbmap-automation-admin` is healthy: billing attached, core APIs enabled.
3. Use short-lived human ADC credentials for the very first run to create the bootstrap service account.
4. If a policy window is required, apply it programmatically and restore it immediately after the sensitive action.
5. Ensure the bootstrap service account exists (create if missing).
6. Bind required roles on target folders, then grant viewer/creator roles to impersonating principals.
7. Confirm JSON keys are absent and policies remain enforced.
8. Emit structured logs for audit evidence.

## 6. Detailed Automation Steps

The migration orchestrates the following REST calls using Application Default Credentials:

| Step | Goal | Primary API Calls |
|------|------|-------------------|
| 1 | Discover IAM bindings to confirm current operator rights | `POST https://cloudresourcemanager.googleapis.com/v3/organizations/{org}:getIamPolicy` |
| 2 | Confirm the automation project exists (create once, if missing) | `POST https://cloudresourcemanager.googleapis.com/v3/projects` |
| 3 | Link billing and enable core services (`iam.googleapis.com`, `iamcredentials.googleapis.com`, `serviceusage.googleapis.com`, `firebase.googleapis.com`, `orgpolicy.googleapis.com`) | `PUT https://cloudbilling.googleapis.com/v1/projects/{project}/billingInfo`, `POST https://serviceusage.googleapis.com/v1/projects/{project}/services:batchEnable` (with polling) |
| 4 | Evaluate current policy posture; apply scoped exception only if a key must be minted (rare) | `GET https://orgpolicy.googleapis.com/v2/projects/{project}/policies/iam.disableServiceAccountKeyCreation:getEffectivePolicy`, `PATCH https://orgpolicy.googleapis.com/v2/projects/{project}/policies/iam.disableServiceAccountKeyCreation` |
| 5 | Create or verify the bootstrap service account | `POST https://iam.googleapis.com/v1/projects/{project}/serviceAccounts` |
| 6 | Grant least-privilege roles at folder scope | `POST https://cloudresourcemanager.googleapis.com/v3/folders/{folder}:setIamPolicy` |
| 7 | Grant viewer/serviceAccountAdmin roles to impersonating principals | `POST https://cloudresourcemanager.googleapis.com/v3/projects/{project}:setIamPolicy`, `POST https://cloudresourcemanager.googleapis.com/v3/organizations/{org}:setIamPolicy` |
| 8 | Verify no user-managed keys exist and log outcomes | `GET https://iam.googleapis.com/v1/projects/{project}/serviceAccounts/{sa}/keys` |

## 7. Roles and Policies We Expect

- **Bootstrap service account roles** (folder scope):
    - `roles/resourcemanager.projectCreator`
    - `roles/serviceusage.serviceUsageAdmin`
    - `roles/billing.projectManager`
    - Additional custom roles as required for Firebase or IAM tasks.
- **Viewer & creator roles for impersonators**: the migration automatically binds each configured human principal to `roles/resourcemanager.projectViewer` and `roles/iam.serviceAccountAdmin` on `curbmap-automation-admin`, plus `roles/orgpolicy.policyViewer` on the organization. This lets them impersonate, inspect policies, and create service accounts without holding permanent org-admin rights.
- **Organization policies to monitor**:
    - `constraints/iam.disableServiceAccountKeyCreation`
    - `constraints/iam.workloadIdentityPools`
    - Access Context Manager policies tied to the automation project.

## 8. First Run vs Subsequent Runs

- **First run (human credentials)**
    - `gcloud auth login admin@curbmap.app`
    - `gcloud auth application-default login --scopes=https://www.googleapis.com/auth/cloud-platform`
    - `gcloud auth application-default set-quota-project curbmap-automation-admin`
    - Run the migration (dry run → apply). It creates the bootstrap service account and grants the impersonator bindings.
- **Subsequent runs (impersonation or WIF)**
    - `gcloud auth application-default login --impersonate-service-account=bootstrap-migrator@curbmap-automation-admin.iam.gserviceaccount.com --scopes=https://www.googleapis.com/auth/cloud-platform`
    - Run the migration headlessly; it revalidates the account, IAM bindings, and policy posture without JSON keys.

If you see `iam.serviceAccounts.create` failures while the bootstrap account is missing, ADC is still impersonating the bootstrap SA. Re-run `gcloud auth application-default login` without `--impersonate-service-account` to recover.

## 9. Operational Checklist

1. Run the migration in `--dry-run` mode and review the checklist output.
2. Address any missing roles or policies; rerun `--dry-run` until all checks pass.
3. Execute with `--apply` using appropriate ADC (human for first run, impersonation thereafter).
4. Verify Cloud Logging/BigQuery entries capture actor, action, and ticket ID.
5. Revoke temporary human access and switch back to impersonation/WIF if needed.

## 10. Next Documentation Updates (future work)

- Add an appendix describing how to bootstrap Workload Identity Federation pools and attach them to CI/CD.
- Provide sample JSON payloads for the org-policy window helper once implemented.
- Link to onboarding guides for requesting temporary admin elevation and reviewing audit logs.

