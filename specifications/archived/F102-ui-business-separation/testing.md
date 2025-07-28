# UI/Business Logic Separation Testing

**Date:** 2025.07.27  
**Purpose:** Test strategy for business logic extraction

## Test Strategy
Focus on comprehensive testing of extracted business logic while ensuring UI behavior remains unchanged.

## New Test Files

### **Business Logic Tests (test/segments.tap.js)**
```javascript
test('segment splitting operations', t => {
    t.test('Given a segment with sufficient length', t => {
        t.test('When splitting current segment', t => {
            const segments = [{ id: 's1', type: 'Parking', length: 30 }]
            const result = performSegmentSplit(segments, 0, 10)
            
            t.ok(result.success, 'Then split operation succeeds')
            t.equal(result.segments.length, 2, 'Then two segments exist')
            t.equal(result.segments[0].length, 10, 'Then first segment has desired length')
            t.equal(result.segments[1].length, 20, 'Then second segment has remaining length')
            t.end()
        })
        t.end()
    })
})

test('cumulative position calculations', t => {
    t.test('Given segments with known lengths', t => {
        t.test('When calculating start positions', t => {
            const segments = [
                { length: 20 }, 
                { length: 30 }, 
                { length: 15 }
            ]
            const positions = calculateCumulativePositions(segments)
            
            t.equal(positions[0], 0, 'Then first segment starts at 0')
            t.equal(positions[1], 20, 'Then second segment starts at 20')
            t.equal(positions[2], 50, 'Then third segment starts at 50')
            t.end()
        })
        t.end()
    })
})
```

### **Geometry Utilities Tests (test/geometry.tap.js)**
```javascript
test('dropdown position calculations', t => {
    t.test('Given a button element', t => {
        t.test('When calculating dropdown position', t => {
            const mockButton = {
                getBoundingClientRect: () => ({
                    bottom: 100,
                    left: 50,
                    width: 80
                })
            }
            const position = calculateDropdownPosition(mockButton)
            
            t.equal(position.top, 104, 'Then dropdown positioned below button with gap')
            t.equal(position.left, 50, 'Then dropdown aligned with button left')
            t.equal(position.width, 80, 'Then dropdown matches button width')
            t.end()
        })
        t.end()
    })
})
```

### **Redux Selector Tests (test/selectors.tap.js)**
```javascript
test('segment position selectors', t => {
    t.test('Given Redux state with segments', t => {
        t.test('When selecting tick points', t => {
            const state = {
                curb: {
                    segments: [{ length: 60 }, { length: 40 }],
                    unknownRemaining: 140,
                    blockfaceLength: 240
                }
            }
            const tickPoints = selectTickPoints(state)
            
            t.equal(tickPoints.length, 4, 'Then has start, segment ends, and final tick')
            t.equal(tickPoints[0], 0, 'Then starts at 0')
            t.equal(tickPoints[1], 60, 'Then first segment end at 60')
            t.equal(tickPoints[2], 100, 'Then second segment end at 100') 
            t.equal(tickPoints[3], 240, 'Then final tick at blockface end')
            t.end()
        })
        t.end()
    })
})
```

## Regression Testing

### **Component Behavior Tests**
- **UI Unchanged**: All existing visual behavior preserved
- **Event Handling**: Click, drag, touch interactions work identically  
- **Mathematical Invariant**: Preserved through all operations
- **Performance**: No measurable slowdown in rendering or interactions

### **Integration Tests**  
- **Redux Integration**: New selectors work with existing state
- **Component Integration**: Simplified components use new selectors correctly
- **End-to-End**: Complete user workflows function identically

## Test Coverage Goals

### **Business Logic: 100% Coverage**
- All segment operations tested with edge cases
- Position calculations verified with various inputs
- Error conditions properly handled and tested

### **Redux Layer: 95% Coverage** 
- All new selectors tested with realistic state
- New actions tested with various scenarios
- Performance of memoized selectors verified

### **UI Components: Behavioral Testing**
- Focus on user interactions, not implementation details
- Verify mathematical invariant preservation
- Ensure responsive behavior on mobile/desktop

## Success Criteria

- **All existing tests pass**: No regressions in current functionality
- **New business logic fully tested**: 100% coverage for extracted functions  
- **Performance maintained**: No increase in render times or memory usage
- **UI behavior identical**: Users notice no changes in interface behavior

## Testing Commands

```bash
# Run all tests
yarn tap test/

# Run specific test suites  
yarn tap test/segments.tap.js
yarn tap test/geometry.tap.js
yarn tap test/selectors.tap.js

# Run with coverage
yarn tap test/ --coverage-report=lcov
```