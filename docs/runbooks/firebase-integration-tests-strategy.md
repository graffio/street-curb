# Strategy for Running Firebase Integration Tests

This document describes a recommended strategy for running integration tests with Firebase emulators using the TAP test runner. It emphasizes **data isolation**, **controlled seeding**, and **safe function triggers**.

---

## Key Concepts

- **Namespacing**: All test data is written under `tests/{ns}` instead of production root collections. Each test run gets its own namespace (`ns`), ensuring isolation and easy cleanup.
- **Seeding with triggers disabled**: Seed data with an environment variable (`DISABLE_TRIGGERS=1`). Functions that watch Firestore will return early while this is set, preventing unwanted side effects during seeding.
- **Re-enable triggers for tests**: Once seeding is complete, clear `DISABLE_TRIGGERS` so Functions run normally during tests.
- **Scoped cleanup**: Delete only the `tests/{ns}` subtree after each test suite, rather than wiping the entire emulator.

---

## Firebase Function with Trigger Guard

```js
// functions/index.js
import functions from 'firebase-functions';
import admin from 'firebase-admin';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const onUserProjectsChange = functions.firestore
  .document('users/{uid}')
  .onWrite(async (chg, ctx) => {
    if (process.env.DISABLE_TRIGGERS) return; // <-- guard for test seeding

    const before = chg.before.exists ? chg.before.data().projects || [] : [];
    const after = chg.after.exists ? chg.after.data().projects || [] : [];
    const added = after.filter((x) => !before.includes(x));

    await Promise.all(
      added.map((pid) =>
        db.doc(`projects/${pid}`).set(
          { users: admin.firestore.FieldValue.arrayUnion(ctx.params.uid) },
          { merge: true }
        )
      )
    );
  });
```

---

## Seeding Script (Firestore + Storage)

```js
// seed.js
import { db, doc } from './db.js';
import { getStorage } from 'firebase-admin/storage';
import fs from 'node:fs';

export const seed = async () => {
  const batch = db.batch();

  // Create projects
  batch.set(doc('projects', 'p1'), { name: 'Alpha', users: [] });
  batch.set(doc('projects', 'p2'), { name: 'Beta', users: [] });

  // Upload headshots to Storage and store references in User docs
  const bucket = getStorage().bucket();
  const users = [
    { id: 'u1', name: 'Ada', projects: ['p1', 'p2'], headshot: 'headshots/u1.png' },
    { id: 'u2', name: 'Lin', projects: ['p1', 'p2'], headshot: 'headshots/u2.png' },
  ];

  for (const u of users) {
    await bucket.upload(`fixtures/${u.id}.png`, { destination: u.headshot });
    batch.set(doc('users', u.id), u);
  }

  await batch.commit();
};
```

This assumes you have fixture images under `fixtures/u1.png` and `fixtures/u2.png`.

---

## Example TAP Test

```js
// modules/curb-map/test/offline-queue.integration.tap.js
import t from 'tap';
import { db, doc } from '../test-utils/firestore.js';
import { seed } from '../test-utils/seed.js';

const ns = `tests/ns_${Date.now()}`;

t.before(async () => {
    process.env.FS_BASE = ns;
    process.env.DISABLE_TRIGGERS = '1';
    await seed();
    delete process.env.DISABLE_TRIGGERS;
});

t.after(async () => {
    await db.recursiveDelete(db.collection(ns));
});

t.test('Given a project assignment When the client updates a user Then the trigger mirrors membership', async (t) => {
    await doc('projects', 'p3').set({ name: 'Gamma', users: [] });
    await doc('users', 'u1').update({ projects: ['p1', 'p2', 'p3'] });

    await new Promise((resolve) => setTimeout(resolve, 300));

    const user = (await doc('users', 'u1').get()).data();
    const project = (await doc('projects', 'p3').get()).data();

    t.match(user.projects, ['p1', 'p2', 'p3']);
    t.ok(project.users.includes('u1'));
    t.end();
});
```

---

## Running Tests in CI/CD
Run the emulator and TAP suite in one step with `firebase emulators:exec` and `yarn tap`:

```
// package.json
"scripts": {
  "ci:test": "firebase emulators:exec --only firestore,auth,storage,functions \"node ci.mjs\""
}
```

```js
// ci.mjs
import { seed } from './test-utils/seed.js';
import { spawn } from 'node:child_process';

const ns = `tests/ns_${Date.now()}`;
process.env.FS_BASE = ns;

// Seed with triggers disabled
process.env.DISABLE_TRIGGERS = '1';
await seed();
delete process.env.DISABLE_TRIGGERS;

// Run full test suite
await new Promise((res, rej) => {
  const p = spawn('yarn', ['tap'], { stdio: 'inherit', env: process.env });
  p.on("exit", (code) => (code ? rej(code) : res()));
});
```

---

## Many Tests with Reseeding Between Each

When you want **one emulator boot** and **many tests with reseeding**, loop each spec file:

```
"scripts": {
  "ci:round": "firebase emulators:exec --only firestore,auth,storage,functions \"node ci-round.mjs\""
}
```

```js
// ci-round.mjs
import { globby } from 'globby';
import { spawn } from 'node:child_process';
import { db } from './test-utils/firestore.js';
import { seed } from './test-utils/seed.js';

const tests = await globby(["tests/**/*.spec.mjs"]);

for (const file of tests) {
  const ns = `tests/ns_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  process.env.FS_BASE = ns;

  // Seed fresh state
  process.env.DISABLE_TRIGGERS = '1';
  await seed();
  delete process.env.DISABLE_TRIGGERS;

  // Run this one spec file
  await new Promise((res, rej) => {
    const p = spawn('yarn', ['tap', file], { stdio: 'inherit', env: process.env });
    p.on("exit", (code) => (code ? rej(code) : res()));
  });

  // Cleanup after test
  await db.recursiveDelete(db.collection(ns));
}
```

---

## Benefits

- **Isolation**: Each test run is scoped under its own namespace.  
- **Storage + Firestore seeding**: Users can have associated files uploaded.  
- **Speed**: Emulators boot once, data reseeded between tests.  
- **Safety**: Functions won’t mutate seed data during setup.  
- **Realism**: Functions re-enabled during actual test steps, validating real behavior.
