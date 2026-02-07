# Style System Gaps

Known gaps discovered during workflow consolidation. Each needs real-world usage to calibrate before implementing.

## Testing Strategy — Resolved

Calibrated via end-to-end test (date-filter-keyboard-nav plan generation):

- **TDD generation rule**: Generate TDD steps only when implementation introduces domain logic (branching, data transformation, business rules). Skip for wiring, config/lookup entries, pass-through props — those test plumbing, not behavior. Rule added to `plan.md` generation rules table.
- **Browser vs TAP heuristic**: TAP when code under test is a pure function (selector, action reducer, utility). Browser test when behavior requires DOM interaction (focus, keyboard events, visual state). DOM-dependent behaviors go in `verification` list for manual checking until automated browser test infrastructure matures.
- **Action test coverage**: Every new Action variant gets a TAP test exercising dispatch → reducer → new state. Rule added to `plan.md` generation rules table.

## UI / Action / Keymap Coverage

- **Every UI interaction → Action variant**: Architectural invariant that isn't mechanically enforced. Should the react-component style card state this? Or is it a review-agent check?
- **Keymap parity**: Keyboard accessibility must match mouse interactions. Need guidance on when/how to validate this. Related to the keyboard-accessibility specs in `specifications/keyboard-accessibility/`.
- **Keymap testing**: The deleted `agent-native-testing.md` had some relevant content about validating that keybindings work. Need a replacement — possibly a test pattern or browser-test checklist.

## Layer Boundary Validation (cli-style-validator)

- **Import-based layer checks**: Validate that files don't import from wrong layers. File type determined by style_card mapping (*.jsx → component, **/selectors.js → selector, *.type.js → business logic, *.tap.js → test, other *.js → utility). Rules: component must not import store internals directly; selector must not import React; utility must not import Redux. ~1-2 AST rules.
- **Bulk validator runs**: Run all files in quicken-web-app/src/ and design-system/src/ through the validator once layer rules are stable. Expect significant output — track as a dedicated cleanup effort.

## Complexity Heuristics (cli-style-validator)

- 5 new AST rules from the spec (useSelector >5, useCallback >3, params >4, chained ops >2, local bindings >8) — not yet implemented. Need to prototype on real files to validate thresholds before adding to validator.

## Undiscovered Rules

- Jeff noted "some of the rules I want are missing and others are not stated yet." The end-to-end test (step 22) should surface these. Update this file as gaps are found.
