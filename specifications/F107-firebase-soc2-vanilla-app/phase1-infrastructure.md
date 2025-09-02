# Phase 1: Infrastructure Foundation

**Goal**: Set up development environment and basic project provisioning

## Deliverables
- [ ] `createSOC2Project()` function working
- [ ] Three environments created: `curb-map-development`, `curb-map-staging`, `curb-map-production`
- [ ] GitLab CI/CD pipeline configured
- [ ] Basic Firebase services enabled (Auth, Firestore, Functions, Hosting)

## Step 1: Firebase Project Creation

### 1.1 Create Firebase Project
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Create new project
firebase projects:create curb-map-development --display-name "CurbMap Development"

# Set project ID
firebase use curb-map-development
```

### 1.2 Enable Firebase Services
```bash
# Enable required services
firebase init hosting
firebase init functions
firebase init firestore
firebase init storage
```

### 1.3 Configure Firebase Project
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains"
          }
        ]
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

## Step 2: createSOC2Project() Function

### 2.1 Core Function Implementation
```javascript
// functions/src/infrastructure/createSOC2Project.js
const { ResourceManagerClient } = require('@google-cloud/resource-manager');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const admin = require('firebase-admin');

/**
 * Create SOC2-compliant Firebase project
 * @sig createSOC2Project :: (Object) -> Promise<String>
 */
const createSOC2Project = async ({
  environment,
  projectName,
  owner,
  projectId = null
}) => {
  const resourceManager = new ResourceManagerClient();
  const secretManager = new SecretManagerServiceClient();
  
  // Generate project ID if not provided
  const finalProjectId = projectId || `curb-map-${environment}-${Date.now()}`;
  
  try {
    // 1. Create GCP project
    const [project] = await resourceManager.createProject({
      projectId: finalProjectId,
      name: projectName,
      labels: {
        environment,
        owner,
        app: 'curbmap'
      }
    });
    
    // 2. Enable required APIs
    await enableRequiredAPIs(finalProjectId);
    
    // 3. Add Firebase services
    await addFirebaseServices(finalProjectId);
    
    // 4. Configure security based on environment
    if (environment === 'production') {
      await configureSOC2Security(finalProjectId);
    } else {
      await configureDevSecurity(finalProjectId);
    }
    
    // 5. Set up billing
    await configureBilling(finalProjectId, environment);
    
    // 6. Create service accounts
    await createServiceAccounts(finalProjectId, environment);
    
    return finalProjectId;
    
  } catch (error) {
    console.error('Failed to create project:', error);
    throw error;
  }
};

/**
 * Enable required GCP APIs
 * @sig enableRequiredAPIs :: (String) -> Promise<Void>
 */
const enableRequiredAPIs = async (projectId) => {
  const apis = [
    'firebase.googleapis.com',
    'firestore.googleapis.com',
    'cloudfunctions.googleapis.com',
    'cloudbuild.googleapis.com',
    'secretmanager.googleapis.com',
    'cloudresourcemanager.googleapis.com',
    'cloudaudit.googleapis.com',
    'monitoring.googleapis.com'
  ];
  
  for (const api of apis) {
    await gcloud.services.enable(api, { project: projectId });
  }
};

/**
 * Add Firebase services to project
 * @sig addFirebaseServices :: (String) -> Promise<Void>
 */
const addFirebaseServices = async (projectId) => {
  // Add Firebase to existing GCP project
  await firebase.projects().addFirebase(projectId);
  
  // Enable Firebase services
  await firebase.projects().update(projectId, {
    services: {
      auth: { enabled: true },
      firestore: { enabled: true },
      functions: { enabled: true },
      hosting: { enabled: true },
      storage: { enabled: true }
    }
  });
};

/**
 * Configure SOC2 security for production
 * @sig configureSOC2Security :: (String) -> Promise<Void>
 */
const configureSOC2Security = async (projectId) => {
  // Enable comprehensive audit logging
  await enableAuditLogging(projectId);
  
  // Set up monitoring and alerting
  await configureMonitoring(projectId);
  
  // Configure backup policies
  await configureBackups(projectId);
  
  // Set up security policies
  await configureSecurityPolicies(projectId);
};

/**
 * Configure relaxed security for development
 * @sig configureDevSecurity :: (String) -> Promise<Void>
 */
const configureDevSecurity = async (projectId) => {
  // Minimal audit logging for development
  await enableBasicAuditLogging(projectId);
  
  // Basic monitoring
  await configureBasicMonitoring(projectId);
};

module.exports = { createSOC2Project };
```

### 2.2 Environment-Specific Configuration
```javascript
// functions/src/infrastructure/environments.js
const environments = {
  development: {
    projectId: 'curb-map-development',
    displayName: 'CurbMap Development',
    security: 'relaxed',
    auditLogging: 'minimal',
    billing: 'shared-dev-billing'
  },
  staging: {
    projectId: 'curb-map-staging',
    displayName: 'CurbMap Staging',
    security: 'production-like',
    auditLogging: 'comprehensive',
    billing: 'shared-dev-billing',
    dataStrategy: 'synthetic'
  },
  production: {
    projectId: 'curb-map-production',
    displayName: 'CurbMap Production',
    security: 'soc2-compliant',
    auditLogging: 'comprehensive',
    billing: 'production-billing',
    dataStrategy: 'real-customer-data'
  }
};

const createEnvironment = async (environment) => {
  const config = environments[environment];
  if (!config) {
    throw new Error(`Unknown environment: ${environment}`);
  }
  
  return await createSOC2Project({
    environment,
    projectName: config.displayName,
    owner: 'developer',
    projectId: config.projectId
  });
};

