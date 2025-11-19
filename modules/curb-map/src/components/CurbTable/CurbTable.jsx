import { Table as RadixTable } from '@radix-ui/themes'
import { useCallback, useState } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../../commands/index.js'
import { COLORS } from '../../constants.js'
import * as S from '../../store/selectors.js'
import { Action, Blockface } from '../../types/index.js'
import { formatLength } from '../../utils/formatting.js'
import NumberPad from '../NumberPad.jsx'
import { createColorOptions, CurbSegmentSelect } from './CurbSegmentSelect.jsx'

/**
 * Simple error boundary wrapper for CurbTable
 * @sig CurbTableErrorBoundary :: ({ children: JSXElement }) -> JSXElement
 */
const CurbTableErrorBoundary = ({ children }) => children

/**
 * Domain-specific component for selecting curb segment types
 * @sig CurbTypeSelector :: ({ value: String, onChange: Function, disabled?: Boolean }) -> JSXElement
 */
const CurbTypeSelector = ({ value, onChange, disabled = false }) => {
    const colorOptions = createColorOptions(COLORS)

    return (
        <CurbSegmentSelect
            value={value}
            onValueChange={onChange}
            options={colorOptions}
            colorMapping={COLORS}
            size="1"
            disabled={disabled}
            placeholder="Select type"
        />
    )
}

/**
 * Header section for CurbTable showing summary information
 * @sig CurbTableHeader :: ({ totalLength: Number, unknownRemaining: Number, isComplete: Boolean }) -> JSXElement
 */
const CurbTableHeader = ({ totalLength, unknownRemaining, isComplete }) => {
    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-2)',
        paddingBottom: 'var(--space-1)',
        borderBottom: '1px solid var(--gray-6)',
        flexWrap: 'wrap',
        gap: 'var(--space-1)',
    }

    const titleStyle = {
        margin: 0,
        fontSize: 'var(--font-size-4)',
        fontWeight: '600',
        color: 'var(--gray-12)',
        flexShrink: 0,
    }

    const infoStyle = {
        fontSize: 'var(--font-size-2)',
        color: 'var(--gray-11)',
        fontWeight: '400',
        flexShrink: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }

    return (
        <div style={headerStyle}>
            <h3 style={titleStyle}>Curb Configuration</h3>
            <div style={infoStyle}>
                Total: {totalLength} ft
                {unknownRemaining > 0 && <span> • Remaining: {formatLength(unknownRemaining)}</span>}
                {isComplete && <span> • Collection Complete</span>}
            </div>
        </div>
    )
}

/**
 * Table headers component for CurbTable
 * @sig CurbTableHeaders :: () -> JSXElement
 */
const CurbTableHeaders = () => (
    <RadixTable.Header>
        <RadixTable.Row>
            <RadixTable.ColumnHeaderCell aria-label="Segment type"></RadixTable.ColumnHeaderCell>
            <RadixTable.ColumnHeaderCell style={{ textAlign: 'right' }}>Length</RadixTable.ColumnHeaderCell>
            <RadixTable.ColumnHeaderCell style={{ textAlign: 'right' }}>Start</RadixTable.ColumnHeaderCell>
            <RadixTable.ColumnHeaderCell aria-label="Actions"></RadixTable.ColumnHeaderCell>
        </RadixTable.Row>
    </RadixTable.Header>
)

/**
 * Individual row component for curb segments
 * @sig CurbSegmentRow :: ({ segment: Segment, index: Number, startPosition: Number,
 *   isSelected: Boolean, canAddSegment: Boolean, onSelect: Function, onEditLength: Function,
 *   onChangeType: Function, onAddSegment: Function }) -> JSXElement
 */
