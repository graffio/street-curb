# Infrastructure as Code Strategy for Firebase SOC2 Projects

**Date:** 2025.08.29  
**Purpose:** LLM-friendly specification for programmatic Firebase/GCP project management  
**Context:** Multi-environment development with SOC2 production compliance

## Overview

**Problem**: Need to provision/deprovision Firebase projects programmatically for multiple environments (dev per developer, staging, production) while maintaining SOC2 compliance only where required.

**Solution**: Infrastructure-as-code approach using Firebase/GCP APIs with proper account management and security scope separation.

## Key Insights

### SOC2 Scope Limitation
- **SOC2 applies ONLY to production projects** that handle real customer data
- **Development environments are OUT OF SCOPE** (can use relaxed security)  
- **Staging may be in scope** if it contains real customer data (vs synthetic test data)

### Project Structure
```
Production Projects (SOC2-compliant):
├── myapp-production (real customer data)
└── myapp-staging (if using real customer data)

Development Projects (relaxed security):
├── myapp-dev-alice (developer sandbox)
├── myapp-dev-bob (developer sandbox)
└── myapp-dev-shared (team development)
```

## Firebase Project Creation Requirements

### Minimum Console Steps (One-time Setup)
1. **Create initial GCP project** (can be done via API alternatively)
2. **Enable Firebase Management API** in that project  
3. **Set up billing account** (if not already configured)

### Everything Else via API/CLI
- Add Firebase services to existing GCP projects
- Create Firebase apps (web, iOS, Android)
- Configure services (Auth, Firestore, Functions, Storage)
- Set up multiple environments
- Deploy and manage configurations

### Core API Pattern
```bash
# Firebase projects are GCP projects + Firebase services
gcloud projects create PROJECT_ID --name="Dev Environment"
gcloud services enable firebase.googleapis.com --project=PROJECT_ID
firebase projects:addfirebase PROJECT_ID
```

## Account Management Strategy

### Personal Email vs Google Workspace Migration

**Start Simple Approach**:
- Begin with personal email (e.g., personal@gmail.com)
- Migrate to Google Workspace when team grows or revenue starts

**Migration Process**:
1. Create Google Workspace with company domain
2. Create new admin account (admin@yourcompany.com)
3. Add new account as Owner to all GCP projects
4. Transfer project ownership to new account
5. Remove personal email from projects

**Audit Log Implications**:
- Historical logs retain original personal email identity
- New actions show Google Workspace email
- **No data loss** during migration
- Clear audit trail of ownership transfer (ideal for SOC2)

### Account Separation for SOC2

**Recommended Identity Structure**:
```
personal@gmail.com              # Initial owner (temporary)
admin@yourcompany.com           # Infrastructure/admin changes  
dev@yourcompany.com             # Daily development work
alice@yourcompany.com           # Team member development
service-account@project.iam     # Automated deployments
```

**Access Patterns**:
- **Admin identity**: Create/delete projects, manage billing, user management
- **Developer identity**: Deploy code, read logs, debug issues  
- **Service accounts**: CI/CD automated deployments
- **Separation of duties**: SOC2 requirement - developers ≠ production admins

### Service Accounts vs Human Accounts

#### When to Use Service Accounts (Recommended)

**Automated operations**:
```javascript
// CI/CD deployments
const deploymentSA = 'firebase-deploy@project.iam.gserviceaccount.com'
// Permissions: firebase.hosting.sites.update, cloudfunctions.functions.create

// Database migrations  
const migrationSA = 'db-migration@project.iam.gserviceaccount.com'
// Permissions: cloudsql.instances.connect, firestore.documents.write

// Monitoring/alerts
const monitoringSA = 'monitoring@project.iam.gserviceaccount.com' 
// Permissions: logging.logEntries.list, monitoring.metricDescriptors.list
```

#### When to Use Human Accounts

**Interactive development and audit trails**:
```javascript
// Alice debugging production issues
alice@company.com
// Permissions: logging.viewer, firestore.documents.read (read-only)

// Admin creating new projects  
admin@company.com
// Permissions: resourcemanager.projects.create, firebase.projects.create
```

**For SOC2**: Human accounts provide better audit trails - you need to trace actions back to individual humans, not shared service accounts.

#### Hybrid Approach (Recommended)

**For Development**:
```javascript
// Human accounts with restricted predefined roles
alice@company.com: roles/firebase.developer  // ~50 permissions vs 3000+
bob@company.com: roles/firebase.developer
admin@company.com: roles/firebase.admin + roles/resourcemanager.projectCreator
```

**For Production**:
```javascript  
// Service accounts for automated operations
deployment-sa: roles/firebase.deployer
monitoring-sa: roles/logging.viewer
backup-sa: roles/cloudsql.client

// Human accounts for emergency access only
admin@company.com: roles/firebase.viewer (read-only!)
```

