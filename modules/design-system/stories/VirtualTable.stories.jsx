/*
 * VirtualTable.stories.jsx - Storybook stories for VirtualTable component
 *
 * This file provides interactive examples and documentation for the VirtualTable compound component.
 * It demonstrates various usage patterns and configurations for the virtualized table system.
 *
 * STORY STRUCTURE:
 * - Uses Storybook 6+ CSF (Component Story Format)
 * - Provides sample data generation for realistic table scenarios
 * - Demonstrates basic usage and advanced features (row snapping)
 * - Includes interactive controls for testing different configurations
 *
 * SAMPLE DATA:
 * - Generates large datasets (10,000 rows) to showcase virtualization benefits
 * - Includes varied data types (ID, name, value, status) for column testing
 * - Uses renderRow pattern that VirtualTable.Body expects
 *
 * STORY EXAMPLES:
 * Each story demonstrates a specific optional parameter with real-world use cases:
 * - Basic: Standard table (baseline)
 * - CustomRowHeight: When you need denser/sparser data display
 * - CustomOverscan: For performance tuning with slow rendering
 * - WithSnapping: For precise data alignment (financial/numeric data)
 * - CustomHeight: For responsive layouts and space constraints
 * - WithScrollCallback: For implementing scroll-based features
 * - WithRowMountCallback: For focus management and DOM interactions
 * - WithColumns: For dynamic table generation from data schemas
 * - CustomStyling: For design system integration and theming
 * - WithScrollToRow: For programmatic scrolling to specific rows
 */
import React, { useRef, useState } from 'react'
import { VirtualTable } from '../src/index.js'

const { Root, Body, Row, Header, HeaderCell, Cell } = VirtualTable

/*
 * Generate sample data for demonstration
 *
 * @sig generateSampleData :: Number -> [SampleRow]
 *     SampleRow = {
 *         id: Number,
 *         name: String,
 *         value: Number,
 *         status: 'Active'|'Inactive'
 *     }
 */
const generateSampleData = count =>
    Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        value: Math.floor(Math.random() * 1000),
        status: Math.random() > 0.5 ? 'Active' : 'Inactive',
    }))

/*
 * Render a sample row for VirtualTable
 *
 * @sig renderSampleRow :: [SampleRow] -> RenderRowFunc
 *     RenderRowFunc = Number -> ReactElement
 */
const renderSampleRow = data => index => {
    const row = data[index]
    if (!row) return `Row ${index} - No data`

    return (
        <Row>
            <Cell width="80px">{row.id}</Cell>
            <Cell flex={1}>{row.name}</Cell>
            <Cell width="100px" textAlign="right">
                {row.value}
            </Cell>
            <Cell width="100px" textAlign="center">
                {row.status}
            </Cell>
        </Row>
    )
}

const sampleData = generateSampleData(10000)
const sampleRenderRow = renderSampleRow(sampleData)

/*
 * Callback functions for demonstration
 *
 * @sig handleScroll :: ({ scrollTop: Number, direction: 'up'|'down' }) -> void
 */
const handleScroll = ({ scrollTop, direction }) => {
    console.log(`Scrolled to ${scrollTop}px, direction: ${direction}`)
}

/*
 * @sig handleRowMount :: (Number, Element?) -> void
 */
const handleRowMount = (index, element) => {
    if (element) console.log(`Row ${index} mounted`)
    else console.log(`Row ${index} unmounted`)
}

// Baseline example with no optional parameters
const Basic = () => (
    <Root height={600}>
        <Header>
            <HeaderCell width="80px">ID</HeaderCell>
            <HeaderCell flex={1}>Name</HeaderCell>
            <HeaderCell width="100px" textAlign="right">
                Value
            </HeaderCell>
            <HeaderCell width="100px" textAlign="center">
                Status
            </HeaderCell>
        </Header>
        <Body rowCount={sampleData.length} renderRow={sampleRenderRow} />
    </Root>
)

