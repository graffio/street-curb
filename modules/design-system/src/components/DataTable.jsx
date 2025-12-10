/*
 * DataTable - TanStack Table integration for the design system
 *
 * A flexible table component built on TanStack Table and TanStack Virtual.
 * Accepts ColumnDefinition[] (aligned with TanStack format) and row data.
 *
 * Features:
 * - Column resizing with persistence callbacks
 * - Column visibility
 * - Virtualization for large datasets
 * - Row highlighting
 * - Custom cell renderers via column.cell
 *
 * Usage:
 *   <Table
 *     columns={columns}
 *     data={rows}
 *     columnSizing={columnSizing}
 *     onColumnSizingChange={setColumnSizing}
 *   />
 */
import { Box, Flex } from '@radix-ui/themes'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useRef } from 'react'

/*
 * Table header component
 */
const TableHeader = ({ headerGroups, columnSizeVars }) => (
    <Flex
        align="center"
        gap="1"
        px="2"
        py="1"
        style={{ backgroundColor: 'var(--accent-9)', color: 'var(--accent-contrast)', ...columnSizeVars }}
    >
        {headerGroups.map(headerGroup =>
            headerGroup.headers.map(header => (
                <Box
                    key={header.id}
                    style={{
                        width: `calc(var(--header-${header.id}-size) * 1px)`,
                        flexShrink: 0,
                        position: 'relative',
                        textAlign: header.column.columnDef.meta?.textAlign || 'left',
                    }}
                >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanResize() && (
                        <Box
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: 0,
                                height: '100%',
                                width: 4,
                                cursor: 'col-resize',
                                userSelect: 'none',
                                touchAction: 'none',
                            }}
                        />
                    )}
                </Box>
            )),
        )}
    </Flex>
)

/*
 * Table row component
 */
const TableRow = ({ row, rowIndex, columnSizeVars, isHighlighted, onClick }) => {
    const zebraColor = rowIndex % 2 === 0 ? 'var(--blue-)' : 'var(--gray-2)'
    const backgroundColor = isHighlighted ? 'var(--yellow-5)' : zebraColor

    return (
        <Flex
            align="start"
            gap="1"
            px="2"
            py="1"
            onClick={onClick}
            style={{ ...columnSizeVars, backgroundColor, cursor: onClick ? 'pointer' : undefined }}
        >
            {row.getVisibleCells().map(cell => (
                <Box
                    key={cell.id}
                    style={{
                        width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
                        flexShrink: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: 'var(--gray-11)',
                    }}
                >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Box>
            ))}
        </Flex>
    )
}

/*
 * Main DataTable component
 */
const DataTable = ({
    columns,
    data,
    height = 600,
    rowHeight = 48,
    highlightedRow,
    columnSizing,
    columnVisibility,
    onColumnSizingChange,
    onColumnVisibilityChange,
    onRowClick,
    context = {},
}) => {
    const tableContainerRef = useRef(null)

    // TanStack Table instance
    const table = useReactTable({
        data,
        columns,
        columnResizeMode: 'onChange',
        getCoreRowModel: getCoreRowModel(),
        state: { ...(columnSizing && { columnSizing }), ...(columnVisibility && { columnVisibility }) },
        onColumnSizingChange,
        onColumnVisibilityChange,
        meta: context,
    })

    // Column size CSS variables for performant resizing
    const columnSizeVars = React.useMemo(() => {
        const headers = table.getFlatHeaders()
        const colSizes = {}
        for (const header of headers) {
            colSizes[`--header-${header.id}-size`] = header.getSize()
            colSizes[`--col-${header.column.id}-size`] = header.column.getSize()
        }
        return colSizes
    }, [table.getState().columnSizing])

    // Virtualization
    const { rows } = table.getRowModel()
    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => rowHeight,
        overscan: 5,
    })

    // Scroll to highlighted row
    useEffect(() => {
        if (highlightedRow == null || highlightedRow < 0 || highlightedRow >= rows.length) return
        // Delay to ensure virtualizer measurements are current after data/layout changes
        const timeout = setTimeout(() => {
            try {
                virtualizer.scrollToIndex(highlightedRow, { align: 'center' })
            } catch {
                // Scroll failures are non-critical
            }
        }, 50)
        return () => clearTimeout(timeout)
    }, [highlightedRow, rows.length, virtualizer])

    const handleRowClick = useCallback(row => () => onRowClick?.(row.original, row.index), [onRowClick])

    return (
        <Flex direction="column" style={{ height }}>
            <TableHeader headerGroups={table.getHeaderGroups()} columnSizeVars={columnSizeVars} />

            <Box style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                <Box ref={tableContainerRef} style={{ position: 'absolute', inset: 0, overflow: 'auto' }}>
                    <Box style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
                        {virtualizer.getVirtualItems().map(virtualRow => {
                            const row = rows[virtualRow.index]
                            return (
                                <Box
                                    key={row.id}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        transform: `translateY(${virtualRow.start}px)`,
                                    }}
                                >
                                    <TableRow
                                        row={row}
                                        rowIndex={virtualRow.index}
                                        columnSizeVars={columnSizeVars}
                                        isHighlighted={virtualRow.index === highlightedRow}
                                        onClick={onRowClick ? handleRowClick(row) : undefined}
                                    />
                                </Box>
                            )
                        })}
                    </Box>
                </Box>
            </Box>
        </Flex>
    )
}

DataTable.propTypes = {
    columns: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    rowHeight: PropTypes.number,
    highlightedRow: PropTypes.number,
    columnSizing: PropTypes.object,
    columnVisibility: PropTypes.object,
    onColumnSizingChange: PropTypes.func,
    onColumnVisibilityChange: PropTypes.func,
    onRowClick: PropTypes.func,
    context: PropTypes.object,
}

export { DataTable }
