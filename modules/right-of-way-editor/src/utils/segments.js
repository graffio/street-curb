// Pure business logic functions for segment operations
// Extracted from SegmentedCurbEditor.jsx for testability

import { roundToPrecision } from './formatting.js'

/**
 * Creates a new segment with specified length and use
 * @sig createSegmentWithLength :: (Number, String?) -> Segment
 *     Segment = { use: String, length: Number }
 */
const createSegmentWithLength = (length, use = 'Parking') => ({ use, length: roundToPrecision(length) })

/**
 * Checks if a segment can be split by the desired length
 * @sig canSplitSegment :: ([Segment], Number, Number) -> Boolean
 */
const canSplitSegment = (segments, index, desiredLength) => {
    if (index < 0 || index >= segments.length) return false
    return segments[index].length >= desiredLength + 1
}

/**
 * Attempts to split a segment or adjacent segment to create space
 * @sig performSegmentSplit :: ([Segment], Number, Number) -> { success: Boolean, segments: [Segment]?, error: String? }
 */
const performSegmentSplit = (segments, index, desiredLength) => {
    if (index < 0 || index >= segments.length) {
        return { success: false, error: 'Invalid segment index' }
    }

    const fromSegment = segments[index]
    if (!fromSegment) {
        return { success: false, error: 'Invalid segment index' }
    }

    const canSplitCurrent = canSplitSegment(segments, index, desiredLength)
    if (canSplitCurrent) {
        const next = [...segments]
        next[index] = { ...fromSegment, length: roundToPrecision(fromSegment.length - desiredLength) }
        next.splice(index, 0, createSegmentWithLength(desiredLength))
        return { success: true, segments: next }
    }

    const canSplitPrevious = index > 0 && canSplitSegment(segments, index - 1, desiredLength)
    if (canSplitPrevious) {
        const next = [...segments]
        next[index - 1] = {
            ...segments[index - 1],
            length: roundToPrecision(segments[index - 1].length - desiredLength),
        }
        next.splice(index, 0, createSegmentWithLength(desiredLength))
        return { success: true, segments: next }
    }

    return { success: false, error: 'Insufficient space to create new segment' }
}

export { performSegmentSplit, canSplitSegment, createSegmentWithLength }
