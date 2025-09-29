#!/usr/bin/env bash
set -euo pipefail

CLI="../cli-migrator/src/cli.js"
MIGRATION="migrations/src/002-create-firebase-project.js"
DEFAULT_EXISTING_CONFIG="migrations/config/temporary-20250923-143622.config.js"
EXISTING_ATTEMPTS=0
NEW_ATTEMPTS=0
MAX_ATTEMPTS=2

existing_config="${1:-$DEFAULT_EXISTING_CONFIG}"

maybe_run() {
    local description="$1"
    shift
    printf '\n==> %s\n' "$description"
    "$@"
}

if [[ ! -f "$existing_config" ]]; then
    printf 'Existing config not found: %s\n' "$existing_config"
    exit 1
fi

while (( EXISTING_ATTEMPTS < MAX_ATTEMPTS )); do
    ((++EXISTING_ATTEMPTS))
    maybe_run "Dry-run existing config (attempt $EXISTING_ATTEMPTS/$MAX_ATTEMPTS)" "$CLI" "$existing_config" "$MIGRATION"
    if maybe_run "Apply existing config (attempt $EXISTING_ATTEMPTS/$MAX_ATTEMPTS)" "$CLI" "$existing_config" "$MIGRATION" "--apply"; then
        break
    fi
    if (( EXISTING_ATTEMPTS == MAX_ATTEMPTS )); then
        printf 'Apply existing config failed after %d attempts\n' "$MAX_ATTEMPTS"
        exit 1
    fi
done

new_config_output="$(../../bash/create-temporary-config.sh)"
printf '%s\n' "$new_config_output"

new_config_path="$(ls -t migrations/config/temporary-*.config.js | head -n 1)"

maybe_run "Dry-run new config $new_config_path" "$CLI" "$new_config_path" "$MIGRATION"

while (( NEW_ATTEMPTS < MAX_ATTEMPTS )); do
    ((++NEW_ATTEMPTS))
    if maybe_run "Apply new config $new_config_path (attempt $NEW_ATTEMPTS/$MAX_ATTEMPTS)" "$CLI" "$new_config_path" "$MIGRATION" "--apply"; then
        exit 0
    fi
    if (( NEW_ATTEMPTS == MAX_ATTEMPTS )); then
        printf 'Apply new config failed after %d attempts\n' "$MAX_ATTEMPTS"
        exit 1
    fi
done
