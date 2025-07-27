# Segment Management Implementation Guide

**Date:** 2025.07.24  
**Purpose:** Complete implementation instructions for Unknown-as-system-state refactor

## The Refactor Decision
Change Unknown from fake segment to system state. Store only real user segments in array, track remaining space separately.

## Data Model Changes

### Before (Wrong)
```javascript
state = {
  segments: [
    {id: 's1', type: 'Parking', length: 15.3},
    {id: 'unknown', type: 'Unknown', length: 224.7}  // Fake segment
  ]
}
```

### After (Correct) 
```javascript
state = {
  segments: [
    {id: 's1', type: 'Parking', length: 15.3}  // Real segments only
  ],
  unknownRemaining: 224.7,      // System state
  isCollectionComplete: false   // Lifecycle tracking
}
```

## Core Implementation: Universal Boundary Adjustment

Replace all segment modification logic with this single operation:

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
```

## Redux Changes

### Remove These Actions
- `UPDATE_START_POSITION` (forbidden by specification)
- All `findIndex(seg => seg.type === 'Unknown')` logic

### Simplify All Reducers
```javascript
// Old way (complex)
case UPDATE_SEGMENT_LENGTH: {
    const unknownIndex = segments.findIndex(seg => seg.type === 'Unknown')
    // 20+ lines of Unknown manipulation...
}

// New way (simple)
case UPDATE_SEGMENT_LENGTH: {
    const { index, newLength } = action.payload
    return adjustSegmentBoundary(state, index, newLength)
}
```

### Update Selectors
```javascript
// Remove
export const selectUnknownSegment = state => state.curb.segments.find(seg => seg.type === 'Unknown')

// Add
export const selectUnknownRemaining = state => state.curb.unknownRemaining
export const selectIsCollectionComplete = state => state.curb.isCollectionComplete
```

## UI Component Changes

### CurbTable.jsx
```javascript
// Remove Unknown from table rendering
const renderRows = segments => segments.map(renderSegment)  // No filter needed

// Add Unknown status to header
const renderHeader = (unknownRemaining) => (
    <div className="header">
        {unknownRemaining > 0 
            ? `Remaining: ${formatLength(unknownRemaining)}`
            : 'Collection Complete'
        }
    </div>
)

// Simplify add button logic
const canAddSegments = unknownRemaining > 0
```

### SegmentedCurbEditor.jsx
```javascript
// Remove Unknown from segment rendering
const renderSegments = segments => segments.map(renderSegment)

// Add Unknown as separate visual element
const renderUnknownSpace = (unknownRemaining, blockfaceLength) => {
    if (unknownRemaining <= 0) return null
    
    const widthPercent = (unknownRemaining / blockfaceLength) * 100
    return (
        <div 
            className="unknown-space" 
            style={{ width: `${widthPercent}%` }}
        >
            {formatLength(unknownRemaining)} remaining
        </div>
    )
}
```

## Migration Steps

1. **Add new state fields** (`unknownRemaining`, `isCollectionComplete`)
2. **Implement `adjustSegmentBoundary`** function
3. **Replace all reducer logic** with boundary adjustment calls
4. **Update UI components** to handle Unknown as system state
5. **Remove Unknown segments** from arrays entirely
6. **Update selectors** to use new state fields
7. **Test mathematical invariant** after each step

## Validation Rules

### Critical Invariant
Always true: `sum(segments.length) + unknownRemaining = blockfaceLength`

### State Rules
- `unknownRemaining >= 0`
- `segments.every(seg => seg.length > 0)`
- `segments.every(seg => seg.type !== 'Unknown')`
- `isCollectionComplete === (unknownRemaining === 0)`

## Testing Approach

Create mathematical invariant test that runs after every operation:
```javascript
const validateInvariant = state => {
    const total = state.segments.reduce((sum, seg) => sum + seg.length, 0)
    return Math.abs(total + state.unknownRemaining - state.blockfaceLength) < 0.01
}
```

Run this test continuously during refactor - if it ever fails, stop and fix before continuing.