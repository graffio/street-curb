# CurbMap Architecture

## Core Pattern: Event Sourcing + Queue

```
Client (Online/Offline) → Firestore Queue → Giant Function → Events → Materialized Views
```

**Benefits**: Offline-first, SOC2-compliant audit trail, scalable multi-tenant architecture

## Architecture References

- **Event Sourcing**: See `docs/architecture/event-sourcing.md` for event sourcing patterns
- **Queue Mechanism**: See `docs/architecture/queue-mechanism.md` for offline queue processing
- **Offline-First**: See `docs/architecture/offline-first.md` for offline-first design patterns
- **Multi-Tenant**: See `docs/architecture/multi-tenant.md` for organization and project hierarchy
- **Billing Integration**: See `docs/architecture/billing-integration.md` for billing and export patterns
- **Data Model**: See `docs/architecture/data-model.md` for data structures and materialized views
- **Security Model**: See `docs/architecture/security.md` for authentication, authorization, and compliance
- **Authentication**: See `docs/architecture/authentication.md` for passcode-only auth and service account impersonation
- **Deployment**: See `docs/architecture/deployment.md` for environment configuration and infrastructure

## Implementation Phases

For detailed implementation, see the phase files:
- **Phase 2**: `phase2-events.md` - Event sourcing core implementation
- **Phase 3**: `phase3-auth.md` - Authentication system implementation
- **Phase 4**: `phase4-multitenant.md` - Multi-tenant data model implementation
- **Phase 5**: `phase5-offline.md` - Offline queue implementation
- **Phase 6**: `phase6-billing.md` - Billing integration implementation