**For CI/CD**:
```javascript
// Always use service accounts for automation
github-actions-sa: [
  'cloudfunctions.functions.create',
  'firebase.hosting.sites.update', 
  'firestore.rules.create'
]
```

## API Strategy: Mixed Approach

### Firebase vs GCP APIs
**Both are needed** - use the right tool for each task:

```javascript
// Firebase-specific operations
import { getFirestore, getAuth } from 'firebase-admin';
await getAuth().createUser({ email, password });

// GCP infrastructure operations  
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
await secretClient.createSecret({ name: 'db-password' });

// Project lifecycle operations
import { ResourceManagerClient } from '@google-cloud/resource-manager';
await resourceManager.createProject(); // Create GCP project
await firebase.projects().addFirebase(projectId); // Add Firebase services
```

### Implementation Options

**Option 1: Scripts + CLI** (Recommended for start)
```bash
#!/bin/bash
# Simple, readable, Firebase-focused
PROJECT_ID="myapp-dev-$(whoami)-$(date +%s)"
gcloud projects create $PROJECT_ID
firebase projects:addfirebase $PROJECT_ID  
firebase use $PROJECT_ID
firebase deploy
```

**Option 2: Direct APIs + Node.js** (More control later)
```javascript
// Full programmatic control
const project = await resourceManager.createProject({
  projectId: generateProjectId(),
  labels: { environment: 'dev', owner: 'alice' }
});
await enableFirebaseServices(project.projectId);
```

**Migration Path**: Start with Option 1, migrate to Option 2 when CLI limitations are reached.

## GCP Organization Decision

### Without GCP Organization (Simpler)
```
Standalone Projects:
├── alice@company.com owns myapp-dev-alice
├── bob@company.com owns myapp-dev-bob  
└── admin@company.com owns myapp-production
```

**Pros**: Simple setup, individual project ownership
**Cons**: No centralized policies, individual project management

### With GCP Organization (Centralized)
```
company.com Organization:
├── Dev Folder/
│   ├── myapp-dev-alice (alice editor access)
│   └── myapp-dev-bob (bob editor access)
└── Production Folder/
    ├── myapp-staging (restricted access)
    └── myapp-production (admin-only access)
```

**Pros**: Centralized billing, organization-wide policies, better audit trails
**Cons**: Setup complexity, monthly Google Workspace cost

**Recommendation**: **Start without Organization**, add later if needed for centralized control.

## Permission Management

### Development Projects (Relaxed)
- Developer self-service project creation/deletion
- Minimal audit logging (cost savings)
- Relaxed security policies
- Fast iteration capabilities

### Production Projects (SOC2-Compliant)
- **Comprehensive audit logging** - every action recorded
- **Restricted access** - admin approval required for changes
- **MFA enforced** - multi-factor authentication mandatory
- **Regular security reviews** - periodic access audits
- **Change management procedures** - documented change control
- **Backup verification** - automated backup testing

### GCP Permission Explosion Problem

**Issue**: GCP assigns thousands of permissions by default
- **Project Owner** = 3,000+ permissions
- **Project Editor** = 2,000+ permissions  
- **Project Viewer** = 1,000+ permissions

GCP will actually warn you about this excessive permission assignment.

**Solution Strategies**:

#### Strategy 1: Use Predefined Roles Instead of Primitive Roles

```javascript
// Bad: Primitive roles with thousands of permissions
roles/owner     // 3,000+ permissions
roles/editor    // 2,000+ permissions
roles/viewer    // 1,000+ permissions

// Good: Service-specific predefined roles
roles/firebase.admin           // ~50 Firebase permissions
roles/cloudsql.editor         // ~30 database permissions  
roles/secretmanager.accessor  // ~5 secret permissions
roles/logging.viewer          // ~10 logging permissions
```

#### Strategy 2: Custom Roles for Exact Permissions

```javascript
// Create custom role with only needed permissions
const customRole = await iam.createRole({
  name: 'projects/my-project/roles/firebaseDevRole',
  title: 'Firebase Developer',
  permissions: [
    'firebase.projects.get',
    'firebase.projects.update', 
    'cloudfunctions.functions.create',
    'cloudfunctions.functions.update',
    'firestore.documents.read',
    'firestore.documents.write'
  ]
});
```

#### Strategy 3: Service Account Strategy

**Don't give users direct project access**. Instead:

```javascript
// Create service account with minimal permissions
const serviceAccount = await iam.createServiceAccount({
  name: 'firebase-dev-sa',
  displayName: 'Firebase Development Service Account'
});

// Give service account only specific roles
await iam.setPolicy('projects/my-project', {
  bindings: [
    { 
      role: 'roles/firebase.developer', 
      members: [`serviceAccount:firebase-dev-sa@my-project.iam.gserviceaccount.com`] 
    }
  ]
});

// Users authenticate as service account for project work
// Personal accounts only for identity, not direct project access
```

