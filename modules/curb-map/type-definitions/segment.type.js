/** @module Segment */

import { FieldTypes } from './field-types.js'

/**
 * Segment represents a portion of a blockface with specific use
 * @sig Segment :: { use: String, length: Number }
 */

// prettier-ignore
export const Segment = {
    name: 'Segment',
    kind: 'tagged',
    fields: {
        id    : FieldTypes.segmentId,
        use   : 'String',
        length: 'Number'
    }}

/*
 * Create a new Blockface with the use of the Segment at the given index updated
 * @sig setSegments :: (Blockface, Number, String) -> Blockface
 */
Segment.updateUse = (segment, use) => Segment(segment.id, use, segment.length)
