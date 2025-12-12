/*
 * ColumnDefinition - Tagged type for table column configuration
 *
 * Aligned with TanStack Table column definition format for direct compatibility.
 * Each column specifies a cell renderer that owns all formatting/display logic.
 *
 * Usage:
 *   ColumnDefinition.from({
 *     id: 'amount',
 *     header: 'Amount',
 *     size: 100,
 *     cell: CurrencyCell,
 *     meta: { searchable: false }
 *   })
 *
 * TanStack compatibility:
 *   Columns can be passed directly to useReactTable({ columns: [...] })
 *
 * Our extensions in meta:
 *   - searchable: include in text search highlighting
 *   - showRunningTotal: display running total indicator
 */
// prettier-ignore
export const ColumnDefinition = {
    name: 'ColumnDefinition',
    kind: 'tagged',
    fields: {
        id            : 'String',    // Column identifier (TanStack: id)
        accessorKey   : 'String?',   // Field name in row data (defaults to id)
        header        : 'String',    // Header display text (TanStack: header as string)
        size          : 'Number?',   // Column width in pixels (TanStack: size)
        minSize       : 'Number?',   // Minimum width (TanStack: minSize)
        maxSize       : 'Number?',   // Maximum width (TanStack: maxSize)
        textAlign     : 'String?',   // Text alignment: 'left' | 'center' | 'right'
        enableSorting : 'Boolean?',  // Allow sorting (TanStack: enableSorting)
        enableResizing: 'Boolean?',  // Allow resizing (TanStack: enableResizing)
        meta          : 'Object?',   // App-specific extensions (searchable, showRunningTotal)

        cell          : 'Any',       // Cell renderer component (required)
    },
}
