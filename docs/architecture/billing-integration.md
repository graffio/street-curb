# Billing Integration Architecture

## Core Pattern: Event-Driven Billing Integration

```
Stripe Webhooks → Action Requests → Billing Events → Organization Updates → Audit Trail
```

**Benefits**: Reliable billing processing, audit compliance, multi-format exports, usage tracking

## Billing Integration Principles

### Event-Driven Architecture
- **Webhook Processing**: All billing events processed through queue system
- **Idempotency**: Prevent duplicate processing of webhook events
- **Audit Trail**: Complete billing history via event sourcing
- **Error Handling**: Robust retry and failure handling

### Multi-Tenant Billing
- **Organization Scoping**: All billing tied to specific organizations
- **Subscription Management**: Per-organization subscription tracking
- **Usage Tracking**: Organization-level usage monitoring
- **Data Export**: Organization-specific data export capabilities

## Stripe Integration

### Customer Management
```javascript
/**
 * Create Stripe customer for organization
 * @sig createStripeCustomer :: (String, Object) -> Promise<Object>
 */
const createStripeCustomer = async (organizationId, organizationData) => {
  const customer = await stripe.customers.create({
    email: organizationData.adminEmail,
    name: organizationData.name,
    metadata: {
      organizationId,
      billingType: 'annual_check'
    }
  });
  
  // Log customer creation event
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

### Subscription Management
```javascript
/**
 * Create annual subscription
 * @sig createAnnualSubscription :: (String, String, Number) -> Promise<Object>
 */
