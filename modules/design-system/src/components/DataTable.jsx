// ABOUTME: DataTable component with TanStack Table, virtualization, and @dnd-kit drag-n-drop
// ABOUTME: Provides sorting, column resizing, reordering, tree data, and expandable sub-components
// COMPLEXITY: lines — Design system component integrating TanStack Table + Virtual + dnd-kit
// COMPLEXITY: functions — Design system component integrating TanStack Table + Virtual + dnd-kit
// COMPLEXITY: cohesion-structure — Design system component integrating TanStack Table + Virtual + dnd-kit
// COMPLEXITY: chain-extraction — Virtual row access pattern required by TanStack Virtual
// COMPLEXITY: function-declaration-ordering — Factory functions contain nested helpers
// COMPLEXITY: sig-documentation — Internal component helpers don't need full signatures

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
import { LookupTable } from '@graffio/functional'
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

const T = {
    // Gets row id, handling both plain objects and ViewRow.Detail structure
    // @sig getRowId :: Object -> String | undefined
    getRowId: row => row.id ?? row.transaction?.id,

    // Get the list of navigable IDs (focusableIds if provided, otherwise all row IDs)
    // @sig toNavigableIds :: ([String]?, [Row]) -> [String]
    toNavigableIds: (focusableIds, rows) =>
        focusableIds?.length > 0 ? focusableIds : rows.map(r => T.getRowId(r.original)),

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
}

const F = {
    // Creates a DataTable keymap with navigation intents
    // @sig createDataTableKeymap :: (String, String, String, Number, Function, Function?, String?, [String]?, [Row])
    //                            -> Keymap
    createDataTableKeymap: (
        keymapId,
        activeViewId,
        keymapName,
        priority,
        onHighlightChange,
        onEscape,
        highlightedId,
        focusableIds,
        rows,
    ) => {
        const { Intent, Keymap } = KeymapModule

        const navigateAction = direction => () => {
            const ids = T.toNavigableIds(focusableIds, rows)
            if (ids.length === 0) return
            const nextIndex = T.toNextIndex(direction, ids, highlightedId)
            onHighlightChange(ids[nextIndex])
        }

        const intents = LookupTable(
            [
                Intent('Move down', ['ArrowDown'], navigateAction('ArrowDown')),
                Intent('Move up', ['ArrowUp'], navigateAction('ArrowUp')),
                Intent('Dismiss', ['Escape'], () => onEscape?.()),
            ],
            Intent,
            'description',
        )

        return Keymap(keymapId, keymapName, priority, false, activeViewId, intents)
    },
}

