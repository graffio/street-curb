import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS, formatLength } from '../constants.js'
import NumberPad from './NumberPad.jsx'
import {
    selectSegments,
    selectBlockfaceLength,
    selectUnknownSegment,
    updateSegmentType,
    updateSegmentLength,
    addSegment,
    updateStartPosition,
} from '../store/curbStore.js'

/**
 * CurbTable - Mobile-friendly table-based curb editor for field data collection
 *
 * Optimized for one-handed phone use while collecting street curb data.
 * Allows users to create curb configuration data from scratch starting with
 * a single "Unknown" segment of the full blockface length.
 */

// Helper functions moved to Redux store

/**
 * Calculates start positions for all segments based on their lengths
 * @sig calculateStartPositions :: [Segment] -> [Number]
 */
const calculateStartPositions = segments => {
    let cumulative = 0
    return segments.map(segment => {
        const start = cumulative
        cumulative += segment.length
        return start
    })
}

// These helper functions are no longer needed - Redux handles the logic

/**
 * Calculates dropdown position based on button element
 * @sig calculateDropdownPosition :: Element -> Object
 */
const calculateDropdownPosition = button => {
    const rect = button.getBoundingClientRect()
    return { top: rect.bottom + 4, left: rect.left, width: rect.width }
}

/**
 * Renders individual dropdown option for type selection
 * @sig renderTypeOption :: (String, Function, Number) -> JSXElement
 */
const renderTypeOption = (type, handleTypeSelect, activeDropdown) => (
    <div
        key={type}
        className="curb-dropdown-item"
        style={{ backgroundColor: COLORS[type] }}
        onClick={() => handleTypeSelect(activeDropdown, type)}
    >
        {type}
    </div>
)

/**
 * Renders Unknown type option for dropdown
 * @sig renderUnknownOption :: (Function, Number) -> JSXElement
 */
const renderUnknownOption = (handleTypeSelect, activeDropdown) => (
    <div className="curb-dropdown-item unknown-option" onClick={() => handleTypeSelect(activeDropdown, 'Unknown')}>
        Unknown
    </div>
)

/**
 * Handles type button click with event propagation prevention
 * @sig handleTypeButtonClick :: (Event, Number, Function) -> Void
 */
const handleTypeButtonClick = (e, index, handleDropdownToggle) => {
    e.stopPropagation()
    handleDropdownToggle(index)
}

// These functions are no longer needed - Redux handles state updates

/**
 * Processes dropdown toggle and positioning
 * @sig processDropdownToggle :: (Number, Number?, Function, Function, Function) -> Void
 */
const processDropdownToggle = (index, activeDropdown, setActiveDropdown, setDropdownPosition) => {
    if (activeDropdown === index) {
        setActiveDropdown(null)
        setDropdownPosition(null)
        return
    }

    setActiveDropdown(index)
    const button = document.querySelector(`[data-row-index="${index}"] .type-button`)
    if (!button) return

    const position = calculateDropdownPosition(button)
    setDropdownPosition(position)
}

/**
 * Processes type selection from dropdown
 * @sig processTypeSelection :: (Number, String, Function, Function, Function) -> Void
 */
const processTypeSelection = (index, type, handleTypeChange, setActiveDropdown, setDropdownPosition) => {
    handleTypeChange(index, type)
    setActiveDropdown(null)
    setDropdownPosition(null)
}

/**
 * Mobile-friendly table-based curb configuration editor
 * @sig CurbTable :: ({ blockfaceLength?: Number, onSegmentsChange?: Function, segments?: [Segment] }) -> JSXElement
 */