// rowHeight: Use when you need to fit more/fewer rows or improve readability
const CustomRowHeight = () => (
    <div>
        <h3>Dense Layout (40px rows) - For dashboards with many data points</h3>
        <Root height={300}>
            <Header>
                <HeaderCell width="80px">ID</HeaderCell>
                <HeaderCell flex={1}>Name</HeaderCell>
                <HeaderCell width="100px" textAlign="right">
                    Value
                </HeaderCell>
                <HeaderCell width="100px" textAlign="center">
                    Status
                </HeaderCell>
            </Header>
            <Body rowCount={sampleData.length} renderRow={sampleRenderRow} rowHeight={40} />
        </Root>

        <h3 style={{ marginTop: 'var(--space-5)' }}>Spacious Layout (80px rows) - For better readability</h3>
        <Root height={300}>
            <Header>
                <HeaderCell width="80px">ID</HeaderCell>
                <HeaderCell flex={1}>Name</HeaderCell>
                <HeaderCell width="100px" textAlign="right">
                    Value
                </HeaderCell>
                <HeaderCell width="100px" textAlign="center">
                    Status
                </HeaderCell>
            </Header>
            <Body rowCount={sampleData.length} renderRow={sampleRenderRow} rowHeight={80} />
        </Root>
    </div>
)

// overscan: Use for performance tuning when rows are expensive to render
const CustomOverscan = () => (
    <div>
        <h3>Low Overscan (1 row) - Minimal memory usage, may show blank rows during fast scrolling</h3>
        <Root height={300}>
            <Header>
                <HeaderCell width="80px">ID</HeaderCell>
                <HeaderCell flex={1}>Name</HeaderCell>
                <HeaderCell width="100px" textAlign="right">
                    Value
                </HeaderCell>
                <HeaderCell width="100px" textAlign="center">
                    Status
                </HeaderCell>
            </Header>
            <Body rowCount={sampleData.length} renderRow={sampleRenderRow} overscan={1} />
        </Root>

        <h3 style={{ marginTop: 'var(--space-5)' }}>High Overscan (15 rows) - Smooth scrolling, higher memory usage</h3>
        <Root height={300}>
            <Header>
                <HeaderCell width="80px">ID</HeaderCell>
                <HeaderCell flex={1}>Name</HeaderCell>
                <HeaderCell width="100px" textAlign="right">
                    Value
                </HeaderCell>
                <HeaderCell width="100px" textAlign="center">
                    Status
                </HeaderCell>
            </Header>
            <Body rowCount={sampleData.length} renderRow={sampleRenderRow} overscan={15} />
        </Root>
    </div>
)

// enableSnap: Use for financial data, forms, or when precise alignment matters
const WithSnapping = () => (
    <div>
        <h3>Row Snapping Enabled - Try scrolling and using arrow keys</h3>
        <p>Perfect for financial data where you need to see complete rows without cutoffs</p>
        <Root height={400}>
            <Header>
                <HeaderCell width="80px">ID</HeaderCell>
                <HeaderCell flex={1}>Name</HeaderCell>
                <HeaderCell width="100px" textAlign="right">
                    Value
                </HeaderCell>
                <HeaderCell width="100px" textAlign="center">
                    Status
                </HeaderCell>
            </Header>
            <Body rowCount={sampleData.length} renderRow={sampleRenderRow} enableSnap />
        </Root>
    </div>
)

// height: Use for responsive layouts or when you need specific space allocation
const CustomHeight = () => (
    <div>
        <h3>Small Height (300px) - For sidebars or compact layouts</h3>
        <Root height={300}>
            <Header>
                <HeaderCell width="80px">ID</HeaderCell>
                <HeaderCell flex={1}>Name</HeaderCell>
                <HeaderCell width="100px" textAlign="right">
                    Value
                </HeaderCell>
                <HeaderCell width="100px" textAlign="center">
                    Status
                </HeaderCell>
            </Header>
            <Body rowCount={sampleData.length} renderRow={sampleRenderRow} />
        </Root>

        <h3 style={{ marginTop: 'var(--space-5)' }}>Large Height (800px) - For full-screen data views</h3>
        <Root height={800}>
            <Header>
                <HeaderCell width="80px">ID</HeaderCell>
                <HeaderCell flex={1}>Name</HeaderCell>
                <HeaderCell width="100px" textAlign="right">
                    Value
                </HeaderCell>
                <HeaderCell width="100px" textAlign="center">
                    Status
                </HeaderCell>
            </Header>
            <Body rowCount={sampleData.length} renderRow={sampleRenderRow} />
        </Root>
    </div>
)

