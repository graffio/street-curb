# Integration Test Infrastructure

## Stack

TAP v21 + Playwright via `agent-browser` CLI. TAP gives us:
- `tap file.js -g 'pattern'` — run one test during dev
- `tap.before()` / `tap.teardown()` — always run, even with `-g` filtering
- Parallel file execution with `--timeout=120` for browser session contention

## File Organization

One file per feature area in `modules/quicken-web-app/test/`:

| File | Covers |
|------|--------|
| `search.integration-test.js` | SearchChip, keyboard shortcuts |
| `bank-register-filters.integration-test.js` | DateFilterChip, CategoryFilterChip on bank registers |
| `investment-register-filters.integration-test.js` | SecurityFilterChip, ActionFilterChip on investment registers |
| `register-data.integration-test.js` | Account list, balances, transaction counts |
| `holdings-report.integration-test.js` | Holdings report, GroupByFilterChip, AccountFilterChip, AsOfDateChip |
| `category-report.integration-test.js` | Category report, GroupByFilterChip, AccountFilterChip, DateFilterChip |

Each file has ABOUTME comments listing the components it covers, enabling grep-based discovery.

## Test Independence Model

- **File-level setup:** `tap.before()` opens browser, navigates to starting page. Always runs, even with `-g`.
- **Self-contained assertions:** Each `test()` block sets up its own preconditions (click chip, type query). No test depends on state from a previous test.
- **File-level teardown:** `tap.teardown()` closes browser.

This means `yarn tap:file test/search.integration-test.js -g 'Escape clears'` actually works — browser opens, navigates, runs just that test, closes.

## Fixture-Driven Assertions

Tests use `loadExpected()` from `seed-12345.expected.json` for all expected values. The fixture generator (`cli-qif-to-sqlite/scripts/generate-fixtures.js`) produces both the SQLite database and the expected values from the same seed, keeping them in sync.

Tests verify actual data correctness (market values, category totals, filtered counts), not just chip labels or crash-freedom.

## Discovery Mechanism

1. `integration_tests` is a required field in `current-task.json` — the planner populates it by grepping ABOUTME comments for affected component names.
2. During development, run files listed in `integration_tests`.
3. During wrap-up, run the full suite as a safety net.
4. Pre-commit hooks stay lint-only — integration tests are too slow for commit hooks.

## Growth Rule

If there's no integration test covering the component you're changing, add one as part of the work. Coverage grows organically, not through big-bang efforts.
