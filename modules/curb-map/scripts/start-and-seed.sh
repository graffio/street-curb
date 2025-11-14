#!/bin/bash
# ABOUTME: Start Firebase emulators and seed data
# ABOUTME: Keeps emulators running after seeding completes

set -e

# Kill any existing emulator processes
pkill -f 'firebase emulators:start' || true

# Start emulators in background
echo "[seeding] Starting Firebase emulators..."
firebase emulators:start --only firestore,auth,functions &
EMULATOR_PID=$!

# Wait for emulators to be ready (check Firestore and Auth ports)
echo "[seeding] Waiting for Firestore emulator..."
MAX_ATTEMPTS=30
ATTEMPT=0
until nc -z localhost 8080 2>/dev/null; do
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo "[seeding] ERROR: Firestore emulator failed to start within $MAX_ATTEMPTS seconds"
        kill $EMULATOR_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

echo "[seeding] Waiting for Auth emulator..."
ATTEMPT=0
until nc -z localhost 9099 2>/dev/null; do
    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo "[seeding] ERROR: Auth emulator failed to start within $MAX_ATTEMPTS seconds"
        kill $EMULATOR_PID 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

echo "[seeding] All emulators ready. Running seed script..."
node test-utils/seed.js

echo "[seeding] Seed complete. Emulators running (PID: $EMULATOR_PID)"
echo "[seeding] Press Ctrl+C to stop emulators"

# Wait for emulators process
wait $EMULATOR_PID
