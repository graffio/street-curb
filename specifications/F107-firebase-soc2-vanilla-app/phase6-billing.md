# Phase 6: Billing & Export

**Goal**: Implement billing integration and data export capabilities

## Deliverables
- [ ] Stripe integration for annual billing
- [ ] Multi-format data export (JSON, CSV, CDS)
- [ ] Usage tracking and reporting
- [ ] Invoice generation
- [ ] Webhook handling for billing events

## Step 1: Stripe Integration

### 1.1 Stripe Configuration
```javascript
// functions/src/billing/stripe.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

module.exports = { 
  createStripeCustomer, 
  createAnnualSubscription, 
  getStripePriceId 
};
```

### 1.2 Stripe Webhook Handler
```javascript
// functions/src/billing/stripeWebhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
  
  // Queue the webhook event for processing
  await queueEvent('StripeWebhookReceived', {
    eventType: event.type,
    eventData: event.data,
    webhookId: event.id
  });
  
  res.json({ received: true });
});

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

/**
 * Handle failed payment
 * @sig handlePaymentFailed :: (Object) -> Promise<Void>
 */
const handlePaymentFailed = async (invoice) => {
  const organizationId = invoice.metadata.organizationId;
  
  if (!organizationId) {
    console.error('No organization ID in invoice metadata');
    return;
  }
  
  // Update organization billing status
  await updateOrganization(organizationId, {
    subscriptionStatus: 'past_due',
    lastPaymentAttempt: new Date().toISOString()
  });
  
  // Log payment failure event
  await createEvent({
    type: 'PaymentFailed',
    organizationId,
    projectId: 'default',
    actor: { type: 'system', id: 'stripe-webhook' },
    subject: { type: 'organization', id: organizationId },
    data: { 
      invoiceId: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      failureReason: invoice.last_payment_error?.message
    }
  });
};

module.exports = { processStripeWebhook };
```

## Step 2: Multi-Format Data Export

### 2.1 Export Service
```javascript
// functions/src/export/exportService.js
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

/**
 * Export as JSON
 * @sig exportAsJSON :: (String, Object) -> Promise<Array>
 */
const exportAsJSON = async (organizationId, filters) => {
  const query = admin.firestore()
    .collection('events')
    .where('organizationId', '==', organizationId);
  
  if (filters.projectId && filters.projectId !== 'default') {
    query = query.where('projectId', '==', filters.projectId);
  }
  
  if (filters.sinceDate) {
    query = query.where('timestamp', '>=', new Date(filters.sinceDate));
  }
  
  if (filters.eventTypes && filters.eventTypes.length > 0) {
    query = query.where('type', 'in', filters.eventTypes);
  }
  
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Export as CSV
 * @sig exportAsCSV :: (String, Object) -> Promise<String>
 */
const exportAsCSV = async (organizationId, filters) => {
  const data = await exportAsJSON(organizationId, filters);
  
  if (data.length === 0) {
    return '';
  }
  
  // Get headers from first record
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(record => 
      headers.map(header => {
        const value = record[header];
        // Escape CSV values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
};

/**
 * Export as CDS (Curb Data Specification)
 * @sig exportAsCDS :: (String, Object) -> Promise<Object>
 */
const exportAsCDS = async (organizationId, filters) => {
  // Get curb-related events
  const curbEvents = await admin.firestore()
    .collection('events')
    .where('organizationId', '==', organizationId)
    .where('type', 'in', ['CurbSegmentCreated', 'CurbSegmentUpdated', 'CurbSegmentDeleted'])
    .get();
  
  // Transform to CDS format
  const cdsData = {
    curbs: [],
    events: [],
    metrics: []
  };
  
  for (const doc of curbEvents.docs) {
    const event = doc.data();
    
    switch (event.type) {
      case 'CurbSegmentCreated':
        cdsData.curbs.push(transformToCurbsAPI(event.data));
        break;
      case 'CurbSegmentUpdated':
        cdsData.events.push(transformToEventsAPI(event.data));
        break;
      case 'CurbSegmentDeleted':
        cdsData.events.push(transformToEventsAPI(event.data));
        break;
    }
  }
  
  // Validate CDS compliance
  const validation = validateCDSCompliance(cdsData);
  if (!validation.valid) {
    throw new Error(`CDS validation failed: ${validation.errors.join(', ')}`);
  }
  
  return cdsData;
};

/**
 * Export incremental data
 * @sig exportIncremental :: (String, Object) -> Promise<Array>
 */
const exportIncremental = async (organizationId, filters) => {
  if (!filters.sinceDate) {
    throw new Error('sinceDate required for incremental export');
  }
  
  return await exportAsJSON(organizationId, filters);
};

module.exports = { exportData };
```

