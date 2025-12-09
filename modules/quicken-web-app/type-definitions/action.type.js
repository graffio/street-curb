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
        SetTransactionFilter  : { payload: 'Object' },
        ResetTransactionFilters: { },
    }
}
