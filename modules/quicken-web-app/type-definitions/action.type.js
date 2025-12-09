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
        LoadFile               : { transactions: '{Transaction:id}' },
        SetTransactionFilter   : { payload: 'Object' },
        ResetTransactionFilters: {},
    }
}
