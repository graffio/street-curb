/*
 * VirtualTable - A compound component system for virtualized tables with fixed headers
 *
 * This component provides a table virtualization solution built on top of VirtualScroller.
 * It follows Radix UI compound component patterns, where multiple sub-components work together
 * to create a cohesive table experience.
 *
 * COMPOUND COMPONENTS:
 * - Root: Container that forwards scrollToRow method via ref to Body
 * - Header: Fixed header container with styling
 * - HeaderCell: Individual header cells with width/flex/alignment props
 * - Body: Virtualized body that wraps VirtualScroller with table-specific logic and ref forwarding
 * - Row: Container for table rows with proper styling
 * - Cell: Individual data cells with width/flex/alignment/overflow props
 *
 * DELEGATION TO VirtualScroller:
 * - All virtual scrolling logic (row calculations, keyboard navigation, snapping)
 * - Performance optimizations (overscan buffer, ref management)
 * - Integration with @tanstack/react-virtual for efficient rendering
 * - Programmatic scrolling via scrollToRow method with smooth animations and centering
 */
/* global ResizeObserver */
import { Box, Flex } from '@radix-ui/themes'
import PropTypes from 'prop-types'
import React from 'react'
import { tokens } from '../themes/tokens.css.js'
import { VirtualScroller } from './VirtualScroller/VirtualScroller.jsx'

const { space, colors } = tokens

/*
 * Root container for virtual table
 */
const Root = React.forwardRef(({ height = 1600, children, style = {} }, ref) => {
    const possiblyAddBodyRef = child =>
        React.isValidElement(child) && child.type === Body ? React.cloneElement(child, { ref: bodyRef }) : child

    const scrollToRow = (index, options) => bodyRef.current?.scrollToRow(index, options)

    const bodyRef = React.useRef(null)

    // Forward scroll methods from body to root ref
    React.useImperativeHandle(ref, () => ({ scrollToRow }), [])

    // Clone children to add ref to Body if present
    children = React.Children.map(children, possiblyAddBodyRef)

    return (
        <Flex direction="column" style={{ height, ...style }}>
            {children}
        </Flex>
    )
})

/*
 * Fixed header container
 */
const Header = ({ children, style }) => {
    const headerStyle = { backgroundColor: colors.primary, color: 'var(--accent-contrast)', ...style }

    return (
        <Flex align="center" gap="2" p={`${space.sm} ${space.md}`} style={headerStyle}>
            {children}
        </Flex>
    )
}

/*
 * Header cell component
 */
const HeaderCell = ({ width, flex, textAlign = 'left', children, style = {} }) => {
    const cellStyle = {
        flexShrink: 0,
        textAlign,
        ...(flex && { flex, minWidth: 0 }),
        ...(width && { width }),
        ...style,
    }

    return <Box style={cellStyle}>{children}</Box>
}

/*
 * Virtualized body container with memoized row rendering
 */
const Body = React.forwardRef(({ rowHeight = 40, renderRow, ...virtualScrollerProps }, ref) => {
    const scrollToRow = (index, options) => virtualScrollerRef.current?.scrollToRow(index, options)

    const memoizedRenderRow = React.useCallback(renderRow, [renderRow])
    const containerRef = React.useRef(null)
    const virtualScrollerRef = React.useRef(null)
    const [containerHeight, setContainerHeight] = React.useState(600)

    // Forward scroll methods through ref
    React.useImperativeHandle(ref, () => ({ scrollToRow }), [])

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

    // delegate to VirtualScroller
    return (
        <Box ref={containerRef} style={{ flex: 1, minHeight: 0 }}>
            <VirtualScroller
                ref={virtualScrollerRef}
                height={containerHeight}
                renderRow={memoizedRenderRow}
                rowHeight={rowHeight}
                {...virtualScrollerProps}
            />
        </Box>
    )
})

/*
 * Row component for table
 */
const Row = ({ children, style = {} }) => (
    <Flex align="center" p={`${space.sm} ${space.md}`} gap="2" style={style}>
        {children}
    </Flex>
)

/*
 * Cell component for table rows
 */
const Cell = ({ width, flex, textAlign = 'left', children, style = {} }) => {
    const cellStyle = {
        color: colors.muted,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        textAlign,
        ...(flex && { flex, minWidth: 0 }),
        ...(width && { width }),
        ...style,
    }

    return <Box style={cellStyle}>{children}</Box>
}

Root.propTypes = { height: PropTypes.number, children: PropTypes.node.isRequired, style: PropTypes.object }

Header.propTypes = { children: PropTypes.node.isRequired, style: PropTypes.object }

HeaderCell.propTypes = {
    width: PropTypes.string,
    flex: PropTypes.number,
    textAlign: PropTypes.oneOf(['left', 'center', 'right']),
    children: PropTypes.node.isRequired,
    style: PropTypes.object,
}

Body.propTypes = {
    rowCount: PropTypes.number.isRequired,
    rowHeight: PropTypes.number,
    renderRow: PropTypes.func.isRequired,
    highlightedRow: PropTypes.number,
    overscan: PropTypes.number,
    enableSnap: PropTypes.bool,
    onScroll: PropTypes.func,
    onRowMount: PropTypes.func,
}

Row.propTypes = { children: PropTypes.node.isRequired, style: PropTypes.object }

Cell.propTypes = {
    width: PropTypes.string,
    flex: PropTypes.number,
    textAlign: PropTypes.oneOf(['left', 'center', 'right']),
    children: PropTypes.node.isRequired,
    style: PropTypes.object,
}

const VirtualTable = { Root, Header, HeaderCell, Body, Row, Cell }

export { VirtualTable }