const CurbTable = ({ blockfaceLength = 240 }) => {
    const dispatch = useDispatch()
    const segments = useSelector(selectSegments) || []
    const reduxBlockfaceLength = useSelector(selectBlockfaceLength)
    const unknownSegment = useSelector(selectUnknownSegment)

    const [activeDropdown, setActiveDropdown] = useState(null)
    const [currentRowIndex, setCurrentRowIndex] = useState(0)
    const [dropdownPosition, setDropdownPosition] = useState(null)
    const [numberPadState, setNumberPadState] = useState({
        isOpen: false,
        editingIndex: null,
        editingField: null,
        originalValue: 0,
    })

    // Use Redux blockface length if available, otherwise use prop
    const effectiveBlockfaceLength = reduxBlockfaceLength || blockfaceLength

    const startPositions = segments && segments.length > 0 ? calculateStartPositions(segments) : []
    const canAddSegments = unknownSegment && unknownSegment.length > 0

    const handleTypeChange = useCallback(
        (index, newType) => {
            dispatch(updateSegmentType(index, newType))
            setCurrentRowIndex(index)
        },
        [dispatch],
    )

    const handleAddSegment = useCallback(
        index => {
            dispatch(addSegment(index))
            setTimeout(() => setCurrentRowIndex(index), 0)
        },
        [dispatch],
    )

    const handleDropdownToggle = useCallback(
        index => processDropdownToggle(index, activeDropdown, setActiveDropdown, setDropdownPosition),
        [activeDropdown],
    )

    const handleTypeSelect = useCallback(
        (index, type) => processTypeSelection(index, type, handleTypeChange, setActiveDropdown, setDropdownPosition),
        [handleTypeChange],
    )

    const handleCellClick = useCallback((index, field, value) => {
        setNumberPadState({ isOpen: true, editingIndex: index, editingField: field, originalValue: value })
        setCurrentRowIndex(index)
    }, [])

    const handleNumberPadSave = useCallback(
        newValue => {
            const { editingIndex, editingField } = numberPadState
            if (editingIndex === null || editingField === null) return

            if (editingField === 'length') {
                dispatch(updateSegmentLength(editingIndex, newValue))
            } else if (editingField === 'start') {
                dispatch(updateStartPosition(editingIndex, newValue))
            }

            setNumberPadState({ isOpen: false, editingIndex: null, editingField: null, originalValue: 0 })
        },
        [numberPadState, dispatch],
    )

    const handleNumberPadCancel = useCallback(() => {
        setNumberPadState({ isOpen: false, editingIndex: null, editingField: null, originalValue: 0 })
    }, [])

    const renderDropdownOptions = () => {
        if (!dropdownPosition) return null

        return (
            <div
                className="curb-dropdown"
                style={{ top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width }}
            >
                {Object.keys(COLORS).map(type => renderTypeOption(type, handleTypeSelect, activeDropdown))}
                {renderUnknownOption(handleTypeSelect, activeDropdown)}
            </div>
        )
    }

    const renderTableRow = (segment, index) => {
        const isCurrent = index === currentRowIndex
        const rowClassName = `curb-table-row${isCurrent ? ' current-row' : ''}`

        return (
            <tr
                key={segment.id}
                className={rowClassName}
                data-row-index={index}
                onClick={() => setCurrentRowIndex(index)}
                style={{ cursor: 'pointer' }}
            >
                <td className="type-cell">
                    <div className="type-container">
                        <button
                            className="type-button"
                            style={{ backgroundColor: COLORS[segment.type] || '#666' }}
                            onClick={e => handleTypeButtonClick(e, index, handleDropdownToggle)}
                        >
                            {segment.type}
                        </button>
                    </div>
                </td>
                <td
                    className="length-cell editable-cell"
                    onClick={e => {
                        e.stopPropagation()
                        handleCellClick(index, 'length', segment.length)
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    {formatLength(segment.length)}
                </td>
                <td
                    className="start-cell editable-cell"
                    onClick={e => {
                        e.stopPropagation()
                        handleCellClick(index, 'start', startPositions[index])
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    {formatLength(startPositions[index])}
                </td>
                <td className="add-cell">
                    <button className="add-button" onClick={() => handleAddSegment(index)} disabled={!canAddSegments}>
                        +
                    </button>
                </td>
            </tr>
        )
    }

    return (
        <div className="curb-table-container">
            <div className="curb-table-header">
                <h3>Curb Configuration</h3>
                <div className="blockface-info">
                    Total: {effectiveBlockfaceLength} ft
                    {unknownSegment && unknownSegment.length > 0 && (
                        <span> • Remaining: {formatLength(unknownSegment.length)}</span>
                    )}
                </div>
            </div>

            <div className="curb-table-wrapper">
                <table className="curb-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th style={{ textAlign: 'right' }}>Length</th>
                            <th style={{ textAlign: 'right' }}>Start</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>{segments && segments.length > 0 ? segments.map(renderTableRow) : null}</tbody>
                </table>
            </div>
            {renderDropdownOptions()}
            {numberPadState.isOpen && (
                <NumberPad
                    value={numberPadState.originalValue}
                    min={numberPadState.editingField === 'length' ? 1 : 0}
                    max={numberPadState.editingField === 'length' ? effectiveBlockfaceLength : effectiveBlockfaceLength}
                    onSave={handleNumberPadSave}
                    onCancel={handleNumberPadCancel}
                    label={numberPadState.editingField === 'length' ? 'Length' : 'Start'}
                />
            )}
        </div>
    )
}

export default CurbTable
