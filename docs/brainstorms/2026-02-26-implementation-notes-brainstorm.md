---
date: 2026-02-26
topic: implementation-notes
---

# Capture Implementation Gotchas via Step Notes

## What We're Building

Formalize the per-step `note` field in task files so implementation sessions record deviations and surprises as they
happen. Wrap-up reads notes instead of trying to rediscover gotchas from the diff.

## Why This Matters

Wrap-up step 4b ("check for implementation gotchas") relies on session memory. When wrap-up runs in a different session
than implementation — which is common — that memory doesn't exist. The diff-based fallback is strictly worse at spotting
gotchas than the implementor was at the time. Notes capture knowledge at the point of discovery.

## Settled Decisions

- **Scope**: Deviations (did Y instead of X) and surprises (unexpected behavior encountered). Not pattern discovery —
  that's a different concern.
- **Location**: Per-step `note` field on the task file step object. Collocated with the action it annotates. Already
  used ad-hoc in practice (6 steps in the action-registry task file have notes).
- **Trigger**: Unconditional. Every step gets a note when marked `done`. Steps completed as planned say "As planned."
  Absence of a note on a done step is a rule violation.
- **Enforcement**: Workflow rule in `plan.md` implementation instructions. No mechanical validator — the action is cheap
  enough that instruction compliance is sufficient.
- **Wrap-up change**: Step 4b changes from "review the implementation for gotchas" to "review step notes for gotchas
  worth documenting." No diff-based rediscovery.
- **Schema**: `note` field added to the step object schema in `plan.md`. Type: string. Required when `done: true`.

## Changes Required

1. **`plan.md`** — Add `note` to step schema. Add implementation rule: "When marking a step done, add a `note` field.
   If the step went as planned, write 'As planned.' If you deviated or hit something unexpected, describe what and why."
2. **`wrap-up.md`** — Replace step 4b with: "Read all step notes from the task file. For any note that isn't
   'As planned', evaluate whether the deviation or surprise should be captured in the Knowledge Destination doc. Ask:
   'Step N noted: {note}. Add to {destination}, or skip?'"

## Knowledge Destination

none — knowledge lives in the workflow files themselves.

## Open Questions

None.
