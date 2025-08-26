/**
 * Blockface represents a street segment with geometry, metadata, and curb segments
 * @sig Blockface :: { id: String, geometry: Object, streetName: String, segments: [Segment] }
 */

export const Blockface = {
    name: 'Blockface',
    kind: 'tagged',
    fields: { id: 'String', geometry: 'Object', streetName: 'String', segments: '[Segment]' },
}
