---
summary: "Event-driven Stripe billing integration with SOC2-compliant audit trail, multi-format data export, and usage tracking for multi-tenant SaaS"
keywords: ["billing", "stripe", "webhooks", "export", "usage-tracking", "soc2", "multi-tenant"]
last_updated: "2025-11-02"
---

# Billing Integration Architecture

## Overview

CurbMap uses event-driven Stripe integration to manage annual subscriptions for municipal customers, track organization-level usage metrics, and export curb regulation data in multiple formats (JSON, CSV, CDS). All billing events are logged through the event sourcing system for SOC2-compliant audit trails with 7-year retention.

**Current Status**: All billing functionality is deferred to F112 (target: Q2 2025). This document describes the planned architecture.

### Architecture Map

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

### Why This Architecture

**Problem**: CurbMap bills municipal customers annually ($10K-$100K contracts) and must export curb regulation data to external systems (GIS, Microsoft Power Platform, third-party analytics). Traditional billing doesn't provide immutable audit trails for SOC2 compliance, and data exports need to support multiple formats without vendor lock-in.

**Solution**: Stripe webhook events flow through event sourcing system for audit compliance. All billing state changes (payment success/failure, subscription updates) are logged as immutable events. Data export service supports multiple formats (JSON for APIs, CSV for spreadsheets, CDS for Microsoft Power Platform) with transformation happening server-side to prevent client data exposure.

### Key Components

**Stripe Integration** (to be created in F112):
- Customer management tied to organization records (1:1 mapping via `stripeCustomerId`)
- Annual subscription billing with tier-based pricing (basic/professional/enterprise)
- Webhook processing for payment events and subscription lifecycle
- Implementation: `modules/curb-map/functions/src/billing/` (planned)

