# Critical Decisions Needed Before Implementation

**Date:** 2025.08.29  
**Purpose:** Block-and-tackle decisions that prevent infrastructure code development  
**Status:** All items marked as blockers - must decide to proceed

## Environment Structure & Naming

### Development vs Developer Environments
**Question**: Are "development" and "developer" environments different things?
- Development: Shared team environment?
- Developer: Individual sandbox environments (alice, bob)?
- **User concern**: "this is confusing developer and development environments?"
- **Proposed**: Use "dev-shared" and "dev-{name}" naming

**Decision needed**: Final naming convention
- `myapp-dev-shared-{timestamp}` 
- `myapp-dev-alice-{timestamp}`
- `myapp-staging-{timestamp}`
- `myapp-production`
- user_comments:
  - let's skip developer-specific environments (...dev-alice...) for now; developers will work with the emulators anyway
  - we *do* need a single "development" environment in addition to staging (mirrors production) and production

**Additional questions**:
- Do we need a level of hierarchy *below* organization? Would a customer ever want more than one "project"?
- user_comments:
  - we decided we need this now for future expansion

### Staging Data Strategy  
**Question**: Where would real customer data in staging come from?
- Copy from production for debugging?
- Synthetic data only?
- **SOC2 Impact**: If real data, staging becomes SOC2 scope

**User concerns**:
- "Where would such data come from?"
- "If we're SOC2 compliant, how can we view/copy/manage customer data that's causing issues? Copy it to staging?"
- "How would we manage the auth/user information when copying into staging?"
- user_comments:
  - is there an alternative to copying from production back to staging? How else will we debug customer-specific issues?
  - could we instead add a "back-door user" to each organization allowing us to log into it? Would seem to violate SOC2

**Decision needed**: Staging data policy and SOC2 scope

## Terminology & Data Model - ✅ DECIDED

### Cities vs Organizations
**DECISION**: Use "organizations" terminology throughout
- Not all customers are cities
- More scalable terminology
- **Implementation**: Use `org_id` fields, API endpoints use `/organizations/`
- user_comments:
  - never abbreviate field names; use camelCase: organizationId
  - always include the suffix "Id" when a field is actually an id

### Data Hierarchy Structure  
**DECISION**: Multi-level hierarchy with event sourcing
- **Structure**: `Organization > Project > Events`
- **Event sourcing**: Store all changes as immutable events, calculate current state
- **Multi-project**: Design for multiple projects per org, start with default project
- **CCPA compliance**: "Right to be forgotten" via UserForgotten events

- user_comments:
  - how can possibly be efficient? Do we have periodic "aggregated data" events so we don't have to look back through all time?
  - never abbreviate; use camel case: examples below should use organizationId, userId

**Implementation**: 
```javascript
events: {
  event_id: {
    type: "UserCreated",
    org_id: "org_sf",
    project_id: "default", // nullable, expandable later
    user_id: "alice",
    timestamp: "2025-01-01",
    data: { email: "alice@sf.gov", role: "user" }
  }
}
```

### User Roles & Permissions
**Question**: What's the right terminology for "regular user"?
- "User" is too generic (vs admin)
- Options: Member, Worker, Operator, Staff
- **Impact**: Affects UI, API, documentation

**Decision needed**: Role terminology and permission model
- user_comment:
    - decision: let's use "Member"

## Authentication Strategy

### Password vs Passcode Strategy
**Question**: Should we skip passwords entirely?
- Passcode-only (SMS/email codes)
- Traditional password + optional MFA
- **Impact**: Changes entire auth flow implementation

**Decision needed**: Authentication method for MVP
- user_comments:
  - decision: passcode only initially, assuming Firebase can handle it
  
### Public Data Access
**Question**: Should anonymous users view organization data?
- Some cities want public access to curb data
- **Impact**: Security rules, caching strategy

**Decision needed**: Public access policy
- user_comments:
  - decision: no anonymous users for now

## Technical Architecture Decisions

### GCP Services Understanding
**Question**: What exactly do these services do for SOC2?
- `cloudresourcemanager.googleapis.com` - What is this?
- `cloudaudit.googleapis.com` - How used for SOC2?
- `monitoring.googleapis.com` - What SOC2 requirements?

**User concerns**:
- "What is cloudresourcemanager?"
- "How are these used for SOC2 compliance?"  
- "Are there other GCP services needed for SOC2 compliance?"
- "Should we enable all services upfront or as needed?"
- "How will we answer these questions?"
- Missing: auth service, remote config for feature flags

**Decision needed**: Which services are actually required vs optional

### Database Schema Metadata - ✅ DECIDED
**DECISION**: No traditional audit fields needed - event sourcing provides this
- Events are immutable and timestamped
- Current state calculated from events  
- No need for `created_at`, `updated_at`, `updated_by` on entities
- **SOC2 compliance**: Complete audit trail via event history

**Implementation**: Events contain all audit information:
```javascript
{
  type: "UserUpdated", 
  timestamp: "2025-01-01T10:00:00Z",
  user_id: "alice",
  updated_by: "admin_bob", 
  changes: { role: { from: "user", to: "admin" } }
}
```

### Database Migration Strategy - ✅ DECIDED
**DECISION**: Event sourcing simplifies migrations significantly
- **Events are immutable**: Never need to migrate existing events
- **Schema changes**: Add new event types, keep old ones working
- **Backward compatibility**: Event processors handle multiple event versions
- **No downtime**: Deploy new event types alongside existing ones

**Implementation**:
```javascript
// Old events keep working
{ type: "UserCreated", user_id: "alice", email: "alice@sf.gov" }

// New events have additional fields
{ type: "UserCreated", user_id: "bob", email: "bob@sf.gov", project_id: "downtown" }

// Event processor handles both versions
processUserCreated = (event) => {
  const project_id = event.project_id || "default"; // backward compatibility
  // ... rest of processing
}
```

