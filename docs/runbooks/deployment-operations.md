# Deployment Operations Runbook

**Purpose**: Step-by-step procedures for deploying CurbMap to development, staging, and production environments.

**Related Architecture**: See [deployment.md](../architecture/deployment.md) for architecture context (WHY we deploy this way)

---

## Table of Contents

1. [Creating a New Environment](#creating-a-new-environment)
2. [Deploying to Development](#deploying-to-development)
3. [Deploying to Staging](#deploying-to-staging)
4. [Deploying to Production](#deploying-to-production)
5. [Rolling Back a Deployment](#rolling-back-a-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Secrets Management](#secrets-management)
8. [Post-Deployment Validation](#post-deployment-validation)
9. [Troubleshooting](#troubleshooting)
10. [Emergency Procedures](#emergency-procedures)

---

## Creating a New Environment

**When**: Setting up a new GCP project for development, staging, or production.

### Prerequisites
- GCP account with billing enabled
- Firebase CLI installed (`npm install -g firebase-tools`)
- Project admin permissions

### Step-by-Step

1. **Create GCP Project**
   ```bash
   # Via GCP Console (https://console.cloud.google.com/)
   # - Click "Select a project" → "New Project"
   # - Project name: curb-map-development (or staging/production)
   # - Organization: (select your org)
   # - Location: (select folder if applicable)
   # - Click "Create"

   # Note the Project ID (e.g., curb-map-development)
   ```

2. **Enable Firebase**
   ```bash
   # Via Firebase Console (https://console.firebase.google.com/)
   # - Click "Add project"
   # - Select the GCP project you just created
   # - Enable Google Analytics (optional, recommended for production)
   # - Click "Add Firebase"
   ```

3. **Enable Required APIs**
   ```bash
   # Set project
   gcloud config set project curb-map-development

   # Enable APIs
   gcloud services enable \
     firestore.googleapis.com \
     cloudfunctions.googleapis.com \
     cloudscheduler.googleapis.com \
     secretmanager.googleapis.com \
     cloudlogging.googleapis.com \
     cloudmonitoring.googleapis.com
   ```

4. **Initialize Firestore**
   ```bash
   # Via Firebase Console
   # - Go to Firestore Database
   # - Click "Create database"
   # - Select "Production mode"
   # - Choose location: us-central1 (Iowa)
   # - Click "Enable"
   ```

5. **Configure Firebase Project**
   ```bash
   # Add project to .firebaserc
   firebase use --add
   # Select the project from list
   # Alias: dev (or staging, prod)

   # Deploy Firestore rules and indexes
   firebase deploy --only firestore:rules,firestore:indexes --project dev
   ```

6. **Set Up Service Accounts**
   ```bash
   # Create service account for Cloud Functions
   gcloud iam service-accounts create firebase-functions \
     --display-name="Firebase Functions Service Account"

   # Grant Firestore access
   gcloud projects add-iam-policy-binding curb-map-development \
     --member="serviceAccount:firebase-functions@curb-map-development.iam.gserviceaccount.com" \
     --role="roles/datastore.user"
   ```

7. **Configure Secrets**
   - See [Secrets Management](#secrets-management) section below

8. **Deploy Initial Infrastructure**
   ```bash
   # Deploy hosting, functions, storage rules
   firebase deploy --project dev
   ```

9. **Verify Deployment**
   - See [Post-Deployment Validation](#post-deployment-validation) section below

---

## Deploying to Development

**When**: Testing new features, bug fixes, or changes before merging to develop branch.

### Automatic Deployment (Recommended)

Development deploys automatically when you push to a feature branch:

```bash
# Make changes
git add .
git commit -m "feat: add new feature"

# Push to feature branch
git push origin feature/new-feature

# GitLab CI automatically:
# 1. Runs tests
# 2. Security scan
# 3. Builds artifacts
# 4. Deploys to development environment
```

**Timeline**: ~5-10 minutes from push to deployed

**Verification**: Check GitLab CI pipeline status at https://gitlab.com/your-org/curb-map/-/pipelines

### Manual Deployment (If Needed)

If you need to deploy manually (CI/CD failure, testing deployment process):

```bash
# 1. Ensure you're on the correct branch
git status

# 2. Run tests locally
npm test
npm run test:integration

# 3. Build artifacts
npm run build

# 4. Deploy to development
firebase deploy --only hosting,functions --project dev

# 5. Verify deployment
curl https://curb-map-development.web.app/health
# Expected: {"status": "ok"}
```

**Rollback**: Development is ephemeral - no rollback needed, just redeploy previous commit.

---

## Deploying to Staging

**When**: After feature branch merged to develop, validate changes in production-like environment.

### Automatic Deployment (Recommended)

Staging deploys automatically when you merge to develop branch:

```bash
# 1. Create merge request (via GitLab UI)
# - Source: feature/new-feature
# - Target: develop
# - Click "Create merge request"

# 2. Code review (teammate reviews changes)

# 3. Approve and merge (via GitLab UI)

# GitLab CI automatically:
# 1. Runs tests on develop branch
# 2. Security scan
# 3. Builds artifacts
# 4. Deploys to staging environment
```

**Timeline**: ~10-15 minutes from merge to deployed

**Verification**: Check staging at https://curb-map-staging.web.app

### Manual Deployment (If Needed)

```bash
# 1. Switch to develop branch
git checkout develop
git pull origin develop

# 2. Run tests
npm test
npm run test:integration
npm run test:e2e

# 3. Build artifacts
npm run build

# 4. Deploy to staging
firebase deploy --only hosting,functions --project staging

# 5. Run smoke tests
npm run test:smoke -- --env=staging

# 6. Verify deployment
curl https://curb-map-staging.web.app/health
# Expected: {"status": "ok", "environment": "staging"}
```

**Rollback**: See [Rolling Back a Deployment](#rolling-back-a-deployment) section

---

## Deploying to Production

**When**: After successful validation in staging, ready to release to customers.

### Prerequisites
- ✅ All tests passing in staging
- ✅ Smoke tests completed successfully
- ✅ Code review approved
- ✅ Product owner approval (for feature releases)

### Deployment Process

Production requires **manual approval** in GitLab CI:

```bash
# 1. Create merge request to main
# - Via GitLab UI
# - Source: develop
# - Target: main
# - Click "Create merge request"

# 2. Final review (senior developer reviews changes)

# 3. Approve and merge (via GitLab UI)

# 4. GitLab CI pipeline starts
# - Runs tests on main branch
# - Security scan
# - Builds artifacts
# - PAUSES at "deploy-production" job

# 5. Manual approval required (via GitLab UI)
# - Go to https://gitlab.com/your-org/curb-map/-/pipelines
# - Click on latest pipeline
# - Click "deploy-production" job
# - Click "Play" button to approve
# - CONFIRM: Are you sure you want to deploy to production? [Yes]

# 6. GitLab CI deploys to production
# - Deploys hosting, functions
# - Creates Sentry release
# - Sends Slack notification

# 7. Verify deployment (automated health checks + manual validation)
```

**Timeline**: ~15-20 minutes from merge to deployed (including approval wait time)

### Manual Production Deployment (Emergency Only)

**WARNING**: Only use for critical security patches. Bypasses approval gate.

```bash
# 1. Verify you're on main branch with latest changes
git checkout main
git pull origin main

# 2. Run all tests (MANDATORY)
npm test
npm run test:integration
npm run test:e2e

# 3. Build artifacts
npm run build

# 4. Deploy to production (requires --force flag)
firebase deploy --only hosting,functions --project prod --force

# 5. Create Sentry release manually
sentry-cli releases new $(git rev-parse --short HEAD)
sentry-cli releases finalize $(git rev-parse --short HEAD)

# 6. Send notification
# - Post in #deployments Slack channel
# - Include: commit hash, reason for emergency deploy, verification steps

# 7. Verify deployment immediately
npm run test:smoke -- --env=production

# 8. Monitor Sentry for new errors (next 30 minutes)
# - https://sentry.io/organizations/curb-map/issues/
# - Watch for error rate spike
```

### Post-Deployment Verification

After production deployment completes:

1. **Health Check** (automated)
   ```bash
   curl https://curbmap.app/health
   # Expected: {"status": "ok", "environment": "production", "version": "1.2.3"}
   ```

2. **Smoke Tests** (automated)
   ```bash
   npm run test:smoke -- --env=production
   # Expected: All critical user flows pass
   ```

3. **Manual Verification** (human)
   - Log in as test user
   - Create test action request
   - Verify action processed successfully
   - Check Firestore for new completedAction record

4. **Monitor Sentry** (30 minutes)
   - Watch for new errors: https://sentry.io/organizations/curb-map/issues/
   - Expected: Error rate < 1%, no new critical errors

5. **Monitor Cloud Monitoring** (1 hour)
   - Function invocations: https://console.cloud.google.com/functions
   - Expected: Normal traffic patterns, latency < 2s p95

6. **Customer Notification** (if applicable)
   - For breaking changes: Email customers 24h before deployment
   - For new features: Announce in product updates
   - For bug fixes: No notification needed

---

## Rolling Back a Deployment

**When**: Production deployment causes critical issues (error rate spike, data corruption, customer-impacting bug).

### Quick Rollback (< 5 minutes)

```bash
# 1. Identify previous working version
firebase hosting:channel:list --project prod
# Note the previous version number (e.g., v1.2.2)

# 2. Rollback hosting (static web app)
firebase hosting:channel:deploy v1.2.2 --project prod --only hosting

# 3. Rollback Cloud Functions
# Via GCP Console (https://console.cloud.google.com/functions)
# - Select each function (submitActionRequest, stripeWebhook)
# - Click "⋮" → "View All Versions"
# - Select previous version
# - Click "Redeploy"
# - Confirm

# 4. Verify rollback
curl https://curbmap.app/health
# Expected: {"version": "1.2.2"} (previous version)

# 5. Monitor Sentry
# - Watch for error rate decline
# - Expected: Errors return to baseline within 5 minutes

# 6. Post-mortem
# - Document what went wrong
# - Create GitLab issue
# - Schedule team post-mortem meeting
```

### Git Rollback (if deployment artifacts lost)

```bash
# 1. Revert commit on main branch
git checkout main
git revert HEAD
git push origin main

# 2. Trigger CI/CD pipeline
# - GitLab CI will deploy reverted code
# - Still requires manual approval

# 3. Approve deployment (via GitLab UI)

# 4. Verify rollback
npm run test:smoke -- --env=production
```

### Database Rollback (Firestore)

**WARNING**: Only use for data corruption. Firestore rollback is DESTRUCTIVE.

```bash
# 1. Stop all traffic (maintenance mode)
# - Update Firestore rules to block all writes
# - Deploy rules: firebase deploy --only firestore:rules --project prod

# 2. Restore from backup
# Via GCP Console (https://console.cloud.google.com/firestore/backups)
# - Select backup (daily backups, 30-day retention)
# - Choose restore point (timestamp before corruption)
# - Create new database or overwrite existing
# - Confirm restore (IRREVERSIBLE)

# 3. Re-enable traffic
# - Restore Firestore rules
# - Deploy rules: firebase deploy --only firestore:rules --project prod

# 4. Verify data integrity
# - Query sample records
# - Check completedActions collection
# - Verify latest customer data

# 5. Customer communication
# - Email affected customers
# - Explain: data restored to [timestamp], actions after that lost
# - Offer support for re-submission
```

---

## Environment Configuration

### Updating Environment Variables

```bash
# 1. Set environment variable for Cloud Functions
firebase functions:config:set \
  stripe.key="sk_test_..." \
  sentry.dsn="https://..." \
  --project dev

# 2. View current config
firebase functions:config:get --project dev

# 3. Deploy functions to apply config
firebase deploy --only functions --project dev
```

### Updating Secrets (Google Secret Manager)

```bash
# 1. Create secret
echo -n "sk_live_..." | gcloud secrets create stripe-live-key \
  --data-file=- \
  --project=curb-map-production

# 2. Grant Cloud Functions access
gcloud secrets add-iam-policy-binding stripe-live-key \
  --member="serviceAccount:firebase-functions@curb-map-production.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=curb-map-production

# 3. Update secret value
echo -n "sk_live_new_..." | gcloud secrets versions add stripe-live-key \
  --data-file=- \
  --project=curb-map-production

# 4. Update function code to use secret
# (Code changes required, see F107 specification)

# 5. Deploy functions
firebase deploy --only functions --project prod
```

---

## Secrets Management

### Stripe API Keys

**Development/Staging** (test mode):
```bash
# Store in Firebase Functions config
firebase functions:config:set \
  stripe.key="sk_test_..." \
  stripe.webhook_secret="whsec_..." \
  --project dev

# Or store in Secret Manager (recommended)
echo -n "sk_test_..." | gcloud secrets create stripe-test-key \
  --data-file=- \
  --project=curb-map-development
```

**Production** (live mode):
```bash
# ALWAYS use Secret Manager for production secrets
echo -n "sk_live_..." | gcloud secrets create stripe-live-key \
  --data-file=- \
  --project=curb-map-production

# Rotate secrets every 90 days (security best practice)
# - Create new Stripe API key in Stripe dashboard
# - Add new secret version (step 3 above)
# - Deploy functions
# - Verify functionality
# - Delete old Stripe key in Stripe dashboard
```

### Sentry DSN

```bash
# Per-environment Sentry projects
# Development: https://dev-sentry-dsn
# Staging: https://staging-sentry-dsn
# Production: https://prod-sentry-dsn

# Store in Firebase Functions config
firebase functions:config:set \
  sentry.dsn="https://prod-sentry-dsn" \
  --project prod
```

### Service Account Keys

**AVOID**: Long-lived service account keys (security risk)

**RECOMMENDED**: Service account impersonation (no keys needed)

```bash
# Grant developer access to impersonate service account
gcloud iam service-accounts add-iam-policy-binding \
  firebase-functions@curb-map-production.iam.gserviceaccount.com \
  --member="user:developer@example.com" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --project=curb-map-production

# Use impersonation for gcloud commands
gcloud config set auth/impersonate_service_account \
  firebase-functions@curb-map-production.iam.gserviceaccount.com
```

---

## Post-Deployment Validation

### Automated Validation

```bash
# 1. Health check endpoint
curl https://curbmap.app/health
# Expected: {"status": "ok", "environment": "production", "version": "1.2.3"}

# 2. Smoke tests (critical user flows)
npm run test:smoke -- --env=production
# Tests:
# - User authentication (passcode login)
# - Action submission (create organization)
# - Firestore read/write
# - Stripe webhook processing (test mode)

# 3. Sentry release verification
sentry-cli releases list
# Expected: Latest release shows 0 new issues
```

### Manual Validation

1. **Log In**
   - Go to https://curbmap.app
   - Enter test passcode
   - Verify authentication succeeds

2. **Create Test Action**
   - Submit test action request (OrganizationCreated)
   - Verify HTTP 200 response
   - Check Firestore: completedActions collection has new record
   - Check Sentry: No new errors

3. **Verify Billing Integration**
   - Trigger test webhook (Stripe dashboard → Webhooks → Send test event)
   - Verify webhook processed (check Cloud Logging)
   - Verify organization status updated (Firestore)

4. **Monitor Performance**
   - Cloud Monitoring dashboard: https://console.cloud.google.com/monitoring
   - Check function latency (p50, p95, p99)
   - Check error rate (should be < 1%)
   - Check Firestore read/write counts

---

## Troubleshooting

### Deployment Fails: "Permission Denied"

**Symptom**: `firebase deploy` fails with "Permission denied" error

**Solution**:
```bash
# 1. Re-authenticate
firebase login

# 2. Verify project access
firebase projects:list
# Expected: See curb-map-development, curb-map-staging, curb-map-production

# 3. Check IAM permissions
gcloud projects get-iam-policy curb-map-production
# Expected: Your email has "roles/editor" or "roles/owner"

# 4. If missing permissions, request from admin
```

### Function Deployment Fails: "Build Error"

**Symptom**: Cloud Functions deployment fails during build

**Solution**:
```bash
# 1. Check build logs
firebase functions:log --project prod

# 2. Common issues:
# - Missing dependency: Add to package.json, redeploy
# - Syntax error: Fix code, commit, redeploy
# - Out of memory: Increase function memory in firebase.json

# Example: Increase memory
# firebase.json:
{
  "functions": {
    "memory": "512MB"  # Default is 256MB
  }
}

# 3. Redeploy
firebase deploy --only functions --project prod
```

### Health Check Returns 404

**Symptom**: `curl https://curbmap.app/health` returns 404 Not Found

**Solution**:
```bash
# 1. Verify function deployed
firebase functions:list --project prod
# Expected: submitActionRequest function listed

# 2. Check function URL
gcloud functions describe submitActionRequest \
  --project=curb-map-production \
  --region=us-central1
# Note the "url" field

# 3. Test function directly
curl [function-url]/health

# 4. If function works but custom domain doesn't:
# - Check Firebase Hosting configuration (firebase.json)
# - Verify rewrite rules point to function
# - Redeploy hosting: firebase deploy --only hosting --project prod
```

### Sentry Errors After Deployment

**Symptom**: Sentry shows spike in errors after deployment

**Solution**:
```bash
# 1. Check Sentry issues: https://sentry.io/organizations/curb-map/issues/
# - Look for new errors (not existing)
# - Check error messages and stack traces

# 2. Common issues:
# - Breaking API change: Rollback deployment
# - Missing environment variable: Set variable, redeploy
# - New bug introduced: Fix code, redeploy

# 3. If critical, rollback immediately
# See "Rolling Back a Deployment" section

# 4. If not critical, fix in new deployment
git checkout -b hotfix/fix-sentry-errors
# Fix code
git commit -m "fix: resolve Sentry errors from deployment"
# Push and deploy
```

---

## Emergency Procedures

### Critical Security Patch

**Scenario**: Security vulnerability discovered, needs immediate deployment.

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/security-patch

# 2. Apply security patch
# - Fix vulnerability
# - Run tests: npm test
# - Commit: git commit -m "security: fix [vulnerability]"

# 3. Deploy to development (test patch)
git push origin hotfix/security-patch
# GitLab CI auto-deploys to development

# 4. Verify fix in development
npm run test:security -- --env=dev

# 5. Deploy to staging (bypass normal flow)
git push origin hotfix/security-patch:develop --force
# GitLab CI auto-deploys to staging

# 6. Verify fix in staging
npm run test:security -- --env=staging

# 7. Deploy to production (manual emergency deployment)
git push origin hotfix/security-patch:main --force
# Approve in GitLab CI (manual approval still required for audit trail)

# OR bypass CI/CD entirely (true emergency)
firebase deploy --only hosting,functions --project prod --force

# 8. Verify fix in production
npm run test:security -- --env=production

# 9. Customer notification (if applicable)
# - Email affected customers
# - Document patch in security advisory
# - Post in #security Slack channel

# 10. Post-mortem
# - Document vulnerability
# - Update security procedures
# - Review similar code patterns
```

### Production Outage

**Scenario**: Production completely down, customers cannot access application.

```bash
# 1. Assess severity
curl https://curbmap.app/health
# If 5xx or timeout → outage confirmed

# 2. Check Cloud Status
# - GCP Status: https://status.cloud.google.com/
# - Firebase Status: https://status.firebase.google.com/
# - If provider outage → wait for resolution, customer notification

# 3. Check recent deployments
firebase hosting:channel:list --project prod
# If recent deployment → rollback immediately (see "Rolling Back" section)

# 4. Check Cloud Logging
# Via GCP Console: https://console.cloud.google.com/logs
# - Filter: severity >= ERROR
# - Look for patterns (e.g., "Out of memory", "Firestore quota exceeded")

# 5. Common issues and fixes:

# Issue: Firestore quota exceeded
# Solution: Request quota increase (via GCP Support)

# Issue: Function out of memory
# Solution: Increase function memory (firebase.json), redeploy

# Issue: Invalid Firestore rules deployment
# Solution: Rollback rules
firebase deploy --only firestore:rules --project prod

# 6. Customer communication
# - Post status update: https://status.curbmap.app
# - Send email to customers
# - Provide ETA for resolution

# 7. Escalation
# - If unresolved in 1 hour → escalate to CTO
# - If data loss suspected → escalate immediately

# 8. Post-outage
# - Document incident timeline
# - Schedule post-mortem meeting
# - Implement preventive measures
```

---

## References

- **Architecture**: [deployment.md](../architecture/deployment.md) - Deployment architecture context
- **Firebase Docs**: https://firebase.google.com/docs - Firebase documentation
- **GitLab CI Docs**: https://docs.gitlab.com/ee/ci/ - GitLab CI/CD documentation
- **Other Runbooks**:
  - [Incident Response](./incident-response.md) - Production incident procedures (if exists)
  - [Disaster Recovery](./disaster-recovery.md) - Disaster recovery procedures (if exists)
