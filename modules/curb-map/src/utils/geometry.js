// Pure mathematical geometry calculations
// Extracted from UI components for testability

/**
 * Calculates cumulative positions for segments including unknown space
 * Consolidates buildTickPoints from SegmentedCurbEditor + calculateStartPositions from CurbTable
 * @sig calculateCumulativePositions :: ([Segment], Number) -> [Number]
 *     Segment = { id: String, type: String, length: Number }
 */
const calculateCumulativePositions = (segments, unknownRemaining) => {
    // Extracted from SegmentedCurbEditor.jsx lines 46-57
    const addCumulative = (acc, s) => [...acc, acc[acc.length - 1] + s.length]
    const segmentTicks = segments.reduce(addCumulative, [0])

    // Add final tick point including unknown space if it exists
    if (unknownRemaining > 0) {
        const lastPoint = segmentTicks[segmentTicks.length - 1]
        return [...segmentTicks, lastPoint + unknownRemaining]
    }

    return segmentTicks
}

/**
 * Calculates visual percentages for segments relative to blockface length
 * @sig calculateVisualPercentages :: ([Segment], Number) -> [Number]
 *     Segment = { id: String, type: String, length: Number }
 */
const calculateVisualPercentages = (segments, blockfaceLength) =>
    // Convert each segment length to percentage of total blockface
    segments.map(segment => (segment.length / blockfaceLength) * 100)

export { calculateCumulativePositions, calculateVisualPercentages }
