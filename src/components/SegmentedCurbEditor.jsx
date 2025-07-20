import { useCallback, useEffect, useRef, useState } from 'react'
import { COLORS, initialSegments, STREET_LENGTH } from '../constants.js'
import DraggableDivider from './DraggableDivider.jsx'

/**
 * @sig SegmentedCurbEditor :: () -> JSXElement
 * Main component for editing segmented curb configurations with drag and drop functionality
 */
const SegmentedCurbEditor = () => {
    const createTickPoints = segments => {
        const tickPoints = [0]
        let cum = 0
        for (const s of segments) {
            cum += s.length
            tickPoints.push(cum)
        }
        return tickPoints
    }

    const createLabelOffsets = labelRefs => {
        const boxes = labelRefs.current.map(el => el?.getBoundingClientRect())
        const offsets = new Array(boxes.length).fill(0)

        for (let i = 0; i < boxes.length; i++) {
            for (let j = 0; j < i; j++) {
                if (!boxes[i] || !boxes[j]) continue
                const a = boxes[i]
                const b = boxes[j]
                const overlap = !(a.right < b.left || a.left > b.right)
                if (overlap && offsets[i] <= offsets[j]) {
                    offsets[i] = offsets[j] + 1
                }
            }
        }
        return offsets
    }

    const createDragHandler = (total, setSegments) =>
        useCallback(
            (index, deltaPx, containerWidth) => {
                setSegments(prev => {
                    const next = [...prev]
                    const pxPerUnit = containerWidth / total
                    const deltaUnits = deltaPx / pxPerUnit

                    const left = next[index]
                    const right = next[index + 1]
                    if (!left || !right) return prev

                    const newLeftLength = left.length + deltaUnits
                    const newRightLength = right.length - deltaUnits
                    if (newLeftLength < 1 || newRightLength < 1) return prev

                    next[index] = { ...left, length: newLeftLength }
                    next[index + 1] = { ...right, length: newRightLength }

                    return next
                })
            },
            [total],
        )

    const createSwapHandler = setSegments => (fromIndex, toIndex) => {
        setSegments(prev => {
            const copy = [...prev]
            const [moved] = copy.splice(fromIndex, 1)
            copy.splice(toIndex, 0, moved)
            return copy
        })
    }

    const createChangeTypeHandler = (setSegments, setEditingIndex) => (index, newType) => {
        setSegments(prev => {
            const next = [...prev]
            next[index] = { ...next[index], type: newType }
            return next
        })
        setEditingIndex(null)
    }

    const createAddLeftHandler = (setSegments, setEditingIndex) => index => {
        setSegments(prev => {
            const next = [...prev]
            const desiredLength = 10
            const fromSegment = next[index]

            if (!fromSegment) return prev

            const createNewSegment = () => ({
                id: 's' + Math.random().toString(36).slice(2, 7),
                type: 'Parking',
                length: desiredLength,
            })

            if (fromSegment.length >= desiredLength + 1) {
                fromSegment.length -= desiredLength
                next.splice(index, 0, createNewSegment())
            } else if (index > 0 && next[index - 1].length >= desiredLength + 1) {
                next[index - 1].length -= desiredLength
                next.splice(index, 0, createNewSegment())
            }

            return [...next]
        })
        setEditingIndex(null)
    }

    const createDragStartHandler = (dragData, setDraggingIndex, i) => e => {
        if (e.target.classList.contains('divider')) {
            e.preventDefault()
            return
        }
        dragData.current = { index: i }
        setDraggingIndex(i)
        e.dataTransfer.effectAllowed = 'move'
    }

    const createDropHandler = (dragData, setDraggingIndex, handleSwap, i) => e => {
        if (e.target.classList.contains('divider')) return
        const from = dragData.current.index
        const to = i
        setDraggingIndex(null)
        if (from !== undefined && from !== to) handleSwap(from, to)
    }

    const createTouchStartHandler = (dragData, setDraggingIndex, i) => e => {
        if (e.target.classList.contains('divider')) return
        e.preventDefault()
        dragData.current = { index: i }
        setDraggingIndex(i)
    }

    const createTouchEndHandler = (dragData, setDraggingIndex, handleSwap, i) => e => {
        const from = dragData.current.index
        const to = i
        setDraggingIndex(null)
        if (from !== undefined && from !== to) handleSwap(from, to)
        dragData.current = {}
    }

    const createLabelClickHandler = (editingIndex, setEditingIndex, i) => e => {
        e.stopPropagation()
        setEditingIndex(editingIndex === i ? null : i)
    }

    const createTypeClickHandler = (handleChangeType, i) => (e, type) => {
        e.stopPropagation()
        handleChangeType(i, type)
    }

    const createAddLeftClickHandler = (handleAddLeft, i) => e => {
        e.stopPropagation()
        handleAddLeft(i)
    }

    const renderSegment = (
        segment,
        i,
        segments,
        total,
        draggingIndex,
        dragData,
        setDraggingIndex,
        handleSwap,
        handleDrag,
        containerRef,
    ) => {
        const width = (segment.length / total) * 100
        const isDragging = draggingIndex === i

        return (
            <div
                key={segment.id}
                className={`segment${isDragging ? ' dragging' : ''}`}
                style={{ width: `${width}%`, backgroundColor: COLORS[segment.type] || '#999' }}
                draggable
                onDragStart={createDragStartHandler(dragData, setDraggingIndex, i)}
                onDragOver={e => e.preventDefault()}
                onDrop={createDropHandler(dragData, setDraggingIndex, handleSwap, i)}
                onDragEnd={() => setDraggingIndex(null)}
                onTouchStart={createTouchStartHandler(dragData, setDraggingIndex, i)}
                onTouchEnd={createTouchEndHandler(dragData, setDraggingIndex, handleSwap, i)}
            >
                {i < segments.length - 1 && (
                    <DraggableDivider
                        onDrag={delta => {
                            if (containerRef.current) {
                                handleDrag(i, delta, containerRef.current.offsetWidth)
                            }
                        }}
                    />
                )}
            </div>
        )
    }

    const renderLabel = (
        s,
        i,
        tickPoints,
        total,
        labelOffsets,
        labelRefs,
        editingIndex,
        setEditingIndex,
        handleChangeType,
        handleAddLeft,
    ) => {
        const mid = tickPoints[i] + s.length / 2
        const leftPct = (mid / total) * 100
        const feet = Math.round((s.length / total) * STREET_LENGTH)

        return (
            <div
                key={`label-${s.id}`}
                className="floating-label"
                style={{
                    left: `${leftPct}%`,
                    top: `${labelOffsets[i] * 1.5}em`,
                    backgroundColor: COLORS[s.type] || '#999',
                }}
                ref={el => (labelRefs.current[i] = el)}
                onClick={createLabelClickHandler(editingIndex, setEditingIndex, i)}
            >
                {editingIndex === i ? (
                    <>
                        <span>
                            {s.type} {feet} ft
                        </span>
                        <div className="dropdown">
                            {Object.keys(COLORS).map(type => (
                                <div
                                    key={type}
                                    className="dropdown-item"
                                    style={{ backgroundColor: COLORS[type] }}
                                    onClick={e => createTypeClickHandler(handleChangeType, i)(e, type)}
                                >
                                    {type}
                                </div>
                            ))}
                            <div
                                className="dropdown-item"
                                style={{ backgroundColor: 'red', textAlign: 'center', marginTop: '10px' }}
                                onClick={createAddLeftClickHandler(handleAddLeft, i)}
                            >
                                + Add left
                            </div>
                        </div>
                    </>
                ) : (
                    `${s.type} ${feet} ft`
                )}
            </div>
        )
    }

    const renderTick = (p, i, total) => {
        const ft = Math.round((p / total) * STREET_LENGTH)
        const pct = (p / total) * 100
        return (
            <div key={`tick-${i}`} className="tick" style={{ left: `${pct}%` }}>
                {ft} ft
            </div>
        )
    }

    const [segments, setSegments] = useState(initialSegments)
    const [draggingIndex, setDraggingIndex] = useState(null)
    const [editingIndex, setEditingIndex] = useState(null)
    const containerRef = useRef(null)
    const labelRefs = useRef([])
    const [labelOffsets, setLabelOffsets] = useState([])
    const dragData = useRef({})

    const total = segments.reduce((sum, s) => sum + s.length, 0)
    const handleDrag = createDragHandler(total, setSegments)
    const handleSwap = createSwapHandler(setSegments)
    const handleChangeType = createChangeTypeHandler(setSegments, setEditingIndex)
    const handleAddLeft = createAddLeftHandler(setSegments, setEditingIndex)
    const tickPoints = createTickPoints(segments)

    useEffect(() => {
        setLabelOffsets(createLabelOffsets(labelRefs))
    }, [segments])

    return (
        <>
            <h1>Right of Way Canvas</h1>
            <div id="editor-wrapper">
                <div className="segment-container" ref={containerRef}>
                    {segments.map((segment, i) =>
                        renderSegment(
                            segment,
                            i,
                            segments,
                            total,
                            draggingIndex,
                            dragData,
                            setDraggingIndex,
                            handleSwap,
                            handleDrag,
                            containerRef,
                        ),
                    )}
                </div>

                <div className="label-layer">
                    {segments.map((s, i) =>
                        renderLabel(
                            s,
                            i,
                            tickPoints,
                            total,
                            labelOffsets,
                            labelRefs,
                            editingIndex,
                            setEditingIndex,
                            handleChangeType,
                            handleAddLeft,
                        ),
                    )}
                </div>

                <div className="ruler">{tickPoints.map((p, i) => renderTick(p, i, total))}</div>
            </div>
        </>
    )
}

export default SegmentedCurbEditor