const createAnnualSubscription = async (organizationId, tier, amount) => {
  const organization = await getOrganization(organizationId);
  
  // Create or get Stripe customer
  let customer;
  if (organization.stripeCustomerId) {
    customer = await stripe.customers.retrieve(organization.stripeCustomerId);
  } else {
    customer = await createStripeCustomer(organizationId, organization);
  }
  
  // Create subscription
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
  
  // Update organization with Stripe data
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

### Price Management
```javascript
/**
 * Get Stripe price ID for tier
 * @sig getStripePriceId :: (String) -> String
 */
const getStripePriceId = (tier) => {
  const priceIds = {
    basic: process.env.STRIPE_PRICE_BASIC,
    premium: process.env.STRIPE_PRICE_PREMIUM,
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE
  };
  
  return priceIds[tier] || priceIds.basic;
};
```

## Webhook Processing

### Webhook Handler
```javascript
/**
 * Handle Stripe webhook events
 * @sig handleStripeWebhook :: (Request, Response) -> Promise<Void>
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Create action request for webhook processing
  const action = Action.StripeWebhookReceived.from({
    eventType: event.type,
    eventData: event.data,
    webhookId: event.id
  });

  const actor = { id: 'system', organizationId: event.data.object.metadata?.organizationId };
  await createActionRequest(action, actor);

  res.json({ received: true });
});
```

### Event Processing
```javascript
/**
 * Process Stripe webhook events
 * @sig processStripeWebhook :: (Object) -> Promise<Void>
 */
const processStripeWebhook = async (eventData) => {
  const { eventType, eventData } = eventData;
  
  switch (eventType) {
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(eventData.object);
      break;
      
    case 'invoice.payment_failed':
      await handlePaymentFailed(eventData.object);
      break;
      
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(eventData.object);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(eventData.object);
      break;
      
    default:
      console.log(`Unhandled Stripe event type: ${eventType}`);
  }
};
```

### Payment Event Handling
```javascript
/**
 * Handle successful payment
 * @sig handlePaymentSucceeded :: (Object) -> Promise<Void>
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
  
  // Log payment event
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

## Data Export Architecture

### Multi-Format Export
```javascript
/**
 * Export data in multiple formats
 * @sig exportData :: (String, String, Object) -> Promise<Object>
 */
const exportData = async (organizationId, format, filters) => {
  const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Log export request
  await createEvent({
    type: 'ExportRequested',
    organizationId,
    projectId: filters.projectId || 'default',
    actor: { type: 'user', id: filters.userId },
    subject: { type: 'organization', id: organizationId },
    data: { exportId, format, filters }
  });
  
  try {
    // Generate export based on format
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

### Export Formats
- **JSON**: Complete data export in JSON format
- **CSV**: Tabular data export for spreadsheet applications
- **CDS**: Common Data Service format for Microsoft Power Platform
- **Incremental**: Delta exports for efficient data synchronization

## Usage Tracking

### Usage Metrics
```javascript
/**
 * Track organization usage
 * @sig trackUsage :: (String, String, Number) -> Promise<Void>
 */
const trackUsage = async (organizationId, metricType, value) => {
  await createEvent({
    type: 'UsageTracked',
    organizationId,
    projectId: 'default',
    actor: { type: 'system', id: 'usage-tracker' },
    subject: { type: 'organization', id: organizationId },
    data: { 
      metricType, 
      value, 
      timestamp: new Date().toISOString() 
    }
  });
};
```

### Billing Metrics
- **API Calls**: Track API usage per organization
- **Data Storage**: Monitor data volume per organization
- **User Count**: Track active users per organization
- **Feature Usage**: Monitor feature adoption per organization

## Invoice Generation

### Invoice Management
```javascript
/**
 * Generate invoice for organization
 * @sig generateInvoice :: (String, String) -> Promise<Object>
 */
const generateInvoice = async (organizationId, period) => {
  const organization = await getOrganization(organizationId);
  const usage = await getUsageMetrics(organizationId, period);
  
  const invoice = {
    organizationId,
    period,
    subscription: organization.subscription,
    usage,
    total: calculateTotal(organization.subscription, usage),
    generatedAt: new Date().toISOString()
  };
  
  // Log invoice generation
  await createEvent({
    type: 'InvoiceGenerated',
    organizationId,
    projectId: 'default',
    actor: { type: 'system', id: 'billing-service' },
    subject: { type: 'organization', id: organizationId },
    data: { invoiceId: invoice.id, period, total: invoice.total }
  });
  
  return invoice;
};
```

## Error Handling and Retry Logic

### Webhook Retry
```javascript
/**
 * Retry failed webhook processing
 * @sig retryWebhookProcessing :: (String, Number) -> Promise<Void>
 */
const retryWebhookProcessing = async (webhookId, maxRetries = 3) => {
  const webhook = await getWebhookEvent(webhookId);
  
  if (webhook.retryCount >= maxRetries) {
    await markWebhookFailed(webhookId, 'Max retries exceeded');
    return;
  }
  
  const delay = Math.pow(2, webhook.retryCount) * 1000; // Exponential backoff
  setTimeout(async () => {
    await processStripeWebhook(webhook.eventData);
  }, delay);
};
```

### Billing Error Recovery
```javascript
/**
 * Recover from billing errors
 * @sig recoverFromBillingError :: (Error, String) -> Promise<Void>
 */
const recoverFromBillingError = async (error, organizationId) => {
  console.error('Billing error:', error);
  
  // Log error event
  await createEvent({
    type: 'BillingError',
    organizationId,
    projectId: 'default',
    actor: { type: 'system', id: 'billing-service' },
    subject: { type: 'organization', id: organizationId },
    data: { error: error.message, timestamp: new Date().toISOString() }
  });
  
  // Alert administrators
  await alertBillingAdmins(organizationId, error);
};
```

## Security and Compliance

### Webhook Security
- **Signature Verification**: Verify Stripe webhook signatures
- **Idempotency**: Prevent duplicate webhook processing
- **Rate Limiting**: Limit webhook processing rate
- **Audit Logging**: Log all webhook events

### Data Protection
- **PCI Compliance**: No sensitive payment data stored
- **Encryption**: Encrypt billing data in transit and at rest
- **Access Control**: Restrict billing data access to authorized users
- **Data Retention**: Comply with data retention policies

## Monitoring and Observability

### Billing Metrics
- **Payment Success Rate**: Track successful vs failed payments
- **Webhook Processing Time**: Monitor webhook processing performance
- **Export Performance**: Track data export completion times
- **Usage Trends**: Monitor organization usage patterns

### Alerting
- **Payment Failures**: Alert on failed payments
- **Webhook Failures**: Alert on webhook processing errors
- **Export Failures**: Alert on data export failures
- **Usage Anomalies**: Alert on unusual usage patterns

## Testing Billing Integration

### Webhook Testing
```javascript
/**
 * Test webhook processing
 * @sig testWebhookProcessing :: () -> Promise<Void>
 */
const testWebhookProcessing = async () => {
  const testEvent = {
    type: 'invoice.payment_succeeded',
    data: {
      object: {
        id: 'test_invoice',
        metadata: { organizationId: 'test_org' },
        amount_paid: 50000,
        currency: 'usd'
      }
    }
  };
  
  await processStripeWebhook(testEvent);
  
  // Verify organization was updated
  const org = await getOrganization('test_org');
  console.assert(org.subscriptionStatus === 'active', 'Payment not processed');
};
```

### Export Testing
```javascript
/**
 * Test data export
 * @sig testDataExport :: () -> Promise<Void>
 */
const testDataExport = async () => {
  const result = await exportData('test_org', 'json', {});
  
  console.assert(result.data.length > 0, 'Export returned no data');
  console.assert(result.format === 'json', 'Export format incorrect');
};
```

## References

- **F107 Implementation**: See `specifications/F107-firebase-soc2-vanilla-app/phase6-billing.md`
- **Event Sourcing**: See `docs/architecture/event-sourcing.md`
- **Action Request Architecture**: See `docs/architecture/queue-mechanism.md`
- **Multi-Tenant**: See `docs/architecture/multi-tenant.md`
- **Security**: See `docs/architecture/security.md`
