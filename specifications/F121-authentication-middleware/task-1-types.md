# Task 1: Add Action and Field Types

## Add AuthenticationCompleted Action

`modules/curb-map/type-definitions/action.type.js`:

```
AuthenticationCompleted: {
    email: FieldTypes.email,
    displayName: 'String',
    // phoneNumber extracted from verified Firebase token (not client input)
},
```

## Regenerate Types

```bash
yarn types:generate
```
