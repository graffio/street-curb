# UI Simplification Summary

**Date:** 2025.07.27  
**Purpose:** Remove Unknown label complexity from segment management UI

## Core Decision
Replace problematic Unknown floating label with simple header controls:
- **Remove:** Complex positioning logic: `left: unknownRemaining < 20 ? '120px' : '0px'`
- **Add:** Fixed "Add Segment" buttons in component headers
- **Keep:** All segment lozenges, Redux state, mathematical invariant

## Key Constraints
- **No model changes** - `unknownRemaining` stays in Redux state
- **No API changes** - All component props and actions unchanged  
- **Preserve functionality** - All existing segment operations work identically
- **Mathematical invariant** - `sum(segments.length) + unknownRemaining = blockfaceLength`

## Implementation Targets
1. **SegmentedCurbEditor**: Remove `renderUnknownLabel()` function (lines 413-480)
2. **Both components**: Add header with "Add First Segment" for empty state
3. **Both components**: Add "Add Segment" button when unknownRemaining > 0
4. **CurbTable**: Replace empty tbody with prominent add button

## Success Criteria
- Remove 47+ lines of Unknown positioning logic
- Eliminate z-index conflicts and conditional positioning
- Clear empty state handling (no segments = big add button)
- All existing tests pass without modification