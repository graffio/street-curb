# Task 7: Update Firestore Rules

- Open `modules/curb-map/firestore.rules`
- Add rule for `organizations/{orgId}/projects/{projectId}/blockfaces/{blockfaceId}`
- Allow read if `request.auth != null && request.auth.token.organizationId == orgId`
- Disallow write (Cloud Functions only): `allow write: if false`
