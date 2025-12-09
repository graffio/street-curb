/*
 * ColumnDefinition - Tagged type for table column configuration
 *
 * Single source of truth for column layout, formatting, and behavior.
 * Used by VirtualTable and related components to render headers and cells consistently.
 *
 * Usage:
 *   const dateColumn = ColumnDefinition('date', 'Date', '110px', undefined, 'left', Format.Date('medium'), true, true, false)
 *   // or using .from():
 *   const dateColumn = ColumnDefinition.from({ key: 'date', title: 'Date', width: '110px', format: Format.Date('medium') })
 */
// prettier-ignore
export const ColumnDefinition = {
    name: 'ColumnDefinition',
    kind: 'tagged',
    fields: {
        key       : 'String',                // Field name in data object
        title     : 'String',                // Header display text
        width     : 'String?',               // Fixed width (e.g., '110px')
        flex      : 'Number?',               // Flex grow value (alternative to width)
        textAlign : '/(left|center|right)?', // default left
        format    : 'Format?',               // How to format the cell value
        searchable: 'Boolean?',              // Include in text search highlighting
        sortable  : 'Boolean?',              // Allow sorting by this column
        hidden    : 'Boolean?',              // Hide column from display
    },
}
