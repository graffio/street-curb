# Firebase Functions Build & Deploy Runbook

## Prerequisites

- Authenticated Firebase CLI (`firebase login`).
- Service account credentials or `.env` values available for dry-run and production environments.

## Dry-Run Pipeline (Local)

1. `yarn tap`
2. `yarn functions:build` (run from `modules/curb-map/`)
3. Start emulators if necessary; if they're already started they'll pick up the changed functions

## Production Deploy Pipeline

1. Re-run dry-run checks (tests, build).
2. `yarn functions:deploy --project <projectId>` (run from `modules/curb-map/`)
3. Confirm functions appear in Firebase console and logs are clean.
4. Roll back if necessary via `firebase functions:delete <name>` or prior release.

## CI/CD Reference

```bash
yarn install --frozen-lockfile
yarn workspace @graffio/curb-map-functions build
yarn workspace @graffio/curb-map-functions deploy
```

## Post-Deploy Verification

- the emulator logs a line with a link to the function, and a button to debug it

     `http function initialized (http://127.0.0.1:5001/temporary-20250926-163653/us-central1/helloWorld).`

- Record deploy metadata (date, commit hash) per SOC2 change log expectations.

## Notes

- Functions workspace lives at `modules/curb-map/functions/` with its own `package.json` and scripts.
- curb-map's `firebase.json` points `functions.source` at the workspace’s build output (`modules/curb-map-functions/dist`).