### 2.2 Export API Endpoints
```javascript
// functions/src/api/exports.js
const express = require('express');
const router = express.Router();
const { authenticateUser, requirePermission } = require('../auth/authMiddleware');
const { exportData } = require('../export/exportService');

// Apply authentication to all routes
router.use(authenticateUser);

/**
 * Export organization data
 * @sig exportData :: (Request, Response) -> Promise<Void>
 */
router.post('/', requirePermission('organizationId', 'organization.read'), async (req, res) => {
  try {
    const { organizationId, format, filters } = req.body;
    const userId = req.user.uid;
    
    // Add user context to filters
    const exportFilters = {
      ...filters,
      userId,
      projectId: filters.projectId || 'default'
    };
    
    const result = await exportData(organizationId, format, exportFilters);
    
    res.json({
      exportId: result.exportId,
      format: result.format,
      recordCount: result.data.length,
      data: result.data
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

/**
 * Get export history
 * @sig getExportHistory :: (Request, Response) -> Promise<Void>
 */
router.get('/history', requirePermission('organizationId', 'organization.read'), async (req, res) => {
  try {
    const { organizationId } = req.query;
    
    const exportsSnapshot = await admin.firestore()
      .collection('events')
      .where('organizationId', '==', organizationId)
      .where('type', 'in', ['ExportRequested', 'ExportCompleted', 'ExportFailed'])
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    const exports = exportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(exports);
  } catch (error) {
    console.error('Error fetching export history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

## Step 3: Usage Tracking and Reporting

### 3.1 Usage Tracking Service
```javascript
// functions/src/usage/usageTracking.js
/**
 * Track usage for billing
 * @sig trackUsage :: (String, String, Object) -> Promise<Void>
 */
const trackUsage = async (organizationId, action, details) => {
  const usage = {
    organizationId,
    action,
    timestamp: new Date().toISOString(),
    details,
    userId: details.userId
  };
  
  // Store usage record
  await admin.firestore()
    .collection('usage_logs')
    .add(usage);
  
  // Check usage limits
  await checkUsageLimits(organizationId, action);
  
  // Log usage event
  await createEvent({
    type: 'UsageTracked',
    organizationId,
    projectId: details.projectId || 'default',
    actor: { type: 'user', id: details.userId },
    subject: { type: 'organization', id: organizationId },
    data: { action, details }
  });
};

/**
 * Check usage limits for organization
 * @sig checkUsageLimits :: (String, String) -> Promise<Void>
 */
const checkUsageLimits = async (organizationId, action) => {
  const organization = await getOrganization(organizationId);
  const tier = organization.subscription.tier;
  
  // Get usage for current month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const usageSnapshot = await admin.firestore()
    .collection('usage_logs')
    .where('organizationId', '==', organizationId)
    .where('timestamp', '>=', startOfMonth.toISOString())
    .get();
  
  const usageCount = usageSnapshot.size;
  const limits = getUsageLimits(tier);
  
  if (usageCount >= limits[action]) {
    // Log usage limit exceeded
    await createEvent({
      type: 'UsageLimitExceeded',
      organizationId,
      projectId: 'default',
      actor: { type: 'system', id: 'usage-tracker' },
      subject: { type: 'organization', id: organizationId },
      data: { action, usageCount, limit: limits[action] }
    });
    
    throw new Error(`Usage limit exceeded for ${action}`);
  }
};

/**
 * Get usage limits for tier
 * @sig getUsageLimits :: (String) -> Object
 */
const getUsageLimits = (tier) => {
  const limits = {
    basic: {
      exports: 10,
      users: 5,
      projects: 1,
      api_calls: 1000
    },
    premium: {
      exports: 100,
      users: 25,
      projects: 5,
      api_calls: 10000
    },
    enterprise: {
      exports: 1000,
      users: 100,
      projects: 20,
      api_calls: 100000
    }
  };
  
  return limits[tier] || limits.basic;
};

