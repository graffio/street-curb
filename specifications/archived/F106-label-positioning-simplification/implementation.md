# F106 Label Positioning Simplification Implementation

## Current Complexity Analysis

### Problems with Existing System
```javascript
// label-positioning.js - Current approach problems:

// 1. Manual collision detection (lines 24-39, 45-60)
for (let i = 0; i < rects.length; i++) {
    for (let j = 0; j < i; j++) {
        if (!hasVerticalOverlap(rects[i], rects[j])) continue
        if (offsets[i] <= offsets[j]) offsets[i] = offsets[j] + 1  // Always pushes right!
    }
}

// 2. DOM measurements causing layout thrashing (lines 66-83)
labelElements.forEach(el => { if (el) el.style.width = 'auto' })
const maxWidth = labelElements.reduce((max, el) => Math.max(max, el.offsetWidth), 0)

// 3. Complex uniform width calculations (lines 102-103)
const uniformWidth = naturalMaxWidth - 1
const contentWidth = uniformWidth - 10 // Magic numbers
```

### Root Cause of Label Stacking Bug
**Line 34 in label-positioning.js:**
```javascript
if (offsets[i] <= offsets[j]) offsets[i] = offsets[j] + 1
```
This always increments rightward (`+ 1`) without checking if there's space to the left (`- 1`).

## CSS-Based Solution Design

### CSS Grid Approach (Primary)
```css
/* New approach: CSS Grid handles collision automatically */
.label-layer {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
    position: relative;
    pointer-events: none;
}

.floating-label {
    /* Let grid handle positioning automatically */
    position: relative;
    grid-row: 1;
    justify-self: start;
    pointer-events: all;
    
    /* Use CSS custom properties for dynamic positioning */
    transform: translateY(var(--label-offset-y, 0));
}

/* Dynamic positioning via CSS custom properties */
.floating-label[data-position="0"] { grid-column: 1; }
.floating-label[data-position="1"] { grid-column: 2; }
.floating-label[data-position="2"] { grid-column: 3; }
/* Generated dynamically based on available space */
```

### Container Query Approach (Modern)
```css
/* Container queries for responsive label sizing */
.label-layer {
    container-type: inline-size;
}

@container (max-width: 400px) {
    .floating-label {
        font-size: 0.8rem;
        padding: 4px 8px;
    }
}

@container (min-width: 600px) {
    .floating-label {
        font-size: 1rem;
        padding: 6px 12px;
    }
}
```

### Flexbox Fallback (Legacy Support)
```css
/* Fallback for browsers without grid support */
.label-layer {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: flex-start;
}

.floating-label {
    flex: 0 0 auto;
    position: relative;
    transform: translateY(var(--label-offset-y, 0));
}
```

## Implementation Strategy

### Phase 1: Create CSS-Based Label System
```javascript
// New simplified label positioning utility
// utils/cssLabelPositioning.js

/**
 * Calculates CSS custom properties for label positioning
 * @sig calculateCSSLabelPositions :: ([Segment], Number, Number) -> [CSSProperties]
 */
const calculateCSSLabelPositions = (segments, tickPoints, total) => {
    return segments.map((segment, i) => {
        const mid = tickPoints[i] + segment.length / 2
        const positionPct = (mid / total) * 100
        
        return {
            '--label-offset-y': `${positionPct}%`,
            '--label-column': determineLabelColumn(i, segments, positionPct)
        }
    })
}

/**
 * Determines optimal grid column for label to avoid overlaps
 * @sig determineLabelColumn :: (Number, [Segment], Number) -> Number
 */
const determineLabelColumn = (index, segments, positionPct) => {
    // Smart column assignment that prefers leftward positioning
    const occupiedColumns = getOccupiedColumns(segments, index, positionPct)
    
    // Try left columns first (fixes the stacking bug)
    for (let col = 1; col <= 4; col++) {
        if (!occupiedColumns.includes(col)) return col
    }
    
    return 1 // Fallback
}
```

### Phase 2: Update LabelLayer Component
```javascript
// components/SegmentedCurbEditor/LabelLayer.jsx (after F104)
const LabelLayer = ({ segments, tickPoints, total, editingIndex, setEditingIndex, onChangeType, onAddLeft }) => {
    const labelPositions = calculateCSSLabelPositions(segments, tickPoints, total)
    
    return (
        <div className="label-layer">
            {segments.map((segment, i) => (
                <div
                    key={`label-${segment.id}`}
                    className="floating-label"
                    style={labelPositions[i]}
                    data-position={labelPositions[i]['--label-column']}
                    onClick={buildLabelClickHandler(editingIndex, setEditingIndex, i)}
                >
                    {editingIndex === i ? (
                        <LabelDropdown 
                            segment={segment}
                            onChangeType={onChangeType}
                            onAddLeft={onAddLeft}
                            index={i}
                        />
                    ) : (
                        <LabelContent segment={segment} total={total} />
                    )}
                </div>
            ))}
        </div>
    )
}
```

### Phase 3: Progressive Enhancement Detection
```javascript
// utils/featureDetection.js
/**
 * Detects browser support for modern CSS features
 * @sig detectCSSFeatures :: () -> FeatureSupport
 */
const detectCSSFeatures = () => ({
    cssGrid: CSS.supports('display', 'grid'),
    containerQueries: CSS.supports('container-type', 'inline-size'),
    customProperties: CSS.supports('--custom', 'property')
})

/**
 * Applies appropriate positioning strategy based on browser capabilities
 * @sig selectPositioningStrategy :: FeatureSupport -> PositioningStrategy
 */
const selectPositioningStrategy = (features) => {
    if (features.cssGrid && features.customProperties) return 'grid-modern'
    if (features.customProperties) return 'flexbox-enhanced'
    return 'fallback-javascript'
}
```

