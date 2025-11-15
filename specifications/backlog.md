# Deferred Features Backlog

This file tracks features that were removed from specifications as over-engineered or premature.
Items here should be reconsidered when the appropriate context exists.


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

### Authentication Rate Limiting
- **From**: F121 (authentication middleware)
- **Why Deferred**: Manual abuse handling acceptable for MVP
- **When**: Before public launch (abuse prevention)
- **Complexity**: Medium (4-6 hours)
- **Description**:
  - Rate limit PasscodeRequested per phone number (e.g., 5 per hour)
  - Rate limit PasscodeRequested per IP address (e.g., 20 per hour)
  - Rate limit PasscodeVerified attempts (already 3 per session)
  - Integrate with Firebase Functions quota system
  - Alert on rate limit violations
- **Notes**: SOC2 CC7.2 requirement for production

### Authentication Audit Data Archival
- **From**: F121 (authentication middleware)
- **Why Deferred**: 90-day Firestore retention sufficient for MVP
- **When**: Before production launch (long-term audit requirements)
- **Complexity**: Medium (5-7 hours)
- **Description**:
  - Scheduled function to archive old PasscodeRequested/PasscodeVerified to BigQuery
  - 90-day Firestore retention + indefinite BigQuery archival
  - Hash phone numbers for privacy in BigQuery
  - Query templates for SOC2 audit reports
  - Monthly authentication stats dashboard
- **Notes**: SOC2 CC6.1 compliance for long-term audit trail

## Mobile App Features (Deferred Until iOS/Android Apps)

### Offline Action Queue (formerly F111)
- **From**: F111 (entire spec - will need significant redesign)
- **Why Deferred**: Not needed until mobile apps are built; web UI is online-only
- **When**: When building iOS/Android mobile apps for field workers
- **Complexity**: High (to be re-estimated after HTTP architecture is complete)
- **Architecture Change**: Original F111 was designed for Firestore trigger-based submission. With F110.7's HTTP submission, the offline queue will need to:
  - Queue HTTP function calls (not Firestore writes)
  - Store authentication tokens securely
  - Retry failed HTTP requests with exponential backoff
  - Handle HTTP-specific errors (400, 401, 403, 500, etc.)
  - Synchronize queue when connection restored
- **Description** (to be redesigned):
  - IndexedDB/localStorage queue for pending HTTP calls
  - Network state detection (online/offline)
  - Background sync when connection restored
  - Conflict detection and resolution
  - Progress indicators for sync status
  - Error handling and retry logic
  - Integration with mobile app authentication
- **Notes**:
  - Web UI (F113) is online-only - acceptable for desk workers
  - Mobile field workers need offline capability (can't rely on cell service)
  - Original F111 spec in `specifications/F111-offline-queue-architecture/` is now outdated
  - Will need full redesign when mobile apps are started
  - Building mobile apps first will inform actual requirements

## User Management Features (Deferred from F125)

### User Management Phase 2 Integration
- **From**: F125 (Phase 2: Deferred Features)
- **Why Deferred**: MVP focused on UI components only; backend integration requires routing infrastructure
- **When**: After app routing and page structure is established
- **Complexity**: Medium (6-8 hours)
- **Description**:
  - Integrate AdminUsersTabbedPanel into app routing
  - Connect to real Firestore members collection via Redux/selectors
  - Implement role change via `submitActionRequest()` API
  - Add toast notifications for successful role changes
  - Add error dialogs for failed operations
  - Build invitation system for adding new members
- **Notes**: UI components complete in design-system and curb-map; integration work only

## Future Capabilities (Nice-to-Have)

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

---

## Review Schedule

Review this backlog:
- Before production launch (operational features needed)
- Quarterly based on user feedback (future capabilities)
