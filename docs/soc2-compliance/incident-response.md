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

| Phase | Timeline | Actions |
|-------|----------|---------|
| **Detection** | Real-time | Unusual audit activity, user reports suspicious logins, failed MFA, unusual locations |
| **Immediate** | < 5 min | Revoke impersonation permissions (all projects), verify revocation |
| **Investigation** | < 1 hour | Query audit logs (7 days), identify what was accessed/modified |
| **Recovery** | < 4 hours | Reset password, verify MFA, review changes, rollback if needed, document incident |
| **Restoration** | After verification | Re-grant access once account secure |

**Critical Commands**: See [Executive Summary](#executive-summary) for revocation script.

---

### 2. Unauthorized Access Attempt

| Phase | Timeline | Actions |
|-------|----------|---------|
| **Detection** | Real-time | Permission denied for unfamiliar users, failed impersonation, unexpected IAM changes |
| **Immediate** | < 15 min | Query failed access attempts, verify IAM policies unchanged |
| **Investigation** | < 2 hours | Identify user, check if legitimate (new employee vs breach), review org IAM policies |
| **Recovery** | Same day | If legitimate: grant access. If illegitimate: alert security, investigate breach vector |

---

### 3. Suspicious Production Activity

| Phase | Timeline | Actions |
|-------|----------|---------|
| **Detection** | < 1 hour | After-hours deployments, unusual modifications, rapid deployments, unauthorized user |
| **Immediate** | < 15 min | Query production audit logs, identify who made changes, review what changed |
| **Investigation** | < 1 hour | Contact user, verify authorization, check change management tickets, review safety |
| **Recovery** | Same day | If authorized: document. If unauthorized: rollback, revoke access, investigate |

---

### 4. Employee Departure

| Phase | Timeline | Actions |
|-------|----------|---------|
| **Detection** | Same day | HR notification (termination or resignation) |
| **Immediate** | < 30 min | Revoke all access (dev/staging/production), verify revocation |
| **Follow-up** | Same day | Review recent activity (30 days), archive audit logs to compliance/offboarding/ |
| **Documentation** | Same day | Date, environments, admin who revoked, work transfer notes |

**Critical Commands**: See [Executive Summary](#executive-summary) for multi-project revocation script.

---

### 5. Security Policy Violation

| Severity | Examples | Timeline | Actions |
|----------|----------|----------|---------|
| **Minor** | Unintentional policy breach | < 24 hours | Document with evidence, contact user, warning, security training |
| **Major** | Key creation attempts, unauthorized prod access | < 1 hour | Document, contact user, revoke access, manager notification, HR escalation |
| **Repeated** | Multiple violations after warning | Immediate | Revoke access, HR escalation, termination |

**Investigation**: Query audit logs for key creation attempts, review user's recent activity (7 days).

---

## Incident Response Workflow

| Phase | Timeline | Activities | Outputs |
|-------|----------|------------|---------|
| **1. Detection** | Real-time or periodic | Automated alerts (after-hours prod deployment, new prod user, failed permissions, IAM changes)<br>Manual detection (access reviews, user reports, manager notices) | Alert/notification |
| **2. Triage** | < 5 min to < 24 hr | Assign priority (P0/P1/P2/P3), assign Incident Commander (CTO or security lead) | Priority level, IC assigned |
| **3. Response** | Per priority level | Revoke access if needed, query audit logs, assess damage, implement fixes<br>Communication: notify users, update management, document | Access revoked, logs exported, stakeholders notified |
| **4. Recovery** | Immediate to long-term | Immediate (< 5 min): Revoke access<br>Short-term (< 4 hr): Investigate, rollback changes<br>Long-term: Root cause analysis, improve detection, update procedures | System restored, procedures updated |
| **5. Post-Incident** | Within 1 week | Document timeline/actions/damage/root cause/prevention<br>Review: What worked? What to improve?<br>Update runbooks, share lessons learned | Incident report, updated runbooks, training |

**Priority Levels**:

| Priority | Response Time | Examples |
|----------|--------------|----------|
| **P0** | < 5 min | Compromised account with prod access, unauthorized data access, active breach |
| **P1** | < 1 hour | Suspicious prod activity, unauthorized config changes, failed breach attempt |
| **P2** | < 4 hours | Policy violations, after-hours deployments without justification, unusual access |
| **P3** | < 24 hours | Access review findings, cleanup old permissions, documentation updates |

**Evidence Retention**: Audit log exports, incident documentation, communication records (7 years for SOC2).

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