#### Strategy 4: Organization Policies (Advanced)

If using GCP Organization, restrict permissions organization-wide:

```yaml
# org-policy.yaml
constraint: constraints/iam.disableServiceAccountCreation
listPolicy:
  allowedValues:
  - "roles/firebase.admin"
  - "roles/cloudsql.client" 
  - "roles/secretmanager.accessor"
  deniedValues:
  - "roles/owner"
  - "roles/editor"
```

#### Practical Implementation Example

```javascript
// Development projects: Predefined roles only
const devPermissions = [
  'roles/firebase.developer',
  'roles/cloudsql.client',
  'roles/logging.viewer'
];

// Production projects: Custom role with minimal permissions
const prodPermissions = await createCustomRole('soc2-production-role', [
  'firebase.projects.get',
  'firestore.documents.read',
  'cloudfunctions.functions.invoke'
]);
```

**Result**: Reduces permission count from 3,000+ to <100 permissions per user.

## Environment Provisioning Strategy

### Development Environment Template
```javascript
const createDevEnvironment = async (developerName) => {
  const projectId = `myapp-dev-${developerName}-${timestamp()}`
  
  // 1. Create GCP project
  await createGCPProject(projectId, {
    environment: 'development',
    owner: developerName,
    billing: 'shared-dev-billing'
  })
  
  // 2. Add Firebase services
  await addFirebaseServices(projectId, {
    auth: true,
    firestore: true, 
    functions: true,
    hosting: true
  })
  
  // 3. Configure minimal security
  await configureDevSecurity(projectId, {
    auditLogging: 'minimal',
    accessControl: 'developer-self-service'
  })
  
  return projectId
}
```

### Production Environment Template  
```javascript
const createProductionEnvironment = async () => {
  const projectId = `myapp-production`
  
  // 1. Create GCP project with SOC2 settings
  await createGCPProject(projectId, {
    environment: 'production',
    compliance: 'soc2',
    billing: 'production-billing'
  })
  
  // 2. Add Firebase services
  await addFirebaseServices(projectId, {
    auth: true,
    firestore: true,
    functions: true,
    hosting: true,
    storage: true
  })
  
  // 3. Configure SOC2 security
  await configureSOC2Security(projectId, {
    auditLogging: 'comprehensive',
    accessControl: 'admin-approval-required',
    mfa: 'enforced',
    backupVerification: 'automated',
    changeManagement: 'documented'
  })
  
  return projectId
}
```

## Cost Optimization

### Development Projects
- **Firestore**: Use emulator for local development
- **Functions**: Generous free tier sufficient
- **Auth**: Free tier adequate for development
- **Hosting**: Free tier for development sites

### Production Projects  
- **Firestore**: Pay-per-use pricing, optimize queries
- **Functions**: Monitor invocation costs
- **Auth**: Scale with user base
- **Audit Logging**: Additional cost for SOC2 compliance

### Auto-Cleanup Strategy
```javascript
// Clean up old development environments
exports.cleanupDevEnvironments = functions.pubsub
  .schedule('every sunday')
  .onRun(async () => {
    const oldProjects = await findProjectsOlderThan(30, 'development')
    
    for (const project of oldProjects) {
      if (await confirmUnused(project.id)) {
        await deleteProject(project.id)
        await notifyOwner(project.owner, `Cleaned up ${project.id}`)
      }
    }
  })
```

## Implementation Checklist

### Phase 1: Basic Setup
- [ ] Create initial GCP project with personal email
- [ ] Enable Firebase Management API  
- [ ] Create first development environment via CLI
- [ ] Test Firebase service provisioning
- [ ] Document project creation scripts

### Phase 2: Multi-Environment
- [ ] Create staging environment 
- [ ] Create production environment with SOC2 settings
- [ ] Test environment isolation
- [ ] Implement basic access controls
- [ ] Set up billing separation

### Phase 3: Team Scaling  
- [ ] Migrate to Google Workspace
- [ ] Create developer-specific environments
- [ ] Implement automated provisioning
- [ ] Set up audit logging for production
- [ ] Document access procedures

### Phase 4: SOC2 Compliance
- [ ] Implement comprehensive audit logging
- [ ] Set up MFA enforcement for production
- [ ] Create change management procedures  
- [ ] Implement backup verification
- [ ] Conduct security reviews

## Success Criteria

### Technical
- **Environment provisioning**: New environments in <5 minutes
- **Access control**: Proper role separation between dev/prod
- **Audit compliance**: Complete audit trail for production changes
- **Cost efficiency**: Development environments auto-cleanup

### Operational  
- **Developer productivity**: Self-service development environments
- **Security compliance**: SOC2-ready production controls
- **Scalability**: Support 5+ developers with individual environments
- **Maintainability**: Infrastructure changes tracked in version control

This strategy provides a clear path from simple personal development to SOC2-compliant production infrastructure while maintaining developer productivity and cost efficiency.