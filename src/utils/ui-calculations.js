/*
 * Pure UI calculation functions for DOM/CSS positioning
 * Extracted from components for testability
 */

/*
 * Calculates dropdown positioning relative to button element
 * Extracted from CurbTable.jsx lines 44-47
 * @sig calculateDropdownPosition :: Element -> { top: Number, left: Number, width: Number }
 */
export const calculateDropdownPosition = button => {
    const rect = button.getBoundingClientRect()
    return { top: rect.bottom + 4, left: rect.left, width: rect.width }
}

/*
 * Maps touch coordinates to segment indices
 * @sig findSegmentUnderTouch :: (Element, Number) -> Number
 */
export const findSegmentUnderTouch = (container, touchCoord) => {
    let totalSize = 0
    const segments = container.children

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i]
        if (!segment.classList.contains('segment')) continue

        const segmentSize = segment.offsetHeight
        if (touchCoord >= totalSize && touchCoord <= totalSize + segmentSize) return i
        totalSize += segmentSize
    }

    return -1
}
