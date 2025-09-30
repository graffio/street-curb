# Roles & Permissions

**IAM Configuration for CurbMap Infrastructure**

## Executive Summary

CurbMap uses **service account impersonation** with role-based access control. Humans never have direct project
permissions - they impersonate service accounts with least-privilege roles. Production access is highly restricted with
quarterly reviews.

**Key Principles:**

- ✅ No direct human access to projects
- ✅ Access only via service account impersonation
- ✅ Environment separation (dev, staging, production)
- ✅ Least privilege per service account
- ✅ Quarterly access reviews

**Quick Reference:**

```bash
# Grant developer access to development
gcloud iam service-accounts add-iam-policy-binding \
  firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com \
  --member="user:developer@company.com" \
  --role="roles/iam.serviceAccountTokenCreator"

# Review who has access
gcloud iam service-accounts get-iam-policy \
  firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com
```

---

## Table of Contents

- [Roles Matrix](#roles-matrix)
- [Environment Separation](#environment-separation)
- [Service Account Configuration](#service-account-configuration)
- [Access Levels](#access-levels)
- [Access Review Process](#access-review-process)

---

## Roles Matrix

| Who                            | Type     | Permissions                                                                                                                                   | Access Pattern                      |
|--------------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|
| **Infrastructure Admin**       | 👤 Human | • Can grant impersonation access<br>• MFA required                                                                                            | One-time setup per environment      |
| **Developer**                  | 👤 Human | • Can impersonate dev service account<br>• No direct project permissions                                                                      | Daily development via impersonation |
| **Production Operator**        | 👤 Human | • Can impersonate production service account<br>• No direct project permissions                                                               | Production deployments only         |
| **Dev Service Account**        | 🤖 Robot | • `roles/firebase.admin`<br>• `roles/datastore.owner`<br>• `roles/storage.admin`<br>• `roles/cloudfunctions.admin`<br>• Scoped to dev project | Impersonated by developers          |
| **Staging Service Account**    | 🤖 Robot | Same roles as dev, scoped to staging                                                                                                          | Impersonated by authorized users    |
| **Production Service Account** | 🤖 Robot | Same roles as dev, scoped to production                                                                                                       | Impersonated by operators only      |

---

## Environment Separation

### Development (`curb-map-development`)

**Purpose:** Feature development and testing
**Access:** All developers can impersonate dev service account
**Data:** Test data only (no PII)
**SOC2 Scope:** Excluded

### Staging (`curb-map-staging`)

**Purpose:** Pre-production validation
**Access:** Authorized users only
**Data:** Synthetic data (documented as non-customer)
**SOC2 Scope:** Excluded

### Production (`curb-map-production`)

**Purpose:** Live customer data
**Access:** Production operators only (restricted list)
**Requirements:**

- Business justification documented
- Manager approval required
- Quarterly access review mandatory
- Automatic expiration after 90 days

**Data:** Customer PII
**SOC2 Scope:** **Full compliance required**

---

## Service Account Configuration

Each environment has one service account with identical roles:

**Email Pattern:** `firebase-infrastructure-sa@curb-map-{environment}.iam.gserviceaccount.com`

**Roles (All Environments):**

```bash
# Firebase administration
gcloud projects add-iam-policy-binding curb-map-{env} \
  --member="serviceAccount:firebase-infrastructure-sa@curb-map-{env}.iam.gserviceaccount.com" \
  --role="roles/firebase.admin"

# Firestore database operations
gcloud projects add-iam-policy-binding curb-map-{env} \
  --member="serviceAccount:firebase-infrastructure-sa@curb-map-{env}.iam.gserviceaccount.com" \
  --role="roles/datastore.owner"

# Cloud Storage management
gcloud projects add-iam-policy-binding curb-map-{env} \
  --member="serviceAccount:firebase-infrastructure-sa@curb-map-{env}.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Cloud Functions deployment
gcloud projects add-iam-policy-binding curb-map-{env} \
  --member="serviceAccount:firebase-infrastructure-sa@curb-map-{env}.iam.gserviceaccount.com" \
  --role="roles/cloudfunctions.admin"
```

**Key Properties:**

- No keys generated or downloaded
- Project-scoped (not organization-wide)
- Cannot create new service accounts
- Accessed only via human impersonation

---

## Access Levels

### Infrastructure Admin

**Who:** Lead engineer, CTO

**Responsibilities:**

- Create Firebase projects in console
- Create service accounts
- Grant/revoke impersonation permissions
- Conduct quarterly access reviews
- Handle security incidents

**Permissions:**

- `resourcemanager.projects.create` (org/folder level)
- `iam.serviceAccounts.create` (org/folder level)
- `iam.serviceAccounts.setIamPolicy` (project level)

**Access Pattern:** Infrequent (admin tasks only)

### Developer

**Who:** Software engineers on team

**Responsibilities:**

- Deploy configuration changes
- Update Firestore rules
- Deploy Cloud Functions
- Create indexes

**Permissions:** Can impersonate dev service account (no direct project access)

**Access Pattern:** Daily development work

### Production Operator

**Who:** Senior engineers authorized for production

**Responsibilities:**

- Production deployments
- Emergency fixes
- Configuration updates
- Production monitoring

**Permissions:** Can impersonate production service account

**Access Pattern:** Infrequent (production changes only)

**Additional Requirements:**

- Business justification documented
- Manager approval
- Quarterly review
- 90-day automatic expiration

---

## Access Review Process

**Frequency:** Quarterly (dev/staging), Monthly (production)

**Process:**

1. **Export IAM policies:**
   ```bash
   gcloud iam service-accounts get-iam-policy \
     firebase-infrastructure-sa@curb-map-{env}.iam.gserviceaccount.com \
     --format=json > access-review-{env}-2025-Q1.json
   ```

2. **Review who has access:**
    - Verify business justification still valid
    - Check for departed employees
    - Identify unused permissions

3. **Remove unnecessary permissions:**
   ```bash
   gcloud iam service-accounts remove-iam-policy-binding \
     firebase-infrastructure-sa@curb-map-{env}.iam.gserviceaccount.com \
     --member="user:former-employee@company.com" \
     --role="roles/iam.serviceAccountTokenCreator"
   ```

4. **Document review:**
    - Date of review
    - Access granted/revoked
    - Management approval
    - Store for audit evidence

---

## Least Privilege

**Service Accounts:**

- Only roles needed for environment
- No organization-wide permissions
- Project-scoped only
- No cross-project access

**Human Users:**

- No direct project permissions
- Access only via impersonation
- Separate permissions per environment
- Production highly restricted

**Future:** Create custom roles with exact permissions needed (after cataloging API calls made by migrations)

---

## References

- **Granting Access:** [access-management.md](access-management.md)
- **Authentication:** [authentication-model.md](authentication-model.md)
- **Setup Guide:** `specifications/F107-firebase-soc2-vanilla-app/manual-setup.md`
