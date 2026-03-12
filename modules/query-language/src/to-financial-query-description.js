// ABOUTME: Generate human-readable descriptions from IRFinancialQuery IR
// ABOUTME: Pure transformer — dispatches via .match() on all 3 variants

import { formatIsoDate } from '@graffio/functional'
import { IRFilter } from './types/index.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // True when an Or contains only Matches variants sharing one pattern (text search chip)
    // @sig isTextSearch :: [IRFilter] -> Boolean
    isTextSearch: filters =>
        filters.length > 1 &&
        filters.every(f => IRFilter.Matches.is(f)) &&
        new Set(filters.map(f => f.pattern)).size === 1,

    // Render an IRFilter node as a human-readable string
    // @sig toFilterDescription :: IRFilter -> String
    toFilterDescription: node =>
        node.match({
            Equals: ({ field, value }) => `${field} = ${value}`,
            In: ({ field, values }) => `${field} in (${values.join(', ')})`,
            GreaterThan: ({ field, value }) => `${field} > ${value}`,
            LessThan: ({ field, value }) => `${field} < ${value}`,
            Between: ({ field, low, high }) => `${field} ${low}–${high}`,
            Matches: ({ field, pattern }) => `${field} ~ /${pattern}/`,
            And: ({ filters }) => filters.map(T.toFilterDescription).join(' and '),
            Or: ({ filters }) =>
                T.isTextSearch(filters)
                    ? `filter: ${filters[0].pattern}`
                    : `(${filters.map(T.toFilterDescription).join(' or ')})`,
            Not: ({ filter }) => `not ${T.toFilterDescription(filter)}`,
        }),

    // Render a grouping clause as readable text
    // @sig toGroupingDescription :: IRGrouping -> String
    toGroupingDescription: grouping => {
        const { rows, columns } = grouping
        const parts = [rows]
        if (columns) parts.push(`by ${columns}`)
        return parts.join(' ')
    },

    toFilterPart: f => (f ? ` where ${T.toFilterDescription(f)}` : ''),

    toGroupPart: g => (g ? `, grouped by ${T.toGroupingDescription(g)}` : ''),

    // Render a date range as readable text, omitting AllDates (no restriction)
    // @sig toDateRangeDescription :: IRDateRange -> String
    toDateRangeDescription: dr =>
        dr.match({
            AllDates: () => '',
            Year: ({ year }) => `${year}`,
            Quarter: ({ quarter, year }) => `Q${quarter} ${year}`,
            Month: ({ month, year }) => `${MONTH_NAMES[month - 1]} ${year}`,
            Relative: ({ unit, count }) => `last ${count} ${unit}`,
            Range: ({ start, end }) => `${formatIsoDate(start)} – ${formatIsoDate(end)}`,
        }),

    toDateRangePart: dr => {
        if (!dr) return ''
        const desc = T.toDateRangeDescription(dr)
        return desc ? `, ${desc}` : ''
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Generate a human-readable description of a IRFinancialQuery IR
// @sig toFinancialQueryDescription :: IRFinancialQuery -> String
const toFinancialQueryDescription = query =>
    query.match({
        TransactionQuery: ({ filter, dateRange, grouping }) =>
            `transactions${T.toFilterPart(filter)}${T.toDateRangePart(dateRange)}${T.toGroupPart(grouping)}`,
        PositionQuery: ({ filter, dateRange, grouping }) =>
            `positions${T.toFilterPart(filter)}${T.toDateRangePart(dateRange)}${T.toGroupPart(grouping)}`,
        SnapshotQuery: ({ domain, dateRange, interval, grouping }) =>
            `${domain} snapshots (${interval})${T.toDateRangePart(dateRange)}${T.toGroupPart(grouping)}`,
        AccountQuery: ({ filter, dateRange }) => `accounts${T.toFilterPart(filter)}${T.toDateRangePart(dateRange)}`,
    })

export { toFinancialQueryDescription }
