# Phase 1: Infrastructure Safety Architecture

**Goal**: Implement production-safe infrastructure management with plan/apply workflow and environment versioning

## Environment Strategy

### Four Base Environments
- `curb-map-iac-test` - Test infrastructure changes safely
- `curb-map-development` - Application development
- `curb-map-staging` - Production-like testing  
- `curb-map-production` - Live customer system

### A/B Versioning (Phase 1a)
Each environment supports versioned pairs:
- `curb-map-development-47a`, `curb-map-development-47b`
- Enables rollback from failed non-rollbackable migrations
- Only production persists permanently

## Plan/Apply Workflow

### Core Interface
```javascript
// Generate execution plan
const plan = await generatePlan(operation, config)

// Show plan to user
await showPlan(plan)

// Execute after confirmation  
const result = await executePlan(plan)
```

### Plan Structure
```javascript
{
  id: 'plan-abc123',
  operation: 'create-environment',
  steps: [
    {
      action: 'create-project',
      command: 'firebase projects:create curb-map-iac-test',
      rollback: 'firebase projects:delete curb-map-iac-test',
      canRollback: true
    }
  ],
  expiresAt: timestamp,
  stateHash: 'current-infrastructure-hash'
}
```

### Execution Engine
- Execute steps sequentially
- On failure: automatically attempt rollback of completed steps
- Log all operations for SOC2 audit trail
- Plans expire after 15 minutes to prevent stale execution

## Safety Guard Framework

### Test Context Protection
```javascript
// Block protected environments during tests
if (isTestContext() && isProtectedEnvironment(projectId)) {
  throw new Error('Cannot modify protected environment during tests')
}
```

### Interactive Confirmation
```javascript
// Require typed confirmation for destructive operations
console.log('Type "DELETE curb-map-production" to proceed:')
const answer = await getUserInput()
if (answer !== expectedText) {
  throw new Error('Operation cancelled')
}
```

### Environment Classification
- **Test Context**: Only allow `test-*`, `temp-*`, `throwaway-*` prefixes
- **Protected Environments**: `production`, `staging` require extra confirmation
- **Development**: Ephemeral, can be recreated from canonical state

## Required Interfaces

### Plan Generation
```javascript
/**
 * Generate execution plan for infrastructure operation
 * @sig generatePlan :: (String, Object) -> Promise<Plan>
 */
const generatePlan = async (operation, config) => {
  // Analyze current state
  // Generate step-by-step commands
  // Include rollback actions
  // Return structured plan
}
```

### Plan Execution  
```javascript
/**
 * Execute infrastructure plan with automatic rollback
 * @sig executePlan :: (Plan) -> Promise<ExecutionResult>
 */
const executePlan = async (plan) => {
  // Validate plan not expired
  // Execute steps sequentially
  // On failure: rollback completed steps
  // Return execution summary
}
```

### State Analysis
```javascript
/**
 * Analyze current infrastructure state
 * @sig analyzeCurrentState :: (String) -> Promise<StateSnapshot>
 */
const analyzeCurrentState = async (environment) => {
  // Check existing projects
  // Verify API states
  // Return structured state
}
```

## SOC2 Audit Requirements

### Audit Log Structure
```javascript
{
  timestamp: '2025-01-15T10:30:00Z',
  operator: 'alice@company.com',
  operation: 'create-environment', 
  environment: 'production',
  planId: 'plan-abc123',
  result: 'success',
  duration: '3m45s',
  commandsExecuted: ['firebase projects:create...'],
  rollbackAvailable: true
}
```

### Audit Trail Storage
- Permanent storage separate from operational files
- 7-year retention for SOC2 compliance
- No sensitive data in git repository

## Success Criteria (Concrete Tests)

### Phase 1 Tests
```javascript
tap.test('Given plan/apply system', async (t) => {
  t.test('When generating plan for new environment', async (t) => {
    const plan = await generatePlan('create-environment', config)
    t.ok(plan.steps.length > 0, 'Then plan should contain executable steps')
    t.ok(plan.expiresAt > Date.now(), 'Then plan should have expiration time')
  })
  
  t.test('When executing valid plan', async (t) => {
    const result = await executePlan(validPlan)
    t.equal(result.status, 'success', 'Then execution should succeed')
    t.ok(result.auditLog, 'Then audit log should be generated')
  })
})
```

### Safety Tests
```javascript
tap.test('Given test context safety guards', async (t) => {
  t.test('When attempting to modify production in tests', async (t) => {
    try {
      await generatePlan('delete-environment', { environment: 'production' })
      t.fail('Then operation should be blocked')
    } catch (error) {
      t.ok(error.message.includes('test safety'), 'Then safety error should be thrown')
    }
  })
})
```

