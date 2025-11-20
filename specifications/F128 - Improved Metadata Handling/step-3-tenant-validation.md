# Step 3: Tenant Validation

## Validate tenant access in submit-action-request.js

- Extract `organizations` object from `decodedToken` (custom claims)
- Create `validateTenantAccess(req, decodedToken)` function
- Validate `req.body.organizationId` exists as key in `decodedToken.organizations` (return 403 if not)
- Validate `req.body.projectId` exists in org's `projects` array (return 403 if not)
- Special case: If `decodedToken.organizations` is empty and action is `AuthenticationCompleted`, allow request
