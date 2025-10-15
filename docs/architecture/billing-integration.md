---
summary: "Event-driven Stripe billing integration with SOC2-compliant audit trail, multi-format data export, and usage tracking for multi-tenant SaaS"
keywords: ["billing", "stripe", "webhooks", "export", "usage-tracking", "soc2", "multi-tenant", "subscriptions"]
last_updated: "2025-01-15"
---

# Billing Integration Architecture

## Table of Contents
- [1. Overview](#1-overview)
  - [1.1 Architecture Map](#11-architecture-map)
  - [1.2 Why This Architecture](#12-why-this-architecture)
  - [1.3 Key Components](#13-key-components)
  - [1.4 Trade-offs Summary](#14-trade-offs-summary)
  - [1.5 Current Implementation Status](#15-current-implementation-status)
  - [1.6 Key Design Decisions](#16-key-design-decisions)
- [2. Problem & Context](#2-problem--context)
  - [2.1 Requirements](#21-requirements)
  - [2.2 Constraints](#22-constraints)
- [3. Architecture Details](#3-architecture-details)
  - [3.1 Billing Data Flow](#31-billing-data-flow)
  - [3.2 Component Connections](#32-component-connections)
  - [3.3 Subscription Lifecycle](#33-subscription-lifecycle)
  - [3.4 Data Export Architecture](#34-data-export-architecture)
  - [3.5 Webhook Processing Pattern](#35-webhook-processing-pattern)
- [4. Implementation Guide](#4-implementation-guide)
  - [4.1 Quick Start: Adding Export Format](#41-quick-start-adding-export-format)
  - [4.2 Code Locations](#42-code-locations)
  - [4.3 Configuration](#43-configuration)
  - [4.4 Testing](#44-testing)
- [5. Consequences & Trade-offs](#5-consequences--trade-offs)
  - [5.1 What This Enables](#51-what-this-enables)
  - [5.2 What This Constrains](#52-what-this-constrains)
  - [5.3 Future Considerations](#53-future-considerations)
- [6. References](#6-references)
- [7. Decision History](#7-decision-history)

---

## 1. Overview

CurbMap uses event-driven Stripe integration to manage annual subscriptions for municipal customers, track organization-level usage metrics, and export curb regulation data in multiple formats (JSON, CSV, CDS). All billing events are logged through the event sourcing system for SOC2-compliant audit trails with 7-year retention.

### 1.1 Architecture Map

```
┌─────────────────────────────────────────────────────────────┐
│ Stripe                                                      │
│ • Customer/Subscription Management                          │
│ • Annual Billing Cycles                                     │
│ • Payment Processing                                        │
└───────────────┬─────────────────────────────────────────────┘
                │ Webhook Events
                │ (invoice.payment_succeeded, subscription.updated)
                ↓
┌─────────────────────────────────────────────────────────────┐
│ HTTP Function: stripeWebhook                                │
│ • Verifies webhook signature                                │
│ • Creates StripeWebhookReceived action                      │
│ • Returns 200 OK immediately                                │
└───────────────┬─────────────────────────────────────────────┘
                │ POST /submitActionRequest
                ↓
┌─────────────────────────────────────────────────────────────┐
│ Event Sourcing System                                       │
│ • Processes StripeWebhookReceived action                    │
│ • Dispatches to webhook handler                             │
│ • Writes audit trail to completedActions                    │
└───────────────┬─────────────────────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────────────────────┐
│ Webhook Handler (payment_succeeded, subscription_updated)   │
│ • Extracts organizationId from event metadata               │
│ • Updates organization billing status                       │
│ • Logs PaymentSucceeded/SubscriptionUpdated event           │
└───────────────┬─────────────────────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────────────────────┐
│ Firestore                                                   │
│ /organizations/{id}:                                        │
│   stripeCustomerId: "cus_xxx"                               │
│   stripeSubscriptionId: "sub_xxx"                           │
│   subscriptionStatus: "active"                              │
│   billingTier: "professional"                               │
│   annualAmount: 25000                                       │
│   lastPaymentDate: timestamp                                │
│   nextBillingDate: timestamp                                │
└─────────────────────────────────────────────────────────────┘

Data Export Flow:
┌─────────────────────────────────────────────────────────────┐
│ Client Request                                              │
│ • Export format: JSON | CSV | CDS | incremental             │
│ • Organization scope + filters                              │
└───────────────┬─────────────────────────────────────────────┘
                │ POST /exportData
                ↓
┌─────────────────────────────────────────────────────────────┐
│ Export Service                                              │
│ • Creates ExportRequested event                             │
│ • Queries organization data                                 │
│ • Transforms to target format                               │
│ • Logs ExportCompleted/ExportFailed event                   │
└───────────────┬─────────────────────────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────────────────────────┐
│ Export Response                                             │
│ • Downloadable file (JSON/CSV/CDS)                          │
│ • Export metadata (recordCount, timestamp)                  │
│ • Audit trail in completedActions                           │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Why This Architecture

**Problem**: CurbMap bills municipal customers annually ($10K-$100K contracts) and must export curb regulation data to external systems (GIS, Microsoft Power Platform, third-party analytics). Traditional billing doesn't provide immutable audit trails for SOC2 compliance, and data exports need to support multiple formats without vendor lock-in.

**Solution**: Stripe webhook events flow through event sourcing system for audit compliance. All billing state changes (payment success/failure, subscription updates) are logged as immutable events. Data export service supports multiple formats (JSON for APIs, CSV for spreadsheets, CDS for Microsoft Power Platform) with transformation happening server-side to prevent client data exposure.

### 1.3 Key Components

**Stripe Integration**:
- Customer management tied to organization records (1:1 mapping via `stripeCustomerId`)
- Annual subscription billing with tier-based pricing (basic/professional/enterprise)
- Webhook processing for payment events and subscription lifecycle

**Webhook HTTP Function** (`stripeWebhook.js`):
- Entry point for all Stripe webhook events
- Verifies webhook signature (prevents replay attacks)
- Creates `StripeWebhookReceived` action for event sourcing system
- Returns 200 OK immediately (Stripe retries on errors)

**Webhook Handlers** (billing-handlers.js):
- Process specific event types: `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Extract `organizationId` from event metadata
- Update organization billing status in Firestore
- Log billing events (`PaymentSucceeded`, `PaymentFailed`, `SubscriptionUpdated`) for audit trail

**Data Export Service** (export-service.js):
- Multi-format export: JSON (complete data), CSV (tabular), CDS (Microsoft Common Data Service), Incremental (delta exports)
- Organization-scoped exports (multi-tenant isolation)
- Event logging: `ExportRequested`, `ExportCompleted`, `ExportFailed`

**Usage Tracking Service** (usage-tracker.js):
- Tracks organization-level metrics: API calls, data storage, active users, feature usage
- Logs `UsageTracked` events for billing analytics
- Aggregates usage for reporting and invoice generation

**Organization Billing Fields** (Firestore `/organizations/{id}`):
- `stripeCustomerId`: Stripe customer ID (created on organization creation)
- `stripeSubscriptionId`: Active subscription ID
- `subscriptionStatus`: `active` | `suspended` | `cancelled`
- `billingTier`: `basic` | `professional` | `enterprise`
- `annualAmount`: Annual subscription amount (USD cents)
- `lastPaymentDate`: Timestamp of last successful payment
- `nextBillingDate`: Timestamp of next billing cycle

### 1.4 Trade-offs Summary

- **Webhook reliability** for real-time billing updates (Stripe SLA: 99.99% uptime)
- **Stripe vendor lock-in** for faster implementation ($0 migration cost vs 3-6 months building custom billing)
- **Server-side export** for security (prevents client data exposure, increases server costs ~$20/month)
- **Annual billing only** for MVP simplicity (monthly billing deferred to backlog)

See [Consequences & Trade-offs](#consequences--trade-offs) for detailed analysis.

### 1.5 Current Implementation Status

- 📋 **Deferred to F112** (specification pending, target: Q2 2025):
  - Stripe customer/subscription management
  - Webhook processing and signature verification
  - Multi-format data export (JSON, CSV, CDS, incremental)
  - Usage tracking and billing metrics
  - Invoice generation and delivery
  - Billing API endpoints

- 🔮 **Future Enhancements** (backlog):
  - Monthly billing cycles (currently annual only)
  - Usage-based billing (metered subscriptions)
  - Multiple payment processors (currently Stripe only)
  - Self-service billing portal (customer-facing)

### 1.6 Key Design Decisions

**Webhook-Based Integration, Not Polling**: Stripe sends events immediately via webhooks (real-time billing updates). Polling would add 5-15 minute delay and increase API costs. [Details in decisions.md](../decisions.md#webhook-based-billing) (if ADR exists)

**Event Sourcing for Billing**: All billing events logged to `completedActions` for SOC2 audit compliance. Every payment, subscription change, and invoice generation has immutable audit trail.

**Annual Billing Only (MVP)**: Simplified to annual cycles for faster implementation. Monthly billing adds complexity for proration, mid-cycle changes, usage-based charges. Deferred until >25% of customers request monthly billing.

**Multi-Format Export**: Supports JSON (APIs), CSV (spreadsheets/GIS), CDS (Microsoft Power Platform), incremental (efficient sync). Prevents vendor lock-in - customers can export data to any system.

**Organization-Scoped Usage**: Usage metrics tracked per organization (not per user). Simplifies billing model - charge by organization size, not individual user activity.

---

## 2. Problem & Context

### 2.1 Requirements

**SOC2 Billing Compliance**:
- Immutable billing audit trail (payment success/failure, subscription changes, refunds)
- Server-authoritative timestamps for all billing events
- 7-year retention for financial records
- Actor attribution for billing operations (which admin changed subscription tier)

**Multi-Tenant Billing Isolation**:
- Organization-scoped billing (each city has separate Stripe customer)
- Usage tracking isolated per organization
- Data exports scoped to organization (prevent cross-org data leakage)

**Subscription Management**:
- Annual billing cycles with renewal handling
- Tier-based pricing (basic/professional/enterprise)
- Subscription lifecycle: trial → active → suspended → cancelled
- Automated suspension on payment failure
- Automated reactivation on payment success

**Data Export**:
- Multiple formats: JSON (complete data), CSV (tabular), CDS (Microsoft Power Platform)
- Organization-scoped exports (multi-tenant security)
- Incremental exports (efficient sync for large datasets)
- Scheduled exports (automated data delivery)
- On-demand exports (user-initiated)

**Payment Processing**:
- PCI DSS compliance (no payment card data stored in CurbMap)
- Stripe-hosted payment forms (reduces compliance scope)
- Webhook signature verification (prevent replay attacks)
- Idempotent webhook processing (handle duplicate events)

**Usage Tracking**:
- Organization-level metrics (API calls, storage, active users)
- Billing analytics (usage trends, feature adoption)
- Invoice line items (usage-based charges for overages)

### 2.2 Constraints

- **Annual Billing Only (MVP)**: Monthly billing deferred to reduce implementation complexity (no proration logic, no mid-cycle changes)
- **Stripe as Primary Processor**: No multi-processor support (reduces integration complexity for 2-3 person team)
- **No Self-Service Portal (MVP)**: Admins change subscriptions via internal tools, not customer-facing UI (deferred to backlog)
- **PCI Compliance**: Cannot store payment card data - must use Stripe-hosted payment forms
- **Webhook Reliability**: Depends on Stripe webhook delivery (99.99% SLA, but network failures possible)
- **Export Size Limits**: Firestore query limits mean exports capped at ~10K records per request (larger exports need pagination)

---

## 3. Architecture Details

### 3.1 Billing Data Flow

**Subscription Creation Flow**:
1. Admin creates organization via UI
2. Organization handler creates Stripe customer (via Stripe API)
3. Customer ID stored in organization record (`stripeCustomerId`)
4. Admin selects subscription tier (basic/professional/enterprise)
5. Subscription created in Stripe with annual billing cycle
6. Subscription ID stored in organization record (`stripeSubscriptionId`)
7. Organization status set to `active`
8. Audit events: `OrganizationCreated`, `StripeCustomerCreated`, `SubscriptionCreated`

**Payment Success Flow**:
1. Stripe processes annual payment
2. Stripe sends `invoice.payment_succeeded` webhook
3. Webhook handler verifies signature, creates `StripeWebhookReceived` action
4. Event sourcing system processes action
5. Webhook handler extracts `organizationId` from event metadata
6. Organization billing status updated: `subscriptionStatus: active`, `lastPaymentDate: <timestamp>`, `nextBillingDate: <timestamp + 1 year>`
7. Audit event: `PaymentSucceeded`

**Payment Failure Flow**:
1. Stripe payment fails (insufficient funds, expired card, etc.)
2. Stripe sends `invoice.payment_failed` webhook
3. Webhook handler creates `PaymentFailed` event
4. Organization status updated: `subscriptionStatus: suspended`
5. Admin notified via email (payment failure alert)
6. Customer access blocked until payment resolved (enforced by Firestore rules)

**Subscription Update Flow** (tier change):
1. Admin changes organization tier (basic → professional)
2. UI creates `OrganizationUpdated` action with new tier
3. Handler updates Stripe subscription (prorates remaining time)
4. Stripe sends `customer.subscription.updated` webhook
5. Organization record updated with new tier and amount
6. Audit events: `OrganizationUpdated`, `SubscriptionUpdated`

### 3.2 Component Connections

```
Stripe API
  ↕ HTTP (stripe.customers.create, stripe.subscriptions.create)
Billing Service (billing-service.js)
  ↓ Writes organization billing fields
Firestore /organizations/{id}
  ↑ Reads for webhook processing
Webhook Handler (billing-handlers.js)
  ↓ Creates billing events
Event Sourcing System
  ↓ Writes audit trail
Firestore /completedActions/{id}
```

**Stripe → CurbMap** (webhook delivery):
- Stripe signs webhooks with HMAC SHA256
- CurbMap verifies signature using webhook secret
- Invalid signature → reject with HTTP 401
- Valid signature → create action, return HTTP 200

**CurbMap → Stripe** (API calls):
- Customer management: `stripe.customers.create()`, `stripe.customers.update()`
- Subscription management: `stripe.subscriptions.create()`, `stripe.subscriptions.update()`
- Invoice retrieval: `stripe.invoices.retrieve()`
- All API calls use Stripe secret key (stored in environment variables)

### 3.3 Subscription Lifecycle

```
  OrganizationCreated
        ↓
    [Trial] (optional, not MVP)
        ↓ admin selects tier
   [Active] ← Payment success
        ↓ Payment failure
  [Suspended]
        ↓ Payment resolved
   [Active]
        ↓ Admin cancels OR contract ends
  [Cancelled]
```

**Status Transitions**:
- **Trial → Active**: Payment method added, subscription created
- **Active → Suspended**: Payment failed, auto-suspend after 3 retry attempts
- **Suspended → Active**: Payment succeeded, auto-reactivate
- **Active → Cancelled**: Admin cancels OR annual contract ends (no auto-renewal)
- **Cancelled**: Permanent (cannot reactivate, must create new organization)

**Firestore Rules Enforcement**:
- `subscriptionStatus === 'active'` required for data writes
- `subscriptionStatus === 'suspended'` allows reads only (data export still works)
- `subscriptionStatus === 'cancelled'` blocks all access

### 3.4 Data Export Architecture

```
Client Request (format, filters)
  ↓
Export Service
  ├─ JSON Exporter ──→ Complete data (nested objects, arrays)
  ├─ CSV Exporter ───→ Flat tabular data (one row per record)
  ├─ CDS Exporter ───→ Microsoft Common Data Service format
  └─ Incremental ────→ Delta export (changes since last export)
        ↓
    Firestore Query (organization-scoped)
        ↓
    Format Transformation
        ↓
    Downloadable File + Export Event
```

**Export Formats**:

**JSON** (complete data):
- Nested structure: organizations → projects → surveys → data
- All fields included (metadata, timestamps, actor attribution)
- Use case: API integration, data migration, backup

**CSV** (tabular):
- Flat structure: one row per survey/regulation
- Selected fields only (user-configurable)
- Use case: Spreadsheet import, GIS tools, data analysis

**CDS** (Microsoft Common Data Service):
- Power Platform schema (entities, attributes, relationships)
- Metadata included (types, constraints, references)
- Use case: Power BI integration, Dynamics 365, Azure integration

**Incremental** (delta export):
- Only records changed since last export (based on `updatedAt` timestamp)
- Smaller payload, faster processing
- Use case: Nightly sync to external systems

**Organization Scoping**:
- All exports filtered by `organizationId` (multi-tenant security)
- Firestore query: `collection.where('organizationId', '==', orgId)`
- Export includes: organization data, projects, domain data
- Export excludes: other organizations, internal system data

### 3.5 Webhook Processing Pattern

```
Stripe Webhook Event
  ↓
HTTP Function: stripeWebhook
  ├─ 1. Extract signature from headers
  ├─ 2. Verify signature (stripe.webhooks.constructEvent)
  ├─ 3. Create StripeWebhookReceived action
  └─ 4. Return 200 OK (immediately)
        ↓
Event Sourcing System
  ├─ Process StripeWebhookReceived action
  ├─ Dispatch to event-specific handler
  └─ Write completedActions audit record
        ↓
Webhook Handler (based on event.type)
  ├─ invoice.payment_succeeded → handlePaymentSucceeded
  ├─ invoice.payment_failed → handlePaymentFailed
  ├─ customer.subscription.updated → handleSubscriptionUpdated
  └─ customer.subscription.deleted → handleSubscriptionDeleted
        ↓
Update Organization Billing Status
  ↓
Log Billing Event (PaymentSucceeded, etc.)
```

**Webhook Signature Verification**:
1. Extract `stripe-signature` header
2. Construct event: `stripe.webhooks.constructEvent(payload, signature, secret)`
3. If signature invalid → return HTTP 401 (Stripe will retry)
4. If signature valid → process event

**Idempotency**:
- Stripe webhook events have unique `id` field
- Use `id` as action request ID (prevents duplicate processing)
- If action request already exists → return HTTP 200 without processing
- Prevents duplicate billing updates from webhook retries

**Retry Logic**:
- Stripe retries failed webhooks (non-200 responses) up to 3 times
- Exponential backoff: 1 hour, 6 hours, 24 hours
- After 3 failures → Stripe marks webhook as failed (admin alert)
- CurbMap returns 200 OK immediately after creating action (prevents retries)

---

## 4. Implementation Guide

### 4.1 Quick Start: Adding Export Format

**Need to add a new export format?** Follow these steps (detailed implementation patterns in [F112 specification](../../specifications/F112-billing-export/)):

1. **Create format processor** in `export-formats/` directory
2. **Implement transformation** from Firestore documents to target format
3. **Register format** in export service format map
4. **Test** with sample organization data

See F112 specification for complete implementation patterns and code structure.

### 4.2 Code Locations

**Billing Integration** (to be created in F112):
- `modules/curb-map/functions/src/billing/stripe.js` - Stripe customer/subscription management
- `modules/curb-map/functions/src/billing/billing-handlers.js` - Webhook event handlers
- `modules/curb-map/functions/src/billing/webhooks.js` - Webhook HTTP function

**Data Export** (to be created in F112):
- `modules/curb-map/functions/src/export/export-service.js` - Main export service
- `modules/curb-map/functions/src/export/formats/json-exporter.js` - JSON format
- `modules/curb-map/functions/src/export/formats/csv-exporter.js` - CSV format
- `modules/curb-map/functions/src/export/formats/cds-exporter.js` - CDS format
- `modules/curb-map/functions/src/export/formats/incremental-exporter.js` - Incremental exports

**Usage Tracking** (to be created in F112):
- `modules/curb-map/functions/src/usage/usage-tracker.js` - Usage metrics collection
- `modules/curb-map/functions/src/usage/reporting-service.js` - Usage analytics and reporting

**Tests** (to be created in F112):
- `modules/curb-map/test/stripe-integration.firebase.js` - Stripe integration tests
- `modules/curb-map/test/webhook-processing.firebase.js` - Webhook handler tests
- `modules/curb-map/test/export-formats.firebase.js` - Export format tests
- `modules/curb-map/test/usage-tracking.firebase.js` - Usage tracking tests

**Specification**:
- `specifications/F112-billing-export/background.md` - Implementation patterns and pseudocode
- `specifications/F112-billing-export/tasks.yaml` - Detailed task breakdown (6 phases, 16 tasks)

### 4.3 Configuration

**Environment Variables** (to be set in Firebase Functions config):
- `STRIPE_SECRET_KEY` - Stripe API secret key (live or test mode)
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (from Stripe dashboard)
- `STRIPE_PRICE_BASIC` - Price ID for basic tier (annual)
- `STRIPE_PRICE_PROFESSIONAL` - Price ID for professional tier (annual)
- `STRIPE_PRICE_ENTERPRISE` - Price ID for enterprise tier (annual)

**Stripe Configuration** (via Stripe dashboard):
- Webhook endpoint: `https://us-central1-<project>.cloudfunctions.net/stripeWebhook`
- Events to send: `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Webhook signing secret (generated by Stripe)

**Firebase Functions Configuration**:
- Region: `us-central1`
- Memory: 512MB (export service may need more for large datasets)
- Timeout: 300s (5 minutes for large exports)

### 4.4 Testing

**Stripe Test Mode**:
- Use Stripe test API keys (starts with `sk_test_`)
- Use Stripe test webhook secret
- Trigger test webhooks from Stripe dashboard (Developers → Webhooks → Send test webhook)

**Test Webhooks**:
- `invoice.payment_succeeded` - Test successful payment flow
- `invoice.payment_failed` - Test payment failure and suspension
- `customer.subscription.updated` - Test tier changes
- `customer.subscription.deleted` - Test cancellation flow

**Export Testing**:
- Create test organization with sample data
- Request export in each format (JSON, CSV, CDS, incremental)
- Verify format-specific transformations
- Check organization scoping (no data leakage)

**Usage Tracking Testing**:
- Trigger usage events (API calls, data modifications)
- Verify metrics collection
- Check usage aggregation and reporting

**Integration Tests** (to be created in F112):
```bash
# Run billing integration tests
npm test -- modules/curb-map/test/stripe-integration.firebase.js

# Run export format tests
npm test -- modules/curb-map/test/export-formats.firebase.js
```

---

## 5. Consequences & Trade-offs

### 5.1 What This Enables

**SOC2 Billing Compliance**: Immutable audit trail for all billing events (payments, subscriptions, refunds) with 7-year retention. Every billing operation logged to `completedActions` with server timestamps and actor attribution.

**Multi-Tenant Billing**: Organization-scoped billing (each city has separate Stripe customer). Usage tracking isolated per organization. Data exports scoped to prevent cross-org data leakage.

**PCI Compliance**: No payment card data stored in CurbMap. Stripe handles all payment processing, reducing PCI compliance scope to Stripe-hosted payment forms.

**Multi-Format Data Export**: Organizations can export curb regulation data to any external system (GIS tools, Microsoft Power Platform, custom analytics) without vendor lock-in. Prevents customer dependence on CurbMap UI.

**Usage-Based Billing (Future)**: Architecture supports metered billing (API calls, storage, active users) for usage-based pricing tiers. Can add overage charges for organizations exceeding plan limits.

**Real-Time Billing Updates**: Webhook-based integration provides immediate updates (payment success/failure, subscription changes). Avoids 5-15 minute polling delays.

### 5.2 What This Constrains

**Stripe Vendor Lock-In**:
- All billing logic tied to Stripe APIs
- **When this matters**: Stripe pricing increases, Stripe service outage, need multi-processor support
- **Migration cost**: 3-6 months to build custom billing OR integrate second processor
- **Why acceptable**: Stripe has 99.99% uptime SLA, industry-standard pricing, supports 135+ currencies
- **Mitigation**: Stripe contract includes price lock for 2 years

**Webhook Reliability Dependency**:
- Billing updates depend on Stripe webhook delivery
- **When this matters**: Network failures, webhook signature verification failures, Stripe webhook service outage
- **Impact**: Delayed billing status updates (payment succeeded but organization still shows suspended)
- **Mitigation**: Stripe retries webhooks 3 times, CurbMap has webhook replay tool for manual recovery

**Annual Billing Only (MVP)**:
- No monthly billing cycles (deferred to backlog)
- **When this matters**: >25% of customers request monthly billing
- **Implementation cost**: 2-3 weeks for proration logic, mid-cycle tier changes, monthly invoice generation
- **Why acceptable**: Enterprise customers prefer annual contracts (predictable budgeting)

**Export Size Limits**:
- Firestore query limits mean exports capped at ~10K records per request
- **When this matters**: Organizations with >10K surveys/regulations
- **Impact**: Exports require pagination (multiple requests, slower UX)
- **Mitigation**: Incremental exports for large datasets (delta sync instead of full export)

**No Self-Service Portal (MVP)**:
- Admins change subscriptions via internal tools, not customer-facing UI
- **When this matters**: Customers want to change tiers without contacting support
- **Implementation cost**: 4-6 weeks for self-service UI (payment method management, tier selection, invoice history)
- **Why acceptable**: Enterprise sales model (account managers handle subscription changes)

### 5.3 Future Considerations

**When to Revisit**:
- **Monthly billing**: >25% of customers request monthly cycles → implement proration logic
- **Multi-processor**: Stripe pricing increases >20% OR customer requests specific processor (e.g., Adyen for EU customers) → add processor abstraction layer
- **Self-service portal**: Customer support load >10 hours/week for subscription changes → build customer-facing billing UI
- **Usage-based billing**: >50% of customers want metered pricing → implement usage quotas and overage charges
- **Export pagination**: >10% of organizations exceed 10K records → implement streaming export (chunked downloads)

**What Would Trigger Redesign**:
- **SOC2 audit failure**: Billing audit trail gaps, timestamp manipulation → redesign event sourcing integration
- **Stripe service outage**: >4 hours downtime → add fallback processor OR manual billing workflow
- **PCI compliance violation**: Payment card data stored in CurbMap → immediate remediation, potential data breach response
- **Export data leakage**: Cross-org data exposure in exports → security incident, redesign export scoping logic

---

## 6. References

**Related Architecture**:
- [Event Sourcing](./event-sourcing.md) - Action request pattern, audit trail, idempotency
- [Data Model](./data-model.md) - Organization billing fields, multi-tenant scoping
- [Security](./security.md) - PCI compliance, webhook signature verification, data export authorization

**Specifications**:
- [F112: Billing & Export](../../specifications/F112-billing-export/) - Implementation patterns, task breakdown, testing strategy

**Decisions**:
- [decisions.md](../decisions.md) - Key billing decisions (annual vs monthly, webhook vs polling, Stripe vs other processors)

**External Documentation**:
- [Stripe API Reference](https://stripe.com/docs/api) - Customer, subscription, invoice, webhook APIs
- [Stripe Webhooks](https://stripe.com/docs/webhooks) - Webhook event types, signature verification, retry logic
- [Microsoft Common Data Service](https://docs.microsoft.com/en-us/powerapps/maker/data-platform/) - CDS schema format

**SOC2 Compliance**:
- [SOC2 Audit & Logging](../soc2-compliance/audit-and-logging.md) - Billing audit trail requirements (if exists)

**Runbooks** (to be created in F112):
- [Stripe Integration Setup](../runbooks/stripe-integration-setup.md) - Configuring Stripe account, webhooks, API keys
- [Billing Troubleshooting](../runbooks/billing-troubleshooting.md) - Handling webhook failures, subscription issues
- [Data Export Operations](../runbooks/data-export-operations.md) - Running exports, troubleshooting format issues

---

## 7. Decision History

This billing architecture was established based on enterprise customer requirements and SOC2 compliance constraints:

**Webhook-Based Integration** (vs Polling):
- **Rationale**: Real-time billing updates required for immediate subscription status changes (payment success → reactivate organization within seconds)
- **Alternative Considered**: Poll Stripe API every 5-15 minutes (simpler implementation, no webhook signature verification)
- **Why Rejected**: 5-15 minute delay unacceptable for payment failure suspension (organization could create data while payment failed)

**Annual Billing Only (MVP)** (vs Monthly):
- **Rationale**: Enterprise customers prefer annual contracts (predictable budgeting), simplifies implementation
- **Alternative Considered**: Monthly billing with proration (more flexible for customers)
- **Why Rejected**: Adds 2-3 weeks implementation time for proration logic, mid-cycle changes, monthly invoice generation (deferred to backlog)

**Stripe as Primary Processor** (vs Multi-Processor):
- **Rationale**: Stripe industry standard (99.99% uptime), supports 135+ currencies, reduces implementation time by 3-6 months vs building custom billing
- **Alternative Considered**: Processor abstraction layer (supports Stripe, Adyen, Braintree)
- **Why Rejected**: No customer requirement for non-Stripe processors, abstraction adds 1-2 months implementation overhead

**Multi-Format Export** (vs JSON Only):
- **Rationale**: Prevents vendor lock-in (customers can export to GIS, Microsoft Power Platform, custom analytics)
- **Alternative Considered**: JSON-only export (simpler implementation)
- **Why Rejected**: Customer requirement for CSV (spreadsheet import) and CDS (Power Platform integration) documented in 3 sales contracts

**Event Sourcing for Billing** (vs Direct Database Updates):
- **Rationale**: SOC2 compliance requires immutable audit trail for all billing events (payments, subscriptions, refunds)
- **Alternative Considered**: Direct Firestore updates with billing changelog table
- **Why Rejected**: Changelog table doesn't guarantee immutability (can be modified), event sourcing provides atomic audit writes

For complete decision rationale and trade-off analysis, see [decisions.md](../decisions.md).
