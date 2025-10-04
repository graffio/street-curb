# F108 - Event Sourcing Core

**Implement core event sourcing pattern with queue processing for CurbMap**

## Overview

This specification implements the event sourcing architecture defined in [event-sourcing]. The
system uses this pattern to provide offline-first capability, SOC2-compliant audit trail, and scalable processing:

    Firestore queue → Giant function → Events → Materialized views

## References

- [event-sourcing] — Technical architecture and patterns
- [multi-tenant] — Data isolation and authorization
- [authentication] — Authentication and impersonation support
- [firebase-functions-deploy] — Firebase functions deployment patterns
- [firebase-integration-tests-strategy] — Integration testing with Firebase emulator

## Implementation Phases

### Phase 1: Foundation

- **task_1_1_create_tagged_types_and_helpers**: Create QueueItem and Action tagged types with Firestore
  integration helpers
- **task_1_2_setup_integration_testing**: Set up Firebase emulator integration testing infrastructure
- **task_1_3_create_functions_workspace**: Create dedicated Firebase functions workspace following
  firebase-functions-deploy.md
- **task_1_4_create_minimal_giant_function**: Create minimal queue processing function for integration testing
- **task_1_5_create_queue_collection**: Create Firestore update_queue collection with security rules and indexes

### Phase 2: Queue Collection Setup

- **task_2_1_queue_utilities**: Implement queue management utilities and helper functions

### Phase 3: Function Implementation

- **task_2_2_giant_function**: Create main queue processing function with error handling
- **task_2_3_idempotency**: Implement idempotency checks to prevent duplicate processing

### Phase 4: Event Types and Validation

- **task_3_1_event_types**: Define event types and validation schemas
- **task_3_2_authorization**: Implement authorization checks for event creation

### Phase 5: Materialized Views

- **task_4_1_materialized_views**: Create materialized views for common queries
- **task_4_2_view_sync**: Ensure materialized views stay synchronized with events

### Phase 6: Testing and Validation

- **task_5_1_integration_testing**: Validate end-to-end event sourcing workflow

[authentication]: ../../docs/architecture/authentication.md
[event-sourcing]: ../../docs/architecture/event-sourcing.md
[multi-tenant]: ../../docs/architecture/multi-tenant.md
[firebase-functions-deploy]: ../../docs/runbooks/firebase-functions-deploy.md
[firebase-integration-tests-strategy]: ../../docs/runbooks/firebase-integration-tests-strategy.md
