# Incident Response

**Security Incident Procedures**

## Executive Summary

CurbMap's incident response leverages service account impersonation for rapid access revocation (< 5 minutes).
Short-lived credentials limit breach exposure, and comprehensive audit logs enable investigation. This document covers 5
incident types with response times and procedures.

**Priority Levels:**

- **P0 (< 5 min):** Compromised account with production access, unauthorized data access
- **P1 (< 1 hour):** Suspicious production activity, unauthorized config changes
- **P2 (< 4 hours):** Policy violations, after-hours deployments
- **P3 (< 24 hours):** Access review findings, permission cleanup

**Critical Commands:**

```bash
# Immediate revocation (< 5 minutes)
for project in curb-map-{development,staging,production}; do
  gcloud iam service-accounts remove-iam-policy-binding \
    firebase-infrastructure-sa@${project}.iam.gserviceaccount.com \
    --member="user:compromised@company.com" \
    --role="roles/iam.serviceAccountTokenCreator" \
    --project=$project
done

# Verify revocation
gcloud iam service-accounts get-iam-policy \
  firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com

# Investigate recent activity
gcloud logging read '
  protoPayload.authenticationInfo.principalEmail="compromised@company.com"
  AND timestamp>="'$(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ)'"
' --format=json > incident-logs-$(date +%Y-%m-%d).json
```

---

## Table of Contents

