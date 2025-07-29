# F106 Label Positioning Simplification Testing

## CSS Feature Detection Testing

### Browser Support Detection
```javascript
// Test CSS feature detection utilities
test('detects CSS Grid support correctly', () => {
    // Mock CSS.supports for different scenarios
    const originalSupports = CSS.supports
    
    CSS.supports = jest.fn((property, value) => {
        if (property === 'display' && value === 'grid') return true
        return false
    })
    
    const features = detectCSSFeatures()
    expect(features.cssGrid).toBe(true)
    expect(features.containerQueries).toBe(false)
    
    CSS.supports = originalSupports
})

test('selects appropriate positioning strategy', () => {
    const modernFeatures = { cssGrid: true, containerQueries: true, customProperties: true }
    const legacyFeatures = { cssGrid: false, containerQueries: false, customProperties: false }
    
    expect(selectPositioningStrategy(modernFeatures)).toBe('grid-modern')
    expect(selectPositioningStrategy(legacyFeatures)).toBe('fallback-javascript')
})
```

### Progressive Enhancement Testing
```javascript
test('applies correct CSS classes based on feature support', () => {
    render(<LabelLayer segments={mockSegments} />)
    
    const labelLayer = screen.getByTestId('label-layer')
    
    // Should have modern grid classes on supported browsers
    if (detectCSSFeatures().cssGrid) {
        expect(labelLayer).toHaveClass('label-layer-grid')
    } else {
        expect(labelLayer).toHaveClass('label-layer-legacy')
    }
})
```

## CSS Positioning Algorithm Testing

### Label Column Assignment
```javascript
test('assigns labels to columns to avoid overlaps', () => {
    const segments = [
        { id: 1, type: 'Parking', length: 20 },
        { id: 2, type: 'Loading', length: 15 },
        { id: 3, type: 'Parking', length: 25 }
    ]
    const tickPoints = [0, 20, 35]
    const total = 60
    
    const positions = calculateCSSLabelPositions(segments, tickPoints, total)
    
    // First label should be in column 1
    expect(positions[0]['--label-column']).toBe(1)
    
    // Second label should avoid column 1 if overlap detected
    expect(positions[1]['--label-column']).toBeGreaterThan(1)
})

test('prefers leftward positioning when space available', () => {
    // Test scenario where there's room to the left
    const segments = [
        { id: 1, type: 'Parking', length: 10 },
        { id: 2, type: 'Loading', length: 40 }, // Large gap
        { id: 3, type: 'Parking', length: 10 }
    ]
    const tickPoints = [0, 10, 50]
    const total = 60
    
    const positions = calculateCSSLabelPositions(segments, tickPoints, total)
    
    // Third label should use column 1 (left) instead of stacking right
    expect(positions[2]['--label-column']).toBe(1)
})
```

### CSS Custom Properties Generation
```javascript
test('generates correct CSS custom properties', () => {
    const segments = [{ id: 1, type: 'Parking', length: 20 }]
    const tickPoints = [0]
    const total = 100
    
    const positions = calculateCSSLabelPositions(segments, tickPoints, total)
    
    expect(positions[0]).toEqual({
        '--label-offset-y': '10%', // Mid-point of 20-length segment at start
        '--label-column': 1
    })
})
```

## Component Integration Testing

### LabelLayer CSS Integration
```javascript
test('LabelLayer applies CSS positioning correctly', () => {
    const segments = [
        { id: 1, type: 'Parking', length: 20 },
        { id: 2, type: 'Loading', length: 30 }
    ]
    
    render(
        <LabelLayer 
            segments={segments}
            tickPoints={[0, 20]}
            total={50}
            editingIndex={null}
            setEditingIndex={jest.fn()}
        />
    )
    
    const labels = screen.getAllByTestId(/floating-label/)
    
    // Check CSS custom properties are applied
    expect(labels[0]).toHaveStyle({
        '--label-offset-y': '20%',
        '--label-column': '1'
    })
    
    expect(labels[1]).toHaveStyle({
        '--label-offset-y': '70%',
        '--label-column': '2'
    })
})

test('labels render without overlapping', () => {
    render(<LabelLayer segments={mockSegments} />)
    
    const labels = screen.getAllByTestId(/floating-label/)
    
    // Get bounding rects and verify no overlaps
    const rects = labels.map(label => label.getBoundingClientRect())
    
    for (let i = 0; i < rects.length; i++) {
        for (let j = i + 1; j < rects.length; j++) {
            const hasOverlap = !(
                rects[i].right < rects[j].left ||
                rects[i].left > rects[j].right ||
                rects[i].bottom < rects[j].top ||
                rects[i].top > rects[j].bottom
            )
            expect(hasOverlap).toBe(false)
        }
    }
})
```

### Interaction Preservation Testing
```javascript
test('label clicks still work with CSS positioning', () => {
    const mockSetEditingIndex = jest.fn()
    
    render(
        <LabelLayer 
            segments={mockSegments}
            editingIndex={null}
            setEditingIndex={mockSetEditingIndex}
        />
    )
    
    const firstLabel = screen.getByTestId('floating-label-0')
    fireEvent.click(firstLabel)
    
    expect(mockSetEditingIndex).toHaveBeenCalledWith(0)
})

test('dropdown interactions work with grid positioning', () => {
    const mockOnChangeType = jest.fn()
    
    render(
        <LabelLayer 
            segments={mockSegments}
            editingIndex={0}
            onChangeType={mockOnChangeType}
        />
    )
    
    const typeOption = screen.getByText('Loading')
    fireEvent.click(typeOption)
    
    expect(mockOnChangeType).toHaveBeenCalledWith(0, 'Loading')
})
```

