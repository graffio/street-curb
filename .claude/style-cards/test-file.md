# Test File Style Card

Framework: Node TAP. Files: `test/<name>.tap.js` or colocated `<name>.tap.js`.

## Structure: Given / When / Then

Triple-nested `t.test()` calls. Use proper English articles ("a", "the", "an"):

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

- **No mocks** — use real data and real APIs
- **Pristine output** — no unexpected console logs or warnings during test runs
- **Capture expected errors** — if a test triggers expected errors, capture and verify them
- **Descriptions document behavior** — someone running tests should understand the code from test names alone
- **Test the exported API** — import the module's export object, test its public functions

## Running Tests

```bash
yarn tap                        # all tests
yarn tap:file test/<name>.tap.js  # single file
```

## TDD Flow

1. Write a failing test for the behavior you want
2. Write the minimum code to make it pass
3. Refactor (if needed) while keeping tests green
