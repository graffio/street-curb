// ABOUTME: DataTable component with TanStack Table, virtualization, and @dnd-kit drag-n-drop
// ABOUTME: Provides sorting, column resizing, reordering, tree data, and expandable sub-components

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
 * - Tree data with expand/collapse via getChildRows prop
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
import { KeymapModule } from '@graffio/keymap'
import { Box, Flex } from '@radix-ui/themes'
import {
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useRef } from 'react'

const { ActionRegistry } = KeymapModule

const T = {
    // Gets row id, handling both plain objects and ViewRow.Detail structure
    // @sig toRowId :: Object -> String | undefined
    toRowId: row => row.id ?? row.transaction?.id,

    // Get the list of navigable IDs (focusableIds if provided, otherwise all row IDs)
    // @sig toNavigableIds :: ([String]?, [Row]) -> [String]
    toNavigableIds: (focusableIds, rows) =>
        focusableIds?.length > 0 ? focusableIds : rows.map(r => T.toRowId(r.original)),

    // Calculate next index for keyboard navigation (wraps around)
    // @sig toNextIndex :: (String, [String], String?) -> Number
    toNextIndex: (direction, ids, highlightedId) => {
        const currentIndex = highlightedId != null ? ids.indexOf(highlightedId) : -1
        return direction === 'ArrowDown'
            ? currentIndex >= ids.length - 1
                ? 0
                : currentIndex + 1
            : currentIndex <= 0
              ? ids.length - 1
              : currentIndex - 1
    },

    // Creates a navigation handler that reads current state from a ref
    // @sig toNavigateHandler :: (String, Ref) -> () -> void
    toNavigateHandler: (direction, navRef) => () => {
        const { highlightedId, focusableIds, rows, onHighlightChange } = navRef.current
        if (!onHighlightChange) return
        const ids = T.toNavigableIds(focusableIds, rows)
        if (ids.length === 0) return
        const nextIndex = T.toNextIndex(direction, ids, highlightedId)
        onHighlightChange(ids[nextIndex])
    },
}

const E = {
    // Action registration effect for keyboard navigation
    // @sig actionRegistrationEffect :: (String, Ref) -> () -> (() -> void)?
    actionRegistrationEffect: (actionContext, navRef) => () => {
        if (!actionContext) return undefined

        return ActionRegistry.register(actionContext, [
            { id: 'navigate:down', description: 'Move down', execute: T.toNavigateHandler('ArrowDown', navRef) },
            { id: 'navigate:up', description: 'Move up', execute: T.toNavigateHandler('ArrowUp', navRef) },
            { id: 'dismiss', description: 'Dismiss', execute: () => navRef.current.onEscape?.() },
        ])
    },
}

// Sort indicator component - shows direction and priority for multi-sort
// @sig SortIndicator :: { direction: String, priority: Number } -> ReactElement
const SortIndicator = ({ direction, priority }) => {
    if (!direction) return null
    const arrow = direction === 'asc' ? '↑' : '↓'
    const label = priority > 0 ? `${arrow}${priority}` : arrow
    return <span style={{ marginLeft: 4, fontWeight: 600 }}>{label}</span>
}

// Drag handle icon for column reordering
// @sig DragHandle :: { listeners: Object, attributes: Object } -> ReactElement
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

// Sortable header cell with drag-n-drop and resize support
// @sig SortableHeaderCell :: { header: Header, sorting: Array, onSort: Function, isEven: Boolean } -> ReactElement
const SortableHeaderCell = ({ header, sorting, onSort, isEven }) => {
    const { column, id } = header
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: column.id })

    const canSort = column.getCanSort()
    const sortDirection = column.getIsSorted()
    const sortIndex = sorting?.findIndex(s => s.id === column.id) ?? -1
    const sortPriority = sorting?.length > 1 && sortIndex >= 0 ? sortIndex + 1 : 0
    const canResize = column.getCanResize()

    const style = {
        width: `calc(var(--header-${id}-size) * 1px)`,
        flexShrink: 0,
        position: 'relative',
        textAlign: column.columnDef.textAlign || 'left',
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
                    onClick={canSort ? e => onSort(column, e.shiftKey) : undefined}
                    style={{ cursor: canSort ? 'pointer' : 'default', flex: 1 }}
                >
                    {flexRender(column.columnDef.header, header.getContext())}
                    <SortIndicator direction={sortDirection} priority={sortPriority} />
                </Box>
                <DragHandle listeners={listeners} attributes={attributes} />
            </Flex>
            {canResize && (
                <Box
                    onMouseDown={e => {
                        e.stopPropagation()
                        header.getResizeHandler()(e)
                    }}
                    onTouchStart={e => {
                        e.stopPropagation()
                        header.getResizeHandler()(e)
                    }}
                    onClick={e => e.stopPropagation()}
                    onMouseEnter={e => (e.target.style.opacity = 0.9)}
                    onMouseLeave={e => (e.target.style.opacity = 0.4)}
                    style={resizeThumbStyle}
                />
            )}
        </Box>
    )
}

