# CurbMap Decisions & Questions

## ✅ DECIDED

### Core Architecture
- **App Name**: CurbMap
- **Architecture**: Event sourcing with Firestore queue + giant function
- **Data Model**: Organizations + Projects hierarchy with event scoping
- **Authentication**: Passcode-only, no anonymous users
- **Environments**: `curb-map-development`, `curb-map-staging`, `curb-map-production`

### Technical Stack
- **Error Monitoring**: Sentry.io (better developer experience, superior error grouping)
- **CI/CD Platform**: GitLab (user familiarity, built-in CI/CD, container registry)
- **Billing Strategy**: Single account with project labels for cost tracking
- **Database**: Firestore for events, materialized views for performance
- **Infrastructure**: Firebase + GCP services

### Terminology & Data Model
- **Organizations**: Use "organizations" instead of "cities" (more scalable)
- **Members**: Use "members" instead of "users" (clearer role distinction)
- **Field Naming**: camelCase, never abbreviate, always include "Id" suffix for IDs
- **Event Sourcing**: All changes stored as immutable events, current state calculated
- **Multi-Project**: Design for multiple projects per org, start with default project

### Security & Compliance
- **SOC2 Scope**: Production only, staging excluded (synthetic data)
- **Audit Logging**: Events ARE the audit logs, no separate collection needed
- **Data Isolation**: Complete isolation between organizations
- **Access Control**: Role-based permissions with principle of least privilege
- **CCPA/GDPR**: UserForgotten events provide "right to be forgotten"
- **Developer Authentication**: Service account impersonation (no key files)
- **Credential Management**: Short-lived tokens (1-12 hours), MFA-protected user accounts

### Staging Data Strategy
- **Synthetic Data**: Staging contains only generated test data
- **Impersonation Feature**: Debug customer issues in production with proper audit logging
- **No Real Data**: Never copy real customer data to non-production environments
- **SOC2 Excluded**: Staging environment not in SOC2 compliance scope

### Database Schema
- **No Traditional Audit Fields**: Event sourcing provides complete audit trail
- **Migration Strategy**: Event sourcing simplifies migrations (events immutable, new event types added)
- **Schema Versioning**: Add `schemaVersion` field to events for clean migrations
- **Backward Compatibility**: Event processors handle multiple versions

## 🔄 IMPLEMENTATION QUESTIONS

### Stripe Integration
- **Webhook Events**: Which Stripe events to handle? (`invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`)
- **Failure Handling**: How to handle webhook failures and retries?
- **Queue Integration**: How to integrate Stripe webhooks with queue pattern?

### Email Service
- **Provider**: SendGrid vs alternatives? (SendGrid has SOC2 compliance)
- **Firebase Integration**: Use Firebase "Trigger Email" extension + SendGrid?
- **Implementation**: SMTP provider integration approach?

### Free Tier Strategy
- **Development**: Use emulators for local development?
- **Staging**: Single shared staging environment on paid tier?
- **Limits**: Firestore 50K reads/20K writes per day, Cloud Functions 2M invocations per month

### Audit Log Storage
- **Storage Strategy**: Firestore (expensive, queryable) vs Cloud Logging (cheaper, less queryable)?
- **Cost Modeling**: Long-term costs for 7-year retention?
- **Query Requirements**: What queries needed on audit data?

### Infrastructure Automation
- **Deployment Triggers**: Git-triggered deployment with manual production approval?
- **Service Accounts**: ✅ DECIDED - Service account impersonation for developers, Workload Identity Federation for CI/CD
- **Permission Strategy**: Predefined roles (simpler to maintain than custom roles)

## 📋 FUTURE CONSIDERATIONS

### Scaling & Performance
- **Multi-Region Deployment**: When customers outside North America?
- **Database Migration**: Firestore to PostgreSQL when costs exceed $1000/month?
- **Microservices**: Split giant function when team grows beyond 8 developers?

### Advanced Compliance
- **Additional Frameworks**: HIPAA, FedRAMP, ISO 27001 when enterprise customers request?
- **Zero-Trust Security**: Implement when handling sensitive government data?
- **Enhanced Data Governance**: Advanced policies when we have EU customers?

### Business Model Evolution
- **Multi-Product Platform**: Multi-project architecture implemented, UI when 20% of customers request?
- **Marketplace/Partners**: Third-party integrations when 100+ customers with integration requests?
- **Advanced Billing**: Usage-based billing when current model limits growth?

### Technical Infrastructure
- **GraphQL API**: Expose GraphQL when mobile apps or complex client requirements?
- **Real-Time Collaboration**: Support when customers request collaborative workflows?
- **Advanced Analytics**: Customer-facing analytics when customers request reporting beyond basic exports?

### Operational Excellence
- **Chaos Engineering**: Implement when uptime SLA becomes critical business requirement?
- **Distributed Tracing**: Implement when performance debugging becomes difficult?
- **Disaster Recovery**: Automate when RTO/RPO requirements become stringent?

### Development & Team Scaling
- **Micro-Frontend**: Split frontend when team grows beyond 6 developers?
- **Advanced Testing**: Contract testing, property-based testing when regression testing becomes burdensome?
- **Developer Platform**: Internal platform when developer velocity limited by operational overhead?

### Cost Optimization
- **Reserved Capacity**: Optimize for reserved GCP capacity when monthly costs exceed $5000?
- **Multi-Cloud**: Support AWS, Azure when enterprise customers require specific cloud providers?

## Decision Framework

### Criteria for Revisiting
1. **Customer Demand**: >25% of customers request feature
2. **Scale Threshold**: Technical limits of current approach
3. **Competitive Pressure**: Market forces require capability
4. **Team Growth**: Current architecture limits team productivity
5. **Cost Pressure**: Current approach becomes unsustainable

### Evaluation Process
1. Document current pain points and limitations
2. Research industry best practices and alternatives
3. Prototype solution in non-production environment
4. Calculate implementation cost vs business benefit
5. Plan migration strategy with rollback options
6. Document decision rationale for future reference

### Success Criteria
Future architecture decisions are data-driven and support sustainable business growth.
