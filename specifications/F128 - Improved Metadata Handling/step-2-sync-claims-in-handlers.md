# Step 2: Sync Claims in Handlers

## Update membership handlers

- `handle-member-added.js`: Call `await syncUserAuthClaims(userId)` after adding member to organization
- `handle-member-removed.js`: Call `await syncUserAuthClaims(userId)` after removing member from organization
- `handle-role-changed.js`: Call `await syncUserAuthClaims(userId)` after changing user's role
- `handle-user-forgotten.js`: Call `await admin.auth().setCustomUserClaims(userId, {})` to clear all claims
