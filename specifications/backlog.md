# Deferred Features Backlog

This file tracks features that were removed from specifications as over-engineered or premature.
Items here should be reconsidered when the appropriate context exists.

## New Specification Order

After simplification, the implementation order is:
1. **F108**: Event sourcing infrastructure ✅ (completed)
2. **F110**: Domain model (Action types, event handlers) - 12h
3. **F110.5**: Authentication & authorization - 18h
4. **F110.6**: Materialized views - 8h (needed for F113 UI)
5. **F113**: React/Redux UI ✅ (to be created after F110.6)
6. **F112**: Billing & export
7. **F111**: Offline infrastructure - **DEFERRED** (not needed until iOS/Android apps)

**Key Decisions**:
- **F110.6 before F113**: UI needs materialized views to read/display data
- **F113 before F111**: UI is more pressing; building it will inform offline requirements
- **F111 deferred**: Offline infrastructure not needed until mobile apps exist

## Phase 2 Enhancements (After MVP, Before Production)

### Materialized View Optimization
- **From**: F110 (task_3_3 - view sync optimization)
- **Why Deferred**: Basic views in F110.6 sufficient for MVP
- **When**: After F110.6 completes and performance issues identified
- **Complexity**: Low-Medium (3-5 hours)
- **Description**:
  - View synchronization optimization
  - Complex aggregations and computed fields
  - Advanced querying and filtering
  - Caching strategies
- **Notes**: F110.6 provides basic views; this adds optimization

### CRUD API Wrappers
- **From**: F110.5 (task_2 authorization_and_apis), F110 (task_1_2, task_2_2)
- **Why Deferred**: Not needed for MVP (clients can write ActionRequests directly)
- **When**: When external integrations, webhooks, or rate limiting needed
- **Complexity**: Medium (10-15 hours)
- **Description**:
  - Organization CRUD APIs (POST/GET/PUT/DELETE /organizations)
  - Project CRUD APIs (POST/GET/PUT/DELETE /organizations/:id/projects)
  - User management APIs (list users, assign roles, remove users)
  - APIs wrap ActionRequest creation and write to Firestore
  - Enable external integrations without Firestore SDK
  - Add API-level rate limiting
  - Authorization middleware (optional - security rules sufficient for MVP)
- **Notes**:
  - Keep lightweight - just validation + ActionRequest creation + queue write
  - For MVP, clients write ActionRequests directly via Firestore SDK
  - APIs needed later for: webhooks, external integrations, public APIs

### Performance Optimization
- **From**: F110 (task_3_3)
- **Why Deferred**: Premature optimization
- **When**: After load testing reveals bottlenecks
- **Complexity**: Medium (3-5 hours)
- **Description**:
  - View synchronization optimization
  - Query performance tuning
  - Caching strategies
  - Connection pooling

## Production Features (Needed for Production, Not MVP)

### Impersonation System
- **From**: F110.5/F109 (task_3_1, task_3_2)
- **Why Deferred**: Support tooling, not core functionality
- **When**: Before production launch (customer support needs)
- **Complexity**: Medium-High (9 hours estimated)
- **Description**:
  - Secure impersonation API (session creation, validation, expiration)
  - Impersonation middleware for API requests
  - Complete audit logging for all impersonation activities
  - 1-hour session expiration
- **Notes**: Critical for SOC2 compliance in production

### Operational Monitoring & Alerting
- **From**: F110.5/F109 (task_5_2)
- **Why Deferred**: Not needed until production deployment
- **When**: Before production launch
- **Complexity**: Medium (4-6 hours)
- **Description**:
  - Authentication failure monitoring
  - Rate limit violation alerts
  - Cross-tenant access attempt alerts
  - SOC2 compliance dashboards
  - Performance monitoring
- **Notes**: Use existing GCP monitoring infrastructure

### Load Testing Infrastructure
- **From**: F110 (task_6_1), F110.5/F109 (task_5_1)
- **Why Deferred**: Premature without production-like data volumes
- **When**: Before production launch
- **Complexity**: Medium (6-10 hours)
- **Description**:
  - Load test scripts for authentication
  - Multi-tenant scenario testing
  - Burst workload simulation
  - Performance regression testing
- **Notes**: Integrate with CI/CD pipeline

## Mobile App Features (Deferred Until iOS/Android Apps)

### Offline Infrastructure (F111)
- **From**: F111 (entire spec - 66 hours)
- **Why Deferred**: Not needed until mobile apps are built; web UI can write directly to Firestore
- **When**: After F113 (React UI) is built and iOS/Android apps are started
- **Complexity**: High (66 hours estimated)
- **Description**:
  - Client-side queue service (store ActionRequests locally)
  - Offline storage mechanisms
  - Sync service (sync offline operations when online)
  - Connection detection and adaptive sync strategies
  - Conflict detection and resolution (automatic + user-guided)
  - Real-time status updates and notifications
  - Error handling and retry logic with exponential backoff
  - Integration testing for offline scenarios
- **Notes**:
  - F113 (web UI) writes ActionRequests directly to Firestore
  - F111 adds offline capability for mobile field workers
  - Building F113 first will inform F111 requirements
  - UI integration tasks in F111 should be reconsidered after F113 exists

## Future Capabilities (Nice-to-Have)

### Advanced Querying
- **From**: Implicit in F110 materialized views
- **Why Deferred**: Basic queries sufficient for MVP
- **When**: User feedback indicates need
- **Complexity**: High (unknown)
- **Description**:
  - Full-text search across organizations/projects
  - Complex filtering and aggregation
  - Saved searches and reports
  - Export functionality

### Real-Time Subscriptions
- **From**: Not explicitly planned
- **Why Deferred**: Not required for MVP
- **When**: User feedback indicates need
- **Complexity**: Medium-High (8-12 hours)
- **Description**:
  - WebSocket connections for real-time updates
  - Subscribe to organization/project changes
  - Live notification system
  - Presence indicators

### Batch Operations
- **From**: Not explicitly planned
- **Why Deferred**: Single operations sufficient for MVP
- **When**: User feedback indicates need (bulk imports, etc.)
- **Complexity**: Medium (6-8 hours)
- **Description**:
  - Bulk ActionRequest creation
  - Batch processing infrastructure
  - Progress tracking and cancellation
  - Error handling for partial failures

## Explicitly Rejected (Won't Implement)

### SMS Passcode Delivery Complexity
- **From**: F110.5/F109 (task_1_2)
- **Why Rejected**: Firebase Auth handles SMS natively
- **Notes**: No custom SMS provider needed - use Firebase Auth built-in

### Separate Event Type Registry
- **From**: F108 (task_3_1)
- **Why Rejected**: Action tagged types already provide validation
- **Notes**: No separate registry needed - types are self-validating

### Separate Validation Tasks
- **From**: F110 (task_1_3, task_2_3)
- **Why Rejected**: Validation belongs in event handlers, not separate layer
- **Notes**: Keep validation co-located with business logic

### Standalone Data Isolation Middleware
- **From**: F110 (task_4_1-4_3)
- **Why Rejected**: Firestore security rules provide isolation
- **Notes**: Security rules enforce org/project scoping at database level

---

## Review Schedule

Review this backlog:
- After F110 completes (domain model done)
- After F110.5 completes (auth done)
- Before production launch (operational features needed)
- Quarterly based on user feedback (future capabilities)
