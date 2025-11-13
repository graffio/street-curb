# F112 - Billing & Export

**Implement billing integration and data export capabilities for CurbMap**

## Overview

This specification implements the billing integration architecture defined in [billing-integration](../../docs/architecture/billing-integration.md). The system provides Stripe integration for annual billing, multi-format data export, usage tracking, and invoice generation for organizations.

```
Stripe Integration → Data Export → Usage Tracking → Invoice Generation → Billing API
```

## References

- [billing-integration](../../docs/architecture/billing-integration.md) - Billing architecture, component connections, design decisions
- [data-model](../../docs/architecture/data-model.md) - Organization/project scoping, multi-tenant data model
- [event-sourcing](../../docs/architecture/event-sourcing.md) - Event logging and audit trail patterns

## Implementation Phases

### Phase 1: Stripe Integration

- **task_1_1_stripe_configuration**: Configure Stripe integration and customer management
- **task_1_2_subscription_management**: Implement subscription and payment processing
- **task_1_3_webhook_handling**: Create webhook handlers for billing events

### Phase 2: Multi-Format Data Export

- **task_2_1_export_service**: Implement data export service with multiple formats
- **task_2_2_export_formats**: Support JSON, CSV, and CDS export formats
- **task_2_3_export_scheduling**: Add scheduled and on-demand export capabilities

### Phase 3: Usage Tracking and Reporting

- **task_3_1_usage_tracking**: Implement usage tracking for billing metrics
- **task_3_2_reporting_service**: Create reporting service for usage analytics
- **task_3_3_usage_dashboard**: Build usage dashboard for organizations

### Phase 4: Invoice Generation

- **task_4_1_invoice_service**: Implement invoice generation service
- **task_4_2_invoice_templates**: Create invoice templates and formatting
- **task_4_3_invoice_delivery**: Add invoice delivery and notification system

### Phase 5: Billing API Endpoints

- **task_5_1_billing_api**: Create billing API endpoints
- **task_5_2_payment_processing**: Implement payment processing endpoints
- **task_5_3_billing_webhooks**: Add billing webhook endpoints

### Phase 6: Testing and Validation

- **task_6_1_integration_testing**: Validate end-to-end billing workflow
- **task_6_2_billing_testing**: Test billing scenarios and edge cases

---

## Implementation Patterns

### Stripe Integration Patterns

#### Customer Creation Pattern

```javascript
/**
 * Create Stripe customer for organization
 * @sig createStripeCustomer :: (String, Object) -> Promise<Object>
 *
 * Pattern: Create Stripe customer, store customerId in organization, log event
 */
const createStripeCustomer = async (organizationId, organizationData) => {
  // 1. Create Stripe customer with organization metadata
  const customer = await stripe.customers.create({
    email: organizationData.adminEmail,
    name: organizationData.name,
    metadata: {
      organizationId,
      billingType: 'annual_check'
    }
  });

  // 2. Log customer creation event for audit trail
  await createEvent({
    type: 'StripeCustomerCreated',
    organizationId,
    projectId: 'default',
    actor: { type: 'system', id: 'billing-service' },
    subject: { type: 'organization', id: organizationId },
    data: { customerId: customer.id }
  });

  return customer;
};
```

**Key Points**:
- Store `organizationId` in Stripe customer metadata (enables webhook routing)
- Log `StripeCustomerCreated` event for audit trail
- Return customer object for immediate use (store `customer.id` in organization record)

#### Subscription Management Pattern

