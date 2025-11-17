# Task 3: Implement Blockface Diff Logic

- Create `src/utils/diff-blockface.js` with `diffBlockfaces(oldBlockface, newBlockface)` function
- Compare segments arrays: detect added, removed, and modified segments
- Return object: `{ added: [{index, segment}], modified: [{index, field, oldValue, newValue}], removed: [{index, segment}] }`
- Handle edge cases: no previous blockface (all added), identical blockfaces (empty arrays)
- Write tests in `test/diff-blockface.tap.js`
