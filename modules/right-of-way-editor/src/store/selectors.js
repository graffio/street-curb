import { calculateCumulativePositions, calculateVisualPercentages } from '../utils/geometry.js'

/**
 * @sig selectSegments :: State -> [Segment]
 */
const selectSegments = state => state.curb?.segments || []

/**
 * @sig selectBlockfaceLength :: State -> Number
 */
const selectBlockfaceLength = state => state.curb?.blockfaceLength || 240

/**
 * @sig selectBlockfaceId :: State -> String?
 */
const selectBlockfaceId = state => state.curb?.blockfaceId || null

/**
 * @sig selectIsCollectionComplete :: State -> Boolean
 */
const selectIsCollectionComplete = state => state.curb?.isCollectionComplete || false

/**
 * Compute remaining unknown space by subtracting segments total from blockface length
 * @sig selectUnknownRemaining :: State -> Number
 */
const selectUnknownRemaining = state => {
    const blockfaceLength = selectBlockfaceLength(state)
    const segments = selectSegments(state)
    const segmentsTotal = segments.reduce((sum, segment) => sum + segment.length, 0)
    return blockfaceLength - segmentsTotal
}

/**
 * @sig selectTotalLength :: State -> Number
 */
const selectTotalLength = state => {
    const blockfaceLength = selectBlockfaceLength(state)
    return blockfaceLength
}

/**
 * Calculate cumulative positions for segment boundaries
 * Replaces buildTickPoints from SegmentedCurbEditor.jsx
 * @sig selectCumulativePositions :: State -> [Number]
 */
const selectCumulativePositions = state => {
    const segments = selectSegments(state)
    const unknownRemaining = selectUnknownRemaining(state)
    return calculateCumulativePositions(segments, unknownRemaining)
}

/**
 * Calculate start positions for each segment
 * Replaces calculateStartPositions from CurbTable.jsx
 * @sig selectStartPositions :: State -> [Number]
 */
const selectStartPositions = state => {
    /**
     * Calculate start position for each segment by accumulating previous lengths
     * @sig calculateStartPosition :: ([Number], Segment) -> [Number]
     */
    const calculateStartPosition = (positions, segment) => {
        const start =
            positions.length === 0 ? 0 : positions[positions.length - 1] + segments[positions.length - 1].length
        return [...positions, start]
    }

    const segments = selectSegments(state)
    return segments.reduce(calculateStartPosition, [])
}

/**
 * Calculate visual percentages for rendering segment widths
 * Provides percentage calculations for rendering
 * @sig selectVisualPercentages :: State -> [Number]
 */
const selectVisualPercentages = state => {
    const segments = selectSegments(state)
    const blockfaceLength = selectBlockfaceLength(state)
    return calculateVisualPercentages(segments, blockfaceLength)
}

export {
    selectBlockfaceId,
    selectBlockfaceLength,
    selectCumulativePositions,
    selectIsCollectionComplete,
    selectSegments,
    selectStartPositions,
    selectTotalLength,
    selectUnknownRemaining,
    selectVisualPercentages,
}
