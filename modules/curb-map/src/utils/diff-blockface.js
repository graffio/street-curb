// ABOUTME: Utility for computing changes between two blockface states
// ABOUTME: Used to track segment modifications for audit trails and change logs

/**
 * Compare two blockfaces and identify changes to segments
 * Returns structured change object with added, modified, and removed segments
 *
 * @sig diffBlockfaces :: (Blockface?, Blockface) -> {
 *   added: [{index: Number, segment: Segment}],
 *   modified: [{index: Number, field: String, oldValue: Any, newValue: Any}],
 *   removed: [{index: Number, segment: Segment}]
 * }
 */
export const diffBlockfaces = (oldBlockface, newBlockface) => {
    const buildSegmentMap = segments => {
        const map = new Map()
        segments.forEach((segment, index) => map.set(segment.id, segment))
        return map
    }

    const detectAddedSegment = (newSegment, newIndex, oldSegmentsById) => {
        if (oldSegmentsById.has(newSegment.id)) return null
        return { index: newIndex, segment: newSegment }
    }

    const detectModifications = (oldSegment, newSegment, newIndex) => {
        const mods = []
        if (oldSegment.use !== newSegment.use)
            mods.push({ index: newIndex, field: 'use', oldValue: oldSegment.use, newValue: newSegment.use })
        if (oldSegment.length !== newSegment.length)
            mods.push({ index: newIndex, field: 'length', oldValue: oldSegment.length, newValue: newSegment.length })
        return mods
    }

    const detectRemovedSegment = (oldSegment, oldIndex, newSegmentsById) => {
        if (newSegmentsById.has(oldSegment.id)) return null
        return { index: oldIndex, segment: oldSegment }
    }

    // Handle case where there's no previous blockface
    if (!oldBlockface) {
        const added = newBlockface.segments.map((segment, index) => ({ index, segment }))
        return { added, modified: [], removed: [] }
    }

    const oldSegmentsById = buildSegmentMap(oldBlockface.segments)
    const newSegmentsById = buildSegmentMap(newBlockface.segments)

    // Find added and modified segments
    const added = []
    const modified = []
    newBlockface.segments.forEach((newSegment, newIndex) => {
        const oldSegment = oldSegmentsById.get(newSegment.id)
        if (!oldSegment) return added.push(detectAddedSegment(newSegment, newIndex, oldSegmentsById))
        modified.push(...detectModifications(oldSegment, newSegment, newIndex))
    })

    // Find removed segments
    const removed = oldBlockface.segments
        .map((oldSegment, oldIndex) => detectRemovedSegment(oldSegment, oldIndex, newSegmentsById))
        .filter(Boolean)

    return { added, modified, removed }
}