- user_comments:
    - adds considerable complexity by requiring all old events to be handled forever?
    - we can never remove a field in a later version? 
    - could we instead add a version field to the data so we can remove/rename fields too?

## Compliance & Monitoring

### Audit Log Format & Storage - ✅ DECIDED
**DECISION**: Events ARE the audit logs - no separate audit collection needed
- **SOC2 compliance**: Events provide complete, immutable audit trail
- **Storage**: Events in Firestore (queryable, real-time)
- **Format**: Structured events with required SOC2 fields
- **User vs system actions**: All actions stored as events with actor information

**Implementation**:
```javascript
// User action event
{
  event_id: "evt_123",
  type: "UserRoleChanged",
  timestamp: "2025-01-01T10:00:00Z",
  actor: { type: "user", id: "admin_bob" },
  org_id: "org_sf",
  project_id: "default",
  subject: { type: "user", id: "alice" },
  data: { role: { from: "user", to: "admin" }, reason: "Promotion" }
}

// System action event  
{
  event_id: "evt_124", 
  type: "UserSessionExpired",
  timestamp: "2025-01-01T12:00:00Z",
  actor: { type: "system", id: "session-manager" },
  subject: { type: "user", id: "alice" },
  data: { session_duration: 3600 }
}
```

### Error Monitoring Strategy
**Question**: Sentry vs GCP Error Reporting?
- Cost difference for "better developer experience"?
- Can we use both? 
- Client-to-server error correlation?

**User concerns**:
- "What's the pricing for 'better developer experience'? Is even the free version better than GCP error reporting"
- "Is GCP error reporting integrated with logging?"
- "We need to send enough data from our 'giant Firebase function' to get good data"
- "We need to track our clients to send data too; is there a good way to correlate client actions to server errors"

**Decision needed**: Monitoring stack for MVP

### SOC2 Security Events
**Question**: What constitutes a "SOC2 security event"?
- Failed logins? How many?
- Large data exports?
- Admin actions?
- **Impact**: Alerting setup

**User concerns**:
- "What's a 'SOC2 security event'?"
- "How do 'cloud errors' get reported to Sentry (?) or GCP Error? Who 'has the pager' when something goes wrong?"

**Decision needed**: Security event definitions and alerting

## Infrastructure & Deployment

### Billing Account Strategy
**Question**: How do we handle billing across environments?
- Separate billing accounts per environment?
- Shared billing with labels?
- **Impact**: Cost tracking, admin overhead

**User concerns**:
- "I don't understand these questions; how will we decide them? Do we need to decide now? When should we?"

**Decision needed**: Billing account structure

### Automated Infrastructure
**Question**: What does "automated" infrastructure deployment mean?
- Triggered by code changes?
- Scheduled creation/destruction?
- **Impact**: Security, change management

**User concerns**:
- "How do it ever be 'automated'?"

**Decision needed**: Infrastructure deployment trigger strategy

### CI/CD Platform Choice
**Question**: GitHub vs GitLab vs GCP for CI/CD?
- User knows GitLab better
- GitHub has better GCP integration
- GCP native CI/CD?

**User concerns**:
- "Probably using GitHub or GitLab (which would you recommend? I'm more familiar with GitLab; is GitHub better?"
- "Should we use GCP CI/CD instead of GitLab or GitHub?"

**Decision needed**: CI/CD platform and rationale

## Integration Details

### Stripe Webhook Implementation
**Question**: Which Stripe events do we need to handle?
- Payment successful/failed
- Subscription canceled
- **Integration**: How do webhooks work with queue pattern?

**User concerns**:
- "Which functions do we trap in our webhook?"
- "How do we handle failures in the webhook? In stripe in general"
- "How do we integrate Stripe approval with actions in the app"

**Decision needed**: Stripe webhook events and integration approach

### Email Service Strategy
**Question**: How do we send emails (welcome, verification)?
- Firebase built-in vs SendGrid vs GCP?
- **Impact**: Additional service integration

**User concerns**:
- "Is there not a built-in way to do this in Firebase? What's best practice?"
- "Do we need to integrate with sendgrid? Does GCP offer a service similar to sendgrid?"

**Decision needed**: Email service provider

### Free Tier Limits
**Question**: What are actual GCP/Firebase free tier limits?
- Firestore reads/writes per month
- Cloud Functions invocations
- **Impact**: Development environment sustainability

**User concerns**:
- "What are the free tier limits?"

**Decision needed**: Free tier usage strategy

## Cost & Scaling

### Audit Log Storage Costs
**Question**: What are the tradeoffs for audit log storage?
- Firestore: Expensive, queryable
- Cloud Logging: Cheaper, less queryable  
- **Impact**: Long-term costs (7-year retention)

**Decision needed**: Audit storage strategy and cost modeling

---

## Decision Process

**Next Steps**:
1. Review each decision as blocker/defaultable/future
2. Make firm decisions on actual blockers
3. Document assumptions for defaultable items
4. Move future items to separate document
5. Begin infrastructure code development

## Additional User Concerns Requiring Decisions

### Authorization Model
**User concerns**:
- "For now there are just admins and (regular) users, but: what's a good term for 'regular user' here? User is too generic"
- "Should we organize authorization as GCP does resource + action?: what is the terminology for 'resource + action' in GCP? What's a 'role'?"
- "How would we implement that in our code?"
- "How do we assign a collection of resource + actions to a given user?"

### Data Structure Strategy  
**User concerns**:
- "Should we structure all the data for an organization hierarchically under it?"
- "Or should we have top-level collections for user, organization"

**Success Criteria**: Can write `createSOC2Project()` function with confidence
