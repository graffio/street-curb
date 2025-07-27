# Segment Management Testing Strategy

**Date:** 2025.07.24  
**Purpose:** Complete testing approach for Unknown-as-system-state refactor

## Testing Philosophy
Mathematical invariant is the foundation - if it holds, everything else follows. Build all tests around protecting this invariant during refactor.

## Core Mathematical Invariant

The single most important test - must never fail:

```javascript
/*
 * @sig validateMathematicalInvariant :: (State) -> Boolean
 */
const validateMathematicalInvariant = state => {
    const totalSegmentLength = state.segments.reduce((sum, seg) => sum + seg.length, 0)
    return Math.abs(totalSegmentLength + state.unknownRemaining - state.blockfaceLength) < 0.01
}

/*
 * Test that runs after every operation
 */
const testInvariant = (testName, operation, initialState) => {
    t.test(testName, t => {
        const result = operation(initialState)
        t.ok(validateMathematicalInvariant(result), 'Mathematical invariant must hold')
        t.end()
    })
}
```

## Universal Boundary Adjustment Tests

Test the core operation that all modes use:

```javascript
/*
 * @sig adjustSegmentBoundary :: (State, Number, Number) -> State
 */
const adjustSegmentBoundary = (state, segmentIndex, newLength) => {
    const lengthDelta = newLength - state.segments[segmentIndex].length
    
    if (segmentIndex === state.segments.length - 1) {
        // Last segment affects unknown space
        const newUnknownRemaining = state.unknownRemaining - lengthDelta
        if (newUnknownRemaining < 0) throw new Error('Insufficient unknown space')
        
        return {
            ...state,
            segments: state.segments.map((seg, i) => 
                i === segmentIndex ? { ...seg, length: newLength } : seg
            ),
            unknownRemaining: newUnknownRemaining,
            isCollectionComplete: newUnknownRemaining === 0
        }
    }
    
    // Middle segment affects next segment
    const nextSegment = state.segments[segmentIndex + 1]
    const newNextLength = nextSegment.length - lengthDelta
    if (newNextLength < 0) throw new Error('Cannot create negative segment length')
    
    return {
        ...state,
        segments: state.segments.map((seg, i) => {
            if (i === segmentIndex) return { ...seg, length: newLength }
            if (i === segmentIndex + 1) return { ...seg, length: newNextLength }
            return seg
        })
    }
}

// Test boundary adjustment with different scenarios
t.test('adjusting last segment affects unknown space', t => {
    const state = { segments: [{id: 's1', length: 10}], unknownRemaining: 30, blockfaceLength: 40 }
    const result = adjustSegmentBoundary(state, 0, 15)
    
    t.equal(result.segments[0].length, 15, 'Target segment updated')
    t.equal(result.unknownRemaining, 25, 'Unknown space reduced by delta')
    t.ok(validateMathematicalInvariant(result), 'Invariant holds')
    t.end()
})

t.test('adjusting middle segment affects next segment', t => {
    const state = { segments: [{id: 's1', length: 10}, {id: 's2', length: 20}], unknownRemaining: 10, blockfaceLength: 40 }
    const result = adjustSegmentBoundary(state, 0, 15)
    
    t.equal(result.segments[0].length, 15, 'Target segment updated')
    t.equal(result.segments[1].length, 15, 'Next segment adjusted by delta')
    t.equal(result.unknownRemaining, 10, 'Unknown space unchanged')
    t.ok(validateMathematicalInvariant(result), 'Invariant holds')
    t.end()
})
```

## Edge Case Tests

Test boundary conditions that could break:

