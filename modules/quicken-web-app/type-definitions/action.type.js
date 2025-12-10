/** @module Action */

/**
 * Action represents Redux actions for the quicken-web-app
 * @sig Action ::
 *      SetTransactionFilter
 *      ResetTransactionFilters
 */

// prettier-ignore
export const Action = {
    name: 'Action',
    kind: 'taggedSum',
    variants: {
        LoadFile: {
            accounts    : '{Account:id}',
            categories  : '{Category:id}',
            securities  : '{Security:id}',
            tags        : '{Tag:id}',
            splits      : '{Split:id}',
            transactions: '{Transaction:id}',
        },
        SetTransactionFilter   : { payload: 'Object' },
        ResetTransactionFilters: {},
    }
}
