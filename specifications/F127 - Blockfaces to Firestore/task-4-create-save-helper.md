# Task 4: Create Save Helper Function

- Create `saveBlockfaceToFirestore(blockfaceId)` helper in post.js
- Fetch current blockface from Redux state using `S.currentBlockface`
- Fetch previous blockface from Firestore (path: `organizations/${blockface.organizationId}/projects/${blockface.projectId}/blockfaces/${blockface.id}`)
- Call `diffBlockfaces()` to generate changes object
- Dispatch `Action.BlockfaceSaved(blockface, changes)` via `post()`
