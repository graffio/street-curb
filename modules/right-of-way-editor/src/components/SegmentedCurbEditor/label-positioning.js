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
 * Processes horizontal collision calculation for a single element
 * @sig processHorizontalCollision :: ([Number], DOMRect, Number, [DOMRect]) -> [Number]
 */
const processHorizontalCollision = (offsets, currentRect, i, rects) => {
    if (!currentRect) return [...offsets, 0]

    const currentOffset = findFirstAvailableOffset(rects, offsets, currentRect, i, hasHorizontalOverlap)
    return [...offsets, currentOffset]
}

/**
 * Calculates collision offset levels for horizontal labels (using vertical overlap check)
 * @sig calculateHorizontalCollisionOffsets :: [Element] -> [Number]
 */
const calculateHorizontalCollisionOffsets = labelElements => {
    const rects = labelElements.map(el => el?.getBoundingClientRect())

    return rects.reduce(processHorizontalCollision, [])
}

/**
 * Processes vertical collision calculation for a single element
 * @sig processVerticalCollision :: ([Number], DOMRect, Number, [DOMRect]) -> [Number]
 */
const processVerticalCollision = (offsets, currentRect, i, rects) => {
    if (!currentRect) return [...offsets, 0]

    const currentOffset = findFirstAvailableOffset(rects, offsets, currentRect, i, hasVerticalOverlap)
    return [...offsets, currentOffset]
}

/**
 * Calculates collision offset levels for vertical labels (using vertical overlap check)
 * @sig calculateVerticalCollisionOffsets :: [Element] -> [Number]
 */
const calculateVerticalCollisionOffsets = labelElements => {
    const rects = labelElements.map(el => el?.getBoundingClientRect())

    return rects.reduce(processVerticalCollision, [])
}

/**
 * Resets element width to auto
 * @sig resetElementWidth :: Element -> Void
 */
const resetElementWidth = el => el && (el.style.width = 'auto')

/**
 * Restores element width from original values
 * @sig restoreElementWidth :: (Element, Number, [String]) -> Void
 */
const restoreElementWidth = (el, i, originalWidths) => el && (el.style.width = originalWidths[i] || 'auto')

/**
 * Checks if offset has collision with any previous element
 * @sig hasOffsetCollision :: ([DOMRect], [Number], DOMRect, Number, Function, Number) -> Boolean
 */
const hasOffsetCollision = (previousRects, offsets, currentRect, overlapFn, testOffset) =>
    previousRects.some((prevRect, j) => prevRect && offsets[j] === testOffset && overlapFn(currentRect, prevRect))

/**
 * Finds first available offset column by checking left-to-right
 * @sig findFirstAvailableOffset :: ([DOMRect], [Number], DOMRect, Number, Function) -> Number
 */
const findFirstAvailableOffset = (rects, offsets, currentRect, i, overlapFn) => {
    const previousRects = rects.slice(0, i)
    const checkCollision = testOffset => hasOffsetCollision(previousRects, offsets, currentRect, overlapFn, testOffset)

    // Try each offset level starting from 0 (leftmost)
    const availableOffset = Array.from({ length: i + 1 }, (_, testOffset) => testOffset).find(
        testOffset => !checkCollision(testOffset),
    )

    return availableOffset ?? i
}

/**
 * Measures natural content width by temporarily resetting widths
 * @sig measureNaturalWidths :: [Element] -> Number
 */
const measureNaturalWidths = labelElements => {
    const originalWidths = labelElements.map(el => el?.style.width)

    // Reset to natural width
    labelElements.forEach(resetElementWidth)

    // Measure maximum natural width
    const maxWidth = labelElements.reduce((max, el) => (el ? Math.max(max, el.offsetWidth) : max), 0)

    // Restore original widths
    labelElements.forEach((el, i) => restoreElementWidth(el, i, originalWidths))

    return maxWidth
}

/**
 * Calculates horizontal label positions (simple em-based offsets)
 * @sig calculateHorizontalPositions :: [Element] -> HorizontalPositions
 *     HorizontalPositions = { positions: [Number], uniformWidth: Number, contentWidth: Number }
 */
const calculateHorizontalPositions = labelElements => {
    const collisionOffsets = calculateHorizontalCollisionOffsets(labelElements)
    const positions = collisionOffsets.map(offset => offset * 1.5) // em-based offsets
    return { positions, uniformWidth: 0, contentWidth: 0 }
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
 * Main function to calculate label positions based on orientation
 * @sig calculateLabelPositions :: (Boolean, [Element]) -> LabelPositions
 *     LabelPositions = { positions: [Number], uniformWidth: Number, contentWidth: Number }
 */
const calculateLabelPositions = (isVertical, labelElements) =>
    isVertical ? calculateVerticalPositions(labelElements) : calculateHorizontalPositions(labelElements)

export { calculateLabelPositions }
