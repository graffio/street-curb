import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table as RadixTable } from '@radix-ui/themes'
import {
    addSegment,
    selectBlockfaceLength,
    selectSegments,
    selectStartPositions,
    selectUnknownRemaining,
    updateSegmentLength,
    updateSegmentType,
} from '../../store/curbStore.js'
import { formatLength } from '../../utils/formatting.js'
import { CurbSegmentSelect, createColorOptions } from './CurbSegmentSelect.jsx'
import { curbTableStyles } from './CurbTable.css.js'
import { COLORS } from '../../constants.js'
import NumberPad from '../NumberPad.jsx'

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
const CurbTableHeader = ({ totalLength, unknownRemaining, isComplete }) => (
    <div className={curbTableStyles.header}>
        <h3 className={curbTableStyles.headerTitle}>Curb Configuration</h3>
        <div className={curbTableStyles.blockfaceInfo}>
            Total: {totalLength} ft
            {unknownRemaining > 0 && <span> • Remaining: {formatLength(unknownRemaining)}</span>}
            {isComplete && <span> • Collection Complete</span>}
        </div>
    </div>
)

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

    const rowClassName = `${curbTableStyles.tableRow}${isSelected ? ` ${curbTableStyles.selectedRow}` : ''}`

    return (
        <RadixTable.Row
            className={rowClassName}
            data-row-index={index}
            onClick={handleRowClick}
            style={{ cursor: 'pointer' }}
        >
            <RadixTable.Cell
                className={curbTableStyles.typeCell}
                role="gridcell"
                aria-label={`Segment ${index + 1} type`}
            >
                <div className={curbTableStyles.typeContainer}>
                    <CurbTypeSelector value={segment.type} onChange={handleTypeChange} />
                </div>
            </RadixTable.Cell>
            <RadixTable.Cell
                className={curbTableStyles.lengthCell}
                onClick={handleEditLengthClick}
                style={{ cursor: 'pointer' }}
                role="gridcell"
                aria-label={`Segment ${index + 1} length`}
            >
                {formatLength(segment.length)}
            </RadixTable.Cell>
            <RadixTable.Cell
                className={curbTableStyles.startCell}
                role="gridcell"
                aria-label={`Segment ${index + 1} start position`}
            >
                {formatLength(startPosition)}
            </RadixTable.Cell>
            <RadixTable.Cell
                className={curbTableStyles.addCell}
                role="gridcell"
                aria-label={`Add segment after ${segment.type}`}
            >
                <button
                    className={curbTableStyles.addButton()}
                    onClick={handleAddSegmentClick}
                    disabled={!canAddSegment}
                    aria-label={`Add segment after ${segment.type}`}
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
const CurbEmptyState = () => (
    <RadixTable.Row className={curbTableStyles.emptyStateRow}>
        <RadixTable.Cell colSpan="4" className={curbTableStyles.emptyStateCell}>
            <div className={curbTableStyles.emptyStateMessage}>No segments yet</div>
        </RadixTable.Cell>
    </RadixTable.Row>
)

/**
 * Bottom controls section for adding segments
 * @sig CurbSegmentControls :: ({ unknownRemaining: Number, hasSegments: Boolean,
 *   canAddSegments: Boolean, onAddFirst: Function, onAddSegment: Function }) -> JSXElement
 */
const CurbSegmentControls = ({ unknownRemaining, hasSegments, canAddSegments, onAddFirst, onAddSegment }) => (
    <div className={curbTableStyles.segmentControlsBottom}>
        <div className={curbTableStyles.remainingSpaceInfo}>Remaining: {formatLength(unknownRemaining)} ft</div>
        <div className={curbTableStyles.addButtonsContainer}>
            {!hasSegments && unknownRemaining > 0 && (
                <button
                    className={curbTableStyles.addSegmentButton()}
                    onClick={onAddFirst}
                    aria-label="Add first segment"
                >
                    + Add First Segment
                </button>
            )}
            {hasSegments && unknownRemaining > 0 && (
                <button
                    className={curbTableStyles.addSegmentButton()}
                    onClick={onAddSegment}
                    aria-label="Add new segment"
                >
                    + Add Segment
                </button>
            )}
        </div>
    </div>
)

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
const CurbTable = ({ blockfaceLength = 240 }) => {
    const dispatch = useDispatch()

    // Redux selectors
    const segments = useSelector(selectSegments) || []
    const reduxBlockfaceLength = useSelector(selectBlockfaceLength)
    const unknownRemaining = useSelector(selectUnknownRemaining)
    const startPositions = useSelector(selectStartPositions)

    // Computed values
    const effectiveBlockfaceLength = reduxBlockfaceLength || blockfaceLength
    const canAddNewSegments = unknownRemaining > 0
    const isComplete = unknownRemaining === 0
    const hasAnySegments = segments.length > 0

    // Action dispatchers with memoization
    const changeSegmentType = useCallback(
        (index, newType) => {
            if (Object.keys(COLORS).includes(newType)) {
                dispatch(updateSegmentType(index, newType))
            }
        },
        [dispatch],
    )

    const changeSegmentLength = useCallback(
        (index, newLength) => {
            if (typeof newLength === 'number' && !isNaN(newLength) && newLength >= 1) {
                dispatch(updateSegmentLength(index, newLength))
            }
        },
        [dispatch],
    )

    const addNewSegment = useCallback(
        targetIndex => {
            dispatch(addSegment(targetIndex))
        },
        [dispatch],
    )

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

            if (typeof newValue === 'number' && !isNaN(newValue) && newValue >= 1) {
                changeSegmentLength(editingIndex, newValue)
            }
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
            <div className={curbTableStyles.container}>
                <CurbTableHeader
                    totalLength={effectiveBlockfaceLength}
                    unknownRemaining={unknownRemaining}
                    isComplete={isComplete}
                />

                <div className={curbTableStyles.wrapper}>
                    <RadixTable.Root className="curb-table" aria-label="Curb segments configuration">
                        <CurbTableHeaders />
                        <RadixTable.Body>
                            {hasAnySegments ? (
                                segments.map((segment, index) => (
                                    <CurbSegmentRow
                                        key={segment.id}
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
                        max={effectiveBlockfaceLength}
                        onSave={handleNumberPadSave}
                        onCancel={handleNumberPadCancel}
                        label="Length"
                    />
                )}
            </div>
        </CurbTableErrorBoundary>
    )
}

export default CurbTable
