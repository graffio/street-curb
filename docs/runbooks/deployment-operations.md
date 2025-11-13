# Deployment Operations Runbook

**Purpose**: Deployment procedures for CurbMap environments.

**Related Architecture**: See [deployment.md](../architecture/deployment.md) for architecture context.

---

## Current Status

**Deployments to staging and production are deferred.** The project currently uses Firebase emulators only for local development and testing. No CI/CD pipeline exists. Production deployment procedures will be implemented when needed.

---

## Table of Contents

1. [Creating a New Environment](#creating-a-new-environment)
2. [Post-Deployment Validation](#post-deployment-validation)
3. [References](#references)

---

## Creating a New Environment

**When**: Setting up a new GCP/Firebase project for development, staging, or production.

**Prerequisites**:
- GCP account with billing enabled
- Firebase CLI installed (`npm install -g firebase-tools`)
- Project admin permissions

**Firebase Setup**:
1. Create a GCP project via the [GCP Console](https://console.cloud.google.com/)
2. Add Firebase to the project via the [Firebase Console](https://console.firebase.google.com/)
3. Initialize Firestore database (select production mode, us-central1 region)
4. Configure Firebase project locally: `firebase use --add`
5. Deploy Firestore rules and indexes: `firebase deploy --only firestore:rules,firestore:indexes`

For detailed instructions on enabling APIs, service accounts, and environment configuration, see:
- [Firebase CLI documentation](https://firebase.google.com/docs/cli)
- [Cloud Functions setup](https://firebase.google.com/docs/functions/get-started)
- [Firestore setup](https://firebase.google.com/docs/firestore/quickstart)

**Environment Variables**: See [Firebase Functions configuration docs](https://firebase.google.com/docs/functions/config-env) for setting environment variables and managing secrets with Google Secret Manager.

---

## Post-Deployment Validation

**When**: After deploying to any environment (when deployments are implemented).

### Basic Health Checks

**Health endpoint**:
```bash
curl https://[your-domain]/health
# Expected: {"status": "ok", "environment": "[env]", "version": "[version]"}
```

**Function verification**:
```bash
firebase functions:list --project [project-alias]
# Verify all functions are deployed and active
```

### Manual Validation Steps

1. **Authentication**: Log in with test passcode, verify successful authentication
2. **Action submission**: Submit test action request, verify HTTP 200 response
3. **Firestore check**: Verify data written to Firestore collections
4. **Error monitoring**: Check Cloud Logging and error tracking tools for new errors

### Monitoring

- **Cloud Monitoring**: [GCP Console Monitoring Dashboard](https://console.cloud.google.com/monitoring)
- **Cloud Logging**: [GCP Console Logs](https://console.cloud.google.com/logs)
- **Firestore**: [Firebase Console Firestore](https://console.firebase.google.com/project/_/firestore)

For detailed monitoring setup, see [Cloud Monitoring documentation](https://cloud.google.com/monitoring/docs).

---

## References

- **Architecture**: [deployment.md](../architecture/deployment.md) - Deployment architecture context
- **Firebase Documentation**: https://firebase.google.com/docs - Complete Firebase documentation
- **Cloud Functions**: https://firebase.google.com/docs/functions - Cloud Functions documentation
- **Firestore**: https://firebase.google.com/docs/firestore - Firestore documentation
- **Secret Manager**: https://cloud.google.com/secret-manager/docs - Google Secret Manager documentation
