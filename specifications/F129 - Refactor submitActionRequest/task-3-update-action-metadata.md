# Task 3: Update Action Metadata Structure

## Goal
Review and potentially simplify the action metadata structure in `action.type.js` based on the new validation flow.

## Current Metadata Structure

Each action returns:
```javascript
{
    requiresUser: boolean,
    requiresOrganization: boolean,
    requiresProject: boolean,
    authStrategy: string,
    writesTo: [...],
    validateInput: function | null
}
```

## Changes to Consider

### BlockfaceSaved validateInput

Current implementation (lines 315-333) validates:
1. Immutable metadata on updates (createdBy/createdAt)
2. Tenant boundaries (organizationId/projectId)

**Decision needed:**
- Keep this custom validation function?
- Or move to standardized metadata validation in task 2?

**Recommendation:**
- Move tenant boundary validation to standardized `validateTenantBoundaries()` function
- Move metadata validation to standardized `validateMetadata()` function
- Remove custom `validateInput` entirely OR keep it for domain-specific validation only

### writesTo Declaration

BlockfaceSaved currently has:
```javascript
writesTo: [{
    collection: 'blockfaces',
    isCreate: 'runtime',  // Upsert - determine at runtime
    docIds: 'action.blockface.id'
}]
```

This is correct and should remain.

## Implementation Notes

- Keep `Action.metadata()` function structure
- Simplify or remove `validateInput` if validation is now standardized
- Ensure `writesTo` declarations are accurate for all actions that write documents

## Validation

Run type generation to ensure metadata doesn't break generated types:
```bash
yarn types:generate
```

Run integration tests:
```bash
yarn tap:integration
```
