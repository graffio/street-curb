import { roundToPrecision } from '../constants.js'

/**
 * @sig Segment :: { id: String, type: String, length: Number }
 * Represents a single curb segment
 */

/**
 * @sig SegmentType :: 'Parking' | 'Curb Cut' | 'Loading' | 'Unknown'
 * Valid segment types
 */

/**
 * @sig SegmentUpdateResult :: { isValid: Boolean, segments: [Segment]?, error: String? }
 * Result of segment update operations
 */

/**
 * Creates a new segment with the given properties
 * @sig createSegment :: (String, Number) -> Segment
 */
export const createSegment = (type = 'Unknown', length = 240) => ({
    id: 's' + Math.random().toString(36).slice(2, 7),
    type,
    length: roundToPrecision(length),
})

/**
 * Updates segment lengths and adjusts Unknown segment accordingly
 * @sig updateSegmentLengths :: ([Segment], Number, Number, Number) -> SegmentUpdateResult
 */
export const updateSegmentLengths = (segments, index, newLength, blockfaceLength) => {
    if (!segments[index]) {
        return { isValid: false, error: 'Segment index out of bounds' }
    }

    const roundedLength = roundToPrecision(newLength)
    const oldLength = segments[index].length
    const lengthDifference = roundedLength - oldLength

    const unknownIndex = segments.findIndex(segment => segment.type === 'Unknown')
    if (unknownIndex === -1) {
        return { isValid: false, error: 'No Unknown segment found' }
    }

    const unknownSegment = segments[unknownIndex]
    const newUnknownLength = roundToPrecision(unknownSegment.length - lengthDifference)

    if (newUnknownLength < 0) {
        return { isValid: false, error: 'Insufficient space in Unknown segment' }
    }

    const updatedSegments = segments.map((segment, i) => {
        if (i === index) return { ...segment, length: roundedLength }
        if (i === unknownIndex) return { ...segment, length: newUnknownLength }
        return segment
    })

    const totalLength = updatedSegments.reduce((sum, segment) => sum + segment.length, 0)
    if (totalLength > blockfaceLength) {
        return { isValid: false, error: 'Total segment length exceeds blockface length' }
    }

    return { isValid: true, segments: updatedSegments }
}

/**
 * Inserts a new segment by consuming space from Unknown segment
 * @sig insertSegment :: ([Segment], Number, String?, Number?, Number) -> SegmentUpdateResult
 */
export const insertSegment = (segments, targetIndex, type = 'Parking', length = 20, blockfaceLength) => {
    const target = segments[targetIndex]
    if (!target) {
        return { isValid: false, error: 'Target index out of bounds' }
    }

    const unknownIndex = segments.findIndex(segment => segment.type === 'Unknown')
    if (unknownIndex === -1) {
        return { isValid: false, error: 'No Unknown segment found' }
    }

    const unknownSegment = segments[unknownIndex]
    const newSegmentSize = Math.min(length, unknownSegment.length)

    if (newSegmentSize <= 0) {
        return { isValid: false, error: 'Insufficient space in Unknown segment' }
    }

    const newSegment = createSegment(type, newSegmentSize)

    const updatedSegments = [...segments]
    updatedSegments[unknownIndex] = {
        ...unknownSegment,
        length: roundToPrecision(unknownSegment.length - newSegmentSize),
    }

    const insertIndex = target.type === 'Unknown' ? unknownIndex : targetIndex + 1
    updatedSegments.splice(insertIndex, 0, newSegment)

    const totalLength = updatedSegments.reduce((sum, segment) => sum + segment.length, 0)
    if (totalLength > blockfaceLength) {
        return { isValid: false, error: 'Total segment length exceeds blockface length' }
    }

    return { isValid: true, segments: updatedSegments }
}

/**
 * Adjusts segment start position by modifying segment lengths
 * @sig adjustSegmentStartPosition :: ([Segment], Number, Number, Number) -> SegmentUpdateResult
 */
export const adjustSegmentStartPosition = (segments, index, newStart, blockfaceLength) => {
    if (index <= 0) {
        return { isValid: false, error: 'Cannot adjust start position of first segment' }
    }

    let currentStart = 0
    for (let i = 0; i < index; i++) {
        currentStart += segments[i].length
    }

    const startDifference = newStart - currentStart

    const unknownIndex = segments.findIndex(segment => segment.type === 'Unknown')
    if (unknownIndex === -1) {
        return { isValid: false, error: 'No Unknown segment found' }
    }

    const previousSegment = segments[index - 1]
    const newPreviousLength = previousSegment.length + startDifference

    const newUnknownLength =
        index - 1 === unknownIndex ? newPreviousLength : segments[unknownIndex].length - startDifference

    if (newPreviousLength < 0 || newUnknownLength < 0) {
        return { isValid: false, error: 'Invalid start position adjustment' }
    }

    const updatedSegments = segments.map((segment, i) => {
        if (i === index - 1) return { ...segment, length: newPreviousLength }
        if (i === unknownIndex && index - 1 !== unknownIndex) {
            return { ...segment, length: newUnknownLength }
        }
        return segment
    })

    const totalLength = updatedSegments.reduce((sum, segment) => sum + segment.length, 0)
    if (totalLength > blockfaceLength) {
        return { isValid: false, error: 'Total segment length exceeds blockface length' }
    }

    return { isValid: true, segments: updatedSegments }
}
