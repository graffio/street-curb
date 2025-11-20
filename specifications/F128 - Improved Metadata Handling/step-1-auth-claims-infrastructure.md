# Step 1: Auth Claims Infrastructure

## Create auth-context.js module

- New file: `modules/curb-map/functions/src/auth-context.js`
- Export `syncUserAuthClaims(userId)` function
- Query all organizations where user is a member
- Build claims object: `{ organizations: { 'org_id': { role: 'admin', projects: ['prj_1', 'prj_2'] } } }`
- Call `admin.auth().setCustomUserClaims(userId, claims)`
