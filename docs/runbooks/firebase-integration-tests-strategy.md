# Strategy for Running Firebase Integration Tests

This document describes how to exercise Firebase workflows against emulators using TAP, with an emphasis on **data
isolation**, **controlled seeding**, and **safe trigger handling**.

---

## Key Principles

- **Namespace all test data** under `tests/{ns}` so each run is isolated and easy to clean.
- **Disable triggers while seeding** (`DISABLE_TRIGGERS=1`) to prevent functions from firing during setup.
- **Re-enable triggers** before running assertions so functions behave normally.
- **Scoped cleanup**: remove only the namespace you created, not the entire emulator dataset.

---

## Starting the Emulator Stack

```bash
firebase emulators:start --only functions,firestore --project <projectId>
```
- Keep the emulator running in its own terminal; tests will reuse the existing process.

---

## Seeding Data

1. Set environment variables:
   ```bash
   export FIREBASE_TEST_MODE=1
   export GCLOUD_PROJECT=<projectId>
   export DISABLE_TRIGGERS=1
   ```
2. Run the seed helper:
   ```bash
   node modules/curb-map/test-utils/seed.js
   ```
3. Clear `DISABLE_TRIGGERS` once seeding completes.

---

## Exercising Functions

- **HTTP functions**: `curl http://localhost:5001/<projectId>/us-central1/<functionName>`
- **Firestore triggers**: create queue items via `FirestoreAdminFacade` in the test harness.
- Watch the emulator terminal for log output and errors.

---

## Example TAP Test Skeleton

```js
import t from 'tap'
import { FirestoreAdminFacade } from '../src/firestore-facade/firestore-admin-facade.js'
import { QueueItem } from '../src/types/index.js'
import { seed } from '../test-utils/seed.js'

const ns = `tests/ns_${Date.now()}`

t.before(async () => {
    process.env.FS_BASE = ns
    process.env.FIREBASE_TEST_MODE = '1'
    process.env.DISABLE_TRIGGERS = '1'
    await seed()
    delete process.env.DISABLE_TRIGGERS
})

t.after(async () => {
    const adminFacade = FirestoreAdminFacade(QueueItem, `${ns}/`)
    await adminFacade.recursiveDelete()
    delete process.env.FIREBASE_TEST_MODE
})

t.test('Given queue items exist When querying Then pending items are returned', async t => {
    const adminFacade = FirestoreAdminFacade(QueueItem, `${ns}/`)
    const items = await adminFacade.query([['status', '==', 'pending']])
    t.ok(items.length > 0)
    t.end()
})
```

---

## CI/CD Integration

Use `firebase emulators:exec` to run the suite in one shot:

```
"scripts": {
  "ci:test": "firebase emulators:exec --only functions,firestore \"yarn tap\""
}
```

If you need to reseed between test files:

```js
// ci-round.mjs
import { spawn } from 'node:child_process'
import { seed } from './test-utils/seed.js'

const files = ['modules/curb-map/test/integration-testing.firebase.js']

for (const file of files) {
    const ns = `tests/ns_${Date.now()}_${Math.random().toString(36).slice(2)}`
    process.env.FS_BASE = ns
    process.env.FIREBASE_TEST_MODE = '1'
    process.env.DISABLE_TRIGGERS = '1'
    await seed()
    delete process.env.DISABLE_TRIGGERS
    
    await new Promise((resolve, reject) => {
        const proc = spawn('yarn', ['tap', file], { stdio: 'inherit', env: process.env })
        proc.on('exit', code => (code ? reject(new Error(`tap failed: ${file}`)) : resolve()))
    })
}
```

---

## Cleanup Checklist

- Call `recursiveDelete` on the test namespace after each suite.
- Stop the emulator process when done to free ports and resources.
- Reset environment variables (`unset FIREBASE_TEST_MODE`, etc.).

---

## Troubleshooting

- **PERMISSION_DENIED**: confirm emulator is using relaxed rules and the request targets the `tests/` path.
- **Hanging tests**: ensure all Firebase app instances are deleted in `t.teardown`.
- **Port conflicts**: use `firebase emulators:start --import/export` directories or manual port overrides.

---

## References

- `docs/runbooks/running-firebase-integration-tests.md` for high-level entry point once populated.
- `docs/runbooks/firebase-functions-deploy.md` for production deploy flow.
