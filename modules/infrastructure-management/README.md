# Infrastructure Management System

A sophisticated Firebase infrastructure management system that implements Terraform-like plan/apply workflows with comprehensive safety guards for CurbMap's multi-environment SOC2-compliant architecture.

## Overview

This module provides safe, auditable infrastructure operations for Firebase projects across multiple environments (iac-test, development, staging, production). It prevents accidental destruction of production infrastructure while maintaining the flexibility needed for rapid development.

## Key Features

### 🛡️ Safety-First Design
- **Test Context Protection**: Automatically detects test execution and prevents real infrastructure changes
- **Environment-Specific Confirmations**: Production operations require typing full confirmation text
- **Project Naming Validation**: Enforces safe naming patterns to prevent accidental targeting
- **Plan Expiration**: 15-minute plan expiration prevents stale executions

### 📋 Plan/Apply Workflow
- **Immutable Plans**: Generate detailed execution plans showing exactly what will happen
- **State Analysis**: Analyzes current Firebase infrastructure before generating plans
- **Rollback Strategies**: Documents which operations can be automatically rolled back
- **Dry Run Mode**: View plans without executing them for review and validation

### 📊 SOC2 Compliance
- **Comprehensive Audit Logging**: All operations logged with full context and operator information
- **Daily Log Rotation**: Organized audit trails for compliance reporting
- **Immutable Records**: Tamper-evident logging for security audits

### 🔄 A/B Environment Versioning
- **Migration Safety**: Support for A/B environment versioning (e.g., curb-map-development-47a/47b)
- **Rollback Recovery**: Non-reversible operations can be recovered via environment switching
- **Zero-Downtime Migrations**: Seamless environment transitions

## Architecture

```
src/
├── cli.js                    # Command-line interface (curb-infra)
├── index.js                  # Public API exports
├── ui/                      # User interface layer
│   ├── confirmations.js     # Environment-specific confirmations
│   ├── display.js           # Plan display and progress reporting
│   └── prompts.js           # Interactive prompts
├── core/                    # Core business logic
│   ├── planner.js           # Plan generation orchestration
│   ├── executor.js          # Execution orchestration  
│   ├── state-manager.js     # Infrastructure state analysis
│   └── audit.js             # SOC2 audit logging
└── adapters/                # Infrastructure-specific implementations
    ├── firebase/            # Firebase project management
    │   ├── state.js         # Firebase state analysis
    │   ├── planner.js       # Firebase plan generation
    │   └── executor.js      # Firebase operations
    └── gcp/                 # Google Cloud Platform
        ├── state.js         # GCP state analysis
        ├── planner.js       # GCP plan generation
        └── executor.js      # GCP operations
```

## Usage

### CLI Usage (Recommended)

```bash
# Interactive plan generation
curb-infra plan create-environment --interactive

# Direct plan generation
curb-infra plan create-environment --env development --name "CurbMap Development"

# Execute a plan
curb-infra apply plan-abc123

# List available plans
curb-infra list

# Get help
curb-infra --help
```

### Programmatic Usage

```javascript
import { generatePlan, executePlan } from '@graffio/infrastructure-management'

// Step 1: Generate plan
const plan = await generatePlan('create-environment', {
  environment: 'development',
  projectName: 'CurbMap Development',
  projectId: 'curb-map-development-47a', // Optional: auto-generated if not provided
  owner: 'developer@company.com'
})

// Step 2: Review plan
console.log('Plan will execute:', plan.steps)

// Step 3: Execute plan (with confirmations)
const result = await executePlan(plan)
```

## Safety Guards

### Test Context Protection

The system automatically detects test execution and prevents real infrastructure operations:

```javascript
// During tests, this validates but doesn't execute real commands
const result = await createEnvironment({ environment: 'test-safe', ... })
// Returns: { status: 'success', testMode: true }
```

### Environment-Specific Confirmations

- **Development/IAC-Test**: Requires typing "yes" to proceed
- **Production/Staging**: Requires typing full confirmation like "EXECUTE PRODUCTION PLAN"

### Project Naming Safety

- Test contexts block operations on production-named projects unless they have test prefixes
- Allowed test prefixes: `test-`, `temp-`, `throwaway-`
- Example: `test-curb-map-production` is allowed in tests, `curb-map-production` is blocked

## Environment Strategy

### Four-Environment Architecture

1. **iac-test**: Infrastructure testing and development
2. **development**: Active development environment  
3. **staging**: Pre-production testing
4. **production**: Live production system

### A/B Versioning Pattern

For safe migrations requiring environment recreation:
- Current: `curb-map-development-47a`
- New: `curb-map-development-47b`
- Switch traffic → validate → cleanup old environment

## Audit Logging

All infrastructure operations are logged to `.audit-logs/infrastructure-YYYY-MM-DD.log`:

```json
{
  "timestamp": "2024-03-15T10:30:00.000Z",
  "eventType": "infrastructure-execution",
  "operator": "admin@company.com",
  "operation": "create-environment", 
  "planId": "plan-abc123",
  "projectId": "curb-map-staging",
  "status": "success",
  "duration": 45000,
  "auditVersion": "1.0"
}
```

## Development

### Running Tests

```bash
yarn test
```

Tests run in safe mode and validate all safety guards without executing real infrastructure commands.

### Style Validation

```bash
../style-validator/src/cli.js src/plan-system.js
../style-validator/src/cli.js src/plan-executor.js  
../style-validator/src/cli.js src/safety-guards.js
```

## Configuration

### Required Environment Variables

- `USER`: Operator identification for audit logging
- Firebase CLI must be authenticated: `firebase login`
- GCloud CLI must be authenticated: `gcloud auth login`

### Firebase CLI Requirements

This system requires the Firebase CLI to be installed and authenticated:

```bash
npm install -g firebase-tools
firebase login
```

### GCloud CLI Requirements

For production environments with audit logging:

```bash
# Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

gcloud auth login
gcloud config set project your-project-id
```

## Error Handling

The system provides detailed error messages for common scenarios:

- **Plan Expired**: Plans expire after 15 minutes to prevent stale executions
- **Project Already Exists**: State validation prevents duplicate project creation
- **Project Not Found**: Validates project exists before deletion attempts
- **Safety Violations**: Clear messages when test safety guards trigger
- **Authentication Issues**: Detailed Firebase/GCloud authentication guidance

## SOC2 Compliance Notes

This system supports SOC2 compliance requirements through:

- **Access Controls**: All operations require explicit confirmation
- **Audit Trails**: Comprehensive logging of all infrastructure changes
- **Change Management**: Immutable plans document all intended changes
- **Operator Attribution**: All operations tagged with operator information
- **Data Retention**: Audit logs preserved for compliance reporting periods

## Future Enhancements

- Integration with external SOC2 compliance systems (Vanta, SecureFrame)
- Slack/email notifications for production operations
- Advanced rollback automation for complex multi-step operations
- Integration with CI/CD pipelines for automated environment management
- Cost estimation for infrastructure changes
- Resource drift detection and correction

## Contributing

This module follows the project's coding standards defined in `specifications/A001-coding-standards`. All functions use functional programming patterns, proper error handling, and comprehensive documentation.

Key patterns:
- Functions ordered with most important at the bottom
- Comprehensive JSDoc with Hindley-Milner type signatures
- No unnecessary try/catch blocks (let errors bubble up)
- Kebab-case for file names, camelCase for variables
- Single-level indentation using early returns and functional composition
