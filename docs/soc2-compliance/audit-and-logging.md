# Audit & Logging

**Comprehensive Audit Trail Strategy**

## Executive Summary

CurbMap maintains three complementary audit trails providing complete visibility into infrastructure operations and
application usage:

1. **GCP Cloud Audit Logs** - Infrastructure operations (400-day retention)
2. **Git History** - Configuration changes (permanent retention)
3. **Firestore Events** - Application operations (7-year retention)

Every infrastructure action captures both user identity and impersonated service account, ensuring individual
accountability.

**Key Queries:**

```bash
# Who deployed to production?
gcloud logging read '
  protoPayload.methodName="google.firebaserules.v1.FirebaseRules.UpdateRelease"
  AND resource.labels.project_id="curb-map-production"
' --format=json | jq '.[] | {user: .protoPayload.authenticationInfo.principalEmail, timestamp: .timestamp}'

# Who accessed production recently?
gcloud logging read '
  protoPayload.authenticationInfo.serviceAccountDelegationInfo.principalSubject:"firebase-infrastructure-sa@curb-map-production"
  AND timestamp>="2025-09-01T00:00:00Z"
' --format=json | jq -r '.[] | .protoPayload.authenticationInfo.principalEmail' | sort -u

# Export for compliance (quarterly)
gcloud logging read 'timestamp>="2025-01-01T00:00:00Z"' \
  --format=json --project=curb-map-production > audit-logs-2025-Q1.json
```

---

## Table of Contents

