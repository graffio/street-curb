# F122: Rate Limiting Implementation

## Status
**Deferred** - Pattern defined, implementation deferred until passcode authentication is prioritized.

## Overview
Distributed rate limiting for passcode requests to prevent brute force attacks and abuse. Uses Redis (Cloud Memorystore) for shared state across Firebase Functions instances.

## Background

### Why Rate Limiting?
Passcode authentication is vulnerable to brute force attacks (trying many phone numbers) and abuse (spamming SMS). Rate limiting prevents these attacks by limiting requests per phone number and per IP address.

### Key Requirements
- **Phone Number Limit**: 3 passcode requests per phone number per hour
- **IP Address Limit**: 5 passcode requests per IP address per hour
- **Progressive Delays**: Increasing delays after repeated failures (30s, 2min, 5min)
- **Distributed State**: Shared across multiple Firebase Functions instances
- **Monitoring**: Alert on rate limit violations (potential attacks)

## Implementation Pattern

### Rate Limiting Function

```javascript
/**
 * Rate limit passcode requests by phone number
 * @sig rateLimitPasscodeRequests :: (String) -> Promise<Void>
 * @throws Error if rate limit exceeded
 */
const rateLimitPasscodeRequests = async (phoneNumber) => {
  const key = `passcode_requests:${phoneNumber}`;
  const attempts = await redis.get(key) || 0;

  if (attempts >= 3) {
    throw new Error('Rate limit exceeded: 3 attempts per hour');
  }

  await redis.setex(key, 3600, attempts + 1); // 1 hour TTL
};
```

### IP-Based Rate Limiting

```javascript
/**
 * Rate limit by IP address
 * @sig rateLimitByIp :: (String) -> Promise<Void>
 * @throws Error if rate limit exceeded
 */
const rateLimitByIp = async (ipAddress) => {
  const key = `passcode_requests_ip:${ipAddress}`;
  const attempts = await redis.get(key) || 0;

  if (attempts >= 5) {
    throw new Error('Rate limit exceeded: 5 attempts per IP per hour');
  }

  await redis.setex(key, 3600, attempts + 1); // 1 hour TTL
};
```

### Progressive Delay Logic

```javascript
/**
 * Calculate delay based on failed attempts
 * @sig calculateDelay :: (Number) -> Number (milliseconds)
 */
const calculateDelay = (failedAttempts) => {
  if (failedAttempts === 0) return 0;
  if (failedAttempts === 1) return 30 * 1000;      // 30 seconds
  if (failedAttempts === 2) return 2 * 60 * 1000;  // 2 minutes
  return 5 * 60 * 1000;                            // 5 minutes
};

/**
 * Apply progressive delay for repeated failures
 * @sig applyProgressiveDelay :: (String) -> Promise<Void>
 */
const applyProgressiveDelay = async (phoneNumber) => {
  const key = `failed_attempts:${phoneNumber}`;
  const failedAttempts = await redis.get(key) || 0;
  const delay = calculateDelay(failedAttempts);

  if (delay > 0) {
    const lastAttemptKey = `last_attempt:${phoneNumber}`;
    const lastAttempt = await redis.get(lastAttemptKey);

    if (lastAttempt) {
      const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
      if (timeSinceLastAttempt < delay) {
        const remainingDelay = delay - timeSinceLastAttempt;
        throw new Error(`Too many failed attempts. Try again in ${Math.ceil(remainingDelay / 1000)}s`);
      }
    }
  }

  await redis.set(`last_attempt:${phoneNumber}`, Date.now().toString());
};
```

### Failed Attempt Tracking

```javascript
/**
 * Record failed authentication attempt
 * @sig recordFailedAttempt :: (String) -> Promise<Void>
 */
const recordFailedAttempt = async (phoneNumber) => {
  const key = `failed_attempts:${phoneNumber}`;
  const attempts = await redis.get(key) || 0;

  // Increment with 1 hour TTL
  await redis.setex(key, 3600, attempts + 1);
};

/**
 * Clear failed attempts after successful authentication
 * @sig clearFailedAttempts :: (String) -> Promise<Void>
 */
const clearFailedAttempts = async (phoneNumber) => {
  await redis.del(`failed_attempts:${phoneNumber}`);
  await redis.del(`last_attempt:${phoneNumber}`);
};
```

## Usage in Request Flow

### Passcode Request Endpoint

```javascript
/**
 * POST /requestPasscode
 * Rate-limited endpoint for requesting authentication passcode
 */
app.post('/requestPasscode', async (req, res) => {
  const { phoneNumber } = req.body;
  const ipAddress = req.ip;

  try {
    // Rate limiting checks
    await rateLimitByIp(ipAddress);
    await rateLimitPasscodeRequests(phoneNumber);
    await applyProgressiveDelay(phoneNumber);

    // Send passcode via SMS
    await sendPasscode(phoneNumber);

    // Log event
    await logAuthEvent('PasscodeRequested', 'system', { phoneNumber });

    res.status(200).json({ status: 'sent' });
  } catch (error) {
    if (error.message.includes('Rate limit exceeded')) {
      return res.status(429).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Passcode Verification Endpoint

```javascript
/**
 * POST /verifyPasscode
 * Verify passcode and issue token
 */
