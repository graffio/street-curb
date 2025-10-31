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

| Environment | Approver(s) | Timeline | Review Frequency | Requirements |
|-------------|------------|----------|------------------|--------------|
| **Development** | Infrastructure Admin or Tech Lead | Same day | Quarterly | Request (email/ticket), verify MFA, send setup docs |
| **Staging** | Tech Lead + Engineering Manager | 1-2 days | Quarterly | Justification (why not just dev), typically senior developers only |
| **Production** | Engineering Manager + CTO (dual) | 2-5 days | Monthly + 90-day auto-expiration | Formal request (business justification, specific tasks, duration), manager approval, document grant with expiration date |

**Grant Process**:
1. User requests access (email/ticket with justification)
2. Approver(s) review and approve
3. Admin grants permission (see [Executive Summary](#executive-summary) for command)
4. Document grant (date, user, environment, approver, reason, expiration if prod)
5. For dev: Send setup instructions (`specifications/F107-firebase-soc2-vanilla-app/next-step.md`)
6. For prod: Schedule 90-day review (calendar reminder)

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

| Review Type | Environments | Schedule | Process |
|-------------|--------------|----------|---------|
| **Quarterly** | Development, Staging | Q1 (Jan), Q2 (Apr), Q3 (Jul), Q4 (Oct) | Export current access, check actual usage (90 days), compare granted vs used, revoke unnecessary, document & manager sign-off |
| **Monthly** | Production | First week of month | Same as quarterly + review audit logs for unusual activity, verify change management, check after-hours deployments |
| **Auto-Expiration** | Production | 90 days from grant | Calendar reminder 2 weeks before, user requests renewal (justification + manager approval), auto-revoke if not renewed |

**Review Outputs**:
- Access to revoke (unused, team departures)
- Access to grant (new team members, role changes)
- Audit documentation (manager sign-off, stored for SOC2)

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
