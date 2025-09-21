# Migration Testing Strategy

**Single Temporary Environment Incremental Testing for Infrastructure Migrations**

## Overview

To ensure migration reliability before touching real environments, we use a single temporary environment for incremental testing, then validate the complete sequence on a fresh environment.

## Core Strategy

### 1. Incremental Migration Testing
**After each new migration is written:**
- Use existing temporary environment OR create new one if none exists
- Apply the new migration to the existing temporary environment
- TAP tests run automatically via orchestration CLI
- Verify migration idempotency by running it again
- Keep environment for next migration

### 2. Complete Sequence Validation
**After confirming new migration works incrementally:**
- Create fresh temporary environment
- Run ALL migrations from 002 onwards in sequence
- Each migration's TAP tests must pass automatically
- Clean up the older temporary environment
- Keep the new one for future incremental testing

**Why this approach?** Faster iteration on individual migrations while still catching integration issues before real deployments.

## Environment Naming Convention

**Temporary environments use the development GCP folder with timestamped names:**

```bash
# All temporary environments follow this pattern:
temporary-YYYYMMDD-HHMMSS           # e.g., temporary-20250915-143022
```

**Protection Mechanisms**:
- All temporary environments in development folder (cost control)
- Clear naming prevents confusion with real environments
- Timestamps ensure uniqueness and enable cleanup by age
- Firebase project deletion has 30-day name lockout (use timestamps for uniqueness)
- Scripts include confirmation prompts for destructive operations

## Bash Scripts for Common Workflows

**All scripts run from `modules/curb-map/` directory.** The orchestration CLI automatically runs TAP tests after successful migrations.

### `bash/create-temporary-config.sh` - Create Temporary Environment Config

```bash
#!/bin/bash
# Create a new temporary environment config file
# Usage: bash/create-temporary-config.sh [timestamp]
# Run from modules/curb-map directory

set -e

TIMESTAMP="${1:-$(date +%Y%m%d-%H%M%S)}"
CONFIG_FILE="shared/config/temporary-$TIMESTAMP.config.js"

if [ -f "$CONFIG_FILE" ]; then
    echo "❌ Config file already exists: $CONFIG_FILE"
    exit 1
fi

echo "Creating temporary environment config: $CONFIG_FILE"
cp shared/config/dev.config.js "$CONFIG_FILE"
sed -i '' "s/curb-map-development/temporary-$TIMESTAMP/g" "$CONFIG_FILE"

echo "✅ Created temporary environment config: $CONFIG_FILE"
echo "   Project ID: temporary-$TIMESTAMP"
echo ""
echo "Next steps:"
echo "   bash/test-migration.sh $CONFIG_FILE migrations/002-create-firebase-project.js"
```

### `bash/test-migration.sh` - Test Single Migration

```bash
#!/bin/bash
# Test a migration with a specific config file
# Usage: bash/test-migration.sh <config-file> <migration-file>
# Run from modules/curb-map directory

set -e

CONFIG_FILE="$1"
MIGRATION_FILE="$2"

if [ -z "$CONFIG_FILE" ] || [ -z "$MIGRATION_FILE" ]; then
    echo "Usage: $0 <config-file> <migration-file>"
    echo "Example: $0 shared/config/temporary-20250915-143022.config.js migrations/002-create-firebase-project.js"
    exit 1
fi

echo "Running migration: $MIGRATION_FILE"
echo "Using config: $CONFIG_FILE"

# Run the migration
node ../orchestration/src/cli.js "$CONFIG_FILE" "$MIGRATION_FILE" --apply

echo "Testing idempotency (running migration again)..."
node ../orchestration/src/cli.js "$CONFIG_FILE" "$MIGRATION_FILE" --apply

echo "✅ Migration test completed successfully"
```

### `bash/validate-full-sequence.sh` - Complete Sequence Validation

```bash
#!/bin/bash
# Validate complete migration sequence on fresh temporary environment
# Usage: bash/validate-full-sequence.sh
# Run from modules/curb-map directory

set -e

# Create fresh temporary environment
echo "Creating fresh temporary environment..."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
bash/create-temporary-config.sh "$TIMESTAMP"

NEW_CONFIG="shared/config/temporary-$TIMESTAMP.config.js"

echo "Running complete migration sequence..."
# Run all migrations in sequence
for migration in migrations/00*.js; do
    echo "Running $migration..."
    node ../orchestration/src/cli.js "$NEW_CONFIG" "$migration" --apply
done

# Clean up old temporary configs (keep the new one)
OLD_CONFIGS=$(ls shared/config/temporary-*.config.js 2>/dev/null | grep -v "$NEW_CONFIG" || true)
if [ -n "$OLD_CONFIGS" ]; then
    echo "Cleaning up old temporary configs:"
    echo "$OLD_CONFIGS"
    read -p "Delete old temporary configs? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "$OLD_CONFIGS" | xargs rm
        echo "✅ Old configs cleaned up"
    fi
fi

echo "✅ Full sequence validation completed successfully"
echo "New temporary environment ready for incremental testing: $NEW_CONFIG"
```

