/*
 * applyFilter - Interpreter for FilterSpec tagged type
 *
 * Pattern matches on FilterSpec variants to apply filtering logic to data arrays.
 * Pure function: data in, filtered data out.
 *
 * @sig applyFilter :: ([a], FilterSpec) -> [a]
 */

import { FilterSpec } from './types/index.js'

/*
 * Check if a string field contains the query (case-insensitive)
 * @sig fieldContains :: (Object, String, String) -> Boolean
 */
const fieldContains = (item, field, query) => {
    const value = item[field]
    if (value == null) return false
    return String(value).toLowerCase().includes(query.toLowerCase())
}

/*
 * Check if any of the specified fields contain the query
 * @sig anyFieldContains :: (Object, [String], String) -> Boolean
 */
const anyFieldContains = (item, fields, query) => fields.some(field => fieldContains(item, field, query))

/*
 * Parse a date value from item[field], handling string dates
 * @sig getDateValue :: (Object, String) -> Date
 */
const getDateValue = (item, field) => {
    const value = item[field]
    if (value instanceof Date) return value
    if (typeof value === 'string') return new Date(value)
    return new Date(value)
}

/*
 * Check if a date field is within the range (inclusive)
 * @sig dateInRange :: (Object, String, Date, Date) -> Boolean
 */
const dateInRange = (item, field, start, end) => {
    const date = getDateValue(item, field)
    return date >= start && date <= end
}

/*
 * Check if a field value is in the categories list
 * @sig categoryMatches :: (Object, String, [String]) -> Boolean
 */
const categoryMatches = (item, field, categories) => {
    const value = item[field]
    return categories.includes(value)
}

/*
 * Apply a FilterSpec to a data array
 * @sig applyFilter :: ([a], FilterSpec) -> [a]
 */
const applyFilter = (data, spec) => {
    // Handle empty query for TextMatch - return all data
    if (FilterSpec.TextMatch.is(spec) && spec.query === '') return data

    return spec.match({
        TextMatch: ({ fields, query }) => data.filter(item => anyFieldContains(item, fields, query)),

        DateRange: ({ field, start, end }) => data.filter(item => dateInRange(item, field, start, end)),

        CategoryMatch: ({ field, categories }) => data.filter(item => categoryMatches(item, field, categories)),

        Compound: ({ filters, mode }) => {
            if (mode === 'all')
                // AND: each filter reduces the dataset further
                return filters.reduce((filtered, filter) => applyFilter(filtered, filter), data)
            else
                // OR: item passes if it matches any filter
                return data.filter(item => filters.some(filter => applyFilter([item], filter).length > 0))
        },
    })
}

export { applyFilter }
