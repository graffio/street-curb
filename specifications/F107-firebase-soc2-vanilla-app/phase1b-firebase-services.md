# Phase 1b: Firebase Services Configuration

## Overview

Configure Firebase services for the curb-map application. This phase follows Phase 1 (Firebase project creation) and prepares the Firebase environment for application development.

## Firebase Services Analysis

### Services Requiring Configuration

**Authentication**
- **Configuration Needed**: Sign-in methods, providers (Google, email/password)
- **Programmatic Config**: Firebase Admin SDK + REST API calls
- **Environment**: Development onwards
- **Migration**: `003-configure-authentication.js`

**Firestore**
- **Configuration Needed**: Security rules, indexes, database location
- **Programmatic Config**: `firebase deploy --only firestore` + Admin SDK
- **Environment**: Development onwards
- **Migration**: `004-configure-firestore.js`

**Cloud Functions**
- **Configuration Needed**: Runtime, memory, triggers, environment variables
- **Programmatic Config**: `firebase deploy --only functions`
- **Environment**: Development onwards
- **Migration**: `005-configure-functions.js`

**Cloud Storage**
- **Configuration Needed**: Security rules, CORS settings
- **Programmatic Config**: `firebase deploy --only storage` + Admin SDK
- **Environment**: Development onwards
- **Migration**: `006-configure-storage.js`

**App Hosting** (New Firebase service)
- **Configuration Needed**: Deployment config, build settings
- **Programmatic Config**: `firebase apphosting:backends:create` via CLI
- **Environment**: Development onwards (for preview deploys)
- **Migration**: `007-configure-app-hosting.js`

**Remote Config**
- **Configuration Needed**: Parameter templates, conditions
- **Programmatic Config**: Firebase Admin SDK Remote Config API
- **Environment**: Development onwards
- **Migration**: `008-configure-remote-config.js`

### Services Auto-Configured

**Firebase Hosting**
- **Configuration**: Auto-configured when enabled via API
- **Later Config**: Custom domains (production only)
- **No Migration Needed**: Enabled by API calls in previous migrations

**Cloud Tasks** (Firebase Task Queue)
- **Configuration**: Auto-configured with Cloud Functions
- **Later Config**: Queue settings via Admin SDK when needed
- **No Migration Needed**: Works with Functions deployment

### Production/Staging Only Services

**App Check**
- **Purpose**: App attestation and abuse protection
- **Skip for Development**: Adds friction to testing/debugging
- **Configure for Staging/Production**: App attestation, reCAPTCHA Enterprise
- **Migration**: `009-configure-app-check.js` (staging/production environments only)

## Migration Sequence

```bash
# Phase 1b Firebase Services Configuration
003-configure-authentication.js    # Email/password + Google sign-in
004-configure-firestore.js         # Security rules, indexes, collections
005-configure-functions.js         # Deploy basic cloud functions
006-configure-storage.js           # File upload rules and buckets
007-configure-app-hosting.js       # Modern web app deployment
008-configure-remote-config.js     # Application feature flags
009-configure-app-check.js         # Security (staging/prod only)
```

## Environment Strategy

### Development Environment
- **All services configured** except App Check
- **Permissive security rules** for rapid development
- **Local emulators** when possible (Auth, Firestore, Functions, Storage)
- **Minimal remote config** parameters

### Staging Environment
- **All services configured** including App Check
- **Production-like security rules** but more logging
- **Real Firebase services** (no emulators)
- **Full remote config** parameter set for testing

### Production Environment
- **All services configured** with production settings
- **Strict security rules** optimized for performance
- **Production App Check** with real app attestation
- **Production remote config** with A/B testing capabilities

## Implementation Approach

### Service Configuration Pattern
Each migration follows this pattern:

1. **Check if already configured** (idempotent)
2. **Deploy configuration files** (rules, indexes, etc.)
3. **Configure via Admin SDK** (settings, initial data)
4. **Verify configuration** (test basic functionality)
5. **Update config file** with service-specific captured IDs

### Configuration Files Structure
```
modules/curb-map/
├── firebase-config/
│   ├── auth/
│   │   └── providers.json
│   ├── firestore/
│   │   ├── firestore.rules
│   │   └── firestore.indexes.json
│   ├── functions/
│   │   └── environment.json
│   ├── storage/
│   │   └── storage.rules
│   └── remote-config/
│       └── parameters.json
└── migrations/
    ├── 003-configure-authentication.js
    ├── 004-configure-firestore.js
    └── ...
```

### Security Considerations

**Development Security**
- **Permissive rules** for rapid iteration
- **Test data isolation** via user-based rules
- **No real PII** in development databases

**Production Security**
- **Principle of least privilege** in all rules
- **App Check enforcement** for abuse prevention
- **Audit logging** for all administrative actions
- **Data encryption** at rest and in transit

## Success Criteria

### Phase 1b Completion Checklist

**Authentication Service**
- [ ] Email/password authentication enabled
- [ ] Google sign-in provider configured
- [ ] User management rules deployed
- [ ] Test user creation/login functional

**Firestore Database**
- [ ] Security rules deployed and tested
- [ ] Database indexes created
- [ ] Initial collection structure created
- [ ] Read/write operations functional

**Cloud Functions**
- [ ] Function deployment pipeline working
- [ ] Basic HTTP functions deployed
- [ ] Environment variables configured
- [ ] Function logs accessible

**Cloud Storage**
- [ ] File upload/download rules deployed
- [ ] Storage buckets created with proper naming
- [ ] CORS settings configured for web access
- [ ] File operations functional

**App Hosting**
- [ ] Backend configuration created
- [ ] Build pipeline functional
- [ ] Preview deployments working
- [ ] Custom domain ready (production)

**Remote Config**
- [ ] Parameter templates deployed
- [ ] Default values configured
- [ ] Client SDK integration tested
- [ ] Configuration changes propagate

**App Check (Staging/Production)**
- [ ] App attestation configured
- [ ] reCAPTCHA Enterprise integrated
- [ ] Abuse protection active
- [ ] Debug tokens available for testing

## Testing Strategy

### Service-Level Testing
Each migration includes TAP tests that verify:
- Service is properly enabled
- Configuration files are deployed
- Basic service functionality works
- Security rules are enforced
- Captured IDs are stored in config

### Integration Testing
After all Phase 1b services are configured:
- End-to-end user flow (signup → authenticate → upload file → function call)
- Cross-service interactions (Auth + Firestore + Storage)
- Performance under load
- Security rule effectiveness

### Environment Promotion
- **Development → Staging**: Full configuration migration
- **Staging → Production**: Configuration review + manual approval
- **Rollback capability**: All configurations versioned in git

This phase establishes the complete Firebase service foundation needed for curb-map application development while maintaining security and operational best practices.