## Performance Testing

### CSS vs JavaScript Performance
```javascript
test('CSS positioning performs better than DOM calculations', async () => {
    const segments = Array(20).fill().map((_, i) => ({
        id: i,
        type: 'Parking',
        length: 10 + (i % 5)
    }))
    
    // Measure old system (mocked)
    const oldSystemStart = performance.now()
    // Simulate old collision detection work
    for (let i = 0; i < 100; i++) {
        simulateOldCollisionDetection(segments)
    }
    const oldSystemTime = performance.now() - oldSystemStart
    
    // Measure new system
    const newSystemStart = performance.now()
    for (let i = 0; i < 100; i++) {
        calculateCSSLabelPositions(segments, tickPoints, total)
    }
    const newSystemTime = performance.now() - newSystemStart
    
    // New system should be significantly faster
    expect(newSystemTime).toBeLessThan(oldSystemTime * 0.3)
})

test('no layout thrashing with CSS approach', () => {
    const layoutCount = mockLayoutCount()
    
    render(<LabelLayer segments={largeSegmentSet} />)
    
    // Update segments multiple times
    rerender(<LabelLayer segments={updatedSegmentSet} />)
    rerender(<LabelLayer segments={anotherSegmentSet} />)
    
    // Should not trigger excessive layout recalculations
    expect(layoutCount.get()).toBeLessThan(5)
})
```

### Memory Usage Testing
```javascript
test('CSS positioning reduces memory allocations', () => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0
    
    // Render and update labels many times
    for (let i = 0; i < 100; i++) {
        const { unmount } = render(<LabelLayer segments={mockSegments} />)
        unmount()
    }
    
    // Force garbage collection if available
    if (global.gc) global.gc()
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0
    const memoryDelta = finalMemory - initialMemory
    
    // Should not accumulate significant memory
    expect(memoryDelta).toBeLessThan(1000000) // < 1MB
})
```

## Cross-Browser Testing

### Grid Support Testing
```javascript
test('works in browsers with CSS Grid support', () => {
    // Mock modern browser environment
    mockBrowserFeatures({ cssGrid: true, customProperties: true })
    
    render(<LabelLayer segments={mockSegments} />)
    
    const labelLayer = screen.getByTestId('label-layer')
    expect(labelLayer).toHaveStyle({
        display: 'grid'
    })
    
    // Labels should be positioned with grid
    const labels = screen.getAllByTestId(/floating-label/)
    labels.forEach((label, i) => {
        expect(label.style.getPropertyValue('--label-column')).toBeTruthy()
    })
})

test('falls back gracefully in legacy browsers', () => {
    // Mock legacy browser environment
    mockBrowserFeatures({ cssGrid: false, customProperties: false })
    
    render(<LabelLayer segments={mockSegments} />)
    
    const labelLayer = screen.getByTestId('label-layer')
    expect(labelLayer).toHaveClass('legacy-mode')
    
    // Should still position labels without overlaps
    const labels = screen.getAllByTestId(/floating-label/)
    expect(labels).toHaveLength(mockSegments.length)
})
```

### Mobile Browser Testing
```javascript
test('responsive behavior works on mobile viewports', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375 })
    
    render(<LabelLayer segments={mockSegments} />)
    
    const labelLayer = screen.getByTestId('label-layer')
    
    // Should apply mobile-specific grid template
    expect(getComputedStyle(labelLayer).gridTemplateColumns).toMatch(/repeat\(2,/)
})
```

## Regression Testing Checklist

### Visual Positioning
- [ ] Labels appear at same visual positions as before migration
- [ ] No labels overlap with each other
- [ ] Labels stack leftward when space is available (bug fix)
- [ ] Label alignment and spacing matches original design

### Interactive Behavior
- [ ] Label clicks open dropdown menus correctly
- [ ] Type changes work from dropdown selections
- [ ] "Add left" functionality works from label dropdowns
- [ ] Dropdown closes after selections are made

### Responsive Behavior
- [ ] Labels adapt to different container sizes
- [ ] Mobile viewports show appropriate label sizing
- [ ] Desktop viewports show full label information
- [ ] Labels remain readable at all supported screen sizes

### Performance Characteristics
- [ ] No visible lag when adding/removing segments
- [ ] Smooth updates when segments are resized
- [ ] No memory leaks from repeated label updates
- [ ] Performance equal or better than original system

## Success Criteria Validation

### Code Simplification
- Measure lines of code removed from collision detection system
- Verify elimination of DOM measurement utilities
- Confirm reduction in JavaScript execution for label positioning

### Bug Resolution  
- Test that labels prefer leftward positioning when space is available
- Verify no regression in label interaction behavior
- Confirm visual appearance matches original design

### Performance Improvement
- Measure label positioning update speed improvement
- Verify reduction in DOM reads during label updates
- Test responsiveness on lower-end mobile devices

### Browser Compatibility
- Test on minimum supported browser versions
- Verify graceful degradation in legacy browsers
- Confirm no new browser compatibility issues introduced