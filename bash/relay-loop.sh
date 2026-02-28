#!/bin/bash
# ABOUTME: External loop for context relay — starts fresh interactive claude sessions
# ABOUTME: each session exits when context runs low or the task is fully done

set -euo pipefail

TASK_FILE="${1:-}"
MAX_ITERATIONS="${2:-10}"

if [ -z "$TASK_FILE" ]; then
    echo "Usage: bash bash/relay-loop.sh <task-file.json> [max-iterations]"
    echo "  Starts interactive claude sessions in a loop, using task.json as state bridge."
    echo "  Each session picks up at the first undone step. Exits when all steps are done."
    exit 1
fi

if [ ! -f "$TASK_FILE" ]; then
    echo "Error: Task file not found: $TASK_FILE"
    exit 1
fi

if ! command -v jq > /dev/null 2>&1; then
    echo "Error: jq is required but not found in PATH"
    exit 1
fi

for i in $(seq 1 "$MAX_ITERATIONS"); do
    remaining=$(jq '[.steps[] | select(.done == false)] | length' "$TASK_FILE") || {
        echo "Error: Failed to parse $TASK_FILE with jq"
        exit 1
    }

    if [ "$remaining" -eq 0 ]; then
        echo "All steps complete!"
        exit 0
    fi

    echo "--- Relay iteration $i/$MAX_ITERATIONS ($remaining steps remaining) ---"

    claude "Continue implementing $TASK_FILE — you are relay iteration #$i.
Read the task file, find the first step with done: false, and continue from there.
Read all previous step notes for context on deviations and decisions."
    exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
        echo "Warning: claude exited with non-zero status ($exit_code). Stopping loop."
        break
    fi
done

echo "Reached max iterations ($MAX_ITERATIONS) — review task progress before continuing."
exit 1
