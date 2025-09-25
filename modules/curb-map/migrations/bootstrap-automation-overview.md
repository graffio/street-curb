# Curb Map Bootstrap Automation Overview

## 1. Background for Non-Technical Stakeholders

Google Cloud Platform (GCP) organizes resources in a hierarchy: an **organization** contains **folders** and **projects**. Projects hold the actual services (Compute Engine, Firestore, Firebase, etc.). Access is governed by **Identity and Access Management (IAM)** roles that can be applied at any level. A role granted higher in the hierarchy automatically affects everything beneath it.

Instead of sharing passwords, GCP uses **service accounts**—robot identities that run automation. Service accounts can act on resources when you grant them roles. Because they are powerful, Google recommends avoiding files that contain long-lived secrets (“JSON keys”). The safer pattern is to let trusted humans or machines **impersonate** a service account with short-lived tokens or to federate identities from an existing provider, which keeps access ephemeral, centrally logged, and bound by policy rather than by a copyable key file.

**Workload Identity Federation (WIF)** lets external identities—from GitHub Actions, other clouds, or on-prem identity providers—exchange their native credentials for Google-issued short-lived tokens without storing a JSON key. Combined with impersonation, it keeps credentials entirely within Google’s control while still allowing outside systems to act as a service account.

**Application Default Credentials (ADC)** is Google’s mechanism for discovering credentials on a machine. Locally it picks up the active `gcloud` session; in Cloud Run, GKE, or other managed runtimes it sources credentials from the workload’s attached service account. Our bootstrap tooling relies on ADC so that operators can authenticate once (often through impersonation) and every subsequent REST call reuses that short-lived token automatically. When the ADC provider is WIF or an impersonated service account, we get the keyless benefits described above without custom credential plumbing.

GCP also supports **organization policies**. These are guardrails that block risky actions, such as creating new service account keys. Policies can target the whole organization or be scoped to specific folders/projects with conditions or tags. When we enforce a policy like `iam.disableServiceAccountKeyCreation`, any attempt to mint a JSON key will fail unless we create a temporary, scoped exception.

Firebase sits on top of GCP. A Firebase project is just a GCP project with additional APIs enabled and some Firebase-only service accounts. To enable Firebase programmatically we call the Firebase Management API; no special console work should be required.

## 2. History of GCP Security Controls

- **Early years**: automation commonly relied on user-managed JSON keys and broad IAM roles granted at the organization level, which made monitoring and revocation difficult.
- **2017–2019**: Google introduced organization policies such as `iam.disableServiceAccountKeyCreation` and IAM Conditions to curb risky behavior without deleting legacy workflows.
- **2020 onward**: IAM Credentials API logging, Workload Identity Federation, and hardened auditing became the recommended defaults, shifting best practice to short-lived impersonation with policy-backed guardrails.
- **Today**: security reviews (SOC 2, ISO, internal) expect keyless automation, scoped privileges, and verifiable evidence of every privileged action.

## 3. Why a Bootstrap Service Account Exists

Historically, we created `bootstrap-migrator@curbmap-automation-admin` to run infrastructure migrations without handing broad org permissions to every developer. That bootstrap account still matters, but the workflow must evolve:

- The account should be accessible only through impersonation or Workload Identity Federation (WIF).
- It must hold the minimum roles required to stand up projects, enable services, and link billing inside approved folders.
- Every privileged action must emit an audit trail so we can prove compliance (SOC 2, internal controls).

## 4. Guiding Principles

1. **Keyless by default**: No JSON keys stored on disk after the initial bootstrap. If an exception is unavoidable, generate the key, store it in a managed secret, and delete it immediately after use.
2. **Scoped privileges**: Bind roles at the smallest scope (folder or custom role) and remove organization-wide grants where possible.
3. **Programmatic policy windows**: Use the Org Policy API to open and close temporary exceptions, never the console.
4. **Single source of truth**: Call Google’s GA REST APIs directly. Avoid gcloud alpha/beta commands and interactive prompts.
5. **Traceability**: Log who ran the migration, what change was made, and which ticket approved it.

## 5. High-Level Flow (Plain English)