const CurbSegmentRow = ({
    segment,
    index,
    startPosition,
    isSelected,
    canAddSegment,
    onSelect,
    onEditLength,
    onChangeType,
    onAddSegment,
}) => {
    const handleRowClick = () => onSelect(index)

    const handleEditLengthClick = e => {
        e.stopPropagation()
        onEditLength(index, segment.length)
    }

    const handleTypeChange = newType => onChangeType(index, newType)

    const handleAddSegmentClick = e => {
        e.stopPropagation()
        onAddSegment(index)
    }

    const rowStyle = {
        cursor: 'pointer',
        borderBottom: '1px solid var(--gray-4)',
        transition: 'background-color 0.1s ease',
        backgroundColor: isSelected ? 'var(--accent-3)' : 'transparent',
        borderLeft: isSelected ? '3px solid var(--accent-9)' : 'none',
    }

    const typeCellStyle = { position: 'relative', width: 'auto', minWidth: '100px', padding: '4px' }

    const typeContainerStyle = { position: 'relative', display: 'inline-block', width: '100%' }

    const lengthCellStyle = {
        cursor: 'pointer',
        fontWeight: '400',
        color: 'var(--gray-12)',
        textAlign: 'right',
        width: '80px',
        minWidth: '75px',
        fontSize: 'var(--font-size-2)',
        transition: 'background-color 0.1s ease',
    }

    const startCellStyle = {
        fontWeight: '400',
        color: 'var(--gray-12)',
        textAlign: 'right',
        width: '80px',
        minWidth: '75px',
        fontSize: 'var(--font-size-2)',
    }

    const addCellStyle = {
        width: '1px',
        minWidth: '1px',
        maxWidth: '48px',
        textAlign: 'center',
        padding: '8px',
        whiteSpace: 'nowrap',
    }

    const addButtonStyle = {
        width: '32px',
        height: '32px',
        border: '1px solid var(--gray-6)',
        backgroundColor: 'var(--gray-2)',
        color: 'var(--gray-11)',
        borderRadius: 'var(--radius-2)',
        fontSize: 'var(--font-size-4)',
        fontWeight: '600',
        cursor: canAddSegment ? 'pointer' : 'not-allowed',
        transition: 'all 0.1s ease',
        WebkitTapHighlightColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: canAddSegment ? 1 : 0.5,
    }

    return (
        <RadixTable.Row data-row-index={index} onClick={handleRowClick} style={rowStyle}>
            <RadixTable.Cell style={typeCellStyle} role="gridcell" aria-label={`Segment ${index + 1} type`}>
                <div style={typeContainerStyle}>
                    <CurbTypeSelector value={segment.use} onChange={handleTypeChange} />
                </div>
            </RadixTable.Cell>
            <RadixTable.Cell
                onClick={handleEditLengthClick}
                style={lengthCellStyle}
                role="gridcell"
                aria-label={`Segment ${index + 1} length`}
            >
                {formatLength(segment.length)}
            </RadixTable.Cell>
            <RadixTable.Cell style={startCellStyle} role="gridcell" aria-label={`Segment ${index + 1} start position`}>
                {formatLength(startPosition)}
            </RadixTable.Cell>
            <RadixTable.Cell style={addCellStyle} role="gridcell" aria-label={`Add segment after ${segment.use}`}>
                <button
                    style={addButtonStyle}
                    onClick={handleAddSegmentClick}
                    disabled={!canAddSegment}
                    aria-label={`Add segment after ${segment.use}`}
                >
                    +
                </button>
            </RadixTable.Cell>
        </RadixTable.Row>
    )
}

/**
 * Empty state component when no segments exist
 * @sig CurbEmptyState :: () -> JSXElement
 */
const CurbEmptyState = () => {
    const messageStyle = {
        textAlign: 'center',
        color: 'var(--gray-11)',
        fontStyle: 'italic',
        padding: 'var(--space-4)',
    }

    return (
        <RadixTable.Row>
            <RadixTable.Cell colSpan="4">
                <div style={messageStyle}>No segments yet</div>
            </RadixTable.Cell>
        </RadixTable.Row>
    )
}

/**
 * Bottom controls section for adding segments
 * @sig CurbSegmentControls :: ({ unknownRemaining: Number, hasSegments: Boolean,
 *   canAddSegments: Boolean, onAddFirst: Function, onAddSegment: Function }) -> JSXElement
 */
const CurbSegmentControls = ({ unknownRemaining, hasSegments, canAddSegments, onAddFirst, onAddSegment }) => {
    const containerStyle = {
        marginTop: 'var(--space-3)',
        padding: 'var(--space-2)',
        backgroundColor: 'var(--color-panel-solid)',
        borderRadius: 'var(--radius-3)',
        border: '1px solid var(--gray-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
    }

    const remainingStyle = { fontSize: 'var(--font-size-2)', color: 'var(--gray-11)', fontWeight: '500', flexShrink: 0 }

    const buttonsStyle = { display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }

    const buttonStyle = {
        padding: 'var(--space-1) var(--space-3)',
        backgroundColor: 'var(--green-9)',
        color: 'white',
        border: '1px solid var(--green-8)',
        borderRadius: 'var(--radius-2)',
        fontSize: 'var(--font-size-2)',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.1s ease',
        WebkitTapHighlightColor: 'transparent',
        whiteSpace: 'nowrap',
    }

    return (
        <div style={containerStyle}>
            <div style={remainingStyle}>Remaining: {formatLength(unknownRemaining)} ft</div>
            <div style={buttonsStyle}>
                {!hasSegments && unknownRemaining > 0 && (
                    <button style={buttonStyle} onClick={onAddFirst} aria-label="Add first segment">
                        + Add First Segment
                    </button>
                )}
                {hasSegments && unknownRemaining > 0 && (
                    <button style={buttonStyle} onClick={onAddSegment} aria-label="Add new segment">
                        + Add Segment
                    </button>
                )}
            </div>
        </div>
    )
}

/**
 * CurbTable - Clean architectural implementation of curb editor
 *
 * Maintains identical user experience while improving:
 * - Separation of concerns through pure business logic
 * - Component composition with semantic components
 * - Better performance through proper memoization
 * - Enhanced maintainability and testability
 *
 * @sig CurbTable :: ({ blockfaceLength?: Number }) -> JSXElement
 */
