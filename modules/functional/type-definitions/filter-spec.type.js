/*
 * FilterSpec - Tagged sum type for composable data filtering
 *
 * Represents filter specifications as data rather than code, enabling:
 * - Serialization (save filters to URL, localStorage, Redux)
 * - Composition via Compound variant
 * - Type-safe pattern matching in interpreters
 *
 * Usage:
 *   const filter = FilterSpec.TextMatch(['payee', 'memo'], 'coffee')
 *   const filtered = applyFilter(data, filter)
 */
// prettier-ignore
export const FilterSpec = {
    name: 'FilterSpec',
    kind: 'taggedSum',
    variants: {
        TextMatch    : { fields: '[String]', query: 'String'          }, // Match if any of the specified fields contain the query string (case-insensitive)
        DateRange    : { field: 'String', start: 'Date', end: 'Date'  }, // Match if the date field falls within start and end dates (inclusive)
        CategoryMatch: { field: 'String', categories: '[String]'      }, // Match if the field value is one of the specified categories
        Compound     : { filters: '[FilterSpec]', mode: /^(all|any)$/ }, // Combine multiple filters with AND (all) or OR (any) logic
    },
}
