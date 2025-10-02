# F109 - Authentication System

**Implement passcode-only authentication with organization roles for CurbMap**

## Overview

This specification implements the authentication architecture defined in `docs/architecture/authentication.md`. The system uses phone number + SMS passcode authentication with organization-scoped custom claims to provide secure, field-worker-friendly authentication with support capabilities.

    Phone Number → SMS Passcode → Firebase Auth → Custom Claims → API Access

## References

- `docs/architecture/authentication.md` — canonical Firebase Auth patterns, custom claims structure, impersonation system
- `docs/architecture/security.md` — authorization patterns, audit logging requirements
- `docs/architecture/multi-tenant.md` — organization scoping and role hierarchy

## Implementation Phases

### Phase 1: Firebase Auth Configuration

- **task_1_1_auth_config_setup**: Configure Firebase Auth for passcode-only authentication
- **task_1_2_passcode_delivery**: Implement SMS passcode delivery system
- **task_1_3_passcode_verification**: Implement passcode verification and token generation

### Phase 2: Organization Roles

- **task_2_1_custom_claims**: Implement organization-scoped custom claims system
- **task_2_2_user_management**: Create user management API endpoints

### Phase 3: Impersonation Feature

- **task_3_1_impersonation_api**: Implement secure impersonation system
- **task_3_2_impersonation_middleware**: Create impersonation middleware for API requests

### Phase 4: Security Middleware

- **task_4_1_auth_middleware**: Implement authentication middleware
- **task_4_2_authz_middleware**: Implement authorization middleware

### Phase 5: Testing and Validation

- **task_5_1_integration_testing**: Validate end-to-end authentication workflow
- **task_5_2_operational_safeguards**: Implement monitoring and alerting for authentication system
