/**
 * Calculates maximum text width from current segments
 * @sig calculateLabelWidth :: ([Segment]) -> Number
 */
const calculateLabelWidth = segments => {
    const maxTextLength = Math.max(...segments.map(s => `${s.type} ${s.length.toFixed(1)} ft`.length))
    return maxTextLength * DEFAULT_CHAR_WIDTH + DEFAULT_CONTENT_PADDING
}

/**
 * Calculates maximum slots that fit in available space
 * @sig calculateMaxSlots :: (Number, Number) -> Number
 */
const calculateMaxSlots = (labelWidth, containerWidth = DEFAULT_CONTAINER_WIDTH) =>
    Math.max(1, Math.floor(containerWidth / labelWidth))

/**
 * Simple slot cycling - no collision detection complexity
 * @sig calculateSimplePositions :: ([Segment], Number) -> LabelPositions
 */
const calculateSimplePositions = (segments, blockfaceLength) => {
    if (!segments.length) return { positions: [], uniformWidth: 0, contentWidth: 0 }

    const labelWidth = calculateLabelWidth(segments)
    const contentWidth = labelWidth - DEFAULT_CONTENT_PADDING
    const maxSlots = calculateMaxSlots(labelWidth)

    const positions = segments.map((segment, index) => (index % maxSlots) * labelWidth)

    return { positions, uniformWidth: labelWidth, contentWidth }
}

/**
 * Dead simple label positioning - cycle through slots
 *
 * Strategy: Always cycle labels through available slots to prevent overlap.
 * No complexity, no edge cases, just works.
 */

// Configurable constants for easy future modification
const DEFAULT_CHAR_WIDTH = 6 // pixels per character for 12px font
const DEFAULT_CONTENT_PADDING = 14 // padding + borders
const DEFAULT_CONTAINER_WIDTH = 270 // available horizontal space for labels

export { calculateSimplePositions }
