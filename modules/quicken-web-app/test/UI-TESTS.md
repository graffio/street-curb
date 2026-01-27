# UI Regression Tests

Smoke tests using `agent-browser` to verify critical UI paths.

## Prerequisites

1. Install agent-browser globally:
   ```bash
   npm install -g agent-browser
   agent-browser install
   ```

2. Generate test fixtures:
   ```bash
   cd modules/cli-qif-to-sqlite
   node scripts/generate-fixtures.js
   ```

3. Start the dev server:
   ```bash
   cd modules/quicken-web-app
   yarn dev
   ```

## Running Tests

```bash
cd modules/quicken-web-app
yarn test:smoke          # headless
yarn test:smoke:headed   # visible browser
```

Note: These are integration tests (not unit tests), so they use `.integration-test.js` suffix to avoid being picked up by `yarn tap`.

**Never use mocks for UI tests.** The whole point is to verify the real app works end-to-end. Mocking anything would just test the mocks, not the app. Run with `node` directly, not through tap's mock infrastructure.

## Troubleshooting

**"EOF while parsing" errors:**

This usually means daemon state corruption. Common causes:
- Calling `close` while another command is running (race condition)
- Multiple test processes hitting the same daemon session

Solutions:
- Tests use isolated sessions via `AGENT_BROWSER_SESSION` env var
- Use `execFileSync` with args array, not `execSync` with shell strings
- Don't call `close` at the start of tests — only at cleanup

**Stale daemon cleanup (rarely needed):**

```bash
pkill -f 'daemon.js'
sleep 1
rm -f ~/.agent-browser/*.sock ~/.agent-browser/*.pid
```

## Test Coverage

These are **smoke tests**, not exhaustive feature tests. They cover:

- App loads with test data
- Account list displays correct values
- Clicking accounts opens transaction view
- Basic navigation works

## When to Run

- Before releases
- After major refactors
- When debugging UI issues
- Optionally on CI (slow, ~30s)

## Adding New Tests

Add tests for:
- **Regressions** — bugs that were fixed (prevents re-introduction)
- **Critical paths** — features users depend on daily

Don't add tests for:
- Every new feature (use unit tests instead)
- Edge cases (use unit tests)
- Styling/layout (too brittle)

## Fixtures

Test fixtures are in `modules/cli-qif-to-sqlite/test/fixtures/` (gitignored).

- `seed-12345.sqlite` — test database
- `seed-12345.expected.json` — expected values for assertions

Regenerate with: `node scripts/generate-fixtures.js`
