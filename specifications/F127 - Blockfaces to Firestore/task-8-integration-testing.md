# Task 8: Integration Testing

- Create `test/blockface-persistence.tap.js` test file
- Test: Edit segment, wait 3s, verify BlockfaceSaved action dispatched
- Test: Edit multiple segments rapidly, verify only one save after 3s
- Test: Switch blockface, verify previous blockface saved immediately
- Test: Diff logic produces correct change objects (added/modified/removed) for various edit scenarios