**Webhook Processing Pattern**:
1. HTTP function receives webhook from Stripe
2. Verifies signature using [Stripe webhook signature verification](https://stripe.com/docs/webhooks/signatures)
3. Creates `StripeWebhookReceived` action for event sourcing system
4. Returns 200 OK immediately (Stripe retries on errors)
5. Event handler processes specific event types asynchronously
6. Updates organization billing status in Firestore

**Data Export Service** (to be created in F112):
- Multi-format export: JSON (complete data), CSV (tabular), CDS (Microsoft Common Data Service), Incremental (delta exports)
- Organization-scoped exports (multi-tenant isolation)
- Event logging: `ExportRequested`, `ExportCompleted`, `ExportFailed`
- Implementation: `modules/curb-map/functions/src/export/` (planned)

**Export Formats**:

| Format | Structure | Use Case | Implementation |
|--------|-----------|----------|----------------|
| JSON | Nested objects/arrays | API integration, data migration, backup | json-exporter.js (planned) |
| CSV | Flat tabular | Spreadsheet import, GIS tools, data analysis | csv-exporter.js (planned) |
| CDS | Power Platform schema | Power BI, Dynamics 365, Azure integration | cds-exporter.js (planned) |
| Incremental | Delta changes | Nightly sync to external systems | incremental-exporter.js (planned) |

**Organization Billing Fields** (Firestore `/organizations/{id}`):
```javascript
{
  stripeCustomerId: "cus_xxx",           // Stripe customer ID
  stripeSubscriptionId: "sub_xxx",       // Active subscription ID
  subscriptionStatus: "active",          // active | suspended | cancelled
  billingTier: "professional",           // basic | professional | enterprise
  annualAmount: 25000,                   // Annual subscription (USD cents)
  lastPaymentDate: Timestamp,            // Last successful payment
  nextBillingDate: Timestamp             // Next billing cycle
}
```

### Subscription Lifecycle

```
  OrganizationCreated
        ↓
   [Active] ← Payment success
        ↓ Payment failure
  [Suspended]
        ↓ Payment resolved
   [Active]
        ↓ Admin cancels OR contract ends
  [Cancelled]
```

**Status Transitions**:
- **Active → Suspended**: Payment failed, auto-suspend after 3 retry attempts
- **Suspended → Active**: Payment succeeded, auto-reactivate
- **Active → Cancelled**: Admin cancels OR annual contract ends (no auto-renewal)

**Firestore Rules Enforcement**:
- `subscriptionStatus === 'active'` required for data writes
- `subscriptionStatus === 'suspended'` allows reads only (data export still works)
- `subscriptionStatus === 'cancelled'` blocks all access

### Key Design Decisions

**Webhook-Based Integration, Not Polling**: Stripe sends events immediately via webhooks (real-time billing updates). Polling would add 5-15 minute delay and increase API costs.

**Event Sourcing for Billing**: All billing events logged to `completedActions` for SOC2 audit compliance. Every payment, subscription change, and invoice generation has immutable audit trail. See [event-sourcing.md](./event-sourcing.md) for pattern details.

**Annual Billing Only (MVP)**: Simplified to annual cycles for faster implementation. Monthly billing adds complexity for proration, mid-cycle changes, usage-based charges. Deferred until >25% of customers request monthly billing.

**Multi-Format Export**: Supports JSON (APIs), CSV (spreadsheets/GIS), CDS (Microsoft Power Platform), incremental (efficient sync). Prevents vendor lock-in - customers can export data to any system.

**Organization-Scoped Usage**: Usage metrics tracked per organization (not per user). Simplifies billing model - charge by organization size, not individual user activity.

## Trade-offs

### What This Enables

**SOC2 Billing Compliance**: Immutable audit trail for all billing events (payments, subscriptions, refunds) with 7-year retention. Every billing operation logged to `completedActions` with server timestamps and actor attribution.

**Multi-Tenant Billing**: Organization-scoped billing (each city has separate Stripe customer). Usage tracking isolated per organization. Data exports scoped to prevent cross-org data leakage.

**PCI Compliance**: No payment card data stored in CurbMap. Stripe handles all payment processing, reducing PCI compliance scope to Stripe-hosted payment forms.

**Multi-Format Data Export**: Organizations can export curb regulation data to any external system (GIS tools, Microsoft Power Platform, custom analytics) without vendor lock-in. Prevents customer dependence on CurbMap UI.

**Real-Time Billing Updates**: Webhook-based integration provides immediate updates (payment success/failure, subscription changes). Avoids 5-15 minute polling delays.

### What This Constrains

**Stripe Vendor Lock-In**:
- All billing logic tied to Stripe APIs
- **When this matters**: Stripe pricing increases, Stripe service outage, need multi-processor support
- **Migration cost**: 3-6 months to build custom billing OR integrate second processor
- **Why acceptable**: Stripe has 99.99% uptime SLA, industry-standard pricing, supports 135+ currencies, 2-year price lock in contract

**Webhook Reliability Dependency**:
- Billing updates depend on Stripe webhook delivery
- **When this matters**: Network failures, webhook signature verification failures, Stripe webhook service outage
- **Impact**: Delayed billing status updates (payment succeeded but organization still shows suspended)
- **Mitigation**: Stripe retries webhooks 3 times with exponential backoff, webhook replay tool for manual recovery

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

### When to Revisit

- **Monthly billing**: >25% of customers request monthly cycles → implement proration logic
- **Multi-processor**: Stripe pricing increases >20% OR customer requests specific processor → add processor abstraction layer
- **Self-service portal**: Customer support load >10 hours/week for subscription changes → build customer-facing billing UI
- **Usage-based billing**: >50% of customers want metered pricing → implement usage quotas and overage charges
- **Export pagination**: >10% of organizations exceed 10K records → implement streaming export (chunked downloads)

**What Would Trigger Redesign**:
- **SOC2 audit failure**: Billing audit trail gaps → redesign event sourcing integration
- **Stripe service outage**: >4 hours downtime → add fallback processor OR manual billing workflow
- **PCI compliance violation**: Payment card data stored in CurbMap → immediate remediation
- **Export data leakage**: Cross-org data exposure → security incident, redesign export scoping logic

## Decision History

**Webhook-Based Integration** (vs Polling):
- **Rationale**: Real-time billing updates required for immediate subscription status changes (payment success → reactivate organization within seconds)
- **Alternative**: Poll Stripe API every 5-15 minutes (simpler implementation, no webhook signature verification)
- **Why Rejected**: 5-15 minute delay unacceptable for payment failure suspension (organization could create data while payment failed)

**Annual Billing Only (MVP)** (vs Monthly):
- **Rationale**: Enterprise customers prefer annual contracts (predictable budgeting), simplifies implementation
- **Alternative**: Monthly billing with proration (more flexible for customers)
- **Why Rejected**: Adds 2-3 weeks implementation time for proration logic, mid-cycle changes, monthly invoice generation (deferred to backlog)

**Stripe as Primary Processor** (vs Multi-Processor):
- **Rationale**: Stripe industry standard (99.99% uptime), supports 135+ currencies, reduces implementation time by 3-6 months vs building custom billing
- **Alternative**: Processor abstraction layer (supports Stripe, Adyen, Braintree)
- **Why Rejected**: No customer requirement for non-Stripe processors, abstraction adds 1-2 months implementation overhead

**Multi-Format Export** (vs JSON Only):
- **Rationale**: Prevents vendor lock-in (customers can export to GIS, Microsoft Power Platform, custom analytics)
- **Alternative**: JSON-only export (simpler implementation)
- **Why Rejected**: Customer requirement for CSV (spreadsheet import) and CDS (Power Platform integration) documented in 3 sales contracts

**Event Sourcing for Billing** (vs Direct Database Updates):
- **Rationale**: SOC2 compliance requires immutable audit trail for all billing events (payments, subscriptions, refunds)
- **Alternative**: Direct Firestore updates with billing changelog table
- **Why Rejected**: Changelog table doesn't guarantee immutability (can be modified), event sourcing provides atomic audit writes

For complete decision rationale, see [decisions.md](../decisions.md).