- [Audit Trail Matrix](#audit-trail-matrix)
- [Infrastructure Audit (GCP)](#infrastructure-audit-gcp)
- [Configuration Audit (Git)](#configuration-audit-git)
- [Application Audit (Firestore)](#application-audit-firestore)
- [Compliance Evidence](#compliance-evidence)
- [Log Retention Strategy](#log-retention-strategy)

---

## Audit Trail Matrix

| Activity                    | Audit Location       | Retention            | SOC2 Control |
|-----------------------------|----------------------|----------------------|--------------|
| **Service account created** | GCP Cloud Audit Logs | 400 days             | CC6.1, CC7.2 |
| **Impersonation granted**   | GCP Cloud Audit Logs | 400 days             | CC6.1, CC7.2 |
| **Impersonation used**      | GCP Cloud Audit Logs | 400 days             | CC6.2, CC7.2 |
| **Security rules deployed** | GCP Audit Logs + Git | 400 days + permanent | CC6.3, CC7.2 |
| **Function deployed**       | GCP Audit Logs + Git | 400 days + permanent | CC6.3, CC7.2 |
| **User authentication**     | Firestore + BigQuery | 90 days + indefinite | CC6.1, CC6.7, CC7.2 |
| **User action**             | Firestore events     | 7 years              | CC7.2, CC7.3 |
| **Config code change**      | Git history          | Permanent            | CC6.3, CC7.2 |

---

## Infrastructure Audit (GCP)

### What Gets Logged

GCP Cloud Audit Logs capture all infrastructure operations:

- Service account creation/modification
- IAM policy changes (who was granted impersonation)
- All API calls made via impersonated service accounts
- Firebase service configuration changes

### Key Information Captured

- **User Identity:** `developer@company.com`
- **Impersonated Service Account:** `firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com`
- **Action:** API method (e.g., `firebase.rules.deploy`)
- **Resource:** What was modified
- **Timestamp:** When it happened
- **Result:** Success or failure
- **IP Address:** Request origin

### Example Log Entry

```json
{
    "protoPayload": {
        "authenticationInfo": {
            "principalEmail": "developer@company.com",
            "serviceAccountDelegationInfo": [
                {
                    "principalSubject": "serviceAccount:firebase-infrastructure-sa@curb-map-development.iam.gserviceaccount.com"
                }
            ]
        },
        "methodName"        : "google.firebaserules.v1.FirebaseRules.UpdateRelease",
        "resourceName"      : "projects/curb-map-development/releases/firestore.rules",
        "status"            : { "code": 0, "message": "OK" }
    },
    "timestamp"   : "2025-09-30T14:23:15.123Z"
}
```

### Common Queries

**What did a specific user do?**

```bash
gcloud logging read '
  protoPayload.authenticationInfo.principalEmail="developer@company.com"
  AND timestamp>="2025-09-30T00:00:00Z"
' --format=json | jq '.[] | {timestamp, method: .protoPayload.methodName, resource: .protoPayload.resourceName}'
```

**Who has accessed production recently?**

```bash
gcloud logging read '
  protoPayload.authenticationInfo.serviceAccountDelegationInfo.principalSubject:"firebase-infrastructure-sa@curb-map-production"
  AND timestamp>="'$(date -d '90 days ago' -I)'T00:00:00Z"
' --format=json | jq -r '.[] | .protoPayload.authenticationInfo.principalEmail' | sort -u
```

**Who deployed security rules?**

```bash
gcloud logging read '
  protoPayload.methodName="google.firebaserules.v1.FirebaseRules.UpdateRelease"
  AND resource.labels.project_id="curb-map-production"
  AND timestamp>="2025-09-01T00:00:00Z"
' --format=json | jq '.[] | {user: .protoPayload.authenticationInfo.principalEmail, timestamp: .timestamp, resource: .protoPayload.resourceName}'
```

### Retention

- **Admin Activity Logs:** 400 days (GCP default, free)
- **Data Access Logs:** Not currently enabled (not needed for infrastructure audit)

---

## Configuration Audit (Git)

### What Gets Tracked

All configuration changes are version-controlled:

- Migration code changes
- Firestore security rules
- Cloud Function source code
- Configuration files

### Key Information Captured

- **Author:** Developer who made change
- **Timestamp:** When committed
- **Description:** Commit message
- **Diff:** Exact changes made
- **Reviewer:** Pull request approvals

### Common Queries

```bash
# View security rules history
git log --follow modules/curb-map/firestore.rules

# See who changed a migration
git blame modules/curb-map/migrations/deploy-indexes.js

# All changes in date range
git log --since="2025-01-01" --until="2025-03-31" --pretty=format:"%h %an %ad %s"
```

### Retention

**Permanent** - Git history never deleted

### Best Practices

- Require pull request reviews for production changes
- Sign commits with GPG keys (optional)
- Tag releases for production deployments
- Maintain CHANGELOG.md for major changes

---

## Application Audit (Firestore)

### Purpose

Complete audit trail of business operations - separate from infrastructure operations.

### Schema

```
completedActions: {
    id: {
        id: "acr_<cuid12>",              // action request ID (used as document ID)
        action: Action,                   // UserAdded | OrganizationAdded (tagged sum)
        organizationId: "org_<cuid12>",
        projectId: "prj_<cuid12>",
        actor: {
            type: "user" | "system" | "api",
            id: "usr_<cuid12>"
        },
        subject: {
            type: "user" | "organization" | "project",
            id: "usr|org|prj_<cuid12>"
        },
        status: "completed" | "failed",
        error: "string"?,
        idempotencyKey: "idm_<cuid12>",
        correlationId: "cor_<cuid12>",
        createdAt: "serverTimestamp",
        processedAt: "serverTimestamp",
        schemaVersion: 1
    }
}
```

### SOC2 Compliance

- ✅ Immutable events (cannot modify after creation)
- ✅ Complete chronological history
- ✅ Captures who did what to what
- ✅ Supports GDPR/CCPA "right to be forgotten"

### Retention

**7 years** (configurable per organization)

### Access

```javascript
// Query completed actions for audit
const completedActions = await firestore
    .collection('completedActions')
    .where('actor.id', '==', userId)
    .where('timestamp', '>=', startDate)
    .where('timestamp', '<=', endDate)
    .orderBy('timestamp', 'desc')
    .get()
```

---

## Authentication Event Logging

### Purpose

Complete audit trail of user authentication attempts for SOC2 compliance and security incident response.

### Events Logged

All authentication actions are logged to `completedActions` collection:

1. **PasscodeRequested** - User requests authentication passcode via SMS
2. **PasscodeVerified** - User submits passcode for verification (success or failure)

### Schema

**PasscodeRequested (Successful)**:

```javascript
{
  id: "acr_abc123def456",
  action: {
    type: "PasscodeRequested",
    phoneNumber: "+14155551234"
  },
  actorId: "anonymous",  // No authentication required to request passcode
  subjectId: "+14155551234",
  subjectType: "phoneNumber",
  status: "completed",
  idempotencyKey: "idm_abc123def456",
  correlationId: "cor_xyz789",
  createdAt: Timestamp("2025-10-31T10:00:00Z"),
  processedAt: Timestamp("2025-10-31T10:00:01Z"),
  schemaVersion: 1,
  metadata: {
    hashedPasscode: "$2b$10$N9qo8uLOickgx2ZrVzZDOuSjSWXsEhq.dSOUCL",  // bcrypt hash
    expiresAt: Timestamp("2025-10-31T10:10:00Z"),  // 10-minute TTL
    attemptsRemaining: 3
  }
}
```

**PasscodeVerified (Successful)**:

```javascript
{
  id: "acr_def456ghi789",
  action: {
    type: "PasscodeVerified",
    phoneNumber: "+14155551234",
    passcode: "123456"  // Plain text in action, NOT stored in completedActions
  },
  actorId: "anonymous",  // Authenticated after verification succeeds
  subjectId: "usr_newuser123",  // Created or existing user
  subjectType: "user",
  status: "completed",
  idempotencyKey: "idm_def456ghi789",
  correlationId: "cor_xyz789",  // Same correlationId as PasscodeRequested
  createdAt: Timestamp("2025-10-31T10:00:30Z"),
  processedAt: Timestamp("2025-10-31T10:00:31Z"),
  schemaVersion: 1,
  metadata: {
    customToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."  // Firebase token for client
  }
}
```

**PasscodeVerified (Failed - Invalid Passcode)**:

```javascript
{
  id: "acr_ghi789jkl012",
  action: {
    type: "PasscodeVerified",
    phoneNumber: "+14155551234",
    passcode: "999999"  // Incorrect passcode
  },
  actorId: "anonymous",
  subjectId: "+14155551234",
  subjectType: "phoneNumber",
  status: "failed",
  error: "Invalid passcode",  // Error message logged
  idempotencyKey: "idm_ghi789jkl012",
  correlationId: "cor_xyz789",
  createdAt: Timestamp("2025-10-31T10:00:45Z"),
  processedAt: Timestamp("2025-10-31T10:00:45Z"),
  schemaVersion: 1
}
```

### SOC2 Control Mappings

| Control | Implementation | Evidence |
|---------|---------------|----------|
| **CC6.1** | All authentication attempts logged with timestamps | completedActions PasscodeRequested/PasscodeVerified |
| **CC6.7** | Passcodes hashed with bcrypt before storage | metadata.hashedPasscode field |
| **CC7.2** | Failed attempts tracked for brute force detection | status='failed' events, query by phoneNumber |
| **CC7.3** | Complete event timeline for incident investigation | Query completedActions by phone/time range |

### Common Security Queries

**Detect Brute Force Attacks (Multiple Failed Attempts)**:

```javascript
// Find phone numbers with >5 failed PasscodeVerified in last hour
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

const failedAttempts = await firestore
  .collection('completedActions')
  .where('action.type', '==', 'PasscodeVerified')
  .where('status', '==', 'failed')
  .where('createdAt', '>=', oneHourAgo)
  .get();

const attemptsByPhone = {};
failedAttempts.docs.forEach(doc => {
  const phone = doc.data().action.phoneNumber;
  attemptsByPhone[phone] = (attemptsByPhone[phone] || 0) + 1;
});

const underAttack = Object.entries(attemptsByPhone)
  .filter(([phone, count]) => count > 5)
  .map(([phone, count]) => ({ phone, failedAttempts: count }));

console.log('Potential brute force attacks:', underAttack);
```

**Audit Successful Logins for Specific User**:

```javascript
// Find all successful PasscodeVerified for a user
const user = await firestore.collection('users').doc('usr_abc123').get();
const phoneNumber = user.data().phoneNumber;

const successfulLogins = await firestore
  .collection('completedActions')
  .where('action.type', '==', 'PasscodeVerified')
  .where('action.phoneNumber', '==', phoneNumber)
  .where('status', '==', 'completed')
  .orderBy('createdAt', 'desc')
  .limit(20)
  .get();

successfulLogins.docs.forEach(doc => {
  const data = doc.data();
  console.log(`Login: ${data.createdAt.toDate().toISOString()}, User: ${data.subjectId}`);
});
```

**Detect Delayed Verification (Suspicious Timing)**:

```javascript
// Find PasscodeVerified >9 minutes after PasscodeRequested (near expiration)
const recentVerifications = await firestore
  .collection('completedActions')
  .where('action.type', '==', 'PasscodeVerified')
  .where('createdAt', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000))  // Last 24 hours
  .get();

const suspicious = [];
for (const verifiedDoc of recentVerifications.docs) {
  const verified = verifiedDoc.data();
  const phoneNumber = verified.action.phoneNumber;

  // Find corresponding PasscodeRequested
  const requested = await firestore
    .collection('completedActions')
    .where('action.type', '==', 'PasscodeRequested')
    .where('action.phoneNumber', '==', phoneNumber)
    .where('createdAt', '<', verified.createdAt)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (!requested.empty) {
    const requestedTime = requested.docs[0].data().createdAt.toMillis();
    const verifiedTime = verified.createdAt.toMillis();
    const delayMinutes = (verifiedTime - requestedTime) / (60 * 1000);

    if (delayMinutes > 9) {
      suspicious.push({
        phoneNumber,
        delayMinutes: delayMinutes.toFixed(2),
        requestedAt: new Date(requestedTime).toISOString(),
        verifiedAt: new Date(verifiedTime).toISOString()
      });
    }
  }
}

console.log('Suspicious delayed verifications:', suspicious);
```

**Enumerate PasscodeRequested Rate Limiting**:

```javascript
// Count PasscodeRequested per phone number in last hour
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

const requests = await firestore
  .collection('completedActions')
  .where('action.type', '==', 'PasscodeRequested')
  .where('createdAt', '>=', oneHourAgo)
  .get();

const requestsByPhone = {};
requests.docs.forEach(doc => {
  const phone = doc.data().action.phoneNumber;
  requestsByPhone[phone] = (requestsByPhone[phone] || 0) + 1;
});

const overLimit = Object.entries(requestsByPhone)
  .filter(([phone, count]) => count > 5)  // Rate limit: 5 per hour
  .map(([phone, count]) => ({ phone, requests: count }));

console.log('Phone numbers exceeding rate limit:', overLimit);
```

### Retention Strategy

| Storage | Duration | Purpose | Cost | Archival |
|---------|----------|---------|------|----------|
| **Firestore** | 90 days | Fast queries for recent incidents | Higher (read/write) | Daily at 2am UTC |
| **BigQuery** | Indefinite | Long-term SOC2 compliance, annual audits | Lower (storage) | Phone numbers SHA256-hashed |

**Archival Process**: Scheduled function exports PasscodeRequested/PasscodeVerified >90 days to BigQuery, deletes from Firestore. See [F121](../../specifications/F121-authentication-middleware/background.md#8-data-retention-and-archival).

### Privacy Considerations

| Data | Firestore (90d) | BigQuery (indefinite) | Rationale |
|------|----------------|----------------------|-----------|
| **Phone Numbers** | Plain text | SHA256 hash | Operational queries need plain, long-term queries use hash |
| **Passcodes** | bcrypt hash only | N/A (not archived) | Never stored in plaintext, exist in memory only |
| **Failed Attempts** | Logged without correct passcode | Logged without correct passcode | Security analysis without exposing secrets |

---

## Compliance Evidence

### Quarterly Access Review

**Evidence Required:**

1. IAM policies showing who can impersonate
2. Users who actually used impersonation
3. Business justification for each user
4. Signed approval from management

**Commands:**

```bash
# 1. Export IAM policies
gcloud iam service-accounts get-iam-policy \
  firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com \
  --format=json > iam-policy-prod-2025-Q1.json

# 2. List users who impersonated (last 90 days)
gcloud logging read '
  protoPayload.authenticationInfo.serviceAccountDelegationInfo.principalSubject:"firebase-infrastructure-sa@curb-map-production"
  AND timestamp>="'$(date -d '90 days ago' -I)'T00:00:00Z"
' --format=json | jq -r '.[] | .protoPayload.authenticationInfo.principalEmail' | sort -u > actual-users-2025-Q1.txt

# 3. Compare granted vs. actual usage
comm -3 \
  <(jq -r '.bindings[] | select(.role=="roles/iam.serviceAccountTokenCreator") | .members[] | sub("user:"; "")' iam-policy-prod-2025-Q1.json | sort) \
  <(sort actual-users-2025-Q1.txt)
```

### SOC2 Audit Evidence

**Auditor Request:** "Show who deployed security rules to production in Q1 2025"

```bash
gcloud logging read '
  protoPayload.methodName="google.firebaserules.v1.FirebaseRules.UpdateRelease"
  AND resource.labels.project_id="curb-map-production"
  AND timestamp>="2025-01-01T00:00:00Z"
  AND timestamp<"2025-04-01T00:00:00Z"
' --format=json --project=curb-map-production > audit-evidence-firestore-rules-2025-Q1.json
```

**Evidence Shows:**

- ✅ User identity (john@company.com)
- ✅ Impersonated service account
- ✅ Timestamp of deployment
- ✅ What was deployed (rules version)
- ✅ Success/failure

---

## Log Retention Strategy

### GCP Cloud Audit Logs

**Current:** 400 days (GCP default, free)

**Extended Retention (Optional):**

```bash
# Create log sink to Cloud Storage for 7+ year retention
gcloud logging sinks create soc2-audit-logs \
  storage.googleapis.com/curb-map-audit-logs-bucket \
  --log-filter='logName:"logs/cloudaudit.googleapis.com"' \
  --project=curb-map-production
```

**Benefits:** Lower cost, queryable via BigQuery

### Git History

**Retention:** Permanent
**Backup:** GitHub/GitLab remote + local clones
**Cost:** Free

### Firestore Events

**Retention:** 7 years (configurable)
**Cost:** Firestore storage + reads
**Optimization:** Archive old events to Cloud Storage after 1 year

---

## References

- **Authentication:** [authentication-model.md](authentication-model.md)
- **Access Management:** [access-management.md](access-management.md)
- **SOC2 Controls:** [soc2-controls.md](soc2-controls.md)