app.post('/verifyPasscode', async (req, res) => {
  const { phoneNumber, passcode } = req.body;

  try {
    // Verify passcode
    const result = await verifyPasscode(phoneNumber, passcode);

    // Clear failed attempts on success
    await clearFailedAttempts(phoneNumber);

    // Log event
    await logAuthEvent('PasscodeVerified', result.user.uid, { phoneNumber });

    res.status(200).json({ token: result.token });
  } catch (error) {
    // Record failed attempt
    await recordFailedAttempt(phoneNumber);

    res.status(401).json({ error: 'Invalid passcode' });
  }
});
```

## Redis Setup (Cloud Memorystore)

### Configuration

```javascript
/**
 * Initialize Redis client for Cloud Memorystore
 */
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || '10.0.0.3',  // Cloud Memorystore internal IP
  port: process.env.REDIS_PORT || 6379,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Redis connection refused');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Redis retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});
```

### Infrastructure Setup

```bash
# Create Cloud Memorystore instance
gcloud redis instances create curbmap-rate-limit \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_6_x \
  --tier=basic

# Get instance IP
gcloud redis instances describe curbmap-rate-limit \
  --region=us-central1 \
  --format="get(host)"
```

## Monitoring and Alerting

### Rate Limit Metrics

```javascript
/**
 * Log rate limit metrics for monitoring
 */
const logRateLimitMetric = async (limitType, identifier) => {
  await admin.firestore().collection('rate_limit_metrics').add({
    type: limitType,  // 'phone_number' | 'ip_address' | 'progressive_delay'
    identifier,       // phone number or IP address
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
};
```

### Alerting Rules

- **High rate limit violations**: >100 violations per hour → potential attack
- **Repeated IP violations**: Same IP hitting rate limit >10 times → block IP
- **Failed attempt spike**: >500 failed attempts per hour → investigate

## Testing Strategy

### Unit Tests

**Rate Limiting Logic**:
- 1st request → allow
- 2nd request → allow
- 3rd request → allow
- 4th request → deny (HTTP 429)

**Progressive Delays**:
- 1st failure → no delay
- 2nd failure → 30s delay
- 3rd failure → 2min delay
- 4th+ failures → 5min delay

**Failed Attempt Tracking**:
- Record failed attempts
- Clear after successful auth
- Expire after 1 hour

### Integration Tests

**Rate Limit Enforcement**:
- Request passcode 3 times → 3rd succeeds
- Request passcode 4th time → HTTP 429

**IP Rate Limiting**:
- Different phone numbers from same IP
- 5 requests → succeed
- 6th request → HTTP 429

### Load Testing

**Distributed Rate Limiting**:
- Multiple Functions instances
- Shared Redis state
- No race conditions
- Consistent limits across instances

## Implementation Guidelines

### Error Messages
- **Phone limit**: "Rate limit exceeded: 3 attempts per hour"
- **IP limit**: "Rate limit exceeded: 5 attempts per IP per hour"
- **Progressive delay**: "Too many failed attempts. Try again in 120s"

### HTTP Status Codes
- **429 Too Many Requests**: Rate limit exceeded
- **401 Unauthorized**: Invalid passcode
- **500 Internal Server Error**: Redis failure or unexpected error

### Redis Key Patterns
- `passcode_requests:{phoneNumber}` - passcode request count
- `passcode_requests_ip:{ipAddress}` - IP request count
- `failed_attempts:{phoneNumber}` - failed authentication count
- `last_attempt:{phoneNumber}` - timestamp of last attempt

## Security Considerations

### Rate Limit Bypass Prevention
- Check both phone number AND IP address
- Cannot bypass by rotating phone numbers from same IP
- Cannot bypass by rotating IPs with same phone number

### Redis Security
- Cloud Memorystore uses private VPC
- No public internet access
- Encrypted in transit (optional)
- Automatic backups

### Key Expiration
- All keys have TTL (1 hour)
- Automatic cleanup
- No manual purging needed

## Cost Considerations

### Cloud Memorystore Pricing
- Basic tier: ~$40/month for 1GB
- Standard tier: ~$150/month for 1GB (HA)
- Start with Basic tier, upgrade if needed

### Alternative: Firestore-Based Rate Limiting
For lower traffic (<1000 auth/day), could use Firestore:
- Create `rate_limits` collection
- Query by phone number or IP
- Transaction to increment counter
- More expensive per request, no infrastructure cost

## Future Enhancements

### Adaptive Rate Limiting
- Lower limits during detected attacks
- Higher limits for verified users
- Geographic-based limits (higher for expected regions)

### Bot Detection
- CAPTCHA integration for repeated failures
- Device fingerprinting
- Behavioral analysis

### Whitelisting
- Bypass rate limits for testing
- Internal phone numbers
- VIP users

## References

**Architecture**:
- [Security Architecture](../../docs/architecture/security.md) - Authentication security requirements

**Related Specifications**:
- F121: Authentication Middleware - Passcode verification endpoints
- F120: User Impersonation - Does not require rate limiting (admin-only)

**Implementation Status**:
- ⏸️ Deferred until passcode authentication is prioritized
- ✅ Pattern defined and documented
- ⏸️ Cloud Memorystore setup pending
- ⏸️ HTTP endpoints pending (F121)
