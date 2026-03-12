// ABOUTME: Pure transformers that convert editableFilters (IRDateRange, account names) to chip state
// ABOUTME: Maps IR types to chip keys/dateRanges for seeding filter chips when opening report views

import { compactMap } from '@graffio/functional'
import { DateRangeUtils } from '../utils/date-range-utils.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Maps Year(year) to lastYear key when year is previous year, otherwise customDates with literal range
    // @sig toYearChipState :: IRDateRange.Year -> { dateRangeKey: String, dateRange: { start: Date, end: Date } }
    toYearChipState: ({ year }) => {
        const currentYear = new Date().getFullYear()
        const key = year === currentYear - 1 ? 'lastYear' : 'customDates'
        return {
            dateRangeKey: key,
            dateRange: DateRangeUtils.calculateDateRange(key) || {
                start: new Date(year, 0, 1),
                end: new Date(year, 11, 31),
            },
        }
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
const RELATIVE_DATE_KEYS = { 'days-7': 'lastSevenDays', 'days-30': 'lastThirtyDays', 'months-12': 'lastTwelveMonths' }

// Resolves account names to IDs, warns on unresolved names
// @sig toAccountIds :: (LookupTable, [String]) -> [String]
const toAccountIds = (accountsLT, names) => {
    const byName = new Map(Array.from(accountsLT).map(a => [a.name, a.id]))
    const ids = compactMap(name => byName.get(name), names)
    if (ids.length < names.length)
        console.warn(
            'editableFilters: unresolved account names:',
            names.filter(n => !byName.has(n)),
        )
    return ids
}

// Converts IRDateRange to chip state format { dateRangeKey, dateRange }
// @sig toDateRangeChipState :: IRDateRange -> { dateRangeKey: String, dateRange: { start: Date, end: Date } }
const toDateRangeChipState = irDateRange =>
    irDateRange.match({
        AllDates: () => ({ dateRangeKey: 'all' }),
        Relative: ({ unit, count }) => {
            const key = RELATIVE_DATE_KEYS[`${unit}-${count}`]
            if (!key) throw new Error(`No chip mapping for Relative(${unit}, ${count})`)
            return { dateRangeKey: key, dateRange: DateRangeUtils.calculateDateRange(key) }
        },
        Year: T.toYearChipState,
        Quarter: () => {
            throw new Error('IRDateRange.Quarter not yet supported in editableFilters')
        },
        Month: () => {
            throw new Error('IRDateRange.Month not yet supported in editableFilters')
        },
        Range: () => {
            throw new Error('IRDateRange.Range not yet supported in editableFilters')
        },
    })

// Converts editableFilters to SetTransactionFilter changes, resolving account names to IDs
// @sig toChipChanges :: (EditableFilters, LookupTable) -> Object
const toChipChanges = (editableFilters, accountsLT) => {
    const { categories, accounts, dateRange, groupBy, asOfDate } = editableFilters
    const changes = {}
    if (categories !== undefined) changes.selectedCategories = categories
    if (accounts !== undefined) changes.selectedAccounts = toAccountIds(accountsLT, accounts)
    if (dateRange) Object.assign(changes, toDateRangeChipState(dateRange))
    if (groupBy) changes.groupBy = groupBy
    if (asOfDate !== undefined) changes.asOfDate = asOfDate // '' is valid — chip defaults to today
    return changes
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const EditableFiltersToChipState = { toAccountIds, toChipChanges, toDateRangeChipState }

export { EditableFiltersToChipState }
