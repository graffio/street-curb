// ABOUTME: Redux action creators
// ABOUTME: Provides actions for updating application state

/*
 * Set one or more transaction filter values
 *
 * @sig setTransactionFilter :: Object -> Action
 */
const setTransactionFilter = payload => ({ type: 'SET_TRANSACTION_FILTER', payload })

/*
 * Reset all transaction filters to initial values
 *
 * @sig resetTransactionFilters :: () -> Action
 */
const resetTransactionFilters = () => ({ type: 'RESET_TRANSACTION_FILTERS' })

export { setTransactionFilter, resetTransactionFilters }