const CurbTable = () => {
    const containerStyle = {
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        backgroundColor: 'transparent',
        fontSize: 'var(--font-size-2)',
        userSelect: 'none',
        padding: 'var(--space-3)',
        boxSizing: 'border-box',
    }

    const wrapperStyle = {
        position: 'relative',
        border: '1px solid var(--gray-6)',
        borderRadius: 'var(--radius-3)',
        overflow: 'auto',
        background: 'var(--color-surface)',
        maxWidth: '100%',
    }

    // Redux selectors
    const blockface = useSelector(S.currentBlockface)

    if (!blockface) return <div>No blockface selected</div>

    const segments = blockface.segments
    const reduxBlockfaceLength = Blockface.totalLength(blockface)
    const unknownRemaining = Blockface.unknownRemaining(blockface)
    const startPositions = Blockface.startPositions(blockface)

    // Computed values
    const canAddNewSegments = unknownRemaining > 0
    const isComplete = unknownRemaining === 0
    const hasAnySegments = segments.length > 0

    // Action dispatchers with memoization
    const changeSegmentType = useCallback((index, newType) => {
        if (Object.keys(COLORS).includes(newType)) post(Action.SegmentUseUpdated(index, newType))
    }, [])

    const changeSegmentLength = useCallback((index, newLength) => {
        if (typeof newLength === 'number' && !isNaN(newLength) && newLength >= 1)
            post(Action.SegmentLengthUpdated(index, newLength))
    }, [])

    const addNewSegment = useCallback(targetIndex => {
        post(Action.SegmentAdded(targetIndex))
    }, [])

    // UI state
    const [selectedRowIndex, setSelectedRowIndex] = useState(0)
    const [numberPadState, setNumberPadState] = useState({ isOpen: false, editingIndex: null, originalValue: 0 })

    // Event handlers
    const handleRowSelect = useCallback(index => setSelectedRowIndex(index), [])

    const handleEditLength = useCallback(
        (index, currentValue) => {
            const segment = segments[index]
            if (segment && typeof segment.length === 'number') {
                setNumberPadState({ isOpen: true, editingIndex: index, originalValue: currentValue })
                setSelectedRowIndex(index)
            }
        },
        [segments],
    )

    const handleNumberPadSave = useCallback(
        newValue => {
            const { editingIndex } = numberPadState
            if (editingIndex === null) return

            if (typeof newValue === 'number' && !isNaN(newValue) && newValue >= 1)
                changeSegmentLength(editingIndex, newValue)

            setNumberPadState({ isOpen: false, editingIndex: null, originalValue: 0 })
        },
        [numberPadState, changeSegmentLength],
    )

    const handleNumberPadCancel = useCallback(
        () => setNumberPadState({ isOpen: false, editingIndex: null, originalValue: 0 }),
        [],
    )

    const handleChangeType = useCallback(
        (index, newType) => {
            if (Object.keys(COLORS).includes(newType)) {
                changeSegmentType(index, newType)
                setSelectedRowIndex(index)
            }
        },
        [changeSegmentType],
    )

    const handleAddSegment = useCallback(
        targetIndex => {
            addNewSegment(targetIndex)
            // Update selection after segment is added
            setTimeout(() => setSelectedRowIndex(targetIndex), 0)
        },
        [addNewSegment],
    )

    return (
        <CurbTableErrorBoundary>
            <div style={containerStyle}>
                <CurbTableHeader
                    totalLength={reduxBlockfaceLength}
                    unknownRemaining={unknownRemaining}
                    isComplete={isComplete}
                />

                <div style={wrapperStyle}>
                    <RadixTable.Root className="curb-table" aria-label="Curb segments configuration">
                        <CurbTableHeaders />
                        <RadixTable.Body>
                            {hasAnySegments ? (
                                segments.map((segment, index) => (
                                    <CurbSegmentRow
                                        key={segment.id || index}
                                        segment={segment}
                                        index={index}
                                        startPosition={startPositions[index]}
                                        isSelected={index === selectedRowIndex}
                                        canAddSegment={canAddNewSegments}
                                        onSelect={handleRowSelect}
                                        onEditLength={handleEditLength}
                                        onChangeType={handleChangeType}
                                        onAddSegment={handleAddSegment}
                                    />
                                ))
                            ) : (
                                <CurbEmptyState />
                            )}
                        </RadixTable.Body>
                    </RadixTable.Root>
                </div>

                <CurbSegmentControls
                    unknownRemaining={unknownRemaining}
                    hasSegments={hasAnySegments}
                    canAddSegments={canAddNewSegments}
                    onAddFirst={() => handleAddSegment(0)}
                    onAddSegment={() => handleAddSegment(segments.length)}
                />

                {numberPadState.isOpen && (
                    <NumberPad
                        value={numberPadState.originalValue}
                        min={1}
                        max={reduxBlockfaceLength}
                        onSave={handleNumberPadSave}
                        onCancel={handleNumberPadCancel}
                    />
                )}
            </div>
        </CurbTableErrorBoundary>
    )
}

export default CurbTable
