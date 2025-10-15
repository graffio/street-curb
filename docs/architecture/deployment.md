---
summary: "Three-tier serverless deployment architecture with complete environment isolation, automated CI/CD, and SOC2-compliant infrastructure for multi-tenant SaaS"
keywords: ["deployment", "infrastructure", "environments", "ci-cd", "firebase", "gcp", "serverless", "disaster-recovery", "soc2"]
last_updated: "2025-01-15"
---

# Deployment Architecture

## Table of Contents
- [1. Overview](#1-overview)
  - [1.1 Architecture Map](#11-architecture-map)
  - [1.2 Why This Architecture](#12-why-this-architecture)
  - [1.3 Key Components](#13-key-components)
  - [1.4 Trade-offs Summary](#14-trade-offs-summary)
  - [1.5 Current Implementation Status](#15-current-implementation-status)
  - [1.6 Key Design Decisions](#16-key-design-decisions)
- [2. Problem & Context](#2-problem--context)
  - [2.1 Requirements](#21-requirements)
  - [2.2 Constraints](#22-constraints)
- [3. Architecture Details](#3-architecture-details)
  - [3.1 Environment Strategy](#31-environment-strategy)
  - [3.2 Infrastructure Components](#32-infrastructure-components)
  - [3.3 CI/CD Pipeline](#33-cicd-pipeline)
  - [3.4 Monitoring & Observability](#34-monitoring--observability)
  - [3.5 Security & Compliance](#35-security--compliance)
- [4. Implementation Guide](#4-implementation-guide)
  - [4.1 Quick Start: Deploying to New Environment](#41-quick-start-deploying-to-new-environment)
  - [4.2 Code Locations](#42-code-locations)
  - [4.3 Configuration](#43-configuration)
  - [4.4 Testing](#44-testing)
- [5. Consequences & Trade-offs](#5-consequences--trade-offs)
  - [5.1 What This Enables](#51-what-this-enables)
  - [5.2 What This Constrains](#52-what-this-constrains)
  - [5.3 Future Considerations](#53-future-considerations)
- [6. References](#6-references)
- [7. Decision History](#7-decision-history)

---

## 1. Overview

CurbMap uses a three-tier serverless deployment architecture (development → staging → production) with complete environment isolation for SOC2 compliance. All infrastructure runs on Firebase/GCP with automated CI/CD via GitLab, providing auto-scaling serverless functions, managed database, and zero-downtime deployments for 2-3 person team.

### 1.1 Architecture Map

```
┌─────────────────────────────────────────────────────────────────┐
│ GitLab CI/CD                                                    │
│ • Source control (feature branches → develop → main)           │
│ • Automated testing (unit, integration, E2E)                    │
│ • Security scanning (dependency vulnerabilities)                │
│ • Automated deployment (staging auto, production manual)        │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────────┐
│ Three-Tier Environments (complete isolation)                    │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      │
│  │ Development   │  │ Staging       │  │ Production    │      │
│  │ GCP Project:  │  │ GCP Project:  │  │ GCP Project:  │      │
│  │ curb-map-dev  │  │ curb-map-stg  │  │ curb-map-prod │      │
│  │               │  │               │  │               │      │
│  │ • Synthetic   │  │ • Test data   │  │ • Real cust.  │      │
│  │   test data   │  │ • Validation  │  │   data        │      │
│  │ • Stripe test │  │ • Stripe test │  │ • Stripe live │      │
│  │ • Auto deploy │  │ • Auto deploy │  │ • Manual gate │      │
│  └───────────────┘  └───────────────┘  └───────────────┘      │
│         ↓                  ↓                    ↓              │
│  Each environment contains:                                    │
│  • Firestore (database + event sourcing)                       │
│  • Firebase Auth (user authentication)                         │
│  • Cloud Functions (serverless HTTP functions)                 │
│  • Firebase Hosting (static web app)                           │
│  • Cloud Storage (file uploads)                                │
│  • Cloud Logging/Monitoring                                    │
└─────────────────────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────────┐
│ External Services (shared across environments)                  │
│                                                                 │
│  Sentry.io (Error Monitoring)                                   │
│  ├─ Development environment (dev-sentry-dsn)                    │
│  ├─ Staging environment (staging-sentry-dsn)                    │
│  └─ Production environment (prod-sentry-dsn)                    │
│                                                                 │
│  Stripe (Payment Processing)                                    │
│  ├─ Test mode (dev/staging use sk_test_...)                     │
│  └─ Live mode (production uses sk_live_...)                     │
└─────────────────────────────────────────────────────────────────┘

Deployment Flow:
┌─────────────────────────────────────────────────────────────────┐
│ Developer                                                       │
│ ├─ git push origin feature/new-feature                          │
│ └─ Creates merge request to develop branch                      │
└────────────┬────────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────────┐
│ GitLab CI Pipeline                                              │
│ ├─ 1. Run tests (unit, integration, E2E)                        │
│ ├─ 2. Security scan (npm audit, dependency check)               │
│ ├─ 3. Build artifacts (web app bundle, functions)               │
│ ├─ 4. Deploy to development (auto)                              │
│ └─ 5. If develop branch → deploy to staging (auto)              │
└────────────┬────────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────────┐
│ Production Deployment (manual approval required)                │
│ ├─ Human reviews staging deployment                             │
│ ├─ Manual approval in GitLab CI                                 │
│ ├─ Deploy to production (auto after approval)                   │
│ └─ Rollback available (previous deployment preserved)           │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Why This Architecture

**Problem**: CurbMap needs SOC2-compliant deployment for municipal customers (San Francisco, Los Angeles) with 2-3 person team. Traditional deployment (manual server management, VMs, load balancers) requires dedicated DevOps engineer ($150K/year + 20-30 hours/week). Must isolate production customer data from test environments while enabling fast iteration.

**Solution**: Three-tier serverless architecture (development → staging → production) with complete GCP project isolation. Firebase/GCP provides managed services (auto-scaling, backups, monitoring) requiring zero DevOps expertise. GitLab CI automates deployment to dev/staging; manual approval gate prevents accidental production changes. Serverless functions auto-scale from 0 to 1000+ requests/second without capacity planning.

### 1.3 Key Components

**Three-Tier Environments**:
- **Development** (`curb-map-development`): Active feature development, synthetic test data, Stripe test mode, auto-deploy on every commit
- **Staging** (`curb-map-staging`): Pre-production validation with generated test data, Stripe test mode, auto-deploy from develop branch
- **Production** (`curb-map-production`): Live customer environment with real municipal data, Stripe live mode, manual approval required for deployment

**Firebase/GCP Services** (per environment):
- **Firestore**: NoSQL database for event sourcing (`completedActions`) and materialized views (`organizations`, `users`)
- **Firebase Auth**: User authentication with custom claims (organization roles)
- **Cloud Functions**: Serverless HTTP functions (`submitActionRequest`, `stripeWebhook`) with auto-scaling
- **Firebase Hosting**: Static web app hosting with CDN
- **Cloud Storage**: File storage for uploads (surveys, photos)
- **Cloud Logging**: Centralized logging for all services
- **Cloud Monitoring**: Application metrics, uptime monitoring, alerting

**CI/CD Pipeline** (GitLab CI):
- **Automated Testing**: Unit tests, integration tests (Firebase emulator), E2E tests
- **Security Scanning**: Dependency vulnerability scanning (`npm audit`), code quality checks
- **Build Process**: Web app bundling (Vite/Webpack), Cloud Functions deployment
- **Deployment**: Auto-deploy to dev/staging, manual approval for production

**External Services**:
- **Sentry.io**: Error monitoring, performance tracking, release tracking (separate projects per environment)
- **Stripe**: Payment processing (test mode for dev/staging, live mode for production)

**Environment Isolation**:
- **Complete GCP Project Separation**: Each environment is separate GCP project (no shared resources)
- **Data Isolation**: No real customer data in development/staging (SOC2 requirement)
- **Network Isolation**: Separate VPCs, firewall rules, IAM policies
- **Access Control**: Different service accounts per environment, separate IAM roles

### 1.4 Trade-offs Summary

- **Serverless lock-in** for zero DevOps overhead ($0 DevOps cost vs $150K/year engineer)
- **Firebase/GCP vendor lock-in** for managed services (3-6 month migration cost if switching providers)
- **Manual production approval** for safety (5-10 minute deployment delay vs instant auto-deploy)
- **Complete environment isolation** for SOC2 compliance (3x infrastructure cost vs shared resources)

See [Consequences & Trade-offs](#consequences--trade-offs) for detailed analysis.

### 1.5 Current Implementation Status

- ✅ **Implemented** (production since 2024-12):
  - Three-tier environments (dev/staging/production) with complete isolation
  - GitLab CI/CD pipeline (automated testing, security scanning, deployment)
  - Firebase/GCP infrastructure (Firestore, Auth, Functions, Hosting, Storage)
  - Sentry.io error monitoring (separate projects per environment)
  - Manual production approval gate (GitLab CI manual job)
  - Automated backups (Firestore daily backups, 30-day retention)

- 📋 **Planned Enhancements** (backlog):
  - Blue/green deployments (zero-downtime production deployments)
  - Canary releases (gradual rollout to production users)
  - Multi-region deployment (disaster recovery, global performance)
  - Automated rollback on error rate spike (circuit breaker pattern)

### 1.6 Key Design Decisions

**Three-Tier, Not Two-Tier**: Separate staging environment for production-like validation. Development too noisy for final validation (frequent deploys, broken code). Staging provides stable environment for pre-production testing. [Details in decisions.md](../decisions.md#three-tier-environments) (if ADR exists)

**Complete Project Isolation, Not Shared Resources**: Each environment is separate GCP project (no shared Firestore, no shared Functions). Prevents accidental data leakage (dev code querying prod data). SOC2 requirement for data isolation. Costs 3x more but eliminates cross-environment security risks.

**Serverless Functions, Not VMs**: Cloud Functions auto-scale from 0 to 1000+ requests/second without capacity planning. No server management, no patching, no scaling configuration. Trade-off: vendor lock-in to GCP, cold start latency (~500ms). Acceptable for 2-3 person team (zero DevOps overhead).

**Manual Production Approval, Not Auto-Deploy**: Human must approve production deployment in GitLab CI. Prevents accidental production deployment (broken staging deployment doesn't auto-promote). Trade-off: 5-10 minute delay for approval. Acceptable for enterprise SaaS (customer downtime more costly than deployment delay).

**Firebase, Not Custom Infrastructure**: Firebase provides managed Firestore, Auth, Hosting, Functions in single platform. Alternative: self-manage PostgreSQL, custom auth, Nginx, Docker. Firebase reduces complexity for small team but increases vendor lock-in.

---

## 2. Problem & Context

### 2.1 Requirements

**SOC2 Compliance**:
- Complete data isolation between environments (no real customer data in dev/staging)
- Audit trail for all deployments (who deployed what, when)
- Environment access controls (developers can't access production data directly)
- Automated security scanning (vulnerability detection before production)

**Small Team Operations**:
- 2-3 developers (no dedicated DevOps engineer)
- Zero ongoing infrastructure management (no server patching, scaling, monitoring setup)
- Fast iteration (multiple deploys per day to dev/staging)
- Minimize operational complexity (managed services over self-hosted)

**Production Reliability**:
- Auto-scaling (handle traffic spikes without capacity planning)
- Automated backups (point-in-time recovery for data corruption)
- Disaster recovery (RTO < 4 hours, RPO < 1 hour)
- Zero-downtime deployments (deploy without customer impact)

**Deployment Safety**:
- Automated testing before deployment (catch regressions)
- Staging validation before production (verify in production-like environment)
- Manual approval for production (human gate prevents accidental deploys)
- Rollback capability (revert bad deployments quickly)

### 2.2 Constraints

- **Small Team**: 2-3 developers - prioritize simplicity over flexibility
- **Budget Conscious**: Optimize for Firebase free tier ($50-100/month budget for production)
- **SOC2 Compliance**: Complete environment isolation (non-negotiable for enterprise customers)
- **No DevOps Expertise**: Team has no infrastructure experience - use managed services
- **Fast Iteration**: Deploy multiple times per day to dev/staging (enable rapid development)
- **Enterprise SaaS**: Municipal customers require high reliability (99.9% uptime target)

---

## 3. Architecture Details

### 3.1 Environment Strategy

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

| Characteristic | Development | Staging | Production |
|---------------|-------------|---------|------------|
| **Purpose** | Active feature development | Pre-production validation | Live customer environment |
| **Data** | Synthetic test data | Generated test data | Real customer data |
| **Stripe Mode** | Test mode (sk_test_...) | Test mode (sk_test_...) | Live mode (sk_live_...) |
| **Deployment** | Auto on every commit | Auto from develop branch | Manual approval required |
| **Access** | All developers | All developers | Limited (admins only) |
| **Monitoring** | Basic (Sentry errors) | Full (Sentry + uptime) | Full + alerting |
| **Backups** | None (ephemeral) | Daily (7-day retention) | Daily (30-day retention) |

**Complete Isolation**:
- **Separate GCP Projects**: Each environment is completely isolated GCP project (no shared resources)
- **Separate Firebase Projects**: Each has own Firestore, Auth, Functions, Hosting, Storage
- **Separate IAM**: Different service accounts, different access policies
- **Separate Networks**: Separate VPCs, firewall rules
- **Separate Secrets**: Different API keys, different Stripe keys, different passwords

**Data Strategy**:
- **Development**: Synthetic test data only (hardcoded fixtures, test users)
- **Staging**: Generated test data (realistic but fake municipal data)
- **Production**: Real customer data with full SOC2 compliance

### 3.2 Infrastructure Components

```
Each Environment Contains:

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
         ↓
┌─────────────────────────────────────────────────────────┐
│ GCP Services (per environment)                          │
│                                                         │
│  Cloud Logging                                          │
│  ├─ Centralized logs (all services)                     │
│  ├─ 30-day retention                                    │
│  └─ Log-based metrics                                   │
│                                                         │
│  Cloud Monitoring                                       │
│  ├─ Function metrics (invocations, errors, latency)     │
│  ├─ Firestore metrics (reads, writes, storage)          │
│  ├─ Custom metrics (business KPIs)                      │
│  └─ Alerting (error rate, latency thresholds)           │
│                                                         │
│  Secret Manager                                         │
│  ├─ Stripe API keys                                     │
│  ├─ Sentry DSN                                          │
│  ├─ Service account keys                                │
│  └─ Webhook secrets                                     │
│                                                         │
│  IAM                                                    │
│  ├─ Service accounts (function execution)               │
│  ├─ Role bindings (developer access)                    │
│  └─ Audit logging (access trail)                        │
└─────────────────────────────────────────────────────────┘
```

**Why Firebase/GCP**:
- **Managed Services**: Zero server management, auto-scaling, automated backups
- **Integrated Platform**: Single platform for database, auth, functions, hosting (simpler than multi-provider)
- **Small Team Friendly**: Minimal DevOps expertise required (no Kubernetes, no load balancers, no server patching)
- **Free Tier**: Development/staging run on free tier (<$10/month), production ~$50-100/month
- **SOC2 Compliant**: GCP provides SOC2 Type II certification (reduces compliance burden)

**Trade-off vs Self-Hosted**:
- ✅ Zero DevOps overhead ($0 vs $150K/year DevOps engineer)
- ✅ Auto-scaling (no capacity planning, no scaling configuration)
- ✅ Managed backups (automated, tested, point-in-time recovery)
- ❌ Vendor lock-in (3-6 month migration to leave Firebase)
- ❌ Limited control (can't customize infrastructure, can't optimize costs granularly)

### 3.3 CI/CD Pipeline

```
GitLab CI Pipeline (per commit):

┌─────────────────────────────────────────────────────────┐
│ Stage 1: Test                                           │
│ ├─ npm test (unit tests, ~200 tests, <1 min)           │
│ ├─ npm run test:integration (Firebase emulator, ~50)   │
│ └─ npm run test:e2e (Playwright, critical flows)       │
└────────────┬────────────────────────────────────────────┘
             ↓ All tests pass
┌─────────────────────────────────────────────────────────┐
│ Stage 2: Security Scan                                  │
│ ├─ npm audit (dependency vulnerabilities)               │
│ ├─ npm run lint (code quality, security patterns)       │
│ └─ SAST (static analysis security testing)              │
└────────────┬────────────────────────────────────────────┘
             ↓ No critical vulnerabilities
┌─────────────────────────────────────────────────────────┐
│ Stage 3: Build                                          │
│ ├─ npm run build (web app bundle, minify, optimize)    │
│ ├─ npm run build:functions (Cloud Functions bundle)    │
│ └─ Create deployment artifacts (.firebase/*)            │
└────────────┬────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────┐
│ Stage 4: Deploy                                         │
│                                                         │
│  If feature branch → Deploy to Development              │
│  ├─ firebase deploy --only hosting,functions            │
│  ├─ Auto-deploy (no approval)                           │
│  └─ Sentry release tracking                             │
│                                                         │
│  If develop branch → Deploy to Staging                  │
│  ├─ firebase deploy --only hosting,functions            │
│  ├─ Auto-deploy (no approval)                           │
│  └─ Sentry release tracking                             │
│                                                         │
│  If main branch → Deploy to Production (manual)         │
│  ├─ Human approval required (GitLab manual job)         │
│  ├─ firebase deploy --only hosting,functions            │
│  └─ Sentry release tracking                             │
└─────────────────────────────────────────────────────────┘
```

**Branch Strategy**:
- **Feature Branches**: `feature/new-feature` → deploys to development on commit
- **Develop Branch**: `develop` → deploys to staging on merge (auto after MR approval)
- **Main Branch**: `main` → deploys to production after manual approval

**Deployment Safety**:
- **Automated Tests**: All tests must pass before deployment (unit, integration, E2E)
- **Security Scanning**: No critical vulnerabilities allowed (blocks deployment)
- **Staging Validation**: Production deployment requires successful staging deployment
- **Manual Approval**: Human must approve production deployment (prevents accidental deploys)
- **Rollback**: Previous deployment preserved, can rollback in <5 minutes

**Why GitLab CI** (vs alternatives):
- **Integrated**: Source control + CI/CD in single platform (simpler than GitHub + CircleCI)
- **Private Repos**: Free unlimited private repositories (vs GitHub paid)
- **Flexible Pipelines**: YAML-based configuration, manual approval gates
- **Cost**: Free tier supports small team (<$0/month vs CircleCI/TravisCI paid)

### 3.4 Monitoring & Observability

```
Production Monitoring Stack:

┌─────────────────────────────────────────────────────────┐
│ Sentry.io (Error Monitoring)                            │
│ ├─ JavaScript errors (frontend exceptions)              │
│ ├─ Function errors (backend exceptions)                 │
│ ├─ Performance monitoring (slow endpoints)              │
│ ├─ Release tracking (correlate errors with deploys)     │
│ └─ Alerting (Slack notifications on critical errors)    │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ Cloud Monitoring (Infrastructure)                       │
│ ├─ Function invocations (requests/second, latency)      │
│ ├─ Firestore metrics (reads/writes, storage size)       │
│ ├─ Error rates (HTTP 4xx/5xx counts)                    │
│ ├─ Custom metrics (business KPIs: actions/hour, etc)    │
│ └─ Dashboards (real-time monitoring)                    │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ Cloud Logging (Centralized Logs)                        │
│ ├─ Function logs (console.log, errors, warnings)        │
│ ├─ Firestore logs (slow queries, security rule denials) │
│ ├─ Auth logs (login attempts, failures)                 │
│ ├─ Structured logging (JSON format, searchable)         │
│ └─ 30-day retention (SOC2 requirement)                  │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ Alerting (Production Issues)                            │
│ ├─ Error rate spike (>5% error rate → Slack alert)      │
│ ├─ Latency degradation (p95 > 2s → Slack alert)         │
│ ├─ Firestore quota exceeded (→ email alert)             │
│ └─ Failed deployment (→ Slack + email)                  │
└─────────────────────────────────────────────────────────┘
```

**Why Sentry** (vs alternatives):
- **Free Tier**: 5K errors/month free (sufficient for small team)
- **Release Tracking**: Correlate errors with deployments (identify bad releases)
- **Source Maps**: Show original code in stack traces (not minified)
- **Integrations**: Slack, GitLab, issue tracking

**Monitoring Approach**:
- **Development**: Minimal monitoring (Sentry errors only, no alerts)
- **Staging**: Full monitoring (Sentry + Cloud Monitoring, email alerts)
- **Production**: Full monitoring + alerting (Slack alerts on critical issues)

### 3.5 Security & Compliance

**Network Security**:
- **VPC Isolation**: Each environment in separate VPC (no cross-environment traffic)
- **Firewall Rules**: Restrictive ingress/egress (only HTTPS, only Cloud Functions)
- **TLS Everywhere**: All traffic encrypted (Firebase Hosting auto-HTTPS, Functions HTTPS-only)
- **No Public IPs**: Functions/Firestore have no public IPs (VPC-only access)

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

## 4. Implementation Guide

### 4.1 Quick Start: Deploying to New Environment

**Need to create a new environment?** Follow these steps (detailed procedures in [deployment-operations runbook](../runbooks/deployment-operations.md)):

1. **Create GCP Project** via GCP Console
2. **Enable Firebase** on project
3. **Configure GitLab CI** with project credentials
4. **Deploy infrastructure** via `firebase deploy`
5. **Verify deployment** via health checks

See [deployment-operations runbook](../runbooks/deployment-operations.md) for complete step-by-step instructions.

### 4.2 Code Locations

**Infrastructure Configuration**:
- `.firebaserc` - Firebase project mappings (dev/staging/production)
- `firebase.json` - Firebase Hosting, Functions, Firestore configuration
- `.gitlab-ci.yml` - CI/CD pipeline definition
- `firestore.rules` - Firestore security rules
- `firestore.indexes.json` - Firestore index configuration

**Deployment Scripts**:
- `scripts/deploy-dev.sh` - Deploy to development
- `scripts/deploy-staging.sh` - Deploy to staging
- `scripts/deploy-prod.sh` - Deploy to production (requires approval)

**Monitoring Configuration**:
- `sentry.config.js` - Sentry error monitoring configuration
- `monitoring/dashboards/` - Cloud Monitoring dashboard definitions
- `monitoring/alerts/` - Alert policy configurations

**Runbooks** (operational procedures):
- `docs/runbooks/deployment-operations.md` - How to deploy, rollback, manage environments
- `docs/runbooks/incident-response.md` - How to handle production incidents
- `docs/runbooks/disaster-recovery.md` - How to recover from outages

### 4.3 Configuration

**Environment Variables** (per environment):
```bash
# Development
FIREBASE_PROJECT=curb-map-development
SENTRY_DSN=https://dev-sentry-dsn
STRIPE_KEY=sk_test_...

# Staging
FIREBASE_PROJECT=curb-map-staging
SENTRY_DSN=https://staging-sentry-dsn
STRIPE_KEY=sk_test_...

# Production
FIREBASE_PROJECT=curb-map-production
SENTRY_DSN=https://prod-sentry-dsn
STRIPE_KEY=sk_live_...
```

**Secrets** (stored in Google Secret Manager):
- Stripe API keys (test/live mode)
- Sentry DSN (error monitoring)
- Webhook secrets (Stripe signature verification)
- Service account keys (for external integrations)

### 4.4 Testing

**Pre-Deployment Testing**:
- Unit tests (200+ tests, <1 minute)
- Integration tests (Firebase emulator, 50+ tests, ~3 minutes)
- E2E tests (Playwright, critical user flows, ~5 minutes)
- Security scanning (npm audit, SAST)

**Post-Deployment Validation**:
- Health check endpoints (GET /health → 200 OK)
- Smoke tests (critical user flows in staging)
- Sentry release verification (no new errors)
- Monitoring dashboard review (latency, error rate)

**Deployment Testing Strategy**:
```bash
# Test in development (auto-deployed)
npm test
git push origin feature/new-feature

# Validate in staging (auto-deployed from develop)
git checkout develop
git merge feature/new-feature
git push origin develop

# Deploy to production (manual approval)
git checkout main
git merge develop
git push origin main
# → GitLab CI waits for manual approval
# → Human approves in GitLab UI
# → Auto-deploys to production
```

---

## 5. Consequences & Trade-offs

### 5.1 What This Enables

**Zero DevOps Overhead**: Serverless architecture requires no server management, scaling configuration, or infrastructure expertise. Saves $150K/year DevOps engineer cost for 2-3 person team.

**SOC2 Compliance**: Complete environment isolation, automated backups, audit logging satisfy SOC2 requirements without custom infrastructure. Enterprise customers require SOC2 certification for contracts.

**Fast Iteration**: Deploy multiple times per day to dev/staging. Auto-deploy enables rapid feature development without manual deployment steps.

**Auto-Scaling**: Cloud Functions scale from 0 to 1000+ requests/second automatically. No capacity planning, no scaling configuration, handles traffic spikes (municipal events, news coverage).

**Deployment Safety**: Automated testing + manual production approval prevent bad deployments. Staging validation catches regressions before production impact.

**Disaster Recovery**: Automated Firestore backups (30-day retention) enable point-in-time recovery. RTO < 4 hours, RPO < 1 hour satisfy enterprise SLA requirements.

### 5.2 What This Constrains

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
- **Mitigation**: Optimize production costs (materialized views reduce Firestore reads, CDN reduces egress)

**Cold Start Latency**:
- Cloud Functions have ~500ms cold start (first request after idle)
- **When this matters**: User-facing critical path (action submission)
- **Impact**: p99 latency ~1-2 seconds (includes cold start + processing)
- **Mitigation**: Keep functions warm with scheduled requests (costs ~$5/month), users tolerate 1-2s latency for municipal workflows

### 5.3 Future Considerations

**When to Revisit**:
- **Production costs > $500/month**: Consider custom infrastructure (Kubernetes, self-managed database) for cost optimization
- **Team grows > 8 developers**: Consider splitting environments (per-developer dev environments), microservices architecture
- **Multi-region requirement**: Enterprise customers demand global deployment (EU data residency, Asia-Pacific performance)
- **Real-time collaboration**: WebSocket/SSE required for multi-user editing (not supported by Cloud Functions)
- **Regulatory change**: New compliance requirement incompatible with Firebase/GCP (e.g., data sovereignty)

**What Would Trigger Redesign**:
- **Firebase pricing increase > 3x**: Migration to alternative platform becomes cost-effective
- **SOC2 audit failure**: Environment isolation or backup strategy inadequate
- **Performance degradation**: Cold starts exceed 2 seconds, users complain about latency
- **Vendor service degradation**: Firebase reliability drops below 99.9% uptime
- **Team burnout from manual approvals**: Production deployment delay becomes bottleneck (consider automated canary releases)

---

## 6. References

**Related Architecture**:
- [Security](./security.md) - Firestore rules, access control, SOC2 compliance
- [Data Model](./data-model.md) - Collection schemas, backup strategy
- [Event Sourcing](./event-sourcing.md) - Event log for disaster recovery, data portability

**Runbooks** (operational procedures):
- [Deployment Operations](../runbooks/deployment-operations.md) - How to deploy, rollback, manage environments
- [Incident Response](../runbooks/incident-response.md) - How to handle production incidents, escalation procedures
- [Disaster Recovery](../runbooks/disaster-recovery.md) - How to recover from outages, restore from backups
- [Firebase Manual Setup](../runbooks/firebase-manual-setup.md) - How to create new Firebase project, configure services

**Specifications**:
- [F107: Firebase SOC2 Vanilla App](../../specifications/F107-firebase-soc2-vanilla-app/) - Manual setup procedures, environment configuration

**External Documentation**:
- [Firebase Documentation](https://firebase.google.com/docs) - Firestore, Auth, Functions, Hosting
- [GitLab CI/CD](https://docs.gitlab.com/ee/ci/) - Pipeline configuration, manual jobs
- [Sentry Documentation](https://docs.sentry.io/) - Error monitoring, release tracking

**Decisions**:
- [decisions.md](../decisions.md) - Key deployment decisions (three-tier vs two-tier, serverless vs VMs, manual approval vs auto-deploy)

---

## 7. Decision History

This deployment architecture was established based on small team constraints and SOC2 compliance requirements:

**Three-Tier Environments** (vs Two-Tier):
- **Rationale**: Staging provides production-like validation without development noise. Development too volatile for final testing (multiple deploys/day, broken code).
- **Alternative Considered**: Two-tier (dev/production) - simpler, lower cost
- **Why Rejected**: Production-like validation required for SOC2 (can't test in development, can't risk production). Staging catches regressions that unit tests miss.

**Complete Project Isolation** (vs Shared Resources):
- **Rationale**: SOC2 compliance requires complete data isolation (no dev/staging data leakage to production). Separate GCP projects provide strongest isolation boundary.
- **Alternative Considered**: Shared project with namespace isolation (e.g., `/dev-*`, `/staging-*`, `/prod-*` collections)
- **Why Rejected**: Firestore rules can't prevent cross-namespace queries (developer could accidentally query production data). Separate projects eliminate risk.

**Serverless (Cloud Functions)** (vs VMs):
- **Rationale**: Zero DevOps overhead for 2-3 person team. Auto-scaling eliminates capacity planning. Managed services reduce operational complexity.
- **Alternative Considered**: Self-managed VMs (Compute Engine, Kubernetes)
- **Why Rejected**: Requires dedicated DevOps engineer ($150K/year + 20-30 hours/week). Team has no infrastructure expertise. Serverless reduces complexity.

**Manual Production Approval** (vs Auto-Deploy):
- **Rationale**: Human gate prevents accidental production deployment (broken staging deployment doesn't auto-promote). Enterprise SaaS prioritizes safety over speed.
- **Alternative Considered**: Auto-deploy to production (faster, no approval delay)
- **Why Rejected**: Risk of bad deployment outweighs 5-10 minute approval delay. Customer downtime more costly than deployment delay.

**Firebase/GCP** (vs AWS/Azure):
- **Rationale**: Integrated platform (Firestore, Auth, Functions, Hosting in single service). Small team needs simplicity. Free tier supports development/staging.
- **Alternative Considered**: AWS (Lambda, DynamoDB, Cognito, S3) or Azure (Functions, CosmosDB, AD)
- **Why Rejected**: Multi-service complexity (learn 4+ services vs 1 platform). Firebase pricing more predictable ($50-100/month vs AWS unpredictable costs).

**GitLab CI** (vs GitHub Actions):
- **Rationale**: Free private repositories, integrated CI/CD, manual approval gates. Team already uses GitLab.
- **Alternative Considered**: GitHub + CircleCI, GitHub Actions
- **Why Rejected**: GitHub paid for private repos, CircleCI paid tier required for manual approvals. GitLab free tier sufficient.

For complete decision rationale and trade-off analysis, see [decisions.md](../decisions.md).
