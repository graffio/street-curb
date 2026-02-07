# Style System Gaps

Known gaps discovered during workflow consolidation. Each needs real-world usage to calibrate before implementing.

## Testing Strategy

- **Agent-browser integration tests for UI**: When to write them, how many is too many (they're slow). Need a heuristic for "this UI interaction warrants a browser test" vs "tap test on the selector/action is sufficient."
- **TDD as a generation rule**: Should `/workflows:plan` mechanically insert "write failing test" steps before implementation steps? Or is the style card reminder enough?
- **Test coverage for Actions**: Every Action variant should have at least one test exercising the round-trip (dispatch → reducer → new state).

## UI / Action / Keymap Coverage

- **Every UI interaction → Action variant**: Architectural invariant that isn't mechanically enforced. Should the react-component style card state this? Or is it a review-agent check?
- **Keymap parity**: Keyboard accessibility must match mouse interactions. Need guidance on when/how to validate this. Related to the keyboard-accessibility specs in `specifications/keyboard-accessibility/`.
- **Keymap testing**: The deleted `agent-native-testing.md` had some relevant content about validating that keybindings work. Need a replacement — possibly a test pattern or browser-test checklist.

## Complexity Heuristics (cli-style-validator)

- 5 new AST rules from the spec (useSelector >5, useCallback >3, params >4, chained ops >2, local bindings >8) — not yet implemented. Need to prototype on real files to validate thresholds before adding to validator.

## Undiscovered Rules

- Jeff noted "some of the rules I want are missing and others are not stated yet." The end-to-end test (step 22) should surface these. Update this file as gaps are found.
