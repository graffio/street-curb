#!/bin/bash
# ABOUTME: Start Firebase emulators and seed data
# ABOUTME: Keeps emulators running after seeding completes
# ABOUTME: Usage: ./start-and-seed.sh [debug]  - Pass 'debug' to enable function debugging on port 9229

set -e

# Define color codes
GREEN_REGL="\033[0;32m"
GREEN_BOLD="\033[1;32m"
GREEN__DIM="\033[2;32m"
GREEN_ITAL="\033[3;32m"
NC='\033[0m' # No Color

# Function to log messages
log() {
    echo -e "${GREEN_BOLD}    [seeding] $1${NC}"
}

# Parse command line arguments
DEBUG_MODE=false
if [ "$1" = "debug" ]; then
    DEBUG_MODE=true
    log "Debug mode enabled - Functions will be inspectable on port 9229"
fi

# Kill any existing emulator processes
pkill -f 'emulators' || true

# Build emulator command
EMULATOR_CMD="firebase emulators:start --only firestore,auth,functions"
if [ "$DEBUG_MODE" = true ]; then
    EMULATOR_CMD="$EMULATOR_CMD --inspect-functions=9229"
fi

# Start emulators in background
log "Starting Firebase emulators..."
$EMULATOR_CMD &
EMULATOR_PID=$!

# Wait for emulators to be ready (check Firestore and Auth ports)
log "Waiting for Firestore emulator..."
MAX_ATTEMPTS=30
ATTEMPT=0
until nc -z localhost 8080 2>/dev/null; do
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        log "ERROR: Firestore emulator failed to start within $MAX_ATTEMPTS seconds"
        kill $EMULATOR_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

log "Waiting for Auth emulator..."
ATTEMPT=0
until nc -z localhost 9099 2>/dev/null; do
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        log "ERROR: Auth emulator failed to start within $MAX_ATTEMPTS seconds"
        kill $EMULATOR_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

log "All emulators ready. Running seed script..."
node test-utils/seed.js

log "Seed complete. Emulators running (PID: $EMULATOR_PID)"
log "Press Ctrl+C to stop emulators"

# Wait for emulators process
wait $EMULATOR_PID
