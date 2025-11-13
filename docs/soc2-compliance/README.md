# SOC2 Compliance Documentation

**CurbMap Firebase Infrastructure Security Model**

## Overview

CurbMap's Firebase/GCP infrastructure uses a **hybrid approach** that balances security, auditability, and operational
simplicity:

- **Infrastructure Setup (Manual):** One-time console actions for creating projects and foundational resources
- **Infrastructure Operations (Scripted):** Version-controlled, repeatable configuration changes via migrations
- **No Long-Lived Credentials:** Service account impersonation eliminates key files on developer laptops

| **Guiding Principles**          |                                                                                                             |
|---------------------------------|-------------------------------------------------------------------------------------------------------------|
| Least Privilege                 | Every human and service account receives only the permissions needed                                        |
| Individual Accountability       | Audit logs show "user@company.com impersonating SA@project"                                                 |
| Auditability                    | Manual setup documented, configuration changes version-controlled, all operations logged                    |
| Defense in Depth                | Separate environments, short-lived credentials, easy revocation                                             |
|                                 |                                                                                                             |
| **Documentation Structure**     |                                                                                                             |
| Core Security Model             | **[Authentication Model](authentication-model.md)** <br> Service account impersonation explained            |
|                                 | **[Roles & Permissions](roles-and-permissions.md)** <br> Permission matrix and access patterns              |
|                                 | **[Audit & Logging](audit-and-logging.md)** <br> Audit trail strategy and retention                         |
| Operational Procedures          | **[Access Management](access-management.md)** <br> Granting/revoking access procedures                      |
|                                 | **[Operational Guidelines](operational-procedures.md)** <br> Best practices for admins/developers/operators |
|                                 | **[Incident Response](incident-response.md)** <br> Security incident procedures                             |
| Compliance                      | **[SOC2 Controls](soc2-controls.md)** <br> Control mappings and evidence                                    |
|                                 | **[Compliance Roadmap](compliance-roadmap.md)** <br> Milestones and timeline                                |
|                                 |                                                                                                             |
| **Quick Reference**             |                                                                                                             |
| New Developers                  | 1. Read [Authentication Model](authentication-model.md) to understand impersonation                         |
|                                 | 2. Follow setup in `specifications/F107-firebase-soc2-vanilla-app/next-step.md`                             |
|                                 | 3. Review [Operational Guidelines](operational-procedures.md)                                               |
| Administrators                  | 1. Read [Access Management](access-management.md) for granting procedures                                   |
|                                 | 2. Implement [Operational Guidelines](operational-procedures.md) quarterly reviews                          |
|                                 | 3. Prepare [SOC2 Controls](soc2-controls.md) evidence                                                       |
| Auditors                        | 1. Review [SOC2 Controls](soc2-controls.md) for control mappings                                            |
|                                 | 2. Check [Audit & Logging](audit-and-logging.md) for evidence locations                                     |
|                                 | 3. Verify [Access Management](access-management.md) procedures                                              |
|                                 |                                                                                                             |
| **Implementation Status**       |                                                                                                             |
| Phase 1 - Foundation            | Manual setup, service account impersonation, no key files                                                   |
| Phase 2 - Operational Hardening | Access review process, incident response                                                                    | 
| Phase 3 - Continuous Compliance | Automated reporting, compliance dashboard                                                                   | 
|                                 | See [Compliance Roadmap](compliance-roadmap.md) for detailed timeline.                                      |
|                                 |                                                                                                             |
| **Related Documentation**       |                                                                                                             |
| Setup Guide                     | `specifications/F107-firebase-soc2-vanilla-app/manual-setup.md`                                             |
| Impersonation Setup             | `specifications/F107-firebase-soc2-vanilla-app/next-step.md`                                                |
| Architecture                    | `specifications/F107-firebase-soc2-vanilla-app/architecture.md`                                             |
| Decisions                       | `specifications/F107-firebase-soc2-vanilla-app/decisions.md`                                                |
|                                 |                                                                                                             |
| **Revision History**            |                                                                                                             |
| 2025-09-30                      | Initial documentation for hybrid approach (manual setup + impersonation)                                    |
