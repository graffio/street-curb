# Task 4: Update Handlers to Work with New Flow

## Goal
Remove defensive metadata overwrites from handlers now that validation happens before handler execution.

## Handlers to Review

1. **handleBlockfaceSaved** - Check for metadata overwrites
2. **handleOrganizationCreated** - Check for metadata overwrites
3. **handleUserCreated** - Check for metadata overwrites
4. Other handlers as needed

## Expected Changes

### Before (Defensive)
```javascript
const handleBlockfaceSaved = async (logger, fsContext, actionRequest) => {
    const { blockface } = actionRequest.action

    // Defensive: overwrite metadata to ensure correctness
    const enriched = {
        ...blockface,
        createdBy: actionRequest.actorId,  // ← Remove this
        updatedBy: actionRequest.actorId,  // ← Remove this
        updatedAt: new Date(),             // ← Remove this
    }

    await fsContext.blockfaces.write(enriched)
}
```

### After (Trusting)
```javascript
const handleBlockfaceSaved = async (logger, fsContext, actionRequest) => {
    const { blockface } = actionRequest.action

    // Metadata already validated - just write it
    await fsContext.blockfaces.write(blockface)
}
```

## Implementation Notes

- Handlers should trust that incoming data is already validated
- Remove any code that overwrites createdBy/createdAt/updatedBy/updatedAt
- Focus handlers on domain logic only
- If a handler MUST modify metadata (e.g., setting a new updatedAt), document why

## Validation

Run integration tests:
```bash
yarn tap:integration
```

All handlers should pass tests with the simplified implementation.
