# Manual Firebase Infrastructure Setup

**One-Time Console Setup for CurbMap Environments**

This guide covers the manual infrastructure setup that happens once per environment. After this setup, all ongoing configuration is scripted (see `phase1b-firebase-services.md`).

## Philosophy

**Infrastructure Setup (Manual, One-Time):**
- Create Firebase projects
- Create service accounts
- Grant permissions
- Link billing

**Infrastructure Operations (Scripted, Ongoing):**
- Deploy security rules
- Configure Firebase services
- Deploy Cloud Functions
- Manage indexes

## Prerequisites

- Google account with billing enabled
- MFA enabled on your Google account (recommended)
- Organization/folder access in GCP (or create projects at root level)
- Basic familiarity with Firebase Console and gcloud CLI

## Step 1: Create Firebase Projects

### 1.1 Create Development Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: **`CurbMap Development`**
4. Project ID will be suggested (use: **`curb-map-development`**)
5. **Disable** Google Analytics (not needed for development)
6. Click "Create project"
7. Wait for project creation (~1 minute)

### 1.2 Create Staging Project

Repeat above steps with:
- Project name: **`CurbMap Staging`**
- Project ID: **`curb-map-staging`**
- Disable Google Analytics

### 1.3 Create Production Project

Repeat above steps with:
- Project name: **`CurbMap Production`**
- Project ID: **`curb-map-production`**
- **Enable** Google Analytics (for production monitoring)

### 1.4 Link Billing Accounts