### Rollback Tests
```javascript
tap.test('Given plan execution failure', async (t) => {
  t.test('When step fails mid-execution', async (t) => {
    const result = await executePlan(planThatFailsAtStep3)
    t.equal(result.status, 'failed', 'Then execution should report failure')
    t.equal(result.rollbackAttempted, true, 'Then rollback should be attempted')
  })
})
```

## Implementation Priority

### Phase 1: Core Plan/Apply (Immediate)
- Implement plan generation and execution
- Add safety guards for test contexts
- Create SOC2 audit logging
- **Success**: Can safely create/delete environments through plan/apply

### Phase 1a: Environment Versioning (Before First Migration)
- Add A/B environment pairs
- Implement version rotation
- Add migration rollback capabilities  
- **Success**: Can recover from failed non-rollbackable migrations

## Phase 1a: Environment Versioning Architecture

### Version State Management

#### Version Registry
```javascript
// Stored in git repository as canonical source
// environmentVersions.json
{
  "iac-test": { "current": 47, "available": ["47a", "47b"] },
  "development": { "current": 47, "available": ["47a", "47b"] },
  "staging": { "current": 47, "available": ["47a", "47b"] },
  "production": { "current": 47, "available": ["47a"] }
}
```

#### State Analysis Interface
```javascript
/**
 * Get current version state for all environments
 * @sig getVersionState :: () -> Promise<VersionRegistry>
 */
const getVersionState = async () => {
  const registry = await loadVersionRegistry()
  const actualProjects = await listExistingProjects()
  return reconcileVersionState(registry, actualProjects)
}
```

### A/B Rotation Workflows

#### Migration Process
```javascript
/**
 * Execute migration across all environments
 * @sig executeMigration :: (Number, Number) -> Promise<MigrationResult>
 */
const executeMigration = async (fromVersion, toVersion) => {
  // 1. Test migration on iac-test
  await rotatePair('iac-test', fromVersion, toVersion)
  
  // 2. If successful, migrate development
  await rotatePair('development', fromVersion, toVersion)
  
  // 3. If successful, migrate staging
  await rotatePair('staging', fromVersion, toVersion)
  
  // 4. Production migration requires separate approval
  // (Manual process with additional safety checks)
}

/**
 * Rotate A/B pair for single environment
 * @sig rotatePair :: (String, Number, Number) -> Promise<RotationResult>
 */
const rotatePair = async (environment, fromVersion, toVersion) => {
  // Example: development-47a -> development-48a
  // Keep development-47b as rollback
  
  const sourceProject = `curb-map-${environment}-${fromVersion}a`
  const targetProject = `curb-map-${environment}-${toVersion}a`
  
  // 1. Create new version by migrating from current 'a' version
  const migrationPlan = await generateMigrationPlan(sourceProject, targetProject)
  const result = await executePlan(migrationPlan)
  
  if (result.status === 'success') {
    // 2. Update version registry
    await updateVersionRegistry(environment, toVersion, ['47b', '48a'])
    return { status: 'success', rollbackAvailable: `${environment}-${fromVersion}b` }
  } else {
    // 3. Migration failed - cleanup and report
    await cleanupFailedMigration(targetProject)
    return { status: 'failed', rollbackAvailable: `${environment}-${fromVersion}b` }
  }
}
```

### Migration Failure Recovery

#### Recovery Scenarios
```javascript
/**
 * Recover from failed migration
 * @sig recoverFromFailedMigration :: (String, Number, Number) -> Promise<RecoveryResult>
 */
const recoverFromFailedMigration = async (environment, fromVersion, toVersion) => {
  // Scenario 1: Migration failed on 47a, 47b still exists
  if (await projectExists(`curb-map-${environment}-${fromVersion}b`)) {
    // Create 47c from 47b for retry
    await createRetryVersion(environment, fromVersion, 'c')
    return { strategy: 'retry-from-backup', retryVersion: `${fromVersion}c` }
  }
  
  // Scenario 2: Need to recreate from earlier version
  const earlierVersion = fromVersion - 1
  if (await projectExists(`curb-map-${environment}-${earlierVersion}a`)) {
    // Recreate 47c by migrating from 46a -> 47c
    await recreateFromEarlierVersion(environment, earlierVersion, fromVersion, 'c')
    return { strategy: 'recreate-from-earlier', sourceVersion: earlierVersion }
  }
  
  // Scenario 3: Nuclear option - rebuild from canonical state
  await rebuildFromCanonicalState(environment, fromVersion)
  return { strategy: 'rebuild-from-scratch' }
}

/**
 * Create retry version from backup
 * @sig createRetryVersion :: (String, Number, String) -> Promise<String>
 */
const createRetryVersion = async (environment, version, letter) => {
  const source = `curb-map-${environment}-${version}b`
  const target = `curb-map-${environment}-${version}${letter}`
  
  // Clone existing environment (expensive but reliable)
  const clonePlan = await generateClonePlan(source, target)
  await executePlan(clonePlan)
  
  return target
}
```

