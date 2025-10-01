# Operational Guidelines

**Best Practices for Daily Operations**

## Executive Summary

This document provides operational best practices for administrators, developers, and production operators working with
CurbMap infrastructure. Following these guidelines ensures security, maintainability, and SOC2 compliance.

**Key Principles:**

- ✅ Use impersonation, never service account keys
- ✅ Document all access grants and changes
- ✅ Follow environment-specific procedures
- ✅ Maintain audit trail in git history
- ✅ Review access quarterly (dev/staging) or monthly (production)

**Quick Checklists:**

- **Developers:** [Daily Workflow](#developer-daily-workflow)
- **Operators:** [Production Deployment](#production-deployment-workflow)
- **Admins:** [Monthly/Quarterly Tasks](#administrator-recurring-tasks)

---

## Table of Contents

- [For Infrastructure Administrators](#for-infrastructure-administrators)
- [For Developers](#for-developers)
- [For Production Operators](#for-production-operators)
- [Environment-Specific Procedures](#environment-specific-procedures)
- [Common Scenarios](#common-scenarios)

---

## For Infrastructure Administrators

### Responsibilities

**Setup & Configuration:**

- Create Firebase projects in console
- Create service accounts
- Grant/revoke impersonation permissions
- Maintain manual-setup.md documentation

**Ongoing Operations:**

- Conduct access reviews (quarterly dev/staging, monthly production)
- Process access requests
- Respond to security incidents
- Maintain compliance evidence

### Administrator Daily Workflow

**Morning:**

1. Check for new access requests (email/tickets)
2. Review any security alerts or unusual activity
3. Check production audit logs for after-hours activity

**As Needed:**

- Process access requests (see [Access Management](access-management.md))
- Revoke access for departing employees immediately
- Investigate security incidents

**Weekly:**

- Review production access list
- Check for MFA issues
- Update documentation if procedures changed

### Administrator Recurring Tasks

**Monthly (Production Access Review):**

```bash
# 1. Export current production access
gcloud iam service-accounts get-iam-policy \
  firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com \
  --format=json > reviews/$(date +%Y-%m)-production.json

# 2. Check who actually used production (last 30 days)
gcloud logging read '
  protoPayload.authenticationInfo.serviceAccountDelegationInfo.principalSubject:"firebase-infrastructure-sa@curb-map-production"
  AND timestamp>="'$(date -d '30 days ago' -I)'T00:00:00Z"
' --format=json | jq -r '.[] | .protoPayload.authenticationInfo.principalEmail' | sort -u

# 3. Review for:
# - Anyone with access who didn't use it?
# - Anyone who left the company?
# - Anyone whose justification expired?

# 4. Document review
# - Save to compliance/access-reviews/YYYY-MM/
# - Get manager sign-off
```

**Quarterly (Dev/Staging Access Review):**
Same process as monthly, but for dev and staging environments.

**Quarterly (Evidence Collection):**

```bash
# Export IAM policies for all environments
for env in development staging production; do
  gcloud iam service-accounts get-iam-policy \
    firebase-infrastructure-sa@curb-map-${env}.iam.gserviceaccount.com \
    --format=json > compliance/access-reviews/$(date +%Y-Q1)/${env}-iam-policy.json
done

# Export sample audit logs
gcloud logging read 'timestamp>="'$(date -d '90 days ago' -I)'T00:00:00Z"' \
  --format=json --project=curb-map-production \
  --limit=1000 > compliance/audit-samples/$(date +%Y-Q1)-production.json

# Package for auditor
cd compliance/access-reviews/$(date +%Y-Q1)
zip -r ../$(date +%Y-Q1)-evidence.zip .
```

**Annually:**

- Conduct security incident drill (see [Incident Response](incident-response.md))
- Review and update all compliance documentation
- Verify MFA enforcement for all users
- Archive old access review documents

### Best Practices for Admins

**✅ Do:**

- Document all access grants with justification
- Process access requests within SLA (same day dev, 2-5 days production)
- Review production access monthly
- Verify MFA before granting production access
- Keep manual-setup.md up to date
- Respond to security incidents immediately (< 5 minutes for revocation)
- Archive compliance evidence for 7 years

**❌ Don't:**

- Never create service account keys
- Don't grant production access without manager approval
- Don't skip access reviews
- Don't grant broad permissions (use least privilege)
- Don't allow access without business justification

---

## For Developers

### Responsibilities

**Development Work:**

- Write and test migrations for configuration changes
- Deploy security rules and indexes to dev environment
- Follow git workflow (feature branches, PRs)
- Test changes in dev before promoting to staging

**Security:**

- Protect personal Google account with MFA
- Use impersonation (never create keys)
- Report suspicious activity immediately
- Follow least privilege principle

### Developer Daily Workflow

**Start of Day:**

```bash
# 1. Verify impersonation is configured
gcloud auth application-default print-access-token

# If expired or not configured:
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com

# 2. Pull latest code
git pull origin main

# 3. Verify you're pointed at development
gcloud config get-value project
# Should show: curb-map-development
```

**Development:**

```bash
# Make changes to migrations, rules, functions, etc.
# Run tests locally
yarn tap

# Deploy to development for testing
npx firebase deploy --only firestore:rules
# or
node migrations/deploy-indexes.js

# Check audit logs to verify deployment succeeded
gcloud logging read '
  protoPayload.authenticationInfo.principalEmail="your-email@company.com"
  AND timestamp>="'$(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%SZ)'"
' --limit 10
```

**End of Day:**

```bash
# Commit changes
git add .
git commit -m "feat: add new Firestore index for user queries"
git push origin feature/user-indexes

# Create pull request for review
```

### Switching Environments

**Development (default):**

```bash
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com
```

**Staging (if authorized):**

```bash
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-staging.iam.gserviceaccount.com
```

**Production (operators only - don't do this unless you're authorized):**

```bash
# This requires separate permission grant
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com
```

### Best Practices for Developers

**✅ Do:**

- Use MFA on your Google account
- Keep impersonation configured (tokens auto-refresh)
- Test in dev environment first
- Create PRs for code review
- Write descriptive commit messages
- Report security issues immediately
- Revoke impersonation when leaving project

**❌ Don't:**

- Never create service account keys
- Don't deploy directly to production (operators do this)
- Don't share impersonation commands (everyone sets up individually)
- Don't commit sensitive data
- Don't skip code review
- Don't work in production unless explicitly authorized

**Troubleshooting:**

- Token expired? Re-run impersonation setup
- Permission denied? Check which SA you're impersonating
- Wrong project? Verify with `gcloud config get-value project`

---

## For Production Operators

### Responsibilities

**Production Deployments:**

- Deploy approved changes to production
- Monitor production deployments
- Verify changes in production
- Rollback if issues occur

**Change Management:**

- Verify approval before deploying
- Document justification for deployments
- Follow deployment windows
- Coordinate with team

### Production Deployment Workflow

**Pre-Deployment (Required):**

```bash
# 1. Verify you have production access
gcloud iam service-accounts get-iam-policy \
  firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com | grep your-email@company.com

# 2. Verify change has been tested in staging
# Check git history and staging logs

# 3. Verify approval
# - Manager approval for change
# - PR merged to main branch
# - Change management ticket approved

# 4. Configure production impersonation
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com
```

**Deployment:**

```bash
# 5. Verify target environment
gcloud config get-value project
# MUST show: curb-map-production

# 6. Deploy change
npx firebase deploy --only firestore:rules
# or
node migrations/deploy-indexes.js

# 7. Verify deployment succeeded
gcloud logging read '
  protoPayload.authenticationInfo.principalEmail="your-email@company.com"
  AND resource.labels.project_id="curb-map-production"
  AND timestamp>="'$(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%SZ)'"
' --format=json | jq '.[] | {timestamp, method: .protoPayload.methodName, status: .protoPayload.status}'
```

**Post-Deployment:**

```bash
# 8. Test production changes
# - Verify rules work as expected
# - Check indexes are building
# - Monitor for errors

# 9. Document deployment
# - Update change management ticket
# - Note any issues or rollbacks
# - Notify team

# 10. Switch back to dev environment
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com
```

### Production Deployment Checklist

Before deploying to production, verify:

- [ ] Change tested in development
- [ ] Change tested in staging
- [ ] PR reviewed and approved
- [ ] PR merged to main branch
- [ ] Manager/CTO approval obtained
- [ ] Change management ticket created and approved
- [ ] Deployment window scheduled (or emergency justification documented)
- [ ] Rollback plan documented
- [ ] Team notified of deployment

### Emergency Production Changes

**When:** Critical bugs, security issues, production outages

**Process:**

1. **Get verbal approval** from CTO/Engineering Manager
2. **Deploy immediately** following standard deployment workflow
3. **Document post-deployment:**
    - What was the emergency?
    - What was changed?
    - Who gave verbal approval?
    - What was the outcome?
4. **Create post-incident report** within 24 hours
5. **Review in next access review**

### Best Practices for Operators

**✅ Do:**

- Get approval before every production deployment
- Document all production changes
- Test in staging first
- Follow deployment checklist
- Monitor production after deployment
- Switch back to dev after production work
- Report issues immediately

**❌ Don't:**

- Never deploy to production without approval
- Don't skip testing in staging
- Don't deploy during restricted hours (without justification)
- Don't leave production impersonation configured after deployment
- Don't deploy multiple changes at once (makes rollback harder)

---

## Environment-Specific Procedures

### Development Environment

**Purpose:** Feature development and testing
**Access:** All developers
**Approval:** Tech Lead (same day)

**Guidelines:**

- Experiment freely
- Test all changes here first
- No real customer data
- Can be wiped/rebuilt if needed

**Deployment:**

```bash
# Always use development SA
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com

# Deploy changes
npx firebase deploy --only firestore:rules
```

### Staging Environment

**Purpose:** Pre-production validation
**Access:** Senior developers, operators
**Approval:** Engineering Manager (1-2 days)

**Guidelines:**

- Production-like configuration
- Synthetic data only (no real customer data)
- Test production deployments here first
- Should match production configuration

**Deployment:**

```bash
# Use staging SA
gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-staging.iam.gserviceaccount.com

# Deploy same commands as production
npx firebase deploy --only firestore:rules
```

### Production Environment

**Purpose:** Live customer data
**Access:** Production operators only (restricted)
**Approval:** Manager + CTO (2-5 days)

**Guidelines:**

- Requires change management approval
- Deploy during approved windows only
- Document all changes
- Monitor after deployment
- Have rollback plan

**Deployment:** See [Production Deployment Workflow](#production-deployment-workflow) above

---

## Common Scenarios

### Scenario 1: New Developer Onboarding

**Admin Tasks:**

1. Verify new developer has Google Workspace account with MFA
2. Grant development access:
   ```bash
   gcloud iam service-accounts add-iam-policy-binding \
     firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com \
     --member="user:newdev@company.com" \
     --role="roles/iam.serviceAccountTokenCreator" \
     --project=curb-map-development
   ```
3. Document grant: `access-logs/grants/$(date +%Y-%m-%d)-newdev-dev.yaml`
4. Send setup instructions: `specifications/F107-firebase-soc2-vanilla-app/next-step.md`

**Developer Tasks:**

1. Follow next-step.md to configure impersonation
2. Verify access with `gcloud firestore indexes list --project=curb-map-development`
3. Read [Authentication Model](authentication-model.md)

### Scenario 2: Deploying Security Rules Update

**Developer:**

1. Update `modules/curb-map/firestore.rules`
2. Test in dev: `npx firebase deploy --only firestore:rules --project=curb-map-development`
3. Commit and create PR
4. Get code review approval

**Operator:**

1. Verify PR approved and merged
2. Get manager approval for production deployment
3. Test in staging: `npx firebase deploy --only firestore:rules --project=curb-map-staging`
4. Deploy to production (follow checklist)
5. Verify in production

### Scenario 3: Employee Departure

**Admin (Same Day):**

1. Receive HR notification
2. Immediately revoke all access:
   ```bash
   EMAIL="departing@company.com"
   for project in curb-map-{development,staging,production}; do
     gcloud iam service-accounts remove-iam-policy-binding \
       firebase-infrastructure-sa@${project}.iam.gserviceaccount.com \
       --member="user:$EMAIL" \
       --role="roles/iam.serviceAccountTokenCreator" \
       --project=$project
   done
   ```
3. Verify revocation
4. Review recent activity (last 30 days)
5. Document: `access-logs/revocations/$(date +%Y-%m-%d)-departing.yaml`

### Scenario 4: After-Hours Emergency Deployment

**Operator:**

1. Identify critical issue requiring immediate fix
2. Call CTO/Engineering Manager for verbal approval
3. Document emergency in change management system
4. Deploy to production following standard workflow
5. Monitor deployment closely
6. Document post-deployment:
    - What was the emergency?
    - What was deployed?
    - Who approved?
    - Outcome
7. Create post-incident report within 24 hours

### Scenario 5: Quarterly Access Review

**Admin:**

1. Export IAM policies for all environments
2. Query audit logs for actual usage
3. Compare granted vs. used access
4. Identify anomalies:
    - Access granted but never used → Consider revocation
    - Departed employees → Revoke immediately
    - Expired justifications → Request renewal or revoke
5. Revoke unnecessary access
6. Document review with management sign-off
7. Archive evidence: `compliance/access-reviews/$(date +%Y-Q1)/`

---

## References

- **Setup Guide:** `specifications/F107-firebase-soc2-vanilla-app/manual-setup.md`
- **Developer Setup:** `specifications/F107-firebase-soc2-vanilla-app/next-step.md`
- **Access Management:** [access-management.md](access-management.md)
- **Authentication Model:** [authentication-model.md](authentication-model.md)
- **Incident Response:** [incident-response.md](incident-response.md)
