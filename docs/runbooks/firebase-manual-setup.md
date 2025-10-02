# Firebase Manual Setup Runbook

## Purpose
Admin checklist for provisioning a new Firebase project/environment used by CurbMap before scripted migrations take over.

## Prerequisites
- Organization-level access in Google Cloud with permissions to create projects, enable APIs, and manage IAM
- Local workstation authenticated with `gcloud auth login`

## Steps
1. **Create project** via Firebase console (Development/Staging/Production naming conventions in roadmap) and link to Google Cloud project
2. **Enable APIs** required for CurbMap (Firestore, Firebase Auth, Cloud Functions, Identity Toolkit, App Hosting, Billing APIs)
3. **Create service accounts**
   - `bootstrap-migrator` with Firebase Admin + Cloud Functions deploy
   - `firebase-infrastructure-sa` for day-to-day impersonation flows
4. **Grant impersonation permissions** to approved developers (per SOC2 policy) using IAM bindings
5. **Initialize Firebase Auth configuration** manually (passcode-only auth toggles until migration 003 completes)
6. **Configure authorized domains** for web app access (`localhost`, `127.0.0.1`, `<projectId>.firebaseapp.com`)
7. **Set billing account** and labels for usage tracking
8. **Record project metadata** in `modules/curb-map/migrations/config/*.config.js` (generated via `bash/create-temporary-config.sh` for temporary envs)
9. **Capture manual steps** in change log per SOC2 controls and notify engineering before running migrations

## References
- Specifications F108–F112 for scripted follow-up work
- `docs/architecture/billing-integration.md` for billing dependencies
- SOC2 process documents for approval matrices
