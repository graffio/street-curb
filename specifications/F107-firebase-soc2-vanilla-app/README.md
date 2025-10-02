# CurbMap - SOC2-Ready Multi-Tenant SaaS

**Multi-tenant SaaS application for cities to manage curb data collection with offline-capable mobile web app.**

## What We're Building

**Target Customers**: Cities and municipalities
**Pricing**: Annual fixed fee (thousands/year, check payment)
**Core Use Case**: Field workers collect curb measurements using mobile web app, works offline, syncs when online

## Architecture Decisions (✅ DECIDED)

- **App Name**: CurbMap
- **Architecture**: Event sourcing with Firestore queue + giant function
- **Data Model**: Organizations + Projects hierarchy with event scoping
- **Authentication**: Passcode-only, no anonymous users
- **Environments**: `curb-map-development`, `curb-map-staging`, `curb-map-production`
- **Error Monitoring**: Sentry.io
- **CI/CD**: GitLab
- **Billing**: Single account with project labels
- **Terminology**: Organizations (not cities), Members (not users)
- **Infrastructure Setup**: Manual console (one-time) + scripted operations (ongoing)
- **Developer Auth**: Service account impersonation (no key files)

## Core Pattern

```
Client (Online/Offline) → Firestore Queue → Giant Function → Events → Materialized Views
```

**Benefits**: Offline-first, SOC2-compliant audit trail, scalable multi-tenant architecture

## Implementation Order

### Infrastructure Setup (Manual, One-Time)
1. Create Firebase projects in console (`manual-setup.md`)
2. Create service accounts and grant impersonation permissions
3. Developer authentication setup

### Application Development (Scripted, Ongoing)
1. **Week 2**: Event Sourcing Core → See `specifications/F108-event-sourcing-core/` (all execution detail now lives in F108)
2. **Week 3**: Authentication System → See `specifications/F109-authentication-system/` (all execution detail now lives in F109)
3. **Week 4**: Multi-Tenant Data Model (`phase4-multitenant.md`)
4. **Week 5**: Offline Queue Architecture (`phase5-offline.md`)
5. **Week 6**: Billing & Export (`phase6-billing.md`)

## Key Files

### Getting Started
- **`manual-setup.md`** - One-time console setup instructions (start here!)
- **`next-step.md`** - Service account impersonation setup for developers
- **`architecture.md`** - Technical architecture and data model
- **`decisions.md`** - All decisions made and remaining questions

### Implementation Guides
- **`roadmap.md`** - Detailed 6-week implementation sequence
- **`specifications/F108-event-sourcing-core/`** - Week 2: Event Sourcing Core implementation
- **`specifications/F109-authentication-system/`** - Week 3: Authentication System implementation

### Testing & Operations
- **`migration-testing-strategy.md`** - Testing approach for configuration changes

## Quick Start

### For New Developers
1. Complete `manual-setup.md` (admin runs once per environment)
2. Set up impersonation following `next-step.md` (developer runs once)
3. Read `architecture.md` for core patterns
4. Start with `specifications/F108-event-sourcing-core/` (infrastructure already set up)

### For Infrastructure Changes
1. Check `decisions.md` for philosophy
2. Manual changes: Update `manual-setup.md`
3. Configuration changes: Create migration script
4. Test following `migration-testing-strategy.md`

## Success Criteria

**Technical**: Multi-tenant data isolation, comprehensive audit logging, role-based access control, secure authentication, performance monitoring

**Business**: Annual billing support, usage tracking, export functionality, customer onboarding

**Compliance**: SOC2-ready security controls, comprehensive audit trails, data encryption, access controls, service account impersonation with individual accountability

## Security Architecture

### Developer Authentication (SOC2-Enhanced)
- **No long-lived credentials**: Service account impersonation eliminates key files
- **Short-lived tokens**: Automatically expire (1-12 hours)
- **MFA protection**: User accounts require multi-factor authentication
- **Individual accountability**: Audit logs show "user@company.com impersonating SA@project"
- **Easy revocation**: Remove IAM binding to instantly revoke access

### Infrastructure Philosophy
- **Setup**: Manual console (stable, rarely changes, high-impact)
- **Operations**: Scripted migrations (frequent, version-controlled, repeatable)
- **Documentation**: Infrastructure as documentation + executable scripts
- **Compliance**: Manual changes documented, scripted changes in git

See `manual-setup.md` for detailed authentication setup.