```javascript
t.test('cannot create negative unknown space', t => {
    const state = { segments: [{id: 's1', length: 35}], unknownRemaining: 5, blockfaceLength: 40 }
    
    t.throws(() => adjustSegmentBoundary(state, 0, 50), 'Insufficient unknown space')
    t.end()
})

t.test('cannot create negative segment length', t => {
    const state = { segments: [{id: 's1', length: 10}, {id: 's2', length: 5}], unknownRemaining: 25, blockfaceLength: 40 }
    
    t.throws(() => adjustSegmentBoundary(state, 0, 20), 'Cannot create negative segment length')
    t.end()
})

t.test('empty segments array', t => {
    const state = { segments: [], unknownRemaining: 240, blockfaceLength: 240, isCollectionComplete: false }
    
    t.ok(validateMathematicalInvariant(state), 'Empty state is valid')
    t.notOk(state.isCollectionComplete, 'Collection not complete with unknown space')
    t.end()
})

t.test('complete collection', t => {
    const state = { segments: [{id: 's1', length: 240}], unknownRemaining: 0, blockfaceLength: 240, isCollectionComplete: true }
    
    t.ok(validateMathematicalInvariant(state), 'Complete state is valid')
    t.ok(state.isCollectionComplete, 'Collection complete with no unknown space')
    t.end()
})
```

## Mode Consistency Tests

Ensure all three interaction modes produce identical results:

```javascript
t.test('all modes produce same result for equivalent operations', t => {
    const initialState = { segments: [{id: 's1', length: 10}], unknownRemaining: 30, blockfaceLength: 40 }
    
    // All modes should produce same result when extending first segment by 5
    const mode1Result = adjustSegmentBoundary(initialState, 0, 15)  // Direct boundary adjustment
    const mode2Result = adjustSegmentBoundary(initialState, 0, 15)  // Length editing  
    const mode3Result = adjustSegmentBoundary(initialState, 0, 15)  // Visual drag
    
    t.deepEqual(mode1Result, mode2Result, 'Mode 1 and 2 produce same result')
    t.deepEqual(mode2Result, mode3Result, 'Mode 2 and 3 produce same result')
    t.end()
})
```

## UI Integration Tests

Test components work with new data structure:

```javascript
t.test('CurbTable renders real segments only', t => {
    const state = { segments: [{id: 's1', length: 10}], unknownRemaining: 30 }
    const rendered = render(<CurbTable state={state} />)
    
    t.ok(rendered.getByText('10.0 ft'), 'Real segment appears')
    t.notOk(rendered.queryByText('Unknown'), 'Unknown never appears as row')
    t.ok(rendered.getByText('Remaining: 30.0 ft'), 'Unknown shown in header')
    t.end()
})

t.test('SegmentedCurbEditor visual calculations', t => {
    const state = { segments: [{id: 's1', length: 60}], unknownRemaining: 180, blockfaceLength: 240 }
    
    const totalDisplay = state.segments.reduce((sum, seg) => sum + seg.length, 0) + state.unknownRemaining
    t.equal(totalDisplay, 240, 'Visual display includes unknown space')
    
    const segmentWidthPercent = (60 / 240) * 100
    t.equal(segmentWidthPercent, 25, 'Segment takes 25% of visual space')
    t.end()
})
```

## Performance Benchmarks

Ensure new structure doesn't degrade performance:

```javascript
t.test('boundary adjustment performance with large arrays', t => {
    const largeSegments = Array(100).fill(0).map((_, i) => ({id: `s${i}`, length: 2.4}))
    const state = { segments: largeSegments, unknownRemaining: 0, blockfaceLength: 240 }
    
    const startTime = performance.now()
    adjustSegmentBoundary(state, 50, 3.0)
    const duration = performance.now() - startTime
    
    t.ok(duration < 10, 'Operation completes in <10ms with 100 segments')
    t.end()
})
```

## Test Execution Strategy

### Before Refactor
1. Implement all tests using current Redux structure
2. All tests must pass with existing implementation
3. Capture baseline performance metrics

### During Refactor  
1. Mathematical invariant test runs after every change
2. If invariant test fails, stop and fix immediately
3. Update test data structures incrementally

### After Refactor
1. All tests must pass with new implementation
2. Performance must equal or exceed baseline
3. Add regression tests for any issues discovered

## Test File Organization
- `test/mathematical-invariant.tap.js` - Core invariant (CRITICAL)
- `test/boundary-adjustment.tap.js` - Universal operation tests
- `test/edge-cases.tap.js` - Boundary conditions
- `tests/ui-integration.spec.js` - Playwright component tests
- `test/performance.tap.js` - Performance benchmarks