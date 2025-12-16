// ABOUTME: Generated type definition for Blockface
// ABOUTME: Auto-generated from modules/curb-map/type-definitions/blockface.type.js - do not edit manually

/** {@link module:Blockface} */
/*  Blockface generated from: modules/curb-map/type-definitions/blockface.type.js
 *
 *  id            : FieldTypes.blockfaceId,
 *  sourceId      : "String",
 *  geometry      : "Object",
 *  streetName    : "String",
 *  segments      : "{Segment:id}",
 *  organizationId: FieldTypes.organizationId,
 *  projectId     : FieldTypes.projectId,
 *  createdAt     : "Date",
 *  createdBy     : FieldTypes.userId,
 *  updatedAt     : "Date",
 *  updatedBy     : FieldTypes.userId
 *
 */

import { LookupTable } from '@graffio/functional'
import { length } from '@turf/length'
import { FieldTypes } from './field-types.js'
import { Segment } from './segment.js'

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
/**
 * Construct a Blockface instance
 * @sig Blockface :: ([Object], String, Object, String, {Segment}, [Object], [Object], Date, [Object], Date, [Object]) -> Blockface
 */
const Blockface = function Blockface(
    id,
    sourceId,
    geometry,
    streetName,
    segments,
    organizationId,
    projectId,
    createdAt,
    createdBy,
    updatedAt,
    updatedBy,
) {
    const constructorName =
        'Blockface(id, sourceId, geometry, streetName, segments, organizationId, projectId, createdAt, createdBy, updatedAt, updatedBy)'
    R.validateArgumentLength(constructorName, 11, arguments)
    R.validateRegex(constructorName, FieldTypes.blockfaceId, 'id', false, id)
    R.validateString(constructorName, 'sourceId', false, sourceId)
    R.validateObject(constructorName, 'geometry', false, geometry)
    R.validateString(constructorName, 'streetName', false, streetName)
    R.validateLookupTable(constructorName, 'Segment', 'segments', false, segments)
    R.validateRegex(constructorName, FieldTypes.organizationId, 'organizationId', false, organizationId)
    R.validateRegex(constructorName, FieldTypes.projectId, 'projectId', false, projectId)
    R.validateDate(constructorName, 'createdAt', false, createdAt)
    R.validateRegex(constructorName, FieldTypes.userId, 'createdBy', false, createdBy)
    R.validateDate(constructorName, 'updatedAt', false, updatedAt)
    R.validateRegex(constructorName, FieldTypes.userId, 'updatedBy', false, updatedBy)

    const result = Object.create(prototype)
    result.id = id
    result.sourceId = sourceId
    result.geometry = geometry
    result.streetName = streetName
    result.segments = segments
    result.organizationId = organizationId
    result.projectId = projectId
    result.createdAt = createdAt
    result.createdBy = createdBy
    result.updatedAt = updatedAt
    result.updatedBy = updatedBy
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------
/**
 * Convert to string representation
 * @sig blockfaceToString :: () -> String
 */
const blockfaceToString = function () {
    return `Blockface(
        ${R._toString(this.id)},
        ${R._toString(this.sourceId)},
        ${R._toString(this.geometry)},
        ${R._toString(this.streetName)},
        ${R._toString(this.segments)},
        ${R._toString(this.organizationId)},
        ${R._toString(this.projectId)},
        ${R._toString(this.createdAt)},
        ${R._toString(this.createdBy)},
        ${R._toString(this.updatedAt)},
        ${R._toString(this.updatedBy)},
    )`
}

/**
 * Convert to JSON representation
 * @sig blockfaceToJSON :: () -> Object
 */
const blockfaceToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Blockface', enumerable: false },
    toString: { value: blockfaceToString, enumerable: false },
    toJSON: { value: blockfaceToJSON, enumerable: false },
    constructor: { value: Blockface, enumerable: false, writable: true, configurable: true },
})

Blockface.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Blockface.toString = () => 'Blockface'
Blockface.is = v => v && v['@@typeName'] === 'Blockface'

Blockface._from = _input => {
    const {
        id,
        sourceId,
        geometry,
        streetName,
        segments,
        organizationId,
        projectId,
        createdAt,
        createdBy,
        updatedAt,
        updatedBy,
    } = _input
    return Blockface(
        id,
        sourceId,
        geometry,
        streetName,
        segments,
        organizationId,
        projectId,
        createdAt,
        createdBy,
        updatedAt,
        updatedBy,
    )
}
Blockface.from = Blockface._from

Blockface._toFirestore = (o, encodeTimestamps) => {
    const result = {
        id: o.id,
        sourceId: o.sourceId,
        geometry: o.geometry,
        streetName: o.streetName,
        segments: R.lookupTableToFirestore(Segment, 'id', encodeTimestamps, o.segments),
        organizationId: o.organizationId,
        projectId: o.projectId,
        createdAt: encodeTimestamps(o.createdAt),
        createdBy: o.createdBy,
        updatedAt: encodeTimestamps(o.updatedAt),
        updatedBy: o.updatedBy,
    }

    return result
}

Blockface._fromFirestore = (doc, decodeTimestamps) =>
    Blockface._from({
        id: doc.id,
        sourceId: doc.sourceId,
        geometry: doc.geometry,
        streetName: doc.streetName,
        segments: R.lookupTableFromFirestore(Segment, 'id', decodeTimestamps, doc.segments),
        organizationId: doc.organizationId,
        projectId: doc.projectId,
        createdAt: decodeTimestamps(doc.createdAt),
        createdBy: doc.createdBy,
        updatedAt: decodeTimestamps(doc.updatedAt),
        updatedBy: doc.updatedBy,
    })