// onScroll: Use for implementing infinite loading, scroll indicators, or synchronized views
const WithScrollCallback = () => (
    <div>
        <h3>Scroll Callback - Check console for scroll events</h3>
        <p>Use for: infinite loading, scroll position saving, synchronized scrolling between components</p>
        <Root height={400}>
            <Header>
                <HeaderCell width="80px">ID</HeaderCell>
                <HeaderCell flex={1}>Name</HeaderCell>
                <HeaderCell width="100px" textAlign="right">
                    Value
                </HeaderCell>
                <HeaderCell width="100px" textAlign="center">
                    Status
                </HeaderCell>
            </Header>
            <Body rowCount={sampleData.length} renderRow={sampleRenderRow} onScroll={handleScroll} />
        </Root>
    </div>
)

// onRowMount: Use for focus management, animations, or DOM measurements
const WithRowMountCallback = () => (
    <div>
        <h3>Row Mount Callback - Check console for mount/unmount events</h3>
        <p>Use for: focus management, lazy loading images, measuring row heights, animations</p>
        <Root height={400}>
            <Header>
                <HeaderCell width="80px">ID</HeaderCell>
                <HeaderCell flex={1}>Name</HeaderCell>
                <HeaderCell width="100px" textAlign="right">
                    Value
                </HeaderCell>
                <HeaderCell width="100px" textAlign="center">
                    Status
                </HeaderCell>
            </Header>
            <Body rowCount={sampleData.length} renderRow={sampleRenderRow} onRowMount={handleRowMount} />
        </Root>
    </div>
)

// style: Use for design system integration and custom theming
const CustomStyling = () => (
    <div>
        <h3>Custom Styling - Design system integration</h3>
        <p>Use for: brand theming, design system integration, custom borders/shadows</p>
        <Root height={400} style={{ border: '2px solid var(--violet-9)', borderRadius: 'var(--radius-3)' }}>
            <Header style={{ backgroundColor: 'var(--violet-9)', color: 'white' }}>
                <HeaderCell width="80px">ID</HeaderCell>
                <HeaderCell flex={1}>Name</HeaderCell>
                <HeaderCell width="100px" textAlign="right">
                    Value
                </HeaderCell>
                <HeaderCell width="100px" textAlign="center">
                    Status
                </HeaderCell>
            </Header>
            <Body rowCount={sampleData.length} renderRow={sampleRenderRow} />
        </Root>
    </div>
)