/**
 * Generate usage report
 * @sig generateUsageReport :: (String, String, String) -> Promise<Object>
 */
const generateUsageReport = async (organizationId, startDate, endDate) => {
  const usageSnapshot = await admin.firestore()
    .collection('usage_logs')
    .where('organizationId', '==', organizationId)
    .where('timestamp', '>=', startDate)
    .where('timestamp', '<=', endDate)
    .get();
  
  const usage = usageSnapshot.docs.map(doc => doc.data());
  
  // Aggregate usage by action
  const aggregatedUsage = usage.reduce((acc, record) => {
    const action = record.action;
    acc[action] = (acc[action] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate costs
  const organization = await getOrganization(organizationId);
  const costs = calculateCosts(aggregatedUsage, organization.subscription.tier);
  
  return {
    organizationId,
    period: { startDate, endDate },
    usage: aggregatedUsage,
    costs,
    totalRecords: usage.length
  };
};

/**
 * Calculate costs based on usage
 * @sig calculateCosts :: (Object, String) -> Object
 */
const calculateCosts = (usage, tier) => {
  const rates = {
    basic: {
      exports: 0.10,
      users: 5.00,
      projects: 0.00,
      api_calls: 0.001
    },
    premium: {
      exports: 0.05,
      users: 3.00,
      projects: 10.00,
      api_calls: 0.0005
    },
    enterprise: {
      exports: 0.01,
      users: 2.00,
      projects: 5.00,
      api_calls: 0.0001
    }
  };
  
  const tierRates = rates[tier] || rates.basic;
  const costs = {};
  
  for (const [action, count] of Object.entries(usage)) {
    if (tierRates[action]) {
      costs[action] = count * tierRates[action];
    }
  }
  
  return costs;
};

module.exports = { trackUsage, generateUsageReport };
```

## Step 4: Invoice Generation

### 4.1 Invoice Service
```javascript
// functions/src/billing/invoiceService.js
const PDFDocument = require('pdfkit');

/**
 * Generate invoice PDF
 * @sig generateInvoice :: (String, String, String) -> Promise<Buffer>
 */
const generateInvoice = async (organizationId, period, invoiceNumber) => {
  const organization = await getOrganization(organizationId);
  const usageReport = await generateUsageReport(organizationId, period.startDate, period.endDate);
  
  // Create PDF document
  const doc = new PDFDocument();
  const buffers = [];
  
  doc.on('data', buffers.push.bind(buffers));
  
  // Invoice header
  doc.fontSize(20).text('CurbMap Invoice', 50, 50);
  doc.fontSize(12).text(`Invoice #: ${invoiceNumber}`, 50, 80);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 100);
  
  // Organization details
  doc.text(`Bill To:`, 50, 130);
  doc.text(organization.name, 50, 150);
  doc.text(organization.adminEmail, 50, 170);
  
  // Invoice details
  doc.text(`Period: ${period.startDate} to ${period.endDate}`, 50, 200);
  doc.text(`Tier: ${organization.subscription.tier}`, 50, 220);
  
  // Usage table
  doc.text('Usage Summary:', 50, 250);
  let y = 280;
  
  for (const [action, count] of Object.entries(usageReport.usage)) {
    doc.text(`${action}: ${count}`, 50, y);
    y += 20;
  }
  
  // Total
  const total = organization.subscription.annualAmount;
  doc.text(`Total: $${total.toFixed(2)}`, 50, y + 20);
  
  // Payment terms
  doc.text('Payment Terms: Net 30', 50, y + 50);
  doc.text('Payment Method: Check', 50, y + 70);
  
  doc.end();
  
  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    
    doc.on('error', reject);
  });
};

/**
 * Send invoice email
 * @sig sendInvoiceEmail :: (String, Buffer) -> Promise<Void>
 */
const sendInvoiceEmail = async (email, pdfBuffer) => {
  // Implementation depends on your email service
  // This is a placeholder for SendGrid or similar
  console.log(`Sending invoice to ${email}`);
  
  // Log invoice sent event
  await createEvent({
    type: 'InvoiceSent',
    organizationId: 'system',
    projectId: 'default',
    actor: { type: 'system', id: 'billing-service' },
    subject: { type: 'organization', id: 'system' },
    data: { email, invoiceSize: pdfBuffer.length }
  });
};