### `bash/cleanup-temporary-environments.sh` - Safe Environment Cleanup

```bash
#!/bin/bash
# Safely clean up temporary environments with protection mechanisms
# Usage: bash/cleanup-temporary-environments.sh [--older-than-days N]
# Run from modules/curb-map directory

set -e

DAYS_OLD="${2:-1}"  # Default to 1 day old

echo "Finding temporary projects older than $DAYS_OLD days..."

# List temporary projects with safety checks
TEMP_PROJECTS=$(gcloud projects list \
    --filter="projectId:temporary-* AND createTime<$(date -v-${DAYS_OLD}d '+%Y-%m-%d')" \
    --format="value(projectId)" || true)

# Also clean up local config files for deleted projects
echo "Checking for corresponding local config files..."
for project in $TEMP_PROJECTS; do
    config_file="shared/config/${project}.config.js"
    if [ -f "$config_file" ]; then
        echo "  Found: $config_file"
    fi
done

# Safety confirmation required: Type 'DELETE' to confirm
read -p "Type 'DELETE' to confirm permanent deletion: " -r
if [ "$REPLY" != "DELETE" ]; then
    echo "Cleanup cancelled"
    exit 0
fi

echo "✅ Cleanup completed"
```

## TAP Test Integration

### Migration Test Requirements
Each migration MUST include a corresponding `.tap.js` file following Given/When/Then format:

```javascript
// Example: 002-create-firebase-project.tap.js
import test from 'tap'

const configPath = process.argv[2]
if (!configPath) {
    console.error('Usage: node 002-create-firebase-project.tap.js <config-file>')
    process.exit(1)
}

test('Given a Firebase project migration has completed', t => {
    t.test('When the GCP project should exist', async t => {
        const config = await import(configPath)
        const projectExists = await checkProjectExists(config.default.firebaseProject.projectId)
        t.ok(projectExists, 'Then the GCP project exists in Google Cloud')
        t.end()
    })

    t.test('When checking Firebase integration', async t => {
        const config = await import(configPath)
        const firebaseEnabled = await checkFirebaseEnabled(config.default.firebaseProject.projectId)
        t.ok(firebaseEnabled, 'Then Firebase is enabled on the project')
        t.end()
    })

    t.test('When verifying project organization', async t => {
        const config = await import(configPath)
        const inCorrectFolder = await checkProjectFolder(
            config.default.firebaseProject.projectId,
            config.default.developmentFolderId
        )
        t.ok(inCorrectFolder, 'Then the project is in the development folder')
        t.end()
    })

    t.end()
})
```

### Automatic Test Execution
The orchestration CLI automatically runs TAP tests after successful migration execution:

```javascript
// From orchestration/src/cli.js
await runPostMigrationTapTests(migrationName, tapPath, configPath)
```

## Environment Cleanup

### `bash/cleanup-temporary-environments.sh` - Safe Cleanup Script

```bash
#!/bin/bash
# Safely clean up temporary environments with protection mechanisms
# Usage: bash/cleanup-temporary-environments.sh [--older-than-days N]

set -e

DAYS_OLD="${2:-1}"  # Default to 1 day old
FILTER_DATE="$(date -v-${DAYS_OLD}d '+%Y-%m-%d')"

if [ "$1" = "--older-than-days" ] && [ -n "$2" ]; then
    DAYS_OLD="$2"
    FILTER_DATE="$(date -v-${DAYS_OLD}d '+%Y-%m-%d')"
fi

echo "Finding temporary projects older than $DAYS_OLD days (before $FILTER_DATE)..."

# List temporary projects with safety checks
TEMP_PROJECTS=$(gcloud projects list \
    --filter="projectId:temporary-* AND createTime<$FILTER_DATE" \
    --format="value(projectId)" || true)

if [ -z "$TEMP_PROJECTS" ]; then
    echo "No temporary projects found older than $DAYS_OLD days"
    exit 0
fi

echo "Found temporary projects to clean up:"
echo "$TEMP_PROJECTS"

# Safety confirmation
echo
echo "⚠️  This will PERMANENTLY DELETE these projects and all their data!"
echo "⚠️  Make sure none of these are environments you're still using!"
echo
read -p "Are you sure you want to delete these projects? Type 'DELETE' to confirm: " -r

if [ "$REPLY" != "DELETE" ]; then
    echo "Cleanup cancelled"
    exit 0
fi

# Delete projects
echo "$TEMP_PROJECTS" | while read -r project; do
    echo "Deleting project: $project"
    gcloud projects delete "$project" --quiet
done

echo "✅ Cleanup completed"
```

