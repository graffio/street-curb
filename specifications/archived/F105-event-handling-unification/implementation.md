# F105 Event Handling Unification Implementation

## Current Duplication Analysis

### Duplicated Logic Patterns
```javascript
// Pattern 1: Coordinate Extraction (4 locations)
const touch = e.touches[0]
const startCoord = touch.clientY
// vs
const startCoord = e.clientY

// Pattern 2: Event Prevention (3 locations)  
if (e.target.classList.contains('divider')) {
    e.preventDefault() // touch only
    return
}
// vs
if (e.target.classList.contains('divider')) return // mouse only

// Pattern 3: Drag Data Setup (2 locations)
dragData.current = { 
    index: i, 
    startY: touch.clientY,     // touch version
    startX: touch.clientX,
    // ... 
}
// vs  
dragData.current = { index: i } // mouse version
```

## Unified Event System Design

### Core Event Normalizer
```javascript
// utils/eventNormalization.js
/**
 * Normalizes touch and mouse events into consistent interface
 * @sig normalizePointerEvent :: Event -> NormalizedEvent
 */
const normalizePointerEvent = (event) => {
    const isTouch = event.type.startsWith('touch')
    const source = isTouch ? event.touches[0] : event
    
    return {
        clientX: source.clientX,
        clientY: source.clientY,
        pageX: source.pageX,
        pageY: source.pageY,
        type: isTouch ? 'touch' : 'mouse',
        originalEvent: event,
        preventDefault: () => event.preventDefault(),
        stopPropagation: () => event.stopPropagation()
    }
}

/**
 * Detects if element should ignore pointer events (dividers, etc.)
 * @sig shouldIgnoreEvent :: (Event, [String]) -> Boolean  
 */
const shouldIgnoreEvent = (event, ignoreClasses = ['divider']) => {
    return ignoreClasses.some(className => 
        event.target.classList.contains(className)
    )
}

export { normalizePointerEvent, shouldIgnoreEvent }
```

### Unified Drag Handler Factory
```javascript
// components/SegmentedCurbEditor/hooks/useUnifiedDrag.js
/**
 * Creates unified drag handlers that work for both touch and mouse
 * @sig useUnifiedDrag :: DragConfig -> DragHandlers
 */
const useUnifiedDrag = ({ 
    onDragStart, 
    onDragMove, 
    onDragEnd, 
    ignoreClasses = ['divider'] 
}) => {
    const createStartHandler = (index) => (event) => {
        if (shouldIgnoreEvent(event, ignoreClasses)) {
            event.preventDefault()
            return
        }
        
        const normalized = normalizePointerEvent(event)
        onDragStart(index, normalized)
    }
    
    const createMoveHandler = (startData) => (event) => {
        const normalized = normalizePointerEvent(event)
        onDragMove(startData, normalized)
    }
    
    const createEndHandler = (startData) => (event) => {
        const normalized = normalizePointerEvent(event)
        onDragEnd(startData, normalized)
    }
    
    return {
        createStartHandler,
        createMoveHandler, 
        createEndHandler
    }
}
```

### Unified Preview System
```javascript
// components/SegmentedCurbEditor/DragPreview.jsx
/**
 * Single drag preview component that handles both touch and mouse
 * @sig DragPreview :: PreviewProps -> JSXElement
 */
const DragPreview = ({ 
    isVisible, 
    position, 
    segment, 
    total,
    inputType  // 'touch' | 'mouse' | null
}) => {
    if (!isVisible || !segment) return null
    
    const previewStyle = {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: COLORS[segment.type] || '#999',
        zIndex: 200,
        pointerEvents: 'none',
        // Touch-specific styling
        ...(inputType === 'touch' && {
            border: '2px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '6px',
            opacity: 0.9,
            transform: 'scale(1.08)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
            filter: 'brightness(1.1)'
        }),
        width: inputType === 'touch' ? '80px' : '100%',
        height: `${(segment.length / total) * 100}%`
    }
    
    return <div className="drag-preview" style={previewStyle} />
}
```

## Migration Strategy

