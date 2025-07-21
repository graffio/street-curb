/**
 * Label positioning computations for segmented curb editor
 *
 * This module provides pure functions for calculating label positions and
 * collision detection in both horizontal and vertical orientations.
 */

/**
 * Checks if two DOM element rects overlap vertically
 * @sig hasVerticalOverlap :: (DOMRect, DOMRect) -> Boolean
 */
const hasVerticalOverlap = (rectA, rectB) => !(rectA.bottom < rectB.top || rectA.top > rectB.bottom)

/**
 * Checks if two DOM element rects overlap horizontally
 * @sig hasHorizontalOverlap :: (DOMRect, DOMRect) -> Boolean
 */
const hasHorizontalOverlap = (rectA, rectB) => !(rectA.right < rectB.left || rectA.left > rectB.right)

/**
 * Calculates collision offset levels for horizontal labels (using vertical overlap check)
 * @sig calculateHorizontalCollisionOffsets :: [Element] -> [Number]
 */
const calculateHorizontalCollisionOffsets = labelElements => {
    const rects = labelElements.map(el => el?.getBoundingClientRect())
    const offsets = new Array(rects.length).fill(0)

    for (let i = 0; i < rects.length; i++) {
        if (!rects[i]) continue

        for (let j = 0; j < i; j++) {
            if (!rects[j]) continue
            if (!hasHorizontalOverlap(rects[i], rects[j])) continue
            if (offsets[i] <= offsets[j]) offsets[i] = offsets[j] + 1
        }
    }

    return offsets
}

/**
 * Calculates collision offset levels for vertical labels (using vertical overlap check)
 * @sig calculateVerticalCollisionOffsets :: [Element] -> [Number]
 */
const calculateVerticalCollisionOffsets = labelElements => {
    const rects = labelElements.map(el => el?.getBoundingClientRect())
    const offsets = new Array(rects.length).fill(0)

    for (let i = 0; i < rects.length; i++) {
        if (!rects[i]) continue

        for (let j = 0; j < i; j++) {
            if (!rects[j]) continue
            if (!hasVerticalOverlap(rects[i], rects[j])) continue
            if (offsets[i] <= offsets[j]) offsets[i] = offsets[j] + 1
        }
    }

    return offsets
}

/**
 * Measures natural content width by temporarily resetting widths
 * @sig measureNaturalWidths :: [Element] -> Number
 */
const measureNaturalWidths = labelElements => {
    const originalWidths = labelElements.map(el => el?.style.width)

    // Reset to natural width
    labelElements.forEach(el => {
        if (el) el.style.width = 'auto'
    })

    // Measure maximum natural width
    const maxWidth = labelElements.reduce((max, el) => (el ? Math.max(max, el.offsetWidth) : max), 0)

    // Restore original widths
    labelElements.forEach((el, i) => {
        if (el) el.style.width = originalWidths[i] || 'auto'
    })

    return maxWidth
}

/**
 * Calculates horizontal label positions (simple em-based offsets)
 * @sig calculateHorizontalPositions :: [Element] -> { positions: [Number], uniformWidth: Number, contentWidth: Number }
 */
const calculateHorizontalPositions = labelElements => {
    const collisionOffsets = calculateHorizontalCollisionOffsets(labelElements)
    const positions = collisionOffsets.map(offset => offset * 1.5) // em-based offsets
    return { positions, uniformWidth: 0, contentWidth: 0 }
}

/**
 * Calculates vertical label positions (uniform width with simple layer positioning)
 * @sig calculateVerticalPositions :: [Element] -> { positions: [Number], uniformWidth: Number, contentWidth: Number }
 */
const calculateVerticalPositions = labelElements => {
    const collisionOffsets = calculateVerticalCollisionOffsets(labelElements)
    const naturalMaxWidth = measureNaturalWidths(labelElements)
    const uniformWidth = naturalMaxWidth - 1
    const contentWidth = uniformWidth - 10 // Account for padding + borders

    // Simple layer positioning
    const positions = collisionOffsets.map(offset => offset * uniformWidth)
    return { positions, uniformWidth, contentWidth }
}

/**
 * Main function to calculate label positions based on orientation
 * @sig calculateLabelPositions :: (Boolean, [Element]) -> { positions: [Number], uniformWidth: Number, contentWidth: Number }
 */
const calculateLabelPositions = (isVertical, labelElements) =>
    isVertical ? calculateVerticalPositions(labelElements) : calculateHorizontalPositions(labelElements)

export { calculateLabelPositions }
