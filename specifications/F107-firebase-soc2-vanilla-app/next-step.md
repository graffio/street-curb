# Next Step – Service Account Impersonation Setup

## Objective
Configure service account impersonation for developer laptop authentication without managing key files. This follows Google Cloud 2025 best practices and eliminates long-lived credentials.

## Prerequisites
1. Firebase projects created manually in console (dev, staging, prod)
2. Developer has authenticated: `gcloud auth login`
3. Developer account has MFA enabled (recommended for security)

## Actions

### 1. Create Service Accounts (One per project)
```bash
# For each project (development, staging, production)
gcloud iam service-accounts create firebase-infrastructure-sa \
  --display-name="Firebase Infrastructure Management" \
  --project=curb-map-development

# Assign required roles
gcloud projects add-iam-policy-binding curb-map-development \
  --member="serviceAccount:firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com" \
  --role="roles/firebase.admin"

gcloud projects add-iam-policy-binding curb-map-development \
  --member="serviceAccount:firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com" \
  --role="roles/datastore.owner"

gcloud projects add-iam-policy-binding curb-map-development \
  --member="serviceAccount:firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
```

### 2. Grant Developer Impersonation Permission
```bash
# For each developer
gcloud iam service-accounts add-iam-policy-binding \
  firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com \
  --member="user:developer@company.com" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --project=curb-map-development
```

### 3. Developer Setup (One-time per project)
```bash
# Authenticate with personal account (if not already done)
gcloud auth login

# Set up impersonation for development project
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com

# Verify it works
gcloud auth application-default print-access-token
```

### 4. Update Documentation
- Document impersonation workflow in project README
- Add commands for switching between projects
- Document how to grant/revoke access for team members

## Benefits Over Key Files

| Aspect | Service Account Keys (OLD) | Service Account Impersonation (NEW) |
|--------|---------------------------|-------------------------------------|
| Setup Complexity | Download + secure key file | One gcloud command |
| Credential Lifetime | Permanent | 1-12 hours |
| Security | High risk if leaked | Minimal risk (short-lived) |
| Revocation | Delete key manually | Remove IAM binding |
| Audit Trail | Service account only | User + service account |
| MFA Protection | No | Yes |
| Git Risk | Can accidentally commit | Nothing to commit |

## Daily Workflow (After Setup)

```bash
# Nothing! Just use gcloud/firebase commands normally.
# Tokens refresh automatically when expired.

# Example - deploy security rules
npx firebase use curb-map-development
npx firebase deploy --only firestore:rules

# Example - run migration script
node migrations/006-create-service-account.js --apply
```

## Switching Between Projects

```bash
# Switch to staging
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-staging.iam.gserviceaccount.com

# Switch back to development
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com
```

## Troubleshooting

### "Permission denied" errors
```bash
# Verify you have impersonation permission
gcloud iam service-accounts get-iam-policy \
  firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com \
  --project=curb-map-development

# Should show your email with roles/iam.serviceAccountTokenCreator
```

### Token expired
```bash
# Tokens auto-refresh, but if having issues:
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com
```

### Stop impersonation
```bash
# Return to your user credentials
gcloud auth application-default revoke

# Re-authenticate as yourself without impersonation
gcloud auth application-default login
```

## Next Steps

Once service account impersonation is working:
1. ✅ Test Firebase Admin SDK operations locally
2. ✅ Verify audit logs show user identity + service account
3. ✅ Proceed to Phase 2: Event Sourcing Core implementation
4. ✅ Update CI/CD pipelines to use Workload Identity Federation (more secure than impersonation for automation)
