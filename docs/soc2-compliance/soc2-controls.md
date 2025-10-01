# SOC2 Control Mappings

**Trust Services Criteria Evidence**

## Executive Summary

This document maps CurbMap's security controls to SOC2 Trust Services Criteria (Common Criteria), focusing on logical access controls (CC6) and system monitoring (CC7). The service account impersonation model provides strong evidence for individual accountability, access management, and incident response.

**Controls Covered:**
- **CC6.1** - Logical access security measures
- **CC6.2** - User registration and authorization
- **CC6.3** - Role-based access control
- **CC7.2** - System component monitoring
- **CC7.3** - Security event evaluation

**Evidence Collection:**
```bash
# Export IAM policies (CC6.1, CC6.2, CC6.3)
gcloud iam service-accounts get-iam-policy \
  firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com \
  --format=json > evidence/iam-policy-prod.json

# Export audit logs (CC7.2, CC7.3)
gcloud logging read 'timestamp>="2025-01-01T00:00:00Z"' \
  --format=json --project=curb-map-production > evidence/audit-logs-2025-Q1.json
```

---

## Table of Contents

- [CC6: Logical and Physical Access Controls](#cc6-logical-and-physical-access-controls)
  - [CC6.1 - Logical Access Control](#cc61---logical-access-control)
  - [CC6.2 - Prior to Issuing System Credentials](#cc62---prior-to-issuing-system-credentials)
  - [CC6.3 - Provisioned with Approved Authorizations](#cc63---provisioned-with-approved-authorizations)
- [CC7: System Monitoring](#cc7-system-monitoring)
  - [CC7.2 - Monitors System Components](#cc72---monitors-system-components)
  - [CC7.3 - Evaluates Security Events](#cc73---evaluates-security-events)
- [Control Evidence Summary](#control-evidence-summary)
- [Compliance Artifacts](#compliance-artifacts)

---

## CC6: Logical and Physical Access Controls

### CC6.1 - Logical Access Control

**Criterion:** The entity implements logical access security measures to protect against threats from sources outside its system boundaries.

**Implementation:**
- ✅ Service account impersonation requires explicit IAM grant
- ✅ No service account keys (no long-lived credentials)
- ✅ MFA required on all human accounts
- ✅ Quarterly access reviews
- ✅ Separate environments (dev, staging, production)

**Evidence:**

1. **IAM Policy Exports** showing granted impersonation permissions
2. **MFA Enrollment Report** from Google Workspace (all users have 2FA)
3. **Quarterly Access Review Documentation** (signed reviews, revocation evidence)
4. **GCP Organization Policy** (require OS Login, domain restricted sharing)

**Testing:**
```bash
# Test 1: Access denied without permission
gcloud firestore indexes list --project=curb-map-production
# Expected: Permission denied

# Test 2: Access granted after permission added
gcloud iam service-accounts add-iam-policy-binding \
  firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com \
  --member="user:operator@company.com" \
  --role="roles/iam.serviceAccountTokenCreator"

gcloud auth application-default login \
  --impersonate-service-account=firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com
gcloud firestore indexes list --project=curb-map-production
# Expected: Success

# Test 3: Access revoked after removal
gcloud iam service-accounts remove-iam-policy-binding \
  firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com \
  --member="user:operator@company.com" \
  --role="roles/iam.serviceAccountTokenCreator"
gcloud auth application-default revoke
gcloud firestore indexes list --project=curb-map-production
# Expected: Permission denied
```

---

### CC6.2 - Prior to Issuing System Credentials

**Criterion:** Prior to issuing system credentials and granting system access, the entity registers and authorizes new internal and external users.

**Implementation:**
- ✅ Google Workspace authentication required
- ✅ Manual approval process for impersonation grants
- ✅ Different approval levels (dev vs. staging vs. production)
- ✅ Documentation of all access grants

**Evidence:**

1. **Access Grant Logs** (`access-logs/grants/`)
   - Date, user email, approver, justification
2. **Google Workspace User Directory** (only authorized company emails)
3. **GCP Cloud Audit Logs** (IAM policy changes show admin granted permission)
4. **Email/Ticket Approvals** (paper trail before granting)

**Testing:**
- Attempt to grant self impersonation → Requires admin role
- Attempt to authenticate with non-company email → Denied
- Check audit logs show admin granted permission (not self-service)

---

### CC6.3 - Provisioned with Approved Authorizations

**Criterion:** The entity authorizes, modifies, or removes access to data, software, functions, and other protected information assets based on roles, responsibilities, or the system design and changes.

**Implementation:**
- ✅ Role-based permissions (developer, operator, admin)
- ✅ Service accounts have least-privilege roles
- ✅ Impersonation scoped to specific service accounts
- ✅ Production access more restricted than development
- ✅ Access modifications logged

**Evidence:**

1. **Service Account Role Assignments:**
   ```bash
   gcloud projects get-iam-policy curb-map-production --format=json
   ```
   Shows service accounts have only needed roles (no Owner/Editor)

2. **Impersonation Permission Matrix:**
   - Development: All developers
   - Staging: Senior developers
   - Production: Operators only

3. **GCP Audit Logs** (role changes with user identity and timestamp)

4. **Roles Documentation** ([roles-and-permissions.md](roles-and-permissions.md))

**Testing:**
- Verify developers cannot directly modify production
- Verify service accounts cannot create new service accounts
- Check production SA cannot access dev resources

---

## CC7: System Monitoring

### CC7.2 - Monitors System Components

**Criterion:** The entity monitors system components and the operation of those components for anomalies that are indicative of malicious acts, natural disasters, and errors.

**Implementation:**
- ✅ GCP Cloud Audit Logs capture all infrastructure operations (400-day retention)
- ✅ Audit logs show user identity + impersonated service account
- ✅ Application events stored in Firestore (7-year retention)
- ✅ Git history tracks all code changes (permanent retention)
- ✅ Alerts for unusual production access

**Evidence:**

1. **Cloud Audit Logs** - Infrastructure Operations (400-day retention)
   ```bash
   gcloud logging read '
     protoPayload.methodName="google.firebaserules.v1.FirebaseRules.UpdateRelease"
     AND resource.labels.project_id="curb-map-production"
   ' --limit 100
   ```

2. **Firestore Events Collection** - Application Operations (7-year retention)
   - Immutable event log of business operations

3. **Git History** - Configuration Changes (permanent)
   - Shows who changed what and when
   - Pull request approvals for production

4. **Log Retention Configuration:**
   ```bash
   gcloud logging sinks list --project=curb-map-production
   ```

**Testing:**
- Query logs for recent production deployments
- Verify user identity captured in logs
- Check git history matches deployed configuration

---

### CC7.3 - Evaluates Security Events

**Criterion:** The entity evaluates security events to determine whether they could or have resulted in a failure of the entity to meet its objectives.

**Implementation:**
- ✅ Security incident response procedures
- ✅ Immediate access revocation capability (< 5 minutes)
- ✅ Audit log analysis for anomalous behavior
- ✅ Short-lived credentials limit breach window (1-12 hours)
- ✅ No long-lived credentials to rotate during incidents

**Evidence:**

1. **Incident Response Runbook** ([incident-response.md](incident-response.md))
   - Compromised account procedures
   - Revocation commands documented
   - Escalation paths defined

2. **Example Revocation Response:**
   ```bash
   # Immediate revocation (< 5 minutes)
   gcloud iam service-accounts remove-iam-policy-binding \
     firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com \
     --member="user:compromised@company.com" \
     --role="roles/iam.serviceAccountTokenCreator"
   ```
   No key rotation needed (tokens expire automatically)

3. **Security Event Examples:**
   - After-hours production deployment (requires justification)
   - Multiple failed permission checks (investigate user)
   - New user accessing production (verify authorization)

4. **Incident Logs** (documentation of incidents, response actions, root cause)

**Testing:**
- Simulate compromised account scenario
- Measure time to revoke access (< 5 minutes)
- Verify tokens expire after revocation
- Check incident response procedures work

---

## Control Evidence Summary

| Control | Implementation | Evidence Location | Review Frequency |
|---------|---------------|-------------------|------------------|
| **CC6.1** | Impersonation + MFA | IAM policies, MFA reports, access reviews | Quarterly |
| **CC6.2** | Manual approval | Access grant logs, audit logs | Monthly (prod), Quarterly (dev/staging) |
| **CC6.3** | Role-based, least privilege | Service account roles, permission matrix | Quarterly |
| **CC7.2** | Audit logs + git + events | Log exports, retention config | Quarterly |
| **CC7.3** | Incident response, revocation | Incident runbook, response logs | After incidents + Annual drill |

---

## Compliance Artifacts

### Quarterly Access Review Package

**Contents:**
1. IAM policy exports (development, staging, production)
2. List of users who accessed each environment
3. Comparison of granted vs. actual usage
4. Justification for each access grant
5. List of revoked access
6. Signed approval from management

**Location:** `compliance/access-reviews/YYYY-QN/`

**Example Structure:**
```
compliance/access-reviews/2025-Q4/
├── iam-policy-dev.json
├── iam-policy-staging.json
├── iam-policy-prod.json
├── actual-usage-dev.txt
├── actual-usage-staging.txt
├── actual-usage-prod.txt
├── review-summary.md
└── approval-signature.pdf
```

### Annual SOC2 Audit Package

**Contents:**
1. Access review documentation (all quarters)
2. Incident response records
3. Log retention configuration
4. Security policy documentation
5. Evidence of MFA enforcement
6. Sample audit log exports
7. User provisioning/deprovisioning procedures

**Location:** `compliance/annual-audits/YYYY/`

### Continuous Evidence Collection

**Automated (Daily):**
```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)

# Export IAM policies
for env in development staging production; do
  gcloud iam service-accounts get-iam-policy \
    firebase-infrastructure-sa@curb-map-${env}.iam.gserviceaccount.com \
    --format=json > evidence/iam-policies/${DATE}-${env}.json
done

# Export recent audit logs
gcloud logging read "timestamp>${DATE}T00:00:00Z" \
  --format=json --project=curb-map-production > evidence/audit-logs/${DATE}-production.json
```

**Manual (Quarterly):**
- Access review with management
- MFA enrollment verification
- Incident response drill
- Policy updates

---

## References

- **Authentication Model:** [authentication-model.md](authentication-model.md)
- **Access Management:** [access-management.md](access-management.md)
- **Audit & Logging:** [audit-and-logging.md](audit-and-logging.md)
- **Incident Response:** [incident-response.md](incident-response.md)
