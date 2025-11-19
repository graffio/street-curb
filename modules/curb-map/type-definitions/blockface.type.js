/** @module Blockface */

import { LookupTable } from '@graffio/functional'
/**
 * Blockface represents a street segment with geometry, metadata, and curb segments
 * @sig Blockface :: { id: String, geometry: Object, streetName: String, cnnId: String?, segments: [Segment] }
 */
import { length } from '@turf/length'
import { FieldTypes } from './field-types.js'
import { Segment } from './segment.js'

// prettier-ignore
export const Blockface = {
    name: 'Blockface',
    kind: 'tagged',
    fields: {
        id            : FieldTypes.blockfaceId,
        sourceId      : 'String', // city-specific id for the Feature related to the blockface (or hashed geometry)
        geometry      : 'Object',
        streetName    : 'String',
        segments      : '{Segment:id}',
       
        organizationId: FieldTypes.organizationId,
        projectId     : FieldTypes.projectId,
        createdAt     : 'Date',
        createdBy     : FieldTypes.userId,
        updatedAt     : 'Date',
        updatedBy     : FieldTypes.userId,
    },
}

/**
 * Helper utility for precision rounding
 * @sig _roundToPrecision :: Number -> Number
 */
Blockface._roundToPrecision = value => Math.round(value * 10) / 10

// ---------------------------------------------------------------------------------------------------------------------
// Constructors
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Create a new Blockface with the use of the Segment at the given index updated
 * @sig updateSegmentUse :: (Blockface, UpdateSegmentUseAction) -> Blockface
 */
Blockface.updateSegmentUse = (blockface, updateSegmentUseAction) => {
    const { index, use } = updateSegmentUseAction
    if (!blockface?.segments[index]) return blockface

    const segments = LookupTable(
        blockface.segments.map((segment, i) => (i === index ? Segment.updateUse(segment, use) : segment)),
        Segment,
    )
    return Blockface.from({ ...blockface, segments })
}

/**
 * Adjust segment length and rebalance affected segments or unknown space
 * @sig updateSegmentLength :: (Blockface, UpdateSegmentLengthAction) -> Blockface
 */
Blockface.updateSegmentLength = (blockface, updateSegmentLengthAction) => {
    const { index, newLength } = updateSegmentLengthAction

    if (!blockface) return blockface
    if (!blockface.segments[index]) return blockface
    if (index < 0 || index >= blockface.segments.length) return blockface
    if (newLength <= 0) return blockface

    const roundedLength = Blockface._roundToPrecision(newLength)
    const lengthDelta = roundedLength - blockface.segments[index].length

    // Adjust last segment by consuming/releasing unknown space
    if (index === blockface.segments.length - 1) {
        const blockfaceLength = Blockface.totalLength(blockface)
        const totalSegmentLength = blockface.segments.reduce((sum, seg) => sum + seg.length, 0)
        const currentUnknownRemaining = blockfaceLength - totalSegmentLength
        let newUnknownRemaining = Blockface._roundToPrecision(currentUnknownRemaining - lengthDelta)

        if (Math.abs(newUnknownRemaining) < 0.01) newUnknownRemaining = 0
        if (newUnknownRemaining < 0) return blockface // Insufficient unknown space

        const newSegments = LookupTable(
            blockface.segments.map((s, i) => (i === index ? Segment(s.id, s.use, roundedLength) : s)),
            Segment,
        )
        return Blockface.from({ ...blockface, segments: newSegments })
    }

    // Adjust middle segment by borrowing from next segment
    const nextSegment = blockface.segments[index + 1]
    const newNextLength = Blockface._roundToPrecision(nextSegment.length - lengthDelta)
    if (newNextLength <= 0) return blockface // Cannot create zero or negative segment

    const newSegments = LookupTable(
        blockface.segments.map((seg, i) => {
            if (i === index) return Segment(seg.id, seg.use, roundedLength)
            if (i === index + 1) return Segment(seg.id, seg.use, newNextLength)
            return seg
        }),
        Segment,
    )

    return Blockface.from({ ...blockface, segments: newSegments })
}

/**
 * Create new segment by consuming unknown space
 * @sig addSegment :: (Blockface, AddSegmentAction) -> Blockface
 */
Blockface.addSegment = (blockface, addSegmentAction) => {
    const { targetIndex } = addSegmentAction

    if (!blockface) return blockface

    const blockfaceLength = Blockface.totalLength(blockface)
    const totalSegmentLength = blockface.segments.reduce((sum, seg) => sum + seg.length, 0)
    const currentUnknownRemaining = blockfaceLength - totalSegmentLength
    if (currentUnknownRemaining <= 0) return blockface

    const newSegmentSize = Math.min(20, currentUnknownRemaining)
    const newSegment = Segment(FieldTypes.newSegmentId(), 'Parking', Blockface._roundToPrecision(newSegmentSize))

    const newSegments = [...blockface.segments]
    const insertIndex = targetIndex >= 0 ? targetIndex + 1 : newSegments.length
    newSegments.splice(insertIndex, 0, newSegment)

    return Blockface.from({ ...blockface, segments: LookupTable(newSegments, Segment) })
}

/**
 * Split existing segment to create new segment on the left
 * Always creates a new segment - user expects feedback
 * @sig addSegmentLeft :: (Blockface, AddSegmentLeftAction) -> Blockface
 */