/**
 * Generate and send invoice
 * @sig generateAndSendInvoice :: (String, String, String) -> Promise<Void>
 */
const generateAndSendInvoice = async (organizationId, period, invoiceNumber) => {
  try {
    const pdfBuffer = await generateInvoice(organizationId, period, invoiceNumber);
    const organization = await getOrganization(organizationId);
    
    await sendInvoiceEmail(organization.adminEmail, pdfBuffer);
    
    // Log invoice generation
    await createEvent({
      type: 'InvoiceGenerated',
      organizationId,
      projectId: 'default',
      actor: { type: 'system', id: 'billing-service' },
      subject: { type: 'organization', id: organizationId },
      data: { invoiceNumber, period }
    });
    
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
};

module.exports = { generateInvoice, generateAndSendInvoice };
```

## Step 5: Billing API Endpoints

### 5.1 Billing API
```javascript
// functions/src/api/billing.js
const express = require('express');
const router = express.Router();
const { authenticateUser, requireAdmin } = require('../auth/authMiddleware');
const { createAnnualSubscription } = require('../billing/stripe');
const { generateUsageReport } = require('../usage/usageTracking');
const { generateAndSendInvoice } = require('../billing/invoiceService');

// Apply authentication to all routes
router.use(authenticateUser);

/**
 * Create subscription
 * @sig createSubscription :: (Request, Response) -> Promise<Void>
 */
router.post('/subscription', requireAdmin('organizationId'), async (req, res) => {
  try {
    const { organizationId, tier, amount } = req.body;
    
    const result = await createAnnualSubscription(organizationId, tier, amount);
    
    res.json({
      message: 'Subscription created',
      customerId: result.customer.id,
      subscriptionId: result.subscription.id
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

/**
 * Get usage report
 * @sig getUsageReport :: (Request, Response) -> Promise<Void>
 */
router.get('/usage', requireAdmin('organizationId'), async (req, res) => {
  try {
    const { organizationId, startDate, endDate } = req.query;
    
    const report = await generateUsageReport(organizationId, startDate, endDate);
    
    res.json(report);
  } catch (error) {
    console.error('Error generating usage report:', error);
    res.status(500).json({ error: 'Failed to generate usage report' });
  }
});

/**
 * Generate invoice
 * @sig generateInvoice :: (Request, Response) -> Promise<Void>
 */
router.post('/invoice', requireAdmin('organizationId'), async (req, res) => {
  try {
    const { organizationId, period, invoiceNumber } = req.body;
    
    await generateAndSendInvoice(organizationId, period, invoiceNumber);
    
    res.json({ message: 'Invoice generated and sent' });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
});

/**
 * Get billing status
 * @sig getBillingStatus :: (Request, Response) -> Promise<Void>
 */
router.get('/status', requireAdmin('organizationId'), async (req, res) => {
  try {
    const { organizationId } = req.query;
    
    const organization = await getOrganization(organizationId);
    
    res.json({
      subscriptionStatus: organization.subscriptionStatus,
      billingTier: organization.billingTier,
      annualAmount: organization.annualAmount,
      lastPaymentDate: organization.lastPaymentDate,
      nextBillingDate: organization.nextBillingDate
    });
  } catch (error) {
    console.error('Error fetching billing status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

## Success Criteria

### Technical
- [ ] Stripe integration functional for annual billing
- [ ] Multi-format data export working (JSON, CSV, CDS)
- [ ] Usage tracking and reporting operational
- [ ] Invoice generation and email delivery working
- [ ] Webhook handling for billing events functional

### Functional
- [ ] Organizations can create annual subscriptions
- [ ] Data can be exported in multiple formats
- [ ] Usage is tracked and reported accurately
- [ ] Invoices are generated and sent automatically
- [ ] Billing events are processed via webhooks

### Business
- [ ] Annual billing model implemented
- [ ] Usage-based reporting available
- [ ] Professional invoice generation
- [ ] Automated billing workflows
- [ ] Customer billing portal functional

## Next Phase
Once billing and export systems are complete, proceed to **Integration Testing** and **Production Deployment** as outlined in `roadmap.md`.
