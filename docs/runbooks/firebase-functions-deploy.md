# Deploying Firebase Functions in the Monorepo

## 1. Dedicated Functions Workspace
Create a workspace (e.g., `modules/curb-map-functions`) with its own `package.json` that declares:

- Firebase dependencies (`firebase-functions`, `firebase-admin`, etc.)
- Internal packages via workspace aliases, e.g.:
  ```json
  {
      "dependencies": {
          "@graffio/functional": "workspace:*",
          "firebase-admin": "^12",
          "firebase-functions": "^5"
      }
  }
  ```

Point `firebase.json` to this workspace using the `functions.source` field.

## 2. Bundle Before Deploy
Add scripts that bundle the functions:

```json
{
    "name": "@graffio/curb-map-functions",
    "scripts": {
        "build": "esbuild src/index.js --bundle --platform=node --outfile=dist/index.js",
        "deploy": "yarn build && firebase deploy --only functions"
    },
    "dependencies": {
        "@graffio/functional": "workspace:*",
        "firebase-admin": "^12",
        "firebase-functions": "^5"
    }
}
```

Example `firebase.json` snippet:

```json
{
    "functions": {
        "source": "modules/curb-map-functions/dist"
    }
}
```

## 3. CI/CD Workflow
In CI, install dependencies and deploy from the workspace:

```bash
yarn install --frozen-lockfile
yarn workspace @graffio/curb-map-functions build
yarn workspace @graffio/curb-map-functions deploy
```

Because Yarn workspaces hoist internal packages, `@graffio/functional` is available during the build—no need to publish it externally or copy code manually.

## Summary
- Keep functions in their own workspace.
- Bundle everything (including internal workspaces) before deploying.
- Use Firebase CLI to deploy the bundled output.