// Public aliases (override if necessary)

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

Blockface._roundToPrecision = value => Math.round(value * 10) / 10

Blockface.updateSegmentUse = (blockface, updateSegmentUseAction) => {
    const { index, use } = updateSegmentUseAction
    if (!blockface?.segments[index]) return blockface
    const segments = LookupTable(
        blockface.segments.map((segment, i) => (i === index ? Segment.updateUse(segment, use) : segment)),
        Segment,
    )
    return Blockface.from({
        ...blockface,
        segments,
    })
}

Blockface.updateSegmentLength = (blockface, updateSegmentLengthAction) => {
    const { index, newLength } = updateSegmentLengthAction
    if (!blockface) return blockface
    if (!blockface.segments[index]) return blockface
    if (index < 0 || index >= blockface.segments.length) return blockface
    if (newLength <= 0) return blockface
    const roundedLength = Blockface._roundToPrecision(newLength)
    const lengthDelta = roundedLength - blockface.segments[index].length
    if (index === blockface.segments.length - 1) {
        const blockfaceLength = Blockface.totalLength(blockface)
        const totalSegmentLength = blockface.segments.reduce((sum, seg) => sum + seg.length, 0)
        const currentUnknownRemaining = blockfaceLength - totalSegmentLength
        let newUnknownRemaining = Blockface._roundToPrecision(currentUnknownRemaining - lengthDelta)
        if (Math.abs(newUnknownRemaining) < 0.01) newUnknownRemaining = 0
        if (newUnknownRemaining < 0) return blockface
        const newSegments = LookupTable(
            blockface.segments.map((s, i) => (i === index ? Segment(s.id, s.use, roundedLength) : s)),
            Segment,
        )
        return Blockface.from({
            ...blockface,
            segments: newSegments,
        })
    }
    const nextSegment = blockface.segments[index + 1]
    const newNextLength = Blockface._roundToPrecision(nextSegment.length - lengthDelta)
    if (newNextLength <= 0) return blockface
    const newSegments = LookupTable(
        blockface.segments.map((seg, i) => {
            if (i === index) return Segment(seg.id, seg.use, roundedLength)
            if (i === index + 1) return Segment(seg.id, seg.use, newNextLength)
            return seg
        }),
        Segment,
    )
    return Blockface.from({
        ...blockface,
        segments: newSegments,
    })
}

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
    return Blockface.from({
        ...blockface,
        segments: LookupTable(newSegments, Segment),
    })
}

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
    return Blockface.from({
        ...blockface,
        segments: newSegments,
    })
}

Blockface.updateMetadata = (blockface, updatedBy) =>
    Blockface.from({
        ...blockface,
        updatedBy,
        updatedAt: new Date(),
    })

Blockface.replaceSegments = (blockface, replaceSegmentsAction) => {
    const { segments } = replaceSegmentsAction
    if (!blockface) return blockface
    const newTaggedSegments = LookupTable.is(segments) ? segments : LookupTable(segments, Segment)
    return Blockface.from({
        ...blockface,
        segments: newTaggedSegments,
    })
}

Blockface.totalLength = blockface => {
    if (!blockface?.geometry?.coordinates) return 240
    const lengthKm = length({
        type: 'Feature',
        geometry: blockface.geometry,
        properties: {},
    })
    return Math.round(lengthKm * 3280.84)
}

Blockface.totalOfSegments = blockface => blockface.segments.reduce((sum, segment) => sum + segment.length, 0)

Blockface.unknownRemaining = blockface => {
    if (!blockface) return 0
    return Blockface.totalLength(blockface) - Blockface.totalOfSegments(blockface)
}

Blockface.isComplete = blockface => {
    if (!blockface) return false
    return Math.abs(Blockface.unknownRemaining(blockface)) < 0.01
}

Blockface.cumulativePositions = blockface => {
    const addCumulative = (acc, segment) => [...acc, acc[acc.length - 1] + segment.length]
    if (!blockface) return []
    const segments = blockface.segments
    const unknownRemaining = Blockface.unknownRemaining(blockface)
    const segmentTicks = segments.reduce(addCumulative, [0])
    if (unknownRemaining > 0) {
        const lastPoint = segmentTicks[segmentTicks.length - 1]
        return [...segmentTicks, lastPoint + unknownRemaining]
    }
    return segmentTicks
}

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

Blockface.visualPercentages = blockface => {
    if (!blockface) return []
    const blockfaceLength = Blockface.totalLength(blockface)
    return blockface.segments.map(segment => (segment.length / blockfaceLength) * 100)
}

Blockface.toFirestore = (blockface, encodeTimestamps) => {
    const data = Blockface._toFirestore(blockface, encodeTimestamps)
    if (data.geometry) data.geometry = JSON.stringify(data.geometry)
    return data
}

Blockface.fromFirestore = (doc, decodeTimestamps) => {
    const docWithGeometry = { ...doc }
    if (typeof docWithGeometry.geometry === 'string') docWithGeometry.geometry = JSON.parse(docWithGeometry.geometry)
    return Blockface._fromFirestore(docWithGeometry, decodeTimestamps)
}

export { Blockface }
