# Next Step: Firebase Project Creation Migration

## Goal
Create a real migration that creates a Firebase project, then test rollback. This validates our orchestration system with actual infrastructure operations.

## Specific Implementation

### 1. Create Migration Directory
```
migrations/
  config/
    development.json    # Firebase config for dev environment
  003-create-firebase-project.js  # Migration file
```

### 2. Development Config
Create `migrations/config/development.json`:
```json
{
  "projectId": "curb-map-test-temp",
  "region": "us-central1",
  "billing": false
}
```

### 3. Firebase Migration
Create `migrations/003-create-firebase-project.js` that returns ONE command:

```javascript
import { createShellCommand } from '../src/shell.js'

export default function(environment, config) {
  return [{
    id: 'create-firebase-project',
    description: 'Create and manage Firebase project',
    canRollback: true,
    execute: {
      ...createShellCommand('firebase', ['projects:create', config.projectId], {
        errorPatterns: ['Error:', 'permission', 'denied', 'failed']
      })
    },
    rollback: {
      ...createShellCommand('firebase', ['projects:delete', config.projectId, '--force'], {
        errorPatterns: ['Error:', 'failed']
      })
    }
  }]
}
```

## Implementation Constraints

### What to Build
- **ONE migration file** - don't create multiple migrations  
- **Use centralized shell module** - `createShellCommand` handles all CLI interaction
- **Smart error detection** - check output content, not just exit codes
- **Complete output capture** - all stdout/stderr logged for debugging
- **Real rollback test** - actually delete the project after creation

### What NOT to Build  
- ❌ Complex project templates or configurations
- ❌ Multiple environment support (just development for now)
- ❌ Database or Firestore setup (just project creation)
- ❌ Authentication setup
- ❌ Any additional Firebase services

### Testing Approach
```bash
# Test the migration system
cd migrations-directory/
orchestrate development execute 001           # dry-run first
orchestrate development execute 001 --apply  # create project  
orchestrate development rollback 001 --apply # delete project
```

## Success Criteria
- [ ] Migration creates real Firebase project
- [ ] Rollback successfully deletes the project
- [ ] Console audit logging shows complete operation trail
- [ ] Error handling works (project already exists, auth failures, etc.)
- [ ] CLI shows clear feedback during operations

## Risk Management
- **Use temporary project name** (like `curb-map-test-temp-YYYYMMDD`)
- **Test in personal Firebase account first** (not production account)
- **Include timeout handling** for slow Firebase operations

This task validates our orchestration system works with real infrastructure while staying focused on the core functionality.
