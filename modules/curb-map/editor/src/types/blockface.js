/*  Blockface generated from: modules/curb-map/types/blockface.type.js

    id        : "String",
    geometry  : "Object",
    streetName: "String",
    cnnId     : "String?",
    segments  : "[Segment]"

*/

import { length } from '@turf/length'
import { Segment } from './segment.js'

import * as R from '@graffio/types-generation'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const Blockface = function Blockface(id, geometry, streetName, cnnId, segments) {
    R.validateString('Blockface(id, geometry, streetName, cnnId, segments)', 'id', false, id)
    R.validateObject('Blockface(id, geometry, streetName, cnnId, segments)', 'geometry', false, geometry)
    R.validateString('Blockface(id, geometry, streetName, cnnId, segments)', 'streetName', false, streetName)
    R.validateString('Blockface(id, geometry, streetName, cnnId, segments)', 'cnnId', true, cnnId)
    R.validateArray(
        'Blockface(id, geometry, streetName, cnnId, segments)',
        1,
        'Tagged',
        'Segment',
        'segments',
        false,
        segments,
    )

    const result = Object.create(prototype)
    result.id = id
    result.geometry = geometry
    result.streetName = streetName
    if (cnnId != null) result.cnnId = cnnId
    result.segments = segments
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = {
    toString: function () {
        return `Blockface(${R._toString(this.id)}, ${R._toString(this.geometry)}, ${R._toString(this.streetName)}, ${R._toString(this.cnnId)}, ${R._toString(this.segments)})`
    },
    toJSON() {
        return this
    },
}

Blockface.prototype = prototype
prototype.constructor = Blockface

Object.defineProperty(prototype, '@@typeName', { value: 'Blockface' }) // Add hidden @@typeName property

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Blockface.toString = () => 'Blockface'
Blockface.is = v => v && v['@@typeName'] === 'Blockface'
Blockface.from = o => Blockface(o.id, o.geometry, o.streetName, o.cnnId, o.segments)

// -------------------------------------------------------------------------------------------------------------
// Additional functions copied from type definition file
// -------------------------------------------------------------------------------------------------------------
// Additional function: _roundToPrecision
Blockface._roundToPrecision = value => Math.round(value * 10) / 10

// Additional function: setSegments
Blockface.setSegments = (blockface, segments) =>
    Blockface(blockface.id, blockface.geometry, blockface.streetName, blockface.cnnId, segments)

// Additional function: updateSegmentUse
Blockface.updateSegmentUse = (blockface, index, use) => {
    if (!blockface?.segments[index]) return blockface
    const segments = blockface.segments.map((segment, i) => (i === index ? Segment.updateUse(segment, use) : segment))
    return Blockface.setSegments(blockface, segments)
}

// Additional function: updateSegmentLength
Blockface.updateSegmentLength = (blockface, index, newLength) => {
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
        const newSegments = blockface.segments.map((seg, i) => (i === index ? Segment(seg.use, roundedLength) : seg))
        return Blockface.setSegments(blockface, newSegments)
    }
    const nextSegment = blockface.segments[index + 1]
    const newNextLength = Blockface._roundToPrecision(nextSegment.length - lengthDelta)
    if (newNextLength <= 0) return blockface
    const newSegments = blockface.segments.map((seg, i) => {
        if (i === index) return Segment(seg.use, roundedLength)
        if (i === index + 1) return Segment(seg.use, newNextLength)
        return seg
    })
    return Blockface.setSegments(blockface, newSegments)
}

// Additional function: addSegment
Blockface.addSegment = (blockface, targetIndex) => {
    if (!blockface) return blockface
    const blockfaceLength = Blockface.totalLength(blockface)
    const totalSegmentLength = blockface.segments.reduce((sum, seg) => sum + seg.length, 0)
    const currentUnknownRemaining = blockfaceLength - totalSegmentLength
    if (currentUnknownRemaining <= 0) return blockface
    const newSegmentSize = Math.min(20, currentUnknownRemaining)
    const newSegment = Segment('Parking', Blockface._roundToPrecision(newSegmentSize))
    const newSegments = [...blockface.segments]
    const insertIndex = targetIndex >= 0 ? targetIndex + 1 : newSegments.length
    newSegments.splice(insertIndex, 0, newSegment)
    return Blockface.setSegments(blockface, newSegments)
}

// Additional function: addSegmentLeft
Blockface.addSegmentLeft = (blockface, index, desiredLength = 10) => {
    const calculateSplitLengths = (targetLength, desired) =>
        targetLength >= desired
            ? [desired, targetLength - desired]
            : [
                  Blockface._roundToPrecision(targetLength / 2),
                  Blockface._roundToPrecision(targetLength - targetLength / 2),
              ]
    if (!blockface) return blockface
    if (index < 0 || index >= blockface.segments.length) return blockface
    const targetSegment = blockface.segments[index]
    const [newSegmentLength, remainingSegmentLength] = calculateSplitLengths(targetSegment.length, desiredLength)
    const newSegment = Segment('Parking', newSegmentLength)
    const modifiedTargetSegment = Segment(targetSegment.use, remainingSegmentLength)
    const newSegments = [
        ...blockface.segments.slice(0, index),
        newSegment,
        modifiedTargetSegment,
        ...blockface.segments.slice(index + 1),
    ]
    return Blockface.setSegments(blockface, newSegments)
}

// Additional function: replaceSegments
Blockface.replaceSegments = (blockface, segments) => {
    if (!blockface) return blockface
    const newTaggedSegments = segments.map(seg => Segment(seg.use, seg.length))
    return Blockface.setSegments(blockface, newTaggedSegments)
}

// Additional function: totalLength
Blockface.totalLength = blockface => {
    if (!blockface?.geometry?.coordinates) return 240
    const lengthKm = length({ type: 'Feature', geometry: blockface.geometry, properties: {} })
    return Math.round(lengthKm * 3280.84)
}

// Additional function: totalOfSegments
Blockface.totalOfSegments = blockface => blockface.segments.reduce((sum, segment) => sum + segment.length, 0)

// Additional function: unknownRemaining
Blockface.unknownRemaining = blockface => {
    if (!blockface) return 0
    return Blockface.totalLength(blockface) - Blockface.totalOfSegments(blockface)
}

// Additional function: isComplete
Blockface.isComplete = blockface => {
    if (!blockface) return false
    return Math.abs(Blockface.unknownRemaining(blockface)) < 0.01
}

// Additional function: cumulativePositions
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

// Additional function: startPositions
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

// Additional function: visualPercentages
Blockface.visualPercentages = blockface => {
    if (!blockface) return []
    const blockfaceLength = Blockface.totalLength(blockface)
    return blockface.segments.map(segment => (segment.length / blockfaceLength) * 100)
}

export { Blockface }
