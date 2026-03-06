// ABOUTME: Generate human-readable descriptions from Query IR
// ABOUTME: Pure transformer — IRFilter tree and IRSource rendered as readable text

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
            OlderThan: ({ count, unit }) => `older than ${count} ${unit}`,
            And: ({ filters }) => filters.map(T.toFilterDescription).join(' and '),
            Or: ({ filters }) => `(${filters.map(T.toFilterDescription).join(' or ')})`,
            Not: ({ filter }) => `not ${T.toFilterDescription(filter)}`,
        }),

    // Render an IRSource's domain as lowercase text
    // @sig toDomainName :: IRDomain -> String
    toDomainName: domain =>
        domain.match({ Transactions: () => 'transactions', Positions: () => 'positions', Accounts: () => 'accounts' }),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Generate a human-readable description of a Query IR
// @sig toQueryDescription :: Query -> String
const toQueryDescription = query => {
    const source = query.sources.get('_default')
    if (!source) return ''
    const { domain, filter, groupBy } = source
    const domainName = T.toDomainName(domain)
    const filterPart = filter ? ` where ${T.toFilterDescription(filter)}` : ''
    const groupPart = groupBy ? `, grouped by ${groupBy}` : ''
    return `${domainName}${filterPart}${groupPart}`
}

export { toQueryDescription }
