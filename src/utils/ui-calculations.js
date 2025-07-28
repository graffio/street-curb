// Pure UI calculation functions for DOM/CSS positioning
// Extracted from components for testability

/**
 * Calculates dropdown positioning relative to button element
 * Extracted from CurbTable.jsx lines 44-47
 * @sig calculateDropdownPosition :: Element -> { top: Number, left: Number, width: Number }
 */
const calculateDropdownPosition = button => {
    const rect = button.getBoundingClientRect()
    return { top: rect.bottom + 4, left: rect.left, width: rect.width }
}

/**
 * Helper to process segment for touch detection
 * @sig processSegmentForTouch :: (Accumulator, Element, Number) -> Accumulator
 *     Accumulator = { totalSize: Number, index: Number, currentIndex: Number }
 */
const processSegmentForTouch = (acc, segment, touchCoord) => {
    if (acc.index !== -1) return acc

    const segmentSize = segment.offsetHeight
    const inRange = touchCoord >= acc.totalSize && touchCoord <= acc.totalSize + segmentSize

    return {
        totalSize: acc.totalSize + segmentSize,
        index: inRange ? acc.currentIndex : -1,
        currentIndex: acc.currentIndex + 1,
    }
}

/**
 * Maps touch coordinates to segment indices
 * @sig findSegmentUnderTouch :: (Element, Number) -> Number
 */
const findSegmentUnderTouch = (container, touchCoord) => {
    const segments = Array.from(container.children)
    const segmentElements = segments.filter(segment => segment.classList.contains('segment'))

    const { index } = segmentElements.reduce((acc, segment) => processSegmentForTouch(acc, segment, touchCoord), {
        totalSize: 0,
        index: -1,
        currentIndex: 0,
    })

    return index
}

export { calculateDropdownPosition, findSegmentUnderTouch }