For each project:
1. Open [GCP Console → Billing](https://console.cloud.google.com/billing)
2. Select the project from dropdown
3. Click "Link a billing account"
4. Select your billing account
5. Click "Set account"

✅ **Verification:** All three projects should show "Billing enabled" status

## Step 2: Enable Firebase Services

For each project (development, staging, production):

### 2.1 Enable Firestore

1. In Firebase Console → select project
2. Navigate to **Firestore Database**
3. Click "Create database"
4. Select **"Production mode"** (we'll deploy rules via migrations)
5. Choose location: **`us-west1`** (or your preferred region)
6. Click "Enable"

### 2.2 Enable Authentication

1. Navigate to **Authentication**
2. Click "Get started"
3. Service is now enabled (providers configured via migrations)

### 2.3 Enable Cloud Functions

1. Navigate to **Functions**
2. Click "Get started"
3. Click "Upgrade project" if prompted (required for Functions)
4. Service is now enabled

### 2.4 Enable Cloud Storage

1. Navigate to **Storage**
2. Click "Get started"
3. Choose location: **Same as Firestore** (`us-west1`)
4. Service is now enabled

### 2.5 Optional: Enable Other Services

Based on your needs:
- **App Hosting** (modern web app deployment)
- **Remote Config** (feature flags)
- **App Check** (staging/production only - abuse protection)

✅ **Verification:** Firebase Console dashboard should show all enabled services

## Step 3: Create Service Accounts

For each project, create a service account for infrastructure operations:

### 3.1 Development Service Account

```bash
# Set project
gcloud config set project curb-map-development

# Create service account
gcloud iam service-accounts create firebase-infrastructure-sa \
  --display-name="Firebase Infrastructure Management" \
  --description="Service account for Firebase infrastructure operations"

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

gcloud projects add-iam-policy-binding curb-map-development \
  --member="serviceAccount:firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com" \
  --role="roles/cloudfunctions.admin"
```

### 3.2 Staging Service Account

```bash
# Set project
gcloud config set project curb-map-staging

# Create service account
gcloud iam service-accounts create firebase-infrastructure-sa \
  --display-name="Firebase Infrastructure Management"

# Assign roles (same as development)
gcloud projects add-iam-policy-binding curb-map-staging \
  --member="serviceAccount:firebase-infrastructure-sa@curb-map-staging.iam.gserviceaccount.com" \
  --role="roles/firebase.admin"

gcloud projects add-iam-policy-binding curb-map-staging \
  --member="serviceAccount:firebase-infrastructure-sa@curb-map-staging.iam.gserviceaccount.com" \
  --role="roles/datastore.owner"

gcloud projects add-iam-policy-binding curb-map-staging \
  --member="serviceAccount:firebase-infrastructure-sa@curb-map-staging.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding curb-map-staging \
  --member="serviceAccount:firebase-infrastructure-sa@curb-map-staging.iam.gserviceaccount.com" \
  --role="roles/cloudfunctions.admin"
```

### 3.3 Production Service Account

```bash
# Set project
gcloud config set project curb-map-production

# Create service account
gcloud iam service-accounts create firebase-infrastructure-sa \
  --display-name="Firebase Infrastructure Management"

# Assign roles (same as above)
gcloud projects add-iam-policy-binding curb-map-production \
  --member="serviceAccount:firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com" \
  --role="roles/firebase.admin"

gcloud projects add-iam-policy-binding curb-map-production \
  --member="serviceAccount:firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com" \
  --role="roles/datastore.owner"

gcloud projects add-iam-policy-binding curb-map-production \
  --member="serviceAccount:firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding curb-map-production \
  --member="serviceAccount:firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com" \
  --role="roles/cloudfunctions.admin"
```

✅ **Verification:** Check service accounts exist:
```bash
gcloud iam service-accounts list --project=curb-map-development
gcloud iam service-accounts list --project=curb-map-staging
gcloud iam service-accounts list --project=curb-map-production
```

## Step 4: Grant Developer Impersonation Permissions

For each developer who needs access:

### 4.1 Grant Development Access

```bash
gcloud iam service-accounts add-iam-policy-binding \
  firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com \
  --member="user:developer@company.com" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --project=curb-map-development
```

### 4.2 Grant Staging Access

```bash
gcloud iam service-accounts add-iam-policy-binding \
  firebase-infrastructure-sa@curb-map-staging.iam.gserviceaccount.com \
  --member="user:developer@company.com" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --project=curb-map-staging
```

### 4.3 Grant Production Access (Restrict to Authorized Personnel)

```bash
# Only grant production access to authorized personnel
gcloud iam service-accounts add-iam-policy-binding \
  firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com \
  --member="user:authorized-admin@company.com" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --project=curb-map-production
```

✅ **Verification:** Check who has impersonation access:
```bash
gcloud iam service-accounts get-iam-policy \
  firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com \
  --project=curb-map-development
```

## Step 5: Developer Workstation Setup

Each developer needs to set up service account impersonation on their laptop:

### 5.1 Authenticate with Personal Account

```bash
# Authenticate with your Google account
gcloud auth login

# Set default project (optional)
gcloud config set project curb-map-development
```

### 5.2 Set Up Impersonation for Development

```bash
# Configure Application Default Credentials to impersonate service account
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com

# Verify it works
gcloud auth application-default print-access-token
```

### 5.3 Verify Access

```bash
# Test Firebase CLI works
npx firebase projects:list

# Test gcloud access
gcloud firestore indexes list --project=curb-map-development
```

✅ **Verification:** Commands should work without prompting for authentication

## Success Criteria

After completing this setup:

### Infrastructure
- ✅ Three Firebase projects exist (development, staging, production)
- ✅ Billing linked to all projects
- ✅ Core Firebase services enabled (Firestore, Auth, Functions, Storage)
- ✅ Service accounts created in each project
- ✅ Service accounts have required IAM roles

### Developer Access
- ✅ Developers granted impersonation permissions
- ✅ Developer workstations configured with impersonation
- ✅ Firebase CLI commands work without manual authentication
- ✅ gcloud commands use impersonated credentials

### Security
- ✅ No service account key files created or downloaded
- ✅ MFA enabled on developer Google accounts
- ✅ Production access restricted to authorized personnel
- ✅ Audit logs capture user identity + impersonated service account

## Next Steps

Now that infrastructure is set up:

1. **Configure Firebase Services**: Follow `phase1b-firebase-services.md` to deploy security rules, indexes, and functions
2. **Start Development**: Begin implementing application features per `phase2-events.md`
3. **Test Configuration**: Use `migration-testing-strategy.md` to validate configuration changes

## Troubleshooting

### "Permission denied" when creating service account
**Solution:** Your user account needs `roles/iam.serviceAccountAdmin` at the project level:
```bash
gcloud projects add-iam-policy-binding curb-map-development \
  --member="user:your-email@company.com" \
  --role="roles/iam.serviceAccountAdmin"
```

### "Billing not enabled" error
**Solution:** Link billing account in GCP Console → Billing → Link account

### Impersonation not working
**Solution:** Verify you have `serviceAccountTokenCreator` role:
```bash
gcloud iam service-accounts get-iam-policy \
  firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com
```

### Firebase CLI not finding project
**Solution:** Use `npx firebase use <project-id>` to set active project

## Security Best Practices

### For Administrators
- ✅ Use MFA on all admin accounts
- ✅ Restrict production impersonation to minimal personnel
- ✅ Regularly review who has impersonation access
- ✅ Rotate production access quarterly (remove/re-grant)
- ✅ Monitor GCP audit logs for unusual activity

### For Developers
- ✅ Use MFA on your Google account
- ✅ Never create or download service account key files
- ✅ Revoke impersonation when leaving project: `gcloud auth application-default revoke`
- ✅ Report any suspicious permission requests
- ✅ Keep gcloud SDK updated

## Cost Management

### Expected Monthly Costs (Development)
- Firebase projects: Free (under free tier limits)
- Firestore: ~$1-5 (minimal reads/writes during development)
- Cloud Functions: ~$0-2 (minimal invocations)
- Cloud Storage: ~$0-1 (minimal storage)
- **Total:** ~$2-8/month for development

### Cost Optimization
- Use Firebase emulators for local development
- Delete test data regularly
- Monitor usage in GCP Console → Billing
- Set up budget alerts

## Appendix: Quick Reference

### Service Account Emails
```
development: firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com
staging:     firebase-infrastructure-sa@curb-map-staging.iam.gserviceaccount.com
production:  firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com
```

### Switch Between Environments
```bash
# Development
gcloud auth application-default login --impersonate-service-account=firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com

# Staging
gcloud auth application-default login --impersonate-service-account=firebase-infrastructure-sa@curb-map-staging.iam.gserviceaccount.com

# Production
gcloud auth application-default login --impersonate-service-account=firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com
```

### Revoke Impersonation
```bash
gcloud auth application-default revoke
```

### Check Current Impersonation
```bash
gcloud auth application-default print-access-token
```