- [Incident Types](#incident-types)
    - [1. Compromised Developer Account](#1-compromised-developer-account)
    - [2. Unauthorized Access Attempt](#2-unauthorized-access-attempt)
    - [3. Suspicious Production Activity](#3-suspicious-production-activity)
    - [4. Employee Departure](#4-employee-departure)
    - [5. Security Policy Violation](#5-security-policy-violation)
- [Incident Response Workflow](#incident-response-workflow)
- [Response Time Targets](#response-time-targets)
- [Communication Templates](#communication-templates)

---

## Incident Types

### 1. Compromised Developer Account

**Indicators:**

- Unusual activity in audit logs
- User reports suspicious emails/logins
- Failed MFA attempts
- Access from unusual locations

**Immediate Actions (< 5 minutes):**

```bash
# 1. Revoke impersonation permissions immediately
for project in curb-map-{development,staging,production}; do
  gcloud iam service-accounts remove-iam-policy-binding \
    firebase-infrastructure-sa@${project}.iam.gserviceaccount.com \
    --member="user:compromised@company.com" \
    --role="roles/iam.serviceAccountTokenCreator" \
    --project=$project
done

# 2. Verify revocation
gcloud iam service-accounts get-iam-policy \
  firebase-infrastructure-sa@curb-map-production.iam.gserviceaccount.com
```

**Investigation (< 1 hour):**

```bash
# 3. Query audit logs for all actions by compromised account
gcloud logging read '
  protoPayload.authenticationInfo.principalEmail="compromised@company.com"
  AND timestamp>="'$(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ)'"
' --format=json > incident-logs-$(date +%Y-%m-%d).json

# 4. Review what was accessed/modified
cat incident-logs-*.json | jq '.[] | {
  timestamp: .timestamp,
  method: .protoPayload.methodName,
  resource: .protoPayload.resourceName,
  result: .protoPayload.status.code
}'
```

**Recovery Actions:**

1. Reset user password (Google Workspace)
2. Verify MFA enrollment still active
3. Review changes made during compromise period
4. Rollback unauthorized changes if any
5. Document incident with timeline
6. Re-grant access after verification user account is secure

**Recovery Time:** Access revoked < 5 min, full investigation < 4 hours

---

### 2. Unauthorized Access Attempt

**Indicators:**

- Permission denied errors for unfamiliar users
- Failed impersonation attempts
- Unexpected IAM policy changes

**Immediate Actions:**

```bash
# 1. Check who attempted access
gcloud logging read '
  protoPayload.status.code!=0
  AND protoPayload.methodName:"generateAccessToken"
' --limit 100

# 2. Verify IAM policies haven't been modified
gcloud logging read '
  protoPayload.methodName:"SetIamPolicy"
  AND timestamp>="'$(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%SZ)'"
'
```

**Investigation:**

1. Identify user attempting access
2. Check if legitimate (new employee, misconfiguration)
3. If illegitimate: Investigate how they attempted access
4. Review org-wide IAM policies for misconfigurations

**Recovery Actions:**

- If legitimate: Grant proper permissions
- If illegitimate: Alert security team, investigate breach vector

**Recovery Time:** Investigation < 2 hours

---

### 3. Suspicious Production Activity

**Indicators:**

- After-hours deployments without justification
- Unusual resource modifications
- Multiple rapid deployments
- Deployment by unauthorized user

**Immediate Actions:**

```bash
# 1. Query production audit logs for recent activity
gcloud logging read '
  resource.labels.project_id="curb-map-production"
  AND timestamp>="'$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ)'"
' --format=json

# 2. Identify who made changes
jq -r '.[] | .protoPayload.authenticationInfo.principalEmail' | sort -u

# 3. Review what was changed
jq '.[] | {user: .protoPayload.authenticationInfo.principalEmail, method: .protoPayload.methodName, resource: .protoPayload.resourceName}'
```

**Investigation:**

1. Contact user who made changes
2. Verify authorization for changes
3. Check change management tickets/approvals
4. Review changes for correctness/safety

**Recovery Actions:**

- If authorized: Document justification
- If unauthorized: Rollback changes, revoke access, investigate

**Recovery Time:** Contact user < 15 min, investigation < 1 hour

---

### 4. Employee Departure

**Indicators:**

- HR notification of termination
- Planned resignation

**Immediate Actions (Same Day):**

```bash
EMAIL="departing@company.com"

# 1. Revoke all access
for project in curb-map-{development,staging,production}; do
  echo "Revoking access from $project..."
  gcloud iam service-accounts remove-iam-policy-binding \
    firebase-infrastructure-sa@${project}.iam.gserviceaccount.com \
    --member="user:$EMAIL" \
    --role="roles/iam.serviceAccountTokenCreator" \
    --project=$project
done

# 2. Verify revocation
for project in curb-map-{development,staging,production}; do
  gcloud iam service-accounts get-iam-policy \
    firebase-infrastructure-sa@${project}.iam.gserviceaccount.com \
    --project=$project | grep "$EMAIL" && echo "WARNING: Still has access to $project" || echo "✓ No access to $project"
done
```

**Follow-up Actions:**

```bash
# 3. Review recent activity (last 30 days)
gcloud logging read '
  protoPayload.authenticationInfo.principalEmail="departing@company.com"
  AND timestamp>="'$(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%SZ)'"
' --format=json > departing-user-activity-$(date +%Y-%m-%d).json

# 4. Archive for records
mv departing-user-activity-*.json compliance/offboarding/
```

**Documentation:**

- Date of departure
- Access revoked from which environments
- Admin who revoked
- Any outstanding work transferred to other team members

**Recovery Time:** Access revoked < 30 min, review complete same day

---

### 5. Security Policy Violation

**Examples:**

- Attempting to create service account keys
- Sharing credentials
- Accessing production without justification
- Modifying production without approval

**Immediate Actions:**

1. Document violation with evidence (audit logs)
2. Contact user to explain violation
3. Revoke access if severe or repeated violation
4. Manager notification for policy violations

**Investigation:**

```bash
# Check for service account key creation attempts
gcloud logging read '
  protoPayload.methodName="google.iam.admin.v1.CreateServiceAccountKey"
  AND protoPayload.status.code!=0
' --format=json

# Review user's recent activity
gcloud logging read '
  protoPayload.authenticationInfo.principalEmail="violator@company.com"
  AND timestamp>="'$(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ)'"
'
```

**Recovery Actions:**

- **Minor violation:** Warning, security training
- **Major violation:** Immediate access revocation, HR escalation
- **Repeated violations:** Termination

---

## Incident Response Workflow

### 1. Detection

**Automated Alerts:**

- After-hours production deployment
- New user accessing production
- Multiple failed permission attempts
- IAM policy changes

**Manual Detection:**

- Quarterly access review finds anomalies
- User reports suspicious activity
- Manager notices unauthorized changes

### 2. Triage

**Priority Levels:**

- **P0 (< 5 min):** Compromised account with production access, unauthorized data access, active security breach
- **P1 (< 1 hour):** Suspicious production activity, unauthorized configuration changes, failed breach attempt
- **P2 (< 4 hours):** Policy violations, after-hours deployments without justification, unusual access patterns
- **P3 (< 24 hours):** Access review findings, cleanup of old permissions, documentation updates

### 3. Response

**Incident Commander:** CTO or designated security lead
**Authority:** Revoke access immediately, coordinate investigation, communicate with stakeholders

**Technical Response:**

- Revoke access as needed
- Query audit logs
- Assess damage
- Implement fixes

**Communication:**

- Notify affected users
- Update management
- Document in incident tracker
- Post-incident review

### 4. Recovery

**Immediate (< 5 min):** Revoke compromised access, verify revocation effective

**Short-term (< 4 hours):** Investigate full scope, rollback unauthorized changes, restore to known good state

**Long-term:** Root cause analysis, improve detection/prevention, update procedures, security training

### 5. Post-Incident

**Documentation:**

- Incident timeline
- Actions taken
- Damage assessment
- Root cause
- Prevention measures

**Review:**

- What worked well?
- What could be improved?
- Update runbooks
- Share lessons learned

**Evidence Retention:** Audit log exports, incident documentation, communication records (retain 7 years for SOC2
compliance)

---

## Response Time Targets

| Incident Type           | Detection  | Triage   | Revocation | Investigation | Recovery  |
|-------------------------|------------|----------|------------|---------------|-----------|
| **Compromised Account** | Real-time  | < 5 min  | < 5 min    | < 1 hour      | < 4 hours |
| **Unauthorized Access** | Real-time  | < 15 min | N/A        | < 2 hours     | Same day  |
| **Suspicious Activity** | < 1 hour   | < 30 min | If needed  | < 4 hours     | Same day  |
| **Employee Departure**  | Same day   | N/A      | < 30 min   | Same day      | Complete  |
| **Policy Violation**    | < 24 hours | < 1 hour | If severe  | < 4 hours     | < 1 week  |

---

## Communication Templates

### Incident Notification (Internal)

```
Subject: [SECURITY INCIDENT] Unauthorized Access Attempt - curb-map-production

Priority: P1 (High)
Status: Under Investigation
Incident Commander: security@company.com

SUMMARY:
Unauthorized access attempt detected on curb-map-production at 2025-09-30 14:23 UTC.

IMPACT:
- No data accessed (attempt failed)
- No configuration changes made
- No service disruption

ACTIONS TAKEN:
- Access attempt logged and blocked
- Investigating source of attempt
- Reviewing IAM policies for misconfigurations

NEXT STEPS:
- Complete investigation by EOD
- Update security policies if needed
- Post-incident review scheduled for tomorrow

UPDATES:
Will send updates every hour until resolved.

Contact: security@company.com
```

### User Notification (Access Revoked)

```
Subject: Security Incident - Your CurbMap Access Temporarily Revoked

Hi [Name],

Due to suspicious activity detected on your account, we have temporarily revoked your CurbMap infrastructure access as a precautionary measure.

WHAT HAPPENED:
Unusual activity detected from your account at [timestamp]

IMMEDIATE ACTIONS:
1. Reset your Google Workspace password immediately
2. Verify your MFA devices are still your own
3. Review recent account activity in Google account settings

NEXT STEPS:
Security team will contact you within 1 hour to investigate and restore access once your account is verified secure.

If you have any questions, contact security@company.com

- CurbMap Security Team
```

---

## Testing & Drills

### Annual Security Drill

**Scenario:** Simulated compromised account

**Process:**

1. Randomly select a developer account
2. Security team "compromises" account (with their knowledge)
3. Detection systems should alert
4. Incident Commander responds per runbook
5. Access revoked and investigation performed
6. Measure response times
7. Review and improve procedures

**Success Criteria:**

- Detection within target time
- Access revoked < 5 minutes
- Complete investigation < 4 hours
- Lessons learned documented

**Frequency:** Annually + after major changes

---

## References

- **Access Management:** [access-management.md](access-management.md)
- **Audit Logs:** [audit-and-logging.md](audit-and-logging.md)
- **Authentication:** [authentication-model.md](authentication-model.md)