```javascript
/**
 * Create annual subscription for organization
 * @sig createAnnualSubscription :: (String, String, Number) -> Promise<Object>
 *
 * Pattern: Get/create customer, create subscription, update organization, log events
 */
const createAnnualSubscription = async (organizationId, tier, amount) => {
  // 1. Get organization to check for existing customer
  const organization = await getOrganization(organizationId);

  // 2. Get or create Stripe customer
  let customer;
  if (organization.stripeCustomerId) {
    customer = await stripe.customers.retrieve(organization.stripeCustomerId);
  } else {
    customer = await createStripeCustomer(organizationId, organization);
  }

  // 3. Create subscription with tier-based price
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: getStripePriceId(tier) }],
    billing_cycle_anchor: 'now',
    proration_behavior: 'create_prorations',
    metadata: {
      organizationId,
      tier,
      billingType: 'annual'
    }
  });

  // 4. Update organization with Stripe IDs and billing info
  await updateOrganization(organizationId, {
    stripeCustomerId: customer.id,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: 'active',
    billingTier: tier,
    annualAmount: amount
  });

  return { customer, subscription };
};
```

**Key Points**:
- Check for existing customer before creating new one (idempotency)
- Store `organizationId` in subscription metadata (webhook routing)
- Update organization with Stripe IDs (enables future API calls)
- Use proration for mid-cycle changes

#### Price Mapping Pattern

```javascript
/**
 * Get Stripe price ID for tier
 * @sig getStripePriceId :: (String) -> String
 *
 * Pattern: Environment-based price ID mapping
 */
const getStripePriceId = (tier) => {
  const priceIds = {
    basic: process.env.STRIPE_PRICE_BASIC,
    professional: process.env.STRIPE_PRICE_PROFESSIONAL,
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE
  };

  return priceIds[tier] || priceIds.basic;
};
```

**Key Points**:
- Price IDs stored in environment variables (different for test/live mode)
- Default to basic tier if unknown tier provided
- Price IDs created in Stripe dashboard (not in code)

### Webhook Processing Patterns

#### Webhook Signature Verification Pattern

```javascript
/**
 * Handle Stripe webhook events
 * @sig handleStripeWebhook :: (Request, Response) -> Promise<Void>
 *
 * Pattern: Verify signature, create action, return 200 immediately
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    // Verify webhook signature (prevents replay attacks)
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Create action request for event sourcing system
  const action = Action.StripeWebhookReceived.from({
    eventType: event.type,
    eventData: event.data,
    webhookId: event.id
  });

  const actor = {
    type: 'system',
    id: 'stripe-webhook',
    organizationId: event.data.object.metadata?.organizationId
  };

  await createActionRequest(action, actor);

  // Return 200 immediately (Stripe retries on errors)
  res.json({ received: true });
});
```