### Automatic Cleanup Strategy
- **Successful validation**: Old temporary configs deleted after confirmation
- **Failed tests**: Temporary environment preserved for debugging
- **Config cleanup**: Handled by validation script with user confirmation
- **Project cleanup**: Use safe cleanup script with age filters

## Failure Handling

### Individual Migration Failure
1. **Debug**: Temporary environment preserved for investigation
2. **Fix**: Update migration code or dependencies
3. **Retry**: Test fixed migration on fresh temporary environment
4. **Clean**: Remove failed temporary environment after debugging

### Sequential Migration Failure
1. **Identify**: Which migration in sequence failed
2. **Isolate**: Test that specific migration individually
3. **Root Cause**: Check for dependency issues between migrations
4. **Fix**: Update migration or add missing dependencies
5. **Revalidate**: Run full sequence again

### Common Issues & Solutions

**GCP API Not Enabled**:
```javascript
// Add to migration dependencies
await enableGCPAPI('firebase.googleapis.com')
await enableGCPAPI('cloudresourcemanager.googleapis.com')
```

**Resource Not Ready**:
```javascript
// Add timing buffers
await new Promise(resolve => setTimeout(resolve, 30000)) // 30 second wait
```

**Permission Issues**:
```javascript
// Verify service account permissions in migration
await verifyPermissions(['roles/firebase.admin', 'roles/resourcemanager.projectCreator'])
```

## Actionable Success Criteria

### Individual Migration Validation
```bash
# All commands run from modules/curb-map directory
cd modules/curb-map

# Step 1: Create temporary environment
bash/create-temporary-config.sh

# Step 2: Test migration
bash/test-migration.sh shared/config/temporary-YYYYMMDD-HHMMSS.config.js migrations/003-new-migration.js

# Verify these specific outcomes:
# 1. Migration completed without shell command failures
echo "✅ Migration executed successfully"

# 2. TAP tests passed (orchestration CLI runs them automatically)
echo "✅ TAP tests passed - infrastructure state verified"

# 3. Idempotency verified (script runs migration twice)
echo "✅ Migration is idempotent - safe to re-run"

# 4. Config file updated with captured IDs
grep "capturedId" shared/config/temporary-*.config.js
echo "✅ Config file updated with new infrastructure IDs"
```

### Complete Sequence Validation
```bash
# Run from modules/curb-map directory
cd modules/curb-map
bash/validate-full-sequence.sh

# Verify these specific outcomes:
# 1. All migrations completed in order
ls migrations/00*.js | wc -l  # Count of migrations
echo "✅ All N migrations completed successfully"

# 2. Final config contains all captured IDs from sequence
cat shared/config/temporary-$(date +%Y%m%d)-*.config.js
echo "✅ Config contains complete set of infrastructure IDs"

# 3. Infrastructure matches architecture expectations
# (Specific checks defined in each migration's TAP tests)
echo "✅ Infrastructure state verified by TAP tests"
```

### Real Environment Deployment Readiness
```bash
# Run from modules/curb-map directory
cd modules/curb-map

# 1. Full sequence validated on temporary environment
bash/validate-full-sequence.sh
echo "✅ Complete migration sequence validated"

# 2. Real environment config prepared
cp shared/config/dev.config.js shared/config/dev-backup.config.js
echo "✅ Real environment config backed up"

# 3. Ready to deploy to development environment
node ../orchestration/src/cli.js shared/config/dev.config.js migrations/002-create-firebase-project.js --apply
echo "✅ Ready for real environment deployment"
```

## Real Environment Strategy

### Development Environment Deployment
```bash
# After temporary environment validation succeeds:
cd modules/curb-map

# Run full sequence on real development environment
for migration in migrations/00*.js; do
    echo "Deploying $migration to development..."
    node ../orchestration/src/cli.js shared/config/dev.config.js "$migration" --apply
done

echo "✅ Development environment ready"
```

### Future Environment Strategy

**Until common baseline established:**
- Run complete sequence from migration 002 on every new environment
- Validate each environment with full TAP test suite

**After development/test/staging/production reach common point:**
- Only run new migrations incrementally on existing environments
- Use temporary environments to validate new migration sequences

### SOC2 Compliance
- **Development/Staging**: Use temporary environment validation strategy
- **Production**: All changes must go through temporary → development → staging → production
- **Audit Trail**: Orchestration CLI provides complete audit logging automatically

## Cost Management

### Temporary Environment Economics
- **Lifespan**: Minutes to hours per test cycle
- **Resources**: Empty Firebase projects (minimal cost)
- **Cleanup**: Automated scripts prevent cost accumulation
- **GCP Folder**: All temporary projects in development folder

### Protection Mechanisms
- Age-based cleanup scripts with safety confirmations
- Timestamped naming prevents real environment confusion
- Explicit "DELETE" confirmation required for bulk cleanup
- Failed environments preserved for debugging

This strategy ensures migration reliability with fast iteration cycles and strict cost control.