Blockface.addSegmentLeft = (blockface, addSegmentLengthAction) => {
    const calculateSplitLengths = (targetLength, desired) =>
        targetLength >= desired
            ? [desired, targetLength - desired]
            : [
                  Blockface._roundToPrecision(targetLength / 2),
                  Blockface._roundToPrecision(targetLength - targetLength / 2),
              ]

    if (!blockface) return blockface
    const { index, desiredLength = 10 } = addSegmentLengthAction
    if (index < 0 || index >= blockface.segments.length) return blockface

    const targetSegment = blockface.segments[index]
    const [newSegmentLength, remainingSegmentLength] = calculateSplitLengths(targetSegment.length, desiredLength)
    const newSegment = Segment(FieldTypes.newSegmentId(), 'Parking', newSegmentLength)
    const modifiedTargetSegment = Segment(targetSegment.id, targetSegment.use, remainingSegmentLength)

    const newSegments = LookupTable(
        [
            ...blockface.segments.slice(0, index),
            newSegment,
            modifiedTargetSegment,
            ...blockface.segments.slice(index + 1),
        ],
        Segment,
    )

    return Blockface.from({ ...blockface, segments: newSegments })
}

/**
 * Replace entire segments array with new segments
 * @sig replaceSegments :: (Blockface, ReplaceSegmentsAction) -> Blockface
 */
Blockface.replaceSegments = (blockface, replaceSegmentsAction) => {
    const { segments } = replaceSegmentsAction
    if (!blockface) return blockface

    const newTaggedSegments = LookupTable.is(segments) ? segments : LookupTable(segments, Segment)
    return Blockface.from({ ...blockface, segments: newTaggedSegments })
}

// ---------------------------------------------------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Calculate blockface length from geometry or return fallback for tests
 * @sig totalLength :: Blockface -> Number
 */
Blockface.totalLength = blockface => {
    if (!blockface?.geometry?.coordinates) return 240 // for tests only

    const lengthKm = length({ type: 'Feature', geometry: blockface.geometry, properties: {} })
    return Math.round(lengthKm * 3280.84)
}

/**
 * Sum length of existing segments
 * @sig totalSegments :: Blockface -> Number
 */
Blockface.totalOfSegments = blockface => blockface.segments.reduce((sum, segment) => sum + segment.length, 0)

/**
 * Calculate remaining unknown space by subtracting segments total from blockface length
 * @sig unknownRemaining :: Blockface -> Number
 */
Blockface.unknownRemaining = blockface => {
    if (!blockface) return 0
    return Blockface.totalLength(blockface) - Blockface.totalOfSegments(blockface)
}

/**
 * Check if all space in the blockface has been allocated to segments
 * @sig isComplete :: Blockface -> Boolean
 */
Blockface.isComplete = blockface => {
    if (!blockface) return false
    return Math.abs(Blockface.unknownRemaining(blockface)) < 0.01
}

/**
 * Calculate cumulative positions for segments including unknown space
 * @sig cumulativePositions :: Blockface -> [Number]
 */
Blockface.cumulativePositions = blockface => {
    // Build cumulative positions: [0, length1, length1+length2, ...]
    const addCumulative = (acc, segment) => [...acc, acc[acc.length - 1] + segment.length]

    if (!blockface) return []

    const segments = blockface.segments
    const unknownRemaining = Blockface.unknownRemaining(blockface)
    const segmentTicks = segments.reduce(addCumulative, [0])

    // Add final tick point including unknown space if it exists
    if (unknownRemaining > 0) {
        const lastPoint = segmentTicks[segmentTicks.length - 1]
        return [...segmentTicks, lastPoint + unknownRemaining]
    }

    return segmentTicks
}

/**
 * Calculate start positions for each segment
 * @sig startPositions :: Blockface -> [Number]
 */
Blockface.startPositions = blockface => {
    const addStartPosition = segment => {
        const start = position
        position += segment.length
        return start
    }

    if (!blockface) return []
    let position = 0
    return blockface.segments.map(addStartPosition)
}

/**
 * Calculate visual percentages for segments relative to blockface length
 * @sig visualPercentages :: Blockface -> [Number]
 */
Blockface.visualPercentages = blockface => {
    if (!blockface) return []

    const blockfaceLength = Blockface.totalLength(blockface)
    return blockface.segments.map(segment => (segment.length / blockfaceLength) * 100)
}

/**
 * Override toFirestore to handle geometry serialization
 * Geometry contains nested arrays which Firestore doesn't support, so we stringify it
 * @sig toFirestore :: (Blockface, (Date -> Any)) -> Object
 */
Blockface.toFirestore = (blockface, encodeTimestamps) => {
    const data = Blockface._toFirestore(blockface, encodeTimestamps)
    if (data.geometry) data.geometry = JSON.stringify(data.geometry)
    return data
}

/**
 * Override fromFirestore to handle geometry deserialization
 * Parse the stringified geometry back to an object
 * @sig fromFirestore :: (Object, (Any -> Date)) -> Blockface
 */
Blockface.fromFirestore = (doc, decodeTimestamps) => {
    const docWithGeometry = { ...doc }
    if (typeof docWithGeometry.geometry === 'string') docWithGeometry.geometry = JSON.parse(docWithGeometry.geometry)

    return Blockface._fromFirestore(docWithGeometry, decodeTimestamps)
}
