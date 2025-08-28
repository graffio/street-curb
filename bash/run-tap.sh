#!/bin/bash
TAP_DISABLE_COVERAGE=1 tap "$@" -R tap  | tap-mocha-reporter spec
rm -rf .tap
rm -rf .nyc_output
