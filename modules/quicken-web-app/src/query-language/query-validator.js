// ABOUTME: Semantic validator for query IR — checks entity references against live user data
// ABOUTME: Provides fuzzy suggestions via Levenshtein distance, prefix, hierarchical, and substring matching

import { filter, find, reduce, map, uniq } from '@graffio/functional'
import { MetricRegistry } from '../financial-computations/metric-registry.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

const P = {
    // Check if a filter references a user data entity (category, account, payee, accountType)
    // @sig isEntityFilter :: IRFilter -> Boolean
    isEntityFilter: f => ENTITY_FIELDS[f.field] !== undefined,

    // Check if a category matches via exact match or prefix (Food matches Food:Dining)
    // @sig isCategoryMatch :: (String, [String]) -> Boolean
    isCategoryMatch: (value, categories) => categories.some(c => c === value || c.startsWith(value + ':')),

    // Check if a value exists in a list of candidates
    // @sig isExactMatch :: (String, [String]) -> Boolean
    isExactMatch: (value, candidates) => candidates.some(c => c === value),

    // Check if a candidate is a hierarchical match (segment within colon-separated path)
    // @sig isHierarchicalMatch :: (String, String) -> Boolean
    isHierarchicalMatch: (value, candidate) => {
        const parts = candidate.split(':')
        return parts.length > 1 && parts.some(p => T.computeDistance(value, p) <= 1)
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Compute one cell of the Levenshtein DP matrix and store in row
    // @sig computeCell :: ([Number], [Number], Number, String, String) -> undefined
    computeCell: (row, prevRow, j, char, lb) => {
        const cost = char === lb[j] ? 0 : 1
        row[j + 1] = Math.min(prevRow[j + 1] + 1, row[j] + 1, prevRow[j] + cost)
        return undefined
    },

    // Compute one row of the Levenshtein DP matrix
    // @sig computeRow :: ([Number], Number, String, String) -> [Number]
    computeRow: (prevRow, i, la, lb) => {
        const row = [i + 1]
        reduce(
            (_, j) => T.computeCell(row, prevRow, j, la[i], lb),
            undefined,
            Array.from({ length: lb.length }, (_, j) => j),
        )
        return row
    },

    // Compute Levenshtein distance between two strings (case-insensitive)
    // @sig computeDistance :: (String, String) -> Number
    computeDistance: (a, b) => {
        const la = a.toLowerCase()
        const lb = b.toLowerCase()
        const initial = Array.from({ length: lb.length + 1 }, (_, i) => i)

        return reduce(
            (prevRow, i) => T.computeRow(prevRow, i, la, lb),
            initial,
            Array.from({ length: la.length }, (_, i) => i),
        )[lb.length]
    },

    // Format hint text from suggestions list
    // @sig formatHint :: [String] -> String
    formatHint: suggestions =>
        suggestions.length > 0 ? ` Did you mean: ${suggestions.map(s => `'${s}'`).join(', ')}?` : '',
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Create a validation error with field context and suggestions
    // @sig createError :: (String, String, String, [String]) -> Object
    createError: (field, value, message, suggestions = []) => ({ field, value, message, suggestions }),

    // Create a source reference error for computation validation
    // @sig createSourceRefError :: (String, String, [String]) -> Object
    createSourceRefError: (fieldPath, source, sourceNames) =>
        F.createError(
            fieldPath,
            source,
            `References undefined source '${source}'. Available: ${sourceNames.join(', ')}`,
        ),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Aggregators
//
// ---------------------------------------------------------------------------------------------------------------------

const A = {
    // Find suggestions for a value from candidates using 4 matching strategies
    // Priority order: prefix → hierarchical → substring → Levenshtein
    // @sig findSuggestions :: (String, [String]) -> [String]
    findSuggestions: (value, candidates) => {
        const lower = value.toLowerCase()
        const prefixMatches = filter(
            c => c.toLowerCase().startsWith(lower) || lower.startsWith(c.toLowerCase()),
            candidates,
        )
        const hierarchicalMatches = filter(c => P.isHierarchicalMatch(value, c), candidates)
        const substringMatches = filter(
            c => c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase()),
            candidates,
        )
        const lengthFiltered = filter(c => Math.abs(c.length - value.length) <= MAX_LEVENSHTEIN_DISTANCE, candidates)
        const levenshteinMatches = filter(c => T.computeDistance(value, c) <= MAX_LEVENSHTEIN_DISTANCE, lengthFiltered)

        const all = [...prefixMatches, ...hierarchicalMatches, ...substringMatches, ...levenshteinMatches]
        return uniq(all).slice(0, MAX_SUGGESTIONS)
    },

    // Collect validation errors for a single entity filter
    // Only called for IRFilter.Equals variants (OlderThan is not an entity filter)
    // @sig collectFilterErrors :: (IRFilter, DataSummary, String) -> [Object]
    collectFilterErrors: (f, summary, sourceName) => {
        if (!P.isEntityFilter(f)) return []

        const { field, value } = f
        const candidates = field === 'account' ? map(a => a.name, summary.accounts) : summary[ENTITY_FIELDS[field]]
        const hasMatch = field === 'category' ? P.isCategoryMatch(value, candidates) : P.isExactMatch(value, candidates)
        if (hasMatch) return []

        const suggestions = A.findSuggestions(value, candidates)
        const hint = T.formatHint(suggestions)
        const fieldLabel = ENTITY_LABELS[field]
        return [
            F.createError(
                `${sourceName}.${field}`,
                value,
                `Unknown ${fieldLabel} '${value}' in source '${sourceName}'.${hint}`,
                suggestions,
            ),
        ]
    },

    // Collect validation errors for all filters in a source
    // @sig collectSourceErrors :: (IRSource, String, DataSummary) -> [Object]
    collectSourceErrors: (source, sourceName, summary) =>
        reduce((errors, f) => [...errors, ...A.collectFilterErrors(f, summary, sourceName)], [], source.filters),

    // Collect validation errors for a single IRExpression.Reference
    // @sig collectReferenceErrors :: (String, [String]) -> [Object]
    collectReferenceErrors: (source, sourceNames) => {
        if (sourceNames.includes(source)) return []
        const available = sourceNames.join(', ')
        return [
            F.createError(
                'expression.ref',
                source,
                `Expression references undefined source '${source}'. Available: ${available}`,
            ),
        ]
    },

    // Collect validation errors for IRExpression source references
    // @sig collectExpressionErrors :: (IRExpression, [String]) -> [Object]
    collectExpressionErrors: (node, sourceNames) =>
        node.match({
            Literal: () => [],
            Reference: ({ source }) => A.collectReferenceErrors(source, sourceNames),
            Binary: ({ left, right }) => [
                ...A.collectExpressionErrors(left, sourceNames),
                ...A.collectExpressionErrors(right, sourceNames),
            ],
            Call: ({ args }) =>
                reduce((errors, arg) => [...errors, ...A.collectExpressionErrors(arg, sourceNames)], [], args),
        }),

    // Validate Identity/FilterEntities computation — check single source ref
    // @sig collectSingleSourceErrors :: (String, [String]) -> [Object]
    collectSingleSourceErrors: (source, sourceNames) => {
        if (!sourceNames.includes(source)) return [F.createSourceRefError('computation.source', source, sourceNames)]
        return []
    },

    // Validate Compare computation — check left and right source refs
    // @sig collectCompareErrors :: (String, String, [String]) -> [Object]
    collectCompareErrors: (left, right, sourceNames) => {
        const msg = source => `Compare references undefined source '${source}'. Available: ${sourceNames.join(', ')}`
        return [
            ...(sourceNames.includes(left) ? [] : [F.createError('computation.left', left, msg(left))]),
            ...(sourceNames.includes(right) ? [] : [F.createError('computation.right', right, msg(right))]),
        ]
    },

    // Collect validation errors for computation source references
    // @sig collectComputationErrors :: (IRComputation, LookupTable) -> [Object]
    collectComputationErrors: (computation, sources) => {
        const sourceNames = map(s => s.name, Array.from(sources))

        return computation.match({
            Identity: ({ source }) => A.collectSingleSourceErrors(source, sourceNames),
            Compare: ({ left, right }) => A.collectCompareErrors(left, right, sourceNames),
            Expression: ({ expression }) => A.collectExpressionErrors(expression, sourceNames),
            FilterEntities: ({ source }) => A.collectSingleSourceErrors(source, sourceNames),
            TimeSeries: ({ source, interval }) => [
                ...A.collectSingleSourceErrors(source, sourceNames),
                ...A.collectTimeSeriesErrors(source, interval, sources),
            ],
        })
    },

    // Validate timeSeries date range produces <= MAX_TIME_SERIES_POINTS snapshots
    // @sig collectTimeSeriesErrors :: (String, String, LookupTable) -> [Object]
    collectTimeSeriesErrors: (sourceName, interval, sources) => {
        const source = find(s => s.name === sourceName, Array.from(sources))
        if (!source || !source.dateRange) return []
        const { start, end } = source.dateRange
        if (!start || !end) return []
        const days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24))
        const intervalDays = INTERVAL_DAYS[interval] || 1
        const points = Math.ceil(days / intervalDays)
        if (points > MAX_TIME_SERIES_POINTS)
            return [
                F.createError(
                    'computation.timeSeries',
                    interval,
                    `Time series would produce ${points} data points, exceeding maximum of ${MAX_TIME_SERIES_POINTS}`,
                ),
            ]
        return []
    },

    // Validate a single metric name against registered metrics
    // @sig collectSingleMetricError :: ([String], String, String) -> [Object]
    collectSingleMetricError: (registeredNames, sourceName, name) => {
        if (registeredNames.includes(name)) return []
        return [
            F.createError(
                `${sourceName}.metrics`,
                name,
                `Unknown metric '${name}'. Available: ${registeredNames.join(', ')}`,
            ),
        ]
    },

    // Validate metric names on a source against the MetricRegistry
    // @sig collectMetricErrors :: (IRSource) -> [Object]
    collectMetricErrors: source => {
        if (!source.metrics) return []
        const registeredNames = map(m => m.name, Array.from(MetricRegistry))
        return reduce(
            (errors, name) => [...errors, ...A.collectSingleMetricError(registeredNames, source.name, name)],
            [],
            source.metrics,
        )
    },

    // Validate orderBy field against known position fields and metric names
    // @sig collectOrderByErrors :: (IROutput) -> [Object]
    collectOrderByErrors: output => {
        if (!output || !output.orderByField) return []
        const field = output.orderByField
        const registeredNames = map(m => m.name, Array.from(MetricRegistry))
        if (POSITION_FIELDS.includes(field) || registeredNames.includes(field)) return []
        return [
            F.createError(
                'output.orderBy',
                field,
                `Unknown orderBy field '${field}'. Must be a position field or registered metric name`,
            ),
        ]
    },

    // Collect all validation errors for a single source (entity filters + metrics)
    // @sig collectAllSourceErrors :: (IRSource, DataSummary) -> [Object]
    collectAllSourceErrors: (source, summary) => [
        ...A.collectSourceErrors(source, source.name, summary),
        ...A.collectMetricErrors(source),
    ],

    // Validate limit is a positive integer and not combined with groupBy
    // @sig collectLimitErrors :: (IROutput, LookupTable) -> [Object]
    collectLimitErrors: (output, sources) => {
        if (!output || output.limit === undefined) return []
        const { limit } = output
        const hasGroupBy = Array.from(sources).some(s => s.groupBy !== undefined)
        return [
            ...(limit <= 0
                ? [F.createError('output.limit', String(limit), `Limit must be a positive integer, got ${limit}`)]
                : []),
            ...(hasGroupBy
                ? [F.createError('output.limit', String(limit), `Limit cannot be combined with groupBy`)]
                : []),
        ]
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const MAX_SUGGESTIONS = 3
const MAX_LEVENSHTEIN_DISTANCE = 3

const ENTITY_FIELDS = { category: 'categories', account: 'accounts', accountType: 'accountTypes', payee: 'payees' }

const ENTITY_LABELS = { category: 'category', account: 'account', accountType: 'account type', payee: 'payee' }

const MAX_TIME_SERIES_POINTS = 100

const INTERVAL_DAYS = { daily: 1, weekly: 7, monthly: 30, quarterly: 91, yearly: 365 }

// prettier-ignore
const POSITION_FIELDS = [
    'marketValue', 'costBasis', 'quantity', 'unrealizedGainLoss', 'unrealizedGainLossPercent',
    'dayGainLoss', 'dayGainLossPercent', 'averageCostPerShare', 'quotePrice',
]

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Validate a query IR against a data summary, returning errors with suggestions
// @sig queryValidator :: (Query, DataSummary) -> { valid: Boolean, errors: [Object] }
const queryValidator = ({ sources, computation, output }, summary) => {
    const sourceErrors = reduce(
        (errors, source) => [...errors, ...A.collectAllSourceErrors(source, summary)],
        [],
        Array.from(sources),
    )
    const computationErrors = A.collectComputationErrors(computation, sources)
    const orderByErrors = A.collectOrderByErrors(output)
    const limitErrors = A.collectLimitErrors(output, sources)
    const allErrors = [...sourceErrors, ...computationErrors, ...orderByErrors, ...limitErrors]

    return { valid: allErrors.length === 0, errors: allErrors }
}
export { queryValidator }
