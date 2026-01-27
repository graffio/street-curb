---
title: agent-browser smoke tests fail on repeated runs
category: test-failures
module: quicken-web-app
tags: [agent-browser, smoke-tests, session-management, stale-state]
symptoms:
  - "Browser not launched. Call launch first."
  - "Failed to connect: No such file or directory (os error 2)"
  - "Could not configure browser: Invalid response: EOF"
date: 2026-01-27
---

# agent-browser smoke tests fail on repeated runs

## Problem

Running `yarn test:smoke:headed` works the first time but fails on subsequent runs with:

```
✗ Browser not launched. Call launch first.
```

Or, if a `close` command is attempted against the dead session:

```
⚠ Could not configure browser: Invalid response: EOF while parsing a value
✗ Failed to connect: No such file or directory (os error 2)
```

## Root Cause

agent-browser persists session state as `.pid` and `.sock` files in `~/.agent-browser/`. When HEADED mode left the browser open (intentionally skipping `close`), the next run found stale session files pointing to a dead process. The `open` command refused because the session appeared active.

Calling `close` on a stale session also failed — it tried to communicate via the dead socket, leaving corrupted files that broke the subsequent `open`.

## Solution

Two changes to `test/ui-smoke.integration-test.js`:

1. **Startup cleanup** — remove stale `.pid` and `.sock` files before opening:

```javascript
const sessionDir = resolve(homedir(), '.agent-browser')
rmSync(resolve(sessionDir, `${SESSION}.pid`), { force: true })
rmSync(resolve(sessionDir, `${SESSION}.sock`), { force: true })
```

2. **Always close at teardown** — don't skip `close` in HEADED mode. The browser window staying open was the source of stale state.

## Why not just call `close` at startup?

Calling `close` on a stale session triggers the second error class — it tries to talk to a dead socket. Deleting the files is the only reliable cleanup for a session whose process is gone.

## Related fix

The same session also uncovered a broken symlink: `public/test-fixtures` pointed to `../cli-qif-to-sqlite/test/fixtures` (one level short). The correct target is `../../cli-qif-to-sqlite/test/fixtures`. This caused the `testFile=seed-12345` fixture to 404, so the app loaded with no data — a separate failure that preceded the stale session issue.

## Prevention

- Any tool that uses persistent session files needs cleanup-on-start, not just cleanup-on-exit
- Test harnesses should be idempotent — assume the previous run crashed
- Prefer file deletion over IPC commands when cleaning up potentially dead processes
- Cleanup-on-start is also CI-safe — cleanup-on-exit fails in CI environments that reuse workspaces
- Consider a regression test that deliberately plants stale session files to verify cleanup works
