# Step 4: Integration Tests

## Create integration test file

- New file: `modules/curb-map/test/integration/tenant-security.tap.js`
- Test: User cannot submit action for organization they're not a member of (expect 403)
- Test: User cannot submit action for project not in their organization (expect 403)
- Test: Auth claims are synced when member is added (verify custom claims contain new org)
- Test: Auth claims are synced when member is removed (verify custom claims no longer contain org)
