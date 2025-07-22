import { useCallback, useState } from 'react'
import { COLORS } from '../constants.js'

/**
 * CurbTable - Mobile-friendly table-based curb editor for field data collection
 *
 * Optimized for one-handed phone use while collecting street curb data.
 * Allows users to create curb configuration data from scratch starting with
 * a single "Unknown" segment of the full blockface length.
 */

/**
 * Creates initial segment data structure for new blockface
 * @sig createInitialSegment :: Number -> Segment
 * Segment = { id: String, type: String, length: Number }
 */
const createInitialSegment = blockfaceLength => ({
    id: 's' + Math.random().toString(36).slice(2, 7),
    type: 'Unknown',
    length: blockfaceLength,
})

/**
 * Creates new segment with default properties for insertion
 * @sig createNewSegment :: (String, Number) -> Segment
 */
const createNewSegment = (type = 'Parking', length = 20) => ({
    id: 's' + Math.random().toString(36).slice(2, 7),
    type,
    length,
})

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

/**
 * Updates segment type at given index
 * @sig updateSegmentType :: ([Segment], Number, String) -> [Segment]
 */
const updateSegmentType = (segments, index, newType) => {
    const next = [...segments]
    next[index] = { ...next[index], type: newType }
    return next
}

/**
 * Adds new segment by consuming space from Unknown segment
 * @sig addSegmentFromUnknown :: ([Segment], Number) -> { segments: [Segment], newIndex: Number }
 */
const addSegmentFromUnknown = (segments, targetIndex) => {
    const target = segments[targetIndex]
    if (!target) return { segments, newIndex: targetIndex }

    const unknownIndex = segments.findIndex(segment => segment.type === 'Unknown')
    if (unknownIndex === -1) return { segments, newIndex: targetIndex }

    const unknownSegment = segments[unknownIndex]
    const newSegmentSize = Math.min(20, unknownSegment.length)

    if (newSegmentSize <= 0) return { segments, newIndex: targetIndex }

    const newSegment = createNewSegment('Parking', newSegmentSize)
    const next = [...segments]

    next[unknownIndex] = { ...unknownSegment, length: unknownSegment.length - newSegmentSize }

    const insertIndex = target.type === 'Unknown' ? unknownIndex : targetIndex + 1
    next.splice(insertIndex, 0, newSegment)

    return { segments: next, newIndex: insertIndex }
}

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

/**
 * Processes type change and updates state
 * @sig processTypeChange :: (Number, String, [Segment], Function, Function, Function) -> Void
 */
const processTypeChange = (index, newType, segments, setSegments, onSegmentsChange, setCurrentRowIndex) => {
    const updatedSegments = updateSegmentType(segments, index, newType)
    setSegments(updatedSegments)
    if (onSegmentsChange) onSegmentsChange(updatedSegments)
    setCurrentRowIndex(index)
}

/**
 * Processes segment addition and updates state
 * @sig processSegmentAddition :: (Number, [Segment], Function, Function, Function) -> Void
 */
const processSegmentAddition = (index, segments, setSegments, onSegmentsChange, setCurrentRowIndex) => {
    const { segments: updatedSegments, newIndex } = addSegmentFromUnknown(segments, index)
    setSegments(updatedSegments)
    if (onSegmentsChange) onSegmentsChange(updatedSegments)
    setTimeout(() => setCurrentRowIndex(newIndex), 0)
}

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
 * @sig CurbTable :: ({ blockfaceLength?: Number, onSegmentsChange?: Function }) -> JSXElement
 */
const CurbTable = ({ blockfaceLength = 240, onSegmentsChange }) => {
    const [segments, setSegments] = useState(() => [createInitialSegment(blockfaceLength)])
    const [activeDropdown, setActiveDropdown] = useState(null)
    const [currentRowIndex, setCurrentRowIndex] = useState(0)
    const [dropdownPosition, setDropdownPosition] = useState(null)

    const startPositions = calculateStartPositions(segments)
    const unknownSegment = segments.find(segment => segment.type === 'Unknown')
    const canAddSegments = unknownSegment && unknownSegment.length > 0

    const handleTypeChange = useCallback(
        (index, newType) =>
            processTypeChange(index, newType, segments, setSegments, onSegmentsChange, setCurrentRowIndex),
        [segments, onSegmentsChange],
    )

    const handleAddSegment = useCallback(
        index => processSegmentAddition(index, segments, setSegments, onSegmentsChange, setCurrentRowIndex),
        [segments, onSegmentsChange],
    )

    const handleDropdownToggle = useCallback(
        index => processDropdownToggle(index, activeDropdown, setActiveDropdown, setDropdownPosition),
        [activeDropdown],
    )

    const handleTypeSelect = useCallback(
        (index, type) => processTypeSelection(index, type, handleTypeChange, setActiveDropdown, setDropdownPosition),
        [handleTypeChange],
    )

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
                <td className="length-cell">{Math.round(segment.length)} ft</td>
                <td className="start-cell">{Math.round(startPositions[index])} ft</td>
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
                    Total: {blockfaceLength} ft
                    {unknownSegment && unknownSegment.length > 0 && (
                        <span> • Remaining: {Math.round(unknownSegment.length)} ft</span>
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
                    <tbody>{segments.map(renderTableRow)}</tbody>
                </table>
            </div>
            {renderDropdownOptions()}
        </div>
    )
}

export default CurbTable
