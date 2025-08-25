#!/bin/bash
TAP_DISABLE_COVERAGE=1 tap "$@" -R tap | tap-mocha-reporter spec
