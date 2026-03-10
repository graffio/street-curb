// ABOUTME: Merges UI chip filter state into a FinancialQuery IR before execution
// ABOUTME: Variant-agnostic — builds chip filters, combines with base, reconstructs via constructor.from()

import { compactMap } from '@graffio/functional'
import { IRDateRange, IRFilter, IRGrouping } from './types/index.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Escape special regex characters in a string
    // @sig toEscapedRegex :: String -> String
    toEscapedRegex: s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),

    // Convert chip dateRange ({ start: Date, end: Date }) to IRDateRange.Range, or undefined
    // @sig toChipDateRange :: ({ start: Date?, end: Date? }?) -> IRDateRange?
    toChipDateRange: chipDateRange => {
        if (!chipDateRange?.start || !chipDateRange?.end) return undefined
        const { start, end } = chipDateRange
        return IRDateRange.Range(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10))
    },

    // Convert chip asOfDate (ISO string) to IRDateRange.Range for a single day, or undefined
    // @sig toAsOfDateRange :: (String?) -> IRDateRange?
    toAsOfDateRange: asOfDate => (asOfDate ? IRDateRange.Range(asOfDate, asOfDate) : undefined),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Combine base filter with chip-added filters into a single IRFilter node
    // @sig buildCombinedFilter :: (IRFilter?, [IRFilter]) -> IRFilter?
    buildCombinedFilter: (baseFilter, chipFilters) => {
        if (chipFilters.length === 0) return baseFilter
        if (!baseFilter) return chipFilters.length === 1 ? chipFilters[0] : IRFilter.And(chipFilters)
        return IRFilter.And([baseFilter, ...chipFilters])
    },

    // Build IRFilter nodes from category, account, and text search chip selections
    // @sig buildChipFilters :: (Object, LookupTable) -> [IRFilter]
    buildChipFilters: ({ selectedCategories, selectedAccounts, filterQuery }, accts) => {
        const result = []
        if (selectedCategories.length > 0) {
            const fs = selectedCategories.map(c => IRFilter.Equals('category', c))
            result.push(fs.length === 1 ? fs[0] : IRFilter.Or(fs))
        }
        const names = selectedAccounts.length > 0 ? compactMap(id => accts.get(id)?.name, selectedAccounts) : []
        if (names.length > 0) result.push(IRFilter.In('account', names))
        if (filterQuery?.length > 0) {
            const escaped = T.toEscapedRegex(filterQuery)
            result.push(
                IRFilter.Or([
                    IRFilter.Matches('payee', escaped),
                    IRFilter.Matches('category', escaped),
                    IRFilter.Matches('memo', escaped),
                    IRFilter.Matches('amount', escaped),
                    IRFilter.Matches('date', escaped),
                    IRFilter.Matches('number', escaped),
                    IRFilter.Matches('investmentAction', escaped),
                    IRFilter.Matches('account', escaped),
                ]),
            )
        }
        return result
    },

    // Build a patch object from chip state — only includes fields that changed
    // asOfDate takes priority over dateRange when both are set (asOfDate is a point-in-time valuation date,
    // only set explicitly by the user via AsOfDateChip on position pages — never defaulted)
    // @sig buildChipPatch :: (Object, Object, LookupTable) -> Object
    buildChipPatch: (ir, { asOfDate, dateRange, groupBy, ...rest }, accts) => {
        const chipFilters = F.buildChipFilters(rest, accts)
        const chipDateRange = T.toChipDateRange(dateRange)
        const chipAsOfRange = T.toAsOfDateRange(asOfDate)

        const patch = {}
        if (chipFilters.length > 0) patch.filter = F.buildCombinedFilter(ir.filter, chipFilters)
        if (groupBy && ir.grouping) patch.grouping = IRGrouping(groupBy, ir.grouping.columns, ir.grouping.only)
        const dateOverride = chipAsOfRange || chipDateRange
        if (dateOverride) patch.dateRange = dateOverride
        return patch
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Merge chip filter state into a FinancialQuery IR — variant-agnostic via constructor.from()
// TaggedSum _from destructures only known fields, so extra patch keys are silently ignored
// @sig applyChipFilters :: (FinancialQuery, Object?, LookupTable) -> FinancialQuery
const applyChipFilters = (ir, chipState, accts) => {
    if (!chipState) return ir
    const patch = F.buildChipPatch(ir, chipState, accts)
    if (Object.keys(patch).length === 0) return ir
    const constructor = Object.getPrototypeOf(ir).constructor
    return constructor.from({ ...ir, ...patch })
}

export { applyChipFilters }
