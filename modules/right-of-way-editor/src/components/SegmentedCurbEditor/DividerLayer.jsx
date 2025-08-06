import { tokens } from '@qt/design-system'

/**
 * DividerLayer - Interactive dividers for segment boundary adjustment
 *
 * Renders draggable dividers between segments for resizing.
 */

/**
 * Main DividerLayer component that renders all draggable dividers
 * @sig DividerLayer :: (DividerLayerProps) -> JSXElement
 *     DividerLayerProps = {
 *         segments: [Segment],
 *         total: Number,
 *         unknownRemaining: Number,
 *         handleDirectDragStart: Function
 *     }
 */
const DividerLayer = ({ segments, total, unknownRemaining, handleDirectDragStart }) => {
    /**
     * Renders individual divider at given index
     * @sig renderDivider :: Number -> JSXElement?
     */
    const renderDivider = index => {
        // Allow divider after last segment if there's unknown space
        if (index >= segments.length && unknownRemaining <= 0) return null
        if (index >= segments.length - 1 && unknownRemaining <= 0) return null

        const positionPercent = segments
            .slice(0, index + 1)
            .reduce((acc, segment) => acc + (segment.length / total) * 100, 0)

        const dividerStyle = {
            position: 'absolute',
            top: `${positionPercent}%`,
            transform: 'translateY(-50%)',
            left: 0,
            width: '100%',
            height: tokens.SegmentedCurbEditor.dividerHeight,
            cursor: 'row-resize',
            touchAction: 'none',
        }

        return (
            <div
                key={`divider-${index}-${segments.length}`}
                className="divider"
                style={dividerStyle}
                onMouseDown={e => handleDirectDragStart(e, index)}
                onTouchStart={e => handleDirectDragStart(e, index)}
            >
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: tokens.SegmentedCurbEditor.divider,
                        borderRadius: tokens.SegmentedCurbEditor.borderRadius,
                    }}
                />
            </div>
        )
    }

    return (
        <>
            {segments.map((_, index) => renderDivider(index))}
            {unknownRemaining > 0 && segments.length > 0 && renderDivider(segments.length - 1)}
        </>
    )
}

export { DividerLayer }
