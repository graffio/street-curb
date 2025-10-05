#!/usr/bin/env bash

# STOP! notice `source` in the next line; otherwise the variables at the bottom won't be set!
#
# Usage: source bash/set-project-env.sh <project-id> [firestore-port] [auth-port]
# Sets GCLOUD/GOOGLE project vars, gcloud default project, Firebase CLI target,
# and the common emulator host variables.

set -euo pipefail

if [[ $# -lt 1 ]]; then
    echo "Usage: source ${BASH_SOURCE[0]} <project-id> [firestore-port] [auth-port]" >&2
    return 1
fi

project_id="$1"
firestore_port="${2:-8080}"
auth_port="${3:-9099}"

# Export project identifiers for Node/Firebase tooling.
export GCLOUD_PROJECT="$project_id"
export GOOGLE_CLOUD_PROJECT="$project_id"

# Emulator hosts (adjust or add storage/database ports as needed).
export FIRESTORE_EMULATOR_HOST="127.0.0.1:${firestore_port}"
export FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:${auth_port}"

# Set gcloud’s active project (ignore failures so script works even if gcloud is absent).
gcloud config set core/project "$project_id" >/dev/null

# Align firebase CLI’s default project if available.
firebase use "$project_id" >/dev/null 2>&1 || true

echo "GCLOUD_PROJECT           = ${GCLOUD_PROJECT}"
echo "GOOGLE_CLOUD_PROJECT     = ${GOOGLE_CLOUD_PROJECT}"
echo "FIRESTORE_EMULATOR_HOST  = ${FIRESTORE_EMULATOR_HOST}"
echo "FIREBASE_AUTH_EMULATOR_HOST = ${FIREBASE_AUTH_EMULATOR_HOST}"
