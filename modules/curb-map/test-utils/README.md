# Firebase Integration Test Utilities

This directory contains utilities for running Firebase integration tests with the emulator. The infrastructure supports:

- **Namespaced test data** - All test data is isolated under `tests/{ns}` paths
- **Controlled seeding** - Seed data with `DISABLE_TRIGGERS=1` to prevent function execution
- **Safe cleanup** - Remove only test data after each test run
- **Parallel test isolation** - Multiple tests can run concurrently with separate namespaces

## Usage

### Basic Test Setup

```javascript
import { test } from 'tap'
import { FirestoreAdminFacade, getDefaultAdminDb } from '@graffio/curb-map/src/firestore-facade/firestore-admin-facade.js'
import { ActionRequest } from '@graffio/curb-map/src/types/index.js'
import { seed } from '../test-utils/seed.js'

const ns = `tests/ns_${Date.now()}_${Math.random().toString(36).slice(2)}`
const db = getDefaultAdminDb()
let actionRequestFacade

test('My integration test', t => {
    t.before(async () => {
        process.env.FS_BASE = ns
        process.env.FIREBASE_TEST_MODE = '1'
        process.env.DISABLE_TRIGGERS = '1'
        await seed()
        delete process.env.DISABLE_TRIGGERS
        actionRequestFacade = FirestoreAdminFacade(ActionRequest, `${ns}/`, db)
    })

    t.after(async () => {
        await actionRequestFacade.recursiveDelete()
        delete process.env.FIREBASE_TEST_MODE
    })

    t.test('When something happens', async t => {
        const items = await actionRequestFacade.query([['status', '==', 'pending']])
        t.ok(items.length > 0)
        t.end()
    })

    t.end()
})
```

### API

#### `seed()`
Seeds test data. Should only be called with `DISABLE_TRIGGERS=1`.

```javascript
process.env.DISABLE_TRIGGERS = '1'
await seed()
delete process.env.DISABLE_TRIGGERS
```

## References

See `/docs/runbooks/firebase-integration-tests-strategy.md` for detailed strategy and patterns.
