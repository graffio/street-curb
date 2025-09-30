# Migration Testing Strategy

**Testing Configuration Changes on Real Firebase Projects**

## Overview

This strategy assumes Firebase projects are created manually in the console. Migrations configure services within existing projects using service account impersonation. Testing validates configuration changes, not project creation.

## Prerequisites

Before testing any migrations:

1. ✅ Firebase projects created manually in console (`manual-setup.md`)
2. ✅ Service accounts created with required roles (`phase1c-service-account.md`)
3. ✅ Developer authenticated via impersonation (`next-step.md`)

## Core Strategy

### 1. Test Against Development Project
**Migrations configure services, not create projects:**
- Test new configuration migrations directly against `curb-map-development`
- Configuration changes are low-risk (security rules, indexes, etc.)
- Easy to rollback (redeploy previous configuration)
- TAP tests verify configuration is correct
- Verify migration idempotency by running twice

### 2. Apply to Staging, Then Production
**After development testing succeeds:**
- Apply same migration to `curb-map-staging`
- Verify staging configuration matches development
- After staging validation, apply to `curb-map-production`
- Each environment's TAP tests must pass

**Why this approach?** Simpler workflow - no temporary project creation/deletion. Projects are stable, only configuration changes.

## Real Environment Names

**All environments created manually in console:**

```
curb-map-development    # Dev environment, frequent changes
curb-map-staging        # Pre-production validation
curb-map-production     # Live customer data, SOC2-compliant
```

**No temporary environments needed** - configuration changes test directly against development.

## Testing Workflow

### Test Migration on Development

```bash
# 1. Ensure impersonation is active
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com

# 2. Test migration (runs once)
node ../orchestration/src/cli.js shared/config/dev.config.js migrations/003-configure-auth.js --apply

# 3. Verify idempotency (run again)
node ../orchestration/src/cli.js shared/config/dev.config.js migrations/003-configure-auth.js --apply

# 4. TAP tests run automatically after migration
# ✅ If tests pass, migration is ready for staging
```

### Deploy to Staging

```bash
# 1. Switch to staging impersonation
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-staging.iam.gserviceaccount.com

# 2. Apply migration to staging
node ../orchestration/src/cli.js shared/config/staging.config.js migrations/003-configure-auth.js --apply
```

### Deploy to Production

```bash
# 1. Switch to production impersonation
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com

# 2. Apply migration to production (after staging validation)
node ../orchestration/src/cli.js shared/config/prod.config.js migrations/003-configure-auth.js --apply
```

## TAP Test Integration

### Migration Test Requirements
Each migration MUST include a corresponding `.tap.js` file following Given/When/Then format:

```javascript
// Example: 003-configure-auth.tap.js
import test from 'tap'
import { execSync } from 'child_process'

const configPath = process.argv[2]
if (!configPath) {
    console.error('Usage: node 003-configure-auth.tap.js <config-file>')
    process.exit(1)
}

test('Given Firebase Auth configuration migration completed', t => {
    t.test('When checking if Auth providers are enabled', async t => {
        const config = await import(configPath)
        const projectId = config.default.firebaseProject.projectId

        // Check if email/password provider enabled
        const emailEnabled = await checkAuthProvider(projectId, 'password')
        t.ok(emailEnabled, 'Then email/password provider should be enabled')

        // Check if Google provider enabled
        const googleEnabled = await checkAuthProvider(projectId, 'google.com')
        t.ok(googleEnabled, 'Then Google sign-in provider should be enabled')

        t.end()
    })

    t.end()
})
```

### Automatic Test Execution
The orchestration CLI automatically runs TAP tests after successful migration execution.

## Failure Handling

### Configuration Migration Failure
1. **Debug**: Check error message from orchestration CLI
2. **Fix**: Update migration code or configuration files
3. **Retry**: Run migration again (should be idempotent)
4. **Rollback**: Deploy previous configuration if needed

### Common Issues & Solutions

**Permission Denied**:
```bash
# Verify impersonation is active
gcloud auth application-default print-access-token

# Re-authenticate if needed
gcloud auth application-default login --impersonate-service-account=...
```

**Service Not Enabled**:
```bash
# Enable required Firebase services in console first
# Or add to migration prerequisites
```

**Configuration Conflict**:
```javascript
// Make migrations idempotent - check before creating
const exists = await checkConfigExists()
if (exists) {
  console.log('[SKIP] Already configured')
  return
}
```

## Success Criteria

### Individual Migration Validation
```bash
# Run migration on development
node ../orchestration/src/cli.js shared/config/dev.config.js migrations/003-configure-auth.js --apply

# Verify these outcomes:
# 1. Migration completed without errors
echo "✅ Migration executed successfully"

# 2. TAP tests passed (runs automatically)
echo "✅ TAP tests passed - configuration verified"

# 3. Idempotency verified (run again)
node ../orchestration/src/cli.js shared/config/dev.config.js migrations/003-configure-auth.js --apply
echo "✅ Migration is idempotent - safe to re-run"
```

### Environment Promotion Checklist
```bash
# 1. ✅ Tested on development
# 2. ✅ TAP tests pass
# 3. ✅ Idempotency verified
# 4. ✅ Applied to staging
# 5. ✅ Staging tests pass
# 6. ✅ Ready for production
```

## SOC2 Compliance

### Audit Trail
- **Git history**: All migration code version controlled
- **Orchestration logs**: Complete execution logs with timestamps
- **GCP audit logs**: Show user identity + impersonated service account
- **TAP test results**: Verify configuration state after changes

### Change Management
1. **Development**: Test configuration changes freely
2. **Staging**: Validate before production
3. **Production**: Require approval + staging validation
4. **Rollback**: Previous configurations in git history

### Access Control
- **Service account impersonation**: Individual developer accountability
- **MFA required**: User accounts have multi-factor authentication
- **Short-lived tokens**: Credentials expire automatically (1-12 hours)
- **Permission reviews**: Audit who has impersonation access

## Migration Patterns

### Pattern 1: Deploy Configuration Files
```javascript
// Deploy Firestore security rules
const deployRules = async (projectId, isDryRun) => {
  if (isDryRun) {
    console.log('[DRY-RUN] firebase deploy --only firestore:rules')
    return
  }

  await execShellCommand('npx firebase use ${projectId}')
  await execShellCommand('npx firebase deploy --only firestore:rules')
}
```

### Pattern 2: Configure via Admin SDK
```javascript
// Enable Auth providers
const configureAuth = async (projectId, isDryRun) => {
  if (isDryRun) {
    console.log('[DRY-RUN] Enable email/password and Google providers')
    return
  }

  const admin = await initializeAdmin(projectId)
  await admin.auth().updateProviderConfig('password', { enabled: true })
  await admin.auth().updateProviderConfig('google.com', { enabled: true })
}
```

### Pattern 3: Idempotency Check
```javascript
// Always check before creating
const configureService = async (projectId, isDryRun) => {
  const exists = await checkIfConfigured(projectId)
  if (exists) {
    console.log('[SKIP] Service already configured')
    return { status: 'success', output: 'already configured' }
  }

  // Proceed with configuration...
}
```

## Cost Management

### No Temporary Environments
- **No cleanup needed**: Using real, stable environments
- **Predictable costs**: Same 3 projects (dev, staging, prod)
- **No waste**: No temporary project creation/deletion

### Configuration Testing is Cheap
- Most configuration changes are free (security rules, indexes)
- Cloud Functions deployments: Minimal cost
- Storage: Negligible for configuration files

This strategy balances development speed with production safety while maintaining SOC2 compliance.