**Key Points**:
- Use `req.rawBody` (not `req.body`) for signature verification
- Return HTTP 400 if signature invalid (Stripe won't retry)
- Create action request (flows through event sourcing system)
- Return HTTP 200 immediately (prevents Stripe retries)

#### Event Routing Pattern

```javascript
/**
 * Process Stripe webhook events (called by event sourcing system)
 * @sig processStripeWebhook :: (Object) -> Promise<Void>
 *
 * Pattern: Route to event-specific handlers
 */
const processStripeWebhook = async (eventData) => {
  const { eventType, eventData: data } = eventData;

  switch (eventType) {
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(data.object);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(data.object);
      break;

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(data.object);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(data.object);
      break;

    default:
      console.log(`Unhandled Stripe event type: ${eventType}`);
  }
};
```

**Key Points**:
- Switch on `eventType` to route to handlers
- Log unhandled events (for monitoring/debugging)
- Handlers are async (can fail independently)

#### Payment Event Handling Pattern

```javascript
/**
 * Handle successful payment
 * @sig handlePaymentSucceeded :: (Object) -> Promise<Void>
 *
 * Pattern: Extract organizationId, update status, log event
 */
const handlePaymentSucceeded = async (invoice) => {
  const organizationId = invoice.metadata.organizationId;

  if (!organizationId) {
    console.error('No organization ID in invoice metadata');
    return;
  }

  // Update organization billing status
  await updateOrganization(organizationId, {
    subscriptionStatus: 'active',
    lastPaymentDate: new Date().toISOString(),
    nextBillingDate: new Date(invoice.period_end * 1000).toISOString()
  });

  // Log payment event for audit trail
  await createEvent({
    type: 'PaymentSucceeded',
    organizationId,
    projectId: 'default',
    actor: { type: 'system', id: 'stripe-webhook' },
    subject: { type: 'organization', id: organizationId },
    data: {
      invoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency
    }
  });
};
```

**Key Points**:
- Extract `organizationId` from invoice metadata (set during subscription creation)
- Update `subscriptionStatus` to `active` (enables data access)
- Calculate `nextBillingDate` from invoice period_end (Stripe uses Unix timestamp)
- Log `PaymentSucceeded` event (SOC2 audit trail)

### Data Export Patterns

#### Multi-Format Export Service Pattern

```javascript
/**
 * Export data in multiple formats
 * @sig exportData :: (String, String, Object) -> Promise<Object>
 *
 * Pattern: Log request, route to format handler, log completion/failure
 */
const exportData = async (organizationId, format, filters) => {
  const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Log export request event
  await createEvent({
    type: 'ExportRequested',
    organizationId,
    projectId: filters.projectId || 'default',
    actor: { type: 'user', id: filters.userId },
    subject: { type: 'organization', id: organizationId },
    data: { exportId, format, filters }
  });

  try {
    // Route to format-specific exporter
    let data;
    switch (format) {
      case 'json':
        data = await exportAsJSON(organizationId, filters);
        break;
      case 'csv':
        data = await exportAsCSV(organizationId, filters);
        break;
      case 'cds':
        data = await exportAsCDS(organizationId, filters);
        break;
      case 'incremental':
        data = await exportIncremental(organizationId, filters);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    // Log export completion
    await createEvent({
      type: 'ExportCompleted',
      organizationId,
      projectId: filters.projectId || 'default',
      actor: { type: 'user', id: filters.userId },
      subject: { type: 'organization', id: organizationId },
      data: { exportId, format, recordCount: data.length }
    });

    return { exportId, data, format };

  } catch (error) {
    // Log export failure
    await createEvent({
      type: 'ExportFailed',
      organizationId,
      projectId: filters.projectId || 'default',
      actor: { type: 'user', id: filters.userId },
      subject: { type: 'organization', id: organizationId },
      data: { exportId, format, error: error.message }
    });

    throw error;
  }
};
```

**Key Points**:
- Generate unique `exportId` for tracking (timestamp + random)
- Log 3 events: `ExportRequested`, `ExportCompleted`, `ExportFailed` (audit trail)
- Try-catch ensures failure logging (SOC2 compliance)
- Return `exportId` for client tracking

#### JSON Export Pattern

```javascript
/**
 * Export organization data as JSON
 * @sig exportAsJSON :: (String, Object) -> Promise<Object>
 *
 * Pattern: Query organization-scoped data, return nested structure
 */
const exportAsJSON = async (organizationId, filters) => {
  // 1. Get organization
  const organization = await getOrganization(organizationId);

  // 2. Get projects (organization-scoped)
  const projects = await getOrganizationProjects(organizationId);

  // 3. Get domain data for each project (if filters allow)
  const projectsWithData = await Promise.all(
    projects.map(async (project) => {
      if (filters.projectId && filters.projectId !== project.id) {
        return null; // Skip if project filter doesn't match
      }

      const surveys = await getProjectSurveys(organizationId, project.id);
      return { ...project, surveys };
    })
  );

  // 4. Return nested structure
  return {
    organization,
    projects: projectsWithData.filter(p => p !== null)
  };
};
```

**Key Points**:
- All queries scoped by `organizationId` (multi-tenant security)
- Nested structure preserves relationships (organization → projects → surveys)
- Filter support (optional `projectId` filter)
- Parallel queries with `Promise.all` (performance)

#### CSV Export Pattern

```javascript
/**
 * Export organization data as CSV
 * @sig exportAsCSV :: (String, Object) -> Promise<String>
 *
 * Pattern: Query data, flatten to rows, convert to CSV format
 */
const exportAsCSV = async (organizationId, filters) => {
  // 1. Get flattened data (one row per survey)
  const surveys = await getOrganizationSurveys(organizationId, filters);

  // 2. Define CSV columns
  const columns = [
    'surveyId',
    'projectId',
    'organizationId',
    'surveyType',
    'createdAt',
    'updatedAt',
    'createdBy',
    'updatedBy'
  ];

  // 3. Convert to CSV format
  const header = columns.join(',');
  const rows = surveys.map(survey =>
    columns.map(col => escapeCSV(survey[col])).join(',')
  );

  return [header, ...rows].join('\n');
};

// Helper: Escape CSV values (quotes, commas, newlines)
const escapeCSV = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};
```

**Key Points**:
- Flat structure (one row per record)
- Configurable columns (can add filters for field selection)
- Proper CSV escaping (quotes, commas, newlines)
- Header row included

#### CDS Export Pattern

```javascript
/**
 * Export organization data as Microsoft Common Data Service format
 * @sig exportAsCDS :: (String, Object) -> Promise<Object>
 *
 * Pattern: Query data, transform to CDS schema (entities, attributes, relationships)
 */
const exportAsCDS = async (organizationId, filters) => {
  // 1. Get data
  const data = await exportAsJSON(organizationId, filters);

  // 2. Transform to CDS schema
  return {
    entities: [
      {
        logicalName: 'curb_organization',
        attributes: [
          { name: 'organizationId', type: 'string', isPrimaryKey: true },
          { name: 'name', type: 'string' },
          { name: 'status', type: 'picklist', options: ['active', 'suspended', 'cancelled'] }
        ],
        records: [data.organization]
      },
      {
        logicalName: 'curb_project',
        attributes: [
          { name: 'projectId', type: 'string', isPrimaryKey: true },
          { name: 'organizationId', type: 'string', isLookup: true, lookupEntity: 'curb_organization' },
          { name: 'name', type: 'string' }
        ],
        records: data.projects
      }
    ],
    relationships: [
      {
        name: 'organization_projects',
        type: '1:N',
        fromEntity: 'curb_organization',
        fromAttribute: 'organizationId',
        toEntity: 'curb_project',
        toAttribute: 'organizationId'
      }
    ]
  };
};
```

**Key Points**:
- CDS schema: entities (tables), attributes (columns), relationships (foreign keys)
- Type mapping: Firestore types → CDS types (`string`, `number`, `picklist`, `lookup`)
- Relationship definitions (1:N for organization → projects)
- Records included in entity definitions

#### Incremental Export Pattern

```javascript
/**
 * Export only records changed since last export
 * @sig exportIncremental :: (String, Object) -> Promise<Object>
 *
 * Pattern: Query with updatedAt filter, return delta
 */
const exportIncremental = async (organizationId, filters) => {
  const { lastExportDate } = filters;

  if (!lastExportDate) {
    throw new Error('Incremental export requires lastExportDate filter');
  }

  // Query only records updated since lastExportDate
  const surveys = await admin.firestore()
    .collectionGroup('surveys')
    .where('organizationId', '==', organizationId)
    .where('updatedAt', '>', new Date(lastExportDate))
    .get();

  return {
    exportType: 'incremental',
    lastExportDate,
    currentExportDate: new Date().toISOString(),
    recordCount: surveys.size,
    records: surveys.docs.map(doc => doc.data())
  };
};
```

**Key Points**:
- Requires `lastExportDate` filter (throw error if missing)
- Query with `updatedAt >` filter (delta only)
- Include both `lastExportDate` and `currentExportDate` (client can track sync state)
- Smaller payload (efficient for large datasets)

### Usage Tracking Patterns

#### Usage Metrics Collection Pattern

```javascript
/**
 * Track organization usage
 * @sig trackUsage :: (String, String, Number) -> Promise<Void>
 *
 * Pattern: Create UsageTracked event, aggregate later
 */
const trackUsage = async (organizationId, metricType, value) => {
  await createEvent({
    type: 'UsageTracked',
    organizationId,
    projectId: 'default',
    actor: { type: 'system', id: 'usage-tracker' },
    subject: { type: 'organization', id: organizationId },
    data: {
      metricType,   // 'api_calls' | 'data_storage' | 'active_users' | 'feature_usage'
      value,        // numeric value (count, bytes, etc.)
      timestamp: new Date().toISOString()
    }
  });
};
```

**Key Points**:
- Log `UsageTracked` events (don't aggregate immediately)
- Metric types: `api_calls`, `data_storage`, `active_users`, `feature_usage`
- Timestamp included (enables time-based aggregation)
- Aggregation happens in separate reporting service (decouple tracking from reporting)

#### Usage Aggregation Pattern

```javascript
/**
 * Aggregate usage metrics for billing period
 * @sig aggregateUsage :: (String, String, String) -> Promise<Object>
 *
 * Pattern: Query UsageTracked events, sum by metric type
 */
const aggregateUsage = async (organizationId, startDate, endDate) => {
  // Query usage events for period
  const events = await admin.firestore()
    .collection('completedActions')
    .where('organizationId', '==', organizationId)
    .where('action.type', '==', 'UsageTracked')
    .where('createdAt', '>=', new Date(startDate))
    .where('createdAt', '<=', new Date(endDate))
    .get();

  // Aggregate by metric type
  const metrics = {};
  events.docs.forEach(doc => {
    const { metricType, value } = doc.data().action.data;
    metrics[metricType] = (metrics[metricType] || 0) + value;
  });

  return {
    organizationId,
    period: { startDate, endDate },
    metrics
  };
};
```

**Key Points**:
- Query `completedActions` for `UsageTracked` events (immutable audit trail)
- Filter by date range (billing period)
- Aggregate by metric type (sum values)
- Return structured usage report

### Invoice Generation Pattern

```javascript
/**
 * Generate invoice for organization
 * @sig generateInvoice :: (String, String) -> Promise<Object>
 *
 * Pattern: Get subscription, aggregate usage, calculate total, log event
 */
const generateInvoice = async (organizationId, period) => {
  const organization = await getOrganization(organizationId);
  const usage = await aggregateUsage(organizationId, period.startDate, period.endDate);

  const invoice = {
    organizationId,
    period,
    subscription: organization.subscription,
    usage,
    lineItems: [
      {
        description: `${organization.subscription.tier} plan (annual)`,
        amount: organization.annualAmount
      }
    ],
    total: organization.annualAmount,
    generatedAt: new Date().toISOString()
  };

  // Log invoice generation event
  await createEvent({
    type: 'InvoiceGenerated',
    organizationId,
    projectId: 'default',
    actor: { type: 'system', id: 'billing-service' },
    subject: { type: 'organization', id: organizationId },
    data: {
      invoiceId: invoice.id,
      period: invoice.period,
      total: invoice.total
    }
  });

  return invoice;
};
```

**Key Points**:
- Combine subscription data + usage metrics
- Line items for invoice display
- Log `InvoiceGenerated` event (audit trail)
- Future: Add usage-based charges (overages) to line items

---

## Testing Strategy

### Unit Tests
- Stripe customer/subscription creation
- Webhook signature verification
- Export format transformations (JSON → CSV, JSON → CDS)
- Usage metrics aggregation

### Integration Tests
- End-to-end billing workflow: subscription → payment → webhook → status update
- End-to-end export workflow: request → query → transform → response
- Webhook retry handling (simulated failures)
- Export with organization scoping (verify no data leakage)

### E2E Tests (Manual)
- Stripe test mode: trigger test webhooks, verify organization updates
- Export each format: download, verify format correctness
- Usage tracking: trigger events, verify aggregation

See [billing-integration architecture doc](../../docs/architecture/billing-integration.md) for testing details.
