# UI Simplification Testing

**Date:** 2025.07.27  
**Purpose:** Test strategy for Unknown label removal

## Test Strategy
Focus on regression testing - all existing functionality must work unchanged.

### **Regression Tests**
```javascript
test('segment operations unchanged after UI simplification', t => {
    t.test('Given existing segment functionality', t => {
        t.test('When Unknown label is removed', t => {
            t.ok(segmentResizing(), 'Then segment resizing still works')
            t.ok(typeChanging(), 'Then type changing still works') 
            t.ok(segmentAdding(), 'Then segment adding still works')
            t.equal(unknownCalculation(), expected, 'Then unknown calculation unchanged')
            t.end()
        })
        t.end()
    })
})
```

### **New UI Tests**
```javascript
test('empty state shows add first segment', t => {
    t.test('Given segments.length === 0', t => {
        t.test('When unknownRemaining > 0', t => {
            t.ok(addFirstButtonVisible(), 'Then add first segment button shows')
            t.end()
        })
        t.end()
    })
})
```

## Success Criteria
- All existing tests pass without modification
- Unknown space visual element still renders (dashed box)
- Unknown label no longer renders
- Header controls show appropriate buttons for each state