# F104 Component Decomposition Implementation

## Decomposition Strategy

### Phase 1: Extract DragDropHandler Component
**Target**: Lines 53-233 of SegmentedCurbEditor.jsx
**Responsibility**: All drag and drop logic (segment reordering)

```javascript
// components/SegmentedCurbEditor/DragDropHandler.jsx
const DragDropHandler = ({ 
  segments, 
  onSwap, 
  draggingIndex, 
  setDraggingIndex,
  dragPreviewPos,
  setDragPreviewPos 
}) => {
  // Move all buildSwapHandler, buildDragStartHandler, buildDropHandler logic here
  // Move all touch event handlers for drag/drop here
  // Return drag event handlers for parent to attach
}
```

### Phase 2: Extract SegmentRenderer Component  
**Target**: Lines 260-295 of SegmentedCurbEditor.jsx
**Responsibility**: Visual segment rendering

```javascript
// components/SegmentedCurbEditor/SegmentRenderer.jsx  
const SegmentRenderer = ({ 
  segment, 
  index, 
  total, 
  isDragging, 
  dragHandlers 
}) => {
  // Move renderSegment logic here
  // Handle segment styling and basic event attachment
}
```

### Phase 3: Extract LabelLayer Component
**Target**: Lines 366-413 of SegmentedCurbEditor.jsx  
**Responsibility**: Label positioning and dropdown interactions

```javascript
// components/SegmentedCurbEditor/LabelLayer.jsx
const LabelLayer = ({ 
  segments, 
  tickPoints, 
  total, 
  smartLabelPositions,
  editingIndex,
  setEditingIndex,
  onChangeType,
  onAddLeft 
}) => {
  // Move renderLabel and renderDropdownItems logic here
  // Handle label click handlers and dropdown state
}
```

### Phase 4: Extract DividerLayer Component
**Target**: Lines 301-333 of SegmentedCurbEditor.jsx
**Responsibility**: Segment boundary resizing

```javascript
// components/SegmentedCurbEditor/DividerLayer.jsx
const DividerLayer = ({ 
  segments, 
  total, 
  unknownRemaining,
  onDirectDragStart 
}) => {
  // Move renderDivider logic here
  // Handle divider positioning and drag start events
}
```

### Phase 5: Slim Down Main Component
**Target**: Reduce SegmentedCurbEditor.jsx to orchestration only

```javascript
// components/SegmentedCurbEditor.jsx (final state)
const SegmentedCurbEditor = ({ blockfaceLength = 240 }) => {
  // Redux selectors and dispatch
  // State management for UI interactions
  // Orchestrate child components
  // Handle direct drag operations (boundary adjustment)
  // Render container with child components
}
```

## File Structure After Decomposition

```
src/components/
├── SegmentedCurbEditor.jsx              # Main container (100-150 lines)
├── SegmentedCurbEditor/
│   ├── DragDropHandler.jsx              # Drag/drop segment reordering
│   ├── SegmentRenderer.jsx              # Individual segment rendering  
│   ├── LabelLayer.jsx                   # Label positioning & dropdowns
│   ├── DividerLayer.jsx                 # Boundary resizing handles
│   └── index.js                         # Clean exports
├── CurbTable.jsx
├── MapboxMap.jsx
└── NumberPad.jsx
```

## Implementation Order

### Step 1: DragDropHandler (Safest First)
- Extract all drag/drop logic into separate component
- Test that segment reordering still works
- Verify mobile touch events function properly

### Step 2: SegmentRenderer  
- Move segment visual rendering logic
- Ensure styling and proportions remain identical
- Test drag events are properly attached

### Step 3: LabelLayer
- Extract label positioning and dropdown logic  
- Verify label interactions (click, dropdown, type changes)
- Test "Add left" functionality

### Step 4: DividerLayer
- Move boundary resizing divider logic
- Test divider positioning and drag operations
- Verify unknown space dividers work correctly

### Step 5: Main Component Cleanup
- Remove extracted logic from main component
- Clean up imports and unused state
- Verify all interactions work end-to-end

## Testing Strategy

### Unit Testing Approach
Each extracted component should be testable with:
- Mock Redux store for state dependencies
- Jest + React Testing Library for interactions
- Mock functions for event handlers

### Integration Testing
- Test main SegmentedCurbEditor with all child components
- Verify no regressions in drag/drop/resize operations
- Test mobile touch interactions work correctly

## Risk Mitigation

### Rollback Strategy
Each step creates a single focused commit that can be reverted independently without affecting other changes.

### Behavior Preservation
- No logic changes during extraction - only moving code
- All existing prop interfaces maintained
- Redux integration patterns unchanged

### Performance Considerations  
- Minimize prop drilling by keeping components connected to Redux where needed
- Use React.memo only if performance regressions are observed
- Maintain existing event handler patterns to avoid re-render issues
