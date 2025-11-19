// ABOUTME: Utility for computing changes between two blockface states
// ABOUTME: Used to track segment modifications for audit trails and change logs

import LookupTable from '@graffio/functional/src/lookup-table.js'
import { Segment } from '../types/index.js'

/**
 * Compare two blockfaces and identify changes to segments
 * Returns structured change object with added, modified, and removed segments
 *
 * @sig diffBlockfaces :: (Blockface?, Blockface) -> {
 *   added:    [{index: Number, segment: Segment}],
 *   modified: [{index: Number, field: String, oldValue: Any, newValue: Any}],
 *   removed:  [{index: Number, segment: Segment}]
 * }
 */
const diffBlockfaces = (oldBlockface, newBlockface) => {
    const detectModifications = (oldSegment, newSegment, newIndex) => {
        const mods = []
        if (oldSegment.use !== newSegment.use)
            mods.push({ index: newIndex, field: 'use', oldValue: oldSegment.use, newValue: newSegment.use })
        if (oldSegment.length !== newSegment.length)
            mods.push({ index: newIndex, field: 'length', oldValue: oldSegment.length, newValue: newSegment.length })
        return mods
    }

    // Handle case where there's no previous blockface
    let newSegments = newBlockface.segments
    let oldSegments = oldBlockface?.segments || LookupTable([], Segment, 'id')
    const added = []
    const modified = []

    // Ensure segments are LookupTables for efficient ID-based lookups
    oldSegments = LookupTable.is(oldSegments) ? oldSegments : LookupTable(oldSegments, Segment, 'id')
    newSegments = LookupTable.is(newSegments) ? newSegments : LookupTable(newSegments, Segment, 'id')

    // everything is new!
    if (!oldBlockface) return { added: newSegments.map((s, i) => ({ index: i, segment: s })), modified, removed: [] }

    // Find added and modified segments
    newSegments.forEach((newSegment, newIndex) => {
        const oldSegment = oldSegments.get(newSegment.id)
        return oldSegment
            ? modified.push(...detectModifications(oldSegment, newSegment, newIndex))
            : added.push({ index: newIndex, segment: newSegment })
    })

    // Find removed segments
    const removed = oldSegments
        .filter(oldSegment => !newSegments.get(oldSegment.id))
        .map(segment => ({ index: oldSegments.indexOf(segment), segment }))

    return { added, modified, removed }
}

export { diffBlockfaces }
