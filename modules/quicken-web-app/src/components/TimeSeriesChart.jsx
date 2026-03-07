// ABOUTME: D3-powered SVG line chart for time series data
// ABOUTME: Uses d3-scale for axis mapping, React for SVG rendering, Radix Tooltip for hover

import { isNil } from '@graffio/functional'
import { Tooltip } from '@radix-ui/themes'
import { scaleLinear, scaleUtc } from 'd3-scale'
import React from 'react'
import { Formatters } from '../utils/formatters.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Parse date strings to local Date objects, avoiding UTC timezone shift
    // @sig toDates :: [{ date: String }] -> [Date]
    toDates: data => data.map(d => new Date(d.date.replace(/-/g, '/'))),

    // Compute [min, max] extent of values
    // @sig toExtent :: [{ value: Number }] -> [Number, Number]
    toExtent: data =>
        data.reduce(([lo, hi], { value }) => [Math.min(lo, value), Math.max(hi, value)], [Infinity, -Infinity]),

    // Build polyline points string from data, dates, and scale functions
    // @sig toPoints :: ([{ value: Number }], [Date], Function, Function) -> String
    toPoints: (data, dates, xScale, yScale) =>
        data.map(({ value }, i) => `${xScale(dates[i])},${yScale(value)}`).join(' '),

    // Sample evenly-spaced x-axis ticks from actual data dates (avoids D3 "nice" date misalignment)
    // @sig toXTicks :: ([Date], Function, Number) -> [{ key: Number, x: Number, label: String }]
    toXTicks: (dates, xScale, maxTicks) => {
        const step = Math.max(1, Math.floor(dates.length / maxTicks))
        const indices = dates.reduce(
            (acc, _, i) => (i % step === 0 && i > 0 && i < dates.length - 1 ? [...acc, i] : acc),
            [],
        )
        return indices.map(i => ({ key: i, x: xScale(dates[i]), label: X_TICK_FORMAT.format(dates[i]) }))
    },

    // Build Y-axis tick prop objects from scale
    // @sig toYTickProps :: (Function, Number, Number, Number) -> [{ tick, y, label, width, left }]
    toYTickProps: (yScale, tickCount, width, left) =>
        yScale
            .ticks(tickCount)
            .map(tick => ({ tick, y: yScale(tick), label: Formatters.formatCompactCurrency(tick), width, left })),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Individual data point with Radix Tooltip showing date + formatted value
// @sig DataPoint :: { cx: Number, cy: Number, date: String, value: Number } -> ReactElement
const DataPoint = ({ cx, cy, date, value }) => (
    <Tooltip content={`${Formatters.formatDate(date)}: ${Formatters.formatCurrency(value)}`}>
        <circle cx={cx} cy={cy} r={4} fill="var(--accent-9)" stroke="var(--color-background)" strokeWidth={2} />
    </Tooltip>
)

// X-axis tick label
// @sig TickLabel :: { x: Number, label: String, height: Number } -> ReactElement
const TickLabel = ({ x, label, height }) => (
    <text x={x} y={height - 4} textAnchor="middle" fill="var(--gray-11)" fontSize={11}>
        {label}
    </text>
)

// Y-axis tick label + gridline
// @sig YTickLabel :: { y: Number, label: String, width: Number, left: Number } -> ReactElement
const YTickLabel = ({ y, label, width, left }) => (
    <g>
        <line x1={left} y1={y} x2={width} y2={y} stroke="var(--gray-5)" strokeDasharray="4 2" />
        <text x={left - 4} y={y + 4} textAnchor="end" fill="var(--gray-11)" fontSize={10}>
            {label}
        </text>
    </g>
)

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const PADDING = { top: 12, right: 16, bottom: 24, left: 72 }
const CHART_WIDTH = 800
const TICK_COUNT = 6
const Y_TICK_COUNT = 4
const X_TICK_FORMAT = new Intl.DateTimeFormat('en-US', { month: 'short' })

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/*
 * SVG line chart with hover tooltips, responsive via viewBox
 * @sig TimeSeriesChart :: ({ data: [{ date: String, value: Number }], height?: Number }) -> ReactElement
 */
const TimeSeriesChart = ({ data, height = 120 }) => {
    if (isNil(data) || data.length === 0) return undefined

    const { top, right, bottom, left } = PADDING
    const dates = F.toDates(data)
    const [minVal, maxVal] = F.toExtent(data)
    const margin = (maxVal - minVal) * 0.1

    const xScale = scaleUtc()
        .domain([dates[0], dates[dates.length - 1]])
        .range([left, CHART_WIDTH - right])

    const yScale = scaleLinear()
        .domain([minVal - margin, maxVal + margin])
        .range([height - bottom, top])

    const points = F.toPoints(data, dates, xScale, yScale)

    const xTicks = F.toXTicks(dates, xScale, TICK_COUNT)
    const yTickProps = F.toYTickProps(yScale, Y_TICK_COUNT, CHART_WIDTH - right, left)

    return (
        <svg viewBox={`0 0 ${CHART_WIDTH} ${height}`} style={{ width: '100%', height: 'auto' }}>
            {yTickProps.map(({ tick, ...props }) => (
                <YTickLabel key={tick} {...props} />
            ))}
            <polyline points={points} fill="none" stroke="var(--accent-9)" strokeWidth={2} />
            {data.map(({ date, value }, i) => (
                <DataPoint key={date} cx={xScale(dates[i])} cy={yScale(value)} date={date} value={value} />
            ))}
            {xTicks.map(({ key, x, label }) => (
                <TickLabel key={key} x={x} label={label} height={height} />
            ))}
        </svg>
    )
}

export { TimeSeriesChart }