// Table header component with @dnd-kit drag-n-drop
// @sig TableHeader :: { headerGroups, onSort, sorting, columnOrder, onColumnReorder } -> ReactElement
const TableHeader = ({ headerGroups, onSort, sorting, columnOrder, onColumnReorder }) => {
    // Renders a sortable header cell for a column
    // @sig toHeaderCell :: (Header, Number) -> ReactElement
    const toHeaderCell = (header, index) => (
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

    const style = { backgroundColor: 'var(--accent-9)', color: 'var(--accent-contrast)' }
    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                <Flex align="center" gap="1" px="2" py="1" style={style}>
                    {headers.map(toHeaderCell)}
                </Flex>
            </SortableContext>
        </DndContext>
    )
}

// Individual table cell with column sizing
// @sig TableCell :: { cell: Cell } -> ReactElement
const TableCell = ({ cell }) => {
    const { column, id } = cell
    const style = {
        width: `calc(var(--col-${column.id}-size) * 1px)`,
        flexShrink: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: 'var(--gray-11)',
        textAlign: column.columnDef.textAlign || 'left',
    }

    return (
        <Box key={id} style={style}>
            {flexRender(column.columnDef.cell, cell.getContext())}
        </Box>
    )
}

// Virtualized row wrapper with absolute positioning
// @sig VirtualRow :: Props -> ReactElement
const VirtualRow = ({ virtualRow, row, isHighlighted, renderSubComponent, measureElement, onRowClick }) => {
    const { index, start } = virtualRow
    const style = { position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${start}px)` }
    const isLeaf = !row.subRows || row.subRows.length === 0
    const showSubComponent = renderSubComponent && row.getIsExpanded() && isLeaf

    return (
        <Box data-index={index} ref={measureElement} style={style}>
            <TableRow row={row} rowIndex={index} isHighlighted={isHighlighted} onRowClick={onRowClick} />
            {showSubComponent && (
                <Box px="2" py="2" style={{ backgroundColor: 'var(--gray-2)' }}>
                    {renderSubComponent({ row })}
                </Box>
            )}
        </Box>
    )
}

// Table row component with zebra striping and highlight support
// @sig TableRow :: { row, rowIndex, isHighlighted, onRowClick } -> ReactElement
const TableRow = React.memo(({ row, rowIndex, isHighlighted, onRowClick }) => {
    const zebraColor = rowIndex % 2 === 0 ? 'var(--gray-1)' : 'var(--gray-2)'
    const backgroundColor = isHighlighted ? 'var(--yellow-5)' : zebraColor
    const handleClick = onRowClick ? () => onRowClick(row.original, rowIndex) : undefined
    const style = { backgroundColor, cursor: handleClick ? 'pointer' : undefined }

    return (
        <Flex align="start" gap="1" px="2" py="1" onClick={handleClick} style={style}>
            {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id} cell={cell} />
            ))}
        </Flex>
    )
})

// Main DataTable component with TanStack Table, virtualization, and drag-n-drop
// @sig DataTable :: Props -> ReactElement
const DataTable = ({
    columns,
    data,
    height = 600,
    rowHeight = 48,
    highlightedId,
    focusableIds,
    columnSizing,
    columnVisibility,
    sorting,
    columnOrder,
    expanded,
    getChildRows,
    getRowCanExpand,
    renderSubComponent,
    onColumnSizingChange,
    onColumnVisibilityChange,
    onSortingChange,
    onColumnOrderChange,
    onExpandedChange,
    onRowClick,
    onHighlightChange,
    onEscape,
    actionContext,
    context = {},
}) => {
    // Hack: convert nested accessorKey paths to accessorFn to avoid TanStack "deeply nested key" warnings
    // @sig toSafeAccessor :: ColumnDefinition -> ColumnDefinition
    const toSafeAccessor = col => {
        const path = (row, path) => path.split('.').reduce((obj, key) => obj?.[key], row)

        return col.accessorKey?.includes('.')
            ? { ...col, accessorFn: row => path(row, col.accessorKey), accessorKey: undefined }
            : col
    }

    // Toggles sort on a column
    // @sig sortColumn :: (Column, Boolean) -> void
    const sortColumn = (column, isMulti) => {
        if (!onSortingChange) return
        column.toggleSorting(undefined, isMulti)
    }

    // Reorders columns by moving draggedId to targetId position
    // @sig reorderColumns :: (String, String) -> void
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

    // Computes CSS variables for column widths
    // @sig computeColumnSizeVars :: () -> Object
    const computeColumnSizeVars = () => {
        const addHeaderVars = (vars, header) => ({
            ...vars,
            [`--header-${header.id}-size`]: header.getSize(),
            [`--col-${header.column.id}-size`]: header.column.getSize(),
        })

        return table.getFlatHeaders().reduce(addHeaderVars, {})
    }

    // Finds index of highlighted row in current row list
    // @sig findHighlightedRowIndex :: () -> Number
    const findHighlightedRowIndex = () => {
        if (highlightedId == null) return -1
        return rows.findIndex(row => T.toRowId(row.original) === highlightedId)
    }

    // Scrolls to highlighted row if not visible
    // @sig scrollToHighlightedRow :: () -> Function | undefined
    const scrollToHighlightedRow = () => {
        // Performs the scroll with error handling
        // @sig doScroll :: () -> void
        const doScroll = () => {
            try {
                virtualizer.scrollToIndex(highlightedRowIndex, { align: 'auto' })
            } catch {
                // Scroll failures are non-critical
            }
        }

        const highlightedRowIndex = findHighlightedRowIndex()
        if (highlightedRowIndex < 0 || highlightedRowIndex >= rows.length) return

        // Skip scroll if row is already visible
        const { startIndex, endIndex } = virtualizer.range ?? {}
        if (highlightedRowIndex >= startIndex && highlightedRowIndex <= endIndex) return

        const timeout = setTimeout(doScroll, 50)
        return () => clearTimeout(timeout)
    }

    // Renders a virtual row for a given virtual item
    // @sig toVirtualRow :: { index: Number, start: Number } -> ReactElement
    const toVirtualRow = ({ index, start }) => (
        <VirtualRow
            key={rows[index].id}
            virtualRow={{ index, start }}
            row={rows[index]}
            isHighlighted={index === highlightedRowIndex}
            renderSubComponent={renderSubComponent}
            measureElement={virtualizer.measureElement}
            onRowClick={onRowClick}
        />
    )

    // Refs
    const tableContainerRef = useRef(null)
    const navRef = useRef({ highlightedId, focusableIds, rows: [], onHighlightChange, onEscape })

    // rows assigned after table.getRowModel() below; preserve previous value until then
    navRef.current = { highlightedId, focusableIds, rows: navRef.current.rows, onHighlightChange, onEscape }

    // -----------------------------------------------------------------------------------------------------------------
    // TanStack Table instance
    // -----------------------------------------------------------------------------------------------------------------
    // prettier-ignore
    const state = {
        ...(columnSizing && Object.keys(columnSizing).length > 0 && { columnSizing }),
        ...(columnVisibility                                     && { columnVisibility }),
        ...(sorting && sorting.length > 0                        && { sorting }),
        ...(columnOrder && columnOrder.length > 0                && { columnOrder }),
        ...(expanded                                             && { expanded }),
    }

    const safeColumns = columns.map(toSafeAccessor)

    const table = useReactTable({
        data,
        columns: safeColumns,
        columnResizeMode: 'onChange',
        defaultColumn: { enableResizing: false },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        ...(getChildRows && { getSubRows: getChildRows }),
        ...((getChildRows || getRowCanExpand) && { getExpandedRowModel: getExpandedRowModel() }),
        ...(getRowCanExpand && { getRowCanExpand }),
        state,
        onColumnSizingChange,
        onColumnVisibilityChange,
        onSortingChange,
        onColumnOrderChange,
        onExpandedChange,
        meta: context,
    })

    // Derived state
    const { rows } = table.getRowModel()
    navRef.current.rows = rows

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
    const handleColumnReorder = useCallback(reorderColumns, [onColumnOrderChange, table, columns])
    const columnSizeVars = React.useMemo(computeColumnSizeVars, [columnSizing, columns, table])
    const highlightedRowIndex = React.useMemo(findHighlightedRowIndex, [highlightedId, rows])
    useEffect(scrollToHighlightedRow, [highlightedId, rows.length, virtualizer])
    useEffect(E.actionRegistrationEffect(actionContext, navRef), [actionContext])

    // -----------------------------------------------------------------------------------------------------------------
    // Main
    // -----------------------------------------------------------------------------------------------------------------
    return (
        <Flex direction="column" style={{ height, ...columnSizeVars }}>
            <TableHeader
                headerGroups={table.getHeaderGroups()}
                onSort={handleSort}
                sorting={sorting}
                columnOrder={columnOrder}
                onColumnReorder={handleColumnReorder}
            />

            <Box style={{ flex: 1, position: 'relative', minHeight: 0 }}>
                <Box ref={tableContainerRef} style={{ position: 'absolute', inset: 0, overflow: 'auto' }}>
                    <Box style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
                        {virtualizer.getVirtualItems().map(toVirtualRow)}
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
    focusableIds: PropTypes.array,
    columnSizing: PropTypes.object,
    columnVisibility: PropTypes.object,
    sorting: PropTypes.array,
    columnOrder: PropTypes.array,
    expanded: PropTypes.object,
    getChildRows: PropTypes.func,
    getRowCanExpand: PropTypes.func,
    renderSubComponent: PropTypes.func,
    onColumnSizingChange: PropTypes.func,
    onColumnVisibilityChange: PropTypes.func,
    onSortingChange: PropTypes.func,
    onColumnOrderChange: PropTypes.func,
    onExpandedChange: PropTypes.func,
    onRowClick: PropTypes.func,
    onHighlightChange: PropTypes.func,
    onEscape: PropTypes.func,
    actionContext: PropTypes.string,
    context: PropTypes.object,
}

export { DataTable }
