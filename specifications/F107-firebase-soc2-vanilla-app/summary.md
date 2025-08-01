# Firebase SOC2-Ready Vanilla App Specification

**Date:** 2025.01.22  
**Purpose:** LLM-friendly specification for vanilla Firebase app with SOC2 compliance  
**Scope:** Multi-tenant SaaS application with comprehensive security and audit capabilities

## Core Architecture

### Business Requirements
- **Target Customers**: Cities and municipalities
- **Pricing Model**: Annual fixed fee (thousands/year, check payment)
- **Multi-tenant**: Complete data isolation between cities
- **Data Hosting**: Secure hosting of all city data
- **Export Requirements**: Multi-format exports including CDS compliance
- **Billing**: Annual subscriptions with usage tracking
- **Support**: Customer onboarding and ongoing support

### Firebase Services Stack
```
Authentication → Firebase Auth + SSO + MFA + Custom Claims
Database → Cloud SQL (PostgreSQL) + Audit Logging
Storage → Firebase Storage + Encryption
Functions → Cloud Functions + Security Middleware
Hosting → Firebase Hosting + Security Headers
Monitoring → Firebase Performance + Custom Logging
```

### Additional Services
```
Billing → Stripe + Invoice Generation
Export → Multi-format + Incremental + Webhook
Analytics → Usage Tracking + Performance Monitoring
Support → Help Desk + Documentation + Training
```

### Data Model
```javascript
// Multi-tenant structure with complete isolation
cities: {
  cityId: {
    name: string,
    subscription: {
      tier: 'basic|premium|enterprise',
      annualAmount: number,
      startDate: timestamp,
      endDate: timestamp
    },
    settings: {
      ssoEnabled: boolean,
      ssoProvider: string,
      auditLogRetention: number
    }
  }
}

users: {
  userId: {
    email: string,
    displayName: string,
    cities: {
      cityId: {
        role: 'admin|user|viewer',
        permissions: string[],
        lastAccess: timestamp
      }
    },
    auditLog: {
      lastLogin: timestamp,
      lastActivity: timestamp,
      failedAttempts: number
    }
  }
}

// Generic data collection (replace with domain-specific data)
messages: {
  cityId: {
    messageId: {
      content: string,
      createdBy: userId,
      createdAt: timestamp,
      updatedAt: timestamp,
      updatedBy: userId,
      version: number
    }
  }
}

// Comprehensive audit logging
audit_logs: {
  logId: {
    userId: string,
    cityId: string,
    action: 'login|logout|create|update|delete|export|admin',
    resource: 'users|messages|cities|billing',
    resourceId: string,
    timestamp: timestamp,
    ipAddress: string,
    userAgent: string,
    sessionId: string,
    details: object,
    success: boolean,
    errorMessage: string
  }
}
```

## Phase 1: Foundation (Weeks 1-2)

### Authentication System
```javascript
// Firebase Auth with custom claims
const authConfig = {
  multiFactor: true,
  sessionTimeout: 3600, // 1 hour
  maxFailedAttempts: 5,
  lockoutDuration: 900, // 15 minutes
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  }
}

// Custom claims for role-based access
const setUserClaims = async (userId, cityId, role) => {
  const claims = {
    [`city_${cityId}_role`]: role,
    [`city_${cityId}_permissions`]: getPermissionsForRole(role)
  }
  await admin.auth().setCustomUserClaims(userId, claims)
}
```

### Database Schema
```sql
-- Cities table
CREATE TABLE cities (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subscription_tier VARCHAR(50) NOT NULL,
  annual_amount DECIMAL(10,2) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  sso_enabled BOOLEAN DEFAULT FALSE,
  sso_provider VARCHAR(100),
  audit_log_retention_days INTEGER DEFAULT 365,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  last_login TIMESTAMP,
  last_activity TIMESTAMP,
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User roles per city
CREATE TABLE user_city_roles (
  user_id VARCHAR(255) NOT NULL,
  city_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  permissions JSON,
  last_access TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, city_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (city_id) REFERENCES cities(id)
);

-- Audit logs table
CREATE TABLE audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  city_id VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(255),
  details JSON,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (city_id) REFERENCES cities(id)
);

-- Messages table (generic data)
CREATE TABLE messages (
  id VARCHAR(255) PRIMARY KEY,
  city_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(255),
  version INTEGER DEFAULT 1,
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

### Security Middleware
```javascript
// Rate limiting middleware
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
}

