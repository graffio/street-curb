# SOC2 Control Mappings

**Trust Services Criteria Evidence**

## Executive Summary

This document maps CurbMap's security controls to SOC2 Trust Services Criteria (Common Criteria), focusing on logical access controls (CC6) and system monitoring (CC7). The service account impersonation model provides strong evidence for individual accountability, access management, and incident response.

**Controls Covered:**
- **CC6.1** - Logical access security measures
- **CC6.2** - User registration and authorization
- **CC6.3** - Role-based access control
- **CC6.7** - Transmission and storage encryption
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
  - [CC6.7 - Transmission and Storage Encryption](#cc67---transmission-and-storage-encryption)
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

### CC6.7 - Transmission and Storage Encryption

**Criterion:** The entity restricts the transmission, movement, and removal of information to authorized internal and external users and processes, and protects it during transmission, movement, or removal to meet the entity's objectives.

**Implementation:**

**User Authentication (Passcode Encryption)**:
- ✅ Passcodes hashed with bcrypt (cost factor 10) before storage
- ✅ Plain-text passcodes never stored in database
- ✅ Only hashed values in ActionRequest metadata
- ✅ bcrypt.compare() for constant-time verification

**Data in Transit**:
- ✅ HTTPS/TLS 1.2+ for all client-server communication
- ✅ Firebase Auth tokens transmitted via Authorization header
- ✅ SMS delivery via encrypted Twilio/Firebase channels

**Data at Rest**:
- ✅ Firestore encryption at rest (Google-managed keys)
- ✅ BigQuery encryption at rest (Google-managed keys)
- ✅ No plain-text credentials in source code or configuration

**Evidence:**

1. **Passcode Hashing Verification**:
   ```javascript
   // Code sample from handlePasscodeRequested
   const hashedPasscode = await bcrypt.hash(passcode, 10);

   // Verification: Check completedActions metadata contains only hash
   const session = await firestore.collection('completedActions').doc('acr_xxx').get();
   console.assert(session.data().metadata.hashedPasscode.startsWith('$2b$10$'));
   console.assert(!session.data().metadata.passcode);  // Plain text not stored
   ```

2. **TLS Configuration**:
   ```bash
   # Verify Firebase Hosting enforces HTTPS
   curl -I https://curbmap.app
   # Expected: HTTP/2 200, strict-transport-security header

   # Verify Cloud Functions require HTTPS
   gcloud functions describe submitActionRequest --region=us-west1
   # Expected: securityLevel: SECURE_ALWAYS
   ```

3. **Authentication Event Audit**:
   ```javascript
   // Query completedActions for PasscodeRequested events
   // Verify metadata contains hashedPasscode (not plain passcode)
   const sessions = await firestore
     .collection('completedActions')
     .where('action.type', '==', 'PasscodeRequested')
     .limit(100)
     .get();

   sessions.docs.forEach(doc => {
     const metadata = doc.data().metadata;
     console.assert(metadata.hashedPasscode);        // Hash present
     console.assert(metadata.hashedPasscode.startsWith('$2b$'));  // bcrypt format
     console.assert(!metadata.passcode);             // Plain text absent
   });
   ```

4. **Firestore/BigQuery Encryption**:
   - Google-managed encryption at rest (automatic)
   - Documented in GCP Security Whitepaper
   - Verified via GCP Console encryption settings

**Testing:**

```javascript
// Test 1: Verify passcode hashing
const passcode = '123456';
const hashedPasscode = await bcrypt.hash(passcode, 10);
assert(hashedPasscode !== passcode);  // Not plain text
assert(await bcrypt.compare(passcode, hashedPasscode));  // Verifies correctly

// Test 2: Verify failed passcode doesn't leak information
const wrongPasscode = '999999';
const result = await bcrypt.compare(wrongPasscode, hashedPasscode);
assert(result === false);  // Constant time, no info leak

// Test 3: Verify completedActions doesn't contain plain passcode
const action = { type: 'PasscodeRequested', phoneNumber: '+14155551234' };
await submitActionRequest(action);
const stored = await readActionRequest(actionRequestId);
assert(!stored.metadata.passcode);  // No plain text
assert(stored.metadata.hashedPasscode.startsWith('$2b$'));  // Only hash
```

**Privacy Considerations**:

- **Phone Number Hashing (BigQuery)**: Phone numbers hashed with SHA256 before archival to BigQuery (PII protection)
- **Firestore Retention**: Plain phone numbers retained for 90 days (operational need), then archived with hashing
- **Passcode Visibility**: Plain-text passcodes only visible to user via SMS (never logged or stored)

**Encryption Key Management**:

- **Firestore/BigQuery**: Google-managed keys (automatic rotation)
- **bcrypt Cost Factor**: 10 (balances security vs performance, future-proof against CPU improvements)
- **Future Consideration**: Customer-managed encryption keys (CMEK) when enterprise customers require it

---

## CC7: System Monitoring

### CC7.2 - Monitors System Components

**Criterion:** The entity monitors system components and the operation of those components for anomalies that are indicative of malicious acts, natural disasters, and errors.

**Implementation:**

**Infrastructure Monitoring**:
- ✅ GCP Cloud Audit Logs capture all infrastructure operations (400-day retention)
- ✅ Audit logs show user identity + impersonated service account
- ✅ Git history tracks all code changes (permanent retention)
- ✅ Alerts for unusual production access

**User Authentication Monitoring**:
- ✅ All authentication attempts logged to completedActions (PasscodeRequested, PasscodeVerified)
- ✅ Failed verification attempts tracked with error details
- ✅ Brute force detection via query analysis (>5 failed attempts/hour)
- ✅ 90-day retention in Firestore, then BigQuery archival (indefinite)

**Application Operations Monitoring**:
- ✅ Application events stored in Firestore (7-year retention)
- ✅ All actions logged with actorId, timestamps, success/failure status

**Evidence:**

1. **Cloud Audit Logs** - Infrastructure Operations (400-day retention)
   ```bash
   gcloud logging read '
     protoPayload.methodName="google.firebaserules.v1.FirebaseRules.UpdateRelease"
     AND resource.labels.project_id="curb-map-production"
   ' --limit 100
   ```

2. **Authentication Event Logs** - User Authentication (90-day Firestore, indefinite BigQuery)
   ```javascript
   // Query all PasscodeVerified attempts (successful and failed)
   const attempts = await firestore
     .collection('completedActions')
     .where('action.type', '==', 'PasscodeVerified')
     .where('createdAt', '>=', startDate)
     .orderBy('createdAt', 'desc')
     .get();

   // Analyze success/failure rates for anomaly detection
   attempts.docs.forEach(doc => {
     const data = doc.data();
     console.log({
       phoneNumber: data.action.phoneNumber,
       status: data.status,  // 'completed' or 'failed'
       timestamp: data.createdAt,
       error: data.error     // If failed
     });
   });
   ```

3. **Firestore Events Collection** - Application Operations (7-year retention)
   - Immutable event log of business operations

4. **Git History** - Configuration Changes (permanent)
   - Shows who changed what and when
   - Pull request approvals for production

5. **Log Retention Configuration:**
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

**Infrastructure Security Events**:
- ✅ Security incident response procedures
- ✅ Immediate access revocation capability (< 5 minutes)
- ✅ Short-lived credentials limit breach window (1-12 hours)
- ✅ No long-lived credentials to rotate during incidents

**User Authentication Security Events**:
- ✅ Brute force detection (>5 failed PasscodeVerified attempts/hour)
- ✅ Rate limit enforcement (max 5 PasscodeRequested per phone/hour)
- ✅ Suspicious timing detection (PasscodeVerified >9 minutes after request)
- ✅ Account lockout capability (disable user after breach detection)

**Audit Log Analysis**:
- ✅ Automated queries for anomalous behavior
- ✅ Failed attempt tracking and alerting

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

   **Infrastructure Events:**
   - After-hours production deployment (requires justification)
   - Multiple failed permission checks (investigate user)
   - New user accessing production (verify authorization)

   **User Authentication Events:**
   - Brute force attack: >5 failed PasscodeVerified for same phone in 1 hour
   - Credential stuffing: Multiple failed attempts across different phone numbers
   - Rate limit violation: >5 PasscodeRequested for same phone in 1 hour
   - Suspicious timing: PasscodeVerified >9 minutes after PasscodeRequested
   - Account enumeration: Repeated PasscodeRequested to discover valid phone numbers

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
| **CC6.7** | bcrypt hashing, TLS, encryption at rest | completedActions metadata, TLS config | Quarterly + Per release |
| **CC7.2** | Audit logs + git + events + auth monitoring | Log exports, retention config, auth logs | Quarterly |
| **CC7.3** | Incident response, revocation, brute force detection | Incident runbook, response logs, auth event queries | After incidents + Annual drill |

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