1. Verify the human running the script has the right administrative roles for a very short time (org policy admin, billing admin, folder admin, service usage admin).
2. Ensure the control-plane project `curbmap-automation-admin` is healthy: billing is attached and required APIs are enabled.
3. Use a short-lived impersonated identity to act as `bootstrap-migrator`.
4. If the policy blocking key creation needs to be relaxed, apply a conditional override limited to the automation project and immediately schedule its removal.
5. Confirm the bootstrap service account exists; if not, create it.
6. Grant the service account the minimal roles it needs on each target folder.
7. Re-assert that no JSON key files exist and that the policy is back to “enforced”.
8. Record every step for future audits.

## 6. Detailed Automation Steps

The migration script should orchestrate the following REST calls using impersonated credentials from `curbmap-automation-admin`:

| Step | Goal | Primary API Calls |
|------|------|-------------------|
| 1 | Discover IAM bindings on the organization/folder to confirm the operator’s rights | `POST https://cloudresourcemanager.googleapis.com/v3/organizations/{org}:getIamPolicy` |
| 2 | Confirm the automation project exists (create once, if truly missing) | `POST https://cloudresourcemanager.googleapis.com/v3/projects` |
| 3 | Link the approved billing account and enable core services (`iam.googleapis.com`, `iamcredentials.googleapis.com`, `serviceusage.googleapis.com`, `firebase.googleapis.com`, `orgpolicy.googleapis.com`) | `PUT https://cloudbilling.googleapis.com/v1/projects/{project}/billingInfo`, `POST https://serviceusage.googleapis.com/v1/projects/{project}/services:batchEnable` |
| 4 | Evaluate current policy posture; apply a scoped exception only if a key must be minted for emergency purposes | `GET https://orgpolicy.googleapis.com/v2/projects/{project}/policies/iam.disableServiceAccountKeyCreation:getEffectivePolicy`, `PATCH https://orgpolicy.googleapis.com/v2/projects/{project}/policies/iam.disableServiceAccountKeyCreation` |
| 5 | Create or verify the bootstrap service account | `POST https://iam.googleapis.com/v1/projects/{project}/serviceAccounts` |
| 6 | Grant least-privilege roles at folder scope (or custom roles) | `POST https://cloudresourcemanager.googleapis.com/v3/folders/{folder}:setIamPolicy` |
| 7 | Verify no user-managed keys exist and close the policy window | `GET https://iam.googleapis.com/v1/projects/{project}/serviceAccounts/{sa}/keys`, `PATCH` policy back to enforce |
| 8 | Emit structured logs or BigQuery rows describing each action | Logging sink or direct API calls (implementation-specific) |

## 7. Roles and Policies We Expect

- **Bootstrap service account roles** (folder scope):
    - `roles/resourcemanager.projectCreator`
    - `roles/serviceusage.serviceUsageAdmin` (or the narrower `serviceUsageConsumer` if custom roles cover enablement)
    - `roles/billing.projectManager` (only on folders where project billing links will be established)
    - Additional custom roles for Firebase or IAM tasks as needed.
- **Viewer & creator roles for impersonators**: the migration automatically grants each configured human principal `roles/resourcemanager.projectViewer` and `roles/iam.serviceAccountAdmin` on `curbmap-automation-admin`, plus `roles/orgpolicy.policyViewer` on the organization, so they can impersonate, inspect policies, and create the bootstrap service account without holding broader org admin rights.
- **Organization policies to monitor**:
    - `constraints/iam.disableServiceAccountKeyCreation`
    - `constraints/iam.workloadIdentityPools` (if WIF restrictions apply)
    - Any Access Context Manager policies tied to the automation project.

## 8. Operational Checklist

1. Human operator obtains MFA-backed short-lived access and runs the migration with `--dry-run` first.
2. Migration reports current policy posture and required changes; operator seeks approval if a temporary exception is necessary.
3. Run migration in apply mode; impersonation token is supplied via ADC or `gcloud --impersonate-service-account`.
4. Confirm log entries in Cloud Logging/BigQuery contain the expected ticket ID, actor, and resource changes.
5. Remove any residual human access once automation completes.

## 9. Next Documentation Updates (future work)

- Add appendix describing how Workload Identity Federation pools are created and attached to CI/CD systems.
- Provide sample JSON payloads for the policy patch requests once the helper utilities are implemented.
- Link to onboarding guides for new team members, describing how to request temporary admin elevation and how to monitor audit logs.
