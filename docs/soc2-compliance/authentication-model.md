# Authentication Model

**Service Account Impersonation for Infrastructure Operations**

## Executive Summary

CurbMap eliminates long-lived credentials by using **service account impersonation**. Developers authenticate with
personal Google accounts (MFA-protected), then impersonate service accounts to perform infrastructure operations. All
actions are logged with individual user identity.

**Key Benefits:**

- ✅ No service account keys on laptops
- ✅ Short-lived tokens (1-12 hours, auto-expire)
- ✅ Individual accountability in audit logs
- ✅ Instant revocation (< 5 minutes)
- ✅ MFA protection on all human access

**Quick Start Commands:**

```bash
# 1. Admin grants developer impersonation access to the service account (one-time)
gcloud iam service-accounts add-iam-policy-binding \
  firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com \
  --member="user:developer@company.com" \
  --role="roles/iam.serviceAccountTokenCreator"

# 2. Developer configures impersonation (one-time)
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com

# 3. Use normally - all commands now use impersonated credentials
npx firebase deploy --only firestore:rules
gcloud firestore indexes list
```

---

## Table of Contents

- [How It Works](#how-it-works)
- [Security Benefits](#security-benefits)
- [Switching Environments](#switching-environments)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## How It Works

### One-Time Setup

1. **Developer authenticates:** `gcloud auth login`
2. **Admin grants impersonation permission** (see Quick Start above)
3. **Developer configures impersonation** (see Quick Start above)

### Daily Usage

**No daily setup needed!** Once configured, all Firebase and GCP commands automatically use impersonated credentials:

```bash
npx firebase deploy --only firestore:rules
gcloud firestore indexes list --project=curb-map-development
node migrations/deploy-functions.js
```

Tokens automatically refresh when expired (typically 1-hour lifetime).

### Credential Flow

```
Personal Google Account (MFA)
    ↓
Has permission to impersonate service account
    ↓
Generates short-lived token (1-12 hours)
    ↓
Token stored in ~/.config/gcloud/application_default_credentials.json
    ↓
All API calls use token (auto-refresh)
```

---

## Security Benefits

### vs. Service Account Keys

| Aspect          | Keys (OLD)          | Impersonation (NEW)          |
|-----------------|---------------------|------------------------------|
| **Lifetime**    | Permanent           | 1-12 hours (auto-expire)     |
| **Storage**     | JSON file on laptop | No files                     |
| **Audit Trail** | SA only             | User + SA identity           |
| **Theft Risk**  | Full access         | Token expires                |
| **Revocation**  | Find/delete key     | Remove IAM binding (instant) |
| **MFA**         | No                  | Yes                          |
| **Rotation**    | Manual (90 days)    | Automatic                    |

### SOC2 Advantages

**Individual Accountability:** Audit logs show `developer@company.com impersonated firebase-infrastructure-sa@...` -
every action traced to a person.

**Easy Access Reviews:** Query IAM policies to see who can impersonate, generate quarterly reports, simple revocation.

**Fast Incident Response:** Compromised account? Remove IAM binding (< 5 min). No key rotation needed.

---

## Switching Environments

Each environment has its own service account. Switch by re-running impersonation setup:

```bash
# Development
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com

# Staging
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-staging.iam.gserviceaccount.com

# Production (requires separate permission grant)
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com
```

---

## Troubleshooting

### Check Current Impersonation

```bash
# Print access token (shows which SA is impersonated)
gcloud auth application-default print-access-token

# See who can impersonate a service account
gcloud iam service-accounts get-iam-policy \
  firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com
```

### Permission Denied Error

**Cause:** You don't have permission to impersonate the service account
**Solution:** Ask admin to grant you impersonation access (see Quick Start commands)

### Token Expired

Tokens auto-refresh, but if issues persist:

```bash
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com
```

### Stop Impersonation

```bash
# Revoke temporarily
gcloud auth application-default revoke

# Admin permanently removes access
gcloud iam service-accounts remove-iam-policy-binding \
  firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com \
  --member="user:developer@company.com" \
  --role="roles/iam.serviceAccountTokenCreator"
```

---

## Best Practices

### Developers

✅ **Do:**

- Use MFA on Google account
- Revoke impersonation when leaving project
- Report suspicious permission requests
- Keep gcloud SDK updated

❌ **Don't:**

- Create service account keys
- Share impersonation commands (everyone sets up individually)
- Use production unless necessary
- Export `GOOGLE_APPLICATION_CREDENTIALS` with key files

### Administrators

✅ **Do:**

- Grant impersonation individually per developer
- Restrict production access to authorized personnel
- Review impersonation permissions quarterly
- Document all permission grants

❌ **Don't:**

- Create service account keys
- Grant organization-wide impersonation
- Skip MFA enforcement
- Grant production access casually

---

## References

- **Setup Guide:** `specifications/F107-firebase-soc2-vanilla-app/next-step.md`
- **Access Management:** [access-management.md](access-management.md)
- **Audit Logs:** [audit-and-logging.md](audit-and-logging.md)
