/*
 * VirtualTable - A compound component system for virtualized tables with fixed headers
 *
 * This component provides a complete table virtualization solution built on top of VirtualScroller.
 * It follows Radix UI compound component patterns, where multiple sub-components work together
 * to create a cohesive table experience.
 *
 * ARCHITECTURE:
 * - Uses a channel-based coordination system instead of React Context for better performance
 * - Delegates row virtualization to VirtualScroller component
 * - Provides automatic column width management and alignment
 * - Supports both explicit column definitions and dynamic header generation
 *
 * COMPOUND COMPONENTS:
 * - Root: Container that manages table state and column definitions, forwards scrollToRow method via ref
 * - Header: Fixed header that auto-generates from columns or accepts custom children
 * - HeaderCell: Individual header cells with width/flex/alignment support
 * - Body: Virtualized body that wraps VirtualScroller with table-specific logic and ref forwarding
 * - Row: Container for table rows with proper styling
 * - Cell: Individual data cells that inherit column properties from channel
 *
 * CHANNEL COORDINATION:
 * - tableChannel manages shared state (columns) across all components
 * - Cells can reference column definitions by columnIndex for automatic width/alignment
 * - More efficient than React Context as it doesn't trigger unnecessary re-renders
 *
 * DELEGATION TO VirtualScroller:
 * - All virtual scrolling logic (row calculations, keyboard navigation, snapping)
 * - Performance optimizations (overscan buffer, ref management)
 * - Integration with @tanstack/react-virtual for efficient rendering
 * - Programmatic scrolling via scrollToRow method with smooth animations and centering
 */
/* global ResizeObserver */
import PropTypes from 'prop-types'
import React from 'react'
import { createChannel, useChannel } from '../../channels/channel.js'
import { VirtualScroller } from '../VirtualScroller/VirtualScroller'
import * as styles from './VirtualTable.css'

/*
 * Module-level channel for table coordination - more efficient than React Context
 *
 * @sig tableChannel :: Channel
 */
const tableChannel = createChannel({ columns: [] })

/*
 * Root container for virtual table
 *
 * @sig VirtualTableRoot :: Props -> ReactElement
 *     Props = { height: Number?, columns: [Column]?, children: [ReactElement], className: String?, style: Object? }
 *     Column = { width: String?, flex: Number?, title: String, textAlign: 'left'|'center'|'right'? }
 */
const VirtualTableRoot = React.forwardRef(
    ({ height = 1600, columns = [], children, className, style, ...props }, ref) => {
        const bodyRef = React.useRef(null)

        React.useEffect(() => {
            tableChannel.setState({ columns })
        }, [columns])

        // Forward scroll methods from body to root ref
        React.useImperativeHandle(
            ref,
            () => ({ scrollToRow: (index, options) => bodyRef.current?.scrollToRow(index, options) }),
            [],
        )

        const mergedClassName = className ? `${styles.root} ${className}` : styles.root
        const mergedStyle = { height, ...style }

        // Clone children to add ref to VirtualTableBody if present
        const childrenWithRefs = React.Children.map(children, child => {
            if (React.isValidElement(child) && child.type === VirtualTableBody)
                return React.cloneElement(child, { ref: bodyRef })
            return child
        })

        return (
            <div className={mergedClassName} style={mergedStyle} {...props}>
                {childrenWithRefs}
            </div>
        )
    },
)

/*
 * Fixed header container - auto-generates from columns if no children provided
 *
 * @sig VirtualTableHeader :: Props -> ReactElement
 *     Props = {
 *         children: [ReactElement]?,
 *         className: String?
 *     }
 */
const VirtualTableHeader = ({ children, className, ...props }) => {
    const [{ columns }] = useChannel(tableChannel, ['columns'])

    const mergedClassName = className ? `${styles.header} ${className}` : styles.header

    const tableCellHeader = (column, index) => (
        <VirtualTableHeaderCell key={index} width={column.width} flex={column.flex} textAlign={column.textAlign}>
            {column.title}
        </VirtualTableHeaderCell>
    )
    return (
        <div className={mergedClassName} {...props}>
            {children || columns.map(tableCellHeader)}
        </div>
    )
}

/*
 * Header cell component - gets width from channel if columnIndex provided
 *
 * @sig VirtualTableHeaderCell :: Props -> ReactElement
 *     Props = {
 *         width: String?,
 *         flex: Number?,
 *         textAlign: 'left'|'center'|'right'?,
 *         columnIndex: Number?,
 *         children: ReactNode,
 *         className: String?,
 *         style: Object?
 *     }
 */
const VirtualTableHeaderCell = ({
    width,
    flex,
    textAlign = 'left',
    columnIndex,
    children,
    className,
    style = {},
    ...props
}) => {
    const buildCellStyle = (baseStyle, width, flex) => {
        const cellStyle = { ...baseStyle }
        if (flex) {
            cellStyle.flex = flex
            cellStyle.minWidth = 0
        }
        if (width) cellStyle.width = width
        return cellStyle
    }

    const [{ columns }] = useChannel(tableChannel, ['columns'])

    // Use column definition if columnIndex provided, otherwise use props
    const column = typeof columnIndex === 'number' ? columns[columnIndex] : null
    const finalWidth = column?.width || width
    const finalFlex = column?.flex || flex
    const finalTextAlign = column?.textAlign || textAlign

    const mergedClassName = className
        ? `${styles.headerCell({ textAlign: finalTextAlign })} ${className}`
        : styles.headerCell({ textAlign: finalTextAlign })
    const cellStyle = buildCellStyle(style, finalWidth, finalFlex)

    return (
        <div className={mergedClassName} style={cellStyle} {...props}>
            {children}
        </div>
    )
}

