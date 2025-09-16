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

## Core Pattern

```
Client (Online/Offline) → Firestore Queue → Giant Function → Events → Materialized Views
```

**Benefits**: Offline-first, SOC2-compliant audit trail, scalable multi-tenant architecture

## Implementation Order

1. **Week 1**: Infrastructure Foundation (`phase1-infrastructure.md`)
2. **Week 2**: Event Sourcing Core (`phase2-events.md`)
3. **Week 3**: Authentication System (`phase3-auth.md`)
4. **Week 4**: Multi-Tenant Data Model (`phase4-multitenant.md`)
5. **Week 5**: Offline Queue Architecture (`phase5-offline.md`)
6. **Week 6**: Billing & Export (`phase6-billing.md`)

## Key Files

- **`architecture.md`** - Technical architecture and data model
- **`roadmap.md`** - Detailed 6-week implementation sequence
- **`decisions.md`** - All decisions made and remaining questions
- **`migration-testing-strategy.md`** - Temporary environment testing approach
- **`phase2-events.md`** through **`phase6-billing.md`** - Implementation details

## Quick Start

1. Read `architecture.md` for core patterns
2. Follow `roadmap.md` for implementation sequence
3. Check `decisions.md` for any remaining questions
4. Review `migration-testing-strategy.md` for deployment approach
5. Continue with `phase2-events.md` (infrastructure foundation complete)

## Success Criteria

**Technical**: Multi-tenant data isolation, comprehensive audit logging, role-based access control, secure authentication, performance monitoring

**Business**: Annual billing support, usage tracking, export functionality, customer onboarding

**Compliance**: SOC2-ready security controls, comprehensive audit trails, data encryption, access controls