module.exports = { environments, createEnvironment };
```

## Step 3: GitLab CI/CD Pipeline

### 3.1 GitLab CI Configuration
```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"
  FIREBASE_TOKEN: $FIREBASE_TOKEN

# Test stage
test:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run test
    - npm run lint
  only:
    - merge_requests
    - main

# Build stage
build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour
  only:
    - main

# Deploy to staging
deploy_staging:
  stage: deploy
  image: node:${NODE_VERSION}
  script:
    - npm install -g firebase-tools
    - firebase use curb-map-staging
    - firebase deploy --only hosting,functions
  environment:
    name: staging
    url: https://curb-map-staging.web.app
  only:
    - main
  when: manual

# Deploy to production
deploy_production:
  stage: deploy
  image: node:${NODE_VERSION}
  script:
    - npm install -g firebase-tools
    - firebase use curb-map-production
    - firebase deploy --only hosting,functions
  environment:
    name: production
    url: https://curb-map-production.web.app
  only:
    - main
  when: manual
```

### 3.2 Environment Setup Script
```bash
#!/bin/bash
# scripts/setup-environments.sh

# Create all environments
echo "Creating development environment..."
firebase projects:create curb-map-development --display-name "CurbMap Development"

echo "Creating staging environment..."
firebase projects:create curb-map-staging --display-name "CurbMap Staging"

echo "Creating production environment..."
firebase projects:create curb-map-production --display-name "CurbMap Production"

# Set up GitLab CI variables
echo "Setting up GitLab CI variables..."
echo "FIREBASE_TOKEN: $(firebase login:ci)"

# Deploy to staging
echo "Deploying to staging..."
firebase use curb-map-staging
firebase deploy

echo "Infrastructure setup complete!"
```

## Step 4: Service Account Management

### 4.1 Service Account Creation
```javascript
// functions/src/infrastructure/serviceAccounts.js
const { IAMClient } = require('@google-cloud/iam');

/**
 * Create service accounts for different purposes
 * @sig createServiceAccounts :: (String, String) -> Promise<Void>
 */
const createServiceAccounts = async (projectId, environment) => {
  const iam = new IAMClient();
  
  const serviceAccounts = [
    {
      name: 'firebase-deploy',
      displayName: 'Firebase Deploy Service Account',
      roles: [
        'roles/firebase.admin',
        'roles/cloudfunctions.admin',
        'roles/firestore.admin'
      ]
    },
    {
      name: 'firebase-functions',
      displayName: 'Firebase Functions Service Account',
      roles: [
        'roles/firestore.user',
        'roles/secretmanager.secretAccessor'
      ]
    }
  ];
  
  for (const sa of serviceAccounts) {
    await createServiceAccount(projectId, sa);
  }
};

const createServiceAccount = async (projectId, config) => {
  const iam = new IAMClient();
  
  // Create service account
  const [serviceAccount] = await iam.createServiceAccount({
    name: `projects/${projectId}`,
    accountId: config.name,
    serviceAccount: {
      displayName: config.displayName,
      description: `Service account for ${config.displayName}`
    }
  });
  
  // Assign roles
  for (const role of config.roles) {
    await iam.setIamPolicy({
      resource: `projects/${projectId}`,
      policy: {
        bindings: [
          {
            role,
            members: [`serviceAccount:${serviceAccount.email}`]
          }
        ]
      }
    });
  }
  
  return serviceAccount;
};

module.exports = { createServiceAccounts };
```

## Step 5: Security Configuration

### 5.1 Firestore Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Update queue - structure validation only
    match /update_queue/{queueId} {
      allow create: if 
        request.auth != null &&
        request.resource.data.keys().hasAll(['action', 'data', 'idempotencyKey', 'userId']) &&
        request.resource.data.userId == request.auth.uid;
      
      allow read: if 
        request.auth != null && 
        resource.data.userId == request.auth.uid;
      
      allow update: if false; // Only server functions can update
    }
    
    // Events - read-only for users, write-only for functions
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if false; // Only server functions can write
    }
    
    // Organizations - organization members only
    match /organizations/{organizationId} {
      allow read, write: if 
        request.auth != null &&
        request.auth.token.organizations[organizationId] != null;
    }
    
    // Users - own data only
    match /users/{userId} {
      allow read, write: if 
        request.auth != null &&
        request.auth.uid == userId;
    }
  }
}
```

### 5.2 Storage Security Rules
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Organization data - members only
    match /organizations/{organizationId}/{allPaths=**} {
      allow read, write: if 
        request.auth != null &&
        request.auth.token.organizations[organizationId] != null;
    }
  }
}
```

## Success Criteria

### Technical
- [ ] `createSOC2Project()` function creates projects successfully
- [ ] All three environments provisioned and configured
- [ ] GitLab CI/CD pipeline deploys to staging
- [ ] Service accounts created with appropriate permissions
- [ ] Security rules configured and tested

### Operational
- [ ] Development environment ready for team use
- [ ] Staging environment mirrors production configuration
- [ ] Production environment SOC2-compliant
- [ ] CI/CD pipeline functional with manual production approval
- [ ] Documentation updated with setup procedures

### Security
- [ ] Firestore rules prevent unauthorized access
- [ ] Storage rules enforce organization isolation
- [ ] Service accounts follow principle of least privilege
- [ ] Audit logging enabled for production
- [ ] Security policies configured appropriately

## Next Phase
Once infrastructure foundation is complete, proceed to **Phase 2: Event Sourcing Core** (`phase2-events.md`).
