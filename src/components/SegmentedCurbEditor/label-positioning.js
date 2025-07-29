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

    const maxOverlappingOffset = findMaxOverlappingOffset(rects, offsets, currentRect, i, hasHorizontalOverlap)
    const currentOffset = maxOverlappingOffset >= 0 ? maxOverlappingOffset + 1 : 0
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

    const maxOverlappingOffset = findMaxOverlappingOffset(rects, offsets, currentRect, i, hasVerticalOverlap)
    const currentOffset = maxOverlappingOffset >= 0 ? maxOverlappingOffset + 1 : 0
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
 * Processes overlap check for maximum offset calculation
 * @sig processOverlapCheck :: (Number, DOMRect, Number, [Number], DOMRect, Function) -> Number
 */
const processOverlapCheck = (maxOffset, prevRect, j, offsets, currentRect, overlapFn) => {
    if (!prevRect || !overlapFn(currentRect, prevRect)) return maxOffset
    return Math.max(maxOffset, offsets[j])
}

/**
 * Finds maximum overlapping offset from previous elements
 * @sig findMaxOverlappingOffset :: ([DOMRect], [Number], DOMRect, Number, Function) -> Number
 */
const findMaxOverlappingOffset = (rects, offsets, currentRect, i, overlapFn) => {
    const processOverlap = (maxOffset, prevRect, j) =>
        processOverlapCheck(maxOffset, prevRect, j, offsets, currentRect, overlapFn)

    const previousRects = rects.slice(0, i)
    return previousRects.reduce(processOverlap, -1)
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