### Phase 4: Fallback for Legacy Browsers
```javascript
// Keep minimal JS fallback for very old browsers
const legacyLabelPositioning = (segments, labelRefs) => {
    // Simplified version of current logic - only for unsupported browsers
    const positions = segments.map((_, i) => {
        // Basic left/right alternation instead of complex collision detection
        return (i % 2) * 120 // Simple staggered positioning
    })
    
    return { positions, uniformWidth: 120 }
}
```

## CSS Structure After Implementation

### Modern Browser Styles
```css
/* Grid-based label positioning */
.label-layer {
    display: grid;
    grid-template-columns: repeat(4, minmax(100px, 1fr));
    grid-auto-rows: min-content;
    gap: 8px 4px;
    position: absolute;
    top: 0;
    left: 100%;
    width: 400px;
    height: 100%;
    pointer-events: none;
}

.floating-label {
    position: relative;
    grid-row: 1;
    justify-self: start;
    pointer-events: all;
    
    /* Dynamic vertical positioning */
    transform: translateY(var(--label-offset-y, 0));
    
    /* Visual styling */
    background-color: var(--segment-color, #999);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.875rem;
    white-space: nowrap;
    cursor: pointer;
    
    /* Column assignment */
    grid-column: var(--label-column, 1);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .label-layer {
        grid-template-columns: repeat(2, minmax(80px, 1fr));
        width: 200px;
    }
}
```

### Legacy Browser Fallback
```css
.label-layer.legacy-mode {
    display: block;
    position: relative;
}

.label-layer.legacy-mode .floating-label {
    position: absolute;
    /* Positions set via JavaScript for old browsers */
}
```

## Migration Steps

### Step 1: Feature Detection Setup
1. Add CSS feature detection utility
2. Create progressive enhancement system
3. Test detection across target browsers

### Step 2: CSS Grid Implementation  
1. Create new CSS grid-based label styles
2. Implement `calculateCSSLabelPositions` function
3. Add grid column assignment logic

### Step 3: Component Integration
1. Update LabelLayer component to use CSS positioning
2. Remove dependency on `label-positioning.js` calculations  
3. Add fallback detection and application

### Step 4: Legacy Support
1. Implement simplified JS fallback for old browsers
2. Test across minimum supported browser versions
3. Ensure graceful degradation

### Step 5: Cleanup
1. Remove unused collision detection code
2. Delete DOM measurement utilities
3. Clean up imports and dependencies

## Performance Benefits

### Before (Current System)
- **DOM reads**: Multiple `getBoundingClientRect()` calls per update
- **Layout thrashing**: Setting `width: 'auto'` forces recalculation
- **Collision detection**: O(n²) algorithm for overlap checking
- **Memory allocation**: New arrays and objects created each update

### After (CSS-Based System)
- **Zero DOM reads**: CSS handles positioning automatically
- **No layout thrashing**: Positions calculated from data, not DOM
- **O(n) complexity**: Simple column assignment algorithm
- **Minimal JS**: Only CSS custom property updates needed

## Browser Compatibility Strategy

### Tier 1: Modern Browsers (CSS Grid + Container Queries)
- Chrome 90+, Firefox 88+, Safari 14+
- Full CSS Grid with container query responsiveness
- Zero JavaScript positioning calculations

### Tier 2: Intermediate Browsers (CSS Grid Only)  
- Chrome 57+, Firefox 52+, Safari 10+
- CSS Grid positioning with media query responsiveness
- Minimal JavaScript for feature detection

### Tier 3: Legacy Browsers (Flexbox + JS)
- IE 11, older mobile browsers
- Flexbox-based layout with JavaScript positioning assistance
- Simplified collision avoidance algorithm

## Testing Strategy

### CSS Feature Testing
```javascript
test('CSS Grid support detection', () => {
    expect(detectCSSFeatures().cssGrid).toBe(true)
})

test('Container query support detection', () => {
    const hasSupport = CSS.supports('container-type', 'inline-size')
    expect(detectCSSFeatures().containerQueries).toBe(hasSupport)
})
```

### Visual Regression Testing
- Compare label positioning before/after migration
- Test responsive behavior at different viewport sizes
- Verify label interaction (clicks, dropdowns) still work

### Performance Testing
```javascript
test('CSS positioning performance improvement', () => {
    const iterations = 100
    
    // Measure old system
    const oldSystemTime = measureTime(() => {
        // Run old collision detection system
    })
    
    // Measure new system
    const newSystemTime = measureTime(() => {
        // Run CSS-based positioning
    })
    
    expect(newSystemTime).toBeLessThan(oldSystemTime * 0.5) // 50% improvement target
})
```

## Risk Mitigation

### Gradual Migration
Each step creates isolated changes that can be tested and reverted independently.

### Feature Flag Support
```javascript
const USE_CSS_POSITIONING = detectCSSFeatures().cssGrid && !isLegacyBrowser()
```

### Fallback Testing
Comprehensive testing on minimum supported browsers to ensure functionality is preserved even when CSS features aren't available.