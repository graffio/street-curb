# UI Simplification Implementation

**Date:** 2025.07.27  
**Purpose:** Technical details for removing Unknown label complexity

## Specific Code Changes

### **SegmentedCurbEditor.jsx**
**Remove Unknown Label Function:**
```javascript
// DELETE: Lines 413-480 renderUnknownLabel() function entirely
// DELETE: Lines 760-768 Unknown label render call
```

**Add Header Controls:**
```javascript
// ADD: After line 722, before segment container
<div className="segment-controls-header">
    <span>Remaining: {formatLength(unknownRemaining)} ft</span>
    {segments.length === 0 && unknownRemaining > 0 && (
        <button onClick={() => dispatch(addSegment(0))}>
            + Add First Segment
        </button>
    )}
    {segments.length > 0 && unknownRemaining > 0 && (
        <button onClick={() => dispatch(addSegment(segments.length))}>
            + Add Segment
        </button>
    )}
</div>
```

### **CurbTable.jsx**
**Update Empty State:**
```javascript
// REPLACE: Line 265 empty render
// FROM: {segments && segments.length > 0 ? segments.map(renderTableRow) : null}
// TO: Show dedicated empty state with add button
```

**Add Header Controls:**
```javascript
// ADD: Similar header structure in table header area
```

## Integration Points
- Redux `addSegment()` action - unchanged
- Mathematical invariant validation - unchanged
- Map synchronization - unchanged
- Mobile touch interaction - unchanged

## Edge Cases
- Empty state: Show "Add First Segment" prominently
- Near-complete: Small unknown space still shows add button
- Complete state: Hide add buttons when unknownRemaining = 0