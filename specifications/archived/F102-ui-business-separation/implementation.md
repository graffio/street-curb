# UI/Business Logic Separation Implementation

**Date:** 2025.07.27  
**Purpose:** Technical details for extracting business logic from UI components

## Business Logic to Extract

### **From SegmentedCurbEditor.jsx**

**Segment Operations (Lines 84-117):**
```javascript
// MOVE TO: curbStore.js actions
const buildAddLeftHandler = (updateRedux, setEditingIndex) => index => {
    const desiredLength = 10
    const canSplitCurrent = fromSegment.length >= desiredLength + 1
    // Complex splitting logic...
}
```
→ **New Action:** `addSegmentLeft(index, desiredLength)`

**Position Calculations (Lines 335-341):**
```javascript
// MOVE TO: selectors.js
const calculatePositionPercent = () => {
    let positionPercent = 0
    for (let j = 0; j <= i; j++) {
        positionPercent += (segments[j].length / total) * 100
    }
    return positionPercent
}
```
→ **New Selector:** `selectSegmentPositions`

**Tick Point Generation (Lines 40-51):**
```javascript
// MOVE TO: selectors.js
const buildTickPoints = (segments, unknownRemaining) => {
    const addCumulative = (acc, s) => [...acc, acc[acc.length - 1] + s.length]
    // Cumulative position logic...
}
```
→ **New Selector:** `selectTickPoints`

### **From CurbTable.jsx**

**Start Position Calculation (Lines 29-36):**
```javascript
// MOVE TO: selectors.js (reuse from SegmentedCurbEditor)
const calculateStartPositions = segments => {
    let cumulative = 0
    return segments.map(segment => {
        const start = cumulative
        cumulative += segment.length
        return start
    })
}
```
→ **Use Existing:** `selectSegmentPositions`

**Dropdown Position Logic (Lines 44-47):**
```javascript
// MOVE TO: utils/geometry.js
const calculateDropdownPosition = button => {
    const rect = button.getBoundingClientRect()
    return { top: rect.bottom + 4, left: rect.left, width: rect.width }
}
```
→ **New Utility:** `calculateDropdownPosition`

## New Redux Structure

### **Enhanced Store (curbStore.js)**
```javascript
// New Actions
export const addSegmentLeft = (index, desiredLength = 10) => (dispatch, getState) => {
    const { segments } = getState().curb
    const result = performSegmentSplit(segments, index, desiredLength)
    if (result.success) {
        dispatch(replaceSegments(result.segments))
    }
}

// New Selectors
export const selectSegmentPositions = createSelector(
    [selectSegments],
    segments => calculateCumulativePositions(segments)
)

export const selectTickPoints = createSelector(
    [selectSegments, selectUnknownRemaining],
    (segments, unknownRemaining) => buildTickPointArray(segments, unknownRemaining)
)

export const selectVisualPercentages = createSelector(
    [selectSegments, selectBlockfaceLength],
    (segments, total) => segments.map(s => (s.length / total) * 100)
)
```

### **Pure Business Logic (utils/segments.js)**
```javascript
/**
 * Attempts to split a segment or adjacent segment to create space
 * @sig performSegmentSplit :: ([Segment], Number, Number) -> { success: Boolean, segments: [Segment]?, error: String? }
 */
export const performSegmentSplit = (segments, index, desiredLength) => {
    const fromSegment = segments[index]
    if (!fromSegment) return { success: false, error: 'Invalid segment index' }

    const canSplitCurrent = fromSegment.length >= desiredLength + 1
    if (canSplitCurrent) {
        return {
            success: true,
            segments: splitCurrentSegment(segments, index, desiredLength)
        }
    }

    const canSplitPrevious = index > 0 && segments[index - 1].length >= desiredLength + 1
    if (canSplitPrevious) {
        return {
            success: true,
            segments: splitPreviousSegment(segments, index, desiredLength)
        }
    }

    return { success: false, error: 'Insufficient space to create new segment' }
}

/**
 * Calculates cumulative positions for segment rendering
 * @sig calculateCumulativePositions :: [Segment] -> [Number]
 */
export const calculateCumulativePositions = segments => {
    let cumulative = 0
    return segments.map(segment => {
        const start = cumulative
        cumulative += segment.length
        return start
    })
}
```

### **Geometry Utilities (utils/geometry.js)**
```javascript
/**
 * Calculates dropdown positioning relative to button
 * @sig calculateDropdownPosition :: Element -> { top: Number, left: Number, width: Number }
 */
export const calculateDropdownPosition = button => {
    const rect = button.getBoundingClientRect()
    return { 
        top: rect.bottom + 4, 
        left: rect.left, 
        width: rect.width 
    }
}

/**
 * Maps touch coordinates to segment indices
 * @sig findSegmentUnderTouch :: (Element, Number) -> Number
 */
export const findSegmentUnderTouch = (container, touchCoord) => {
    let totalSize = 0
    const segments = container.children

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]
        if (!segment.classList.contains('segment')) continue

        const segmentSize = segment.offsetHeight
        if (touchCoord >= totalSize && touchCoord <= totalSize + segmentSize) return i
        totalSize += segmentSize
    }

    return -1
}
```

## Simplified Components

### **SegmentedCurbEditor.jsx (Simplified)**
```javascript
// Remove business logic, use Redux selectors
const SegmentedCurbEditor = ({ blockfaceLength = 240, blockfaceId }) => {
    const dispatch = useDispatch()
    const segments = useSelector(selectSegments)
    const tickPoints = useSelector(selectTickPoints)
    const segmentPositions = useSelector(selectSegmentPositions)
    const visualPercentages = useSelector(selectVisualPercentages)
    
    // Simplified handlers - just dispatch actions
    const handleAddLeft = useCallback(index => {
        dispatch(addSegmentLeft(index))
        setEditingIndex(null)
    }, [dispatch])

    // Pure UI rendering functions remain unchanged
    // Event handlers simplified to action dispatches
}
```

### **CurbTable.jsx (Simplified)**
```javascript
// Use shared selectors instead of local calculations
const CurbTable = ({ blockfaceLength = 240 }) => {
    const segments = useSelector(selectSegments)
    const startPositions = useSelector(selectSegmentPositions)
    
    // Remove calculateStartPositions - use selector
    // Simplified handlers - pure UI concerns only
}
```

## Migration Strategy

### **Phase 1: Extract Pure Functions**
1. Create `utils/segments.js` with business logic
2. Create `utils/geometry.js` with UI utilities
3. Add comprehensive tests for all extracted functions

### **Phase 2: Enhance Redux Store**
1. Add new selectors using pure functions
2. Add new actions for complex operations
3. Test Redux layer thoroughly

### **Phase 3: Simplify Components**
1. Replace local logic with selector usage
2. Simplify event handlers to action dispatches
3. Verify UI behavior unchanged

### **Phase 4: Cleanup**
1. Remove unused helper functions from components
2. Remove duplicated logic between components
3. Verify performance with React DevTools

## File Changes Summary

**New Files:**
- `src/utils/segments.js` - Pure business logic functions
- `src/utils/geometry.js` - UI calculation utilities
- `test/segments.tap.js` - Business logic tests
- `test/geometry.tap.js` - Utility function tests

**Modified Files:**
- `src/store/curbStore.js` - Enhanced with selectors and actions
- `src/components/SegmentedCurbEditor.jsx` - Simplified to presentation logic
- `src/components/CurbTable.jsx` - Use shared selectors

**Expected Results:**
- ~200 lines moved from components to testable functions
- 40-50% reduction in component complexity
- 100% test coverage for business logic
- Identical UI behavior and performance