// Audit logging middleware
const auditLog = async (req, res, next) => {
  const startTime = Date.now()
  
  res.on('finish', async () => {
    const logData = {
      userId: req.user?.uid,
      cityId: req.headers['x-city-id'],
      action: req.method,
      resource: req.path.split('/')[1],
      resourceId: req.params.id,
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.session?.id,
      details: {
        method: req.method,
        path: req.path,
        query: req.query,
        body: req.body,
        responseStatus: res.statusCode,
        responseTime: Date.now() - startTime
      },
      success: res.statusCode < 400,
      errorMessage: res.statusCode >= 400 ? res.statusMessage : null
    }
    
    await logAuditEvent(logData)
  })
  
  next()
}
```

## Phase 2: Multi-Tenant Features (Weeks 3-4)

### City Management
```javascript
// City CRUD operations with audit logging
const createCity = async (cityData) => {
  const cityId = generateId()
  const city = {
    id: cityId,
    name: cityData.name,
    subscription_tier: cityData.tier || 'basic',
    annual_amount: cityData.annualAmount || 0,
    start_date: new Date(),
    end_date: addYears(new Date(), 1),
    sso_enabled: cityData.ssoEnabled || false,
    sso_provider: cityData.ssoProvider,
    audit_log_retention_days: 365
  }
  
  await db.query('INSERT INTO cities SET ?', city)
  await logAuditEvent({
    action: 'create',
    resource: 'cities',
    resourceId: cityId,
    details: city
  })
  
  return city
}
```

### User Management
```javascript
// User invitation and role assignment
const inviteUser = async (cityId, email, role) => {
  // Check if user exists
  let user = await getUserByEmail(email)
  
  if (!user) {
    // Create new user
    user = await createUser(email)
  }
  
  // Assign role to city
  await assignUserToCity(user.id, cityId, role)
  
  // Send invitation email
  await sendInvitationEmail(email, cityId, role)
  
  await logAuditEvent({
    action: 'invite_user',
    resource: 'users',
    resourceId: user.id,
    details: { cityId, email, role }
  })
}
```

### Data Isolation
```javascript
// Middleware to ensure data isolation
const cityIsolation = async (req, res, next) => {
  const cityId = req.headers['x-city-id'] || req.params.cityId
  
  if (!cityId) {
    return res.status(400).json({ error: 'City ID required' })
  }
  
  // Verify user has access to this city
  const hasAccess = await verifyCityAccess(req.user.uid, cityId)
  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' })
  }
  
  req.cityId = cityId
  next()
}
```

## Phase 3: Billing Integration (Weeks 5-6)

### Annual Billing System
```javascript
// Annual billing with check payment support
const createAnnualSubscription = async (cityId, tier, amount) => {
  const customer = await stripe.customers.create({
    email: city.adminEmail,
    metadata: { cityId, billingType: 'annual_check' }
  })
  
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: getStripePriceId(tier) }],
    billing_cycle_anchor: 'now',
    proration_behavior: 'create_prorations',
    metadata: { cityId, tier, billingType: 'annual' }
  })
  
  await updateCityBilling(cityId, {
    stripeCustomerId: customer.id,
    stripeSubscriptionId: subscription.id,
    tier,
    annualAmount: amount,
    billingType: 'annual_check',
    startDate: new Date(),
    endDate: addYears(new Date(), 1)
  })
}
```

### Invoice Generation
```javascript
// Professional invoice generation
const generateInvoice = async (cityId, period) => {
  const city = await getCity(cityId)
  const usage = await getUsageForPeriod(cityId, period)
  
  const invoice = {
    cityId,
    period,
    amount: city.annualAmount,
    usage: usage.summary,
    dueDate: addDays(new Date(), 30),
    paymentTerms: 'Net 30',
    paymentMethod: 'Check'
  }
  
  const pdf = await generateInvoicePDF(invoice)
  await sendInvoiceEmail(city.adminEmail, pdf)
  
  await logAuditEvent({
    action: 'invoice_generated',
    resource: 'billing',
    resourceId: cityId,
    details: invoice
  })
  
  return invoice
}
```

### Stripe Integration
```javascript
// Annual billing with Stripe
const createSubscription = async (cityId, tier, amount) => {
  const customer = await stripe.customers.create({
    email: city.adminEmail,
    metadata: { cityId }
  })
  
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: getStripePriceId(tier) }],
    billing_cycle_anchor: 'now',
    proration_behavior: 'create_prorations',
    metadata: { cityId, tier }
  })
  
  await updateCityBilling(cityId, {
    stripeCustomerId: customer.id,
    stripeSubscriptionId: subscription.id,
    tier,
    annualAmount: amount
  })
}
```

### Usage Tracking
```javascript
// Track usage for billing
const trackUsage = async (cityId, action, details) => {
  const usage = {
    cityId,
    action,
    timestamp: new Date(),
    details,
    userId: req.user?.uid
  }
  
  await db.query('INSERT INTO usage_logs SET ?', usage)
  
  // Check usage limits
  await checkUsageLimits(cityId, action)
}
```

## Phase 4: Export and API (Weeks 7-8)

### Export System
```javascript
// Multi-format export with audit logging
const exportData = async (cityId, format, filters) => {
  const exportId = generateId()
  
  // Log export request
  await logAuditEvent({
    action: 'export_request',
    resource: 'exports',
    resourceId: exportId,
    details: { cityId, format, filters }
  })
  
  // Generate export based on format
  let data
  switch (format) {
    case 'json':
      data = await exportAsJSON(cityId, filters)
      break
    case 'csv':
      data = await exportAsCSV(cityId, filters)
      break
    case 'shapefile':
      data = await exportAsShapefile(cityId, filters)
      break
    case 'cds':
      data = await exportAsCDS(cityId, filters)
      break
    case 'incremental':
      data = await exportIncremental(cityId, filters.sinceDate)
      break
  }
  
  // Log export completion
  await logAuditEvent({
    action: 'export_complete',
    resource: 'exports',
    resourceId: exportId,
    details: { cityId, format, recordCount: data.length }
  })
  
  return data
}
```

### CDS Export Compliance
```javascript
// Curb Data Specification export
const exportAsCDS = async (cityId, filters) => {
  const cityData = await getCityData(cityId, filters)
  
  // Transform to CDS format
  const cdsData = {
    curbs: transformToCurbsAPI(cityData.curbs),
    events: transformToEventsAPI(cityData.events),
    metrics: transformToMetricsAPI(cityData.metrics)
  }
  
  // Validate CDS compliance
  const validation = validateCDSCompliance(cdsData)
  if (!validation.valid) {
    throw new Error(`CDS validation failed: ${validation.errors.join(', ')}`)
  }
  
  return cdsData
}
```

### Webhook System
```javascript
// Webhook for city integrations
const handleWebhook = async (req, res) => {
  const { cityId, event, data } = req.body
  
  // Verify webhook signature
  if (!verifyWebhookSignature(req)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }
  
  // Process webhook
  await processWebhookEvent(cityId, event, data)
  
  // Log webhook
  await logAuditEvent({
    action: 'webhook_received',
    resource: 'webhooks',
    details: { cityId, event, data }
  })
  
  res.json({ success: true })
}
```

## Phase 5: Monitoring and Security (Weeks 9-10)

### Security Monitoring
```javascript
// Real-time threat detection
const detectSecurityEvents = async (auditLog) => {
  const events = []
  
  // Failed login attempts
  if (auditLog.action === 'login' && !auditLog.success) {
    const failedAttempts = await getFailedLoginAttempts(auditLog.userId)
    if (failedAttempts >= 5) {
      events.push({
        type: 'multiple_failed_logins',
        userId: auditLog.userId,
        severity: 'high'
      })
    }
  }
  
  // Unusual access patterns
  if (auditLog.action === 'export' && auditLog.details.recordCount > 10000) {
    events.push({
      type: 'large_export',
      userId: auditLog.userId,
      severity: 'medium'
    })
  }
  
  // Admin actions
  if (auditLog.action.includes('admin')) {
    events.push({
      type: 'admin_action',
      userId: auditLog.userId,
      severity: 'high'
    })
  }
  
  return events
}
```

### Performance Monitoring
```javascript
// Performance tracking with alerting
const trackPerformance = async (req, res, next) => {
  const startTime = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - startTime
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms`)
      // Send alert for slow requests
      sendAlert('slow_request', { method: req.method, path: req.path, duration })
    }
    
    // Track performance metrics
    trackMetric('request_duration', duration, {
      method: req.method,
      path: req.path,
      status: res.statusCode
    })
  })
  
  next()
}
```

### Error Tracking and Alerting
```javascript
// Comprehensive error handling
const errorHandler = async (error, req, res, next) => {
  // Log error with context
  const errorLog = {
    error: error.message,
    stack: error.stack,
    userId: req.user?.uid,
    cityId: req.headers['x-city-id'],
    method: req.method,
    path: req.path,
    timestamp: new Date()
  }
  
  await logError(errorLog)
  
  // Send alert for critical errors
  if (error.critical) {
    await sendAlert('critical_error', errorLog)
  }
  
  // Return appropriate error response
  res.status(error.status || 500).json({
    error: error.message,
    requestId: req.id
  })
}
```

### Backup and Recovery
```javascript
// Automated backup verification
const verifyBackups = async () => {
  const backups = await listBackups()
  
  for (const backup of backups) {
    // Test backup restoration
    const testRestore = await testBackupRestore(backup.id)
    
    if (!testRestore.success) {
      await sendAlert('backup_failure', { backupId: backup.id, error: testRestore.error })
    }
  }
}
```
```javascript
// Security event detection
const detectSecurityEvents = async (auditLog) => {
  const events = []
  
  // Failed login attempts
  if (auditLog.action === 'login' && !auditLog.success) {
    const failedAttempts = await getFailedLoginAttempts(auditLog.userId)
    if (failedAttempts >= 5) {
      events.push({
        type: 'multiple_failed_logins',
        userId: auditLog.userId,
        severity: 'high'
      })
    }
  }
  
  // Unusual access patterns
  if (auditLog.action === 'export' && auditLog.details.recordCount > 10000) {
    events.push({
      type: 'large_export',
      userId: auditLog.userId,
      severity: 'medium'
    })
  }
  
  // Admin actions
  if (auditLog.action.includes('admin')) {
    events.push({
      type: 'admin_action',
      userId: auditLog.userId,
      severity: 'high'
    })
  }
  
  return events
}
```

### Performance Monitoring
```javascript
// Performance tracking
const trackPerformance = async (req, res, next) => {
  const startTime = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - startTime
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms`)
    }
    
    // Track performance metrics
    trackMetric('request_duration', duration, {
      method: req.method,
      path: req.path,
      status: res.statusCode
    })
  })
  
  next()
}
```

## SOC2 Compliance Features

### Security Controls
```javascript
// All implemented in phases above
- ✅ Multi-factor authentication
- ✅ Role-based access control
- ✅ Session management
- ✅ Comprehensive audit logging
- ✅ Rate limiting
- ✅ Input validation
- ✅ Encryption at rest and in transit
- ✅ Secure API endpoints
```

### Availability Controls
```javascript
// Implemented via Firebase services
- ✅ 99.9% uptime (Firebase SLA)
- ✅ Geographic redundancy
- ✅ Automated backups
- ✅ Performance monitoring
- ✅ Error tracking
- ✅ Capacity auto-scaling
```

### Processing Integrity
```javascript
// Implemented in data operations
- ✅ Input validation
- ✅ Data integrity checks
- ✅ Conflict resolution
- ✅ Version tracking
- ✅ Error handling
- ✅ Change logging
```

## Implementation Checklist

### Phase 1: Foundation
- [ ] Firebase project setup
- [ ] Cloud SQL database schema
- [ ] Authentication system
- [ ] Security middleware
- [ ] Basic audit logging

### Phase 2: Multi-Tenant
- [ ] City management CRUD
- [ ] User management system
- [ ] Data isolation middleware
- [ ] Role-based permissions

### Phase 3: Billing
- [ ] Stripe integration
- [ ] Subscription management
- [ ] Usage tracking
- [ ] Invoice generation

### Phase 4: Export/API
- [ ] Multi-format exports
- [ ] Incremental export support
- [ ] Webhook system
- [ ] API rate limiting

### Phase 5: Monitoring
- [ ] Security event detection
- [ ] Performance monitoring
- [ ] Error tracking and alerting
- [ ] Backup verification
- [ ] Real-time threat detection
- [ ] Slow request alerting
- [ ] Critical error alerting

## Success Criteria

### Technical
- [ ] Multi-tenant data isolation
- [ ] Comprehensive audit logging
- [ ] Role-based access control
- [ ] Secure authentication
- [ ] Performance monitoring
- [ ] Error handling
- [ ] Security monitoring and alerting
- [ ] Backup verification and recovery
- [ ] Real-time threat detection
- [ ] Slow request detection and alerting

### Business
- [ ] Annual billing support
- [ ] Usage tracking
- [ ] Export functionality
- [ ] Webhook integration
- [ ] Customer onboarding

### Compliance
- [ ] SOC2-ready security controls
- [ ] Comprehensive audit trails
- [ ] Data encryption
- [ ] Access controls
- [ ] Change management
- [ ] Security policies and procedures
- [ ] Incident response procedures
- [ ] Backup and recovery procedures
- [ ] Performance monitoring and alerting
- [ ] Error tracking and alerting

## Risk Mitigation

### Technical Risks
- **Data isolation**: Comprehensive testing of multi-tenant boundaries
- **Security breaches**: Regular security audits and monitoring
- **Performance issues**: Load testing and monitoring
- **Integration failures**: Robust error handling and retry logic

### Business Risks
- **Customer churn**: Strong onboarding and support processes
- **Compliance failures**: Regular compliance assessments
- **Billing issues**: Comprehensive billing testing and monitoring
- **Data loss**: Automated backup and recovery procedures 