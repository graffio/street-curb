# Write Tests

Node TAP with Given/When/Then structure.

## Steps

1. **Create file** - `test/<name>.tap.js`
2. **Structure tests** - Triple-nested: Given (outer) → When (middle) → Then (assertions)
3. **Write descriptions** - Proper English with articles ("a", "the", "an")
4. **Run tests** - `yarn tap:file test/<name>.tap.js`

## Format

```javascript
t.test('Given a user with valid credentials', t => {
    t.test('When they attempt to log in', t => {
        const result = login(validUser)
        t.equal(result.success, true, 'Then login succeeds')
        t.end()
    })
    t.end()
})
```

## Rules

- No mocks - use real data and APIs
- Test output must be pristine (no unexpected logs/warnings)
- If test triggers expected errors, capture and verify them
- Descriptions should document behavior - someone running tests should understand the code
