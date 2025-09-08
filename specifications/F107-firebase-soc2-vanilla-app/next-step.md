# Next Step: Create CLI for Migration Execution

## Developer Implementation Task

Create the `orchestrate` CLI that executes migration files with environment-specific configuration and safe-by-default behavior.

## Context

We need a CLI that loads JavaScript migration files from the current project directory, executes them with environment-specific configuration, and provides dry-run safety. The CLI uses the vanilla command executor we just implemented.

## File Changes Required

### 1. package.json
Update CLI binary name:
```json
{
  "bin": {
    "orchestrate": "./src/cli.js"
  }
}
```

### 2. src/cli.js
Create CLI with yargs argument parsing:

```javascript
#!/usr/bin/env node

// CLI signature: orchestrate <environment> <action> <migration> [--apply]
// Examples:
//   orchestrate prod execute 046           # dry-run (safe default)
//   orchestrate prod execute 046 --apply  # actual execution  
//   orchestrate staging rollback 047 --apply

// Implementation requirements:
// 1. Look for ./migrations/ in current directory
// 2. Load ./migrations/config/{environment}.json
// 3. Load ./migrations/{migration}-*.js via dynamic import
// 4. Call migration function with (environment, config)
// 5. Execute commands with dry-run unless --apply
```

### 3. Test Structure
Create comprehensive tests covering the CLI behavior:

#### test/cli-foundation.tap.js
Test the CLI using the Given/When/Then format:

**Given basic CLI functionality**
- **When** calling orchestrate with valid environment and migration **Then** loads config and migration file correctly
- **When** calling orchestrate without --apply flag **Then** performs dry-run by default
- **When** calling orchestrate with --apply flag **Then** executes commands for real

**Given migration file loading**
- **When** migration file exports default function **Then** calls function with environment and config
- **When** migration file returns command array **Then** passes commands to executePlan
- **When** migration file does not exist **Then** shows clear error message

**Given configuration handling**
- **When** environment config file exists **Then** loads and passes to migration function
- **When** environment config file missing **Then** shows clear error about missing config
- **When** current directory has no migrations folder **Then** shows clear error about project structure

**Given audit context**
- **When** executing with --apply **Then** includes proper audit context (user, timestamp, CLI info)
- **When** dry-run mode **Then** includes audit context showing dry-run status

**Given error scenarios**
- **When** migration function throws error **Then** shows clear error and exits cleanly
- **When** migration returns invalid command objects **Then** validates and shows helpful error
- **When** insufficient permissions for real execution **Then** shows clear permission error

## Implementation Requirements

1. **Safe by default**: Default to dry-run, require explicit `--apply` for real execution
2. **Clear feedback**: Show what would happen (dry-run) vs what is happening (apply)  
3. **Error handling**: Clear error messages for missing files, invalid configs, etc.
4. **Audit logging**: Include CLI context in audit trail (user, command line, dry-run status)
5. **Migration validation**: Validate that migration functions return proper command arrays
6. **Directory detection**: Fail fast if not in a project with migrations/ directory

## Test Migration Files

Create test migration files in `test/fixtures/migrations/` for testing:

```javascript
// test/fixtures/migrations/001-test-migration.js
export default async function(environment, config) {
  return [
    {
      id: `test-${environment}`,
      description: `Test migration for ${environment}`,
      canRollback: true,
      execute: async () => ({ status: 'success', output: 'Test executed' }),
      rollback: async () => ({ status: 'success', output: 'Test rolled back' })
    }
  ]
}
```

## Validation Commands

After implementation, run:
```bash
cd /Users/Shared/projects/graffio-monorepo/modules/orchestration
yarn test test/cli-foundation.tap.js
```

## Success Criteria

- [ ] CLI accepts correct command line arguments
- [ ] Default dry-run behavior works correctly
- [ ] --apply flag enables real execution
- [ ] Migration files load and execute properly
- [ ] Environment configs load correctly
- [ ] Clear error messages for all failure scenarios
- [ ] Audit context includes CLI information
- [ ] All tests pass with comprehensive coverage

## Expected Outcome

Working CLI that safely executes infrastructure migrations with proper audit trails, clear feedback, and comprehensive error handling. The CLI integrates with the vanilla command executor while providing project-specific migration file loading.