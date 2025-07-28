# Segment Management Summary

**Date:** 2025.07.24  
**Purpose:** Essential decisions for segment management refactor

## Core Decision
Unknown space is **system state**, not segment data:
```javascript
{
  segments: [Segment],           // Real user segments only
  unknownRemaining: Number,      // Unmeasured space remaining  
  isCollectionComplete: Boolean  // True when unknown reaches 0
}
```

## Mathematical Invariant
**Always:** `sum(segments.length) + unknownRemaining = blockfaceLength`

## Universal Operation
All three interaction modes use boundary adjustment:
```javascript
/*
 * @sig adjustSegmentBoundary :: (State, Number, Number) -> State
 */
const adjustSegmentBoundary = (state, segmentIndex, newLength) => {
    // Adjust target segment + next segment OR unknown space
    // Maintain mathematical invariant
}
```

## Three Interaction Modes
1. **Field Collection** - Enter cumulative positions while walking
2. **Precision Correction** - Edit specific segment lengths
3. **Visual Adjustment** - Drag dividers between segments

## Unknown Space Lifecycle
- **Starts at blockface length** (e.g., 240ft)
- **Shrinks during field collection** 
- **Disappears forever at 0** (marks collection complete)
- **Never returns** once gone

## Success Criteria
Mathematical invariant must hold during entire refactor.

## Cross-References
- **Phase 2:** [UI Simplification](../2025.07.27-ui-simplification/summary.md) - Address overengineered Unknown label complexity