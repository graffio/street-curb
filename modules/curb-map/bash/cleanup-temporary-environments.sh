#!/bin/bash
# Safely clean up temporary environments with protection mechanisms
# Usage: bash/cleanup-temporary-environments.sh [--older-than-days N]
# Run from modules/curb-map directory

set -e

DAYS_OLD="${2:-1}"  # Default to 1 day old
FILTER_DATE="$(date -v-${DAYS_OLD}d '+%Y-%m-%d')"

if [ "$1" = "--older-than-days" ] && [ -n "$2" ]; then
    DAYS_OLD="$2"
    FILTER_DATE="$(date -v-${DAYS_OLD}d '+%Y-%m-%d')"
fi

echo "Finding temporary projects older than $DAYS_OLD days (before $FILTER_DATE)..."

# List temporary projects with safety checks
TEMP_PROJECTS=$(gcloud projects list \
    --filter="projectId:temporary-* AND createTime<$FILTER_DATE" \
    --format="value(projectId)" || true)

if [ -z "$TEMP_PROJECTS" ]; then
    echo "No temporary projects found older than $DAYS_OLD days"
    exit 0
fi

echo "Found temporary projects to clean up:"
echo "$TEMP_PROJECTS"

# Also clean up local config files for deleted projects
echo ""
echo "Checking for corresponding local config files..."
LOCAL_CONFIGS=""
for project in $TEMP_PROJECTS; do
    config_file="shared/config/${project}.config.js"
    if [ -f "$config_file" ]; then
        LOCAL_CONFIGS="$LOCAL_CONFIGS$config_file\n"
    fi
done

if [ -n "$LOCAL_CONFIGS" ]; then
    echo "Found local config files to clean up:"
    echo -e "$LOCAL_CONFIGS"
fi

# Safety confirmation
echo
echo "⚠️  This will PERMANENTLY DELETE these projects and all their data!"
echo "⚠️  Make sure none of these are environments you're still using!"
echo
read -p "Are you sure you want to delete these projects? Type 'DELETE' to confirm: " -r

if [ "$REPLY" != "DELETE" ]; then
    echo "Cleanup cancelled"
    exit 0
fi

# Delete projects
echo "$TEMP_PROJECTS" | while read -r project; do
    echo "Deleting project: $project"
    gcloud projects delete "$project" --quiet

    # Clean up local config file
    config_file="shared/config/${project}.config.js"
    if [ -f "$config_file" ]; then
        rm "$config_file"
        echo "  Cleaned up local config: $config_file"
    fi
done

echo "✅ Cleanup completed"