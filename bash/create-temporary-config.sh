#!/bin/bash
# Create a new temporary environment config file
# Usage: from modules/curb-map → ../../bash/create-temporary-config.sh [timestamp]

set -euo pipefail

# require at least the user's email address to be added as a member
if [ $# -lt 1 ]; then
    echo
    echo "Usage: $0 your-email [project-id]" >&2
    echo
    exit 1
fi

YOUR_EMAIL=$1
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
PROJECT_ID="${2:-temporary-$TIMESTAMP}"
CONFIG_FILE="migrations/config/${PROJECT_ID}.config.js"

# require the email to include a '@' to 'prove' it's really an email
if [[ "$YOUR_EMAIL" != *"@"* ]]; then
    echo "First argument must be an email address" >&2
    exit 1
  fi

if [ -f "$CONFIG_FILE" ]; then
    echo
    echo "    ❌ Config file already exists: $CONFIG_FILE"
    echo
    exit 1
fi

if [ ! -f "migrations/config/dev.config.js" ]; then
    echo
    echo "    ❌ migrations/config/dev.config.js missing. Run this script from modules/curb-map."
    echo
    exit 1
fi

echo "Creating temporary environment config: $CONFIG_FILE"
cp migrations/config/dev.config.js "$CONFIG_FILE"
sed -i '' "s/curb-map-development/$PROJECT_ID/g" "$CONFIG_FILE"

echo "✅ Created temporary environment config: $CONFIG_FILE"
echo "   Project ID: $PROJECT_ID"

echo ""
echo "Manual setup steps (dry-run; see specifications/F107-firebase-soc2-vanilla-app/manual-setup.md):"
echo " 1. Create the Firebase project in the console"
echo "    - https://console.firebase.google.com → Add project → choose name/ID (e.g. $PROJECT_ID)"
echo "    - Disable Google Analytics (enable later if needed)"
echo " 2. Link a billing account"
echo "    - https://console.cloud.google.com/billing → select project → link billing account"
echo " 3. Enable Firebase services"
echo "    - Firestore (production mode, choose region)"
echo "    - Authentication (Get started)"
echo "    - Cloud Functions (Get started / upgrade)"
echo "    - Cloud Storage (Create bucket in same region)"
echo " 4. Create the infrastructure service account"
echo "    PROJECT_ID=$PROJECT_ID"
echo "    SA_EMAIL=firebase-infrastructure-sa@\$PROJECT_ID.iam.gserviceaccount.com"
echo "    gcloud iam service-accounts create firebase-infrastructure-sa --display-name=\"Firebase Infrastructure Management\" --description=\"Service account for Firebase infrastructure operations\" --project=\$PROJECT_ID"
echo "    gcloud projects add-iam-policy-binding \$PROJECT_ID --member=serviceAccount:\$SA_EMAIL --role=roles/firebase.admin"
echo "    gcloud projects add-iam-policy-binding \$PROJECT_ID --member=serviceAccount:\$SA_EMAIL --role=roles/datastore.owner"
echo "    gcloud projects add-iam-policy-binding \$PROJECT_ID --member=serviceAccount:\$SA_EMAIL --role=roles/storage.admin"
echo "    gcloud projects add-iam-policy-binding \$PROJECT_ID --member=serviceAccount:\$SA_EMAIL --role=roles/cloudfunctions.admin"
echo " 5. Grant impersonation permissions"
echo "    gcloud iam service-accounts add-iam-policy-binding \$SA_EMAIL --member=user:$YOUR_EMAIL --role=roles/iam.serviceAccountTokenCreator --project=\$PROJECT_ID"

echo ""
echo "Next steps: follow the implementation guides (phase2-events.md, phase3-auth.md, etc.) once the project is ready."
