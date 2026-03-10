// ABOUTME: Generate human-readable descriptions from IRFinancialQuery IR
// ABOUTME: Pure transformer — dispatches via .match() on all 3 variants

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
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
            Or: ({ filters }) => `(${filters.map(T.toFilterDescription).join(' or ')})`,
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
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Generate a human-readable description of a IRFinancialQuery IR
// @sig toFinancialQueryDescription :: IRFinancialQuery -> String
const toFinancialQueryDescription = query =>
    query.match({
        TransactionQuery: ({ filter, grouping }) => `transactions${T.toFilterPart(filter)}${T.toGroupPart(grouping)}`,
        PositionQuery: ({ filter, grouping }) => `positions${T.toFilterPart(filter)}${T.toGroupPart(grouping)}`,
        SnapshotQuery: ({ domain, interval, grouping }) =>
            `${domain} snapshots (${interval})${T.toGroupPart(grouping)}`,
    })

export { toFinancialQueryDescription }
