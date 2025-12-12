// ABOUTME: DataTable component with TanStack Table, virtualization, and @dnd-kit drag-n-drop
// ABOUTME: Provides sorting, column resizing, reordering, and row virtualization

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
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { horizontalListSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Box, Flex } from '@radix-ui/themes'
import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useRef } from 'react'

/*
 * Sort indicator component - shows direction and priority for multi-sort
 */
const SortIndicator = ({ direction, priority }) => {
    if (!direction) return null
    const arrow = direction === 'asc' ? '↑' : '↓'
    const label = priority > 0 ? `${arrow}${priority}` : arrow
    return <span style={{ marginLeft: 4, fontWeight: 600 }}>{label}</span>
}

/*
 * Drag handle icon
 */
const DragHandle = ({ listeners, attributes }) => (
    <Box
        {...listeners}
        {...attributes}
        style={{
            cursor: 'grab',
            padding: '0 4px',
            marginRight: 4,
            opacity: 0.6,
            display: 'inline-flex',
            alignItems: 'center',
        }}
    >
        ⋮⋮
    </Box>
)

/*
 * Sortable header cell component
 */
const SortableHeaderCell = ({ header, sorting, onSort, isEven }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: header.column.id,
    })

    const canSort = header.column.getCanSort()
    const sortDirection = header.column.getIsSorted()
    const sortIndex = sorting?.findIndex(s => s.id === header.column.id) ?? -1
    const sortPriority = sorting?.length > 1 && sortIndex >= 0 ? sortIndex + 1 : 0
    const canResize = header.column.getCanResize()

    const style = {
        width: `calc(var(--header-${header.id}-size) * 1px)`,
        flexShrink: 0,
        position: 'relative',
        textAlign: header.column.columnDef.textAlign || 'left',
        userSelect: 'none',
        opacity: isDragging ? 0.5 : 1,
        transform: CSS.Transform.toString(transform),
        transition,
        backgroundColor: isEven ? 'var(--accent-10)' : 'transparent',
        borderRadius: 'var(--radius-1)',
        padding: '0 var(--space-1)',
    }

    const resizeThumbStyle = {
        position: 'absolute',
        right: 0,
        top: 0,
        height: '100%',
        width: 10,
        cursor: 'col-resize',
        userSelect: 'none',
        touchAction: 'none',
        backgroundColor: 'var(--gray-12)',
        opacity: 0.4,
    }

    return (
        <Box ref={setNodeRef} style={style}>
            <Flex align="center" justify="between">
                <Box
                    onClick={canSort ? e => onSort(header.column, e.shiftKey) : undefined}
                    style={{ cursor: canSort ? 'pointer' : 'default', flex: 1 }}
                >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <SortIndicator direction={sortDirection} priority={sortPriority} />
                </Box>
                <DragHandle listeners={listeners} attributes={attributes} />
            </Flex>
            {canResize && (
                <Box
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    onClick={e => e.stopPropagation()}
                    onMouseEnter={e => (e.target.style.opacity = 0.9)}
                    onMouseLeave={e => (e.target.style.opacity = 0.4)}
                    style={resizeThumbStyle}
                />
            )}
        </Box>
    )
}

/*
 * Table header component with @dnd-kit drag-n-drop
 */
const TableHeader = ({ headerGroups, columnSizeVars, onSort, sorting, columnOrder, onColumnReorder }) => {
    const renderHeader = (header, index) => (
        <SortableHeaderCell
            key={header.id}
            header={header}
            sorting={sorting}
            onSort={onSort}
            isEven={index % 2 === 0}
        />
    )

    const handleDragEnd = event => {
        const { active, over } = event
        if (active && over && active.id !== over.id) onColumnReorder?.(active.id, over.id)
    }

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
    const headers = headerGroups.flatMap(hg => hg.headers)
    const columnIds = columnOrder?.length > 0 ? columnOrder : headers.map(h => h.column.id)

    const style = { backgroundColor: 'var(--accent-9)', color: 'var(--accent-contrast)', ...columnSizeVars }
    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                <Flex align="center" gap="1" px="2" py="1" style={style}>
                    {headers.map(renderHeader)}
                </Flex>
            </SortableContext>
        </DndContext>
    )
}

/*
 * Table row component
 */
