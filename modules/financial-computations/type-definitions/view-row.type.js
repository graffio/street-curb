// ABOUTME: ViewRow type for pairing domain data with view-specific computed values
// ABOUTME: Tagged sum with Detail (transaction + computed) and Summary (group totals) variants

// prettier-ignore
export const ViewRow = {
    name: 'ViewRow',
    kind: 'taggedSum',
    variants: {
        Detail:  { transaction: 'Transaction', computed: 'Object' },
        Summary: { groupKey: 'String', aggregates: 'Object', depth: 'Number' },
    },
}