/*
 * Virtualized body container with memoized row rendering
 *
 * @sig VirtualTableBody :: Props -> ReactElement
 *     Props = {
 *         rowCount: Number,
 *         rowHeight: Number?,
 *         renderRow: RenderRowFunc,
 *         highlightedRow: Number?
 *     }
 *     RenderRowFunc = Number -> ReactElement
 */
const VirtualTableBody = React.forwardRef(
    ({ rowCount, rowHeight = 72, renderRow, highlightedRow, ...virtualScrollerProps }, ref) => {
        const memoizedRenderRow = React.useCallback(renderRow, [renderRow])
        const containerRef = React.useRef(null)
        const virtualScrollerRef = React.useRef(null)
        const [containerHeight, setContainerHeight] = React.useState(600)

        // Forward scroll methods through ref
        React.useImperativeHandle(
            ref,
            () => ({ scrollToRow: (index, options) => virtualScrollerRef.current?.scrollToRow(index, options) }),
            [],
        )

        React.useEffect(() => {
            if (containerRef.current) {
                const updateHeight = () => {
                    const height = containerRef.current.clientHeight
                    if (height > 0) setContainerHeight(height)
                }

                updateHeight()
                const resizeObserver = new ResizeObserver(updateHeight)
                resizeObserver.observe(containerRef.current)

                return () => resizeObserver.disconnect()
            }
        }, [])

        return (
            <div ref={containerRef} className={styles.body}>
                <VirtualScroller
                    ref={virtualScrollerRef}
                    rowCount={rowCount}
                    rowHeight={rowHeight}
                    height={containerHeight}
                    renderRow={memoizedRenderRow}
                    highlightedRow={highlightedRow}
                    {...virtualScrollerProps}
                />
            </div>
        )
    },
)

/*
 * Row component for table body
 *
 * @sig VirtualTableRow :: Props -> ReactElement
 *     Props = {
 *         children: [ReactElement],
 *         className: String?
 *     }
 */
const VirtualTableRow = ({ children, className, ...props }) => {
    const mergedClassName = className ? `${styles.row} ${className}` : styles.row

    return (
        <div className={mergedClassName} {...props}>
            {children}
        </div>
    )
}

/*
 * Cell component for table rows - gets width from channel if columnIndex provided
 *
 * @sig VirtualTableCell :: Props -> ReactElement
 *     Props = {
 *         width: String?,
 *         flex: Number?,
 *         textAlign: 'left'|'center'|'right'?,
 *         columnIndex: Number?,
 *         children: ReactNode,
 *         className: String?,
 *         style: Object?
 *     }
 */
const VirtualTableCell = ({
    width,
    flex,
    textAlign = 'left',
    columnIndex,
    children,
    className,
    style = {},
    ...props
}) => {
    const buildCellStyle = (baseStyle, width, flex) => {
        const cellStyle = { ...baseStyle }

        if (flex) {
            cellStyle.flex = flex
            cellStyle.minWidth = 0
        }

        if (width) cellStyle.width = width
        return cellStyle
    }

    const [{ columns }] = useChannel(tableChannel, ['columns'])

    // Use column definition if columnIndex provided, otherwise use props
    const column = typeof columnIndex === 'number' ? columns[columnIndex] : null
    const finalWidth = column?.width || width
    const finalFlex = column?.flex || flex
    const finalTextAlign = column?.textAlign || textAlign

    const mergedClassName = className
        ? `${styles.cell({ textAlign: finalTextAlign })} ${className}`
        : styles.cell({ textAlign: finalTextAlign })
    const cellStyle = buildCellStyle(style, finalWidth, finalFlex)

    return (
        <div className={mergedClassName} style={cellStyle} {...props}>
            {children}
        </div>
    )
}

// Column shape for PropTypes validation
const ColumnShape = PropTypes.shape({
    width: PropTypes.string,
    flex: PropTypes.number,
    title: PropTypes.string.isRequired,
    textAlign: PropTypes.oneOf(['left', 'center', 'right']),
})

VirtualTableRoot.propTypes = {
    height: PropTypes.number,
    columns: PropTypes.arrayOf(ColumnShape),
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
}

VirtualTableHeader.propTypes = { children: PropTypes.node, className: PropTypes.string }

VirtualTableHeaderCell.propTypes = {
    width: PropTypes.string,
    flex: PropTypes.number,
    textAlign: PropTypes.oneOf(['left', 'center', 'right']),
    columnIndex: PropTypes.number,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
}

VirtualTableBody.propTypes = {
    rowCount: PropTypes.number.isRequired,
    rowHeight: PropTypes.number,
    renderRow: PropTypes.func.isRequired,
    highlightedRow: PropTypes.number,
    // Pass through props to VirtualScroller
    overscan: PropTypes.number,
    enableSnap: PropTypes.bool,
    onScroll: PropTypes.func,
    onRowMount: PropTypes.func,
}

VirtualTableRow.propTypes = { children: PropTypes.node.isRequired, className: PropTypes.string }

VirtualTableCell.propTypes = {
    width: PropTypes.string,
    flex: PropTypes.number,
    textAlign: PropTypes.oneOf(['left', 'center', 'right']),
    columnIndex: PropTypes.number,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
}

const VirtualTable = {
    Root: VirtualTableRoot,
    Header: VirtualTableHeader,
    HeaderCell: VirtualTableHeaderCell,
    Body: VirtualTableBody,
    Row: VirtualTableRow,
    Cell: VirtualTableCell,
}

export { VirtualTable }
