#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
FILTER="$HERE/absolute-path-for-stack.js"

export TAP_DISABLE_COVERAGE=1
export FORCE_COLOR=3
export TAP_COLORS=1
export npm_config_color=true

set +e
tap "$@" -R tap | tap-mocha-reporter spec | node "$FILTER"
status=${PIPESTATUS[0]}
set -e

rm -rf .tap .nyc_output
exit "$status"