### Cleanup Automation

#### Cleanup Strategy
```javascript
/**
 * Clean up old environment versions
 * @sig cleanupOldVersions :: (Number) -> Promise<CleanupResult>
 */
const cleanupOldVersions = async (retainGenerations = 3) => {
  const versionState = await getVersionState()
  const cleanupPlan = []
  
  for (const [env, state] of Object.entries(versionState)) {
    if (env === 'production') continue // Never auto-cleanup production
    
    const currentVersion = state.current
    const versionsToKeep = [
      currentVersion - 2, // Two versions back
      currentVersion - 1, // One version back  
      currentVersion      // Current version
    ]
    
    // Find versions to delete
    const allVersions = await listEnvironmentVersions(env)
    const versionsToDelete = allVersions.filter(v => !versionsToKeep.includes(v.version))
    
    for (const version of versionsToDelete) {
      cleanupPlan.push({
        action: 'delete-environment-version',
        projectId: version.projectId,
        environment: env,
        version: version.version
      })
    }
  }
  
  // Execute cleanup plan
  return await executePlan({ steps: cleanupPlan })
}
```

### Multi-Environment Coordination

#### Coordinated Migration Interface
```javascript
/**
 * Coordinate migration across all environments
 * @sig coordinatedMigration :: (Number, Number, Object) -> Promise<CoordinationResult>
 */
const coordinatedMigration = async (fromVersion, toVersion, options = {}) => {
  const results = {}
  
  // Phase 1: IaC Test (always first)
  results.iacTest = await rotatePair('iac-test', fromVersion, toVersion)
  if (results.iacTest.status !== 'success') {
    return { status: 'failed', failedAt: 'iac-test', results }
  }
  
  // Phase 2: Development (if iac-test succeeded)
  results.development = await rotatePair('development', fromVersion, toVersion)
  if (results.development.status !== 'success') {
    return { status: 'failed', failedAt: 'development', results }
  }
  
  // Phase 3: Staging (if development succeeded)  
  results.staging = await rotatePair('staging', fromVersion, toVersion)
  if (results.staging.status !== 'success') {
    return { status: 'failed', failedAt: 'staging', results }
  }
  
  // Phase 4: Production (manual approval required)
  if (options.includeProduction && options.productionApproved) {
    results.production = await rotatePair('production', fromVersion, toVersion)
  }
  
  return { status: 'success', results }
}
```

### Phase 1a Success Criteria

#### Version Management Tests
```javascript
tap.test('Given environment versioning system', async (t) => {
  t.test('When creating A/B pair', async (t) => {
    const result = await createVersionPair('development', 47)
    t.equal(result.versions.length, 2, 'Then both A and B versions should exist')
    t.ok(result.versions.includes('47a'), 'Then version A should exist')
    t.ok(result.versions.includes('47b'), 'Then version B should exist')
  })
  
  t.test('When migrating version pair', async (t) => {
    const result = await rotatePair('development', 47, 48)
    t.equal(result.status, 'success', 'Then migration should succeed')
    t.ok(result.rollbackAvailable, 'Then rollback version should be available')
  })
})
```

#### Migration Failure Tests  
```javascript
tap.test('Given migration failure scenarios', async (t) => {
  t.test('When migration fails mid-execution', async (t) => {
    const result = await rotatePair('development', 47, 48)
    t.equal(result.status, 'failed', 'Then migration should report failure')
    
    const recovery = await recoverFromFailedMigration('development', 47, 48)
    t.ok(recovery.strategy, 'Then recovery strategy should be available')
  })
})
```

#### Cleanup Tests
```javascript
tap.test('Given old environment versions', async (t) => {
  t.test('When running cleanup', async (t) => {
    await createVersionPair('development', 44)
    await createVersionPair('development', 45)  
    await createVersionPair('development', 46)
    await createVersionPair('development', 47)
    
    const result = await cleanupOldVersions(3)
    t.equal(result.status, 'success', 'Then cleanup should succeed')
    
    const remaining = await listEnvironmentVersions('development')
    t.ok(remaining.length <= 6, 'Then only recent versions should remain') // 3 versions × 2 (a/b)
  })
})
```

## File Structure
```
modules/infrastructure-management/
  src/
    plan-system.js          # Plan generation and execution
    state-analyzer.js       # Current state analysis  
    audit-logger.js         # SOC2 compliance logging
    environment-manager.js  # Environment versioning (Phase 2)
    safety-guards.js        # Enhanced safety framework
  test/
    plan-system.tap.js      # Plan/apply workflow tests
    safety-guards.tap.js    # Safety mechanism tests
    rollback.tap.js         # Rollback scenario tests
```