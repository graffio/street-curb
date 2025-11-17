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
    const added = []
    const modified = []
    const removed = []

    // Handle case where there's no previous blockface
    if (!oldBlockface) {
        newBlockface.segments.forEach((segment, index) => {
            added.push({ index, segment })
        })
        return { added, modified, removed }
    }

    // Build lookup maps by segment ID for efficient comparison
    const oldSegmentsById = new Map()
    const oldSegmentsByIndex = new Map()
    oldBlockface.segments.forEach((segment, index) => {
        oldSegmentsById.set(segment.id, segment)
        oldSegmentsByIndex.set(segment.id, index)
    })

    const newSegmentsById = new Map()
    newBlockface.segments.forEach((segment, index) => {
        newSegmentsById.set(segment.id, segment)
    })

    // Find added and modified segments
    newBlockface.segments.forEach((newSegment, newIndex) => {
        const oldSegment = oldSegmentsById.get(newSegment.id)

        if (!oldSegment) {
            // Segment is new
            added.push({ index: newIndex, segment: newSegment })
        } else {
            // Segment exists - check for modifications
            if (oldSegment.use !== newSegment.use) 
                modified.push({ index: newIndex, field: 'use', oldValue: oldSegment.use, newValue: newSegment.use })
            
            if (oldSegment.length !== newSegment.length) 
                modified.push({
                    index: newIndex,
                    field: 'length',
                    oldValue: oldSegment.length,
                    newValue: newSegment.length,
                })
            
        }
    })

    // Find removed segments
    oldBlockface.segments.forEach((oldSegment, oldIndex) => {
        if (!newSegmentsById.has(oldSegment.id)) 
            removed.push({ index: oldIndex, segment: oldSegment })
        
    })

    return { added, modified, removed }
}
