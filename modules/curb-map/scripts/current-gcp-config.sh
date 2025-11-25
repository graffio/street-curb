#!/usr/bin/env bash
set -u

echo "=== Environment variables ==="
# Common Firebase/GCP vars
for var in GCLOUD_PROJECT GOOGLE_CLOUD_PROJECT GOOGLE_APPLICATION_CREDENTIALS \
           FIRESTORE_EMULATOR_HOST FIREBASE_AUTH_EMULATOR_HOST FIREBASE_DATABASE_EMULATOR_HOST \
           FIREBASE_CONFIG FIREBASE_TOKEN GOOGLE_CLIENT_ID \
           GOOGLE_OAUTH_ACCESS_TOKEN FIREBASE_SERVICE_ACCOUNT; do
  printf "%-35s %s\n" "$var" "${!var-<unset>}"
done

echo
echo "=== gcloud configuration ==="
gcloud config list --all --format='table( core.account, core.project, auth.impersonate_service_account, auth.use_credential_file, auth.authority_selector )'

echo
echo "=== Active gcloud accounts ==="
gcloud auth list --format='table(status, account)' 2>/dev/null
echo

# This should *FAIL* if uncommented because we're not using ADC
# echo "=== ADC details ==="
# gcloud auth application-default print-access-token >/dev/null && echo "ADC present (token fetched)" || echo "ADC missing/invalid"

echo
echo "=== Firebase CLI target ==="
firebase use | head -n 1
