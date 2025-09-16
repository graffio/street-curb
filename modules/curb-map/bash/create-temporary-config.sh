#!/bin/bash
# Create a new temporary environment config file
# Usage: bash/create-temporary-config.sh [timestamp]
# Run from modules/curb-map directory

set -e

TIMESTAMP="${1:-$(date +%Y%m%d-%H%M%S)}"
CONFIG_FILE="shared/config/temporary-$TIMESTAMP.config.js"

if [ -f "$CONFIG_FILE" ]; then
    echo "❌ Config file already exists: $CONFIG_FILE"
    exit 1
fi

echo "Creating temporary environment config: $CONFIG_FILE"
cp shared/config/dev.config.js "$CONFIG_FILE"
sed -i '' "s/curb-map-development/temporary-$TIMESTAMP/g" "$CONFIG_FILE"

echo "✅ Created temporary environment config: $CONFIG_FILE"
echo "   Project ID: temporary-$TIMESTAMP"
echo ""
echo "Next steps:"
echo "   ../orchestration/src/cli.js $CONFIG_FILE migrations/002-create-firebase-project.js"
