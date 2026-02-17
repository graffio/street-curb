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
- **Test behavior, not plumbing** — don't test that JS works (`Array.filter filters`), don't test that `@graffio/functional` functions work. Test YOUR logic: domain rules, edge cases, transformations specific to this module
- **Each test should fail for exactly one reason** — if the code under test breaks, which test fails should tell you what broke

## When NOT to Write a Test

Do NOT write unit tests for:
- Adding entries to lookup tables or registries
- Filtering/mapping data with standard operations
- Passing new input to existing infrastructure
- Wiring components to existing selectors
- Code that just delegates to an already-tested function
- Config, constants, or static data

If the test would only prove that JavaScript or `@graffio/functional` works, skip it.

## Integration Tests

Integration tests (`*.integration-test.js`) use `agent-browser` to verify real app behavior.

**When to run them:** Any time you modify `.jsx` files. Run `cd modules/quicken-web-app && yarn tap:file test/ui-smoke.integration-test.js`.

**When to write new ones:** Data correctness and core workflows — totals add up, transactions appear, filters work, reports show correct values. The financial data has to be right.

**What makes a good smoke test:**
- Tests against fixture data with known expected values
- Verifies what the user sees, not internal state
- Covers the critical path: accounts load → transactions display → filters apply → reports calculate
- Each test should fail when the feature is broken, not when unrelated UI shifts

**What to avoid:**
- Testing implementation details through the browser (CSS classes, DOM structure)
- Redundant assertions — if 3 accounts load, don't assert each cell individually
- Flaky timing — use `wait()` for async operations but don't over-rely on it

## Running Tests

```bash
yarn tap                        # all tests
yarn tap:file test/<name>.tap.js  # single file
```

## TDD Flow

1. Write a failing test for the behavior you want
2. Write the minimum code to make it pass
3. Refactor (if needed) while keeping tests green