const E = {
    // Handles keyboard navigation events for DataTable
    // @sig handleKeyDown :: (Function, Function?, String?, [String]?, [Row]) -> Event -> void
    handleKeyDown: (onHighlightChange, onEscape, highlightedId, focusableIds, rows) => event => {
        const { tagName } = document.activeElement
        if (tagName === 'INPUT' || tagName === 'TEXTAREA') return

        const { key } = event
        if (key === 'Escape') {
            event.preventDefault()
            onEscape?.()
            return
        }

        if (key !== 'ArrowUp' && key !== 'ArrowDown') return
        event.preventDefault()

        const ids = T.toNavigableIds(focusableIds, rows)
        if (ids.length === 0) return

        const nextIndex = T.toNextIndex(key, ids, highlightedId)
        onHighlightChange(ids[nextIndex])
    },

    // Sets up keyboard navigation for DataTable rows, returns cleanup function
    // @sig setupKeyboardNav :: (Function, Function?, String?, [String]?, [Row]) -> (() -> void)?
    setupKeyboardNav: (onHighlightChange, onEscape, highlightedId, focusableIds, rows) => {
        if (!onHighlightChange) return undefined
        const handler = E.handleKeyDown(onHighlightChange, onEscape, highlightedId, focusableIds, rows)
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    },

    // Registers keymap and returns cleanup that unregisters it
    // @sig keymapRegistrationEffect :: (Keymap, String, Function, Function) -> (() -> void)
    keymapRegistrationEffect: (keymap, keymapId, onRegister, onUnregister) => {
        onRegister(keymap)
        return () => onUnregister(keymapId)
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
// @sig TableHeader :: { headerGroups, columnSizeVars, onSort, sorting, columnOrder, onColumnReorder } -> ReactElement
const TableHeader = ({ headerGroups, columnSizeVars, onSort, sorting, columnOrder, onColumnReorder }) => {
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
                    {headers.map((header, index) => (
                        <SortableHeaderCell
                            key={header.id}
                            header={header}
                            sorting={sorting}
                            onSort={onSort}
                            isEven={index % 2 === 0}
                        />
                    ))}
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
const VirtualRow = ({
    virtualRow,
    row,
    highlightedRowIndex,
    columnSizeVars,
    renderSubComponent,
    measureElement,
    onClick,
}) => {
    const { index, start } = virtualRow
    const style = { position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${start}px)` }
    const isLeaf = !row.subRows || row.subRows.length === 0
    const showSubComponent = renderSubComponent && row.getIsExpanded() && isLeaf

    return (
        <Box data-index={index} ref={measureElement} style={style}>
            <TableRow
                row={row}
                rowIndex={index}
                columnSizeVars={columnSizeVars}
                isHighlighted={index === highlightedRowIndex}
                onClick={onClick}
            />
            {showSubComponent && (
                <Box px="2" py="2" style={{ backgroundColor: 'var(--gray-2)' }}>
                    {renderSubComponent({ row })}
                </Box>
            )}
        </Box>
    )
}

// Table row component with zebra striping and highlight support
// @sig TableRow :: { row, rowIndex, columnSizeVars, isHighlighted, onClick } -> ReactElement
const TableRow = ({ row, rowIndex, columnSizeVars, isHighlighted, onClick }) => {
    const zebraColor = rowIndex % 2 === 0 ? 'var(--gray-1)' : 'var(--gray-2)'
    const backgroundColor = isHighlighted ? 'var(--yellow-5)' : zebraColor
    const style = { ...columnSizeVars, backgroundColor, cursor: onClick ? 'pointer' : undefined }

    return (
        <Flex align="start" gap="1" px="2" py="1" onClick={onClick} style={style}>
            {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id} cell={cell} />
            ))}
        </Flex>
    )
}

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
    enableKeyboardNav = false,
    keymapId,
    keymapActiveViewId,
    keymapName,
    keymapPriority = 10,
    onRegisterKeymap,
    onUnregisterKeymap,
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

    // Creates click handler for a row
    // @sig createRowClickHandler :: Row -> Function
    const createRowClickHandler = row => () => onRowClick?.(row.original, row.index)

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
        // Gets row id, handling both plain objects and ViewRow.Detail structure
        // @sig getRowId :: Object -> String | undefined
        const getRowId = original => original.id ?? original.transaction?.id

        if (highlightedId == null) return -1
        return rows.findIndex(row => getRowId(row.original) === highlightedId)
    }

    // Scrolls to highlighted row if not visible
    // @sig scrollToHighlightedRow :: () -> Function | undefined
    const scrollToHighlightedRow = () => {
        // Performs the scroll with error handling
        // @sig doScroll :: () -> void
        const doScroll = () => {
            try {
                virtualizer.scrollToIndex(highlightedRowIndex, { align: 'center' })
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

    // Keyboard navigation for row highlighting (only when this DataTable is active)
    // When keymap registration is provided, keymap handles navigation instead of direct listener
    const setupKeyboardNavEffect = () => {
        if (!enableKeyboardNav) return undefined
        if (onRegisterKeymap) return undefined
        return E.setupKeyboardNav(onHighlightChange, onEscape, highlightedId, focusableIds, rows)
    }

    // Keymap registration for keyboard shortcuts appearing in KeymapDrawer
    // @sig createKeymapMemo :: () -> Keymap?
    const createKeymapMemo = () => {
        if (!enableKeyboardNav || !onRegisterKeymap || !keymapId) return null
        return F.createDataTableKeymap(
            keymapId,
            keymapActiveViewId ?? keymapId,
            keymapName,
            keymapPriority,
            onHighlightChange,
            onEscape,
            highlightedId,
            focusableIds,
            rows,
        )
    }

    const keymapRegistrationEffect = () => {
        if (!keymap || !onRegisterKeymap || !onUnregisterKeymap) return undefined
        return E.keymapRegistrationEffect(keymap, keymapId, onRegisterKeymap, onUnregisterKeymap)
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
    const highlightedRowIndex = React.useMemo(findHighlightedRowIndex, [highlightedId, rows])
    useEffect(scrollToHighlightedRow, [highlightedId, rows.length, virtualizer])
    useEffect(setupKeyboardNavEffect, [
        enableKeyboardNav,
        onHighlightChange,
        onEscape,
        highlightedId,
        focusableIds,
        rows,
        onRegisterKeymap,
    ])

    const keymap = React.useMemo(createKeymapMemo, [
        enableKeyboardNav,
        onRegisterKeymap,
        keymapId,
        keymapActiveViewId,
        keymapName,
        keymapPriority,
        onHighlightChange,
        onEscape,
        highlightedId,
        focusableIds,
        rows,
    ])

    useEffect(keymapRegistrationEffect, [keymap, keymapId, onRegisterKeymap, onUnregisterKeymap])

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
                        {virtualizer.getVirtualItems().map(virtualRow => (
                            <VirtualRow
                                key={rows[virtualRow.index].id}
                                virtualRow={virtualRow}
                                row={rows[virtualRow.index]}
                                highlightedRowIndex={highlightedRowIndex}
                                columnSizeVars={columnSizeVars}
                                renderSubComponent={renderSubComponent}
                                measureElement={virtualizer.measureElement}
                                onClick={onRowClick ? handleRowClick(rows[virtualRow.index]) : undefined}
                            />
                        ))}
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
    enableKeyboardNav: PropTypes.bool,
    keymapId: PropTypes.string,
    keymapActiveViewId: PropTypes.string,
    keymapName: PropTypes.string,
    keymapPriority: PropTypes.number,
    onRegisterKeymap: PropTypes.func,
    onUnregisterKeymap: PropTypes.func,
    context: PropTypes.object,
}

export { DataTable }
