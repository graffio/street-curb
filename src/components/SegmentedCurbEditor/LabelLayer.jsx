import { useEffect, useRef, useState } from 'react'
import { COLORS } from '../../constants.js'
import { formatLength } from '../../utils/formatting.js'
import { calculateLabelPositions } from './label-positioning.js'

/**
 * LabelLayer - Interactive label overlay for segment configuration
 *
 * Renders smart-positioned labels with dropdown menus for type changing and segment addition.
 */

/**
 * Main LabelLayer component that renders all interactive labels
 * @sig LabelLayer :: (LabelLayerProps) -> JSXElement
 *     LabelLayerProps = {
 *         segments: [Segment],
 *         tickPoints: [Number],
 *         total: Number,
 *         effectiveBlockfaceLength: Number,
 *         editingIndex: Number?,
 *         setEditingIndex: Function,
 *         handleChangeType: Function,
 *         handleAddLeft: Function
 *     }
 */
const LabelLayer = ({
    segments,
    tickPoints,
    total,
    effectiveBlockfaceLength,
    editingIndex,
    setEditingIndex,
    handleChangeType,
    handleAddLeft,
}) => {
    const labelRefs = useRef([])
    const [smartLabelPositions, setSmartLabelPositions] = useState([])
    const [uniformLabelWidth, setUniformLabelWidth] = useState(0)

    /**
     * Renders individual label with dropdown functionality
     * @sig renderLabel :: (Segment, Number) -> JSXElement
     */
    const renderLabel = (segment, index) => {
        const mid = tickPoints[index] + segment.length / 2
        const positionPct = (mid / total) * 100
        const feet = formatLength((segment.length / total) * effectiveBlockfaceLength)

        const labelStyle = {
            backgroundColor: COLORS[segment.type] || '#999',
            top: `${positionPct}%`,
            left: `${smartLabelPositions[index] || 0}px`,
            transform: 'translateY(-50%)',
            width: uniformLabelWidth > 0 ? `${uniformLabelWidth}px` : 'auto',
        }

        const handleLabelClick = e => {
            e.stopPropagation()
            setEditingIndex(editingIndex === index ? null : index)
        }

        const handleTypeClick = (e, type) => {
            e.stopPropagation()
            handleChangeType(index, type)
        }

        const handleAddLeftClick = e => {
            e.stopPropagation()
            handleAddLeft(index)
        }

        /**
         * Renders dropdown type option
         * @sig renderTypeOption :: String -> JSXElement
         */
        const renderTypeOption = type => (
            <div
                key={type}
                className="dropdown-item"
                style={{ backgroundColor: COLORS[type] }}
                onClick={e => handleTypeClick(e, type)}
            >
                {type}
            </div>
        )

        const labelContent =
            editingIndex === index ? (
                <>
                    <span>
                        {segment.type} {feet}
                    </span>
                    <div className="dropdown">
                        {Object.keys(COLORS).map(renderTypeOption)}
                        <div
                            className="dropdown-item"
                            style={{ backgroundColor: 'red', textAlign: 'center', marginTop: '10px' }}
                            onClick={handleAddLeftClick}
                        >
                            + Add left
                        </div>
                    </div>
                </>
            ) : (
                `${segment.type} ${feet}`
            )

        return (
            <div
                key={`label-${segment.id}`}
                className="floating-label"
                style={labelStyle}
                ref={el => (labelRefs.current[index] = el)}
                onClick={handleLabelClick}
            >
                {labelContent}
            </div>
        )
    }

    /**
     * Updates label positioning after render
     * @sig updateLabelPositioning :: () -> Void
     */
    const updateLabelPositioning = () => {
        const { positions, contentWidth } = calculateLabelPositions(true, labelRefs.current)
        setSmartLabelPositions(positions)
        setUniformLabelWidth(contentWidth)
    }

    /**
     * Sets up positioning effect cleanup
     * @sig setupPositioningEffect :: () -> () -> Void
     */
    const setupPositioningEffect = () => {
        const timeoutId = setTimeout(updateLabelPositioning, 0)
        return () => clearTimeout(timeoutId)
    }

    useEffect(setupPositioningEffect, [segments])

    return <div className="label-layer">{segments.map(renderLabel)}</div>
}

export { LabelLayer }
