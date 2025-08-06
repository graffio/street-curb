/**
 * Label positioning computations for segmented curb editor
 *
 * This module provides pure functions for calculating label positions and
 * collision detection for vertical orientation only.
 */

/**
 * Checks if two DOM element rects overlap vertically
 * @sig hasVerticalOverlap :: (DOMRect, DOMRect) -> Boolean
 */
const hasVerticalOverlap = (rectA, rectB) => !(rectA.bottom < rectB.top || rectA.top > rectB.bottom)

/**
 * Finds first available offset column by checking left-to-right
 * @sig findFirstAvailableOffset :: ([DOMRect], [Number], DOMRect, Number) -> Number
 */
const findFirstAvailableOffset = (rects, offsets, currentRect, i) => {
    const previousRects = rects.slice(0, i)

    // Try each offset level starting from 0 (leftmost)
    for (let slot = 0; slot <= i; slot++) {
        const hasCollision = previousRects.some(
            (prevRect, j) => prevRect && offsets[j] === slot && hasVerticalOverlap(currentRect, prevRect),
        )
        if (!hasCollision) return slot
    }
    return i
}

/**
 * Calculates collision offset levels for vertical labels
 * @sig calculateVerticalCollisionOffsets :: [Element] -> [Number]
 */
const calculateVerticalCollisionOffsets = labelElements => {
    const rects = labelElements.map(el => el?.getBoundingClientRect())
    const offsets = []

    for (let i = 0; i < rects.length; i++) {
        const currentRect = rects[i]
        if (!currentRect) {
            offsets.push(0)
            continue
        }

        const currentOffset = findFirstAvailableOffset(rects, offsets, currentRect, i)
        offsets.push(currentOffset)
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
    labelElements.forEach(el => el && (el.style.width = 'auto'))

    // Measure maximum natural width
    const maxWidth = labelElements.reduce((max, el) => (el ? Math.max(max, el.offsetWidth) : max), 0)

    // Restore original widths
    labelElements.forEach((el, i) => el && (el.style.width = originalWidths[i] || 'auto'))

    return maxWidth
}

/**
 * Calculates vertical label positions (uniform width with simple layer positioning)
 * @sig calculateVerticalPositions :: [Element] -> VerticalPositions
 *     VerticalPositions = { positions: [Number], uniformWidth: Number, contentWidth: Number }
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
 * Main function to calculate label positions (vertical orientation only)
 * @sig calculateLabelPositions :: [Element] -> LabelPositions
 *     LabelPositions = { positions: [Number], uniformWidth: Number, contentWidth: Number }
 */
const calculateLabelPositions = labelElements => calculateVerticalPositions(labelElements)

export { calculateLabelPositions }
