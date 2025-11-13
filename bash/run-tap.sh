#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
FILTER="$HERE/absolute-path-for-stack.js"

export TAP_DISABLE_COVERAGE=1
export FORCE_COLOR=3
export TAP_COLORS=1
export npm_config_color=true

# Check if any actual test files exist (not just glob patterns)
has_files=false
for pattern in "$@"; do
    # Check if pattern matches any files
    if compgen -G "$pattern" > /dev/null 2>&1; then
        has_files=true
        break
    fi
done

if [ "$has_files" = false ]; then
    echo "⚠️  No test files found - skipping tests"
    echo "  0 passing"

    exit 0
fi

set +e
tap "$@" -R tap | tap-mocha-reporter spec | node "$FILTER"
status=${PIPESTATUS[0]}
set -e

rm -rf .tap .nyc_output
exit "$status"
