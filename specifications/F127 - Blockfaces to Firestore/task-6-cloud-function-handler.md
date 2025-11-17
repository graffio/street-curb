# Task 6: Create Cloud Function Handler

- Create `functions/src/handlers/handle-save-blockface.js`
- Extract blockface from action (contains organizationId, projectId)
- Build Firestore path: `organizations/${blockface.organizationId}/projects/${blockface.projectId}/blockfaces/${blockface.id}`
- Save blockface using `Blockface.toFirestore()` serialization
- Log changes object to Cloud Functions logs for audit trail
