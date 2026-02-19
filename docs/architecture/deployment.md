---
summary: "Planned three-tier serverless deployment architecture with complete environment isolation for SOC2-compliant multi-tenant SaaS"
keywords: [ "deployment", "infrastructure", "environments", "firebase", "gcp", "serverless" ]
module: curb-map
last_updated: "2025-01-16"
---

# Deployment Architecture

## Overview

CurbMap will use a three-tier serverless deployment architecture (development → staging → production) with complete
environment isolation for SOC2 compliance. All infrastructure runs on Firebase/GCP with serverless functions, managed
database, and zero-downtime deployments.

**Current Status**: Deployment infrastructure deferred. Currently
using [Firebase emulators](https://firebase.google.com/docs/emulator-suite) for local development only. No CI/CD
pipeline exists. No staging or production environments deployed.

### Architecture Map

```
┌─────────────────────────────────────────────────────────────────┐
│ Planned Three-Tier Environments (complete isolation)            │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐        │
│  │ Development   │  │ Staging       │  │ Production    │        │
│  │ GCP Project:  │  │ GCP Project:  │  │ GCP Project:  │        │
│  │ curb-map-dev  │  │ curb-map-stg  │  │ curb-map-prod │        │
│  │               │  │               │  │               │        │
│  │ • Synthetic   │  │ • Test data   │  │ • Real cust.  │        │
│  │   test data   │  │ • Validation  │  │   data        │        │
│  │ • Stripe test │  │ • Stripe test │  │ • Stripe live │        │
│  │ • Auto deploy │  │ • Auto deploy │  │ • Manual gate │        │
│  └───────────────┘  └───────────────┘  └───────────────┘        │
│         ↓                  ↓                    ↓               │
│  Each environment contains:                                     │
│  • Firestore (database + event sourcing)                        │
│  • Firebase Auth (user authentication)                          │
│  • Cloud Functions (serverless HTTP functions)                  │
│  • Firebase Hosting (static web app)                            │
│  • Cloud Storage (file uploads)                                 │
│  • Cloud Logging/Monitoring                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Architecture

**Problem**: CurbMap needs SOC2-compliant deployment for municipal customers with 2-3 person team. Traditional
deployment (manual server management, VMs, load balancers) requires dedicated DevOps engineer ($150K/year + 20-30
hours/week). Must isolate production customer data from test environments while enabling fast iteration.

**Solution**: Three-tier serverless architecture with complete GCP project isolation. Firebase/GCP provides managed
services (auto-scaling, backups, monitoring) requiring zero DevOps expertise. Auto-deploy to dev/staging; manual
approval gate prevents accidental production changes. Serverless functions auto-scale from 0 to 1000+ requests/second
without capacity planning.

### Key Components

**Three-Tier Environments**:

- **Development**: Active feature development, synthetic test data, Stripe test mode, auto-deploy on every commit
- **Staging**: Pre-production validation with generated test data, Stripe test mode, auto-deploy from develop branch
- **Production**: Live customer environment with real municipal data, Stripe live mode, manual approval required for
  deployment

**Firebase/GCP Services** (per environment):

- **Firestore**: NoSQL database for event sourcing (`completedActions`) and materialized views (`organizations`,
  `users`)
- **Firebase Auth**: User authentication with custom claims (organization roles)
- **Cloud Functions**: Serverless HTTP functions (`submitActionRequest`, `stripeWebhook`) with auto-scaling
- **Firebase Hosting**: Static web app hosting with CDN
- **Cloud Storage**: File storage for uploads (surveys, photos)
- **Cloud Logging**: Centralized logging for all services
- **Cloud Monitoring**: Application metrics, uptime monitoring, alerting

**External Services**:

- **Sentry.io**: Error monitoring, performance tracking (separate projects per environment)
- **Stripe**: Payment processing (test mode for dev/staging, live mode for production)

**Environment Isolation**:

- **Complete GCP Project Separation**: Each environment is separate GCP project (no shared resources)
- **Data Isolation**: No real customer data in development/staging (SOC2 requirement)
- **Network Isolation**: Separate VPCs, firewall rules, IAM policies
- **Access Control**: Different service accounts per environment, separate IAM roles

---

## Architecture Details

### Environment Strategy

**Three-Tier Model**:

```
Development (curb-map-development)
  ↓ Auto-deploy on every commit
Staging (curb-map-staging)
  ↓ Auto-deploy from develop branch
  ↓ Manual approval required ↓
Production (curb-map-production)
  ↓ Manual deploy after approval
```

**Environment Characteristics**:

| Characteristic  | Development                | Staging                   | Production                |
|-----------------|----------------------------|---------------------------|---------------------------|
| **Purpose**     | Active feature development | Pre-production validation | Live customer environment |
| **Data**        | Synthetic test data        | Generated test data       | Real customer data        |
| **Stripe Mode** | Test mode (sk_test_...)    | Test mode (sk_test_...)   | Live mode (sk_live_...)   |
| **Deployment**  | Auto on every commit       | Auto from develop branch  | Manual approval required  |
| **Access**      | All developers             | All developers            | Limited (admins only)     |
| **Monitoring**  | Basic (Sentry errors)      | Full (Sentry + uptime)    | Full + alerting           |
| **Backups**     | None (ephemeral)           | Daily (7-day retention)   | Daily (30-day retention)  |

**Complete Isolation**:

- **Separate GCP Projects**: Each environment is completely isolated GCP project (no shared resources)
- **Separate Firebase Projects**: Each has own Firestore, Auth, Functions, Hosting, Storage
- **Separate IAM**: Different service accounts, different access policies
- **Separate Secrets**: Different API keys, different Stripe keys, different passwords

### Infrastructure Components

**Firebase/GCP Stack** (per environment):

```
┌─────────────────────────────────────────────────────────┐
│ Firebase Services                                       │
│                                                         │
│  Firestore                                              │
│  ├─ completedActions (event sourcing, 7-year retention)│
│  ├─ organizations (materialized view)                   │
│  ├─ users (materialized view)                           │
│  └─ organizations/{id}/projects (hierarchical)          │
│                                                         │
│  Firebase Auth                                          │
│  ├─ Passcode-only authentication                        │
│  ├─ Custom claims (organization roles)                  │
│  └─ Service account impersonation                       │
│                                                         │
│  Cloud Functions (serverless HTTP)                      │
│  ├─ submitActionRequest (main endpoint)                 │
│  ├─ stripeWebhook (billing integration)                 │
│  └─ Auto-scaling (0 to 1000+ requests/second)           │
│                                                         │
│  Firebase Hosting (static web app)                      │
│  ├─ CDN (global content delivery)                       │
│  ├─ SSL (automatic HTTPS)                               │
│  └─ Custom domain support                               │
│                                                         │
│  Cloud Storage (file uploads)                           │
│  ├─ Survey photos                                       │
│  ├─ Organization logos                                  │
│  └─ Data exports                                        │
└─────────────────────────────────────────────────────────┘
```

**Configuration Files**:

- `.firebaserc` - Firebase project mappings (dev/staging/production)
- `firebase.json` - Firebase Hosting, Functions, Firestore configuration
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Firestore index configuration

**Why Firebase/GCP**:

- **Managed Services**: Zero server management, auto-scaling, automated backups
- **Integrated Platform**: Single platform for database, auth, functions, hosting (simpler than multi-provider)
- **Small Team Friendly**: Minimal DevOps expertise required (no Kubernetes, no load balancers, no server patching)
- **Free Tier**: Development/staging run on free tier (<$10/month), production ~$50-100/month
- **SOC2 Compliant**: GCP provides SOC2 Type II certification (reduces compliance burden)

### Planned CI/CD Pipeline

**Branch Strategy**:

- **Feature Branches**: `feature/new-feature` → deploys to development on commit
- **Develop Branch**: `develop` → deploys to staging on merge (auto after MR approval)
- **Main Branch**: `main` → deploys to production after manual approval

**Deployment Flow**:

```
Developer
  ├─ git push origin feature/new-feature
  └─ Creates merge request to develop branch
       ↓
GitLab CI Pipeline
  ├─ 1. Run tests (unit, integration, E2E)
  ├─ 2. Security scan (npm audit, dependency check)
  ├─ 3. Build artifacts (web app bundle, functions)
  ├─ 4. Deploy to development (auto)
  └─ 5. If develop branch → deploy to staging (auto)
       ↓
Production Deployment (manual approval required)
  ├─ Human reviews staging deployment
  ├─ Manual approval in GitLab CI
  ├─ Deploy to production (auto after approval)
  └─ Rollback available (previous deployment preserved)
```

**Deployment Safety**:

- **Automated Tests**: All tests must pass before deployment (unit, integration, E2E)
- **Security Scanning**: No critical vulnerabilities allowed (blocks deployment)
- **Staging Validation**: Production deployment requires successful staging deployment
- **Manual Approval**: Human must approve production deployment (prevents accidental deploys)
- **Rollback**: Previous deployment preserved, can rollback in <5 minutes

For deployment procedures, see [Firebase deployment documentation](https://firebase.google.com/docs/hosting/deploying).

### Security & Compliance

**Network Security**:

- **VPC Isolation**: Each environment in separate VPC (no cross-environment traffic)
- **Firewall Rules**: Restrictive ingress/egress (only HTTPS, only Cloud Functions)
- **TLS Everywhere**: All traffic encrypted (Firebase Hosting auto-HTTPS, Functions HTTPS-only)

**Access Control**:

- **Service Accounts**: Functions run as service account (minimal permissions, Firestore write only)
- **IAM Roles**: Developers have viewer role in production (read logs, no data access)
- **MFA Required**: Production access requires multi-factor authentication
- **Audit Logging**: All IAM changes logged (Cloud Audit Logs, 1-year retention)

**Data Protection**:

- **Encryption at Rest**: Firestore/Storage encrypted by default (Google-managed keys)
- **Encryption in Transit**: All traffic over HTTPS/TLS 1.2+
- **Data Residency**: All data stored in us-central1 (US region for compliance)
- **Backup Encryption**: Backups encrypted with same keys as production data

**SOC2 Compliance**:

- **Environment Isolation**: Complete separation (no dev/staging data leakage to production)
- **Access Controls**: Role-based access, MFA, audit logging
- **Automated Backups**: Daily Firestore backups, 30-day retention
- **Security Scanning**: Automated vulnerability scanning in CI/CD
- **Incident Response**: Sentry alerting, on-call rotation, documented procedures

---

## Trade-offs

### What This Enables

**Zero DevOps Overhead**: Serverless architecture requires no server management, scaling configuration, or
infrastructure expertise. Saves $150K/year DevOps engineer cost for 2-3 person team.

**SOC2 Compliance**: Complete environment isolation, automated backups, audit logging satisfy SOC2 requirements without
custom infrastructure. Enterprise customers require SOC2 certification for contracts.

**Fast Iteration**: Deploy multiple times per day to dev/staging. Auto-deploy enables rapid feature development without
manual deployment steps.

**Auto-Scaling**: Cloud Functions scale from 0 to 1000+ requests/second automatically. No capacity planning, no scaling
configuration, handles traffic spikes (municipal events, news coverage).

**Deployment Safety**: Automated testing + manual production approval prevent bad deployments. Staging validation
catches regressions before production impact.

### What This Constrains

**Firebase/GCP Vendor Lock-In**:

- All infrastructure tied to Firebase/GCP (Firestore, Cloud Functions, Firebase Auth)
- **Migration cost**: 3-6 months to rebuild on different platform (AWS, Azure, self-hosted)
- **Why acceptable**: Managed services save $150K/year DevOps cost, migration unlikely for small team
- **Mitigation**: Event sourcing makes data portable (can export completedActions, rebuild state)

**Limited Infrastructure Control**:

- Can't customize function runtime (Node.js version dictated by GCP)
- Can't optimize costs granularly (no reserved instances, no spot instances)
- **When this matters**: Production costs exceed $500/month → custom infrastructure may be cheaper
- **Why acceptable**: Current production costs ~$50-100/month, managed services reduce complexity

**Manual Production Approval Delay**:

- 5-10 minute delay for human to approve production deployment
- **When this matters**: Critical security patch needs immediate deployment
- **Why acceptable**: Enterprise SaaS prioritizes safety over speed, customer downtime more costly than approval delay
- **Mitigation**: Emergency deployment runbook for critical patches (bypass approval)

**Complete Environment Isolation Costs**:

- 3x infrastructure cost (3 separate GCP projects vs shared resources)
- Development/staging run on free tier, but production ~$50-100/month
- **Why acceptable**: SOC2 compliance requires complete data isolation, enterprise customers require certification

**Cold Start Latency**:

- Cloud Functions have ~500ms cold start (first request after idle)
- **When this matters**: User-facing critical path (action submission)
- **Impact**: p99 latency ~1-2 seconds (includes cold start + processing)
- **Mitigation**: Keep functions warm with scheduled requests (costs ~$5/month), users tolerate 1-2s latency for
  municipal workflows

### When to Revisit

- **Production costs > $500/month**: Consider custom infrastructure (Kubernetes, self-managed database) for cost
  optimization
- **Team grows > 8 developers**: Consider splitting environments (per-developer dev environments), microservices
  architecture
- **Multi-region requirement**: Enterprise customers demand global deployment (EU data residency, Asia-Pacific
  performance)
- **Real-time collaboration**: WebSocket/SSE required for multi-user editing (not supported by Cloud Functions)
- **Regulatory change**: New compliance requirement incompatible with Firebase/GCP (e.g., data sovereignty)

---

## Decision History

This deployment architecture was planned based on small team constraints and SOC2 compliance requirements. **Note**:
These are planned decisions - deployment infrastructure is not yet implemented.

**Three-Tier Environments** (vs Two-Tier):

- **Rationale**: Staging provides production-like validation without development noise. Development too volatile for
  final testing (multiple deploys/day, broken code).
- **Alternative Considered**: Two-tier (dev/production) - simpler, lower cost
- **Why Rejected**: Production-like validation required for SOC2 (can't test in development, can't risk production).
  Staging catches regressions that unit tests miss.

**Complete Project Isolation** (vs Shared Resources):

- **Rationale**: SOC2 compliance requires complete data isolation (no dev/staging data leakage to production). Separate
  GCP projects provide strongest isolation boundary.
- **Alternative Considered**: Shared project with namespace isolation (e.g., `/dev-*`, `/staging-*`, `/prod-*`
  collections)
- **Why Rejected**: Firestore rules can't prevent cross-namespace queries (developer could accidentally query production
  data). Separate projects eliminate risk.

**Serverless (Cloud Functions)** (vs VMs):

- **Rationale**: Zero DevOps overhead for 2-3 person team. Auto-scaling eliminates capacity planning. Managed services
  reduce operational complexity.
- **Alternative Considered**: Self-managed VMs (Compute Engine, Kubernetes)
- **Why Rejected**: Requires dedicated DevOps engineer ($150K/year + 20-30 hours/week). Team has no infrastructure
  expertise. Serverless reduces complexity.

**Manual Production Approval** (vs Auto-Deploy):

- **Rationale**: Human gate prevents accidental production deployment (broken staging deployment doesn't auto-promote).
  Enterprise SaaS prioritizes safety over speed.
- **Alternative Considered**: Auto-deploy to production (faster, no approval delay)
- **Why Rejected**: Risk of bad deployment outweighs 5-10 minute approval delay. Customer downtime more costly than
  deployment delay.

**Firebase/GCP** (vs AWS/Azure):

- **Rationale**: Integrated platform (Firestore, Auth, Functions, Hosting in single service). Small team needs
  simplicity. Free tier supports development/staging.
- **Alternative Considered**: AWS (Lambda, DynamoDB, Cognito, S3) or Azure (Functions, CosmosDB, AD)
- **Why Rejected**: Multi-service complexity (learn 4+ services vs 1 platform). Firebase pricing more predictable ($
  50-100/month vs AWS unpredictable costs).
