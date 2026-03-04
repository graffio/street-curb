// ABOUTME: TaggedSum type for date range specifications in query source clauses
// ABOUTME: Six variants covering absolute, relative, and named date ranges

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const DateRange = {
    name: 'DateRange',
    kind: 'taggedSum',
    variants: {
        Year:     { year: 'Number' },
        Quarter:  { quarter: 'Number', year: 'Number' },
        Month:    { month: 'Number', year: 'Number' },
        Relative: { unit: /^(months|days|weeks|years)$/, count: 'Number' },
        Range:    { start: 'String', end: 'String' },
        Named:    { name: /^(last_quarter|last_month|last_year|this_quarter|this_month|this_year|year_to_date)$/ },
    },
}