const TableRow = ({ row, rowIndex, columnSizeVars, isHighlighted, onClick }) => {
    const renderCell = cell => {
        const style = {
            width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
            flexShrink: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: 'var(--gray-11)',
        }

        return (
            <Box key={cell.id} style={style}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </Box>
        )
    }

    const zebraColor = rowIndex % 2 === 0 ? 'var(--gray-1)' : 'var(--gray-2)'
    const backgroundColor = isHighlighted ? 'var(--yellow-5)' : zebraColor
    const style = { ...columnSizeVars, backgroundColor, cursor: onClick ? 'pointer' : undefined }

    return (
        <Flex align="start" gap="1" px="2" py="1" onClick={onClick} style={style}>
            {row.getVisibleCells().map(renderCell)}
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
    highlightedId,
    columnSizing,
    columnVisibility,
    sorting,
    columnOrder,
    onColumnSizingChange,
    onColumnVisibilityChange,
    onSortingChange,
    onColumnOrderChange,
    onRowClick,
    context = {},
}) => {
    // Functions
    const sortColumn = (column, isMulti) => {
        if (!onSortingChange) return
        column.toggleSorting(undefined, isMulti)
    }

    const createRowClickHandler = row => () => onRowClick?.(row.original, row.index)

    const reorderColumns = (draggedId, targetId) => {
        if (!onColumnOrderChange) return

        const stateOrder = table.getState().columnOrder
        const currentOrder = stateOrder.length > 0 ? stateOrder : columns.map(c => c.id)
        const draggedIndex = currentOrder.indexOf(draggedId)
        const targetIndex = currentOrder.indexOf(targetId)

        if (draggedIndex === -1 || targetIndex === -1) return

        const newOrder = [...currentOrder]
        newOrder.splice(draggedIndex, 1)
        newOrder.splice(targetIndex, 0, draggedId)
        onColumnOrderChange(newOrder)
    }

    const computeColumnSizeVars = () => {
        const headers = table.getFlatHeaders()
        const colSizes = {}
        for (const header of headers) {
            colSizes[`--header-${header.id}-size`] = header.getSize()
            colSizes[`--col-${header.column.id}-size`] = header.column.getSize()
        }
        return colSizes
    }

    const findHighlightedRowIndex = () => {
        if (highlightedId == null) return -1
        return rows.findIndex(row => row.original.id === highlightedId)
    }

    const scrollToHighlightedRow = () => {
        const highlightedRowIndex = findHighlightedRowIndex()
        if (highlightedRowIndex < 0 || highlightedRowIndex >= rows.length) return

        // Skip scroll if row is already visible
        const { startIndex, endIndex } = virtualizer.range ?? {}
        if (highlightedRowIndex >= startIndex && highlightedRowIndex <= endIndex) return

        const scrollToIndex = () => {
            try {
                virtualizer.scrollToIndex(highlightedRowIndex, { align: 'center' })
            } catch {
                // Scroll failures are non-critical
            }
        }

        const timeout = setTimeout(scrollToIndex, 50)
        return () => clearTimeout(timeout)
    }

    const renderVirtualRow = virtualRow => {
        const highlightedRowIndex = findHighlightedRowIndex()
        const style = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualRow.start}px)`,
        }

        const row = rows[virtualRow.index]
        return (
            <Box key={row.id} style={style}>
                <TableRow
                    row={row}
                    rowIndex={virtualRow.index}
                    columnSizeVars={columnSizeVars}
                    isHighlighted={virtualRow.index === highlightedRowIndex}
                    onClick={onRowClick ? handleRowClick(row) : undefined}
                />
            </Box>
        )
    }

    // Refs
    const tableContainerRef = useRef(null)

    // -----------------------------------------------------------------------------------------------------------------
    // TanStack Table instance
    // -----------------------------------------------------------------------------------------------------------------
    // prettier-ignore
    const state = {
        ...(columnSizing && Object.keys(columnSizing).length > 0 && { columnSizing }),
        ...(columnVisibility                                     && { columnVisibility }),
        ...(sorting && sorting.length > 0                        && { sorting }),
        ...(columnOrder && columnOrder.length > 0                && { columnOrder }),
    }

    const table = useReactTable({
        data,
        columns,
        columnResizeMode: 'onChange',
        defaultColumn: { enableResizing: false },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state,
        onColumnSizingChange,
        onColumnVisibilityChange,
        onSortingChange,
        onColumnOrderChange,
        meta: context,
    })

    // Derived state
    const { rows } = table.getRowModel()

    // -----------------------------------------------------------------------------------------------------------------
    // TanStack Virtualization
    // -----------------------------------------------------------------------------------------------------------------
    const virtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => rowHeight,
        overscan: 5,
    })

    // -----------------------------------------------------------------------------------------------------------------
    // Hooks
    // -----------------------------------------------------------------------------------------------------------------
    const handleSort = useCallback(sortColumn, [onSortingChange])
    const handleRowClick = useCallback(createRowClickHandler, [onRowClick])
    const handleColumnReorder = useCallback(reorderColumns, [onColumnOrderChange, table, columns])
    const columnSizeVars = React.useMemo(computeColumnSizeVars, [columnSizing, columns, table])
    useEffect(scrollToHighlightedRow, [highlightedId, rows.length, virtualizer])

    // -----------------------------------------------------------------------------------------------------------------
    // Main
    // -----------------------------------------------------------------------------------------------------------------
    return (
        <Flex direction="column" style={{ height }}>
            <TableHeader
                headerGroups={table.getHeaderGroups()}
                columnSizeVars={columnSizeVars}
                onSort={handleSort}
                sorting={sorting}
                columnOrder={columnOrder}
                onColumnReorder={handleColumnReorder}
            />

            <Box style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                <Box ref={tableContainerRef} style={{ position: 'absolute', inset: 0, overflow: 'auto' }}>
                    <Box style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
                        {virtualizer.getVirtualItems().map(renderVirtualRow)}
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
    highlightedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    columnSizing: PropTypes.object,
    columnVisibility: PropTypes.object,
    sorting: PropTypes.array,
    columnOrder: PropTypes.array,
    onColumnSizingChange: PropTypes.func,
    onColumnVisibilityChange: PropTypes.func,
    onSortingChange: PropTypes.func,
    onColumnOrderChange: PropTypes.func,
    onRowClick: PropTypes.func,
    context: PropTypes.object,
}

export { DataTable }