### Phase 1: Create Unified Utilities
- Implement `eventNormalization.js` utility
- Create `useUnifiedDrag` hook  
- Build unified `DragPreview` component
- Write comprehensive tests for new utilities

### Phase 2: Migrate DragDropHandler Component
```javascript
// Before: Separate touch/mouse handlers
const buildTouchStartHandler = (dragData, setDraggingIndex, i, containerRef, setDragPreviewPos) => e => { /* 20 lines */ }
const buildDragStartHandler = (dragData, setDraggingIndex, i) => e => { /* 10 lines */ }

// After: Single unified handler
const { createStartHandler } = useUnifiedDrag({
    onDragStart: (index, normalizedEvent) => {
        // Combined logic from both handlers
    },
    onDragMove: (startData, normalizedEvent) => {
        // Combined move logic  
    },
    onDragEnd: (startData, normalizedEvent) => {
        // Combined end logic
    }
})
```

### Phase 3: Migrate Boundary Drag System
Replace direct drag implementation in main component:
```javascript
// Before: Separate touch/mouse coordinate extraction
const startCoord = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY
const currentCoord = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientY : moveEvent.clientY

// After: Unified coordinate access
const startCoord = normalizePointerEvent(e).clientY  
const currentCoord = normalizePointerEvent(moveEvent).clientY
```

### Phase 4: Clean Up Global Event Listeners
Simplify global touch listener setup:
```javascript
// Before: Touch-specific global handlers
const buildGlobalTouchHandlers = (containerRef, dragData, setDragPreviewPos, handleSwap, setDraggingIndex) => { /* complex */ }

// After: Unified global handlers
const setupGlobalPointerListeners = (containerRef, dragHandlers) => {
    // Single set of event listeners that work for both input types
}
```

## Event Handler Mapping

### Segment Reordering Events
```javascript
// Unified event attachment
<div
    onPointerDown={createStartHandler(index)}
    onDragStart={createStartHandler(index)} // Desktop drag/drop fallback
    // Remove separate onTouchStart/onMouseDown handlers
/>
```

### Boundary Resizing Events  
```javascript
// Unified divider events
<div
    className="divider"
    onPointerDown={e => handleDirectDragStart(e, index)}
    // Remove separate onMouseDown/onTouchStart handlers
/>
```

## Browser Compatibility

### Pointer Events Support
- **Modern browsers**: Use Pointer Events API for unified handling
- **Legacy browsers**: Fall back to touch/mouse events with unified normalization
- **Detection logic**: Runtime capability detection rather than user agent sniffing

### Event Passive Handling
```javascript
// Maintain existing passive/non-passive event patterns
const eventOptions = {
    passive: false,  // For preventDefault() support
    capture: false
}
```

## Testing Strategy

### Unit Tests for Utilities
```javascript
// Test event normalization
test('normalizePointerEvent extracts touch coordinates', () => {
    const touchEvent = { type: 'touchstart', touches: [{ clientX: 100, clientY: 200 }] }
    const normalized = normalizePointerEvent(touchEvent)
    expect(normalized.clientX).toBe(100)
    expect(normalized.type).toBe('touch')
})

// Test mouse event normalization  
test('normalizePointerEvent extracts mouse coordinates', () => {
    const mouseEvent = { type: 'mousedown', clientX: 150, clientY: 250 }
    const normalized = normalizePointerEvent(mouseEvent)
    expect(normalized.clientX).toBe(150)
    expect(normalized.type).toBe('mouse')
})
```

### Integration Tests
- Test drag operations work identically with touch and mouse
- Verify event prevention logic works for both input types
- Test drag preview appears correctly for both interaction modes

## Risk Mitigation

### Rollback Strategy
Each migration phase creates isolated commits that can be reverted independently without breaking functionality.

### Behavior Preservation
- Maintain exact same user experience for touch and mouse users
- Preserve existing event timing and coordinate accuracy
- Keep same drag preview visual behavior

### Performance Monitoring
- Ensure event normalization doesn't add measurable latency
- Monitor for any increase in memory usage from unified handlers
- Test responsiveness on lower-end mobile devices