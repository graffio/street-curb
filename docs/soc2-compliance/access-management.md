# Access Management

**Procedures for Granting and Revoking Access**

## Executive Summary

Access to CurbMap infrastructure is controlled through service account impersonation permissions. Developers request
access, admins grant impersonation access to the appropriate service account, and access is reviewed quarterly (
dev/staging) or monthly (production). Production access automatically expires after 90 days.

**Key Operations:**

```bash
# Grant access (development)
gcloud iam service-accounts add-iam-policy-binding \
  firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com \
  --member="user:developer@company.com" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --project=curb-map-development

# Revoke access (immediate, < 5 minutes)
gcloud iam service-accounts remove-iam-policy-binding \
  firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com \
  --member="user:developer@company.com" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --project=curb-map-development

# Review access (quarterly)
gcloud iam service-accounts get-iam-policy \
  firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com \
  --project=curb-map-development
```

---

## Table of Contents

- [Granting Access](#granting-access)
- [Revoking Access](#revoking-access)
- [Access Review Process](#access-review-process)
- [Special Cases](#special-cases)

---

## Granting Access

### Development Access

**Approver:** Infrastructure Admin, Tech Lead
**Timeline:** Same day
**Review Frequency:** Quarterly

**Process:**

1. Developer requests access (email/ticket)
2. Admin grants permission (see Quick Reference above)
3. Document the grant (date, user, environment, approver, reason)
4. Send setup instructions to developer (`specifications/F107-firebase-soc2-vanilla-app/next-step.md`)
5. Verify MFA enabled on user account

### Staging Access

**Approver:** Tech Lead, Engineering Manager
**Timeline:** 1-2 business days
**Review Frequency:** Quarterly

**Additional Requirements:**

- Justification for why staging access needed (not just dev)
- Typically granted to senior developers only

### Production Access

**Approver:** Engineering Manager + CTO (dual approval)
**Timeline:** 2-5 business days
**Review Frequency:** Monthly + 90-day automatic expiration

**Process:**

1. **Formal request** with:
    - Business justification
    - Specific tasks requiring production access
    - Expected duration
2. **Manager approval** (review justification, verify authorization, sign off)
3. **Admin grants permission:**
   ```bash
   gcloud iam service-accounts add-iam-policy-binding \
     firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com \
     --member="user:operator@company.com" \
     --role="roles/iam.serviceAccountTokenCreator" \
     --project=curb-map-production
   ```
4. **Document the grant:**
   ```yaml
   grant_date: 2025-09-30
   user: operator@company.com
   environment: production
   approver: manager@company.com + cto@company.com
   reason: Production deployment support
   expiration: 2025-12-30  # 90 days
   ```
5. **Schedule automatic review** (calendar reminder for 90-day expiration)

---

## Revoking Access

### Immediate Revocation (< 5 minutes)

**Triggers:**

- Employee departure
- Security incident
- Role change (no longer needs access)
- Access policy violation

**Process:**

```bash
# Revoke from all environments
for project in curb-map-{development,staging,production}; do
  gcloud iam service-accounts remove-iam-policy-binding \
    firebase-infrastructure-sa@${project}.iam.gserviceaccount.com \
    --member="user:former-employee@company.com" \
    --role="roles/iam.serviceAccountTokenCreator" \
    --project=$project
done

# Verify revocation
for project in curb-map-{development,staging,production}; do
  gcloud iam service-accounts get-iam-policy \
    firebase-infrastructure-sa@${project}.iam.gserviceaccount.com \
    --project=$project | grep "former-employee@company.com" && \
    echo "WARNING: Still has access to $project" || \
    echo "✓ No access to $project"
done
```

**Effect:** Immediate (current tokens expire within 1-12 hours)

**Documentation:**

```yaml
revocation_date: 2025-12-15
user: former-employee@company.com
environments: [ development, staging, production ]
reason: "Employee departure"
revoker: admin@company.com
verified: true
```

Save to: `access-logs/revocations/2025-12-15-former-employee.yaml`

---

## Access Review Process

### Quarterly Review (Development/Staging)

**Schedule:** Q1 (Jan), Q2 (Apr), Q3 (Jul), Q4 (Oct)

**Process:**

1. **Export current access:**
   ```bash
   gcloud iam service-accounts get-iam-policy \
     firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com \
     --format=json > review-dev-2025-Q4.json
   ```

2. **Check actual usage (last 90 days):**
   ```bash
   gcloud logging read '
     protoPayload.authenticationInfo.serviceAccountDelegationInfo.principalSubject:"firebase-infrastructure-sa@curb-map-development"
     AND timestamp>="'$(date -d '90 days ago' -I)'T00:00:00Z"
   ' --format=json | jq -r '.[] | .protoPayload.authenticationInfo.principalEmail' | sort -u
   ```

3. **Compare granted vs. used:**
    - Anyone with access who never used it? → Consider revoking
    - Anyone who left the team? → Revoke immediately

4. **Update access:** Revoke unnecessary, grant new if needed

5. **Document:** Save review results, manager signs off, store for audit

### Monthly Review (Production)

**Schedule:** First week of each month

**Process:** Same as quarterly, but for production only

**Additional:**

- Review audit logs for unusual activity
- Verify change management process followed
- Check for after-hours deployments (should have justification)

### Automatic Expiration (Production)

**Rule:** Production access expires after 90 days

**Process:**

1. Calendar reminder 2 weeks before expiration
2. Operator requests renewal (updated justification, manager re-approval)
3. If not renewed: Access automatically revoked on expiration date with notification

---

## Special Cases

### Temporary Access (One-Time Deployment)

**Duration:** 7 days maximum

**Process:**

1. Grant access with explicit expiration date
2. Set calendar reminder for revocation
3. Document as temporary:
   ```yaml
   temporary: true
   expiration: 2025-10-07
   reason: "One-time deployment of billing integration"
   ```
4. Revoke on expiration date

### Emergency Access (Security Incidents)

**Process:**

1. Incident Commander requests access
2. CTO/VP Engineering approves verbally
3. Admin grants immediately
4. Document post-incident:
    - Incident ticket number
    - Verbal approval from CTO
    - Actions taken during incident
    - Access revoked when incident resolved
5. Review in next access review

### Bulk Operations

**Onboarding New Team:**

```bash
#!/bin/bash
DEVELOPERS=("alice@company.com" "bob@company.com" "charlie@company.com")

for dev in "${DEVELOPERS[@]}"; do
  echo "Granting access to $dev..."
  gcloud iam service-accounts add-iam-policy-binding \
    firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com \
    --member="user:$dev" \
    --role="roles/iam.serviceAccountTokenCreator" \
    --project=curb-map-development
done
```

**Offboarding Employee:**

```bash
#!/bin/bash
EMAIL="departing@company.com"

for project in curb-map-{development,staging,production}; do
  echo "Revoking access from $project..."
  gcloud iam service-accounts remove-iam-policy-binding \
    firebase-infrastructure-sa@${project}.iam.gserviceaccount.com \
    --member="user:$EMAIL" \
    --role="roles/iam.serviceAccountTokenCreator" \
    --project=$project
done
```

---

## Access Documentation Template

**Grant Template** (`access-logs/grants/YYYY-MM-DD-username-env.yaml`):

```yaml
grant_date: 2025-09-30
user: developer@company.com
environment: development
service_account: firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com
role: roles/iam.serviceAccountTokenCreator
approver: admin@company.com
justification: "New team member joining for curb-map development"
expiration: null  # null for dev/staging, date for production
reviewed: [ ]  # Add quarterly review dates
```

**Revocation Template** (`access-logs/revocations/YYYY-MM-DD-username.yaml`):

```yaml
revocation_date: 2025-12-15
user: former-employee@company.com
environments: [ development, staging, production ]
reason: "Employee departure"
revoker: admin@company.com
verified: true
notes: "Access removed from all environments. Final day: 2025-12-14"
```

---

## References

- **Authentication Model:** [authentication-model.md](authentication-model.md)
- **Roles & Permissions:** [roles-and-permissions.md](roles-and-permissions.md)
- **Audit Logs:** [audit-and-logging.md](audit-and-logging.md)