// Programmatic scrolling: Use for search navigation, bookmarks, or jumping to specific data
const WithScrollToRow = () => {
    const tableRef = useRef(null)
    const [targetRow, setTargetRow] = useState(100)
    const [scrollInfo, setScrollInfo] = useState('')
    const [currentHighlightedRow, setCurrentHighlightedRow] = useState(null)

    const scrollToRow = displayRowNumber => {
        if (tableRef.current) {
            // Convert from display row number (1-based) to array index (0-based)
            const arrayIndex = displayRowNumber - 1

            // Use the new scrollToRow API with smooth scrolling and centering
            tableRef.current.scrollToRow(arrayIndex, { behavior: 'smooth', block: 'center' })

            setCurrentHighlightedRow(arrayIndex) // Store array index for highlighting
            setScrollInfo(`Scrolled to row ${displayRowNumber} (array index ${arrayIndex}) using new scrollToRow API`)
        } else {
            setScrollInfo('Table ref not available')
        }
    }

    const handleScrollToTarget = () => {
        const row = Math.max(1, Math.min(targetRow, sampleData.length))
        scrollToRow(row)
    }

    const scrollToRandomRow = () => {
        const randomRow = Math.floor(Math.random() * sampleData.length) + 1 // +1 to convert to display number
        setTargetRow(randomRow)
        scrollToRow(randomRow)
    }

    // Custom render function that adds background highlighting for the story
    const renderRowWithBackground = (index, { isHighlighted: virtualHighlighted } = {}) => {
        const row = sampleData[index]
        if (!row) return `Row ${index} - No data`

        // Use either the VirtualTable highlighting or our own state
        const isHighlighted = virtualHighlighted || index === currentHighlightedRow
        const rowStyle = isHighlighted
            ? {
                  backgroundColor: 'var(--blue-3)',
                  borderLeft: '4px solid var(--blue-9)',
                  borderTop: '1px solid var(--blue-9)',
                  borderRight: '1px solid var(--blue-9)',
                  borderBottom: '1px solid var(--blue-9)',
                  boxSizing: 'border-box',
              }
            : {}

        return (
            <Row style={rowStyle}>
                <Cell width="80px">{row.id}</Cell>
                <Cell flex={1}>{row.name}</Cell>
                <Cell width="100px" textAlign="right">
                    {row.value}
                </Cell>
                <Cell width="100px" textAlign="center">
                    {row.status}
                </Cell>
            </Row>
        )
    }

    return (
        <div>
            <h3>Programmatic Scrolling - Jump to specific rows</h3>
            <p>Use for: search result navigation, bookmarks, data linking, keyboard shortcuts</p>

            <div
                style={{
                    marginBottom: 'var(--space-5)',
                    display: 'flex',
                    gap: 'var(--space-3)',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                }}
            >
                <input
                    type="number"
                    value={targetRow}
                    onChange={e => setTargetRow(Number(e.target.value))}
                    min="1"
                    max={sampleData.length}
                    placeholder="Row number (1-10000)"
                    style={{ padding: 'var(--space-2)', width: '140px' }}
                />
                <button onClick={handleScrollToTarget} style={{ padding: 'var(--space-2) var(--space-3)' }}>
                    Scroll to Row
                </button>
                <button onClick={scrollToRandomRow} style={{ padding: 'var(--space-2) var(--space-3)' }}>
                    Random Row
                </button>
                <button onClick={() => scrollToRow(1)} style={{ padding: 'var(--space-2) var(--space-3)' }}>
                    Top
                </button>
                <button
                    onClick={() => scrollToRow(sampleData.length)}
                    style={{ padding: 'var(--space-2) var(--space-3)' }}
                >
                    Bottom
                </button>
                <button
                    onClick={() => setCurrentHighlightedRow(null)}
                    style={{ padding: 'var(--space-2) var(--space-3)', marginLeft: 'var(--space-3)' }}
                >
                    Clear Highlight
                </button>
            </div>

            {scrollInfo && (
                <div
                    data-testid="scroll-info"
                    style={{
                        padding: 'var(--space-3)',
                        backgroundColor: 'var(--blue-3)',
                        border: '1px solid var(--blue-8)',
                        borderRadius: 'var(--radius-2)',
                        marginBottom: 'var(--space-3)',
                        fontSize: 'var(--font-size-2)',
                    }}
                >
                    {scrollInfo}
                </div>
            )}

            <Root ref={tableRef} height={400}>
                <Header>
                    <HeaderCell width="80px">ID</HeaderCell>
                    <HeaderCell flex={1}>Name</HeaderCell>
                    <HeaderCell width="100px" textAlign="right">
                        Value
                    </HeaderCell>
                    <HeaderCell width="100px" textAlign="center">
                        Status
                    </HeaderCell>
                </Header>
                <Body
                    rowCount={sampleData.length}
                    renderRow={renderRowWithBackground}
                    highlightedRow={currentHighlightedRow}
                />
            </Root>
        </div>
    )
}

export default {
    title: 'VirtualTable',
    component: Root,
    args: { rowHeight: 60, overscan: 5, enableSnap: false, height: 600 },
    argTypes: {
        rowHeight: {
            control: { type: 'range', min: 40, max: 120, step: 10 },
            description: 'Height of each table row in pixels',
        },
        overscan: {
            control: { type: 'range', min: 1, max: 20, step: 1 },
            description: 'Number of extra rows to render outside viewport for smooth scrolling',
        },
        enableSnap: {
            control: { type: 'boolean' },
            description: 'Enable row snapping for aligned scrolling positions',
        },
        height: {
            control: { type: 'range', min: 300, max: 1000, step: 50 },
            description: 'Total height of the table container',
        },
    },
    parameters: {
        docs: {
            description: {
                component: `
VirtualTable is a compound component system for creating high-performance virtualized tables.

**Features:**
- Virtual scrolling for large datasets (10,000+ rows)
- Fixed headers with automatic column generation
- Flexible column sizing (fixed width or flex)
- Automatic height distribution (no manual body height calculations)
- Row snapping for aligned scrolling
- Keyboard navigation support
- Callback support for scroll and row mounting events

**Components:**
- Root: Main container with column definitions
- Header: Fixed header (auto-generated or custom)
- HeaderCell: Individual header cells
- Body: Virtualized scrolling body
- Row: Table row container
- Cell: Individual data cells
            `,
            },
        },
    },
}

export {
    Basic,
    CustomRowHeight,
    CustomOverscan,
    WithSnapping,
    CustomHeight,
    WithScrollCallback,
    WithRowMountCallback,
    CustomStyling,
    WithScrollToRow,
}
