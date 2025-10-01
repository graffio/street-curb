# Compliance Roadmap

**SOC2 Implementation Timeline**

## Executive Summary

CurbMap's path to SOC2 compliance follows a three-phase approach: Foundation (manual setup + impersonation), Operational
Hardening (access reviews + incident response), and Continuous Compliance (automated reporting + monitoring). Full
readiness expected in 6-12 months.

**Current Status:** Phase 1 - Foundation (90% complete)

**Key Milestones:**

- ✅ Service account impersonation implemented (no key files)
- ✅ Documentation complete (authentication, access, audit, controls)
- 🔄 Manual setup guide ready (awaiting first production setup)
- 📋 Access review process defined (ready to implement)
- 📋 Incident response procedures documented (ready to test)

---

## Table of Contents

- [Phase 1: Foundation](#phase-1-foundation)
- [Phase 2: Operational Hardening](#phase-2-operational-hardening)
- [Phase 3: Continuous Compliance](#phase-3-continuous-compliance)
- [SOC2 Readiness Checklist](#soc2-readiness-checklist)

---

## Phase 1: Foundation

**Status:** 90% complete
**Duration:** Weeks 1-4 (September 2025)
**Goal:** Establish secure infrastructure access model with no long-lived credentials

### Completed

- ✅ **Architecture Decision:** Service account impersonation (not key files)
- ✅ **Documentation:**
    - authentication-model.md (how impersonation works)
    - roles-and-permissions.md (permission matrix)
    - audit-and-logging.md (audit trail strategy)
    - access-management.md (grant/revoke procedures)
    - incident-response.md (security incident procedures)
    - soc2-controls.md (control mappings)
    - operational-procedures.md (daily workflows)
    - compliance-roadmap.md (this document)
- ✅ **Setup Guides:**
    - manual-setup.md (one-time infrastructure setup)
    - next-step.md (developer impersonation setup)
- ✅ **Hybrid Approach:** Manual console setup + scripted operations

### In Progress

- 🔄 **First Production Setup:** Create `curb-map-production` Firebase project
- 🔄 **First Access Grants:** Grant production access to initial operators

### Phase 1 Deliverables

**Documentation:**

- ✅ All core compliance documents (8 files)
- ✅ Manual setup guide
- ✅ Developer onboarding guide

**Infrastructure:**

- ✅ Development environment configured with impersonation
- 🔄 Production environment (manual setup pending)
- 📋 Staging environment (manual setup pending)

**Controls:**

- ✅ CC6.1: Logical access control (impersonation model)
- ✅ CC6.2: User authorization (manual approval process)
- ✅ CC6.3: Role-based access (permission matrix defined)
- ✅ CC7.2: System monitoring (audit logs captured)
- ✅ CC7.3: Security events (incident response procedures)

---

## Phase 2: Operational Hardening

**Status:** Ready to begin
**Duration:** Months 2-4 (October-December 2025)
**Goal:** Implement recurring access reviews and test incident response

### Month 2 (October 2025)

**Access Review Implementation:**

- [ ] Conduct first monthly production access review
- [ ] Document review process and findings
- [ ] Create review templates and checklists
- [ ] Archive evidence for auditors

**Incident Response Testing:**

- [ ] Conduct security incident drill (simulated compromised account)
- [ ] Test revocation procedures (< 5 minute target)
- [ ] Test investigation procedures (< 4 hour target)
- [ ] Document drill results and improvements

**Evidence Collection:**

- [ ] Set up daily IAM policy exports (automated script)
- [ ] Create evidence directory structure
- [ ] Export first quarter of audit logs
- [ ] Document evidence retention procedures

### Month 3 (November 2025)

**Access Reviews:**

- [ ] Second monthly production access review
- [ ] First quarterly dev/staging access review
- [ ] Compare granted vs. actual usage
- [ ] Revoke unused permissions

**MFA Verification:**

- [ ] Verify all users have MFA enabled
- [ ] Generate MFA enrollment report from Google Workspace
- [ ] Document enforcement procedures

**Audit Samples:**

- [ ] Export sample production deployments (show user identity)
- [ ] Export sample access grants (show approval process)
- [ ] Export sample revocations (show immediate response)

### Month 4 (December 2025)

**Quarterly Review:**

- [ ] Q4 access review (all environments)
- [ ] Package evidence for auditor
- [ ] Management sign-off on reviews
- [ ] Archive for 7-year retention

**Process Refinement:**

- [ ] Review incident response drill results
- [ ] Update procedures based on learnings
- [ ] Train new team members on procedures
- [ ] Document any exceptions or edge cases

**Readiness Assessment:**

- [ ] Self-assessment against SOC2 TSC
- [ ] Identify any gaps
- [ ] Create remediation plan for gaps
- [ ] Schedule pre-audit with auditor (if pursuing formal audit)

### Phase 2 Deliverables

**Operational Procedures:**

- [ ] Monthly production access reviews (3 completed)
- [ ] Quarterly dev/staging access reviews (1 completed)
- [ ] Security incident drill (1 completed)
- [ ] MFA verification process

**Evidence:**

- [ ] 3 months of access reviews
- [ ] Audit log samples showing user identity
- [ ] Incident drill documentation
- [ ] MFA enrollment report

**Controls:**

- [ ] CC6.1-CC6.3: Access control evidence (3 months)
- [ ] CC7.2: Monitoring evidence (3 months of logs)
- [ ] CC7.3: Incident response testing (drill results)

---

## Phase 3: Continuous Compliance

**Status:** Planned
**Duration:** Months 5-12 (January-August 2026)
**Goal:** Automate compliance reporting and maintain ongoing readiness

### Months 5-6 (January-February 2026)

**Automation:**

- [ ] Daily IAM policy export script (automated)
- [ ] Weekly access report generation (automated)
- [ ] Alert setup for unusual activity
- [ ] Dashboard for compliance metrics

**Process Maturity:**

- [ ] Document lessons learned from 6 months of reviews
- [ ] Optimize review process (reduce manual work)
- [ ] Create runbooks for common scenarios
- [ ] Train additional team members

### Months 7-12 (March-August 2026)

**Continuous Operations:**

- [ ] Monthly production reviews (6 more)
- [ ] Quarterly access reviews (2 more)
- [ ] Annual security drill (full incident response test)
- [ ] Annual documentation review

**Audit Preparation:**

- [ ] Package 12 months of evidence
- [ ] Generate compliance report
- [ ] Schedule formal SOC2 Type I audit (if pursuing)
- [ ] Address any auditor findings

**Long-Term Improvements:**

- [ ] Custom IAM roles (exact permissions needed)
- [ ] Extended log retention (Cloud Storage sink for 7+ years)
- [ ] Automated alerting for policy violations
- [ ] Compliance dashboard for management

### Phase 3 Deliverables

**Operational Maturity:**

- [ ] 12 months of access reviews
- [ ] 2 security incident drills
- [ ] Automated evidence collection
- [ ] Compliance dashboard

**Audit Readiness:**

- [ ] Complete evidence package (12 months)
- [ ] Management attestations
- [ ] Process documentation
- [ ] Control testing results

**SOC2 Type I (if pursued):**

- [ ] Control design documentation
- [ ] Point-in-time testing
- [ ] Auditor report

---

## SOC2 Readiness Checklist

### CC6.1 - Logical Access Control

- ✅ Service account impersonation (no keys)
- ✅ MFA required on all accounts
- 🔄 Quarterly access reviews (process defined, awaiting first review)
- ✅ Separate environments (dev, staging, production)
- ✅ Documentation complete

**Evidence:**

- ✅ IAM policy exports
- 🔄 MFA enrollment report (process defined)
- 🔄 Access review documentation (templates ready)

### CC6.2 - User Authorization

- ✅ Manual approval process (documented)
- ✅ Different approval levels per environment
- ✅ Access grant documentation (templates ready)
- ✅ Google Workspace authentication

**Evidence:**

- 🔄 Access grant logs (directory structure ready)
- 🔄 Email/ticket approvals (process defined)
- ✅ GCP audit logs capture grants

### CC6.3 - Role-Based Access

- ✅ Permission matrix (documented)
- ✅ Least privilege roles
- ✅ Production more restricted than dev
- ✅ Access modifications logged

**Evidence:**

- ✅ Roles documentation
- ✅ Service account role assignments
- 🔄 Access review findings (awaiting first review)

### CC7.2 - System Monitoring

- ✅ GCP Cloud Audit Logs (400-day retention)
- ✅ Git history (permanent retention)
- ✅ Firestore events (7-year retention planned)
- ✅ Audit logs show user + SA identity

**Evidence:**

- ✅ Log retention configuration
- ✅ Sample audit logs (can generate)
- ✅ Git history showing changes

### CC7.3 - Security Events

- ✅ Incident response procedures (documented)
- ✅ Immediate revocation capability (< 5 minutes)
- ✅ Short-lived credentials (1-12 hours)
- 📋 Incident drill (planned for Month 2)

**Evidence:**

- ✅ Incident response runbook
- 📋 Drill results (awaiting first drill)
- 🔄 Incident logs (directory structure ready)

---

## Key Success Metrics

### Phase 1 (Foundation)

- ✅ Zero service account keys created
- ✅ All access via impersonation
- ✅ Documentation complete
- 🔄 Production environment setup

### Phase 2 (Operational Hardening)

- [ ] 100% of production access reviewed monthly
- [ ] < 5 minute revocation time (drill)
- [ ] < 4 hour investigation time (drill)
- [ ] 100% MFA enrollment

### Phase 3 (Continuous Compliance)

- [ ] 12 months of access reviews
- [ ] 2 security drills completed
- [ ] Automated evidence collection
- [ ] SOC2 Type I audit passed (if pursued)

---

## Risk Mitigation

### Current Risks

**Risk 1: No Production Access Yet**

- **Mitigation:** Phase 1 in progress, manual setup guide ready
- **Timeline:** Production setup expected Month 1

**Risk 2: No Access Reviews Yet**

- **Mitigation:** Process documented, templates ready
- **Timeline:** First review scheduled for Month 2

**Risk 3: Incident Response Untested**

- **Mitigation:** Procedures documented, drill planned
- **Timeline:** First drill scheduled for Month 2

### Ongoing Risks

**Risk 4: Human Error in Manual Setup**

- **Mitigation:** Detailed manual-setup.md, peer review required
- **Timeline:** Ongoing

**Risk 5: MFA Not Enforced**

- **Mitigation:** Google Workspace MFA enforcement, verification process
- **Timeline:** Month 3 verification

---

## References

- **Current Status:** See [README.md](README.md) implementation status
- **Controls:** [soc2-controls.md](soc2-controls.md)
- **Procedures:** [operational-procedures.md](operational-procedures.md)
- **Access Management:** [access-management.md](access-management.md)
