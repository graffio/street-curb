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

    next_step=$(jq '[.steps[] | select(.done == false)][0].step' "$TASK_FILE")

    echo "--- Relay iteration $i/$MAX_ITERATIONS — step $next_step ($remaining steps remaining) ---"

    claude "You are relay iteration #$i for $TASK_FILE. Your assignment is step $next_step.
Read the task file. Read all previous step notes for context.
Complete ONLY step $next_step. If step $next_step is already done, find the first undone step instead.
When done, mark it done with a note in the task file, then EXIT this session.
Do not continue to the next step — the relay loop will start a fresh session for it."
    exit_code=$?
    if [ "$exit_code" -ne 0 ]; then
        echo "Warning: claude exited with non-zero status ($exit_code). Stopping loop."
        break
    fi
done

echo "Reached max iterations ($MAX_ITERATIONS) — review task progress before continuing."
exit 1
