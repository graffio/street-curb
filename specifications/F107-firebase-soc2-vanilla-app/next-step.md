# Next Step: Firebase Project Creation (002)

## What We're Building
Migration `002-create-firebase-project.js` using the enhanced orchestration core to create Firebase projects with proper ID management.

## Context: Clean Break at 002
**Decision**: Skip retrofitting 000/001 migrations and start the new config-as-output system at 002.
- **000/001**: Legacy multi-environment folder creation (already complete)
- **002+**: New single-environment approach with config-as-output
- **Folder IDs**: Use existing hardcoded values from `organization.js`

## Implementation Requirements

### Firebase Project Migration
- Creates GCP project with Firebase enabled in the appropriate folder
- Returns `capturedIds` with the generated Firebase project ID
- Updates config file automatically via enhanced orchestration
- Includes corresponding test file for automatic verification

### Expected Files
```
modules/curb-map/migrations/002-create-firebase-project.js
modules/curb-map/migrations/002-create-firebase-project.tap.js  # Already written (TDD)
modules/curb-map/shared/configs/dev.2025-09-11-143022.config.js
```

### Migration Structure
```javascript
// 002-create-firebase-project.js
export default async function(config) {
    return [{
        id: 'create-gcp-project',
        description: `Create GCP project ${config.firebaseProject.projectId}`,
        canRollback: true,
        execute: async () => {
            const result = await createShellCommand(
                `gcloud projects create ${config.firebaseProject.projectId} --name="${config.firebaseProject.displayName}" --folder=${config.developmentFolderId}`
            )()
            
            // Migration captures the project ID it just created
            return {
                ...result,
                capturedIds: { firebaseProjectId: config.firebaseProject.projectId }
            }
        },
        rollback: createShellCommand(`gcloud projects delete ${config.firebaseProject.projectId} --quiet`)
    }, {
        id: 'add-firebase-to-project', 
        description: 'Add Firebase to GCP project',
        canRollback: false,
        execute: createShellCommand(`firebase projects:addfirebase ${config.firebaseProject.projectId}`),
        rollback: createShellCommand(`echo "Cannot rollback Firebase addition"`)
    }]
}
```

### Config File Structure
```javascript
// dev.2025-09-11-143022.config.js (timestamped)
export default {
    organizationId: '404973578720',
    developmentFolderId: '464059598701',  // From existing organization.js
    firebaseProject: {
        projectId: 'graffio-dev-2025-09-11-143022',  // Timestamped for uniqueness
        displayName: 'Graffio Development'
    }
    // After migration runs, firebaseProjectId: 'graffio-dev-2025-09-11-143022' gets added
}
```

## Acceptance Tests

### Given/When/Then
**Given** I have a timestamped config file for the dev environment  
**When** I run `orchestrate dev.2025-09-11-143022.config.js 002-create-firebase-project.js --apply`  
**Then**:
- [ ] GCP project is created in Development folder  
- [ ] Firebase is added to the project
- [ ] Config file is updated with `firebaseProjectId`
- [ ] Test file runs automatically and passes
- [ ] Can run migration again safely (idempotent)

### Test Requirements (Already Implemented)
**Tests written in TDD style** in `002-create-firebase-project.tap.js`:
- ✅ Verify project doesn't exist before migration
- ✅ Verify dry-run doesn't create project
- ✅ Verify project creation with correct folder and Firebase integration
- ✅ Verify config file gets updated with captured project ID
- ✅ Verify idempotency (can run migration twice safely)
- ✅ Verify rollback deletes the project
- ✅ Uses timestamped project IDs for test isolation

## Success Criteria
- [ ] Migration creates Firebase project successfully
- [ ] Config file gets updated with project ID automatically
- [ ] Tests run automatically and verify infrastructure state  
- [ ] Ready for subsequent migrations (003+) to use captured project ID
- [ ] Can run on fresh environments using timestamped configs

**Next**: Once 002 works with config-as-output, implement 003 for Firestore setup that reads the captured Firebase project ID.
