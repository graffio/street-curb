// ABOUTME: Tagged type declaring which filter dimensions are user-adjustable on a report
// ABOUTME: All fields optional — presence of a key means that chip appears, value is the default selection

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const EditableFilters = {
    name: 'EditableFilters',
    kind: 'tagged',
    fields: {
        categories:        '[String]?',
        accounts:          '[String]?',
        dateRange:         'IRDateRange?',
        groupBy:           'String?',
        securities:        '[String]?',
        investmentActions: '[String]?',
        asOfDate:          'String?',
    },
}
