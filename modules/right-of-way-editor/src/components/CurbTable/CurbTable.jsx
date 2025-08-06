import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
    <div className="curb-table-header">
        <h3>Curb Configuration</h3>
        <div className="blockface-info">
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
    <thead>
        <tr>
            <th aria-label="Segment type"></th>
            <th style={{ textAlign: 'right' }}>Length</th>
            <th style={{ textAlign: 'right' }}>Start</th>
            <th aria-label="Actions"></th>
        </tr>
    </thead>
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

    const rowClassName = `curb-table-row${isSelected ? ' current-row' : ''}`

    return (
        <tr className={rowClassName} data-row-index={index} onClick={handleRowClick} style={{ cursor: 'pointer' }}>
            <td className="type-cell" role="gridcell" aria-label={`Segment ${index + 1} type`}>
                <div className="type-container">
                    <CurbTypeSelector value={segment.type} onChange={handleTypeChange} />
                </div>
            </td>
            <td
                className="length-cell editable-cell"
                onClick={handleEditLengthClick}
                style={{ cursor: 'pointer' }}
                role="gridcell"
                aria-label={`Segment ${index + 1} length`}
            >
                {formatLength(segment.length)}
            </td>
            <td className="start-cell" role="gridcell" aria-label={`Segment ${index + 1} start position`}>
                {formatLength(startPosition)}
            </td>
            <td className="add-cell" role="gridcell" aria-label={`Add segment after ${segment.type}`}>
                <button
                    className="add-button"
                    onClick={handleAddSegmentClick}
                    disabled={!canAddSegment}
                    aria-label={`Add segment after ${segment.type}`}
                >
                    +
                </button>
            </td>
        </tr>
    )
}

/**
 * Empty state component when no segments exist
 * @sig CurbEmptyState :: () -> JSXElement
 */
const CurbEmptyState = () => (
    <tr className="empty-state-row">
        <td colSpan="4" className="empty-state-cell">
            <div className="empty-state-message">No segments yet</div>
        </td>
    </tr>
)

/**
 * Bottom controls section for adding segments
 * @sig CurbSegmentControls :: ({ unknownRemaining: Number, hasSegments: Boolean,
 *   canAddSegments: Boolean, onAddFirst: Function, onAddSegment: Function }) -> JSXElement
 */
const CurbSegmentControls = ({ unknownRemaining, hasSegments, canAddSegments, onAddFirst, onAddSegment }) => (
    <div className="segment-controls-bottom">
        <div className="remaining-space-info">Remaining: {formatLength(unknownRemaining)} ft</div>
        <div className="add-buttons-container">
            {!hasSegments && unknownRemaining > 0 && (
                <button className="add-segment-button" onClick={onAddFirst} aria-label="Add first segment">
                    + Add First Segment
                </button>
            )}
            {hasSegments && unknownRemaining > 0 && (
                <button className="add-segment-button" onClick={onAddSegment} aria-label="Add new segment">
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
            <div className="curb-table-container">
                <CurbTableHeader
                    totalLength={effectiveBlockfaceLength}
                    unknownRemaining={unknownRemaining}
                    isComplete={isComplete}
                />

                <div className="curb-table-wrapper">
                    <table className="curb-table" aria-label="Curb segments configuration">
                        <CurbTableHeaders />
                        <tbody>
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
                        </tbody>
                    </table>
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
